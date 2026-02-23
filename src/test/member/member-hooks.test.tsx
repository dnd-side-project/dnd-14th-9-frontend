import type { PropsWithChildren } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { memberApi } from "@/features/member/api";
import {
  memberKeys,
  useMeForEdit,
  useUpdateInterestCategories,
  useUpdateNickname,
  useUpdateProfileImage,
} from "@/features/member/hooks/useMemberHooks";
import type {
  MemberProfileMutationResponse,
  UpdateInterestCategoriesRequest,
} from "@/features/member/types";

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
