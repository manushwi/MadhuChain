# Honey Chain AI/ML Hive Model Pipeline

Version: 1.0  
Date: 29 August 2026  
Purpose: AI/ML model structure for hive health, pest/disease risk estimation, swarming risk, queen-loss risk, productivity prediction, honey yield estimation, anomaly detection, alerts, and recommendations.

---

## 1. Model Goal

The AI/ML system converts raw hive sensor readings into useful beekeeper and KVIC decisions.

Simple explanation:

```text
IoT tells what is happening.
AI explains what it means.
The app tells the beekeeper what to do next.
```

Core outputs:

- Colony Health Score
- Risk Score
- Alerts
- Recommendations
- Disease/pest risk estimation
- Swarming prediction
- Queen-loss risk estimation
- Productivity prediction
- Honey yield estimation
- Sensor/device anomaly detection

Important limitation:

For MVP, show disease and queen-loss output as "risk estimation", not final diagnosis. True diagnosis needs validated datasets, field labels, expert confirmation, and model validation.

---

## 2. Full AI Workflow

```text
Raw Sensor Data
  |
  v
Pre-process Sensor Data
  |
  v
Feature Extraction
  |
  +-- Temperature Trends
  +-- Humidity Trends
  +-- Hive Weight Change
  +-- Bee Activity
  +-- Sound Pattern
  +-- CO2 Pattern
  |
  v
AI / ML Models
  |
  +-- Colony Health Analysis
  +-- Disease / Pest Detection Risk
  +-- Swarming Prediction
  +-- Queen-loss Detection Risk
  +-- Productivity Prediction
  +-- Honey Yield Estimation
  +-- Anomaly Detection
  |
  v
Generate
  |
  +-- Colony Health Score
  +-- Risk Score
  +-- Alerts
  +-- Recommendations
```

---

## 3. Data Inputs

### 3.1 Sensor Inputs

| Sensor | Module | AI Use |
|---|---|---|
| Temperature | SHT31-D / DHT22 | Colony environment, heat/cold stress |
| Humidity | SHT31-D / DHT22 | Moisture stress, hive comfort |
| Weight | Load Cell + HX711 | Honey growth, harvest readiness, theft/sudden loss |
| Entrance activity | IR Break Beam pair | Bee activity, foraging trend, weak colony signs |
| Sound | INMP441 | Buzz pattern, stress, swarming/queen-loss risk features |
| Vibration | MPU6050 / SW-420 | Disturbance, transport, abnormal movement |
| CO2 | MH-Z19B | Ventilation and colony activity context |
| Weather | BME280 gateway sensor | Normalize hive behavior by outside conditions |
| Camera | ESP32-CAM OV2640, optional | Pest/visual inspection features in future |

### 3.2 Operational Inputs

| Input | Use |
|---|---|
| Hive age | Baseline and productivity context |
| Apiary location | Weather/season context |
| Floral source | Yield and season context |
| Harvest history | Yield prediction and anomaly context |
| Inspection notes | Labels and recommendation improvement |
| Lab result history | Quality and productivity correlation |
| Alert resolution data | Model feedback loop |

---

## 4. Data Storage Layers

```text
Raw SensorReading
  |
  v
CleanSensorReading
  |
  v
FeatureWindow
  |
  v
ModelPrediction
  |
  v
Alert + Recommendation
```

Recommended tables:

```text
sensor_readings
clean_sensor_readings
feature_windows
model_predictions
alerts
recommendations
model_versions
training_datasets
```

---

## 5. Preprocessing

Preprocessing makes sensor data usable for AI.

### 5.1 Validation

Check:

- Required fields exist.
- `hiveId`, `nodeId`, and `gatewayId` are valid.
- Timestamp is valid.
- Numeric values are in possible physical ranges.
- Duplicate sequence numbers are ignored.
- Sensor payload signature/checksum is valid if enabled.

### 5.2 Cleaning

Actions:

- Convert all values to standard units.
- Remove impossible values.
- Mark missing values.
- Smooth noisy readings.
- Detect sensor stuck values.
- Correct for known calibration offset.
- Align readings by timestamp.

### 5.3 Resampling

Create fixed time windows:

| Window | Use |
|---|---|
| 5 minutes | Live alerts |
| 1 hour | Short-term trends |
| 24 hours | Daily health and productivity |
| 7 days | Yield trend and colony baseline |
| 30 days | Seasonal reporting |

### 5.4 Missing Data Handling

| Missing Condition | Action |
|---|---|
| One missed reading | Interpolate or carry last value for short window |
| Several missed readings | Mark lower confidence |
| Device offline | Create device alert |
| One sensor failed | Continue model with reduced feature set |
| Too much missing data | Do not generate strong AI claim |

### 5.5 Baseline Creation

Each hive should get its own baseline because hives behave differently.

Baseline examples:

- Normal temperature range for that hive.
- Normal humidity range for that hive.
- Normal daily weight change.
- Normal morning/evening bee activity.
- Normal sound intensity pattern.
- Normal CO2 pattern.

---

## 6. Feature Extraction

### 6.1 Temperature Features

| Feature | Meaning |
|---|---|
| `temp_mean_1h` | Average temperature in last hour |
| `temp_min_24h` | Minimum daily temperature |
| `temp_max_24h` | Maximum daily temperature |
| `temp_slope_1h` | Is temperature rising/falling quickly |
| `temp_deviation_from_baseline` | Difference from hive's normal pattern |
| `temp_stability_score` | How stable hive temperature is |

Used for:

- Colony health analysis
- Heat/cold stress alert
- Queen-loss risk support signal
- Disease/stress risk support signal

### 6.2 Humidity Features

| Feature | Meaning |
|---|---|
| `humidity_mean_1h` | Average humidity in last hour |
| `humidity_max_24h` | Daily maximum |
| `humidity_min_24h` | Daily minimum |
| `humidity_slope_1h` | Sudden humidity change |
| `humidity_deviation_from_baseline` | Difference from normal |
| `humidity_stability_score` | Moisture stability |

Used for:

- Moisture stress
- Hive environment risk
- Honey quality risk support

### 6.3 Hive Weight Features

| Feature | Meaning |
|---|---|
| `weight_now_kg` | Latest hive weight |
| `weight_delta_1h_kg` | Short-term change |
| `weight_delta_24h_kg` | Daily gain/loss |
| `weight_delta_7d_kg` | Weekly production trend |
| `weight_drop_flag` | Sudden weight loss |
| `nectar_flow_score` | Positive daily weight-gain pattern |

Used for:

- Honey yield estimation
- Productivity prediction
- Harvest readiness
- Theft/container disturbance alert
- Colony weakness support signal

### 6.4 Bee Activity Features

| Feature | Meaning |
|---|---|
| `entries_5m` | Bees entering in 5 minutes |
| `exits_5m` | Bees exiting in 5 minutes |
| `activity_total_5m` | Total movement |
| `entry_exit_ratio` | Entry vs exit balance |
| `activity_deviation_from_baseline` | Abnormal low/high activity |
| `foraging_activity_score` | Expected activity based on time/weather |

Used for:

- Colony activity status
- Weak colony signal
- Swarming risk support
- Productivity support

### 6.5 Sound Pattern Features

For MVP, use simple acoustic features. Later, use MFCC/spectrogram features.

| Feature | Meaning |
|---|---|
| `sound_rms` | Loudness/intensity |
| `sound_peak_frequency` | Dominant frequency estimate |
| `sound_energy_band_low` | Low-band energy |
| `sound_energy_band_mid` | Mid-band energy |
| `sound_energy_band_high` | High-band energy |
| `sound_pattern_change_score` | Change from normal hive sound |

Used for:

- Swarming risk support
- Queen-loss risk support
- Stress/anomaly support

Important:

Sound patterns require real hive audio datasets and validation before claiming accurate queen-loss or disease detection.

### 6.6 CO2 Pattern Features

| Feature | Meaning |
|---|---|
| `co2_mean_1h` | Average CO2 |
| `co2_max_24h` | Daily maximum |
| `co2_slope_1h` | Rising/falling ventilation pattern |
| `co2_deviation_from_baseline` | Abnormal CO2 |
| `ventilation_risk_score` | Poor ventilation support signal |

Used for:

- Ventilation risk
- Colony activity context
- Environmental stress score

---

## 7. MVP Model Design

Use a hybrid system first:

```text
Rule Engine + Baseline Anomaly Detection + Simple Prediction
```

### 7.1 Rule Engine

Rules are transparent and easy to explain in SIH/demo.

Example rule categories:

- High temperature alert.
- Low/high humidity alert.
- Sudden weight drop alert.
- Low activity during expected active hours.
- Device offline alert.
- Battery low alert.
- Gateway offline alert.

### 7.2 Baseline Anomaly Detection

Compare each hive to its own history:

```text
latest value vs normal value for this hive at this time of day
```

MVP methods:

- Rolling average.
- Standard deviation / z-score.
- Median absolute deviation.
- Isolation Forest for later stage.

### 7.3 Simple Yield Prediction

Use recent weight gain plus season/floral source:

```text
predicted_yield = current_weight_trend + harvest_history + floral_source_factor + weather_factor
```

MVP method:

- Linear regression or tree-based regression.
- Start with rule-assisted estimate if training data is limited.

---

## 8. Model Modules

### 8.1 Colony Health Analysis

Inputs:

- Temperature stability
- Humidity stability
- Weight trend
- Activity trend
- Sound pattern, optional
- CO2, optional
- Device health

Output:

```json
{
  "hiveId": "HIVE-UP-GZB-024",
  "healthScore": 87,
  "healthStatus": "Healthy",
  "confidence": 0.78,
  "mainReasons": [
    "Temperature stable",
    "Weight increasing",
    "Bee activity normal"
  ]
}
```

### 8.2 Disease / Pest Risk Estimation

Inputs:

- Temperature instability
- Humidity stress
- Low activity
- Abnormal weight trend
- Sound pattern change
- Optional image/pest model output
- Inspection notes

Output labels:

```text
Low Risk
Medium Risk
High Risk
Needs Inspection
```

Important:

Use "Disease/Pest Risk", not "Disease Confirmed", unless expert-verified labels and validation exist.

### 8.3 Swarming Prediction

Support signals:

- Activity spike or unusual entrance pattern.
- Sound pattern change.
- Weight pattern change.
- Temperature pattern change.
- Seasonal timing.

Output:

```json
{
  "swarmingRisk": "Medium",
  "riskScore": 62,
  "recommendation": "Inspect hive within 24 hours and check brood box space."
}
```

### 8.4 Queen-loss Risk Estimation

Support signals:

- Sound pattern shift.
- Drop in organized activity.
- Temperature instability.
- Reduced productivity.
- Beekeeper inspection notes.

Output:

```text
Queen-loss Risk: Low / Medium / High / Needs manual inspection
```

Important:

Do not claim queen-loss detection only from temperature or activity. It should be a risk signal requiring inspection.

### 8.5 Productivity Prediction

Inputs:

- Weight gain trend.
- Bee activity trend.
- Hive health score.
- Floral source.
- Weather.
- Harvest history.

Outputs:

- Expected production trend.
- Low productivity alert.
- Recommended action.

### 8.6 Honey Yield Estimation

Inputs:

- Current hive weight.
- Empty hive/base weight.
- Recent weight gain.
- Previous harvest data.
- Season/floral source.

Output:

```json
{
  "estimatedHarvestableHoneyKg": 8.6,
  "confidence": 0.72,
  "recommendedHarvestWindow": "3 to 7 days"
}
```

### 8.7 Anomaly Detection

Detect:

- Sudden weight drop.
- Sensor stuck value.
- Sensor impossible value.
- Unusual activity drop.
- Temperature spike.
- Gateway/hive node offline.
- Repeated noisy readings.

---

## 9. Health Score Formula for MVP

Start with an explainable weighted score.

```text
Colony Health Score = 100 - total_penalty
```

Penalty categories:

| Category | Max Penalty |
|---|---|
| Temperature abnormality | 20 |
| Humidity abnormality | 15 |
| Weight/productivity abnormality | 20 |
| Bee activity abnormality | 15 |
| Sound abnormality, if available | 10 |
| CO2/ventilation abnormality, if available | 10 |
| Device/data quality issue | 10 |

Health labels:

| Score | Label |
|---|---|
| 85-100 | Healthy |
| 70-84 | Watch |
| 50-69 | At Risk |
| 0-49 | Critical |

Confidence rules:

- Full sensor set active -> higher confidence.
- Missing sound/CO2 -> normal confidence for MVP if not required.
- Missing weight or temperature -> lower confidence.
- Device offline -> no fresh health score.

---

## 10. Risk Score Design

Generate separate risk scores instead of one vague output.

```text
environmentRiskScore
swarmingRiskScore
queenLossRiskScore
diseasePestRiskScore
productivityRiskScore
deviceRiskScore
```

Final display:

```json
{
  "hiveId": "HIVE-UP-GZB-024",
  "healthScore": 87,
  "riskScores": {
    "environment": 12,
    "swarming": 38,
    "queenLoss": 21,
    "diseasePest": 28,
    "productivity": 16,
    "device": 4
  },
  "topAlert": "Normal",
  "recommendations": [
    "Continue monitoring",
    "Next inspection in 5 days"
  ]
}
```

---

## 11. Alert Generation

Alert pipeline:

```text
ModelPrediction
  |
  v
Alert Rules
  |
  v
Severity Assignment
  |
  v
Deduplication
  |
  v
Notification
  |
  v
Beekeeper action tracking
```

Severity:

| Severity | Meaning |
|---|---|
| Info | No immediate action |
| Low | Watch condition |
| Medium | Inspect soon |
| High | Inspect within 24 hours |
| Critical | Immediate action needed |

Example alert:

```json
{
  "alertType": "SWARMING_RISK",
  "severity": "High",
  "title": "Swarming risk increased",
  "description": "Hive activity and sound pattern changed from baseline.",
  "recommendation": "Inspect brood space and queen cells within 24 hours.",
  "confidence": 0.68
}
```

---

## 12. Recommendation Engine

Recommendations should be simple and action-oriented.

| Condition | Recommendation |
|---|---|
| High temperature | Check shade, ventilation, and water availability |
| High humidity | Inspect moisture control and hive ventilation |
| Sudden weight drop | Inspect for theft, fallen hive, leakage, or harvest mismatch |
| Low activity | Inspect colony strength and entrance blockage |
| Swarming risk | Inspect brood box space and queen cells |
| Possible queen-loss risk | Manual inspection required; check queen/brood pattern |
| Possible pest/disease risk | Inspect hive, capture photo, consult trained expert |
| Battery low | Replace/recharge node battery |
| Gateway offline | Check power, SIM network, antenna, and enclosure |

---

## 13. AI Service APIs

Feature generation:

```text
POST /api/v1/ai/features/generate
```

Hive prediction:

```text
POST /api/v1/ai/hives/{hiveId}/predict
```

Latest model output:

```text
GET /api/v1/hives/{hiveId}/health
```

Batch prediction job:

```text
POST /api/v1/ai/jobs/run-daily
```

Model feedback:

```text
POST /api/v1/ai/feedback
```

---

## 14. Model Output Schema

```json
{
  "predictionId": "PRED-20260829-00001",
  "hiveId": "HIVE-UP-GZB-024",
  "modelVersion": "hive-health-v0.1.0",
  "windowStart": "2026-08-29T10:00:00Z",
  "windowEnd": "2026-08-29T11:00:00Z",
  "healthScore": 87,
  "healthLabel": "Healthy",
  "confidence": 0.78,
  "riskScores": {
    "environment": 12,
    "swarming": 38,
    "queenLoss": 21,
    "diseasePest": 28,
    "productivity": 16,
    "device": 4
  },
  "alerts": [],
  "recommendations": [
    "Continue monitoring",
    "Next routine inspection in 5 days"
  ],
  "featureSummary": {
    "temperatureTrend": "stable",
    "humidityTrend": "stable",
    "weightTrend": "increasing",
    "beeActivity": "normal",
    "soundPattern": "not_available",
    "co2Pattern": "not_available"
  }
}
```

---

## 15. Training Dataset Plan

### 15.1 Sensor Datasets

Use sensor datasets for:

- Temperature/humidity trend learning.
- Weight/yield trend learning.
- Sound/activity pattern analysis.
- Anomaly detection.

Candidate dataset types:

- Hive weight, temperature, humidity datasets.
- Smart hive acoustic datasets.
- Multi-sensor hive datasets.
- Entrance activity datasets.

### 15.2 Image Datasets

Use image datasets only for visual pest/disease models.

Examples:

- Varroa-focused bee images.
- Bee health/image classification datasets.

Do not mix image-only labels into sensor-only disease claims unless the label relationship is valid.

### 15.3 Required Checks Before Training

Before training any serious AI model, confirm:

- License allows use.
- Labels are clear.
- Sampling rate is known.
- Sensor schema is known.
- Missing data is understood.
- Ground truth is reliable.
- Geography/season differences are considered.
- Field expert review is available.

---

## 16. Evaluation Metrics

### 16.1 Health/Alert Evaluation

| Output | Metric |
|---|---|
| Alert detection | Precision, recall |
| Risk score | Expert agreement |
| Health score | Correlation with inspections |
| Device anomaly | False positive rate |
| Yield prediction | MAE/RMSE |
| Swarming risk | Recall and lead time |
| Disease/pest risk | Expert-confirmed precision |

### 16.2 MVP Success Metrics

- Alerts generated correctly from known simulated conditions.
- Health score changes logically when sensor values change.
- Yield estimate follows weight trend.
- Missing data lowers confidence.
- Recommendations are understandable to beekeeper.

---

## 17. Deployment Architecture

```text
TimescaleDB
  |
  v
Feature Job Worker
  |
  v
AI Service
  |
  +-- Rule engine
  +-- Baseline anomaly engine
  +-- ML model runner
  |
  v
Prediction table
  |
  v
Alert service
  |
  v
Beekeeper App / KVIC Dashboard
```

MVP implementation:

- Python service.
- Scheduled background worker.
- FastAPI endpoints.
- Store model version with each prediction.

Future implementation:

- Feature store.
- Model registry.
- A/B model comparison.
- Drift monitoring.
- Edge inference for basic alerts.

---

## 18. Human Feedback Loop

Beekeeper feedback:

- Alert acknowledged.
- Inspection started.
- Action taken.
- Issue resolved.
- Photo/note added.

Factory/lab feedback:

- Batch quality pass/fail.
- Moisture/adulteration results.
- Honey quantity mismatch.

Expert feedback:

- Disease/pest confirmed or rejected.
- Queen-loss confirmed or rejected.
- Swarming observed or not observed.

This feedback becomes training data later.

---

## 19. Approval Recommendation

Approve this AI/ML scope for MVP:

```text
MVP:
Rule-based alerts + baseline anomaly detection + simple yield estimation

Display:
Health Score, Risk Score, Alerts, Recommendations

Language:
Use "risk estimation" instead of "confirmed disease diagnosis"

Future:
Train acoustic/image/time-series models after validating datasets and labels
```

