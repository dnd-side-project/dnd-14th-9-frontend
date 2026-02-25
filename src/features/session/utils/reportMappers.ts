import type { ActivitySummaryData, ReceivedEmojiItem } from "@/features/member/types";

import type {
  EmojiType,
  MemberEmojiResult,
  MyReportMemberResult,
  MyReportTodoItem,
  ReportTodoItem,
  SessionDetailResponse,
  SessionReportMember,
  SessionReportResponse,
} from "../types";

/**
 * MemberEmojiResult → ReceivedEmojiItem[]
 */
export function mapEmojiResultToItems(emojiResult: MemberEmojiResult): ReceivedEmojiItem[] {
  return [
    { emojiName: "HEART", count: emojiResult.heartCount },
    { emojiName: "THUMBS_UP", count: emojiResult.thumbsUpCount },
    { emojiName: "THUMBS_DOWN", count: emojiResult.thumbsDownCount },
    { emojiName: "STAR", count: emojiResult.starCount },
  ];
}

/**
 * MyReportTodoItem[] → ReportTodoItem[] (subtaskId → todoId)
 */
export function mapMyReportTodosToReportTodos(todos: MyReportTodoItem[]): ReportTodoItem[] {
  return todos.map((todo) => ({
    todoId: String(todo.subtaskId),
    content: todo.content,
    isCompleted: todo.isCompleted,
  }));
}

/**
 * MyReportMemberResult → ActivitySummaryData
 */
export function mapMemberResultToActivitySummary(
  memberResult: MyReportMemberResult
): ActivitySummaryData {
  return {
    focusedTime: memberResult.totalFocusSeconds,
    totalParticipationTime: memberResult.overallFocusSeconds,
    focusRate: memberResult.focusRate,
  };
}

/**
 * SessionDetailResponse → SessionDetailSection props
 */
export function mapSessionDetailToProps(detail: SessionDetailResponse) {
  return {
    thumbnailUrl: detail.imageUrl,
    category: detail.category,
    title: detail.title,
    description: detail.summary,
    currentParticipants: detail.currentParticipants,
    maxParticipants: detail.maxParticipants,
    durationMinutes: detail.sessionDurationMinutes,
    sessionDate: detail.startTime,
    notice: detail.notice,
  };
}

/**
 * ParticipantGoalSection emoji key → EmojiType
 */
const EMOJI_KEY_MAP: Record<"heart" | "thumbsUp" | "thumbsDown" | "star", EmojiType> = {
  heart: "HEART",
  thumbsUp: "THUMBS_UP",
  thumbsDown: "THUMBS_DOWN",
  star: "STAR",
};

export function mapEmojiKeyToType(key: "heart" | "thumbsUp" | "thumbsDown" | "star"): EmojiType {
  return EMOJI_KEY_MAP[key];
}

/**
 * SessionReportResponse → ActivitySummaryData (세션 평균)
 */
export function mapSessionReportToActivitySummary(
  report: SessionReportResponse
): ActivitySummaryData {
  return {
    focusedTime: report.averageTotalFocusSeconds,
    totalParticipationTime: report.averageOverallSeconds,
    focusRate: report.averageFocusRate,
  };
}

/**
 * SessionReportMember → ParticipantGoalSection props
 */
export function mapSessionReportMemberToParticipantProps(member: SessionReportMember) {
  return {
    participantName: member.nickname,
    profileImageUrl: member.profileImageUrl,
    goal: member.goal,
    todoAchievementRate: member.achievementRate,
    focusRate: member.focusRate,
  };
}
