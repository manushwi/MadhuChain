# HoneyChain — Deployment Guide + Testing Without Real IoT Data

---

## Part 1 — Deployment: Why "One Repo" Does NOT Mean "One Point of Failure"

This is worth clearing up directly: **a monorepo is about where your source code lives (one Git history). It has nothing to do with how the code runs.** You will deploy each component as a completely separate, independently-running service — if one goes down, the others keep running. Here's exactly how that separation works in practice.

### Deployment targets — one per component, fully independent

| Component | Where it runs | What happens if it goes down |
|---|---|---|
| `apps/beekeeper-app` | Vercel/Netlify (own deployment) | Only beekeepers can't load their dashboard — factory app, consumer site, backend, chain all keep running |
| `apps/factory-app` | Vercel/Netlify (own deployment) | Only factory workers affected |
| `apps/consumer-web` | Vercel/Netlify (own deployment) + CDN | Only the QR-scan page affected — and since it's cached/CDN-backed, most visitors won't even notice a backend hiccup |
| `services/backend-api` | A cloud VM/container service (Railway, Render, AWS ECS, or a plain VPS with Docker) — its own process, its own restart policy | Frontends still *load* (they're static/CDN-served), but live data calls fail gracefully (see fallback UI note below) |
| `chain/network` (Fabric) | Its own VM/Kubernetes cluster, separate from the backend server | Backend can't submit new transactions, but can still serve cached reads (Redis/Postgres) for a while — write operations queue or show "temporarily unavailable" rather than the whole system crashing |
| `firmware/gateway-node` | Runs physically at the apiary (Raspberry Pi), independent of everything above | Sensor data buffers locally and retries — doesn't affect any other component |

**The key architectural principle:** each of these is its own Docker container / hosted service with its own URL, its own health check, and its own restart policy. They talk to each other over the network (REST calls, Fabric SDK calls) — exactly like they would if they lived in five separate repos. Putting the *code* in one repo just makes it easier to keep them in sync during development; it doesn't wire their *runtime processes* together.

### Making failures actually graceful (not just "technically separate")

Separate deployment is necessary but not sufficient — you also want each component to degrade gracefully rather than hard-fail when a dependency is down:

- **Backend → Chain:** wrap Fabric Gateway SDK calls in retries + timeouts. If Fabric is unreachable, return a clear "processing — try again shortly" response instead of a raw 500 error, and consider a short write-queue (even a simple DB table of "pending chain writes" that a background job retries) so a brief Fabric outage doesn't lose a submitted transaction.
- **Frontend → Backend:** every API call in the apps should have a loading/error state — if the backend is down, `consumer-web` should show "verification temporarily unavailable, please try again" rather than a blank/broken page. Since `GET /api/verify/:jarId` is cached in Redis, most requests will succeed even during a backend restart if you keep the cache TTL reasonable (e.g. serve slightly-stale cached data rather than nothing).
- **Gateway node → Backend:** the gateway already buffers locally and retries (from the original sensor plan) — this means a backend outage doesn't lose sensor data, it just delays it.

### CI/CD — independent pipelines within the one repo

Use GitHub Actions with path filters (or Turborepo's built-in "affected packages" detection) so a change to `chain/chaincode` doesn't trigger a redeploy of `apps/consumer-web`, and vice versa:

```yaml
# .github/workflows/deploy-backend.yml — triggers only on services/backend-api changes
on:
  push:
    paths:
      - 'services/backend-api/**'
      - 'packages/shared-types/**'
```

Set up one workflow file per deployable component (5 total: 3 apps, backend, chaincode), each scoped with `paths:` filters. This gets you the independent-deployment behavior of separate repos while keeping the shared-types benefit of a monorepo — you get both, not a tradeoff between them.

**Bottom line:** structure it this way and "single repo" becomes purely a development-convenience decision. Nothing about deploying five independent services from one Git history creates a single point of failure at runtime.

---

## Part 2 — Testing Without Real IoT Hardware

You shouldn't need physical hive sensors to build and test 90% of the system. Build a **simulator** early — it pays for itself immediately.

### Sensor Data Simulator

Build a small script (Node or Python) that mimics a hive slave node's output and posts it to your backend exactly like real hardware would:

```javascript
// simulate-hive.js — run one per "fake hive" during dev/testing
const hiveId = process.argv[2] || "H-SIM-001";

function randomReading() {
  return {
    hive_id: hiveId,
    ts: Date.now(),
    temp_in: 34 + Math.random() * 2,       // normal range
    hum_in: 55 + Math.random() * 10,
    weight_kg: 40 + Math.random() * 0.5,   // slow natural drift
    temp_out: 20 + Math.random() * 10,
    battery_v: 3.6 + Math.random() * 0.3
  };
}

setInterval(async () => {
  await fetch(`${process.env.API_BASE_URL}/api/sensor-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-device-key": process.env.DEVICE_KEY },
    body: JSON.stringify(randomReading())
  });
}, 15000); // every 15s instead of 15min, for fast testing
```

**Also simulate anomalies deliberately** — this is how you test your alerting logic:
- A script variant that sends a sudden weight drop (theft/collapse simulation)
- A variant with a slow temp climb outside normal range (disease/ventilation issue simulation)
- A variant with dropped/delayed packets (tests your buffering/retry logic on the gateway)

Run several of these in parallel (`node simulate-hive.js H-SIM-001 &`, `node simulate-hive.js H-SIM-002 &`, etc.) to simulate a whole apiary without any hardware at all. This lets you build and demo the entire Beekeeper App dashboard, charts, and alerting before a single physical sensor exists.

### Database Seed Data

Use Prisma's seed scripts to populate realistic fake data for batches, quality tests, suppliers, and jars — this is what lets you build and test the Factory App and Consumer Website without waiting on a real harvest:

- Seed a handful of hives, beekeepers, and historical sensor readings
- Seed a few completed batches at different lifecycle stages (one still "Processing", one "Released", one deliberately "Flagged" so you can test the QC review UI)
- Seed one deliberately *fraudulent-looking* test case: an Output Test with a shifted sugar profile relative to its Intake Test, and a Packaging record where jar weights sum to more than the recorded output weight — this is exactly the case your mass-balance/compositional-drift logic needs to catch, so write it as a permanent fixture and an automated test, not just a one-off manual check.

### Chaincode/Chain Testing Without a Full Network

- Fabric's test network runs entirely on your dev machine via Docker — no physical infrastructure needed, this is already "simulated" by design.
- Write chaincode unit tests using the Fabric contract testing framework (mock the ledger stub) to test business logic (e.g. "does `RecordQualityTest` correctly flag a batch when sugar profile shifts beyond tolerance") without needing a live network running at all.
- For integration testing, script a full test sequence via the Fabric Gateway SDK: `MintBatch → RecordReceived → RecordQualityTest(Intake) → RecordProcessingAction → RecordQualityTest(Output, with bad data) → assert batch status is FLAGGED`. Automate this as a real test suite (Jest), not manual CLI poking — this is your fraud-detection logic's actual regression test.

### API/Integration Testing

- Use Postman/Insomnia (or Jest + Supertest) to hit every backend endpoint with the seeded/simulated data — build this collection early and it doubles as living API documentation for whoever's building the frontend apps.
- A useful end-to-end smoke test: run the sensor simulator → confirm data lands in the DB → trigger a Mint via the API → run it through the full processing chain with one deliberately-bad quality test → confirm the batch shows as FLAGGED on the consumer verify endpoint. If that whole chain works with fake data, your real hardware integration later is just "swap the simulator script for real ESP32 firmware" — the rest of the system doesn't need to change.

### Summary — What You Can Fully Build/Test Before Any Hardware Exists

| Component | Testable without real IoT? |
|---|---|
| Beekeeper App dashboard/charts/alerts | ✅ fully, via sensor simulator |
| Factory Worker App full workflow | ✅ fully, via seeded batches |
| Consumer Website + verification | ✅ fully, via seeded batches |
| Mass-balance/compositional fraud detection | ✅ fully, and *should* be tested this way — deliberately feeding bad data is the only way to properly validate this logic |
| Chaincode state machine | ✅ fully, via Fabric test network + unit tests |
| Gateway node buffering/retry behavior | ✅ testable via simulator with induced network drops |
| Actual sensor hardware reliability (battery life, radio range, enclosure durability) | ❌ this genuinely needs real hardware in the field — nothing above substitutes for a physical pilot eventually |

The only thing you can't simulate your way around is real-world hardware reliability — everything else in the system can be fully built, demoed, and stress-tested with synthetic data before you deploy a single physical sensor.
