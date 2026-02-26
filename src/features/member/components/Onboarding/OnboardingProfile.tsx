import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { TextInput } from "@/components/Input/TextInput";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils/utils";

interface OnboardingProfileProps {
  className?: string;
  defaultNickname: string;
  defaultProfileImageUrl?: string | null;
  isLoading?: boolean;
  onSkip?: () => void;
  onNext?: (nickname: string, profileImage?: File) => void;
}

// Validation 함수
const validateNickname = (value: string): string | null => {
  if (value.length < 2) return "2자 이상 입력해주세요";
  if (value.length > 10) return "10자 이하로 입력해주세요";
  if (!/^[a-zA-Z0-9가-힣]+$/.test(value)) return "영문, 한글, 숫자만 사용 가능해요";
  return null;
};

const validateImageFile = (file: File): string | null => {
  if (file.size > 5 * 1024 * 1024) return "5MB 이하 파일만 업로드 가능해요";
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "jpg, png, webp만 지원해요";
  }
  return null;
};

export function OnboardingProfile({
  className,
  defaultNickname,
  defaultProfileImageUrl,
  isLoading = false,
  onSkip,
  onNext,
}: OnboardingProfileProps) {
  const [nickname, setNickname] = useState(defaultNickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultProfileImageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 및 용량 검증
    const fileError = validateImageFile(file);
    if (fileError) {
      toast.showToast("error", fileError);
      // Input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 검증 통과
    setProfileImage(file);
    const nextObjectUrl = URL.createObjectURL(file);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = nextObjectUrl;
    setPreviewUrl(nextObjectUrl);
    toast.showToast("success", "이미지가 선택되었어요");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNickname(value));
  };

  const handleNicknameClear = () => {
    setNickname("");
    setNicknameError(validateNickname(""));
  };

  const handleNext = () => {
    const nicknameValidation = validateNickname(nickname);
    if (nicknameValidation) {
      setNicknameError(nicknameValidation);
      return;
    }
    onNext?.(nickname, profileImage ?? undefined);
  };

  return (
    <div
      className={cn(
        "p-3xl gap-3xl border-sm border-border-default bg-surface-default flex w-110 flex-col rounded-lg shadow-[0_0_2px_0_rgba(0,0,0,0.08),0_16px_24px_0_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {/* Header */}
      <div className="gap-2xs flex flex-col justify-center">
        <h1 className="text-text-primary text-2xl font-bold">반가워요, 프로필을 설정해 주세요</h1>
        <p className="text-text-secondary font-regular text-base">
          프로필을 설정하면 나에게 맞는 세션을 추천해 드려요.
        </p>
      </div>

      {/* Profile Setup */}
      <div className="gap-sm flex flex-col items-center">
        {/* Avatar with image upload */}
        <div>
          <button type="button" onClick={handleAvatarClick} className="cursor-pointer">
            <Avatar
              size="xlarge"
              type={previewUrl ? "image" : "empty"}
              src={previewUrl ?? undefined}
              edit
              className="h-16 w-16"
            />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* TextInput */}
        <div className="flex w-full flex-col gap-2">
          <TextInput
            label="닉네임"
            placeholder="10글자 이내"
            value={nickname}
            onChange={handleNicknameChange}
            onClear={handleNicknameClear}
            error={!!nicknameError}
            errorMessage={nicknameError ?? undefined}
          />
        </div>
      </div>

      {/* ButtonGroup */}
      <div className="flex w-full gap-4">
        <Button
          variant="solid"
          colorScheme="tertiary"
          className="text-text-muted flex-1 text-sm font-semibold"
          onClick={onSkip}
          disabled={isLoading}
        >
          건너뛰기
        </Button>
        <Button
          variant="solid"
          colorScheme="primary"
          className="h-11 flex-1 text-sm font-semibold"
          onClick={handleNext}
          disabled={isLoading || !!nicknameError}
        >
          {isLoading ? "저장 중..." : "다음"}
        </Button>
      </div>
    </div>
  );
}
