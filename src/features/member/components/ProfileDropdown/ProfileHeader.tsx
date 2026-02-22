"use client";

import { Avatar } from "@/components/Avatar/Avatar";
import { CloseIcon } from "@/components/Icon/CloseIcon";

interface ProfileHeaderProps {
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  onClose?: () => void;
}

export function ProfileHeader({ nickname, email, profileImageUrl, onClose }: ProfileHeaderProps) {
  return (
    <div className="gap-md relative flex w-full items-start bg-gray-900 px-6 pt-6">
      <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center">
        <Avatar
          type={profileImageUrl ? "image" : "empty"}
          src={profileImageUrl ?? undefined}
          alt={nickname}
          size="xlarge"
        />
      </div>
      <div className="flex flex-1 flex-col items-start">
        <p className="text-common-white font-pretendard w-full text-lg font-semibold">{nickname}</p>
        <p className="text-alpha-white-48 font-pretendard w-full text-[13px] text-gray-400">
          {email ?? ""}
        </p>
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 -mt-2.5 -mr-2.5 flex cursor-pointer items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-gray-800"
        aria-label="Close"
      >
        <div className="h-6 w-6 overflow-hidden">
          <CloseIcon className="text-gray-400" />
        </div>
      </button>
    </div>
  );
}
