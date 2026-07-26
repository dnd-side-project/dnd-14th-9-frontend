"use client";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";

import { useSessionDetail } from "../hooks/useSessionHooks";
import { isWaitingStatus } from "../types";

import { SessionCreateForm } from "./SessionCreateForm";

interface SessionEditContentProps {
  sessionId: string;
}

export function SessionEditContent({ sessionId }: SessionEditContentProps) {
  const { data, isLoading, error, refetch } = useSessionDetail(sessionId);

  if (isLoading) {
    return <p className="text-text-secondary py-20 text-center text-sm">불러오는 중...</p>;
  }

  if (error || !data?.result) {
    return (
      <ErrorFallbackUI
        className="py-20"
        title="세션 정보를 불러올 수 없어요"
        description="데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
        buttonLabel="다시 시도하기"
        onRetry={() => void refetch()}
      />
    );
  }

  const session = data.result;

  // 대기 중인 세션만 수정 가능 (백엔드 SESSION400_14 사전 차단)
  if (!isWaitingStatus(session.status)) {
    return (
      <ErrorFallbackUI
        className="py-20"
        title="수정할 수 없는 세션이에요"
        description="대기 중인 세션만 수정할 수 있어요."
        buttonLabel="세션으로 돌아가기"
        href={`/session/${sessionId}/waiting`}
      />
    );
  }

  return <SessionCreateForm mode="edit" sessionId={sessionId} initialValues={session} />;
}
