"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import { memberQueries } from "@/features/member/hooks/useMemberHooks";
import {
  createAuthenticatedAuthState,
  GUEST_AUTH_STATE,
  type AuthState,
} from "@/lib/auth/auth-state";

interface AuthStateProviderProps {
  children: ReactNode;
  initialState: AuthState;
}

const AuthStateContext = createContext<AuthState>(GUEST_AUTH_STATE);

export function AuthStateProvider({ children, initialState }: AuthStateProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const recoveringQuery = useQuery({
    ...memberQueries.me(),
    enabled: authState.status === "recovering",
  });

  useEffect(() => {
    setAuthState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (authState.status !== "recovering") {
      return;
    }

    if (recoveringQuery.data?.result) {
      setAuthState(createAuthenticatedAuthState(recoveringQuery.data.result));
      return;
    }

    if (recoveringQuery.isError) {
      setAuthState(GUEST_AUTH_STATE);
    }
  }, [authState.status, recoveringQuery.data, recoveringQuery.isError]);

  return <AuthStateContext.Provider value={authState}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  return useContext(AuthStateContext);
}
