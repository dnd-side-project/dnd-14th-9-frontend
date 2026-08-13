import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionJoinModal } from "@/features/lobby/components/SessionJoinModal";
import { useJoinSession } from "@/features/session/hooks/useSessionHooks";

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useJoinSession: jest.fn(),
}));

const mockedUseJoinSession = jest.mocked(useJoinSession);
const mockMutateAsync = jest.fn();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockMutateAsync.mockReturnValue(new Promise(() => undefined));
  mockedUseJoinSession.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useJoinSession>);
});

describe("SessionJoinModal", () => {
  it("공백만 입력한 투두를 빈 값으로 유지하고 작성 완료 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    render(<SessionJoinModal sessionId="123" onClose={jest.fn()} />);

    await user.type(await screen.findByPlaceholderText("목표를 입력하세요"), "테스트 목표");
    const todoInput = screen.getByPlaceholderText("할 일을 입력하세요");
    const submitButton = screen.getByRole("button", { name: "작성 완료" });

    await user.type(todoInput, "   ");

    expect(todoInput).toHaveValue("");
    expect(screen.getByText("0/50")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("Zod가 정규화한 목표와 투두로 참여 요청을 보낸다", async () => {
    const user = userEvent.setup();
    render(<SessionJoinModal sessionId="123" onClose={jest.fn()} />);

    await user.type(await screen.findByPlaceholderText("목표를 입력하세요"), "  테스트 목표  ");
    await user.type(screen.getByPlaceholderText("할 일을 입력하세요"), "  테스트 투두  ");

    const submitButton = screen.getByRole("button", { name: "작성 완료" });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        sessionRoomId: "123",
        body: { goal: "테스트 목표", todos: ["테스트 투두"] },
      });
    });
  });
});
