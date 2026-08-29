# HoneyChain Factory App — Full Build Guide (PRD · Architecture · Flows · Spec)

> Build the **HoneyChain Factory Worker mobile app** in React Native (Expo, TypeScript). This document is the complete spec: product requirements, architecture, every endpoint contract, every screen flow, and the exact visual system. Implement it exactly to these contracts — the backend is already live and e2e-verified against Hyperledger Fabric. When in doubt, follow the endpoint contracts below literally (field names are case-sensitive).

---

## Part 1 — PRD

### 1.1 Product summary
HoneyChain lets consumers verify the origin of honey jars against a tamper-proof Hyperledger Fabric ledger. This app is the **factory-floor operator's tool**: it drives a raw honey batch through intake, QC testing, processing, packaging, and release, recording every step as an on-chain transaction via the HoneyChain backend API.

### 1.2 Persona
**Factory Worker / Lab Tech / QC Manager** — mobile-first worker in a honey packing facility who scans batch barcodes, enters QC readings, records processing steps, packages jars, and resolves flagged batches. Needs a fast, glanceable UI that works glove-friendly in a loud, bright environment.

### 1.3 Goals
- G1 — Authenticate with role-based UI (register as `FACTORYWORKER`; QC actions surfaced for `QCMANAGER`).
- G2 — Scan or type a batch ID and see its full state + history instantly.
- G3 — Record every lifecycle step (received → intake QC → processing → output QC → packaging → final QC) with validation matching the backend thresholds.
- G4 — Never block the user silently: show tx confirmation, clear error messages, and a "flagged" banner with a QC-clear action.
- G5 — Beautiful **neomorphism** UI in the supplied warm earth palette, consistent across every screen.

### 1.4 Non-goals
- Consumer verification, beekeeper monitoring, supplier GRN intake, IoT data. (Separate apps.)
- Multi-factor auth, biometric door-lock security. (Phase 2.)

### 1.5 Features + acceptance criteria

| # | Feature | Acceptance criteria |
|---|---|---|
| F0 | Theming shell | All screens use the neomorphism system + palette (§4.3). Dark/light not needed — the palette is its own light theme. |
| F1 | Auth | Register (role `FACTORYWORKER`), login, logout. Token persisted in secure storage; auto-restore session; 401 → sign-in screen. |
| F2 | Batch list | `GET /api/batches` → cards grouped/filtered by chain state; pull-to-refresh; shows lot, weight, flagged badge. |
| F3 | Scan / lookup | Camera barcode scan (`expo-camera`) OR manual text entry of `BATCH-###` → `GET /api/batches/:id`. Loading + not-found states. |
| F4 | Batch detail | Header (id, lot, weight, state pill), **flag banner** when `flagged`, quality-history timeline, processing log, jars, blends, ownership. Action menu gated by state (F5–F12). |
| F5 | Record Received | `transporter_id`, `weight_in`. Only when state = `RECEIVED`. |
| F6 | Intake QC | moisture, HMF, diastase, sugar profile (fructose/glucose/sucrose), isotope ratio. Only when state in `RECEIVED/INTAKE_TEST`. |
| F7 | Processing action | heating / filtering (blending goes through F11). `action_type`, optional `parameters`, `weight_before`, `weight_after`. |
| F8 | Output QC | Same fields as intake; **shows fraud thresholds hint**. On `flagged=true` response, show FLAGGED banner + QC clear action. |
| F9 | Packaging | `jar_count`, `average_jar_weight_kg`; jar-weight hint (±2% of output weight). On success show first N jar serials + "open barcode label" (PDF). |
| F10 | Final QC | Same fields; success → `RELEASED` screen state. |
| F11 | Blend | Pick ≥2 lots (each must have completed intake) + blend total weight; mass-balance hint (±2%). Creates a new batch; navigate to it. |
| F12 | Transfer | Enter `to_identity` (e.g. `DISTRIBUTOR-01`) → confirm. |
| F13 | Flag management | FLAGGED batch: QC Manager can `CLEARED` or `REJECTED`. |
| F14 | Robustness | Every submit shows in-flight state, success checkmark + tx id, or a readable error (network, 4xx/5xx with backend message). Empty/loading/error states on all lists. |

### 1.6 Non-functional requirements
- **Resilience:** app must never look frozen; all network calls have timeout + retry-once for idempotent GETs.
- **Security:** JWT only in `expo-secure-store`; strip token from logs; never commit API secrets to repo; no auth details in URLs.
- **Perf:** batch lists under 500 ms perceived; images/PDFs lazy.
- **Accessibility:** 44pt touch targets, ≥4.5:1 contrast for body text (use `#81432D` on cream), labels for icon-only actions.

---

## Part 2 — Architecture

### 2.1 Tech stack
- Expo **SDK 54**, React Native **0.81.5**, React **19.1.0**, TypeScript, **expo-router v6**
- `expo-camera` (barcode scanning — `CameraView` + `onBarcodeScanned`)
- `expo-secure-store` (JWT), `expo-linking` / `expo-sharing` + `expo-file-system` (open/print barcode PDF)
- `@react-native-async-storage/async-storage` (non-sensitive cache)
- No heavy state store needed — React Context + hooks (auth + one API client)

### 2.2 Folder structure
```
apps/factory-app/
  app/                        # expo-router routes
    _layout.tsx               # root: AuthProvider + theme
    (auth)/login.tsx
    (auth)/signup.tsx
    (tabs)/index.tsx          # Dashboard (batch list)
    (tabs)/batch/[id].tsx     # Batch detail + actions
    scan.tsx                  # Camera scanner modal/screen
    blend/create.tsx          # Blend wizard
  src/
    api/client.ts             # fetch wrapper (token, base URL, errors)
    api/auth.ts
    api/batches.ts
    context/AuthContext.tsx
    theme/palette.ts          # THE palette (§4.3)
    theme/NeuCard.tsx         # neumorphic primitives (buttons, fields, pills)
    components/BatchCard.tsx, StatePill.tsx, FlagBanner.tsx,
    components/QcForm.tsx, ProcessingForm.tsx, PackagingForm.tsx, ...
    utils/barcode.ts          # parse scanned payloads -> BATCH-###, pdf helpers
  constants/api.ts            # API_BASE_URL (single place)
```

### 2.3 Data flow
```
[Factory App (RN)] --HTTPS JSON--> [HoneyChain Backend (Express, :4000)]
                                         |  JWT auth (Bearer token)
                                         v
                              [Hyperledger Fabric: honeychain-cc / honeychain-channel]
                                         | (chaincode state machine + fraud checks)
                                         v
                                     ledger (source of truth)  <-- mirrored --> Postgres (reads)
```
- **Every write** (received, quality-test, processing-action, packaging, blend, transfer, clear-flag) is a backend call that submits a Fabric transaction and returns `{ ..., tx }`.
- **Reads** (`GET /api/batches*`) come from the mirrored Postgres DB.
- **Auth:** the backend signs custodially with a Fabric `Admin` identity, so any authenticated app user can submit; role enforcement on the backend is being hardened incrementally — the UI must gate actions by `user.role` regardless.

### 2.4 API client rules
- Base URL from `constants/api.ts` (single constant, e.g. `http://<LAN_IP>:4000` for a real device; `http://localhost:4000` for web — do NOT hardcode across files).
- Attach `Authorization: Bearer <token>` on every request except login/signup.
- Normalize errors: `{ error, status }` → `ApiError` with readable message; 401 → logout + redirect to login.
- All bodies are **snake_case** (as specified); **do not rename fields** — the backend does not translate them.

---

## Part 3 — API Reference (exact contracts — do not deviate)

Base URL `API_BASE_URL`. Everything below except login/signup requires header `Authorization: Bearer <token>`.

### 3.1 Auth
**POST `{API_BASE}/api/auth/signup`** — public
Body: `{ name: string, password: string (≥8), role: 'FACTORYWORKER'|'QCMANAGER'|..., email?: string, phone?: string (email or phone required), apiaryName?, location?, gpsLat?, gpsLng? }`
→ 201: `{ token: string, user: { id, name, email, phone, role, apiaryName, location } }`

**POST `{API_BASE}/api/auth/login`** — public
Body: `{ email?: string, phone?: string, password: string }` → 200: `{ token, user: {...same} }` | 401 `{ error: 'Invalid credentials' }`

**GET `{API_BASE}/api/auth/me`** → `{ user }`

### 3.2 Batch reads
**GET `{API_BASE}/api/batches`** → `{ batches: Batch[] }` (includes `hives`, `qualityTests`)

**GET `{API_BASE}/api/batches/:id`** → 200 `{ batch: Batch }` | 404 `{ error }`
`Batch` shape (all **camelCase** fields — different from request bodies, which are snake_case):
```jsonc
{
  "id": "cuid", "batchId": "BATCH-001", "lotId": "HC-LOT-001",
  "beekeeperId": "cuid",
  "state": "RECEIVED",            // see chain states below
  "harvestStart": "2026-08-20T00:00:00.000Z" | null,
  "harvestEnd": "2026-08-22T00:00:00.000Z"   | null,
  "weightKg": 120.5,
  "sensorDataHash": "...", "barcodePayload": { "lot_id": "...", "weight_kg": 120.5, "harvest_date": "..." },
  "flagged": false, "flagReason": null, "flagResolution": null,
  "hives":         [{ "id","hiveId","beekeeperId","sensorNodeId","location","gpsLat","gpsLng","registeredAt" }],
  "qualityTests":  [{ "id","batchId","stage","moisture","hmf","diastase","sugarProfile":{fructose,glucose,sucrose},"isotopeRatio","testerId","ts" }],
  "processingLog": [{ "id","batchId","actionType","parameters":{},"operatorId","equipmentId","weightBefore","weightAfter","parentLots":null,"ts" }],
  "jarSerials":    [{ "id","batchId","jarId","ts" }],
  "ownershipTransfer":[ { "id","batchId","fromId","toId","ts" } ],
  "blends":        [{ "id","blendBatchId","sourceLotId","weightKg","percentage" }]
}
```

### 3.3 Chain state machine (drives which actions are enabled)
`RECEIVED → INTAKE_TEST → PROCESSING → OUTPUT_TEST → PACKAGING → FINAL_QC → RELEASED`, plus `FLAGGED` (from OUTPUT checks onward). Backend mirror `state` after each write: received→`INTAKE_TEST`; intake QC→`PROCESSING`; processing action→`PROCESSING`; output QC pass→`PACKAGING`, fail→`FLAGGED`; packaging→`FINAL_QC`; final QC→`RELEASED`; clear-flag `CLEARED`→`PROCESSING`.

Action availability (mirror this in the UI):
- received: `state == 'RECEIVED'`
- intake QC: `state in ['RECEIVED','INTAKE_TEST']`
- processing action: `state in ['PROCESSING','OUTPUT_TEST']`
- output QC: `state in ['PROCESSING','OUTPUT_TEST']`
- packaging: `state == 'PACKAGING'`
- final QC: `state == 'FINAL_QC'`
- clear-flag: `flagged == true` (QCManager UI)
- blend: always available (needs ≥2 intake-tested lot IDs)
- transfer: always available

### 3.4 Factory write endpoints
All return `tx` (parsed Fabric transaction JSON) and an HTTP 4xx/5xx `{ error }` on failure. **All request bodies snake_case.**

**POST `{API_BASE}/api/batches/:id/received`**
`{ transporter_id: string, weight_in: number }` → `{ batch_id, state: 'INTAKE_TEST', tx }`

**POST `{API_BASE}/api/batches/:id/quality-test`**
`{ stage: 'INTAKE'|'OUTPUT'|'FINAL', moisture: number, hmf: number, diastase: number, sugar_profile: { fructose: number, glucose: number, sucrose: number }, isotope_ratio: number }`
→ `{ batch_id, stage, state, flagged, fraud_checks?, tx }` — `fraud_checks` present on OUTPUT: `{ passed, reasons[] }`.

**POST `{API_BASE}/api/batches/:id/processing-action`**
`{ action_type: 'heating'|'filtering'|'blending', parameters?: Record<string,string>, operator_id?, equipment_id?, weight_before?, weight_after?, parent_lots?: Record<string,number> }`
→ `{ batch_id, action, tx }`

**POST `{API_BASE}/api/batches/:id/packaging`**
`{ jar_count: number (int > 0), average_jar_weight_kg: number (> 0) }`
→ `{ batch_id, jar_count, jars: ["BATCH-001-JAR-0001", ...], tx }` — jar serial format: `<BATCH_ID>-JAR-<4-digit>`.

**POST `{API_BASE}/api/batches/:id/blend`** *(`:id` is IGNORED — backend auto-generates next batch)*
`{ sources: [ { lot_id: string, weight_kg: number } (min 2), weight_kg: number }`
→ 201 `{ batch_id, lot_id, sources, tx }`

**POST `{API_BASE}/api/batches/:id/transfer`**
`{ to_identity: string }` → `{ batch_id, to_identity, tx }`

**POST `{API_BASE}/api/batches/:id/clear-flag`**
`{ resolution: 'CLEARED'|'REJECTED' }` → `{ batch_id, resolution, tx }`

**GET `{API_BASE}/api/batches/:id/barcode`** → `{ batch_id, payload, barcode_pdf_url, barcode_pdf_base64 }`

**GET `{API_BASE}/barcodes/:file.pdf`** — public; returns the label PDF.

### 3.5 Fraud/QC thresholds (backend enforces — surface as inline hints)
- Moisture drift vs intake: `0.5` points
- HMF drift: `8.0` mg/kg
- Diastase drift: `3.0` DN/L
- Sugar-profile drift per component: `0.3` points
- Isotope ratio (δ13C) drift: `0.3` ‰
- Packaging: `totalJarWeight = jar_count × avg_jar_weight` must be within **±2%** of recorded output weight
- Blend: sum of source weights within **±2%** of blend `weight_kg`

### 3.6 Known backend facts to code around
- `clear-flag` + all writes currently succeed for any logged-in user (role enforcement pending server-side hardening) — the app must still gate QC-specific actions by `user.role` in the UI.
- Register with `role: 'FACTORYWORKER'` for normal ops, `'QCMANAGER'` to see the flag-clear action.
- LAN device: backend must run with `HOST=0.0.0.0` and you'll call its LAN IP; on Expo Web CORS only allows the origins in backend `.env` (`ALLOWED_ORIGIN`).

---

## Part 4 — Flows & Design System

### 4.1 Master lifecycle
```
Scan/Enter BATCH-### ─► Batch detail
  RECEIVED ─[received]─► INTAKE_TEST ─[intake QC]─► PROCESSING
  PROCESSING ─[processing action]─► PROCESSING ─[output QC]─► PACKAGING ◄─(fail)─ FLAGGED ─[QC clear]─► PROCESSING
  PACKAGING ─[packaging]─► FINAL_QC ─[final QC]─► RELEASED
  (anywhere) Blends: pick ≥2 intake-tested lots ─► new BATCH-### ; Transfer ownership ─► to_identity
```

### 4.2 Screen flows
1. **Launch/Session:** AuthProvider reads secure token → straight to **Dashboard** or **Login**.
2. **Login:** email/phone + password → store token (+ `user.role`) → Dashboard. **Signup** screen registers `role: FACTORYWORKER`.
3. **Dashboard:** `GET /api/batches` → state-pill cards → tap → Detail. Floating **Scan** → camera → parse → Detail. Search-by-id field.
4. **Detail:** banner (flagged?), quality timeline, jars, blends; action cards below, each enabled per §3.3.
5. **QC form** (shared by intake/output/final): numeric steppers + sugar trio + isotope; shows the relevant threshold hints; submit → success (state/flagged) or error.
6. **Processing form:** heating/filtering presets with weight-before/after; then Detail.
7. **Packaging:** jar count + avg weight; live hint "total X kg vs output Y (±2%)"; success → jar serials + **Open label PDF** (Linking.openURL(`barcode_pdf_url`) or decode `barcode_pdf_base64` via expo-file-system + expo-sharing/print).
8. **Blend wizard:** multi-select intake-tested batches → auto-fill `lot_id` + weight → total weight → submit → navigate to new `batch_id`.
9. **Flag:** FLAGGED detail shows QC Manager card → CLEARED/REJECTED.

### 4.3 Design system (neomorphism) — the palette you MUST use

| Token | Name | HEX | Use |
|---|---|---|---|
| `bg` | Warm Ivory | `#EFEEE9` | app background |
| `surface` | Soft Cream | `#E2DECE` | card/nav fill |
| `surfaceAlt` | Champagne Beige | `#D9D2C1` | secondary panels |
| `sand` | Deep Beige | `#C9B69B` | borders, track fills |
| `accent` | Soft Terracotta | `#C4835E` | secondary buttons, icons |
| `accentBright` | Peach Orange | `#F39A68` | primary CTA, highlights |
| `primaryDark` | Terracotta Brown | `#9B4E32` | primary buttons, headings |
| `darkAccent` | Cocoa Brown | `#81432D` | text, active pills |
| `highlight` | Near White | `#F8F7F2` | raised-edge highlight, on-dark text |
| `muted` | Warm Gray | `#A7A397` | secondary text, disabled |

**Neumorphic rules:**
- Raised component (cards, buttons, pills): fill `#E2DECE`, **two** soft edges — light `#F8F7F2` top-left, dark `#A7A397` bottom-right. Implement with a `NeuCard` wrapper: two absolutely positioned rounded views behind the content (light offset −6,−6; dark offset +6,+6), content on top in `#E2DECE`, `borderRadius: 20–28`, subtle `#C9B69B` boundary.
- Sunken (text inputs): invert — inner shadow feel by placing the field inset with the dark edge top-left and light edge bottom-right.
- Primary button `#9B4E32` with `#F8F7F2` text; CTA/active `#F39A68` with `#81432D` text; ghost accent `#C4835E`.
- Disabled: `#D9D2C1` fill, `#A7A397` text. Focus ring: `#F39A68`.
- State pill colors keyed to chain state: `RECEIVED #C9B69B`, `INTAKE_TEST #D9D2C1`, `PROCESSING #C4835E`, `OUTPUT_TEST #C4835E`, `PACKAGING #9B4E32`, `FINAL_QC #F39A68`, `RELEASED #9B4E32`, `FLAGGED #81432D` (with ⚠ icon).
- Typography: geometric sans (system default or `expo-font` Poppins); headings `#9B4E32`, body `#81432D`, muted `#A7A397`.
- Motion: micro spring on press (`react-native-reanimated` is available in the starter), 150–250 ms; no gimmicks.

**Reference `NeuCard` pattern (put in `src/theme/NeuCard.tsx`):**
```tsx
export function NeuCard({ lifted = true, style, children }: Props) {
  return (
    <View style={{ position: 'relative', borderRadius: 24, ...style }}>
      <View style={[edge, { backgroundColor: '#F8F7F2', top: -6, left: -6 }]} />
      <View style={[edge, { backgroundColor: '#A7A397', bottom: -6, right: -6 }]} />
      <View style={{ backgroundColor: '#E2DECE', borderRadius: 24, padding: 20, position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
}
```
(Adjust offsets per `lifted`; the two edges + offset pair behind the main face is the core neumorphic trick that works in RN where a single `shadowColor` can't do dual edges.)

---

## Part 5 — Final instructions (send to the app developer)

1. Build exactly the PRD (Part 1), Architecture (Part 2), and endpoint contracts (Part 3). Do not invent fields; do not lowercase/uppercase or camelCase/snake_case-swap anything.
2. Use the palette + neomorphism system in Part 4.3 **everywhere** — no defaults, no raw flat colors.
3. Auth via `expo-secure-store`; single API client in `src/api/`; base URL in `constants/api.ts`.
4. Scanner: `expo-camera` `CameraView` with `onBarcodeScanned` + manual text fallback; normalise scanned payloads to `BATCH-\d{3,}`.
5. Ship these screens: Login, Signup (role FACTORYWORKER), Dashboard (list + search + scan entry), Scan, Batch Detail (all actions + flag banner), QC form, Processing form, Packaging (with PDF label open), Blend wizard, Transfer, Flag resolve.
6. Wire every button to its endpoint; show in-flight/success/error; keep state gating per §3.3.
7. Self-check before delivery: full happy path `RECEIVED → RELEASED` works; a bad OUTPUT QC shows `flagged: true` + banner + clear path; packaging jars list matches `jar_count`; blend creates a new `BATCH-###`.
8. Clean git history, run `expo lint`, no `console.log` noise of tokens.

**Test credentials (already seeded):** `amara@honeychain.app` / `honeychain123` (Beekeeper — fine for reads). Register a `FACTORYWORKER` account for write testing on any local network with the backend up (`bun run dev`).