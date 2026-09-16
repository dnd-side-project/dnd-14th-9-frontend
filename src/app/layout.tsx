import { ToastViewport } from "@/components/Toast/ToastViewport";
import GoogleAnalytics from "@/lib/GoogleAnalytics";
import { rootMetadata } from "@/lib/seo/metadata";
import { MockProvider } from "@/providers/MockProvider";
import { QueryProvider } from "@/providers/QueryProvider";

import { geistMono, geistSans, pretendard } from "./fonts";
import "./globals.css";
import { PretendardFontLoader } from "./PretendardFontLoader";

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
        <PretendardFontLoader />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
        ) : null}
        <MockProvider>
          <QueryProvider>
            {children}
            {modal}
            <ToastViewport />
          </QueryProvider>
        </MockProvider>
      </body>
    </html>
  );
}
