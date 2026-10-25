import {
  parseRefreshErrorCode,
  parseRefreshTokenPair,
  type RefreshTokenPair,
} from "./token-refresh-utils";

const AUTH_TOKEN_PATH = "/auth/issue";
const CODE_EXCHANGE_TIMEOUT_MS = 10_000;

type CodeExchangeFailureReason = "http_error" | "invalid_response" | "timeout" | "network_error";

export type CodeExchangeOutcome =
  | { readonly kind: "success"; readonly tokens: Readonly<RefreshTokenPair> }
  | {
      readonly kind: "failure";
      readonly reason: CodeExchangeFailureReason;
      readonly status: number;
      readonly errorCode: string | null;
    };

function createFailure(
  reason: CodeExchangeFailureReason,
  status: number,
  errorCode: string | null = null
): CodeExchangeOutcome {
  return { kind: "failure", reason, status, errorCode };
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    // 본문을 읽는 중 시간 제한에 걸린 것은 잘못된 JSON이 아니라 timeout이다.
    if (error instanceof Error && error.name === "TimeoutError") {
      throw error;
    }

    return undefined;
  }
}

/**
 * 짧게 유효한 `code`와 `codeVerifier`를 백엔드에 보내 JWT 쌍으로 교환한다.
 *
 * 요청마다 새 토큰 쌍을 발급·저장하므로 api-client의 재시도를 거치지 않고 정확히 한 번만 요청한다.
 * 응답은 `/auth/refresh`와 같은 `ApiResponse<TokenPair>` 형태라 refresh 파서를 재사용한다.
 * `code`와 `codeVerifier`는 로그에 남기지 않는다.
 */
export async function exchangeAuthCode(
  backendUrl: string,
  code: string,
  codeVerifier: string
): Promise<CodeExchangeOutcome> {
  try {
    const response = await fetch(`${backendUrl}${AUTH_TOKEN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, codeVerifier }),
      cache: "no-store",
      signal: AbortSignal.timeout(CODE_EXCHANGE_TIMEOUT_MS),
    });
    const body = await readJsonBody(response);

    if (!response.ok) {
      return createFailure("http_error", response.status, parseRefreshErrorCode(body));
    }

    const tokens = parseRefreshTokenPair(body);
    if (!tokens) {
      return createFailure("invalid_response", response.status);
    }

    return {
      kind: "success",
      tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    };
  } catch (error) {
    return error instanceof Error && error.name === "TimeoutError"
      ? createFailure("timeout", 504)
      : createFailure("network_error", 500);
  }
}
