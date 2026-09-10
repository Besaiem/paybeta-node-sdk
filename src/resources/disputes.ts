import type { HttpClient } from '../http.js';
import type {
  Dispute,
  Evidence,
  OpenDisputeParams,
  ListDisputesParams,
  UploadEvidenceParams,
  ResolveDisputeParams,
  CancelDisputeParams,
} from '../types/disputes.js';

export class DisputesResource {
  constructor(private readonly http: HttpClient) {}

  open(params: OpenDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>('/disputes', params);
  }

  /**
   * Lists disputes. The bare `/disputes` endpoint is platform-role only —
   * an API-key (merchant) caller gets a 403 there — so passing
   * `merchantId` routes to `/disputes/merchant/:merchantId` instead.
   */
  list(params?: ListDisputesParams): Promise<Dispute[]> {
    const { merchantId, ...rest } = params ?? {};
    const path = merchantId ? `/disputes/merchant/${merchantId}` : '/disputes';
    return this.http.get<Dispute[]>(path, rest as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Dispute> {
    return this.http.get<Dispute>(`/disputes/${id}`);
  }

  listEvidence(id: string): Promise<Evidence[]> {
    return this.http.get<Evidence[]>(`/disputes/${id}/evidence`);
  }

  uploadEvidence(id: string, params: UploadEvidenceParams): Promise<Evidence> {
    return this.http.post<Evidence>(`/disputes/${id}/evidence`, params);
  }

  resolve(id: string, params: ResolveDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>(`/disputes/${id}/resolve`, params);
  }

  cancel(id: string, params: CancelDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>(`/disputes/${id}/cancel`, params);
  }
}
