import { type ReactNode } from "react";

import { TimerCircular } from "./TimerCircular";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Components/TimerCircular",
  component: TimerCircular,
  parameters: {
    layout: "centered",
  },
  args: {
    progress: 0,
    size: 150,
    strokeWidth: 6,
  },
} satisfies Meta<typeof TimerCircular>;

export default META;
type Story = StoryObj<typeof META>;

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="text-text-tertiary text-sm">{label}</span>
    </div>
  );
}

/** 내 타이머: default / running / paused / completed */
export const MY: Story = {
  render: (args) => (
    <div className="flex gap-8">
      <Cell label="default">
        <TimerCircular {...args} scope="my" state="default" progress={0} time="00:00" />
      </Cell>
      <Cell label="running">
        <TimerCircular {...args} scope="my" state="running" progress={70} time="42:00" />
      </Cell>
      <Cell label="paused">
        <TimerCircular {...args} scope="my" state="paused" progress={70} time="42:00" />
      </Cell>
      <Cell label="completed">
        <TimerCircular {...args} scope="my" state="completed" progress={100} time="60:00" />
      </Cell>
    </div>
  ),
};

/** 진행률에 따른 호 그라디언트 변화 (진행 중 상태) */
export const PROGRESS: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(["my", "all"] as const).map((scope) => (
        <div key={scope} className="flex flex-wrap gap-6">
          {[10, 30, 50, 70, 90, 100].map((progress) => (
            <Cell key={progress} label={`${scope} ${progress}%`}>
              <TimerCircular
                {...args}
                scope={scope}
                state="running"
                progress={progress}
                time="25:00"
              />
            </Cell>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** 전체 타이머: running / warning(남은 시간 10% 이하) / completed */
export const ALL: Story = {
  render: (args) => (
    <div className="flex gap-8">
      <Cell label="running">
        <TimerCircular {...args} scope="all" state="running" progress={70} time="18:00" />
      </Cell>
      <Cell label="warning">
        <TimerCircular {...args} scope="all" state="warning" progress={92} time="04:48" />
      </Cell>
      <Cell label="completed">
        <TimerCircular {...args} scope="all" state="completed" progress={100} time="00:00" />
      </Cell>
    </div>
  ),
};
