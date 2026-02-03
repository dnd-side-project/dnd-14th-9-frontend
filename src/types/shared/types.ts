/**
 * API 에러 코드
 */

// TODO(장근호): 서버 확인 후 수정 예정
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
// TODO(장근호): 서버 확인 후 수정 예정
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
