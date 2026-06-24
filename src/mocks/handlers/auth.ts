import { http, HttpResponse } from "msw";

import { ok } from "./utils";

export const authHandlers = [
  http.get("*/api/auth/login", () => {
    return HttpResponse.redirect(new URL("/", "http://localhost:3000"));
  }),

  http.get("*/api/auth/callback/:provider", () => {
    return HttpResponse.redirect(new URL("/", "http://localhost:3000"));
  }),

  http.post("*/api/auth/logout", () => {
    return HttpResponse.json(ok(null));
  }),
];
