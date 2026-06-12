import { fireEvent, render, screen } from "@testing-library/react";

import { SessionListView } from "@/features/session/components/SessionList/SessionListView";
import type { SessionListItem } from "@/features/session/types";

const mockSessionListFilterBar = jest.fn();
const mockSessionCardItem = jest.fn();
const mockPagination = jest.fn();

jest.mock("@/features/session/components/SessionList/SessionListFilterBar", () => ({
  SessionListFilterBar: (props: unknown) => {
    mockSessionListFilterBar(props);
    return <div data-testid="session-list-filter-bar" />;
  },
}));

jest.mock("@/features/session/components/SessionList/SessionListErrorState", () => ({
  SessionListErrorState: ({ onRetry }: { onRetry: () => void }) => (
    <button type="button" onClick={onRetry}>
      다시 불러오기
    </button>
  ),
}));

jest.mock("@/features/session/components/SessionList/SessionCardItem", () => ({
  SessionCardItem: ({
    session,
    onShare,
  }: {
    session: SessionListItem;
    onShare: (sessionId: number) => void;
  }) => {
    mockSessionCardItem({ session, onShare });
    return (
      <article data-testid="session-card">
        <h3>{session.title}</h3>
        <button type="button" onClick={() => onShare(session.sessionId)}>
          {session.title} 공유
        </button>
      </article>
    );
  },
}));

jest.mock("@/components/Pagination/Pagination", () => ({
  Pagination: (props: {
    totalPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => {
    mockPagination(props);
    return (
      <button type="button" onClick={() => props.onPageChange(props.currentPage + 1)}>
        pagination {props.currentPage}/{props.totalPage}
      </button>
    );
  },
}));

function createSession(id: number): SessionListItem {
  return {
    sessionId: id,
    category: "DEVELOPMENT",
    title: `Session ${id}`,
    hostNickname: `Host ${id}`,
    status: "WAITING",
    currentParticipants: id,
    maxParticipants: 10,
    sessionDurationMinutes: 60,
    startTime: `2026-02-2${id}T10:00:00`,
    imageUrl: `/session-${id}.png`,
  };
}

function createFilterBarProps() {
  return {
    values: {
      startDate: null,
      endDate: null,
      timeSlots: [],
      durationRange: null,
      participants: null,
      sort: "POPULAR" as const,
    },
    onSetDateRange: jest.fn(),
    onToggleTimeSlot: jest.fn(),
    onSetDurationRange: jest.fn(),
    onSetParticipants: jest.fn(),
    onSetSort: jest.fn(),
    onResetFilters: jest.fn(),
  };
}

function renderSessionListView(
  overrides: Partial<React.ComponentProps<typeof SessionListView>> = {}
) {
  const props: React.ComponentProps<typeof SessionListView> = {
    filterBarProps: createFilterBarProps(),
    sessions: [createSession(1), createSession(2)],
    totalPage: 3,
    currentPage: 1,
    isError: false,
    onRetry: jest.fn(),
    onPageChange: jest.fn(),
    onShareSession: jest.fn(),
    ...overrides,
  };

  render(<SessionListView {...props} />);

  return props;
}

describe("SessionListView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("공통 헤더와 필터바를 항상 렌더링하고 필터바 props를 전달한다", () => {
    const props = renderSessionListView({ isError: true });

    expect(screen.getByRole("heading", { name: "지금 모집 중인 세션" })).toBeInTheDocument();
    expect(screen.getByText("현재 모집 중인 세션에 바로 참여해 보세요")).toBeInTheDocument();
    expect(screen.getByTestId("session-list-filter-bar")).toBeInTheDocument();
    expect(mockSessionListFilterBar).toHaveBeenCalledWith(props.filterBarProps);
  });

  it("에러 상태에서는 재시도 UI만 보여주고 목록/empty/pagination은 숨긴다", () => {
    const onRetry = jest.fn();

    renderSessionListView({ isError: true, onRetry });

    expect(screen.getByRole("button", { name: "다시 불러오기" })).toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();
    expect(screen.queryByText("모집 중인 세션이 없습니다")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pagination/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다시 불러오기" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("빈 목록 상태에서는 empty state를 보여주고 목록/pagination은 숨긴다", () => {
    renderSessionListView({ sessions: [], totalPage: 0 });

    expect(screen.getByText("모집 중인 세션이 없습니다")).toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pagination/i })).not.toBeInTheDocument();
  });

  it("세션 목록과 pagination을 렌더링하고 공유/페이지 변경 콜백을 연결한다", () => {
    const onShareSession = jest.fn();
    const onPageChange = jest.fn();

    renderSessionListView({ onShareSession, onPageChange });

    expect(screen.getByText("Session 1")).toBeInTheDocument();
    expect(screen.getByText("Session 2")).toBeInTheDocument();
    expect(mockSessionCardItem).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "pagination 1/3" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Session 1 공유" }));
    fireEvent.click(screen.getByRole("button", { name: "pagination 1/3" }));

    expect(onShareSession).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(mockPagination).toHaveBeenCalledWith(
      expect.objectContaining({ totalPage: 3, currentPage: 1, onPageChange })
    );
  });
});
