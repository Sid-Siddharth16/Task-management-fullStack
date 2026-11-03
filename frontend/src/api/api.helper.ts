import { isAxiosError, isCancel } from "axios";
import {
  DEFAULT_ERROR_MESSAGE,
  HTTP_ERROR_MESSAGES,
  NETWORK_ERROR_STATUS,
} from "../constants/http.constant";
import type { ApiErrorBody, FieldError } from "../types/api.types";

export class HttpError extends Error {
  readonly status: number;
  readonly errors: FieldError[];

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}

// A proxy or crashed server may reply with HTML, so only trust a JSON message
const extractServerMessage = (data: unknown): string | undefined => {
  if (data && typeof data === "object" && "message" in data) {
    const { message } = data as ApiErrorBody;
    return typeof message === "string" && message.trim() ? message : undefined;
  }
  return undefined;
};

export const toHttpError = (error: unknown): HttpError => {
  if (error instanceof HttpError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? NETWORK_ERROR_STATUS;
    const body = error.response?.data as ApiErrorBody | undefined;
    const message =
      extractServerMessage(body) ?? HTTP_ERROR_MESSAGES[status] ?? DEFAULT_ERROR_MESSAGE;
    return new HttpError(status, message, Array.isArray(body?.errors) ? body.errors : []);
  }

  return new HttpError(
    NETWORK_ERROR_STATUS,
    error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE
  );
};

export const isRequestCanceled = (error: unknown) => isCancel(error);

export const getErrorMessage = (error: unknown) => toHttpError(error).message;
