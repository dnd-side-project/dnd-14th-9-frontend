import { getLoginPageProps } from "@/lib/auth/login-page-props";

describe("login-page-props", () => {
  it("reason과 redirectAfterLogin 쿠키를 로그인 페이지 props로 변환해야 함", () => {
    const cookieStore = {
      get: jest.fn().mockReturnValue({ value: "/profile/settings" }),
    };

    expect(
      getLoginPageProps({
        searchParams: { reason: "auth_required" },
        cookieStore,
      })
    ).toEqual({
      reasonMessage: "로그인이 필요합니다.",
      nextPath: "/profile/settings",
    });
  });

  it("redirectAfterLogin 쿠키가 비정상 경로면 루트로 폴백해야 함", () => {
    const cookieStore = {
      get: jest.fn().mockReturnValue({ value: "https://malicious.com" }),
    };

    expect(
      getLoginPageProps({
        searchParams: {},
        cookieStore,
      })
    ).toEqual({
      reasonMessage: null,
      nextPath: "/",
    });
  });
});
