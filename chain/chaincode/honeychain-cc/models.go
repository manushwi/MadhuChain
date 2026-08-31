package main

// HoneyBatch is the hash-only ledger representation of an off-chain batch.
// Raw telemetry, reports, measurements, profiles, and location data never
// belong in this structure or in chaincode transaction arguments.
type HoneyBatch struct {
	BatchID             string `json:"batchId"`
	BatchType           string `json:"batchType"`
	HiveHash            string `json:"hiveHash"`
	BeekeeperHash       string `json:"beekeeperHash"`
	HarvestHash         string `json:"harvestHash"`
	SourceSummaryHash   string `json:"sourceSummaryHash,omitempty" metadata:",optional"`
	CollectionHash      string `json:"collectionHash,omitempty" metadata:",optional"`
	LabCertificateHash  string `json:"labCertificateHash,omitempty" metadata:",optional"`
	ProcessingHash      string `json:"processingHash,omitempty" metadata:",optional"`
	PackagingHash       string `json:"packagingHash,omitempty" metadata:",optional"`
	BottleSummaryHash   string `json:"bottleSummaryHash,omitempty" metadata:",optional"`
	CurrentStatus       string `json:"currentStatus"`
	CurrentCustodianMSP string `json:"currentCustodianMsp"`
	CreatedAt           string `json:"createdAt"`
	UpdatedAt           string `json:"updatedAt"`
	Revoked             bool   `json:"revoked"`
	RevocationReason    string `json:"revocationReason,omitempty" metadata:",optional"`
	Flagged             bool   `json:"flagged"`
	FlagReasonHash      string `json:"flagReasonHash,omitempty" metadata:",optional"`
	ResumeStatus        string `json:"resumeStatus,omitempty" metadata:",optional"`
}

type CustodyEvent struct {
	EventID       string `json:"eventId"`
	AssetID       string `json:"assetId"`
	AssetType     string `json:"assetType"`
	FromMSP       string `json:"fromMsp"`
	ToMSP         string `json:"toMsp"`
	TransferHash  string `json:"transferHash"`
	TransactionID string `json:"transactionId"`
	Timestamp     string `json:"timestamp"`
}

type ChainEventRecord struct {
	EventID       string `json:"eventId"`
	BatchID       string `json:"batchId"`
	EventType     string `json:"eventType"`
	PayloadHash   string `json:"payloadHash"`
	ActorMSP      string `json:"actorMsp"`
	TransactionID string `json:"transactionId"`
	Timestamp     string `json:"timestamp"`
	Status        string `json:"status"`
}

type BatchHistoryEntry struct {
	TransactionID string      `json:"transactionId"`
	Timestamp     string      `json:"timestamp"`
	IsDelete      bool        `json:"isDelete"`
	Batch         *HoneyBatch `json:"batch,omitempty" metadata:",optional"`
}

const (
	StatusHarvested          = "HARVESTED"
	StatusCollected          = "COLLECTED"
	StatusCollectionRejected = "COLLECTION_REJECTED"
	StatusLabApproved        = "LAB_APPROVED"
	StatusLabRejected        = "LAB_REJECTED"
	StatusProcessed          = "PROCESSED"
	StatusOutputApproved     = "OUTPUT_APPROVED"
	StatusFinalQC            = "FINAL_QC"
	StatusReleased           = "RELEASED"
	StatusRevoked            = "REVOKED"
	StatusFlagged            = "FLAGGED"

	RoleBeekeeper     = "Beekeeper"
	RoleTransporter   = "Transporter"
	RoleFactoryWorker = "FactoryWorker"
	RoleLabTech       = "LabTech"
	RoleQCManager     = "QCManager"
	RoleAdmin         = "Admin"
)
