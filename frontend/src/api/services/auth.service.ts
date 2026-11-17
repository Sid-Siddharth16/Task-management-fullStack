import type { ApiResponse } from "../../types/api.types";
import type {
  AuthPayload,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  User,
} from "../../types/auth.types";
import { API_ENDPOINTS } from "../api.endpoints";
import axiosInstance from "../axios.instance";

// Tokens live in httpOnly cookies set by the backend; nothing here ever touches them.
export const authService = {
  async signup(input: SignupInput): Promise<User> {
    const { data } = await axiosInstance.post<ApiResponse<AuthPayload>>(
      API_ENDPOINTS.AUTH.SIGNUP,
      input
    );
    return data.data.user;
  },

  async login(input: LoginInput): Promise<User> {
    const { data } = await axiosInstance.post<ApiResponse<AuthPayload>>(
      API_ENDPOINTS.AUTH.LOGIN,
      input
    );
    return data.data.user;
  },

  async me(signal?: AbortSignal): Promise<User> {
    const { data } = await axiosInstance.get<ApiResponse<AuthPayload>>(API_ENDPOINTS.AUTH.ME, {
      signal,
    });
    return data.data.user;
  },

  async logout(): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return data.message;
  },

  async resetPassword(input: ResetPasswordInput): Promise<string> {
    const { data } = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      input
    );
    return data.message;
  },
};
