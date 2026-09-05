# HoneyChain — Easy Step-by-Step Setup Guide

This guide takes a brand-new person from **zero** to a fully working HoneyChain app —
database, blockchain, backend, and all 4 apps — one step at a time. Follow the steps
**in order**. It was written and verified on **Windows using Git Bash** (macOS/Linux
work the same way — just skip the Windows notes).

> **What is HoneyChain?** A honey supply-chain app that stores important events (harvests,
> batches, jars, quality checks) on a real blockchain (Hyperledger Fabric). Everything runs
> on your own computer as "boxes" (Docker containers). This guide turns your computer into
> the whole factory.

---

## Step 1 — What you need

Install these first (free, all official installers). Click or copy the commands into a
terminal.

| # | Tool | Why you need it | How to install (Windows) |
|---|------|-----------------|--------------------------|
| 1 | **Docker Desktop** | runs the database, cache, and the whole blockchain | https://www.docker.com/products/docker-desktop/ — install, then in **Settings → Resources** give it **at least 8 GB RAM**, and make sure it's **running** (whale icon) |
| 2 | **Git for Windows** | to download the project code; gives you the **Git Bash** terminal | https://git-scm.com/downloads — default options are fine |
| 3 | **Node.js** (≥ 22) | needed by the web & mobile apps | https://nodejs.org — install the LTS |
| 4 | **Bun** (≥ 1.4) | fast package manager used by this project | https://bun.sh — in Git Bash: `curl -fsSL https://bun.sh/install \| bash` (follow what it prints, then open a **new** Git Bash) |
| 5 | **Go** (≥ 1.23) | builds the blockchain "smart contract" | https://go.dev/dl — install the installer |

**Check everything is installed.** Open **Git Bash** (Start menu → "Git Bash") and run:

```bash
docker -v && node -v && bun -v && go version
```

You should see four version lines (no errors). If a command says "not found", install that
tool (Step 1) and reopen Git Bash.

**One important rule for this project:** always use **Git Bash** (not PowerShell / cmd) —
the blockchain scripts are bash scripts.

---

## Step 2 — Get the code (clone the repo)

In Git Bash:

```bash
git clone <your-repo-url> Honeychain
cd Honeychain
pwd
```

`pwd` should print a path ending in `Honeychain`. Everything below assumes you are in this
folder (`D:/.../Honeychain`).

Look at what you just got:

```
apps/consumer-web        →  public QR "verify my jar" website
apps/kvic-dashboard      →  admin dashboard
apps/beekeeper-app       →  beekeeper's phone app (Expo)
apps/factory-app         →  factory worker's phone app (Expo)
services/backend         →  the main API (all the logic lives here)
chain/                   →  the blockchain (Fabric) scripts + smart contract
docker/infra             →  database + cache definitions
SETUP.md                 →  THIS file
```

---

## Step 3 — Start the database & cache (Docker boxes)

The app needs a database (Postgres) and a fast cache (Redis). They're tiny boxes defined in
`docker/infra`. From the `Honeychain` folder run:

```bash
docker compose -f docker/infra/docker-compose.yml up -d
```

**Check it worked** — you should see two boxes running:

```bash
docker ps --format '{{.Names}}'
# honeychain-postgres
# honeychain-redis
```

> Want to stop them later? `docker compose -f docker/infra/docker-compose.yml down`
> (`-v` would also wipe the database — be careful).

---

## Step 4 — Start the blockchain (Fabric) — one-time setup

Now the special part: the real blockchain. It needs a small download on **each new machine**
once (the network itself isn't stored in the repo — it's too big / machine-specific).

```bash
cd chain/network
```

### 4a. Download the blockchain network (first time only)

```bash
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples
git checkout 05edea0
./scripts/bootstrap.sh            # downloads blockchain binaries + images (takes a while)
docker pull hyperledger/fabric-couchdb:latest
cd ..
```

### 4b. Prepare the smart contract

The contract is Go code. It ships without its downloaded dependencies, so let them in:

```bash
go -C ../chaincode/honeychain-cc mod vendor
```

### 4c. Start the network + deploy the contract + get identities

```bash
./up.sh up                 # starts 3 organizations (KVIC, Factory, Lab) + orderer
./deployChaincode.sh       # creates the channel, installs + commits the smart contract
./enrollIdentities.sh      # creates the identity "wallets" the backend will use
```

**Check it worked** — you should see about **16 containers** now (peers, orderer, CAs,
databases, the smart contract boxes, plus the 2 from Step 3):

```bash
docker ps --format '{{.Names}}' | wc -l     # ≈ 16
```

⚠️ **Big warning:** `./up.sh down` **erases the blockchain's ledger**. Never run it casually.
If the machine reboots and the smart-contract boxes disappeared, just re-run
`./deployChaincode.sh` — it remembers how far it got and finishes the rest.

Return to the project root:

```bash
cd ../..
```

---

## Step 5 — Start the backend API (the brain)

The backend (`services/backend`) is the server everything talks to. It reads/writes the
database (Step 3) and the blockchain (Step 4).

```bash
cd services/backend
bun install                 # downloads the backend's dependencies
bunx prisma generate        # creates the database helper code
cp .env.example .env        # make your own private settings file
```

### 5a. Fill in 4 values in the new `.env`

Open `.env` in any editor (e.g. `notepad .env`) and **set these 4 lines** — use any random
text for the secrets:

```
DATABASE_URL=postgresql://honeychain:honeychain@localhost:5432/honeychain
JWT_SECRET=typeanyrandomlongtexthere123
DEVICE_API_KEY=anyrandomsecretkey123
VERIFY_PUBLIC_BASE_URL=http://localhost:3000
```

> **Why `VERIFY_PUBLIC_BASE_URL`?** That's the address printed on the jar QR stickers
> (the consumer website). The default is a wrong port (`3001`) — setting it to `3000` here
> means scanning a sticker opens the right page.

### 5b. Create the database tables + add the starter data

```bash
bun run db:deploy                                       # applies all database "recipes"
ADMIN_SEED_PASSWORD=honeychain123 bun run db:seed       # creates 3 organizations + an admin
```

### 5c. Run it

```bash
bun run dev
```

Leave this terminal open. **Check it worked** — open a second Git Bash and run:

```bash
curl -s http://localhost:4000/health
# {"status":"ok","service":"honeychain-backend"}
```

---

## Step 6 — Start the 4 apps

Each app is its own little server. Open **one new Git Bash terminal per app** (4 in total)
and run the matching commands. Keep all 4 terminals open.

| App | What it is | Command (from project root) | Open in browser |
|-----|-----------|-----------------------------|-----------------|
| **consumer-web** | the public jar-verification website (what QR stickers open) | `cd apps/consumer-web && bun install && bun run dev` | http://localhost:3000 |
| **kvic-dashboard** | the admin / organization dashboard | `cd apps/kvic-dashboard && bun install && bun run dev -- -p 3002` | http://localhost:3002 |
| **beekeeper-app** | the beekeeper's phone app | `cd apps/beekeeper-app && bun install && npx expo start` | press `w` for web, or scan the QR with the **Expo Go** phone app |
| **factory-app** | the factory worker's phone app | `cd apps/factory-app && bun install && npx expo start --port 8082` | press `w` for web, or scan the QR with **Expo Go** |

Notes for first-timers:
- "bun install" only needs to run the **first time** each app is opened; after that use just
  `bun run dev` / `npx expo start`.
- The Expo apps (`beekeeper` / `factory`) are phone apps. In dev mode they auto-detect your
  computer's address and talk to the backend on port 4000 — they work straight away.
  First `w` (web) run may auto-install `react-native-web` — press it twice if asked.

---

## Step 7 — Check the whole thing works

1. **Admin dashboard** → http://localhost:3002
   Login: `admin@honeychain.local` / `honeychain123`
   (Set in Step 5b — created only the first time. On later runs, if your admin exists, this
   login still works; the seed only creates things that don't exist yet.)
2. **Beekeeper app** → open http://localhost:8081 (or your phone)
   - Sign up / log in as a beekeeper, then create a hive.
3. **Add live sensor data** so charts/alerts fill up. In the backend's terminal (Ctrl+C the
   `bun run dev`… no — open a **third** Git Bash) run:
   ```bash
   cd services/backend
   bun run sim:sensors
   ```
   It "pretends" a sensor is attached to each hive, backfills about 2 hours, and streams
   new readings every 4 seconds. Add drama with `SENSOR_DEMO_EVENTS=1 bun run sim:sensors`.
4. **Mint a honey batch** (from the beekeeper app): pick a hive, harvest window = last ~2
   hours (so the pretend sensor data fits inside), submit. You'll get `BATCH-XXX` /
   `HC-LOT-XXX` — committed on the blockchain with `validation_code: 0`.
5. **Scan a jar QR** — open `http://localhost:3000/v/<jarId>` (or scan the QR image) → the
   consumer site shows the jar's full on-blockchain history.

**You're done — the whole HoneyChain is running on your computer.** 🎉

---

## Step 8 — Start it again the next day (restart)

Good news: **nothing is lost** when you close the terminals or shut down the computer.
Your database data, the blockchain ledger, the `.env` settings, and the identity wallets all
stay saved on disk. Only the *running* processes stop. To bring everything back, re-open the
terminals and start the same boxes — in this order:

### 8a. Start Docker Desktop
If it's not running yet, start it from the Start menu and wait until the whale icon is steady.

### 8b. Database & cache (2 boxes)
```bash
docker compose -f docker/infra/docker-compose.yml up -d
```

### 8c. Blockchain boxes (~14) + the smart contract
```bash
cd chain/network
./up.sh up                 # starts the peers, orderer, CAs, and databases again
./deployChaincode.sh       # restarts the smart-contract boxes (they're temporary)
```

Why `deployChaincode.sh` again? The smart-contract boxes don't survive a Docker restart —
this command detects that and starts them. It's also your one and only repair tool if the
ledger was ever wiped (`./up.sh down`): it rebuilds the channel and re-commits the contract.
Identity wallets (`Step 4c`) are still on disk — do **not** re-run `enrollIdentities.sh`.

**Check:** `docker ps --format '{{.Names}}' | wc -l` should be ≈ 16 again.

```bash
cd ../..
```

### 8d. Backend API
```bash
cd services/backend
bun run dev                # same as before; no migrate/seed needed — already done
```
Check in a second terminal: `curl -s http://localhost:4000/health` → ok.

### 8e. The 4 apps (one terminal each — same commands as Step 6, but **skip** `bun install`)

| App | Command (from project root) | Open in browser |
|-----|-----------------------------|-----------------|
| consumer-web | `cd apps/consumer-web && bun run dev` | http://localhost:3000 |
| kvic-dashboard | `cd apps/kvic-dashboard && bun run dev -- -p 3002` | http://localhost:3002 |
| beekeeper-app | `cd apps/beekeeper-app && npx expo start` | press `w`, or scan QR with **Expo Go** |
| factory-app | `cd apps/factory-app && npx expo start --port 8082` | press `w`, or scan QR with **Expo Go** |

### 8f. All-in-one restart block (copy-paste, from the project root)

```bash
docker compose -f docker/infra/docker-compose.yml up -d
cd chain/network && ./up.sh up && ./deployChaincode.sh && cd ../..

cd services/backend && bun run dev &
cd apps/consumer-web   && bun run dev &
cd apps/kvic-dashboard && bun run dev -- -p 3002 &
cd apps/beekeeper-app  && npx expo start &
cd apps/factory-app    && npx expo start --port 8082 &
```

**Restart rules of thumb**
- Order matters: **database** → **blockchain** → **backend** → **apps**. The backend connects
  to the database and the blockchain, so they must be up first.
- If the backend won't start with `EADDRINUSE ... :4000`, one of yesterday's terminals is
  still running — either use it, or kill it (Step 10) and start fresh.
- Stopping is the opposite of starting, in order: Ctrl+C on the app terminals, then the
  backend, then `cd chain/network && ./up.sh down` (⚠ wipes the ledger — only if you truly
  want a fresh blockchain), then the database. **Or** just close the terminals — the data
  all survives; you only waste RAM while it's running.

---

## Step 9 — Optional: demo tools

From `services/backend`:

```bash
bun run sim:sensors                                          # live sensor stream
SENSOR_DEMO_EVENTS=1 bun run sim:sensors                     # + low-battery & theft events
SENSOR_OVERRIDES='HM-004:temp_in=46;hum_in=12;battery_v=3.0' bun run sim:sensors   # force an alert
bun run db:reset                                             # ERASES all app data (admins too) + re-seeds orgs
```

---

## Step 10 — Problems? Look here first

| What happened | What to do |
|---------------|------------|
| `EADDRINUSE ... :4000` | A backend is already running. Find it: `netstat -ano \| grep LISTENING \| grep ':4000 '`, then `taskkill //PID <number> //F`. Or just use the running one. |
| QR sticker opens port 3001 | You missed the `VERIFY_PUBLIC_BASE_URL=http://localhost:3000` line (Step 5a). Set it, restart the backend. Old stickers still point at the old URL — print/scan the `/qr/<jarId>.png` image fresh. |
| Port 3001 "already in use" | That's another project on your PC — ignore it; HoneyChain uses 3000/3002. |
| Smart-contract boxes missing after restart/reboot | Re-run `./deployChaincode.sh` — it detects and restarts them. |
| Admin "Fabric events" look stale | Enable `FABRIC_EVENT_INDEXER_ENABLED=true` in `.env` and restart the backend after a fresh chain. |
| `jq: command not found` | Git Bash doesn't include `jq`. `choco install jq` / `winget install jq`, or read JSON with `python`. |
| Phone app can't reach the API | Phone and PC must be on the **same Wi-Fi**; the backend listens on all addresses (`HOST=0.0.0.0`) already. |
| Everything slow / Docker crashes | Docker Desktop → Settings → Resources → raise memory to ≥ 8 GB (Step 1). |

---

## Step 11 — Share / deploy it (make it reachable on the internet)

To go from "runs on my PC" to "runs somewhere people can visit", the **only settings that
change** are the "public address" values — everything else (the whole 6-step recipe above)
is just re-run on the new machine:

| Setting | Becomes |
|---------|---------|
| `VERIFY_PUBLIC_BASE_URL` (backend) | the **public URL of consumer-web** (what QR codes point at) |
| `PUBLIC_BASE_URL` / `BARCODE_PUBLIC_BASE_URL` (backend) | the **public URL of the backend** |
| `ALLOWED_ORIGIN` (backend) | the web apps' public address(es) |
| `NEXT_PUBLIC_API_URL` / `BACKEND_URL` / `EXPO_PUBLIC_API_URL` (apps) | the **public backend URL** |
| Firewall | open only **80/443** |

**Recipe for any host:** run this guide's Step 3 → Step 4 → Step 5 → Step 6 on that host,
then overwrite the public values above and set them as the app URLs.

Three ways to do it (cheapest first):

**A. Your PC + Tailscale Funnel — $0, no credit card, quickest**
1. Install Tailscale on this PC, sign in (GitHub/Google — free plan, no card). Keep the PC on.
2. In the Tailscale admin console enable **HTTPS certificates** and add `funnel` to
   "nodeAttrs" for yourself.
3. Expose the three key ports (after this guide's Steps 3–6 are done):
   ```bash
   tailscale funnel 3000
   tailscale funnel --bg 8443 http://localhost:3002
   tailscale funnel --bg 10000 http://localhost:4000
   ```
4. Set the knobs to `https://<your-machine>.<your-tailnet>.ts.net` (with `:8443` / `:10000`
   for dashboard/backend) and rebuild consumer-web with that API URL.
5. Scan a sticker with any phone → opens the public verify page over HTTPS.
   Trade-off: this PC must stay on; Funnel allows only ports 443/8443/10000.

**B. GitHub Codespaces — $0, no card, in the cloud**
Free personal tier: 120 core-hours/mo (≈60 h on 2-core) + 15 GB storage.
1. Push the repo: `gh repo create honeychain --private --source . --push`
2. On GitHub: **Code → Codespaces → Create codespace on main**.
3. Inside it, run Steps 3–6 of this guide, plus two extras:
   ```bash
   echo "127.0.0.1 peer0.org1.example.com peer0.org2.example.com peer0.org3.example.com orderer.example.com" | sudo tee -a /etc/hosts
   gh codespace ports visibility --codespace $CODESPACE_NAME 3000:public 3002:public 4000:public
   gh codespace ports --codespace $CODESPACE_NAME --json number,url   # gives you https://<hash>-<PORT>.app.github.dev
   ```
4. Set the knobs (Step 11 header) to those URLs, restart the backend.
5. **Hygiene:** `gh cs stop` when idle + set an inactivity timeout, so the monthly free
   hours last. Recreating a codespace changes its URLs → reset the knobs.

**C. Oracle Cloud Always Free VM + Caddy — $0/mo but needs a credit card to sign up**
Best "always-on hosting" budget option. As of 2026: Ampere A1, 2 CPU / 12 GB / 200 GB / 10 TB.
1. Sign up (oracle.com/cloud/free), create `VM.Standard.A1.Flex` Ubuntu 24.04, open ports
   **22, 80, 443**, note the public IP.
2. Get the code onto it, install Docker + Node + Bun + Go + Caddy, add the four
   `*.example.com` lines to `/etc/hosts`, run this guide's Steps 3–6.
3. Free "domain": `*.sslip.io` names, e.g. `app.<ip>.sslip.io`, `api.<ip>.sslip.io`,
   `admin.<ip>.sslip.io`. Write a small **Caddyfile** and Caddy auto-gets free HTTPS:
   ```
   app.<ip>.sslip.io   { reverse_proxy 127.0.0.1:3000 }
   api.<ip>.sslip.io   { reverse_proxy 127.0.0.1:4000 }
   admin.<ip>.sslip.io { reverse_proxy 127.0.0.1:3002 }
   ```
4. Set the knobs to those URLs; re-run `./deployChaincode.sh` after any reboot.

> **Not free anywhere:** publishing the two phone apps to the Apple/Google stores
> (Apple $99/yr, Google $25 once). Use Expo Go / web builds on any option above — free.

---

## Step 12 — What's in the repo vs what your machine creates

| Ships with the repo | Your machine builds itself (don't commit/share these) |
|---------------------|-------------------------------------------------------|
| `apps/*` code, `services/backend` code, database "recipes" (`prisma/migrations`) | `node_modules`, `.next` build output |
| `chain/network/*.sh` scripts, the Go smart contract | `.env` files, `chain/network/identities/` wallets |
| `docker/infra/docker-compose.yml` (box definitions) | the `fabric-samples` blockchain download (Step 4a) |
| `docs/`, `SETUP.md` | the database data + blockchain ledger (inside Docker volumes) |
| | generated barcode PDFs (`services/backend/barcodes/`) |

That's why every new machine follows the same Step 3 → 4 → 5 → 6 path — nothing secret or
machine-specific ever lives in the repo.

---

## TL;DR — the whole recipe on one screen

```bash
docker compose -f docker/infra/docker-compose.yml up -d        # 1. database + cache

cd chain/network
git clone https://github.com/hyperledger/fabric-samples.git    # 2. (first time)
cd fabric-samples && git checkout 05edea0 && ./scripts/bootstrap.sh
docker pull hyperledger/fabric-couchdb:latest
cd ..
go -C ../chaincode/honeychain-cc mod vendor
./up.sh up && ./deployChaincode.sh && ./enrollIdentities.sh    # 3. blockchain
cd ../..

cd services/backend && bun install && bunx prisma generate     # 4. backend
cp .env.example .env                                           # fill: DATABASE_URL, JWT_SECRET,
                                                               #       DEVICE_API_KEY, VERIFY_PUBLIC_BASE_URL=...:3000
bun run db:deploy && ADMIN_SEED_PASSWORD=honeychain123 bun run db:seed
bun run dev                                                    # :4000

cd apps/consumer-web   && bun install && bun run dev           # 5. :3000
cd apps/kvic-dashboard && bun install && bun run dev -- -p 3002
cd apps/beekeeper-app  && bun install && npx expo start        # :8081
cd apps/factory-app    && bun install && npx expo start --port 8082
```

**Already setup before? Restarting next day (no clone/install needed):**

```bash
docker compose -f docker/infra/docker-compose.yml up -d
cd chain/network && ./up.sh up && ./deployChaincode.sh && cd ../..
cd services/backend && bun run dev &
cd apps/consumer-web   && bun run dev &
cd apps/kvic-dashboard && bun run dev -- -p 3002 &
cd apps/beekeeper-app  && npx expo start &
cd apps/factory-app    && npx expo start --port 8082 &
```