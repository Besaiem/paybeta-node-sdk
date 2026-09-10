// Status values are lowercased by the API at the gRPC-to-HTTP boundary
// (`e.status.replace('ESCROW_STATUS_', '').toLowerCase()` in
// escrow.controller.ts) — not the uppercase enum names you'd expect from
// the proto definitions.
export type EscrowStatus =
  | 'created'
  | 'funded'
  | 'pending_release'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

// Matches the condition-type names the API actually accepts
// (toProtoConditionType in escrow.controller.ts) — anything else silently
// maps to CONDITION_TYPE_UNSPECIFIED server-side rather than erroring.
export type ConditionType =
  | 'DELIVERY_CONFIRMATION'
  | 'BUYER_CONFIRMATION'
  | 'TIME_BASED'
  | 'MANUAL_APPROVAL';

export type ConditionLogic = 'AND' | 'OR';

export interface ReleaseCondition {
  type: ConditionType;
  config?: Record<string, unknown>;
  isMet: boolean;
  metAt?: string;
}

// The field is named `logic` on the way out (shapeEscrow's response
// shaping), even though the request DTO that creates it is named
// `conditionLogic` (see CreateEscrowReleasePolicyParams below) — the API
// itself is asymmetric here, not a naming choice made by this SDK.
export interface ReleasePolicy {
  logic: ConditionLogic;
  conditions: Array<{ type: ConditionType; config?: Record<string, unknown> }>;
}

// All three amounts are decimal strings (kobo / 100, formatted to 2dp) —
// see kobotoDisplay() in escrow.controller.ts — not numbers.
export interface EscrowBalance {
  escrowId: string;
  heldAmount: string;
  releasedAmount: string;
  refundedAmount: string;
  currency: string;
}

export interface Escrow {
  id: string;
  transactionId: string;
  merchantId: string;
  buyerEmail: string;
  sellerEmail: string;
  /** Integer amount in kobo — the API does not divide this down to a decimal on the way out, unlike on create. */
  amount: number;
  currency: string;
  status: EscrowStatus;
  releasePolicy: ReleasePolicy | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Only present on GET /escrows/:id. */
  deliveryTrackingReference?: string | null;
}

export interface CreateEscrowConditionParams {
  type: ConditionType;
  config?: Record<string, unknown>;
}

export interface CreateEscrowReleasePolicyParams {
  conditionLogic?: ConditionLogic;
  conditions?: CreateEscrowConditionParams[];
}

export interface CreateEscrowParams {
  transactionId: string;
  merchantId: string;
  buyerEmail: string;
  /** E.164 phone number — required by the API as a guaranteed WhatsApp/SMS delivery channel. */
  buyerPhone: string;
  sellerEmail: string;
  /** Decimal amount in the major currency unit (naira/dollars) — the API converts to kobo itself. */
  amount: number;
  currency: string;
  releasePolicy?: CreateEscrowReleasePolicyParams;
  idempotencyKey?: string;
}

// `transactionId` is not a supported filter — the list/list-by-merchant
// endpoints only read `status`, `limit`, and `offset` off the query string.
export interface ListEscrowsParams {
  merchantId?: string;
  status?: EscrowStatus;
  limit?: number;
  offset?: number;
}

// GET /escrows/:id/conditions returns this envelope (shapeConditions in
// escrow.controller.ts), not a bare ReleaseCondition[].
export interface EscrowConditionsResponse {
  escrowId: string;
  logic: ConditionLogic;
  canRelease: boolean;
  conditions: ReleaseCondition[];
}

// GET /escrows and GET /escrows/merchant/:id both return this envelope —
// unlike payments/transactions/disputes, which return a bare array.
export interface EscrowListResponse {
  escrows: Escrow[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReleaseEscrowParams {
  /** Ignored if supplied — actorId/actorType come from the caller's own session, never the request body, per the API's audit-trail design. Kept optional for forward-compat only. */
  actorId?: string;
  actorType?: string;
  idempotencyKey?: string;
}

export interface ConfirmDeliveryParams {
  actorId?: string;
  idempotencyKey?: string;
  trackingReference?: string;
}

export interface ConfirmBuyerParams {
  actorId?: string;
  idempotencyKey?: string;
}
