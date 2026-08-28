# HoneyChain — Hyperledger Fabric Network (1 org, local)

Brings up a permissioned Hyperledger Fabric network for development and pilot:
**1 org (`Org1`), 1 peer, 1 orderer (Raft), 1 CA**, channel `honeychain-channel`,
smart contract `honeychain-cc` (Go).

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

See `docs/` (PRD, system-plan, processing-chain) for the full business rules.
