import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isRequestCanceled } from "../api/api.helper";
import { onSessionExpired } from "../api/auth.events";
import { authService } from "../api/services/auth.service";
import type { LoginInput, Role, SignupInput, User } from "../types/auth.types";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  type SignOutReason,
} from "./auth.context";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  signOutReason: SignOutReason;
}

// Keeps auth state in sync across tabs (sign out in one tab signs out all of them)
const CHANNEL_NAME = "taskflow-auth";
type ChannelMessage = { type: "logout" } | { type: "login" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
    signOutReason: null,
  });
  const channelRef = useRef<BroadcastChannel | null>(null);
  const broadcast = useCallback(
    (message: ChannelMessage) => channelRef.current?.postMessage(message),
    []
  );

  const setAuthenticated = useCallback(
    (user: User) => setState({ status: "authenticated", user, signOutReason: null }),
    []
  );
  const setSignedOut = useCallback(
    (signOutReason: SignOutReason) =>
      setState({ status: "unauthenticated", user: null, signOutReason }),
    []
  );

  const loadCurrentUser = useCallback(
    (signal?: AbortSignal) =>
      authService
        .me(signal)
        .then(setAuthenticated)
        .catch((error: unknown) => {
          if (!isRequestCanceled(error)) setSignedOut(null);
        }),
    [setAuthenticated, setSignedOut]
  );

  // Restore the session on first load (the interceptor refreshes silently if needed)
  useEffect(() => {
    const controller = new AbortController();
    loadCurrentUser(controller.signal);
    return () => controller.abort();
  }, [loadCurrentUser]);

  // Refresh token rejected mid-session
  useEffect(
    () =>
      onSessionExpired(() =>
        setState((prev) =>
          prev.status === "authenticated"
            ? { status: "unauthenticated", user: null, signOutReason: "expired" }
            : { ...prev, status: "unauthenticated", user: null }
        )
      ),
    []
  );

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      if (event.data?.type === "logout") setSignedOut("logout");
      if (event.data?.type === "login") loadCurrentUser();
    };
    channelRef.current = channel;
    return () => {
      channelRef.current = null;
      channel.close();
    };
  }, [loadCurrentUser, setSignedOut]);

  const login = useCallback(
    async (input: LoginInput) => {
      const user = await authService.login(input);
      setAuthenticated(user);
      broadcast({ type: "login" });
      return user;
    },
    [broadcast, setAuthenticated]
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const user = await authService.signup(input);
      setAuthenticated(user);
      broadcast({ type: "login" });
      return user;
    },
    [broadcast, setAuthenticated]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // sign out locally even if the request fails; cookies expire on their own
      setSignedOut("logout");
      broadcast({ type: "logout" });
    }
  }, [broadcast, setSignedOut]);

  const clearSession = useCallback(() => setSignedOut(null), [setSignedOut]);

  const hasRole = useCallback(
    (...roles: Role[]) => !!state.user && roles.includes(state.user.role),
    [state.user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, signup, logout, clearSession, hasRole }),
    [state, login, signup, logout, clearSession, hasRole]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
