import { authHandlers } from "./auth";
import { memberHandlers } from "./member";
import { mockControlHandlers } from "./mock-control";
import { sessionHandlers } from "./session";
import { taskHandlers } from "./task";

export const handlerRegistry = [
  { name: "auth", handlers: authHandlers },
  { name: "member", handlers: memberHandlers },
  { name: "session", handlers: sessionHandlers },
  { name: "task", handlers: taskHandlers },
  { name: "mock-control", handlers: mockControlHandlers },
] as const;

export const handlers = handlerRegistry.flatMap(({ handlers }) => handlers);
