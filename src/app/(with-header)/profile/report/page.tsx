import { Suspense } from "react";

import ReportContent from "@/features/member/components/Profile/Report/ReportContent";
import ReportSkeleton from "@/features/member/components/Profile/Report/ReportSkeleton";

export default function ProfileReportPage() {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportContent />
    </Suspense>
  );
}
