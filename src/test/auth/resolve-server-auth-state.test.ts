import { QueryClient } from "@tanstack/react-query";

import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";
import { prepareAuthMeQuery } from "@/lib/auth/prepare-auth-me-query";

jest.mock("@/lib/auth/auth-cookie-state", () => ({
  getServerAuthCookieState: jest.fn(),
}));

describe("RootLayout auth prefetch flow", () => {
  const mockedGetServerAuthCookieState = jest.mocked(getServerAuthCookieState);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("인증 쿠키가 없으면 me prefetch를 생략해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
      isAccessTokenUsable: false,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery");

    await prepareAuthMeQuery(queryClient);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("인증 쿠키는 있지만 Access Token이 만료/부재해 사용 불가능하면 me prefetch를 생략해야 한다", async () => {
    // Access Token이 만료된 채로 SSR이 prefetch를 수행하면 서버 내부 API 호출을 통해
    // Refresh Token 회전이 발생하고, 그 결과 쿠키는 브라우저로 전달되지 않는다.
    // 이 회전을 막기 위해 이 경우에는 prefetch를 생략해야 한다.
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery");

    await expect(prepareAuthMeQuery(queryClient)).resolves.toEqual({ hasAuthCookies: true });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("mock mode에서는 인증 쿠키가 없어도 mock me prefetch를 수행하고 인증 힌트를 반환해야 한다", async () => {
    const previousUseMock = process.env.NEXT_PUBLIC_USE_MOCK;
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
      isAccessTokenUsable: false,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery").mockResolvedValue({
      isSuccess: true,
      result: { id: 1 },
    } as never);

    try {
      await expect(prepareAuthMeQuery(queryClient)).resolves.toEqual({ hasAuthCookies: true });
      expect(fetchSpy).toHaveBeenCalledWith(memberQueries.me());
    } finally {
      if (previousUseMock === undefined) {
        delete process.env.NEXT_PUBLIC_USE_MOCK;
      } else {
        process.env.NEXT_PUBLIC_USE_MOCK = previousUseMock;
      }
    }
  });

  it("Access Token이 사용 가능하면 me prefetch를 수행해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: true,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery").mockResolvedValue({
      id: 1,
      result: {
        id: 1,
      },
    } as never);

    await prepareAuthMeQuery(queryClient);

    expect(fetchSpy).toHaveBeenCalledWith(memberQueries.me());
  });

  it("me prefetch가 실패하면 member 캐시를 정리해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: true,
    });
    const queryClient = new QueryClient();
    jest.spyOn(queryClient, "fetchQuery").mockRejectedValue(new Error("Unauthorized"));
    const removeSpy = jest.spyOn(queryClient, "removeQueries");

    await prepareAuthMeQuery(queryClient);

    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: memberKeys.me(),
      exact: true,
    });
  });

  it("Access Token 만료 시 SSR prefetch는 어떤 outbound fetch도 만들지 않아야 한다 (네트워크 경계 검증)", async () => {
    // fetchQuery 호출 여부가 아니라 실제 네트워크 경계에서 검증한다. 게이트가 뚫려
    // getMe → api → fetch 체인이 실행되면 서버에서 Refresh Token 회전이 소모되므로,
    // 만료 상태에서는 그 어떤 outbound fetch도 발생하지 않아야 한다.
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: true,
      hasAuthCookies: true,
      isAccessTokenUsable: false,
    });
    const originalFetch = global.fetch;
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    try {
      await prepareAuthMeQuery(new QueryClient());
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
