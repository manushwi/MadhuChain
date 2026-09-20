# MadhuChain — Hyperledger Fabric Network (3 orgs, local)

Brings up a permissioned Hyperledger Fabric network for development and pilot:
**3 orgs, 1 peer each, 1 orderer (Raft)**, channel `madhuchannel`, and
smart contract `madhuchain` (Go).

| MSP | MadhuChain organization |
|---|---|
| `Org1MSP` | KVIC |
| `Org2MSP` | Collection / Factory |
| `Org3MSP` | Certified Lab |

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

This creates `madhuchannel`, adds Org3, and deploys the Go chaincode
`madhuchain` from `chain/chaincode/madhuchain-cc`.

### Redeploy after chaincode changes

Both orgs must approve and the definition must be committed at the next sequence.
From `fabric-samples/test-network`, with `git-bash`/MSYS on Windows:

```bash
cd fabric-samples/test-network

# Windows/git-bash specifics (all matter; the ENV_CONV_EXCL vars stop MSYS from
# rewriting DOCKER_SOCK=/var/run/docker.sock into "C:\Program Files\Git\var\..."):
export MSYS_NO_PATHCONV=1
export MSYS_ENV_CONV_EXCL='*'
export MSYS2_ENV_CONV_EXCL='*'
export PATH="$PWD/../bin:/c/Program Files/Go/bin:$PATH"      # peer CLI + jq + go (packager runs `go list`)
export FABRIC_CFG_PATH='D:/MadhuChain/chain/network/fabric-samples/config'   # core.yaml dir, Windows form
export TEST_NETWORK_HOME="$(cygpath -w "$PWD")"              # Windows-form so envVar.sh paths are absolute
rm -f madhuchain-cc.tar.gz                                   # never reuse a stale package

./scripts/deployCC.sh madhuchain-channel madhuchain-cc \
  'D:/MadhuChain/chain/chaincode/madhuchain-cc' go 1.4 5
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

This enrolls Beekeeper/QC/Admin under Org1, Transporter/Factory/Distributor under
Org2, and LabTech under Org3. Each certificate carries its application role.

## Tear down

```bash
./up.sh down
```

## Chaincode functions

| Function | Role | Purpose |
|---|---|---|
| `CreateHarvestBatch` | KVIC Beekeeper | Anchor hive, beekeeper, and harvest hashes |
| `RecordCollection` | Factory | Anchor accepted/rejected collection record |
| `RecordLabResult` | Certified Lab | Anchor certificate hash and approval result |
| `RecordProcessing` | Factory | Anchor processing record hash |
| `RecordPackaging` | Factory | Anchor packaging and bottle-summary hashes |
| `TransferCustody` | Current custodian | Record MSP-to-MSP custody proof |
| `RevokeBatch` | KVIC | Revoke a batch using a reason hash |
| `GetBatch` / histories | Any channel member | Read proof records |

See `docs/` (PRD, system-plan, processing-chain) for the full business rules. The
chaincode's `normalizeBatch` (called from `putBatch` + `getBatch` since v1.4)
keeps all returned/stored batch JSON schema-valid for the contract API — always
bump and redeploy when adding slice/map struct fields.
