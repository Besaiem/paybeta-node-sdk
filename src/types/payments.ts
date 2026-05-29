export type PSPType = 'PAYSTACK' | 'FLUTTERWAVE' | 'BANK_DIRECT';

export type PaymentMethod =
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'USSD'
  | 'MOBILE_MONEY'
  | 'BANK_ACCOUNT';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Payment {
  id: string;
  paymentId?: string;
  merchantId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  pspType: PSPType;
  customerEmail: string;
  customerName?: string;
  pspReference?: string;
  authorizationUrl?: string;
  paymentLinkToken?: string;
  paymentLinkUrl?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  attemptNumber: number;
  status: PaymentStatus;
  pspReference?: string;
  failureReason?: string;
  attemptedAt: string;
}

export interface InitiatePaymentParams {
  merchantId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  pspType: PSPType;
  customerEmail: string;
  customerName?: string;
  idempotencyKey?: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ListPaymentsParams {
  merchantId?: string;
  limit?: number;
  offset?: number;
}
