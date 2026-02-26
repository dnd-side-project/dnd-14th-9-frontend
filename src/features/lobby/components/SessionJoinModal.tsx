"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";
import { AlertIcon } from "@/components/Icon/AlertIcon";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { TextInput } from "@/components/Input/TextInput";
import { Portal } from "@/components/Portal/Portal";
import { useJoinSession } from "@/features/session/hooks/useSessionHooks";
import type { ReportTodoItem, SessionDetailStatus } from "@/features/session/types";
import { isInProgressStatus } from "@/features/session/types";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";

const MAX_TODOS = 5;

interface SessionJoinModalProps {
  sessionId: string;
  sessionStatus?: SessionDetailStatus;
  onClose: () => void;
  onJoinSuccess?: () => void;
}

export function SessionJoinModal({
  sessionId,
  sessionStatus,
  onClose,
  onJoinSuccess,
}: SessionJoinModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [goal, setGoal] = useState("");
  const [todos, setTodos] = useState<ReportTodoItem[]>([
    { todoId: "0", content: "", isCompleted: false },
  ]);
  const [goalError, setGoalError] = useState(false);
  const [todoError, setTodoError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const joinSessionMutation = useJoinSession();

  // callback ref: dialog 요소가 DOM에 마운트되면 showModal 호출
  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    onClose();
  };

  const handleTodoChange = (index: number, content: string) => {
    setTodos((prev) => prev.map((todo, i) => (i === index ? { ...todo, content } : todo)));
  };

  const handleRemoveTodo = (index: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTodo = () => {
    if (todos.length >= MAX_TODOS) return;
    setTodos((prev) => [...prev, { todoId: String(Date.now()), content: "", isCompleted: false }]);
  };

  const handleJoin = async () => {
    const isGoalEmpty = goal.trim() === "";
    const hasValidTodo = todos.some((todo) => todo.content.trim() !== "");

    setGoalError(isGoalEmpty);
    setTodoError(!hasValidTodo);
    setServerError(null);

    if (isGoalEmpty || !hasValidTodo) {
      return;
    }

    const validTodos = todos
      .filter((todo) => todo.content.trim() !== "")
      .map((todo) => todo.content.trim());

    try {
      await joinSessionMutation.mutateAsync({
        sessionRoomId: sessionId,
        body: { goal: goal.trim(), todos: validTodos },
      });

      // 성공 시: 모달 닫고 세션 상태에 따라 이동
      onJoinSuccess?.();
      onClose();

      const isInProgress = sessionStatus ? isInProgressStatus(sessionStatus) : false;
      if (isInProgress) {
        // 진행 중인 세션이면 바로 세션 페이지로 이동
        window.location.replace(`/session/${sessionId}`);
      } else {
        // 대기 중인 세션이면 대기방으로 이동
        window.location.replace(`/session/${sessionId}/waiting`);
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={onClose}
        onClick={handleBackdropClick}
        className="bg-surface-default gap-lg px-xl pt-xl pb-2xl fixed inset-0 m-auto flex w-full max-w-160 flex-col rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default)"
      >
        {/* 헤더 */}
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-2xl font-bold">나의 목표</h2>
          <p className="text-text-secondary text-base font-normal">
            목표와 투두리스트를 작성해야 세션에 참여할 수 있어요!
          </p>
        </div>

        {/* 목표 */}
        <div className="flex w-full flex-col gap-2">
          <span className="text-text-secondary text-sm font-semibold">
            목표 <span className="text-text-status-negative-default">*</span>
          </span>
          <TextInput
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              if (goalError) setGoalError(false);
            }}
            onClear={() => setGoal("")}
            placeholder="목표를 입력하세요"
            className="h-13.5 focus:bg-transparent"
            fullWidth
            showCharacterCount
            maxLength={50}
            error={goalError}
            errorMessage="목표를 입력해주세요"
          />
        </div>

        {/* Todo */}
        <div className="gap-sm flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm font-semibold">
              투두리스트 <span className="text-green-600">{todos.length}</span>{" "}
              <span className="text-text-status-negative-default">*</span>
            </span>
            {todos.length < MAX_TODOS && (
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

          <ul className="flex flex-col gap-2">
            {todos.map((todo, index) => (
              <li key={todo.todoId} className="flex items-start gap-2">
                <TextInput
                  value={todo.content}
                  onChange={(e) => {
                    handleTodoChange(index, e.target.value);
                    if (todoError) setTodoError(false);
                  }}
                  onClear={() => handleTodoChange(index, "")}
                  placeholder="할 일을 입력하세요"
                  className="h-13.5 focus:bg-transparent"
                  fullWidth
                  containerClassName="flex-1"
                  showCharacterCount
                  maxLength={50}
                />
                {todos.length > 1 && (
                  <Button
                    iconOnly
                    variant="ghost"
                    colorScheme="secondary"
                    className="mt-1.25 h-11 w-11 min-w-0 p-0"
                    leftIcon={<MinusIcon size="small" />}
                    onClick={() => handleRemoveTodo(index)}
                    aria-label={`할 일 ${index + 1} 삭제`}
                  />
                )}
              </li>
            ))}
          </ul>
          {todoError && (
            <p className="text-text-status-negative-default text-sm">
              할 일을 1개 이상 입력해주세요
            </p>
          )}
        </div>

        {/* 서버 에러 메시지 */}
        {serverError && (
          <div className="flex animate-[fadeIn_0.2s_ease-out] items-center gap-2 rounded-sm bg-red-500/10 px-4 py-3 text-sm text-red-500">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {serverError}
          </div>
        )}

        {/* 하단 버튼 */}
        <ButtonGroup className="self-end">
          <Button
            variant="solid"
            colorScheme="tertiary"
            size="medium"
            className="text-sm"
            onClick={onClose}
            disabled={joinSessionMutation.isPending}
          >
            그만두기
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="text-sm"
            onClick={handleJoin}
            disabled={joinSessionMutation.isPending}
          >
            {joinSessionMutation.isPending ? "참여 중..." : "작성 완료"}
          </Button>
        </ButtonGroup>
      </dialog>
    </Portal>
  );
}
