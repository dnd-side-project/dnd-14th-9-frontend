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

type HardRefreshDisposition = "created" | "joined" | "reused" | "bypass";

export type HardRefreshResult = {
  readonly disposition: HardRefreshDisposition;
  readonly outcome: RefreshOutcome;
};

export type SoftRefreshResult =
  | { readonly kind: "miss" }
  | { readonly kind: "caller_timeout" }
  | {
      readonly kind: "outcome";
      readonly disposition: "joined" | "reused";
      readonly outcome: RefreshOutcome;
    };

interface InFlightEntry {
  readonly kind: "in_flight";
  readonly promise: Promise<RefreshOutcome>;
}

interface SuccessEntry {
  readonly kind: "success";
  readonly outcome: Extract<RefreshOutcome, { kind: "success" }>;
  readonly expiresAt: number;
  cleanupTimer?: ReturnType<typeof setTimeout>;
}

type RefreshFlightEntry = InFlightEntry | SuccessEntry;

// 이 Map은 같은 warm instance의 중복만 줄이며, 인스턴스 간 멱등성은 백엔드가 보장한다.
const refreshFlights = new Map<string, RefreshFlightEntry>();

function deleteEntryIfCurrent(fingerprint: string, entry: RefreshFlightEntry) {
  if (refreshFlights.get(fingerprint) === entry) {
    refreshFlights.delete(fingerprint);
  }
}

function deleteExpiredSuccessEntry(fingerprint: string, entry: SuccessEntry) {
  if (Date.now() < entry.expiresAt) {
    return false;
  }

  if (entry.cleanupTimer !== undefined) {
    clearTimeout(entry.cleanupTimer);
  }
  deleteEntryIfCurrent(fingerprint, entry);
  return true;
}

function sweepExpiredSuccessEntries() {
  for (const [fingerprint, entry] of refreshFlights) {
    if (entry.kind === "success") {
      deleteExpiredSuccessEntry(fingerprint, entry);
    }
  }
}

function getCurrentEntry(fingerprint: string): RefreshFlightEntry | null {
  const entry = refreshFlights.get(fingerprint);
  if (!entry) {
    return null;
  }

  if (entry.kind === "success" && deleteExpiredSuccessEntry(fingerprint, entry)) {
    return null;
  }

  return entry;
}

async function createRefreshTokenFingerprint(refreshToken: string): Promise<string> {
  const bytes = new TextEncoder().encode(refreshToken);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

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

class InvalidRefreshResponseError extends Error {
  constructor(readonly status: number) {
    super("Invalid refresh response");
    this.name = "InvalidRefreshResponseError";
  }
}

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

function startHardRefreshFlight(
  fingerprint: string,
  refreshToken: string,
  backendUrl: string
): InFlightEntry {
  const entry: InFlightEntry = {
    kind: "in_flight",
    promise: performRefreshExchange(backendUrl, refreshToken).then((outcome) => {
      if (outcome.kind === "failure") {
        deleteEntryIfCurrent(fingerprint, entry);
        return outcome;
      }

      if (refreshFlights.get(fingerprint) !== entry) {
        return outcome;
      }

      const successEntry: SuccessEntry = {
        kind: "success",
        outcome,
        expiresAt: Date.now() + REFRESH_SUCCESS_REUSE_MS,
      };
      successEntry.cleanupTimer = setTimeout(() => {
        deleteEntryIfCurrent(fingerprint, successEntry);
      }, REFRESH_SUCCESS_REUSE_MS);
      (
        successEntry.cleanupTimer as ReturnType<typeof setTimeout> & { unref?: () => void }
      ).unref?.();
      refreshFlights.set(fingerprint, successEntry);
      return outcome;
    }),
  };
  refreshFlights.set(fingerprint, entry);
  return entry;
}

export async function runHardRefreshSingleFlight(
  refreshToken: string,
  backendUrl: string
): Promise<HardRefreshResult> {
  sweepExpiredSuccessEntries();

  let fingerprint: string;
  try {
    fingerprint = await createRefreshTokenFingerprint(refreshToken);
  } catch {
    return {
      disposition: "bypass",
      outcome: await performRefreshExchange(backendUrl, refreshToken),
    };
  }

  const existingEntry = getCurrentEntry(fingerprint);
  if (existingEntry?.kind === "success") {
    return { disposition: "reused", outcome: existingEntry.outcome };
  }
  if (existingEntry?.kind === "in_flight") {
    return { disposition: "joined", outcome: await existingEntry.promise };
  }

  const createdEntry = startHardRefreshFlight(fingerprint, refreshToken, backendUrl);
  return { disposition: "created", outcome: await createdEntry.promise };
}

export async function joinSoftRefreshSingleFlight(
  refreshToken: string
): Promise<SoftRefreshResult> {
  const deadlineAt = Date.now() + SOFT_REFRESH_TOTAL_TIMEOUT_MS;
  let callerTimedOut = false;
  const hasCallerTimedOut = () => callerTimedOut || Date.now() >= deadlineAt;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<SoftRefreshResult>((resolve) => {
    timeoutId = setTimeout(() => {
      callerTimedOut = true;
      resolve({ kind: "caller_timeout" });
    }, SOFT_REFRESH_TOTAL_TIMEOUT_MS);
  });

  const lookupPromise = (async (): Promise<SoftRefreshResult> => {
    sweepExpiredSuccessEntries();

    let fingerprint: string;
    try {
      fingerprint = await createRefreshTokenFingerprint(refreshToken);
    } catch {
      return hasCallerTimedOut() ? { kind: "caller_timeout" } : { kind: "miss" };
    }

    if (hasCallerTimedOut()) {
      return { kind: "caller_timeout" };
    }

    const entry = getCurrentEntry(fingerprint);
    if (!entry) {
      return { kind: "miss" };
    }
    if (entry.kind === "success") {
      if (hasCallerTimedOut()) {
        return { kind: "caller_timeout" };
      }

      return {
        kind: "outcome",
        disposition: "reused",
        outcome: entry.outcome,
      };
    }

    if (hasCallerTimedOut()) {
      return { kind: "caller_timeout" };
    }

    const outcome = await entry.promise;
    if (hasCallerTimedOut()) {
      return { kind: "caller_timeout" };
    }

    return {
      kind: "outcome",
      disposition: "joined",
      outcome,
    };
  })();

  try {
    return await Promise.race([lookupPromise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
