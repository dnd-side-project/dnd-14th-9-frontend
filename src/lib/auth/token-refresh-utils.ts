export interface RefreshTokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseBody {
  result: RefreshTokenPair;
}

interface ErrorCodeResponseBody {
  code: string;
}

function isRefreshResponseBody(data: unknown): data is RefreshResponseBody {
  if (!data || typeof data !== "object" || !("result" in data)) {
    return false;
  }

  const result = (data as { result?: unknown }).result;
  if (!result || typeof result !== "object") {
    return false;
  }

  const tokenPair = result as Record<string, unknown>;
  return typeof tokenPair.accessToken === "string" && typeof tokenPair.refreshToken === "string";
}

function isErrorCodeResponseBody(data: unknown): data is ErrorCodeResponseBody {
  if (!data || typeof data !== "object") {
    return false;
  }

  return typeof (data as { code?: unknown }).code === "string";
}

export function parseRefreshTokenPair(data: unknown): RefreshTokenPair | null {
  if (!isRefreshResponseBody(data)) {
    return null;
  }

  return data.result;
}

export async function getErrorCodeFromResponse(response: Response): Promise<string | null> {
  try {
    const data: unknown = await response.json();
    if (!isErrorCodeResponseBody(data)) {
      return null;
    }
    return data.code;
  } catch {
    return null;
  }
}
