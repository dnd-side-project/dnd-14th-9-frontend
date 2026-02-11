import { cookies } from "next/headers";

import { LoginPage } from "@/features/auth/components/LoginPage";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { getLoginReasonMessage, normalizeInternalPath } from "@/lib/auth/login-policy";

interface LoginPageRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: LoginPageRouteProps) {
  const params = await searchParams;
  const reasonParam = params.reason;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;
  const reasonMessage = getLoginReasonMessage(reason);

  const cookieStore = await cookies();
  const safeNextPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  return <LoginPage reasonMessage={reasonMessage} nextPath={safeNextPath} />;
}
