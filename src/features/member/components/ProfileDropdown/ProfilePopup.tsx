"use client";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { FrameIcon } from "@/components/Icon/FrameIcon";
import { LogoutIcon } from "@/components/Icon/LogoutIcon";
import { NoteIcon } from "@/components/Icon/NoteIcon";
import { ProfileCircleIcon } from "@/components/Icon/ProfileCircleIcon";
import { cn } from "@/lib/utils/utils";

import { FocusStatusItem } from "./FocusStatusItem";
import { MenuItem, MenuItemContent, menuItemBaseClassName } from "./MenuItem";
import { ProfileHeader } from "./ProfileHeader";

import type { MemberProfileView } from "../../types";

const PROFILE_SETTINGS_PATH = "/profile/settings";
const PROFILE_REPORT_PATH = "/profile/report";
const FEEDBACK_PATH = "/feedback";

interface ProfilePopupProps {
  className?: string;
  profile: MemberProfileView;
  onClose?: () => void;
  onProfileSettingsClick?: () => void;
  onReportClick?: () => void;
  onFeedbackClick?: () => void;
  onLogoutClick?: () => void;
}

export function ProfilePopup({
  className,
  profile,
  onClose,
  onProfileSettingsClick,
  onReportClick,
  onFeedbackClick,
  onLogoutClick,
}: ProfilePopupProps) {
  const {
    nickname,
    email,
    profileImageUrl,
    focusedTime,
    totalParticipationTime,
    completedTodoCount,
    totalTodoCount,
  } = profile;

  const handleMenuItemClick = (callback?: () => void) => () => {
    onClose?.();
    callback?.();
  };

  const menuItems = [
    {
      key: "profile-settings",
      kind: "link" as const,
      icon: <ProfileCircleIcon className="h-[22px] w-[22px]" />,
      label: "프로필 설정",
      href: PROFILE_SETTINGS_PATH,
      onClick: handleMenuItemClick(onProfileSettingsClick),
    },
    {
      key: "report",
      kind: "link" as const,
      icon: <FrameIcon size="xsmall" className="h-[16px] w-[16px]" />,
      label: "기록 리포트",
      href: PROFILE_REPORT_PATH,
      onClick: handleMenuItemClick(onReportClick),
    },
    {
      key: "feedback",
      kind: "link" as const,
      icon: <NoteIcon className="h-[18px] w-[18px]" />,
      label: "피드백",
      href: FEEDBACK_PATH,
      onClick: handleMenuItemClick(onFeedbackClick),
    },
    {
      key: "logout",
      kind: "action" as const,
      icon: <LogoutIcon size="xsmall" className="h-[16px] w-[16px]" />,
      label: "로그아웃",
      onClick: handleMenuItemClick(onLogoutClick),
    },
  ];

  return (
    <div
      className={cn(
        "bg-background-subtle flex h-[603px] w-[386px] flex-col items-center overflow-hidden rounded-xl shadow-md",
        className
      )}
    >
      <ProfileHeader
        nickname={nickname}
        email={email}
        profileImageUrl={profileImageUrl}
        onClose={onClose}
      />

      <div className="flex h-[512px] w-full flex-col items-start justify-center gap-0 p-6">
        <div className="gap-sm flex w-full flex-col items-start">
          <FocusStatusItem
            focusedTime={focusedTime}
            totalParticipationTime={totalParticipationTime}
            completedTodoCount={completedTodoCount}
            totalTodoCount={totalTodoCount}
          />

          {menuItems.map((item) =>
            item.kind === "link" ? (
              <ButtonLink
                key={item.key}
                href={item.href}
                onClick={item.onClick}
                variant="ghost"
                colorScheme="secondary"
                className={cn(
                  menuItemBaseClassName,
                  "border-color-default hover:border-border-default hover:bg-surface-subtle"
                )}
              >
                <MenuItemContent icon={item.icon} label={item.label} />
              </ButtonLink>
            ) : (
              <MenuItem key={item.key} icon={item.icon} label={item.label} onClick={item.onClick} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
