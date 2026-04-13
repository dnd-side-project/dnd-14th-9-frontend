import { dehydrate } from "@tanstack/react-query";

import { ToastViewport } from "@/components/Toast/ToastViewport";
import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { getServerAuthCookieState } from "@/lib/auth/auth-cookie-state";
import { getQueryClient } from "@/lib/getQueryClient";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import { rootMetadata } from "@/lib/seo/metadata";
import { AuthStateProvider } from "@/providers/AuthStateProvider";
import { QueryProvider } from "@/providers/QueryProvider";

import { geistMono, geistSans, pretendard } from "./fonts";
import "./globals.css";

export const metadata = rootMetadata;

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const { hasAuthCookies } = await getServerAuthCookieState();

  if (hasAuthCookies) {
    try {
      await queryClient.prefetchQuery(memberQueries.me());
    } catch {
      queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
    }
  }

  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} bg-background-default font-sans antialiased`}
      >
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <QueryProvider dehydratedState={dehydrate(queryClient)}>
          <AuthStateProvider hasAuthCookies={hasAuthCookies}>
            {children}
            {modal}
            <ToastViewport />
          </AuthStateProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
