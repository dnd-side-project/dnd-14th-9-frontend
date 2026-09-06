"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useMeForEdit, useUpdateMe } from "@/features/member/hooks/useMemberHooks";
import { profileEditSchema, type ProfileEditFormValues } from "@/features/member/schemas";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { toast } from "@/lib/toast";

export function useProfileEditForm() {
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

  const onSubmit = handleSubmit((values) => {
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
  });

  return {
    profile,
    control,
    errors,
    reset,
    onSubmit,
    isSaveDisabled: !isDirty || !isValid || isPending,
  };
}
