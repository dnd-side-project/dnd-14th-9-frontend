import { buildRefreshCookieHeader } from "./cookie-header-utils";
import {
  parseRefreshErrorCode,
  parseRefreshTokenPair,
  type RefreshTokenPair,
} from "./token-refresh-utils";

const REFRESH_EXCHANGE_TIMEOUT_MS = 10_000;
const SOFT_REFRESH_TOTAL_TIMEOUT_MS = 1_500;
const REFRESH_SUCCESS_REUSE_MS = 2_000;

type RefreshFailureReason = "http_error" | "invalid_response" | "timeout" | "network_error";

/** 백엔드 갱신 결과에서 요청별 응답 정보를 제외하고 모든 caller가 함께 사용할 값만 나타낸다. */
export type RefreshOutcome =
  | {
      readonly kind: "success";
      readonly status: number;
      readonly tokens: Readonly<RefreshTokenPair>;
    }
  | {
      readonly kind: "failure";
      readonly reason: RefreshFailureReason;
      readonly status: number;
      readonly errorCode: string | null;
    };

/**
 * 같은 Refresh Token으로 들어온 요청들이 하나의 갱신 작업을 공유하도록 보관한다.
 *
 * key는 요청에 포함된 Refresh Token이고, value는 백엔드 갱신 결과를 기다리는 Promise다.
 * 성공한 Promise는 바로 뒤따라오는 중복 요청도 재사용할 수 있도록 잠시 남겨두고,
 * 실패한 Promise는 다음 요청이 다시 시도할 수 있도록 즉시 제거한다.
 *
 * 이 Map은 현재 서버 인스턴스의 메모리에만 존재한다. 따라서 같은 인스턴스 안의 중복만
 * 줄일 수 있으며, 서로 다른 서버 인스턴스에서 발생한 중복 처리는 백엔드가 담당해야 한다.
 */
const refreshFlights = new Map<string, Promise<RefreshOutcome>>();

/** 브라우저와 Node 런타임에서 발생한 AbortError를 공통 판별한다. */
function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/** Refresh 응답 body를 읽고 성공 응답의 파싱 실패만 명시적인 invalid response로 변환한다. */
async function readResponseBody(response: Response, signal: AbortSignal): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw error;
    }

    if (response.ok) {
      throw new InvalidRefreshResponseError(response.status);
    }

    return undefined;
  }
}

/** 성공 상태의 body가 유효한 JSON이 아닐 때 HTTP status를 보존해 전달한다. */
class InvalidRefreshResponseError extends Error {
  constructor(readonly status: number) {
    super("Invalid refresh response");
    this.name = "InvalidRefreshResponseError";
  }
}

/** backend Refresh API를 호출하고 HTTP/body 결과를 요청 비종속 RefreshOutcome으로 변환한다. */
async function executeRefreshExchange(
  backendUrl: string,
  refreshToken: string,
  signal: AbortSignal
): Promise<RefreshOutcome> {
  const response = await fetch(`${backendUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: buildRefreshCookieHeader(refreshToken),
    },
    credentials: "include",
    signal,
  });
  const body = await readResponseBody(response, signal);

  if (!response.ok) {
    return {
      kind: "failure",
      reason: "http_error",
      status: response.status,
      errorCode: parseRefreshErrorCode(body),
    };
  }

  const tokens = parseRefreshTokenPair(body);
  if (!tokens) {
    return {
      kind: "failure",
      reason: "invalid_response",
      status: response.status,
      errorCode: null,
    };
  }

  return {
    kind: "success",
    status: response.status,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
}

/** Refresh exchange 전체에 10초 deadline을 적용하고 예외를 정규화된 실패 outcome으로 바꾼다. */
async function performRefreshExchange(
  backendUrl: string,
  refreshToken: string
): Promise<RefreshOutcome> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new DOMException("Refresh request timed out", "AbortError"));
    }, REFRESH_EXCHANGE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      executeRefreshExchange(backendUrl, refreshToken, controller.signal),
      timeoutPromise,
    ]);
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      return {
        kind: "failure",
        reason: "timeout",
        status: 504,
        errorCode: null,
      };
    }

    if (error instanceof InvalidRefreshResponseError) {
      return {
        kind: "failure",
        reason: "invalid_response",
        status: error.status,
        errorCode: null,
      };
    }

    return {
      kind: "failure",
      reason: "network_error",
      status: 500,
      errorCode: null,
    };
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * 새 Access Token이 없으면 요청을 계속할 수 없는 hard 요청의 Refresh 갱신을 처리한다.
 *
 * 같은 Refresh Token의 Promise가 Map에 있으면 새 백엔드 요청을 만들지 않고 그 Promise를
 * 그대로 반환한다. Promise가 없을 때만 백엔드 Refresh API를 한 번 호출하고 Map에 저장한다.
 * 성공 결과는 짧은 시간 동안 재사용한 뒤 timer로 삭제하며, 실패 결과는 바로 삭제한다.
 *
 * @param refreshToken 브라우저가 보낸 Refresh Token. Map의 key와 백엔드 Cookie에만 사용한다.
 * @param backendUrl Refresh API를 제공하는 백엔드 서버 주소.
 * @returns 성공 또는 실패로 정리된 하나의 Refresh 결과 Promise.
 */
export function runHardRefreshSingleFlight(
  refreshToken: string,
  backendUrl: string
): Promise<RefreshOutcome> {
  const existingFlight = refreshFlights.get(refreshToken);
  if (existingFlight) {
    return existingFlight;
  }

  const promise = performRefreshExchange(backendUrl, refreshToken).then((outcome) => {
    if (outcome.kind === "failure") {
      refreshFlights.delete(refreshToken);
      return outcome;
    }

    // 재사용 시간은 대략적이며 정확한 TTL이 필요할 때 expiresAt 검사를 추가한다
    const timer = setTimeout(() => {
      refreshFlights.delete(refreshToken);
    }, REFRESH_SUCCESS_REUSE_MS);
    (timer as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.();

    return outcome;
  });

  refreshFlights.set(refreshToken, promise);
  return promise;
}

/**
 * 현재 Access Token으로 요청을 계속할 수 있는 soft 요청이 기존 Refresh 작업에만 합류한다.
 *
 * 이 함수는 백엔드 갱신을 새로 시작하지 않는다. 같은 Refresh Token의 진행 중인 Promise나
 * 잠시 보관 중인 성공 Promise가 없으면 즉시 null을 반환한다. Promise가 있으면 약 1.5초만
 * 기다리며, 그 안에 결과가 나오지 않아도 원래 hard 작업은 취소하지 않고 이 caller만 null을
 * 반환해 기존 Access Token으로 요청을 계속하게 한다.
 *
 * @param refreshToken 브라우저가 보낸 Refresh Token. 기존 Promise를 찾는 key로만 사용한다.
 * @returns 시간 안에 받은 Refresh 결과. 작업이 없거나 대기 시간이 지나면 null.
 */
export async function joinSoftRefreshSingleFlight(
  refreshToken: string
): Promise<RefreshOutcome | null> {
  const flight = refreshFlights.get(refreshToken);
  if (!flight) {
    return null;
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(null);
    }, SOFT_REFRESH_TOTAL_TIMEOUT_MS);
  });

  try {
    return await Promise.race([flight, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
