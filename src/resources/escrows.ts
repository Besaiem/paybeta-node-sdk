import type { HttpClient } from '../http.js';
import type {
  Escrow,
  EscrowBalance,
  EscrowListResponse,
  EscrowConditionsResponse,
  CreateEscrowParams,
  ListEscrowsParams,
  ReleaseEscrowParams,
  ConfirmDeliveryParams,
  ConfirmBuyerParams,
} from '../types/escrows.js';
import type { RequestOptions } from '../types/common.js';

export class EscrowsResource {
  constructor(private readonly http: HttpClient) {}

  create(params: CreateEscrowParams, opts?: RequestOptions): Promise<Escrow> {
    const body = opts?.idempotencyKey
      ? { ...params, idempotencyKey: opts.idempotencyKey }
      : params;
    return this.http.post<Escrow>('/escrows', body);
  }

  /**
   * Lists escrows. The bare `/escrows` endpoint is platform-role only — an
   * API-key (merchant) caller gets a 403 there — so passing `merchantId`
   * routes to `/escrows/merchant/:merchantId` instead. Unlike
   * payments/transactions/disputes, this returns a `{ escrows, total,
   * limit, offset }` envelope rather than a bare array.
   */
  list(params?: ListEscrowsParams): Promise<EscrowListResponse> {
    const { merchantId, ...rest } = params ?? {};
    const path = merchantId ? `/escrows/merchant/${merchantId}` : '/escrows';
    return this.http.get<EscrowListResponse>(path, rest as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Escrow> {
    return this.http.get<Escrow>(`/escrows/${id}`);
  }

  retrieveBalance(id: string): Promise<EscrowBalance> {
    return this.http.get<EscrowBalance>(`/escrows/${id}/balance`);
  }

  retrieveConditions(id: string): Promise<EscrowConditionsResponse> {
    return this.http.get<EscrowConditionsResponse>(`/escrows/${id}/conditions`);
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

  cancel(id: string): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/cancel`);
  }

  confirmDelivery(id: string, params?: ConfirmDeliveryParams): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/confirm-delivery`, params);
  }

  confirmBuyer(id: string, params?: ConfirmBuyerParams): Promise<Escrow> {
    return this.http.post<Escrow>(`/escrows/${id}/confirm-buyer`, params);
  }
}
