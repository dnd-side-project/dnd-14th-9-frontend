"use client";

import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: Element;
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 감지를 위한 의도적 패턴
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, container ?? document.body);
}
