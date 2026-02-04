// TODO(장근호): 서버 확인 후 수정 예정
/**
 * API 에러 코드
 */

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "INVALID_INPUT"
  | "INTERNAL_ERROR";

/**
 * 공통 API 에러 응답
 */

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

/**
 * 페이지네이션 메타 정보
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 공통 API 성공 응답
 */
export interface ApiSuccessResponse<TData> {
  isSuccess: boolean;
  code: string;
  result: TData;
  message: string;
}

/**
 * 페이지네이션 포함 API 성공 응답
 */
export interface ApiPaginatedResponse<TData> extends ApiSuccessResponse<TData[]> {
  paginationMeta: PaginationMeta;
}
