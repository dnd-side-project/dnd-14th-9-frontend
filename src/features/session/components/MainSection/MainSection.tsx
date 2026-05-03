import { Suspense } from "react";

import { RecommendedSection } from "@/features/session/components/RecommendedSection/RecommendedSection";
import { RecommendedSectionSkeleton } from "@/features/session/components/RecommendedSection/RecommendedSectionSkeleton";
import { SessionListPrefetch } from "@/features/session/components/SessionList/SessionListPrefetch";
import { SessionListSkeleton } from "@/features/session/components/SessionList/SessionListSkeleton";
import type { SessionListParams } from "@/features/session/types";

interface MainSectionProps {
  listParams: SessionListParams;
}

export function MainSection({ listParams }: MainSectionProps) {
  return (
    <section className="flex flex-col gap-20 xl:gap-40">
      <Suspense fallback={<RecommendedSectionSkeleton />}>
        <RecommendedSection />
      </Suspense>
      <Suspense fallback={<SessionListSkeleton />}>
        <SessionListPrefetch listParams={listParams} />
      </Suspense>
    </section>
  );
}
