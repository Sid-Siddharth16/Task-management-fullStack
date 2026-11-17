import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ENV } from "../config/env.config";
import { HTTP_STATUS } from "../constants/http.constant";
import { isRequestCanceled, toHttpError } from "./api.helper";
import { API_ENDPOINTS } from "./api.endpoints";
import { emitSessionExpired } from "./auth.events";

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  // send/receive the httpOnly auth cookies
  withCredentials: true,
  headers: { Accept: "application/json" },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// A 401 from these means "wrong credentials / bad token", not "access token expired"
const SKIP_REFRESH = new Set<string>([
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.SIGNUP,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
]);

// Single-flight: many requests failing with 401 at once share one refresh call
let refreshInFlight: Promise<void> | null = null;
const refreshSession = () =>
  (refreshInFlight ??= axiosInstance
    .post(API_ENDPOINTS.AUTH.REFRESH)
    .then(() => undefined)
    .finally(() => {
      refreshInFlight = null;
    }));

// Every rejected request surfaces as an HttpError (cancellations pass through untouched).
// On a 401 the access token is silently refreshed once and the request retried.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (isRequestCanceled(error)) throw error;

    const axiosError = error as AxiosError;
    const config = axiosError.config as RetriableConfig | undefined;
    const shouldRefresh =
      axiosError.response?.status === HTTP_STATUS.UNAUTHORIZED &&
      config &&
      !config._retried &&
      !SKIP_REFRESH.has(config.url ?? "");

    if (shouldRefresh) {
      config._retried = true;
      try {
        await refreshSession();
      } catch {
        emitSessionExpired();
        throw toHttpError(error);
      }
      return axiosInstance(config);
    }

    throw toHttpError(error);
  }
);

export default axiosInstance;
