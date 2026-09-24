import { renderHook } from "@testing-library/react";

import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { useHasAuthMarker } from "@/features/auth/hooks/useHasAuthMarker";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import type { GetMeResponse, MemberProfileView } from "@/features/member/types";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import type { UseQueryResult } from "@tanstack/react-query";

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: jest.fn(),
}));

jest.mock("@/features/auth/hooks/useHasAuthMarker", () => ({
  useHasAuthMarker: jest.fn(),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: jest.fn(() => false),
}));

const mockedUseMe = jest.mocked(useMe);
const mockedUseHasAuthMarker = jest.mocked(useHasAuthMarker);
const mockedIsMockModeEnabled = jest.mocked(isMockModeEnabled);

const profile = {
  id: 1,
  nickname: "경환",
} as MemberProfileView;

function stubMe(value: Partial<UseQueryResult<GetMeResponse>>): UseQueryResult<GetMeResponse> {
  return value as UseQueryResult<GetMeResponse>;
}

describe("useAuthState 마커 게이트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedIsMockModeEnabled.mockReturnValue(false);
    // 마커가 없어 비활성화된 쿼리는 v5에서 isPending이 true로 남는다.
    mockedUseMe.mockReturnValue(stubMe({ isPending: true, isFetching: false, data: undefined }));
  });

  it("마커가 없으면 me를 조회하지 않고 guest여야 한다", () => {
    mockedUseHasAuthMarker.mockReturnValue(false);

    const { result } = renderHook(() => useAuthState());

    expect(mockedUseMe).toHaveBeenCalledWith({ enabled: false });
    expect(result.current).toEqual({ status: "guest" });
  });

  it("hydration 전(마커 판단 불가)에는 me를 조회하지 않고 recovering이어야 한다", () => {
    mockedUseHasAuthMarker.mockReturnValue(null);

    const { result } = renderHook(() => useAuthState());

    expect(mockedUseMe).toHaveBeenCalledWith({ enabled: false });
    expect(result.current).toEqual({ status: "recovering" });
  });

  it("마커가 있으면 me를 조회해야 한다", () => {
    mockedUseHasAuthMarker.mockReturnValue(true);

    renderHook(() => useAuthState());

    expect(mockedUseMe).toHaveBeenCalledWith({ enabled: true });
  });

  it("mock 모드는 마커 없이도 me를 조회해야 한다", () => {
    mockedUseHasAuthMarker.mockReturnValue(false);
    mockedIsMockModeEnabled.mockReturnValue(true);

    const { result } = renderHook(() => useAuthState());

    expect(mockedUseMe).toHaveBeenCalledWith({ enabled: true });
    expect(result.current).toEqual({ status: "recovering" });
  });
});

describe("useAuthState (마커 있음)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedIsMockModeEnabled.mockReturnValue(false);
    mockedUseHasAuthMarker.mockReturnValue(true);
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

  it("데이터가 있으면 재요청 중이어도 authenticated를 유지해야 한다", () => {
    mockedUseMe.mockReturnValue(
      stubMe({
        isPending: false,
        isFetching: true,
        data: { result: profile } as GetMeResponse,
      })
    );

    const { result } = renderHook(() => useAuthState());

    expect(result.current).toEqual({ status: "authenticated", profile });
  });

  it("에러로 해소되면 guest여야 한다", () => {
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
