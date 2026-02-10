import { api } from "@/lib/api/api";
import { buildQueryString, type QueryParams } from "@/lib/utils/url";
import type { ApiSuccessResponse } from "@/types/shared/types";
import type { SessionListParams, SessionListResponse } from "./types";

export const sessionApi = {
  getList: async (params: SessionListParams): Promise<ApiSuccessResponse<SessionListResponse>> => {
    const queryString = buildQueryString(params as QueryParams);
    return api.get<ApiSuccessResponse<SessionListResponse>>(`/api/sessions${queryString}`);
  },
};
