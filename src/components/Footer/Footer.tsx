import Image from "next/image";
import Link from "next/link";

import { getCurrentYear } from "@/lib/utils/date";

/**
 * Footer - 공통 푸터
 * Figma Node ID: 1466-22771
 */
export function Footer() {
  const currentYear = getCurrentYear();

  return (
    <footer className="bg-surface-strong w-full">
      {/* Top Divider */}
      <div className="border-border-gray-default mx-auto h-[2px] w-full max-w-[1280px]" />

      <div className="px-lg md:px-xl pb-xl mx-auto flex w-full max-w-[1280px] flex-col justify-center gap-[20px] pt-[32px] xl:px-[120px]">
        {/* Top Section */}
        <div className="gap-2xs md:gap-xs flex w-full flex-col items-start">
          {/* Logo */}
          <div className="p-sm flex flex-col items-start rounded-sm">
            <Link href="/" aria-label="GAK 홈으로 이동">
              <Image
                src="/footer-logo.svg"
                alt="GAK"
                width={105}
                height={40}
                className="h-9 w-[90px] md:h-10 md:w-[105px]"
                priority
              />
            </Link>
          </div>

          {/* Links */}
          <nav aria-label="푸터 링크" className="w-full">
            <ul className="md:gap-md flex flex-wrap items-center gap-[16px]">
              <li>
                <Link
                  href="/terms"
                  className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-disabled hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  개인정보 처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  쿠키 정책
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  쿠키 설정
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Info Area */}
        <div className="flex w-full flex-col items-start px-[8px]">
          <p className="text-text-disabled text-xs leading-[1.4] whitespace-pre-wrap">
            GAK 문의 / 제휴: dnd9team@gmail.com
          </p>
          <br />
          <p className="text-text-disabled text-xs leading-[1.4] whitespace-pre-wrap">
            모든 제작물의 저작건은 GAK의 소유이므로 사전 허가 없이 무단복제, 도용을 금합니다.
          </p>
        </div>

        {/* Rights */}
        <div className="flex w-full flex-col items-start justify-center px-[8px]">
          <div className="bg-border-subtle h-px w-full shrink-0" />
          <div className="py-sm flex w-full items-center">
            <p className="font-regular text-[10px] leading-[1.4] text-gray-700 md:text-[11px]">
              © {currentYear} GAK by DND 9team. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
