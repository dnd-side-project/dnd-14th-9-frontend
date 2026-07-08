import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/shared/types";

export function ok<T>(result: T): ApiSuccessResponse<T> {
  return { isSuccess: true, code: "COMMON200", message: "OK", result };
}

export function fail(
  code: string,
  message: string,
  httpStatus: ApiErrorResponse["httpStatus"] = "BAD_REQUEST"
): ApiErrorResponse {
  return { isSuccess: false, code, message, httpStatus };
}
