"use client";

import { useEffect } from "react";

const DEFAULT_FAVICON = "/favicon.ico";
const RED_FAVICON = "/favicon-red.ico";

export function useDynamicFavicon(isUrgent: boolean) {
  useEffect(() => {
    const iconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!iconLink) return;

    iconLink.href = isUrgent ? RED_FAVICON : DEFAULT_FAVICON;

    return () => {
      iconLink.href = DEFAULT_FAVICON;
    };
  }, [isUrgent]);
}
