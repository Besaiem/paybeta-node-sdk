import type { Transaction } from './transactions.js';
import type { Payment } from './payments.js';
import type { Escrow } from './escrows.js';
import type { Dispute } from './disputes.js';

export type WebhookEventType =
  | 'transaction.created'
  | 'transaction.funded'
  | 'transaction.in_escrow'
  | 'transaction.released'
  | 'transaction.disputed'
  | 'transaction.refunded'
  | 'payment.initiated'
  | 'payment.completed'
  | 'payment.failed'
  | 'escrow.created'
  | 'escrow.funded'
  | 'escrow.released'
  | 'escrow.disputed'
  | 'escrow.refunded'
  | 'dispute.opened'
  | 'dispute.resolved'
  | 'dispute.cancelled';

export interface WebhookEvent<T = unknown> {
  id: string;
  type: WebhookEventType;
  createdAt: string;
  data: T;
}

export type TransactionWebhookEvent = WebhookEvent<Transaction>;
export type PaymentWebhookEvent = WebhookEvent<Payment>;
export type EscrowWebhookEvent = WebhookEvent<Escrow>;
export type DisputeWebhookEvent = WebhookEvent<Dispute>;
