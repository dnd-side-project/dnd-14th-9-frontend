import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionCreateForm } from "@/features/session/components/SessionCreateForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: () => ({ data: undefined }),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useCreateSession: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateSession: () => ({ mutate: jest.fn(), isPending: false }),
}));

// 2030-10-23은 수요일. 기본 진행 시간(90분)이면 10:00 ~ 11:30.
jest.mock("@/components/DatePicker/DatePicker", () => ({
  DatePicker: ({ onChange }: { onChange: (date: Date) => void }) => (
    <button type="button" onClick={() => onChange(new Date("2030-10-23T10:00:00"))}>
      날짜 선택
    </button>
  ),
}));

describe("SessionCreateForm (생성 모드)", () => {
  it("입력이 없는 초기 상태에서는 제출 버튼이 비활성이다", () => {
    render(<SessionCreateForm />);

    expect(screen.getByRole("button", { name: "세션 만들기" })).toBeDisabled();
  });

  it("값을 입력하면 제출 버튼이 활성화되고, 다시 비우면 비활성으로 돌아간다", async () => {
    const user = userEvent.setup();
    render(<SessionCreateForm />);

    const submit = screen.getByRole("button", { name: "세션 만들기" });
    const title = screen.getByRole("textbox", { name: /세션 이름/ });

    await user.type(title, "아침 모각작");
    expect(submit).toBeEnabled();

    await user.clear(title);
    expect(submit).toBeDisabled();
  });

  it("시작 일시를 고르면 입력창과 일정 요약에 시작~종료 시각이 표시된다", async () => {
    const user = userEvent.setup();
    render(<SessionCreateForm />);

    expect(screen.queryByText(/~/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /MM\.DD 00:00/ }));
    await user.click(screen.getByRole("button", { name: "날짜 선택" }));

    expect(screen.getByText("10.23 (수) · 10:00")).toBeInTheDocument();
    expect(screen.getByText("10.23 (수) 10:00 ~ 11:30")).toBeInTheDocument();
  });
});
