import { useRef, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { useToast } from "@/hooks/useToast";
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
  if (value.length > 12) return "12자 이하로 입력해주세요";
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

const validateImageDimensions = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 200 || img.height < 200) {
        resolve("이미지는 최소 200×200px 이상이어야 해요");
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("이미지를 불러올 수 없어요");
    };

    img.src = url;
  });
};

export function OnboardingProfile({
  className,
  defaultNickname,
  defaultProfileImageUrl,
  isLoading = false,
  onSkip,
  onNext,
}: OnboardingProfileProps) {
  const { showToast } = useToast();
  const [nickname, setNickname] = useState(defaultNickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultProfileImageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 및 용량 검증
    const fileError = validateImageFile(file);
    if (fileError) {
      showToast("error", fileError);
      // Input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 이미지 크기 검증
    const dimensionError = await validateImageDimensions(file);
    if (dimensionError) {
      showToast("error", dimensionError);
      // Input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 검증 통과
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    showToast("success", "이미지가 선택되었어요");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setNicknameError(validateNickname(value));
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
        {/* Avatar with image upload */}
        <div className="relative">
          <button type="button" onClick={handleAvatarClick} className="cursor-pointer">
            <Avatar
              size="xlarge"
              type={previewUrl ? "image" : "empty"}
              src={previewUrl ?? undefined}
              edit
              className="size-20"
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
          <Input
            label="닉네임"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력해주세요"
            onClear={() => {
              setNickname("");
              setNicknameError(null);
            }}
            error={!!nicknameError}
            errorMessage={nicknameError ?? undefined}
          />
        </div>
      </div>

      {/* ButtonGroup */}
      <div className="flex w-full gap-4">
        <Button
          variant="ghost"
          colorScheme="secondary"
          className="text-text-muted hover:text-text-secondary h-11 flex-1"
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
