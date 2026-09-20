#!/usr/bin/env bash
# MadhuChain - Fabric network bootstrap
# Downloads Hyperledger Fabric binaries, Docker images and fabric-samples
# (test-network) into ./fabric-samples. Idempotent: safe to re-run.
#
# Usage:  ./bootstrap.sh
# Prereq: Docker + Docker Compose running, network access.
set -euo pipefail

FABRIC_VERSION="${FABRIC_VERSION:-2.5.12}"
FABRIC_CA_VERSION="${FABRIC_CA_VERSION:-1.5.15}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/fabric-samples"

echo "==> Downloading install-fabric.sh"
curl -sSLO "https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh"
chmod +x install-fabric.sh

echo "==> Downloading fabric-samples, binaries and Docker images (versions: fabric=${FABRIC_VERSION}, ca=${FABRIC_CA_VERSION})"
# Installs docker images, the fabric binaries and the samples (test-network, etc.)
./install-fabric.sh --fabric-version "$FABRIC_VERSION" docker samples binary

echo "==> Bootstrap complete."
echo "    Next: ./up.sh  (brings up 1-org test network)"
echo "    Then:  ./deployChaincode.sh (creates madhuchain-channel + deploys madhuchain-cc)"
