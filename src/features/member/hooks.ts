import { createMemberHooks } from "@/hooks/createMemberHooks";
import { memberApi } from "./api";
import type { MemberProfile, MemberReport, NicknameExistsResult, UpdateMePayload } from "./types";

export const memberHooks = createMemberHooks<
  MemberProfile,
  UpdateMePayload,
  MemberReport,
  NicknameExistsResult
>({
  queryKey: "member",
  getMe: memberApi.getMe,
  updateMe: memberApi.updateMe,
  getMyReport: memberApi.getMyReport,
  checkNicknameExists: memberApi.checkNicknameExists,
  deleteMe: memberApi.deleteMe,
});

export const memberKeys = memberHooks.keys;
export const useMe = memberHooks.useMe;
export const useUpdateMe = memberHooks.useUpdateMe;
export const useMyReport = memberHooks.useMyReport;
export const useNicknameExists = memberHooks.useNicknameExists;
export const useDeleteMe = memberHooks.useDeleteMe;
export const prefetchMe = memberHooks.prefetchMe;
export const prefetchMyReport = memberHooks.prefetchMyReport;
