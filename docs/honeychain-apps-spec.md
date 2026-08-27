# HoneyChain — Three-Interface Spec
### Beekeeper App · Factory Worker App · Consumer Verification Website

This builds directly on the sensor/blockchain architecture from the earlier plan. You need **three distinct front-ends**, each tied to a different role and a different set of blockchain permissions.

---

## Role & Permission Summary

| Interface | User | Blockchain identity | Can trigger |
|---|---|---|---|
| Beekeeper App | Beekeeper | Beekeeper wallet/cert | Mint batch (harvest), view hive data, register hives |
| Factory Worker App | Packager/Processor | Processor wallet/cert | Quality Test, Packaging, Ownership Transfer |
| Consumer Website | Public/customer | None (read-only) or optional anonymous session | Verification scan, Appearance Report, Review |

Enforce this at the **smart contract level**, not just the UI — each identity should be registered on-chain with a role (Beekeeper / Processor / Distributor / Retailer / Admin), and functions like `mintBatch()` should check `msg.sender`'s role before executing.

---

## 1. Beekeeper App/Dashboard

**Platform:** Mobile-first (they're often in the field), but a responsive web dashboard works too — a PWA gives you both with one codebase.

### Core screens
- **Login** — tied to their blockchain identity (wallet address or a managed-custody account if you don't want to burden beekeepers with crypto wallet management — see note below).
- **Hive Map/List** — all their registered hives, live status badges (🟢 healthy / 🟡 watch / 🔴 alert), pulled from the main node's aggregated feed.
- **Hive Detail** — charts for temp, humidity, weight, and acoustic trend over the last day/week/month; battery status of the sensor node.
- **Alerts** — push notifications for: sudden weight drop (possible theft or excessive foraging loss), abnormal brood temp, low sensor battery, swarming signal detected.
- **Register New Hive** — pairs a new sensor node's `hive_id` to this beekeeper's account and GPS location.
- **Harvest Event** — the key action: beekeeper marks "Harvest complete" for a hive/date range → this is what triggers the **Mint** transaction (batch asset creation) on-chain, pulling in the sensor data hash for that period automatically.
- **My Batches** — history of everything they've minted, current status (with processor, sold, etc.).

**Note on wallet complexity:** most beekeepers won't want to manage private keys. Common pattern: you run a **custodial signing service** — the beekeeper logs in with normal email/password or phone number, and your backend signs transactions on their behalf using a key tied to their verified identity. This is what most consumer-facing blockchain apps do (Coinbase-style custody) rather than exposing raw wallets.

---

## 2. Factory Worker (Processor) App

**Platform:** Tablet or handheld scanner device on the packaging line works well — simple, fast, form-based, built for repetitive use.

### Core workflow
1. **Scan incoming batch** — worker scans the batch QR/ID as raw honey arrives from a beekeeper.
2. **Attach lab results** — form to enter (or upload a PDF/photo of) the lab report: moisture %, HMF, diastase activity, sugar profile, pollen analysis. This triggers the **Quality Test Recorded** transaction.
   - If results fail your quality thresholds, the app should block progression and flag the batch instead of letting it proceed to packaging.
3. **Packaging step** — worker specifies number of jars produced from this batch → app auto-generates jar-serial IDs (e.g., `BATCH-014-JAR-0001` ... `-0347`) and triggers **Packaging** transactions linking each jar-serial to the parent batch.
4. **Print QR labels** — app sends the jar-serial list to a connected label printer, each QR encoding the verification URL.
5. **Ownership Transfer** — when the pallet leaves for a distributor, worker scans the shipment and confirms transfer; triggers **Ownership Transfer** transaction to the distributor's on-chain identity.
6. **Transaction confirmation** — after each submission, show the on-chain tx hash/status so the worker has a visible confirmation (and so you have an audit trail of who submitted what, when).

### Design principle
Factory workers shouldn't need to understand blockchain at all — the UI should feel like a normal warehouse scanning app (think: a barcode-scanner workflow). All the chain-specific mechanics (signing, hashing, gas/fees if applicable) happen behind the scenes via your backend.

---

## 3. Consumer Verification Website

**Platform:** Plain responsive website (no app install — this matters a lot for adoption; a scanned QR should never force a download).

### Core flow
1. **Scan → Landing page** (`honeychain.app/verify/{jar_id}`)
2. **Origin section** — beekeeper name, apiary, hive location on a map, harvest date.
3. **Quality section** — lab test results in plain language (not just raw numbers): e.g., "Moisture: 17.2% ✅ within standard", "No adulteration markers detected ✅", with a badge/certificate look.
4. **Journey timeline** — harvest → quality test → packaging → distributor → retailer → this jar, each with timestamp/location, pulled from the on-chain transaction history.
5. **Report Appearance** — a consumer-facing feedback form:
   - Photo upload of the honey (color, crystallization, texture)
   - Simple structured fields: color (light/medium/dark), texture (liquid/crystallized/whipped), any off-smell or off-taste flag
   - Free-text notes
   - This creates an off-chain report linked to the jar-serial (and optionally an on-chain "Flag" event if the consumer marks it as suspected counterfeit/spoiled) — useful both as a trust signal for other customers and as real quality-monitoring data feeding back to you and the beekeeper.
6. **Lab Testing tab** — full detail view of the actual lab report tied to that batch (PDF or structured data), so customers who want the receipts can see them, not just a summary badge.
7. **Review/Rating** — optional star rating + comment, tied to the batch, shown aggregated on future scans of the same batch (social proof).
8. **Verification counter** (subtle, optional) — "This code has been verified N times" — and flag internally (not necessarily shown to consumer) if scans are geographically implausible in a short time window, as an anti-counterfeit signal.

---

## Suggested Tech Stack (concrete starting point)

| Component | Suggestion |
|---|---|
| Beekeeper + Factory apps | React Native or Flutter (one codebase, both mobile) OR a PWA in React if you want pure web-based, no app-store friction |
| Consumer website | Plain React/Next.js site, server-rendered for fast QR-scan loading |
| Backend API | Node.js/Express or Python/FastAPI, sits between all three front-ends and the blockchain + off-chain DB |
| Off-chain DB | PostgreSQL (structured) + object storage (S3-compatible) for lab PDFs/photos |
| Blockchain | Hyperledger Fabric (permissioned, matches your beekeeper-only-mint model) or a private/testnet EVM chain if you want faster prototyping with more tooling/community support |
| Custodial signing | A small signing microservice holding keys server-side, mapped to verified user accounts |

---

## Build Order Recommendation

1. **Consumer website first** (read-only, static data) — cheapest to build, and it's your "demo" piece for stakeholders/investors even before hardware is fully wired up.
2. **Factory worker app** — since it's the transaction-writing bottleneck (mint, quality test, packaging all flow through here or the beekeeper app).
3. **Beekeeper app** — once sensor data pipeline (from your master node) is stable and feeding the backend.
4. **Appearance-report + review features** — layer in once the core verify flow works end-to-end.

---

*Continues from `honeychain-system-plan.md` — same batch/transaction model, same role-based permission design.*
