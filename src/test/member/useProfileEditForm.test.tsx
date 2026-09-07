import type { PropsWithChildren } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Controller } from "react-hook-form";

import { memberApi } from "@/features/member/api";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import { useProfileEditForm } from "@/features/member/hooks/useProfileEditForm";
import type { MemberProfileMutationResponse } from "@/features/member/types";

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

const mockedMemberApi = memberApi as jest.Mocked<typeof memberApi>;

function createMockProfileResponse(nickname: string): MemberProfileMutationResponse {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      id: 1,
      nickname,
      profileImageUrl: "https://example.com/profile.png",
      email: "tem@tem.com",
      bio: "소개",
      firstInterestCategory: "DEVELOPMENT",
      secondInterestCategory: "DESIGN",
      thirdInterestCategory: null,
    },
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function ProfileEditFormHarness() {
  const { profile, control, isSaveDisabled } = useProfileEditForm();

  return (
    <form>
      <span data-testid="cached-profile-nickname">{profile?.nickname}</span>
      <Controller
        name="nickname"
        control={control}
        render={({ field }) => (
          <input
            aria-label="닉네임"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <button type="submit" disabled={isSaveDisabled}>
        저장
      </button>
    </form>
  );
}

describe("useProfileEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("편집 중 edit 캐시가 갱신되어도 미저장 닉네임과 저장 버튼 활성 상태를 유지해야 한다", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();
    mockedMemberApi.getMeForEdit.mockResolvedValueOnce(createMockProfileResponse("old"));

    render(<ProfileEditFormHarness />, { wrapper: createWrapper(queryClient) });

    const nicknameInput = screen.getByRole("textbox", { name: "닉네임" });
    await waitFor(() => {
      expect(nicknameInput).toHaveValue("old");
    });

    await user.clear(nicknameInput);
    await user.type(nicknameInput, "newname");

    await waitFor(() => {
      expect(nicknameInput).toHaveValue("newname");
      expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    });

    act(() => {
      queryClient.setQueryData(memberKeys.edit(), createMockProfileResponse("image-updated"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("cached-profile-nickname")).toHaveTextContent("image-updated");
    });

    expect(nicknameInput).toHaveValue("newname");
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
  });
});
