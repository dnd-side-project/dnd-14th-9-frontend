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
    });
  });

  it("accessToken만 있으면 access/auth 상태만 true여야 함", async () => {
    mockCookieStore.get.mockImplementation((name: string) =>
      name === "accessToken" ? { value: "access-token" } : undefined
    );

    await expect(getServerAuthCookieState()).resolves.toEqual({
      hasAccessToken: true,
      hasRefreshToken: false,
      hasAuthCookies: true,
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
    });
  });

  it("두 토큰이 모두 있으면 모든 상태가 true여야 함", async () => {
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
    });
  });
});
