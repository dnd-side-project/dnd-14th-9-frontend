import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";
import { resolveServerAuthHint } from "@/lib/auth/resolve-server-auth-hint";

jest.mock("@/lib/auth/auth-cookie-state", () => ({
  getServerAuthCookieState: jest.fn(),
}));

describe("resolveServerAuthHint", () => {
  const mockedGetServerAuthCookieState = jest.mocked(getServerAuthCookieState);
  const originalUseMock = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
  });

  afterEach(() => {
    if (originalUseMock === undefined) {
      delete process.env.NEXT_PUBLIC_USE_MOCK;
    } else {
      process.env.NEXT_PUBLIC_USE_MOCK = originalUseMock;
    }
  });

  async function expectNoMemberProfileFetch(run: () => Promise<void>) {
    const orig = global.fetch;
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    try {
      await run();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      global.fetch = orig;
    }
  }

  it("쿠키가 없으면 hasAuthCookies: false를 반환하고 member 프로필 fetch를 하지 않아야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
    });

    await expectNoMemberProfileFetch(async () => {
      await expect(resolveServerAuthHint()).resolves.toEqual({ hasAuthCookies: false });
    });
  });

  it("refresh 쿠키만 있으면 hasAuthCookies: true를 반환하고 member 프로필 fetch를 하지 않아야 한다", async () => {
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: true,
      hasAuthCookies: true,
    });

    await expectNoMemberProfileFetch(async () => {
      await expect(resolveServerAuthHint()).resolves.toEqual({ hasAuthCookies: true });
    });
  });

  it("mock 모드에서는 쿠키가 없어도 hasAuthCookies: true를 반환하고 member 프로필 fetch를 하지 않아야 한다", async () => {
    process.env.NEXT_PUBLIC_USE_MOCK = "true";
    mockedGetServerAuthCookieState.mockResolvedValue({
      hasAccessToken: false,
      hasRefreshToken: false,
      hasAuthCookies: false,
    });

    await expectNoMemberProfileFetch(async () => {
      await expect(resolveServerAuthHint()).resolves.toEqual({ hasAuthCookies: true });
    });
  });
});
