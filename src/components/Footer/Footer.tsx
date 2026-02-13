import Link from "next/link";

/**
 * Footer - 공통 푸터
 * Figma Node ID: 1466-22771
 */
export function Footer() {
  return (
    <footer className="bg-surface-strong w-full">
      {/* Top Divider */}
      <div className="border-border-gray-default mx-auto h-[2px] w-full max-w-[1280px]" />

      <div className="px-lg md:px-xl pb-xl gap-lg mx-auto flex w-full max-w-[1280px] flex-col justify-center pt-[32px] lg:px-[50px] xl:px-[120px]">
        {/* Top Section */}
        <div className="gap-xs flex w-full flex-col items-start">
          {/* Logo */}
          <div className="py-3xs flex flex-col items-start rounded-sm px-[8px]">
            <Link href="/" aria-label="GAK 홈으로 이동">
              <span className="text-text-disabled text-[24px] leading-[1.2] font-bold">GAK</span>
            </Link>
          </div>

          {/* Links */}
          <nav aria-label="푸터 링크" className="w-full">
            <ul className="gap-md flex flex-wrap items-center">
              <li>
                <Link
                  href="/terms"
                  className="py-3xs text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm px-[8px] text-[12px] leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="py-3xs text-text-disabled hover:text-text-primary focus-visible:ring-primary rounded-sm px-[8px] text-[12px] leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="py-3xs text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm px-[8px] text-[12px] leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  쿠키 정책
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="py-3xs text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm px-[8px] text-[12px] leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  쿠키 설정
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Info Area */}
        <div className="flex w-full flex-col items-start px-[8px]">
          <p className="text-text-disabled text-[12px] leading-[1.4] whitespace-pre-wrap">
            footer에 들어갈 내용을 작성해 주세요.
          </p>
        </div>

        {/* Rights */}
        <div className="flex w-full flex-col items-start justify-center px-[8px]">
          <div className="bg-border-subtle h-px w-full shrink-0" />
          <div className="py-sm flex w-full items-center">
            <p className="text-[11px] leading-[1.4] text-gray-700">
              © 2026 GAK. all rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
