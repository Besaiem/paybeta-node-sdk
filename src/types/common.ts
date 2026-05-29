export interface PaginatedList<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface RequestOptions {
  idempotencyKey?: string;
}
