export type TransactionStatus =
  | 'INITIATED'
  | 'FUNDED'
  | 'IN_ESCROW'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Transaction {
  id: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  disputeToken?: string;
  paymentLinkToken?: string;
  paymentLinkUrl?: string;
  sagaStatus?: string;
  sagaFailureReason?: string;
  sagaFailedStep?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateTransactionParams {
  buyerEmail: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface ListTransactionsParams {
  merchantId?: string;
  buyerEmail?: string;
  status?: TransactionStatus;
  limit?: number;
  offset?: number;
}

export interface TransactionEvent {
  id: string;
  transactionId: string;
  eventType: string;
  previousStatus?: TransactionStatus;
  newStatus?: TransactionStatus;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}
