/**
 * Singleton Query Hook Factory
 *
 * /me와 같은 단일 리소스 엔드포인트를 위한 훅 팩토리입니다.
 * ID 없이 조회/수정/삭제하며, 낙관적 업데이트를 지원합니다.
 *
 * @example
 * const memberHooks = createSingletonHooks({
 *   queryKey: "member",
 *   get: () => api.get("/members/me"),
 *   update: (data) => api.patch("/members/me", data),
 *   remove: () => api.delete("/members/me"),
 *   optimisticUpdate: true,
 * });
 *
 * export const useMe = memberHooks.useGet;
 * export const useUpdateMe = memberHooks.useUpdate;
 * export const useDeleteMe = memberHooks.useDelete;
 */

import {
  QueryClient,
  dehydrate,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient as QueryClientType,
  type DehydratedState,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiSuccessResponse } from "@/types/shared/types";

interface SingletonHooksConfig<TResponse, TUpdateData, TResponseData> {
  queryKey: string;
  get: () => Promise<ApiSuccessResponse<TResponse>>;
  update?: (data: TUpdateData) => Promise<ApiSuccessResponse<TResponseData>>;
  remove?: () => Promise<ApiSuccessResponse<null>>;
  optimisticUpdate?: boolean;
  staleTime?: number;
  onUpdateSuccess?: (queryClient: QueryClientType) => void;
}

type SingletonBaseReturn<TResponse> = {
  keys: {
    all: readonly [string];
    data: () => readonly [string, "data"];
  };
  useGet: () => UseQueryResult<ApiSuccessResponse<TResponse>>;
  prefetch: () => Promise<DehydratedState>;
};

type SingletonWithUpdate<TUpdateData, TResponseData, TResponse> = {
  useUpdate: () => UseMutationResult<
    ApiSuccessResponse<TResponseData>,
    unknown,
    TUpdateData,
    { previousData?: ApiSuccessResponse<TResponse> }
  >;
};

type SingletonWithDelete = {
  useDelete: () => UseMutationResult<ApiSuccessResponse<null>, unknown, void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createSingletonHooks<
  TResponse = unknown,
  TUpdateData extends Record<string, unknown> = Record<string, unknown>,
  TResponseData = TResponse,
>(
  config: SingletonHooksConfig<TResponse, TUpdateData, TResponseData>
): SingletonBaseReturn<TResponse> &
  Partial<SingletonWithUpdate<TUpdateData, TResponseData, TResponse>> &
  Partial<SingletonWithDelete> {
  const keys = {
    all: [config.queryKey] as const,
    data: () => [config.queryKey, "data"] as const,
  };

  function useGet() {
    return useQuery({
      queryKey: keys.data(),
      queryFn: config.get,
      staleTime: config.staleTime,
    });
  }

  async function prefetch() {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
      queryKey: keys.data(),
      queryFn: config.get,
    });
    return dehydrate(queryClient);
  }

  const result: SingletonBaseReturn<TResponse> &
    Partial<SingletonWithUpdate<TUpdateData, TResponseData, TResponse>> &
    Partial<SingletonWithDelete> = {
    keys,
    useGet,
    prefetch,
  };

  if (config.update) {
    const update = config.update;
    const optimistic = config.optimisticUpdate ?? false;

    result.useUpdate = function useUpdate() {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: update,
        onMutate: optimistic
          ? async (newData) => {
              await queryClient.cancelQueries({ queryKey: keys.data() });
              const previousData = queryClient.getQueryData<ApiSuccessResponse<TResponse>>(
                keys.data()
              );

              if (previousData && isRecord(previousData.result) && isRecord(newData)) {
                queryClient.setQueryData<ApiSuccessResponse<TResponse>>(keys.data(), {
                  ...previousData,
                  result: {
                    ...previousData.result,
                    ...newData,
                  } as TResponse,
                });
              }

              return { previousData };
            }
          : undefined,
        onError: optimistic
          ? (_, __, context) => {
              if (context?.previousData) {
                queryClient.setQueryData(keys.data(), context.previousData);
              }
            }
          : undefined,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: keys.data() });
          config.onUpdateSuccess?.(queryClient);
        },
      });
    };
  }

  if (config.remove) {
    const remove = config.remove;
    result.useDelete = function useDelete() {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: remove,
        onSuccess: () => {
          queryClient.removeQueries({ queryKey: keys.all });
        },
      });
    };
  }

  return result;
}
