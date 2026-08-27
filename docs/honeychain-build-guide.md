# HoneyChain — Build Guide + Claude Code Prompts
### Two-machine setup: Chain + Backend on PC B, Apps on PC A

---

## 1. Machine Split Overview

Since you're building apps on one PC and everything else (backend + Hyperledger Fabric chain) on another:

```
PC A ("App PC")                         PC B ("Chain PC")
------------------                      --------------------------
Beekeeper App (frontend)                Hyperledger Fabric network
Factory Worker App (frontend)           (peers, orderer, CA, ledger)
Consumer Website (frontend)                        |
        |                                           v
        |----------- HTTPS REST API -----> Backend API server
                                            (Node.js/Express)
                                                     |
                                                     v
                                            PostgreSQL (off-chain data)
                                            + File storage (lab PDFs, photos)
```

**Critical rule:** the apps on PC A never talk to Fabric directly. They only call your Backend API (on PC B) over plain REST/HTTPS. The Backend API is the only thing that holds the Fabric SDK connection and signs/submits chaincode transactions. This keeps your apps simple and keeps blockchain complexity in one place.

---

## 2. What to Install on PC B (Chain + Backend machine)

| Tool | Purpose | Notes |
|---|---|---|
| **Docker + Docker Compose** | Runs Fabric's peers, orderer, CA as containers | Hyperledger Fabric requires Docker — this is non-negotiable |
| **Node.js LTS (v18 or v20)** | Backend server + chaincode (if writing chaincode in JS/TS) | Use nvm to manage versions cleanly |
| **Git** | Pulling fabric-samples, version control | |
| **Hyperledger Fabric binaries & fabric-samples** | The actual network scaffolding, sample chaincode, CLI tools | Installed via Fabric's official bootstrap script |
| **Go** (optional) | Only needed if you write chaincode in Go instead of JS/TS | JS/TS chaincode is fine and simpler if your team is JS-heavy |
| **PostgreSQL** | Off-chain database (sensor history, user accounts, files metadata) | Can run natively or via Docker |
| **jq, curl** | Testing/debugging Fabric CLI output and REST calls | Small utilities, handy for debugging |

**Install steps (Linux/macOS; WSL2 recommended if PC B is Windows):**
```bash
# 1. Docker + Docker Compose — install via Docker Desktop or apt/brew
# 2. Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# 3. Fabric samples, binaries, and docker images
mkdir -p ~/fabric && cd ~/fabric
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh docker samples binary

# 4. PostgreSQL
# Ubuntu: sudo apt install postgresql
# macOS: brew install postgresql
```

---

## 3. What to Install on PC A (Apps machine)

| Tool | Purpose |
|---|---|
| **Node.js LTS (v18/20)** | Runs React/Next.js dev server for all three frontends |
| **npm or yarn** | Package management |
| **Git** | Version control, pulling the repo |
| **Expo CLI** (only if going native mobile for beekeeper/factory apps) | Otherwise a responsive PWA in plain React avoids needing this entirely |
| **VS Code** (or your editor of choice) | Dev environment where you'll also run Claude Code |

No Docker, no Fabric tooling, no PostgreSQL needed on PC A — it's a pure frontend machine that only needs to reach PC B's API over the network.

---

## 4. Connecting PC A to PC B

1. On PC B, find its local network IP: `ip addr` (Linux) or `ipconfig` (Windows) — e.g. `192.168.1.42`.
2. Make sure the Backend API on PC B listens on `0.0.0.0:4000` (not just `localhost`), so it's reachable from PC A on the same network.
3. Enable CORS on the backend for PC A's dev origin (e.g. `http://192.168.1.55:3000`).
4. On PC A, set an environment variable in each app's `.env`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://192.168.1.42:4000
   ```
5. If the two PCs aren't on the same LAN (e.g. working remotely), use a tunnel like **ngrok** or **Cloudflare Tunnel** on PC B to expose the backend with a public HTTPS URL, and point PC A's `.env` at that instead. This is also a good stepping stone toward eventually deploying the backend to a real cloud server.

---

## 5. API Flow — Apps ↔ Backend ↔ Fabric

The Backend API is the single bridge. Every endpoint follows the same pattern: **validate → write off-chain data if needed → call chaincode via Fabric Gateway SDK → return result (including tx ID) to the app.**

### Core endpoints to build

| Endpoint | Called by | What it does |
|---|---|---|
| `POST /api/auth/login` | All apps | Custodial login — returns a session token mapped to the user's on-chain identity/role |
| `POST /api/hives` | Beekeeper app | Register a new hive |
| `POST /api/sensor-data` | Master gateway node (not an app — your Pi/ESP32 posts here directly) | Ingests sensor readings into PostgreSQL |
| `GET /api/hives/:id/readings` | Beekeeper app | Fetch historical sensor data for charts |
| `POST /api/batches/mint` | Beekeeper app | Triggers **Mint** chaincode transaction (harvest event) |
| `POST /api/batches/:id/received` | Factory app | Logs Received checkpoint |
| `POST /api/batches/:id/quality-test` | Factory app | Submits Intake/Output/Final QC test → triggers chaincode; backend also runs the mass-balance/compositional drift check here |
| `POST /api/batches/:id/processing-action` | Factory app | Logs heating/filtering/blending step |
| `POST /api/batches/:id/packaging` | Factory app | Generates jar-serials, triggers Packaging chaincode transaction |
| `POST /api/batches/:id/transfer` | Factory app / distributor | Ownership transfer |
| `GET /api/verify/:jarId` | Consumer website | Reads full batch history + quality results from chain + off-chain DB, returns combined view |
| `POST /api/verify/:jarId/appearance-report` | Consumer website | Stores appearance report (off-chain, optionally triggers a Flag chaincode event) |
| `POST /api/verify/:jarId/review` | Consumer website | Stores review/rating |

### How the backend talks to Fabric

Use the **Fabric Gateway SDK** (`@hyperledger/fabric-gateway` for Node.js — the modern, recommended client as of Fabric 2.x+). Pattern:

```js
// simplified shape — Claude Code will flesh this out
const gateway = connect({ client, identity, signer });
const network = gateway.getNetwork('honeychain-channel');
const contract = network.getContract('honeychain-cc');

// submit a transaction (writes to ledger)
await contract.submitTransaction('MintBatch', batchId, hiveId, harvestDate, dataHash);

// evaluate a query (reads from ledger, no consensus needed)
const result = await contract.evaluateTransaction('GetBatch', batchId);
```

The backend holds one Fabric identity per role type (or per real user, if you want per-user attribution on-chain) issued by the Fabric CA, and signs transactions server-side — this is exactly the "custodial signing" approach from the earlier plan.

---

## 6. Suggested Repo Structure

```
honeychain/
  chain/
    network/              # Fabric network config (channel, org, crypto material)
    chaincode/
      honeychain-cc/       # chaincode source — TypeScript recommended
  backend/
    src/
      routes/
      services/
        fabricService.js   # wraps Fabric Gateway SDK calls
      db/                  # PostgreSQL models/migrations
    .env
  apps/
    beekeeper-app/
    factory-app/
    consumer-web/
  docs/
    honeychain-prd.md
    honeychain-system-plan.md
    honeychain-apps-spec.md
    honeychain-processing-chain.md
```

Keep `chain/` and `backend/` on PC B, and `apps/` on PC A (either as separate git clones of the same repo, or a proper monorepo synced via Git so both machines just pull the parts they need).

---

## 7. Claude Code Prompt — For PC B (Chain + Backend)

Paste this into Claude Code on PC B:

```
I'm building "HoneyChain" — an IoT + blockchain honey traceability and anti-adulteration
platform. On this machine I need you to build the blockchain layer and the backend API.
I'll paste the full PRD content below for context — use it as the source of truth for
data model, roles, and business logic.

STACK:
- Hyperledger Fabric (test network, 1 org to start) run via Docker for the blockchain
- Chaincode written in TypeScript using fabric-contract-api
- Backend API in Node.js + Express + TypeScript
- Fabric Gateway SDK (@hyperledger/fabric-gateway) to connect backend to chaincode
- PostgreSQL for off-chain data (sensor readings, user accounts, files metadata),
  accessed via Prisma ORM
- REST API, JSON, with CORS enabled for a frontend running on a different machine on
  the same network

WHAT TO BUILD, IN ORDER:

1. Set up a local Hyperledger Fabric test network (1 org, 1 channel called
   "honeychain-channel") using fabric-samples' test-network as the base, scripted so
   I can bring it up/down with simple commands.

2. Write chaincode (TypeScript) implementing this batch state machine:
   Received -> IntakeTest -> ProcessingLog(one or more) -> OutputTest -> Packaging ->
   FinalQC -> Released
   With these chaincode functions:
   - MintBatch(batchId, hiveId, harvestDate, dataHash) — role: Beekeeper only
   - RecordReceived(batchId, transporterId, weightIn)
   - RecordQualityTest(batchId, stage, moisture, hmf, diastase, sugarProfile, isotopeRatio)
     — on "OutputTest" stage, automatically compare against the IntakeTest values already
     on the ledger for this batch and set status to "FLAGGED" if any parameter exceeds
     configurable tolerance (define reasonable default tolerances)
   - RecordProcessingAction(batchId, actionType, parameters, operatorId, equipmentId,
     weightBefore, weightAfter) — reject if actionType is "Blending" without a list of
     declared parent batch IDs and quantities
   - RecordPackaging(batchId, jarCount) — auto-generates jar-serial IDs, rejects if sum
     of jar weights would not reconcile with recorded output weight within 2% tolerance
   - TransferOwnership(batchOrJarId, toIdentity)
   - ClearFlag(batchId, resolution) — role: QCManager only
   - GetBatch(batchId) / GetJar(jarId) — read queries returning full history
   Enforce role checks using Fabric client identity attributes (Beekeeper, Transporter,
   LabTech, FactoryWorker, QCManager, Distributor, Admin).

3. Build the Express backend with routes matching this API spec (implement all of them):
   [paste the endpoint table from Section 5 of this document here]
   Each write endpoint should: validate input + caller role, do any off-chain DB writes,
   call the matching chaincode function via the Fabric Gateway SDK, and return the
   transaction result to the caller. Each read endpoint should combine on-chain data
   (via evaluateTransaction) with off-chain data (Postgres) into one response — e.g.
   GET /api/verify/:jarId should return the full origin + quality + journey + integrity
   check status in one response the consumer website can render directly.

4. Set up PostgreSQL with Prisma, with models for: Hive, SensorReading, User (with role),
   AppearanceReport, Review, and any file-metadata table for lab PDFs/photos.

5. Add a POST /api/sensor-data endpoint that a Raspberry Pi/ESP32 gateway node can push
   readings to directly (no auth beyond a shared device API key), storing into
   SensorReading.

6. Write a README documenting: how to bring up the Fabric network, how to deploy/upgrade
   the chaincode, how to run the backend, and example curl commands for every endpoint.

7. Make sure the backend listens on 0.0.0.0 (not just localhost) and has CORS configured
   via an ALLOWED_ORIGIN env var, since the frontend apps will run on a different machine
   on the same network.

Build this incrementally — get the Fabric network + a minimal chaincode with just
MintBatch/GetBatch working end-to-end first, confirm it with a test script, then add
the rest of the state machine, then the backend routes on top.

[PASTE FULL PRD CONTENT HERE]
```

---

## 8. Claude Code Prompt — For PC A (Apps)

Paste this into Claude Code on PC A:

```
I'm building the frontend apps for "HoneyChain" — an IoT + blockchain honey
traceability platform. The blockchain and backend API are running on a separate
machine on my network; I'll give you the API base URL and endpoint list below.
Do NOT try to install Docker, Hyperledger Fabric, or PostgreSQL here — this machine
only builds the three frontend apps, which talk to the backend over REST.

STACK:
- React + Next.js for all three apps (start as responsive PWAs — no native mobile
  build needed for v1)
- Tailwind CSS for styling
- A shared `lib/api.ts` client per app that calls the backend using
  process.env.NEXT_PUBLIC_API_BASE_URL as the base URL
- Simple session-token auth (stored in an httpOnly cookie or localStorage for now),
  matching the backend's POST /api/auth/login flow

BUILD THREE SEPARATE APPS in an `apps/` folder:

1. **beekeeper-app** — dashboard for beekeepers:
   - Login
   - Hive list/map with live status badges
   - Hive detail page with charts (temp/humidity/weight over time) — use Recharts
   - Alerts view
   - "Register New Hive" form
   - "Record Harvest" action (calls POST /api/batches/mint)
   - "My Batches" list showing status of everything they've minted

2. **factory-app** — built mobile-first (works well on a tablet), workflow-driven:
   - Login
   - "Scan/Enter Batch ID" to pull up a batch
   - Record Received checkpoint
   - Record Intake/Output/Final QC quality test (form matching the lab panel fields)
   - Record Processing Action (heating/filtering/blending, with the blending flow
     requiring parent batch selection)
   - Record Packaging (enter jar count, show generated jar-serials, provide a
     "print labels" placeholder action)
   - Record Ownership Transfer
   - Show a flagged-batch banner clearly if the backend returns a FLAGGED status,
     and block progression past that point in the UI until cleared

3. **consumer-web** — public verification site, no login required:
   - Route: /verify/[jarId] — calls GET /api/verify/:jarId
   - Displays: beekeeper/apiary info + map, harvest date, quality test results in
     plain language with pass/fail badges, full journey timeline, integrity check
     summary (mass balance verified / compositional check passed)
   - "Report Appearance" form: photo upload, color/texture select fields, notes —
     posts to /api/verify/:jarId/appearance-report
   - Review/rating form — posts to /api/verify/:jarId/review
   - Fast load, mobile-first, since this is what people see immediately after
     scanning a QR code on a jar

Backend API base URL: http://<PC_B_LOCAL_IP>:4000
Full endpoint list:
[paste the endpoint table from Section 5 of this document here]

Build beekeeper-app first end-to-end against the live backend, then factory-app,
then consumer-web. Use mock data behind a feature flag if the backend isn't
reachable yet, so I can develop UI independently when the two machines aren't
both running.
```

---

## 9. Order of Operations (Practical)

1. On PC B: bring up Fabric test network, deploy a minimal chaincode (just MintBatch/GetBatch), confirm with CLI.
2. On PC B: build backend skeleton, connect to Fabric, confirm one endpoint works via curl/Postman.
3. Find PC B's IP, confirm PC A can reach it (`curl http://<PC_B_IP>:4000/health` from PC A).
4. On PC A: scaffold beekeeper-app, wire login + one working screen against the real backend.
5. Iterate outward — add the rest of the chaincode functions, backend routes, and app screens together, one workflow at a time (e.g. finish the full Harvest→Mint flow end-to-end before starting Processing).
