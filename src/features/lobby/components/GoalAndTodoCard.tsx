"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/Button/Button";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { TextInput } from "@/components/Input/TextInput";
import { useDeleteTodo, useUpdateGoal, useUpdateTodo } from "@/features/task/hooks/useTaskHooks";

import type { WaitingMemberTask, WaitingTodoItem } from "../types";

interface GoalAndTodoCardProps {
  sessionId: string;
  task: WaitingMemberTask | null;
}

interface DraftTodo {
  subtaskId: number;
  content: string;
  isNew?: boolean;
}

export function GoalAndTodoCard({ sessionId, task }: GoalAndTodoCardProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // API mutation hooks
  const updateGoalMutation = useUpdateGoal();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  // props에서 파생된 기본값
  const taskId = task?.taskId ?? null;
  const taskGoal = task?.goal ?? "";
  const taskTodos: WaitingTodoItem[] = task?.todos ?? [];

  // 편집 중 임시 상태
  const [draftGoal, setDraftGoal] = useState("");
  const [draftTodos, setDraftTodos] = useState<DraftTodo[]>([]);
  const [deletedTodoIds, setDeletedTodoIds] = useState<number[]>([]);

  // 표시할 값
  const goal = taskGoal;
  const todos = taskTodos;

  const handleEdit = () => {
    setDraftGoal(goal);
    setDraftTodos(
      todos.map((t) => ({
        subtaskId: t.subtaskId,
        content: t.content,
      }))
    );
    setDeletedTodoIds([]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDeletedTodoIds([]);
  };

  const handleSave = async () => {
    if (!taskId) return;

    setIsSaving(true);

    try {
      // 1. 목표가 변경되었으면 업데이트
      if (draftGoal.trim() !== goal) {
        await updateGoalMutation.mutateAsync({
          taskId,
          body: { goalContent: draftGoal.trim() },
        });
      }

      // 2. 변경된 todo 업데이트
      for (const draft of draftTodos) {
        if (draft.isNew) continue; // 새로 추가된 항목은 별도 API 필요 (현재 미지원)

        const original = todos.find((t) => t.subtaskId === draft.subtaskId);
        if (original && original.content !== draft.content.trim()) {
          await updateTodoMutation.mutateAsync({
            subtaskId: draft.subtaskId,
            body: { todoContent: draft.content.trim() },
          });
        }
      }

      // 3. 삭제된 todo 처리
      for (const subtaskId of deletedTodoIds) {
        await deleteTodoMutation.mutateAsync({ subtaskId });
      }

      setIsEditing(false);
      setDeletedTodoIds([]);
      // 저장 후 waitingRoom 쿼리 무효화로 최신 데이터 반영
      await queryClient.invalidateQueries({
        queryKey: ["session", "waitingRoom", sessionId],
      });
    } catch (error) {
      console.error("저장 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTodoChange = (index: number, content: string) => {
    setDraftTodos((prev) => prev.map((todo, i) => (i === index ? { ...todo, content } : todo)));
  };

  const handleRemoveTodo = (index: number) => {
    const todoToRemove = draftTodos[index];
    // 기존 todo만 삭제 목록에 추가 (새로 추가된 것은 제외)
    if (todoToRemove && !todoToRemove.isNew) {
      setDeletedTodoIds((prev) => [...prev, todoToRemove.subtaskId]);
    }
    setDraftTodos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTodo = () => {
    if (draftTodos.length >= 5) return;
    setDraftTodos((prev) => [...prev, { subtaskId: -Date.now(), content: "", isNew: true }]);
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
          <TextInput
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
                    <li key={todo.subtaskId} className="flex items-start gap-2">
                      <TextInput
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
                key={todo.subtaskId}
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
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        </div>
      )}
    </div>
  );
}
