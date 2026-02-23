"use client";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { CloseIcon } from "@/components/Icon/CloseIcon";
import { EditIcon } from "@/components/Icon/EditIcon";

import { ButtonLink } from "../../../../components/Button/ButtonLink";

interface ProfileHeaderProps {
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  onClose?: () => void;
}

export function ProfileHeader({ nickname, email, profileImageUrl, onClose }: ProfileHeaderProps) {
  return (
    <div className="py-sm gap-sm flex">
      <Avatar
        type={profileImageUrl ? "image" : "empty"}
        src={profileImageUrl ?? undefined}
        alt={nickname}
        size="xlarge"
        className="h-12 w-12"
      />
      <div className="gap-3xs flex flex-col">
        <div className="gap-xs flex items-center">
          <p className="text-common-white text-lg font-semibold">{nickname}</p>
          <ButtonLink
            colorScheme="tertiary"
            size="xsmall"
            leftIcon={<EditIcon className="h-[18px] w-[18px]" />}
            href="/profile/settings"
            onClick={onClose}
            className="rounded-[4px] pl-[4px]"
          >
            프로필 수정
          </ButtonLink>
        </div>
        <p className="text-alpha-white-48 font-regular text-[13px]">{email ?? ""}</p>
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
