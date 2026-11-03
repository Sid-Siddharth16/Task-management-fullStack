import axios from "axios";
import { ENV } from "../config/env.config";
import { isRequestCanceled, toHttpError } from "./api.helper";

const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT_MS,
  // send/receive cookies (backend CORS is configured with credentials: true)
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// Every rejected request surfaces as an HttpError (cancellations pass through untouched)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(isRequestCanceled(error) ? error : toHttpError(error))
);

export default axiosInstance;
