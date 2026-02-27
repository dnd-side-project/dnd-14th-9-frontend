/**
 * CRUD Query Hook Factory
 *
 * 반복적인 React Query CRUD 훅 패턴을 팩토리로 통합합니다.
 * 목록 조회, 상세 조회, 생성, 수정, 삭제, prefetch를 자동 생성합니다.
 *
 * getList만 필수이며, 나머지(getDetail / create / update / remove)는 선택적입니다.
 * 전달하지 않은 옵션에 해당하는 훅은 생성되지 않습니다.
 *
 * @example
 * // 전체 CRUD 포함
 * const sessionCrud = createCrudHooks({
 *   queryKey: "sessions",
 *   getList: getSessions,
 *   getDetail: getSession,
 *   create: postSession,
 *   update: patchSession,
 *   remove: deleteSession,
 * });
 *
 * export const useSessions = sessionCrud.useList;
 * export const useSession = sessionCrud.useDetail;
 * export const useCreateSession = sessionCrud.useCreate;
 * export const useUpdateSession = sessionCrud.useUpdate;
 * export const useDeleteSession = sessionCrud.useDelete;
 *
 * @see createSingletonHooks - /me와 같은 단일 리소스용 훅 팩토리
 */

/**
 * Query Key Factory 구조
 *
 * React Query는 키 배열의 앞부분이 일치하면 함께 무효화됩니다.
 * 이 계층 구조를 활용해 세밀한 캐시 제어가 가능합니다.
 *
 * @example queryKey: "sessions"인 경우
 * ```
 * keys.all           → ["sessions"]                        // 전체 무효화
 * keys.lists()       → ["sessions", "list"]                // 모든 목록 무효화
 * keys.list(params)  → ["sessions", "list", { page: 1 }]   // 특정 조건의 목록
 * keys.detail(id)    → ["sessions", "detail", "abc123"]    // 특정 상세
 * ```
 *
 * @example 무효화 범위
 * ```
 * invalidateQueries({ queryKey: keys.all })     // sessions 관련 전체
 * invalidateQueries({ queryKey: keys.lists() }) // 목록만 (detail 유지)
 * invalidateQueries({ queryKey: keys.detail(id) }) // 특정 상세만
 * ```
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  dehydrate,
  type UseQueryResult,
  type UseMutationResult,
  type DehydratedState,
} from "@tanstack/react-query";

import { getQueryClient } from "@/lib/getQueryClient";
import { ApiSuccessResponse } from "@/types/shared/types";

interface CrudHooksConfig<
  TListParams,
  TListResponse,
  TDetailResponse,
  TCreateData,
  TUpdateData,
  TResponseData,
> {
  queryKey: string;
  getList: (params: TListParams) => Promise<TListResponse>;
  getDetail?: (id: string) => Promise<TDetailResponse>;
  create?: (data: TCreateData) => Promise<ApiSuccessResponse<TResponseData>>;
  update?: (id: string, data: Partial<TUpdateData>) => Promise<ApiSuccessResponse<TResponseData>>;
  remove?: (id: string) => Promise<ApiSuccessResponse<null>>;
  staleTime?: number;
}

type BaseReturn<TListParams, TListResponse> = {
  keys: {
    /** ["queryKey"] - 해당 리소스의 모든 쿼리 무효화 시 사용 */
    all: readonly [string];
    /** ["queryKey", "list"] - 모든 목록 쿼리 무효화 시 사용 */
    lists: () => readonly [string, "list"];
    /** ["queryKey", "list", params] - 특정 파라미터의 목록 쿼리 */
    list: (params: TListParams) => readonly [string, "list", TListParams];
    /** ["queryKey", "detail", id] - 특정 ID의 상세 쿼리 */
    detail: (id: string) => readonly [string, "detail", string];
  };
  useList: (params: TListParams) => UseQueryResult<TListResponse>;
  prefetch: (params: TListParams) => Promise<DehydratedState>;
};

type WithCreate<TCreateData, TResponseData> = {
  useCreate: () => UseMutationResult<ApiSuccessResponse<TResponseData>, unknown, TCreateData>;
};

type WithDetail<TDetailResponse> = {
  useDetail: (id: string) => UseQueryResult<TDetailResponse>;
};

type WithUpdate<TUpdateData, TResponseData> = {
  useUpdate: () => UseMutationResult<
    ApiSuccessResponse<TResponseData>,
    unknown,
    { id: string; data: Partial<TUpdateData> }
  >;
};

type WithDelete = {
  useDelete: () => UseMutationResult<ApiSuccessResponse<null>, unknown, string>;
};

// 구현부
export function createCrudHooks<
  TListParams,
  TListResponse,
  TDetailResponse,
  TCreateData,
  TUpdateData,
  TResponseData = unknown,
>(
  config: CrudHooksConfig<
    TListParams,
    TListResponse,
    TDetailResponse,
    TCreateData,
    TUpdateData,
    TResponseData
  >
): BaseReturn<TListParams, TListResponse> &
  Partial<WithCreate<TCreateData, TResponseData>> &
  Partial<WithDetail<TDetailResponse>> &
  Partial<WithUpdate<TUpdateData, TResponseData>> &
  Partial<WithDelete> {
  const keys = {
    all: [config.queryKey] as const,
    lists: () => [config.queryKey, "list"] as const,
    list: (params: TListParams) => [config.queryKey, "list", params] as const,
    detail: (id: string) => [config.queryKey, "detail", id] as const,
  };

  function useList(params: TListParams) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => config.getList(params),
      staleTime: config.staleTime,
    });
  }

  async function prefetch(params: TListParams) {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
      queryKey: keys.list(params),
      queryFn: () => config.getList(params),
    });

    return dehydrate(queryClient);
  }

  const result: BaseReturn<TListParams, TListResponse> &
    Partial<WithCreate<TCreateData, TResponseData>> &
    Partial<WithDetail<TDetailResponse>> &
    Partial<WithUpdate<TUpdateData, TResponseData>> &
    Partial<WithDelete> = {
    keys,
    useList,
    prefetch,
  };

  // create가 있으면 useCreate 추가
  if (config.create) {
    const create = config.create;
    result.useCreate = function useCreate() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (data: TCreateData) => create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: keys.lists() });
        },
      });
    };
  }

  // getDetail이 있으면 useDetail 추가
  if (config.getDetail) {
    const getDetail = config.getDetail;
    result.useDetail = function useDetail(id: string) {
      return useQuery({
        queryKey: keys.detail(id),
        queryFn: () => getDetail(id),
        staleTime: config.staleTime,
      });
    };
  }

  // update가 있으면 useUpdate 추가
  if (config.update) {
    const update = config.update;
    result.useUpdate = function useUpdate() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TUpdateData> }) => update(id, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: keys.lists() });
          queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
        },
      });
    };
  }

  // remove가 있으면 useDelete 추가
  if (config.remove) {
    const remove = config.remove;
    result.useDelete = function useDelete() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: string) => remove(id),
        onSuccess: (_, id) => {
          queryClient.invalidateQueries({ queryKey: keys.lists() });
          queryClient.invalidateQueries({ queryKey: keys.detail(id) });
        },
      });
    };
  }

  return result;
}
