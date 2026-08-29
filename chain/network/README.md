# HoneyChain — Hyperledger Fabric Network (2 orgs, local)

Brings up a permissioned Hyperledger Fabric network for development and pilot:
**2 orgs (`Org1` + `Org2`), 1 peer each, 1 orderer (Raft)**, channel
`honeychain-channel`, smart contract `honeychain-cc` (Go).

The backend (`services/backend`) connects to this network via the
`@hyperledger/fabric-gateway` SDK. **The backend is the only component that ever
talks to Fabric** — all apps talk to the backend over REST.

## Prerequisites
- Docker + Docker Compose running (WSL2 backend on Windows).
- Go toolchain (1.22+) for the Go chaincode.

## Setup (one-time)

```bash
# 1. Downloads fabric binaries, docker images, fabric-samples/test-network
./bootstrap.sh

# 2. Bring up the network with a CA and CouchDB state DB
./up.sh up -ca
```

## Deploy the chaincode

```bash
./deployChaincode.sh
```

This creates `honeychain-channel` with `Org1` and packages / approves / commits
the Go chaincode `honeychain-cc` (`chain/chaincode/honeychain-cc`).

### Redeploy after chaincode changes

Both orgs must approve and the definition must be committed at the next sequence.
From `fabric-samples/test-network`, with `git-bash`/MSYS on Windows:

```bash
cd fabric-samples/test-network

# Windows/git-bash specifics (all four matter):
export MSYS_NO_PATHCONV=1
export PATH="$PWD/../bin:/c/Program Files/Go/bin:$PATH"      # peer CLI + jq + go (packager runs `go list`)
export FABRIC_CFG_PATH='D:/Honeychain/chain/network/fabric-samples/config'   # core.yaml dir, Windows form
export TEST_NETWORK_HOME="$(cygpath -w "$PWD")"              # Windows-form so envVar.sh paths are absolute
rm -f honeychain-cc.tar.gz                                   # never reuse a stale package

./scripts/deployCC.sh honeychain-channel honeychain-cc \
  'D:/Honeychain/chain/chaincode/honeychain-cc' go 1.4 5
#                                                      ^^^^^ chaincode version, then sequence (increment both)
```

Gotchas that break a silent (`MSYS_NO_PATHCONV=1`, backslash src path, missing
FABRIC_CFG_PATH, stale tar) or a visible but wrong deploy (commits a vN label over
an old package when packaging failed - always check `docker ps | grep cc_1.x` for
a fresh container).

## Verify end-to-end (live network required)

Start the backend (`services/backend`: `bun run dev`), then run the REST smoke
test that pushes a full lifecycle into the ledger (including a fraud-flag/clear
and a mass-balanced blend):

```bash
# from this directory (chain/network)
PATH="$(pwd)/fabric-samples/bin:$PATH" \
  bash ../../services/backend/scripts/e2e-chain.sh
```

## Enroll role identities

The chaincode authorizes transactions by the caller's Fabric identity `role`
attribute. The backend signs transaction custodially under these identities.

```bash
./enrollIdentities.sh
```

This registers + enrolls an identity per role (Beekeeper, Transporter, LabTech,
FactoryWorker, QCManager, Distributor, Admin) into `./identities/<role>/` with a
`role=<role>` attribute baked into the X.509 cert. The backend reads these to sign.

## Tear down

```bash
./up.sh down
```

## Chaincode functions

| Function | Role | Purpose |
|---|---|---|
| `MintBatch` | Beekeeper | Harvest → batch genesis + barcode payload |
| `RecordIntake` | Transporter/FactoryWorker | GRN for incoming raw material |
| `RecordReceived` | Transporter | Log arrival + incoming weight |
| `RecordQualityTest` | LabTech | Intake/Output/Final test; Output auto-runs fraud checks |
| `RecordProcessingAction` | FactoryWorker | Heating/filtering/blending step |
| `RecordPackaging` | FactoryWorker | Jar count → jar-serial generation + weight reconciliation |
| `BlendBatch` | FactoryWorker | Many-to-one blend with mass-balance |
| `TransferOwnership` | Current holder | Custody transfer |
| `ClearFlag` | QCManager | Clear/reject a flagged batch |
| `GetBatch` / `GetJar` | Any | Read queries |

See `docs/` (PRD, system-plan, processing-chain) for the full business rules. The
chaincode's `normalizeBatch` (called from `putBatch` + `getBatch` since v1.4)
keeps all returned/stored batch JSON schema-valid for the contract API — always
bump and redeploy when adding slice/map struct fields.
