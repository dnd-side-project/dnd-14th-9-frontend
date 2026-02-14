"use client";

import { Avatar } from "@/components/Avatar/Avatar";
import { CloseIcon } from "@/components/Icon/CloseIcon";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarSrc?: string;
  onClose?: () => void;
}

export function ProfileHeader({ name, email, avatarSrc, onClose }: ProfileHeaderProps) {
  return (
    <div className="flex w-full items-center gap-4 bg-gray-900 px-6 pt-6 pb-2">
      <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center">
        <Avatar src={avatarSrc} alt={name} size="large" />
      </div>
      <div className="flex flex-1 flex-col items-start gap-1">
        <p className="text-common-white font-pretendard w-full text-lg font-semibold">{name}</p>
        <p className="text-alpha-white-48 font-pretendard w-full text-[13px]">{email}</p>
      </div>
      <button
        onClick={onClose}
        className="flex cursor-pointer items-center justify-center rounded-lg p-2.5 transition-colors hover:bg-gray-800"
        aria-label="Close"
      >
        <div className="h-6 w-6 overflow-hidden">
          <CloseIcon className="text-gray-400" />
        </div>
      </button>
    </div>
  );
}
