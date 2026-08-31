#!/usr/bin/env bash
# HoneyChain - bring up the Org1/KVIC and Org2/Factory base network.
#
# deployChaincode.sh creates honeychannel and adds Org3/Certified Lab before
# deploying the honeychain contract.
#
# Usage: ./up.sh [up|up -ca|down]
#   up       - start peers + orderer (no CA)
#   up -ca   - also start the Fabric CA (needed to enroll per-role identities)
#   down     - tear the network down
set -euo pipefail

# Keep Docker's Linux socket path unchanged while allowing Fabric's native
# Windows binaries to receive normal /d/... path conversion.
export MSYS_ENV_CONV_EXCL='DOCKER_SOCK'
export MSYS2_ENV_CONV_EXCL='DOCKER_SOCK'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_NET="$SCRIPT_DIR/fabric-samples/test-network"

if [ ! -d "$TEST_NET" ]; then
  echo "test-network not found. Run ./bootstrap.sh first." >&2
  exit 1
fi

cd "$TEST_NET"

case "${1:-up}" in
  up)
    echo "==> Starting Fabric base network (Org1/KVIC + Org2/Factory)"
    ./network.sh up -ca -s couchdb
    echo "==> Base network up. Run ./deployChaincode.sh to create honeychannel and add Org3/Lab."
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
