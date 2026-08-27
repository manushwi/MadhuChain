# HoneyChain — Multi-Source Raw Material Intake

### Handling honey sourced from many beekeepers/suppliers into one factory run

---

## 1. Two Kinds of Suppliers

Not every supplier will be one of your IoT-monitored beekeepers. Design for both from day one:

| Supplier type | Description | Trust level |
|---|---|---|
| **Platform Beekeeper** | Registered on HoneyChain, hives have sensor nodes, harvest is minted on-chain with full sensor history | Full traceability |
| **External/Partner Supplier** | Bulk raw honey purchased from a supplier not on your sensor network (common in early stages, or for scaling volume) | Partial traceability — origin declared, but no live hive data behind it |

Both need a **Supplier entity** in your data model, but only Platform Beekeepers produce a Batch through the Mint flow you already have. External suppliers get a lighter-weight **"Declared Lot"** entry instead (see below) — you still want them in the system for mass-balance and quality tracking, just marked as a lower trust tier.

---

## 2. Raw Material Intake — Goods Received Note (GRN) Pattern

Every incoming delivery to the factory, regardless of source, gets logged the same way — this is standard supply-chain practice adapted onto your chain:

**New transaction: `RecordIntake`**
- `lot_id` (new unique ID for this specific delivery)
- `supplier_id` (either a Platform Beekeeper's existing batch_id, or an External Supplier ID)
- `supplier_type` (Platform / External)
- `weight_kg`
- `delivery_date`
- `declared_origin` (region/apiary name — self-reported if External)
- `intake_test_id` (link to the quality test run on this specific lot at arrival — every lot gets tested at intake regardless of supplier type, this is your main defense against a bad external supplier)

This gives you one consistent "front door" for raw material, whether it's coming from your own sensor-tracked hives or an outside supplier.

---

## 3. Multi-Source Blending — Extending the Blend Transaction

Earlier the Blend transaction assumed a couple of parent batches. In practice a factory production run might combine honey from 10–30 different lots. Extend it to a proper many-to-one structure:

**Updated transaction: `BlendBatch`**
```
BlendBatch(
  new_batch_id,
  sources: [
    { lot_id: "LOT-0091", weight_kg: 120 },
    { lot_id: "LOT-0092", weight_kg: 85 },
    { lot_id: "LOT-0093", weight_kg: 200 },
    ... up to N sources
  ]
)
```

**Enforcement rules (same mass-balance logic as before, just generalized to N inputs):**
- `sum(sources.weight_kg)` must equal the recorded input weight for this production run (within tolerance).
- Every `lot_id` referenced must already exist on-chain with a completed Intake Test — you can't blend in an undeclared or untested lot.
- The resulting `new_batch_id` carries a **composition record**: what % of the final blend came from each source lot. This is what makes downstream quality attribution possible.

---

## 4. Data Model Additions

| Entity | Fields |
|---|---|
| **Supplier** | supplier_id, name, type (Platform/External), contact info, trust_tier |
| **Lot** | lot_id, supplier_id, weight_kg, delivery_date, intake_test_id, declared_origin |
| **BlendComposition** | blend_batch_id, source_lot_id, weight_kg, percentage |

The `BlendComposition` table is what lets you answer, for any finished jar: *"this jar is 43% from Beekeeper A's hives, 31% from Beekeeper B's hives, 26% from External Supplier X"* — and trace quality issues back to the specific lot that caused them if a compositional drift flag ever fires.

---

## 5. Quality Attribution Across a Blend

When a blended batch's Output Test flags a compositional drift, you now have a way to narrow down *which input* is the likely cause:

- Check each source lot's own Intake Test results.
- If one lot's individual sugar profile/moisture was already borderline at intake, weight that as the probable contributor rather than assuming the blending process itself caused it.
- This is also your leverage point for **supplier accountability** — if a specific External Supplier's lots keep triggering flags, that's a clear signal to drop them or require stricter intake testing from them specifically, independent of anything that happens later in your own factory.

---

## 6. Consumer-Facing Transparency

Update the verification page's origin section to reflect a blend honestly, rather than implying single-hive origin when that's not true:

- **Single-source batch:** "100% from [Beekeeper Name]'s apiary in [Location]" (as before).
- **Blended batch:** "This honey is a blend from N apiaries" + a simple breakdown (e.g. a small donut chart or list): "58% [Apiary A], 27% [Apiary B], 15% Partner Supplier."
- **Verified Origin %:** a summary stat — what percentage of this jar's contents came from fully sensor-traced Platform Beekeepers vs. External Suppliers. This is honestly one of your strongest trust signals precisely *because* it doesn't overclaim — "92% verified origin" is more credible than a vague purity claim, and gives you room to be transparent as you scale toward more external sourcing.

---

## 7. Practical Note on Rollout

You don't need External Supplier support in your MVP if your pilot is small enough to run entirely on your own tracked beekeepers — the single-source flow from earlier still works fine for that. But it's worth building the `Lot` and `BlendComposition` entities into the data model **now**, even if you don't onboard external suppliers yet, so you're not retrofitting the schema later once real blended production runs start happening. Platform-only beekeepers can just be treated as a Lot with `supplier_type = Platform`, so the model doesn't fork into two codepaths.

---

*Extends `honeychain-processing-chain.md` — the Processing/Blending logic there still applies once material reaches the factory; this document covers what happens one step earlier, at intake, when multiple sources are involved.*
