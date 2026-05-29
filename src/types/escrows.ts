export type EscrowStatus =
  | 'CREATED'
  | 'FUNDED'
  | 'PENDING_RELEASE'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export type ConditionType =
  | 'DELIVERY_CONFIRMED'
  | 'BUYER_APPROVED'
  | 'TIMEOUT_ELAPSED'
  | 'MANUAL_RELEASE';

export type ConditionLogic = 'AND' | 'OR';

export interface ReleaseCondition {
  type: ConditionType;
  config: Record<string, unknown>;
  isMet: boolean;
  metAt?: string;
}

export interface ReleasePolicy {
  conditionLogic: ConditionLogic;
  conditions: ReleaseCondition[];
}

export interface EscrowBalance {
  balance: number;
  currency: string;
}

export interface Escrow {
  id: string;
  transactionId: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  releasePolicy: ReleasePolicy;
  balance: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateEscrowConditionParams {
  type: ConditionType;
  config?: Record<string, unknown>;
}

export interface CreateEscrowReleasePolicyParams {
  conditionLogic: ConditionLogic;
  conditions: CreateEscrowConditionParams[];
}

export interface CreateEscrowParams {
  transactionId: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  releasePolicy: CreateEscrowReleasePolicyParams;
}

export interface ListEscrowsParams {
  merchantId?: string;
  transactionId?: string;
  status?: EscrowStatus;
  limit?: number;
  offset?: number;
}

export interface ReleaseEscrowParams {
  reason?: string;
}

export interface ConfirmDeliveryParams {
  confirmedBy?: string;
  notes?: string;
}

export interface ConfirmBuyerParams {
  confirmedBy?: string;
  notes?: string;
}
