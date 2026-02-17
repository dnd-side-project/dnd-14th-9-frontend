import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { cn } from "@/lib/utils/utils";

interface OnboardingProfileProps {
  className?: string;
  onSkip?: () => void;
  onNext?: (nickname: string, profileImage?: File) => void;
}

export function OnboardingProfile({ className, onSkip, onNext }: OnboardingProfileProps) {
  const [nickname, setNickname] = useState("각 잡은 호랑이 #1234"); // Default random nickname
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleNext = () => {
    // In a real app, we would validate and maybe upload image here
    onNext?.(nickname, profileImage ?? undefined);
  };

  return (
    <div
      className={cn(
        "bg-surface-default flex w-[440px] flex-col items-center gap-8 rounded-lg border border-gray-900 p-10 shadow-[0px_0px_80px_0px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex w-full flex-col gap-1 text-left">
        <h1 className="text-text-primary text-2xl font-bold">
          반가워요, <br />
          프로필을 설정해 주세요
        </h1>
        <p className="text-text-secondary text-base">
          프로필을 설정하면 나에게 맞는 세션을 추천해 드려요.
        </p>
      </div>

      {/* Profile Setup */}
      <div className="flex w-full flex-col items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar size="xlarge" type="empty" edit className="size-20" />
          {/* Note: Avatar component might need adjustment for size-20 if it only supports fixed variants, 
              but looking at the code it has size variants. xlarge is size-12 (48px). 
              The design requires 80px/5rem. 
              The Avatar component implementation uses cva but allows className override.
              However, the inner structure might depend on size prop for icon sizing.
              Let's try to override className.
           */}
        </div>

        {/* TextInput */}
        <div className="flex w-full flex-col gap-2">
          {/* Label is handled by Input component if passed, but design has it slightly separate? 
               Input component has 'label' prop.
           */}
          <Input
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해주세요"
            onClear={() => setNickname("")}
          />
        </div>
      </div>

      {/* ButtonGroup */}
      <div className="flex w-full gap-4">
        <Button
          variant="ghost"
          colorScheme="secondary"
          className="text-text-muted hover:text-text-secondary h-11 flex-1 text-base"
          onClick={onSkip}
        >
          건너뛰기
        </Button>
        <Button
          variant="solid"
          colorScheme="primary"
          className="h-11 flex-1 text-sm font-semibold"
          onClick={handleNext}
        >
          완료
        </Button>
      </div>
    </div>
  );
}
