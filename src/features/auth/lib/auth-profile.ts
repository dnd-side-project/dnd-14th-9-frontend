import type { AuthState } from "@/features/auth/hooks/useAuthState";
import type { MemberProfileView } from "@/features/member/types";

// useAuthState 모듈을 모킹하는 테스트에서도 살아 있도록 훅과 별도 파일에 둔다.
export function getAuthProfile(authState: AuthState): MemberProfileView | undefined {
  return authState.status === "authenticated" ? authState.profile : undefined;
}
