import { ProfilePopup } from "@/features/member/components/ProfileDropdown/ProfilePopup";
import type { MemberProfileView } from "@/features/member/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const baseProfile: MemberProfileView = {
  id: 1,
  nickname: "빵가루 요정 쥐이",
  profileImageUrl: "https://github.com/shadcn.png",
  email: "sewonlim9060@naver.com",
  bio: null,
  socialProvider: "kakao",
  totalParticipationTime: 60,
  focusedTime: 30,
  focusRate: 50,
  totalTodoCount: 10,
  completedTodoCount: 8,
  todoCompletionRate: 80,
  participationSessionCount: 5,
  firstLogin: false,
};

const meta: Meta<typeof ProfilePopup> = {
  title: "Features/Member/ProfilePopup",
  component: ProfilePopup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    profile: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof ProfilePopup>;

export const WithAvatar: Story = {
  args: {
    profile: baseProfile,
    onClose: () => alert("Close clicked"),
    onProfileSettingsClick: () => alert("Profile Settings clicked"),
    onReportClick: () => alert("Report clicked"),
    onFeedbackClick: () => alert("Feedback clicked"),
    onLogoutClick: () => alert("Logout clicked"),
  },
};

export const Default: Story = {
  args: {
    ...WithAvatar.args,
    profile: {
      ...baseProfile,
      profileImageUrl: "",
    },
  },
};

export const ZeroProgress: Story = {
  args: {
    ...WithAvatar.args,
    profile: {
      ...baseProfile,
      profileImageUrl: "",
      focusedTime: 0,
      totalParticipationTime: 60,
      completedTodoCount: 0,
      totalTodoCount: 10,
      focusRate: 0,
      todoCompletionRate: 0,
    },
  },
};
