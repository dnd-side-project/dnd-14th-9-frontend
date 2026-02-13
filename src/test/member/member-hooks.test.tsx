import type { PropsWithChildren } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { memberApi } from "@/features/member/api";
import {
  memberKeys,
  useUpdateInterestCategories,
  useUpdateNickname,
  useUpdateProfileImage,
} from "@/features/member/hooks/useMemberHooks";
import type { MemberProfile } from "@/features/member/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

jest.mock("@/features/member/api", () => ({
  memberApi: {
    getMe: jest.fn(),
    getMyReport: jest.fn(),
    deleteMe: jest.fn(),
    updateProfileImage: jest.fn(),
    updateNickname: jest.fn(),
    updateInterestCategories: jest.fn(),
  },
}));

const mockedMemberApi = memberApi as jest.Mocked<typeof memberApi>;

function createMockProfileResponse(nickname: string): ApiSuccessResponse<MemberProfile> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      id: 1,
      nickname,
      profileImageUrl: "https://example.com/profile.png",
      bio: "소개",
      firstInterestCategory: "DEVELOPMENT",
      secondInterestCategory: "DESIGN",
      thirdInterestCategory: "CREATIVE",
      firstLogin: false,
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

  it("useUpdateNickname 성공 시 member me 캐시를 응답값으로 동기화해야 한다", async () => {
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
      expect(queryClient.getQueryData(memberKeys.me())).toEqual(response);
    });
  });

  it("useUpdateProfileImage 성공 시 member me 캐시를 응답값으로 동기화해야 한다", async () => {
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
      expect(queryClient.getQueryData(memberKeys.me())).toEqual(response);
    });
  });

  it("useUpdateInterestCategories 성공 시 member me 캐시를 응답값으로 동기화해야 한다", async () => {
    const queryClient = new QueryClient();
    const response = createMockProfileResponse("category-updated");
    mockedMemberApi.updateInterestCategories.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useUpdateInterestCategories(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        firstInterestCategory: "DEVELOPMENT",
        secondInterestCategory: "DESIGN",
        thirdInterestCategory: "CREATIVE",
      });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(memberKeys.me())).toEqual(response);
    });
  });
});
