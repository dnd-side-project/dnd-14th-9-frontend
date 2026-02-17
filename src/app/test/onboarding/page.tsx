"use client";

import { OnboardingProfile } from "@/components/Onboarding/OnboardingProfile";

export default function OnboardingTestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <OnboardingProfile
        onSkip={() => console.log("Skip clicked")}
        onNext={(nickname) => console.log("Next clicked", nickname)}
      />
    </div>
  );
}
