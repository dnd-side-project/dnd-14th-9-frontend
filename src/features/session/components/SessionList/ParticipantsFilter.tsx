"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
import { NumericStepper } from "@/components/NumericStepper/NumericStepper";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

import {
  SESSION_PARTICIPANTS_DEFAULT,
  SESSION_PARTICIPANTS_MAX,
  SESSION_PARTICIPANTS_MIN,
} from "../../constants/sessionLimits";

import {
  getParticipantsFilterLabel,
  parseParticipantsFilterValue,
} from "./sessionListFilter.utils";

interface ParticipantsFilterProps {
  isOpen: boolean;
  participants: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (participants: number) => void;
}

export function ParticipantsFilter({
  isOpen,
  participants,
  onOpenChange,
  onChange,
}: ParticipantsFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => onOpenChange(false), [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  const selectedParticipants = Number(
    parseParticipantsFilterValue(participants) ?? String(SESSION_PARTICIPANTS_DEFAULT)
  );

  const triggerLabel = getParticipantsFilterLabel(participants);
  const hasSelection = Boolean(participants);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Filter
        size="large"
        radius="sm"
        isOpen={isOpen}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "hover:text-text-primary w-auto shrink-0",
          hasSelection && "text-text-primary bg-surface-strong"
        )}
      >
        {triggerLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="참여 인원 선택"
          className="border-border-subtle bg-surface-default absolute top-full right-0 z-20 mt-3 rounded-sm border shadow-[0px_0px_2px_0px_#00000014,0px_16px_24px_0px_#0000001F]"
        >
          <NumericStepper
            label="참여인원"
            hint="최대 10명까지 가능"
            value={selectedParticipants}
            displayValue={`${selectedParticipants}명`}
            min={SESSION_PARTICIPANTS_MIN}
            max={SESSION_PARTICIPANTS_MAX}
            step={1}
            onChange={onChange}
            className="bg-surface-default gap-xs border-none"
            hideHeader
            allowKeyboardInput
          />
        </div>
      )}
    </div>
  );
}
