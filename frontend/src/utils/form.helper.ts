import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toHttpError } from "../api/api.helper";

// Maps backend field errors onto form inputs; returns the message for the form-level alert.
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[]
): string {
  const httpError = toHttpError(error);
  let mappedAll = httpError.errors.length > 0;

  for (const fieldError of httpError.errors) {
    if ((fields as readonly string[]).includes(fieldError.field)) {
      setError(fieldError.field as Path<T>, { type: "server", message: fieldError.message });
    } else {
      mappedAll = false;
    }
  }
  // the alert would just repeat the inline message
  return mappedAll ? "" : httpError.message;
}
