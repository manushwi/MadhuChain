#!/usr/bin/env bash
# Enroll custodial application identities under their owning Fabric org.
# Generated MSP material is written to ./identities and is ignored by Git.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FABRIC_SAMPLES="$SCRIPT_DIR/fabric-samples"
TEST_NET="$FABRIC_SAMPLES/test-network"

export PATH="$TEST_NET/../bin:$PATH"
export FABRIC_CFG_PATH="$TEST_NET/../config"

OUT="$SCRIPT_DIR/identities"
REGISTRARS="$SCRIPT_DIR/caadmin"

enroll_role() {
  local org="$1"
  local msp="$2"
  local port="$3"
  local ca_name="$4"
  local affiliation="$5"
  local tls_cert="$6"
  local role="$7"
  local id="${8:-${role,,}}"
  local secret="${id}pw"
  local registrar_home="$REGISTRARS/$org"
  local identity_dir="$OUT/$role"

  if [ ! -f "$tls_cert" ]; then
    echo "CA TLS certificate not found: $tls_cert" >&2
    echo "Run ./up.sh up and ./deployChaincode.sh before enrolling identities." >&2
    exit 1
  fi

  mkdir -p "$registrar_home" "$identity_dir"
  export FABRIC_CA_CLIENT_HOME="$registrar_home"
  fabric-ca-client enroll \
    -u "https://admin:adminpw@localhost:${port}" \
    --caname "$ca_name" \
    --tls.certfiles "$tls_cert" >/dev/null 2>&1 || true

  local registration
  registration="$(fabric-ca-client register \
    --caname "$ca_name" \
    --tls.certfiles "$tls_cert" \
    --id.name "$id" \
    --id.secret "$secret" \
    --id.type client \
    --id.affiliation "$affiliation" \
    --id.attrs "role=${role}:ecert" 2>&1)" || {
      case "$registration" in
        *"already registered"*) ;;
        *) echo "$registration" >&2; exit 1 ;;
      esac
    }

  export FABRIC_CA_CLIENT_HOME="$identity_dir"
  fabric-ca-client enroll \
    -u "https://${id}:${secret}@localhost:${port}" \
    --caname "$ca_name" \
    --tls.certfiles "$tls_cert" \
    --enrollment.attrs role \
    -M "$identity_dir/msp"
  cp "$identity_dir/msp/signcerts/"* "$identity_dir/signcert.pem" 2>/dev/null || true
  printf '%s\n' "$msp" > "$identity_dir/msp-id"
  echo "  -> $role enrolled under $msp"
}

ORG1_TLS="$TEST_NET/organizations/fabric-ca/org1/tls-cert.pem"
ORG2_TLS="$TEST_NET/organizations/fabric-ca/org2/tls-cert.pem"
ORG3_TLS="$TEST_NET/addOrg3/fabric-ca/org3/tls-cert.pem"

echo "==> KVIC identities (Org1MSP)"
enroll_role org1 Org1MSP 7054 ca-org1 org1.department1 "$ORG1_TLS" Beekeeper
enroll_role org1 Org1MSP 7054 ca-org1 org1.department1 "$ORG1_TLS" QCManager
enroll_role org1 Org1MSP 7054 ca-org1 org1.department1 "$ORG1_TLS" Admin honeyadmin

echo "==> Collection/Factory identities (Org2MSP)"
enroll_role org2 Org2MSP 8054 ca-org2 org2.department1 "$ORG2_TLS" Transporter
enroll_role org2 Org2MSP 8054 ca-org2 org2.department1 "$ORG2_TLS" FactoryWorker
enroll_role org2 Org2MSP 8054 ca-org2 org2.department1 "$ORG2_TLS" Distributor

echo "==> Certified Lab identity (Org3MSP)"
enroll_role org3 Org3MSP 11054 ca-org3 org3.department1 "$ORG3_TLS" LabTech

echo "==> Identity enrollment complete: $OUT"
