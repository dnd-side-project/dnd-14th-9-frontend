"use client";

import { usePathname } from "next/navigation";

import { BarGraphIcon } from "@/components/Icon/BarGraphIcon";
import { EditContainedIcon } from "@/components/Icon/EditContainedIcon";
import { LogoutIcon } from "@/components/Icon/LogoutIcon";
import { cn } from "@/lib/utils/utils";

import { PATHS } from "./constants";
import { FocusStatusItem } from "./FocusStatusItem";
import { InterestBadges } from "./InterestBadges";
import { MenuLink } from "./MenuLink";
import { ProfileHeader } from "./ProfileHeader";

import type { MemberProfileView } from "../../types";

const MENU_ITEMS = [
  {
    href: PATHS.PROFILE_REPORT,
    icon: <BarGraphIcon size="xsmall" className="h-5 w-5" />,
    label: "기록 리포트",
    callbackKey: "onReportClick",
  },
  {
    href: PATHS.FEEDBACK,
    icon: <EditContainedIcon size="xsmall" className="h-5 w-5" />,
    label: "피드백 남기기",
    callbackKey: "onFeedbackClick",
  },
] as const;

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
  onReportClick,
  onFeedbackClick,
  onLogoutClick,
}: ProfilePopupProps) {
  const pathname = usePathname();

  const callbacks: Record<string, (() => void) | undefined> = {
    onReportClick,
    onFeedbackClick,
  };

  const handleMenuItemClick = (callbackKey: string) => () => {
    onClose?.();
    callbacks[callbackKey]?.();
  };

  const handleLogout = () => {
    onClose?.();
    onLogoutClick?.();
  };

  return (
    <div
      className={cn(
        "px-lg py-md gap-sm border-border-default bg-surface-default flex w-107 flex-col rounded-lg border",
        className
      )}
    >
      <ProfileHeader
        nickname={profile.nickname}
        email={profile.email}
        profileImageUrl={profile.profileImageUrl}
        onClose={onClose}
      />

      <div className="gap-md flex flex-col">
        <InterestBadges profile={profile} />

        <FocusStatusItem
          focusedTime={profile.focusedTime}
          totalParticipationTime={profile.totalParticipationTime}
          completedTodoCount={profile.completedTodoCount}
          totalTodoCount={profile.totalTodoCount}
        />

        {MENU_ITEMS.map(({ href, icon, label, callbackKey }) => (
          <MenuLink
            key={href}
            href={href}
            icon={icon}
            label={label}
            isActive={pathname === href}
            onClick={handleMenuItemClick(callbackKey)}
          />
        ))}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="group gap-sm bg-surface-strong pl-md text-text-tertiary flex items-center justify-center rounded-md py-3 pr-5"
          >
            <div className="gap-sm flex items-center">
              <div className="text-text-muted relative flex shrink-0 items-center justify-center rounded-full transition-colors">
                <LogoutIcon size="xsmall" className="h-5 w-5" />
              </div>
              <p className="text-text-muted text-[14px] font-semibold transition-colors">
                로그아웃
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
