import { render, screen } from "@testing-library/react";

import { DateAndTimeIcon } from "@/components/Icon/DateAndTimeIcon";
import { DurationIcon } from "@/components/Icon/DurationIcon";
import { UserProfilesIcon } from "@/components/Icon/UserProfilesIcon";
import { CardMeta } from "@/features/session/components/Card/CardMeta";

/** 렌더링된 아이콘의 path 모양(d)을 읽는다 */
function pathOf(element: Element | null | undefined) {
  return element?.querySelector("svg path")?.getAttribute("d");
}

describe("CardMeta", () => {
  it("인원, 시간, 일정 앞에 Figma 아이콘(User Profiles, Duration, Date and Time)을 쓴다", () => {
    // Given: 6/10명, 60분, 2026-03-01 10:00 세션
    render(
      <CardMeta
        currentParticipants={6}
        maxParticipants={10}
        durationMinutes={60}
        sessionDate="2026-03-01T10:00:00"
      />
    );

    // When: Figma 아이콘 컴포넌트를 따로 렌더링해 모양을 얻으면
    const { container } = render(
      <>
        <UserProfilesIcon />
        <DurationIcon />
        <DateAndTimeIcon />
      </>
    );
    const [users, duration, date] = Array.from(container.children);

    // Then: 각 항목의 아이콘 모양이 Figma 아이콘과 같다
    expect(pathOf(screen.getByText("6 / 10명").previousElementSibling)).toBe(pathOf(users));
    expect(pathOf(screen.getByText("1시간").previousElementSibling)).toBe(pathOf(duration));
    expect(pathOf(screen.getByText("03/01 · 오전 10:00").previousElementSibling)).toBe(
      pathOf(date)
    );
  });
});
