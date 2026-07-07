"use client";

import { Button } from "@/components/Button/Button";
import type { QuickActionType } from "@/lib/socket/types";
import { cn } from "@/lib/utils/utils";

import { QUICK_ACTION_CONFIG } from "./quickActionConfig";

const QUICK_ACTION_TYPES = Object.keys(QUICK_ACTION_CONFIG) as QuickActionType[];

interface ChatQuickActionBarProps {
  selected: QuickActionType | null;
  onSelect: (type: QuickActionType) => void;
}

export function ChatQuickActionBar({ selected, onSelect }: ChatQuickActionBarProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto">
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
  );
}
