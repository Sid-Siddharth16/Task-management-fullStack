import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { HTTP_ERROR_MESSAGES, NETWORK_ERROR_STATUS } from "../constants/http.constant";
import { HttpError, toHttpError } from "./api.helper";

const axiosErrorWith = (status: number, data: unknown) =>
  new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
    data,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosResponse);

describe("toHttpError", () => {
  it("uses the backend message and field errors", () => {
    const errors = [{ field: "email", message: "Invalid email address" }];
    const result = toHttpError(
      axiosErrorWith(400, { success: false, message: "Invalid email address", errors })
    );

    expect(result).toBeInstanceOf(HttpError);
    expect(result.status).toBe(400);
    expect(result.message).toBe("Invalid email address");
    expect(result.errors).toEqual(errors);
  });

  it("falls back to a status message when the body is not JSON", () => {
    const result = toHttpError(axiosErrorWith(502, "<html>Bad Gateway</html>"));

    expect(result.status).toBe(502);
    expect(result.message).toBe("Something went wrong. Please try again.");
    expect(result.errors).toEqual([]);
  });

  it("maps a request with no response to a network error", () => {
    const result = toHttpError(new AxiosError("Network Error", "ERR_NETWORK"));

    expect(result.status).toBe(NETWORK_ERROR_STATUS);
    expect(result.message).toBe(HTTP_ERROR_MESSAGES[NETWORK_ERROR_STATUS]);
  });

  it("returns an existing HttpError unchanged", () => {
    const original = new HttpError(404, "Not found");
    expect(toHttpError(original)).toBe(original);
  });
});
