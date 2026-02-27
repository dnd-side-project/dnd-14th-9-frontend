import { useEffect } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { RecommendedSectionContent } from "@/features/session/components/RecommendedSection/RecommendedSectionContent";

const mockUseSearchParams = jest.fn();
const mockUseSuspenseSessionList = jest.fn();
const mockUseSuspenseMeForEdit = jest.fn();
const mockRecommendedGrid = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useSuspenseSessionList: (params: unknown) => mockUseSuspenseSessionList(params),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useSuspenseMeForEdit: () => mockUseSuspenseMeForEdit(),
}));

jest.mock("@/features/session/components/Card/Card", () => ({
  Card: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("@/features/session/components/RecommendedSection/RecommendedGrid", () => ({
  RecommendedGrid: ({
    category,
    keyword,
    page,
    onMetaChange,
  }: {
    category?: string;
    keyword?: string;
    page?: number;
    onMetaChange?: (meta: { totalPage: number }) => void;
  }) => {
    useEffect(() => {
      // 검색 모드: useSuspenseSessionList 호출 시뮬레이션
      if (keyword) {
        mockUseSuspenseSessionList({ keyword, category, page, size: 4 });
        // totalPage 콜백 시뮬레이션
        if (onMetaChange) {
          onMetaChange({ totalPage: 3 });
        }
      } else if (category) {
        // 추천 모드
        mockRecommendedGrid(category);
      }
    }, [keyword, category, page, onMetaChange]);

    if (keyword) {
      return <div data-testid="recommended-grid">Search: {keyword}</div>;
    }
    return <div data-testid="recommended-grid">{category}</div>;
  },
}));

jest.mock("@/components/Pagination/PaginationFraction", () => ({
  PaginationFraction: ({
    currentPage,
    totalPage,
    onPageChange,
  }: {
    currentPage: number;
    totalPage: number;
    onPageChange: (page: number) => void;
  }) => (
    <button type="button" onClick={() => onPageChange(currentPage + 1)}>
      fraction {currentPage}/{totalPage}
    </button>
  ),
}));

function createSessionListResult(totalPage = 3) {
  return {
    data: {
      result: {
        totalPage,
        sessions: [
          {
            sessionId: 1,
            category: "DEVELOPMENT",
            title: "Session 1",
            hostNickname: "Host 1",
            status: "WAITING",
            currentParticipants: 2,
            maxParticipants: 10,
            sessionDurationMinutes: 60,
            startTime: "2026-02-20T10:00:00",
            imageUrl: "/images/thumbnail-placeholder.svg",
          },
          {
            sessionId: 2,
            category: "DESIGN",
            title: "Session 2",
            hostNickname: "Host 2",
            status: "WAITING",
            currentParticipants: 3,
            maxParticipants: 10,
            sessionDurationMinutes: 60,
            startTime: "2026-02-20T11:00:00",
            imageUrl: "/images/thumbnail-placeholder.svg",
          },
          {
            sessionId: 3,
            category: "FREE",
            title: "Session 3",
            hostNickname: "Host 3",
            status: "WAITING",
            currentParticipants: 4,
            maxParticipants: 10,
            sessionDurationMinutes: 60,
            startTime: "2026-02-20T12:00:00",
            imageUrl: "/images/thumbnail-placeholder.svg",
          },
          {
            sessionId: 4,
            category: "TEAM_PROJECT",
            title: "Session 4",
            hostNickname: "Host 4",
            status: "WAITING",
            currentParticipants: 5,
            maxParticipants: 10,
            sessionDurationMinutes: 60,
            startTime: "2026-02-20T13:00:00",
            imageUrl: "/images/thumbnail-placeholder.svg",
          },
        ],
      },
    },
  };
}

function setSearchParams(queryString: string) {
  mockUseSearchParams.mockReturnValue(new URLSearchParams(queryString));
}

describe("RecommendedSectionContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchParams("");
    mockUseSuspenseSessionList.mockReturnValue(createSessionListResult());
    mockUseSuspenseMeForEdit.mockReturnValue({
      data: {
        result: {
          nickname: "테스터",
          firstInterestCategory: "DEVELOPMENT",
          secondInterestCategory: "DESIGN",
          thirdInterestCategory: "FREE",
        },
      },
    });
  });

  it("검색 모드에서 정렬을 항상 마감순으로 고정한다", () => {
    setSearchParams("q=react&sort=POPULAR&category=ALL");

    render(<RecommendedSectionContent />);

    expect(screen.getByText("지금 바로 참여할 수 있는 세션")).toBeInTheDocument();
    expect(mockUseSuspenseSessionList).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "react",
        category: undefined,
        page: 1,
        size: 4,
      })
    );
  });

  it("검색 필터가 바뀌면 검색 모드 페이지를 1로 리셋한다", async () => {
    setSearchParams("q=react");

    const { rerender } = render(<RecommendedSectionContent />);

    expect(mockUseSuspenseSessionList).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 })
    );

    fireEvent.click(screen.getByRole("button", { name: /fraction/i }));

    await waitFor(() => {
      expect(mockUseSuspenseSessionList).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    setSearchParams("q=react&category=DEVELOPMENT");
    rerender(<RecommendedSectionContent />);

    await waitFor(() => {
      expect(mockUseSuspenseSessionList).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, category: "DEVELOPMENT" })
      );
    });
  });

  it("검색어가 없으면 기존 추천 모드를 유지한다", () => {
    setSearchParams("");

    render(<RecommendedSectionContent />);

    expect(
      screen.getByRole("heading", { name: /테스터\s*님을 위한 추천 세션/ })
    ).toBeInTheDocument();
    expect(mockUseSuspenseMeForEdit).toHaveBeenCalledTimes(1);
    expect(mockRecommendedGrid).toHaveBeenCalledWith("DEVELOPMENT");
    expect(screen.queryByText("지금 바로 참여할 수 있는 세션")).not.toBeInTheDocument();
  });
});
