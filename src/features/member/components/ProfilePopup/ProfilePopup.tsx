"use client";

import { LogOut, FileText, MessageSquare } from "lucide-react"; // Using lucide-react for likely missing icons

import { ProfileIcon } from "@/components/Icon/ProfileIcon";
import { cn } from "@/lib/utils/utils";

import { FocusStatusItem } from "./FocusStatusItem";
import { MenuItem } from "./MenuItem";
import { ProfileHeader } from "./ProfileHeader";

interface ProfilePopupProps {
  className?: string;
  name: string;
  email: string;
  avatarSrc?: string;
  focusTimeMinutes: number;
  totalTimeMinutes: number;
  todoCompleted: number;
  todoTotal: number;
  onClose?: () => void;
  onProfileSettingsClick?: () => void;
  onReportClick?: () => void;
  onFeedbackClick?: () => void;
  onLogoutClick?: () => void;
}

export function ProfilePopup({
  className,
  name,
  email,
  avatarSrc,
  focusTimeMinutes,
  totalTimeMinutes,
  todoCompleted,
  todoTotal,
  onClose,
  onProfileSettingsClick,
  onReportClick,
  onFeedbackClick,
  onLogoutClick,
}: ProfilePopupProps) {
  const menuItems = [
    {
      key: "profile-settings",
      icon: <ProfileIcon className="h-[22px] w-[22px]" />,
      label: "프로필 설정",
      onClick: onProfileSettingsClick,
    },
    {
      key: "report",
      icon: <FileText size={16} strokeWidth={1.5} />,
      label: "기록 리포트",
      onClick: onReportClick,
    },
    {
      key: "feedback",
      icon: <MessageSquare size={18} strokeWidth={1.5} />,
      label: "피드백",
      onClick: onFeedbackClick,
    },
    {
      key: "logout",
      icon: <LogOut size={16} strokeWidth={1.5} />,
      label: "로그아웃",
      onClick: onLogoutClick,
    },
  ];

  return (
    <div
      className={cn(
        "flex h-[603px] w-[386px] flex-col items-center overflow-hidden rounded-xl bg-gray-900 shadow-md",
        className
      )}
    >
      <ProfileHeader name={name} email={email} avatarSrc={avatarSrc} onClose={onClose} />

      <div className="flex h-[512px] w-full flex-col items-start justify-center gap-0 p-6">
        <div className="flex w-full flex-col items-start gap-3">
          <FocusStatusItem
            focusTimeMinutes={focusTimeMinutes}
            totalTimeMinutes={totalTimeMinutes}
            todoCompleted={todoCompleted}
            todoTotal={todoTotal}
          />

          {menuItems.map((item) => (
            <MenuItem key={item.key} icon={item.icon} label={item.label} onClick={item.onClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
