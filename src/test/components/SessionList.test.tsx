import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SessionList } from "@/features/session/components/SessionList/SessionList";
import type { SessionListFilterValues } from "@/features/session/hooks/useSessionListFilters";
import type { SessionListItem, SessionListParams } from "@/features/session/types";

const mockUseSearchParams = jest.fn();
const mockUseSuspenseSessionList = jest.fn();
const mockUseSessionListFilters = jest.fn();
const mockShareSession = jest.fn();
const mockSetPage = jest.fn();
const mockSessionListFilterBar = jest.fn();
const mockCard = jest.fn();
const mockPagination = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useSuspenseSessionList: (params: SessionListParams) => mockUseSuspenseSessionList(params),
}));

jest.mock("@/features/session/hooks/useSessionListFilters", () => ({
  useSessionListFilters: () => mockUseSessionListFilters(),
}));

jest.mock("@/features/session/hooks/useShareSession", () => ({
  useShareSession: () => ({ shareSession: mockShareSession }),
}));

jest.mock("@/features/session/components/SessionList/SessionListFilterBar", () => ({
  SessionListFilterBar: (props: unknown) => {
    mockSessionListFilterBar(props);
    return <div data-testid="session-list-filter-bar" />;
  },
}));

jest.mock("@/features/session/components/Card/Card", () => ({
  Card: (props: { title: string }) => {
    mockCard(props);
    return <article data-testid="session-card">{props.title}</article>;
  },
}));

jest.mock("@/components/Icon/ShareIcon", () => ({
  ShareIcon: () => <span data-testid="share-icon" />,
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

function createSessionListResult({ count = 5, totalPage = 3 } = {}) {
  return {
    data: {
      result: {
        totalPage,
        sessions: Array.from({ length: count }, (_, index) => createSession(index + 1)),
      },
    },
  };
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

function dispatchResize(width: number) {
  act(() => {
    setViewportWidth(width);
    window.dispatchEvent(new Event("resize"));
  });
}

function setSearchParams(queryString: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(queryString));
}

function setupFilters(values: Partial<SessionListFilterValues> = {}) {
  mockUseSessionListFilters.mockReturnValue({
    values: {
      startDate: null,
      endDate: null,
      timeSlots: [],
      durationRange: null,
      participants: null,
      sort: "POPULAR",
      ...values,
    },
    setDateRange: jest.fn(),
    toggleTimeSlot: jest.fn(),
    setDurationRange: jest.fn(),
    setParticipantsCount: jest.fn(),
    setSort: jest.fn(),
    setPage: mockSetPage,
    resetFilters: jest.fn(),
  });
}

function getLatestSessionListParams() {
  return mockUseSuspenseSessionList.mock.calls.at(-1)?.[0] as SessionListParams | undefined;
}

describe("SessionList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setViewportWidth(1280);
    setSearchParams("page=1");
    setupFilters();
    mockUseSuspenseSessionList.mockReturnValue(createSessionListResult({ count: 8, totalPage: 4 }));
  });

  it("모바일 viewport에서는 hydration 이후 최신 세션 목록 요청과 기존 필터 값을 유지한다", async () => {
    setViewportWidth(375);
    setSearchParams(
      "q=react&category=DEVELOPMENT&page=2&sort=LATEST&startDate=2026-02-01&endDate=2026-02-28&timeSlots=MORNING,EVENING&durationRange=TWO_TO_FOUR_HOURS&participants=6"
    );
    setupFilters({
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      timeSlots: ["MORNING", "EVENING"],
      durationRange: "TWO_TO_FOUR_HOURS",
      participants: "6",
      sort: "LATEST",
    });

    render(<SessionList />);

    await waitFor(() => {
      expect(getLatestSessionListParams()).toEqual(
        expect.objectContaining({
          keyword: "react",
          category: "DEVELOPMENT",
          page: 2,
          size: 5,
          sort: "LATEST",
          startDate: "2026-02-01",
          endDate: "2026-02-28",
          timeSlots: ["MORNING", "EVENING"],
          durationRange: "TWO_TO_FOUR_HOURS",
          participants: 6,
        })
      );
    });
  });

  it("md 이상 viewport에서는 세션 목록 요청 size를 8로 유지한다", () => {
    setViewportWidth(1024);

    render(<SessionList />);

    expect(getLatestSessionListParams()).toEqual(expect.objectContaining({ size: 8 }));
  });

  it("모바일에서는 5개 기준 응답을 slice 없이 그대로 렌더링한다", async () => {
    setViewportWidth(375);
    mockUseSuspenseSessionList.mockImplementation((params: SessionListParams) =>
      createSessionListResult({ count: params.size ?? 8, totalPage: 5 })
    );

    render(<SessionList />);

    await waitFor(() => {
      expect(getLatestSessionListParams()).toEqual(expect.objectContaining({ size: 5 }));
    });
    expect(screen.getAllByTestId("session-card")).toHaveLength(5);
  });

  it("mobile에서 md 이상으로 커질 때 active totalPage가 줄면 마지막 유효 페이지로 보정한다", async () => {
    setViewportWidth(375);
    setSearchParams("page=4");
    mockUseSuspenseSessionList.mockImplementation((params: SessionListParams) =>
      createSessionListResult({ count: params.size ?? 8, totalPage: params.size === 5 ? 4 : 3 })
    );

    render(<SessionList />);

    await waitFor(() => {
      expect(getLatestSessionListParams()).toEqual(expect.objectContaining({ size: 5 }));
    });
    expect(mockSetPage).not.toHaveBeenCalled();

    dispatchResize(1024);

    await waitFor(() => {
      expect(getLatestSessionListParams()).toEqual(expect.objectContaining({ size: 8 }));
      expect(mockSetPage).toHaveBeenCalledWith(3);
    });
  });

  it("세션 카드 링크와 공유 버튼 동작을 유지한다", () => {
    mockUseSuspenseSessionList.mockReturnValue(createSessionListResult({ count: 1, totalPage: 1 }));

    render(<SessionList />);

    expect(screen.getByRole("heading", { name: "지금 모집 중인 세션" })).toBeInTheDocument();
    expect(screen.getByTestId("session-list-filter-bar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Session 1" })).toHaveAttribute("href", "/session/1");
    expect(mockCard).toHaveBeenCalledWith(
      expect.objectContaining({
        size: "responsive",
        thumbnailSrc: "/session-1.png",
        category: "DEVELOPMENT",
        createdAt: "2026-02-21T10:00:00",
        title: "Session 1",
        nickname: "Host 1",
        currentParticipants: 1,
        maxParticipants: 10,
        durationMinutes: 60,
        sessionDate: "2026-02-21T10:00:00",
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "세션 링크 복사" }));

    expect(mockShareSession).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    const grid = screen.getByTestId("session-card").closest(".grid");
    const paginationButton = screen.getByRole("button", { name: /pagination 1\/1/ });

    expect(grid).not.toBeNull();
    if (!grid) {
      throw new Error("세션 카드 그리드를 찾을 수 없습니다.");
    }

    expect(grid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2", "xl:grid-cols-4");
    expect(grid.compareDocumentPosition(paginationButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(paginationButton).toBeInTheDocument();
    expect(mockPagination).toHaveBeenCalledWith(
      expect.objectContaining({ totalPage: 1, currentPage: 1, onPageChange: mockSetPage })
    );
  });

  it("세션이 없으면 empty state만 보여준다", () => {
    mockUseSuspenseSessionList.mockReturnValue(createSessionListResult({ count: 0, totalPage: 0 }));

    render(<SessionList />);

    expect(screen.getByText("모집 중인 세션이 없습니다")).toBeInTheDocument();
    expect(screen.queryByTestId("session-card")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pagination/i })).not.toBeInTheDocument();
  });
});
