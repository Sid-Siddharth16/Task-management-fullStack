import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import { vi } from "vitest";
import { AuthContext, type AuthContextValue } from "../context/auth.context";
import type { User } from "../types/auth.types";

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: "u1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  role: "member",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const makeAuth = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => {
  const user = overrides.user === undefined ? null : overrides.user;
  return {
    status: user ? "authenticated" : "unauthenticated",
    user,
    signOutReason: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    clearSession: vi.fn(),
    hasRole: (...roles) => !!user && roles.includes(user.role),
    ...overrides,
  };
};

export function renderRoutes(routes: RouteObject[], initialPath: string, auth: AuthContextValue) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <AuthContext value={auth}>
      <RouterProvider router={router} />
    </AuthContext>
  );
  return router;
}
