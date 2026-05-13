import type { ReactNode } from "react";

import { sessionApi } from "@/features/session/api";
import { SessionListPrefetch } from "@/features/session/components/SessionList/SessionListPrefetch";
import {
  SESSION_LIST_DESKTOP_PAGE_SIZE,
  SESSION_LIST_MOBILE_PAGE_SIZE,
} from "@/features/session/constants/pagination";
import { getQueryClient } from "@/lib/getQueryClient";

jest.mock("@tanstack/react-query", () => ({
  dehydrate: jest.fn(() => ({})),
  HydrationBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@/lib/getQueryClient", () => ({
  getQueryClient: jest.fn(),
}));

jest.mock("@/features/session/api", () => ({
  sessionApi: {
    getList: jest.fn(),
  },
}));

describe("SessionListPrefetch", () => {
  it("모바일/데스크톱 pageSize를 함께 prefetch해 hydration 전환 시 fallback을 피한다", async () => {
    const prefetchQuery = jest.fn(async ({ queryFn }: { queryFn: () => Promise<unknown> }) => {
      await queryFn();
      return undefined;
    });

    (getQueryClient as jest.Mock).mockReturnValue({
      prefetchQuery,
    });

    (sessionApi.getList as jest.Mock).mockResolvedValue({
      data: { result: { totalPage: 1, sessions: [] } },
    });

    await SessionListPrefetch({
      listParams: {
        keyword: undefined,
        category: undefined,
        page: 1,
        size: SESSION_LIST_DESKTOP_PAGE_SIZE,
        sort: "POPULAR",
        startDate: undefined,
        endDate: undefined,
        timeSlots: undefined,
        durationRange: undefined,
        participants: undefined,
      },
    });

    expect(prefetchQuery).toHaveBeenCalledTimes(2);
    expect(prefetchQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: expect.any(Array),
        queryFn: expect.any(Function),
      })
    );
    expect(prefetchQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: expect.any(Array),
        queryFn: expect.any(Function),
      })
    );
    expect(sessionApi.getList).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ size: SESSION_LIST_MOBILE_PAGE_SIZE })
    );
    expect(sessionApi.getList).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ size: SESSION_LIST_DESKTOP_PAGE_SIZE })
    );
  });
});
