import type { PropsWithChildren } from "react";

import { focusManager, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { memberApi } from "@/features/member/api";
import {
  memberKeys,
  memberQueries,
  useMeForEdit,
  useUpdateInterestCategories,
  useUpdateNickname,
  useUpdateProfileImage,
} from "@/features/member/hooks/useMemberHooks";
import type {
  MemberProfileMutationResponse,
  UpdateInterestCategoriesRequest,
} from "@/features/member/types";
import { ApiError, NetworkError } from "@/lib/api/api-client";

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMe: jest.fn(),
    getMeForEdit: jest.fn(),
    getMyReportStats: jest.fn(),
    deleteMe: jest.fn(),
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

describe("memberHooks mutation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useUpdateNickname 성공 시 member edit 캐시를 응답값으로 동기화해야 한다", async () => {
    const queryClient = new QueryClient();
    const response = createMockProfileResponse("new용");
    mockedMemberApi.updateNickname.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useUpdateNickname(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ nickname: "new용" });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(memberKeys.edit())).toEqual(response);
    });
  });

  it("useUpdateProfileImage 성공 시 member edit 캐시를 응답값으로 동기화해야 한다", async () => {
    const queryClient = new QueryClient();
    const response = createMockProfileResponse("image-updated");
    const file = new File(["binary"], "profile.png", { type: "image/png" });
    mockedMemberApi.updateProfileImage.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useUpdateProfileImage(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ profileImage: file });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(memberKeys.edit())).toEqual(response);
    });
  });

  it("useUpdateInterestCategories 성공 시 member edit 캐시를 응답값으로 동기화해야 한다", async () => {
    const queryClient = new QueryClient();
    const response = createMockProfileResponse("category-updated");
    mockedMemberApi.updateInterestCategories.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useUpdateInterestCategories(), {
      wrapper: createWrapper(queryClient),
    });

    const request: UpdateInterestCategoriesRequest = {
      firstInterestCategory: "DEVELOPMENT",
      secondInterestCategory: "DESIGN",
      thirdInterestCategory: null,
    };

    await act(async () => {
      await result.current.mutateAsync(request);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(memberKeys.edit())).toEqual(response);
    });
  });
});

describe("memberHooks query", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useMeForEdit는 edit 엔드포인트 결과를 edit 키로 캐시해야 한다", async () => {
    const queryClient = new QueryClient();
    const response = createMockProfileResponse("edit-profile");
    mockedMemberApi.getMeForEdit.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useMeForEdit(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedMemberApi.getMeForEdit).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(memberKeys.edit())).toEqual(response);
  });
});

describe("memberQueries.me 재시도·포커스 재조회", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    focusManager.setFocused(undefined);
  });

  // 5분 staleTime은 포커스 재조회를 막고 기본 retryDelay는 테스트를 늦추므로 둘 다 0으로 두고 정책만 검증한다.
  function renderMeQuery(queryClient: QueryClient) {
    return renderHook(() => useQuery({ ...memberQueries.me(), staleTime: 0, retryDelay: 0 }), {
      wrapper: createWrapper(queryClient),
    });
  }

  async function refocusWindow() {
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
  }

  it.each([401, 403])("인증 거부(%i)는 재시도하지 않아야 한다", async (status) => {
    const queryClient = new QueryClient();
    mockedMemberApi.getMe.mockRejectedValue(new ApiError("인증이 필요합니다.", status));

    const { result } = renderMeQuery(queryClient);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["5xx", new ApiError("서버 오류", 500)],
    ["네트워크 오류", new NetworkError("네트워크 오류")],
  ])("일시 실패(%s)는 2번 재시도해야 한다", async (_, error) => {
    const queryClient = new QueryClient();
    mockedMemberApi.getMe.mockRejectedValue(error);

    const { result } = renderMeQuery(queryClient);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(3);
  });

  it("로그인 유저는 탭 포커스 복귀 시 me를 다시 조회해야 한다", async () => {
    const queryClient = new QueryClient();
    mockedMemberApi.getMe.mockResolvedValue({
      result: createMockProfileResponse("me").result,
    } as Awaited<ReturnType<typeof memberApi.getMe>>);

    const { result } = renderMeQuery(queryClient);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await refocusWindow();

    await waitFor(() => expect(mockedMemberApi.getMe).toHaveBeenCalledTimes(2));
  });

  it("일시 실패로 확인하지 못한 경우 탭 포커스 복귀 시 다시 조회해야 한다", async () => {
    const queryClient = new QueryClient();
    mockedMemberApi.getMe.mockRejectedValue(new ApiError("서버 오류", 500));

    const { result } = renderMeQuery(queryClient);
    await waitFor(() => expect(result.current.isError).toBe(true));

    await refocusWindow();

    await waitFor(() => expect(mockedMemberApi.getMe.mock.calls.length).toBeGreaterThan(3));
  });
});
