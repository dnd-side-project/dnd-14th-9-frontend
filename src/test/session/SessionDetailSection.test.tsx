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
  it("태블릿부터 테두리와 안쪽 여백이 있는 어두운 카드이고, 모바일은 카드 없이 펼쳐진다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    const { container } = renderSection();

    // Then: 카드 모양(배경·테두리·여백·반경)은 md부터이고, 간격 24px은 모든 크기에서 같다
    const section = container.querySelector("section");
    expect(section).toHaveClass(
      "md:bg-surface-default",
      "md:border",
      "md:border-border-subtle",
      "md:p-xl",
      "md:rounded-lg",
      "gap-xl"
    );
    for (const cardClass of ["bg-surface-default", "border", "p-xl", "rounded-lg"]) {
      expect(section).not.toHaveClass(cardClass);
    }
  });

  it("제목은 모바일 18px, 태블릿부터 24px이고 기본 글자색이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 제목 글자 스타일이 시안과 같다
    expect(screen.getByRole("heading", { level: 2, name: "아침 코딩 모각작" })).toHaveClass(
      "text-text-primary",
      "text-lg",
      "md:text-2xl",
      "leading-[1.4]"
    );
  });

  it("방 소개는 모바일 11px, 태블릿부터 15px 보조 글자색이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 방 소개 글자 스타일이 시안과 같다
    expect(screen.getByText("아침 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다!")).toHaveClass(
      "text-text-tertiary",
      "text-[11px]",
      "md:text-[15px]"
    );
  });

  it("공지사항 영역은 모바일에서 세로(안쪽 12px, 간격 8px), 태블릿부터 가로(안쪽 20px, 간격 16px)이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: surface-strong 배경, 8px radius, 위쪽 정렬이고 크기별로 방향과 여백이 다르다
    const notice = screen.getByText("공지사항").parentElement;
    expect(screen.getByText("공지사항")).toHaveClass(
      "text-text-tertiary",
      "text-xs",
      "md:text-base"
    );
    expect(notice).toHaveClass(
      "bg-surface-strong",
      "rounded-md",
      "items-start",
      "flex-col",
      "md:flex-row",
      "p-sm",
      "md:p-lg",
      "gap-xs",
      "md:gap-md"
    );
  });

  it("공지사항 아이콘은 모바일 16px, 태블릿부터 20px이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 글자 앞 아이콘이 크기별로 다르다
    const icon = screen.getByText("공지사항").firstElementChild;
    expect(icon).toHaveClass("h-5", "w-5", "max-md:size-4");
  });

  it("메타 정보는 기존 표기를 유지하고 모바일 10px, 태블릿부터 16px 보조 글자색으로 보여준다", () => {
    // Given: 6/10명, 60분, 2026-03-01 10:00 세션
    // When: 렌더링하면
    renderSection();

    // Then: 표기는 기존 그대로이고 글자 스타일은 시안(text-disabled)과 같다.
    // 항목 간격은 모바일 8px, 태블릿부터 12px이다.
    for (const text of ["6 / 10명", "1시간", "03/01 · 오전 10:00"]) {
      // 글자 -> 항목 -> CardMeta 루트
      expect(screen.getByText(text).parentElement?.parentElement).toHaveClass(
        "text-[10px]",
        "md:text-base",
        "text-text-disabled",
        "md:gap-x-sm"
      );
    }
  });

  it("메타 항목마다 글자 앞에 아이콘이 있다 (모바일 12px, 태블릿부터 16px)", () => {
    // Given: 6/10명, 60분, 2026-03-01 10:00 세션
    // When: 렌더링하면
    renderSection();

    // Then: 세 항목 모두 글자 바로 앞에 크기별 아이콘이 있다
    for (const text of ["6 / 10명", "1시간", "03/01 · 오전 10:00"]) {
      const icon = screen.getByText(text).previousElementSibling;
      expect(icon).toHaveClass("size-3", "md:size-4");
      expect(icon?.querySelector("svg")).not.toBeNull();
    }
  });

  it("공지사항 내용은 입력한 줄바꿈을 유지한다 (모바일 11px, 태블릿부터 15px)", () => {
    // Given: 줄바꿈이 있는 공지사항
    // When: 렌더링하면
    renderSection();

    // Then: 줄바꿈을 보존하는 클래스와 크기별 보조 글자색을 쓴다
    expect(screen.getByText(/빡집중해서 같이 코딩해요!/)).toHaveClass(
      "whitespace-pre-line",
      "text-text-tertiary",
      "text-[11px]",
      "md:text-[15px]"
    );
  });

  it("정보 영역의 간격은 모바일 12px, 태블릿부터 16px이다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 배지·제목 묶음, 메타, 공지를 담은 열의 간격이 gap-sm → md:gap-md이다
    const infoColumn = screen.getByRole("heading", { level: 2 }).parentElement?.parentElement
      ?.parentElement;
    expect(infoColumn).toHaveClass("gap-sm", "md:gap-md");
    expect(infoColumn).not.toHaveClass("gap-md");
  });

  it("썸네일은 모바일 335:160, 태블릿 640:250 비율로 폭을 채우고, 데스크톱은 폭 361px로 고정한다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: 비율은 Thumbnail 자신에게 준다 (바깥 칸에 주면 Thumbnail 기본 비율이 이겨 높이가 달라진다).
    // xl에서는 비율 대신 열 높이에 맞춰 늘어나고, 바깥 칸이 361px 폭을 정한다.
    const thumbnail = screen.getByAltText("아침 코딩 모각작").parentElement;
    expect(thumbnail).toHaveClass(
      "aspect-[335/160]",
      "md:aspect-[640/250]",
      "xl:aspect-auto",
      "xl:h-full"
    );
    expect(thumbnail?.className).not.toMatch(/aspect-276/);
    const frame = thumbnail?.parentElement;
    expect(frame).toHaveClass("xl:w-[361px]", "xl:shrink-0", "xl:self-stretch");
    expect(frame?.className).not.toMatch(/aspect-/);
    expect(frame?.className).not.toMatch(/(^|\s)h-/);
  });

  it("썸네일 모서리는 모바일·태블릿 4px, 데스크톱 8px이고 테두리는 데스크톱에만 있다", () => {
    // Given: 세션 상세 정보
    // When: 렌더링하면
    renderSection();

    // Then: Figma 태블릿·모바일 이미지는 radius 4에 테두리가 없고, 데스크톱 이미지는 radius 8에 1px 테두리이다
    const thumbnail = screen.getByAltText("아침 코딩 모각작").parentElement;
    expect(thumbnail).toHaveClass("rounded-xs", "xl:rounded-md", "xl:border-sm");
    expect(thumbnail).not.toHaveClass("border-sm");
  });
});
