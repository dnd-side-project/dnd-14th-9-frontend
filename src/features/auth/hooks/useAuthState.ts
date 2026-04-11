"use client";

import { useAuthState as useSharedAuthState } from "@/providers/AuthStateProvider";

export function useAuthState() {
  return useSharedAuthState();
}

export function useIsAuthenticated() {
  return useAuthState().status === "authenticated";
}

export function useIsAuthRecovering() {
  return useAuthState().status === "recovering";
}
