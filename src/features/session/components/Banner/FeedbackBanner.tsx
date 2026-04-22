"use client";

import Image from "next/image";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";

const FEEDBACK_FORM_URL = "https://forms.gle/T8dyZ7WKoG9tBLsG6";

interface FeedbackBannerProps {
  isHovered: boolean;
}

export function FeedbackBanner({ isHovered }: FeedbackBannerProps) {
  return (
    <section className="border-sm border-alpha-white-16 xl:gap-3xl relative flex h-[264px] w-full flex-col items-start justify-between overflow-clip rounded-sm border-solid bg-linear-to-b from-cyan-800 to-cyan-500 xl:flex-row xl:items-center xl:justify-start">
      {/* Content Container */}
      <div className="px-2xl py-xl gap-md md:px-3xl md:py-2xl md:gap-lg xl:p-4xl xl:gap-2xl relative z-10 flex w-full shrink-0 flex-col items-start xl:h-full xl:w-auto xl:min-w-px xl:flex-1">
        <div className="gap-2xs text-text-primary flex w-full shrink-0 flex-col xl:w-[384px]">
          <h2 className="text-[18px] leading-[1.4] font-bold md:text-2xl">
            GAK을 사용해보고 느낀 점을 알려주세요
          </h2>
          <p className="text-[13px] leading-[1.4] font-normal md:text-base">
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
          className={`border-sm gap-xs py-xs pl-sm pr-xs md:py-sm md:pl-lg md:pr-md hover:border-alpha-white-48 hover:bg-alpha-white-24 hover:text-text-primary h-8 w-fit rounded-sm border-solid text-[12px] leading-[1.4] font-semibold transition-colors duration-300 md:h-11 md:rounded-md md:text-[14px] ${
            isHovered
              ? "border-alpha-white-48 bg-alpha-white-24 text-text-primary"
              : "border-alpha-white-24 bg-alpha-white-8 text-cyan-200"
          }`}
          rightIcon={<ChevronRightIcon size="xsmall" className="md:h-5 md:w-5" />}
        >
          피드백 남기기
        </ButtonLink>
      </div>

      {/* Image Container */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[132px] overflow-clip md:h-[152px] xl:relative xl:inset-auto xl:!h-full xl:w-[640px] xl:shrink-0 xl:self-stretch"
        aria-hidden="true"
      >
        {/* Mobile */}
        <Image
          src="/images/banner/feedback-banner-artwork-mobile.svg"
          alt=""
          fill
          className={`object-contain transition-opacity duration-700 md:hidden ${isHovered ? "opacity-0" : "opacity-100"}`}
        />
        <Image
          src="/images/banner/feedback-banner-artwork-mobile-hover.svg"
          alt=""
          fill
          className={`object-contain transition-opacity duration-700 md:hidden ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
        {/* Tablet */}
        <Image
          src="/images/banner/feedback-banner-artwork-tablet.svg"
          alt=""
          fill
          className={`hidden object-contain transition-opacity duration-700 md:block xl:!hidden ${isHovered ? "opacity-0" : "opacity-100"}`}
        />
        <Image
          src="/images/banner/feedback-banner-artwork-tablet-hover.svg"
          alt=""
          fill
          className={`hidden object-contain transition-opacity duration-700 md:block xl:!hidden ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
        {/* Desktop */}
        <Image
          src="/images/banner/feedback-banner-artwork-desktop.svg"
          alt=""
          fill
          className={`hidden object-contain transition-opacity duration-700 xl:block ${isHovered ? "opacity-0" : "opacity-100"}`}
        />
        <Image
          src="/images/banner/feedback-banner-artwork-desktop-hover.svg"
          alt=""
          fill
          className={`hidden object-contain transition-opacity duration-700 xl:block ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    </section>
  );
}
