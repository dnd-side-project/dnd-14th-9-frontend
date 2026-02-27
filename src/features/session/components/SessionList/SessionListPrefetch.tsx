import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { SessionListParams } from "@/features/session/types";
import { getQueryClient } from "@/lib/getQueryClient";

import { SessionList } from "./SessionList";

interface SessionListPrefetchProps {
  listParams: SessionListParams;
}

export async function SessionListPrefetch({ listParams }: SessionListPrefetchProps) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: sessionKeys.list(listParams),
    queryFn: () => sessionApi.getList(listParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SessionList />
    </HydrationBoundary>
  );
}
