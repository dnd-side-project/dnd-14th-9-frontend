import { ApiError } from "@/lib/api/api-client";

import { DEFAULT_API_ERROR_MESSAGE } from "./error-codes";

export function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
}
