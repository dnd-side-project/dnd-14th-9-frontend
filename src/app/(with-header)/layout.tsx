import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { memberApi } from "@/features/member/api";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import { getServerAuthState } from "@/lib/auth/server";

/**
 * WithHeader Layout
 *
 * Header가 포함된 페이지 레이아웃
 * - Header: 공통 네비게이션
 * - children: 페이지 콘텐츠
 * - Footer: 공통 푸터
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await getServerAuthState();
  const queryClient = new QueryClient();

  if (isAuthenticated) {
    await queryClient.prefetchQuery({
      queryKey: memberKeys.me(),
      queryFn: memberApi.getMe,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-screen flex-col">
        <Header isAuthenticated={isAuthenticated} />
        <main className="mx-auto w-full max-w-7xl flex-1">{children}</main>
        <Footer />
      </div>
    </HydrationBoundary>
  );
}
