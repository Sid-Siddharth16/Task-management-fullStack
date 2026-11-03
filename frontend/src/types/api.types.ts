// Mirrors backend ApiResponse
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// Mirrors backend FieldError
export interface FieldError {
  field: string;
  message: string;
}

// Mirrors backend errorHandler response
export interface ApiErrorBody {
  success?: false;
  message?: string;
  errors?: FieldError[];
}
