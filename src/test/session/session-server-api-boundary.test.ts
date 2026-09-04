import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("session server-only API build boundary", () => {
  it("server API 모듈은 server-only를 import한다", () => {
    const source = readSource("src/features/session/server/api.ts");
    expect(source).toMatch(/import ["']server-only["']/);
  });

  it("getSessionDetail은 client sessionApi가 아니라 sessionServerApi를 사용한다", () => {
    const source = readSource("src/features/session/server/get-session-detail.ts");
    expect(source).toContain('from "./api"');
    expect(source).toContain("sessionServerApi.getDetail");
    expect(source).toContain("cache(");
    expect(source).not.toContain("@/features/session/api");
    expect(source).not.toContain("sessionApi");
  });

  it("client session 모듈은 server-only API를 import하지 않는다", () => {
    const clientSources = [
      "src/features/session/api.ts",
      "src/features/session/hooks/useSessionHooks.ts",
      "src/features/session/components/SessionPageContent.tsx",
      "src/features/session/components/SessionResult/SessionResultContent.tsx",
      "src/features/session/components/SessionResult/ParticipantsReportContent.tsx",
    ];

    for (const relativePath of clientSources) {
      const source = readSource(relativePath);
      expect(source).not.toContain("features/session/server");
      expect(source).not.toContain("sessionServerApi");
      expect(source).not.toContain('from "server-only"');
    }
  });

  it("공개 세션 상세 Route Handler는 유지된다", () => {
    const source = readSource("src/app/api/sessions/[sessionId]/route.ts");
    expect(source).toContain("forwardToBackend");
    expect(source).toContain("pathWithQuery: `/sessions/${sessionId}`");
    expect(source).toMatch(/export async function GET/);
  });
});
