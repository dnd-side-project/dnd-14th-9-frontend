import { render, screen } from "@testing-library/react";

import { Card, type CardProps } from "@/features/session/components/Card/Card";

jest.mock("@/components/Thumbnail/Thumbnail", () => ({
  Thumbnail: ({ alt, className }: { alt: string; className?: string }) => (
    <div className={className} data-testid="thumbnail">
      {alt}
    </div>
  ),
}));

jest.mock("@/components/RelativeTime/RelativeTimeBadge", () => ({
  RelativeTimeBadge: ({ className }: { className?: string }) => (
    <span className={className} data-testid="relative-time-badge">
      상대시간
    </span>
  ),
}));

jest.mock("@/features/session/components/Card/CardMeta", () => ({
  CardMeta: ({ size = "md" }: { size?: "md" | "sm" | "responsive" }) => (
    <div data-size={size} data-testid="card-meta" />
  ),
}));

const BASE_CARD_PROPS = {
  thumbnailSrc: "/thumbnail.png",
  category: "보드게임",
  title: "세션 제목",
  currentParticipants: 2,
  maxParticipants: 4,
  durationMinutes: 120,
} satisfies Omit<CardProps, "sessionDate">;

function renderCard(props: Partial<CardProps> = {}) {
  return render(
    <Card {...BASE_CARD_PROPS} sessionDate={new Date("2026-04-24T12:00:00Z")} {...props} />
  );
}

describe("Card", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-24T09:00:00Z"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("shows in-progress status when the session time is past", () => {
    renderCard({
      createdAt: new Date("2026-04-24T08:00:00Z"),
      sessionDate: new Date("2026-04-24T08:30:00Z"),
      statusText: "모집중",
    });

    expect(screen.getByText("진행중")).toBeInTheDocument();
    expect(screen.queryByText("모집중")).not.toBeInTheDocument();
    expect(screen.queryByTestId("relative-time-badge")).not.toBeInTheDocument();
  });

  it("shows explicit status text before relative time when the session is upcoming", () => {
    renderCard({
      createdAt: new Date("2026-04-24T08:00:00Z"),
      statusText: "마감 임박",
      statusBadgeStatus: "closing",
    });

    expect(screen.getByText("마감 임박")).toBeInTheDocument();
    expect(screen.queryByTestId("relative-time-badge")).not.toBeInTheDocument();
  });

  it("falls back to relative time when only createdAt exists", () => {
    renderCard({
      createdAt: new Date("2026-04-24T08:00:00Z"),
    });

    expect(screen.getByTestId("relative-time-badge")).toHaveTextContent("상대시간");
  });

  it("prefers description over nickname when showDescription is true", () => {
    renderCard({
      description: "설명",
      nickname: "닉네임",
    });

    expect(screen.getByText("설명")).toBeInTheDocument();
    expect(screen.queryByText("닉네임")).not.toBeInTheDocument();
  });

  it("shows nickname as subtitle when description is missing", () => {
    renderCard({
      nickname: "닉네임",
    });

    expect(screen.getByText("닉네임")).toBeInTheDocument();
  });

  it("hides description and shows nickname when showDescription is false", () => {
    renderCard({
      description: "설명",
      nickname: "닉네임",
      showDescription: false,
    });

    expect(screen.queryByText("설명")).not.toBeInTheDocument();
    expect(screen.getByText("닉네임")).toBeInTheDocument();
  });

  it("renders with size=sm without errors", () => {
    renderCard({ size: "sm" });
    // Thumbnail mock이 alt를 텍스트로 렌더링하므로 h3 요소로 범위를 좁힘
    expect(screen.getByRole("heading", { name: "세션 제목" })).toBeInTheDocument();
  });

  it("uses fixed md density classes for default md size", () => {
    renderCard({
      statusText: "모집중",
      description: "설명",
    });

    expect(screen.getByText("모집중")).toHaveClass("px-3", "text-xs");
    expect(screen.getByText("보드게임")).not.toHaveClass("text-[10px]", "md:text-xs");
    expect(screen.getByRole("heading", { name: "세션 제목" })).toHaveClass("text-lg");
    expect(screen.getByText("설명")).toHaveClass("text-xs");
    expect(screen.getByTestId("card-meta")).toHaveAttribute("data-size", "md");
  });

  it("uses mobile compact and desktop md density classes for responsive size", () => {
    renderCard({
      size: "responsive",
      statusText: "모집중",
      description: "설명",
    });

    expect(screen.getByText("모집중")).toHaveClass("px-2", "text-[10px]", "md:px-3", "md:text-xs");
    expect(screen.getByText("보드게임")).toHaveClass("text-[10px]", "md:text-xs");
    expect(screen.getByRole("heading", { name: "세션 제목" })).toHaveClass(
      "text-[15px]",
      "md:text-lg"
    );
    expect(screen.getByText("설명")).toHaveClass("text-[11px]", "md:text-xs");
    expect(screen.getByTestId("card-meta")).toHaveAttribute("data-size", "responsive");
  });

  it("uses responsive thumbnail density for horizontal responsive size", () => {
    renderCard({
      layout: "horizontal",
      size: "responsive",
    });

    expect(screen.getByTestId("thumbnail")).toHaveClass(
      "self-stretch",
      "w-auto",
      "md:h-[180px]",
      "md:w-[290px]",
      "md:self-auto"
    );
  });

  it("renders with layout=horizontal without errors", () => {
    renderCard({ layout: "horizontal" });
    expect(screen.getByRole("heading", { name: "세션 제목" })).toBeInTheDocument();
  });

  it("renders with layout=horizontal and size=sm without errors", () => {
    renderCard({ layout: "horizontal", size: "sm" });
    expect(screen.getByRole("heading", { name: "세션 제목" })).toBeInTheDocument();
  });
});
