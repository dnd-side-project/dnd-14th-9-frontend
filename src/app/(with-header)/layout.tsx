import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";

/**
 * WithHeader Layout
 *
 * Header가 포함된 페이지 레이아웃
 * - Header: 공통 네비게이션
 * - children: 페이지 콘텐츠
 * - Footer: 공통 푸터
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
