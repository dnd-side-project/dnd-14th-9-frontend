import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import { isBenchmarkMode } from "./mode";
import { getBenchmarkRunContext } from "./run-context";
import { getUrlOrigin, sanitizePath } from "./sanitize-url";

export type BenchmarkBackendSource =
  | "route-handler"
  | "server-component"
  | "token-refresh"
  | "sse-proxy"
  | "other";

export type BenchmarkRequestTarget = "backend" | "self-api" | "other";

export interface BenchmarkBackendRequestEvent {
  scenario: string;
  run: number;
  phase: string;
  step: string;
  method: string;
  path: string;
  status: number | null;
  startedAt: number;
  durationMs: number;
  source: BenchmarkBackendSource;
  target: BenchmarkRequestTarget;
  error?: string;
}

type FetchLike = typeof fetch;

let installed = false;
let originalFetch: FetchLike | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function getBackendApiBase(): string | undefined {
  return process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE;
}

function getBackendOrigins(): Set<string> {
  const origins = new Set<string>();
  for (const value of [
    process.env.BACKEND_API_BASE,
    process.env.NEXT_PUBLIC_BACKEND_API_BASE,
    process.env.BACKEND_ORIGIN,
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
  ]) {
    if (!value) continue;
    const origin = getUrlOrigin(value);
    if (origin) origins.add(origin);
  }
  return origins;
}

function getFrontendOrigins(): Set<string> {
  const origins = new Set<string>();
  for (const value of [
    process.env.FRONTEND_ORIGIN,
    process.env.NEXT_PUBLIC_FRONTEND_ORIGIN,
    process.env.BENCHMARK_ORIGIN,
  ]) {
    if (!value) continue;
    const origin = getUrlOrigin(value);
    if (origin) origins.add(origin);
  }
  origins.add("http://127.0.0.1:3000");
  origins.add("http://localhost:3000");
  const port = process.env.PORT;
  if (port) {
    origins.add(`http://127.0.0.1:${port}`);
    origins.add(`http://localhost:${port}`);
  }
  return origins;
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function resolveMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== "string" && !(input instanceof URL)) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function headerValue(headers: HeadersInit | Headers | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  if (Array.isArray(headers)) {
    const found = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return found?.[1];
  }
  const record = headers as Record<string, string>;
  const direct = record[name] ?? record[name.toLowerCase()];
  if (direct) return direct;
  const match = Object.entries(record).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return match?.[1];
}

function resolveAccept(input: RequestInfo | URL, init?: RequestInit): string | undefined {
  const fromInit = headerValue(init?.headers, "accept");
  if (fromInit) return fromInit;
  if (typeof input !== "string" && !(input instanceof URL)) {
    return input.headers.get("accept") ?? undefined;
  }
  return undefined;
}

function classifyTarget(url: string): BenchmarkRequestTarget {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "other";
  }

  if (getBackendOrigins().has(parsed.origin)) {
    return "backend";
  }

  if (getFrontendOrigins().has(parsed.origin) && parsed.pathname.startsWith("/api/")) {
    if (parsed.pathname.startsWith("/api/benchmark")) {
      return "other";
    }
    return "self-api";
  }

  return "other";
}

function classifySource(
  url: string,
  target: BenchmarkRequestTarget,
  accept?: string
): BenchmarkBackendSource {
  const path = sanitizePath(url, getBackendApiBase());
  if (path.includes("/auth/refresh")) return "token-refresh";
  if ((accept && accept.includes("text/event-stream")) || path.includes("/events/")) {
    return "sse-proxy";
  }
  if (target === "self-api") return "server-component";
  if (target === "backend") return "route-handler";
  return "other";
}

function shouldRecord(url: string, target: BenchmarkRequestTarget): boolean {
  if (target === "other") return false;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/api/benchmark")) return false;
  } catch {
    return false;
  }
  return true;
}

function getLogFilePath(): string {
  const outputDir =
    process.env.BENCHMARK_OUTPUT_DIR ?? `${process.cwd()}/benchmarks/network-baseline`;
  return `${outputDir}/raw/backend-requests.jsonl`;
}

function enqueueWrite(event: BenchmarkBackendRequestEvent): void {
  const line = `${JSON.stringify(event)}\n`;
  const filePath = getLogFilePath();
  writeQueue = writeQueue
    .then(async () => {
      await mkdir(dirname(filePath), { recursive: true });
      await appendFile(filePath, line, "utf8");
    })
    .catch((error: unknown) => {
      console.warn("[benchmark] failed to persist backend request", error);
    });
}

export async function flushBenchmarkBackendLogs(): Promise<void> {
  await writeQueue;
}

export function getOriginalFetch(): FetchLike | null {
  return originalFetch;
}

export function isBenchmarkFetchHookInstalled(): boolean {
  return installed;
}

export function uninstallBenchmarkFetchHook(): void {
  if (!installed || !originalFetch) return;
  globalThis.fetch = originalFetch;
  originalFetch = null;
  installed = false;
}

export function installBenchmarkFetchHook(): void {
  if (!isBenchmarkMode()) return;
  if (installed) return;
  if (typeof globalThis.fetch !== "function") return;

  originalFetch = globalThis.fetch.bind(globalThis);
  const nextFetch = originalFetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = resolveUrl(input);
    const target = classifyTarget(url);
    if (!shouldRecord(url, target)) {
      return nextFetch(input, init);
    }

    const method = resolveMethod(input, init);
    const accept = resolveAccept(input, init);
    const source = classifySource(url, target, accept);
    const context = getBenchmarkRunContext();
    const startedAt = Date.now();
    const startedHr = performance.now();

    try {
      const response = await nextFetch(input, init);
      enqueueWrite({
        scenario: context.scenario,
        run: context.run,
        phase: context.phase,
        step: context.step,
        method,
        path: sanitizePath(url, getBackendApiBase()),
        status: response.status,
        startedAt,
        durationMs: Math.round((performance.now() - startedHr) * 100) / 100,
        source,
        target,
      });
      return response;
    } catch (error) {
      enqueueWrite({
        scenario: context.scenario,
        run: context.run,
        phase: context.phase,
        step: context.step,
        method,
        path: sanitizePath(url, getBackendApiBase()),
        status: null,
        startedAt,
        durationMs: Math.round((performance.now() - startedHr) * 100) / 100,
        source,
        target,
        error: error instanceof Error ? error.name : "unknown",
      });
      throw error;
    }
  };

  installed = true;
}
