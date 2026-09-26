import { QueryClient } from "@tanstack/react-query";

import { memberApi } from "@/features/member/api";
import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { memberServerApi } from "@/features/member/server/api";
import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";
import { prepareAuthMeQuery } from "@/lib/auth/prepare-auth-me-query";

jest.mock("@/features/member/server/api", () => ({
  memberServerApi: {
    getMe: jest.fn(),
  },
}));

jest.mock("@/lib/auth/auth-cookie-state", () => ({
  getServerAuthCookieState: jest.fn(),
}));

describe("RootLayout auth prefetch flow", () => {
  const mockedGetServerAuthCookieState = jest.mocked(getServerAuthCookieState);

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(memberApi, "getMe")
      .mockResolvedValue({} as Awaited<ReturnType<typeof memberApi.getMe>>);
    jest.mocked(memberServerApi.getMe).mockResolvedValue({
      isSuccess: true,
      code: "COMMON200",
      message: "ok",
      result: { id: 1 },
    } as Awaited<ReturnType<typeof memberServerApi.getMe>>);
  });

  async function expectServerMePrefetch(fetchSpy: jest.SpiedFunction<QueryClient["fetchQuery"]>) {
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const passed = fetchSpy.mock.calls[0][0] as {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
    };
    expect(passed.queryKey).toEqual(memberQueries.me().queryKey);
    await passed.queryFn();
    expect(memberServerApi.getMe).toHaveBeenCalledTimes(1);
    expect(memberApi.getMe).not.toHaveBeenCalled();
  }

  it("인증 쿠키가 없으면 me prefetch를 생략해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery");

    await prepareAuthMeQuery(queryClient);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("mock mode에서는 인증 쿠키가 없어도 mock me prefetch를 수행하고 인증 힌트를 반환해야 한다", async () => {
    const previousUseMock = process.env.NEXT_PUBLIC_USE_MOCK;
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery").mockResolvedValue({
      isSuccess: true,
      result: { id: 1 },
    } as never);

    try {
      await expect(prepareAuthMeQuery(queryClient)).resolves.toEqual({ hasAuthCookies: true });
      await expectServerMePrefetch(fetchSpy);
    } finally {
      if (previousUseMock === undefined) {
        delete process.env.NEXT_PUBLIC_USE_MOCK;
      } else {
        process.env.NEXT_PUBLIC_USE_MOCK = previousUseMock;
      }
    }
  });

  it("인증 쿠키가 있으면 me prefetch를 수행해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
    });
    const queryClient = new QueryClient();
    const fetchSpy = jest.spyOn(queryClient, "fetchQuery").mockResolvedValue({
      id: 1,
      result: {
        id: 1,
      },
    } as never);

    await prepareAuthMeQuery(queryClient);

    await expectServerMePrefetch(fetchSpy);
  });

  it("me prefetch가 실패하면 member 캐시를 정리해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
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
});
