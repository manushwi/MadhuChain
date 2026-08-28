#!/usr/bin/env bash
# HoneyChain - bring up a single-org Hyperledger Fabric test network.
#
# This wraps fabric-samples/test-network running with ONE peer org (Org1).
# The network uses channel 'honeychain-channel' (created by deployChaincode.sh).
#
# Usage: ./up.sh [up|up -ca|down]
#   up       - start peers + orderer (no CA)
#   up -ca   - also start the Fabric CA (needed to enroll per-role identities)
#   down     - tear the network down
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NET="$SCRIPT_DIR/fabric-samples/test-network"

if [ ! -d "$TEST_NET" ]; then
  echo "test-network not found. Run ./bootstrap.sh first." >&2
  exit 1
fi

cd "$TEST_NET"

case "${1:-up}" in
  up)
    echo "==> Starting 1-org Fabric test network"
    ./network.sh up -ca -s couchdb
    echo "==> Network up. Organizations: Org1"
    ;;
  down)
    echo "==> Tearing down the network"
    ./network.sh down
    ;;
  *)
    echo "Usage: $0 [up|down]" >&2
    exit 1
    ;;
esac
