import type { BackendErrorCode } from "@/lib/error/error-codes";

/**
 * 백엔드 기준 HTTP Status 문자열
 */
export type HttpStatus = "BAD_REQUEST" | "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR" | (string & {});

/**
 * 백엔드 기준 성공 코드
 */
export type ApiSuccessCode = "COMMON200";

/**
 * 백엔드 기준 에러 코드
 */
export type ApiErrorCode = BackendErrorCode | (string & {});

/**
 * 백엔드 기준 전체 응답 코드
 */
export type ApiResponseCode = ApiSuccessCode | ApiErrorCode;

/**
 * 공통 API 에러 응답
 */
export interface ApiErrorResponse {
  httpStatus: HttpStatus;
  isSuccess: false;
  code: ApiErrorCode;
  message: string;
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
  code: ApiResponseCode;
  result: TData;
  message: string;
}

/**
 * 페이지네이션 포함 API 성공 응답
 */
export interface ApiPaginatedResponse<TData> extends ApiSuccessResponse<TData[]> {
  paginationMeta: PaginationMeta;
}
