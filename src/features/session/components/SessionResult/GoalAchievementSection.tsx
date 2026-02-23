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
    <section className="p-lg flex flex-col rounded-lg bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-50">목표 달성</h3>
        <span className="text-sm font-semibold text-green-500">달성률 {todoAchievementRate}%</span>
      </div>

      {/* 목표 */}
      <div className="mt-md flex items-center justify-between">
        <p className="text-base text-gray-300">
          나의 목표: <span className="text-gray-50">{goal}</span>
        </p>
        <span className="text-sm text-gray-400">
          ⭕ {completedCount}/{todoList.length}
        </span>
      </div>

      {/* 구분선 */}
      <div className="my-lg h-px w-full bg-gray-800" />

      {/* Todo 목록 */}
      <div className="gap-sm flex flex-col">
        <span className="text-sm font-semibold text-gray-400">
          To do{" "}
          <span className="text-green-500">
            {completedCount}/{todoList.length}
          </span>
        </span>

        {todoList.length === 0 ? (
          <p className="py-md text-center text-sm text-gray-500">등록된 할 일이 없습니다</p>
        ) : (
          <ul className="gap-sm flex flex-col">
            {todoList.map((todo) => (
              <li key={todo.todoId} className="p-sm flex items-center gap-3 rounded-sm bg-gray-800">
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
    </section>
  );
}
