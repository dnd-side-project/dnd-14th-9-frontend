import { MyTimer } from "./MyTimer";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const SESSION_DURATION_MINUTES = 60;
const MAX_SECONDS = SESSION_DURATION_MINUTES * 60;

const META = {
  title: "Features/Session/MyTimer",
  component: MyTimer,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
  args: {
    sessionId: "story-my-timer",
    sessionDurationMinutes: SESSION_DURATION_MINUTES,
  },
} satisfies Meta<typeof MyTimer>;

export default META;
type Story = StoryObj<typeof META>;

// shortcut: 정지/시작 버튼은 실제 API(/api/sessions/:id/me/status)를 호출해 Storybook에선 실패 후 롤백된다, 인터랙션 검증이 필요하면 fetch 목킹을 추가
// useSessionTimer가 localStorage("session-timer:{sessionId}")에서 상태를 복원하므로 스토리별로 미리 심는다
function withTimerState(sessionId: string, elapsedSeconds: number, isRunning: boolean): Story {
  return {
    args: { sessionId },
    // 진행 중에는 매초 시간이 바뀌어 Chromatic 스냅샷이 흔들리므로 제외한다
    parameters: { chromatic: { disableSnapshot: isRunning } },
    beforeEach: () => {
      const key = `session-timer:${sessionId}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          elapsedSeconds,
          focusedSeconds: elapsedSeconds,
          focusRate: Math.round((elapsedSeconds / MAX_SECONDS) * 100),
          isFocusing: isRunning,
          isRunning,
          lastSavedAt: Date.now(),
        })
      );
      return () => localStorage.removeItem(key);
    },
  };
}

/** 시작 전 (00:00에서 정지) */
export const DEFAULT = withTimerState("story-my-timer-default", 0, false);

/** 진행 중 (25분 경과, 집중 중) */
export const RUNNING = withTimerState("story-my-timer-running", 25 * 60, true);

/** 일시정지 (자리 비움) */
export const PAUSED = withTimerState("story-my-timer-paused", 25 * 60, false);

/** 진행률 92% (호 그라디언트 확인용, 별도 상태가 아님) */
export const RUNNING_HIGH_PROGRESS = withTimerState("story-my-timer-high-progress", 55 * 60, true);

/** 세션 종료 */
export const COMPLETED = withTimerState("story-my-timer-completed", MAX_SECONDS, false);
