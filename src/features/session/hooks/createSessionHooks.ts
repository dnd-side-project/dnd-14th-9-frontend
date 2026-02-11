/**
 * Session Query Hook Factory
 *
 * createCrudHooks를 래핑하여 Session 도메인 전용 훅을 생성합니다.
 * 기본 CRUD(list, detail, create)는 createCrudHooks를 활용하고,
 * 추가 query/mutation(report, join, setGoal, addTodos, toggleTodo)은 별도 구현합니다.
 */

import { createCrudHooks } from "@/hooks/createCrudHooks";
import { sessionApi } from "../api";
import type {
  SessionListParams,
  SessionListResponse,
  SessionDetailResponse,
  CreateSessionRequest,
  CreateSessionResponse,
} from "../types";
import type { ApiSuccessResponse } from "@/types/shared/types";

const sessionCrud = createCrudHooks<
  SessionListParams,
  ApiSuccessResponse<SessionListResponse>,
  ApiSuccessResponse<SessionDetailResponse>,
  CreateSessionRequest,
  never, // update 없음
  CreateSessionResponse
>({
  queryKey: "session",
  getList: sessionApi.getList,
  getDetail: sessionApi.getDetail,
  create: sessionApi.createSession,
});

export const sessionKeys = sessionCrud.keys;

export const useSessionList = sessionCrud.useList;
export const useSessionDetail = sessionCrud.useDetail!;
export const useCreateSession = sessionCrud.useCreate!;
export const prefetchSessionList = sessionCrud.prefetch;
