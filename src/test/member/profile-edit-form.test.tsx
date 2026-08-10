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

describe("ProfileEditForm interest categories", () => {
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
});
