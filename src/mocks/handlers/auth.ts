import { http, HttpResponse } from "msw";

import { ok } from "./utils";

export const authHandlers = [
  http.get("*/api/auth/login", ({ request }) => {
    return HttpResponse.redirect(new URL("/", request.url));
  }),

  http.get("*/api/auth/callback/:provider", ({ request }) => {
    return HttpResponse.redirect(new URL("/", request.url));
  }),

  http.post("*/api/auth/logout", () => {
    return HttpResponse.json(ok(null));
  }),
];
