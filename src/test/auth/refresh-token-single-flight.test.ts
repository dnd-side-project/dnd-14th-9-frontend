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
let digestSequence = 0;

function uniqueRefreshToken(label: string) {
  tokenSequence += 1;
  return `${label}-${tokenSequence}`;
}

function createUniqueDigest() {
  digestSequence += 1;
  const digest = new ArrayBuffer(32);
  new DataView(digest).setUint32(0, digestSequence);
  return digest;
}

function mockSingleTokenDigest() {
  const digest = createUniqueDigest();
  return jest.spyOn(crypto.subtle, "digest").mockResolvedValue(digest);
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

  it("같은 Refresh Token의 동시 hard 요청은 백엔드를 한 번만 호출해야 함", async () => {
    const refreshToken = uniqueRefreshToken("same-hard");
    const response = deferred<Response>();
    const fetchStarted = deferred<void>();
    mockSingleTokenDigest();
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
    expect([firstResult.disposition, secondResult.disposition].sort()).toEqual([
      "created",
      "joined",
    ]);
    expect(firstResult.outcome).toEqual(secondResult.outcome);
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
    expect(first.outcome).not.toEqual(second.outcome);
  });

  it("soft miss는 새 Refresh 작업을 만들지 않아야 함", async () => {
    const result = await joinSoftRefreshSingleFlight(uniqueRefreshToken("soft-miss"));

    expect(result).toEqual({ kind: "miss" });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
    await jest.advanceTimersByTimeAsync(1500);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("soft 요청은 기존 hard 작업의 결과에 합류해야 함", async () => {
    const refreshToken = uniqueRefreshToken("hard-soft");
    const response = deferred<Response>();
    const fetchStarted = deferred<void>();
    mockSingleTokenDigest();
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

    expect(hardResult.disposition).toBe("created");
    expect(softResult).toEqual({
      kind: "outcome",
      disposition: "joined",
      outcome: hardResult.outcome,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
  });

  it("soft 요청은 2초 이내 성공 결과를 reused로 받고 caller timer를 즉시 정리해야 함", async () => {
    const refreshToken = uniqueRefreshToken("soft-reused");
    mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse());

    const hardResult = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const softResult = await joinSoftRefreshSingleFlight(refreshToken);

    expect(softResult).toEqual({
      kind: "outcome",
      disposition: "reused",
      outcome: hardResult.outcome,
    });
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(1500);
    expect(jest.getTimerCount()).toBe(1);
  });

  it("soft 지문 계산이 1,499ms에 끝나면 남은 예산 안에서 기존 성공 결과를 재사용해야 함", async () => {
    const refreshToken = uniqueRefreshToken("soft-delayed-reuse");
    const fingerprint = createUniqueDigest();
    const delayedDigest = deferred<ArrayBuffer>();
    jest
      .spyOn(crypto.subtle, "digest")
      .mockResolvedValueOnce(fingerprint)
      .mockReturnValueOnce(delayedDigest.promise);
    mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse());

    const hardResult = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const softResultPromise = joinSoftRefreshSingleFlight(refreshToken);
    await jest.advanceTimersByTimeAsync(1499);
    delayedDigest.resolve(fingerprint);

    await expect(softResultPromise).resolves.toEqual({
      kind: "outcome",
      disposition: "reused",
      outcome: hardResult.outcome,
    });
    expect(jest.getTimerCount()).toBe(1);
  });

  it("soft shared wait는 지문 계산 뒤 남은 총 예산만 사용해야 함", async () => {
    const refreshToken = uniqueRefreshToken("soft-remaining-budget");
    const fingerprint = createUniqueDigest();
    const delayedDigest = deferred<ArrayBuffer>();
    const backendResponse = deferred<Response>();
    const fetchStarted = deferred<void>();
    jest
      .spyOn(crypto.subtle, "digest")
      .mockResolvedValueOnce(fingerprint)
      .mockReturnValueOnce(delayedDigest.promise);
    mockFetch.mockImplementation(() => {
      fetchStarted.resolve();
      return backendResponse.promise;
    });

    const hardResultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    await fetchStarted.promise;
    const softResultPromise = joinSoftRefreshSingleFlight(refreshToken);
    let settled = false;
    void softResultPromise.then(() => {
      settled = true;
    });

    await jest.advanceTimersByTimeAsync(1000);
    delayedDigest.resolve(fingerprint);
    await flushMicrotasks();
    await jest.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(softResultPromise).resolves.toEqual({ kind: "caller_timeout" });

    backendResponse.resolve(createRefreshSuccessResponse());
    await expect(hardResultPromise).resolves.toMatchObject({
      outcome: { kind: "success" },
    });
  });

  it("shared outcome이 정확히 1,500ms에 끝나면 최종 반환 전 caller_timeout으로 고정해야 함", async () => {
    const refreshToken = uniqueRefreshToken("soft-exact-outcome-deadline");
    const backendResponse = deferred<Response>();
    const fetchStarted = deferred<void>();
    mockSingleTokenDigest();
    mockFetch.mockImplementation(() => {
      fetchStarted.resolve();
      return backendResponse.promise;
    });

    const hardResultPromise = runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    await fetchStarted.promise;
    const softResultPromise = joinSoftRefreshSingleFlight(refreshToken);
    await flushMicrotasks();

    jest.setSystemTime(new Date("2026-08-14T00:00:01.500Z"));
    backendResponse.resolve(createRefreshSuccessResponse());

    await expect(softResultPromise).resolves.toEqual({ kind: "caller_timeout" });
    await expect(hardResultPromise).resolves.toMatchObject({
      outcome: { kind: "success" },
    });
  });

  it("soft 총 대기시간은 API 진입부터 1,500ms이고 늦은 지문 계산은 작업을 만들지 않아야 함", async () => {
    const digest = deferred<ArrayBuffer>();
    jest.spyOn(crypto.subtle, "digest").mockReturnValueOnce(digest.promise);

    const resultPromise = joinSoftRefreshSingleFlight(uniqueRefreshToken("slow-digest"));
    let settled = false;
    void resultPromise.then(() => {
      settled = true;
    });

    await jest.advanceTimersByTimeAsync(1499);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(resultPromise).resolves.toEqual({ kind: "caller_timeout" });

    digest.resolve(new ArrayBuffer(32));
    await flushMicrotasks();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("soft timeout은 공유 hard 작업을 취소하지 않아야 함", async () => {
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
    await expect(softResultPromise).resolves.toEqual({ kind: "caller_timeout" });
    expect(sharedSignal?.aborted).toBe(false);

    response.resolve(createRefreshSuccessResponse());
    await expect(hardResultPromise).resolves.toMatchObject({
      disposition: "created",
      outcome: { kind: "success" },
    });
  });

  it.each([
    ["success", true, 200],
    ["error", false, 503],
  ])("hard %s body가 멈추면 전체 교환을 10초에 종료해야 함", async (_label, ok, status) => {
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
    let settled = false;
    void resultPromise.then(() => {
      settled = true;
    });

    await jest.advanceTimersByTimeAsync(9999);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(resultPromise).resolves.toMatchObject({
      outcome: { kind: "failure", reason: "timeout", status: 504 },
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: { kind: "success" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

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
    await jest.advanceTimersByTimeAsync(9999);
    let settled = false;
    void resultPromise.then(() => {
      settled = true;
    });
    await flushMicrotasks();
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(resultPromise).resolves.toMatchObject({
      outcome: { kind: "failure", reason: "timeout", status: 504 },
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: { kind: "success" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("성공 결과는 2초 미만에 재사용하고 2초부터 새 교환을 허용해야 함", async () => {
    const refreshToken = uniqueRefreshToken("success-reuse");
    mockFetch
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-1", "refresh-1"))
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-2", "refresh-2"));

    const created = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const immediate = await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    expect(created.disposition).toBe("created");
    expect(immediate.disposition).toBe("reused");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1999);
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "reused",
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: {
        kind: "success",
        tokens: { accessToken: "access-2", refreshToken: "refresh-2" },
      },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("stale sweep로 만료 결과를 교체하고 늦은 이전 timer가 새 entry를 지우지 않아야 함", async () => {
    const refreshToken = uniqueRefreshToken("stale-identity");
    const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout");
    mockFetch
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-old", "refresh-old"))
      .mockResolvedValueOnce(createRefreshSuccessResponse("access-new", "refresh-new"));

    await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);
    const oldCleanup = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 2000)?.[0] as
      | (() => void)
      | undefined;
    expect(oldCleanup).toBeDefined();

    jest.setSystemTime(new Date("2026-08-14T00:00:02.000Z"));
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: {
        kind: "success",
        tokens: { accessToken: "access-new", refreshToken: "refresh-new" },
      },
    });

    oldCleanup?.();
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "reused",
      outcome: {
        kind: "success",
        tokens: { accessToken: "access-new", refreshToken: "refresh-new" },
      },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("실패 결과는 즉시 제거해 다음 hard 요청이 재시도할 수 있어야 함", async () => {
    const refreshToken = uniqueRefreshToken("failure-retry");
    mockFetch
      .mockResolvedValueOnce(createRefreshFailureResponse())
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      outcome: { kind: "failure", reason: "http_error", errorCode: "AUTH401_7" },
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: { kind: "success" },
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

      await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
        outcome: { kind: "failure", reason: "invalid_response", status: 200 },
      });
      await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
        disposition: "created",
        outcome: { kind: "success" },
      });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }
  );

  it("오류 응답의 malformed JSON은 errorCode 없는 http_error로 처리해야 함", async () => {
    const refreshToken = uniqueRefreshToken("malformed-error");
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValue(new SyntaxError("invalid json")),
      } as unknown as Response)
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      outcome: {
        kind: "failure",
        reason: "http_error",
        status: 502,
        errorCode: null,
      },
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      outcome: { kind: "success" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("network failure도 즉시 제거해 다음 hard 요청이 재시도할 수 있어야 함", async () => {
    const refreshToken = uniqueRefreshToken("network-retry");
    mockFetch
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      outcome: { kind: "failure", reason: "network_error", status: 500 },
    });
    await expect(runHardRefreshSingleFlight(refreshToken, BACKEND_URL)).resolves.toMatchObject({
      disposition: "created",
      outcome: { kind: "success" },
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("지문 계산 실패 시 hard는 안전하게 우회하고 soft는 miss 처리해야 함", async () => {
    const digestSpy = jest
      .spyOn(crypto.subtle, "digest")
      .mockRejectedValueOnce(new Error("digest unavailable"))
      .mockRejectedValueOnce(new Error("digest unavailable"));
    mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse());

    await expect(
      runHardRefreshSingleFlight(uniqueRefreshToken("digest-hard"), BACKEND_URL)
    ).resolves.toMatchObject({ disposition: "bypass", outcome: { kind: "success" } });
    await expect(joinSoftRefreshSingleFlight(uniqueRefreshToken("digest-soft"))).resolves.toEqual({
      kind: "miss",
    });

    expect(digestSpy).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("Refresh Token 원문 bytes를 SHA-256 Web Crypto 경계에만 전달해야 함", async () => {
    const refreshToken = uniqueRefreshToken("sha-256-boundary");
    const originalDigest = crypto.subtle.digest.bind(crypto.subtle);
    const digestSpy = jest
      .spyOn(crypto.subtle, "digest")
      .mockImplementation((algorithm, data) => originalDigest(algorithm, data));
    mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse());

    await runHardRefreshSingleFlight(refreshToken, BACKEND_URL);

    expect(digestSpy).toHaveBeenCalledWith("SHA-256", expect.any(Uint8Array));
    const digestInput = digestSpy.mock.calls[0][1];
    const inputBytes = ArrayBuffer.isView(digestInput)
      ? new Uint8Array(digestInput.buffer, digestInput.byteOffset, digestInput.byteLength)
      : new Uint8Array(digestInput);
    expect(new TextDecoder().decode(inputBytes)).toBe(refreshToken);
  });

  it("private fingerprint와 Map을 production test API로 노출하지 않아야 함", () => {
    expect(Object.keys(singleFlightModule).sort()).toEqual(
      ["joinSoftRefreshSingleFlight", "runHardRefreshSingleFlight"].sort()
    );
    expect(singleFlightModule).not.toHaveProperty("createRefreshTokenFingerprint");
    expect(singleFlightModule).not.toHaveProperty("refreshFlights");
    expect(singleFlightModule).not.toHaveProperty("resetRefreshFlights");
  });

  it("격리된 cold module끼리 상태를 공유하지 않아도 hard는 안전하고 soft는 miss여야 함", async () => {
    const refreshToken = uniqueRefreshToken("cold-module");
    mockFetch.mockResolvedValue(createRefreshSuccessResponse());

    await jest.isolateModulesAsync(async () => {
      const coldModule = await import("@/lib/auth/refresh-token-single-flight");
      await expect(
        coldModule.runHardRefreshSingleFlight(refreshToken, BACKEND_URL)
      ).resolves.toMatchObject({
        disposition: "created",
        outcome: { kind: "success" },
      });
    });
    await jest.isolateModulesAsync(async () => {
      const coldModule = await import("@/lib/auth/refresh-token-single-flight");
      await expect(
        coldModule.runHardRefreshSingleFlight(refreshToken, BACKEND_URL)
      ).resolves.toMatchObject({
        disposition: "created",
        outcome: { kind: "success" },
      });
      await expect(coldModule.joinSoftRefreshSingleFlight("unseen-soft-token")).resolves.toEqual({
        kind: "miss",
      });
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
