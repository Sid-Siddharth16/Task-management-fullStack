import { createContext } from "react";
import type { LoginInput, Role, SignupInput, User } from "../types/auth.types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// why the user is signed out; lets the login page explain it
export type SignOutReason = "logout" | "expired" | null;

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signOutReason: SignOutReason;
  login: (input: LoginInput) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => Promise<void>;
  // drop local auth state without calling the API (e.g. after a password reset)
  clearSession: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
