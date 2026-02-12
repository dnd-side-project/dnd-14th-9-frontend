import { cookies } from "next/headers";

import { LoginModal } from "@/features/auth/components/LoginModal";
import { getLoginPageProps } from "@/lib/auth/auth-route-utils";

interface LoginModalPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: LoginModalPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const { reasonMessage, nextPath } = getLoginPageProps({
    searchParams: params,
    cookieStore,
  });

  return <LoginModal reasonMessage={reasonMessage} nextPath={nextPath} />;
}
