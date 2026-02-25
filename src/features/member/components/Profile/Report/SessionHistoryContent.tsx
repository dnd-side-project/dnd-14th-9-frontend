import { memberApi } from "@/features/member/api";

import SessionHistorySection from "./SessionHistorySection";

interface SessionHistoryContentProps {
  page: number;
}

const SESSION_HISTORY_PAGE_SIZE = 4;

export default async function SessionHistoryContent({ page }: SessionHistoryContentProps) {
  const data = await memberApi.getMyReportSessions({ page, size: SESSION_HISTORY_PAGE_SIZE });

  if (!data?.result) {
    throw new Error("Failed to load session history");
  }

  const { sessions, totalPage, listSize, totalElements } = data.result;
  const visibleSessions = sessions.slice(0, SESSION_HISTORY_PAGE_SIZE);

  return (
    <SessionHistorySection
      items={visibleSessions}
      pagination={{
        currentPage: page,
        totalPage,
        listSize,
        totalElements,
      }}
    />
  );
}
