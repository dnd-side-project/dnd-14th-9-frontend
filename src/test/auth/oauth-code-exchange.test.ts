/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { exchangeAuthCode } from "@/lib/auth/oauth-code-exchange";

const BACKEND_URL = "https://api.gak.today/api/v1";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("exchangeAuthCode", () => {
  let fetchMock: jest.Mock;
  let timeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    // 진짜 10초 타이머를 만들면 테스트가 끝나도 Jest가 종료되지 않으므로 signal만 대신 넘긴다.
    timeoutSpy = jest.spyOn(AbortSignal, "timeout").mockReturnValue(new AbortController().signal);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("code와 codeVerifier를 JSON body로 POST하고 토큰 쌍을 돌려줘야 함", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        isSuccess: true,
        code: "COMMON200",
        result: { accessToken: "access123", refreshToken: "refresh456" },
      })
    );

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toEqual({
      kind: "success",
      tokens: { accessToken: "access123", refreshToken: "refresh456" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BACKEND_URL}/auth/issue`);
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    // 이 헤더가 빠지면 Spring이 415로 거절해 모든 로그인이 실패한다.
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ code: "code-1", codeVerifier: "verifier-1" });
    expect(init.signal).toBe(timeoutSpy.mock.results[0].value);
  });

  it("HTTP 오류는 상태와 백엔드 에러코드를 담은 실패로 돌려주고 재시도하지 않아야 함", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "AUTH401_8" }, 401));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toEqual({
      kind: "failure",
      reason: "http_error",
      status: 401,
      errorCode: "AUTH401_8",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("재시도 대상 상태(503)여도 교환은 요청마다 토큰을 새로 발급하므로 다시 요청하지 않아야 함", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "COMMON503" }, 503));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome.kind).toBe("failure");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("성공 응답이어도 토큰 쌍이 없으면 invalid_response여야 함", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ result: { accessToken: "access123" } }));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toEqual({
      kind: "failure",
      reason: "invalid_response",
      status: 200,
      errorCode: null,
    });
  });

  it("JSON이 아닌 오류 응답도 http_error로 처리해야 함", async () => {
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toEqual({
      kind: "failure",
      reason: "http_error",
      status: 502,
      errorCode: null,
    });
  });

  it("네트워크 오류는 network_error여야 함", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toMatchObject({ kind: "failure", reason: "network_error" });
  });

  it("10초 제한을 걸고, 제한에 걸리면 timeout이어야 함", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
    expect(outcome).toMatchObject({ kind: "failure", reason: "timeout", status: 504 });
  });

  it("응답 본문을 읽는 중 제한에 걸려도 invalid_response가 아니라 timeout이어야 함", async () => {
    const response = new Response(null, { status: 200 });
    jest
      .spyOn(response, "json")
      .mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));
    fetchMock.mockResolvedValue(response);

    const outcome = await exchangeAuthCode(BACKEND_URL, "code-1", "verifier-1");

    expect(outcome).toMatchObject({ kind: "failure", reason: "timeout", status: 504 });
  });
});
