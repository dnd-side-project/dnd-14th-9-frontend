"use client";

import Image from "next/image";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";

/**
 * FeedbackBanner — 피드백 참여 유도 CTA 배너
 *
 * 시안 그라데이션 배경에 피드백 배너 아트워크를 표시한다.
 * hover 시 버튼/아트워크 스타일이 변경된다.
 */

const FEEDBACK_FORM_URL = "https://forms.gle/T8dyZ7WKoG9tBLsG6";

interface FeedbackBannerProps {
  isHovered: boolean;
}

export function FeedbackBanner({ isHovered }: FeedbackBannerProps) {
  return (
    <section className="border-sm border-alpha-white-16 relative flex h-[264px] w-full items-center overflow-hidden rounded-sm bg-linear-to-b from-cyan-800 from-0% to-cyan-500 to-100%">
      {/* Content Container */}
      <div className="gap-2xl p-4xl relative z-10 flex flex-1 flex-col">
        <div className="gap-2xs text-text-primary flex w-[384px] flex-col">
          <h2 className="text-2xl leading-[1.4] font-bold">
            GAK을 사용해보고 느낀 점을 알려주세요
          </h2>
          <p className="text-base leading-[1.4] font-normal">
            사용 경험을 바탕으로 솔직한 의견을 들려주세요.
          </p>
        </div>

        <ButtonLink
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          colorScheme="secondary"
          size="medium"
          className={`border-sm gap-xs py-sm pr-md pl-lg hover:border-alpha-white-48 hover:bg-alpha-white-24 hover:text-text-primary h-11 w-fit rounded-sm text-[14px] leading-[1.4] font-semibold transition-colors duration-300 ${
            isHovered
              ? "text-text-primary border-alpha-white-48 bg-alpha-white-24"
              : "border-alpha-white-24 bg-alpha-white-8 text-cyan-200"
          }`}
          rightIcon={<ChevronRightIcon />}
        >
          피드백 남기기
        </ButtonLink>
      </div>

      {/* Image Container */}
      <div className="relative h-full w-[54%] shrink-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/images/banner/feedback-banner-artwork-desktop.svg"
          alt=""
          fill
          className={`object-contain transition-opacity duration-700 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          priority
        />
        <Image
          src="/images/banner/feedback-banner-artwork-desktop-hover.svg"
          alt=""
          fill
          className={`object-contain transition-opacity duration-700 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          priority
        />
      </div>
    </section>
  );
}
