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
# `role` ecert attribute is permitted. The admin client must itself be enrolled
# before it can register identities, so the script enrolls it into ./caadmin.
#
# NOTE: The CA's bootstrap identity is named `admin` (no role attribute), so the
# Admin role uses a separate CA identity 'honeyadmin' to carry role=Admin.
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
ADMIN_HOME="$SCRIPT_DIR/caadmin"

if [ ! -f "$TLS_CERT" ]; then
  echo "CA TLS cert not found at $TLS_CERT. Run ./bootstrap.sh && ./up.sh up -ca first." >&2
  exit 1
fi

# The registrar (admin) must be enrolled before it can register identities.
echo "==> Enrolling CA registrar '$ADMIN_USER'"
mkdir -p "$ADMIN_HOME"
export FABRIC_CA_CLIENT_HOME="$ADMIN_HOME"
fabric-ca-client enroll -u "https://${ADMIN_USER}:${ADMIN_PW}@${CA_HOST}" \
  --tls.certfiles "$TLS_CERT" 2>/dev/null || echo "  (registrar already enrolled)"

# Enroll a role identity. $2 = CA identity id (defaults to lowercase role).
enroll_role() {
  local role="$1"
  local id="${2:-${role,,}}"
  local secret="${id}pw"
  local dir="$OUT/$role"
  local caAdminURL="https://${ADMIN_USER}:${ADMIN_PW}@${CA_HOST}"
  local caUserURL="https://${id}:${secret}@${CA_HOST}"

  echo "==> Registering identity '$id' with role=$role"
  local reg_out
  reg_out="$(fabric-ca-client register -u "$caAdminURL" \
    --tls.certfiles "$TLS_CERT" \
    --id.name "$id" \
    --id.secret "$secret" \
    --id.type client \
    --id.affiliation org1.department1 \
    --id.attrs "role=${role}:ecert" 2>&1)" || {
    case "$reg_out" in
      *"already registered"*) echo "  (identity '$id' already registered; continuing)" ;;
      *) echo "$reg_out" >&2; exit 1 ;;
    esac
  }

  echo "==> Enrolling identity '$id' into $dir"
  mkdir -p "$dir"
  fabric-ca-client enroll -u "$caUserURL" \
    --tls.certfiles "$TLS_CERT" \
    --enrollment.attrs "role" \
    -M "$dir/msp"
  cp "$dir/msp/signcerts/"* "$dir/signcert.pem" 2>/dev/null || true
  echo "  -> enrolled $dir"
}

enroll_role "Beekeeper"
enroll_role "Transporter"
enroll_role "LabTech"
enroll_role "FactoryWorker"
enroll_role "QCManager"
enroll_role "Distributor"
enroll_role "Admin" "honeyadmin"

echo "==> Identity enrollment complete. See $OUT"
ls -1 "$OUT"