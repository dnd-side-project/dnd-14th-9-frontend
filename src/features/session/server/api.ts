import "server-only";

import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type { SessionDetailResponse } from "../types";

export const sessionServerApi = {
  getDetail: async (sessionId: string): Promise<ApiSuccessResponse<SessionDetailResponse>> => {
    return api.get<ApiSuccessResponse<SessionDetailResponse>>(`/sessions/${sessionId}`);
  },
};
