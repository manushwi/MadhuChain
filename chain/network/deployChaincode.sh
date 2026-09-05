#!/usr/bin/env bash
# HoneyChain - create the channel, add the lab org, and deploy Go chaincode.
#
# Prereqs:
#   - ./bootstrap.sh has been run
#   - ./up.sh up -ca has started the network
#   - Go toolchain available (chaincode is written in Go)
#
# Steps:
#   1. Create honeychannel with Org1/KVIC and Org2/Factory
#   2. Add Org3/Certified Lab to the channel
#   3. Package, approve, and commit the honeychain contract
#
# Re-runnable: steps already done (channel joined, chaincode committed, CCAAS
# containers running) are detected and skipped. Run it after a reboot to bring
# the chaincode-as-a-service containers back up.
#
# Usage: ./deployChaincode.sh
set -euo pipefail

# Keep Docker's Linux socket path unchanged while allowing Fabric's native
# Windows binaries to receive normal /d/... path conversion.
export MSYS_ENV_CONV_EXCL='DOCKER_SOCK'
export MSYS2_ENV_CONV_EXCL='DOCKER_SOCK'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NET="$SCRIPT_DIR/fabric-samples/test-network"
CC_PATH="$SCRIPT_DIR/../chaincode/honeychain-cc"
CC_NAME="honeychain"
CC_VERSION="${CC_VERSION:-1.0}"
CHANNEL="${CHANNEL:-honeychannel}"
CC_SEQUENCE="${CC_SEQUENCE:-1}"

if [ ! -d "$TEST_NET" ]; then
  echo "test-network not found. Run ./bootstrap.sh first." >&2
  exit 1
fi
if [ ! -d "$CC_PATH" ]; then
  echo "chaincode not found at $CC_PATH" >&2
  exit 1
fi

cd "$TEST_NET"

# Shared env for the peer CLI (used by the guards and the Org3 leg below).
export PATH="$TEST_NET/../bin:$PATH"
export FABRIC_CFG_PATH="$TEST_NET/../config"
export OVERRIDE_ORG=
export VERBOSE="${VERBOSE:-false}"
source "$TEST_NET/scripts/envVar.sh"

setGlobals 1
if peer channel getinfo -c "$CHANNEL" >/dev/null 2>&1; then
  echo "==> Channel '${CHANNEL}' already exists (Org1 peer joined) - skipping channel creation"
else
  echo "==> Creating channel '${CHANNEL}' with Org1/KVIC and Org2/Factory"
  ./network.sh createChannel -c "$CHANNEL"
fi

setGlobals 3
if peer channel getinfo -c "$CHANNEL" >/dev/null 2>&1; then
  echo "==> Org3/Certified Lab already joined '${CHANNEL}' - skipping addOrg3"
else
  echo "==> Adding Org3/Certified Lab to '${CHANNEL}'"
  (
    cd "$TEST_NET/addOrg3"
    ./addOrg3.sh up -c "$CHANNEL" -ca -s couchdb
  )
fi

setGlobals 1
if peer lifecycle chaincode querycommitted -C "$CHANNEL" -n "$CC_NAME" --output json 2>/dev/null |
    grep -Eq "\"version\": ?\"${CC_VERSION}\"" &&
   peer lifecycle chaincode querycommitted -C "$CHANNEL" -n "$CC_NAME" --output json 2>/dev/null |
    grep -Eq "\"sequence\": ?${CC_SEQUENCE}"; then
  echo "==> Chaincode '${CC_NAME}' v${CC_VERSION} already committed on '${CHANNEL}' - skipping deployCCAAS"
else
  echo "==> Deploying Go chaincode '${CC_NAME}' v${CC_VERSION} as Chaincode-as-a-Service"
  ./network.sh deployCCAAS -ccn "$CC_NAME" -ccv "$CC_VERSION" \
    -ccp "$CC_PATH" -c "$CHANNEL" -ccs "$CC_SEQUENCE"
fi

# The Fabric sample CCAAS helper only manages the Org1/Org2 containers on first
# deploy. (Re)create the external-service package and containers here so the
# script is safe to re-run, including after a reboot or 'docker system prune'.
if [ ! -f "${CC_NAME}.tar.gz" ]; then
  echo "==> Repackaging '${CC_NAME}.tar.gz' (missing)"
  tempdir=$(mktemp -d -t "${CC_NAME}.XXXXXXXX")
  mkdir -p "$tempdir/src" "$tempdir/pkg"
  printf '{"address":"{{.peername}}_%s_ccaas:9999","dial_timeout":"10s","tls_required":false}\n' "$CC_NAME" > "$tempdir/src/connection.json"
  printf '{"type":"ccaas","label":"%s"}\n' "${CC_NAME}_${CC_VERSION}" > "$tempdir/pkg/metadata.json"
  tar -C "$tempdir/src" -czf "$tempdir/pkg/code.tar.gz" .
  tar -C "$tempdir/pkg" -czf "${CC_NAME}.tar.gz" metadata.json code.tar.gz
  rm -Rf "$tempdir"
fi
PACKAGE_ID="$(peer lifecycle chaincode calculatepackageid "${CC_NAME}.tar.gz")"

ensureCCAAS() {
  local suffix="$1"
  local name="peer0${suffix}_${CC_NAME}_ccaas"
  if docker ps --format '{{.Names}}' | grep -qx "$name"; then
    echo "==> CCAAS container '$name' already running"
    return
  fi
  if ! docker image inspect "${CC_NAME}_ccaas_image:latest" >/dev/null 2>&1; then
    echo "==> Building '${CC_NAME}_ccaas_image:latest' (image missing)"
    docker build -f "$CC_PATH/Dockerfile" -t "${CC_NAME}_ccaas_image:latest" \
      --build-arg CC_SERVER_PORT=9999 "$CC_PATH"
  fi
  echo "==> Starting CCAAS container '$name'"
  docker run --rm -d --name "$name" --network fabric_test \
    -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
    -e CHAINCODE_ID="$PACKAGE_ID" -e CORE_CHAINCODE_ID_NAME="$PACKAGE_ID" \
    "${CC_NAME}_ccaas_image:latest"
  sleep 2
}

ensureCCAAS org1
ensureCCAAS org2

setGlobals 3
if ! peer lifecycle chaincode queryinstalled --output json | grep -q "$PACKAGE_ID"; then
  peer lifecycle chaincode install "${CC_NAME}.tar.gz"
fi
if peer lifecycle chaincode querycommitted -C "$CHANNEL" -n "$CC_NAME" --output json 2>/dev/null |
    grep -q '"Org3MSP": true'; then
  echo "==> Org3 has already approved '${CC_NAME}' v${CC_VERSION} - skipping approve"
else
  peer lifecycle chaincode approveformyorg \
    -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile "$ORDERER_CA" --channelID "$CHANNEL" --name "$CC_NAME" \
    --version "$CC_VERSION" --package-id "$PACKAGE_ID" --sequence "$CC_SEQUENCE"
fi

if ! docker ps --format '{{.Names}}' | grep -qx "peer0org3_${CC_NAME}_ccaas"; then
  docker run --rm -d --name "peer0org3_${CC_NAME}_ccaas" --network fabric_test \
    -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
    -e CHAINCODE_ID="$PACKAGE_ID" -e CORE_CHAINCODE_ID_NAME="$PACKAGE_ID" \
    "${CC_NAME}_ccaas_image:latest"
fi

echo "==> Chaincode '${CC_NAME}' deployed and approved by Org1, Org2, and Org3 on '${CHANNEL}'."
