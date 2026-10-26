import { SessionHeader } from "./SessionHeader";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Features/Session/SessionHeader",
  component: SessionHeader,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="w-[1172px]">
        <Story />
      </div>
    ),
  ],
  args: {
    sessionId: "story-session-header",
    showDialog: false,
    onShowDialog: () => undefined,
    onCloseDialog: () => undefined,
    isLeavingRef: { current: false },
  },
} satisfies Meta<typeof SessionHeader>;

export default META;
type Story = StoryObj<typeof META>;

/** 진행 중인 세션 헤더 */
export const DEFAULT: Story = {};
