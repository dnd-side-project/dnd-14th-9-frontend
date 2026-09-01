import { isBenchmarkClientMode } from "./mode";

import type { QueryClient } from "@tanstack/react-query";

export type BenchmarkTanstackEvent = {
  t: number;
  kind:
    | "query-fetch"
    | "query-success"
    | "query-error"
    | "query-invalidate"
    | "invalidateQueries"
    | "setQueryData"
    | "mutation-pending"
    | "mutation-success"
    | "mutation-error";
  queryHash?: string;
  queryKey?: unknown;
  mutationId?: number;
  mutationKey?: unknown;
  status?: string;
  fetchStatus?: string;
};

type BenchmarkWindow = Window & {
  __GAK_BENCHMARK_EVENTS__?: BenchmarkTanstackEvent[];
};

const installedClients = new WeakSet<QueryClient>();

function getEventBuffer(): BenchmarkTanstackEvent[] {
  const runtime = window as BenchmarkWindow;
  if (!runtime.__GAK_BENCHMARK_EVENTS__) {
    runtime.__GAK_BENCHMARK_EVENTS__ = [];
  }
  return runtime.__GAK_BENCHMARK_EVENTS__;
}

function record(event: Omit<BenchmarkTanstackEvent, "t">): void {
  getEventBuffer().push({
    t: Math.round(performance.now() * 100) / 100,
    ...event,
  });
}

function sanitizeQueryKey(queryKey: unknown): unknown {
  if (Array.isArray(queryKey)) {
    return queryKey.map((part) => (typeof part === "object" && part !== null ? "[object]" : part));
  }
  if (typeof queryKey === "object" && queryKey !== null) {
    return "[object]";
  }
  return queryKey;
}

export function ensureQueryObserver(queryClient: QueryClient): void {
  if (!isBenchmarkClientMode()) return;
  if (typeof window === "undefined") return;
  if (installedClients.has(queryClient)) return;
  installedClients.add(queryClient);

  getEventBuffer();

  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== "updated") return;
    const actionType = event.action?.type;
    const queryHash = event.query.queryHash;
    const queryKey = sanitizeQueryKey(event.query.queryKey);

    if (actionType === "fetch") {
      record({
        kind: "query-fetch",
        queryHash,
        queryKey,
        fetchStatus: event.query.state.fetchStatus,
      });
    } else if (actionType === "success") {
      record({
        kind: "query-success",
        queryHash,
        queryKey,
        status: event.query.state.status,
      });
    } else if (actionType === "error") {
      record({
        kind: "query-error",
        queryHash,
        queryKey,
        status: event.query.state.status,
      });
    } else if (actionType === "invalidate") {
      record({
        kind: "query-invalidate",
        queryHash,
        queryKey,
      });
    }
  });

  queryClient.getMutationCache().subscribe((event) => {
    if (event.type !== "updated") return;
    const status = event.mutation.state.status;
    const mutationId = event.mutation.mutationId;
    const mutationKey = sanitizeQueryKey(event.mutation.options.mutationKey);

    if (status === "pending") {
      record({ kind: "mutation-pending", mutationId, mutationKey, status });
    } else if (status === "success") {
      record({ kind: "mutation-success", mutationId, mutationKey, status });
    } else if (status === "error") {
      record({ kind: "mutation-error", mutationId, mutationKey, status });
    }
  });

  const originalInvalidate = queryClient.invalidateQueries.bind(queryClient);
  queryClient.invalidateQueries = ((filters, options) => {
    record({
      kind: "invalidateQueries",
      queryKey: sanitizeQueryKey(
        filters && typeof filters === "object" && "queryKey" in filters
          ? filters.queryKey
          : undefined
      ),
    });
    return originalInvalidate(filters, options);
  }) as typeof queryClient.invalidateQueries;

  const originalSetQueryData = queryClient.setQueryData.bind(queryClient);
  queryClient.setQueryData = ((queryKey, updater, options) => {
    record({
      kind: "setQueryData",
      queryKey: sanitizeQueryKey(queryKey),
    });
    return originalSetQueryData(queryKey, updater, options);
  }) as typeof queryClient.setQueryData;
}
