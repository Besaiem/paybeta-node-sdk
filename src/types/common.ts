// There is no single generic pagination envelope in the real API: the
// payments/transactions/disputes list endpoints return a bare JSON array,
// and only escrows wraps its list in an object (see EscrowListResponse in
// types/escrows.ts, shaped `{ escrows, total, limit, offset }`). Each
// resource's `list()` return type reflects its own actual shape instead of
// a shared `PaginatedList<T>`.

export interface RequestOptions {
  idempotencyKey?: string;
}
