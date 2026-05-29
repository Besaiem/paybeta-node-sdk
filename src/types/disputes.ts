export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CANCELLED'
  | 'ESCALATED';

export type DisputeStage =
  | 'INITIAL_REVIEW'
  | 'EVIDENCE_COLLECTION'
  | 'ARBITRATION'
  | 'FINAL_DECISION';

export type DisputeType = 'BUYER_COMPLAINT' | 'SELLER_COMPLAINT' | 'FRAUD' | 'OTHER';

export type DisputePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ResolutionOutcome =
  | 'BUYER_WINS'
  | 'SELLER_WINS'
  | 'SPLIT'
  | 'CANCELLED';

export interface Evidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  fileType: string;
  description?: string;
  submittedAt: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  escrowId?: string;
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
  openedBy: string;
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

export interface OpenDisputeParams {
  transactionId: string;
  escrowId?: string;
  disputeType: DisputeType;
  description: string;
  priority?: DisputePriority;
}

export interface ListDisputesParams {
  merchantId?: string;
  status?: DisputeStatus;
  stage?: DisputeStage;
  limit?: number;
  offset?: number;
}

export interface UploadEvidenceParams {
  fileBase64: string;
  fileType: string;
  description?: string;
  submittedBy: string;
}

export interface ResolveDisputeParams {
  outcome: ResolutionOutcome;
  notes?: string;
  buyerRefundAmount?: number;
  sellerPayoutAmount?: number;
}

export interface CancelDisputeParams {
  reason: string;
}
