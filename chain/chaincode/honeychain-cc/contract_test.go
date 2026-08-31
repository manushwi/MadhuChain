package main

import (
	"crypto/x509"
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-chaincode-go/shim"
)

const testHash = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

type clientIdentityMock struct {
	attrs map[string]string
	msp   string
}

func (ci *clientIdentityMock) GetID() (string, error)                         { return "client-id", nil }
func (ci *clientIdentityMock) GetMSPID() (string, error)                      { return ci.msp, nil }
func (ci *clientIdentityMock) GetX509Certificate() (*x509.Certificate, error) { return nil, nil }
func (ci *clientIdentityMock) GetAttributeValue(name string) (string, bool, error) {
	value, ok := ci.attrs[name]
	return value, ok, nil
}
func (ci *clientIdentityMock) AssertAttributeValue(name, expected string) error {
	value, ok := ci.attrs[name]
	if !ok || value != expected {
		return errors.New("attribute mismatch")
	}
	return nil
}

type memStub struct {
	*shim.ChaincodeStub
	state      map[string][]byte
	eventName  string
	eventBytes []byte
}

func newMemStub() *memStub                                 { return &memStub{state: map[string][]byte{}} }
func (m *memStub) GetState(key string) ([]byte, error)     { return m.state[key], nil }
func (m *memStub) PutState(key string, value []byte) error { m.state[key] = value; return nil }
func (m *memStub) GetTxTimestamp() (*timestamp.Timestamp, error) {
	return &timestamp.Timestamp{Seconds: 1700000000}, nil
}
func (m *memStub) GetTxID() string { return "tx-123" }
func (m *memStub) SetEvent(name string, payload []byte) error {
	m.eventName, m.eventBytes = name, payload
	return nil
}

type fakeCtx struct {
	stub shim.ChaincodeStubInterface
	ci   cid.ClientIdentity
}

func (f *fakeCtx) GetStub() shim.ChaincodeStubInterface  { return f.stub }
func (f *fakeCtx) GetClientIdentity() cid.ClientIdentity { return f.ci }

func newCtx(role, msp string) *fakeCtx {
	return &fakeCtx{stub: newMemStub(), ci: &clientIdentityMock{attrs: map[string]string{"role": role}, msp: msp}}
}

func setActor(ctx *fakeCtx, role, msp string) {
	ctx.ci = &clientIdentityMock{attrs: map[string]string{"role": role}, msp: msp}
}

func createBatch(t *testing.T, contract *HoneyChainContract, ctx *fakeCtx, id string) {
	t.Helper()
	setActor(ctx, RoleBeekeeper, "Org1MSP")
	if _, err := contract.CreateHarvestBatch(ctx, id, testHash, testHash, testHash); err != nil {
		t.Fatalf("create batch: %v", err)
	}
}

func TestCreateHarvestBatchStoresOnlyHashesAndEmitsProof(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	batch, err := contract.CreateHarvestBatch(ctx, "HC-001", testHash, "sha256:"+testHash, testHash)
	if err != nil {
		t.Fatal(err)
	}
	if batch.CurrentStatus != StatusHarvested || batch.CurrentCustodianMSP != "Org1MSP" {
		t.Fatalf("unexpected batch: %+v", batch)
	}
	if batch.HiveHash != "sha256:"+testHash {
		t.Fatalf("hash was not normalized: %s", batch.HiveHash)
	}
	stub := ctx.stub.(*memStub)
	if stub.eventName != "HarvestBatchCreated" {
		t.Fatalf("unexpected event %q", stub.eventName)
	}
	var event ChainEventRecord
	if err := json.Unmarshal(stub.eventBytes, &event); err != nil {
		t.Fatal(err)
	}
	if event.TransactionID != "tx-123" || event.ActorMSP != "Org1MSP" || event.PayloadHash != "sha256:"+testHash {
		t.Fatalf("incomplete event: %+v", event)
	}
	if stub.state[eventKeyPrefix+"tx-123"] == nil {
		t.Fatal("event proof was not persisted")
	}
}

func TestOrganizationAndRolePermissions(t *testing.T) {
	contract := NewHoneyChainContract()
	for _, tc := range []struct{ role, msp string }{
		{RoleFactoryWorker, "Org1MSP"},
		{RoleBeekeeper, "Org2MSP"},
		{RoleBeekeeper, "Org3MSP"},
	} {
		ctx := newCtx(tc.role, tc.msp)
		if _, err := contract.CreateHarvestBatch(ctx, "DENIED", testHash, testHash, testHash); err == nil {
			t.Fatalf("expected %s/%s to be denied", tc.role, tc.msp)
		}
	}
}

func TestHashOnlyLifecycleToRelease(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "FLOW-1")
	setActor(ctx, RoleTransporter, "Org2MSP")
	if err := contract.RecordCollection(ctx, "FLOW-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	setActor(ctx, RoleLabTech, "Org3MSP")
	if err := contract.RecordLabResult(ctx, "FLOW-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	setActor(ctx, RoleFactoryWorker, "Org2MSP")
	if err := contract.RecordProcessing(ctx, "FLOW-1", testHash); err != nil {
		t.Fatal(err)
	}
	setActor(ctx, RoleLabTech, "Org3MSP")
	if err := contract.RecordLabResult(ctx, "FLOW-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	setActor(ctx, RoleFactoryWorker, "Org2MSP")
	if err := contract.RecordPackaging(ctx, "FLOW-1", testHash, testHash); err != nil {
		t.Fatal(err)
	}
	batch, _ := contract.GetBatch(ctx, "FLOW-1")
	if batch.CurrentStatus != StatusReleased {
		t.Fatalf("expected RELEASED after packaging, got %s", batch.CurrentStatus)
	}
	if batch.CurrentCustodianMSP != "Org2MSP" {
		t.Fatalf("expected custody with the packaging worker org after release, got %s", batch.CurrentCustodianMSP)
	}
	// Once packaged the lot is released; no further lab pass is required and a
	// lab result must be rejected.
	setActor(ctx, RoleLabTech, "Org3MSP")
	if err := contract.RecordLabResult(ctx, "FLOW-1", testHash, true); err == nil {
		t.Fatal("lab result on a released batch must be rejected")
	}
}

func TestRejectedCollectionIsTerminal(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "REJECT-1")
	setActor(ctx, RoleTransporter, "Org2MSP")
	if err := contract.RecordCollection(ctx, "REJECT-1", testHash, false); err != nil {
		t.Fatal(err)
	}
	if err := contract.RecordCollection(ctx, "REJECT-1", testHash, true); err == nil {
		t.Fatal("rejected collection must be terminal")
	}
}

func TestCustodyRequiresCurrentCustodian(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "CUSTODY-1")
	setActor(ctx, RoleTransporter, "Org2MSP")
	if err := contract.TransferCustody(ctx, "CUSTODY-1", "BATCH", "Org1MSP", "Org2MSP", testHash); err == nil {
		t.Fatal("non-custodian organization transferred asset")
	}
	setActor(ctx, RoleBeekeeper, "Org1MSP")
	if err := contract.TransferCustody(ctx, "CUSTODY-1", "BATCH", "Org1MSP", "Org2MSP", testHash); err != nil {
		t.Fatal(err)
	}
	batch, _ := contract.GetBatch(ctx, "CUSTODY-1")
	if batch.CurrentCustodianMSP != "Org2MSP" {
		t.Fatalf("unexpected custodian %s", batch.CurrentCustodianMSP)
	}
}

func TestTransporterTakesCustodyOnCollectionThenTransfers(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "HANDOFF-1")
	// The transporter receives the lot and, on acceptance, custody moves from
	// the beekeeper's org (Org1MSP) to the transporter's org (Org2MSP) on-chain.
	setActor(ctx, RoleTransporter, "Org2MSP")
	if err := contract.RecordCollection(ctx, "HANDOFF-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	batch, _ := contract.GetBatch(ctx, "HANDOFF-1")
	if batch.CurrentCustodianMSP != "Org2MSP" {
		t.Fatalf("expected custody with transporter org after collection, got %s", batch.CurrentCustodianMSP)
	}
	// The custodian org can now transfer custody onward to another organization.
	setActor(ctx, RoleFactoryWorker, "Org2MSP")
	if err := contract.TransferCustody(ctx, "HANDOFF-1", "BATCH", "Org2MSP", "Org3MSP", testHash); err != nil {
		t.Fatalf("custodian org could not transfer onward: %v", err)
	}
	batch, _ = contract.GetBatch(ctx, "HANDOFF-1")
	if batch.CurrentCustodianMSP != "Org3MSP" {
		t.Fatalf("custody did not move to Org3MSP, got %s", batch.CurrentCustodianMSP)
	}
}

func TestCustodyIntraOrgReassignment(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "INTRA-1")
	// Transporter collects, moving custody to Org2MSP on chain.
	setActor(ctx, RoleTransporter, "Org2MSP")
	if err := contract.RecordCollection(ctx, "INTRA-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	// A hand-off to another operator within the same org (toMSP == fromMSP)
	// is permitted and recorded as a custody event without changing the org.
	setActor(ctx, RoleFactoryWorker, "Org2MSP")
	if err := contract.TransferCustody(ctx, "INTRA-1", "BATCH", "Org2MSP", "Org2MSP", testHash); err != nil {
		t.Fatalf("intra-org reassignment should be permitted: %v", err)
	}
	batch, _ := contract.GetBatch(ctx, "INTRA-1")
	if batch.CurrentCustodianMSP != "Org2MSP" {
		t.Fatalf("custody should stay Org2MSP, got %s", batch.CurrentCustodianMSP)
	}
}

func TestOnlyKVICCanRevoke(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "REVOKE-1")
	setActor(ctx, RoleAdmin, "Org2MSP")
	if err := contract.RevokeBatch(ctx, "REVOKE-1", testHash); err == nil {
		t.Fatal("factory admin revoked batch")
	}
	setActor(ctx, RoleAdmin, "Org1MSP")
	if err := contract.RevokeBatch(ctx, "REVOKE-1", testHash); err != nil {
		t.Fatal(err)
	}
	batch, _ := contract.GetBatch(ctx, "REVOKE-1")
	if !batch.Revoked || batch.CurrentStatus != StatusRevoked {
		t.Fatalf("batch not revoked: %+v", batch)
	}
}

func TestVerifyBatchHash(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "VERIFY-1")
	verified, err := contract.VerifyBatchHash(ctx, "VERIFY-1", testHash)
	if err != nil || !verified {
		t.Fatalf("expected anchored hash, verified=%v err=%v", verified, err)
	}
	other := strings.Repeat("b", 64)
	verified, err = contract.VerifyBatchHash(ctx, "VERIFY-1", other)
	if err != nil || verified {
		t.Fatalf("unexpected hash match, verified=%v err=%v", verified, err)
	}
}

func TestFactoryCanCreateHashOnlyBlend(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleFactoryWorker, "Org2MSP")
	batch, err := contract.CreateBlendBatch(ctx, "BLEND-1", testHash, testHash)
	if err != nil {
		t.Fatal(err)
	}
	if batch.BatchType != "BLEND" || batch.CurrentStatus != StatusProcessed || batch.SourceSummaryHash != "sha256:"+testHash {
		t.Fatalf("unexpected blend: %+v", batch)
	}
}

func TestKVICResolvesFraudFlag(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	createBatch(t, contract, ctx, "FLAG-1")
	setActor(ctx, RoleFactoryWorker, "Org2MSP")
	if err := contract.FlagBatch(ctx, "FLAG-1", testHash); err != nil {
		t.Fatal(err)
	}
	setActor(ctx, RoleQCManager, "Org1MSP")
	if err := contract.ResolveFlag(ctx, "FLAG-1", testHash, true); err != nil {
		t.Fatal(err)
	}
	batch, _ := contract.GetBatch(ctx, "FLAG-1")
	if batch.Flagged || batch.CurrentStatus != StatusHarvested {
		t.Fatalf("flag was not cleared: %+v", batch)
	}
}

func TestInvalidHashIsRejected(t *testing.T) {
	contract := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper, "Org1MSP")
	if _, err := contract.CreateHarvestBatch(ctx, "BAD-HASH", "raw hive id", testHash, testHash); err == nil {
		t.Fatal("raw value was accepted as a hash")
	}
}
