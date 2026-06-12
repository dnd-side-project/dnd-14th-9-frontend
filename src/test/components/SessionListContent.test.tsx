import { fireEvent, render, screen } from "@testing-library/react";

import { SessionListContent } from "@/features/session/components/SessionList/SessionListContent";
import type { SessionListItem } from "@/features/session/types";

const mockSessionCardItem = jest.fn();

jest.mock("@/features/session/components/SessionList/SessionListSkeleton", () => ({
  SessionListSkeleton: () => <div data-testid="session-list-skeleton" />,
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

function renderSessionListContent(
  overrides: Partial<React.ComponentProps<typeof SessionListContent>> = {}
) {
  const props: React.ComponentProps<typeof SessionListContent> = {
    sessions: [createSession(1), createSession(2)],
    isError: false,
    isLoading: false,
    onRetry: jest.fn(),
    onShareSession: jest.fn(),
    ...overrides,
  };

  render(<SessionListContent {...props} />);

  return props;
}

describe("SessionListContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("로딩 상태에서는 목록 영역 skeleton만 보여준다", () => {
    renderSessionListContent({ isLoading: true });

    expect(screen.getByTestId("session-list-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 불러오기" })).not.toBeInTheDocument();
    expect(screen.queryByText("모집 중인 세션이 없습니다")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();
  });

  it("에러 상태에서는 재시도 UI만 보여주고 retry 콜백을 연결한다", () => {
    const onRetry = jest.fn();

    renderSessionListContent({ isError: true, onRetry });

    expect(screen.getByRole("button", { name: "다시 불러오기" })).toBeInTheDocument();
    expect(screen.queryByText("모집 중인 세션이 없습니다")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다시 불러오기" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("빈 목록 상태에서는 empty state만 보여준다", () => {
    renderSessionListContent({ sessions: [] });

    expect(screen.getByText("모집 중인 세션이 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "다시 불러오기" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();
  });

  it("세션 목록 상태에서는 카드 그리드와 공유 콜백을 연결한다", () => {
    const onShareSession = jest.fn();

    renderSessionListContent({ onShareSession });

    expect(screen.getByText("Session 1")).toBeInTheDocument();
    expect(screen.getByText("Session 2")).toBeInTheDocument();
    expect(mockSessionCardItem).toHaveBeenCalledTimes(2);

    const [firstCard] = screen.getAllByTestId("session-card");
    const grid = firstCard.closest(".grid");

    expect(grid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "xl:grid-cols-4");

    fireEvent.click(screen.getByRole("button", { name: "Session 1 공유" }));

    expect(onShareSession).toHaveBeenCalledWith(1);
  });
});
