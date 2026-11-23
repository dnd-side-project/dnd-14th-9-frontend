import type { PropsWithChildren } from "react";

import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { memberApi } from "@/features/member/api";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import type { GetMeResponse, MemberProfileView } from "@/features/member/types";
import { ApiError } from "@/lib/api/api-client";
import { AUTH_MARKER_COOKIE } from "@/lib/auth/cookie-constants";
import { makeQueryClient } from "@/lib/getQueryClient";
import { toast } from "@/lib/toast";

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMe: jest.fn(),
  },
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => false,
}));

jest.mock("@/lib/toast", () => ({
  toast: { error: jest.fn() },
}));

const mockedMemberApi = jest.mocked(memberApi);
const mockedToastError = jest.mocked(toast.error);

function createProfile(overrides: Partial<MemberProfileView> = {}): MemberProfileView {
  return {
    id: 7,
    nickname: "테스터",
    profileImageUrl: "https://example.com/avatar.png",
    email: "tester@example.com",
    bio: "소개",
    socialProvider: "kakao",
    totalParticipationTime: 120,
    focusedTime: 90,
    focusRate: 75,
    totalTodoCount: 4,
    completedTodoCount: 3,
    todoCompletionRate: 75,
    participationSessionCount: 2,
    firstLogin: false,
    ...overrides,
  };
}

function createMeResponse(overrides: Partial<MemberProfileView> = {}): GetMeResponse {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공",
    result: createProfile(overrides),
  };
}

function setAuthMarkerCookie(present: boolean) {
  if (present) {
    document.cookie = `${AUTH_MARKER_COOKIE}=1; path=/`;
    return;
  }
  document.cookie = `${AUTH_MARKER_COOKIE}=; max-age=0; path=/`;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAuthState + 실제 QueryClient 통합 동작", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMemberApi.getMe.mockReset();
    setAuthMarkerCookie(false);
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
    focusManager.setFocused(undefined);
    setAuthMarkerCookie(false);
  });

  it("마커가 있고 /me 조회가 성공하면 authenticated와 프로필을 반환하고 캐시에 저장한다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const response = createMeResponse();
    mockedMemberApi.getMe.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    expect(result.current).toEqual({
      status: "authenticated",
      profile: response.result,
    });
    expect(queryClient.getQueryData(memberKeys.me())).toEqual(response);
  });

  it.each([401, 403])(
    "/me 성공 후 재조회가 %i로 거부되면 마커 잔존 여부와 무관하게 guest로 전환되고 캐시가 null로 덮이며 재요청 루프가 발생하지 않는다",
    async (status) => {
      setAuthMarkerCookie(true);
      const queryClient = makeQueryClient();
      const response = createMeResponse();
      mockedMemberApi.getMe
        .mockResolvedValueOnce(response)
        .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", status));

      const { result } = renderHook(() => useAuthState(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => {
        expect(result.current.status).toBe("authenticated");
      });

      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      });

      await waitFor(() => {
        expect(result.current).toEqual({ status: "guest" });
      });

      expect(queryClient.getQueryData(memberKeys.me())).toBeNull();
      expect(queryClient.getQueryState(memberKeys.me())?.status).toBe("success");
      expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(2);
      expect(mockedToastError).not.toHaveBeenCalled();
    }
  );

  it("마커가 남은 채 401로 거부돼도 staleTime 안에서는 포커스 복귀와 재마운트로 /me를 다시 요청하지 않는다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    mockedMemberApi.getMe.mockRejectedValue(new ApiError("인증이 필요합니다.", 401));

    const first = renderHook(() => useAuthState(), { wrapper: createWrapper(queryClient) });
    await waitFor(() => {
      expect(first.result.current).toEqual({ status: "guest" });
    });

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    first.unmount();
    const second = renderHook(() => useAuthState(), { wrapper: createWrapper(queryClient) });

    expect(second.result.current).toEqual({ status: "guest" });
    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(1);
  });

  it("/me 성공 후 프록시가 마커 쿠키를 삭제하고 401을 반환해도 guest로 전환되고 이전 캐시가 null로 덮인다", async () => {
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const response = createMeResponse();
    mockedMemberApi.getMe.mockResolvedValueOnce(response).mockImplementationOnce(async () => {
      setAuthMarkerCookie(false);
      throw new ApiError("인증이 필요합니다.", 401);
    });

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(result.current).toEqual({ status: "guest" });
    });

    expect(queryClient.getQueryData(memberKeys.me())).toBeNull();
    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(2);
  });

  it("staleTime 만료 후 탭 포커스 재조회에서 401을 받으면 guest로 전환되고 캐시가 null로 덮인다", async () => {
    jest.useFakeTimers();
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const response = createMeResponse();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(response)
      .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401));

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    await waitFor(() => {
      expect(result.current).toEqual({ status: "guest" });
    });

    expect(queryClient.getQueryData(memberKeys.me())).toBeNull();
    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(2);
  });

  it("/me 성공 후 일시 오류(500)가 발생하면 이전 캐시를 보존하고 authenticated를 유지한다", async () => {
    jest.useFakeTimers();
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const response = createMeResponse();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(response)
      .mockRejectedValue(new ApiError("서버 오류", 500));

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      void queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      await jest.advanceTimersByTimeAsync(10000);
    });

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledTimes(1);
    });

    expect(result.current).toEqual({
      status: "authenticated",
      profile: response.result,
    });
    expect(queryClient.getQueryData(memberKeys.me())).toEqual(response);
    // 초기 1회 + invalidate 후 1회 + retry 2회
    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(4);
  });

  it("/me 성공 후 401로 guest가 된 뒤 일시 오류(500)가 발생해도 이전 프로필이 되살아나지 않고 unavailable로 전환된다", async () => {
    jest.useFakeTimers();
    setAuthMarkerCookie(true);
    const queryClient = makeQueryClient();
    const response = createMeResponse();
    mockedMemberApi.getMe
      .mockResolvedValueOnce(response)
      .mockRejectedValueOnce(new ApiError("인증이 필요합니다.", 401))
      .mockRejectedValue(new ApiError("서버 오류", 500));

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: memberKeys.me() });
    });

    await waitFor(() => {
      expect(result.current).toEqual({ status: "guest" });
    });
    expect(queryClient.getQueryData(memberKeys.me())).toBeNull();

    await act(async () => {
      void queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      await jest.advanceTimersByTimeAsync(10000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unavailable");
    });

    expect(queryClient.getQueryData(memberKeys.me())).toBeNull();
    expect(mockedToastError).toHaveBeenCalledTimes(1);
    // 초기 1회 + 401 1회 + 500 초기 1회 + retry 2회
    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(5);
  });

  it("마커가 없으면 캐시에 이전 프로필이 남아 있어도 네트워크 요청 없이 guest를 반환한다", () => {
    setAuthMarkerCookie(false);
    const queryClient = makeQueryClient();
    queryClient.setQueryData(memberKeys.me(), createMeResponse());

    const { result } = renderHook(() => useAuthState(), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current).toEqual({ status: "guest" });
    expect(mockedMemberApi.getMe).not.toHaveBeenCalled();
  });
});
