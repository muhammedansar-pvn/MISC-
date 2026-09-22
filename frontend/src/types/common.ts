export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: any;
}

export interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]> | any;
  success?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  [key: string]: any;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
