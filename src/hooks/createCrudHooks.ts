/**
 * CRUD Query Hook Factory
 *
 * 반복적인 React Query CRUD 훅 패턴을 팩토리로 통합합니다.
 * 목록 조회, 생성, 수정, 삭제, prefetch를 자동 생성합니다.
 *
 * update / remove를 전달하지 않으면 useUpdate / useDelete 훅이 생성되지 않습니다.
 *
 * @example
 * // update/delete 포함
 * const sessionCrud = createCrudHooks({
 *   queryKey: "sessions",
 *   getList: getSessions,
 *   create: postSession,
 *   update: patchSession,
 *   remove: deleteSession,
 * });
 *
 * export const useSessions = sessionCrud.useList;
 * export const useCreateSession = sessionCrud.useCreate;
 * export const useUpdateSession = sessionCrud.useUpdate;
 * export const useDeleteSession = sessionCrud.useDelete;
 *
 * @example
 * // update/delete 제외 (수동 정의 필요 시)
 * const studentCrud = createCrudHooks({
 *   queryKey: "sessions",
 *   getList: getSessions,
 *   create: postSession,
 * });
 *
 * export const useSessions = sessionCrud.sessionList;
 * export const useCreateSession = sessionCrud.useCreate;
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
  TCreateData,
  TUpdateData = never,
  TResponseData = unknown,
> {
  queryKey: string;
  getList: (params: TListParams) => Promise<TListResponse>;
  create: (data: TCreateData) => Promise<ApiSuccessResponse<TResponseData>>;
  update?: (id: string, data: TUpdateData) => Promise<ApiSuccessResponse<TResponseData>>;
  remove?: (id: string) => Promise<ApiSuccessResponse<null>>;
  staleTime?: number;
}

type CrudHooksReturn<TListParams, TListResponse, TCreateData, TUpdateData, TResponseData> = {
  keys: {
    all: readonly [string];
    lists: () => readonly [string, "list"];
    list: (params: TListParams) => readonly [string, "list", TListParams];
  };
  useList: (params: TListParams) => UseQueryResult<TListResponse>;
  useCreate: () => UseMutationResult<ApiSuccessResponse<TResponseData>, unknown, TCreateData>;
  prefetch: (params: TListParams) => Promise<DehydratedState>;
} & ([TUpdateData] extends [never]
  ? object
  : {
      useUpdate: () => UseMutationResult<
        ApiSuccessResponse<TResponseData>,
        unknown,
        { id: string; data: Partial<TUpdateData> }
      >;
      useDelete: () => UseMutationResult<ApiSuccessResponse<null>, unknown, string>;
    });
