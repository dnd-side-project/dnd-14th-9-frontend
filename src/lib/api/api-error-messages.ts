import type { ApiErrorCode } from "@/types/shared/types";

export const DEFAULT_API_ERROR_MESSAGE =
  "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

export const API_ERROR_MESSAGE_MAP = {
  COMMON500: "서버 처리 중 오류가 발생했습니다.",
  COMMON400_1: "잘못된 요청입니다.",

  AUTH401_1: "올바르지 않은 Authorization 헤더입니다.",
  AUTH401_2: "토큰 형식이 올바르지 않습니다.",
  AUTH401_3: "기한이 만료된 Access 토큰입니다.",
  AUTH401_4: "지원하지 않는 소셜 로그인 제공자입니다.",
  AUTH401_5: "기한이 만료된 Refresh 토큰입니다.",
  AUTH401_6: "존재하지 않는 Refresh 토큰입니다.",
  AUTH401_7: "Refresh 토큰이 전달되지 않았습니다.",
  AUTH401_8: "Refresh 토큰 정보가 일치하지 않습니다.",

  AWS500_1: "S3 업로드에 실패했습니다.",
  AWS500_2: "S3 파일 삭제에 실패했습니다.",
  AWS500_3: "S3 파일 조회에 실패했습니다.",
} as const;

export function getApiErrorMessageByCode(
  code: ApiErrorCode | string | null | undefined
): string | null {
  if (!code) return null;

  if (Object.hasOwn(API_ERROR_MESSAGE_MAP, code)) {
    return API_ERROR_MESSAGE_MAP[code as keyof typeof API_ERROR_MESSAGE_MAP];
  }

  return null;
}
