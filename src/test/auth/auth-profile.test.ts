import type { AuthState } from "@/features/auth/hooks/useAuthState";
import { getAuthProfile } from "@/features/auth/lib/auth-profile";
import type { MemberProfileView } from "@/features/member/types";

const profile = { id: 1, nickname: "경환" } as MemberProfileView;

describe("getAuthProfile", () => {
  it("authenticated이면 프로필을 반환한다", () => {
    expect(getAuthProfile({ status: "authenticated", profile })).toBe(profile);
  });

  it.each<[string, AuthState]>([
    ["guest", { status: "guest" }],
    ["recovering", { status: "recovering" }],
    ["unavailable", { status: "unavailable", retry: jest.fn() }],
  ])("%s이면 undefined를 반환한다", (_, authState) => {
    expect(getAuthProfile(authState)).toBeUndefined();
  });
});
