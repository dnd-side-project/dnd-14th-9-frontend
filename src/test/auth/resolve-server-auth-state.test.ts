import { cookies } from "next/headers";

import type { MemberProfileView } from "@/features/member/types";
import { resolveServerAuthStateWithQueryClient } from "@/lib/auth/resolve-server-auth-state";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("resolveServerAuthState", () => {
  let mockCookieStore: {
    get: jest.Mock;
  };

  const mockQueryClient = {
    fetchQuery: jest.fn(),
    removeQueries: jest.fn(),
  };

  const memberProfile: MemberProfileView = {
    id: 1,
    nickname: "경환",
    profileImageUrl: null,
    email: "test@gak.today",
    bio: null,
    socialProvider: "google",
    totalParticipationTime: 0,
    focusedTime: 0,
    focusRate: 0,
    totalTodoCount: 0,
    completedTodoCount: 0,
    todoCompletionRate: 0,
    participationSessionCount: 0,
    firstLogin: false,
  };

  beforeEach(() => {
    mockCookieStore = {
      get: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    mockQueryClient.fetchQuery.mockReset();
    mockQueryClient.removeQueries.mockReset();
  });

  it("인증 쿠키가 없으면 guest 상태를 반환해야 한다", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await expect(resolveServerAuthStateWithQueryClient(mockQueryClient)).resolves.toEqual({
      status: "guest",
      hasAuthCookies: false,
      profile: null,
    });

    expect(mockQueryClient.fetchQuery).not.toHaveBeenCalled();
  });

  it("인증 쿠키가 있고 me 조회가 성공하면 authenticated 상태를 반환해야 한다", async () => {
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" || name === "refreshToken" ? { value: `${name}-value` } : undefined
    );
    mockQueryClient.fetchQuery.mockResolvedValueOnce({ result: memberProfile });

    await expect(resolveServerAuthStateWithQueryClient(mockQueryClient)).resolves.toEqual({
      status: "authenticated",
      hasAuthCookies: true,
      profile: memberProfile,
    });
  });

  it("인증 쿠키가 있지만 me 조회가 실패하면 recovering 상태를 반환해야 한다", async () => {
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" || name === "refreshToken" ? { value: `${name}-value` } : undefined
    );
    mockQueryClient.fetchQuery.mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(resolveServerAuthStateWithQueryClient(mockQueryClient)).resolves.toEqual({
      status: "recovering",
      hasAuthCookies: true,
      profile: null,
      reason: "me_fetch_failed",
    });
    expect(mockQueryClient.removeQueries).toHaveBeenCalledWith({
      queryKey: ["member", "data"],
      exact: true,
    });
  });
});
