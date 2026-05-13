import Image from "next/image";
import Link from "next/link";

import {
  COOKIE_POLICY_ROUTE,
  PRIVACY_ROUTE,
  ROOT_ROUTE,
  TERMS_ROUTE,
} from "@/lib/routes/route-paths";
import { getCurrentYear } from "@/lib/utils/date";

/**
 * Footer - 공통 푸터
 * Figma Node ID: 169:34263 (Desktop), 169:34314 (Tablet), 169:34336 (Mobile)
 */
export function Footer() {
  const currentYear = getCurrentYear();

  return (
    <footer className="bg-surface-strong w-full">
      {/* Top Divider */}
      <div className="bg-border-gray-default mx-auto h-[2px] w-full max-w-[1280px]" />

      <div className="px-lg md:px-xl pb-xl mx-auto flex w-full max-w-[1280px] flex-col justify-center gap-[20px] pt-[32px] xl:px-[120px]">
        {/* Top Section */}
        <div className="gap-2xs md:gap-xs flex w-full flex-col items-start">
          {/* Logo Container */}
          <div className="p-sm flex flex-col items-start rounded-sm">
            <Link href={ROOT_ROUTE} aria-label="GAK 홈으로 이동">
              <Image
                src="/footer-logo.svg"
                alt="GAK"
                width={90}
                height={24}
                className="h-[20px] w-[75px] md:h-[24px] md:w-[90px]"
                priority
              />
            </Link>
          </div>

          {/* Button Container */}
          <nav aria-label="푸터 링크" className="w-full">
            <ul className="flex flex-wrap items-center gap-[8px] md:gap-[16px]">
              <li>
                <Link
                  href={TERMS_ROUTE}
                  className="text-text-muted hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href={PRIVACY_ROUTE}
                  className="text-text-tertiary hover:text-text-primary focus-visible:ring-primary rounded-sm p-[8px] text-xs leading-[1.4] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href={COOKIE_POLICY_ROUTE}
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
          {/* Description Container */}
          <div className="flex w-full items-center justify-center">
            <div className="text-text-disabled min-w-px flex-1 text-[11px] leading-none whitespace-pre-wrap md:text-xs">
              <p className="mb-0 leading-[1.4]">GAK 문의 / 제휴: dnd9team@gmail.com</p>
              <p className="mb-0 leading-[1.4]">​</p>
              <p className="leading-[1.4]">
                모든 제작물의 저작건은 GAK의 소유이므로 사전 허가 없이 무단복제, 도용을 금합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Rights */}
        <div className="flex w-full flex-col items-start justify-center px-[8px]">
          <div className="bg-border-subtle h-px w-full shrink-0" />
          <div className="py-sm flex w-full items-center">
            <p className="min-w-px flex-1 text-[10px] leading-[1.4] text-gray-700 md:text-[11px]">
              © {currentYear} GAK by DND 9team. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
