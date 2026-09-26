import "server-only";

import { api } from "@/lib/api/api";

import type {
  GetMeResponse,
  GetMyReportSessionsResponse,
  GetMyReportStatsResponse,
} from "../types";

export const memberServerApi = {
  getMe: async (): Promise<GetMeResponse> => {
    return api.get<GetMeResponse>("/members/me/profile", {
      retry: { maxRetries: 0 },
      timeout: 5000,
    });
  },

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
