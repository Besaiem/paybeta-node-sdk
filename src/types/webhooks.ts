import type { Transaction } from './transactions.js';
import type { Payment } from './payments.js';
import type { Escrow } from './escrows.js';
import type { Dispute } from './disputes.js';

// Matches the @OnEvent(...) listeners actually wired up in
// OutboundWebhookService — every event type PayBeta can ever deliver, and
// nothing invented that would never arrive. Note transaction.escrowed (not
// transaction.in_escrow) and payment.received (not payment.initiated /
// payment.completed) — there is no dispute.cancelled or any escrow.* event
// besides escrow.released.
export type WebhookEventType =
  | 'transaction.created'
  | 'transaction.funded'
  | 'transaction.escrowed'
  | 'transaction.released'
  | 'transaction.disputed'
  | 'transaction.refunded'
  | 'payment.received'
  | 'payment.failed'
  | 'dispute.opened'
  | 'dispute.resolved'
  | 'escrow.released';

// Field names match the JSON body OutboundWebhookService actually sends
// (`{ id, eventType, timestamp, data }`) — not `type`/`createdAt`.
export interface WebhookEvent<T = unknown> {
  id: string;
  eventType: WebhookEventType;
  timestamp: string;
  data: T;
}

export type TransactionWebhookEvent = WebhookEvent<Transaction>;
export type PaymentWebhookEvent = WebhookEvent<Payment>;
export type EscrowWebhookEvent = WebhookEvent<Escrow>;
export type DisputeWebhookEvent = WebhookEvent<Dispute>;
