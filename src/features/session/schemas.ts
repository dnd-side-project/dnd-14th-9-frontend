import { z } from "zod";

import { ONBOARDING_CATEGORIES } from "@/lib/constants/category";

import {
  SESSION_DURATION_MINUTES_MAX,
  SESSION_DURATION_MINUTES_MIN,
  SESSION_PARTICIPANTS_MAX,
  SESSION_PARTICIPANTS_MIN,
} from "./constants/sessionLimits";

export const createSessionFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "방 이름을 입력해 주세요.")
    .max(20, "방 이름은 최대 20자까지 입력 가능합니다."),

  summary: z
    .string()
    .trim()
    .min(1, "방 한줄 소개를 입력해 주세요.")
    .max(50, "한줄 소개는 최대 50자까지 입력 가능합니다."),

  notice: z
    .string()
    .trim()
    .min(1, "공지사항을 입력해 주세요.")
    .max(100, "공지사항은 최대 100자까지 입력 가능합니다."),

  category: z.enum(ONBOARDING_CATEGORIES, {
    message: "카테고리를 선택해 주세요.",
  }),

  startTime: z
    .date({ message: "시작 일시를 선택해 주세요." })
    .refine(
      (date) => date.getTime() > Date.now() + 5 * 60 * 1000,
      "세션 시작 시간은 현재 시각 기준 5분 이후로 설정해야 합니다."
    ),

  sessionDurationMinutes: z
    .number()
    .min(SESSION_DURATION_MINUTES_MIN)
    .max(SESSION_DURATION_MINUTES_MAX),

  maxParticipants: z.number().min(SESSION_PARTICIPANTS_MIN).max(SESSION_PARTICIPANTS_MAX),

  requiredAchievementRate: z.number().min(0).max(100).default(0),
});

export type CreateSessionFormData = z.infer<typeof createSessionFormSchema>;
