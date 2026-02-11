import { memberApi } from "../api";

import { createMemberHooks } from "./createMemberHooks";

import type { MemberProfile, MemberReport, UpdateMePayload } from "../types";

export const memberHooks = createMemberHooks<MemberProfile, UpdateMePayload, MemberReport>({
  queryKey: "member",
  getMe: memberApi.getMe,
  updateMe: memberApi.updateMe,
  getMyReport: memberApi.getMyReport,
  deleteMe: memberApi.deleteMe,
});

export const memberKeys = memberHooks.keys;
export const useMe = memberHooks.useMe;
export const useUpdateMe = memberHooks.useUpdateMe;
export const useMyReport = memberHooks.useMyReport;
export const useDeleteMe = memberHooks.useDeleteMe;
export const prefetchMe = memberHooks.prefetchMe;
export const prefetchMyReport = memberHooks.prefetchMyReport;
