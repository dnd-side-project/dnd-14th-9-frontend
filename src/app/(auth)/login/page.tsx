import { cookies } from "next/headers";

import { LoginPage } from "@/features/auth/components/LoginPage";
import { getLoginPageProps } from "@/lib/auth/auth-route-utils";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "로그인",
  description: "각에 로그인하여 모각작 세션에 참여하세요.",
  pathname: "/login",
});

interface LoginPageRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: LoginPageRouteProps) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const { reasonMessage, nextPath } = getLoginPageProps({
    searchParams: params,
    cookieStore,
  });

  return <LoginPage reasonMessage={reasonMessage} nextPath={nextPath} />;
}
