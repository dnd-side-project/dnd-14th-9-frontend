import { renderHook } from "@testing-library/react";

import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import type { GetMeResponse, MemberProfileView } from "@/features/member/types";

import type { UseQueryResult } from "@tanstack/react-query";

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: jest.fn(),
}));

const mockedUseMe = jest.mocked(useMe);

const profile = {
  id: 1,
  nickname: "경환",
} as MemberProfileView;

function stubMe(value: Partial<UseQueryResult<GetMeResponse>>): UseQueryResult<GetMeResponse> {
  return value as UseQueryResult<GetMeResponse>;
}

describe("useAuthState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useMe를 비활성 옵션 없이 호출해야 한다", () => {
    mockedUseMe.mockReturnValue(stubMe({ isPending: true, data: undefined }));

    renderHook(() => useAuthState());

    expect(mockedUseMe).toHaveBeenCalledWith();
  });

  it("me 쿼리가 아직 해소 전이면 recovering이어야 한다", () => {
    mockedUseMe.mockReturnValue(stubMe({ isPending: true, data: undefined }));

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "recovering" });
  });

  it("프로필로 해소되면 authenticated이고 profile이 일치해야 한다", () => {
    mockedUseMe.mockReturnValue(
      stubMe({
        isPending: false,
        isFetching: false,
        data: { result: profile } as GetMeResponse,
      })
    );

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "authenticated", profile });
  });

  it("에러/빈 결과로 해소되면 guest여야 한다", () => {
    mockedUseMe.mockReturnValue(
      stubMe({
        isPending: false,
        isFetching: false,
        data: undefined,
        isError: true,
      })
    );

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "guest" });
  });

  it("빈 결과로 해소되면 guest여야 한다", () => {
    mockedUseMe.mockReturnValue(
      stubMe({
        isPending: false,
        isFetching: false,
        data: {} as GetMeResponse,
      })
    );

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "guest" });
  });

  it("에러 후 재요청 중이면 recovering이어야 한다", () => {
    mockedUseMe.mockReturnValue(
      stubMe({
        isPending: false,
        isFetching: true,
        data: undefined,
        isError: true,
      })
    );

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "recovering" });
  });
});
