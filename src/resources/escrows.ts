import type { HttpClient } from '../http.js';
import type {
  Escrow,
  EscrowBalance,
  ReleaseCondition,
  CreateEscrowParams,
  ListEscrowsParams,
  ReleaseEscrowParams,
  ConfirmDeliveryParams,
  ConfirmBuyerParams,
} from '../types/escrows.js';
import type { PaginatedList, RequestOptions } from '../types/common.js';

export class EscrowsResource {
  constructor(private readonly http: HttpClient) {}

  create(params: CreateEscrowParams, opts?: RequestOptions): Promise<Escrow> {
    const body = opts?.idempotencyKey
      ? { ...params, idempotencyKey: opts.idempotencyKey }
      : params;
    return this.http.post<Escrow>('/escrows', body);
  }

  list(params?: ListEscrowsParams): Promise<PaginatedList<Escrow>> {
    return this.http.get<PaginatedList<Escrow>>('/escrows', params as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Escrow> {
    return this.http.get<Escrow>(`/escrows/${id}`);
  }

  retrieveBalance(id: string): Promise<EscrowBalance> {
    return this.http.get<EscrowBalance>(`/escrows/${id}/balance`);
  }

  retrieveConditions(id: string): Promise<ReleaseCondition[]> {
    return this.http.get<ReleaseCondition[]>(`/escrows/${id}/conditions`);
  }

  release(id: string, params?: ReleaseEscrowParams): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/release`, params);
  }

  refund(id: string): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/refund`);
  }

  dispute(id: string): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/dispute`);
  }

  confirmDelivery(id: string, params?: ConfirmDeliveryParams): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/confirm-delivery`, params);
  }

  confirmBuyer(id: string, params?: ConfirmBuyerParams): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/confirm-buyer`, params);
  }
}
