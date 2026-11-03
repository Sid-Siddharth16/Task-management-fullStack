import { HTTP_STATUS } from "../../constants/http.constant";
import type { ApiResponse } from "../../types/api.types";
import type { ApiInfo, HealthStatus } from "../../types/system.types";
import { API_ENDPOINTS } from "../api.endpoints";
import axiosInstance from "../axios.instance";

export const systemService = {
  async getInfo(signal?: AbortSignal) {
    const { data } = await axiosInstance.get<ApiResponse<ApiInfo>>(API_ENDPOINTS.SYSTEM.INFO, {
      signal,
    });
    return data.data;
  },

  // Backend answers 503 (with the same body) when the DB is down; that's a status, not a failure
  async getHealth(signal?: AbortSignal) {
    const { data } = await axiosInstance.get<ApiResponse<HealthStatus>>(
      API_ENDPOINTS.SYSTEM.HEALTH,
      {
        signal,
        validateStatus: (status) =>
          status === HTTP_STATUS.OK || status === HTTP_STATUS.SERVICE_UNAVAILABLE,
      }
    );
    return data.data;
  },
};
