import type { HttpClient } from '../http.js';
import type {
  Transaction,
  CreateTransactionParams,
  ListTransactionsParams,
  TransactionEvent,
} from '../types/transactions.js';
import type { PaginatedList, RequestOptions } from '../types/common.js';

export class TransactionsResource {
  constructor(private readonly http: HttpClient) {}

  create(params: CreateTransactionParams, opts?: RequestOptions): Promise<Transaction> {
    const body = opts?.idempotencyKey
      ? { ...params, idempotencyKey: opts.idempotencyKey }
      : params;
    return this.http.post<Transaction>('/transactions', body);
  }

  list(params?: ListTransactionsParams): Promise<PaginatedList<Transaction>> {
    return this.http.get<PaginatedList<Transaction>>('/transactions', params as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Transaction> {
    return this.http.get<Transaction>(`/transactions/${id}`);
  }

  listHistory(id: string): Promise<TransactionEvent[]> {
    return this.http.get<TransactionEvent[]>(`/transactions/${id}/history`);
  }
}
