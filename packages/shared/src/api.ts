export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
};
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
