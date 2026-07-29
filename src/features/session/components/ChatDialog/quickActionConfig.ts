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
  /**
   * 퀵액션 선택 시 입력창에 자동 입력될 지정 텍스트.
   * 선택 중에는 입력창이 readOnly로 잠겨 이 문구 그대로만 전송된다.
   * 디자이너 확정 전 임시 문구 — 확정되면 여기 값만 갈아끼운다.
   */
  message: string;
}

// 퀵액션 종류별 아이콘/라벨 (라벨은 Figma 원문)
export const QUICK_ACTION_CONFIG: Record<QuickActionType, QuickActionConfig> = {
  START_NOW: {
    Icon: TargetIcon,
    label: "지금 당장 각!",
    message: "미루지 말고 지금 바로 시작해요!",
  },
  PHONE_BAN: { Icon: AlertIcon, label: "핸드폰 금지", message: "핸드폰은 잠시 내려놓고 집중해요!" },
  LIKE: { Icon: ThumbsUpIcon, label: "좋아요", message: "너무 잘하고 있어요!" },
  BREAK_TIME: {
    Icon: LoaderIcon,
    label: "잠깐 쉬어갈까요?",
    message: "무리하지 말고 쉬었다 가요!",
  },
  TODO_DONE: { Icon: CheckIcon, label: "투두 완료!", message: "해냈어요! 이 기세로 쭉 가요" },
};
