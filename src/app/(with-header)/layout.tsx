import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { OnboardingModalGate } from "@/features/member/components/Onboarding/OnboardingModalGate";
import { MAIN_SCROLL_ID } from "@/hooks/useBodyScrollLock";

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
  return (
    <>
      <div className="flex h-screen flex-col">
        <Header />
        <div id={MAIN_SCROLL_ID} className="flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <main className="mx-auto w-full max-w-7xl flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
      <OnboardingModalGate />
    </>
  );
}
