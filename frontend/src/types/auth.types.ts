import type { ROLES } from "../constants/auth.constant";

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Mirrors backend User.toJSON
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}
