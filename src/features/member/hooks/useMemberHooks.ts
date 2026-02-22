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
  QueryClient,
  dehydrate,
  queryOptions,
} from "@tanstack/react-query";

import { createSingletonHooks } from "@/hooks/createSingletonHooks";

import { memberApi } from "../api";

import type {
  DeleteProfileImageResponse,
  GetMeForEditResponse,
  MemberProfileMutationResponse,
  MemberProfileView,
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
      queryFn: memberApi.getMe,
      staleTime: MEMBER_STALE_TIME,
    }),
  edit: () =>
    queryOptions({
      queryKey: memberKeys.edit(),
      queryFn: memberApi.getMeForEdit,
      staleTime: MEMBER_STALE_TIME,
    }),
  report: () =>
    queryOptions({
      queryKey: memberKeys.report(),
      queryFn: memberApi.getMyReport,
    }),
};

// Query Hooks
interface UseMeOptions {
  enabled?: boolean;
}

export function useMe(options?: UseMeOptions) {
  return useQuery({
    ...memberQueries.me(),
    ...options,
  });
}

export function useIsAuthenticated() {
  const { data, isError } = useMe();
  return !isError && Boolean(data?.result);
}

export const useDeleteMe = memberCore.useDelete!;

export async function prefetchMe() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(memberQueries.me());
  return dehydrate(queryClient);
}

export function useMeForEdit() {
  return useQuery(memberQueries.edit());
}
export function useSuspenseMeForEdit() {
  return useSuspenseQuery(memberQueries.edit());
}

export async function prefetchMeForEdit() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(memberQueries.edit());
  return dehydrate(queryClient);
}

// Report 쿼리 (Session의 useSessionReport와 동일한 패턴)
export function useMyReport() {
  return useQuery(memberQueries.report());
}

export async function prefetchMyReport() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(memberQueries.report());
  return dehydrate(queryClient);
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
