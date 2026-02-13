import {
  QueryClient,
  dehydrate,
  useQuery,
  type DehydratedState,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { createSingletonHooks } from "@/hooks/createSingletonHooks";
import type { ApiSuccessResponse } from "@/types/shared/types";

type MemberQueryKeys = {
  all: readonly [string];
  me: () => readonly [string, "data"];
  report: () => readonly [string, "report"];
};

interface CreateMemberHooksConfig<
  TMeResponse,
  TUpdatePayload extends Record<string, unknown>,
  TReportResponse,
> {
  queryKey?: string;
  getMe: () => Promise<ApiSuccessResponse<TMeResponse>>;
  updateMe: (data: TUpdatePayload) => Promise<ApiSuccessResponse<TMeResponse>>;
  getMyReport?: () => Promise<ApiSuccessResponse<TReportResponse>>;
  deleteMe?: () => Promise<ApiSuccessResponse<null>>;
  staleTime?: number;
}

type BaseMemberHooksReturn<
  TMeResponse,
  TUpdatePayload extends Record<string, unknown>,
  TReportResponse,
> = {
  keys: MemberQueryKeys;
  useMe: () => UseQueryResult<ApiSuccessResponse<TMeResponse>>;
  prefetchMe: () => Promise<DehydratedState>;
  useUpdateMe: () => UseMutationResult<
    ApiSuccessResponse<TMeResponse>,
    unknown,
    TUpdatePayload,
    { previousData?: ApiSuccessResponse<TMeResponse> }
  >;
} & Partial<{
  useMyReport: () => UseQueryResult<ApiSuccessResponse<TReportResponse>>;
  prefetchMyReport: () => Promise<DehydratedState>;
  useDeleteMe: () => UseMutationResult<ApiSuccessResponse<null>, unknown, void>;
}>;

/**
 * Member API 전용 Query Hook Factory
 *
 * core(/members/me) 동작은 createSingletonHooks를 래핑하고,
 * report 조회는 member 전용 훅으로 추가합니다.
 */
export function createMemberHooks<
  TMeResponse = unknown,
  TUpdatePayload extends Record<string, unknown> = Record<string, unknown>,
  TReportResponse = unknown,
>(
  config: CreateMemberHooksConfig<TMeResponse, TUpdatePayload, TReportResponse>
): BaseMemberHooksReturn<TMeResponse, TUpdatePayload, TReportResponse> {
  const baseKey = config.queryKey ?? "member";
  const reportKey = () => [baseKey, "report"] as const;

  const singleton = createSingletonHooks<TMeResponse, TUpdatePayload>({
    queryKey: baseKey,
    get: config.getMe,
    update: config.updateMe,
    remove: config.deleteMe,
    optimisticUpdate: true,
    staleTime: config.staleTime,
    onUpdateSuccess: config.getMyReport
      ? (queryClient) => {
          queryClient.invalidateQueries({ queryKey: reportKey() });
        }
      : undefined,
  });

  if (!singleton.useUpdate) {
    throw new Error("createMemberHooks requires updateMe configuration.");
  }

  const keys: MemberQueryKeys = {
    all: singleton.keys.all,
    me: singleton.keys.data,
    report: reportKey,
  };

  const result: BaseMemberHooksReturn<TMeResponse, TUpdatePayload, TReportResponse> = {
    keys,
    useMe: singleton.useGet,
    prefetchMe: singleton.prefetch,
    useUpdateMe: singleton.useUpdate,
  };

  if (config.getMyReport) {
    result.useMyReport = function useMyReport() {
      return useQuery({
        queryKey: keys.report(),
        queryFn: config.getMyReport,
        staleTime: config.staleTime,
      });
    };

    result.prefetchMyReport = async function prefetchMyReport() {
      const queryClient = new QueryClient();
      await queryClient.prefetchQuery({
        queryKey: keys.report(),
        queryFn: config.getMyReport,
      });
      return dehydrate(queryClient);
    };
  }

  if (config.deleteMe && singleton.useDelete) {
    result.useDeleteMe = singleton.useDelete;
  }

  return result;
}
