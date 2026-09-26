import "server-only";

import { api } from "@/lib/api/api";

import type { GetMyReportSessionsResponse, GetMyReportStatsResponse } from "../types";

export const memberServerApi = {
  getReportStats: async (): Promise<GetMyReportStatsResponse> => {
    return api.get<GetMyReportStatsResponse>("/members/me/report-stats");
  },

  getReportSessions: async (params: {
    page: number;
    size: number;
  }): Promise<GetMyReportSessionsResponse> => {
    return api.get<GetMyReportSessionsResponse>("/members/me/report-sessions", {
      params,
    });
  },
};
