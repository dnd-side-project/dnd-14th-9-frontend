import { mapInProgressToParticipantCard } from "@/features/session/utils/mapInProgressToParticipantCard";

describe("mapInProgressToParticipantCard", () => {
  it("누락된 수치 필드는 0으로 채워야 한다", () => {
    const mapped = mapInProgressToParticipantCard({
      members: [
        {
          memberId: 1,
          nickname: "테스터",
          role: "PARTICIPANT",
          status: "REST",
          task: null,
        },
      ],
    });

    expect(mapped.participantCount).toBe(0);
    expect(mapped.averageAchievementRate).toBe(0);
    expect(mapped.members[0]?.achievementRate).toBe(0);
    expect(mapped.members[0]?.focusedSeconds).toBe(0);
  });

  it("task가 null이면 목표는 기본값, todos는 빈 배열이어야 한다", () => {
    const mapped = mapInProgressToParticipantCard({
      participantCount: 1,
      averageAchievementRate: 10,
      members: [
        {
          memberId: 100,
          nickname: "사용자",
          role: "HOST",
          status: "FOCUSED",
          task: null,
        },
      ],
    });

    expect(mapped.members[0]?.goal).toBe("목표 없음");
    expect(mapped.members[0]?.todos).toEqual([]);
    expect(mapped.members[0]?.isHost).toBe(true);
    expect(mapped.members[0]?.isFocusing).toBe(true);
  });

  it("todos가 누락되거나 값이 비어도 안전하게 매핑해야 한다", () => {
    const mapped = mapInProgressToParticipantCard({
      participantCount: 1,
      averageAchievementRate: 0,
      members: [
        {
          memberId: 2,
          nickname: "사용자2",
          role: "PARTICIPANT",
          status: "REST",
          task: {
            goal: "목표2",
            todos: [
              {
                content: "할 일",
                isCompleted: true,
              },
            ],
          },
        },
      ],
    });

    expect(mapped.members[0]?.todos[0]).toEqual({
      todoId: "0",
      content: "할 일",
      isCompleted: true,
    });
  });
});
