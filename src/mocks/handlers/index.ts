import { authHandlers } from "./auth";
import { memberHandlers } from "./member";
import { sessionHandlers } from "./session";

export const handlerRegistry = [
  { name: "auth", handlers: authHandlers },
  { name: "member", handlers: memberHandlers },
  { name: "session", handlers: sessionHandlers },
] as const;

export const handlers = handlerRegistry.flatMap(({ handlers }) => handlers);
