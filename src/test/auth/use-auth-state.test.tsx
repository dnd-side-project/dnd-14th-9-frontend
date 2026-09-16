import { renderHook } from "@testing-library/react";

import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import type { MemberProfileView } from "@/features/member/types";

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: jest.fn(),
}));

const mockedUseMe = jest.mocked(useMe);

const profile = {
  id: 1,
  nickname: "경환",
} as MemberProfileView;

describe("useAuthState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("me 쿼리가 아직 해소 전이면 recovering이어야 한다", () => {
    mockedUseMe.mockReturnValue({ isPending: true, data: undefined } as never);

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "recovering" });
  });

  it("프로필로 해소되면 authenticated이고 profile이 일치해야 한다", () => {
    mockedUseMe.mockReturnValue({
      isPending: false,
      data: { result: profile },
    } as never);

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "authenticated", profile });
  });

  it("에러/빈 결과로 해소되면 guest여야 한다", () => {
    mockedUseMe.mockReturnValue({
      isPending: false,
      data: undefined,
      isError: true,
    } as never);

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "guest" });
  });
});
