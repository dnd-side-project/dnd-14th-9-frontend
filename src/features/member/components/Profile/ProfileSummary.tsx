"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { useMe } from "@/features/member/hooks/useMemberHooks";

export function ProfileSummary() {
  const { data } = useMe();
  const profile = data?.result;
  const [isHovered, setIsHovered] = useState(false);

  if (!profile) return null;

  return (
    <div className="gap-3xl flex w-full flex-col items-start">
      <h1 className="text-text-primary font-pretendard text-2xl font-bold">마이페이지</h1>

      <div className="flex w-full items-start gap-5">
        <label
          className="relative h-16 w-16 shrink-0 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* TODO: 구현에 따라 커스텀 업로드 핸들러 연동 */}
          <input type="file" className="hidden" accept="image/*" />
          <Avatar
            src={profile.profileImageUrl ?? undefined}
            alt={profile.nickname}
            size="xlarge"
            type={profile.profileImageUrl ? "image" : "empty"}
            edit={isHovered}
            className="h-full w-full"
          />
        </label>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1 pt-1">
          <h2 className="text-text-primary font-pretendard text-lg font-bold">
            {profile.nickname}
          </h2>
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
              {profile.totalParticipationTime ?? 0}시간
            </span>
          </div>
          <div className="flex w-[88px] flex-col items-start gap-1">
            <span className="text-text-tertiary font-pretendard text-[15px] font-normal">
              투두 달성률
            </span>
            <span className="text-brand-default font-pretendard text-lg font-semibold">
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
  );
}
