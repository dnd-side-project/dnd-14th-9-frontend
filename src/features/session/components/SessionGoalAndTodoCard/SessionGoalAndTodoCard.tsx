"use client";

import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils/utils";

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
    toggleSubtask(
      { subtaskId },
      {
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          toast.error(message);
        },
      }
    );
  };

  const completedCount = todos.filter((todo) => todo.isCompleted).length;

  return (
    <div className={`gap-xl flex flex-col ${className ?? ""}`}>
      {/* 헤더 */}
      <div className="gap-2xs flex flex-col leading-[1.4]">
        <h2 className="text-text-secondary text-2xl leading-[1.4] font-bold">나의 목표</h2>
        <p className="text-text-disabled text-[15px]">
          세션을 진행하면서 투두리스트를 체크해 보세요
        </p>
      </div>

      {/* 목표 + 투두 카드 */}
      <div className="bg-surface-default border-border-subtle p-xl gap-2xl flex min-h-0 flex-1 flex-col rounded-lg border shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        {/* 목표 */}
        <div className="gap-xs flex w-full flex-col">
          <span className="text-text-secondary text-base leading-[1.4] font-semibold">목표</span>
          <div className="bg-surface-strong border-border-default p-md text-text-primary flex h-14 items-center rounded-sm border text-base leading-[1.4]">
            {goal ?? "목표가 설정되지 않았습니다"}
          </div>
        </div>

        {/* Todo */}
        <div className="gap-md flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between">
            <p className="gap-2xs flex items-center text-base leading-[1.4] font-semibold">
              <span className="text-text-primary">투두리스트</span>
              <span>
                <span className="text-text-brand-subtler">{completedCount}</span>
                <span className="text-text-muted">/{todos.length}</span>
              </span>
            </p>
            <p className="gap-2xs flex items-center text-[13px] leading-[1.4]">
              <span className="text-text-muted">나의 목표 달성률</span>
              <span className="text-text-brand-default font-semibold">{achievementRate}%</span>
            </p>
          </div>

          {todos.length === 0 ? (
            <p className="text-text-muted py-md text-center text-sm">등록된 할 일이 없습니다</p>
          ) : (
            <ul className="scrollbar-hide gap-sm flex min-h-0 flex-1 flex-col overflow-y-auto">
              {todos.map((todo) => (
                <li
                  key={todo.subtaskId}
                  className={cn(
                    "border-border-subtle px-md py-sm gap-sm flex shrink-0 items-center rounded-sm border",
                    todo.isCompleted ? "bg-surface-default" : "bg-surface-strong"
                  )}
                >
                  {/* 체크박스 — 완료는 Figma CheckBox 첫 번째 디자인(연한 초록 배경 + 초록 테두리) */}
                  <button
                    type="button"
                    className={cn(
                      "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs border",
                      todo.isCompleted
                        ? "border-border-primary-default bg-surface-primary-alpha-subtle"
                        : "border-border-strong"
                    )}
                    onClick={() => handleToggleTodo(todo.subtaskId)}
                    aria-label={`${todo.content} ${todo.isCompleted ? "완료 취소" : "완료"}`}
                  >
                    {todo.isCompleted && (
                      <CheckIcon size="small" className="text-text-brand-default" />
                    )}
                  </button>

                  {/* 내용 */}
                  <span
                    className={cn(
                      "text-[15px] leading-[1.4]",
                      todo.isCompleted ? "text-text-muted line-through" : "text-text-secondary"
                    )}
                  >
                    {todo.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
