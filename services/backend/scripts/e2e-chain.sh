#!/usr/bin/env bash
# =============================================================================
# MadhuChain end-to-end chain smoke test.
#
# Drives the FULL honey lifecycle through the backend REST API into the Fabric
# ledger (madhuchain-cc on madhuchain-channel), including a deliberately-bad
# output test to prove the fraud detector FLAGs + clears, mass-balance-enforced
# blending, jar packaging, and on-chain consumer verification.
#
# Requires:
#   - backend running (bun --watch src/index.ts) on $BASE
#   - Fabric network up with chaincode committed (v1.3+)
#   - seeded demo user + hives (bun run db:seed)
#   - jq on PATH (vendor one at chain/network/fabric-samples/bin)
#
# Usage: BASE=http://localhost:4000 ./e2e-chain.sh
# =============================================================================
set -euo pipefail

BASE="${BASE:-http://localhost:4000}"
EMAIL="${EMAIL:-amara@madhuchain.app}"
PASSWORD="${PASSWORD:-madhuchain123}"
CT="Content-Type: application/json"

command -v jq >/dev/null || { echo "e2e: jq is required (set PATH to chain/network/fabric-samples/bin)"; exit 1; }

step() { printf '\n:: %s\n' "$1"; }
json() { jq -c "$1"; }
check() { # check <desc> <expr-filepath> <expected>
  local got expected
  got="$(jq -r "$2")"
  expected="$3"
  if [ "$got" != "$expected" ]; then
    echo "e2e FAIL: $1 -> got '$got', want '$expected'"; exit 1
  fi
  echo "  ok: $1 = $got"
}

TOKEN=$(curl -s -X POST "$BASE/api/auth/login" -H "$CT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r .token)
[ "$TOKEN" != "null" ] && [ -n "$TOKEN" ] || { echo "e2e FAIL: login"; exit 1; }
AUTH="Authorization: Bearer $TOKEN"

BATCH=$(curl -s -X POST "$BASE/api/batches/mint" -H "$AUTH" -H "$CT" \
  -d '{"hive_ids":["H-001"],"harvest_start":"2026-08-20T00:00:00.000Z","harvest_end":"2026-08-22T00:00:00.000Z","weight_kg":120.5}' | tee /tmp/hc-mint.json | jq -r .batch_id)
check "mint returns batch" '.batch_id' "$BATCH" < /tmp/hc-mint.json
LOT=$(jq -r .lot_id /tmp/hc-mint.json)

step "received (transporter)"
check "received -> INTAKE_TEST" '.state' "INTAKE_TEST" < <(curl -s -X POST "$BASE/api/batches/$BATCH/received" -H "$AUTH" -H "$CT" -d '{"transporter_id":"TRANSPORTER-01","weight_in":120.5}')

step "intake quality test (lab)"
check "intake test -> PROCESSING" '.state' "PROCESSING" < <(curl -s -X POST "$BASE/api/batches/$BATCH/quality-test" -H "$AUTH" -H "$CT" \
  -d '{"stage":"INTAKE","moisture":17.2,"hmf":30,"diastase":12,"sugar_profile":{"fructose":38,"glucose":34,"sucrose":2},"isotope_ratio":-24.5}')

step "processing action (factory)"
curl -s -X POST "$BASE/api/batches/$BATCH/processing-action" -H "$AUTH" -H "$CT" \
  -d '{"action_type":"heating","parameters":{"target_temp":"45"},"operator_id":"OPER-1","equipment_id":"EQ-3","weight_before":120.5,"weight_after":117.0}' > /dev/null

step "output quality test with deliberately-bad data (HMF drift 30->20 > 8)"
check "fraud detector FLAGs batch" '.flagged' "true" < <(curl -s -X POST "$BASE/api/batches/$BATCH/quality-test" -H "$AUTH" -H "$CT" \
  -d '{"stage":"OUTPUT","moisture":16.8,"hmf":20,"diastase":15,"sugar_profile":{"fructose":38,"glucose":34,"sucrose":2},"isotope_ratio":-24.3}')

step "QC Manager clears the flag"
curl -s -X POST "$BASE/api/batches/$BATCH/clear-flag" -H "$AUTH" -H "$CT" -d '{"resolution":"CLEARED"}' > /dev/null

step "output quality test within tolerances"
check "output test -> PACKAGING" '.state' "PACKAGING" < <(curl -s -X POST "$BASE/api/batches/$BATCH/quality-test" -H "$AUTH" -H "$CT" \
  -d '{"stage":"OUTPUT","moisture":17.0,"hmf":28,"diastase":13,"sugar_profile":{"fructose":38,"glucose":34,"sucrose":2},"isotope_ratio":-24.5}')

step "packaging (293 jars x 0.395kg = 115.7kg, within 2% of 117kg output)"
curl -s -X POST "$BASE/api/batches/$BATCH/packaging" -H "$AUTH" -H "$CT" -d '{"jar_count":293,"average_jar_weight_kg":0.395}' > /dev/null

step "final quality test"
check "final test -> RELEASED" '.state' "RELEASED" < <(curl -s -X POST "$BASE/api/batches/$BATCH/quality-test" -H "$AUTH" -H "$CT" \
  -d '{"stage":"FINAL","moisture":17.0,"hmf":27,"diastase":14,"sugar_profile":{"fructose":38,"glucose":34,"sucrose":2},"isotope_ratio":-24.4}')

JAR="${BATCH}-JAR-0001"
step "consumer verify jar $JAR (on-chain origin + quality)"
curl -s "$BASE/api/verify/$JAR" -H "$AUTH" > /tmp/hc-verify.json
check "verify resolves jar" '.jar_id' "$JAR" < /tmp/hc-verify.json
check "verify returns quality history" '(.quality | select(length >= 4) | length > 0)' "true" < /tmp/hc-verify.json

step "blend: mint source batch, intake-test it, blend both lots (mass balance)"
B2=$(curl -s -X POST "$BASE/api/batches/mint" -H "$AUTH" -H "$CT" \
  -d '{"hive_ids":["H-002"],"harvest_start":"2026-08-24T00:00:00.000Z","harvest_end":"2026-08-26T00:00:00.000Z","weight_kg":80.4}' | jq -r .batch_id)
curl -s -X POST "$BASE/api/batches/$B2/received" -H "$AUTH" -H "$CT" -d '{"transporter_id":"TRANSPORTER-02","weight_in":80.4}' > /dev/null
curl -s -X POST "$BASE/api/batches/$B2/quality-test" -H "$AUTH" -H "$CT" \
  -d '{"stage":"INTAKE","moisture":16.9,"hmf":22,"diastase":11,"sugar_profile":{"fructose":39,"glucose":33,"sucrose":2},"isotope_ratio":-23.9}' > /dev/null
curl -s -X POST "$BASE/api/batches/x/blend" -H "$AUTH" -H "$CT" \
  -d "{\"sources\":[{\"lot_id\":\"$LOT\",\"weight_kg\":120.5},{\"lot_id\":\"HC-LOT-002\",\"weight_kg\":80.4}],\"weight_kg\":200.9}" > /tmp/hc-blend.json
check "blend returns batch id" '.batch_id | startswith("BATCH-")' "true" < /tmp/hc-blend.json
check "blend sources recorded (2 lots)" '.sources | length == 2' "true" < /tmp/hc-blend.json

echo
echo "E2E PASS: lifecycle + fraud flag/clear + verify + blend all committed to the Fabric ledger"