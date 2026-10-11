/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { GET } from "@/app/api/auth/login/route";
import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE_PATH,
  REDIRECT_AFTER_LOGIN_COOKIE,
} from "@/lib/auth/cookie-constants";
import { LOGIN_PROVIDERS } from "@/lib/auth/oauth-provider-policy";
import { createCodeChallenge } from "@/lib/auth/pkce";

function hasSetCookie(response: Response, matcher: (cookie: string) => boolean): boolean {
  return response.headers.getSetCookie().some(matcher);
}

function findSetCookie(response: Response, name: string): string | undefined {
  return response.headers.getSetCookie().find((cookie) => cookie.startsWith(`${name}=`));
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

  it("유효한 provider/next를 받으면 codeChallenge를 붙여 백엔드 OAuth 엔드포인트로 리다이렉트해야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/dashboard?tab=all`
    );

    const response = await GET(request);

    expect(response.status).toBe(307);

    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe(
      `https://api.gak.today/oauth2/authorization/${googleProvider}`
    );
    // 백엔드와 합의한 query 이름(camelCase)을 상수가 아닌 문자열로 고정해 이름이 바뀌면 실패하게 한다.
    expect([...location.searchParams.keys()]).toEqual(["codeChallenge"]);
    expect(location.searchParams.get("codeChallenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);

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

  it("verifier는 HttpOnly·Lax·/api/auth 경로 쿠키로만 내려보내고 URL에는 싣지 않아야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/`
    );

    const response = await GET(request);

    const verifierCookie = findSetCookie(response, OAUTH_CODE_VERIFIER_COOKIE);
    expect(verifierCookie).toBeDefined();
    expect(verifierCookie).toMatch(/HttpOnly/i);
    expect(verifierCookie).toMatch(/SameSite=lax/i);
    expect(verifierCookie).toContain(`Path=${OAUTH_CODE_VERIFIER_COOKIE_PATH}`);
    expect(verifierCookie).toMatch(/Max-Age=600/i);

    const verifier = verifierCookie!.split(";")[0].split("=")[1];
    expect(response.headers.get("location")).not.toContain(verifier);
  });

  it("URL의 codeChallenge는 쿠키 verifier를 SHA-256·base64url로 해시한 값이어야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${kakaoProvider}&next=/`
    );

    const response = await GET(request);

    const verifier = findSetCookie(response, OAUTH_CODE_VERIFIER_COOKIE)!
      .split(";")[0]
      .split("=")[1];
    const location = new URL(response.headers.get("location")!);

    expect(location.searchParams.get("codeChallenge")).toBe(createCodeChallenge(verifier));
  });

  it("로그인을 시작할 때마다 다른 verifier를 발급해야 함", async () => {
    const url = `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/`;

    const first = await GET(new NextRequest(url));
    const second = await GET(new NextRequest(url));

    expect(findSetCookie(first, OAUTH_CODE_VERIFIER_COOKIE)).not.toBe(
      findSetCookie(second, OAUTH_CODE_VERIFIER_COOKIE)
    );
  });

  it("next가 외부 URL이면 redirectAfterLogin 쿠키를 루트(/)로 저장해야 함", async () => {
    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${kakaoProvider}&next=https://malicious.com/steal`
    );

    const response = await GET(request);

    expect(response.status).toBe(307);

    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe(
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

  it("provider가 유효하지 않으면 로그인 페이지(OAUTH401_5)로 리다이렉트하고 쿠키를 만들지 않아야 함", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/login?provider=naver&next=/dashboard"
    );

    const response = await GET(request);

    expectLoginRedirect(response, "OAUTH401_5");
    expect(
      hasSetCookie(response, (cookie) => cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=`))
    ).toBe(false);
    expect(findSetCookie(response, OAUTH_CODE_VERIFIER_COOKIE)).toBeUndefined();
  });

  it("백엔드 origin 설정이 없으면 로그인 페이지(config_error)로 리다이렉트하고 쿠키를 만들지 않아야 함", async () => {
    delete process.env.BACKEND_ORIGIN;

    const request = new NextRequest(
      `http://localhost:3000/api/auth/login?provider=${googleProvider}&next=/dashboard`
    );

    const response = await GET(request);

    expectLoginRedirect(response, "config_error");
    expect(
      hasSetCookie(response, (cookie) => cookie.startsWith(`${REDIRECT_AFTER_LOGIN_COOKIE}=`))
    ).toBe(false);
    expect(findSetCookie(response, OAUTH_CODE_VERIFIER_COOKIE)).toBeUndefined();
  });
});
