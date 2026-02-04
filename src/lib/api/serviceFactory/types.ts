import type { ApiSuccessResponse } from "@/types/shared/types";

export type DeleteResponse = ApiSuccessResponse<null>;

/**
 * 서비스 설정 옵션
 */
export interface ServiceConfig {
  /** API 기본 경로 (예: "/api/sessions") */
  basePath: string;
  /** React.cache로 래핑할 메서드들 */
  cachedMethods?: ("getOne" | "getList")[];
}
