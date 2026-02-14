import { ProfilePopup } from "@/features/member/components/ProfilePopup/ProfilePopup";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ProfilePopup> = {
  title: "Features/Member/ProfilePopup",
  component: ProfilePopup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    email: { control: "text" },
    avatarSrc: { control: "text" },
    focusTimeMinutes: { control: "number" },
    totalTimeMinutes: { control: "number" },
    todoCompleted: { control: "number" },
    todoTotal: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof ProfilePopup>;

export const WithAvatar: Story = {
  args: {
    name: "빵가루 요정 쥐이",
    email: "sewonlim9060@naver.com",
    avatarSrc: "https://github.com/shadcn.png", // Example image
    focusTimeMinutes: 30,
    totalTimeMinutes: 60,
    todoCompleted: 8,
    todoTotal: 10,
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
    avatarSrc: undefined,
  },
};

export const ZeroProgress: Story = {
  args: {
    ...WithAvatar.args,
    avatarSrc: undefined,
    focusTimeMinutes: 0,
    totalTimeMinutes: 60,
    todoCompleted: 0,
    todoTotal: 10,
  },
};
