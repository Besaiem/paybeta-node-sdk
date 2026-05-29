import type { HttpClient } from '../http.js';
import type {
  Dispute,
  OpenDisputeParams,
  ListDisputesParams,
  UploadEvidenceParams,
  ResolveDisputeParams,
  CancelDisputeParams,
} from '../types/disputes.js';
import type { PaginatedList } from '../types/common.js';

export class DisputesResource {
  constructor(private readonly http: HttpClient) {}

  open(params: OpenDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>('/disputes', params);
  }

  list(params?: ListDisputesParams): Promise<PaginatedList<Dispute>> {
    return this.http.get<PaginatedList<Dispute>>('/disputes', params as Record<string, string | number | undefined>);
  }

  retrieve(id: string): Promise<Dispute> {
    return this.http.get<Dispute>(`/disputes/${id}`);
  }

  uploadEvidence(id: string, params: UploadEvidenceParams): Promise<void> {
    return this.http.post<void>(`/disputes/${id}/evidence`, params);
  }

  resolve(id: string, params: ResolveDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>(`/disputes/${id}/resolve`, params);
  }

  cancel(id: string, params: CancelDisputeParams): Promise<Dispute> {
    return this.http.post<Dispute>(`/disputes/${id}/cancel`, params);
  }
}
