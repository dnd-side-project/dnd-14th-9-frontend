import fs from "node:fs";
import path from "node:path";

interface ExpectedEndpoint {
  method: "get" | "post" | "patch" | "delete";
  pattern: string;
  source: string;
}

const handlersDirectory = path.join(process.cwd(), "src/mocks/handlers");

function readHandlerSources() {
  return fs
    .readdirSync(handlersDirectory)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => fs.readFileSync(path.join(handlersDirectory, file), "utf8"))
    .join("\n");
}

const expectedEndpoints: ExpectedEndpoint[] = [
  { method: "get", pattern: "*/api/auth/login", source: "src/app/api/auth/login/route.ts" },
  {
    method: "get",
    pattern: "*/api/auth/callback/:provider",
    source: "src/app/api/auth/callback/[provider]/route.ts",
  },
  { method: "post", pattern: "*/api/auth/logout", source: "src/features/auth/api.ts" },
  { method: "post", pattern: "*/api/mock/reset", source: "src/mocks/handlers/mock-control.ts" },
  { method: "get", pattern: "*/api/members/me/profile", source: "src/features/member/api.ts" },
  { method: "get", pattern: "*/api/members/me/edit", source: "src/features/member/api.ts" },
  {
    method: "patch",
    pattern: "*/api/members/me/profile-image",
    source: "src/features/member/api.ts",
  },
  {
    method: "delete",
    pattern: "*/api/members/me/profile-image",
    source: "src/features/member/api.ts",
  },
  { method: "patch", pattern: "*/api/members/me/nickname", source: "src/features/member/api.ts" },
  { method: "patch", pattern: "*/api/members/me", source: "src/features/member/api.ts" },
  { method: "patch", pattern: "*/api/members/me/email", source: "src/features/member/api.ts" },
  {
    method: "patch",
    pattern: "*/api/members/me/interest-categories",
    source: "src/features/member/api.ts",
  },
  { method: "get", pattern: "*/api/members/me/report-stats", source: "src/features/member/api.ts" },
  {
    method: "get",
    pattern: "*/api/members/me/report-sessions",
    source: "src/features/member/api.ts",
  },
  { method: "delete", pattern: "*/api/members/me", source: "src/features/member/api.ts" },
  { method: "get", pattern: "*/api/sessions", source: "src/features/session/api.ts" },
  { method: "get", pattern: "*/api/sessions/:sessionId", source: "src/features/session/api.ts" },
  { method: "post", pattern: "*/api/sessions/create", source: "src/features/session/api.ts" },
  {
    method: "post",
    pattern: "*/api/sessions/:sessionId/join",
    source: "src/features/session/api.ts",
  },
  {
    method: "get",
    pattern: "*/api/sessions/:sessionId/waiting-room",
    source: "src/features/session/api.ts",
  },
  {
    method: "get",
    pattern: "*/api/sessions/:sessionId/in-progress",
    source: "src/features/session/api.ts",
  },
  {
    method: "delete",
    pattern: "*/api/sessions/:sessionId/leave",
    source: "src/features/session/api.ts",
  },
  {
    method: "get",
    pattern: "*/api/sessions/:sessionId/report",
    source: "src/features/session/api.ts",
  },
  {
    method: "get",
    pattern: "*/api/sessions/:sessionId/me/report",
    source: "src/features/session/api.ts",
  },
  {
    method: "post",
    pattern: "*/api/sessions/:sessionId/reaction",
    source: "src/features/session/api.ts",
  },
  {
    method: "delete",
    pattern: "*/api/sessions/:sessionId/members",
    source: "src/features/session/api.ts",
  },
  {
    method: "post",
    pattern: "*/api/sessions/:sessionId/results",
    source: "src/features/session/api.ts",
  },
  {
    method: "patch",
    pattern: "*/api/sessions/:sessionId/me/status",
    source: "src/features/session/api.ts",
  },
  { method: "patch", pattern: "*/api/tasks/:taskId", source: "src/features/task/api.ts" },
  { method: "post", pattern: "*/api/tasks/:taskId/subtasks", source: "src/features/task/api.ts" },
  { method: "patch", pattern: "*/api/subtasks/:subtaskId", source: "src/features/task/api.ts" },
  { method: "delete", pattern: "*/api/subtasks/:subtaskId", source: "src/features/task/api.ts" },
  {
    method: "post",
    pattern: "*/api/subtasks/:subtaskId/completion",
    source: "src/features/session/api.ts",
  },
  { method: "get", pattern: "*/api/sse/waiting/:sessionId", source: "src/app/api/sse" },
  { method: "get", pattern: "*/api/sse/in-progress/:sessionId", source: "src/app/api/sse" },
  { method: "get", pattern: "*/api/sse/session-status/:sessionId", source: "src/app/api/sse" },
  { method: "get", pattern: "*/api/sse/reaction/:sessionId", source: "src/app/api/sse" },
  {
    method: "get",
    pattern: "*/api/sse/reaction/:sessionId/members/:memberId",
    source: "src/app/api/sse",
  },
];

describe("MSW backend API coverage", () => {
  it.each(expectedEndpoints)("covers $method $pattern from $source", ({ method, pattern }) => {
    const handlerSources = readHandlerSources();

    expect(handlerSources).toContain(`http.${method}("${pattern}"`);
  });

  it("uses SSE event names consumed by hooks", () => {
    const handlerSources = readHandlerSources();

    for (const eventName of [
      "waiting-members-updated",
      "in-progress-members-updated",
      "session-status-updated",
      "reaction-updated",
      "member-reaction-updated",
    ]) {
      expect(handlerSources).toMatch(new RegExp(`sseStream\\(\\s*["\\\']${eventName}["\\\']`));
    }
  });

  it("registers every handler module in the exported handler registry", () => {
    const indexSource = fs.readFileSync(path.join(handlersDirectory, "index.ts"), "utf8");

    expect(indexSource).toContain("handlerRegistry");
    for (const handlerName of [
      "authHandlers",
      "memberHandlers",
      "sessionHandlers",
      "taskHandlers",
      "sseHandlers",
      "mockControlHandlers",
    ]) {
      expect(indexSource).toContain(`handlers: ${handlerName}`);
    }
  });

  it("documents currently empty feature API modules as no-op coverage", () => {
    const resultApi = fs.readFileSync(
      path.join(process.cwd(), "src/features/result/api.ts"),
      "utf8"
    );
    const workspaceApi = fs.readFileSync(
      path.join(process.cwd(), "src/features/workspace/api.ts"),
      "utf8"
    );

    expect(resultApi.trim()).toBe("");
    expect(workspaceApi.trim()).toBe("");
  });
});
