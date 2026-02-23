import { CheckIcon } from "@/components/Icon/CheckIcon";
import type { ReportTodoItem } from "@/features/session/types";

interface GoalAchievementSectionProps {
  goal: string;
  todoList: ReportTodoItem[];
  todoAchievementRate: number;
}

export function GoalAchievementSection({
  goal,
  todoList,
  todoAchievementRate,
}: GoalAchievementSectionProps) {
  const completedCount = todoList.filter((todo) => todo.isCompleted).length;

  return (
    <section className="flex flex-col">
      {/* 헤더 (별도) */}
      <div className="mb-md flex flex-col">
        <h3 className="text-lg font-semibold text-gray-50">나의 목표 달성 요약</h3>
        <p className="mt-2xs text-sm text-gray-500">세션을 진행하면서 달성한 투두리스트에요</p>
      </div>

      {/* 컨텐츠 영역 (border 있음) */}
      <div className="border-border-subtle p-lg bg-surface-default flex flex-col rounded-lg border">
        {/* 목표 달성률 & 투두 완료 (세로 정렬) */}
        <div className="gap-lg flex">
          {/* 나의 목표 달성률 */}
          <div className="flex flex-col">
            <span className="text-text-secondary text-[16px] font-semibold">나의 목표 달성률</span>
            <span className="text-text-brand-default text-[32px] font-bold">
              {todoAchievementRate}%
            </span>
          </div>

          {/* 나의 목표 */}
          <div className="flex flex-col">
            <span className="text-text-secondary text-[16px] font-semibold">나의 목표</span>
            <span className="text-[32px] font-bold">
              <span className="text-text-brand-default">{completedCount}</span>
              <span className="text-text-secondary">/{todoList.length}</span>
            </span>
          </div>
        </div>

        {/* 목표 섹션 */}
        <div className="mt-lg flex flex-col gap-2">
          <span className="text-text-secondary text-[16px] font-semibold">목표</span>
          <div className="bg-surface-strong rounded-sm p-3">
            <span className="text-text-primary text-base">{goal}</span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-lg h-px w-full bg-gray-800" />

        {/* Todo 목록 */}
        <div className="gap-sm flex flex-col">
          <span className="text-text-primary text-[16px] font-semibold">투두리스트</span>

          {todoList.length === 0 ? (
            <p className="py-md text-center text-sm text-gray-500">등록된 할 일이 없습니다</p>
          ) : (
            <ul className="gap-sm flex flex-col">
              {todoList.map((todo) => (
                <li
                  key={todo.todoId}
                  className="p-sm flex items-center gap-3 rounded-sm bg-gray-800"
                >
                  {/* 체크 표시 */}
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-xs border ${
                      todo.isCompleted
                        ? "border-green-600 bg-green-600/10"
                        : "border-gray-600 bg-gray-700"
                    }`}
                  >
                    {todo.isCompleted && <CheckIcon size="small" className="text-green-500" />}
                  </span>

                  {/* 내용 */}
                  <span
                    className={`text-base ${
                      todo.isCompleted ? "text-gray-500 line-through" : "text-gray-50"
                    }`}
                  >
                    {todo.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
