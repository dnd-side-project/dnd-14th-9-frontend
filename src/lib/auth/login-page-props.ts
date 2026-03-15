import { REDIRECT_AFTER_LOGIN_COOKIE } from "./cookie-constants";
import { getLoginReasonMessage, normalizeInternalPath } from "./login-page-policy";

interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

interface LoginPagePropsParams {
  searchParams: Record<string, string | string[] | undefined>;
  cookieStore: CookieReader;
}

interface LoginPagePropsResult {
  reasonMessage: string | null;
  nextPath: string;
}

export function getLoginPageProps({
  searchParams,
  cookieStore,
}: LoginPagePropsParams): LoginPagePropsResult {
  const reasonParam = searchParams.reason;
  const reason = Array.isArray(reasonParam) ? reasonParam[0] : reasonParam;
  const reasonMessage = getLoginReasonMessage(reason);
  const nextPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  return { reasonMessage, nextPath };
}
