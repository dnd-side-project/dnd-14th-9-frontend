/**
 * @jest-environment @edge-runtime/jest-environment
 */

import * as singleFlightModule from "@/lib/auth/refresh-token-single-flight";
import {
  joinSoftRefreshSingleFlight,
  runHardRefreshSingleFlight,
} from "@/lib/auth/refresh-token-single-flight";

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function createRefreshSuccessResponse(accessToken = "new-access", refreshToken = "new-refresh") {
  return {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({
      result: { accessToken, refreshToken },
    }),
  } as unknown as Response;
}

function createRefreshFailureResponse(status = 401, code = "AUTH401_7") {
  return {
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ code }),
  } as unknown as Response;
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

const BACKEND_URL = "https://backend.example.com";
let tokenSequence = 0;

function uniqueRefreshToken(label: string) {
  tokenSequence += 1;
  return `${label}-${tokenSequence}`;
}

describe("refresh-token-single-flight", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-14T00:00:00.000Z"));
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("같은 Refresh Token의 동시 hard 요청은 백엔드를 한 번만 호출하고 동일한 결과를 공유해야 함", async () => {
    const refreshToken = uniqueRefreshToken("same-hard");
    const response = deferred<Response>();
    const fetchStarted = deferred<void>();
    mockFetch.mockImplementation(() => {
      fetchStarted.resolve();
      return response.promise;
    });

    const first = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const second = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);

    await fetchStarted.promise;
    await flushMicrotasks();
    response.resolve(createRefreshSuccessResponse());
    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(firstResult).toEqual(secondResult);
    expect(firstResult).toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
  });

  it("서로 다른 Refresh Token은 결과를 공유하지 않아야 함", async () => {
    mockFetch
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-a", "refresh-a"))
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-b", "refresh-b"));

    const [first, second] = await Promise.all([
      runHardRefreshSingleFlight(uniqueRefreshToken("user-a"), BACKEND_URL),
      runHardRefreshSingleFlight(uniqueRefreshToken("user-b"), BACKEND_URL),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(first).not.toEqual(second);
  });

  it("soft miss는 새 작업을 만들지 않고 즉시 null을 반환해야 함", async () => {
    const result = await joinSoftRefreshSingleFlight(uniqueRefreshToken("soft-miss"));

    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("soft 요청은 기존 hard 작업의 결과에 합류해야 함", async () => {
    const refreshToken = uniqueRefreshToken("hard-soft");
    const response = deferred<Response>();
    const fetchStarted = deferred<void>();
    mockFetch.mockImplementation(() => {
      fetchStarted.resolve();
      return response.promise;
    });

    const hardResultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    await fetchStarted.promise;
    const softResultPromise = joinSoftRefreshSingleFlight(refreshToken);

    await flushMicrotasks();
    response.resolve(createRefreshSuccessResponse("shared-access", "shared-refresh"));
    const [hardResult, softResult] = await Promise.all([hardResultPromise, softResultPromise]);

    expect(softResult).toEqual(hardResult);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("soft timeout은 null을 반환하고 공유 hard 작업을 취소하지 않아야 함", async () => {
    const refreshToken = uniqueRefreshToken("soft-timeout");
    const response = deferred<Response>();
    const fetchStarted = deferred<void>();
    let sharedSignal: AbortSignal | undefined;
    mockFetch.mockImplementation((_url, init) => {
      sharedSignal = init?.signal ?? undefined;
      fetchStarted.resolve();
      return response.promise;
    });

    const hardResultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    await fetchStarted.promise;
    const softResultPromise = joinSoftRefreshSingleFlight(refreshToken);

    await jest.advanceTimersByTimeAsync(1500);
    await expect(softResultPromise).resolves.toBeNull();
    expect(sharedSignal?.aborted).toBe(false);

    response.resolve(createRefreshSuccessResponse());
    await expect(hardResultPromise).resolves.toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
  });

  it("성공 결과는 timer 전까지 재사용되고 timer 이후에는 새 갱신을 시작해야 함", async () => {
    const refreshToken = uniqueRefreshToken("success-reuse");
    mockFetch
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-1", "refresh-1"))
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-2", "refresh-2"));

    const created = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const reused = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const softReused = await joinSoftRefreshSingleFlight(refreshToken);

    expect(reused).toEqual(created);
    expect(softReused).toEqual(created);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await jest.runOnlyPendingTimersAsync();
    const renewed = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    expect(renewed).toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "access-2", refreshToken: "refresh-2" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["success", true, 200],
    ["error", false, 503],
  ])(
    "hard %s body가 멈추면 전체 교환을 10초에 종료하고 재시도할 수 있어야 함",
    async (_label, ok, status) => {
      const fetchStarted = deferred<void>();
      mockFetch
        .mockImplementationOnce((_url, init) => {
          const signal = init?.signal;
          fetchStarted.resolve();
          return Promise.resolve({
            ok,
            status,
            json: jest.fn().mockImplementation(
              () =>
                new Promise((_resolve, reject) => {
                  signal?.addEventListener("abort", () => {
                    reject(new DOMException("Aborted", "AbortError"));
                  });
                })
            ),
          } as unknown as Response);
        })
        .mockResolvedValueOnce(createRefreshSuccessResponse());

      const refreshToken = uniqueRefreshToken(`body-${_label}`);
      const resultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
      await fetchStarted.promise;

      await jest.advanceTimersByTimeAsync(10000);
      await expect(resultPromise).resolves.toEqual({
        kind: "failure",
        reason: "timeout",
        status: 504,
        errorCode: null,
      });
      await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
        kind: "success",
        status: 200,
        tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }
  );

  it("hard response headers가 오지 않아도 10초에 timeout되고 다음 요청이 재시도해야 함", async () => {
    const refreshToken = uniqueRefreshToken("headers-timeout");
    const fetchStarted = deferred<void>();
    mockFetch
      .mockImplementationOnce((_url, init) => {
        fetchStarted.resolve();
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      })
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    const resultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    await fetchStarted.promise;
    await jest.advanceTimersByTimeAsync(10000);

    await expect(resultPromise).resolves.toEqual({
      kind: "failure",
      reason: "timeout",
      status: 504,
      errorCode: null,
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("HTTP 실패 결과는 즉시 제거되어 다음 hard 요청이 재시도해야 함", async () => {
    const refreshToken = uniqueRefreshToken("failure-retry");
    mockFetch
      .mockResolvedValueOnce(createRefreshFailureResponse())
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "failure",
      reason: "http_error",
      status: 401,
      errorCode: "AUTH401_7",
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    [
      "malformed JSON",
      {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError("invalid json")),
      },
    ],
    [
      "invalid shape",
      {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          result: { accessToken: "access", refreshToken: null },
        }),
      },
    ],
  ])(
    "성공 응답의 %s는 invalid_response이고 즉시 재시도할 수 있어야 함",
    async (_label, response) => {
      const refreshToken = uniqueRefreshToken(`invalid-${_label}`);
      mockFetch
        .mockResolvedValueOnce(response as unknown as Response)
        .mockResolvedValueOnce(createRefreshSuccessResponse());

      await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
        kind: "failure",
        reason: "invalid_response",
        status: 200,
        errorCode: null,
      });
      await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
        kind: "success",
        status: 200,
        tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }
  );

  it("오류 응답의 malformed JSON은 errorCode 없는 http_error로 처리하고 즉시 재시도해야 함", async () => {
    const refreshToken = uniqueRefreshToken("malformed-error");
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValue(new SyntaxError("invalid json")),
      } as unknown as Response)
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "failure",
      reason: "http_error",
      status: 502,
      errorCode: null,
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("network failure도 즉시 제거해 다음 hard 요청이 재시도할 수 있어야 함", async () => {
    const refreshToken = uniqueRefreshToken("network-retry");
    mockFetch
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "failure",
      reason: "network_error",
      status: 500,
      errorCode: null,
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toEqual({
      kind: "success",
      status: 200,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("private Map과 내부 상태를 모듈 외부로 노출하지 않아야 함", () => {
    expect(Object.keys(singleFlightModule).sort()).toEqual(
      ["joinSoftRefreshSingleFlight", "runHardRefreshSingleFlight"].sort()
    );
    expect(singleFlightModule).not.toHaveProperty("refreshFlights");
  });

  it("격리된 cold module끼리 상태를 공유하지 않아도 hard는 안전하고 soft는 miss여야 함", async () => {
    const refreshToken = uniqueRefreshToken("cold-module");
    mockFetch.mockResolvedValue(createRefreshSuccessResponse());

    await jest.isolateModulesAsync(async () => {
      const coldModule = await import("@/lib/auth/refresh-token-single-flight");
      await expect(
        coldModule.runHardRefreshSingleFlight(refreshToken, BACKEND_URL)
      ).resolves.toEqual({
        kind: "success",
        status: 200,
        tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      });
    });
    await jest.isolateModulesAsync(async () => {
      const coldModule = await import("@/lib/auth/refresh-token-single-flight");
      await expect(
        coldModule.runHardRefreshSingleFlight(refreshToken, BACKEND_URL)
      ).resolves.toEqual({
        kind: "success",
        status: 200,
        tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      });
      await expect(coldModule.joinSoftRefreshSingleFlight("unseen-soft-token")).resolves.toBeNull();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
