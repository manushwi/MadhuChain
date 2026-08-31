package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const (
	batchKeyPrefix    = "batch:"
	eventKeyPrefix    = "event:"
	custodyObjectType = "custody"
)

var identifierPattern = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._:-]*$`)

// The local Fabric test network uses Org1/2/3 MSP IDs. The named aliases allow
// production profiles to use domain-specific IDs without changing chaincode.
var organizationAliases = map[string]map[string]bool{
	"KVIC":    {"Org1MSP": true, "KVICMSP": true},
	"FACTORY": {"Org2MSP": true, "FactoryMSP": true},
	"LAB":     {"Org3MSP": true, "LabMSP": true},
}

type HoneyChainContract struct {
	contractapi.Contract
}

func NewHoneyChainContract() *HoneyChainContract { return &HoneyChainContract{} }

func (c *HoneyChainContract) CreateHarvestBatch(ctx contractapi.TransactionContextInterface, batchID, hiveHash, beekeeperHash, harvestHash string) (*HoneyBatch, error) {
	if err := c.requireOrganizationRole(ctx, "KVIC", RoleBeekeeper); err != nil {
		return nil, err
	}
	if err := validateIdentifier("batchId", batchID); err != nil {
		return nil, err
	}
	hashes, err := normalizeHashes(hiveHash, beekeeperHash, harvestHash)
	if err != nil {
		return nil, err
	}
	if existing, err := ctx.GetStub().GetState(batchKey(batchID)); err != nil {
		return nil, fmt.Errorf("failed to check batch existence: %w", err)
	} else if existing != nil {
		return nil, fmt.Errorf("batch %s already exists", batchID)
	}

	now, err := transactionTime(ctx)
	if err != nil {
		return nil, err
	}
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to read caller MSP: %w", err)
	}
	batch := &HoneyBatch{
		BatchID: batchID, BatchType: "HARVEST", HiveHash: hashes[0], BeekeeperHash: hashes[1], HarvestHash: hashes[2],
		CurrentStatus: StatusHarvested, CurrentCustodianMSP: msp, CreatedAt: now, UpdatedAt: now,
	}
	if err := c.writeBatch(ctx, batch, "HarvestBatchCreated", hashes[2]); err != nil {
		return nil, err
	}
	return batch, nil
}

func (c *HoneyChainContract) RecordCollection(ctx contractapi.TransactionContextInterface, batchID, collectionHash string, accepted bool) error {
	if err := c.requireOrganizationRole(ctx, "FACTORY", RoleTransporter, RoleFactoryWorker); err != nil {
		return err
	}
	hash, err := normalizeHash(collectionHash)
	if err != nil {
		return err
	}
	batch, err := c.getMutableBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.CurrentStatus != StatusHarvested {
		return fmt.Errorf("collection requires %s status, got %s", StatusHarvested, batch.CurrentStatus)
	}
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read caller MSP: %w", err)
	}
	batch.CollectionHash = hash
	if accepted {
		batch.CurrentStatus = StatusCollected
		// On acceptance the receiving FACTORY org takes custody of the lot.
		// This moves custody on-chain from the beekeeper's org to the caller's
		// org automatically, so the receiving party can then transfer custody on.
		batch.CurrentCustodianMSP = msp
	} else {
		batch.CurrentStatus = StatusCollectionRejected
	}
	return c.writeBatch(ctx, batch, "CollectionRecorded", hash)
}

func (c *HoneyChainContract) RecordLabResult(ctx contractapi.TransactionContextInterface, batchID, certificateHash string, approved bool) error {
	if err := c.requireOrganizationRole(ctx, "LAB", RoleLabTech); err != nil {
		return err
	}
	hash, err := normalizeHash(certificateHash)
	if err != nil {
		return err
	}
	batch, err := c.getMutableBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.CurrentStatus != StatusCollected && batch.CurrentStatus != StatusProcessed {
		return fmt.Errorf("lab result requires %s or %s status, got %s", StatusCollected, StatusProcessed, batch.CurrentStatus)
	}
	batch.LabCertificateHash = hash
	if !approved {
		batch.CurrentStatus = StatusLabRejected
	} else if batch.CurrentStatus == StatusCollected {
		batch.CurrentStatus = StatusLabApproved
	} else if batch.CurrentStatus == StatusProcessed {
		batch.CurrentStatus = StatusOutputApproved
	}
	return c.writeBatch(ctx, batch, "LabResultRecorded", hash)
}

// CreateBlendBatch anchors a many-to-one blend without putting source lot IDs,
// quantities, or processing parameters into transaction arguments or state.
func (c *HoneyChainContract) CreateBlendBatch(ctx contractapi.TransactionContextInterface, batchID, sourceSummaryHash, processingHash string) (*HoneyBatch, error) {
	if err := c.requireOrganizationRole(ctx, "FACTORY", RoleFactoryWorker); err != nil {
		return nil, err
	}
	if err := validateIdentifier("batchId", batchID); err != nil {
		return nil, err
	}
	hashes, err := normalizeHashes(sourceSummaryHash, processingHash)
	if err != nil {
		return nil, err
	}
	if existing, err := ctx.GetStub().GetState(batchKey(batchID)); err != nil {
		return nil, err
	} else if existing != nil {
		return nil, fmt.Errorf("batch %s already exists", batchID)
	}
	now, err := transactionTime(ctx)
	if err != nil {
		return nil, err
	}
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to read caller MSP: %w", err)
	}
	batch := &HoneyBatch{
		BatchID: batchID, BatchType: "BLEND", SourceSummaryHash: hashes[0], ProcessingHash: hashes[1],
		CurrentStatus: StatusProcessed, CurrentCustodianMSP: msp, CreatedAt: now, UpdatedAt: now,
	}
	if err := c.writeBatch(ctx, batch, "ProcessingRecorded", hashes[1]); err != nil {
		return nil, err
	}
	return batch, nil
}

func (c *HoneyChainContract) FlagBatch(ctx contractapi.TransactionContextInterface, batchID, reasonHash string) error {
	if err := c.requireRole(ctx, RoleFactoryWorker, RoleLabTech, RoleQCManager, RoleAdmin); err != nil {
		return err
	}
	hash, err := normalizeHash(reasonHash)
	if err != nil {
		return err
	}
	batch, err := c.getMutableBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.Flagged {
		return fmt.Errorf("batch %s is already flagged", batchID)
	}
	batch.Flagged = true
	batch.FlagReasonHash = hash
	batch.ResumeStatus = batch.CurrentStatus
	batch.CurrentStatus = StatusFlagged
	return c.writeBatch(ctx, batch, "FraudFlagged", hash)
}

func (c *HoneyChainContract) ResolveFlag(ctx contractapi.TransactionContextInterface, batchID, resolutionHash string, cleared bool) error {
	if err := c.requireOrganizationRole(ctx, "KVIC", RoleQCManager, RoleAdmin); err != nil {
		return err
	}
	hash, err := normalizeHash(resolutionHash)
	if err != nil {
		return err
	}
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if !batch.Flagged || batch.CurrentStatus != StatusFlagged {
		return fmt.Errorf("batch %s is not flagged", batchID)
	}
	if cleared {
		if batch.ResumeStatus == "" || batch.ResumeStatus == StatusFlagged {
			return fmt.Errorf("batch %s has no valid resume status", batchID)
		}
		batch.CurrentStatus = batch.ResumeStatus
		batch.Flagged = false
	} else {
		batch.CurrentStatus = StatusRevoked
		batch.Revoked = true
		batch.RevocationReason = hash
	}
	batch.ResumeStatus = ""
	return c.writeBatch(ctx, batch, "FraudFlagResolved", hash)
}

func (c *HoneyChainContract) RecordProcessing(ctx contractapi.TransactionContextInterface, batchID, processingHash string) error {
	if err := c.requireOrganizationRole(ctx, "FACTORY", RoleFactoryWorker); err != nil {
		return err
	}
	hash, err := normalizeHash(processingHash)
	if err != nil {
		return err
	}
	batch, err := c.getMutableBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.CurrentStatus != StatusLabApproved && batch.CurrentStatus != StatusProcessed {
		return fmt.Errorf("processing requires %s status, got %s", StatusLabApproved, batch.CurrentStatus)
	}
	batch.ProcessingHash = hash
	batch.CurrentStatus = StatusProcessed
	return c.writeBatch(ctx, batch, "ProcessingRecorded", hash)
}

func (c *HoneyChainContract) RecordPackaging(ctx contractapi.TransactionContextInterface, batchID, packagingHash, bottleSummaryHash string) error {
	if err := c.requireOrganizationRole(ctx, "FACTORY", RoleFactoryWorker); err != nil {
		return err
	}
	hashes, err := normalizeHashes(packagingHash, bottleSummaryHash)
	if err != nil {
		return err
	}
	batch, err := c.getMutableBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.CurrentStatus != StatusOutputApproved {
		return fmt.Errorf("packaging requires %s status, got %s", StatusOutputApproved, batch.CurrentStatus)
	}
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read caller MSP: %w", err)
	}
	batch.PackagingHash = hashes[0]
	batch.BottleSummaryHash = hashes[1]
	batch.CurrentStatus = StatusReleased
	batch.CurrentCustodianMSP = msp
	return c.writeBatch(ctx, batch, "PackagingRecorded", hashes[0])
}

func (c *HoneyChainContract) TransferCustody(ctx contractapi.TransactionContextInterface, assetID, assetType, fromMSP, toMSP, transferHash string) error {
	if err := validateIdentifier("assetId", assetID); err != nil {
		return err
	}
	if strings.ToUpper(assetType) != "BATCH" {
		return fmt.Errorf("assetType must be BATCH for the MVP contract")
	}
	if strings.TrimSpace(toMSP) == "" || strings.TrimSpace(fromMSP) == "" {
		return fmt.Errorf("fromMsp and toMsp must be nonempty values")
	}
	hash, err := normalizeHash(transferHash)
	if err != nil {
		return err
	}
	callerMSP, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read caller MSP: %w", err)
	}
	if callerMSP != fromMSP {
		return fmt.Errorf("caller MSP %s cannot transfer custody from %s", callerMSP, fromMSP)
	}
	batch, err := c.getMutableBatch(ctx, assetID)
	if err != nil {
		return err
	}
	if batch.CurrentCustodianMSP != fromMSP {
		return fmt.Errorf("batch custodian is %s, not %s", batch.CurrentCustodianMSP, fromMSP)
	}
	if err := c.requireRole(ctx, RoleBeekeeper, RoleTransporter, RoleFactoryWorker); err != nil {
		return err
	}

	timestamp, err := transactionTime(ctx)
	if err != nil {
		return err
	}
	txID := ctx.GetStub().GetTxID()
	custody := &CustodyEvent{
		EventID: txID, AssetID: assetID, AssetType: "BATCH", FromMSP: fromMSP,
		ToMSP: toMSP, TransferHash: hash, TransactionID: txID, Timestamp: timestamp,
	}
	key, err := ctx.GetStub().CreateCompositeKey(custodyObjectType, []string{assetID, timestamp, txID})
	if err != nil {
		return fmt.Errorf("failed to create custody key: %w", err)
	}
	bytes, err := json.Marshal(custody)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(key, bytes); err != nil {
		return fmt.Errorf("failed to store custody event: %w", err)
	}
	batch.CurrentCustodianMSP = toMSP
	return c.writeBatch(ctx, batch, "CustodyTransferred", hash)
}

func (c *HoneyChainContract) RevokeBatch(ctx contractapi.TransactionContextInterface, batchID, reasonHash string) error {
	if err := c.requireOrganizationRole(ctx, "KVIC", RoleAdmin, RoleQCManager); err != nil {
		return err
	}
	hash, err := normalizeHash(reasonHash)
	if err != nil {
		return err
	}
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return err
	}
	if batch.Revoked {
		return fmt.Errorf("batch %s is already revoked", batchID)
	}
	batch.Revoked = true
	batch.RevocationReason = hash
	batch.CurrentStatus = StatusRevoked
	return c.writeBatch(ctx, batch, "BatchRevoked", hash)
}

func (c *HoneyChainContract) GetBatch(ctx contractapi.TransactionContextInterface, batchID string) (*HoneyBatch, error) {
	return c.getBatch(ctx, batchID)
}

func (c *HoneyChainContract) GetBatchHistory(ctx contractapi.TransactionContextInterface, batchID string) ([]*BatchHistoryEntry, error) {
	if err := validateIdentifier("batchId", batchID); err != nil {
		return nil, err
	}
	iterator, err := ctx.GetStub().GetHistoryForKey(batchKey(batchID))
	if err != nil {
		return nil, fmt.Errorf("failed to read batch history: %w", err)
	}
	defer iterator.Close()
	entries := []*BatchHistoryEntry{}
	for iterator.HasNext() {
		change, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		entry := &BatchHistoryEntry{TransactionID: change.TxId, IsDelete: change.IsDelete}
		if change.Timestamp != nil {
			entry.Timestamp = time.Unix(change.Timestamp.Seconds, int64(change.Timestamp.Nanos)).UTC().Format(time.RFC3339Nano)
		}
		if !change.IsDelete && len(change.Value) > 0 {
			entry.Batch = &HoneyBatch{}
			if err := json.Unmarshal(change.Value, entry.Batch); err != nil {
				return nil, fmt.Errorf("failed to decode batch history: %w", err)
			}
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

func (c *HoneyChainContract) GetCustodyHistory(ctx contractapi.TransactionContextInterface, assetID string) ([]*CustodyEvent, error) {
	if err := validateIdentifier("assetId", assetID); err != nil {
		return nil, err
	}
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(custodyObjectType, []string{assetID})
	if err != nil {
		return nil, fmt.Errorf("failed to read custody history: %w", err)
	}
	defer iterator.Close()
	entries := []*CustodyEvent{}
	for iterator.HasNext() {
		item, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		entry := &CustodyEvent{}
		if err := json.Unmarshal(item.Value, entry); err != nil {
			return nil, fmt.Errorf("failed to decode custody event: %w", err)
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

// VerifyBatchHash confirms that a supplied off-chain record hash is anchored
// in one of the batch's explicit proof fields. It does not disclose the record.
func (c *HoneyChainContract) VerifyBatchHash(ctx contractapi.TransactionContextInterface, batchID, expectedHash string) (bool, error) {
	hash, err := normalizeHash(expectedHash)
	if err != nil {
		return false, err
	}
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return false, err
	}
	for _, candidate := range []string{
		batch.HiveHash, batch.BeekeeperHash, batch.HarvestHash, batch.CollectionHash,
		batch.LabCertificateHash, batch.ProcessingHash, batch.PackagingHash,
		batch.BottleSummaryHash, batch.SourceSummaryHash, batch.FlagReasonHash, batch.RevocationReason,
	} {
		if candidate == hash {
			return true, nil
		}
	}
	return false, nil
}

func (c *HoneyChainContract) GetChainEvent(ctx contractapi.TransactionContextInterface, transactionID string) (*ChainEventRecord, error) {
	if err := validateIdentifier("transactionId", transactionID); err != nil {
		return nil, err
	}
	bytes, err := ctx.GetStub().GetState(eventKeyPrefix + transactionID)
	if err != nil {
		return nil, err
	}
	if bytes == nil {
		return nil, fmt.Errorf("event for transaction %s does not exist", transactionID)
	}
	record := &ChainEventRecord{}
	if err := json.Unmarshal(bytes, record); err != nil {
		return nil, err
	}
	return record, nil
}

func (c *HoneyChainContract) writeBatch(ctx contractapi.TransactionContextInterface, batch *HoneyBatch, eventType, payloadHash string) error {
	timestamp, err := transactionTime(ctx)
	if err != nil {
		return err
	}
	batch.UpdatedAt = timestamp
	bytes, err := json.Marshal(batch)
	if err != nil {
		return fmt.Errorf("failed to encode batch: %w", err)
	}
	if err := ctx.GetStub().PutState(batchKey(batch.BatchID), bytes); err != nil {
		return fmt.Errorf("failed to store batch: %w", err)
	}
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read caller MSP: %w", err)
	}
	txID := ctx.GetStub().GetTxID()
	record := &ChainEventRecord{
		EventID: txID, BatchID: batch.BatchID, EventType: eventType, PayloadHash: payloadHash,
		ActorMSP: msp, TransactionID: txID, Timestamp: timestamp, Status: batch.CurrentStatus,
	}
	eventBytes, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to encode chaincode event: %w", err)
	}
	if err := ctx.GetStub().PutState(eventKeyPrefix+txID, eventBytes); err != nil {
		return fmt.Errorf("failed to store chaincode event: %w", err)
	}
	if err := ctx.GetStub().SetEvent(eventType, eventBytes); err != nil {
		return fmt.Errorf("failed to emit chaincode event: %w", err)
	}
	return nil
}

func (c *HoneyChainContract) getBatch(ctx contractapi.TransactionContextInterface, batchID string) (*HoneyBatch, error) {
	if err := validateIdentifier("batchId", batchID); err != nil {
		return nil, err
	}
	bytes, err := ctx.GetStub().GetState(batchKey(batchID))
	if err != nil {
		return nil, fmt.Errorf("failed to read batch %s: %w", batchID, err)
	}
	if bytes == nil {
		return nil, fmt.Errorf("batch %s does not exist", batchID)
	}
	batch := &HoneyBatch{}
	if err := json.Unmarshal(bytes, batch); err != nil {
		return nil, fmt.Errorf("failed to decode batch %s: %w", batchID, err)
	}
	return batch, nil
}

func (c *HoneyChainContract) getMutableBatch(ctx contractapi.TransactionContextInterface, batchID string) (*HoneyBatch, error) {
	batch, err := c.getBatch(ctx, batchID)
	if err != nil {
		return nil, err
	}
	if batch.Revoked || batch.CurrentStatus == StatusRevoked {
		return nil, fmt.Errorf("batch %s is revoked", batchID)
	}
	if batch.Flagged || batch.CurrentStatus == StatusFlagged {
		return nil, fmt.Errorf("batch %s is flagged", batchID)
	}
	if batch.CurrentStatus == StatusReleased || batch.CurrentStatus == StatusCollectionRejected || batch.CurrentStatus == StatusLabRejected {
		return nil, fmt.Errorf("batch %s is terminal in status %s", batchID, batch.CurrentStatus)
	}
	return batch, nil
}

func (c *HoneyChainContract) requireOrganizationRole(ctx contractapi.TransactionContextInterface, organization string, roles ...string) error {
	msp, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to read caller MSP: %w", err)
	}
	if !organizationAliases[organization][msp] {
		return fmt.Errorf("unauthorized: MSP %s is not a member of %s", msp, organization)
	}
	return c.requireRole(ctx, roles...)
}

func (c *HoneyChainContract) requireRole(ctx contractapi.TransactionContextInterface, roles ...string) error {
	role, found, err := ctx.GetClientIdentity().GetAttributeValue("role")
	if err != nil {
		return fmt.Errorf("failed to read role attribute: %w", err)
	}
	if !found || role == "" {
		return fmt.Errorf("identity has no role attribute")
	}
	for _, allowed := range roles {
		if role == allowed {
			return nil
		}
	}
	return fmt.Errorf("unauthorized: role %s is not permitted", role)
}

func validateIdentifier(name, value string) error {
	if !identifierPattern.MatchString(value) {
		return fmt.Errorf("%s must contain only letters, digits, '.', '_', ':' or '-'", name)
	}
	return nil
}

func normalizeHashes(values ...string) ([]string, error) {
	result := make([]string, len(values))
	for i, value := range values {
		normalized, err := normalizeHash(value)
		if err != nil {
			return nil, err
		}
		result[i] = normalized
	}
	return result, nil
}

func normalizeHash(value string) (string, error) {
	trimmed := strings.TrimSpace(value)
	trimmed = strings.TrimPrefix(strings.ToLower(trimmed), "sha256:")
	decoded, err := hex.DecodeString(trimmed)
	if err != nil || len(decoded) != sha256.Size {
		return "", fmt.Errorf("hash must be a SHA-256 hex digest with optional sha256: prefix")
	}
	return "sha256:" + trimmed, nil
}

func transactionTime(ctx contractapi.TransactionContextInterface) (string, error) {
	timestamp, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return "", fmt.Errorf("failed to read transaction timestamp: %w", err)
	}
	return time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).UTC().Format(time.RFC3339Nano), nil
}

func batchKey(batchID string) string { return batchKeyPrefix + batchID }
