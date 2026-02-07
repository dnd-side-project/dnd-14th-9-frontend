import type { ApiSuccessResponse } from "@/types/shared/types";

export type MemberProfile = unknown;
export type MemberReport = unknown;
export type NicknameExistsResult = unknown;

export type GetMeResponse = ApiSuccessResponse<MemberProfile>;
export type UpdateMeResponse = ApiSuccessResponse<MemberProfile>;
export type GetMyReportResponse = ApiSuccessResponse<MemberReport>;
export type DeleteMeResponse = ApiSuccessResponse<null>;
export type CheckNicknameExistsResponse = ApiSuccessResponse<NicknameExistsResult>;

export type UpdateMePayload = Record<string, unknown>;
