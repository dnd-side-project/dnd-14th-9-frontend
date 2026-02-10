import { LoginPage } from "@/features/auth/components/LoginPage";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { normalizeInternalPath } from "@/lib/auth/login-flow";
import { cookies } from "next/headers";

interface LoginPageRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const REASON_MESSAGES: Record<string, string> = {
  auth_required: "로그인이 필요합니다.",
  refresh_token_missing: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  network_error: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  config_error: "로그인 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  no_token: "로그인 처리가 완료되지 않았습니다. 다시 시도해 주세요.",
  access_denied: "로그인이 취소되었습니다.",
};

export default async function Page({ searchParams }: LoginPageRouteProps) {
  const params = await searchParams;
  const reasonParam = params.reason;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;
  const reasonMessage = reason ? (REASON_MESSAGES[reason] ?? null) : null;

  const cookieStore = await cookies();
  const safeNextPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  return <LoginPage reasonMessage={reasonMessage} nextPath={safeNextPath} />;
}
