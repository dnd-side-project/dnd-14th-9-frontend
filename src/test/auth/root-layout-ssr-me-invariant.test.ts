import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("RootLayout SSR me invariant", () => {
  const source = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");

  it.each([
    "memberQueries",
    "prepareAuthMeQuery",
    "resolveServerAuthHint",
    "getServerAuthCookieState",
    "/members/me/profile",
  ])("layout.tsx는 %s를 참조하지 않아야 한다", (needle) => {
    expect(source).not.toContain(needle);
  });
});
