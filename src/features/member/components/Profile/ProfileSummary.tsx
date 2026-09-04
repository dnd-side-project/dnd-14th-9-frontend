"use client";

import { type ChangeEvent, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { useMe, useUpdateProfileImage } from "@/features/member/hooks/useMemberHooks";
import { toast } from "@/lib/toast";
import { formatHHMMSS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const validateProfileImageFile = (file: File): string | null => {
  if (file.size > MAX_PROFILE_IMAGE_SIZE) return "5MB 이하 파일만 업로드 가능해요";
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) return "jpg, png, webp만 지원해요";
  return null;
};

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function StatItem({ label, value, valueClassName }: StatItemProps) {
  return (
    <div className="flex w-full flex-col items-start gap-0.5 md:w-auto md:gap-1 xl:w-22">
      <span className="text-text-tertiary text-[13px] font-normal md:text-[15px]">{label}</span>
      <span className={cn("text-base font-semibold md:text-lg", valueClassName)}>{value}</span>
    </div>
  );
}

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
    <div className="flex w-full flex-col items-start gap-6 md:gap-10">
      <h1 className="text-text-primary text-lg font-bold md:text-2xl">마이페이지</h1>

      <div className="grid w-full grid-cols-[auto_1fr] items-start gap-x-4 gap-y-6 md:gap-x-5 md:gap-y-5 xl:flex xl:flex-row xl:items-start xl:gap-5">
        {/* 1. 아바타 */}
        <label
          className="relative col-start-1 row-start-1 flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center md:h-16 md:w-16 xl:shrink-0"
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
            className="size-full"
          />
        </label>

        {/* 2. 프로필 정보 */}
        <div className="col-start-2 row-start-1 flex min-w-0 flex-1 flex-col items-start gap-1">
          <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
            <h2 className="text-text-primary text-base font-bold md:text-lg">{profile.nickname}</h2>
            <ChipBadge
              status="closed"
              radius="xs"
              className="bg-alpha-white-8 text-text-secondary max-w-full px-2 py-1 text-[10px] md:text-xs"
            >
              {profile.email}
            </ChipBadge>
          </div>
          <p className="text-text-tertiary text-[13px] font-normal md:text-[15px]">
            {profile.bio || "아직 한 줄 소개가 없습니다."}
          </p>
        </div>

        {/* 3. 세션 통계 */}
        <div className="bg-surface-strong col-span-2 col-start-1 row-start-2 flex flex-col gap-4 rounded-md p-4 px-5 md:col-span-1 md:col-start-2 md:row-start-2 md:flex-row md:items-center md:gap-10 md:rounded-none md:bg-transparent md:p-0 xl:flex xl:w-auto xl:shrink-0 xl:justify-end xl:gap-10">
          <div className="grid grid-cols-2 gap-3 md:contents">
            <StatItem
              label="참여한 세션"
              value={profile.participationSessionCount ?? 0}
              valueClassName="text-text-secondary"
            />
            <StatItem
              label="누적 시간"
              value={formatHHMMSS(profile.totalParticipationTime ?? 0)}
              valueClassName="text-text-secondary"
            />
          </div>

          <div className="bg-alpha-white-8 h-px w-full md:hidden" />

          <div className="grid grid-cols-2 gap-3 md:contents">
            <StatItem
              label="투두 달성률"
              value={`${profile.todoCompletionRate ?? 0}%`}
              valueClassName="text-text-brand-default"
            />
            <StatItem
              label="집중률"
              value={`${profile.focusRate ?? 0}%`}
              valueClassName="text-text-status-positive-default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
