import type { GetMeResponse, MemberProfileView } from "@/features/member/types";
import { AUTH_MARKER_COOKIE } from "@/lib/auth/cookie-constants";

function createProfile(overrides: Partial<MemberProfileView> = {}): MemberProfileView {
  return {
    id: 1,
    nickname: "기존유저",
    profileImageUrl: "https://example.com/initial.png",
    email: "prev@example.com",
    bio: "기존 소개",
    socialProvider: "kakao",
    totalParticipationTime: 3600,
    focusedTime: 1800,
    focusRate: 50,
    totalTodoCount: 10,
    completedTodoCount: 4,
    todoCompletionRate: 40,
    participationSessionCount: 3,
    firstLogin: false,
    ...overrides,
  };
}

export function createMeResponse(overrides: Partial<MemberProfileView> = {}): GetMeResponse {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공",
    result: createProfile(overrides),
  };
}

export function setAuthMarkerCookie(present: boolean) {
  if (present) {
    document.cookie = `${AUTH_MARKER_COOKIE}=1; path=/`;
    return;
  }
  document.cookie = `${AUTH_MARKER_COOKIE}=; max-age=0; path=/`;
}
