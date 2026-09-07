"use client";

import { Controller } from "react-hook-form";

import { Button } from "@/components/Button/Button";
import { Textarea } from "@/components/Input/Textarea";
import { TextInput } from "@/components/Input/TextInput";
import { useProfileEditForm } from "@/features/member/hooks/useProfileEditForm";

import { InterestCategoryField } from "./InterestCategoryField";
import { ProfileEditFormSkeleton } from "./ProfileEditFormSkeleton";

export function ProfileEditForm() {
  const { profile, control, errors, reset, onSubmit, isSaveDisabled } = useProfileEditForm();

  if (!profile) {
    return <ProfileEditFormSkeleton />;
  }

  return (
    <form onSubmit={onSubmit} className="gap-2xl flex w-full flex-col lg:gap-20">
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

      <Controller
        name="interestCategories"
        control={control}
        render={({ field }) => (
          <InterestCategoryField
            value={field.value}
            onChange={field.onChange}
            error={errors.interestCategories?.message}
          />
        )}
      />

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
