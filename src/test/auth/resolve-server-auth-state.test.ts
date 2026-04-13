import { QueryClient } from "@tanstack/react-query";

import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";

jest.mock("@/lib/auth/auth-cookie-state", () => ({
  getServerAuthCookieState: jest.fn(),
}));

describe("RootLayout auth prefetch flow", () => {
  const mockedGetServerAuthCookieState = jest.mocked(getServerAuthCookieState);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function runPrefetchFlow(queryClient: QueryClient) {
    const { hasAuthCookies } = await getServerAuthCookieState();

    if (hasAuthCookies) {
      try {
        await queryClient.prefetchQuery(memberQueries.me());
      } catch {
        queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
      }
    }
  }

  it("인증 쿠키가 없으면 me prefetch를 생략해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
    });
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, "prefetchQuery");

    await runPrefetchFlow(queryClient);

    expect(prefetchSpy).not.toHaveBeenCalled();
  });

  it("인증 쿠키가 있으면 me prefetch를 수행해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
    });
    const queryClient = new QueryClient();
    const prefetchSpy = jest.spyOn(queryClient, "prefetchQuery").mockResolvedValue(undefined);

    await runPrefetchFlow(queryClient);

    expect(prefetchSpy).toHaveBeenCalledWith(memberQueries.me());
  });

  it("me prefetch가 실패하면 member 캐시를 정리해야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: true,
      hasRefreshToken: true,
      hasAuthCookies: true,
    });
    const queryClient = new QueryClient();
    jest.spyOn(queryClient, "prefetchQuery").mockRejectedValue(new Error("Unauthorized"));
    const removeSpy = jest.spyOn(queryClient, "removeQueries");

    await runPrefetchFlow(queryClient);

    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: memberKeys.me(),
      exact: true,
    });
  });
});
