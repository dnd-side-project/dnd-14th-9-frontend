import { SessionDetailSection } from "./SessionDetailSection";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Features/Session/SessionDetailSection",
  component: SessionDetailSection,
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
    thumbnailUrl: "/images/thumbnail-fallback.svg",
    category: "개발",
    title: "아침 코딩 모각작",
    description: "아침 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다!",
    currentParticipants: 6,
    maxParticipants: 10,
    durationMinutes: 60,
    sessionDate: "2026-03-01T10:00:00",
    notice: "빡집중해서 같이 코딩해요!\n무분별한 자리비움은 지양합니다🙅‍♂️",
  },
} satisfies Meta<typeof SessionDetailSection>;

export default META;
type Story = StoryObj<typeof META>;

/** 진행 중인 세션 상세 */
export const DEFAULT: Story = {};
