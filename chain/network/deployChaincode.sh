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

echo "==> Creating channel '${CHANNEL}' with Org1/KVIC and Org2/Factory"
PATH="$TEST_NET/../bin:$PATH" FABRIC_CFG_PATH="$TEST_NET/../config" \
  ./network.sh createChannel -c "$CHANNEL"

echo "==> Adding Org3/Certified Lab to '${CHANNEL}'"
(
  cd "$TEST_NET/addOrg3"
  ./addOrg3.sh up -c "$CHANNEL" -ca -s couchdb
)

echo "==> Deploying Go chaincode '${CC_NAME}' v${CC_VERSION} as Chaincode-as-a-Service"
./network.sh deployCCAAS -ccn "$CC_NAME" -ccv "$CC_VERSION" \
  -ccp "$CC_PATH" -c "$CHANNEL" -ccs "$CC_SEQUENCE"

# The Fabric sample CCAAS helper handles Org1 and Org2 only. Install the same
# external-service package on the lab peer and record Org3's approval.
export PATH="$TEST_NET/../bin:$PATH"
export FABRIC_CFG_PATH="$TEST_NET/../config"
source "$TEST_NET/scripts/envVar.sh"
setGlobals 3
PACKAGE_ID="$(peer lifecycle chaincode calculatepackageid "${CC_NAME}.tar.gz")"
if ! peer lifecycle chaincode queryinstalled --output json | grep -q "$PACKAGE_ID"; then
  peer lifecycle chaincode install "${CC_NAME}.tar.gz"
fi
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "$ORDERER_CA" --channelID "$CHANNEL" --name "$CC_NAME" \
  --version "$CC_VERSION" --package-id "$PACKAGE_ID" --sequence "$CC_SEQUENCE"

if ! docker ps --format '{{.Names}}' | grep -qx "peer0org3_${CC_NAME}_ccaas"; then
  docker run --rm -d --name "peer0org3_${CC_NAME}_ccaas" --network fabric_test \
    -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
    -e CHAINCODE_ID="$PACKAGE_ID" -e CORE_CHAINCODE_ID_NAME="$PACKAGE_ID" \
    "${CC_NAME}_ccaas_image:latest"
fi

echo "==> Chaincode '${CC_NAME}' deployed and approved by Org1, Org2, and Org3 on '${CHANNEL}'."
