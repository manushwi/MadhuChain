#!/usr/bin/env bash
# HoneyChain - enroll Fabric identities for each role used by the backend.
#
# The backend signs transactions custodially under a specific role identity. The
# chaincode authorizes writes using the client identity 'role' attribute (e.g.
# "Beekeeper", "LabTech", ...). This script registers and enrolls an identity
# per role via the Fabric CA, embedding the 'role' attribute in each X.509 cert.
#
# Requires the network to be up with a CA (./up.sh up -ca).
#
# Usage: ./enrollIdentities.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FABRIC_SAMPLES="$SCRIPT_DIR/fabric-samples"
TEST_NET="$FABRIC_SAMPLES/test-network"

export PATH="$TEST_NET/../bin:$PATH"
export FABRIC_CFG_PATH="$TEST_NET/../config"

ORG="org1.example.com"
CA_HOST="localhost:7054"
ADMIN_USER="admin"
ADMIN_PW="adminpw"
MSPID="Org1MSP"
TLS_CERT="$TEST_NET/organizations/fabric-ca/org1/tls-cert.pem"

OUT="$SCRIPT_DIR/identities"

# Enroll a new role identity.
enroll_role() {
  local role="$1"
  local dir="$OUT/$role"
  echo "==> Registering/enrolling identity for role '$role'"
  fabric-ca-client identity list --url "https://$CA_HOST" \
    --tls.certfiles "$TLS_CERT" \
    --id.name "$ADMIN_USER" --id.secret "$ADMIN_PW" >/dev/null 2>&1 || true

  # Register the identity with the app.role attribute (idempotent-ish).
  fabric-ca-client register \
    --id.name "${role,,}" \
    --id.secret "${role,,}pw" \
    --id.type client \
    --id.affiliation org1.department1 \
    --id.attrs "role=$role:ecert" \
    --url "https://$CA_HOST" \
    --tls.certfiles "$TLS_CERT" \
    --id.name "$ADMIN_USER" --id.secret "$ADMIN_PW" >/dev/null 2>&1 || echo "  (register maybe already exists)"

  mkdir -p "$dir"
  fabric-ca-client enroll \
    -u "https://${role,,}:${role,,}pw@$CA_HOST" \
    --tls.certfiles "$TLS_CERT" \
    --enrollment.attrs "role" \
    -M "$dir/msp"
  cp "$dir/msp/signcerts/"* "$dir/signcert.pem" 2>/dev/null || true
  echo "  -> enrolled $(pwd)/$dir"
}

mkdir -p "$OUT"

enroll_role "Beekeeper"
enroll_role "Transporter"
enroll_role "LabTech"
enroll_role "FactoryWorker"
enroll_role "QCManager"
enroll_role "Distributor"
enroll_role "Admin"

echo "==> Identity enrollment complete. See $OUT"
ls -1 "$OUT"
