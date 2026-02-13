import { ProfilePopup } from "@/features/member/components/ProfilePopup/ProfilePopup";

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";

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

export const Default: Story = {
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

export const NoAvatar: Story = {
  args: {
    ...Default.args,
    avatarSrc: undefined,
  },
};

export const ZeroProgress: Story = {
  args: {
    ...Default.args,
    focusTimeMinutes: 0,
    totalTimeMinutes: 60,
    todoCompleted: 0,
    todoTotal: 10,
  },
};
