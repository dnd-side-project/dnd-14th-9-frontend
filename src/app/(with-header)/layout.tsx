import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";

/**
 * WithHeader Layout
 *
 * Header가 포함된 페이지 레이아웃
 * - Header: 공통 네비게이션
 * - children: 페이지 콘텐츠
 * - Footer: 공통 푸터
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  let isAuthenticated = false;

  try {
    await queryClient.fetchQuery(memberQueries.me());
    isAuthenticated = true;
  } catch {
    queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
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
