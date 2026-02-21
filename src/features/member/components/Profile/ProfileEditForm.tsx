"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";
import { useMeForEdit, useUpdateMe } from "@/features/member/hooks/useMemberHooks";
import { CATEGORY_LABELS, ONBOARDING_CATEGORIES } from "@/lib/constants/category";
import { isValidNickname } from "@/lib/utils/validation";

const profileEditSchema = z.object({
  nickname: z.string().min(1, "닉네임을 입력해주세요").refine(isValidNickname, {
    message: "특수문자와 공백을 제외한 1~5자리여야 합니다.",
  }),
  bio: z.string().max(100, "한 줄 소개는 최대 100자까지 입력 가능합니다"),
  interestCategories: z.array(z.string()).max(3, "관심 카테고리는 최대 3개까지 선택 가능합니다."),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

export function ProfileEditForm() {
  const { data: meData } = useMeForEdit();
  const { mutate: updateMe, isPending } = useUpdateMe();

  const profile = meData?.result;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      nickname: "",
      bio: "",
      interestCategories: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (profile) {
      reset({
        nickname: profile.nickname,
        bio: profile.bio ?? "",
        interestCategories: [
          profile.firstInterestCategory,
          profile.secondInterestCategory,
          profile.thirdInterestCategory,
        ].filter(Boolean) as string[],
      });
    }
  }, [profile, reset]);

  const onSubmit = (values: ProfileEditFormValues) => {
    const { nickname, bio, interestCategories } = values;

    updateMe(
      {
        nickname,
        bio: bio || null,
        firstInterestCategory: interestCategories[0] ?? null,
        secondInterestCategory: interestCategories[1] ?? null,
        thirdInterestCategory: interestCategories[2] ?? null,
      },
      {
        onSuccess: () => {
          reset(values);
        },
      }
    );
  };

  if (!profile) {
    return <div className="flex h-40 w-full items-center justify-center">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-20">
      <div className="gap-2xl flex flex-col">
        <h3 className="text-text-primary text-lg font-bold">프로필 정보</h3>

        <Controller
          name="nickname"
          control={control}
          render={({ field: { value, onChange, ref, onBlur } }) => (
            <Input
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              label="닉네임"
              placeholder="닉네임을 입력해 주세요"
              error={!!errors.nickname}
              errorMessage={errors.nickname?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="bio"
          control={control}
          render={({ field: { value, onChange, ref, onBlur } }) => (
            <Textarea
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              label="한 줄 소개"
              placeholder="텍스트를 입력해 주세요"
              error={!!errors.bio}
              errorMessage={errors.bio?.message}
              showCharacterCount={true}
              maxLength={100}
              containerClassName="max-w-full"
              className="max-w-full"
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-text-primary text-lg font-bold">관심 카테고리</h3>
          <p className="text-text-disabled text-[15px]">
            관심 있는 카테고리를 선택하면 맞춤 세션을 추천해 드려요
          </p>
        </div>

        <Controller
          name="interestCategories"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {ONBOARDING_CATEGORIES.map((catKey) => {
                const isSelected = field.value.includes(catKey);
                return (
                  <CategoryFilterButton
                    key={catKey}
                    type="button"
                    isSelected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        field.onChange(field.value.filter((k) => k !== catKey));
                      } else {
                        if (field.value.length < 3) {
                          field.onChange([...field.value, catKey]);
                        }
                      }
                    }}
                    className="w-[136px]"
                  >
                    {CATEGORY_LABELS[catKey]}
                  </CategoryFilterButton>
                );
              })}
            </div>
          )}
        />
        {errors.interestCategories && (
          <p className="text-system-error -mt-4 text-center text-sm">
            {errors.interestCategories.message}
          </p>
        )}
      </div>

      <div className="flex w-full items-center justify-center gap-4">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="large"
          onClick={() => reset()}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="large"
          disabled={!isDirty || !isValid || isPending}
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
