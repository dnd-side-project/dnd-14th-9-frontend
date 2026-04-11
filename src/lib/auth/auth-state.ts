import type { MemberProfileView } from "@/features/member/types";

export type AuthStatus = "guest" | "recovering" | "authenticated";
export type RecoveringReason = "me_fetch_failed";

export interface GuestAuthState {
  status: "guest";
  hasAuthCookies: false;
  profile: null;
}

export interface RecoveringAuthState {
  status: "recovering";
  hasAuthCookies: true;
  profile: null;
  reason: RecoveringReason;
}

export interface AuthenticatedAuthState {
  status: "authenticated";
  hasAuthCookies: true;
  profile: MemberProfileView;
}

export type AuthState = GuestAuthState | RecoveringAuthState | AuthenticatedAuthState;

export const GUEST_AUTH_STATE: GuestAuthState = {
  status: "guest",
  hasAuthCookies: false,
  profile: null,
};

export function createRecoveringAuthState(reason: RecoveringReason): RecoveringAuthState {
  return {
    status: "recovering",
    hasAuthCookies: true,
    profile: null,
    reason,
  };
}

export function createAuthenticatedAuthState(profile: MemberProfileView): AuthenticatedAuthState {
  return {
    status: "authenticated",
    hasAuthCookies: true,
    profile,
  };
}
