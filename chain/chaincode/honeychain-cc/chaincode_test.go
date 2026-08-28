package main

import (
	"crypto/x509"
	"errors"
	"strings"
	"testing"

	"github.com/golang/protobuf/ptypes/timestamp"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
	"github.com/hyperledger/fabric-chaincode-go/shim"
)

// ---- Fakes -----------------------------------------------------------------

type clientIdentityMock struct {
	attrs map[string]string
}

func (ci *clientIdentityMock) GetID() (string, error)    { return "client-id", nil }
func (ci *clientIdentityMock) GetMSPID() (string, error) { return "Org1MSP", nil }
func (ci *clientIdentityMock) GetX509Certificate() (*x509.Certificate, error) {
	return nil, nil
}
func (ci *clientIdentityMock) GetAttributeValue(attrName string) (string, bool, error) {
	v, ok := ci.attrs[attrName]
	return v, ok, nil
}
func (ci *clientIdentityMock) AssertAttributeValue(attrName, attrValue string) error {
	v, ok := ci.attrs[attrName]
	if !ok || v != attrValue {
		return errors.New("attribute mismatch")
	}
	return nil
}

type memStub struct {
	*shim.ChaincodeStub
	state map[string][]byte
}

func newMemStub() *memStub { return &memStub{ChaincodeStub: nil, state: map[string][]byte{}} }

func (m *memStub) GetState(key string) ([]byte, error)                  { return m.state[key], nil }
func (m *memStub) PutState(key string, value []byte) error              { m.state[key] = value; return nil }
func (m *memStub) GetTxTimestamp() (*timestamp.Timestamp, error)        { return &timestamp.Timestamp{Seconds: 1700000000}, nil }

type fakeCtx struct {
	stub shim.ChaincodeStubInterface
	ci   cid.ClientIdentity
}

func (f *fakeCtx) GetStub() shim.ChaincodeStubInterface  { return f.stub }
func (f *fakeCtx) GetClientIdentity() cid.ClientIdentity { return f.ci }

func newCtx(role string) *fakeCtx {
	return &fakeCtx{
		stub: newMemStub(),
		ci:   &clientIdentityMock{attrs: map[string]string{"role": role}},
	}
}

func setRole(ctx *fakeCtx, role string) {
	ctx.ci = &clientIdentityMock{attrs: map[string]string{"role": role}}
}

func mint(t *testing.T, cc *HoneyChainContract, ctx *fakeCtx, batchID string) {
	t.Helper()
	setRole(ctx, RoleBeekeeper)
	_, err := cc.MintBatch(ctx, batchID, "HC-LOT-"+batchID,
		`["H-001"]`, "2026-08-01", "2026-08-28", 18.5, "hash123",
		`{"lot_id":"HC-LOT","weight_kg":18.5,"harvest_date":"2026-08-28"}`)
	if err != nil {
		t.Fatalf("mint failed: %v", err)
	}
}

// ---- Tests -----------------------------------------------------------------

func TestMintCreatesReceivedBatch(t *testing.T) {
	cc := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper)
	mint(t, cc, ctx, "BATCH-1")

	b, err := cc.GetBatch(ctx, "BATCH-1")
	if err != nil {
		t.Fatalf("get failed: %v", err)
	}
	if b.State != StateReceived {
		t.Fatalf("expected RECEIVED, got %s", b.State)
	}
	if b.LotID != "HC-LOT-BATCH-1" {
		t.Fatalf("unexpected lot: %s", b.LotID)
	}
}

func TestNonBeekeeperCannotMint(t *testing.T) {
	cc := NewHoneyChainContract()
	ctx := newCtx(RoleFactoryWorker)
	_, err := cc.MintBatch(ctx, "BATCH-X", "HC-LOT-X",
		`["H-001"]`, "a", "b", 10, "h", `{}`)
	if err == nil {
		t.Fatalf("expected unauthorized mint to fail")
	}
	if !strings.Contains(err.Error(), "unauthorized") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestStateMachineRejectsSkips(t *testing.T) {
	cc := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper)
	mint(t, cc, ctx, "B1")

	setRole(ctx, RoleFactoryWorker)
	err := cc.RecordPackaging(ctx, "B1", 10, 1.0)
	if err == nil {
		t.Fatalf("expected packaging before intake to be rejected")
	}
	if b, _ := cc.GetBatch(ctx, "B1"); b.State != StateReceived {
		t.Fatalf("state should remain RECEIVED, got %s", b.State)
	}
}

func TestCompositionalDriftFlagsBatch(t *testing.T) {
	cc := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper)
	mint(t, cc, ctx, "B2")

	setRole(ctx, RoleLabTech)
	if err := cc.RecordQualityTest(ctx, "B2", "intake", 17.0, 3.0, 8.0,
		`{"fructose":38,"glucose":31,"sucrose":1}`, -24.5); err != nil {
		t.Fatalf("intake test failed: %v", err)
	}

	// Sucrose jumps from 1 -> 11 (>0.3 tolerance) = classic syrup adulteration.
	if err := cc.RecordQualityTest(ctx, "B2", "output", 17.0, 3.0, 8.0,
		`{"fructose":38,"glucose":20,"sucrose":11}`, -24.5); err != nil {
		t.Fatalf("output test failed: %v", err)
	}

	b, _ := cc.GetBatch(ctx, "B2")
	if !b.Flagged {
		t.Fatalf("expected batch to be FLAGGED on compositional drift")
	}
	if b.State != StateFlagged {
		t.Fatalf("expected FLAGGED state, got %s", b.State)
	}
}

func TestClearFlagAllowedByQCManagerOnly(t *testing.T) {
	cc := NewHoneyChainContract()
	ctx := newCtx(RoleBeekeeper)
	mint(t, cc, ctx, "B3")
	setRole(ctx, RoleLabTech)
	_ = cc.RecordQualityTest(ctx, "B3", "intake", 17.0, 3.0, 8.0,
		`{"fructose":38,"glucose":31,"sucrose":1}`, -24.5)
	_ = cc.RecordQualityTest(ctx, "B3", "output", 17.0, 3.0, 8.0,
		`{"fructose":38,"glucose":20,"sucrose":11}`, -24.5)

	setRole(ctx, RoleFactoryWorker)
	if err := cc.ClearFlag(ctx, "B3", "CLEARED"); err == nil {
		t.Fatalf("expected factory worker to be denied clearing the flag")
	}

	setRole(ctx, RoleQCManager)
	if err := cc.ClearFlag(ctx, "B3", "CLEARED"); err != nil {
		t.Fatalf("failed to clear flag: %v", err)
	}
	if b, _ := cc.GetBatch(ctx, "B3"); b.Flagged {
		t.Fatalf("expected flag cleared")
	}
}
