# Honey Chain IoT Device Structure and Connection Plan

Version: 1.0  
Date: 29 August 2026  
Purpose: Complete cost-optimized IoT architecture for Honey Chain using one cellular master gateway and multiple low-cost ESP32 hive nodes.

---

## 1. Recommended Direction

Use a master/gateway plus hive-node architecture.

```text
Hive Node 1  \
Hive Node 2   \
Hive Node 3    -> Local Wireless/Wired Link -> Master Gateway -> 4G Cellular -> Cloud Backend
Hive Node 4   /
Hive Node 5  /
```

This reduces cost because every hive does not need a SIM card, cellular module, GPS, weather sensor, and high-power internet setup.

Recommended default:

```text
Each hive:
ESP32 + essential sensors + local radio

One apiary/cluster:
ESP32 gateway + local radio receiver + SIM7600 cellular + GPS + weather + storage
```

---

## 2. Why This Reduces Cost

| Item | Every-Hive Cellular Design | Master Gateway Design |
|---|---|---|
| SIM cards | One per hive | One per apiary/cluster |
| Cellular modules | One per hive | One gateway only |
| GPS modules | One per hive | One gateway/apiary GPS |
| Weather sensor | Repeated on every hive | Shared at gateway |
| Power use | High on every hive | High only at gateway |
| Maintenance | Many cellular units | One cellular gateway |
| Best use | Premium deployment | Cost-optimized rural deployment |

Best Honey Chain architecture:

```text
Low-cost hive nodes collect hive-specific data.
Gateway collects all hive data.
Gateway sends one combined upload to cloud.
```

---

## 3. Communication Options

### 3.1 Option A: ESP-NOW

Use for:

- SIH/demo prototype.
- Low-cost apiary test.
- Short range.
- No extra radio module.

Pros:

- Cheapest.
- Works directly between ESP32 devices.
- Low power.
- Good for prototype.

Cons:

- Shorter range than LoRa.
- More sensitive to obstacles and placement.
- Not ideal for large rural clusters.

Recommended for:

```text
1 gateway + 3 to 5 hive nodes demo
```

### 3.2 Option B: LoRa SX1276 / RFM95

Use for:

- Rural pilot.
- Longer range.
- Outdoor apiary clusters.
- Better reliability than ESP-NOW across distance.

Pros:

- Long range.
- Low power.
- Good for rural beekeeping clusters.
- Better if hives are spread out.

Cons:

- Each hive node needs a LoRa module.
- Slightly higher cost than ESP-NOW.
- Lower data rate, so keep payload compact.

Recommended for:

```text
1 gateway + 5 to 50 hive nodes pilot
```

### 3.3 Option C: RS485 Wired Bus

Use for:

- Hives placed very close together.
- Permanent installation where cabling is safe.
- Higher noise-resistance than loose sensor wires.

Pros:

- Stable.
- Good for fixed installations.
- Less wireless interference.

Cons:

- Wiring is harder in rural outdoor conditions.
- Cable damage and maintenance risk.
- Not flexible when hives move.

Recommended only if:

```text
Hives are fixed in one protected layout.
```

---

## 4. Final Recommended Architecture

For Honey Chain, choose this:

```text
MVP Demo:
ESP32 hive nodes -> ESP-NOW -> ESP32 + SIM7600 gateway -> Backend

Rural Pilot:
ESP32 hive nodes + LoRa -> LoRa gateway + SIM7600 -> Backend

Production:
Rugged hive nodes + LoRa/GSM fallback -> solar gateway -> Backend
```

---

## 5. Device Types

## 5.1 Hive Slave Node

One hive node is installed per hive.

Main job:

- Read hive-specific sensors.
- Calculate simple local checks.
- Store reading temporarily if gateway is unavailable.
- Send packet to master gateway.

Recommended minimum hardware:

| Purpose | Module |
|---|---|
| Microcontroller | ESP32 DevKit V1 |
| Temperature/humidity | SHT31-D |
| Weight | Load Cell 50kg/100kg + HX711 |
| Bee entry/exit | 2 x IR Break Beam Sensor 3mm / 5mm |
| Battery reading | Voltage divider to ESP32 ADC |
| Local communication demo | ESP-NOW |
| Local communication pilot | SX1276 / RFM95 LoRa module |

Optional hive-node sensors:

| Purpose | Module |
|---|---|
| Sound/acoustic pattern | INMP441 I2S microphone |
| Vibration/disturbance | MPU6050 or SW-420 |
| CO2 | MH-Z19B |
| Light/opening detection | BH1750 or LDR |

MVP essential node:

```text
ESP32 DevKit V1
SHT31-D
Load Cell 50kg/100kg + HX711
2 x IR Break Beam Sensors
Battery monitor
ESP-NOW or LoRa
```

## 5.2 Master Gateway

One gateway serves one apiary or small cluster.

Main job:

- Receive data from hive nodes.
- Add gateway timestamp, apiary ID, GPS, and weather context.
- Buffer data during network failure.
- Send data to backend using cellular internet.
- Report gateway health and signal strength.

Recommended hardware:

| Purpose | Module |
|---|---|
| Controller | ESP32 DevKit V1 or ESP32-S3 DevKit |
| Cellular connectivity | SIM7600X 4G LTE module/breakout |
| Local receiver | ESP-NOW or SX1276 / RFM95 LoRa |
| GPS | NEO-6M GPS |
| Weather | BME280 |
| Offline buffer | microSD card module |
| Real-time clock | DS3231 RTC module, optional |
| Power | Solar panel + battery + charge controller + buck regulator |
| Enclosure | IP65 weatherproof box with cable glands |

---

## 6. Complete System Structure

```text
Hive 1
  ESP32 Node
  SHT31-D
  HX711 + Load Cell
  IR Beam A/B
  Battery monitor
  LoRa/ESP-NOW
      |
      v
Hive 2
  Same node structure
      |
      v
Hive 3
  Same node structure
      |
      v
Local network packets
      |
      v
Master Gateway
  ESP32
  LoRa/ESP-NOW receiver
  SIM7600 4G
  NEO-6M GPS
  BME280 weather
  microSD offline storage
      |
      v
MQTT/HTTPS
      |
      v
Honey Chain Backend
  IoT ingestion
  TimescaleDB sensor data
  AI/ML analytics
  Alerts
  Beekeeper app
  KVIC dashboard
```

---

## 7. Hive Node Pin Plan: Essential ESP32 Node

This is a practical ESP32 DevKit V1 pin plan. Confirm the exact pin labels on the board you buy before soldering, because ESP32 breakout boards can vary.

### 7.1 Power Connections

| Module | Module Pin | ESP32 / Power |
|---|---|---|
| SHT31-D | VCC | 3V3 |
| SHT31-D | GND | GND |
| HX711 | VCC | 3V3 recommended |
| HX711 | GND | GND |
| IR Beam A emitter | VCC | 3V3 or 5V as per module |
| IR Beam A emitter | GND | GND |
| IR Beam A receiver | VCC | 3V3 or 5V as per module |
| IR Beam A receiver | GND | GND |
| IR Beam B emitter | VCC | 3V3 or 5V as per module |
| IR Beam B emitter | GND | GND |
| IR Beam B receiver | VCC | 3V3 or 5V as per module |
| IR Beam B receiver | GND | GND |

Important:

- Keep all grounds common.
- ESP32 GPIO pins are 3.3V logic. If any sensor output is 5V, use a level shifter or voltage divider.
- Do not power heavy modules from weak regulator pins.

### 7.2 Essential Sensor Pins

| Function | Module Pin | ESP32 Pin | Notes |
|---|---|---|---|
| I2C data | SHT31-D SDA | GPIO21 | Shared I2C bus |
| I2C clock | SHT31-D SCL | GPIO22 | Shared I2C bus |
| Weight data | HX711 DT / DOUT | GPIO26 | Digital data |
| Weight clock | HX711 SCK / PD_SCK | GPIO27 | Digital clock |
| Entrance beam 1 | IR Receiver A OUT | GPIO32 | Entry/exit sequence input |
| Entrance beam 2 | IR Receiver B OUT | GPIO33 | Entry/exit sequence input |
| Battery level | Voltage divider output | GPIO35 | ADC input only |

Avoid:

- GPIO6 to GPIO11 because they are used by ESP32 flash.
- GPIO0, GPIO2, GPIO12, GPIO15 for external modules unless you understand boot strapping.
- Feeding 5V output into ESP32 GPIO.

### 7.3 Load Cell to HX711

Common four-wire load-cell connection:

| Load Cell Wire | HX711 Pin | Meaning |
|---|---|---|
| Red | E+ | Excitation positive |
| Black | E- | Excitation negative |
| Green | A+ | Signal positive |
| White | A- | Signal negative |

Important:

- Load-cell wire colors can vary. Check the load-cell datasheet or measure before final assembly.
- Calibrate every hive after installation.
- Mount the load cell mechanically so the hive load is stable and centered.
- Use waterproof cable glands and strain relief.

### 7.4 IR Break Beam Placement

Use two break beams at the hive entrance:

```text
Outside hive -> Beam A -> Beam B -> Inside hive
```

Movement logic:

```text
Beam A breaks first, then Beam B -> bee entering hive
Beam B breaks first, then Beam A -> bee exiting hive
```

Placement guidelines:

- Keep beams aligned and protected from rain/wax.
- Place them so normal bee traffic passes through the sensing path.
- Do not block the entrance or disturb bee movement.
- Count activity as an estimate, not exact bee population.

### 7.5 Battery Monitor

For a 1-cell Li-ion node:

```text
Battery + -> R1 100k -> ADC GPIO35 -> R2 100k -> GND
```

For a 12V solar/battery gateway:

```text
Battery + -> R1 220k -> ADC input -> R2 47k -> GND
```

Notes:

- Configure ESP32 ADC attenuation properly in firmware.
- Calibrate ADC readings with a multimeter.
- Add a small capacitor, for example 0.1uF, from ADC input to GND to reduce noise.

---

## 8. Hive Node Pin Plan: LoRa Version

If using LoRa, add SX1276/RFM95 to each hive node.

| LoRa Module Pin | ESP32 Pin | Notes |
|---|---|---|
| VCC | 3V3 | Do not use 5V on LoRa module unless breakout explicitly allows it |
| GND | GND | Common ground |
| SCK | GPIO18 | SPI clock |
| MISO | GPIO19 | SPI MISO |
| MOSI | GPIO23 | SPI MOSI |
| NSS / CS | GPIO5 | Chip select |
| RST | GPIO13 | Reset |
| DIO0 | GPIO34 | Interrupt input |

Important:

- Use the correct LoRa frequency module for your region.
- Attach a proper antenna before transmitting.
- Keep payload small.
- If GPIO5 causes boot trouble on a specific board, move chip select to another safe GPIO.

---

## 9. Optional Hive Sensors

### 9.1 INMP441 Microphone

Use only when sound analysis is part of the prototype.

| INMP441 Pin | ESP32 Pin |
|---|---|
| VDD | 3V3 |
| GND | GND |
| SCK / BCLK | GPIO14 |
| WS / LRCLK | GPIO25 |
| SD / DOUT | GPIO39 |
| L/R | GND for left channel |

Notes:

- Use protected placement so bees/wax/moisture do not damage the mic.
- Sound features should be used for risk estimation, not direct disease proof in MVP.
- GPIO39 is input-only, which is suitable for microphone data input.

### 9.2 MPU6050 Vibration Sensor

| MPU6050 Pin | ESP32 Pin |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO21 |
| SCL | GPIO22 |

Notes:

- Shares the same I2C bus as SHT31-D.
- Use vibration mainly for disturbance, movement, and anomaly features.

### 9.3 MH-Z19B CO2 Sensor

Use only if CO2 is required, because it consumes more power and needs warm-up.

| MH-Z19B Pin | ESP32 Pin / Power |
|---|---|
| VIN | 5V supply |
| GND | GND |
| TX | ESP32 RX2 GPIO16 |
| RX | ESP32 TX2 GPIO17 |

Notes:

- MH-Z19B uses UART.
- It needs 4.5V to 5.5V supply.
- Confirm logic levels on the exact module.
- It has warm-up time, so it may not be ideal for ultra-low-power nodes.

---

## 10. Master Gateway Pin Plan

This plan assumes an ESP32 DevKit V1 based gateway.

### 10.1 Gateway Modules

| Gateway Function | Module |
|---|---|
| Local hive node receiver | ESP-NOW or SX1276/RFM95 LoRa |
| Cellular internet | SIM7600X 4G LTE breakout |
| Apiary location | NEO-6M GPS |
| Outdoor weather | BME280 |
| Offline storage | microSD |
| Power | Solar/battery system |

### 10.2 SIM7600 Cellular Connection

For a SIM7600 breakout board:

| SIM7600 Pin | ESP32 / Power | Notes |
|---|---|---|
| TXD | ESP32 RX2 GPIO16 | SIM7600 transmits, ESP32 receives |
| RXD | ESP32 TX2 GPIO17 | ESP32 transmits, SIM7600 receives |
| GND | GND | Common ground |
| 5V / VIN | Dedicated 5V high-current supply | Do not use weak ESP32 power pin |
| PWRKEY | Manual button or GPIO via transistor | Required by many boards to power on |
| RST | Optional GPIO via transistor | Optional reset control |

Power warning:

- Bare SIM7600 modules usually need a regulated VBAT supply and high peak current.
- Many breakout boards accept 5V input but still need high current.
- Use a dedicated supply capable of current spikes, commonly 2A or more.
- Do not power SIM7600 directly from the ESP32 3V3 pin.

Logic-level warning:

- Some SIM7600 boards expose 3.3V-compatible UART.
- Some bare modules use lower logic levels.
- Verify the exact breakout before final PCB design.

### 10.3 Gateway LoRa Receiver

| LoRa Module Pin | ESP32 Pin |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SCK | GPIO18 |
| MISO | GPIO19 |
| MOSI | GPIO23 |
| NSS / CS | GPIO5 |
| RST | GPIO14 |
| DIO0 | GPIO34 |

### 10.4 Gateway Weather Sensor: BME280

| BME280 Pin | ESP32 Pin |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO21 |
| SCL | GPIO22 |

### 10.5 Gateway GPS: NEO-6M

| NEO-6M Pin | ESP32 Pin / Power |
|---|---|
| VCC | 3V3 or 5V as per breakout |
| GND | GND |
| TX | ESP32 RX GPIO25 |
| RX | ESP32 TX GPIO26, optional |

Notes:

- GPS may be needed only at gateway level, not every hive.
- Store exact apiary location privately.
- Consumer page should show district/cluster, not exact hive coordinates.

### 10.6 microSD Offline Storage

If using SPI microSD with LoRa on the same SPI bus:

| microSD Pin | ESP32 Pin |
|---|---|
| VCC | 3V3 or 5V as per module |
| GND | GND |
| SCK | GPIO18 |
| MISO | GPIO19 |
| MOSI | GPIO23 |
| CS | GPIO27 |

Notes:

- LoRa and microSD can share SPI if each has a separate CS pin.
- If sharing SPI becomes unstable, use a separate storage method or a board with more stable peripheral routing.

---

## 11. Power Design

### 11.1 Hive Node Power

Recommended demo power:

```text
18650 Li-ion battery
TP4056 charger module
3.3V regulator
ESP32 + sensors
```

Recommended pilot power:

```text
Small solar panel
Solar charge controller
Li-ion or LiFePO4 battery
Efficient 3.3V regulator
Power-gated sensors
ESP32 deep sleep
```

Power-saving strategy:

- Wake every 5 to 15 minutes for environment/weight readings.
- Keep IR entrance sensing active only if continuous bee traffic data is required.
- Power-gate high-current sensors where possible.
- Send compact payloads.
- Use deep sleep between readings.

### 11.2 Gateway Power

Recommended gateway power:

```text
Solar panel
Battery pack
Charge controller
5V 3A buck regulator for SIM7600 breakout and ESP32 input
3.3V regulator for LoRa and sensors
Fuse + reverse polarity protection
Weatherproof enclosure
```

Gateway consumes more power because it handles cellular connectivity.

---

## 12. Firmware Structure

### 12.1 Hive Node Firmware

```text
Boot
  |
  v
Load hiveId, nodeId, gatewayId
  |
  v
Initialize sensors
  |
  v
Read SHT31-D
Read HX711
Read IR counters
Read battery voltage
Read optional mic/vibration/CO2
  |
  v
Validate readings
  |
  v
Create packet with sequence number
  |
  v
Send to gateway using ESP-NOW or LoRa
  |
  +-- ACK received -> mark sent
  |
  +-- No ACK -> store in local queue
  |
  v
Deep sleep / next cycle
```

### 12.2 Gateway Firmware

```text
Boot
  |
  v
Initialize local receiver
Initialize SIM7600
Initialize GPS/weather/storage
  |
  v
Receive hive-node packets
  |
  v
Validate node ID, sequence, checksum/signature
  |
  v
Add gateway timestamp, GPS, weather
  |
  v
Store packet in local queue
  |
  v
If cellular available:
    Upload queue to backend
Else:
    Keep buffering
  |
  v
Send gateway heartbeat
```

---

## 13. Packet Structure

### 13.1 Node to Gateway Payload

For LoRa, use compact JSON only for prototype. For pilot, prefer compact binary, CBOR, or MessagePack.

```json
{
  "nodeId": "NODE-HC-001",
  "hiveId": "HIVE-UP-GZB-024",
  "seq": 1842,
  "timestampLocal": 1788019200,
  "temperatureC": 34.2,
  "humidityPct": 64.0,
  "weightKg": 38.5,
  "beeEntries": 212,
  "beeExits": 198,
  "batteryPct": 78,
  "rssi": -81,
  "checksum": "crc-or-hmac"
}
```

### 13.2 Gateway to Backend Payload

```json
{
  "gatewayId": "GW-UP-GZB-001",
  "apiaryId": "API-UP-GZB-00012",
  "uploadedAt": "2026-08-29T16:00:00Z",
  "network": {
    "type": "4G",
    "operator": "cellular-provider",
    "signalQuality": 72
  },
  "location": {
    "latitude": 28.6692,
    "longitude": 77.4538
  },
  "weather": {
    "temperatureC": 31.4,
    "humidityPct": 70.2,
    "pressureHpa": 1004.8
  },
  "readings": [
    {
      "nodeId": "NODE-HC-001",
      "hiveId": "HIVE-UP-GZB-024",
      "seq": 1842,
      "timestampLocal": 1788019200,
      "temperatureC": 34.2,
      "humidityPct": 64.0,
      "weightKg": 38.5,
      "beeEntries": 212,
      "beeExits": 198,
      "batteryPct": 78
    }
  ]
}
```

---

## 14. Backend IoT API

Gateway upload endpoint:

```text
POST /api/v1/iot/gateways/{gatewayId}/telemetry/bulk
```

Gateway heartbeat:

```text
POST /api/v1/iot/gateways/{gatewayId}/heartbeat
```

Device registration:

```text
POST /api/v1/iot/gateways/provision
POST /api/v1/iot/nodes/provision
POST /api/v1/iot/nodes/{nodeId}/pair-hive
```

MQTT topic option:

```text
honeychain/{clusterId}/{apiaryId}/{gatewayId}/telemetry
```

---

## 15. Data Flow to AI

```text
Hive Node
  |
  v
Gateway
  |
  v
Backend IoT Ingestion
  |
  v
TimescaleDB raw sensor data
  |
  v
Preprocessing job
  |
  v
Feature windows
  |
  v
AI/ML model
  |
  v
Health score, risk score, alert, recommendation
  |
  v
Beekeeper App + KVIC Dashboard
```

---

## 16. Sampling Plan

Recommended MVP sampling:

| Data Type | Suggested Frequency |
|---|---|
| Temperature/humidity | Every 5 minutes |
| Weight | Every 15 minutes |
| Entrance activity | Count continuously, report every 5 minutes |
| Battery | Every 30 minutes |
| Gateway weather | Every 10 minutes |
| GPS | At setup, then every 6 to 24 hours |
| Sound sample | Short sample every 15 to 60 minutes, optional |
| CO2 | Every 15 to 30 minutes, optional |

For demo, readings can be faster. For field deployment, tune for battery life.

---

## 17. Local Failure Handling

Hive node failure handling:

- If gateway ACK fails, save packet locally.
- Retry during next wake cycle.
- Include sequence numbers to avoid duplicates.
- Keep a small rolling buffer if storage is limited.

Gateway failure handling:

- Save all received readings in microSD or flash queue.
- Upload when 4G returns.
- Send heartbeat status.
- Trigger backend alert if gateway offline.
- Use watchdog restart for stuck modem or firmware.

Backend failure handling:

- Use idempotency keys.
- Ignore duplicate sequence numbers.
- Mark late data as backfilled.
- Run AI with confidence lowered if data is missing.

---

## 18. Physical Installation

Hive node:

- Mount in a small weather-resistant enclosure.
- Keep sensor probes inside protected hive zones.
- Avoid blocking bees.
- Keep electronics away from honey/wax contact.
- Use strain relief for load-cell cable.

Gateway:

- Mount above ground.
- Keep antenna clear.
- Keep SIM7600 antenna and LoRa antenna outside metal boxes.
- Use weatherproof enclosure.
- Add ventilation without allowing water entry.

---

## 19. Testing Checklist

### 19.1 Bench Test

- ESP32 boots reliably.
- SHT31-D returns stable readings.
- HX711 returns changing weight readings.
- IR beam detects beam break.
- Battery ADC shows believable voltage.
- Node sends packet to gateway.
- Gateway receives packet.
- Gateway uploads payload to backend.

### 19.2 Field Test

- Hive node works inside/near hive.
- Gateway receives all nodes from expected distance.
- Cellular upload works in target area.
- Solar/battery survives at least one night.
- Sensor readings remain stable over 24 hours.
- Moisture/weather does not damage enclosure.

### 19.3 AI Data Test

- Readings include correct hiveId and timestamp.
- Missing readings are detected.
- Duplicate packets are ignored.
- Feature extraction creates temperature, humidity, weight, activity, sound, and CO2 features where available.

---

## 20. Wokwi Simulation Plan

If real modules are not available in Wokwi, use simulation-only substitutes:

| Real Feature | Wokwi Substitute |
|---|---|
| SHT31-D | DHT22 |
| Hive sound level | Slide potentiometer on GPIO34 |
| Camera/pest signal | PIR + LDR + potentiometer proxy |
| Rain/weather severity | Potentiometer proxy |
| Bee activity | Push button/PIR/manual variable |

Important:

- Wokwi validates data flow and alert flow.
- Wokwi does not validate real disease detection.
- Potentiometer thresholds are manual demo values, not biological truth.

---

## 21. Recommended Approval

Approve this architecture for Honey Chain MVP:

```text
3 hive nodes:
ESP32 + SHT31-D + HX711 + 2 IR break beams + battery monitor

1 master gateway:
ESP32 + SIM7600 4G + BME280 + NEO-6M + local receiver

Local communication:
ESP-NOW for demo, LoRa SX1276/RFM95 for rural pilot
```

---

## 22. References Checked

- Espressif ESP32-DevKitC user guide: https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html
- Espressif ESP-NOW documentation: https://docs.espressif.com/projects/esp-now/en/latest/esp32/
- Semtech SX1276 LoRa product page and datasheet links: https://www.semtech.com/products/wireless-rf/lora-connect/sx1276
- SIMCom SIM7600 technical files: https://www.simcom.com/technical_files.html
- Sensirion SHT31-DIS-F product page: https://sensirion.com/products/catalog/SHT31-DIS-F
- HX711 datasheet copy from SparkFun repository: https://github.com/sparkfun/HX711-Load-Cell-Amplifier/blob/master/datasheets/hx711F_EN.pdf
- TDK INMP441 product page: https://product.tdk.com/ja/search/sw_piezo/mic/mems-mic/info?part_no=INMP441
- Winsen MH-Z19B product page: https://www.winsen-sensor.com/product/mh-z19b.html
