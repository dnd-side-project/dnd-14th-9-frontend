import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileEditForm } from "@/features/member/components/Profile/ProfileEditForm";
import { useMeForEdit, useUpdateMe } from "@/features/member/hooks/useMemberHooks";
import { toast } from "@/lib/toast";

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMeForEdit: jest.fn(),
  useUpdateMe: jest.fn(),
}));

jest.mock("@/lib/toast", () => ({
  toast: {
    subscribe: jest.fn(),
    showToast: jest.fn(),
    hideToast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockedUseMeForEdit = jest.mocked(useMeForEdit);
const mockedUseUpdateMe = jest.mocked(useUpdateMe);
const mockedToast = jest.mocked(toast);

const MIN_CATEGORY_MESSAGE = "관심 카테고리는 최소 1개 이상 선택해야 합니다.";

describe("ProfileEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseMeForEdit.mockReturnValue({
      data: {
        isSuccess: true,
        code: "COMMON200",
        message: "성공적으로 요청을 처리했습니다.",
        result: {
          id: 1,
          nickname: "테스터",
          profileImageUrl: "",
          email: "tester@example.com",
          bio: "소개",
          firstInterestCategory: "DEVELOPMENT",
          secondInterestCategory: "DESIGN",
          thirdInterestCategory: "PLANNING_PM",
        },
      },
    } as unknown as ReturnType<typeof useMeForEdit>);
    mockedUseUpdateMe.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateMe>);
  });

  it("3개 선택 후 다른 카테고리를 누르면 안내하고 선택을 유지한다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const development = screen.getByRole("button", { name: "개발" });
    const fourthCategory = screen.getByRole("button", { name: "커리어 · 자기계발" });

    await waitFor(() => expect(development).toHaveAttribute("aria-pressed", "true"));
    await user.click(fourthCategory);

    expect(mockedToast.info).toHaveBeenCalledWith("관심 카테고리는 최대 3개까지 선택 가능합니다.");
    expect(mockedToast.info).toHaveBeenCalledTimes(1);
    expect(fourthCategory).toHaveAttribute("aria-pressed", "false");
  });

  it("기존 선택을 해제하면 다른 카테고리를 선택할 수 있다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const development = screen.getByRole("button", { name: "개발" });
    const fourthCategory = screen.getByRole("button", { name: "커리어 · 자기계발" });

    await waitFor(() => expect(development).toHaveAttribute("aria-pressed", "true"));
    await user.click(development);
    await user.click(fourthCategory);

    expect(fourthCategory).toHaveAttribute("aria-pressed", "true");
    expect(mockedToast.info).not.toHaveBeenCalled();
  });

  it("모든 카테고리를 해제하면 안내 문구를 보여주고 저장하기 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const development = screen.getByRole("button", { name: "개발" });
    await waitFor(() => expect(development).toHaveAttribute("aria-pressed", "true"));
    await user.click(development);
    await user.click(screen.getByRole("button", { name: "디자인" }));
    await user.click(screen.getByRole("button", { name: "기획 · PM" }));

    expect(await screen.findByText(MIN_CATEGORY_MESSAGE)).toBeInTheDocument();
    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("카테고리를 1개 이상 남긴 채 변경하면 저장하기 버튼이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const development = screen.getByRole("button", { name: "개발" });
    await waitFor(() => expect(development).toHaveAttribute("aria-pressed", "true"));
    await user.click(development);

    await waitFor(() => {
      screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
    expect(screen.queryByText(MIN_CATEGORY_MESSAGE)).toBeNull();
  });

  it("모두 해제한 뒤 다시 선택하면 안내가 사라지고 저장하기 버튼이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const development = screen.getByRole("button", { name: "개발" });
    await waitFor(() => expect(development).toHaveAttribute("aria-pressed", "true"));
    await user.click(development);
    await user.click(screen.getByRole("button", { name: "디자인" }));
    await user.click(screen.getByRole("button", { name: "기획 · PM" }));
    expect(await screen.findByText(MIN_CATEGORY_MESSAGE)).toBeInTheDocument();

    await user.click(development);

    await waitFor(() => expect(screen.queryByText(MIN_CATEGORY_MESSAGE)).toBeNull());
    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it("카테고리가 0개로 저장된 사용자는 닉네임만 바꿔도 카테고리를 고르기 전에는 저장할 수 없다", async () => {
    mockedUseMeForEdit.mockReturnValue({
      data: {
        result: {
          id: 1,
          nickname: "테스터",
          profileImageUrl: "",
          email: "tester@example.com",
          bio: "소개",
          firstInterestCategory: null,
          secondInterestCategory: null,
          thirdInterestCategory: null,
        },
      },
    } as unknown as ReturnType<typeof useMeForEdit>);
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const nickname = screen.getByLabelText("닉네임");
    await user.type(nickname, "a");
    await waitFor(() => expect(nickname).toHaveValue("테스터a"));

    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeDisabled();
    });

    await user.click(screen.getByRole("button", { name: "개발" }));

    await waitFor(() => {
      screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });

  it("닉네임을 비우면 안내 문구를 보여주고 저장하기 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const nickname = screen.getByLabelText("닉네임");
    await waitFor(() => expect(nickname).toHaveValue("테스터"));
    await user.clear(nickname);

    expect(await screen.findByText("닉네임을 입력해주세요")).toBeInTheDocument();
    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("닉네임에 특수문자가 있으면 안내 문구를 보여주고 저장하기 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const nickname = screen.getByLabelText("닉네임");
    await waitFor(() => expect(nickname).toHaveValue("테스터"));
    await user.type(nickname, "!");

    expect(
      await screen.findByText("특수문자와 공백을 제외한 2~10자리여야 합니다.")
    ).toBeInTheDocument();
    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("취소를 누르면 입력을 초기값으로 되돌리고 저장하기 버튼을 비활성화한다", async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm />);

    const nickname = screen.getByLabelText("닉네임");
    await waitFor(() => expect(nickname).toHaveValue("테스터"));
    await user.type(nickname, "a");
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "저장하기" })[0]).toBeEnabled()
    );

    await user.click(screen.getAllByRole("button", { name: "취소" })[0]);

    await waitFor(() => expect(nickname).toHaveValue("테스터"));
    screen.getAllByRole("button", { name: "저장하기" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
