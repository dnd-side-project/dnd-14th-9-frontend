"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";
import type { QuickActionType } from "@/lib/socket/types";
import { cn } from "@/lib/utils/utils";

import { QUICK_ACTION_CONFIG } from "./quickActionConfig";

const QUICK_ACTION_TYPES = Object.keys(QUICK_ACTION_CONFIG) as QuickActionType[];

interface ChatQuickActionBarProps {
  selected: QuickActionType | null;
  onSelect: (type: QuickActionType) => void;
}

export function ChatQuickActionBar({ selected, onSelect }: ChatQuickActionBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 1);
  }, []);

  const scroll = (direction: -1 | 1) => {
    const element = scrollRef.current;
    element?.scrollBy({ left: direction * element.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    updateScrollState();
    const element = scrollRef.current;
    element?.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      element?.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <div className="relative flex h-8 w-full items-start gap-2">
      <div
        data-testid="right-gradient"
        className={cn(
          "from-surface-default pointer-events-none absolute top-1/2 right-0 z-10 h-[34px] w-[160px] -translate-y-1/2 bg-linear-to-l to-transparent transition-opacity duration-200 ease-out",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
      <div data-testid="left-arrow-slot" className="z-20 h-8 w-6 shrink-0">
        {canScrollRight && (
          <Button
            type="button"
            variant="solid"
            colorScheme="tertiary"
            size="small"
            iconOnly
            leftIcon={<ChevronLeftIcon size="xsmall" />}
            aria-label="퀵 메시지 왼쪽으로 이동"
            onClick={() => scroll(1)}
            className="!px-2xs h-full w-full"
          />
        )}
      </div>

      <div
        ref={scrollRef}
        role="group"
        aria-label="퀵 메시지 목록"
        className="flex min-w-0 flex-1 gap-2 overflow-x-hidden"
      >
        {QUICK_ACTION_TYPES.map((type) => {
          const { Icon, label } = QUICK_ACTION_CONFIG[type];
          const isSelected = selected === type;

          return (
            <Button
              key={type}
              variant="solid"
              colorScheme="tertiary"
              size="small"
              leftIcon={<Icon size="xsmall" />}
              aria-pressed={isSelected}
              onClick={() => onSelect(type)}
              className={cn("shrink-0", isSelected && "bg-surface-subtle text-text-secondary")}
            >
              {label}
            </Button>
          );
        })}
      </div>

      <div
        data-testid="left-gradient"
        className={cn(
          "from-surface-default pointer-events-none absolute top-1/2 left-0 z-10 h-[34px] w-[160px] -translate-y-1/2 bg-linear-to-r to-transparent transition-opacity duration-200 ease-out",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div data-testid="right-arrow-slot" className="z-20 h-8 w-6 shrink-0">
        {canScrollLeft && (
          <Button
            type="button"
            variant="solid"
            colorScheme="tertiary"
            size="small"
            iconOnly
            leftIcon={<ChevronRightIcon size="xsmall" />}
            aria-label="퀵 메시지 오른쪽으로 이동"
            onClick={() => scroll(-1)}
            className="!px-2xs h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
