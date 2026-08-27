# HoneyChain — Anti-Adulteration Processing Chain
### Closing the gap: tracking quality/purity *through* the factory, not just before and after

---

## The Core Problem

Right now the chain has two trust anchors: **harvest** (hive → beekeeper mint) and **final lab test** (before/after packaging). Everything in between — the actual factory processing — is a black box. This is exactly where real honey fraud happens in the industry:

- **Dilution** with sugar syrup during blending
- **Overheating** to speed up processing (destroys enzymes, spikes HMF, but hides visual signs of crystallization/fermentation)
- **Batch mixing** — blending a small amount of real honey with a large amount of syrup and still calling it "pure"
- **Filtering tricks** — ultra-filtering to remove pollen (hides geographic origin fraud)
- **Weight/volume inflation** — more product leaving the factory than came in, which is a direct mathematical fingerprint of adulteration

The fix: treat the factory not as one step, but as a **sequence of mandatory, individually-logged checkpoints**, each producing an on-chain record, with automatic cross-checks between them.

---

## 1. The Processing Chain — Mandatory Checkpoints

Instead of one "Quality Test" transaction, break factory processing into a **state machine** the smart contract enforces — a batch cannot skip a step or move backward, and every step requires a worker/operator signature plus sensor data where possible.

```
[RECEIVED] → [INTAKE TEST] → [PROCESSING LOG] → [OUTPUT TEST] → [PACKAGING] → [FINAL QC] → [RELEASED]
```

| Checkpoint | What's recorded | Who/what records it | Purpose |
|---|---|---|---|
| **1. Received** | Batch ID, incoming weight/volume, timestamp, transporter ID | Factory worker scan | Confirms what arrived matches what the beekeeper shipped (compare against beekeeper's Mint record) |
| **2. Intake Test** | Moisture, HMF, diastase, sugar profile — a *baseline* re-test on arrival | Lab technician or inline sensor | Confirms the batch wasn't tampered with in transit; this becomes your reference baseline for everything downstream |
| **3. Processing Log** (one entry per action) | Action type (heating/filtering/blending), parameters (temp, duration, filter micron size), equipment ID, operator ID, before/after weight | Factory worker, ideally auto-logged from equipment sensors | This is the missing piece — every physical thing done to the honey gets its own immutable entry |
| **4. Output Test** | Same panel as Intake Test, run again after processing | Lab technician or inline sensor | Compared against Intake baseline — see reconciliation logic below |
| **5. Packaging** | Jar count, jar-serials generated, packaging date | Factory worker | As before |
| **6. Final QC** | Spot-check test on a sample of finished jars | QC technician | Last line of defense before release |
| **7. Released** | Transfer to distributor | Factory worker/manager | Batch is now locked — no further processing transactions allowed |

**Key rule:** the smart contract should **reject any transaction that tries to skip a step** (e.g., you can't record Packaging before Output Test exists) and should **reject a Release if any checkpoint's data is missing or flagged**.

---

## 2. Mass-Balance Reconciliation (the anti-dilution check)

This is the single most powerful anti-adulteration mechanism you can build in, and it's simple: **honey doesn't appear out of nowhere.**

- At Intake: record weight_in (kg)
- At each Processing step: record weight before/after (should only ever decrease slightly, from moisture evaporation during gentle heating — never increase)
- At Output: record weight_out (kg)
- At Packaging: sum of all jar weights should equal weight_out within a small tolerance (e.g., ±2%)

**Automatic flag conditions** (smart contract or backend logic runs this on every step):
- `weight_out > weight_in × 1.02` → **auto-flag: possible dilution/addition of foreign substance**. A batch of honey should never gain mass through processing.
- Sum of jar weights ≠ recorded output weight (beyond tolerance) → **auto-flag: possible unrecorded blending or unaccounted product**
- Any "Processing Log" entry with an unrecognized/unregistered equipment ID → **auto-flag: unauthorized processing step**

This mass-balance check is exactly the kind of thing you *can't* fake without also faking multiple independent timestamped records — which is the whole point of putting it on-chain.

---

## 3. Chemical/Compositional Drift Check (the anti-syrup-blend check)

Compare **Intake Test** results to **Output Test** results directly:

| Parameter | Expected behavior through legitimate processing | Red flag |
|---|---|---|
| Moisture % | Should stay roughly stable or drop slightly (gentle warming can reduce moisture) | Sudden drop far beyond what mild heating explains → possible syrup addition (syrup has different moisture behavior) |
| HMF | Should rise only slightly if minimal heating was used | Large HMF spike → excessive heating (either sloppy processing or deliberate to mask something) |
| Sugar profile (fructose/glucose/sucrose ratio) | Should stay essentially unchanged — processing doesn't alter sugar chemistry in real honey | **Any meaningful shift here is the strongest direct signal of syrup adulteration** — flag immediately, this is your highest-priority alert |
| C4 sugar isotope ratio | Should stay unchanged | Any shift → near-certain cane/corn syrup contamination |
| Diastase activity | Should only decrease slightly with mild heat | Sharp drop → overheating or dilution |

**Implementation:** set numeric tolerance thresholds per parameter, and have the backend auto-compute the delta between Intake and Output tests the moment the Output Test transaction is submitted. If any parameter exceeds tolerance, the batch is automatically set to **`FLAGGED — Under Review`** status on-chain, blocking Packaging/Release until a human (QC manager) reviews and either clears or rejects it.

---

## 4. Processing Log — What the Factory Worker App Needs to Add

Extending the Factory Worker App from before, add a **Processing Action** screen used *between* Intake and Output:

- Select action type: Heating / Filtering / Blending / Settling / Other
- If Heating: enter temperature + duration (bonus: pull directly from a connected inline temperature logger instead of manual entry — removes human error/tampering risk)
- If Filtering: filter micron size, equipment ID
- If Blending: **this is the critical one** — if your process ever legitimately blends batches (e.g., combining several small hive harvests into one production run), the app must require selecting *all* parent batch IDs and their individual weights, so the resulting blended batch has a fully reconstructable lineage. Blending with anything that isn't a registered parent batch (i.e., an external, non-traced ingredient) should not be a permitted transaction type at all — if it needs to happen, it should require an explicit "Non-Honey Additive" transaction with a required reason/documentation, so it's never silent.
- Operator ID + timestamp auto-attached
- Photo capture option (equipment display, tank level, etc.) for audit purposes

Each of these becomes its own on-chain event under that batch's history — so the consumer-facing timeline (and any auditor) can see not just "it was processed" but exactly what was done, by whom, with what parameters.

---

## 5. Updated Consumer-Facing Trust Signal

On the verification website, extend the "Journey" section to show the **integrity check results**, not just the timeline:

- ✅ "Mass balance verified — no unaccounted weight gain during processing"
- ✅ "Compositional test: sugar profile stable from harvest to packaging (no adulteration detected)"
- ✅ "Chain of custody: 0 unauthorized handling events"

This turns your internal fraud-detection logic into the actual consumer-facing proof of purity — which is the real product you're building, beyond just "here's who made it."

---

## 6. Updated Role/Permission Table

| Role | Can do |
|---|---|
| Beekeeper | Mint batch (harvest) |
| Transport/Logistics | Log "Received" checkpoint only |
| Lab Technician | Submit Intake Test, Output Test, Final QC results |
| Factory Worker | Submit Processing Log entries, Packaging |
| QC Manager | Review/clear flagged batches, approve Release |
| Distributor/Retailer | Ownership Transfer only |
| Consumer | Verification scan, Appearance Report, Review |

No single role should be able to both **process** the honey and **clear a fraud flag** on it — separate those two permissions so a dishonest operator can't cover their own tracks.

---

## Summary of What This Adds

| Before | Now |
|---|---|
| Quality checked at harvest + once before packaging | Quality checked at intake, after every processing action, and at final QC |
| No way to detect dilution | Mass-balance reconciliation flags any unexplained weight gain |
| No way to detect syrup blending | Compositional drift check on sugar profile/HMF/isotope ratio between intake and output |
| Processing was a black box | Every heating/filtering/blending action is its own signed, timestamped, immutable record |
| Blending was invisible | Blending requires declaring all parent batches — no silent additions allowed |

*Extends `honeychain-system-plan.md` and `honeychain-apps-spec.md` — same batch/role model, with the factory stage now fully instrumented.*
