"use client";

import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

export function Portal({ children, container }: PortalProps) {
  if (typeof window === "undefined") return null;
  return createPortal(children, container ?? document.body);
}
