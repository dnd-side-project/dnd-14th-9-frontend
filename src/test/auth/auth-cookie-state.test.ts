import { cookies } from "next/headers";

import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("auth-cookie-state", () => {
  let mockCookieStore: {
    get: jest.Mock;
  };

  beforeEach(() => {
    mockCookieStore = {
      get: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  it("accessToken과 refreshToken이 모두 없으면 false 상태를 반환해야 함", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
      isAccessTokenUsable: false,
    });
  });

  it("accessToken만 있으면 access/auth 상태만 true여야 함(단, 유효한 JWT가 아니므로 isAccessTokenUsable은 false)", async () => {
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" ? { value: "access-token" } : undefined
    );

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: true,
      hasRefreshToken: false,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
  });

  it("refreshToken만 있으면 refresh/auth 상태만 true여야 함", async () => {
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "refreshToken" ? { value: "refresh-token" } : undefined
    );

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: false,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
  });

  it("두 토큰이 모두 있으면 모든 상태가 true여야 함(단, 유효한 JWT가 아니므로 isAccessTokenUsable은 false)", async () => {
    mockCookieStore.get.mockImplementation((name: string) => {
      if (name === "accessToken") {
        return { value: "access-token" };
      }

      if (name === "refreshToken") {
        return { value: "refresh-token" };
      }

      return undefined;
    });

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
  });

  it("accessToken이 만료 전(exp가 미래)이면 isAccessTokenUsable이 true여야 함", async () => {
    const futureExpSeconds = Math.floor(Date.now() / 1000) + 10 * 60;
    const validAccessToken = createMockAccessToken(futureExpSeconds);
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" ? { value: validAccessToken } : undefined
    );

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: true,
      hasRefreshToken: false,
      hasAuthCookies: true,
      isAccessTokenUsable: true,
    });
  });

  it("accessToken이 만료(exp가 과거)되었으면 isAccessTokenUsable이 false여야 함", async () => {
    const pastExpSeconds = Math.floor(Date.now() / 1000) - 60;
    const expiredAccessToken = createMockAccessToken(pastExpSeconds);
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" ? { value: expiredAccessToken } : undefined
    );

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: true,
      hasRefreshToken: false,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
  });
});

function createMockAccessToken(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ exp: expSeconds, userId: "test-user" }));
  return `${header}.${body}.mock_signature`;
}
