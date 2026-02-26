import { z } from "zod";

import { isValidNickname } from "@/lib/utils/validation";

export const profileEditSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요").refine(isValidNickname, {
    message: "특수문자와 공백을 제외한 2~10자리여야 합니다.",
  }),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "올바른 이메일 형식을 입력해주세요",
    }),
  bio: z.string().max(100, "한 줄 소개는 최대 100자까지 입력 가능합니다"),
  interestCategories: z.array(z.string()).max(3, "관심 카테고리는 최대 3개까지 선택 가능합니다."),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
