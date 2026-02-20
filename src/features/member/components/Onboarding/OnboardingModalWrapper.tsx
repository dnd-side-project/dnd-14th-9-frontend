"use client";

import { useQueryClient } from "@tanstack/react-query";

import { memberKeys } from "../../hooks/useMemberHooks";

import { OnboardingModal } from "./OnboardingModal";

interface OnboardingModalWrapperProps {
  defaultNickname: string;
  defaultProfileImageUrl?: string | null;
}

export function OnboardingModalWrapper({
  defaultNickname,
  defaultProfileImageUrl,
}: OnboardingModalWrapperProps) {
  const queryClient = useQueryClient();

  const handleComplete = () => {
    // 완료 후 캐시 무효화하여 firstLogin: false로 갱신
    queryClient.invalidateQueries({ queryKey: memberKeys.me() });
  };

  return (
    <OnboardingModal
      defaultNickname={defaultNickname}
      defaultProfileImageUrl={defaultProfileImageUrl}
      onComplete={handleComplete}
    />
  );
}
