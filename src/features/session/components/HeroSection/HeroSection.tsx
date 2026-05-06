import { Suspense } from "react";

import { Banner } from "@/features/session/components/Banner/Banner";
import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";
import { SearchFilterSectionSkeleton } from "@/features/session/components/SearchFilterSection/SearchFilterSectionSkeleton";

interface HeroSectionProps {
  isSearchMode: boolean;
}

export function HeroSection({ isSearchMode }: HeroSectionProps) {
  return (
    <section className="flex flex-col items-center gap-10 md:gap-[48px]">
      <Suspense fallback={<SearchFilterSectionSkeleton />}>
        <SearchFilterSection />
      </Suspense>
      {!isSearchMode && <Banner />}
    </section>
  );
}
