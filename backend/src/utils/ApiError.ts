export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly success = false;
  public readonly data = null;

  constructor(
    public statusCode: number,
    message = "Something went wrong",
    public errors: FieldError[] = []
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace?.(this, ApiError);
  }
}
