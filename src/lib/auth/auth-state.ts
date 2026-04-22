import type { MemberProfileView } from "@/features/member/types";

export interface GuestAuthState {
  status: "guest";
}

export interface RecoveringAuthState {
  status: "recovering";
}

export interface AuthenticatedAuthState {
  status: "authenticated";
  profile: MemberProfileView;
}

export type AuthState = GuestAuthState | RecoveringAuthState | AuthenticatedAuthState;

export const GUEST_AUTH_STATE: GuestAuthState = {
  status: "guest",
};

export function createRecoveringAuthState(): RecoveringAuthState {
  return {
    status: "recovering",
  };
}

export function createAuthenticatedAuthState(profile: MemberProfileView): AuthenticatedAuthState {
  return {
    status: "authenticated",
    profile,
  };
}
