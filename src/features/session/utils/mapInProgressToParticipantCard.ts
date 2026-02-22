import type {
  SessionInProgressMember,
  SessionInProgressResponse,
  SessionInProgressTodo,
} from "@/features/session/types";

export interface SessionParticipantTodoViewModel {
  todoId: string;
  content: string;
  isCompleted: boolean;
}

export interface SessionParticipantCardMemberViewModel {
  memberId: string;
  nickname: string;
  profileImageUrl?: string;
  isHost: boolean;
  goal: string;
  isFocusing: boolean;
  focusedSeconds: number;
  achievementRate: number;
  completedCount: number;
  todos: SessionParticipantTodoViewModel[];
}

export interface SessionParticipantCardViewModel {
  participantCount: number;
  averageAchievementRate: number;
  members: SessionParticipantCardMemberViewModel[];
}

function mapTodo(todo: SessionInProgressTodo | null | undefined, index: number) {
  return {
    todoId: String(todo?.subtaskId ?? index),
    content: todo?.content ?? "",
    isCompleted: Boolean(todo?.isCompleted),
  };
}

function mapMember(member: SessionInProgressMember | null | undefined, index: number) {
  const todos = (member?.task?.todos ?? []).map(mapTodo);

  return {
    memberId: String(member?.memberId ?? index),
    nickname: member?.nickname ?? "알 수 없는 사용자",
    profileImageUrl: member?.profileImageUrl ?? undefined,
    isHost: member?.role === "HOST",
    goal: member?.task?.goal ?? "목표 없음",
    isFocusing: member?.status === "FOCUSED",
    focusedSeconds: 0,
    achievementRate: member?.achievementRate ?? 0,
    completedCount: todos.filter((t) => t.isCompleted).length,
    todos,
  };
}

export function mapInProgressToParticipantCard(
  result: SessionInProgressResponse | null | undefined
): SessionParticipantCardViewModel {
  const members = (result?.members ?? []).map(mapMember);

  return {
    participantCount: result?.participantCount ?? 0,
    averageAchievementRate: result?.averageAchievementRate ?? 0,
    members,
  };
}
