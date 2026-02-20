"use client";

import { useSyncExternalStore } from "react";

import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

const emptySubscribe = () => () => {};

export function Portal({ children, container }: PortalProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true, // 클라이언트
    () => false // 서버 (SSR)
  );

  if (!isMounted) return null;
  return createPortal(children, container ?? document.body);
}
