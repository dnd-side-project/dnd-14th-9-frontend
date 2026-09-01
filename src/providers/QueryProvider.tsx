"use client";

import { type ReactNode } from "react";

import dynamic from "next/dynamic";

import {
  HydrationBoundary,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";

import { ensureQueryObserver } from "@/lib/benchmark/query-observer";
import { getQueryClient } from "@/lib/getQueryClient";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

const isDevtoolsEnabled =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true";

interface QueryProviderProps {
  children: ReactNode;
  dehydratedState?: DehydratedState;
}

export function QueryProvider({ children, dehydratedState }: QueryProviderProps) {
  const queryClient = getQueryClient();

  if (process.env.NEXT_PUBLIC_BENCHMARK_MODE === "true") {
    ensureQueryObserver(queryClient);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      {isDevtoolsEnabled ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
