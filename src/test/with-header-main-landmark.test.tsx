import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import FeedbackPage from "@/app/(with-header)/feedback/page";
import SessionEditPage from "@/app/(with-header)/session/[sessionId]/edit/page";
import SessionCreatePage from "@/app/(with-header)/session/create/page";

jest.mock("@/features/session/components/SessionCreateForm", () => ({
  SessionCreateForm: () => null,
}));

jest.mock("@/features/session/components/SessionEditContent", () => ({
  SessionEditContent: () => null,
}));

jest.mock("@/features/session/server/get-session-detail", () => ({
  getSessionDetail: jest.fn().mockResolvedValue({}),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const pages = [
  ["feedback", async () => <FeedbackPage />],
  ["session/create", async () => <SessionCreatePage />],
  [
    "session/[sessionId]/edit",
    () => SessionEditPage({ params: Promise.resolve({ sessionId: "1" }) }),
  ],
] as const;

describe("(with-header) 페이지 main landmark", () => {
  // (with-header)/layout.tsx가 이미 <main>으로 children을 감싸므로 페이지는 <main>을 만들면 안 된다.
  it.each(pages)(
    "%s 페이지는 layout main 안에 중첩될 main을 렌더하지 않는다",
    async (_name, renderPage) => {
      const { container } = render(await renderPage(), { wrapper: Wrapper });

      expect(container).not.toBeEmptyDOMElement();
      expect(container.querySelector("main")).toBeNull();
    }
  );
});
