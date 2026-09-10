import type { HttpClient } from '../http.js';
import type {
  Payment,
  PaymentAttempt,
  InitiatePaymentParams,
  ListPaymentsParams,
} from '../types/payments.js';

export class PaymentsResource {
  constructor(private readonly http: HttpClient) {}

  initiate(params: InitiatePaymentParams): Promise<Payment> {
    const { idempotencyKey, ...rest } = params;
    const body = idempotencyKey ? { ...rest, idempotencyKey } : rest;
    return this.http.post<Payment>('/payments', body);
  }

  /**
   * Lists payments. The bare `/payments` endpoint is platform-role only —
   * an API-key (merchant) caller gets a 403 there — so passing `merchantId`
   * (which every merchant API key call needs) routes to
   * `/payments/merchant/:merchantId` instead, matching what the API
   * actually allows a merchant credential to call.
   */
  list(params?: ListPaymentsParams): Promise<Payment[]> {
    const { merchantId, ...rest } = params ?? {};
    const path = merchantId ? `/payments/merchant/${merchantId}` : '/payments';
    return this.http.get<Payment[]>(path, rest as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Payment> {
    return this.http.get<Payment>(`/payments/${id}`);
  }

  verify(id: string): Promise<Payment> {
    return this.http.post<Payment>(`/payments/${id}/verify`);
  }

  retry(id: string): Promise<Payment> {
    return this.http.post<Payment>(`/payments/${id}/retry`);
  }

  listAttempts(id: string): Promise<PaymentAttempt[]> {
    return this.http.get<PaymentAttempt[]>(`/payments/${id}/attempts`);
  }
}
