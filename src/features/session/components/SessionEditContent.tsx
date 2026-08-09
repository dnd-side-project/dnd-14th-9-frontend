"use client";

import { useState } from "react";

import { notFound, useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { TrashIcon } from "@/components/Icon/TrashIcon";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
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

  // 세션 상세와 병렬로 조회한다. isEditable에 연동해 지연시키면 정상 경로(호스트의 수정 진입)에
  // 왕복이 하나 늘어난다. 조회 지연이 세션 오류 화면을 가리는 문제는 아래 렌더 분기 순서로 처리한다.
  const {
    data: waitingRoomData,
    isLoading: isWaitingRoomLoading,
    error: waitingRoomError,
    refetch: refetchWaitingRoom,
  } = useWaitingRoom(sessionId, {
    enabled: isAuthenticated,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteServerError, setDeleteServerError] = useState<string | null>(null);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  // isLoading(= isPending && isFetching)만으로는 부족하다. SSR(서버에서 fetch 미실행)이나
  // 오프라인(fetchStatus "paused")에서는 데이터가 없어도 isLoading이 false라 로딩 분기를 통과하고,
  // isHost가 false로 떨어져 호스트에게 "수정 권한이 없어요"가 표시된다.
  // 응답이 도착했는지(데이터 유무)를 기준으로 판정한다.
  const isWaitingRoomUnresolved = !waitingRoomError && waitingRoomData === undefined;
  const isAuthDataLoading =
    authState.status === "recovering" ||
    (isAuthenticated && (isWaitingRoomLoading || isWaitingRoomUnresolved));

  const session = data?.result;
  // 대기 중인 세션만 수정/삭제 가능 (백엔드 SESSION400_12/14 사전 차단)
  const isEditable = !!session && isWaitingStatus(session.status);

  // 호스트만 수정/삭제 가능 — 세션 상세 API에는 호스트 식별자가 없어 대기방 멤버의 role로 판별한다.
  // 대기방 조회 실패는 "권한 없음"과 구분해야 한다. 실패를 그대로 fail-closed 처리하면
  // 실제 호스트에게도 권한 안내가 뜨므로, 재시도 가능한 오류 화면으로 분기한다.
  const myMemberId = isAuthenticated ? authState.profile.id : undefined;
  const isHost =
    !waitingRoomError &&
    myMemberId !== undefined &&
    (waitingRoomData?.result?.members?.some(
      (member) => member.memberId === myMemberId && member.role === "HOST"
    ) ??
      false);
  const canManage = isEditable && isHost;
  // 삭제되었거나 존재하지 않는 세션이면 세션 not-found 페이지로 안내
  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

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

  // 세션 상세 조회 실패는 로딩보다 먼저 처리한다. 대기방 조회나 인증 복구가 지연되는 동안
  // 로딩 화면이 먼저 걸리면 사용자가 재시도 버튼에 도달하지 못한다.
  const sessionErrorFallback = (
    <ErrorFallbackUI
      className="py-20"
      title="세션 정보를 불러올 수 없어요"
      description="데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
      buttonLabel="다시 시도하기"
      onRetry={() => void refetch()}
    />
  );

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

      {error ? (
        sessionErrorFallback
      ) : isLoading || isAuthDataLoading ? (
        <p className="text-text-secondary py-20 text-center text-sm">불러오는 중...</p>
      ) : !session ? (
        sessionErrorFallback
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
      ) : waitingRoomError ? (
        <ErrorFallbackUI
          className="py-20"
          title="수정 권한을 확인할 수 없어요"
          description="권한 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
          buttonLabel="다시 시도하기"
          onRetry={() => void refetchWaitingRoom()}
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
