import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoalAndTodoCard } from "@/features/lobby/components/GoalAndTodoCard";

jest.mock("@/features/task/hooks/useTaskHooks", () => {
  const noop = () => ({ mutateAsync: jest.fn() });
  return {
    useUpdateGoal: noop,
    useUpdateTodo: noop,
    useDeleteTodo: noop,
    useCreateTodo: noop,
  };
});

jest.mock("@/hooks/useUnsavedChangesWarning", () => ({
  useUnsavedChangesWarning: jest.fn(),
}));

function renderGoalAndTodoCard() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <GoalAndTodoCard
        sessionId="123"
        task={{
          taskId: 1,
          goal: "기존 목표",
          todos: [{ subtaskId: 10, content: "기존 할 일" }],
        }}
      />
    </QueryClientProvider>
  );
}

describe("GoalAndTodoCard", () => {
  it("목표나 투두를 빈 값(공백 포함)으로 수정하면 에러 메시지를 표시하고 저장하기 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    renderGoalAndTodoCard();

    await user.click(screen.getByRole("button", { name: "수정하기" }));

    const goalInput = screen.getByPlaceholderText("목표를 입력하세요");
    const todoInput = screen.getByPlaceholderText("할 일을 입력하세요");
    const saveButton = screen.getByRole("button", { name: "저장하기" });

    expect(saveButton).toBeEnabled();

    // 기존 투두를 지우고 공백만 입력
    await user.clear(todoInput);
    await user.type(todoInput, "   ");

    expect(todoInput).toHaveValue("");
    expect(screen.getByText("할 일을 입력해주세요")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // 투두를 다시 채우고 목표를 비움
    await user.type(todoInput, "수정된 할 일");
    expect(screen.queryByText("할 일을 입력해주세요")).not.toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    await user.clear(goalInput);
    expect(screen.getByText("목표를 입력해주세요")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // 목표 복구 후 새 할 일 추가 시 빈 칸이면 비활성화, 삭제 시 다시 활성화
    await user.type(goalInput, "수정된 목표");
    await user.click(screen.getByRole("button", { name: "추가하기" }));

    expect(screen.getByText("할 일을 입력해주세요")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "할 일 2 삭제" }));
    expect(saveButton).toBeEnabled();
  });
});
