#!/usr/bin/env bash
# HoneyChain - create the channel and deploy the Go chaincode (honeychain-cc).
#
# Prereqs:
#   - ./bootstrap.sh has been run
#   - ./up.sh up -ca has started the network
#   - Go toolchain available (chaincode is written in Go)
#
# Steps:
#   1. Create channel 'honeychain-channel' with Org1
#   2. Package the Go chaincode
#   3. Approve + commit the chaincode on the channel
#
# Usage: ./deployChaincode.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NET="$SCRIPT_DIR/fabric-samples/test-network"
CC_PATH="$SCRIPT_DIR/../chaincode/honeychain-cc"
CC_NAME="honeychain-cc"
CC_VERSION="${CC_VERSION:-1.0}"
CHANNEL="${CHANNEL:-honeychain-channel}"
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

echo "==> Creating channel '${CHANNEL}' with Org1"
PATH="$TEST_NET/../bin:$PATH" FABRIC_CFG_PATH="$TEST_NET/../config" \
  ./network.sh createChannel -c "$CHANNEL"

echo "==> Deploying Go chaincode '${CC_NAME}' v${CC_VERSION}"
./network.sh deployCC -ccn "$CC_NAME" -ccv "$CC_VERSION" \
  -ccl go -ccp "$CC_PATH" -c "$CHANNEL" -ccs "$CC_SEQUENCE"

echo "==> Chaincode '${CC_NAME}' deployed on channel '${CHANNEL}'."
