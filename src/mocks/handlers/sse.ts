import { http, HttpResponse } from "msw";

import {
  getMockReactionSummarySSEEvents,
  getMockSessionRoomSSEEvents,
  type MockSSEEvent,
} from "./sse-payloads";

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

  // 세션 전체/본인 리액션 집계 통합 채널
  http.get("*/api/sse/reactions/:sessionId", ({ params }) => {
    return sseStream(getMockReactionSummarySSEEvents(toSessionId(params.sessionId)));
  }),
];
