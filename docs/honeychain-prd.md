# Product Requirements Document (PRD)
# HoneyChain — IoT + Blockchain Honey Traceability & Purity Verification Platform

**Version:** 1.0
**Status:** Draft
**Owner:** [Your name]
**Last updated:** [date]

---

## 1. Executive Summary

HoneyChain is an IoT + blockchain platform that lets beekeepers monitor hive health remotely, gives factory operators an auditable way to record every processing step honey goes through, and gives consumers a way to scan a QR code and verify that the honey they're buying is pure, unadulterated, and traceable back to a specific hive.

The platform has two primary purposes:
1. **Operational** — help beekeepers monitor and manage hive health via real-time sensor data.
2. **Trust/Verification** — give consumers cryptographically-backed proof of purity and origin, and give the supply chain a way to detect adulteration (dilution, syrup blending, unauthorized processing) as it happens, not after the fact.

---

## 2. Problem Statement

- Beekeepers lack affordable, real-time visibility into hive health (temperature, humidity, weight, colony activity), leading to late detection of swarming, disease, or theft.
- Honey is one of the most commonly adulterated food products globally (syrup dilution, mislabeled origin, ultra-filtering to hide fraud). Consumers have no reliable way to verify purity at point of purchase.
- Existing "traceability" labels are often just marketing — a QR code that links to a static webpage, not to verifiable, tamper-evident data.
- There is currently no system that connects **hive-level sensor data**, **factory processing records**, and **consumer-facing verification** into one continuous, auditable chain.

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Beekeepers can monitor hives remotely | % of registered hives reporting live data; alert response time |
| Reduce hive loss from undetected issues | Reduction in reported colony loss/theft incidents among users |
| Consumers can verify purity | % of purchased jars scanned; consumer trust survey score |
| Detect adulteration in-process | # of batches auto-flagged by mass-balance/compositional checks vs. # confirmed fraudulent on investigation (precision of the flagging system) |
| Adoption | # of active beekeepers, # of factory partners, # of consumer scans/month |

---

## 4. Target Users / Personas

| Persona | Needs |
|---|---|
| **Beekeeper (Amara, small-scale apiary owner)** | Wants to know hive health without visiting daily; wants proof of authentic origin to sell at premium price |
| **Factory/Processing Worker (Raj, packaging line operator)** | Needs a fast, simple way to log processing steps without needing blockchain knowledge |
| **QC Manager (Elena)** | Needs to review flagged batches and make accept/reject decisions with full data visibility |
| **Consumer (Sam, health-conscious buyer)** | Wants a fast, no-download way to confirm honey is real and see where it came from |
| **Distributor/Retailer** | Needs simple custody transfer logging, minimal friction |

---

## 5. Scope

### In Scope (v1)
- Hive sensor network (temp, humidity, weight, acoustic) reporting to a master gateway node
- Off-chain backend + blockchain (permissioned) storing batch/transaction records
- Beekeeper mobile/web app
- Factory worker app (intake, processing log, output test, packaging, release)
- Mass-balance and compositional drift fraud-detection logic
- Consumer verification website (QR scan → origin, quality, journey, appearance report, reviews)
- Role-based permissions and custodial transaction signing

### Out of Scope (v1)
- Public/permissionless blockchain support
- Full in-house lab equipment integration (v1 assumes manual/PDF lab result entry, with inline sensor integration as a stretch goal)
- Payments/e-commerce checkout (future phase)
- Multi-language localization (future phase)
- Native iOS/Android apps (v1 targets PWA/responsive web for speed of delivery)

---

## 6. Functional Requirements

### 6.1 Hive Sensor Network
- FR1: Each hive slave node shall report temperature, humidity, weight, and battery level at a configurable interval (default 15 min).
- FR2: Master node shall validate incoming readings against configured sane ranges and discard/flag out-of-range data.
- FR3: Master node shall buffer data locally and retry transmission on connectivity loss.
- FR4: System shall alert the beekeeper when weight drops beyond a configurable threshold within a short window (theft/collapse signal).

### 6.2 Blockchain / Batch Lifecycle
- FR5: Only accounts with the "Beekeeper" role may mint a new batch (harvest event).
- FR6: A batch shall only progress through the defined state machine (Received → Intake Test → Processing Log → Output Test → Packaging → Final QC → Released) in order; skipping a state shall be rejected.
- FR7: System shall compute mass-balance checks automatically at Output Test submission and auto-flag violations beyond configured tolerance.
- FR8: System shall compute compositional drift (moisture, HMF, sugar profile, isotope ratio) between Intake and Output tests and auto-flag violations.
- FR9: A flagged batch shall be blocked from Packaging/Release until a "QC Manager" role clears or rejects it.
- FR10: Blending transactions shall require declaring all parent batch IDs and quantities; undeclared additions are not a permitted transaction type.

### 6.3 Beekeeper App
- FR11: Beekeeper can view live and historical sensor data per hive.
- FR12: Beekeeper can register new hives and receive/acknowledge alerts.
- FR13: Beekeeper can trigger a Harvest/Mint event tied to a hive and date range.

### 6.4 Factory Worker App
- FR14: Worker can scan an incoming batch and log the Received checkpoint.
- FR15: Worker/Lab tech can submit Intake Test and Output Test results (manual entry or file upload).
- FR16: Worker can log Processing actions (heating, filtering, blending) with parameters and operator ID.
- FR17: Worker can generate jar-serials and print QR labels at Packaging.
- FR18: Worker can submit Ownership Transfer to a distributor.

### 6.5 Consumer Website
- FR19: Scanning a jar QR shall load a page showing origin, quality results, and full journey timeline within 3 seconds on average mobile connection.
- FR20: Consumer can submit an Appearance Report (photo + structured fields + notes).
- FR21: Consumer can submit a review/rating tied to the batch.
- FR22: Page shall display integrity check results (mass-balance verified, compositional check passed) in plain language.

---

## 7. Non-Functional Requirements

- **NFR1 — Performance:** Consumer verification page loads in <3s on 4G.
- **NFR2 — Availability:** Backend/API uptime target 99.5%.
- **NFR3 — Data integrity:** All on-chain records immutable; off-chain data backed up with redundancy, since on-chain hashes are unverifiable if off-chain data is lost.
- **NFR4 — Security:** Role-based access enforced at smart-contract level, not just UI. Sensor packets signed/authenticated to prevent spoofing.
- **NFR5 — Usability:** Factory worker and beekeeper apps require no blockchain/crypto knowledge from end users (custodial signing).
- **NFR6 — Scalability:** Sensor network architecture supports scaling from pilot (5–10 hives) to hundreds of hives without redesign (LoRa/mesh option).
- **NFR7 — Auditability:** Every state transition and role action is timestamped and attributable to a specific identity.

---

## 8. System Architecture (Summary)

```
Hive Sensors (slaves) → Master Gateway Node → Off-chain Backend/DB
                                                     |
                                                     v
                                          Blockchain (permissioned)
                                          [Batch state machine +
                                           fraud-detection logic]
                                                     |
                     ---------------------------------------------------------
                     |                    |                                  |
              Beekeeper App        Factory Worker App              Consumer Website
```

*(Full sensor/architecture detail: see `honeychain-system-plan.md`. Full app specs: see `honeychain-apps-spec.md`. Full anti-adulteration processing chain: see `honeychain-processing-chain.md`.)*

---

## 9. Data Model (Core Entities)

- **Hive** — hive_id, beekeeper_id, location, registered_date
- **SensorReading** — hive_id, timestamp, temp, humidity, weight, battery
- **Batch** — batch_id, hive_id(s), harvest_date, state, sensor_data_hash
- **QualityTest** — batch_id, stage (intake/output/final), moisture, HMF, diastase, sugar_profile, isotope_ratio, timestamp, tester_id
- **ProcessingAction** — batch_id, action_type, parameters, operator_id, equipment_id, timestamp, weight_before, weight_after
- **JarSerial** — jar_id, parent_batch_id, packaging_date
- **OwnershipTransfer** — batch_id/jar_id, from_id, to_id, timestamp
- **AppearanceReport** — jar_id, photo_url, color, texture, notes, timestamp
- **Review** — batch_id, rating, comment, timestamp

---

## 10. Roles & Permissions (Reference)

| Role | Key Permissions |
|---|---|
| Beekeeper | Mint batch, manage hives |
| Transport/Logistics | Log Received checkpoint |
| Lab Technician | Submit Intake/Output/Final QC test results |
| Factory Worker | Log Processing actions, Packaging |
| QC Manager | Clear/reject flagged batches, approve Release |
| Distributor/Retailer | Ownership Transfer |
| Consumer | Verification scan, Appearance Report, Review |
| Admin | Manage roles/identities |

---

## 11. Milestones / Phased Delivery

| Phase | Deliverable |
|---|---|
| **Phase 0 — Design** | Finalize architecture, smart contract spec, data model (this PRD + supporting docs) |
| **Phase 1 — Sensor Pilot** | 2–3 hive slave nodes reporting reliably to master node; local storage working |
| **Phase 2 — Backend + Chain MVP** | Off-chain DB live; smart contract with Mint/Transfer/QualityTest deployed on testnet |
| **Phase 3 — Consumer Website MVP** | Static-data-driven QR verification page (can demo before hardware is fully live) |
| **Phase 4 — Factory Worker App** | Intake/Processing Log/Output Test/Packaging flows, with mass-balance + compositional flagging live |
| **Phase 5 — Beekeeper App** | Full dashboard, alerts, harvest/mint trigger |
| **Phase 6 — Fraud Detection Hardening + Appearance Reports** | Full flagging workflow, QC review UI, consumer appearance reports and reviews |
| **Phase 7 — Pilot with real beekeepers/factory** | End-to-end test with a small real supply chain before wider rollout |

---

## 12. Risks & Open Questions

- **Risk:** Lab testing costs may limit per-batch testing frequency — need to define sampling protocol (per-batch vs. per-lot).
- **Risk:** Sensor hardware reliability in field conditions (weather, battery life, connectivity) — needs pilot validation before scaling.
- **Risk:** Beekeeper/factory worker adoption if UX isn't dead simple — mitigate via custodial signing and minimal blockchain exposure.
- **Open question:** Blockchain platform choice — Hyperledger Fabric (permissioned, matches role model well) vs. private EVM chain (faster tooling/dev iteration). Needs a technical spike before Phase 2.
- **Open question:** Who bears the cost of intake/output lab testing — factory, beekeeper, or shared? Affects the business model, not just the tech.
- **Open question:** Legal/regulatory requirements for honey traceability in your target market(s) — may add mandatory fields to the data model.

---

## 13. Appendix — Supporting Documents

- `honeychain-system-plan.md` — sensor network, master-slave gateway design, blockchain bridge, QR generation
- `honeychain-apps-spec.md` — detailed UI/UX spec for the three interfaces
- `honeychain-processing-chain.md` — anti-adulteration processing checkpoints, mass-balance and compositional drift logic
