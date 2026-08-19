/**
 * @fileoverview 하나의 Next.js standalone 빌드로 독립 프로세스 두 개를 실행하고, 동일한
 * 인증 Cookie를 병렬 요청해 Refresh Token Single-Flight의 인스턴스 경계와 백엔드 계약을
 * 검증한다. 회전형 backend의 갱신 충돌과 멱등 backend의 전체 성공을 비교한다.
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

/** 로컬 테스트 서버가 외부 인터페이스에 노출되지 않도록 고정한 loopback 주소. */
const HOST = "127.0.0.1";

/** 독립 Next.js 인스턴스 하나에 동시에 보낼 보호 API 요청 수. */
const REQUESTS_PER_INSTANCE = 5;

/** 과거 구현 측정처럼 결과만 출력하고 현재 동작 단언은 생략할지 여부. */
const REPORT_ONLY = process.argv.includes("--report-only");

/** `pnpm build`가 생성하는 standalone 출력의 탐색 시작 경로. */
const STANDALONE_ROOT = path.join(process.cwd(), ".next/standalone");

/**
 * Mock 응답 지연과 서버 준비 polling 간격을 만들기 위해 지정 시간만큼 기다린다.
 *
 * @param {number} ms 대기할 밀리초.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HTTP 서버를 loopback의 임의 포트에 열고 실제 할당된 포트 번호를 반환한다.
 *
 * @param {import("node:http").Server} server 시작할 HTTP 서버.
 * @returns {Promise<number>} 운영체제가 할당한 포트 번호.
 */
function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, () => resolve(server.address().port));
  });
}

/**
 * HTTP 서버가 기존 연결 처리를 마치고 종료될 때까지 기다린다.
 *
 * @param {import("node:http").Server} server 종료할 HTTP 서버.
 * @returns {Promise<void>}
 */
function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

/**
 * Mock backend 응답을 JSON 형식과 지정된 HTTP 상태 코드로 전송한다.
 *
 * @param {import("node:http").ServerResponse} response Node HTTP 응답 객체.
 * @param {number} status 반환할 HTTP 상태 코드.
 * @param {unknown} body JSON으로 직렬화할 응답 본문.
 * @returns {void}
 */
function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

/**
 * Proxy가 hard refresh 대상으로 판정하도록 이미 만료된 테스트용 JWT 형태의 문자열을 만든다.
 * 서명 검증용 토큰이 아니며 payload의 exp와 요청 구분용 sub만 사용한다.
 *
 * @param {string} label 토큰과 실행 시나리오를 구분할 값.
 * @returns {string} 만료 시각이 포함된 테스트용 Access Token.
 */
function createExpiredAccessToken(label) {
  /** JWT header와 payload 객체를 padding 없는 base64url segment로 변환한다. */
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return [
    encode({ alg: "none", typ: "JWT" }),
    encode({ exp: Math.floor(Date.now() / 1000) - 60, sub: label }),
    "test-signature",
  ].join(".");
}

/**
 * `pnpm build`가 만든 standalone 서버 진입점을 찾는다. monorepo 형태로 중첩된 출력도 찾되,
 * 불필요한 node_modules 순회는 건너뛴다.
 *
 * @returns {string} 실행할 standalone `server.js` 절대 경로.
 * @throws {Error} standalone 빌드가 존재하지 않을 때 발생한다.
 */
function findStandaloneServer() {
  const directEntry = path.join(STANDALONE_ROOT, "server.js");
  if (existsSync(directEntry)) return directEntry;

  const directories = [STANDALONE_ROOT];
  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory || !existsSync(directory)) continue;

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "node_modules") continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) directories.push(entryPath);
      if (entry.isFile() && entry.name === "server.js") return entryPath;
    }
  }

  throw new Error("Standalone build not found. Run `pnpm build` first.");
}

/**
 * Cookie 헤더에서 지정한 이름의 첫 번째 값을 읽는다.
 *
 * @param {string | undefined} cookieHeader 요청의 Cookie 헤더.
 * @param {string} name 찾을 Cookie 이름.
 * @returns {string | undefined} 찾은 Cookie 값 또는 값이 없을 때 undefined.
 */
function readCookie(cookieHeader, name) {
  return cookieHeader
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];
}

/**
 * Mock backend가 시나리오별 호출 수와 토큰 전달 상태를 기록할 초기 상태를 만든다.
 *
 * @returns {object} 회전형 시나리오를 기본값으로 가진 backend 상태.
 */
function createBackendState() {
  return {
    mode: "rotating",
    oldRefreshToken: "",
    newAccessToken: "",
    newRefreshToken: "",
    refreshCalls: 0,
    profileCalls: 0,
    callers: new Set(),
    forwardedTokensAreCurrent: true,
  };
}

/**
 * 다음 시나리오가 이전 시나리오의 토큰과 호출 기록에 영향을 받지 않도록 backend 상태를 초기화한다.
 *
 * @param {object} state 재사용할 backend 상태.
 * @param {"rotating" | "idempotent"} mode 실행할 Refresh Token 계약 모드.
 * @returns {void}
 */
function resetBackendState(state, mode) {
  state.mode = mode;
  state.oldRefreshToken = `old-refresh-${mode}`;
  state.newAccessToken = `new-access-${mode}`;
  state.newRefreshToken = `new-refresh-${mode}`;
  state.refreshCalls = 0;
  state.profileCalls = 0;
  state.callers.clear();
  state.forwardedTokensAreCurrent = true;
}

/**
 * Refresh API와 보호된 profile API를 흉내 내는 로컬 backend를 만든다.
 * 회전형 모드는 첫 refresh만 허용하고, 멱등 모드는 동일 토큰 요청에 같은 토큰 쌍을 반환한다.
 * profile API에서는 Proxy가 새 Authorization/Cookie와 요청별 caller를 정확히 전달했는지 기록한다.
 *
 * @param {object} state 요청 처리 결과를 누적할 backend 상태.
 * @returns {import("node:http").Server} 아직 listen하지 않은 Mock HTTP 서버.
 */
function createBackendServer(state) {
  return createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/auth/refresh") {
      state.refreshCalls += 1;
      const callNumber = state.refreshCalls;
      const refreshToken = readCookie(request.headers.cookie, "refreshToken");

      await delay(200);

      if (refreshToken !== state.oldRefreshToken) {
        return sendJson(response, 401, {
          isSuccess: false,
          code: "AUTH401_7",
          result: null,
          message: "Refresh token mismatch",
        });
      }

      if (state.mode === "rotating" && callNumber > 1) {
        return sendJson(response, 401, {
          isSuccess: false,
          code: "AUTH401_7",
          result: null,
          message: "Refresh token already rotated",
        });
      }

      return sendJson(response, 200, {
        isSuccess: true,
        result: {
          accessToken: state.newAccessToken,
          refreshToken: state.newRefreshToken,
        },
      });
    }

    if (request.method === "GET" && request.url === "/members/me/profile") {
      state.profileCalls += 1;
      const cookieHeader = request.headers.cookie;
      const caller = readCookie(cookieHeader, "caller");
      if (caller) state.callers.add(caller);

      state.forwardedTokensAreCurrent &&=
        request.headers.authorization === `Bearer ${state.newAccessToken}` &&
        readCookie(cookieHeader, "accessToken") === state.newAccessToken &&
        readCookie(cookieHeader, "refreshToken") === state.newRefreshToken;

      return sendJson(response, 200, {
        isSuccess: true,
        result: { nickname: "integration" },
      });
    }

    return sendJson(response, 404, {
      isSuccess: false,
      code: "NOT_FOUND",
      result: null,
    });
  });
}

/**
 * Next.js 프로세스가 충돌 없이 사용할 수 있도록 현재 비어 있는 loopback 포트를 확보한다.
 *
 * @returns {Promise<number>} 확인 시점에 사용 가능한 포트 번호.
 */
async function getFreePort() {
  const server = createServer();
  const port = await listen(server);
  await close(server);
  return port;
}

/**
 * 같은 standalone 빌드를 별도 OS 프로세스로 실행해 독립된 module-scope 메모리 환경을 만든다.
 * stdout과 stderr는 준비 실패나 비정상 종료를 진단할 수 있도록 메모리에 모은다.
 *
 * @param {number} port Next.js 서버가 사용할 포트.
 * @param {string} backendOrigin Mock backend origin.
 * @param {string} standaloneServer 실행할 standalone 서버 파일 경로.
 * @returns {{child: import("node:child_process").ChildProcess, output: string[]}}
 * 실행한 자식 프로세스와 누적 로그.
 */
function startNextServer(port, backendOrigin, standaloneServer) {
  const output = [];
  const child = spawn(process.execPath, [standaloneServer], {
    cwd: path.dirname(standaloneServer),
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: HOST,
      BACKEND_API_BASE: backendOrigin,
      NEXT_PUBLIC_BACKEND_API_BASE: backendOrigin,
      FRONTEND_ORIGIN: `http://${HOST}:${port}`,
      NEXT_PUBLIC_USE_MOCK: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));

  return { child, output };
}

/**
 * Next.js 자식 프로세스가 요청을 받을 준비가 될 때까지 보호 API를 짧게 polling한다.
 * 자식 프로세스가 먼저 종료되거나 제한 시간 내 준비되지 않으면 누적 로그와 함께 실패한다.
 *
 * @param {object} server port, child, output을 가진 실행 중인 Next.js 서버 정보.
 * @returns {Promise<void>}
 */
async function waitForNextServer(server) {
  const origin = `http://${HOST}:${server.port}`;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.child.exitCode !== null) {
      throw new Error(`Next server exited before readiness:\n${server.output.join("")}`);
    }

    try {
      await fetch(`${origin}/api/members/me/profile`, {
        signal: AbortSignal.timeout(500),
      });
      return;
    } catch {
      await delay(100);
    }
  }

  throw new Error(`Next server readiness timed out:\n${server.output.join("")}`);
}

/**
 * Next.js 자식 프로세스에 정상 종료를 요청하고, 5초 내 끝나지 않으면 강제 종료한다.
 *
 * @param {object} server child 프로세스를 가진 Next.js 서버 정보.
 * @returns {Promise<void>}
 */
async function stopNextServer(server) {
  if (server.child.exitCode !== null) return;

  server.child.kill("SIGTERM");
  let timeoutId;
  const exited = await Promise.race([
    once(server.child, "exit").then(() => true),
    new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(false), 5_000);
    }),
  ]);
  clearTimeout(timeoutId);

  if (!exited) {
    server.child.kill("SIGKILL");
    await once(server.child, "exit");
  }
}

/**
 * 여러 HTTP 응답을 상태 코드별 개수로 집계한다.
 *
 * @param {Array<{response: Response}>} responses 집계할 fetch 응답 목록.
 * @returns {Record<number, number>} 상태 코드를 key로 사용하는 응답 개수.
 */
function countStatuses(responses) {
  return responses.reduce((counts, { response }) => {
    counts[response.status] = (counts[response.status] ?? 0) + 1;
    return counts;
  }, {});
}

/**
 * 성공 응답이 backend에서 발급한 새 Access/Refresh Cookie를 모두 설정했는지 확인한다.
 *
 * @param {Response} response 확인할 frontend 응답.
 * @param {object} state 기대할 신규 토큰을 가진 backend 상태.
 * @returns {boolean} 두 인증 Cookie가 모두 기대값이면 true.
 */
function hasNewAuthCookies(response, state) {
  const setCookies = response.headers.getSetCookie();
  return (
    setCookies.some((cookie) => cookie.startsWith(`accessToken=${state.newAccessToken};`)) &&
    setCookies.some((cookie) => cookie.startsWith(`refreshToken=${state.newRefreshToken};`))
  );
}

/**
 * 두 Next.js 인스턴스에 동일한 만료 토큰 요청을 동시에 보내고 관측 결과를 요약한다.
 * 각 요청의 caller Cookie를 이용해 요청 격리와 신규 토큰 전달 여부도 함께 검증한다.
 *
 * @param {"rotating" | "idempotent"} mode 실행할 backend 계약 모드.
 * @param {Array<object>} servers 요청을 보낼 독립 Next.js 서버 목록.
 * @param {object} state 시나리오별로 초기화하고 관측값을 기록할 backend 상태.
 * @returns {Promise<object>} 호출 수, 상태 코드, 요청 격리, 토큰 전달 여부를 담은 결과.
 */
async function runScenario(mode, servers, state) {
  resetBackendState(state, mode);
  const accessToken = createExpiredAccessToken(mode);
  const requests = servers.flatMap((server, instanceIndex) =>
    Array.from({ length: REQUESTS_PER_INSTANCE }, (_, requestIndex) => {
      const caller = `${instanceIndex}-${requestIndex}`;
      return fetch(`http://${HOST}:${server.port}/api/members/me/profile`, {
        headers: {
          cookie: [
            `accessToken=${accessToken}`,
            `refreshToken=${state.oldRefreshToken}`,
            `caller=${caller}`,
          ].join("; "),
        },
      }).then((response) => ({ instanceIndex, caller, response }));
    })
  );

  const responses = await Promise.all(requests);
  await Promise.all(responses.map(({ response }) => response.text()));

  const successfulResponses = responses.filter(({ response }) => response.status === 200);
  const statusByInstance = servers.map((_, instanceIndex) => [
    ...new Set(
      responses
        .filter((result) => result.instanceIndex === instanceIndex)
        .map(({ response }) => response.status)
    ),
  ]);

  return {
    mode,
    refreshCalls: state.refreshCalls,
    profileCalls: state.profileCalls,
    statuses: countStatuses(responses),
    statusByInstance,
    isolatedCallers: state.callers.size,
    forwardedTokensAreCurrent: state.forwardedTokensAreCurrent,
    successfulResponsesSetTokenPair: successfulResponses.every(({ response }) =>
      hasNewAuthCookies(response, state)
    ),
  };
}

/**
 * 현재 Single-Flight 구현에서 기대하는 회전형/멱등 시나리오 결과를 고정된 회귀 조건으로 단언한다.
 * `--report-only`가 아닐 때 값이 달라지면 프로세스를 실패시켜 CI 회귀를 알린다.
 *
 * @param {Array<object>} results `runScenario`가 반환한 두 모드의 결과.
 * @returns {void}
 */
function assertCurrentBehavior(results) {
  const rotating = results.find(({ mode }) => mode === "rotating");
  const idempotent = results.find(({ mode }) => mode === "idempotent");

  assert.deepEqual(rotating.statuses, { 200: 5, 401: 5 });
  assert.equal(rotating.refreshCalls, 2);
  assert.equal(rotating.profileCalls, 5);
  assert.equal(rotating.isolatedCallers, 5);
  assert.equal(rotating.forwardedTokensAreCurrent, true);
  assert.equal(rotating.successfulResponsesSetTokenPair, true);
  assert.deepEqual(rotating.statusByInstance.map((statuses) => statuses.join(",")).sort(), [
    "200",
    "401",
  ]);

  assert.deepEqual(idempotent.statuses, { 200: 10 });
  assert.equal(idempotent.refreshCalls, 2);
  assert.equal(idempotent.profileCalls, 10);
  assert.equal(idempotent.isolatedCallers, 10);
  assert.equal(idempotent.forwardedTokensAreCurrent, true);
  assert.equal(idempotent.successfulResponsesSetTokenPair, true);
  assert.deepEqual(idempotent.statusByInstance, [[200], [200]]);
}

/**
 * Mock backend와 독립 Next.js 프로세스 두 개의 생명주기를 관리하고 두 계약 모드를 순서대로 실행한다.
 * 성공 여부와 관계없이 finally에서 모든 서버와 연결을 정리한다.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const standaloneServer = findStandaloneServer();
  const state = createBackendState();
  const backend = createBackendServer(state);
  const servers = [];

  try {
    const backendPort = await listen(backend);
    const backendOrigin = `http://${HOST}:${backendPort}`;

    for (let index = 0; index < 2; index += 1) {
      const port = await getFreePort();
      const nextServer = {
        port,
        ...startNextServer(port, backendOrigin, standaloneServer),
      };
      servers.push(nextServer);
    }

    await Promise.all(servers.map(waitForNextServer));

    const results = [];
    results.push(await runScenario("rotating", servers, state));
    results.push(await runScenario("idempotent", servers, state));

    process.stdout.write(
      `${JSON.stringify(
        {
          nextInstances: servers.length,
          requestsPerInstance: REQUESTS_PER_INSTANCE,
          reportOnly: REPORT_ONLY,
          results,
        },
        null,
        2
      )}\n`
    );

    if (!REPORT_ONLY) assertCurrentBehavior(results);
  } finally {
    await Promise.all(servers.map(stopNextServer));
    backend.closeAllConnections();
    await close(backend);
  }
}

// 처리하지 못한 실행 오류를 출력하고 CI가 실패를 감지할 수 있도록 종료 코드를 설정한다.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
