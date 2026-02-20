"use client";

import { useState } from "react";

import { type Category } from "@/lib/constants/category";

import {
  useUpdateInterestCategories,
  useUpdateNickname,
  useUpdateProfileImage,
} from "../../hooks/useMemberHooks";

import { OnboardingCategory } from "./OnboardingCategory";
import { OnboardingProfile } from "./OnboardingProfile";

type OnboardingStep = "profile" | "category";

interface OnboardingModalProps {
  defaultNickname: string;
  defaultProfileImageUrl?: string | null;
  onComplete: () => void;
}

export function OnboardingModal({
  defaultNickname,
  defaultProfileImageUrl,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<OnboardingStep>("profile");
  const [nickname, setNickname] = useState(defaultNickname);

  const updateNickname = useUpdateNickname();
  const updateProfileImage = useUpdateProfileImage();
  const updateInterestCategories = useUpdateInterestCategories();

  const isLoading =
    updateNickname.isPending || updateProfileImage.isPending || updateInterestCategories.isPending;

  const handleProfileSkip = () => {
    setStep("category");
  };

  const handleProfileNext = async (newNickname: string, profileImage?: File) => {
    try {
      // 닉네임 업데이트
      if (newNickname !== defaultNickname) {
        await updateNickname.mutateAsync({ nickname: newNickname });
        setNickname(newNickname);
      }

      // 이미지 업데이트 (있는 경우)
      if (profileImage) {
        await updateProfileImage.mutateAsync({ profileImage });
      }

      // 카테고리 단계로 이동
      setStep("category");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
    }
  };

  const handleCategoryNext = async (categories: Category[]) => {
    try {
      await updateInterestCategories.mutateAsync({
        firstInterestCategory: categories[0],
        secondInterestCategory: categories[1],
        thirdInterestCategory: categories[2] ?? null,
      });
      onComplete();
    } catch (error) {
      console.error("관심 카테고리 업데이트 실패:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {step === "profile" && (
        <OnboardingProfile
          defaultNickname={nickname}
          defaultProfileImageUrl={defaultProfileImageUrl}
          isLoading={isLoading}
          onSkip={handleProfileSkip}
          onNext={handleProfileNext}
        />
      )}
      {step === "category" && (
        <OnboardingCategory nickname={nickname} isLoading={isLoading} onNext={handleCategoryNext} />
      )}
    </div>
  );
}
