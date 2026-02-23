"use client";

import { CheckIcon } from "@/components/Icon/CheckIcon";

import { useToggleSubtaskCompletion } from "../../hooks/useSessionHooks";

import type { InProgressTodoItem } from "../../types";

interface SessionGoalAndTodoCardProps {
  goal: string;
  todos: InProgressTodoItem[];
  achievementRate?: number;
  className?: string;
}

export function SessionGoalAndTodoCard({
  goal,
  todos = [],
  achievementRate = 0,
  className,
}: SessionGoalAndTodoCardProps) {
  const { mutate: toggleSubtask } = useToggleSubtaskCompletion();

  const handleToggleTodo = (subtaskId: number) => {
    toggleSubtask({ subtaskId });
  };

  const completedCount = todos.filter((todo) => todo.isCompleted).length;

  return (
    <div
      className={`gap-lg border-gray p-lg flex h-157 flex-6 flex-col rounded-lg border ${className ?? ""}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[24px] font-bold">내 목표와 할 일</h2>
          <p className="text-text-secondary text-[16px]">이번 세션에서 집중할 할 일이에요</p>
        </div>
      </div>

      {/* 목표 */}
      <div className="flex w-full flex-col gap-2">
        <span className="text-text-secondary text-[14px] font-semibold">목표</span>
        <div className="bg-surface-strong border-border-subtle p-xs text-text-muted flex h-13.5 items-center rounded-sm border text-[16px]">
          {goal ?? "목표가 설정되지 않았습니다"}
        </div>
      </div>

      {/* 구분선 */}
      <div className="bg-divider-default h-px w-full" />

      {/* Todo */}
      <div className="gap-sm flex min-h-0 flex-1 flex-col">
        <span className="text-text-secondary text-[14px] font-semibold">
          To do{" "}
          <span className="text-green-600">
            {completedCount}/{todos.length}
          </span>{" "}
          <span className="text-text-disabled">({achievementRate}%)</span>
        </span>

        {todos.length === 0 ? (
          <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {todos.map((todo) => (
              <li
                key={todo.subtaskId}
                className="bg-surface-strong border-border-subtle p-xs flex h-13.5 shrink-0 items-center gap-3 rounded-sm border"
              >
                {/* 체크박스 */}
                <button
                  type="button"
                  className={`flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs border ${
                    todo.isCompleted
                      ? "border-green-600 bg-[#27EA671A]"
                      : "border-border-subtle bg-surface-strong"
                  }`}
                  onClick={() => handleToggleTodo(todo.subtaskId)}
                  aria-label={`${todo.content} ${todo.isCompleted ? "완료 취소" : "완료"}`}
                >
                  {todo.isCompleted && <CheckIcon size="small" className="text-green-600" />}
                </button>

                {/* 내용 */}
                <span
                  className={`text-[16px] ${
                    todo.isCompleted ? "text-text-disabled line-through" : "text-text-primary"
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
  );
}
