import type { HttpClient } from '../http.js';
import type {
  Transaction,
  CreateTransactionParams,
  ListTransactionsParams,
  TransactionEvent,
} from '../types/transactions.js';
import type { RequestOptions } from '../types/common.js';

export class TransactionsResource {
  constructor(private readonly http: HttpClient) {}

  create(params: CreateTransactionParams, opts?: RequestOptions): Promise<Transaction> {
    const body = opts?.idempotencyKey
      ? { ...params, idempotencyKey: opts.idempotencyKey }
      : params;
    return this.http.post<Transaction>('/transactions', body);
  }

  /**
   * Lists transactions. The bare `/transactions` endpoint is platform-role
   * only — an API-key (merchant) caller gets a 403 there — so passing
   * `merchantId` routes to `/transactions/merchant/:merchantId` instead.
   */
  list(params?: ListTransactionsParams): Promise<Transaction[]> {
    const { merchantId, ...rest } = params ?? {};
    const path = merchantId ? `/transactions/merchant/${merchantId}` : '/transactions';
    return this.http.get<Transaction[]>(path, rest as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Transaction> {
    return this.http.get<Transaction>(`/transactions/${id}`);
  }

  listHistory(id: string): Promise<TransactionEvent[]> {
    return this.http.get<TransactionEvent[]>(`/transactions/${id}/history`);
  }
}
