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

/** RefreshOutcome 중 실패일 때 항상 함께 전달하는 필드를 나타낸다. */
type RefreshFailure = Extract<RefreshOutcome, { kind: "failure" }>;

/**
 * HTTP 오류, 잘못된 응답, timeout, 네트워크 오류를 같은 실패 결과 형태로 만든다.
 *
 * 호출자는 reason으로 실패 종류를 구분하고, status와 errorCode로 현재 요청에 맞는 응답을 만든다.
 * 실패 결과의 필드를 매번 직접 작성하지 않아도 되어 각 분기의 반환 형태가 달라지는 일을 막는다.
 */
function createRefreshFailure(
  reason: RefreshFailureReason,
  status: number,
  errorCode: string | null = null
): RefreshFailure {
  return { kind: "failure", reason, status, errorCode };
}

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

/**
 * Refresh 응답의 JSON body를 읽는다.
 *
 * 요청이 중단되어 발생한 AbortError는 timeout 처리로 이어져야 하므로 다시 던진다. 그 외 JSON
 * 파싱 실패는 body가 없는 것처럼 undefined로 돌려보낸다. 호출한 함수가 이미 가진 HTTP status를
 * 사용해 오류 응답은 http_error로, 성공 응답의 잘못된 body는 invalid_response로 구분한다.
 */
async function readResponseBody(response: Response, signal: AbortSignal): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw error;
    }

    return undefined;
  }
}

/**
 * backend Refresh API를 호출하고 HTTP/body 결과를 요청 비종속 RefreshOutcome으로 바꾼다.
 *
 * response.ok가 false인 것은 네트워크 예외가 아니라 백엔드가 반환한 정상적인 HTTP 응답이다.
 * 그래서 if 분기에서 http_error로 반환한다. 성공 응답은 access/refresh token 쌍이 모두 있어야
 * 성공이며, JSON이 깨졌거나 필요한 값이 없으면 원래 HTTP status를 보존한 invalid_response가 된다.
 */
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
    return createRefreshFailure("http_error", response.status, parseRefreshErrorCode(body));
  }

  const tokens = parseRefreshTokenPair(body);
  if (!tokens) {
    return createRefreshFailure("invalid_response", response.status);
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

/**
 * Refresh exchange 전체에 10초 제한을 적용하고 예외를 정규화된 실패 outcome으로 바꾼다.
 *
 * timer가 끝나면 AbortController가 fetch와 body 읽기에 전달한 signal을 중단한다. Next.js의 기본
 * fetch처럼 AbortSignal을 따르는 구현에서는 현재 작업이 AbortError로 끝나고 timeout 결과가 된다.
 * signal을 무시하는 별도 fetch 구현은 이 deadline을 보장할 수 없으므로 사용하지 않는다. 요청이
 * 먼저 끝나면 finally에서 timer를 지워 남은 timer가 다음 작업에 영향을 주지 않게 한다.
 */
async function performRefreshExchange(
  backendUrl: string,
  refreshToken: string
): Promise<RefreshOutcome> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_EXCHANGE_TIMEOUT_MS);

  try {
    return await executeRefreshExchange(backendUrl, refreshToken, controller.signal);
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      return createRefreshFailure("timeout", 504);
    }

    return createRefreshFailure("network_error", 500);
  } finally {
    clearTimeout(timeoutId);
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

    // 성공 결과를 잠시 재사용한 뒤 cleanupTimer가 Map에서 정리한다.
    // ponytail: 정리 시점은 대략적이다. 정확한 TTL이 실제 요구사항이 될 때만 expiresAt 검사를 추가한다.
    const cleanupTimer = setTimeout(() => {
      refreshFlights.delete(refreshToken);
    }, REFRESH_SUCCESS_REUSE_MS);
    // `as ... & { unref?: ... }`는 기본 timer 타입에 Node 전용 unref가 있을 수 있음을 TypeScript에 알린다.
    // `?.`는 unref가 있는 Node에서만 호출한다. unref는 timer를 취소하지 않고 이 timer가 서버 종료를 막지 않게 한다.
    (cleanupTimer as ReturnType<typeof setTimeout> & { unref?: () => void }).unref?.();

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
