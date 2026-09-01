"use client";

import { useEffect } from "react";

export function PretendardFontLoader() {
  useEffect(() => {
    const activate = () => document.body.classList.add("pretendard-ready");
    const stylesheet = document.createElement("link");

    stylesheet.rel = "stylesheet";
    stylesheet.href = "/fonts/pretendard/pretendardvariable-dynamic-subset.css";
    stylesheet.onload = activate;
    stylesheet.onerror = activate;
    document.head.append(stylesheet);
  }, []);

  return null;
}
