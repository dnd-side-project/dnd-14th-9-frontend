"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PencilIcon } from "@/components/Icon/PencilIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { TextInput } from "@/components/Input/TextInput";
import {
  useCreateTodo,
  useDeleteTodo,
  useUpdateGoal,
  useUpdateTodo,
} from "@/features/task/hooks/useTaskHooks";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";

import { lobbyKeys } from "../hooks/useLobbyHooks";

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
  const createTodoMutation = useCreateTodo();

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
      // 1. 목표 업데이트
      const updateGoalPromise =
        draftGoal.trim() !== goal
          ? updateGoalMutation.mutateAsync({
              taskId,
              body: { goalContent: draftGoal.trim() },
            })
          : Promise.resolve();

      // 2. 변경된 todo 업데이트
      const updateTodoPromises = draftTodos
        .filter((draft) => {
          if (draft.isNew) return false;
          const original = todos.find((t) => t.subtaskId === draft.subtaskId);
          return original && original.content !== draft.content.trim();
        })
        .map((draft) =>
          updateTodoMutation.mutateAsync({
            subtaskId: draft.subtaskId,
            body: { todoContent: draft.content.trim() },
          })
        );

      // 3. 새로 추가된 todo 생성 (배열로 한 번에 전송)
      const newTodos = draftTodos
        .filter((draft) => draft.isNew && draft.content.trim())
        .map((draft) => ({ todoContent: draft.content.trim() }));

      const createTodoPromise =
        newTodos.length > 0
          ? createTodoMutation.mutateAsync({ taskId, body: newTodos })
          : Promise.resolve();

      // 4. 삭제된 todo 처리
      const deleteTodoPromises = deletedTodoIds.map((subtaskId) =>
        deleteTodoMutation.mutateAsync({ subtaskId })
      );

      // 모든 요청을 병렬로 실행
      await Promise.all([
        updateGoalPromise,
        ...updateTodoPromises,
        createTodoPromise,
        ...deleteTodoPromises,
      ]);

      setIsEditing(false);
      setDeletedTodoIds([]);
      // 저장 후 waitingRoom 및 참여자 목록 쿼리 무효화로 최신 데이터 반영
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["session", "waitingRoom", sessionId],
        }),
        queryClient.invalidateQueries({
          queryKey: lobbyKeys.waitingMembers(sessionId),
        }),
      ]);
    } catch (error) {
      console.error("저장 실패:", error);
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      toast.error(message || "투두 저장에 실패했습니다.");
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
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[24px] font-bold">나의 목표</h2>
          <p className="text-text-secondary text-[16px] font-normal">
            이번 세션에서 해야할 일을 작성해 주세요
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outlined"
            colorScheme="secondary"
            size="small"
            className="text-xs font-semibold"
            leftIcon={<PencilIcon size="xsmall" />}
            onClick={handleEdit}
          >
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
            className="h-13.5 focus:bg-transparent"
            fullWidth
            showCharacterCount
            maxLength={50}
          />
        ) : (
          <div className="bg-surface-strong border-border-subtle p-xs text-text-primary flex h-13.5 items-center rounded-sm border text-[16px]">
            {goal}
          </div>
        )}
      </div>

      {/* Todo */}
      <div className="gap-sm mt-sm flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-[14px] font-semibold">
            투두리스트 <span className="text-green-600">{displayTodos.length}</span>
          </span>
          {isEditing && draftTodos.length < 5 && (
            <Button
              variant="outlined"
              colorScheme="secondary"
              size="small"
              leftIcon={<PlusIcon size="xsmall" />}
              onClick={handleAddTodo}
            >
              추가하기
            </Button>
          )}
        </div>

        {isEditing ? (
          <ul className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {draftTodos.map((todo, index) => (
              <li key={todo.subtaskId} className="flex shrink-0 items-start gap-2">
                <TextInput
                  value={todo.content}
                  onChange={(e) => handleTodoChange(index, e.target.value)}
                  onClear={() => handleTodoChange(index, "")}
                  placeholder="할 일을 입력하세요"
                  className="h-13.5 focus:bg-transparent"
                  fullWidth
                  containerClassName="flex-1"
                  showCharacterCount
                  maxLength={50}
                />
                {draftTodos.length > 1 && (
                  <Button
                    iconOnly
                    variant="ghost"
                    colorScheme="secondary"
                    className="mt-1.25 h-11 w-11 min-w-0 p-0"
                    leftIcon={<MinusIcon size="small" />}
                    onClick={() => handleRemoveTodo(index)}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : displayTodos.length === 0 ? (
          <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
        ) : (
          <ul className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {todos.map((todo) => (
              <li
                key={todo.subtaskId}
                className="bg-surface-strong border-border-subtle p-xs text-text-primary flex h-13.5 shrink-0 items-center rounded-sm border text-[16px]"
              >
                {todo.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 하단 버튼 (수정 모드) */}
      {isEditing && (
        <ButtonGroup className="self-end">
          <Button
            variant="solid"
            colorScheme="tertiary"
            size="medium"
            className="text-sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            그만두기
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="text-sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
}
