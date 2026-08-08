import { notFound } from "next/navigation";

import { ApiError } from "@/lib/api/api-client";

/**
 * 세션 조회 에러 처리: 404(삭제되었거나 존재하지 않는 세션)면 세션 not-found 페이지를 렌더링하고,
 * 그 외 에러는 그대로 다시 던져 에러 바운더리로 위임한다.
 */
export function handleSessionNotFound(error: unknown): never {
  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }
  throw error;
}
