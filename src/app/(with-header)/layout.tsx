import dynamic from "next/dynamic";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";

const OnboardingModalWrapper = dynamic(
  () =>
    import("@/features/member/components/Onboarding/OnboardingModalWrapper").then(
      (mod) => mod.OnboardingModalWrapper
    ),
  { ssr: false }
);

/**
 * WithHeader Layout
 *
 * Header가 포함된 페이지 레이아웃
 * - Header: 공통 네비게이션
 * - children: 페이지 콘텐츠
 * - Footer: 공통 푸터
 * - OnboardingModal: firstLogin 시 자동 표시
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  let isAuthenticated = false;
  let memberProfile = null;

  try {
    const response = await queryClient.fetchQuery(memberQueries.me());
    memberProfile = response.result;
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
      {memberProfile?.firstLogin ? (
        <OnboardingModalWrapper
          defaultNickname={memberProfile.nickname}
          defaultProfileImageUrl={memberProfile.profileImageUrl}
        />
      ) : null}
    </HydrationBoundary>
  );
}
