import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeaderAuthActions } from "@/components/Header/HeaderAuthActions";
import { memberApi } from "@/features/member/api";
import { OnboardingConfirm } from "@/features/member/components/Onboarding/OnboardingConfirm";
import { ProfileAccountContent } from "@/features/member/components/Profile/ProfileAccountContent";
import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import { SessionCreateForm } from "@/features/session/components/SessionCreateForm";
import { ApiError } from "@/lib/api/api-client";
import { makeQueryClient } from "@/lib/getQueryClient";
import { createMeResponse, setAuthMarkerCookie } from "@/test/auth/me-test-fixtures";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMe: jest.fn(),
    deleteMe: jest.fn(),
    updateProfileImage: jest.fn(),
  },
}));

jest.mock("@/features/auth/api", () => ({
  authApi: {
    logout: jest.fn(),
  },
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useCreateSession: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateSession: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => false,
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

function renderWithQueryClient(ui: ReactNode, queryClient: QueryClient = makeQueryClient()) {
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { ...result, queryClient };
}

describe("useAuthState 소비처 컴포넌트 + 실제 QueryClient 통합 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMemberApi.getMe.mockReset();
    mockedMemberApi.deleteMe.mockReset();
    mockedMemberApi.updateProfileImage.mockReset();
    setAuthMarkerCookie(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    setAuthMarkerCookie(false);
  });

  it("ProfileSummary는 이전 캐시가 있어도 401/403 응답 후 프로필을 노출하지 않아야 한다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const prevResponse = createMeResponse();
    queryClient.setQueryData(memberKeys.me(), prevResponse);
    mockedMemberApi.getMe.mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401));

    renderWithQueryClient(<ProfileSummary />, queryClient);

    expect(screen.getByText("기존유저")).toBeInTheDocument();

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.queryByText("기존유저")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("prev@example.com")).not.toBeInTheDocument();
    expect(queryClient.getQueryData(memberKeys.me())).toBeNull();
  });

  it("ProfileSummary는 마커가 없는 guest 상태에서 이전 캐시가 남아 있어도 프로필을 표시하지 않아야 한다", () => {
    setAuthMarkerCookie(false);
    const queryClient = makeQueryClient();
    queryClient.setQueryData(memberKeys.me(), createMeResponse());

    const { container } = renderWithQueryClient(<ProfileSummary />, queryClient);

    expect(container).toBeEmptyDOMElement();
    expect(mockedMemberApi.getMe).not.toHaveBeenCalled();
  });

  it("ProfileAccountContent는 403 응답 후 이전 계정 카드와 탈퇴 버튼을 비활성 상태로 전환해야 한다", async () => {
    const user = userEvent.setup();
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    queryClient.setQueryData(memberKeys.me(), createMeResponse());
    mockedMemberApi.getMe.mockRejectedValueOnce(new ApiError("권한이 없습니다.", 403));

    renderWithQueryClient(<ProfileAccountContent />, queryClient);

    expect(screen.getByText("기존유저")).toBeInTheDocument();
    for (const checkbox of screen.getAllByRole("checkbox")) {
      await user.click(checkbox);
    }
    const deleteButton = screen.getByRole("button", { name: "회원 탈퇴하기" });
    expect(deleteButton).toBeEnabled();

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.queryByText("기존유저")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("prev@example.com")).not.toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
  });

  it("ProfileAccountContent는 마커 없는 guest 상태에서 이전 캐시가 있어도 계정을 숨기고 탈퇴를 막아야 한다", async () => {
    const user = userEvent.setup();
    setAuthMarkerCookie(false);
    const queryClient = makeQueryClient();
    queryClient.setQueryData(memberKeys.me(), createMeResponse());

    renderWithQueryClient(<ProfileAccountContent />, queryClient);

    for (const checkbox of screen.getAllByRole("checkbox")) {
      await user.click(checkbox);
    }
    expect(screen.queryByText("기존유저")).not.toBeInTheDocument();
    expect(screen.queryByText("prev@example.com")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원 탈퇴하기" })).toBeDisabled();
  });

  it("HeaderAuthActions는 authenticated 시 프로필 팝업을 열고, 401 후에는 이전 프로필 없이 로그인 링크를 표시해야 한다", async () => {
    const user = userEvent.setup();
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(createMeResponse())
      .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401));

    renderWithQueryClient(<HeaderAuthActions />, queryClient);

    await waitFor(() => {
      expect(screen.getAllByAltText("기존유저").length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole("button", { name: "프로필 메뉴" }));
    expect(await screen.findByText("prev@example.com")).toBeInTheDocument();

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: "로그인" })).toHaveLength(2);
    });
    expect(screen.queryByText("prev@example.com")).not.toBeInTheDocument();
    expect(screen.queryByAltText("기존유저")).not.toBeInTheDocument();
  });

  it("OnboardingConfirm은 memberKeys.me() 무효화 시 최신 프로필 이미지를 반영하고 401 후에는 숨겨야 한다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(createMeResponse({ profileImageUrl: "https://example.com/first.png" }))
      .mockResolvedValueOnce(
        createMeResponse({ profileImageUrl: "https://example.com/updated.png" })
      )
      .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401));

    renderWithQueryClient(
      <OnboardingConfirm nickname="테스터" categories={["DEVELOPMENT"]} />,
      queryClient
    );

    await waitFor(() => {
      expect(screen.getByAltText("테스터 프로필 이미지")).toHaveAttribute(
        "src",
        expect.stringContaining(encodeURIComponent("https://example.com/first.png"))
      );
    });

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.getByAltText("테스터 프로필 이미지")).toHaveAttribute(
        "src",
        expect.stringContaining(encodeURIComponent("https://example.com/updated.png"))
      );
    });

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.queryByAltText("테스터 프로필 이미지")).not.toBeInTheDocument();
    });
  });

  it("SessionCreateForm은 authenticated일 때만 내 달성률/집중률 제한을 반영하고 guest 캐시는 무시해야 한다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(createMeResponse({ todoCompletionRate: 40, focusRate: 50 }))
      .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401));

    renderWithQueryClient(<SessionCreateForm />, queryClient);

    await waitFor(() => {
      expect(screen.getByText("내 달성률")).toBeInTheDocument();
    });
    expect(screen.getByText("내 집중률")).toBeInTheDocument();
    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveAttribute("aria-valuemax", "40");
    expect(sliders[1]).toHaveAttribute("aria-valuemax", "50");

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(screen.queryByText("내 달성률")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("내 집중률")).not.toBeInTheDocument();
    expect(sliders[0]).toHaveAttribute("aria-valuemax", "100");
    expect(sliders[1]).toHaveAttribute("aria-valuemax", "100");
  });
});
