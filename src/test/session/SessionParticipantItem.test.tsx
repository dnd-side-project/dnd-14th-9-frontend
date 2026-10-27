import { type ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { SessionParticipantItem } from "@/features/session/components/SessionParticipantListCard/SessionParticipantItem";
import type { InProgressMember } from "@/features/session/types";

const MEMBER: InProgressMember = {
  memberId: 1,
  nickname: "각 잡은 호랑이",
  role: "PARTICIPANT",
  achievementRate: 90,
  status: "FOCUSED",
  task: {
    taskId: 1,
    goal: "집중률 100% 달성하기",
    todos: [
      { subtaskId: 1, content: "알고리즘 1문제 풀기", isCompleted: true },
      { subtaskId: 2, content: "코드 리팩터링", isCompleted: false },
    ],
  },
};

// li는 ul 안에서만 올바른 DOM이라 목록으로 감싸 렌더링한다
function renderItem(props: Partial<ComponentProps<typeof SessionParticipantItem>> = {}) {
  const onToggle = jest.fn();
  render(
    <ul>
      <SessionParticipantItem member={MEMBER} isExpanded={false} onToggle={onToggle} {...props} />
    </ul>
  );
  return { onToggle };
}

describe("SessionParticipantItem", () => {
  it("참여자 이름, 목표, 현재 상태, 투두 달성률을 한 항목(li)으로 보여준다", () => {
    // Given: 집중 중인 참여자
    // When: 렌더링하면
    renderItem();

    // Then: 한 개의 listitem 안에 정보가 모두 있다
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("각 잡은 호랑이");
    expect(item).toHaveTextContent("집중률 100% 달성하기");
    expect(item).toHaveTextContent("집중 중");
    expect(item).toHaveTextContent("90%");
  });

  it("방장이면 방장 배지를 보여주고, 참여자면 보여주지 않는다", () => {
    // Given/When: 방장과 참여자를 각각 렌더링하면
    const { unmount } = render(
      <ul>
        <SessionParticipantItem
          member={{ ...MEMBER, role: "HOST" }}
          isExpanded={false}
          onToggle={jest.fn()}
        />
      </ul>
    );

    // Then: 방장에게만 배지가 있다
    expect(screen.getByLabelText("방장")).toBeInTheDocument();
    unmount();
    renderItem();
    expect(screen.queryByLabelText("방장")).not.toBeInTheDocument();
  });

  it("펼침 버튼을 누르면 onToggle이 한 번 호출된다", () => {
    // Given: 접힌 항목
    const { onToggle } = renderItem();

    // When: 펼침 버튼을 누르면
    fireEvent.click(screen.getByRole("button", { name: "할 일 펼치기" }));

    // Then: 펼침 상태는 부모가 바꾸므로 콜백만 호출된다
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("투두리스트")).not.toBeInTheDocument();
  });

  it("펼쳐져 있고 할 일이 있으면 투두리스트 패널을 보여주고 버튼은 '할 일 접기'가 된다", () => {
    // Given/When: 펼친 항목을 렌더링하면
    renderItem({ isExpanded: true });

    // Then: 완료/전체와 할 일이 보이고, 버튼 이름이 접기로 바뀐다
    expect(screen.getByText("투두리스트")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText("알고리즘 1문제 풀기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "할 일 접기" })).toBeInTheDocument();
  });

  it("펼쳐져 있어도 할 일이 없으면 패널을 만들지 않는다", () => {
    // Given/When: 할 일이 없는 참여자를 펼친 채로 렌더링하면
    renderItem({
      isExpanded: true,
      member: { ...MEMBER, task: { taskId: 2, goal: "문서 정리하기", todos: [] } },
    });

    // Then: 패널 제목이 없다
    expect(screen.queryByText("투두리스트")).not.toBeInTheDocument();
  });

  it("항목 카드는 모바일 안쪽 12px · 간격 12px, 태블릿부터 16px · 16px이다", () => {
    // Given/When: 렌더링하면
    renderItem();

    // Then: 기본이 모바일 값이고 md부터 커진다
    const card = screen.getByRole("listitem").firstElementChild;
    expect(card).toHaveClass("p-sm", "gap-sm", "md:p-md", "md:gap-md");
    expect(card).not.toHaveClass("p-md");
  });

  it("글자와 칩은 모바일에서 한 단계 작다 (닉네임 14, 상태·라벨 11, 칩 10 → 16, 12, 12)", () => {
    // Given: 집중 중인 참여자
    // When: 렌더링하면
    renderItem();

    // Then: 닉네임 14px → 16px, 상태 글자와 '투두 달성률' 11px → 12px, 칩 10px → 12px
    expect(screen.getByText("각 잡은 호랑이")).toHaveClass("text-sm", "md:text-base");
    expect(screen.getByText("집중 중")).toHaveClass("text-[11px]", "md:text-xs");
    expect(screen.getByText("투두 달성률")).toHaveClass("text-[11px]", "md:text-xs");
    expect(screen.getByText("90%")).toHaveClass("text-[10px]", "md:text-xs");
  });

  it("avatarSize를 안 넘기면 48px, large를 넘기면 40px 아바타이다", () => {
    // Given/When: 기본과 large로 각각 렌더링하면
    const { unmount } = render(
      <ul>
        <SessionParticipantItem member={MEMBER} isExpanded={false} onToggle={jest.fn()} />
      </ul>
    );

    // Then: 기본은 size-12, large는 size-10이다
    expect(screen.getByRole("listitem").querySelector(".rounded-full")).toHaveClass("size-12");
    unmount();
    renderItem({ avatarSize: "large" });
    expect(screen.getByRole("listitem").querySelector(".rounded-full")).toHaveClass("size-10");
  });

  it("hiddenOnMobile이면 모바일에서만 숨고, 아니면 항상 보인다", () => {
    // Given/When: 기본과 hiddenOnMobile로 각각 렌더링하면
    const { unmount } = render(
      <ul>
        <SessionParticipantItem member={MEMBER} isExpanded={false} onToggle={jest.fn()} />
      </ul>
    );

    // Then: 기본은 숨김 클래스가 없고, hiddenOnMobile은 max-md:hidden이다 (md 이상에서는 보임)
    expect(screen.getByRole("listitem")).not.toHaveClass("max-md:hidden");
    unmount();
    renderItem({ hiddenOnMobile: true });
    expect(screen.getByRole("listitem")).toHaveClass("max-md:hidden");
  });

  it("상태 줄이 좁아지면(작은 폰) 넘치지 않고 줄바꿈하며, 그 폭에서는 구분선을 숨긴다", () => {
    // Given/When: 렌더링하면
    renderItem();

    // Then: 상태 줄은 flex-wrap이고(Figma 375px에서는 한 줄), 정보 열이 컨테이너라 줄 폭이 255px 이하면
    // 구분선이 줄 끝에 덩그러니 남지 않게 숨긴다 (그보다 넓으면 한 줄로 보이므로 구분선이 필요하다)
    const divider = screen.getByTestId("status-divider");
    const statusRow = divider.parentElement;
    expect(statusRow).toHaveClass("flex-wrap");
    expect(statusRow?.parentElement).toHaveClass("@container");
    expect(divider).toHaveClass("@max-[255px]:hidden");
  });
});
