#!/usr/bin/env bash
# HoneyChain - enroll Fabric identities for each role used by the backend.
#
# The backend signs transactions custodially under a specific role identity. The
# chaincode authorizes writes using the client identity 'role' attribute (e.g.
# "Beekeeper", "LabTech", ...). This script registers and enrolls an identity
# per role via the Fabric CA, embedding the 'role' attribute in each X.509 cert.
#
# The test-network org CA (org1) grants its bootstrap `admin` full registrar
# attributes (hf.Registrar.Attributes=*), so registering users with the custom
# `role` ecert attribute is permitted.
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

CA_HOST="localhost:7054"
ADMIN_USER="admin"
ADMIN_PW="adminpw"
TLS_CERT="$TEST_NET/organizations/fabric-ca/org1/tls-cert.pem"

OUT="$SCRIPT_DIR/identities"

if [ ! -f "$TLS_CERT" ]; then
  echo "CA TLS cert not found at $TLS_CERT. Run ./bootstrap.sh && ./up.sh up -ca first." >&2
  exit 1
fi

# Enroll a new role identity.
enroll_role() {
  local role="$1"
  local id="${role,,}" # lowercase, e.g. Beekeeper -> beekeeper
  local dir="$OUT/$role"
  local caAdminURL="https://${ADMIN_USER}:${ADMIN_PW}@${CA_HOST}"
  local caUserURL="https://${id}:${id}pw@${CA_HOST}"

  echo "==> Registering identity '$id' with role=$role"

  # Register the identity with the app.role attribute (idempotent).
  fabric-ca-client register -u "$caAdminURL" \
    --tls.certfiles "$TLS_CERT" \
    --id.name "$id" \
    --id.secret "${id}pw" \
    --id.type client \
    --id.affiliation org1.department1 \
    --id.attrs "role=${role}:ecert" >/dev/null 2>&1 \
    || echo "  (identity '$id' may already be registered; continuing)"

  echo "==> Enrolling identity '$id' into $dir"
  mkdir -p "$dir"
  fabric-ca-client enroll -u "$caUserURL" \
    --tls.certfiles "$TLS_CERT" \
    --enrollment.attrs "role" \
    -M "$dir/msp"
  cp "$dir/msp/signcerts/"* "$dir/signcert.pem" 2>/dev/null || true
  echo "  -> enrolled $dir"
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