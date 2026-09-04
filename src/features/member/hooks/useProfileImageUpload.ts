import { type ChangeEvent } from "react";

import { useUpdateProfileImage } from "@/features/member/hooks/useMemberHooks";
import { toast } from "@/lib/toast";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const validateProfileImageFile = (file: File): string | null => {
  if (file.size > MAX_PROFILE_IMAGE_SIZE) return "5MB 이하 파일만 업로드 가능해요";
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) return "jpg, png, webp만 지원해요";
  return null;
};

export function useProfileImageUpload() {
  const { mutate: updateProfileImage, isPending: isUpdatingProfileImage } = useUpdateProfileImage();

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const fileError = validateProfileImageFile(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    updateProfileImage(
      { profileImage: file },
      {
        onSuccess: () => {
          toast.success("프로필 이미지가 수정되었습니다.");
        },
        onError: (error) => {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "프로필 이미지 수정 중 오류가 발생했습니다.";
          toast.error(message);
        },
      }
    );
  };

  return {
    handleProfileImageChange,
    isUpdatingProfileImage,
  };
}
