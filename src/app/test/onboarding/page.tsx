"use client";

import { useState } from "react";

import { OnboardingCategory } from "@/components/Onboarding/OnboardingCategory";
import { OnboardingProfile } from "@/components/Onboarding/OnboardingProfile";

export default function OnboardingTestPage() {
  const [step, setStep] = useState<"profile" | "category">("profile");
  const [nickname, setNickname] = useState("");

  const handleProfileNext = (name: string) => {
    setNickname(name);
    setStep("category");
  };

  const handleCategoryNext = (categories: string[]) => {
    alert(`완료! 닉네임: ${nickname}, 카테고리: ${categories.join(", ")}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      {step === "profile" && (
        <OnboardingProfile onSkip={() => setStep("category")} onNext={handleProfileNext} />
      )}
      {step === "category" && (
        <OnboardingCategory nickname={nickname || "각 잡은 호랑이"} onNext={handleCategoryNext} />
      )}
    </div>
  );
}
