import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function presentEnvNames() {
  const names = new Set();
  for (const fileName of [".env.local", ".env.development.local", ".env.production.local"]) {
    try {
      const text = readFileSync(fileName, "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        names.add(trimmed.split("=", 1)[0]);
      }
    } catch {
      // optional env files
    }
  }

  const known = [
    "BACKEND_API_BASE",
    "BACKEND_ORIGIN",
    "FRONTEND_ORIGIN",
    "NEXT_PUBLIC_BACKEND_API_BASE",
    "NEXT_PUBLIC_BACKEND_ORIGIN",
    "NEXT_PUBLIC_FRONTEND_ORIGIN",
    "NEXT_PUBLIC_WS_URL",
    "NEXT_PUBLIC_GOOGLE_ANALYTICS",
    "NEXT_PUBLIC_GOOGLE_VERIFICATION",
    "NEXT_PUBLIC_NAVER_VERIFICATION",
    "NEXT_PUBLIC_ENABLE_DEVTOOLS",
    "NEXT_PUBLIC_USE_MOCK",
    "BENCHMARK_MODE",
    "NEXT_PUBLIC_BENCHMARK_MODE",
    "BENCHMARK_ACCESS_TOKEN",
    "BENCHMARK_REFRESH_TOKEN",
    "BENCHMARK_SESSION_ID",
    "BENCHMARK_INTERACTIVE_SESSION_ID",
    "BENCHMARK_INTERACTIVE_SUBTASK_ID",
    "BENCHMARK_ALLOW_PROFILE_MUTATION",
    "PORT",
  ];
  for (const name of known) {
    if (process.env[name]) names.add(name);
  }
  return [...names].sort();
}

function packageVersion(pkgRoot, name) {
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(pkgRoot, "node_modules", name, "package.json"), "utf8")
    );
    return pkg.version;
  } catch {
    return null;
  }
}

export function collectEnvironment({
  origin,
  browserVersion,
  recordedRuns,
  warmupRuns,
  startedAt,
  gitSha,
  gitBranch,
}) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  return {
    git: {
      sha: gitSha ?? run("git", ["rev-parse", "HEAD"]),
      branch: gitBranch ?? run("git", ["branch", "--show-current"]),
    },
    runtime: {
      node: process.version,
      pnpm: run("pnpm", ["-v"]),
      next: packageVersion(process.cwd(), "next") ?? pkg.dependencies?.next ?? null,
      react: packageVersion(process.cwd(), "react") ?? pkg.dependencies?.react ?? null,
      playwright:
        packageVersion(process.cwd(), "playwright") ?? pkg.devDependencies?.playwright ?? null,
      chromium: browserVersion ?? null,
    },
    machine: {
      os: `${os.platform()} ${os.release()}`,
      arch: os.arch(),
      cpu: os.cpus()[0]?.model ?? null,
      memoryBytes: os.totalmem(),
      hostnameRedacted: true,
    },
    execution: {
      startedAt,
      frontendMode: "production (next start)",
      benchmarkMode: true,
      origin,
      warmupRuns,
      recordedRuns,
      backendEnvironment: "configured BACKEND_API_BASE origin (value not stored)",
    },
    envVarNames: presentEnvNames(),
    notes: [
      "Environment variable values, tokens, and cookies are not recorded.",
      "Measurement uses a production build with BENCHMARK_MODE enabled for instrumentation only.",
    ],
  };
}
