"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/types/api";
import {
  getCurrentUser,
  updateCurrentUser,
  type UpdateProfileInput,
} from "@/lib/api/users";
import {
  login as loginRequest,
  register as registerRequest,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api/auth";
import { useToast } from "@/lib/toast/toast-provider";
import {
  clearAccessToken,
  readAccessToken,
  UNAUTHORIZED_EVENT,
  writeAccessToken,
} from "./token";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
  status: AuthStatus;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const anonymousState: AuthState = { status: "anonymous", user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });
  const { toast } = useToast();
  const lastUnauthorizedAt = useRef(0);

  useEffect(() => {
    const token = readAccessToken();

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync auth state with the browser token store.
      setState(anonymousState);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    getCurrentUser(controller.signal)
      .then((user) => {
        if (!cancelled) {
          setState({ status: "authenticated", user });
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAccessToken();
          setState(anonymousState);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken();
      setState(anonymousState);

      const now = Date.now();

      if (now - lastUnauthorizedAt.current > 4_000) {
        lastUnauthorizedAt.current = now;
        toast({
          title: "Session expired",
          description: "Please sign in again to continue.",
          variant: "error",
        });
      }
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [toast]);

  const loadAuthenticatedUser = useCallback(async () => {
    const user = await getCurrentUser();
    setState({ status: "authenticated", user });
    return user;
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await loginRequest(input);
      writeAccessToken(response.accessToken);

      try {
        return await loadAuthenticatedUser();
      } catch (error) {
        clearAccessToken();
        setState(anonymousState);
        throw error;
      }
    },
    [loadAuthenticatedUser],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await registerRequest(input);
      writeAccessToken(response.accessToken);

      try {
        return await loadAuthenticatedUser();
      } catch (error) {
        clearAccessToken();
        setState(anonymousState);
        throw error;
      }
    },
    [loadAuthenticatedUser],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setState(anonymousState);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!readAccessToken()) {
      setState(anonymousState);
      return null;
    }

    try {
      return await loadAuthenticatedUser();
    } catch {
      clearAccessToken();
      setState(anonymousState);
      return null;
    }
  }, [loadAuthenticatedUser]);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const user = await updateCurrentUser(input);
    setState({ status: "authenticated", user });
    return user;
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [state, login, register, logout, refreshUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
