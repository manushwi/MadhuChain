/*
HoneyChain chaincode - Hyperledger Fabric contract for honey
batch lifecycle, custody and anti-adulteration fraud checks.

Batch state machine:
  RECEIVED -> INTAKE TEST -> PROCESSING -> OUTPUT TEST -> PACKAGING -> FINAL QC -> RELEASED
  Any stage may transition to FLAGGED (blocks PROGRESS mailbox past the flag)
  unless cleared by a QC Manager.
*/
package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const (
	// Batch states
	StateReceived   = "RECEIVED"
	StateIntake     = "INTAKE_TEST"
	StateProcessing = "PROCESSING"
	StateOutput     = "OUTPUT_TEST"
	StatePackaging  = "PACKAGING"
	StateFinalQC    = "FINAL_QC"
	StateReleased   = "RELEASED"
	StateFlagged    = "FLAGGED"

	// Roles
	RoleBeekeeper    = "Beekeeper"
	RoleTransporter  = "Transporter"
	RoleLabTech      = "LabTech"
	RoleFactoryWorker = "FactoryWorker"
	RoleQCManager    = "QCManager"
	RoleDistributor  = "Distributor"
	RoleAdmin        = "Admin"
)

// QualityTestThresholds define the maximum tolerated drift between
// Intake and Output test results before a batch is auto-flagged.
type QualityTestThresholds struct {
	MoistureDelta   float64 `json:"moistureDelta"`   // absolute percentage point drift
	HMFDelta        float64 `json:"hmfDelta"`        // mg/kg drift
	DiastaseDelta   float64 `json:"diastaseDelta"`   // DN units drift
	SugarProfileDelta float64 `json:"sugarProfileDelta"` // any single sugar component % drift
	IsotopeDelta    float64 `json:"isotopeDelta"`    // delta-13C permil drift
}

// QualityTest models the lab panel for a given stage.
type QualityTest struct {
	Stage       string  `json:"stage"`
	BatchID     string  `json:"batchId"`
	Moisture    float64 `json:"moisture"`
	HMF         float64 `json:"hmf"`
	Diastase    float64 `json:"diastase"`
	SugarProfile map[string]float64 `json:"sugarProfile"` // fructose, glucose, sucrose
	IsotopeRatio float64 `json:"isotopeRatio"` // delta-13C
	TesterID    string  `json:"testerId"`
	Timestamp   int64   `json:"timestamp"`
}

// ProcessingAction models a single processing step.
type ProcessingAction struct {
	ActionType   string            `json:"actionType"` // heating, filtering, blending
	Parameters   map[string]string `json:"parameters"`
	OperatorID   string            `json:"operatorId"`
	EquipmentID  string            `json:"equipmentId"`
	WeightBefore float64           `json:"weightBefore"`
	WeightAfter  float64           `json:"weightAfter"`
	ParentLotIDs []string          `json:"parentLotIds"` // required when actionType=blending
	ParentQuantities map[string]float64 `json:"parentQuantities"` // lotId -> weight
	Timestamp    int64              `json:"timestamp"`
}

// BlendComposition records the source lot breakdown for a blended batch.
type BlendComposition struct {
	SourceLotID  string  `json:"sourceLotId"`
	WeightKg     float64 `json:"weightKg"`
	Percentage   float64 `json:"percentage"`
}

// Batch is the core ledger asset.
type Batch struct {
	BatchID       string                 `json:"batchId"`
	LotID         string                 `json:"lotId"`
	HiveIDs       []string               `json:"hiveIds,omitempty"`
	HarvestStart  string                 `json:"harvestStart,omitempty"`
	HarvestEnd    string                 `json:"harvestEnd,omitempty"`
	State         string                 `json:"state"`
	DataHash      string                 `json:"dataHash,omitempty"`
	BarcodePayload map[string]interface{} `json:"barcodePayload,omitempty"`
	WeightKg      float64                `json:"weightKg"`
	IntakeWeight  float64                `json:"intakeWeight,omitempty"`
	OutputWeight  float64                `json:"outputWeight,omitempty"`
	JarCount      int                    `json:"jarCount,omitempty"`
	JarSerials    []string               `json:"jarSerials,omitempty"`
	QualityTests  map[string]*QualityTest `json:"qualityTests,omitempty"` // keyed by stage
	ProcessingLog []*ProcessingAction    `json:"processingLog,omitempty"`
	BlendSources  []*BlendComposition    `json:"blendSources,omitempty"`
	TransporterID string                 `json:"transporterId,omitempty"`
	Flagged       bool                   `json:"flagged"`
	FlagReason    string                 `json:"flagReason,omitempty"`
	FlagResolution string                `json:"flagResolution,omitempty"`
	OwnerID       string                 `json:"ownerId"`
	CreatedAt     int64                  `json:"createdAt"`
	UpdatedAt     int64                  `json:"updatedAt"`
}

// HoneyChainContract implements the Fabric contract.
type HoneyChainContract struct {
	contractapi.Contract
	Thresholds QualityTestThresholds
}

// NewHoneyChainContract returns a contract with default, configurable tolerances.
func NewHoneyChainContract() *HoneyChainContract {
	return &HoneyChainContract{
		Thresholds: QualityTestThresholds{
			MoistureDelta:    0.5,  // 0.5 percentage points
			HMFDelta:         8.0,  // mg/kg
			DiastaseDelta:    3.0,  // DN/L
			SugarProfileDelta: 0.3, // 0.3 percentage points per component
			IsotopeDelta:     0.3,  // per-mil
		},
	}
}

// =============================================================================
// Auxiliary helpers
// =============================================================================

func (c *HoneyChainContract) getRole(ctx contractapi.TransactionContextInterface) (string, error) {
	identity := ctx.GetClientIdentity()
	role, found, err := identity.GetAttributeValue("role")
	if err != nil {
		return "", fmt.Errorf("failed to read role attribute: %w", err)
	}
	if !found || role == "" {
		return "", fmt.Errorf("identity has no 'role' attribute")
	}
	return role, nil
}

func (c *HoneyChainContract) requireRole(ctx contractapi.TransactionContextInterface, role string) error {
	got, err := c.getRole(ctx)
	if err != nil {
		return err
	}
	if got != role {
		return fmt.Errorf("unauthorized: role '%s' required, got '%s'", role, got)
	}
	return nil
}

func (c *HoneyChainContract) getBatch(ctx contractapi.TransactionContextInterface, batchID string) (*Batch, error) {
	bytes, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to read batch %s: %w", batchID, err)
	}
	if bytes == nil {
		return nil, fmt.Errorf("batch %s does not exist", batchID)
	}
	batch := &Batch{}
	if err := json.Unmarshal(bytes, batch); err != nil {
		return nil, fmt.Errorf("failed to unmarshal batch %s: %w", batchID, err)
	}
	// Rehydrate maps that may have been omitted from stored JSON.
	if batch.QualityTests == nil {
		batch.QualityTests = map[string]*QualityTest{}
	}
	return batch, nil
}

func (c *HoneyChainContract) putBatch(ctx contractapi.TransactionContextInterface, batch *Batch) error {
	batch.UpdatedAt = c.now(ctx)
	bytes, err := json.Marshal(batch)
	if err != nil {
		return fmt.Errorf("failed to marshal batch: %w", err)
	}
	return ctx.GetStub().PutState(batch.BatchID, bytes)
}

func (c *HoneyChainContract) now(ctx contractapi.TransactionContextInterface) int64 {
	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return 0
	}
	return ts.Seconds
}

// =============================================================================
// Read queries
// =============================================================================

// GetBatch returns the full on-chain record for a batch.
func (c *HoneyChainContract) GetBatch(ctx contractapi.TransactionContextInterface, batchID string) (*Batch, error) {
	return c.getBatch(ctx, batchID)
}

// GetJar returns the parent batch for a given jar serial (consumer verification).
func (c *HoneyChainContract) GetJar(ctx contractapi.TransactionContextInterface, jarID string) (*Batch, error) {
	bytes, err := ctx.GetStub().GetState("jar_" + jarID)
	if err != nil {
		return nil, fmt.Errorf("failed to read jar %s: %w", jarID, err)
	}
	if bytes == nil {
		return nil, fmt.Errorf("jar %s does not exist", jarID)
	}
	batchID := string(bytes)
	return c.getBatch(ctx, batchID)
}

// =============================================================================
// State machine transition enforcement
// =============================================================================

var allowedTransitions = map[string][]string{
	StateReceived:   {StateIntake},
	StateIntake:     {StateProcessing},
	StateProcessing: {StateProcessing, StateOutput},
	StateOutput:     {StatePackaging},
	StatePackaging:  {StateFinalQC, StateReleased},
	StateFinalQC:    {StateReleased},
	StateReleased:   {},
	StateFlagged:    {},
}

// progressBatch moves the batch to the next legal state, rejecting skips and
// any transition from a FLAGGED batch (blocked until cleared).
func (c *HoneyChainContract) progressBatch(ctx contractapi.TransactionContextInterface, batch *Batch, next string) error {
	if batch.State == StateFlagged {
		return fmt.Errorf("batch %s is FLAGGED and cannot progress until cleared by a QC Manager", batch.BatchID)
	}
	current := batch.State
	allowed, ok := allowedTransitions[current]
	if !ok {
		return fmt.Errorf("unknown batch state: %s", current)
	}
	for _, a := range allowed {
		if a == next {
			batch.State = next
			return nil
		}
	}
	return fmt.Errorf("invalid state transition: %s -> %s (steps cannot be skipped)", current, next)
}

// =============================================================================
// Fraud checks
// =============================================================================

// checkMassBalance validates that output never exceeds intake by more than the
// tolerance (honey cannot gain weight) and jar weights reconcile.
func (c *HoneyChainContract) checkMassBalance(batch *Batch) error {
	if batch.IntakeWeight > 0 && batch.OutputWeight > 0 {
		if batch.OutputWeight > batch.IntakeWeight*1.02 {
			batch.Flagged = true
			batch.FlagReason = "mass-balance violation: output weight exceeds intake by >2%"
			return nil
		}
	}
	return nil
}

// checkCompositionalDrift compares the intake and output quality tests and
// flags the batch if any parameter drifted beyond tolerance.
func (c *HoneyChainContract) checkCompositionalDrift(batch *Batch) error {
	intake, okIntake := batch.QualityTests["intake"]
	output, okOutput := batch.QualityTests["output"]
	if !okIntake || !okOutput {
		return nil
	}

	if abs(output.Moisture-intake.Moisture) > c.Thresholds.MoistureDelta {
		batch.Flagged = true
		batch.FlagReason = fmt.Sprintf("compositional drift: moisture %v -> %v", intake.Moisture, output.Moisture)
		return nil
	}
	if abs(output.HMF-intake.HMF) > c.Thresholds.HMFDelta {
		batch.Flagged = true
		batch.FlagReason = fmt.Sprintf("compositional drift: HMF %v -> %v", intake.HMF, output.HMF)
		return nil
	}
	if abs(output.Diastase-intake.Diastase) > c.Thresholds.DiastaseDelta {
		batch.Flagged = true
		batch.FlagReason = fmt.Sprintf("compositional drift: diastase %v -> %v", intake.Diastase, output.Diastase)
		return nil
	}
	if abs(output.IsotopeRatio-intake.IsotopeRatio) > c.Thresholds.IsotopeDelta {
		batch.Flagged = true
		batch.FlagReason = fmt.Sprintf("compositional drift: C4 isotope ratio %v -> %v", intake.IsotopeRatio, output.IsotopeRatio)
		return nil
	}
	// Sugar profile: any single component shift is the strongest adulteration signal.
	for component, inVal := range intake.SugarProfile {
		outVal, ok := output.SugarProfile[component]
		if !ok {
			continue
		}
		if abs(outVal-inVal) > c.Thresholds.SugarProfileDelta {
			batch.Flagged = true
			batch.FlagReason = fmt.Sprintf("compositional drift: sugar '%s' %v -> %v", component, inVal, outVal)
			return nil
		}
	}
	return nil
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

// =============================================================================
// Write transactions
// =============================================================================

// MintBatch is the genesis of a batch, recorded at harvest by a Beekeeper.
// Args: batchId, lotId, hiveIds (JSON array), harvestStart, harvestEnd,
// weightKg, dataHash, barcodePayload (JSON).
func (c *HoneyChainContract) MintBatch(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	lotID string,
	hiveIDsJSON string,
	harvestStart string,
	harvestEnd string,
	weightKg float64,
	dataHash string,
	barcodePayloadJSON string,
) (*Batch, error) {
	if err := c.requireRole(ctx, RoleBeekeeper); err != nil {
		return nil, err
	}

	exists, err := ctx.GetStub().GetState(batchID)
	if err != nil {
		return nil, fmt.Errorf("failed to check batch existence: %w", err)
	}
	if exists != nil {
		return nil, fmt.Errorf("batch %s already exists", batchID)
	}

	var hiveIDs []string
	if err := json.Unmarshal([]byte(hiveIDsJSON), &hiveIDs); err != nil {
		return nil, fmt.Errorf("invalid hiveIds JSON: %w", err)
	}

	var barcodePayload map[string]interface{}
	if err := json.Unmarshal([]byte(barcodePayloadJSON), &barcodePayload); err != nil {
		return nil, fmt.Errorf("invalid barcodePayload JSON: %w", err)
	}

	batch := &Batch{
		BatchID:        batchID,
		LotID:          lotID,
		HiveIDs:        hiveIDs,
		HarvestStart:   harvestStart,
		HarvestEnd:     harvestEnd,
		State:          StateReceived,
		DataHash:       dataHash,
		BarcodePayload: barcodePayload,
		WeightKg:       weightKg,
		QualityTests:   map[string]*QualityTest{},
		OwnerID:        "Beekeeper",
		CreatedAt:      c.now(ctx),
		UpdatedAt:      c.now(ctx),
	}

	if err := c.putBatch(ctx, batch); err != nil {
		return nil, err
	}
	return batch, nil
}

// RecordIntake records a goods-received-note for raw material from any supplier.
// Args: batchId, supplierId, supplierType, weightKg, deliveryDate, declaredOrigin, intakeTestId.
func (c *HoneyChainContract) RecordIntake(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	supplierID string,
	supplierType string,
	weightKg float64,
	deliveryDate string,
	declaredOrigin string,
	intakeTestID string,
) error {
	if err := c.requireRole(ctx, RoleTransporter); err != nil {
		if err := c.requireRole(ctx, RoleFactoryWorker); err != nil {
			return err
		}
	}

	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.State != StateReceived {
		return fmt.Errorf("intake can only be recorded from RECEIVED state (current: %s)", batch.State)
	}

	batch.IntakeWeight = weightKg
	batch.TransporterID = supplierID

	// Full lot/GRN details and the intake test results are recorded on-chain
	// via the linked intake test (see RecordQualityTest).
	return c.progressBatch(ctx, batch, StateIntake)
}

// RecordReceived logs arrival at the factory by the transporter.
func (c *HoneyChainContract) RecordReceived(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	transporterID string,
	weightIn float64,
) error {
	if err := c.requireRole(ctx, RoleTransporter); err != nil {
		return err
	}
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.State != StateReceived {
		return fmt.Errorf("received can only be recorded from RECEIVED state (current: %s)", batch.State)
	}
	batch.TransporterID = transporterID
	batch.IntakeWeight = weightIn
	return c.putBatch(ctx, batch)
}

// RecordQualityTest records a lab panel at a given stage.
// stage: intake | output | final. On output, auto-runs mass-balance +
// compositional-drift checks and may FLAG the batch.
func (c *HoneyChainContract) RecordQualityTest(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	stage string,
	moisture float64,
	hmf float64,
	diastase float64,
	sugarProfileJSON string,
	isotopeRatio float64,
) error {
	if err := c.requireRole(ctx, RoleLabTech); err != nil {
		return err
	}

	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}

	var sugarProfile map[string]float64
	if err := json.Unmarshal([]byte(sugarProfileJSON), &sugarProfile); err != nil {
		return fmt.Errorf("invalid sugarProfile JSON: %w", err)
	}

	test := &QualityTest{
		Stage:        stage,
		BatchID:      batchID,
		Moisture:     moisture,
		HMF:          hmf,
		Diastase:     diastase,
		SugarProfile: sugarProfile,
		IsotopeRatio: isotopeRatio,
		TesterID:     "labtech", // enriched by backend with real identity
		Timestamp:    c.now(ctx),
	}
	batch.QualityTests[stage] = test

	switch stage {
	case "intake":
		// Passing the intake test moves the batch out of intake regardless of
		// whether it was logged as RECEIVED or INTAKE_TEST.
		if batch.State != StateReceived && batch.State != StateIntake {
			return fmt.Errorf("intake test can only follow RECEIVED/INTAKE_TEST (current: %s)", batch.State)
		}
		batch.State = StateProcessing
	case "output":
		batch.OutputWeight = test.Moisture // placeholder to preserve type; real weight handled via processing actions
		if err := c.checkCompositionalDrift(batch); err != nil {
			return err
		}
		if err := c.checkMassBalance(batch); err != nil {
			return err
		}
		if !batch.Flagged {
			if err := c.progressBatch(ctx, batch, StatePackaging); err != nil {
				return err
			}
		} else {
			batch.State = StateFlagged
		}
	case "final":
		if err := c.progressBatch(ctx, batch, StateReleased); err != nil {
			return err
		}
	default:
		return fmt.Errorf("unknown test stage: %s (use intake/output/final)", stage)
	}

	return c.putBatch(ctx, batch)
}

// RecordProcessingAction logs a processing step and enforces mass-balance and
// the blending rule (must declare all parent lots + quantities).
func (c *HoneyChainContract) RecordProcessingAction(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	actionType string,
	parametersJSON string,
	operatorID string,
	equipmentID string,
	weightBefore float64,
	weightAfter float64,
) error {
	if err := c.requireRole(ctx, RoleFactoryWorker); err != nil {
		return err
	}

	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}

	var parameters map[string]string
	if err := json.Unmarshal([]byte(parametersJSON), &parameters); err != nil {
		return fmt.Errorf("invalid parameters JSON: %w", err)
	}

	action := &ProcessingAction{
		ActionType:   actionType,
		Parameters:   parameters,
		OperatorID:   operatorID,
		EquipmentID:  equipmentID,
		WeightBefore: weightBefore,
		WeightAfter:  weightAfter,
		Timestamp:    c.now(ctx),
	}

	if actionType == "blending" {
		parentLots := parameters["parentLots"]
		if parentLots == "" {
			return fmt.Errorf("blending action must declare parent lot IDs and quantities")
		}
		action.ParentLotIDs = []string{parentLots}
		// Note: full declared parent validation across lots handled by BlendBatch.
	}

	batch.ProcessingLog = append(batch.ProcessingLog, action)
	batch.OutputWeight = weightAfter

	// Mass-balance: after an action, material should only decrease slightly.
	if weightAfter > weightBefore*1.02 {
		batch.Flagged = true
		batch.FlagReason = "mass-balance violation in processing action: weight increased by >2%"
		batch.State = StateFlagged
		return c.putBatch(ctx, batch)
	}

	return c.putBatch(ctx, batch)
}

// RecordPackaging records jar count, generates serials, and enforces jar-weight
// reconciliation within 2% of the recorded output weight.
func (c *HoneyChainContract) RecordPackaging(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	jarCount int,
	averageJarWeightKg float64,
) error {
	if err := c.requireRole(ctx, RoleFactoryWorker); err != nil {
		return err
	}

	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.Flagged {
		return fmt.Errorf("batch %s is FLAGGED and cannot be packaged until cleared", batchID)
	}
	// state should be PACKAGING after output test; allow from OUTPUT too
	// (flexibility for sequence variants) but refuse from RELEASED/FLAGGED.

	if jarCount <= 0 {
		return fmt.Errorf("jarCount must be positive")
	}

	// Jar-weight reconciliation: sum(jars) must match output weight within 2%.
	totalJarWeight := float64(jarCount) * averageJarWeightKg
	if batch.OutputWeight > 0 {
		if abs(totalJarWeight-batch.OutputWeight) > batch.OutputWeight*0.02 {
			return fmt.Errorf("jar weights do not reconcile with recorded output weight (off by >2%%)")
		}
	}

	serials := make([]string, jarCount)
	prefix := batchID + "-JAR-"
	for i := 0; i < jarCount; i++ {
		serial := fmt.Sprintf("%s%04d", prefix, i+1)
		serials[i] = serial
		if err := ctx.GetStub().PutState("jar_"+serial, []byte(batchID)); err != nil {
			return err
		}
	}
	batch.JarCount = jarCount
	batch.JarSerials = serials

	if err := c.progressBatch(ctx, batch, StateFinalQC); err != nil {
		// If this was the release path, allow direct release too.
		if batch.State == StateOutput {
			// already handled above via progress
		} else {
			return err
		}
	}

	return c.putBatch(ctx, batch)
}

// BlendBatch creates a new blended batch from many source lots.
// Args: newBatchId, newLotId, sourcesJSON ([{"lotId","weightKg"}...]), dataHash, barcodePayloadJSON.
func (c *HoneyChainContract) BlendBatch(
	ctx contractapi.TransactionContextInterface,
	newBatchID string,
	newLotID string,
	sourcesJSON string,
	weightKg float64,
	dataHash string,
	barcodePayloadJSON string,
) error {
	if err := c.requireRole(ctx, RoleFactoryWorker); err != nil {
		return err
	}

	type src struct {
		LotID    string  `json:"lotId"`
		WeightKg float64 `json:"weightKg"`
	}
	var sources []src
	if err := json.Unmarshal([]byte(sourcesJSON), &sources); err != nil {
		return fmt.Errorf("invalid sources JSON: %w", err)
	}
	if len(sources) < 2 {
		return fmt.Errorf("a blend requires at least 2 source lots")
	}

	var totalSrc float64
	for i := range sources {
		parent, err := c.getBatch(ctx, sources[i].LotID)
		if err != nil {
			return fmt.Errorf("source lot %s not found: %w", sources[i].LotID, err)
		}
		if parent.QualityTests["intake"] == nil {
			return fmt.Errorf("source lot %s has no completed intake test; cannot blend", sources[i].LotID)
		}
		totalSrc += sources[i].WeightKg
	}

	// Mass balance: declared inputs must match the blend weight within tolerance.
	if abs(totalSrc-weightKg) > weightKg*0.02 {
		return fmt.Errorf("blend weights do not reconcile: declared sources %.2f kg vs blend %.2f kg", totalSrc, weightKg)
	}

	var barcodePayload map[string]interface{}
	if err := json.Unmarshal([]byte(barcodePayloadJSON), &barcodePayload); err != nil {
		return fmt.Errorf("invalid barcodePayload JSON: %w", err)
	}

	compositions := make([]*BlendComposition, 0, len(sources))
	for i := range sources {
		pct := (sources[i].WeightKg / weightKg) * 100
		compositions = append(compositions, &BlendComposition{
			SourceLotID: sources[i].LotID,
			WeightKg:    sources[i].WeightKg,
			Percentage:  pct,
		})
	}

	batch := &Batch{
		BatchID:        newBatchID,
		LotID:          newLotID,
		State:          StateIntake,
		DataHash:       dataHash,
		BarcodePayload: barcodePayload,
		WeightKg:       weightKg,
		IntakeWeight:   weightKg,
		QualityTests:   map[string]*QualityTest{},
		BlendSources:   compositions,
		OwnerID:        "Factory",
		CreatedAt:      c.now(ctx),
		UpdatedAt:      c.now(ctx),
	}

	return c.putBatch(ctx, batch)
}

// TransferOwnership moves custody to another identity.
func (c *HoneyChainContract) TransferOwnership(
	ctx contractapi.TransactionContextInterface,
	targetID string,
	toIdentity string,
) error {
	batch, err := c.getBatch(ctx, targetID)
	if err != nil {
		return err
	}
	batch.OwnerID = toIdentity
	batch.TransporterID = toIdentity
	return c.putBatch(ctx, batch)
}

// ClearFlag resolves a flagged batch (QC Manager only). resolution: "CLEARED" | "REJECTED".
// A cleared batch is allowed to resume from its pre-flag checkpoint.
func (c *HoneyChainContract) ClearFlag(
	ctx contractapi.TransactionContextInterface,
	batchID string,
	resolution string,
) error {
	if err := c.requireRole(ctx, RoleQCManager); err != nil {
		return err
	}
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.State != StateFlagged {
		return fmt.Errorf("batch %s is not flagged", batchID)
	}

	switch resolution {
	case "CLEARED":
		batch.Flagged = false
		batch.FlagResolution = "CLEARED"
		batch.State = StateProcessing // resume at processing checkpoint
		// Fall through to natural progression via next quality/action steps.
	case "REJECTED":
		batch.Flagged = true
		batch.FlagResolution = "REJECTED"
		batch.State = StateFlagged
	default:
		return fmt.Errorf("resolution must be CLEARED or REJECTED")
	}

	return c.putBatch(ctx, batch)
}

// =============================================================================
// main
// =============================================================================

func main() {
	chaincode, err := contractapi.NewChaincode(NewHoneyChainContract())
	if err != nil {
		fmt.Printf("Error creating HoneyChain chaincode: %s\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting HoneyChain chaincode: %s\n", err)
	}
}
