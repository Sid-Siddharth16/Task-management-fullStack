import type { Role } from "../constants.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      // set by the authenticate middleware
      user?: AuthUser;
    }
  }
}
