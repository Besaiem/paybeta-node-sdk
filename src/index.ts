export { PaybetaClient } from './client.js';
export type { PaybetaClientConfig } from './client.js';

export { PaybetaError, PaybetaApiError } from './errors.js';

export type { PaginatedList, RequestOptions } from './types/common.js';

export type {
  Transaction,
  TransactionStatus,
  TransactionEvent,
  CreateTransactionParams,
  ListTransactionsParams,
} from './types/transactions.js';

export type {
  Payment,
  PaymentAttempt,
  PaymentStatus,
  PaymentMethod,
  PSPType,
  InitiatePaymentParams,
  ListPaymentsParams,
} from './types/payments.js';

export type {
  Escrow,
  EscrowStatus,
  EscrowBalance,
  ReleaseCondition,
  ReleasePolicy,
  ConditionType,
  ConditionLogic,
  CreateEscrowParams,
  CreateEscrowConditionParams,
  CreateEscrowReleasePolicyParams,
  ListEscrowsParams,
  ReleaseEscrowParams,
  ConfirmDeliveryParams,
  ConfirmBuyerParams,
} from './types/escrows.js';

export type {
  Dispute,
  DisputeStatus,
  DisputeStage,
  DisputeType,
  DisputePriority,
  ResolutionOutcome,
  Evidence,
  OpenDisputeParams,
  ListDisputesParams,
  UploadEvidenceParams,
  ResolveDisputeParams,
  CancelDisputeParams,
} from './types/disputes.js';

export type {
  WebhookEvent,
  WebhookEventType,
  TransactionWebhookEvent,
  PaymentWebhookEvent,
  EscrowWebhookEvent,
  DisputeWebhookEvent,
} from './types/webhooks.js';
