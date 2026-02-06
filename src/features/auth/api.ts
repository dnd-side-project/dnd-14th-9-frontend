import { api } from "@/lib/api/api";
import type { LogoutResponse } from "./types";

/**
 * 인증 관련 API
 */
export const authApi = {
  /**
   * 로그아웃
   * - 서버에서 쿠키 삭제 처리
   * - 클라이언트는 응답 성공 후 상태 정리 및 리다이렉트 처리
   */
  logout: async (): Promise<LogoutResponse> => {
    return api.post<LogoutResponse>("/auth/logout");
  },
};
