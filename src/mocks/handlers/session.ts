import { http, HttpResponse } from "msw";

import type {
  CreateSessionRequest,
  JoinSessionRequest,
  SendReactionRequest,
  SessionListParams,
  SubmitSessionResultRequest,
} from "@/features/session/types";

import { MockJsonParseError, readRequiredJson, readRequiredMultipartJsonPart } from "./json";
import {
  createMockSession,
  getMockInProgress,
  getMockMyReport,
  getMockSessionDetail,
  getMockSessionList,
  getMockSessionReport,
  getMockWaitingRoom,
  joinMockSession,
  kickMockSessionMembers,
  leaveMockSession,
  sendMockReaction,
  submitMockSessionResult,
  toggleMockMyStatus,
  MockMemberNotFoundError,
  MockSessionNotFoundError,
} from "./session-state";
import { fail, ok } from "./utils";

function toSessionId(value: string | readonly string[] | undefined): number {
  return Number(Array.isArray(value) ? value[0] : value);
}

async function sessionJson<T>(producer: () => T | Promise<T>) {
  try {
    return HttpResponse.json(ok(await producer()));
  } catch (error) {
    if (error instanceof MockSessionNotFoundError) {
      return HttpResponse.json(fail("SESSION404_1", "존재하지 않는 세션입니다.", "NOT_FOUND"), {
        status: 404,
      });
    }
    if (error instanceof MockMemberNotFoundError) {
      return HttpResponse.json(fail("MEMBER404_1", "존재하지 않는 멤버입니다.", "NOT_FOUND"), {
        status: 404,
      });
    }
    if (error instanceof MockJsonParseError) {
      return HttpResponse.json(fail("COMMON400", error.message, "BAD_REQUEST"), { status: 400 });
    }

    throw error;
  }
}

function getListParams(request: Request): SessionListParams {
  const url = new URL(request.url);
  return {
    keyword: url.searchParams.get("keyword") ?? undefined,
    category: (url.searchParams.get("category") as SessionListParams["category"]) ?? undefined,
    sort: (url.searchParams.get("sort") as SessionListParams["sort"]) ?? undefined,
    startDate: url.searchParams.get("startDate") ?? undefined,
    endDate: url.searchParams.get("endDate") ?? undefined,
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    size: url.searchParams.get("size") ? Number(url.searchParams.get("size")) : undefined,
  };
}

export const sessionHandlers = [
  http.get("*/api/sessions", ({ request }) => {
    return HttpResponse.json(ok(getMockSessionList(getListParams(request))));
  }),

  http.post("*/api/sessions/create", ({ request }) => {
    return sessionJson(async () =>
      createMockSession(
        await readRequiredMultipartJsonPart<CreateSessionRequest>(
          request,
          "request",
          "session create"
        )
      )
    );
  }),

  http.get("*/api/sessions/:sessionId", ({ params }) => {
    return sessionJson(() => getMockSessionDetail(toSessionId(params.sessionId)));
  }),

  http.get("*/api/sessions/:sessionId/report", ({ params }) => {
    return sessionJson(() => getMockSessionReport(toSessionId(params.sessionId)));
  }),

  http.get("*/api/sessions/:sessionId/me/report", ({ params }) => {
    return sessionJson(() => getMockMyReport(toSessionId(params.sessionId)));
  }),

  http.get("*/api/sessions/:sessionId/in-progress", ({ params }) => {
    return sessionJson(() => getMockInProgress(toSessionId(params.sessionId)));
  }),

  http.get("*/api/sessions/:sessionId/waiting-room", ({ params }) => {
    return sessionJson(() => getMockWaitingRoom(toSessionId(params.sessionId)));
  }),

  http.post("*/api/sessions/:sessionId/join", async ({ request, params }) => {
    return sessionJson(async () => {
      const body = await readRequiredJson<JoinSessionRequest>(request, "session join");
      return joinMockSession(toSessionId(params.sessionId), body);
    });
  }),

  http.post("*/api/sessions/:sessionId/reaction", async ({ request, params }) => {
    return sessionJson(async () => {
      const body = await readRequiredJson<SendReactionRequest>(request, "session reaction");
      return sendMockReaction(toSessionId(params.sessionId), body.targetMemberId, body.emojiType);
    });
  }),

  http.patch("*/api/sessions/:sessionId/me/status", ({ params }) => {
    return sessionJson(() => toggleMockMyStatus(toSessionId(params.sessionId)));
  }),

  http.post("*/api/sessions/:sessionId/results", async ({ request, params }) => {
    return sessionJson(async () => {
      const body = await readRequiredJson<SubmitSessionResultRequest>(
        request,
        "session result submit"
      );
      return submitMockSessionResult(toSessionId(params.sessionId), body);
    });
  }),

  http.delete("*/api/sessions/:sessionId/leave", ({ params }) => {
    return sessionJson(() => {
      leaveMockSession(toSessionId(params.sessionId));
      return null;
    });
  }),

  http.delete("*/api/sessions/:sessionId/members", async ({ request, params }) => {
    return sessionJson(async () => {
      const body = await readRequiredJson<{ memberIds: number[] }>(request, "session members kick");
      kickMockSessionMembers(toSessionId(params.sessionId), body.memberIds);
      return null;
    });
  }),
];
