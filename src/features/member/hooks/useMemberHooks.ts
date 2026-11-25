/**
 * Member Query Hooks
 *
 * Session이 createCrudHooks를 사용하는 것처럼,
 * Member는 createSingletonHooks를 직접 사용합니다.
 * 불필요한 createMemberHooks 중간 레이어는 제거합니다.
 */

import {
  useMutation,
  useQuery,
  useSuspenseQuery,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";

import { createSingletonHooks } from "@/hooks/createSingletonHooks";
import { isAuthRejectedError } from "@/lib/api/api-client";

import { memberApi } from "../api";

import type {
  DeleteProfileImageResponse,
  GetMeForEditResponse,
  MemberProfileMutationResponse,
  MemberProfileView,
  UpdateEmailRequest,
  UpdateInterestCategoriesRequest,
  UpdateMeRequest,
  UpdateNicknameRequest,
  UpdateProfileImageRequest,
} from "../types";

const MEMBER_STALE_TIME = 5 * 60 * 1000;

// createSingletonHooks로 기본 me 관련 훅 생성 (Session의 createCrudHooks와 동일한 역할)
const memberCore = createSingletonHooks<MemberProfileView, never>({
  queryKey: "member",
  get: memberApi.getMe,
  remove: memberApi.deleteMe,
  staleTime: MEMBER_STALE_TIME, // 5분
});

// 캐시 키 (Session의 sessionKeys와 동일한 구조)
export const memberKeys = {
  all: memberCore.keys.all,
  me: memberCore.keys.data, // "data" 대신 "me"라는 도메인 친화적 이름 사용
  data: memberCore.keys.data, // 하위 호환성 유지
  edit: () => ["member", "edit"] as const,
  report: () => ["member", "report"] as const,
};

export const memberQueries = {
  me: () =>
    queryOptions({
      queryKey: memberKeys.me(),
      // 인증 거부(401/403)는 에러가 아니라 "로그인 안 됨"(null)이라는 정상 결과로 캐시를 덮어쓴다.
      // 에러로 두면 이전 프로필이 캐시에 남아, 이후 일시 오류가 에러를 덮어쓸 때 되살아난다.
      queryFn: () =>
        memberApi.getMe().catch((error: unknown) => {
          if (isAuthRejectedError(error)) return null;
          throw error;
        }),
      // 오류 없이 확정된 guest(null)는 신선하게 두지 않는다. 일시적 401/403 뒤에도 포커스 복귀·재마운트 때
      // 다시 확인해 복구한다. 이후 일시 오류가 난 상태(error)는 재시도 버튼이 있으므로 기존 staleTime을 따른다.
      staleTime: (query) =>
        query.state.data === null && !query.state.error ? 0 : MEMBER_STALE_TIME,
      // 인증 거부는 위에서 성공(null)으로 바뀌므로 재시도 대상이 아니다. 일시 오류만 최대 2회 재시도한다.
      retry: 2,
      meta: {
        transientErrorToast: "로그인 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
    }),
  edit: () =>
    queryOptions({
      queryKey: memberKeys.edit(),
      queryFn: memberApi.getMeForEdit,
      staleTime: MEMBER_STALE_TIME,
      retry: false,
    }),
  report: () =>
    queryOptions({
      queryKey: memberKeys.report(),
      queryFn: memberApi.getMyReportStats,
    }),
};

// Query Hooks
interface UseMeOptions {
  enabled?: boolean;
}

/**
 * 내 프로필 조회 쿼리 훅.
 *
 * 화면에서 로그인 여부를 판정하거나 프로필을 표시할 때는 이 훅을 직접 쓰지 말고
 * `useAuthState()`를 사용하세요.
 */
export function useMe(options?: UseMeOptions) {
  return useQuery({
    ...memberQueries.me(),
    ...options,
  });
}

export const useDeleteMe = memberCore.useDelete!;

export function useMeForEdit() {
  return useQuery(memberQueries.edit());
}
export function useSuspenseMeForEdit() {
  return useSuspenseQuery(memberQueries.edit());
}

// Report 쿼리 (Session의 useSessionReport와 동일한 패턴)
export function useMyReport() {
  return useQuery(memberQueries.report());
}

// Mutation 헬퍼 (Session의 createSessionMutationHook과 동일한 역할)
function createMemberProfileMutation<TVariables>(
  mutationFn: (vars: TVariables) => Promise<MemberProfileMutationResponse>
) {
  return () => {
    const queryClient = useQueryClient();
    return useMutation<MemberProfileMutationResponse, unknown, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        // 수정 API 응답은 edit 형태이므로 edit 캐시를 동기화
        queryClient.setQueryData<GetMeForEditResponse>(memberKeys.edit(), data);
        // profile 조회는 별도 응답 타입이므로 무효화 후 재조회
        queryClient.invalidateQueries({ queryKey: memberKeys.me() });
        // report도 무효화
        queryClient.invalidateQueries({ queryKey: memberKeys.report() });
      },
    });
  };
}

// Mutation Hooks (Session의 useJoinSession 등과 동일한 패턴)
export const useUpdateProfileImage = createMemberProfileMutation<UpdateProfileImageRequest>(
  (body) => memberApi.updateProfileImage(body)
);

export const useUpdateNickname = createMemberProfileMutation<UpdateNicknameRequest>((body) =>
  memberApi.updateNickname(body)
);

export const useUpdateInterestCategories =
  createMemberProfileMutation<UpdateInterestCategoriesRequest>((body) =>
    memberApi.updateInterestCategories(body)
  );

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();
  return useMutation<DeleteProfileImageResponse, unknown, void>({
    mutationFn: () => memberApi.deleteProfileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.me() });
      queryClient.invalidateQueries({ queryKey: memberKeys.edit() });
    },
  });
}

export const useUpdateMe = createMemberProfileMutation<UpdateMeRequest>((body) =>
  memberApi.updateMe(body)
);

export const useUpdateEmail = createMemberProfileMutation<UpdateEmailRequest>((body) =>
  memberApi.updateEmail(body)
);
