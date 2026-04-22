"use client";

import { createContext, useContext, type ReactNode } from "react";

interface AuthStateProviderProps {
  children: ReactNode;
  hasAuthCookies: boolean;
}

const AuthStateContext = createContext(false);

export function AuthStateProvider({ children, hasAuthCookies }: AuthStateProviderProps) {
  return <AuthStateContext.Provider value={hasAuthCookies}>{children}</AuthStateContext.Provider>;
}

export function useAuthHint() {
  return useContext(AuthStateContext);
}
