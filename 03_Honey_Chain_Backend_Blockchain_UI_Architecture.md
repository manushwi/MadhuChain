# Honey Chain Backend, Hyperledger Fabric, and UI Architecture

Version: 2.0  
Date: 29 August 2026  
Purpose: Rebuilt architecture for Honey Chain using a Node.js/TypeScript backend, Hyperledger Fabric blockchain, Go chaincode, on-chain event visibility in the KVIC/admin panel, and a complete testing guide.

---

## 1. Updated Technical Decision

Use this stack:

```text
Backend:
Node.js + TypeScript

Blockchain:
Hyperledger Fabric

Smart contracts:
Go chaincode

Backend to blockchain connection:
Hyperledger Fabric Gateway Node client API

Apps:
Beekeeper App -> React Native + Expo
Factory App -> React Native + Expo
Consumer Web -> Next.js
KVIC/Admin Dashboard -> Next.js
```

Short answer:

```text
Yes, this is possible.
Yes, admin panel can show on-chain logs/events.
Yes, testing can be done with a local Fabric test network, chaincode tests, backend tests, and full end-to-end flow tests.
```

---

## 2. Why Node.js/TypeScript Backend

### 2.1 Recommended Backend

Recommended:

```text
Node.js + TypeScript + Fastify or NestJS
```

Why:

- Hyperledger Fabric has an official Fabric Gateway client API for Node.
- Node.js is well suited for API services, QR/barcode workflows, dashboards, WebSockets, queues, and mobile/web app backends.
- TypeScript gives type safety for APIs, database models, blockchain transaction payloads, and shared frontend/backend types.
- Node.js is safer than Bun for Fabric integration because Fabric's official Node client is documented and tested for the Node runtime.

### 2.2 Can We Use Bun?

Bun can be used for some JavaScript/TypeScript projects, but for Honey Chain's Fabric-connected backend, it should not be the first choice.

Reason:

```text
Hyperledger Fabric's official Node client ecosystem targets Node.js.
Fabric Gateway uses gRPC, TLS certificates, client identities, and crypto signing.
These areas should be kept on the officially supported runtime for lower risk.
```

Recommended Bun usage:

```text
Use Bun only for local scripts, tooling, or non-Fabric services after testing.
Use Node.js for the backend service that talks to Hyperledger Fabric.
```

If using Bun anyway, approve it only after:

- Fabric Gateway connection works.
- Transaction submit works.
- Transaction evaluate/query works.
- Chaincode events listener works.
- Block event listener works.
- TLS certificate loading works.
- Docker deployment works.

### 2.3 JavaScript or TypeScript?

Use TypeScript.

JavaScript is possible, but TypeScript is better because Honey Chain has many structured objects:

- Hive readings.
- Batch records.
- Lab results.
- Chaincode payloads.
- QR token claims.
- Role permissions.
- Admin dashboard filters.

Recommended:

```text
Node.js runtime
TypeScript source code
Fastify or NestJS backend framework
Prisma or Drizzle ORM
PostgreSQL + TimescaleDB + Redis
Hyperledger Fabric Gateway Node API
```

---

## 3. High-Level System Architecture

```text
IoT Hive Nodes
  |
  v
Master Gateway with Cellular
  |
  v
Node.js Backend API
  |
  +-- PostgreSQL operational data
  +-- TimescaleDB sensor data
  +-- Redis queues/cache
  +-- Object storage/IPFS for reports
  +-- AI/ML service
  |
  v
Hyperledger Fabric Gateway Client
  |
  v
Fabric Network
  |
  +-- Org1: KVIC
  +-- Org2: Collection Centers
  +-- Org3: Labs
  +-- Org4: Processing/Packaging Units
  +-- Org5: Distributor/Retailer, future
  |
  v
Go Chaincode: honeychain
  |
  v
Ledger + World State + Chaincode Events
```

User interfaces:

```text
Beekeeper App
  |
  v
Node.js Backend
  |
  v
Fabric event hash/proof for harvest and batch

Factory App
  |
  v
Node.js Backend
  |
  v
Fabric event proof for collection, lab, processing, packaging, dispatch

Consumer Web
  |
  v
Node.js Backend verification API
  |
  v
Database + Fabric ledger proof

KVIC/Admin Dashboard
  |
  v
Node.js Backend admin APIs
  |
  v
Database analytics + indexed Fabric events
```

---

## 4. Recommended Repository Structure

```text
honey-chain/
  apps/
    beekeeper-app/
      src/
      app.json
      package.json

    factory-app/
      src/
      app.json
      package.json

    consumer-web/
      app/
      components/
      package.json

    kvic-dashboard/
      app/
      components/
      package.json

  services/
    backend-api/
      src/
        app.ts
        server.ts
        config/
        modules/
          auth/
          users/
          roles/
          beekeepers/
          apiaries/
          hives/
          devices/
          telemetry/
          ai/
          alerts/
          harvests/
          batches/
          factory/
          lab/
          processing/
          packaging/
          shipments/
          verification/
          admin/
          audit/
          fabric/
        workers/
          ai-worker.ts
          fabric-event-indexer.ts
          notification-worker.ts
        db/
          schema/
          migrations/
        tests/
      package.json
      Dockerfile

    ai-service/
      src/
      models/
      tests/

  blockchain/
    fabric/
      network/
        organizations/
        channel-artifacts/
        docker-compose.yaml
      chaincode/
        honeychain/
          go.mod
          main.go
          contract.go
          models.go
          contract_test.go
      scripts/
        start-network.sh
        deploy-chaincode.sh
        invoke.sh
        query.sh

  packages/
    shared-types/
    api-client/
    ui-tokens/

  docs/
    testing/
    architecture/
```

For MVP, keep backend as a modular monolith first. Split into independent services only after core flow works.

---

## 5. Hyperledger Fabric Network Design

### 5.1 Fabric Organizations

Recommended MVP Fabric organizations:

```text
Org1MSP: KVIC
Org2MSP: Collection/Factory
Org3MSP: Certified Lab
```

Future:

```text
Org4MSP: Distributor
Org5MSP: Retailer
Org6MSP: Certification Authority / regulator
```

### 5.2 Channels

MVP:

```text
honeychannel
```

Production options:

```text
honeychannel
private-lab-channel, optional
regional channels, optional
```

Keep MVP simple with one channel first.

### 5.3 Chaincode

Chaincode name:

```text
honeychain
```

Language:

```text
Go
```

Main chaincode responsibility:

- Create tamper-evident batch records.
- Store hashes of sensitive/off-chain records.
- Store stage transitions.
- Store custody transfer proofs.
- Emit chaincode events for admin/on-chain log panel.

Do not store raw sensor data, PDFs, images, private addresses, or full user data on Fabric ledger.

---

## 6. On-Chain vs Off-Chain Boundary

### 6.1 Store On-Chain

```text
Batch ID
Hive reference hash
Beekeeper reference hash
Harvest record hash
Collection record hash
Lab certificate hash
Processing record hash
Packaging record hash
Bottle/QR summary hash
Carton/shipment hash
Custody transfer hash
Current batch status
Event timestamp
Submitting organization MSP ID
Transaction ID
```

### 6.2 Store Off-Chain

```text
Raw sensor data
AI feature windows
Full lab PDF report
Hive images/audio
Beekeeper private profile data
Exact private GPS coordinates
Factory notes
Consumer scan IP/user agent
Full analytics data
```

### 6.3 Why This Boundary Matters

```text
Database gives speed and flexibility.
Fabric gives proof and auditability.
Object storage keeps large files affordable.
Hash linking connects them safely.
```

---

## 7. Go Chaincode Data Models

### 7.1 Batch Asset

```go
type HoneyBatch struct {
    BatchID             string `json:"batchId"`
    HiveHash            string `json:"hiveHash"`
    BeekeeperHash       string `json:"beekeeperHash"`
    HarvestHash         string `json:"harvestHash"`
    LabCertificateHash  string `json:"labCertificateHash,omitempty"`
    ProcessingHash      string `json:"processingHash,omitempty"`
    PackagingHash       string `json:"packagingHash,omitempty"`
    CurrentStatus       string `json:"currentStatus"`
    CurrentCustodianMSP string `json:"currentCustodianMsp"`
    CreatedAt           string `json:"createdAt"`
    UpdatedAt           string `json:"updatedAt"`
    Revoked             bool   `json:"revoked"`
    RevocationReason    string `json:"revocationReason,omitempty"`
}
```

### 7.2 Custody Event

```go
type CustodyEvent struct {
    EventID       string `json:"eventId"`
    AssetID       string `json:"assetId"`
    AssetType     string `json:"assetType"`
    FromMSP       string `json:"fromMsp"`
    ToMSP         string `json:"toMsp"`
    TransferHash  string `json:"transferHash"`
    TransactionID string `json:"transactionId"`
    Timestamp     string `json:"timestamp"`
}
```

### 7.3 On-Chain Event Record

```go
type ChainEventRecord struct {
    EventID       string `json:"eventId"`
    BatchID       string `json:"batchId"`
    EventType     string `json:"eventType"`
    PayloadHash   string `json:"payloadHash"`
    ActorMSP      string `json:"actorMsp"`
    TransactionID string `json:"transactionId"`
    Timestamp     string `json:"timestamp"`
}
```

---

## 8. Go Chaincode Contract Functions

Recommended transaction functions:

```text
CreateHarvestBatch(batchId, hiveHash, beekeeperHash, harvestHash)
RecordCollection(batchId, collectionHash, accepted)
RecordLabResult(batchId, certificateHash, approved)
RecordProcessing(batchId, processingHash)
RecordPackaging(batchId, packagingHash, bottleSummaryHash)
TransferCustody(assetId, assetType, fromMsp, toMsp, transferHash)
RevokeBatch(batchId, reasonHash)
GetBatch(batchId)
GetBatchHistory(batchId)
GetCustodyHistory(assetId)
VerifyBatchHash(batchId, expectedHash)
```

### 8.1 Chaincode Permission Rules

Example:

```text
KVICMSP:
Can approve organizations, revoke batch, audit all records

FactoryMSP:
Can record collection, processing, packaging, dispatch

LabMSP:
Can record lab result only

Beekeeper client through backend:
Can create harvest batch only after backend validates beekeeper account
```

Important:

In Fabric, chaincode can check client identity attributes and MSP ID. Backend must also check permissions before submitting a transaction.

---

## 9. Chaincode Events for Admin Panel

### 9.1 Can We See On-Chain Logs in Admin Panel?

Yes.

But use the right wording:

```text
Admin panel can show on-chain transaction events, chaincode events, block references, transaction IDs, and ledger proof.
```

Do not depend on peer container logs for product UI. Peer logs are infrastructure logs, not user-facing blockchain proof.

### 9.2 Event Types to Emit

Go chaincode should emit events such as:

```text
HarvestBatchCreated
CollectionRecorded
LabResultRecorded
ProcessingRecorded
PackagingRecorded
CustodyTransferred
BatchRevoked
FraudFlagged
```

Event payload example:

```json
{
  "eventType": "LabResultRecorded",
  "batchId": "HC-UP-GZB-2026-00125",
  "payloadHash": "sha256:...",
  "actorMsp": "LabMSP",
  "status": "APPROVED",
  "timestamp": "2026-08-29T16:00:00Z"
}
```

### 9.3 Admin Panel On-Chain Logs Flow

Recommended architecture:

```text
Fabric Peer emits chaincode/block events
  |
  v
Node.js Fabric Event Indexer Worker listens to events
  |
  v
Worker stores normalized events in PostgreSQL
  |
  v
KVIC/Admin Dashboard reads fast indexed events from backend API
  |
  v
Admin can open event detail and verify ledger proof from Fabric
```

Why not query Fabric directly from the browser?

- Fabric needs certificates and private keys.
- Browser should not hold admin blockchain credentials.
- Direct ledger queries can be slower for dashboards.
- Dashboard filters/search need database indexing.

### 9.4 Admin On-Chain Logs Table

Create a PostgreSQL table:

```text
fabric_events
  id
  channel_name
  chaincode_name
  event_name
  batch_id
  asset_id
  transaction_id
  block_number
  actor_msp_id
  payload_hash
  payload_json
  validation_code
  event_timestamp
  indexed_at
```

### 9.5 Admin UI for On-Chain Logs

KVIC dashboard screen:

```text
Admin Dashboard
  |
  v
Blockchain Logs
  |
  +-- Filter by batch ID
  +-- Filter by event type
  +-- Filter by organization MSP
  +-- Filter by date
  +-- Filter by transaction status
  |
  v
Event Detail
  |
  +-- Transaction ID
  +-- Block number
  +-- Chaincode event name
  +-- Actor MSP
  +-- Payload hash
  +-- Linked database record
  +-- Verify button
```

Verification action:

```text
Admin clicks Verify
  |
  v
Backend queries Fabric ledger using transaction ID or batch ID
  |
  v
Backend compares on-chain hash with database/off-chain record hash
  |
  v
Admin sees Verified / Mismatch / Missing
```

---

## 10. Node.js Backend Architecture

### 10.1 Backend Framework

Recommended:

```text
Node.js + TypeScript + Fastify
```

Alternative:

```text
Node.js + TypeScript + NestJS
```

Use Fastify if:

- You want lean APIs.
- You want high performance.
- You prefer simpler structure.

Use NestJS if:

- You want enterprise-style modules.
- You want dependency injection.
- You expect a larger backend team.

Recommendation for Honey Chain:

```text
Fastify for MVP.
NestJS only if project becomes large and team-based.
```

### 10.2 Backend Modules

```text
backend-api/src/modules/
  auth/
  users/
  roles/
  organizations/
  beekeepers/
  clusters/
  apiaries/
  hives/
  devices/
  telemetry/
  ai/
  alerts/
  harvests/
  batches/
  factory/
  lab/
  processing/
  packaging/
  shipments/
  verification/
  admin/
  fabric/
  audit/
```

### 10.3 Fabric Integration Module

```text
fabric/
  connection.ts
  identity.ts
  gateway.ts
  contracts.ts
  transactions.ts
  events.ts
  proofs.ts
  errors.ts
```

Responsibilities:

- Load Fabric connection profile.
- Load user/org certificate.
- Connect to Fabric Gateway.
- Submit transactions.
- Evaluate ledger queries.
- Listen to chaincode events.
- Listen to block events if needed.
- Convert Fabric errors into API errors.
- Store transaction IDs and block references.

### 10.4 Backend Write Pattern

For critical actions:

```text
API request
  |
  v
Validate auth and permission
  |
  v
Validate business state
  |
  v
Create off-chain DB record
  |
  v
Generate deterministic hash of record
  |
  v
Submit Fabric transaction
  |
  v
Save Fabric transaction ID
  |
  v
Return success to app
```

For better resilience:

```text
API request
  |
  v
Create pending DB record
  |
  v
Queue Fabric write job
  |
  v
Worker submits Fabric transaction
  |
  v
Update DB status: CONFIRMED or FAILED
```

MVP choice:

```text
Use direct transaction submit for demo clarity.
Add queue/retry worker for pilot.
```

---

## 11. Backend API Map

### 11.1 Auth APIs

```text
POST /api/v1/auth/login
POST /api/v1/auth/otp/request
POST /api/v1/auth/otp/verify
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### 11.2 Beekeeper, Apiary, Hive APIs

```text
POST /api/v1/beekeepers
GET  /api/v1/beekeepers/me
POST /api/v1/apiaries
GET  /api/v1/apiaries
POST /api/v1/hives
GET  /api/v1/hives
GET  /api/v1/hives/{hiveId}
GET  /api/v1/hives/{hiveId}/telemetry/latest
GET  /api/v1/hives/{hiveId}/telemetry/history
GET  /api/v1/hives/{hiveId}/health
```

### 11.3 IoT Gateway APIs

```text
POST /api/v1/iot/gateways/provision
POST /api/v1/iot/nodes/provision
POST /api/v1/iot/nodes/{nodeId}/pair-hive
POST /api/v1/iot/gateways/{gatewayId}/telemetry/bulk
POST /api/v1/iot/gateways/{gatewayId}/heartbeat
GET  /api/v1/iot/gateways/{gatewayId}/status
```

### 11.4 AI and Alert APIs

```text
POST /api/v1/ai/features/generate
POST /api/v1/ai/hives/{hiveId}/predict
GET  /api/v1/hives/{hiveId}/health
GET  /api/v1/alerts
GET  /api/v1/alerts/{alertId}
POST /api/v1/alerts/{alertId}/acknowledge
POST /api/v1/alerts/{alertId}/resolve
```

### 11.5 Harvest and Batch APIs

```text
POST /api/v1/harvests
GET  /api/v1/batches
GET  /api/v1/batches/{batchId}
GET  /api/v1/batches/{batchId}/barcode
GET  /api/v1/batches/{batchId}/timeline
```

### 11.6 Factory APIs

```text
POST /api/v1/factory/scan
POST /api/v1/factory/collection/accept
POST /api/v1/factory/collection/reject
POST /api/v1/factory/lab-results
POST /api/v1/factory/processing/start
POST /api/v1/factory/processing/complete
POST /api/v1/factory/packaging/generate
POST /api/v1/factory/dispatch
```

### 11.7 Consumer Verification APIs

```text
GET  /api/v1/verify/{token}
POST /api/v1/verify/{token}/scan-event
POST /api/v1/verify/{token}/report-issue
```

### 11.8 Admin/KVIC APIs

```text
GET /api/v1/admin/overview
GET /api/v1/admin/map
GET /api/v1/admin/clusters
GET /api/v1/admin/production
GET /api/v1/admin/hive-health
GET /api/v1/admin/disease-risk
GET /api/v1/admin/batches
GET /api/v1/admin/fraud-alerts
GET /api/v1/admin/fabric/events
GET /api/v1/admin/fabric/events/{transactionId}
POST /api/v1/admin/fabric/events/{transactionId}/verify
GET /api/v1/admin/reports/export
```

---

## 12. Database Tables for Backend

### 12.1 Operational Tables

```text
users
roles
organizations
beekeepers
clusters
apiaries
hives
devices
gateways
alerts
harvests
honey_batches
lab_tests
processing_records
packaging_records
bottles
cartons
shipments
custody_events
verification_scans
audit_logs
fabric_events
fabric_transactions
model_predictions
model_versions
```

### 12.2 Fabric Transaction Table

```text
fabric_transactions
  id
  transaction_id
  channel_name
  chaincode_name
  function_name
  related_entity_type
  related_entity_id
  request_hash
  status
  submitted_by_user_id
  submitted_by_org_id
  submitted_at
  confirmed_at
  error_message
```

### 12.3 Fabric Events Table

```text
fabric_events
  id
  transaction_id
  block_number
  channel_name
  chaincode_name
  event_name
  batch_id
  asset_id
  actor_msp_id
  payload_hash
  payload_json
  validation_code
  event_timestamp
  indexed_at
```

---

## 13. UI Architecture for All Apps

## 13.1 Beekeeper React Native App

Main flows:

```text
Login
  |
  v
Register Apiary
  |
  v
Register Hive
  |
  v
Pair Device
  |
  v
View Sensor Dashboard
  |
  v
Receive Alerts
  |
  v
Create Harvest
  |
  v
Generate Batch Barcode
  |
  v
Track Batch Timeline
```

Screens:

- Home dashboard.
- Hive list.
- Hive detail.
- Sensor graphs.
- AI health score.
- Alerts.
- Harvest creation.
- Batch barcode.
- Batch timeline.
- Profile.

Blockchain visibility for beekeeper:

- Show "Harvest secured on blockchain" after Fabric transaction confirms.
- Show transaction ID in advanced details.
- If pending, show "Blockchain confirmation pending".

## 13.2 Factory React Native App

Main flows:

```text
Employee Login
  |
  v
Role Check
  |
  v
Scan Barcode
  |
  v
Collection / Lab / Processing / Packaging / Dispatch
  |
  v
Submit stage
  |
  v
Fabric proof created
```

Screens:

- Factory dashboard.
- Barcode scanner.
- Batch detail.
- Collection acceptance.
- Lab result.
- Processing record.
- Packaging and QR generation.
- Dispatch.
- Exception review.

Blockchain visibility for factory:

- Show transaction ID for completed stage.
- Show validation warning if Fabric proof fails.
- Show "pending sync" if offline.

## 13.3 Consumer Next.js Web App

Main QR flow:

```text
Consumer scans QR
  |
  v
Next.js page opens
  |
  v
Backend verifies QR token
  |
  v
Backend checks DB and Fabric proof
  |
  v
Show Authentic / Invalid / Needs Review
```

Consumer page:

- Authenticity status.
- Bottle ID.
- Batch ID.
- Origin district/cluster.
- Harvest date.
- Floral source.
- Lab approved status.
- Supply-chain timeline.
- Blockchain verification status.
- Report issue.

Do not show:

- Exact hive coordinates.
- Beekeeper private phone/address.
- Internal employee IDs.

## 13.4 KVIC/Admin Next.js Dashboard

Main modules:

- National overview.
- State/district/cluster filters.
- Beekeeper registry.
- Hive and device health.
- AI disease-risk heatmap.
- Production analytics.
- Batch traceability.
- Lab approvals/rejections.
- QR scan analytics.
- Counterfeit alerts.
- Blockchain logs.
- Audit logs.
- User and role management.

Blockchain Logs screen:

```text
Table columns:
Date
Event Type
Batch ID
Asset ID
Actor MSP
Transaction ID
Block Number
Status
Verify Action
```

Event detail drawer:

```text
Transaction ID
Block number
Channel
Chaincode
Event name
Payload hash
Linked off-chain record
Verification result
Raw event payload, collapsible
```

---

## 14. Soft UI Matte Design

Use the same Soft UI matte style from the PRD.

Design tokens:

```text
background.base: #F6F4EE
surface.matte: #FFFCF5
surface.raised: #FFFFFF
text.primary: #252A2E
text.secondary: #66706A
brand.honey: #D99A21
brand.amber: #F2B84B
brand.sage: #6E8F72
brand.leaf: #2F6F52
state.warning: #C97925
state.danger: #B94A48
state.info: #4C7EA8
border.soft: #E5DED0
```

UI rules:

- Use 8px card radius.
- Use matte surfaces.
- Use clear verified/warning/error states.
- Use icon buttons for scan, verify, filter, export, refresh.
- Keep Consumer page simple.
- Keep KVIC dashboard dense and filterable.

---

## 15. Testing Guide

## 15.1 Testing Layers

```text
Unit Tests
  |
  +-- Go chaincode functions
  +-- Node.js service logic
  +-- AI feature logic
  +-- UI utilities

Integration Tests
  |
  +-- Backend + PostgreSQL
  +-- Backend + Redis
  +-- Backend + Fabric test network
  +-- Backend + object storage

End-to-End Tests
  |
  +-- Beekeeper harvest
  +-- Factory scan/lab/packaging
  +-- Consumer QR verify
  +-- Admin blockchain log view

Hardware/IoT Tests
  |
  +-- ESP32 node payload
  +-- Gateway upload
  +-- Offline queue
  +-- Duplicate packet handling
```

---

## 16. Hyperledger Fabric Testing

### 16.1 Local Fabric Network

Use Fabric test network for development.

Recommended setup:

```text
fabric-samples/test-network
```

Test steps:

```text
1. Start test network.
2. Create channel.
3. Package Go chaincode.
4. Install chaincode on peers.
5. Approve chaincode for organizations.
6. Commit chaincode to channel.
7. Invoke CreateHarvestBatch.
8. Query GetBatch.
9. Invoke RecordLabResult.
10. Listen for chaincode events.
```

### 16.2 Go Chaincode Unit Tests

Test these functions:

- `CreateHarvestBatch`
- `RecordCollection`
- `RecordLabResult`
- `RecordProcessing`
- `RecordPackaging`
- `TransferCustody`
- `RevokeBatch`
- `GetBatch`
- `GetBatchHistory`

Test cases:

```text
Create batch success
Duplicate batch rejected
Invalid empty batch ID rejected
Lab result cannot be added before collection
Rejected lab result blocks packaging
Revoked batch blocks custody transfer
Unauthorized MSP rejected
Event payload created correctly
```

### 16.3 Fabric Event Tests

Check:

- Chaincode emits event after each transaction.
- Event payload contains `batchId`, `eventType`, `payloadHash`, `actorMsp`, timestamp.
- Node.js event indexer receives event.
- Event is saved in `fabric_events`.
- Admin API returns indexed event.
- Verify action compares on-chain hash with database hash.

---

## 17. Backend Testing

### 17.1 Unit Tests

Use:

```text
Vitest or Jest
```

Test:

- Auth service.
- Permission checks.
- Batch state transitions.
- Hash generation.
- QR token signing/verification.
- Fabric transaction payload builder.
- Error mapping.

### 17.2 Integration Tests

Use:

```text
Test database
Test Redis
Fabric test network
Mock object storage or local MinIO
```

Integration tests:

```text
Create beekeeper
Create apiary
Create hive
Upload gateway telemetry
Generate health prediction
Create harvest
Submit Fabric transaction
Scan batch in factory
Record lab result
Generate bottle QR
Verify consumer QR
Read admin Fabric logs
```

### 17.3 API Contract Tests

Validate every endpoint returns expected schema.

Examples:

```text
GET /api/v1/hives/{hiveId}/health
GET /api/v1/batches/{batchId}/timeline
GET /api/v1/verify/{token}
GET /api/v1/admin/fabric/events
POST /api/v1/admin/fabric/events/{transactionId}/verify
```

---

## 18. UI Testing

### 18.1 Beekeeper App Tests

Test:

- Login.
- Hive list.
- Hive detail sensor cards.
- Alert acknowledgement.
- Harvest creation.
- Barcode screen.
- Offline harvest draft.

### 18.2 Factory App Tests

Test:

- Role-based login.
- Barcode scan success.
- Invalid barcode warning.
- Collection accept/reject.
- Lab approve/reject.
- Packaging QR generation.
- Dispatch.
- Offline scan draft.

### 18.3 Consumer Web Tests

Test:

- Valid QR shows Authentic.
- Invalid token shows warning.
- Revoked batch shows warning.
- Hash mismatch shows Needs Review.
- Traceability timeline renders correctly.
- Page works well on mobile.

### 18.4 KVIC/Admin Dashboard Tests

Test:

- Dashboard filters.
- Batch traceability search.
- Blockchain logs table.
- Event detail drawer.
- Verify ledger proof button.
- CSV/PDF export.
- RBAC restrictions.

Recommended tools:

```text
React Native Testing Library
Playwright for Next.js apps
Vitest/Jest for component logic
```

---

## 19. End-to-End Demo Testing Script

Use this as the main demo test.

```text
1. Register beekeeper.
2. Register apiary.
3. Register hive.
4. Pair hive node/device.
5. Upload sample telemetry from gateway.
6. Generate hive health score.
7. Create harvest.
8. Backend creates Batch ID.
9. Fabric records CreateHarvestBatch.
10. Beekeeper app shows barcode.
11. Factory app scans barcode.
12. Factory accepts collection.
13. Fabric records collection event.
14. Lab staff enters lab result.
15. Fabric records lab certificate hash.
16. Processing staff completes processing.
17. Packaging staff generates Bottle ID and QR.
18. Fabric records packaging event.
19. Consumer scans QR.
20. Consumer page shows Authentic.
21. KVIC dashboard opens Blockchain Logs.
22. Admin verifies transaction proof.
```

Pass condition:

```text
One honey bottle can be traced from hive to consumer QR, with Fabric transaction IDs visible in the admin panel.
```

---

## 20. IoT Testing With Backend

### 20.1 Simulated Gateway Test

Create a simulated gateway payload:

```json
{
  "gatewayId": "GW-UP-GZB-001",
  "apiaryId": "API-UP-GZB-00012",
  "readings": [
    {
      "nodeId": "NODE-HC-001",
      "hiveId": "HIVE-UP-GZB-024",
      "temperatureC": 34.2,
      "humidityPct": 64,
      "weightKg": 38.5,
      "beeEntries": 212,
      "beeExits": 198,
      "batteryPct": 78
    }
  ]
}
```

Expected:

- Backend accepts payload.
- Sensor reading is stored.
- Latest hive telemetry API returns values.
- AI feature job can process it.
- Beekeeper app shows latest reading.

### 20.2 Hardware Test

Test:

- ESP32 node reads SHT31-D.
- ESP32 node reads HX711.
- ESP32 node counts IR beams.
- Node sends packet to gateway.
- Gateway uploads to backend.
- Backend ignores duplicate sequence numbers.
- Backend marks gateway offline if heartbeat missing.

---

## 21. Security Testing

Test:

- Beekeeper cannot access another beekeeper's hive.
- Factory collection staff cannot enter lab result.
- Lab staff cannot package a batch.
- Consumer API does not expose private beekeeper data.
- Invalid QR token is rejected.
- Revoked QR token is rejected.
- Fabric transaction cannot be submitted by unauthorized org identity.
- Admin blockchain logs require KVIC/admin role.
- Audit log is created for sensitive changes.

---

## 22. Performance Testing

MVP targets:

```text
Consumer verification response: under 3 seconds
Dashboard overview response: under 5 seconds
Gateway telemetry ingest: 1000 readings/minute in pilot test
Fabric transaction confirmation: acceptable for workflow, not used for raw telemetry
```

Performance tests:

- Bulk telemetry upload.
- QR verification load test.
- Admin event log pagination.
- Batch timeline query.
- Fabric transaction worker retry behavior.

---

## 23. Acceptance Criteria

### 23.1 Backend Acceptance

- Node.js backend exposes all core APIs.
- Role permissions work.
- PostgreSQL stores operational records.
- TimescaleDB stores sensor readings.
- Redis supports queues/cache.
- QR token verification works.

### 23.2 Fabric Acceptance

- Go chaincode deploys to Fabric test network.
- Batch creation writes to ledger.
- Lab certificate hash writes to ledger.
- Packaging hash writes to ledger.
- Custody transfer writes to ledger.
- Chaincode events are emitted.
- Event indexer stores Fabric events in PostgreSQL.

### 23.3 Admin Panel Acceptance

- KVIC dashboard shows Fabric events.
- Admin can filter blockchain logs.
- Admin can open event detail.
- Admin can verify hash against ledger.
- Admin can see mismatch warning.

### 23.4 End-to-End Acceptance

- One batch moves from beekeeper harvest to consumer QR verification.
- Consumer sees authenticity result.
- Admin sees full blockchain proof trail.
- Every critical stage has audit log and Fabric transaction ID.

---

## 24. MVP Build Order

Build in this order:

```text
1. Node.js backend project setup.
2. PostgreSQL schema.
3. Auth and role system.
4. Beekeeper/apiary/hive/device APIs.
5. IoT gateway telemetry API.
6. Basic AI/rule health output.
7. Hyperledger Fabric test network.
8. Go chaincode for HoneyBatch.
9. Backend Fabric Gateway integration.
10. Harvest -> Fabric batch creation.
11. Factory scan and lab flow.
12. Packaging and signed QR generation.
13. Consumer verification page.
14. Fabric event indexer worker.
15. KVIC/Admin blockchain logs panel.
16. Full testing guide execution.
```

---

## 25. What Needs Approval

Please approve or change these decisions before coding:

```text
1. Backend runtime:
Approve Node.js + TypeScript instead of Bun for Fabric-connected backend.

2. Backend framework:
Approve Fastify for MVP or NestJS for larger enterprise structure.

3. Blockchain:
Approve Hyperledger Fabric as the main blockchain.

4. Chaincode language:
Approve Go chaincode.

5. Fabric organizations:
Approve MVP orgs: KVICMSP, FactoryMSP, LabMSP.

6. Admin blockchain logs:
Approve indexed Fabric events in PostgreSQL for dashboard display.

7. Testing:
Approve Fabric test-network based testing before production deployment.
```

My recommended approval:

```text
Use Node.js + TypeScript + Fastify for backend.
Use Hyperledger Fabric with Go chaincode.
Use Fabric Gateway Node API for backend-blockchain connection.
Use PostgreSQL indexed Fabric events for admin blockchain logs.
Use Fabric test network for local testing.
```

---

## 26. References Checked

- Hyperledger Fabric Gateway documentation: https://hyperledger-fabric.readthedocs.io/en/latest/gateway.html
- Hyperledger Fabric Contract APIs and Application APIs: https://hyperledger-fabric.readthedocs.io/en/latest/sdk_chaincode.html
- Hyperledger Fabric Gateway client API: https://hyperledger.github.io/fabric-gateway/
- Hyperledger Fabric Gateway Node API: https://hyperledger.github.io/fabric-gateway/main/api/node/
- Hyperledger Fabric Go Contract API: https://github.com/hyperledger/fabric-contract-api-go
- Hyperledger Fabric chaincode overview: https://hyperledger-fabric.readthedocs.io/en/latest/chaincode4ade.html

