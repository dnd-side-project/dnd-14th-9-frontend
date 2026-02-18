"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import type { ReportTodoItem } from "@/features/session/types";

const MOCK_GOAL = "React 심화 학습 완료하기";
const MOCK_TODOS: ReportTodoItem[] = [
  { todoId: "1", content: "useEffect 정리", isCompleted: false },
  { todoId: "2", content: "Server Component 학습", isCompleted: true },
];

export function GoalAndTodoCard() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="gap-lg flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[24px] font-bold">내 목표와 할 일</h2>
          <p className="text-text-secondary text-[16px]">이번 세션에서 집중할 할 일이에요</p>
        </div>
        {!isEditing && (
          <Button
            variant="outlined"
            colorScheme="primary"
            size="medium"
            onClick={() => setIsEditing(true)}
          >
            수정하기
          </Button>
        )}
      </div>

      {/* 목표 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-[14px] font-semibold">목표</span>
        <div className="bg-surface-strong p-xs text-text-muted rounded-sm text-[16px]">
          {MOCK_GOAL}
        </div>
      </div>

      {/* 구분선 */}
      <div className="bg-divider-default h-px w-full" />

      {/* Todo */}
      <div className="gap-sm flex flex-col">
        <span className="text-text-secondary text-[14px] font-semibold">
          To do ({MOCK_TODOS.length})
        </span>

        {MOCK_TODOS.length === 0 ? (
          <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {MOCK_TODOS.map((todo) => (
              <li key={todo.todoId} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                    todo.isCompleted
                      ? "border-green-500 bg-green-500"
                      : "border-border-default bg-transparent"
                  }`}
                >
                  {todo.isCompleted && <CheckIcon size="xsmall" className="text-common-white" />}
                </button>
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
