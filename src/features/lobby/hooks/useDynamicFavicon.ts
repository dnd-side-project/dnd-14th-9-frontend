"use client";

import { useEffect } from "react";

import { FAVICON_DEFAULT, FAVICON_URGENT } from "@/lib/constants/assets";

export function useDynamicFavicon(isUrgent: boolean) {
  useEffect(() => {
    const iconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!iconLink) return;

    iconLink.href = isUrgent ? FAVICON_URGENT : FAVICON_DEFAULT;

    return () => {
      iconLink.href = FAVICON_DEFAULT;
    };
  }, [isUrgent]);
}
