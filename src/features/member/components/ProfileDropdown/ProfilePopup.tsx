"use client";

import { usePathname } from "next/navigation";

import { Badge } from "@/components/Badge/Badge";
import { ButtonLink } from "@/components/Button/ButtonLink";
import { BarGraphIcon } from "@/components/Icon/BarGraphIcon";
import { EditContainedIcon } from "@/components/Icon/EditContainedIcon";
import { LogoutIcon } from "@/components/Icon/LogoutIcon";
import { getCategoryLabel } from "@/lib/constants/category";
import type { Category } from "@/lib/constants/category";
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
    firstInterestCategory,
    secondInterestCategory,
    thirdInterestCategory,
  } = profile;

  const handleMenuItemClick = (callback?: () => void) => () => {
    onClose?.();
    callback?.();
  };

  const pathname = usePathname();

  const getLinkClassName = (href: string) =>
    cn(
      menuItemBaseClassName,
      "border-color-default hover:border-border-default pr-md pl-lg py-md",
      pathname === href && "bg-surface-strong!"
    );

  return (
    <div
      className={cn(
        "px-lg py-md gap-sm border-border-default bg-surface-default flex w-[428px] flex-col rounded-lg border",
        className
      )}
    >
      <ProfileHeader
        nickname={nickname}
        email={email}
        profileImageUrl={profileImageUrl}
        onClose={onClose}
      />

      <div className="gap-md flex flex-col">
        <div className="gap-xs flex">
          {firstInterestCategory && (
            <div className="gap-xs flex items-center">
              <p className="text-text-primary text-xs font-semibold">1순위</p>
              <Badge>{getCategoryLabel(firstInterestCategory as Category)}</Badge>
            </div>
          )}
          {secondInterestCategory && (
            <div className="gap-xs flex items-center">
              <p className="text-text-primary text-xs font-semibold">2순위</p>
              <Badge>{getCategoryLabel(secondInterestCategory as Category)}</Badge>
            </div>
          )}
          {thirdInterestCategory && (
            <div className="gap-xs flex items-center">
              <p className="text-text-primary text-xs font-semibold">3순위</p>
              <Badge>{getCategoryLabel(thirdInterestCategory as Category)}</Badge>
            </div>
          )}
        </div>

        <FocusStatusItem
          focusedTime={focusedTime}
          totalParticipationTime={totalParticipationTime}
          completedTodoCount={completedTodoCount}
          totalTodoCount={totalTodoCount}
        />

        <ButtonLink
          href={PROFILE_REPORT_PATH}
          onClick={handleMenuItemClick(onReportClick)}
          variant="ghost"
          colorScheme="secondary"
          className={getLinkClassName(PROFILE_REPORT_PATH)}
        >
          <MenuItemContent
            icon={<BarGraphIcon size="xsmall" className="h-[20px] w-[20px]" />}
            label="기록 리포트"
            isActive={pathname === PROFILE_REPORT_PATH}
          />
        </ButtonLink>

        <ButtonLink
          href={FEEDBACK_PATH}
          onClick={handleMenuItemClick(onFeedbackClick)}
          variant="ghost"
          colorScheme="secondary"
          className={getLinkClassName(FEEDBACK_PATH)}
        >
          <MenuItemContent
            icon={<EditContainedIcon size="xsmall" className="h-[20px] w-[20px]" />}
            label="피드백 남기기"
            isActive={pathname === FEEDBACK_PATH}
          />
        </ButtonLink>

        <div className="flex justify-end">
          <MenuItem
            icon={<LogoutIcon size="xsmall" className="h-[20px] w-[20px]" />}
            label="로그아웃"
            onClick={handleMenuItemClick(onLogoutClick)}
            className="bg-surface-strong pl-md gap-sm text-text-muted! justify-center border-none py-[12px] pr-[20px]"
          />
        </div>
      </div>
    </div>
  );
}
