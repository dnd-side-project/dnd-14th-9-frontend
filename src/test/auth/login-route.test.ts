/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { GET } from "@/app/api/auth/login/route";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";

function hasSetCookie(response: Response, matcher: (cookie: string) => boolean): boolean {
  return response.headers.getSetCookie().some(matcher);
}

function expectLoginRedirect(response: Response, reason: string) {
  expect(response.status).toBe(307);
  const location = response.headers.get("location");
  expect(location).toBeTruthy();

  const url = new URL(location!);
  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("reason")).toBe(reason);
  expect(url.searchParams.get("next")).toBeNull();
}

describe("OAuth Login Route Handler", () => {
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;

  beforeEach(() => {
    process.env.BACKEND_ORIGIN = "https://api.gak.today";
  });

  afterEach(() => {
    delete process.env.BACKEND_ORIGIN;
    delete process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  it("유효한 provider/next를 받으면 백엔드 OAuth 엔드포인트로 리다이렉트해야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/dashboard?tab=all`
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://api.gak.today/oauth2/authorization/${googleProvider}`
    );
    expect(
      hasSetCookie(response, (cookie) => cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=`))
    ).toBe(true);
    expect(
      hasSetCookie(
        response,
        (cookie) =>
          cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=%2Fdashboard%3Ftab%3Dall`) ||
          cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=/dashboard?tab=all`)
      )
    ).toBe(true);
  });

  it("next가 외부 URL이면 redirectAfterLogin 쿠키를 루트(/)로 저장해야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${kakaoProvider}&next=https://malicious.com/steal`
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://api.gak.today/oauth2/authorization/${kakaoProvider}`
    );
    expect(
      hasSetCookie(
        response,
        (cookie) =>
          cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=%2F`) ||
          cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=/`)
      )
    ).toBe(true);
  });

  it("provider가 유효하지 않으면 로그인 페이지(access_denied)로 리다이렉트해야 함", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/login?provider=naver&next=/dashboard"
    );

    const response = await GET(request);

    expectLoginRedirect(response, "access_denied");
    expect(
      hasSetCookie(response, (cookie) => cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=`))
    ).toBe(false);
  });

  it("백엔드 origin 설정이 없으면 로그인 페이지(config_error)로 리다이렉트해야 함", async () => {
    delete process.env.BACKEND_ORIGIN;

    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/dashboard`
    );

    const response = await GET(request);

    expectLoginRedirect(response, "config_error");
    expect(
      hasSetCookie(response, (cookie) => cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=`))
    ).toBe(false);
  });
});
