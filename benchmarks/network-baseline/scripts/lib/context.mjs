import { rmSync } from "node:fs";

import { writeAtomicJson } from "./io.mjs";

export const INITIAL_RUN_CONTEXT = {
  scenario: "setup",
  run: 0,
  phase: "idle",
  step: "fixture-discovery",
};

export function resetRunContextFile(filePath) {
  rmSync(filePath, { force: true });
  rmSync(`${filePath}.tmp`, { force: true });
  writeAtomicJson(filePath, INITIAL_RUN_CONTEXT);
  return { ...INITIAL_RUN_CONTEXT };
}
