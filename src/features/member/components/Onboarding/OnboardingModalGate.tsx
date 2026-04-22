"use client";

import { useAuthState } from "@/features/auth/hooks/useAuthState";

import { OnboardingModalWrapper } from "./OnboardingModalWrapper";

export function OnboardingModalGate() {
  const authState = useAuthState();

  if (authState.status !== "authenticated" || !authState.profile.firstLogin) {
    return null;
  }

  return (
    <OnboardingModalWrapper
      defaultNickname={authState.profile.nickname}
      defaultProfileImageUrl={authState.profile.profileImageUrl}
    />
  );
}
