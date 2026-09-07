/** 실제 앱의 clean build로 어댑터와 출력 설정의 호환성을 검증한다. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = fileURLToPath(new URL("../", import.meta.url));
const buildDir = path.join(projectDir, ".next");
const temporaryDir = mkdtempSync(path.join(tmpdir(), "next-adapter-regression-"));
const adapterPath = path.join(temporaryDir, "adapter.cjs");
const completedPath = path.join(temporaryDir, "completed");

// .next를 다시 생성하므로 개발 서버나 다른 빌드와 동시에 실행하지 않는다.
try {
  writeFileSync(
    adapterPath,
    `module.exports = {
      name: "build-regression",
      async onBuildComplete() {
        require("node:fs").writeFileSync(${JSON.stringify(completedPath)}, "completed");
      }
    };`
  );
  rmSync(buildDir, { recursive: true, force: true });
  const result = spawnSync("pnpm", ["build"], {
    cwd: projectDir,
    env: { ...process.env, NEXT_ADAPTER_PATH: adapterPath },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, "Build with adapter must succeed");
  assert.ok(existsSync(completedPath), "Adapter onBuildComplete must run");
} finally {
  rmSync(temporaryDir, { recursive: true, force: true });
  rmSync(buildDir, { recursive: true, force: true });
}
