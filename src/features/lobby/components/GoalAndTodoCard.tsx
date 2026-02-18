"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { Input } from "@/components/Input/Input";
import type { ReportTodoItem } from "@/features/session/types";

const MOCK_GOAL = "React 심화 학습 완료하기";
const MOCK_TODOS: ReportTodoItem[] = [
  { todoId: "1", content: "useEffect 정리", isCompleted: false },
  { todoId: "2", content: "Server Component 학습", isCompleted: true },
];

export function GoalAndTodoCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(MOCK_GOAL);
  const [todos, setTodos] = useState(MOCK_TODOS);
  const [draftGoal, setDraftGoal] = useState(MOCK_GOAL);
  const [draftTodos, setDraftTodos] = useState(MOCK_TODOS);

  const handleEdit = () => {
    setDraftGoal(goal);
    setDraftTodos(todos);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setGoal(draftGoal);
    setTodos(draftTodos);
    setIsEditing(false);
  };

  const handleTodoChange = (index: number, content: string) => {
    setDraftTodos((prev) => prev.map((todo, i) => (i === index ? { ...todo, content } : todo)));
  };

  const handleRemoveTodo = (index: number) => {
    setDraftTodos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTodo = () => {
    if (draftTodos.length >= 5) return;
    setDraftTodos((prev) => [
      ...prev,
      { todoId: String(Date.now()), content: "", isCompleted: false },
    ]);
  };

  const displayTodos = isEditing ? draftTodos : todos;

  return (
    <div className="gap-lg flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[24px] font-bold">내 목표와 할 일</h2>
          <p className="text-text-secondary text-[16px]">이번 세션에서 집중할 할 일이에요</p>
        </div>
        {!isEditing && (
          <Button variant="outlined" colorScheme="primary" size="medium" onClick={handleEdit}>
            수정하기
          </Button>
        )}
      </div>

      {/* 목표 */}
      <div className="flex flex-col gap-2">
        <span className="text-text-secondary text-[14px] font-semibold">목표</span>
        {isEditing ? (
          <Input
            value={draftGoal}
            onChange={(e) => setDraftGoal(e.target.value)}
            onClear={() => setDraftGoal("")}
            placeholder="목표를 입력하세요"
            containerClassName="max-w-none"
          />
        ) : (
          <div className="bg-surface-strong p-xs text-text-muted rounded-sm text-[16px]">
            {goal}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="bg-divider-default h-px w-full" />

      {/* Todo */}
      <div className="gap-sm flex flex-col">
        <span className="text-text-secondary text-[14px] font-semibold">
          To do ({displayTodos.length})
        </span>

        {displayTodos.length === 0 ? (
          <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
        ) : isEditing ? (
          <ul className="flex flex-col gap-2">
            {draftTodos.map((todo, index) => (
              <li key={todo.todoId} className="flex items-center gap-2">
                <Input
                  value={todo.content}
                  onChange={(e) => handleTodoChange(index, e.target.value)}
                  onClear={() => handleRemoveTodo(index)}
                  placeholder="할 일을 입력하세요"
                  containerClassName="max-w-none"
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
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

        {isEditing && draftTodos.length < 5 && (
          <button
            type="button"
            onClick={handleAddTodo}
            className="text-text-brand-subtle text-[14px] font-semibold"
          >
            + 할 일 추가
          </button>
        )}
      </div>

      {/* 하단 버튼 (수정 모드) */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outlined" colorScheme="secondary" size="medium" onClick={handleCancel}>
            그만두기
          </Button>
          <Button variant="solid" colorScheme="primary" size="medium" onClick={handleSave}>
            저장하기
          </Button>
        </div>
      )}
    </div>
  );
}
