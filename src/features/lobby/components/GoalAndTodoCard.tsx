"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { Input } from "@/components/Input/Input";
import type { ReportTodoItem } from "@/features/session/types";

import type { WaitingMemberTask } from "../types";

interface GoalAndTodoCardProps {
  task: WaitingMemberTask | null;
}

export function GoalAndTodoCard({ task }: GoalAndTodoCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // props에서 파생된 기본값 (메모이제이션으로 참조 안정화)
  const taskGoal = task?.goal ?? "";
  const taskTodos: ReportTodoItem[] =
    task?.todos.map((t) => ({
      todoId: String(t.subtaskId),
      content: t.content,
      isCompleted: false,
    })) ?? [];

  // 로컬 수정 상태 (저장 후에도 유지)
  const [localGoal, setLocalGoal] = useState<string | null>(null);
  const [localTodos, setLocalTodos] = useState<ReportTodoItem[] | null>(null);

  // 편집 중 임시 상태
  const [draftGoal, setDraftGoal] = useState("");
  const [draftTodos, setDraftTodos] = useState<ReportTodoItem[]>([]);

  // 표시할 값: 로컬 수정 > props 기본값
  const goal = localGoal ?? taskGoal;
  const todos = localTodos ?? taskTodos;

  const handleEdit = () => {
    setDraftGoal(goal);
    setDraftTodos(todos);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setLocalGoal(draftGoal);
    setLocalTodos(draftTodos);
    setIsEditing(false);
    // TODO: API 호출로 서버에 저장
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
    <div className="gap-lg border-gray p-lg flex h-157 flex-6 flex-col rounded-lg border">
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
      <div className="flex w-full flex-col gap-2">
        <span className="text-text-secondary text-[14px] font-semibold">목표</span>
        {isEditing ? (
          <Input
            value={draftGoal}
            onChange={(e) => setDraftGoal(e.target.value)}
            onClear={() => setDraftGoal("")}
            placeholder="목표를 입력하세요"
            className="text-text-muted"
            fullWidth
            showCharacterCount
            maxLength={50}
          />
        ) : (
          <div className="bg-surface-strong border-border-subtle p-xs text-text-muted flex h-13.5 items-center rounded-sm border text-[16px]">
            {goal}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="bg-divider-default h-px w-full" />

      {/* Todo */}
      <div className="gap-sm flex flex-col">
        <span className="text-text-secondary text-[14px] font-semibold">
          To do <span className="text-green-600">{displayTodos.length}</span>
        </span>

        {isEditing ? (
          <>
            {draftTodos.length === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-text-muted py-md text-center text-[14px]">
                  등록된 할 일이 없습니다
                </p>
                <Button
                  iconOnly
                  size="large"
                  variant="ghost"
                  colorScheme="secondary"
                  leftIcon={<PlusIcon className="text-border-primary-default" />}
                  onClick={handleAddTodo}
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {draftTodos.map((todo, index) => {
                  const isFirst = index === 0;
                  const canAdd = draftTodos.length < 5;
                  return (
                    <li key={todo.todoId} className="flex items-start gap-2">
                      <Input
                        value={todo.content}
                        onChange={(e) => handleTodoChange(index, e.target.value)}
                        onClear={() => handleTodoChange(index, "")}
                        placeholder="할 일을 입력하세요"
                        className="text-text-muted"
                        fullWidth
                        containerClassName="flex-1"
                        showCharacterCount
                        maxLength={50}
                      />
                      {isFirst && canAdd ? (
                        <Button
                          iconOnly
                          size="large"
                          variant="outlined"
                          colorScheme="primary"
                          leftIcon={<PlusIcon className="text-border-primary-default" />}
                          onClick={handleAddTodo}
                        />
                      ) : (
                        <Button
                          iconOnly
                          size="large"
                          variant="outlined"
                          colorScheme="secondary"
                          leftIcon={<MinusIcon />}
                          onClick={() => handleRemoveTodo(index)}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : displayTodos.length === 0 ? (
          <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todos.map((todo) => (
              <li
                key={todo.todoId}
                className="bg-surface-strong border-border-subtle p-xs text-text-primary flex h-13.5 items-center rounded-sm border text-[16px]"
              >
                {todo.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 하단 버튼 (수정 모드) */}
      {isEditing && (
        <div className="flex gap-2">
          <Button
            variant="outlined"
            colorScheme="secondary"
            size="medium"
            className="flex-1"
            onClick={handleCancel}
          >
            그만두기
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="flex-1"
            onClick={handleSave}
          >
            저장하기
          </Button>
        </div>
      )}
    </div>
  );
}
