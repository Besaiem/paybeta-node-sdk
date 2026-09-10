// Matches DisputeStatus in dispute-status.vo.ts exactly.
export type DisputeStatus =
  | 'OPENED'
  | 'EVIDENCE_COLLECTION'
  | 'UNDER_REVIEW'
  | 'ARBITRATION'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

// This is the arbitration workflow stage (ArbitrationStage server-side —
// a distinct concept from DisputeStatus above, despite the overlapping
// names EVIDENCE_COLLECTION/ARBITRATION appearing in both enums).
export type DisputeStage =
  | 'INITIAL_REVIEW'
  | 'EVIDENCE_REVIEW'
  | 'MERCHANT_RESPONSE'
  | 'BUYER_RESPONSE'
  | 'ARBITRATOR_REVIEW'
  | 'ESCALATION'
  | 'FINAL_DECISION';

// Matches DisputeType in dispute-type.vo.ts exactly.
export type DisputeType =
  | 'BUYER_COMPLAINT'
  | 'SELLER_COMPLAINT'
  | 'QUALITY_ISSUE'
  | 'NON_DELIVERY'
  | 'WRONG_ITEM'
  | 'DAMAGED_ITEM'
  | 'FRAUD'
  | 'OTHER';

export type DisputePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type OpenedBy = 'BUYER' | 'SELLER';

export type ResolutionOutcome =
  | 'BUYER_WINS'
  | 'SELLER_WINS'
  | 'PARTIAL_REFUND'
  | 'PARTIAL_RELEASE'
  | 'SPLIT'
  | 'CANCELLED';

export type EvidenceType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'OTHER';
export type UploadedBy = 'BUYER' | 'SELLER' | 'ARBITRATOR';

export interface Evidence {
  id: string;
  disputeId: string;
  evidenceType: EvidenceType;
  uploadedBy: UploadedBy;
  description?: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  escrowId: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  disputeType: DisputeType;
  priority: DisputePriority;
  status: DisputeStatus;
  currentStage: DisputeStage;
  description: string;
  amount: number;
  currency: string;
  openedBy: OpenedBy;
  openedAt: string;
  resolvedAt?: string;
  resolutionOutcome?: ResolutionOutcome;
  resolutionNotes?: string;
  workflowId?: string;
  assignedArbitratorId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// All of these are required by OpenDisputeDto server-side — there is no
// partial/inferred version of this call.
export interface OpenDisputeParams {
  transactionId: string;
  escrowId: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  disputeType: DisputeType;
  priority: DisputePriority;
  description: string;
  /** Integer amount in kobo. */
  amount: number;
  currency: string;
  openedBy: OpenedBy;
  workflowId?: string;
}

export interface ListDisputesParams {
  merchantId?: string;
  status?: DisputeStatus;
  stage?: DisputeStage;
  limit?: number;
  offset?: number;
}

// Field names match the API's raw JSON body exactly (see
// dispute.controller.ts's uploadEvidence) — not a generic
// fileBase64/fileType/submittedBy shape.
export interface UploadEvidenceParams {
  evidenceType: EvidenceType;
  uploadedBy: UploadedBy;
  description?: string;
  fileName: string;
  /** Base64-encoded file content. */
  fileData: string;
  mimeType: string;
}

export interface ResolveDisputeParams {
  outcome: ResolutionOutcome;
  notes: string;
}

export interface CancelDisputeParams {
  reason: string;
}
