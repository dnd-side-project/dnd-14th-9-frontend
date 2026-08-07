"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { TrashIcon } from "@/components/Icon/TrashIcon";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { LOGIN_ROUTE } from "@/lib/routes/route-paths";
import { toast } from "@/lib/toast";

import { useDeleteSession, useSessionDetail, useWaitingRoom } from "../hooks/useSessionHooks";
import { isWaitingStatus } from "../types";

import { SessionCreateForm } from "./SessionCreateForm";
import { SessionDeleteConfirmDialog } from "./SessionDeleteConfirmDialog";

interface SessionEditContentProps {
  sessionId: string;
}

export function SessionEditContent({ sessionId }: SessionEditContentProps) {
  const router = useRouter();
  const authState = useAuthState();
  const isAuthenticated = authState.status === "authenticated";
  const { data, isLoading, error, refetch } = useSessionDetail(sessionId);
  const { data: meData, isLoading: isMeLoading } = useMe({ enabled: isAuthenticated });
  const { data: waitingRoomData, isLoading: isWaitingRoomLoading } = useWaitingRoom(sessionId, {
    enabled: isAuthenticated,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteServerError, setDeleteServerError] = useState<string | null>(null);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const isAuthDataLoading =
    authState.status === "recovering" || (isAuthenticated && (isMeLoading || isWaitingRoomLoading));

  const session = data?.result;
  // 대기 중인 세션만 수정/삭제 가능 (백엔드 SESSION400_12/14 사전 차단)
  const isEditable = !!session && isWaitingStatus(session.status);

  // 호스트만 수정/삭제 가능 — 세션 상세 API에는 호스트 식별자가 없어 대기방 멤버의 role로 판별한다.
  // 대기방 조회 실패·미참여 시에는 isHost=false로 남아 폼이 열리지 않는다(fail-closed).
  const myMemberId = meData?.result?.id;
  const isHost =
    !!myMemberId &&
    (waitingRoomData?.result?.members?.some(
      (member) => member.memberId === myMemberId && member.role === "HOST"
    ) ??
      false);
  const canManage = isEditable && isHost;

  const handleDelete = () => {
    setDeleteServerError(null);
    deleteSession(sessionId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        toast.success("세션이 삭제되었어요.");
        router.push("/");
      },
      onError: (deleteError) => {
        const message =
          deleteError instanceof ApiError ? deleteError.message : DEFAULT_API_ERROR_MESSAGE;
        setDeleteServerError(message);
        toast.error(message);
      },
    });
  };

  return (
    <>
      <header className="mb-xl md:mb-2xl flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg leading-[140%] font-bold text-gray-50 md:text-2xl">
            세션 수정하기
          </h1>
          <p className="mt-2xs text-[13px] text-gray-500 md:text-base">세션 정보를 수정해보세요</p>
        </div>

        {canManage && (
          <Button
            type="button"
            variant="outlined"
            colorScheme="secondary"
            size="small"
            onClick={() => {
              setDeleteServerError(null);
              setShowDeleteDialog(true);
            }}
            disabled={isDeleting}
            leftIcon={<TrashIcon size="xsmall" />}
            className="text-text-status-negative-default border-border-error-subtler hover:text-text-status-negative-subtle active:text-text-status-negative-default active:border-border-error-default shrink-0"
          >
            삭제하기
          </Button>
        )}
      </header>

      {isLoading || isAuthDataLoading ? (
        <p className="text-text-secondary py-20 text-center text-sm">불러오는 중...</p>
      ) : error || !session ? (
        <ErrorFallbackUI
          className="py-20"
          title="세션 정보를 불러올 수 없어요"
          description="데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
          buttonLabel="다시 시도하기"
          onRetry={() => void refetch()}
        />
      ) : !isEditable ? (
        <ErrorFallbackUI
          className="py-20"
          title="수정할 수 없는 세션이에요"
          description="대기 중인 세션만 수정할 수 있어요."
          buttonLabel="세션으로 돌아가기"
          href={`/session/${sessionId}/waiting`}
        />
      ) : !isAuthenticated ? (
        <ErrorFallbackUI
          className="py-20"
          title="로그인이 필요해요"
          description="세션을 수정하려면 로그인이 필요합니다."
          buttonLabel="로그인하기"
          href={LOGIN_ROUTE}
        />
      ) : !isHost ? (
        <ErrorFallbackUI
          className="py-20"
          title="수정 권한이 없어요"
          description="세션을 만든 호스트만 수정할 수 있어요."
          buttonLabel="세션으로 돌아가기"
          href={`/session/${sessionId}/waiting`}
        />
      ) : (
        <SessionCreateForm mode="edit" sessionId={sessionId} initialValues={session} />
      )}

      {showDeleteDialog && (
        <SessionDeleteConfirmDialog
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          isPending={isDeleting}
          serverError={deleteServerError}
        />
      )}
    </>
  );
}
