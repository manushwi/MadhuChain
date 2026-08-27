# HoneyChain — Full System Plan
### From Hive Sensors → Main Node → Blockchain → Customer QR Scan

---

## 1. Architecture Overview (High Level)

```
[Hive 1 Sensors] --\
[Hive 2 Sensors] ---\
[Hive 3 Sensors] ----> [Main Node / Gateway] --> [Edge Validation] --> [Blockchain Network]
[Hive N Sensors] --/         (Master)                                        |
                                                                               v
                                                                    [Off-chain DB / IPFS]
                                                                               |
                                                                               v
                                                                 [QR Code generated per batch]
                                                                               |
                                                                               v
                                                          [Customer scans QR] --> [App/Web viewer]
```

Your master-slave idea is the right pattern for this — it's essentially a **star topology sensor network** where each hive is a "slave" node reporting to one "master" gateway. Below is how to build out each layer.

---

## 2. Layer 1 — Hive Sensor Nodes (Slaves)

Each hive gets a low-power sensor node. What to sense, and why it matters for quality/traceability:

| Sensor | What it measures | Why it matters |
|---|---|---|
| DHT22 / SHT31 | Internal hive temperature & humidity | Bees keep brood at ~35°C; deviations signal stress, disease, or poor ventilation — affects honey moisture content |
| Load cell (HX711) | Hive weight | Tracks nectar flow, harvest readiness, colony health, theft/tampering detection |
| MEMS microphone / vibration sensor | Bee acoustic activity | Detects swarming, queenlessness, or colony collapse early |
| GPS (or fixed config if static) | Hive location | Ties honey to geographic origin (terroir claims, GI/PDO compliance) |
| Ambient temp/humidity (outside) | Weather context | Correlates with nectar flow and moisture uptake risk |
| Optional: gas sensor (VOC) | Early disease/pest detection (e.g., foulbrood) | Quality/safety flag before harvest |

**Slave node hardware:** ESP32 or ESP8266 (cheap, WiFi/BLE built in) or an Arduino + LoRa module (RFM95) if hives are spread over a large apiary with no WiFi coverage.

**Slave → Master communication protocol choice:**
- **Short range, hives close together, power available:** ESP-NOW (very low latency, no router needed) or WiFi + MQTT publish.
- **Long range, rural apiary, battery-powered:** LoRa (RFM9x) — each hive sends small payloads (few bytes) every 5–15 min, main node acts as LoRa gateway.
- **Mesh option:** Zigbee if you have many hives close together and want self-healing mesh instead of pure star topology.

Each slave message should be a compact packet, e.g.:
```json
{
  "hive_id": "H-014",
  "ts": 1735300000,
  "temp_in": 34.8,
  "hum_in": 58,
  "weight_kg": 42.3,
  "temp_out": 27.1,
  "battery_v": 3.7
}
```

---

## 3. Layer 2 — Main Node (Master Gateway)

This is the aggregator you described. Responsibilities:

1. **Receive** packets from all hive slaves (LoRa gateway / MQTT broker / ESP-NOW receiver).
2. **Buffer & timestamp** — store locally (SQLite or a simple file buffer) in case of network loss.
3. **Validate** — sanity-check ranges (e.g., reject temp readings outside -10°C to 60°C, reject impossible weight jumps) to catch faulty sensors before they poison your data.
4. **Aggregate** — roll raw readings into periodic summaries (e.g., hourly averages) rather than pushing every single reading to the blockchain — critical because blockchain writes are expensive/slow.
5. **Forward** — send aggregated + validated data onward to your backend (cloud server or edge compute like Raspberry Pi running your own service).

**Hardware suggestion:** Raspberry Pi (Pi 4/5) or an ESP32 with SIM/4G module if there's no WiFi at the apiary site. It should run:
- A LoRa/MQTT listener service
- A local time-series buffer (SQLite, or InfluxDB if you want proper time-series queries)
- A forwarding service (MQTT bridge to cloud, or REST API push)

---

## 4. Layer 3 — Off-chain Backend + Blockchain Bridge (Oracle)

**Key design decision:** you don't put raw sensor data directly on-chain (too expensive, too much noise). Instead:

1. **Off-chain database** (PostgreSQL/InfluxDB) stores the full sensor history — this is your queryable "truth" for dashboards/analytics.
2. **Periodic hashing** — every batch cycle (e.g., per harvest), compute a hash (SHA-256) of the aggregated sensor dataset for that hive/period and anchor *only the hash* on-chain. This gives you tamper-evidence without bloating the chain.
3. **Smart contract / chaincode** stores:
   - Batch ID
   - Hive ID(s) that contributed
   - Harvest date
   - Data hash (pointer to off-chain record)
   - Quality test results (see Section 6)
   - Ownership chain (who currently holds this batch)

This mirrors what real honey-traceability projects (e.g., the EU TECHONEY project) do: Hyperledger Fabric as a **permissioned chain**, since you likely want only verified participants (you, your co-op, distributors, retailers) able to write — not an open public chain. Fabric is a reasonable choice; a lighter alternative if you want something simpler to prototype is a private Ethereum/Polygon testnet with a basic smart contract, or even Hyperledger Fabric's simpler cousin, if you want fast dev iteration.

---

## 5. Layer 4 — Batch → QR Code Generation

Once a harvest batch is finalized (jars filled from a specific hive/harvest run):

1. **Mint an on-chain asset** representing that batch (this is your "genesis" transaction — only you, the beekeeper, should have permission to create this asset, exactly like the pattern TECHONEY used).
2. Asset record includes: batch ID, hive(s) of origin, harvest date, quality test results, sensor data hash, quantity (number of jars/kg).
3. **Generate a unique QR code per jar or per batch**, encoding a URL like:
   `https://honeychain.app/verify/{batch_id}` or `{batch_id}-{jar_serial}` if you want per-jar granularity (better for anti-counterfeiting — a duplicated QR on two jars becomes detectable).
4. Print QR on label. Optionally combine with a tamper-evident sticker (QR breaks/voids if seal is removed) for extra anti-fraud protection.

---

## 6. Layer 5 — Customer QR Scan Flow

**What happens when a customer scans:**

1. Phone camera reads URL → opens a web page (no app install needed — better adoption) or your PWA.
2. Backend looks up `batch_id` → queries blockchain for the asset's current state + full ownership/transaction history.
3. Page displays (this is your "trust layer" UI):
   - Beekeeper name/apiary + hive location (map pin)
   - Harvest date
   - Quality test results (moisture %, purity, lab certification badge)
   - Supply chain journey (harvest → packaging → distributor → retailer → this jar), each step with timestamp
   - Optional: hive environmental snapshot ("This honey came from a hive kept at healthy brood temperature throughout the season")
4. Each scan can optionally be **logged as a transaction** (see below) — e.g., "verification event" — which is useful data for you (where/when products are being verified, potential counterfeit detection if the same jar-serial gets scanned in two very distant locations close in time).

---

## 7. Transaction Types to Model in Your Smart Contract

| Transaction | Who can trigger it | What it does |
|---|---|---|
| **Harvest / Mint** | Beekeeper only | Creates the batch asset; root of provenance |
| **Quality Test Recorded** | Lab / certifier (or beekeeper with lab report attached) | Attaches lab results to the batch (moisture, HMF, purity, pollen analysis) |
| **Packaging** | Beekeeper/packager | Splits a batch into individual jar-serials, links each to parent batch |
| **Ownership Transfer** | Current holder | Moves custody: beekeeper → distributor → retailer → (optionally) consumer |
| **Quality Recheck / Storage Log** | Distributor/retailer | Optional: logs storage temperature/humidity during transit (cold-chain-style tracking, useful since heat degrades honey enzymes) |
| **Verification Scan** | Consumer (read-only, but can be logged as an event) | Records that the QR was scanned — timestamp + rough location, for analytics/anti-counterfeit |
| **Consumer Purchase / Final Sale** | Retailer or e-commerce platform | Marks the batch/jar as sold, closes the traceability loop |
| **Review Submission** | Consumer | Optional — attaches a rating/review, tied to the batch, feeding into your marketing ("consumer trust") layer |
| **Dispute/Flag** | Any verified stakeholder | Flags a batch as suspected fraud/counterfeit — freezes further transfers pending investigation |

Only the **Mint** should be restricted to beekeepers — this is the critical anti-fraud design principle: nobody downstream should be able to fabricate origin, only pass along custody.

---

## 8. What to Track for Honey Quality

Split into three tiers:

### A. Pre-harvest (from your IoT sensors)
- Hive temperature/humidity trend during nectar flow
- Colony health signals (acoustic/vibration anomalies)
- Weather/ambient conditions during flow season
- Hive location (floral source region — affects honey type: wildflower, acacia, chestnut, etc.)

### B. Lab-tested at harvest (this is what actually defines "honey quality" commercially — your sensors give *context*, but these are the real quality/fraud indicators)
- **Moisture content** (%) — too high risks fermentation; most standards cap around 20%
- **HMF (Hydroxymethylfurfural)** — indicator of overheating/aging/adulteration; low HMF = fresh, unadulterated
- **Diastase activity (enzyme level)** — indicates freshness/authenticity, degrades with heat processing
- **Sugar profile (fructose/glucose ratio, sucrose %)** — detects syrup adulteration (a huge fraud issue in the honey industry — this is literally the top concern the TECHONEY project's own stakeholder surveys flagged)
- **Pollen analysis (melissopalynology)** — confirms floral origin and geographic authenticity
- **C4 sugar test (isotope ratio)** — detects cane/corn syrup adulteration specifically
- **Electrical conductivity** — helps classify honey type (blossom vs. honeydew)
- **pH / acidity**

### C. Post-harvest / supply chain conditions
- Storage temperature history (heat exposure degrades enzymes/HMF rises)
- Time from harvest to packaging
- Time from packaging to sale (shelf-life tracking)

**Practical recommendation:** you likely can't run a full lab panel for every jar — so define a **per-batch sampling protocol** (e.g., one lab test per harvest batch, results applied to all jars from that batch), which is standard practice and keeps costs manageable while still giving each jar's QR code a real quality record to point to.

---

## 9. Suggested Build Order (MVP → Full System)

1. **Phase 1:** Get 2–3 hive slave nodes reporting to one master node reliably (temp/humidity/weight only). Store locally.
2. **Phase 2:** Stand up the off-chain backend (simple REST API + database) that the master node pushes to.
3. **Phase 3:** Deploy a minimal smart contract (even on a testnet) with just Mint + Transfer + QualityTest transactions.
4. **Phase 4:** Build the QR generation + public verification web page.
5. **Phase 5:** Add lab quality-test integration, then layer in review/purchase transactions and analytics.
6. **Phase 6:** Harden security (see below) once the core loop works end-to-end.

---

## 10. Security Notes Worth Building In Early

- **Sensor spoofing:** sign each slave node's packets with a lightweight key/HMAC so the master node can reject forged readings.
- **Duplicate QR detection:** track scan geolocation + timestamp; flag if the same jar-serial is scanned in two implausibly distant places within a short window.
- **Permissioned writes:** enforce role-based access in your smart contract (only registered beekeeper wallet/identity can Mint) rather than relying on UI-level restrictions alone.
- **Off-chain data integrity:** since only hashes go on-chain, make sure your off-chain DB is itself backed up/replicated — if it's lost, the on-chain hash becomes unverifiable.

---

*This plan draws on both standard IoT/agri-traceability design patterns and the real-world architecture choices made by the EU-funded TECHONEY honey-blockchain project (Hyperledger Fabric, beekeeper-only asset minting, off-chain + on-chain split).*
