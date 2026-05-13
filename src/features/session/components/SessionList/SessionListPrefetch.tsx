import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import {
  SESSION_LIST_DESKTOP_PAGE_SIZE,
  SESSION_LIST_MOBILE_PAGE_SIZE,
} from "@/features/session/constants/pagination";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { SessionListParams } from "@/features/session/types";
import { getQueryClient } from "@/lib/getQueryClient";

import { SessionList } from "./SessionList";

interface SessionListPrefetchProps {
  listParams: SessionListParams;
}

export async function SessionListPrefetch({ listParams }: SessionListPrefetchProps) {
  const queryClient = getQueryClient();

  const pageSizes = [SESSION_LIST_MOBILE_PAGE_SIZE, SESSION_LIST_DESKTOP_PAGE_SIZE];

  await Promise.all(
    pageSizes.map((size) =>
      queryClient.prefetchQuery({
        queryKey: sessionKeys.list({ ...listParams, size }),
        queryFn: () => sessionApi.getList({ ...listParams, size }),
      })
    )
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SessionList />
    </HydrationBoundary>
  );
}
