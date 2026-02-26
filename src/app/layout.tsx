import { ToastViewport } from "@/components/Toast/ToastViewport";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import { rootMetadata } from "@/lib/seo/metadata";
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
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} bg-background-default font-sans antialiased`}
      >
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <QueryProvider>
          {children}
          {modal}
          <ToastViewport />
        </QueryProvider>
      </body>
    </html>
  );
}
