import { Suspense } from "react";

import { RecommendedSection } from "@/features/session/components/RecommendedSection/RecommendedSection";
import { RecommendedSectionSkeleton } from "@/features/session/components/RecommendedSection/RecommendedSectionSkeleton";
import { SessionList } from "@/features/session/components/SessionList/SessionList";

export function MainSection() {
  return (
    <section className="flex flex-col gap-20 xl:gap-40">
      <Suspense fallback={<RecommendedSectionSkeleton />}>
        <RecommendedSection />
      </Suspense>
      <SessionList />
    </section>
  );
}
