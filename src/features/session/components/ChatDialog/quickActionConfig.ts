import type { ComponentType } from "react";

import { AlertIcon } from "@/components/Icon/AlertIcon";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import type { IconProps } from "@/components/Icon/Icon";
import { LoaderIcon } from "@/components/Icon/LoaderIcon";
import { TargetIcon } from "@/components/Icon/TargetIcon";
import { ThumbsUpIcon } from "@/components/Icon/ThumbsUpIcon";
import type { QuickActionType } from "@/lib/socket/types";

interface QuickActionConfig {
  Icon: ComponentType<Omit<IconProps, "svg">>;
  label: string;
}

// 퀵액션 종류별 아이콘/라벨 (라벨은 Figma 원문)
export const QUICK_ACTION_CONFIG: Record<QuickActionType, QuickActionConfig> = {
  START_NOW: { Icon: TargetIcon, label: "지금 당장 각!" },
  PHONE_BAN: { Icon: AlertIcon, label: "핸드폰 금지" },
  LIKE: { Icon: ThumbsUpIcon, label: "좋아요" },
  BREAK_TIME: { Icon: LoaderIcon, label: "잠깐 쉬어갈까요?" },
  TODO_DONE: { Icon: CheckIcon, label: "투두 완료!" },
};
