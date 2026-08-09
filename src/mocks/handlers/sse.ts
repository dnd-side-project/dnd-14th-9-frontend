import { http, HttpResponse } from "msw";

import { getMockSessionRoomSSEEvents, type MockSSEEvent } from "./sse-payloads";

function sseStream(events: MockSSEEvent[]) {
  const body = events
    .map(({ event, data }) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    .join("");

  return new HttpResponse(body, {
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
  // 대기/진행/상태 통합 채널
  http.get("*/api/sse/room/:sessionId", ({ params }) => {
    return sseStream(getMockSessionRoomSSEEvents(toSessionId(params.sessionId)));
  }),

  http.get("*/api/sse/reaction/:sessionId", () => {
    return sseStream([
      {
        event: "reaction-updated",
        data: { heartCount: 0, starCount: 0, thumbsUpCount: 0, thumbsDownCount: 0 },
      },
    ]);
  }),

  http.get("*/api/sse/reaction/:sessionId/members/:memberId", () => {
    return sseStream([
      {
        event: "member-reaction-updated",
        data: { heartCount: 0, starCount: 0, thumbsUpCount: 0, thumbsDownCount: 0 },
      },
    ]);
  }),
];
