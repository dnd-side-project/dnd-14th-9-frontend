import { http, HttpResponse } from "msw";

import {
  getMockInProgressMembersSSEPayload,
  getMockWaitingMembersSSEPayload,
} from "./sse-payloads";

function sseStream(event: string, data: unknown) {
  return new HttpResponse(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`, {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    },
  });
}

function toSessionId(value: string | readonly string[] | undefined): number {
  return Number(Array.isArray(value) ? value[0] : value);
}

export const sseHandlers = [
  http.get("*/api/sse/waiting/:sessionId", ({ params }) => {
    return sseStream(
      "waiting-members-updated",
      getMockWaitingMembersSSEPayload(toSessionId(params.sessionId))
    );
  }),

  http.get("*/api/sse/in-progress/:sessionId", ({ params }) => {
    return sseStream(
      "in-progress-members-updated",
      getMockInProgressMembersSSEPayload(toSessionId(params.sessionId))
    );
  }),

  http.get("*/api/sse/session-status/:sessionId", () => {
    return sseStream("session-status-updated", { status: "IN_PROGRESS" });
  }),

  http.get("*/api/sse/reaction/:sessionId", () => {
    return sseStream("reaction-updated", {
      heartCount: 0,
      starCount: 0,
      thumbsUpCount: 0,
      thumbsDownCount: 0,
    });
  }),

  http.get("*/api/sse/reaction/:sessionId/members/:memberId", () => {
    return sseStream("member-reaction-updated", {
      heartCount: 0,
      starCount: 0,
      thumbsUpCount: 0,
      thumbsDownCount: 0,
    });
  }),
];
