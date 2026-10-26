import { render, screen } from "@testing-library/react";

import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";

const NOTICE = "빡집중해서 같이 코딩해요!\n무분별한 자리비움은 지양합니다";

function renderSection() {
  return render(
    <SessionDetailSection
      thumbnailUrl="/images/thumbnail-fallback.svg"
      category="개발"
      title="아침 코딩 모각작"
      description="아침 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다!"
      currentParticipants={6}
      maxParticipants={10}
      durationMinutes={60}
      sessionDate="2026-03-01T10:00:00"
      notice={NOTICE}
    />
  );
}

describe("SessionDetailSection", () => {
  it("카드는 테두리와 안쪽 여백이 있는 어두운 배경이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    const { container } = renderSection();

    // Then: 기본 배경, 옅은 테두리, 24px 여백과 간격을 쓴다
    expect(container.querySelector("section")).toHaveClass(
      "bg-surface-default",
      "border",
      "border-border-subtle",
      "p-xl",
      "gap-xl"
    );
  });

  it("제목은 기본 글자색, 방 소개는 15px 보조 글자색으로 보여준다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 제목과 방 소개 글자 스타일이 시안과 같다
    expect(screen.getByRole("heading", { level: 2, name: "아침 코딩 모각작" })).toHaveClass(
      "text-text-primary"
    );
    expect(screen.getByText("아침 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다!")).toHaveClass(
      "text-text-tertiary",
      "text-[15px]"
    );
  });

  it("공지사항 영역은 surface-strong 배경이고 라벨은 위쪽에 정렬된다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 공지 영역은 surface-strong 배경, 8px radius, 위쪽 정렬이고 라벨은 보조 글자색이다
    expect(screen.getByText("공지사항")).toHaveClass("text-text-tertiary");
    expect(screen.getByText("공지사항").parentElement).toHaveClass(
      "bg-surface-strong",
      "rounded-md",
      "items-start"
    );
  });

  it("메타 정보는 기존 표기를 유지하고 16px 보조 글자색으로 보여준다", () => {
    // Given: 6/10명, 60분, 2026-03-01 10:00 세션
    // When: 렌더링하면
    renderSection();

    // Then: 표기는 기존 그대로이고 글자 스타일은 시안(16px, text-disabled)과 같다
    for (const text of ["6 / 10명", "1시간", "03/01 · 오전 10:00"]) {
      // 글자 -> 항목 -> CardMeta 루트
      expect(screen.getByText(text).parentElement?.parentElement).toHaveClass(
        "text-base",
        "text-text-disabled"
      );
    }
  });

  it("메타 항목마다 글자 앞에 16px 아이콘이 있다", () => {
    // Given: 6/10명, 60분, 2026-03-01 10:00 세션
    // When: 렌더링하면
    renderSection();

    // Then: 세 항목 모두 글자 바로 앞에 16px(h-4 w-4) 아이콘이 있다
    for (const text of ["6 / 10명", "1시간", "03/01 · 오전 10:00"]) {
      const icon = screen.getByText(text).previousElementSibling;
      expect(icon).toHaveClass("size-4");
      expect(icon?.querySelector("svg")).not.toBeNull();
    }
  });

  it("공지사항 내용은 입력한 줄바꿈을 유지한다", () => {
    // Given: 줄바꿈이 있는 공지사항
    // When: 렌더링하면
    renderSection();

    // Then: 줄바꿈을 보존하는 클래스와 15px 보조 글자색을 쓴다
    expect(screen.getByText(/빡집중해서 같이 코딩해요!/)).toHaveClass(
      "whitespace-pre-line",
      "text-text-tertiary",
      "text-[15px]"
    );
  });
});
