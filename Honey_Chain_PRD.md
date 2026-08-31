# Honey Chain Product Requirements Document

Version: 1.0  
Date: 29 August 2026  
Product: Honey Chain  
Interfaces: Beekeeper React Native App, Factory React Native App, Consumer Next.js Web App, KVIC Next.js Dashboard  
Primary Goal: Build a blockchain, AI, and IoT based honey traceability and smart beekeeping platform for rural beekeepers, factories, consumers, and KVIC officials.

---

## 1. Executive Summary

Honey Chain is an integrated digital ecosystem for rural honey production, designed around four connected experiences:

1. Beekeeper React Native App for hive monitoring, AI alerts, harvest creation, batch generation, barcode labels, and income/market linkage.
2. Factory React Native App for batch collection, barcode scanning, lab testing, processing, packaging, carton tracking, dispatch, and custody transfer.
3. Consumer Next.js Web App for instant QR based honey authenticity verification without mandatory login.
4. KVIC Next.js Dashboard for national, state, district, cluster, beekeeper, hive, production, disease-risk, batch, supply-chain, and fraud monitoring.

The system combines:

- IoT sensors for hive environment, weight, bee activity, sound, vibration, location, and optional image signals.
- AI analytics for colony health scoring, anomaly detection, pest/disease risk estimation, swarming risk, and honey yield prediction.
- Backend services for identity, device provisioning, telemetry ingestion, batch lifecycle, lab workflow, packaging, logistics, consumer verification, and admin analytics.
- Databases for operational records and time-series sensor data.
- Object storage or IPFS for lab reports, images, certificates, and evidence files.
- Blockchain for tamper-resistant records of critical traceability events and document hashes.
- Barcode and QR code tracking for factory operations, carton logistics, and consumer verification.

The platform should be built as a practical MVP first: one or more smart hive prototypes, one collection-to-packaging supply chain, a working batch blockchain record, and a consumer QR verification page. Future versions can expand to large-scale KVIC cluster deployment, more advanced AI, multilingual workflows, marketplace integration, certification automation, and IoT fleet management.

---

## 2. Problem Statement

KVIC's Honey Mission supports rural beekeepers with bee boxes and extraction toolkits for livelihood promotion. However, rural beekeepers still face several operational and market problems:

- Counterfeit or adulterated honey reduces trust in genuine products.
- Consumers cannot easily verify honey origin, quality, or supply-chain history.
- Beekeepers have limited access to advanced hive monitoring and disease-risk alerts.
- Manual production records are fragmented across beekeepers, collection centers, factories, labs, distributors, and sellers.
- Rural clusters may face connectivity gaps, making real-time digital operations difficult.
- KVIC and related institutions need a scalable dashboard to monitor beekeepers, hives, disease risks, production, and traceability compliance.

Honey Chain solves this by connecting hive-level intelligence with batch-level trust.

---

## 3. Product Vision

Create a transparent, scalable, and rural-friendly honey ecosystem where:

- Beekeepers can monitor hive health and create verified harvest batches.
- Factories can validate, test, process, package, and dispatch honey through barcode-based workflows.
- Consumers can scan a QR code and instantly verify whether the honey is authentic.
- KVIC officials can monitor rural beekeeping clusters, production, quality, disease risk, fraud signals, and market performance.
- Critical supply-chain events are recorded in a tamper-resistant blockchain layer.

---

## 4. Product Goals

### 4.1 Business Goals

- Improve consumer trust in honey authenticity.
- Reduce counterfeit honey circulation.
- Increase verified market access for rural beekeepers.
- Provide KVIC with cluster-level visibility and analytics.
- Create a scalable framework for district, state, and national rollout.

### 4.2 User Goals

- Beekeepers get timely hive-health alerts, yield predictions, and batch tracking.
- Factory staff get fast barcode scanning and role-specific workflows.
- Consumers get simple, no-login QR verification.
- KVIC officials get real-time and historical dashboards for governance and support.

### 4.3 Technical Goals

- Keep raw IoT data off blockchain for cost and performance.
- Store critical events and hashes on blockchain.
- Support offline-first mobile workflows for rural and factory environments.
- Use secure identity, RBAC, audit logs, and signed QR tokens.
- Scale from prototype hives to multi-cluster deployments.

---

## 5. Non-Goals

These are not required in the first MVP:

- Fully automated clinical disease diagnosis.
- Government-grade certification replacement without official approval.
- Live marketplace payments and full ecommerce settlement.
- Nationwide production deployment from day one.
- Blockchain storage of every sensor reading.
- Guaranteed field-grade hardware reliability without pilot validation.

---

## 6. Target Users and Personas

### 6.1 Beekeeper

Rural beekeeper managing one or more apiaries and hives.

Needs:

- Register hives and devices.
- Monitor hive health.
- Receive simple alerts and action recommendations.
- Create harvest batches.
- Track honey after it leaves the farm.
- Access better market credibility.

### 6.2 Factory Staff

Operational users at collection centers, labs, processing units, packaging centers, and dispatch points.

Needs:

- Scan barcodes quickly.
- Verify incoming batches.
- Record collection, testing, processing, packaging, and dispatch.
- Work with role-specific screens.
- Operate even with temporary internet loss.

### 6.3 Consumer

Buyer scanning the QR code printed on a honey bottle.

Needs:

- No app installation.
- No mandatory login.
- Instant authenticity result.
- Simple traceability timeline.
- Lab quality and origin details.

### 6.4 KVIC Official or Admin

Officials monitoring beekeeping clusters, hives, production, quality, and traceability.

Needs:

- National, state, district, and cluster dashboards.
- Disease-risk and production analytics.
- Counterfeit and invalid-scan alerts.
- Batch and supply-chain audit trail.
- Role-based user and institution management.

---

## 7. Product Modules

```text
Honey Chain
  |
  |-- Beekeeper React Native App
  |-- Factory React Native App
  |-- Consumer Next.js Web App
  |-- KVIC Next.js Dashboard
  |-- FastAPI Backend
  |-- IoT Telemetry Service
  |-- AI Analytics Service
  |-- PostgreSQL Operational Database
  |-- TimescaleDB Sensor Database
  |-- Redis Cache and Queue
  |-- Object Storage / IPFS
  |-- Blockchain Service
  |-- Notification Service
  |-- Analytics and Reporting Service
```

---

## 8. Recommended Technology Stack

| Layer | Recommended Technology | Purpose |
|---|---|---|
| Beekeeper App | React Native + Expo | Field mobile app |
| Factory App | React Native + Expo | Barcode scanning and operations |
| Consumer Web | Next.js | QR verification web experience |
| KVIC Dashboard | Next.js | Desktop admin and analytics dashboard |
| Backend API | FastAPI | Core platform APIs |
| Realtime / IoT | MQTT broker | Sensor telemetry ingestion |
| Operational DB | PostgreSQL | Users, hives, batches, roles, workflows |
| Sensor DB | TimescaleDB | Time-series IoT data |
| Cache / Queue | Redis | Sessions, rate limits, jobs, queues |
| AI Service | Python, scikit-learn/PyTorch/TensorFlow | Health scoring and predictions |
| Object Storage | S3-compatible storage or IPFS | Reports, images, certificates |
| Blockchain Prototype | Polygon / EVM testnet + Solidity | SIH/demo-friendly traceability |
| Blockchain Production | Hyperledger Fabric | Permissioned KVIC/institution network |
| Barcode | Code-128 | Batch, carton, and logistics scanning |
| QR | Signed URL QR code | Consumer verification |
| Push Notifications | FCM / Expo Notifications | Alerts and workflow updates |
| Maps | Mapbox / Google Maps / OpenStreetMap | Apiary and cluster maps |

---

## 9. High-Level Architecture

```text
Smart Hive Sensors
  |
  |-- SHT31-D temperature/humidity
  |-- Load Cell 50kg/100kg + HX711
  |-- IR Break Beam entrance sensors
  |-- INMP441 microphone
  |-- MPU6050 vibration
  |-- MH-Z19B CO2
  |-- BME280 weather
  |-- NEO-6M GPS
  |-- Optional ESP32-CAM OV2640
  |
  v
ESP32 Device Firmware
  |
  |-- validates sensor readings
  |-- buffers readings when offline
  |-- signs device payload
  |
  v
Wi-Fi / LoRa / GSM / Cluster Gateway
  |
  v
MQTT Broker
  |
  v
IoT Ingestion Service
  |
  |-- stores raw telemetry in TimescaleDB
  |-- sends recent readings to AI service
  |-- creates device-health status
  |
  v
AI Analytics Service
  |
  |-- health score
  |-- anomaly detection
  |-- swarming risk
  |-- pest/disease risk estimation
  |-- yield prediction
  |
  v
FastAPI Backend
  |
  |-- Beekeeper App
  |-- Factory App
  |-- Consumer Web
  |-- KVIC Dashboard
  |
  +-- PostgreSQL for operational records
  +-- TimescaleDB for sensor history
  +-- Redis for queues/cache
  +-- Object Storage/IPFS for certificates and media
  +-- Blockchain Service for critical events and hashes
```

Important rule:

```text
Raw sensor data -> Database
Reports/images/certificates -> Object Storage or IPFS
Critical events and hashes -> Blockchain
User-facing status and dashboards -> Backend APIs
```

---

## 10. Complete End-to-End Workflow

```text
Beekeeper Registration
  |
  v
Apiary Registration
  |
  v
Hive Registration
  |
  v
Device Pairing
  |
  v
IoT Sensor Monitoring
  |
  v
AI Health Analytics
  |
  v
Beekeeper Alerts and Recommendations
  |
  v
Harvest Creation
  |
  v
Batch ID Generation
  |
  v
Batch Barcode Printed
  |
  v
Collection Center Scan
  |
  v
Lab Testing and Certificate Hash
  |
  v
Processing
  |
  v
Packaging
  |
  v
Bottle IDs and Consumer QR Codes
  |
  v
Carton Barcodes
  |
  v
Dispatch and Custody Transfer
  |
  v
Retail / Consumer Purchase
  |
  v
Consumer QR Scan
  |
  v
Blockchain + Database Verification
  |
  v
Authenticity Result and Traceability Timeline
  |
  v
KVIC Analytics and Monitoring
```

---

## 11. Beekeeper React Native App

### 11.1 Purpose

The Beekeeper App is the field app for rural beekeepers. It helps them register hives, connect IoT kits, monitor hive health, receive alerts, create harvest records, generate batch barcodes, and track honey through the supply chain.

### 11.2 Navigation

```text
Root
  |
  |-- Splash
  |-- Login / Register
  |-- OTP Verification
  |-- Beekeeper Profile Setup
  |-- Apiary Registration
  |-- Hive Registration
  |-- Device Pairing
  |
  +-- Main Tabs
       |-- Home
       |-- Hives
       |-- Alerts
       |-- Harvest
       |-- Batches
       |-- Profile
```

### 11.3 Onboarding Flow

```text
App Start
  |
  v
Check Login Session
  |
  +-- No -> Login / Register -> OTP -> Profile Setup
  |
  +-- Yes
        |
        v
Register Apiary
  |
  v
Add Location
  |
  v
Register Hive
  |
  v
Generate Hive ID
  |
  v
Pair ESP32 Device
  |
  v
Sensor Connectivity Check
  |
  v
Dashboard
```

### 11.4 Dashboard Requirements

Dashboard cards:

- Total hives
- Active hives
- Offline hives
- Healthy hives
- Critical hives
- Estimated honey yield
- Active alerts
- Latest harvest batch
- Pending collection status

### 11.5 Hive Detail Requirements

Each hive detail page should show:

- Hive ID
- Apiary location
- Device ID
- Last telemetry timestamp
- Temperature
- Humidity
- Hive weight
- CO2
- Bee entry/exit activity
- Sound activity
- Vibration
- Optional image/camera event
- Colony health score
- Disease/pest risk
- Swarming risk
- Yield prediction
- Recommended actions
- Historical graphs

### 11.6 Alert Flow

```text
AI detects abnormal reading or risk
  |
  v
Backend creates alert
  |
  v
Push notification sent
  |
  v
Beekeeper opens alert
  |
  v
Alert detail shows problem, severity, readings, and recommendation
  |
  v
Beekeeper marks "Inspection Started"
  |
  v
Adds notes/photo/action taken
  |
  v
Marks alert resolved
```

Alert severity:

- Info
- Low
- Medium
- High
- Critical

Example alerts:

- High temperature detected.
- Sudden hive weight drop.
- Abnormal bee entrance activity.
- Low activity during expected active hours.
- High swarming risk.
- Device offline.
- Battery low.
- Possible pest/disease risk based on available signals.

### 11.7 Harvest Flow

```text
Open Harvest Tab
  |
  v
Start New Harvest
  |
  v
Select Hive / Apiary
  |
  v
AI shows estimated available honey
  |
  v
Enter actual harvest quantity
  |
  v
Select floral source
  |
  v
GPS and date captured
  |
  v
Add optional photo/notes
  |
  v
Submit harvest
  |
  v
Backend generates Batch ID
  |
  v
Blockchain harvest event created
  |
  v
Code-128 barcode generated
  |
  v
Batch status: Ready for Collection
```

### 11.8 Batch Tracking

The beekeeper can track each batch through:

```text
Harvested
  |
  v
Collection Center
  |
  v
Lab Testing
  |
  v
Quality Approved / Rejected
  |
  v
Processing
  |
  v
Packaging
  |
  v
Dispatch
  |
  v
Distributor
  |
  v
Retailer
```

### 11.9 Beekeeper App Acceptance Criteria

- User can register and verify mobile/email identity.
- User can create apiary and hive records.
- User can pair a device with a hive.
- App shows latest hive readings and historical charts.
- User receives push notification for high-risk alerts.
- User can create a harvest batch and generate a barcode.
- User can track batch stage after factory scans.
- Offline-created harvest drafts sync when network returns.

---

## 12. Factory React Native App

### 12.1 Purpose

The Factory App handles collection center, lab, processing, packaging, and dispatch workflows. Barcode scanning should be the primary action because factory work is stage-based and physical.

### 12.2 Factory Roles

- Collection Staff
- Lab Staff
- Processing Staff
- Packaging Staff
- Dispatch Staff
- Factory Supervisor
- Factory Admin

### 12.3 Navigation

```text
Root
  |
  |-- Splash
  |-- Employee Login
  |-- Role Verification
  |
  +-- Main Tabs
       |-- Dashboard
       |-- Scan
       |-- Batches
       |-- Operations
       |-- Profile
```

### 12.4 Dashboard Requirements

Dashboard cards:

- Incoming batches
- Awaiting collection acceptance
- Under lab testing
- Approved batches
- Rejected batches
- In processing
- Ready for packaging
- Packaged cartons
- Ready for dispatch
- Dispatched shipments
- Exceptions requiring supervisor review

### 12.5 Barcode Scan Flow

```text
Open Scan Tab
  |
  v
Scan Code-128 barcode
  |
  v
Extract Batch ID / Carton ID
  |
  v
Call Backend
  |
  v
Fetch database record
  |
  v
Fetch blockchain event summary
  |
  v
Validate stage and custody
  |
  +-- Valid -> Open allowed workflow
  |
  +-- Invalid -> Show warning and require supervisor review
```

### 12.6 Collection Flow

```text
Honey arrives at collection center
  |
  v
Scan batch barcode
  |
  v
Verify beekeeper, hive, harvest, blockchain event
  |
  v
Inspect container
  |
  v
Measure received weight
  |
  v
Compare declared quantity vs received quantity
  |
  v
Accept or reject
  |
  +-- Accepted -> status: Awaiting Lab Test
  |
  +-- Rejected -> reason recorded, beekeeper and KVIC notified
```

### 12.7 Lab Testing Flow

```text
Select batch awaiting lab test
  |
  v
Enter lab parameters
  |
  v
Upload report/certificate
  |
  v
Generate SHA-256 hash
  |
  v
Store file in object storage/IPFS
  |
  v
Store hash in database and blockchain
  |
  v
Mark pass/fail
```

Lab parameters for MVP:

- Moisture percentage
- Purity result
- Adulteration test result
- Sugar profile status
- Acidity
- Pollen/floral-source verification
- Lab notes

### 12.8 Processing Flow

```text
Select quality-approved batch
  |
  v
Scan batch barcode
  |
  v
Start processing
  |
  v
Record input quantity
  |
  v
Record process steps
  |
  v
Record output quantity
  |
  v
Complete processing
  |
  v
Create processing event
  |
  v
Update blockchain
```

### 12.9 Packaging Flow

```text
Select processed batch
  |
  v
Select bottle size
  |
  v
Enter packaging quantity
  |
  v
Generate Bottle IDs
  |
  v
Generate signed consumer QR codes
  |
  v
Generate carton IDs and carton barcodes
  |
  v
Print labels
  |
  v
Mark packaged
```

Identity hierarchy:

```text
Batch ID:  HC-UP-GZB-2026-00125
  |
  +-- Carton ID: CT-HC00125-01
  |     |
  |     +-- Bottle ID: BOT-HC00125-0001
  |     +-- Bottle ID: BOT-HC00125-0002
  |     +-- Bottle ID: BOT-HC00125-0003
  |
  +-- Carton ID: CT-HC00125-02
        |
        +-- Bottle ID: BOT-HC00125-0011
        +-- Bottle ID: BOT-HC00125-0012
```

### 12.10 Dispatch Flow

```text
Create shipment
  |
  v
Scan carton barcodes
  |
  v
Verify cartons belong to batch
  |
  v
Select distributor / destination
  |
  v
Enter vehicle and shipment details
  |
  v
Transfer custody
  |
  v
Create blockchain event
  |
  v
Status: Dispatched
```

### 12.11 Factory App Acceptance Criteria

- Employee can log in and see only role-permitted screens.
- Staff can scan valid and invalid barcodes.
- Collection staff can accept/reject batches.
- Lab staff can upload lab report and create certificate hash.
- Processing staff can record input/output quantities.
- Packaging staff can generate bottle QR codes and carton barcodes.
- Dispatch staff can create shipment and custody transfer.
- All critical operations create audit logs.
- Offline scans are queued and verified before final submission.

---

## 13. Consumer Next.js Web App

### 13.1 Purpose

The Consumer Web App is a public QR verification website. It should be fast, simple, mobile-first, and usable without login.

### 13.2 QR URL Format

Recommended:

```text
https://honeychain.in/v/{signedVerificationToken}
```

Alternative readable form:

```text
https://honeychain.in/verify/BOT-HC00125-0001?token={signedToken}
```

The QR should not rely only on a predictable Bottle ID. It should include or resolve to a signed token to reduce fake QR copying and enumeration.

### 13.3 Consumer Verification Flow

```text
Consumer buys honey bottle
  |
  v
Scans QR with phone camera
  |
  v
Next.js verification page opens
  |
  v
Token is validated by backend
  |
  v
Backend fetches bottle, batch, lab, custody, and blockchain records
  |
  v
Certificate hash is verified
  |
  v
Traceability chain is validated
  |
  +-- Valid -> show Authentic
  |
  +-- Invalid -> show Warning
  |
  +-- Suspicious -> show Needs Review
```

### 13.4 Consumer Page Content

Must show:

- Authenticity status
- Bottle ID
- Batch ID
- Origin cluster
- Beekeeper name or masked beekeeper identity
- Apiary district/state
- Harvest date
- Floral source
- Lab quality status
- Processing center
- Packaging date
- Supply-chain timeline
- Blockchain verification status
- Certificate hash or short transaction reference
- Report issue button

Should not show:

- Beekeeper phone number
- Exact private home location
- Internal employee IDs
- Sensitive lab raw files unless approved

### 13.5 Consumer Acceptance Criteria

- QR opens in a mobile browser without installing an app.
- Verification result loads in under 3 seconds for cached records.
- Invalid, expired, revoked, or fake tokens show a warning.
- Page displays a clear supply-chain timeline.
- Consumer can report suspected counterfeit.
- Repeated scans are recorded for analytics and fraud detection.

---

## 14. KVIC Next.js Dashboard

### 14.1 Purpose

The KVIC Dashboard is a desktop-first administrative and analytics platform for monitoring beekeepers, hives, production, lab quality, supply chain, fraud, and cluster performance.

### 14.2 Dashboard Hierarchy

```text
National
  |
  v
State
  |
  v
District
  |
  v
Cluster
  |
  v
Beekeeper
  |
  v
Apiary
  |
  v
Hive
  |
  v
Batch
```

### 14.3 KVIC Dashboard Modules

- Overview dashboard
- Map view
- Beekeeper registry
- Apiary and hive registry
- IoT device health
- Hive health analytics
- Disease-risk heatmap
- Harvest and production analytics
- Batch traceability
- Lab approval/rejection analytics
- Factory and collection center performance
- QR verification analytics
- Counterfeit and invalid scan alerts
- Marketplace and demand analytics
- Reports and exports
- Role and permission management
- Audit logs

### 14.4 Key Metrics

- Total registered beekeepers
- Total apiaries
- Total hives
- Active/offline devices
- Healthy/at-risk/critical colonies
- Total harvested quantity
- Predicted production
- Quality approved/rejected batches
- Processing turnaround time
- Packaging output
- Dispatched cartons
- Consumer QR scans
- Invalid QR scans
- Suspected counterfeit incidents
- District/cluster performance comparison

### 14.5 KVIC Acceptance Criteria

- KVIC user can filter data by state, district, cluster, beekeeper, and date.
- Dashboard shows hive health, production, and traceability metrics.
- Map view shows apiaries, collection centers, factories, and scan hotspots.
- Admin can export CSV/PDF reports.
- Admin can review audit logs and suspicious activity.
- Access is controlled by role and jurisdiction.

---

## 15. IoT Requirements

### 15.1 Prototype Sensor Kit

Minimum prototype kit:

| Function | Recommended Module | Use |
|---|---|---|
| Controller | ESP32 DevKit V1 | Main microcontroller |
| Temperature/Humidity | SHT31-D or DHT22 / AM2302 | Hive environment |
| Hive Weight | Load Cell 50kg/100kg + HX711 | Honey production and sudden loss |
| Sound | INMP441 I2S microphone | Buzzing/acoustic pattern |
| Entrance Activity | IR Break Beam Sensor 3mm / 5mm | Bee movement count; two beams infer direction |
| GPS | NEO-6M GPS | Apiary/device location |
| Vibration | MPU6050 or SW-420 | Hive disturbance and activity |
| CO2 | MH-Z19B | Ventilation and colony activity |
| Weather | BME280 | Local temperature, humidity, pressure |
| Optional Camera | ESP32-CAM OV2640 | Visual monitoring or image capture |

### 15.2 Production Hardware Considerations

The prototype modules are not automatically field-ready. Before real deployment, confirm:

- Weatherproof enclosure with ventilation where needed.
- Bee-safe placement that does not block brood frames or normal movement.
- Sensor calibration procedure.
- Battery and solar charging design.
- LoRa/GSM/Wi-Fi selection by rural connectivity.
- OTA firmware update mechanism.
- Tamper detection.
- Device identity and certificate provisioning.
- Cleaning and maintenance process.

### 15.3 Sensor Placement

| Sensor | Placement | Purpose |
|---|---|---|
| SHT31-D | Inside hive, protected from direct honey/wax contact | Internal temperature and humidity |
| Load Cell + HX711 | Under hive stand/platform | Weight trend and harvest prediction |
| IR Break Beam | Hive entrance, two-beam layout if possible | Entry/exit movement estimation |
| INMP441 | Protected inside or near hive wall | Acoustic feature collection |
| MPU6050 | Mounted to hive body | Disturbance/vibration signals |
| MH-Z19B | Ventilated internal chamber | CO2 trend |
| BME280 | Outside hive in weather shield | External weather context |
| NEO-6M | Top/external enclosure with antenna view | Location |
| ESP32-CAM | Entrance or inspection-facing mount | Optional image events |

### 15.4 Device Telemetry

Sample MQTT topic:

```text
honeychain/{clusterId}/{hiveId}/telemetry
```

Sample payload:

```json
{
  "deviceId": "DEV-HC-00045",
  "hiveId": "HIVE-UP-GZB-024",
  "timestamp": "2026-08-29T15:30:00Z",
  "temperatureC": 34.2,
  "humidityPct": 64.0,
  "weightKg": 38.5,
  "co2Ppm": 820,
  "beeEntries": 212,
  "beeExits": 198,
  "soundRms": 0.41,
  "vibrationScore": 0.07,
  "batteryPct": 78,
  "firmwareVersion": "1.0.3",
  "signature": "device-payload-signature"
}
```

### 15.5 Wokwi Simulation Note

For simulation, Wokwi can be used to validate sensor flow, dashboards, and alerts. If a real module is unavailable in Wokwi, use simulation-only substitutes:

- Potentiometer as a manual proxy for buzzing, pest/disease risk, or rain severity.
- PIR sensor as movement proxy.
- LDR/photoresistor as hive opening/light proxy.
- DHT22 and BMP180/BME280 style modules for weather/environment simulation.

Simulation thresholds must be labeled as prototype logic, not real biological disease detection.

---

## 16. AI Requirements

### 16.1 AI Outputs

The AI layer should produce:

- Colony health score
- Environmental stress score
- Swarming risk
- Pest/disease risk estimation
- Honey yield prediction
- Productivity anomaly detection
- Device/sensor anomaly detection
- Recommended beekeeper action

### 16.2 Model Inputs

Sensor inputs:

- Temperature trends
- Humidity trends
- Weight trends
- Entrance activity trends
- Sound/acoustic features
- Vibration patterns
- CO2 patterns
- Local weather context
- Optional image observations
- Historical hive baseline

Operational inputs:

- Hive age
- Apiary location
- Floral source season
- Harvest history
- Inspection history
- Lab result history
- Weather forecast, if available

### 16.3 Model Types

MVP:

- Rule-based alert engine
- Baseline anomaly detection
- Time-series trend analysis
- Simple yield prediction model
- Health score based on weighted sensor and alert features

Future:

- Supervised disease-risk models after validated datasets
- Acoustic classification for queen-loss/swarming/stress patterns
- Computer vision for Varroa/pest indicators where reliable image data exists
- Cluster-level disease-risk forecasting
- Personalized hive baselines
- Federated or edge-assisted learning for rural deployments

### 16.4 Dataset Strategy

Sensor-oriented dataset candidates:

- Germany 2019-2022 hive weight/temperature/humidity data
- Smart Bee Colony Monitor beehive sound data
- MSPB Multi-Sensor Honey Bee Dataset
- RIT Beehive Data
- RIT BeeDar style entrance activity data

Image-oriented dataset candidates:

- VarroaDataset
- BeeDataset

Important limitation:

A single public dataset with all planned sensors plus verified disease labels is unlikely. Model training should inspect each dataset's metadata, sampling rate, labels, missing values, license, and ground-truth quality before making disease-detection claims.

### 16.5 AI Acceptance Criteria

- System calculates health score for every active hive.
- System generates alerts from abnormal temperature, humidity, weight, activity, and device data.
- AI output includes explanation and recommended action.
- MVP clearly separates rule-based simulation from trained AI.
- Models store version, input features, output, confidence, and timestamp.
- High-risk alerts reach beekeeper app within the configured SLA.

---

## 17. Blockchain Requirements

### 17.1 Blockchain Purpose

Blockchain is used for trust and immutability, not bulk data storage.

Store on blockchain:

- Hive registration hash or reference
- Harvest event
- Batch creation event
- Collection acceptance/rejection event
- Lab certificate hash
- Processing event
- Packaging event
- Bottle/QR generation summary
- Carton creation summary
- Custody transfer events
- Dispatch event
- Revocation or fraud flag events

Do not store on blockchain:

- Every sensor reading
- Private user data
- Full lab PDF contents
- Full image/video/audio files
- Large operational logs

### 17.2 Prototype vs Production Chain

MVP / SIH prototype:

- Polygon testnet or other EVM testnet
- Solidity smart contract
- Hardhat
- ethers.js

Production / institutional deployment:

- Hyperledger Fabric
- Permissioned organizations: KVIC, collection centers, certified labs, factories, distributors
- Fabric CA for identity
- Chaincode in Go or Node.js

### 17.3 Smart Contract / Chaincode Events

```text
HiveRegistered(hiveIdHash, beekeeperIdHash, timestamp)
HarvestCreated(batchId, hiveIdHash, harvestDate, quantityHash, originHash)
CollectionRecorded(batchId, centerIdHash, accepted, quantityHash, timestamp)
LabResultRecorded(batchId, certificateHash, status, timestamp)
ProcessingRecorded(batchId, facilityIdHash, inputHash, outputHash, timestamp)
PackagingRecorded(batchId, bottleCountHash, cartonCountHash, timestamp)
CustodyTransferred(assetId, fromOrgHash, toOrgHash, timestamp)
BatchRevoked(batchId, reasonHash, timestamp)
```

### 17.4 Blockchain Acceptance Criteria

- Every batch has at least one blockchain harvest event.
- Lab certificate hash can be verified against the stored report.
- Consumer verification can compare database details with blockchain event summary.
- Invalid or missing blockchain references are shown as warnings.
- Failed blockchain writes are retried safely with idempotency keys.

---

## 18. Barcode, QR, and Supply-Chain Tracking

### 18.1 Identifier Strategy

Recommended IDs:

```text
Beekeeper ID: BK-UP-GZB-00045
Apiary ID:    API-UP-GZB-00012
Hive ID:      HIVE-UP-GZB-024
Device ID:    DEV-HC-00045
Batch ID:     HC-UP-GZB-2026-00125
Bottle ID:    BOT-HC00125-0001
Carton ID:    CT-HC00125-01
Shipment ID:  SH-HC-2026-00078
```

### 18.2 Barcode Usage

Use Code-128 barcode for:

- Harvest batch container label
- Factory receiving
- Lab sample tracking
- Processing stage tracking
- Carton tracking
- Shipment scanning

### 18.3 QR Usage

Use QR code for:

- Consumer verification
- Optional batch-level demo verification
- Public traceability link

### 18.4 Anti-Counterfeit QR Approach

Each QR should resolve to a signed verification token. The backend should verify:

- Token signature
- Bottle ID
- Batch ID
- Packaging status
- Revocation status
- Blockchain event presence
- Scan behavior anomalies

Suspicious behavior examples:

- Same bottle scanned from many distant locations in a short period.
- QR token scanned before packaging completion.
- Bottle ID not linked to a valid batch.
- Batch marked rejected or revoked.
- Certificate hash mismatch.

---

## 19. Backend Requirements

### 19.1 Core Services

```text
API Gateway / FastAPI App
  |
  |-- Auth Service
  |-- User and Role Service
  |-- Beekeeper Service
  |-- Apiary and Hive Service
  |-- Device Provisioning Service
  |-- IoT Ingestion Service
  |-- AI Analytics Service
  |-- Alert Service
  |-- Harvest and Batch Service
  |-- Lab Service
  |-- Processing Service
  |-- Packaging Service
  |-- Supply Chain / Custody Service
  |-- Consumer Verification Service
  |-- KVIC Analytics Service
  |-- Blockchain Service
  |-- Notification Service
  |-- Audit Log Service
```

### 19.2 API Principles

- REST APIs for app and dashboard operations.
- MQTT for device telemetry.
- WebSockets or server-sent events for live dashboards if needed.
- Idempotency keys for critical writes.
- Versioned APIs using `/api/v1`.
- Cursor pagination for lists.
- Strict RBAC checks per endpoint.
- Audit log for every sensitive write.

### 19.3 API Endpoint Map

Auth:

```text
POST /api/v1/auth/login
POST /api/v1/auth/otp/request
POST /api/v1/auth/otp/verify
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

Users and roles:

```text
GET  /api/v1/users/me
GET  /api/v1/roles
POST /api/v1/admin/users
PATCH /api/v1/admin/users/{userId}/role
```

Beekeeper:

```text
POST /api/v1/beekeepers
GET  /api/v1/beekeepers/{beekeeperId}
PATCH /api/v1/beekeepers/{beekeeperId}
GET  /api/v1/beekeepers/{beekeeperId}/batches
```

Apiary and hive:

```text
POST /api/v1/apiaries
GET  /api/v1/apiaries
POST /api/v1/hives
GET  /api/v1/hives/{hiveId}
GET  /api/v1/hives/{hiveId}/telemetry/latest
GET  /api/v1/hives/{hiveId}/telemetry/history
GET  /api/v1/hives/{hiveId}/health
```

Device:

```text
POST /api/v1/devices/provision
POST /api/v1/devices/{deviceId}/pair
GET  /api/v1/devices/{deviceId}/status
POST /api/v1/devices/{deviceId}/heartbeat
```

Alerts:

```text
GET  /api/v1/alerts
GET  /api/v1/alerts/{alertId}
POST /api/v1/alerts/{alertId}/acknowledge
POST /api/v1/alerts/{alertId}/resolve
```

Harvest and batch:

```text
POST /api/v1/harvests
GET  /api/v1/batches/{batchId}
GET  /api/v1/batches/{batchId}/barcode
GET  /api/v1/batches/{batchId}/timeline
PATCH /api/v1/batches/{batchId}/status
```

Factory:

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

Consumer verification:

```text
GET  /api/v1/verify/{token}
POST /api/v1/verify/{token}/scan-event
POST /api/v1/verify/{token}/report-issue
```

KVIC:

```text
GET /api/v1/kvic/overview
GET /api/v1/kvic/map
GET /api/v1/kvic/clusters
GET /api/v1/kvic/production
GET /api/v1/kvic/hive-health
GET /api/v1/kvic/disease-risk
GET /api/v1/kvic/batches
GET /api/v1/kvic/fraud-alerts
GET /api/v1/kvic/reports/export
```

Blockchain:

```text
POST /api/v1/blockchain/events/harvest
POST /api/v1/blockchain/events/lab
POST /api/v1/blockchain/events/custody
GET  /api/v1/blockchain/batches/{batchId}
GET  /api/v1/blockchain/transactions/{transactionHash}
```

---

## 20. Data Model

### 20.1 Core Tables

User:

```text
id
name
phone
email
password_hash / auth_provider_id
role_id
organization_id
jurisdiction
status
created_at
updated_at
```

Role:

```text
id
name
permissions
scope
created_at
```

Beekeeper:

```text
id
user_id
kvic_registration_number
name
phone
district
state
address_summary
verification_status
created_at
updated_at
```

Apiary:

```text
id
beekeeper_id
cluster_id
name
district
state
latitude
longitude
floral_zone
created_at
updated_at
```

Hive:

```text
id
apiary_id
hive_code
device_id
hive_type
install_date
status
last_seen_at
created_at
updated_at
```

Device:

```text
id
device_code
hive_id
firmware_version
connectivity_type
public_key
status
battery_pct
last_seen_at
created_at
updated_at
```

SensorReading:

```text
id
device_id
hive_id
timestamp
temperature_c
humidity_pct
weight_kg
co2_ppm
bee_entries
bee_exits
sound_rms
vibration_score
battery_pct
payload_signature
ingested_at
```

HiveHealthSnapshot:

```text
id
hive_id
timestamp
health_score
stress_score
swarming_risk
disease_risk
yield_prediction_kg
model_version
explanation
created_at
```

Alert:

```text
id
hive_id
alert_type
severity
title
description
recommended_action
status
acknowledged_by
resolved_by
created_at
resolved_at
```

Harvest:

```text
id
hive_id
beekeeper_id
batch_id
quantity_kg
floral_source
harvest_date
latitude
longitude
notes
photo_url
created_at
```

HoneyBatch:

```text
id
batch_code
beekeeper_id
hive_id
harvest_id
declared_quantity_kg
current_quantity_kg
status
barcode_value
blockchain_tx_hash
created_at
updated_at
```

LabTest:

```text
id
batch_id
lab_id
moisture_pct
purity_status
adulteration_status
sugar_profile_status
acidity
pollen_result
overall_status
report_url
report_hash
blockchain_tx_hash
tested_by
tested_at
```

ProcessingRecord:

```text
id
batch_id
facility_id
input_quantity_kg
output_quantity_kg
process_steps
operator_id
started_at
completed_at
blockchain_tx_hash
```

Bottle:

```text
id
bottle_code
batch_id
carton_id
bottle_size_g
qr_token_hash
qr_status
packaged_at
created_at
```

Carton:

```text
id
carton_code
batch_id
barcode_value
bottle_count
status
created_at
```

Shipment:

```text
id
shipment_code
from_org_id
to_org_id
vehicle_number
driver_contact
status
created_at
dispatched_at
received_at
```

CustodyEvent:

```text
id
asset_type
asset_id
from_org_id
to_org_id
event_type
performed_by
timestamp
blockchain_tx_hash
```

VerificationScan:

```text
id
bottle_id
token_hash
ip_hash
approx_location
user_agent
scan_result
suspicion_score
created_at
```

AuditLog:

```text
id
actor_user_id
action
entity_type
entity_id
old_value_hash
new_value_hash
ip_hash
created_at
```

---

## 21. Roles and Permissions

| Role | Main Access | Restrictions |
|---|---|---|
| Beekeeper | Own hives, alerts, harvests, batches | Cannot edit lab/factory records |
| Collection Staff | Accept/reject incoming batches | Cannot approve lab result |
| Lab Staff | Enter lab results and upload reports | Cannot package or dispatch |
| Processing Staff | Record processing steps | Cannot change lab result |
| Packaging Staff | Generate bottle QR and carton barcodes | Cannot accept rejected batch |
| Dispatch Staff | Create shipment and transfer custody | Cannot edit prior stages |
| Factory Supervisor | Review exceptions and approve overrides | Scoped to assigned facility |
| KVIC Cluster Officer | View assigned cluster | Cannot access national admin settings |
| KVIC District Officer | View district data | Cannot modify factory operations unless permitted |
| KVIC State Officer | View state data and reports | Restricted to state jurisdiction |
| KVIC National Admin | Full monitoring and policy configuration | Sensitive actions require audit/MFA |
| System Admin | Platform configuration | No business data edits unless break-glass logged |
| Consumer | Public verification only | No internal access |

Permission categories:

- `hive.read`
- `hive.write`
- `device.pair`
- `telemetry.read`
- `alert.manage`
- `harvest.create`
- `batch.read`
- `batch.stage.update`
- `lab.write`
- `packaging.generate`
- `shipment.create`
- `kvic.analytics.read`
- `user.manage`
- `role.manage`
- `audit.read`

---

## 22. Offline Handling

### 22.1 Beekeeper App

Offline-supported actions:

- View last synced hive data.
- Draft harvest record.
- Add inspection notes.
- Queue alert resolution.
- View cached batch status.

Sync behavior:

- Store pending actions locally using SQLite or similar mobile storage.
- Assign local temporary IDs.
- Sync with idempotency keys when network returns.
- Show sync status clearly.
- Resolve conflicts by server authority for final batch state.

### 22.2 Factory App

Offline-supported actions:

- Scan labels and cache scan attempt.
- Prepare collection/lab/processing drafts.
- Queue photos or attachments.
- View cached assigned batches.

Restricted offline actions:

- Final acceptance of unknown batch should require online verification.
- QR generation should require online server confirmation.
- Blockchain-backed stage changes should remain pending until confirmed.

### 22.3 Device Offline Handling

- ESP32 buffers readings locally when network is unavailable.
- Device sends backfilled readings with original timestamps.
- Backend marks device offline if no heartbeat is received within threshold.
- AI treats missing telemetry as low-confidence instead of normal status.

---

## 23. Notifications

### 23.1 Notification Channels

- Push notification via FCM/Expo.
- In-app notification center.
- SMS or WhatsApp optional for critical rural alerts.
- Email for reports and admin summaries.

### 23.2 Notification Types

Beekeeper:

- Hive health alert
- Device offline
- Battery low
- High temperature or humidity
- Sudden weight drop
- Swarming risk
- Batch collected
- Lab approved/rejected
- Batch packaged/dispatched

Factory:

- Incoming batch assigned
- Lab test pending
- Rejected batch review
- Processing delay
- Dispatch ready

KVIC:

- Disease-risk hotspot
- High device offline rate
- Suspicious QR scan pattern
- High lab rejection rate
- Cluster production anomaly

Consumer:

- No push required for MVP.
- Optional issue report confirmation.

---

## 24. Security Requirements

### 24.1 Authentication

- OTP or passwordless mobile login for beekeepers.
- Employee login with MFA for factory and KVIC users.
- JWT access tokens with refresh tokens.
- Secure token storage on mobile using Expo SecureStore.
- Session expiration and device logout.

### 24.2 Authorization

- Role-based access control.
- Jurisdiction-based access for KVIC.
- Organization-based access for factories/labs.
- Server-side permission checks on every protected endpoint.

### 24.3 Device Security

- Device provisioning with unique Device ID.
- Device key pair or shared secret per device.
- Signed telemetry payloads.
- Reject telemetry from unpaired devices.
- Firmware version tracking.
- OTA update signing in future scope.

### 24.4 Data Security

- TLS for all app/API/MQTT traffic.
- Encryption at rest for sensitive data.
- Hash or mask consumer scan IPs.
- Do not expose exact private beekeeper locations publicly.
- Lab certificates stored in object storage/IPFS with hash verification.
- Audit logs for sensitive operations.

### 24.5 QR and Barcode Security

- Public QR should use signed token, not only predictable ID.
- Token can be revoked if label is compromised.
- Repeated abnormal scans should raise fraud signal.
- Factory barcode actions require authenticated users.

---

## 25. Analytics and Reporting

### 25.1 Beekeeper Analytics

- Hive health trend
- Honey yield trend
- Alert frequency
- Action completion rate
- Harvest quantity by season
- Batch approval history

### 25.2 Factory Analytics

- Incoming batch volume
- Collection acceptance/rejection rate
- Lab turnaround time
- Processing yield loss
- Packaging output
- Dispatch turnaround
- Stage bottlenecks

### 25.3 Consumer Analytics

- QR scan count
- Scan location heatmap, approximate only
- Authentic vs invalid scans
- Repeated scan anomaly
- Issue reports

### 25.4 KVIC Analytics

- Production by state/district/cluster
- Hive health distribution
- Device uptime
- Disease-risk hotspots
- Lab rejection hotspots
- Counterfeit suspicion areas
- Market demand signals
- Beekeeper performance support indicators

---

## 26. KPIs

### 26.1 Product KPIs

- Number of registered beekeepers
- Number of active hives
- Percentage of active IoT devices
- Number of harvest batches created
- Percentage of batches with complete traceability
- Number of consumer QR scans
- QR verification success rate
- Suspected counterfeit incidents detected

### 26.2 Operational KPIs

- Average collection turnaround time
- Average lab testing time
- Average processing time
- Packaging output per day
- Dispatch accuracy
- Batch rejection rate
- Device offline rate

### 26.3 Impact KPIs

- Increase in verified honey sales
- Beekeeper income improvement
- Reduction in unresolved hive alerts
- Improvement in colony health score
- Reduction in counterfeit complaints
- Cluster-level production growth

---

## 27. Soft UI with Matte Finish Design System

### 27.1 Design Direction

The Honey Chain UI should feel soft, trustworthy, rural-friendly, and premium without becoming flashy. The matte finish should create low-glare surfaces, calm contrast, and subtle depth.

Design keywords:

- Soft
- Matte
- Trustworthy
- Clean
- Warm
- Field-friendly
- Data-readable
- Premium but not luxury-heavy

### 27.2 Visual Principles

- Use low-glare surfaces instead of glossy gradients.
- Use soft shadows and subtle borders.
- Keep card radius at 8px for a mature product feel.
- Avoid heavy glassmorphism.
- Avoid overly decorative marketing layouts in operational screens.
- Use icon-first controls where actions are frequent.
- Use clear color states for health, warning, danger, verified, and offline.
- Keep dashboards dense but readable.

### 27.3 Color Palette

| Token | Color | Use |
|---|---|---|
| `background.base` | `#F6F4EE` | App background |
| `surface.matte` | `#FFFCF5` | Cards and panels |
| `surface.raised` | `#FFFFFF` | Important panels |
| `text.primary` | `#252A2E` | Main text |
| `text.secondary` | `#66706A` | Supporting text |
| `brand.honey` | `#D99A21` | Primary brand accent |
| `brand.amber` | `#F2B84B` | Charts and highlights |
| `brand.sage` | `#6E8F72` | Healthy/verified state |
| `brand.leaf` | `#2F6F52` | Strong success |
| `state.warning` | `#C97925` | Warning |
| `state.danger` | `#B94A48` | Critical |
| `state.info` | `#4C7EA8` | Info |
| `border.soft` | `#E5DED0` | Matte borders |
| `shadow.soft` | `rgba(37, 42, 46, 0.10)` | Soft shadow |

### 27.4 Typography

- Primary font: Inter or system font.
- Optional Indian language support: Noto Sans Devanagari.
- Use clear numeric typography for sensor values.
- Avoid overly large hero text inside dashboards.
- Use short labels for field users.

### 27.5 Component Style

Buttons:

- Primary: matte honey fill, dark text or white text depending contrast.
- Secondary: raised surface with soft border.
- Destructive: muted red, not neon.
- Icon buttons for scan, filter, refresh, download, map, and settings.

Cards:

- 8px border radius.
- Matte surface.
- Thin border.
- Soft shadow only on high-priority panels.

Charts:

- Use honey, sage, blue, and muted red for series.
- Always show units.
- Do not depend on color alone for critical states.

Badges:

- Verified
- Pending
- Rejected
- Offline
- Critical
- In Transit
- Lab Approved

Forms:

- Large tap targets for mobile.
- Clear validation messages.
- Auto-filled GPS/date fields should be editable only with permission.

### 27.6 App-Specific UI

Beekeeper App:

- Mobile-first, large action buttons.
- Home dashboard with hive status and alerts.
- Use bottom tabs.
- Keep "Start Harvest" and "View Alerts" easily reachable.

Factory App:

- Scanner-first design.
- Large scan button.
- Role-specific operation screens.
- Strong valid/invalid scan feedback.
- Offline sync indicator always visible.

Consumer Web:

- First screen must show authenticity status.
- No login wall.
- Use a simple timeline.
- Keep blockchain details collapsible for non-technical consumers.

KVIC Dashboard:

- Desktop-first dense layout.
- Left navigation.
- Filters across top.
- Map, table, and chart views.
- Export buttons for reports.

---

## 28. Deployment and Environments

### 28.1 Environments

- Local development
- Staging
- Pilot cluster
- Production

### 28.2 Deployment Architecture

```text
Mobile Apps
  |
  |-- Expo builds / app stores / APK pilot distribution

Next.js Apps
  |
  |-- Vercel / cloud hosting / container hosting

FastAPI Backend
  |
  |-- Docker containers
  |-- Kubernetes or managed container service

Databases
  |
  |-- PostgreSQL
  |-- TimescaleDB
  |-- Redis

IoT
  |
  |-- MQTT broker
  |-- Device gateway services

Storage
  |
  |-- S3-compatible object storage
  |-- IPFS optional for certificates

Blockchain
  |
  |-- EVM testnet for prototype
  |-- Hyperledger Fabric for production
```

### 28.3 CI/CD

- GitHub Actions or equivalent CI.
- Automated linting and tests.
- Migration checks for database changes.
- Mobile preview builds.
- Staging deployment on merge.
- Production deployment through manual approval.
- Smart contract deployment scripts with network-specific configs.

---

## 29. Scalability Requirements

### 29.1 Scale Targets

MVP:

- 5-20 hives
- 5-10 beekeepers
- 1 collection/factory workflow
- 100-500 bottles
- 1,000 consumer verification scans

Pilot:

- 500-5,000 hives
- 100-1,000 beekeepers
- Multiple collection centers
- Multiple factories/labs
- 100,000+ bottle QR records

Production:

- Multi-state KVIC deployment
- Millions of sensor readings per day
- Millions of bottle QR records
- National analytics dashboard

### 29.2 Scaling Design

- Use TimescaleDB hypertables for telemetry.
- Partition data by time and cluster.
- Use queues for AI processing and blockchain writes.
- Cache consumer verification responses.
- Use CDN for public QR pages.
- Use async workers for report generation.
- Use organization and jurisdiction scoping in queries.
- Archive old telemetry into cheaper storage.

---

## 30. MVP Scope

### 30.1 MVP Must Have

- Beekeeper registration and login.
- Apiary and hive registration.
- ESP32 prototype telemetry ingestion.
- Dashboard with latest hive readings.
- Basic rule-based health alerts.
- Harvest creation and Batch ID generation.
- Batch barcode generation.
- Factory scan and collection acceptance.
- Lab result entry and certificate hash.
- Processing and packaging stage updates.
- Bottle QR generation.
- Consumer QR verification page.
- Blockchain event for harvest, lab, packaging, and custody.
- KVIC dashboard overview.
- Role-based access.
- Audit logs for critical actions.
- Offline draft/queue behavior for mobile apps.

### 30.2 MVP Nice to Have

- Push notifications.
- Disease-risk map.
- Carton barcode shipment tracking.
- AI yield prediction.
- Lab report PDF generation.
- Suspicious QR scan detection.
- Multilingual labels.

### 30.3 Future Scope

- Production-grade device fleet management.
- OTA firmware updates.
- Solar-powered hive kits.
- Advanced acoustic AI.
- Computer vision pest detection.
- Integration with official certification systems.
- Farmer marketplace and order management.
- Payments and settlement.
- Insurance/credit scoring based on verified production.
- Full Hyperledger Fabric consortium network.
- Advanced fraud intelligence.
- Public product storytelling pages.
- Voice assistant for beekeepers.
- Offline-first cluster gateway.

---

## 31. Acceptance Criteria

### 31.1 End-to-End Acceptance

- A beekeeper can register a hive and pair a device.
- The device can send telemetry to the backend.
- The beekeeper app can show hive readings and alerts.
- The beekeeper can create a harvest batch.
- The system generates a batch barcode.
- Factory app can scan the barcode and validate the batch.
- Lab staff can enter results and upload a report.
- The system stores the report hash on blockchain.
- Packaging creates Bottle IDs and QR codes.
- Consumer can scan QR and see authenticity result.
- KVIC dashboard shows the batch and related metrics.

### 31.2 Reliability Acceptance

- Duplicate critical writes do not create duplicate blockchain events.
- Offline mobile actions sync correctly.
- Failed blockchain writes are retried.
- Device offline status is detected.
- Consumer verification remains fast through caching.

### 31.3 Security Acceptance

- Users see only permitted data.
- Factory and KVIC sensitive actions require authenticated users.
- Public QR endpoint does not leak private data.
- Audit logs record all critical changes.
- Device telemetry is accepted only from provisioned devices.

### 31.4 UI Acceptance

- UI follows Soft UI matte design tokens.
- Mobile screens are usable with one hand.
- Factory scan flow is reachable in one tap from dashboard.
- Consumer page shows authenticity status above the fold.
- KVIC dashboard supports filtering by geography and date.

---

## 32. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Rural connectivity gaps | Data loss or delayed sync | Offline queues, device buffering, LoRa/GSM options |
| Sensor failure or drift | Wrong health alerts | Calibration, sensor health checks, manual validation |
| Overclaiming disease AI | Loss of trust | Label MVP as risk estimation; validate datasets before diagnosis |
| QR copying | Counterfeit pages or copied labels | Signed tokens, scan anomaly detection, revocation |
| Blockchain cost/latency | Slow operations | Store only hashes/events; async writes; permissioned chain for production |
| User adoption challenges | Low usage | Simple UX, local language support, training mode |
| Data privacy issues | Trust/legal risk | Mask public data, encrypt sensitive records, RBAC |
| Factory process mismatch | Operational friction | Pilot with real factory workflow before scaling |
| Hardware not field-ready | Deployment failure | Separate prototype from rugged production design |
| Lab certificate fraud | Traceability weakness | Hash reports, audit uploads, approved lab identities |

---

## 33. Missing Decisions and Assumptions to Confirm

### 33.1 Product Decisions

- Confirm whether Honey Chain will be built first as an SIH/demo prototype, pilot product, or production-ready platform.
- Confirm primary language support: English only, Hindi + English, or regional language support.
- Confirm whether marketplace and payment features are part of MVP or future scope.
- Confirm whether consumers should see beekeeper name or only cluster/origin details.
- Confirm whether issue reporting by consumers should be anonymous.

### 33.2 Technical Decisions

- Confirm blockchain choice for MVP: Polygon/EVM testnet or Hyperledger Fabric prototype.
- Confirm production blockchain preference: permissioned Hyperledger Fabric is recommended for institutional deployment.
- Confirm cloud provider: AWS, Azure, GCP, DigitalOcean, or local institutional hosting.
- Confirm maps provider and geolocation privacy policy.
- Confirm whether IPFS is mandatory or whether S3-compatible storage plus hashes is acceptable.

### 33.3 IoT Decisions

- Confirm connectivity approach by region: Wi-Fi, LoRa, GSM, or hybrid.
- Confirm prototype sensor set versus production sensor set.
- Confirm battery/solar requirement.
- Confirm telemetry frequency, for example every 1, 5, 15, or 30 minutes.
- Confirm whether camera monitoring is required in MVP.
- Confirm device maintenance responsibility.

### 33.4 AI Decisions

- Confirm whether MVP AI should be rule-based or trained on real datasets.
- Confirm accepted model output labels, such as Healthy, Stress, Swarming Risk, Disease Risk, Varroa Risk, Low Productivity.
- Confirm whether disease output should be shown as "risk" instead of "diagnosis".
- Confirm dataset licenses before model training.
- Confirm who verifies ground-truth labels.

### 33.5 Factory and Supply Chain Decisions

- Confirm exact factory stages: collection, lab, processing, packaging, dispatch, distributor, retailer.
- Confirm lab test parameters required by the target certification process.
- Confirm barcode printing hardware.
- Confirm whether cartons, bottles, or both need individual tracking.
- Confirm whether distributor/retailer users will have their own portal/app in future.

### 33.6 Governance Decisions

- Confirm KVIC role hierarchy and jurisdiction rules.
- Confirm who can approve beekeeper registration.
- Confirm who can revoke a batch or QR token.
- Confirm audit-log retention period.
- Confirm data retention policy for sensor data, reports, and scan logs.

---

## 34. Recommended Build Plan

### Phase 1: Prototype Foundation

- Build backend core services.
- Build Beekeeper app onboarding, hives, telemetry, alerts, harvest.
- Build IoT simulation and one ESP32 prototype.
- Build basic AI/rule engine.
- Build batch barcode generation.
- Build simple blockchain smart contract.

### Phase 2: Factory Workflow

- Build Factory app login and scan flow.
- Add collection, lab, processing, packaging, and dispatch.
- Add lab report hash storage.
- Add Bottle ID and QR generation.
- Add carton barcode support.

### Phase 3: Consumer and KVIC

- Build public QR verification page.
- Build KVIC overview dashboard.
- Add maps, charts, filters, and exports.
- Add fraud and invalid scan analytics.

### Phase 4: Pilot Hardening

- Add offline sync.
- Add push/SMS alerts.
- Improve device provisioning and security.
- Add role/jurisdiction enforcement.
- Add report generation.
- Add pilot monitoring and operational dashboards.

### Phase 5: Scale

- Move to production-grade hardware.
- Add Hyperledger Fabric if required.
- Add advanced AI models.
- Add multi-cluster deployment.
- Add marketplace and financial features.

---

## 35. Final Product Summary

Honey Chain should be positioned as:

```text
A blockchain-backed honey traceability and smart beekeeping platform that helps rural beekeepers monitor hive health, create verified honey batches, track supply-chain movement, and give consumers instant QR-based proof of authenticity.
```

The strongest technical story is:

```text
IoT tells us what is happening in the hive.
AI explains what it means and what action to take.
Barcode tracks the product during factory and logistics operations.
QR lets consumers verify authenticity instantly.
Blockchain protects the most important trust records from tampering.
KVIC dashboard turns all of this into cluster-level governance and impact analytics.
```
