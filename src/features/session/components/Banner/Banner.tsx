"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { motion } from "motion/react";

import { DefaultBanner } from "./DefaultBanner";
import { FeedbackBanner } from "./FeedbackBanner";

/** 자동 롤링 간격 (ms) */
const AUTO_ROLL_INTERVAL = 4_000;

/**
 * Banner — 자동 롤링 배너 캐러셀 (Motion 기반)
 *
 * 전환 방식:
 * - Default → Feedback: 좌측 슬라이드 (두 배너가 동시에 이동)
 * - Feedback → Default: 페이드 아웃 (Feedback만 사라짐)
 * - 4초 간격 자동 롤링, hover 시 일시 정지
 */
export function Banner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoRoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoRoll = useCallback(() => {
    clearAutoRoll();
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % 2;
        setDirection(next === 1 ? "forward" : "backward");
        return next;
      });
    }, AUTO_ROLL_INTERVAL);
  }, [clearAutoRoll]);

  useEffect(() => {
    if (isHovered) {
      clearAutoRoll();
    } else {
      startAutoRoll();
    }
    return clearAutoRoll;
  }, [isHovered, startAutoRoll, clearAutoRoll]);

  const goTo = useCallback((index: number) => {
    setDirection(index === 1 ? "forward" : "backward");
    setActiveIndex(index);
  }, []);

  const isDefault = activeIndex === 0;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 배너 슬라이드 영역 */}
      <div className="relative h-[264px] w-full overflow-hidden rounded-sm">
        {/* DefaultBanner — z-0, 항상 렌더링 */}
        <motion.div
          className="absolute inset-0"
          animate={{ x: isDefault ? "0%" : "-100%", opacity: 1 }}
          transition={{
            x:
              direction === "forward"
                ? { duration: 0.6, ease: "easeInOut" as const }
                : { duration: 0 },
            opacity: { duration: 0 },
          }}
          style={{ zIndex: 0 }}
        >
          <DefaultBanner isHovered={isDefault && isHovered} />
        </motion.div>

        {/* FeedbackBanner — z-1, 항상 렌더링 */}
        <motion.div
          className="absolute inset-0"
          initial={{ x: "100%", opacity: 0 }}
          animate={{
            x: isDefault ? "100%" : "0%",
            opacity: isDefault ? 0 : 1,
          }}
          transition={{
            x:
              direction === "forward"
                ? { type: "spring" as const, stiffness: 60, damping: 12 }
                : { duration: 0, delay: 1 },
            opacity:
              direction === "backward"
                ? { duration: 1, ease: "easeInOut" as const }
                : { duration: 0 },
          }}
          style={{ zIndex: 1, pointerEvents: isDefault ? "none" : "auto" }}
        >
          <FeedbackBanner isHovered={!isDefault && isHovered} />
        </motion.div>
      </div>

      {/* 인디케이터 */}
      {/* <div className="mt-md gap-xs flex justify-center">
        {[0, 1].map((index) => (
          <button
            key={index}
            type="button"
            aria-label={`배너 ${index + 1}로 이동`}
            className={`h-[6px] rounded-full transition-all duration-300 ${
              index === activeIndex ? "bg-text-secondary w-[24px]" : "bg-surface-subtle w-[6px]"
            }`}
            onClick={() => {
              goTo(index);
              if (!isHovered) startAutoRoll();
            }}
          />
        ))}
      </div> */}
    </div>
  );
}
