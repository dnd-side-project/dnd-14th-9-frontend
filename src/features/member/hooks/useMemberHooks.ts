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
  useQueryClient,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { createSingletonHooks } from "@/hooks/createSingletonHooks";
import type { ApiSuccessResponse } from "@/types/shared/types";

import { memberApi } from "../api";

import type {
  MemberProfile,
  MemberReport,
  UpdateInterestCategoriesRequest,
  UpdateNicknameRequest,
  UpdateProfileImageRequest,
} from "../types";

// createSingletonHooks로 기본 me 관련 훅 생성 (Session의 createCrudHooks와 동일한 역할)
const memberCore = createSingletonHooks<MemberProfile, never>({
  queryKey: "member",
  get: memberApi.getMe,
  remove: memberApi.deleteMe,
  staleTime: 5 * 60 * 1000, // 5분
});

// 캐시 키 (Session의 sessionKeys와 동일한 구조)
export const memberKeys = {
  all: memberCore.keys.all,
  me: memberCore.keys.data, // "data" 대신 "me"라는 도메인 친화적 이름 사용
  data: memberCore.keys.data, // 하위 호환성 유지
  report: () => ["member", "report"] as const,
};

// Query Hooks
export const useMe = memberCore.useGet;
export const useDeleteMe = memberCore.useDelete!;
export const prefetchMe = memberCore.prefetch;

// Report 쿼리 (Session의 useSessionReport와 동일한 패턴)
export function useMyReport() {
  return useQuery<ApiSuccessResponse<MemberReport>>({
    queryKey: memberKeys.report(),
    queryFn: memberApi.getMyReport,
  });
}

export async function prefetchMyReport() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: memberKeys.report(),
    queryFn: memberApi.getMyReport,
  });
  return dehydrate(queryClient);
}

// Mutation 헬퍼 (Session의 createSessionMutationHook과 동일한 역할)
function createMemberProfileMutation<TVariables>(
  mutationFn: (vars: TVariables) => Promise<ApiSuccessResponse<MemberProfile>>
) {
  return () => {
    const queryClient = useQueryClient();
    return useMutation<ApiSuccessResponse<MemberProfile>, unknown, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        // 프로필 수정 시 me 캐시 직접 업데이트
        queryClient.setQueryData(memberKeys.me(), data);
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
