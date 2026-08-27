# HoneyChain — Component PRDs
### Beekeeper App · Factory Worker App · Consumer Website · Backend API · Chain (Hyperledger Fabric)

Each section below is a focused PRD for that component. The master PRD (`honeychain-prd.md`) covers the whole-project view — these go one level deeper per piece, so each can be handed to a developer (or a Claude Code session) with everything it needs without re-reading the entire project history.

---

## PRD 1 — Beekeeper App

**Purpose:** Let beekeepers monitor hive health remotely and trigger a Harvest/Mint event when honey is collected.

**Primary user:** Beekeeper (owns 1–100+ hives, wants visibility without visiting daily)

**Key features:**
- Login (custodial — no wallet management)
- Hive list/map with live status badges (healthy/watch/alert)
- Hive detail: temp/humidity/weight/acoustic charts over time
- Push alerts: weight drop, abnormal brood temp, low battery, swarming signal
- Register new hive (pairs sensor node ID to account + GPS)
- Record Harvest → triggers `POST /api/batches/mint`
- "My Batches" — status of everything minted, through to sale

**Success criteria:** beekeeper can see hive status within 15 min of a real sensor reading; alert delivered within 1 min of threshold breach; harvest-to-mint flow completes in under 2 minutes of user interaction.

**Out of scope (v1):** native mobile builds (PWA only), multi-user accounts per apiary (single owner login only).

---

## PRD 2 — Factory Worker App

**Purpose:** Give factory staff a fast, workflow-driven way to record every processing step, enforced in the correct order, with automatic fraud-detection flags.

**Primary user:** Factory/processing worker, lab technician, QC manager (shared app, role-gated features)

**Key features:**
- Scan/enter batch ID
- Record Received checkpoint (incoming weight, transporter)
- Record Intake/Output/Final QC quality test (moisture, HMF, diastase, sugar profile, isotope ratio)
- Record Processing Action (heating/filtering/blending) — blending requires declaring parent lot IDs + quantities
- Record Packaging (jar count → auto-generated jar-serials, label print trigger)
- Record Ownership Transfer
- Flagged-batch banner — blocks progression until a QC Manager clears it
- Record Intake for raw material lots from multiple suppliers (Platform Beekeeper or External Supplier)

**Success criteria:** a worker with no blockchain knowledge can complete a full Received→Released workflow without external help; mass-balance/compositional checks run automatically with zero manual calculation; a flagged batch cannot be packaged or released through the UI.

**Out of scope (v1):** automated equipment sensor integration (temp/weight auto-logged from machinery) — manual entry acceptable for v1, sensor auto-logging is a stretch goal.

---

## PRD 3 — Consumer Website

**Purpose:** Let a customer scan a QR code and immediately see verifiable proof of origin and purity — this is the trust product, not just an info page.

**Primary user:** End consumer, no account required

**Key features:**
- `/verify/[jarId]` — origin (apiary + map), harvest date, quality test results in plain language with pass/fail badges, full journey timeline, integrity check summary (mass balance verified, compositional check passed)
- Multi-origin breakdown for blended batches ("58% Apiary A, 27% Apiary B, 15% Partner Supplier") + Verified Origin %
- Report Appearance (photo + color/texture fields + notes)
- Review/rating submission
- Fast load (<3s on mobile 4G), no login, no app download

**Success criteria:** page loads and displays full verification data within 3 seconds; a non-technical consumer can understand the purity claim without needing to interpret raw lab numbers; appearance reports are visibly tied to the specific jar scanned.

**Out of scope (v1):** e-commerce/checkout, native app, multi-language.

---

## PRD 4 — Backend API

**Purpose:** The single bridge between all three frontends, the off-chain database, and the Fabric chain — every business rule (role checks, fraud-detection math) lives here, not in the frontends.

**Primary consumers:** the three frontend apps, the IoT gateway node (sensor ingestion only)

**Key responsibilities:**
- Auth/session management, custodial signing (maps user accounts to Fabric identities)
- REST endpoints for hives, batches, quality tests, processing actions, packaging, transfers, verification, appearance reports, reviews (full list in `honeychain-build-guide.md` Section 5)
- Runs mass-balance and compositional-drift checks at the moment an Output Test is submitted, before writing the flag to chain
- Sensor ingestion endpoint (`POST /api/sensor-data`) for gateway nodes, device-key authenticated
- Off-chain storage: sensor time-series (TimescaleDB), users, appearance reports, review, lab file metadata (PostgreSQL)
- Caching layer (Redis) for high-traffic reads, especially `GET /api/verify/:jarId`
- Wraps all Fabric Gateway SDK calls — frontends never talk to Fabric directly

**Success criteria:** every write endpoint enforces role checks server-side (not just UI-level); `/api/verify/:jarId` p95 latency under 300ms with caching; sensor ingestion endpoint handles bursty traffic from multiple regional gateways without data loss.

**Out of scope (v1):** GraphQL (REST only), payments processing.

---

## PRD 5 — Chain (Hyperledger Fabric)

**Purpose:** The tamper-evident ledger enforcing the batch lifecycle state machine and role permissions — this is what makes the fraud-detection claims actually verifiable rather than just "trust our database."

**Primary consumer:** the Backend API only (never called directly by any frontend)

**Key responsibilities (chaincode functions):**
- `MintBatch` — Beekeeper role only
- `RecordIntake` — logs a raw material lot (Platform or External supplier)
- `RecordReceived`, `RecordQualityTest` (with automatic Intake-vs-Output comparison and auto-flagging), `RecordProcessingAction` (rejects undeclared blending), `RecordPackaging` (rejects if jar weights don't reconcile), `BlendBatch` (many-to-one, weighted composition record), `TransferOwnership`, `ClearFlag` (QC Manager role only)
- `GetBatch` / `GetJar` — read queries returning full on-chain history
- Enforces the state machine order (Received → Intake Test → Processing → Output Test → Packaging → Final QC → Released) — invalid transitions rejected at the chaincode level, not just the app UI

**Network design:** single org for pilot (1 channel: `honeychain-channel`), designed to extend to multi-org/multi-channel later if separate business units need data isolation.

**Success criteria:** an invalid state transition (e.g. Packaging before Output Test) is rejected by the chaincode itself, even if a bug in the backend or frontend allowed the request through; a diluted/adulterated batch triggers an auto-flag with zero manual math required; role permissions are enforced by chaincode logic reading the caller's Fabric identity attributes, not by anything the backend "promises" to check.

**Out of scope (v1):** public/permissionless chain support, cross-organization channels (single-org pilot first).
