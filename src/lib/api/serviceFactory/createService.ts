/**
 * createService
 *
 * 기본 CRUD 서비스를 생성하는 팩토리 함수
 *
 * @example
 * ```ts
 * const sessionService = createService<
 *   Session,
 *   SessionDetail,
 *   GetSessionRequest,
 *   PostSessionRequest,
 *   PatchSessionRequest
 * >({
 *   basePath: "/api/sessions",
 *   cachedMethods: ["getOne"],
 * });
 *
 * // 사용
 * const sessions = await sessionsService.getList({ session_id: "org_123" });
 * const session = await sessionService.getOne("std_123");
 * ```
 */

import { api } from "@/lib/api/api-client";
import { buildQueryString } from "@/lib/utils/url";
import type { ApiSuccessResponse, ApiPaginatedResponse } from "@/types/shared/types";
import { DeleteResponse, ServiceConfig } from "./types";

export function createService<
  TEntity,
  TDetail,
  TListParams extends Record<string, string | number | boolean | null | undefined>,
  TCreateData,
  TUpdateData,
>(config: ServiceConfig) {
  const { basePath } = config;

  const getListBase = async (params: TListParams): Promise<ApiPaginatedResponse<TEntity>> => {
    return api.get<ApiPaginatedResponse<TEntity>>(basePath, {
      params: buildQueryString(params),
    });
  };

  // 기본 getOne 구현
  const getOneBase = async (id: string): Promise<ApiSuccessResponse<TDetail>> => {
    return api.get<ApiSuccessResponse<TDetail>>(`${basePath}/${id}`);
  };

  // 기본 create 구현
  const create = async (data: TCreateData): Promise<ApiSuccessResponse<TDetail>> => {
    return api.post<ApiSuccessResponse<TDetail>>(basePath, data);
  };

  // 기본 update 구현
  const update = async (id: string, data: TUpdateData): Promise<ApiSuccessResponse<TDetail>> => {
    return api.patch<ApiSuccessResponse<TDetail>>(`${basePath}/${id}`, data);
  };

  // 기본 remove 구현
  const remove = async (id: string): Promise<DeleteResponse> => {
    return api.delete<DeleteResponse>(`${basePath}/${id}`);
  };

  return {
    getListBase,
    getOneBase,
    create,
    update,
    remove,
  };
}
