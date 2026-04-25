import { render, screen } from "@testing-library/react";

import { Card, type CardProps } from "@/features/session/components/Card/Card";

jest.mock("@/components/Thumbnail/Thumbnail", () => ({
  Thumbnail: ({ alt }: { alt: string }) => <div data-testid="thumbnail">{alt}</div>,
}));

jest.mock("@/components/RelativeTime/RelativeTimeBadge", () => ({
  RelativeTimeBadge: ({ className }: { className?: string }) => (
    <span className={className} data-testid="relative-time-badge">
      상대시간
    </span>
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

  it("prefers description over nickname for subtitle text", () => {
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
});
