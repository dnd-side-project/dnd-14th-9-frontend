"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { Input } from "@/components/Input/Input";
import type { ReportTodoItem } from "@/features/session/types";

const MAX_TODOS = 5;

interface SessionJoinModalProps {
  sessionId: string;
  onClose: () => void;
}

export function SessionJoinModal({ sessionId, onClose }: SessionJoinModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [goal, setGoal] = useState("");
  const [todos, setTodos] = useState<ReportTodoItem[]>([
    { todoId: "0", content: "", isCompleted: false },
  ]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
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

  const handleJoin = () => {
    // TODO: API 연동 (useJoinSession → useSetGoal → useAddTodos)
    router.push(`/session/${sessionId}/waiting`);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      className="bg-surface-default gap-lg p-3xl fixed inset-0 m-auto flex w-full max-w-110 flex-col rounded-lg border-0 backdrop:bg-(--color-overlay-default)"
    >
      {/* 헤더 */}
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-[24px] font-bold">내 목표와 할 일</h2>
        <p className="text-text-secondary text-[16px] font-normal">
          이번 세션에서 집중할 할 일이에요
        </p>
      </div>

      {/* 목표 */}
      <div className="flex w-full flex-col gap-2">
        <span className="text-text-secondary text-[14px] font-semibold">
          목표 <span className="text-status-danger">*</span>
        </span>
        <Input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onClear={() => setGoal("")}
          placeholder="목표를 입력하세요"
          className="text-text-muted"
          fullWidth
          showCharacterCount
          maxLength={50}
        />
      </div>

      {/* 구분선 */}
      <div className="bg-divider-default h-px w-full" />

      {/* Todo */}
      <div className="gap-sm flex flex-col">
        <span className="text-text-secondary text-[14px] font-semibold">
          To do <span className="text-green-600">{todos.length}</span>{" "}
          <span className="text-status-danger">*</span>
        </span>

        {todos.length === 0 ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-text-muted py-md text-center text-[14px]">등록된 할 일이 없습니다</p>
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
            {todos.map((todo, index) => {
              const isFirst = index === 0;
              const canAdd = todos.length < MAX_TODOS;
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
      </div>

      {/* 하단 버튼 */}
      <Button
        variant="solid"
        colorScheme="primary"
        size="medium"
        className="w-full"
        onClick={handleJoin}
      >
        세션 참여하기
      </Button>
    </dialog>
  );
}
