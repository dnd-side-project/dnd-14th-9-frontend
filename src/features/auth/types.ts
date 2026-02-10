import type { ApiSuccessResponse } from "@/types/shared/types";

/**
 * 로그아웃 API 응답 타입
 */
export type LogoutResponse = ApiSuccessResponse<null>;

export interface OAuthProviderButtonConfig {
  buttonClassName: string;
  label: string;
  labelClassName: string;
  spinnerClassName: string;
}
