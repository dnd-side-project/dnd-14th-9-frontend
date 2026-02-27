"use client";

import Image from "next/image";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";

/**
 * FeedbackBanner — 피드백 참여 유도 CTA 배너
 *
 * 시안 그라데이션 배경에 GAK 로고타입과 기하학 라인을 표시한다.
 * hover 시 버튼 스타일이 변경된다.
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

      {/* Image Container: GAK 로고타입 + 기하학 라인 */}
      <div className="relative h-full w-[54%] shrink-0 overflow-hidden">
        {/* GAK 로고타입 — hover 시 채워진 버전으로 점차 전환 */}
        <div className="absolute top-[99px] left-[207px] h-[64px] w-[240px]">
          {/* 기본 상태: 아웃라인 로고 */}
          <Image
            src="/images/banner/gak-logotype.svg"
            alt="GAK"
            fill
            className="object-contain"
            priority
          />
          {/* hover 상태: 채워진 로고 (opacity 전환) */}
          <Image
            src="/images/banner/Logotype.svg"
            alt=""
            fill
            className={`object-contain transition-opacity duration-700 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
        </div>

        {/* 기하학 라인 */}
        <div className="absolute top-[-212px] left-[-106px] h-[688px] w-[691px]">
          <Image
            src="/images/banner/feedback-lines.svg"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
