import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type { WaitingMembersEventData } from "./types";

export const lobbyApi = {
  getWaitingMembers: async (
    sessionId: string
  ): Promise<ApiSuccessResponse<WaitingMembersEventData>> => {
    return api.get<ApiSuccessResponse<WaitingMembersEventData>>(
      `/api/sessions/${sessionId}/waiting-room`
    );
  },
};
