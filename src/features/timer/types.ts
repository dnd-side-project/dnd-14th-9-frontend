// TODO(장근호) - 조정.
export type TimerMode = "stopwatch";

export interface TimerState {
  seconds: number; // 경과 시간 or 남은 시간
  isRunning: boolean;
  mode: TimerMode;
  targetSeconds: number; // countdown 목표 시간
}
