export const DB_NAME = "Task-management";

export const API_NAME = "Task-management API";
export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ROLE_VALUES = Object.values(ROLES) as [Role, ...Role[]];

// refresh cookie is scoped to the auth routes so it's never sent with regular API calls
export const AUTH_ROUTES_PATH = `${API_PREFIX}/auth`;
export const COOKIES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const JWT_ISSUER = "taskflow-api";
export const JWT_AUDIENCE = "taskflow-web";

export const PASSWORD_RESET_TTL_MS = 15 * 60_000;
export const PASSWORD_MIN_LENGTH = 8;
// argon2 cost doesn't depend on length, but cap it so huge bodies can't be hashed
export const PASSWORD_MAX_LENGTH = 128;
