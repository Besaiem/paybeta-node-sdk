import type { HttpClient } from '../http.js';
import type {
  Payment,
  PaymentAttempt,
  InitiatePaymentParams,
  ListPaymentsParams,
} from '../types/payments.js';
import type { PaginatedList } from '../types/common.js';

export class PaymentsResource {
  constructor(private readonly http: HttpClient) {}

  initiate(params: InitiatePaymentParams): Promise<Payment> {
    const { idempotencyKey, ...rest } = params;
    const body = idempotencyKey ? { ...rest, idempotencyKey } : rest;
    return this.http.post<Payment>('/payments', body);
  }

  list(params?: ListPaymentsParams): Promise<PaginatedList<Payment>> {
    return this.http.get<PaginatedList<Payment>>('/payments', params as Record<string, string | number | undefined>);
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
