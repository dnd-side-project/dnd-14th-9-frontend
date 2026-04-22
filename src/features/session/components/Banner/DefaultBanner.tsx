"use client";

import { useEffect, useState, type CSSProperties } from "react";

import Image from "next/image";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { PlusIcon } from "@/components/Icon/PlusIcon";

type Viewport = "mobile" | "tablet" | "desktop";
type CardKey = "goals" | "datepicker" | "profile";
type CardStyles = {
  outer: CSSProperties;
  image: CSSProperties;
  rotation: string;
};

const CARD_STYLES: Record<Viewport, Record<"default" | "hover", Record<CardKey, CardStyles>>> = {
  desktop: {
    default: {
      goals: {
        outer: { bottom: "-67.55px", right: "270.67px", width: "359.327px", height: "289.552px" },
        image: { width: "334.4px", height: "256px" },
        rotation: "rotate(-6deg)",
      },
      datepicker: {
        outer: { bottom: "-56.86px", right: "29.02px", width: "211.984px", height: "208.856px" },
        image: { width: "171.324px", height: "166.659px" },
        rotation: "rotate(16.7deg)",
      },
      profile: {
        outer: { bottom: "-56.86px", right: "175.05px", width: "223.508px", height: "274.237px" },
        image: { width: "210px", height: "263.608px" },
        rotation: "rotate(3deg)",
      },
    },
    hover: {
      goals: {
        outer: { bottom: "-68.06px", right: "291.51px", width: "376.972px", height: "314.908px" },
        image: { width: "334.4px", height: "256px" },
        rotation: "rotate(-10.96deg)",
      },
      datepicker: {
        outer: { bottom: "-47.56px", right: "8.1px", width: "221.28px", height: "218.702px" },
        image: { width: "171.324px", height: "166.659px" },
        rotation: "rotate(22deg)",
      },
      profile: {
        outer: { bottom: "-75.37px", right: "146.65px", width: "264.078px", height: "315.737px" },
        image: { width: "231.354px", height: "290.412px" },
        rotation: "rotate(6.79deg)",
      },
    },
  },
  tablet: {
    default: {
      goals: {
        outer: { bottom: "-67.55px", right: "199.99px", width: "265.013px", height: "213.552px" },
        image: { width: "246.628px", height: "188.806px" },
        rotation: "rotate(-6deg)",
      },
      datepicker: {
        outer: { bottom: "-59.66px", right: "21.76px", width: "156.343px", height: "154.037px" },
        image: { width: "126.355px", height: "122.915px" },
        rotation: "rotate(16.7deg)",
      },
      profile: {
        outer: { bottom: "-59.66px", right: "129.46px", width: "164.843px", height: "202.256px" },
        image: { width: "154.88px", height: "194.417px" },
        rotation: "rotate(3deg)",
      },
    },
    hover: {
      goals: {
        outer: { bottom: "-80.88px", right: "192.95px", width: "287.091px", height: "246.205px" },
        image: { width: "246.628px", height: "188.806px" },
        rotation: "rotate(-15deg)",
      },
      datepicker: {
        outer: { bottom: "-58.44px", right: "13.2px", width: "163.467px", height: "161.584px" },
        image: { width: "126.355px", height: "122.915px" },
        rotation: "rotate(22.23deg)",
      },
      profile: {
        outer: { bottom: "-66.64px", right: "117.98px", width: "200.598px", height: "236.109px" },
        image: { width: "168.593px", height: "211.63px" },
        rotation: "rotate(9.31deg)",
      },
    },
  },
  mobile: {
    default: {
      goals: {
        outer: { bottom: "-33.78px", right: "135.34px", width: "179.664px", height: "144.776px" },
        image: { width: "167.2px", height: "128px" },
        rotation: "rotate(-6deg)",
      },
      datepicker: {
        outer: { bottom: "-28.43px", right: "14.51px", width: "105.992px", height: "104.428px" },
        image: { width: "85.662px", height: "83.329px" },
        rotation: "rotate(16.7deg)",
      },
      profile: {
        outer: { bottom: "-28.43px", right: "87.52px", width: "111.754px", height: "137.118px" },
        image: { width: "105px", height: "131.804px" },
        rotation: "rotate(3deg)",
      },
    },
    hover: {
      goals: {
        outer: { bottom: "-34.17px", right: "136.25px", width: "185.837px", height: "153.555px" },
        image: { width: "167.2px", height: "128px" },
        rotation: "rotate(-9.39deg)",
      },
      datepicker: {
        outer: { bottom: "-26.48px", right: "10.57px", width: "109.875px", height: "108.536px" },
        image: { width: "85.662px", height: "83.329px" },
        rotation: "rotate(21.05deg)",
      },
      profile: {
        outer: { bottom: "-23.92px", right: "83.86px", width: "119.09px", height: "142.726px" },
        image: { width: "105px", height: "131.804px" },
        rotation: "rotate(6.43deg)",
      },
    },
  },
};

function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setViewport("mobile");
      else if (window.innerWidth < 1280) setViewport("tablet");
      else setViewport("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}

interface DefaultBannerProps {
  isHovered: boolean;
}

export function DefaultBanner({ isHovered }: DefaultBannerProps) {
  const viewport = useViewport();
  const state = isHovered ? "hover" : "default";
  const cardStyles = CARD_STYLES[viewport][state];

  return (
    <section className="border-sm border-alpha-white-16 relative flex h-[264px] w-full flex-col items-start justify-between overflow-hidden rounded-sm bg-linear-to-b from-gray-950 to-gray-900 xl:flex-row xl:items-center xl:justify-start">
      {/* Background: 라인 패턴 레이어 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 가로 라인 패턴 (90도 회전) */}
        <div className="absolute top-1/2 left-0 flex h-[240px] w-full -translate-y-1/2 items-center justify-center">
          <div className="-rotate-90">
            <div className="relative h-[1180px] w-[240px]">
              <Image
                src="/images/banner/lines-horizontal.svg"
                alt=""
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* 대각선 라인 패턴 */}
        <div className="absolute top-1/2 left-5 h-[300px] w-[calc(100%-40px)] -translate-y-1/2">
          <Image
            src="/images/banner/lines-diagonal.svg"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 우측 페이드 아웃 그라데이션 */}
        <div className="from-surface-default absolute top-0 right-0 h-full w-[240px] bg-linear-to-l to-transparent" />

        {/* 좌측 페이드 아웃 그라데이션 */}
        <div className="from-surface-default absolute top-0 left-0 h-full w-[340px] bg-linear-to-r to-transparent" />
      </div>

      {/* Content Container */}
      <div className="px-2xl py-xl gap-md md:px-3xl md:py-2xl md:gap-lg xl:p-4xl xl:gap-2xl relative z-10 flex w-full shrink-0 flex-col items-start xl:h-full xl:w-auto xl:min-w-px xl:flex-1">
        <div className="gap-2xs text-text-primary flex flex-col">
          <h2 className="text-[18px] leading-[1.4] font-bold md:text-2xl">
            지금 각 잡고, 바로 시작!
          </h2>
          <p className="text-[13px] leading-[1.4] font-normal md:text-base">
            모여서 각자, 각 잡고 시작하는 작업 공간
          </p>
        </div>

        <ButtonLink
          href="/session/create"
          variant="solid"
          colorScheme="tertiary"
          size="medium"
          className="gap-xs py-xs pl-sm pr-xs md:py-sm md:pl-lg md:pr-md h-8 w-fit rounded-sm text-[12px] leading-[1.4] font-semibold md:h-11 md:rounded-md md:text-[14px]"
          rightIcon={<PlusIcon size="xsmall" className="md:h-5 md:w-5" />}
          hardNavigate
        >
          세션 만들기
        </ButtonLink>
      </div>

      {/* Image Container: 3개 UI 카드 */}
      <div className="absolute right-0 bottom-0 left-0 h-[132px] overflow-clip md:h-[152px] xl:relative xl:inset-auto xl:!h-full xl:w-[640px] xl:shrink-0 xl:self-stretch">
        {/* Goals Section 카드 */}
        <div
          className="absolute flex items-center justify-center transition-all duration-500 ease-out"
          style={cardStyles.goals.outer}
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{ transform: cardStyles.goals.rotation }}
          >
            <div className="relative" style={cardStyles.goals.image}>
              <Image
                src="/images/banner/goals-section.png"
                alt="목표 섹션 미리보기"
                fill
                className="pointer-events-none object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* DatePicker 카드 */}
        <div
          className="absolute flex items-center justify-center transition-all duration-500 ease-out"
          style={cardStyles.datepicker.outer}
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{ transform: cardStyles.datepicker.rotation }}
          >
            <div className="relative" style={cardStyles.datepicker.image}>
              <Image
                src="/images/banner/date-picker.png"
                alt="달력 미리보기"
                fill
                className="pointer-events-none object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div
          className="absolute flex items-center justify-center transition-all duration-500 ease-out"
          style={cardStyles.profile.outer}
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{ transform: cardStyles.profile.rotation }}
          >
            <div
              className="relative transition-all duration-500 ease-out"
              style={cardStyles.profile.image}
            >
              <Image
                src="/images/banner/profile-card.png"
                alt="프로필 카드 미리보기"
                fill
                className="pointer-events-none object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
