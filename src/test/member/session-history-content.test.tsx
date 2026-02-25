import { render, screen } from "@testing-library/react";

import { memberApi } from "@/features/member/api";
import SessionHistoryContent from "@/features/member/components/Profile/Report/SessionHistoryContent";
import type { GetMyReportSessionsResponse } from "@/features/member/types";

const mockSessionHistorySection = jest.fn();

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMyReportSessions: jest.fn(),
  },
}));

jest.mock("@/features/member/components/Profile/Report/SessionHistorySection", () => ({
  __esModule: true,
  default: ({
    items,
    pagination,
  }: {
    items: unknown[];
    pagination: {
      currentPage: number;
      totalPage: number;
      listSize: number;
      totalElements: number;
    };
  }) => {
    mockSessionHistorySection({ items, pagination });
    return <div data-testid="session-history-section" />;
  },
}));

const mockedMemberApi = memberApi as jest.Mocked<typeof memberApi>;

describe("SessionHistoryContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("리포트 세션을 페이지당 4개 크기로 요청하고, 화면 노출도 최대 4개로 제한한다", async () => {
    const overflowSessions = Array.from({ length: 5 }, (_, index) => ({
      sessionId: `session-${index + 1}`,
      title: `프론트엔드 스터디 ${index + 1}`,
      category: "DEVELOPMENT" as const,
      currentCount: 3,
      maxCapacity: 8,
      durationTime: 3600,
      startTime: "2026-02-25T13:00:00+09:00",
      focusedTime: 2400,
      focusRate: 67,
      todoCompletionRate: 80,
    }));

    const mockResponse: GetMyReportSessionsResponse = {
      isSuccess: true,
      code: "COMMON200",
      message: "성공적으로 요청을 처리했습니다.",
      result: {
        sessions: overflowSessions,
        totalPage: 3,
        listSize: 5,
        totalElements: 12,
        first: false,
        last: false,
      },
    };

    mockedMemberApi.getMyReportSessions.mockResolvedValue(mockResponse);

    const view = await SessionHistoryContent({ page: 2 });
    render(view);

    expect(mockedMemberApi.getMyReportSessions).toHaveBeenCalledWith({ page: 2, size: 4 });
    expect(mockSessionHistorySection).toHaveBeenCalledWith({
      items: overflowSessions.slice(0, 4),
      pagination: {
        currentPage: 2,
        totalPage: 3,
        listSize: 5,
        totalElements: 12,
      },
    });
    expect(screen.getByTestId("session-history-section")).toBeInTheDocument();
  });
});
