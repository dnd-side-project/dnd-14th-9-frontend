"use client";

import { type ChangeEvent, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Badge } from "@/components/Badge/Badge";
import { useMe, useUpdateProfileImage } from "@/features/member/hooks/useMemberHooks";
import { toast } from "@/lib/toast";
import { formatSecondsToHours } from "@/lib/utils/format";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const validateProfileImageFile = (file: File): string | null => {
  if (file.size > MAX_PROFILE_IMAGE_SIZE) return "5MB 이하 파일만 업로드 가능해요";
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) return "jpg, png, webp만 지원해요";
  return null;
};

export function ProfileSummary() {
  const { data } = useMe();
  const { mutate: updateProfileImage, isPending: isUpdatingProfileImage } = useUpdateProfileImage();
  const profile = data?.result;
  const [isHovered, setIsHovered] = useState(false);

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

  if (!profile) return null;

  return (
    <div className="gap-3xl flex w-full flex-col items-start">
      <h1 className="text-text-primary font-pretendard text-2xl font-bold">마이페이지</h1>

      <div className="gap-lg flex w-full">
        <label
          className="relative h-16 w-16 shrink-0 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleProfileImageChange}
            disabled={isUpdatingProfileImage}
          />
          <Avatar
            src={profile.profileImageUrl ?? undefined}
            alt={profile.nickname}
            size="xlarge"
            type={profile.profileImageUrl ? "image" : "empty"}
            edit={!isUpdatingProfileImage && isHovered}
            className="h-full w-full"
          />
        </label>

        <div className="flex flex-1 justify-between gap-[12px]">
          <div className="gap-2xs flex min-w-0 flex-1 flex-col items-start">
            <div className="gap-xs flex items-center">
              <h2 className="text-text-primary font-pretendard text-lg font-bold">
                {profile.nickname}
              </h2>
              <Badge
                status="closed"
                radius="xs"
                className="bg-alpha-white-8 text-text-secondary px-xs py-2xs border-none text-[12px] font-semibold"
              >
                {profile.email}
              </Badge>
            </div>
            <p className="text-text-tertiary font-pretendard text-base font-normal">
              {profile.bio || "아직 한 줄 소개가 없습니다."}
            </p>
          </div>

          <div className="flex shrink-0 items-start justify-end gap-10">
            <div className="flex w-[88px] flex-col items-start gap-1">
              <span className="text-text-tertiary font-pretendard text-[15px] font-normal">
                참여한 세션
              </span>
              <span className="text-text-secondary font-pretendard text-lg font-semibold">
                {profile.participationSessionCount ?? 0}
              </span>
            </div>
            <div className="flex w-[88px] flex-col items-start gap-1">
              <span className="text-text-tertiary font-pretendard text-[15px] font-normal">
                누적 시간
              </span>
              <span className="text-text-secondary font-pretendard text-lg font-semibold">
                {formatSecondsToHours(profile.totalParticipationTime ?? 0)}
              </span>
            </div>
            <div className="flex w-[88px] flex-col items-start gap-1">
              <span className="text-text-tertiary font-pretendard text-[15px] font-normal">
                투두 달성률
              </span>
              <span className="text-text-brand-default font-pretendard text-lg font-semibold">
                {profile.todoCompletionRate ?? 0}%
              </span>
            </div>
            <div className="flex w-[88px] flex-col items-start gap-1">
              <span className="text-text-tertiary font-pretendard text-[15px] font-normal">
                집중률
              </span>
              <span className="text-text-status-positive-default font-pretendard text-lg font-semibold">
                {profile.focusRate ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
