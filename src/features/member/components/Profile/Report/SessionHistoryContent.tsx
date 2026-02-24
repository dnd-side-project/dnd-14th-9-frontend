import { memberApi } from "@/features/member/api";

import SessionHistorySection from "./SessionHistorySection";

interface SessionHistoryContentProps {
  page: number;
}

export default async function SessionHistoryContent({ page }: SessionHistoryContentProps) {
  const data = await memberApi.getMyReportSessions({ page, size: 10 });

  if (!data?.result) {
    throw new Error("Failed to load session history");
  }

  const { sessions, currentPage, totalPages, pageSize, totalElements } = data.result;

  return (
    <SessionHistorySection
      items={sessions}
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        totalElements,
      }}
    />
  );
}
