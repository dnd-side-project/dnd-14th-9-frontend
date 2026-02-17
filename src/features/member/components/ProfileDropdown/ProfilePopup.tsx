"use client";

import { LogOut, FileText, MessageSquare } from "lucide-react";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ProfileIcon } from "@/components/Icon/ProfileIcon";
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
      icon: <ProfileIcon className="h-[22px] w-[22px]" />,
      label: "프로필 설정",
      href: PROFILE_SETTINGS_PATH,
      onClick: handleMenuItemClick(onProfileSettingsClick),
    },
    {
      key: "report",
      kind: "link" as const,
      icon: <FileText size={16} strokeWidth={1.5} />,
      label: "기록 리포트",
      href: PROFILE_REPORT_PATH,
      onClick: handleMenuItemClick(onReportClick),
    },
    {
      key: "feedback",
      kind: "link" as const,
      icon: <MessageSquare size={18} strokeWidth={1.5} />,
      label: "피드백",
      href: FEEDBACK_PATH,
      onClick: handleMenuItemClick(onFeedbackClick),
    },
    {
      key: "logout",
      kind: "action" as const,
      icon: <LogOut size={16} strokeWidth={1.5} />,
      label: "로그아웃",
      onClick: handleMenuItemClick(onLogoutClick),
    },
  ];

  return (
    <div
      className={cn(
        "flex h-[603px] w-[386px] flex-col items-center overflow-hidden rounded-xl bg-gray-900 shadow-md",
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
        <div className="flex w-full flex-col items-start gap-3">
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
                size="small"
                className={cn(
                  menuItemBaseClassName,
                  "border-transparent bg-gray-800 hover:border-green-500 hover:bg-gray-800"
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
