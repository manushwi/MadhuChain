# Honey Chain Decisions to Approve

Version: 1.0  
Date: 29 August 2026  
Purpose: List the missing decisions that should be approved before development starts.

---

## 1. Highest Priority Approvals

Approve these first.

| No. | Decision | Recommended Approval | Why |
|---|---|---|---|
| 1 | IoT structure | One cellular master gateway + multiple low-cost ESP32 hive nodes | Reduces cost and SIM usage |
| 2 | Local communication | ESP-NOW for demo, LoRa SX1276/RFM95 for rural pilot | Balances cost and range |
| 3 | Essential hive sensors | SHT31-D + Load Cell/HX711 + 2 IR break beams + battery monitor | Enough for MVP health/yield/activity |
| 4 | Gateway modules | ESP32 + SIM7600 + BME280 + NEO-6M + storage | One shared internet/weather/location point |
| 5 | AI claim | Use "risk estimation", not "confirmed diagnosis" | Avoids overclaiming before validated labels |
| 6 | Blockchain MVP | Polygon/EVM testnet | Fastest prototype path |
| 7 | Production chain | Permissioned chain later, preferably Hyperledger Fabric if KVIC requires it | Better for institutional network |
| 8 | QR security | Signed QR token, not only Bottle ID | Reduces fake/copy risk |
| 9 | Consumer access | No login for basic verification | Best user experience |
| 10 | UI style | Soft UI with matte finish | Matches your preference |

---

## 2. IoT Decisions

### 2.1 Number of Hive Nodes

Recommended MVP:

```text
3 hive nodes + 1 master gateway
```

Need approval:

```text
Approve 3 hive nodes for first working demo?
```

### 2.2 Communication Type

Options:

| Option | Best For | Recommendation |
|---|---|---|
| ESP-NOW | Low-cost demo | Approve for first prototype |
| LoRa SX1276/RFM95 | Rural pilot | Approve after demo |
| RS485 | Fixed wired hive setup | Use only if wiring is practical |

Need approval:

```text
Should the first prototype use ESP-NOW or LoRa?
```

### 2.3 Sensor Set

Recommended essential sensors:

```text
SHT31-D
Load Cell 50kg/100kg + HX711
2 x IR Break Beam Sensor 3mm / 5mm
Battery voltage monitor
```

Optional sensors:

```text
INMP441 microphone
MPU6050 vibration
MH-Z19B CO2
ESP32-CAM OV2640
```

Need approval:

```text
Should MVP include microphone and CO2, or keep only essential sensors?
```

### 2.4 Telemetry Frequency

Recommended:

```text
Temperature/humidity: every 5 minutes
Weight: every 15 minutes
Activity count: report every 5 minutes
Battery: every 30 minutes
```

Need approval:

```text
Approve this telemetry frequency for MVP?
```

---

## 3. AI/ML Decisions

### 3.1 MVP AI Type

Recommended:

```text
Rule-based alerts + baseline anomaly detection + simple yield estimation
```

Why:

- Easier to build.
- Easier to explain.
- Does not require full labeled disease dataset on day one.

Need approval:

```text
Approve rule-based AI first, trained ML later?
```

### 3.2 AI Output Labels

Recommended labels:

```text
Healthy
Watch
At Risk
Critical
Swarming Risk
Disease/Pest Risk
Queen-loss Risk
Low Productivity
Device Issue
```

Need approval:

```text
Approve these AI status labels?
```

### 3.3 Disease Detection Language

Recommended:

```text
Use "Disease/Pest Risk" and "Needs Inspection".
Do not say "Disease Confirmed" in MVP.
```

Need approval:

```text
Approve risk-based disease language?
```

---

## 4. Backend Decisions

### 4.1 Backend Stack

Recommended:

```text
FastAPI
PostgreSQL
TimescaleDB
Redis
S3-compatible storage or IPFS
```

Need approval:

```text
Approve this backend stack?
```

### 4.2 API Style

Recommended:

```text
REST APIs for apps
MQTT or HTTPS bulk upload for gateway
WebSocket later only for live dashboard
```

Need approval:

```text
Should gateway upload use HTTPS first or MQTT first?
```

### 4.3 Offline Sync

Recommended:

```text
Beekeeper app: offline drafts and alert notes
Factory app: offline scan drafts, final verification online
Gateway: local queue and retry
```

Need approval:

```text
Approve offline-first behavior for mobile and gateway?
```

---

## 5. Blockchain Decisions

### 5.1 MVP Blockchain

Recommended:

```text
Polygon/EVM testnet
Solidity
Hardhat
ethers.js
```

Need approval:

```text
Approve EVM testnet for MVP demo?
```

### 5.2 On-Chain Data

Recommended on-chain:

```text
Batch created
Harvest hash
Collection event
Lab certificate hash
Processing event
Packaging event
Custody transfer
Revocation/fraud flag
```

Recommended off-chain:

```text
Raw sensor data
Lab PDF
Images/audio
Private user data
Full operational logs
```

Need approval:

```text
Approve this on-chain/off-chain boundary?
```

---

## 6. Supply Chain Decisions

### 6.1 Tracking Level

Options:

| Option | Meaning | Recommendation |
|---|---|---|
| Batch only | Track one honey batch | Good for first demo |
| Batch + Bottle | Consumer-level QR | Required for real product |
| Batch + Bottle + Carton | Full factory/logistics tracking | Best for pilot |

Recommended:

```text
MVP: Batch + Bottle
Pilot: Batch + Bottle + Carton
```

Need approval:

```text
Approve Batch + Bottle for MVP?
```

### 6.2 Factory Stages

Recommended:

```text
Collection
Lab Testing
Processing
Packaging
Dispatch
Distributor/Retailer later
```

Need approval:

```text
Approve these factory stages?
```

### 6.3 Lab Parameters

Recommended MVP lab fields:

```text
Moisture %
Purity status
Adulteration status
Sugar profile status
Acidity
Pollen/floral source verification
Overall pass/fail
Lab report upload
```

Need approval:

```text
Approve these lab parameters for MVP?
```

---

## 7. UI Decisions

### 7.1 App Split

Recommended:

```text
Beekeeper -> React Native + Expo
Factory -> React Native + Expo
Consumer -> Next.js
KVIC -> Next.js
```

Need approval:

```text
Approve this frontend split?
```

### 7.2 Language

Options:

```text
English only
English + Hindi
English + Hindi + regional languages later
```

Recommended:

```text
English + Hindi for MVP
Regional languages later
```

Need approval:

```text
Approve English + Hindi for MVP?
```

### 7.3 Consumer Page Privacy

Recommended show:

```text
Origin district/cluster
Harvest date
Floral source
Lab status
Processing center
Batch timeline
Blockchain verification
```

Recommended hide:

```text
Exact hive location
Beekeeper phone number
Internal employee IDs
Private address
```

Need approval:

```text
Approve this consumer privacy boundary?
```

---

## 8. Hosting and Deployment Decisions

Recommended MVP:

```text
Backend: Docker + FastAPI
Database: PostgreSQL + TimescaleDB
Frontend web: Vercel or container hosting
Mobile: Expo APK builds
Blockchain: EVM testnet
Storage: S3-compatible storage
```

Need approval:

```text
Which hosting should we use: local demo, AWS, Azure, GCP, DigitalOcean, or Vercel + managed database?
```

---

## 9. My Recommended Approval Set

If you want the fastest strong prototype, approve this:

```text
1. Use one cellular gateway + multiple ESP32 hive nodes.
2. Use ESP-NOW for first demo, LoRa for pilot.
3. Use essential sensors first: SHT31-D, HX711 load cell, IR break beams, battery monitor.
4. Keep microphone, CO2, and camera as optional/future modules.
5. Use rule-based AI + baseline anomaly detection first.
6. Show disease/pest as risk estimation, not confirmed diagnosis.
7. Use FastAPI + PostgreSQL + TimescaleDB + Redis.
8. Use Polygon/EVM testnet for MVP blockchain.
9. Store only critical hashes/events on blockchain.
10. Build Beekeeper and Factory in React Native, Consumer and KVIC in Next.js.
11. Use signed QR tokens for consumer verification.
12. Use Soft UI matte finish across all apps.
```

---

## 10. Short Approval Message You Can Send

```text
Approved:
Use one cellular master gateway with multiple ESP32 hive nodes.
Use ESP-NOW for first demo and LoRa for rural pilot.
Use essential sensors first: SHT31-D, HX711 load cell, 2 IR break beams, battery monitor.
Use rule-based AI and baseline anomaly detection first.
Use FastAPI, PostgreSQL, TimescaleDB, Redis.
Use Polygon/EVM testnet for MVP blockchain.
Use signed QR tokens.
Use React Native for Beekeeper/Factory and Next.js for Consumer/KVIC.
Keep disease output as risk estimation, not diagnosis.
```

