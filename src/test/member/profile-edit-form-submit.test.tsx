import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { memberApi } from "@/features/member/api";
import { ProfileEditForm } from "@/features/member/components/Profile/ProfileEditForm";
import type { MemberProfileMutationResponse } from "@/features/member/types";
import { toast } from "@/lib/toast";

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMe: jest.fn(),
    getMeForEdit: jest.fn(),
    getMyReportStats: jest.fn(),
    deleteMe: jest.fn(),
    updateMe: jest.fn(),
    updateProfileImage: jest.fn(),
    updateNickname: jest.fn(),
    updateInterestCategories: jest.fn(),
  },
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

const mockedMemberApi = jest.mocked(memberApi);
const mockedToast = jest.mocked(toast);

type ProfileResult = MemberProfileMutationResponse["result"];

function createProfileResponse(result: Partial<ProfileResult> = {}): MemberProfileMutationResponse {
  return {
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
      ...result,
    },
  };
}

const saveButtons = () => screen.getAllByRole("button", { name: "저장하기" });

async function renderLoadedForm(result: Partial<ProfileResult> = {}) {
  mockedMemberApi.getMeForEdit.mockResolvedValue(createProfileResponse(result));
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <ProfileEditForm />
    </QueryClientProvider>
  );

  const nickname = await screen.findByLabelText("닉네임");
  await waitFor(() => expect(nickname).toHaveValue(result.nickname ?? "테스터"));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "개발" })).toHaveAttribute(
      "aria-pressed",
      String(result.firstInterestCategory !== null)
    )
  );
  return { user, nickname };
}

describe("ProfileEditForm 저장 플로우", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("일부 카테고리를 해제하고 저장하면 순위가 당겨지고 나머지는 null로 전송한다", async () => {
    mockedMemberApi.updateMe.mockResolvedValue(createProfileResponse());
    const { user } = await renderLoadedForm();

    await user.click(screen.getByRole("button", { name: "개발" }));
    await user.click(screen.getByRole("button", { name: "디자인" }));
    await user.click(saveButtons()[0]);

    await waitFor(() => expect(mockedMemberApi.updateMe).toHaveBeenCalledTimes(1));
    expect(mockedMemberApi.updateMe).toHaveBeenCalledWith({
      nickname: "테스터",
      bio: "소개",
      firstInterestCategory: "PLANNING_PM",
      secondInterestCategory: null,
      thirdInterestCategory: null,
    });
  });

  it("저장에 성공하면 성공 토스트를 보여주고 저장하기 버튼을 다시 비활성화한다", async () => {
    mockedMemberApi.updateMe.mockResolvedValue(createProfileResponse({ nickname: "테스터a" }));
    const { user, nickname } = await renderLoadedForm();

    await user.type(nickname, "a");
    await user.click(saveButtons()[0]);

    await waitFor(() =>
      expect(mockedToast.success).toHaveBeenCalledWith("프로필 정보가 저장되었습니다.")
    );
    await waitFor(() => {
      saveButtons().forEach((button) => expect(button).toBeDisabled());
    });
    expect(nickname).toHaveValue("테스터a");
  });

  it("저장에 실패하면 에러 메시지를 토스트로 보여주고 입력과 저장하기 버튼을 유지한다", async () => {
    mockedMemberApi.updateMe.mockRejectedValue(new Error("이미 사용 중인 닉네임입니다."));
    const { user, nickname } = await renderLoadedForm();

    await user.type(nickname, "a");
    await user.click(saveButtons()[0]);

    await waitFor(() =>
      expect(mockedToast.error).toHaveBeenCalledWith("이미 사용 중인 닉네임입니다.")
    );
    expect(mockedToast.success).not.toHaveBeenCalled();
    expect(nickname).toHaveValue("테스터a");
    saveButtons().forEach((button) => expect(button).toBeEnabled());
  });

  it("Error가 아닌 값으로 실패하면 기본 에러 문구를 토스트로 보여준다", async () => {
    mockedMemberApi.updateMe.mockRejectedValue("network down");
    const { user, nickname } = await renderLoadedForm();

    await user.type(nickname, "a");
    await user.click(saveButtons()[0]);

    await waitFor(() =>
      expect(mockedToast.error).toHaveBeenCalledWith("프로필 정보 저장 중 오류가 발생했습니다.")
    );
  });

  it("저장 중에는 저장하기 버튼을 비활성화한다", async () => {
    let resolveUpdate: (value: MemberProfileMutationResponse) => void = () => {};
    mockedMemberApi.updateMe.mockReturnValue(
      new Promise<MemberProfileMutationResponse>((resolve) => {
        resolveUpdate = resolve;
      })
    );
    const { user, nickname } = await renderLoadedForm();

    await user.type(nickname, "a");
    await user.click(saveButtons()[0]);

    await waitFor(() => {
      saveButtons().forEach((button) => expect(button).toBeDisabled());
    });

    await act(async () => {
      resolveUpdate(createProfileResponse({ nickname: "테스터a" }));
    });
  });
});
