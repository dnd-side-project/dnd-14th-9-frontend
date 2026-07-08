import { http, HttpResponse } from "msw";

import { resetMockSessions } from "./session-state";
import { ok } from "./utils";

export const mockControlHandlers = [
  http.post("*/api/mock/reset", () => {
    resetMockSessions();
    return HttpResponse.json(ok(null));
  }),
];
