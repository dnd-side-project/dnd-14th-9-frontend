/**
 * CRUD Query Hook Factory
 *
 * 반복적인 React Query CRUD 훅 패턴을 팩토리로 통합합니다.
 * 목록 조회, 상세 조회, 생성, 수정, 삭제, prefetch를 자동 생성합니다.
 *
 * getDetail / update / remove를 전달하지 않으면 해당 훅이 각각 생성되지 않습니다.
 * 각 옵션은 독립적으로 설정할 수 있습니다.
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
 * @example
 * // 목록/상세 조회 + 생성만 (수정/삭제 없음)
 * const studentCrud = createCrudHooks({
 *   queryKey: "students",
 *   getList: getStudents,
 *   getDetail: getStudent,
 *   create: postStudent,
 * });
 *
 * export const useStudents = studentCrud.useList;
 * export const useStudent = studentCrud.useDetail;
 * export const useCreateStudent = studentCrud.useCreate;
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  dehydrate,
  type UseQueryResult,
  type UseMutationResult,
  type DehydratedState,
} from "@tanstack/react-query";
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
  create: (data: TCreateData) => Promise<ApiSuccessResponse<TResponseData>>;
  update?: (id: string, data: Partial<TUpdateData>) => Promise<ApiSuccessResponse<TResponseData>>;
  remove?: (id: string) => Promise<ApiSuccessResponse<null>>;
  staleTime?: number;
}

type BaseReturn<TListParams, TListResponse, TCreateData, TResponseData> = {
  keys: {
    all: readonly [string];
    lists: () => readonly [string, "list"];
    list: (params: TListParams) => readonly [string, "list", TListParams];
    detail: (id: string) => readonly [string, "detail", string];
  };
  useList: (params: TListParams) => UseQueryResult<TListResponse>;
  useCreate: () => UseMutationResult<ApiSuccessResponse<TResponseData>, unknown, TCreateData>;
  prefetch: (params: TListParams) => Promise<DehydratedState>;
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
): BaseReturn<TListParams, TListResponse, TCreateData, TResponseData> &
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

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: TCreateData) => config.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.lists() });
      },
    });
  }

  async function prefetch(params: TListParams) {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
      queryKey: keys.list(params),
      queryFn: () => config.getList(params),
    });

    return dehydrate(queryClient);
  }

  const result: BaseReturn<TListParams, TListResponse, TCreateData, TResponseData> &
    Partial<WithDetail<TDetailResponse>> &
    Partial<WithUpdate<TUpdateData, TResponseData>> &
    Partial<WithDelete> = {
    keys,
    useList,
    useCreate,
    prefetch,
  };

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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.lists() }),
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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.lists() }),
      });
    };
  }

  return result;
}
