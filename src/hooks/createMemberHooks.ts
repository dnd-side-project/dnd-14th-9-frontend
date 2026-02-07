import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
  type DehydratedState,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiSuccessResponse } from "@/types/shared/types";

type MemberQueryKeys = {
  all: readonly [string];
  me: () => readonly [string, "me"];
  report: () => readonly [string, "report"];
  nicknameExists: (nickname: string) => readonly [string, "nickname-exists", string];
};

interface CreateMemberHooksConfig<
  TMeResponse,
  TUpdatePayload extends Record<string, unknown>,
  TReportResponse,
  TNicknameExistsResponse,
> {
  queryKey?: string;
  getMe: () => Promise<ApiSuccessResponse<TMeResponse>>;
  updateMe: (data: TUpdatePayload) => Promise<ApiSuccessResponse<TMeResponse>>;
  getMyReport?: () => Promise<ApiSuccessResponse<TReportResponse>>;
  checkNicknameExists?: (nickname: string) => Promise<ApiSuccessResponse<TNicknameExistsResponse>>;
  deleteMe?: () => Promise<ApiSuccessResponse<null>>;
  staleTime?: number;
}

type BaseMemberHooksReturn<
  TMeResponse,
  TUpdatePayload extends Record<string, unknown>,
  TReportResponse,
  TNicknameExistsResponse,
> = {
  keys: MemberQueryKeys;
  useMe: () => UseQueryResult<ApiSuccessResponse<TMeResponse>>;
  prefetchMe: () => Promise<DehydratedState>;
  useUpdateMe: () => UseMutationResult<
    ApiSuccessResponse<TMeResponse>,
    unknown,
    TUpdatePayload,
    { previousMe?: ApiSuccessResponse<TMeResponse> }
  >;
} & Partial<{
  useMyReport: () => UseQueryResult<ApiSuccessResponse<TReportResponse>>;
  prefetchMyReport: () => Promise<DehydratedState>;
  useNicknameExists: (
    nickname: string,
    options?: { enabled?: boolean }
  ) => UseQueryResult<ApiSuccessResponse<TNicknameExistsResponse>>;
  useDeleteMe: () => UseMutationResult<ApiSuccessResponse<null>, unknown, void>;
}>;
ㅍ;
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Member 도메인 전용 Query Hook Factory
 *
 * - members/me 단일 조회
 * - members/me 수정 (낙관적 업데이트 포함)
 * - members/me/report 조회
 * - members/nickname/exists 조회
 * - members/me 탈퇴
 *
 * DTO/응답 스펙이 확정되지 않은 상태를 고려해 제네릭 기본값을 제공합니다.
 */
export function createMemberHooks<
  TMeResponse = unknown,
  TUpdatePayload extends Record<string, unknown> = Record<string, unknown>,
  TReportResponse = unknown,
  TNicknameExistsResponse = unknown,
>(
  config: CreateMemberHooksConfig<
    TMeResponse,
    TUpdatePayload,
    TReportResponse,
    TNicknameExistsResponse
  >
): BaseMemberHooksReturn<TMeResponse, TUpdatePayload, TReportResponse, TNicknameExistsResponse> {
  const baseKey = config.queryKey ?? "member";

  const keys: MemberQueryKeys = {
    all: [baseKey] as const,
    me: () => [baseKey, "me"] as const,
    report: () => [baseKey, "report"] as const,
    nicknameExists: (nickname: string) => [baseKey, "nickname-exists", nickname] as const,
  };

  function useMe() {
    return useQuery({
      queryKey: keys.me(),
      queryFn: config.getMe,
      staleTime: config.staleTime,
    });
  }

  async function prefetchMe() {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
      queryKey: keys.me(),
      queryFn: config.getMe,
    });
    return dehydrate(queryClient);
  }

  function useUpdateMe() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: config.updateMe,
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey: keys.me() });

        const previousMe = queryClient.getQueryData<ApiSuccessResponse<TMeResponse>>(keys.me());

        if (previousMe && isRecord(previousMe.result) && isRecord(newData)) {
          queryClient.setQueryData<ApiSuccessResponse<TMeResponse>>(keys.me(), {
            ...previousMe,
            result: {
              ...previousMe.result,
              ...newData,
            } as TMeResponse,
          });
        }

        return { previousMe };
      },
      onError: (_, __, context) => {
        if (context?.previousMe) {
          queryClient.setQueryData(keys.me(), context.previousMe);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.me() });
        queryClient.invalidateQueries({ queryKey: keys.report() });
      },
    });
  }

  const result: BaseMemberHooksReturn<
    TMeResponse,
    TUpdatePayload,
    TReportResponse,
    TNicknameExistsResponse
  > = {
    keys,
    useMe,
    prefetchMe,
    useUpdateMe,
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

  if (config.checkNicknameExists) {
    result.useNicknameExists = function useNicknameExists(
      nickname: string,
      options?: { enabled?: boolean }
    ) {
      const trimmedNickname = nickname.trim();
      const enabled = options?.enabled ?? true;

      return useQuery({
        queryKey: keys.nicknameExists(trimmedNickname),
        queryFn: () => config.checkNicknameExists!(trimmedNickname),
        enabled: enabled && trimmedNickname.length > 0,
        staleTime: config.staleTime,
      });
    };
  }

  if (config.deleteMe) {
    result.useDeleteMe = function useDeleteMe() {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: config.deleteMe!,
        onSuccess: () => {
          queryClient.removeQueries({ queryKey: keys.me() });
          queryClient.removeQueries({ queryKey: keys.report() });
          queryClient.removeQueries({ queryKey: keys.all });
        },
      });
    };
  }

  return result;
}
