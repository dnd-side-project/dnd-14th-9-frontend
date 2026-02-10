export const LOGIN_PROVIDERS = ["google", "kakao"] as const;

export const LOGIN_REASON_MESSAGES = {
  auth_required: "로그인이 필요합니다.",
  refresh_token_missing: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  network_error: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  invalid_response: "로그인 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.",
  config_error: "로그인 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  no_token: "로그인 처리가 완료되지 않았습니다. 다시 시도해 주세요.",
  access_denied: "로그인이 취소되었습니다.",
} as const;
