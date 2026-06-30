import {
  createMockSession,
  getMockInProgress,
  getMockMyReport,
  getMockSessionDetail,
  getMockSessionList,
  getMockSessionReport,
  getMockWaitingRoom,
  MockMemberNotFoundError,
  MockSessionNotFoundError,
  MockSubtaskNotFoundError,
  MockTaskNotFoundError,
  joinMockSession,
  kickMockSessionMembers,
  sendMockReaction,
  resetMockSessions,
  submitMockSessionResult,
  updateMockTaskGoal,
  createMockSubtasks,
  updateMockSubtask,
  deleteMockSubtask,
  toggleMockSubtaskCompletion,
} from "@/mocks/handlers/session-state";
import {
  getMockInProgressMembersSSEPayload,
  getMockWaitingMembersSSEPayload,
} from "@/mocks/handlers/sse-payloads";

describe("MSW session state store", () => {
  beforeEach(() => {
    resetMockSessions();
  });

  it("create -> list/detail -> join -> waiting/in-progress -> result/report 흐름을 같은 세션 상태로 이어준다", () => {
    const createdSessionId = createMockSession({
      title: "MSW 플로우 점검 세션",
      summary: "로컬 mock 백엔드로 전체 세션 흐름 확인",
      notice: "TDD로 상태 일관성을 검증합니다.",
      category: "DEVELOPMENT",
      startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      sessionDurationMinutes: 60,
      maxParticipants: 4,
      requiredFocusRate: 50,
      requiredAchievementRate: 40,
    }).createdSessionId;

    expect(getMockSessionList({ keyword: "MSW 플로우", page: 1, size: 10 }).sessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sessionId: createdSessionId,
          title: "MSW 플로우 점검 세션",
          status: "WAITING",
        }),
      ])
    );

    expect(getMockSessionDetail(createdSessionId)).toEqual(
      expect.objectContaining({
        sessionId: createdSessionId,
        title: "MSW 플로우 점검 세션",
        status: "대기",
        currentParticipants: 0,
      })
    );

    expect(
      joinMockSession(createdSessionId, {
        goal: "MSW 세션 상태 구현",
        todos: ["세션 생성", "대기방 확인"],
      })
    ).toEqual({
      sessionId: createdSessionId,
      memberId: 1,
      role: "HOST",
    });

    expect(getMockWaitingRoom(createdSessionId)).toEqual(
      expect.objectContaining({
        participantCount: 1,
        members: [
          expect.objectContaining({
            memberId: 1,
            role: "HOST",
            task: expect.objectContaining({
              goal: "MSW 세션 상태 구현",
              todos: [
                expect.objectContaining({ content: "세션 생성" }),
                expect.objectContaining({ content: "대기방 확인" }),
              ],
            }),
          }),
        ],
      })
    );

    expect(getMockInProgress(createdSessionId)).toEqual(
      expect.objectContaining({
        participantCount: 1,
        members: [
          expect.objectContaining({
            memberId: 1,
            achievementRate: 0,
            task: expect.objectContaining({ goal: "MSW 세션 상태 구현" }),
          }),
        ],
      })
    );

    submitMockSessionResult(createdSessionId, {
      totalFocusSeconds: 1800,
      overallSeconds: 2400,
    });

    expect(getMockMyReport(createdSessionId)).toEqual(
      expect.objectContaining({
        sessionId: createdSessionId,
        currentParticipants: 1,
        sessionMemberResult: expect.objectContaining({
          memberId: 1,
          focusRate: 75,
          totalFocusSeconds: 1800,
          overallFocusSeconds: 2400,
          task: expect.objectContaining({ goal: "MSW 세션 상태 구현" }),
        }),
      })
    );

    expect(getMockSessionReport(createdSessionId)).toEqual(
      expect.objectContaining({
        averageTotalFocusSeconds: 1800,
        averageOverallSeconds: 2400,
        averageFocusRate: 75,
        members: [
          expect.objectContaining({
            memberId: 1,
            goal: "MSW 세션 상태 구현",
            focusRate: 75,
          }),
        ],
      })
    );
  });

  it("seeded session 900 exposes my 5 todos and 10 participants through REST and SSE payloads", () => {
    const waitingRoom = getMockWaitingRoom(900);
    const inProgress = getMockInProgress(900);
    const waitingSSE = getMockWaitingMembersSSEPayload(900);
    const inProgressSSE = getMockInProgressMembersSSEPayload(900);

    expect(waitingRoom.participantCount).toBe(10);
    expect(waitingRoom.members).toHaveLength(10);
    expect(waitingRoom.members[0].task?.todos).toHaveLength(5);

    expect(inProgress.participantCount).toBe(10);
    expect(inProgress.members).toHaveLength(10);
    expect(inProgress.members[0]).toEqual(
      expect.objectContaining({
        memberId: 1,
        task: expect.objectContaining({
          goal: "MSW 로컬 mock 백엔드 완성하기",
          todos: expect.arrayContaining([
            expect.objectContaining({ content: "세션 상세 mock 데이터 확인" }),
            expect.objectContaining({ content: "나의 목표 카드 UI 점검" }),
            expect.objectContaining({ content: "참여자 목록 10명 노출 확인" }),
            expect.objectContaining({ content: "할 일 완료 토글 동작 확인" }),
            expect.objectContaining({ content: "세션 종료 후 리포트 확인" }),
          ]),
        }),
      })
    );

    expect(waitingSSE).toEqual({
      eventType: "ROOM_UPDATE",
      data: expect.objectContaining({ participantCount: 10, members: expect.any(Array) }),
    });
    if (waitingSSE.eventType !== "ROOM_UPDATE") {
      throw new Error("Expected ROOM_UPDATE waiting SSE payload");
    }

    expect(waitingSSE.data.members).toHaveLength(10);
    expect(inProgressSSE.members).toHaveLength(10);
    expect(inProgressSSE.members[0].task?.todos).toHaveLength(5);
  });

  it("result focusRate가 0이면 기존 focusRate로 대체하지 않는다", () => {
    submitMockSessionResult(900, {
      totalFocusSeconds: 0,
      overallSeconds: 2400,
    });

    expect(getMockMyReport(900).sessionMemberResult.focusRate).toBe(0);
    expect(getMockSessionReport(900).members[0]).toEqual(
      expect.objectContaining({
        memberId: 1,
        focusRate: 0,
      })
    );
  });

  it("unknown session id는 기본 세션으로 조용히 대체하지 않는다", () => {
    expect(() => getMockSessionDetail(404404)).toThrow(MockSessionNotFoundError);
  });

  it("task/subtask 변경이 이후 waiting-room과 in-progress 조회에 반영된다", () => {
    const createdSessionId = createMockSession({
      title: "Task 변경 세션",
      summary: "task mock 상태 확인",
      notice: "",
      category: "DEVELOPMENT",
      startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      sessionDurationMinutes: 60,
      maxParticipants: 4,
    }).createdSessionId;
    joinMockSession(createdSessionId, {
      goal: "초기 목표",
      todos: ["첫 할 일"],
    });

    const taskId = getMockWaitingRoom(createdSessionId).members[0].task!.taskId;
    const firstSubtaskId = getMockWaitingRoom(createdSessionId).members[0].task!.todos[0].subtaskId;

    updateMockTaskGoal(taskId, "수정된 목표");
    updateMockSubtask(firstSubtaskId, "수정된 할 일");
    const createdSubtaskIds = createMockSubtasks(taskId, [
      { todoContent: "추가 할 일" },
    ]).subtaskIds;
    toggleMockSubtaskCompletion(createdSubtaskIds[0]);
    deleteMockSubtask(firstSubtaskId);

    expect(getMockWaitingRoom(createdSessionId).members[0].task).toEqual(
      expect.objectContaining({
        goal: "수정된 목표",
        todos: [
          expect.objectContaining({ subtaskId: createdSubtaskIds[0], content: "추가 할 일" }),
        ],
      })
    );

    expect(getMockInProgress(createdSessionId).members[0].task).toEqual(
      expect.objectContaining({
        goal: "수정된 목표",
        todos: [
          expect.objectContaining({
            subtaskId: createdSubtaskIds[0],
            content: "추가 할 일",
            isCompleted: true,
          }),
        ],
      })
    );
  });

  it("unknown task/subtask id는 성공으로 위장하지 않는다", () => {
    expect(() => updateMockTaskGoal(999999, "없는 목표 수정")).toThrow(MockTaskNotFoundError);
    expect(() => createMockSubtasks(999999, [{ todoContent: "없는 task에 추가" }])).toThrow(
      MockTaskNotFoundError
    );
    expect(() => updateMockSubtask(999999, "없는 todo 수정")).toThrow(MockSubtaskNotFoundError);
    expect(() => deleteMockSubtask(999999)).toThrow(MockSubtaskNotFoundError);
    expect(() => toggleMockSubtaskCompletion(999999)).toThrow(MockSubtaskNotFoundError);
  });

  it("unknown reaction/kick member id는 성공으로 위장하지 않는다", () => {
    const createdSessionId = createMockSession({
      title: "member mutation strict 세션",
      summary: "member id strict 처리 확인",
      notice: "",
      category: "DEVELOPMENT",
      startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      sessionDurationMinutes: 60,
      maxParticipants: 4,
    }).createdSessionId;
    joinMockSession(createdSessionId, { goal: "member strict", todos: ["확인"] });

    expect(() => sendMockReaction(createdSessionId, 999999, "HEART")).toThrow(
      MockMemberNotFoundError
    );
    expect(() => kickMockSessionMembers(createdSessionId, [999999])).toThrow(
      MockMemberNotFoundError
    );
  });
});
