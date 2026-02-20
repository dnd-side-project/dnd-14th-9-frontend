"use client";

import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(true);

  const handleComplete = () => {
    // 모달 즉시 닫기
    setIsOpen(false);
    // 완료 후 캐시 무효화하여 firstLogin: false로 갱신
    queryClient.invalidateQueries({ queryKey: memberKeys.me() });
  };

  if (!isOpen) return null;

  return (
    <OnboardingModal
      defaultNickname={defaultNickname}
      defaultProfileImageUrl={defaultProfileImageUrl}
      onComplete={handleComplete}
    />
  );
}
