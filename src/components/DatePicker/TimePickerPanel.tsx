"use client";

import { useCallback, useRef, useEffect } from "react";

import { cn } from "@/lib/utils/utils";

interface TimePickerPanelProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export function TimePickerPanel({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  className,
}: TimePickerPanelProps) {
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const scrollToSelected = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
      if (ref.current) {
        const itemHeight = 36;
        ref.current.scrollTop = index * itemHeight;
      }
    },
    []
  );

  useEffect(() => {
    scrollToSelected(hourListRef, hour);
  }, [hour, scrollToSelected]);

  useEffect(() => {
    const minuteIndex = Math.floor(minute / 5);
    scrollToSelected(minuteListRef, minuteIndex);
  }, [minute, scrollToSelected]);

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Hour Column */}
      <div className="flex flex-col">
        <span className="text-text-muted mb-2 text-center text-sm">시</span>
        <div ref={hourListRef} className="scrollbar-hide flex h-[180px] flex-col overflow-y-auto">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHourChange(h)}
              className={cn(
                "flex h-9 w-12 items-center justify-center text-sm transition-colors",
                hour === h
                  ? "text-text-brand-default bg-alpha-green-16 rounded-sm font-semibold"
                  : "text-text-secondary hover:bg-alpha-white-8"
              )}
            >
              {String(h).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* Minute Column */}
      <div className="flex flex-col">
        <span className="text-text-muted mb-2 text-center text-sm">분</span>
        <div ref={minuteListRef} className="scrollbar-hide flex h-[180px] flex-col overflow-y-auto">
          {MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onMinuteChange(m)}
              className={cn(
                "flex h-9 w-12 items-center justify-center text-sm transition-colors",
                minute === m
                  ? "text-text-brand-default bg-alpha-green-16 rounded-sm font-semibold"
                  : "text-text-secondary hover:bg-alpha-white-8"
              )}
            >
              {String(m).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
