import { type ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { ChatBubbleIcon } from "@/components/Icon/ChatBubbleIcon";
import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard/SessionParticipantListCard";
import type { InProgressMember } from "@/features/session/types";

const mockUseViewportLayout = jest.fn();

// 아바타 크기만 화면 크기를 JS로 알아야 해서 훅을 쓴다 (jsdom에는 ResizeObserver가 없다)
jest.mock("@/hooks/useViewportLayout", () => ({
  useViewportLayout: () => mockUseViewportLayout(),
}));

beforeEach(() => {
  mockUseViewportLayout.mockReturnValue({ layout: "desktop", isResolved: true });
});

// 카드가 useSessionChat(→ useChatSocket)을 직접 호출하므로 소켓 연결을 차단한다
jest.mock("@/lib/socket/useChatSocket", () => ({
  useChatSocket: () => ({ status: "connected", send: jest.fn() }),
}));

jest.mock("@/features/session/components/ChatDialog/ChatDialog", () => ({
  ChatDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chat-dialog">
      <button type="button" onClick={onClose}>
        닫기
      </button>
    </div>
  ),
}));

const BASE_PROPS = {
  sessionId: "42",
  isHost: false,
  myMemberId: 1,
  category: "개발",
  title: "아침 코딩 모각작",
  description: "각자 코딩 작업에 집중하는 세션",
  notice: "빡집중해서 같이 코딩해요!",
};

describe("SessionParticipantListCard — 채팅 트리거", () => {
  it("채팅 열기 버튼을 렌더링한다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);
    expect(screen.getByRole("button", { name: "채팅 열기" })).toBeInTheDocument();
  });

  it("처음에는 채팅 다이얼로그가 닫혀 있다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);
    expect(screen.queryByTestId("chat-dialog")).not.toBeInTheDocument();
  });

  it("채팅 열기 버튼을 누르면 다이얼로그가 열리고, 닫으면 사라진다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);

    fireEvent.click(screen.getByRole("button", { name: "채팅 열기" }));
    expect(screen.getByTestId("chat-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByTestId("chat-dialog")).not.toBeInTheDocument();
  });
});

const MEMBERS: InProgressMember[] = [
  {
    memberId: 1,
    nickname: "각 잡은 호랑이",
    role: "HOST",
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
  },
  {
    memberId: 2,
    nickname: "가냘픈 사자",
    role: "PARTICIPANT",
    achievementRate: 60,
    status: "REST",
    task: { taskId: 2, goal: "문서 정리하기", todos: [] },
  },
];

function renderCard(props: Partial<ComponentProps<typeof SessionParticipantListCard>> = {}) {
  render(
    <SessionParticipantListCard
      {...BASE_PROPS}
      members={MEMBERS}
      participantCount={6}
      averageAchievementRate={42}
      {...props}
    />
  );
  // 참여자 카드를 담은 목록 영역(스크롤 대상)과 그 바깥 카드 (ul → relative 영역 → 카드)
  const list = screen.getAllByRole("list")[0];
  return { list, card: list.parentElement?.parentElement as HTMLElement };
}

/** 렌더링된 아이콘의 path 모양(d)을 읽는다 */
function pathOf(element: Element | null | undefined) {
  return element?.querySelector("svg path")?.getAttribute("d");
}

describe("SessionParticipantListCard — 헤더와 카드 구조", () => {
  it("제목과 부제를 Figma 문구와 색으로 보여준다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    renderCard();

    // Then: 제목은 보조 글자색, 부제는 비활성 글자색이고 문구가 바뀌었다
    // text-base/text-2xl은 자체 줄 높이를 가져 부모의 leading을 이기므로 제목에 직접 1.4를 준다 (Figma 34px)
    expect(screen.getByRole("heading", { name: "참여자 목록" })).toHaveClass(
      "text-text-secondary",
      "leading-[1.4]"
    );
    expect(screen.getByText("다른 사용자의 집중 상태를 확인할 수 있어요")).toHaveClass(
      "text-text-disabled"
    );
    expect(screen.queryByText("이번 세션에서 함께할 참여자들이에요")).not.toBeInTheDocument();
  });

  it("헤더는 목록 카드 밖에 있고 둘 사이 간격은 모바일 20px, 태블릿부터 24px이다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    const { card } = renderCard();

    // Then: 헤더 제목은 목록 카드 안에 없고, 두 영역의 부모가 gap-lg → md:gap-xl이다
    const heading = screen.getByRole("heading", { name: "참여자 목록" });
    expect(card).not.toContainElement(heading);
    expect(card.parentElement).toHaveClass("gap-lg", "md:gap-xl");
    expect(card.parentElement).not.toHaveClass("gap-xl");
    expect(card.parentElement).toContainElement(heading);
  });

  it("제목은 모바일 16px, 태블릿부터 24px이고 부제는 13px → 15px, 둘 사이 간격은 2px → 4px이다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    renderCard();

    // Then: 기본이 모바일 크기이고 md부터 커진다
    const heading = screen.getByRole("heading", { name: "참여자 목록" });
    expect(heading).toHaveClass("text-base", "md:text-2xl");
    expect(screen.getByText("다른 사용자의 집중 상태를 확인할 수 있어요")).toHaveClass(
      "text-[13px]",
      "md:text-[15px]"
    );
    expect(heading.parentElement).toHaveClass("gap-3xs", "md:gap-2xs");
  });

  it("카드 자체는 높이와 폭 비율 클래스를 갖지 않고, 상위가 넘긴 className만 루트에 붙는다", () => {
    // Given/When: 상위가 폭 비율을 className으로 넘겨 렌더링하면
    const { card } = renderCard({ className: "xl:flex-4" });
    const root = card.parentElement as HTMLElement;

    // Then: 루트에는 넘긴 클래스만 있고, 고정 높이(h-*, xl:h-*)나 자체 폭 비율은 없다
    expect(root).toHaveClass("xl:flex-4");
    expect(root.className).not.toMatch(/(^|\s)(xl:)?h-/);
  });

  it("className을 안 넘기면 폭 비율 클래스도 없다", () => {
    // Given/When: className 없이 렌더링하면
    const { card } = renderCard();

    // Then: 폭 비율(xl:flex-N)은 상위 몫이라 카드에는 없다
    expect((card.parentElement as HTMLElement).className).not.toMatch(/xl:flex-\d/);
  });

  it("목록 카드 모양(배경·테두리·안쪽 24px·반경 12px·그림자)은 태블릿부터이고, 모바일은 껍데기 없이 펼쳐진다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    const { card } = renderCard();

    // Then: Figma List 카드 스타일은 md부터이고, 항목 사이 간격 12px은 모든 크기에서 같다
    expect(card).toHaveClass(
      "md:bg-surface-default",
      "md:border",
      "md:border-border-subtle",
      "md:p-xl",
      "md:rounded-lg",
      "md:shadow-[0_0_80px_rgba(0,0,0,0.3)]",
      "gap-sm"
    );
    for (const cardClass of ["bg-surface-default", "border", "p-xl", "rounded-lg"]) {
      expect(card).not.toHaveClass(cardClass);
    }
  });

  it("채팅 열기 버튼은 Button 기본 반경(rounded-md)을 이기고 원형(radius-max)이 된다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    renderCard();

    // Then: 커스텀 rounded-max는 twMerge가 rounded-md와 같은 그룹으로 보지 않아 둘 다 남으므로,
    //       중요도(!)를 붙여 원형이 되게 한다
    expect(screen.getByRole("button", { name: "채팅 열기" })).toHaveClass("!rounded-max");
  });

  it("채팅 열기 버튼은 Figma chat_bubble 아이콘을 쓴다", () => {
    // Given: 참여자 카드
    renderCard();

    // When: Figma 아이콘 컴포넌트를 따로 렌더링해 모양을 얻으면
    const { container } = render(<ChatBubbleIcon />);

    // Then: 채팅 버튼 안 아이콘 모양이 같다
    expect(pathOf(screen.getByRole("button", { name: "채팅 열기" }))).toBe(
      pathOf(container.firstElementChild)
    );
  });

  it("채팅 열기 버튼 안 아이콘은 Figma 레이어대로 20px(h-5 w-5)이다", () => {
    // Given: 참여자 카드
    // When: 렌더링하면
    renderCard();

    // Then: 버튼(44px) 안 아이콘 박스는 Figma Button/Solid md iconOnly와 같은 20px이다 (기본 24px 아님)
    const icon = screen
      .getByRole("button", { name: "채팅 열기" })
      .querySelector("svg")?.parentElement;
    expect(icon).toHaveClass("h-5", "w-5");
    expect(icon).not.toHaveClass("h-6", "w-6");
  });
});

describe("SessionParticipantListCard — 평균 달성률 줄", () => {
  it("왼쪽에 '참여자 평균 목표 달성률'과 값, 오른쪽에 '총 N명'을 보여준다", () => {
    // Given: 평균 42%, 총 6명인 카드
    // When: 렌더링하면
    renderCard();

    // Then: 값은 보조 글자색(초록 아님)이고, 총 인원은 평균 달성률 뒤(오른쪽)에 있다.
    // 라벨은 모바일에서 disabled 색, 태블릿부터 muted 색이다
    const label = screen.getByText("참여자 평균 목표 달성률");
    const value = screen.getByText("42%");
    const total = screen.getByText("총 6명");
    expect(label).toHaveClass("text-text-disabled", "md:text-text-muted");
    expect(value).toHaveClass("text-text-secondary", "font-semibold");
    expect(value).not.toHaveClass("text-green-600");
    expect(total).toHaveClass("text-text-disabled");
    expect(label.compareDocumentPosition(total) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("글자는 모바일 11px이고, 태블릿부터 라벨·값 13px, 총 인원 12px이다", () => {
    // Given: 평균 42%, 총 6명인 카드
    // When: 렌더링하면
    renderCard();

    // Then: 라벨·값·총 인원이 크기별 글자 크기를 갖는다
    expect(screen.getByText("참여자 평균 목표 달성률").parentElement).toHaveClass(
      "text-[11px]",
      "md:text-[13px]"
    );
    expect(screen.getByText("총 6명")).toHaveClass("text-[11px]", "md:text-xs");
  });
});

describe("SessionParticipantListCard — 참여자 카드", () => {
  it("항목끼리는 12px(gap-sm), 항목 안 카드는 테두리 없는 surface-strong에 안쪽 모바일 12px·태블릿부터 16px, 반경 12px이다", () => {
    // Given: 참여자 2명
    // When: 렌더링하면
    const { list } = renderCard();

    // Then: 목록은 gap-sm, 항목(li)은 카드를 담는 묶음이고, 첫 자식이 Figma Select 카드 스타일이다
    const [group] = Array.from(list.children);
    const item = group.firstElementChild;
    expect(list).toHaveClass("gap-sm");
    expect(group).not.toHaveClass("bg-surface-strong");
    expect(item).toHaveClass(
      "bg-surface-strong",
      "rounded-lg",
      "p-sm",
      "gap-sm",
      "md:p-md",
      "md:gap-md"
    );
    expect(item).not.toHaveClass("border");
  });

  it("닉네임, 목표, 투두 달성률을 Figma 글자 스타일로 보여준다", () => {
    // Given: 목표가 있는 참여자 2명
    // When: 렌더링하면
    renderCard();

    // Then: 닉네임은 기본색, 목표는 흐린 글자색, '투두 달성률' 라벨과 값이 보인다
    expect(screen.getByText("각 잡은 호랑이")).toHaveClass("text-text-primary", "font-semibold");
    expect(screen.getByText("집중률 100% 달성하기")).toHaveClass("text-text-muted");
    expect(screen.getAllByText("투두 달성률")).toHaveLength(2);
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.queryByText("달성률")).not.toBeInTheDocument();
  });

  it("닉네임, 목표, 칩은 Figma line-height 1.4를 쓴다", () => {
    // Given: 참여자 2명
    // When: 렌더링하면
    renderCard();

    // Then: text-base/text-xs 기본 line-height(24px/16px)가 아니라 1.4로 덮어써서 줄 높이가 시안(22px/17px/25px)과 같다
    expect(screen.getByText("각 잡은 호랑이")).toHaveClass("leading-[1.4]");
    expect(screen.getByText("집중률 100% 달성하기")).toHaveClass("leading-[1.4]");
    expect(screen.getByText("90%")).toHaveClass("leading-[1.4]");
  });

  it("집중 중이면 하늘색 점과 '집중 중', 쉬는 중이면 회색 점과 '자리비움'을 보여준다", () => {
    // Given: 집중 중 1명, 쉬는 중 1명
    // When: 렌더링하면
    renderCard();

    // Then: 상태 글자는 semibold이고, 점 색은 글자색과 별개로 상태를 따른다
    const focusing = screen.getByText("집중 중");
    const resting = screen.getByText("자리비움");
    expect(focusing).toHaveClass("font-semibold", "text-text-status-positive-default");
    expect(focusing.querySelector("svg")).toHaveClass("text-text-status-positive-default");
    expect(resting).toHaveClass("font-semibold", "text-text-tertiary");
    expect(resting.querySelector("svg")).toHaveClass("text-text-disabled");
    expect(screen.queryByText("자리 비움")).not.toBeInTheDocument();
  });

  it("투두 달성률 앞 구분선은 글자 '|'가 아니라 1×18px 선이다", () => {
    // Given: 참여자 2명
    // When: 렌더링하면
    renderCard();

    // Then: '|' 글자는 없고 구분선 요소가 폭 1px, 높이 18px이다
    expect(screen.queryByText("|")).not.toBeInTheDocument();
    const dividers = document.querySelectorAll("[data-testid='status-divider']");
    expect(dividers).toHaveLength(2);
    expect(dividers[0]).toHaveClass("w-px", "h-[18px]", "bg-border-default");
  });

  it("펼침 버튼은 항목 오른쪽 위 16px에 겹쳐 놓여 정보 영역 폭을 줄이지 않는다", () => {
    // Given: 참여자 2명
    // When: 렌더링하면
    renderCard();

    // Then: Figma Dropdown Icon처럼 24×24로 항목 카드의 top/right 16px에 absolute이고, 정보 영역은 남은 폭을 모두 쓴다
    const button = screen.getAllByRole("button", { name: "할 일 펼치기" })[0];
    expect(button).toHaveClass("absolute", "top-md", "right-md", "size-6");
    expect(button.previousElementSibling).toHaveClass("flex-1");
    expect(button.parentElement).toHaveClass("relative");
  });
});

describe("SessionParticipantListCard — 할 일 펼침(드롭다운)", () => {
  /** 첫 참여자(방장)의 할 일을 펼치고, 항목 카드와 펼침 패널을 돌려준다 */
  function expandFirstMember() {
    const { list } = renderCard();
    fireEvent.click(screen.getAllByRole("button", { name: "할 일 펼치기" })[0]);
    const group = list.children[0];
    return { group, item: group.children[0], panel: group.children[1] };
  }

  it("펼치면 할 일 목록과 완료 개수가 보이고 버튼이 '할 일 접기'로 바뀐다", () => {
    // Given: 할 일 2개(1개 완료)인 방장이 있는 카드
    renderCard();
    expect(screen.queryByText("알고리즘 1문제 풀기")).not.toBeInTheDocument();

    // When: 첫 참여자의 '할 일 펼치기' 버튼을 누르면
    fireEvent.click(screen.getAllByRole("button", { name: "할 일 펼치기" })[0]);

    // Then: 할 일 목록과 '1/2'가 보이고, 버튼은 '할 일 접기'로 바뀐다
    expect(screen.getByText("알고리즘 1문제 풀기")).toBeInTheDocument();
    expect(screen.getByText("코드 리팩터링")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "할 일 접기" })).toBeInTheDocument();
  });

  it("펼침 패널은 항목 카드 안이 아니라 8px(gap-xs) 아래의 별도 카드이다", () => {
    // Given/When: 방장의 할 일을 펼치면
    const { group, item, panel } = expandFirstMember();

    // Then: li 묶음이 gap-xs 세로 flex이고, 패널은 항목 카드의 형제이며 구분선(border-t) 없이 Figma todo 카드 스타일이다
    expect(group).toHaveClass("flex", "flex-col", "gap-xs");
    expect(item).not.toContainElement(panel as HTMLElement);
    expect(panel).toHaveClass("bg-surface-strong", "p-lg", "gap-md", "rounded-lg");
    expect(panel).not.toHaveClass("border-t");
    expect(panel.querySelector(".border-t")).toBeNull();
  });

  it("패널 제목은 '투두리스트'와 연한 초록 개수이다", () => {
    // Given/When: 방장의 할 일을 펼치면
    expandFirstMember();

    // Then: 제목은 16px semibold(line-height 1.4)이고 '투두리스트'는 기본색, 개수는 brand-subtler이다
    const label = screen.getByText("투두리스트");
    expect(label).toHaveClass("text-text-primary");
    expect(label.parentElement).toHaveClass(
      "text-base",
      "font-semibold",
      "leading-[1.4]",
      "gap-2xs"
    );
    expect(screen.getByText("1/2")).toHaveClass("text-text-brand-subtler");
    expect(screen.queryByText(/To do list/)).not.toBeInTheDocument();
  });

  it("할 일 줄은 안쪽 4px·간격 12px, 글자 15px이고 완료 줄은 흐린 취소선이다", () => {
    // Given/When: 방장의 할 일을 펼치면
    expandFirstMember();

    // Then: 미완료는 secondary, 완료는 muted + line-through이고 줄 모양은 Figma Todo Option이다
    const done = screen.getByText("알고리즘 1문제 풀기");
    const todo = screen.getByText("코드 리팩터링");
    expect(done).toHaveClass("text-[15px]", "leading-[1.4]", "text-text-muted", "line-through");
    expect(todo).toHaveClass("text-[15px]", "leading-[1.4]", "text-text-secondary");
    expect(todo).not.toHaveClass("line-through");
    expect(todo.parentElement).toHaveClass("p-2xs", "gap-sm", "flex", "items-center");
    expect(todo.parentElement?.parentElement).toHaveClass("gap-xs");
  });

  it("체크박스는 완료면 초록 테두리·연한 초록 배경, 미완료면 흰색 32% 테두리이다", () => {
    // Given/When: 방장의 할 일을 펼치면
    expandFirstMember();

    // Then: Figma CheckBox(sm) 값이다
    const doneBox = screen.getByText("알고리즘 1문제 풀기").previousElementSibling;
    const todoBox = screen.getByText("코드 리팩터링").previousElementSibling;
    expect(doneBox).toHaveClass(
      "size-5",
      "rounded-xs",
      "border",
      "border-border-primary-default",
      "bg-surface-primary-alpha-subtle"
    );
    expect(doneBox?.querySelector("svg")).not.toBeNull();
    expect(todoBox).toHaveClass("size-5", "rounded-xs", "border", "border-border-strong");
    expect(todoBox?.querySelector("svg")).toBeNull();
  });
});

describe("SessionParticipantListCard — 집중 시간 칩(값이 있을 때만)", () => {
  /** 두 참여자(집중 중 / 자리비움) 모두에 같은 누적 집중 시간을 넣는다 */
  const membersWithFocus = (totalFocusSeconds?: number): InProgressMember[] =>
    MEMBERS.map((member) => ({ ...member, totalFocusSeconds }));
  const TIME = /^\d{2}:\d{2}:\d{2}$/;

  it("집중 시간 값이 없으면 칩을 보여주지 않는다", () => {
    // Given: 집중 시간 필드가 없는 참여자(현재 백엔드 응답)
    // When: 렌더링하면
    renderCard();

    // Then: 시:분:초 칩이 없다
    expect(screen.queryByText(TIME)).not.toBeInTheDocument();
  });

  it("값이 있으면 시:분:초 칩을 상태 글자 뒤, 구분선 앞에 보여준다", () => {
    // Given: 누적 집중 시간 2601초(00:43:21)가 있는 참여자
    // When: 렌더링하면
    renderCard({ members: membersWithFocus(2601) });

    // Then: 참여자마다 '00:43:21' 칩이 있고, 상태 글자와 같은 묶음(간격 8px)에서 구분선보다 앞이다
    const chips = screen.getAllByText("00:43:21");
    expect(chips).toHaveLength(2);
    const status = screen.getByText("집중 중");
    expect(chips[0].parentElement).toHaveClass("gap-xs");
    expect(chips[0].parentElement).toContainElement(status);
    const divider = document.querySelector("[data-testid='status-divider']") as Element;
    expect(
      status.compareDocumentPosition(chips[0]) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      chips[0].compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("집중 중이면 하늘색 칩, 자리비움이면 회색 칩이다", () => {
    // Given/When: 집중 중 1명, 자리비움 1명에게 집중 시간이 있으면
    renderCard({ members: membersWithFocus(2601) });

    // Then: Figma Select 규칙 — running은 cyan, paused는 gray 칩이다
    const [focusingChip, restingChip] = screen.getAllByText("00:43:21");
    expect(focusingChip).toHaveClass(
      "bg-[rgba(0,184,219,0.16)]",
      "text-text-status-positive-default"
    );
    expect(restingChip).toHaveClass("bg-alpha-white-8", "text-text-secondary");
    expect(focusingChip).toHaveClass("leading-[1.4]");
  });

  it("0초도 값이 있으면 '00:00:00' 칩을 보여준다", () => {
    // Given/When: 누적 집중 시간이 0초이면
    renderCard({ members: membersWithFocus(0) });

    // Then: 값이 없는 것과 구별해서 칩을 보여준다
    expect(screen.getAllByText("00:00:00")).toHaveLength(2);
  });
});

/** 참여자 n명을 만든다 */
function makeMembers(count: number): InProgressMember[] {
  return Array.from({ length: count }, (_, index) => ({
    memberId: index + 1,
    nickname: `참여자 ${index + 1}`,
    role: index === 0 ? "HOST" : "PARTICIPANT",
    achievementRate: 50,
    status: "FOCUSED",
    task: { taskId: index + 1, goal: `목표 ${index + 1}`, todos: [] },
  }));
}

describe("SessionParticipantListCard — 모바일 더보기/숨기기", () => {
  const itemOf = (nickname: string) => screen.getByText(nickname).closest("li") as HTMLElement;

  it("모바일에서는 처음 2명만 보이고 나머지는 숨겨 두며, 태블릿부터는 모두 보인다", () => {
    // Given: 참여자 4명
    // When: 렌더링하면
    renderCard({ members: makeMembers(4), participantCount: 4 });

    // Then: 3번째부터 max-md:hidden이라 모바일에서만 숨겨진다 (md 이상 목록은 그대로 스크롤)
    expect(itemOf("참여자 1")).not.toHaveClass("max-md:hidden");
    expect(itemOf("참여자 2")).not.toHaveClass("max-md:hidden");
    expect(itemOf("참여자 3")).toHaveClass("max-md:hidden");
    expect(itemOf("참여자 4")).toHaveClass("max-md:hidden");
  });

  it("숨긴 참여자가 있으면 '더보기' 버튼과 아래쪽 그라데이션이 모바일에서만 보인다", () => {
    // Given: 참여자 4명
    // When: 렌더링하면
    renderCard({ members: makeMembers(4), participantCount: 4 });

    // Then: 버튼과 그라데이션 모두 md:hidden이고, 버튼은 아직 펼치지 않은 상태이다
    const button = screen.getByRole("button", { name: "더보기" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button.parentElement).toHaveClass("md:hidden");
    expect(screen.getByTestId("participants-more-gradient")).toHaveClass("md:hidden");
  });

  it("'더보기'를 누르면 모두 보이고 버튼이 '숨기기'로 바뀌며 그라데이션이 사라진다", () => {
    // Given: 참여자 4명을 렌더링하고
    renderCard({ members: makeMembers(4), participantCount: 4 });

    // When: 더보기를 누르면
    fireEvent.click(screen.getByRole("button", { name: "더보기" }));

    // Then: 숨김이 풀리고, 버튼은 숨기기(펼침 상태)이고, 그라데이션이 없다
    expect(itemOf("참여자 3")).not.toHaveClass("max-md:hidden");
    expect(itemOf("참여자 4")).not.toHaveClass("max-md:hidden");
    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "숨기기" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByTestId("participants-more-gradient")).not.toBeInTheDocument();
  });

  it("'숨기기'를 누르면 다시 처음 2명만 보인다", () => {
    // Given: 펼쳐 둔 참여자 4명
    renderCard({ members: makeMembers(4), participantCount: 4 });
    fireEvent.click(screen.getByRole("button", { name: "더보기" }));

    // When: 숨기기를 누르면
    fireEvent.click(screen.getByRole("button", { name: "숨기기" }));

    // Then: 3번째부터 다시 숨고 버튼과 그라데이션이 돌아온다
    expect(itemOf("참여자 3")).toHaveClass("max-md:hidden");
    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
    expect(screen.getByTestId("participants-more-gradient")).toBeInTheDocument();
  });

  it("참여자가 2명 이하이면 숨길 것이 없어 버튼도 그라데이션도 없다", () => {
    // Given/When: 참여자 2명으로 렌더링하면
    renderCard();

    // Then: 더보기/숨기기 버튼, 모바일 그라데이션, 숨김 항목이 모두 없다
    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "숨기기" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("participants-more-gradient")).not.toBeInTheDocument();
    expect(itemOf("각 잡은 호랑이")).not.toHaveClass("max-md:hidden");
  });

  it("버튼은 Figma처럼 32px 윤곽선 버튼이고 그라데이션 위에 놓인다", () => {
    // Given: 참여자 4명
    // When: 렌더링하면
    renderCard({ members: makeMembers(4), participantCount: 4 });

    // Then: 작은 윤곽선 버튼(h-8)이 위치 지정된(relative) 가운데 정렬 칸에 있어 그라데이션(absolute)에 가려지지 않는다
    const button = screen.getByRole("button", { name: "더보기" });
    expect(button).toHaveClass("h-8", "border-border-default");
    expect(button.parentElement).toHaveClass("relative", "flex", "justify-center");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("모바일 그라데이션은 Figma처럼 목록 아래 128px, 위쪽으로 번지고 클릭을 가로채지 않는다", () => {
    // Given/When: 참여자 4명으로 렌더링하면
    renderCard({ members: makeMembers(4), participantCount: 4 });

    // Then: 높이 128px, 아래쪽이 surface-default인 위쪽 방향 그라데이션이다
    expect(screen.getByTestId("participants-more-gradient")).toHaveClass(
      "h-32",
      "bottom-0",
      "bg-linear-to-t",
      "from-surface-default",
      "to-transparent",
      "pointer-events-none",
      "absolute"
    );
  });
});

describe("SessionParticipantListCard — 아바타 크기", () => {
  /** 첫 항목의 아바타 원 */
  const firstAvatar = () =>
    screen.getAllByRole("listitem")[0].querySelector(".rounded-full") as HTMLElement;

  it("모바일에서는 40px(large) 아바타, 태블릿 이상에서는 48px(xlarge) 아바타를 쓴다", () => {
    // Given: 화면 크기가 모바일인 상태
    mockUseViewportLayout.mockReturnValue({ layout: "mobile", isResolved: true });

    // When: 렌더링하면
    const { unmount } = render(<SessionParticipantListCard {...BASE_PROPS} members={MEMBERS} />);

    // Then: Figma Avatar size=lg(40px)이다
    expect(firstAvatar()).toHaveClass("size-10");
    unmount();

    // When: 태블릿과 데스크톱에서 렌더링하면
    for (const layout of ["tablet", "desktop"]) {
      mockUseViewportLayout.mockReturnValue({ layout, isResolved: true });
      const view = render(<SessionParticipantListCard {...BASE_PROPS} members={MEMBERS} />);

      // Then: Figma Avatar size=xl(48px)이다
      expect(firstAvatar()).toHaveClass("size-12");
      view.unmount();
    }
  });
});

describe("SessionParticipantListCard — 하단 그라데이션", () => {
  /** 목록(ul)의 스크롤 크기를 jsdom에 심는다 (jsdom은 레이아웃이 없어 항상 0) */
  function mockListScroll({
    scrollHeight,
    clientHeight,
  }: {
    scrollHeight: number;
    clientHeight: number;
  }) {
    jest.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(scrollHeight);
    jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(clientHeight);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("목록이 넘치지 않으면 그라데이션이 보이지 않는다", () => {
    // Given: 내용이 영역보다 작은 목록 (300 < 465)
    mockListScroll({ scrollHeight: 300, clientHeight: 465 });

    // When: 렌더링하면
    renderCard();

    // Then: 그라데이션은 투명이다
    expect(screen.getByTestId("participants-bottom-gradient")).toHaveClass("opacity-0");
  });

  it("아래에 더 볼 내용이 있으면 그라데이션이 보인다", () => {
    // Given: 내용이 영역보다 긴 목록 (800 > 465), 맨 위에 있음
    mockListScroll({ scrollHeight: 800, clientHeight: 465 });

    // When: 렌더링하면
    renderCard();

    // Then: 그라데이션이 보인다
    expect(screen.getByTestId("participants-bottom-gradient")).toHaveClass("opacity-100");
  });

  it("맨 아래까지 스크롤하면 그라데이션이 사라지고, 다시 올리면 나타난다", () => {
    // Given: 넘치는 목록
    mockListScroll({ scrollHeight: 800, clientHeight: 465 });
    const { list } = renderCard();
    const gradient = screen.getByTestId("participants-bottom-gradient");

    // When: 끝까지 스크롤하면 (800 - 465 = 335)
    list.scrollTop = 335;
    fireEvent.scroll(list);

    // Then: 사라진다
    expect(gradient).toHaveClass("opacity-0");

    // When: 다시 위로 올리면
    list.scrollTop = 100;
    fireEvent.scroll(list);

    // Then: 다시 나타난다
    expect(gradient).toHaveClass("opacity-100");
  });

  it("참여자가 늘어 목록이 넘치게 되면 그라데이션이 나타난다", () => {
    // Given: 넘치지 않는 목록
    mockListScroll({ scrollHeight: 300, clientHeight: 465 });
    const { rerender } = render(
      <SessionParticipantListCard {...BASE_PROPS} members={MEMBERS.slice(0, 1)} />
    );
    expect(screen.getByTestId("participants-bottom-gradient")).toHaveClass("opacity-0");

    // When: 참여자가 늘어 내용이 길어지면
    mockListScroll({ scrollHeight: 800, clientHeight: 465 });
    rerender(<SessionParticipantListCard {...BASE_PROPS} members={MEMBERS} />);

    // Then: 그라데이션이 나타난다
    expect(screen.getByTestId("participants-bottom-gradient")).toHaveClass("opacity-100");
  });

  it("Figma처럼 목록 아래 128px, surface-default에서 투명으로 번지고 클릭을 가로채지 않는다", () => {
    // Given: 넘치는 목록
    mockListScroll({ scrollHeight: 800, clientHeight: 465 });

    // When: 렌더링하면
    const { list } = renderCard();
    const gradient = screen.getByTestId("participants-bottom-gradient");

    // Then: 높이 128px, 아래쪽이 surface-default인 위쪽 방향 그라데이션이고 pointer-events가 없다
    expect(gradient).toHaveClass(
      "h-32",
      "bottom-0",
      "bg-linear-to-t",
      "from-surface-default",
      "to-transparent",
      "pointer-events-none"
    );
    // 스크롤 영역 안에 있으면 내용과 함께 스크롤되어 사라지므로 형제여야 한다
    expect(list).not.toContainElement(gradient);
    expect(list.parentElement).toContainElement(gradient);
  });
});
