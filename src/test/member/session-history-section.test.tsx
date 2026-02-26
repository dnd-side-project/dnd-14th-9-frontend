import { fireEvent, render, screen } from "@testing-library/react";

import SessionHistorySection from "@/features/member/components/Profile/Report/SessionHistorySection";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams("page=1&filter=all"),
}));

jest.mock("@/components/Pagination/PaginationList", () => ({
  PaginationList: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button type="button" onClick={() => onPageChange(2)}>
      pagination-trigger
    </button>
  ),
}));

jest.mock("@/features/member/components/Profile/Report/SessionHistoryCard", () => ({
  __esModule: true,
  default: () => <div data-testid="session-history-card" />,
}));

describe("SessionHistorySection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("페이지네이션 이동 시 상단 스크롤 없이 query만 변경해야 한다", () => {
    render(
      <SessionHistorySection
        items={[
          {
            sessionId: "session-1",
            title: "프론트엔드 세션",
            category: "DEVELOPMENT",
            currentCount: 2,
            maxCapacity: 4,
            durationTime: 3600,
            startTime: "2026-02-25T13:00:00+09:00",
            focusedTime: 2400,
            focusRate: 70,
            todoCompletionRate: 80,
          },
        ]}
        pagination={{
          currentPage: 1,
          totalPage: 3,
          listSize: 1,
          totalElements: 3,
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "pagination-trigger" }));

    expect(mockPush).toHaveBeenCalledWith("?page=2&filter=all", { scroll: false });
  });
});
