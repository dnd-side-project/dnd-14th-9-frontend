"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { Textarea } from "@/components/Input/Textarea";
import { TextInput } from "@/components/Input/TextInput";
import { useMeForEdit, useUpdateMe } from "@/features/member/hooks/useMemberHooks";
import { profileEditSchema, type ProfileEditFormValues } from "@/features/member/schemas";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { CATEGORY_LABELS, ONBOARDING_CATEGORIES } from "@/lib/constants/category";
import { toast } from "@/lib/toast";

import { ProfileEditFormSkeleton } from "./ProfileEditFormSkeleton";

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
      email: "",
      bio: "",
      interestCategories: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (profile) {
      reset({
        nickname: profile.nickname,
        email: profile.email ?? "",
        bio: profile.bio ?? "",
        interestCategories: [
          profile.firstInterestCategory,
          profile.secondInterestCategory,
          profile.thirdInterestCategory,
        ].filter(Boolean) as string[],
      });
    }
  }, [profile, reset]);

  useUnsavedChangesWarning(isDirty && !isPending);

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
          toast.success("프로필 정보가 저장되었습니다.");
          reset(values);
        },
        onError: (error) => {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "프로필 정보 저장 중 오류가 발생했습니다.";
          toast.error(message);
        },
      }
    );
  };

  if (!profile) {
    return <ProfileEditFormSkeleton />;
  }

  const isSaveDisabled = !isDirty || !isValid || isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="gap-2xl flex w-full flex-col lg:gap-20">
      <div className="gap-2xl flex flex-col">
        <h3 className="text-text-primary text-lg font-bold">프로필 정보</h3>

        <Controller
          name="nickname"
          control={control}
          render={({ field: { value, onChange, ref, onBlur } }) => (
            <TextInput
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

        {/* TODO(temp): 이메일 수정은 API만 유지하고 폼 노출은 잠시 비활성화합니다.
        <Controller
          name="email"
          control={control}
          render={({ field: { value, onChange, ref, onBlur } }) => (
            <TextInput
              ref={ref}
              type="email"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              label="이메일"
              placeholder="이메일을 입력해 주세요"
              error={!!errors.email}
              errorMessage={errors.email?.message}
              fullWidth
            />
          )}
        />
        */}

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
            <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 lg:justify-center">
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
                        return;
                      }

                      if (field.value.length >= 3) {
                        toast.info("관심 카테고리는 최대 3개까지 선택 가능합니다.");
                        return;
                      }

                      field.onChange([...field.value, catKey]);
                    }}
                    className="lg:w-[136px]"
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

      {/*
        버튼 크기(medium/large)는 Button의 non-responsive prop이라 CSS 브레이크포인트로 못 바꾼다.
        → 크기별 두 벌을 렌더하고 md 기준 CSS로 토글(dual render).
        (className override는 Button 내부 크기값에 결합, JS 조건문은 SSR flash 우려로 배제)
      */}
      {/* 모바일: medium, 전체너비 2분할 */}
      <div className="flex w-full gap-3 md:hidden">
        <Button
          type="button"
          variant="solid"
          colorScheme="tertiary"
          size="medium"
          className="flex-1"
          onClick={() => reset()}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="solid"
          colorScheme="primary"
          size="medium"
          className="flex-1"
          disabled={isSaveDisabled}
        >
          저장하기
        </Button>
      </div>

      {/* 태블릿·데스크탑: large, 태블릿 좌측 / 데스크탑 중앙 */}
      <div className="hidden w-full items-center justify-start gap-3 md:flex lg:justify-center lg:gap-4">
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
          disabled={isSaveDisabled}
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
