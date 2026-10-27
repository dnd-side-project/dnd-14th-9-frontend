import { type ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { SessionGoalAndTodoCard } from "@/features/session/components/SessionGoalAndTodoCard/SessionGoalAndTodoCard";
import type { InProgressTodoItem } from "@/features/session/types";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";

const mockMutate = jest.fn();

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useToggleSubtaskCompletion: () => ({ mutate: mockMutate }),
}));

jest.mock("@/lib/toast", () => ({ toast: { error: jest.fn() } }));

const TODOS: InProgressTodoItem[] = [
  { subtaskId: 1, content: "노션에 할 일 정리하기", isCompleted: true },
  { subtaskId: 2, content: "아티클 읽기", isCompleted: false },
  { subtaskId: 3, content: "자료 조사하기", isCompleted: false },
];

function renderCard(props: Partial<ComponentProps<typeof SessionGoalAndTodoCard>> = {}) {
  render(
    <SessionGoalAndTodoCard
      goal="주요 페이지 2개 리팩토링 완료하기"
      todos={TODOS}
      achievementRate={40}
      {...props}
    />
  );
  // 목표·투두를 담은 테두리 카드 (헤더는 이 카드 밖에 있다)
  const card = screen.getByText("목표").closest(".border") as HTMLElement;
  return { card };
}

/** 할 일 한 줄(li)을 내용으로 찾는다 */
function optionOf(content: string) {
  return screen.getByText(content).closest("li") as HTMLElement;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SessionGoalAndTodoCard — 헤더와 카드 구조", () => {
  it("헤더를 테두리 카드 밖에 두고 Figma 문구와 색으로 보여준다", () => {
    // Given: 나의 목표 카드
    // When: 렌더링하면
    const { card } = renderCard();

    // Then: 제목·부제는 카드 밖이고, 둘의 부모와 카드 사이가 gap-xl이다
    const heading = screen.getByRole("heading", { name: "나의 목표" });
    const subtitle = screen.getByText("세션을 진행하면서 투두리스트를 체크해 보세요");
    expect(card).not.toContainElement(heading);
    expect(card.parentElement).toHaveClass("gap-xl");
    // text-2xl은 자체 줄 높이(32px)를 가져 부모의 leading을 이기므로 제목에 직접 1.4를 준다 (Figma 34px)
    expect(heading).toHaveClass("text-text-secondary", "text-2xl", "font-bold", "leading-[1.4]");
    expect(subtitle).toHaveClass("text-text-disabled", "text-[15px]");
  });

  it("카드는 surface-default 배경에 24px 안쪽 여백, 반경 12px, 블록 간격 32px이다", () => {
    // Given/When: 렌더링하면
    const { card } = renderCard();

    // Then: Figma Goals Section 카드 스타일이다
    expect(card).toHaveClass(
      "bg-surface-default",
      "border-border-subtle",
      "p-xl",
      "gap-2xl",
      "rounded-lg",
      "shadow-[0_0_40px_rgba(0,0,0,0.3)]"
    );
  });
});

describe("SessionGoalAndTodoCard — 크기는 상위가 정한다", () => {
  it("카드 자체는 높이와 폭 비율 클래스를 갖지 않고, 상위가 넘긴 className만 루트에 붙는다", () => {
    // Given/When: 상위가 폭 비율을 className으로 넘겨 렌더링하면
    const { card } = renderCard({ className: "xl:flex-6" });
    const root = card.parentElement as HTMLElement;

    // Then: 루트에는 넘긴 클래스만 있고, 고정 높이(h-*, xl:h-*)나 자체 폭 비율은 없다
    expect(root).toHaveClass("xl:flex-6");
    expect(root.className).not.toMatch(/(^|\s)(xl:)?h-/);
  });

  it("className을 안 넘기면 폭 비율 클래스도 없다", () => {
    // Given/When: className 없이 렌더링하면
    const { card } = renderCard();

    // Then: 폭 비율(xl:flex-N)은 상위 몫이라 카드에는 없다
    expect((card.parentElement as HTMLElement).className).not.toMatch(/xl:flex-\d/);
  });
});

describe("SessionGoalAndTodoCard — 목표", () => {
  it("라벨은 16px 세미볼드, 목표 칸은 높이 56px에 안쪽 여백 16px과 default 테두리이다", () => {
    // Given/When: 렌더링하면
    renderCard();

    // Then: Figma TextInput 스타일이다
    expect(screen.getByText("목표")).toHaveClass(
      "text-text-secondary",
      "text-base",
      "font-semibold"
    );
    expect(screen.getByText("주요 페이지 2개 리팩토링 완료하기")).toHaveClass(
      "bg-surface-strong",
      "border-border-default",
      "p-md",
      "h-14",
      "rounded-sm",
      "text-text-primary",
      "text-base"
    );
  });
});

describe("SessionGoalAndTodoCard — 투두리스트 제목과 달성률", () => {
  it("완료 수는 연한 초록, 전체 수는 muted로 보여준다", () => {
    // Given: 3개 중 1개 완료
    // When: 렌더링하면
    renderCard();

    // Then: 제목 줄은 16px 세미볼드이고, '투두리스트'는 기본 글자색, 완료 수와 '/전체'는 색이 다르다
    const title = screen.getByText("투두리스트");
    expect(title).toHaveClass("text-text-primary");
    expect(title.parentElement).toHaveClass("text-base", "font-semibold");
    expect(screen.getByText("1")).toHaveClass("text-text-brand-subtler");
    expect(screen.getByText("/3")).toHaveClass("text-text-muted");
  });

  it("목표 달성률은 제목 줄 오른쪽에 '나의 목표 달성률 값'으로 보이고, 제목 옆 괄호에는 없다", () => {
    // Given: 달성률 40%
    // When: 렌더링하면
    renderCard();

    // Then: 라벨은 muted, 값은 브랜드 색 세미볼드이고 둘은 같은 줄이다
    const label = screen.getByText("나의 목표 달성률");
    const value = screen.getByText("40%");
    expect(label).toHaveClass("text-text-muted");
    expect(value).toHaveClass("text-text-brand-default", "font-semibold");
    expect(label.parentElement).toContainElement(value);
    expect(screen.queryByText("(40%)")).not.toBeInTheDocument();
  });
});

describe("SessionGoalAndTodoCard — 할 일 항목", () => {
  it("항목 사이 간격은 12px이고, 항목은 고정 높이 없이 안쪽 여백으로 높이가 정해진다", () => {
    // Given/When: 렌더링하면
    renderCard();

    // Then: 목록은 gap-sm, 항목은 px-md py-sm이고 h-13.5가 없다
    const option = optionOf("아티클 읽기");
    expect(option.parentElement).toHaveClass("gap-sm");
    expect(option).toHaveClass(
      "border-border-subtle",
      "px-md",
      "py-sm",
      "gap-sm",
      "rounded-sm",
      "border"
    );
    expect(option).not.toHaveClass("h-13.5");
  });

  it("완료된 항목은 surface-default, 안 한 항목은 surface-strong 배경이다", () => {
    // Given: 완료 1개, 미완료 2개
    // When: 렌더링하면
    renderCard();

    // Then: Figma Todo Option처럼 완료 항목이 더 어둡다
    expect(optionOf("노션에 할 일 정리하기")).toHaveClass("bg-surface-default");
    expect(optionOf("아티클 읽기")).toHaveClass("bg-surface-strong");
  });

  it("내용은 15px이고, 완료는 muted 취소선, 미완료는 secondary 색이다", () => {
    // Given/When: 렌더링하면
    renderCard();

    // Then: Figma Body/3 스타일이다
    expect(screen.getByText("노션에 할 일 정리하기")).toHaveClass(
      "text-[15px]",
      "text-text-muted",
      "line-through"
    );
    const todoText = screen.getByText("아티클 읽기");
    expect(todoText).toHaveClass("text-[15px]", "text-text-secondary");
    expect(todoText).not.toHaveClass("line-through");
  });

  it("체크박스는 완료는 연한 초록 배경·초록 테두리·초록 체크, 미완료는 strong 테두리뿐이다", () => {
    // Given: 완료 1개, 미완료 2개
    // When: 렌더링하면
    renderCard();

    // Then: Figma CheckBox 첫 번째 디자인(checked=true)으로 통일돼 있다 (솔리드 초록 아님)
    const done = screen.getByRole("button", { name: "노션에 할 일 정리하기 완료 취소" });
    expect(done).toHaveClass(
      "border-border-primary-default",
      "bg-surface-primary-alpha-subtle",
      "size-5",
      "rounded-xs"
    );
    expect(done.querySelector("svg")?.parentElement).toHaveClass("text-text-brand-default");

    const todo = screen.getByRole("button", { name: "아티클 읽기 완료" });
    expect(todo).toHaveClass("border-border-strong", "size-5", "rounded-xs");
    expect(todo).not.toHaveClass("bg-surface-primary-alpha-subtle");
    expect(todo.querySelector("svg")).toBeNull();
  });
});

describe("SessionGoalAndTodoCard — 동작", () => {
  it("체크박스를 누르면 해당 할 일의 완료 상태 변경을 요청한다", () => {
    // Given: 렌더링된 카드
    renderCard();

    // When: 미완료 항목의 체크박스를 누르면
    fireEvent.click(screen.getByRole("button", { name: "아티클 읽기 완료" }));

    // Then: 그 항목의 subtaskId로 mutate가 호출된다
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toEqual({ subtaskId: 2 });
  });

  it("요청이 실패하면 오류 토스트를 띄운다", () => {
    // Given: 실패하는 요청
    mockMutate.mockImplementation((_variables, options) => options.onError(new Error("실패")));
    renderCard();

    // When: 체크박스를 누르면
    fireEvent.click(screen.getByRole("button", { name: "아티클 읽기 완료" }));

    // Then: ApiError가 아니므로 기본 오류 문구를 보여준다
    expect(toast.error).toHaveBeenCalledWith(DEFAULT_API_ERROR_MESSAGE);
  });

  it("할 일이 없으면 안내 문구를 보여준다", () => {
    // Given/When: 할 일이 0개인 카드를 렌더링하면
    renderCard({ todos: [] });

    // Then: 안내 문구가 있고 목록은 없다
    expect(screen.getByText("등록된 할 일이 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
