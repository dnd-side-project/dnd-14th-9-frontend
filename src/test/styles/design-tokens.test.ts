import { readFileSync } from "fs";
import { join } from "path";

/** 저장소 루트 기준 CSS 파일 내용을 읽는다 */
function readCss(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
}

describe("디자인 토큰 — 반경", () => {
  it("globals.css는 반경 토큰(--radius, --radius-*)을 다시 정의하지 않는다", () => {
    // Given: 앱 전역 스타일 globals.css
    const globals = readCss("src/app/globals.css");

    // When: 반경 토큰 선언을 찾으면
    const declarations = globals.match(/--radius(-\w+)?\s*:/g) ?? [];

    // Then: 없다 (shadcn 잔재가 theme.css의 반경을 덮어쓰면 rounded-lg가 12px가 아니라 10px가 된다)
    expect(declarations).toEqual([]);
  });
});
