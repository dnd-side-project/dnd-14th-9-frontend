"use client";

import { useState } from "react";

import type { UpdateInterestCategoriesRequest } from "@/features/member/types";
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
    onComplete();
  };

  const handleProfileNext = async (newNickname: string, profileImage?: File) => {
    try {
      const promises: Promise<unknown>[] = [];

      if (newNickname !== defaultNickname) {
        promises.push(updateNickname.mutateAsync({ nickname: newNickname }));
      }

      if (profileImage) {
        promises.push(updateProfileImage.mutateAsync({ profileImage }));
      }

      await Promise.all(promises);

      if (newNickname !== defaultNickname) {
        setNickname(newNickname);
      }

      setStep("category");
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
    }
  };

  const handleCategoryNext = async (categories: Category[]) => {
    try {
      const payload: UpdateInterestCategoriesRequest = {
        firstInterestCategory: categories[0] ?? null,
        secondInterestCategory: categories[1] ?? null,
        thirdInterestCategory: categories[2] ?? null,
      };
      await updateInterestCategories.mutateAsync(payload);
      onComplete();
    } catch (error) {
      console.error("관심 카테고리 업데이트 실패:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {step === "profile" ? (
        <OnboardingProfile
          defaultNickname={nickname}
          defaultProfileImageUrl={defaultProfileImageUrl}
          isLoading={isLoading}
          onSkip={handleProfileSkip}
          onNext={handleProfileNext}
        />
      ) : null}
      {step === "category" ? (
        <OnboardingCategory
          nickname={nickname}
          isLoading={isLoading}
          onBack={() => setStep("profile")}
          onNext={handleCategoryNext}
        />
      ) : null}
    </div>
  );
}
