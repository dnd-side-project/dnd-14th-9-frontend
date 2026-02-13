import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiSuccessResponse } from "@/types/shared/types";

import { memberApi } from "../api";

import { createMemberHooks } from "./createMemberHooks";

import type {
  MemberProfile,
  MemberReport,
  UpdateInterestCategoriesRequest,
  UpdateNicknameRequest,
  UpdateProfileImageRequest,
} from "../types";

export const memberHooks = createMemberHooks<MemberProfile, Record<string, unknown>, MemberReport>({
  queryKey: "member",
  getMe: memberApi.getMe,
  getMyReport: memberApi.getMyReport,
  deleteMe: memberApi.deleteMe,
});

export const memberKeys = memberHooks.keys;
export const useMe = memberHooks.useMe;
export const useMyReport = memberHooks.useMyReport!;
export const useDeleteMe = memberHooks.useDeleteMe!;
export const prefetchMe = memberHooks.prefetchMe;
export const prefetchMyReport = memberHooks.prefetchMyReport!;

const createMemberProfileMutationHook = <TVariables>(
  mutationFn: (vars: TVariables) => Promise<ApiSuccessResponse<MemberProfile>>
) => {
  return () => {
    const queryClient = useQueryClient();
    return useMutation<ApiSuccessResponse<MemberProfile>, unknown, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        queryClient.setQueryData(memberKeys.me(), data);
      },
    });
  };
};

export const useUpdateProfileImage = createMemberProfileMutationHook<UpdateProfileImageRequest>(
  (body) => memberApi.updateProfileImage(body)
);

export const useUpdateNickname = createMemberProfileMutationHook<UpdateNicknameRequest>((body) =>
  memberApi.updateNickname(body)
);

export const useUpdateInterestCategories =
  createMemberProfileMutationHook<UpdateInterestCategoriesRequest>((body) =>
    memberApi.updateInterestCategories(body)
  );
