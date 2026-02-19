import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { SessionListParams } from "@/features/session/types";

import { RecruitingSection } from "./RecruitingSection";

interface RecruitingSectionPrefetchedProps {
  listParams: SessionListParams;
}

export async function RecruitingSectionPrefetched({
  listParams,
}: RecruitingSectionPrefetchedProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: sessionKeys.list(listParams),
    queryFn: () => sessionApi.getList(listParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecruitingSection />
    </HydrationBoundary>
  );
}
