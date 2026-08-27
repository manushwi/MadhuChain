# HoneyChain — Final Repo/Folder Structure + Scaffold Script

This consolidates everything discussed (multi-source sourcing, TimescaleDB, Redis caching, regional gateways, shared types) into one concrete structure, plus a script that actually creates it.

---

## Final Structure

```
honeychain/
├── apps/                              # PC A
│   ├── beekeeper-app/                 # Next.js
│   ├── factory-app/                   # Next.js, mobile-first
│   └── consumer-web/                  # Next.js, public-facing, CDN-friendly
│
├── services/                          # PC B
│   └── backend-api/
│       ├── src/
│       │   ├── routes/                # hives, batches, verify, sensor-data, auth
│       │   ├── services/
│       │   │   ├── fabricService.ts   # Fabric Gateway SDK wrapper
│       │   │   ├── cacheService.ts    # Redis wrapper for /verify caching
│       │   │   └── qualityCheck.ts    # mass-balance + compositional drift logic
│       │   └── db/                    # Prisma client, migrations
│       ├── prisma/
│       │   └── schema.prisma
│       └── .env
│
├── chain/                             # PC B
│   ├── chaincode/
│   │   └── honeychain-cc/             # TypeScript chaincode (workspace member)
│   └── network/                       # Fabric docker-compose, crypto-config,
│                                       # channel config — not a JS package
│
├── firmware/                          # PC B (or dedicated IoT dev machine)
│   ├── hive-sensor-esp32/             # C/C++, per-hive slave node
│   └── gateway-node/                  # Python/Node, regional master node —
│                                       # supports multi-region deployment
│                                       # (see gateway-node/regions/ config)
│
├── packages/
│   ├── shared-types/                  # Batch, Hive, Lot, Supplier, QualityTest,
│   │                                   # BlendComposition, ProcessingAction,
│   │                                   # JarSerial, API request/response types
│   └── ui/                            # optional shared components across the 3 apps
│
├── docs/
│   ├── honeychain-prd.md
│   ├── honeychain-system-plan.md
│   ├── honeychain-apps-spec.md
│   ├── honeychain-processing-chain.md
│   ├── honeychain-multisource-sourcing.md
│   ├── honeychain-build-guide.md
│   ├── honeychain-scalability.md
│   └── honeychain-repo-structure.md
│
├── infra/                             # NEW — infra-as-code, grows with scalability needs
│   ├── docker-compose.dev.yml         # Postgres+Timescale, Redis, Mosquitto, local dev stack
│   └── mosquitto/                     # MQTT broker config for gateway-node ingestion
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

**What changed from the earlier version:** added `infra/` for the local dev stack (Postgres/TimescaleDB, Redis, MQTT broker) so both machines can spin up the same supporting services consistently, and noted where multi-region gateway config and caching code live.

---

## Scaffold Script

Run this once (on PC B first, since it owns most of the backend/chain folders — then `git clone` the result onto PC A, which will only actually use `apps/` and `packages/`):

```bash
#!/bin/bash
# honeychain-scaffold.sh — creates the full repo skeleton

mkdir -p honeychain && cd honeychain

# apps
mkdir -p apps/beekeeper-app apps/factory-app apps/consumer-web

# backend
mkdir -p services/backend-api/src/routes
mkdir -p services/backend-api/src/services
mkdir -p services/backend-api/src/db
mkdir -p services/backend-api/prisma
touch services/backend-api/.env.example

# chain
mkdir -p chain/chaincode/honeychain-cc
mkdir -p chain/network

# firmware
mkdir -p firmware/hive-sensor-esp32
mkdir -p firmware/gateway-node/regions

# shared packages
mkdir -p packages/shared-types/src
mkdir -p packages/ui/src

# docs
mkdir -p docs

# infra
mkdir -p infra/mosquitto

# root config files
cat > package.json << 'EOF'
{
  "name": "honeychain",
  "private": true,
  "workspaces": [
    "apps/*",
    "services/*",
    "packages/*",
    "chain/chaincode/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
EOF

cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "chain/chaincode/*"
EOF

cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "lint": {}
  }
}
EOF

cat > .gitignore << 'EOF'
node_modules
.env
.env.local
dist
.next
*.log
chain/network/crypto-config
chain/network/channel-artifacts
EOF

echo "HoneyChain repo skeleton created."
```

Save this as `honeychain-scaffold.sh`, run `chmod +x honeychain-scaffold.sh && ./honeychain-scaffold.sh`, then `cd honeychain && git init && git add . && git commit -m "Initial repo skeleton"` and push to GitHub before cloning onto PC A.

---

## What Each Machine Actually Uses

| Folder | PC A (apps) | PC B (chain/backend) |
|---|---|---|
| `apps/` | ✅ works here daily | pulls but doesn't run |
| `services/backend-api/` | pulls but doesn't run | ✅ works here daily |
| `chain/` | pulls but doesn't run | ✅ works here daily |
| `firmware/` | pulls but doesn't run | ✅ works here (or a 3rd IoT dev box) |
| `packages/shared-types/` | ✅ imports from it | ✅ edits it when data model changes |
| `infra/` | not needed | ✅ runs the dev stack (Postgres/Redis/MQTT) |
| `docs/` | reference only | reference only |

PC A can `pnpm install --filter beekeeper-app...` (pnpm's filtered install) to skip installing dependencies for folders it'll never run, keeping its local setup lightweight even though the whole repo is cloned.
