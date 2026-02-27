"use client";

import Image from "next/image";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { PlusIcon } from "@/components/Icon/PlusIcon";

/**
 * DefaultBanner — 세션 만들기 CTA 배너
 *
 * 다크 그라데이션 배경에 그리드 라인 패턴과 3개의 UI 카드 이미지를 표시한다.
 * hover 시 이미지가 미세하게 이동/회전하는 애니메이션이 적용된다.
 */

interface DefaultBannerProps {
  isHovered: boolean;
}

export function DefaultBanner({ isHovered }: DefaultBannerProps) {
  return (
    <section className="border-sm border-alpha-white-16 relative flex h-[264px] w-full items-center overflow-hidden rounded-sm bg-linear-to-b from-gray-950 from-0% to-gray-900 to-100%">
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
      <div className="gap-2xl p-4xl relative z-10 flex flex-1 flex-col">
        <div className="gap-2xs text-text-primary flex flex-col">
          <h2 className="text-2xl leading-[1.4] font-bold">지금 각 잡고, 바로 시작!</h2>
          <p className="text-base leading-[1.4] font-normal">
            모여서 각자, 각 잡고 시작하는 작업 공간
          </p>
        </div>

        <ButtonLink
          href="/session/create"
          variant="solid"
          colorScheme="tertiary"
          size="medium"
          className="gap-xs py-sm pr-md pl-lg h-11 w-fit text-[14px] leading-[1.4] font-semibold"
          rightIcon={<PlusIcon className="h-4 w-4" />}
          hardNavigate
        >
          세션 만들기
        </ButtonLink>
      </div>

      {/* Image Container: 3개 UI 카드 */}
      <div className="relative h-full w-[54%] shrink-0 overflow-hidden">
        {/* Goals Section 카드 */}
        <div
          className="absolute flex items-center justify-center transition-all duration-500 ease-out"
          style={
            isHovered
              ? {
                  bottom: "-68px",
                  right: "calc(42% + 10px)",
                  width: "377px",
                  height: "315px",
                }
              : {
                  bottom: "-68px",
                  right: "42%",
                  width: "359px",
                  height: "290px",
                }
          }
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{
              transform: isHovered ? "rotate(-10.96deg)" : "rotate(-6deg)",
            }}
          >
            <div className="relative h-[256px] w-[334px]">
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
          style={
            isHovered
              ? {
                  bottom: "-48px",
                  right: "1%",
                  width: "221px",
                  height: "219px",
                }
              : {
                  bottom: "-57px",
                  right: "4%",
                  width: "212px",
                  height: "209px",
                }
          }
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{
              transform: isHovered ? "rotate(22deg)" : "rotate(16.7deg)",
            }}
          >
            <div className="relative h-[167px] w-[171px]">
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
          style={
            isHovered
              ? {
                  bottom: "-75px",
                  right: "23%",
                  width: "264px",
                  height: "316px",
                }
              : {
                  bottom: "-57px",
                  right: "27%",
                  width: "224px",
                  height: "274px",
                }
          }
        >
          <div
            className="flex-none transition-transform duration-500 ease-out"
            style={{
              transform: isHovered ? "rotate(6.79deg)" : "rotate(3deg)",
            }}
          >
            <div
              className="relative transition-all duration-500 ease-out"
              style={
                isHovered
                  ? { width: "231px", height: "290px" }
                  : { width: "210px", height: "264px" }
              }
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
