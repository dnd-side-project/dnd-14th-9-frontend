import { renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { useHasAuthMarker } from "@/features/auth/hooks/useHasAuthMarker";
import { AUTH_MARKER_COOKIE } from "@/lib/auth/cookie-constants";

function clearCookies() {
  for (const cookie of document.cookie.split("; ")) {
    const [name] = cookie.split("=");
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  }
}

describe("useHasAuthMarker", () => {
  afterEach(() => {
    clearCookies();
  });

  it("마커 쿠키가 있으면 true여야 한다", () => {
    document.cookie = `${AUTH_MARKER_COOKIE}=1; path=/`;

    const { result } = renderHook(() => useHasAuthMarker());

    expect(result.current).toBe(true);
  });

  it("마커 쿠키가 없으면 false여야 한다", () => {
    document.cookie = `other${AUTH_MARKER_COOKIE}=1; path=/`;

    const { result } = renderHook(() => useHasAuthMarker());

    expect(result.current).toBe(false);
  });

  it("서버 렌더에서는 판단 불가(null)여야 한다", () => {
    document.cookie = `${AUTH_MARKER_COOKIE}=1; path=/`;
    function Probe() {
      return <>{String(useHasAuthMarker())}</>;
    }

    expect(renderToString(<Probe />)).toBe("null");
  });
});
