import { cookies } from "next/headers";

import { LoginModal } from "@/features/auth/components/LoginModal";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { normalizeInternalPath } from "@/lib/auth/login-policy";

export default async function Page() {
  const cookieStore = await cookies();
  const safeNextPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  return <LoginModal nextPath={safeNextPath} />;
}
