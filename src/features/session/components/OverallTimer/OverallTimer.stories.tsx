import { type ComponentProps, useState } from "react";

import { OverallTimer } from "./OverallTimer";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const SESSION_DURATION_MINUTES = 60;

const META = {
  title: "Features/Session/OverallTimer",
  component: OverallTimer,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  args: {
    sessionEndTime: new Date(),
    sessionDurationMinutes: SESSION_DURATION_MINUTES,
    focusingCount: 4,
    totalCount: 6,
  },
} satisfies Meta<typeof OverallTimer>;

export default META;
type Story = StoryObj<typeof META>;

// useCountdown은 sessionEndTime 객체가 바뀔 때마다 interval을 다시 만들어서, 종료 시각을 마운트 시 한 번만 계산한다
function OverallTimerWithRemaining({
  remainingSeconds,
  ...props
}: Omit<ComponentProps<typeof OverallTimer>, "sessionEndTime"> & { remainingSeconds: number }) {
  const [sessionEndTime] = useState(() => new Date(Date.now() + remainingSeconds * 1000));
  return <OverallTimer {...props} sessionEndTime={sessionEndTime} />;
}

function withRemaining(remainingSeconds: number): Story {
  return {
    // 남은 시간이 있으면 매초 시간이 바뀌어 Chromatic 스냅샷이 흔들리므로 제외한다
    parameters: { chromatic: { disableSnapshot: remainingSeconds > 0 } },
    render: (args) => <OverallTimerWithRemaining {...args} remainingSeconds={remainingSeconds} />,
  };
}

/** 진행 중 (40분 남음) */
export const RUNNING = withRemaining(40 * 60);

/** 경고 (남은 시간 10% 이하, 5분 뒤 종료 상태로 바뀜) */
export const WARNING = withRemaining(5 * 60);

/** 종료 */
export const COMPLETED = withRemaining(-1);
