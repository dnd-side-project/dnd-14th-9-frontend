"use client";

import { type ReactNode, useEffect, useState } from "react";

import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

const isMockEnabled = isMockModeEnabled();

async function startWorker() {
  const { worker } = await import("@/mocks/browser");
  const { strictUnhandledApiRequest } = await import("@/mocks/unhandled-request");
  await worker.start({ onUnhandledRequest: strictUnhandledApiRequest });
}

interface MockProviderProps {
  children: ReactNode;
}

export function MockProvider({ children }: MockProviderProps) {
  const [ready, setReady] = useState(!isMockEnabled);

  useEffect(() => {
    if (!isMockEnabled) return;
    startWorker().then(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
