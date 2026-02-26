import type { Metadata } from "next";

import { ToastViewport } from "@/components/Toast/ToastViewport";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants/seo";
import { QueryProvider } from "@/providers/QueryProvider";

import { geistMono, geistSans, pretendard } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | 각`,
    default: `${SITE_NAME} - 모여서 각자 작업`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} - 모여서 각자 작업`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: [
      { url: "/og-image.png", width: 1200, height: 630 },
      { url: "/og-image-square.png", width: 600, height: 600 },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

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
        <QueryProvider>
          {children}
          {modal}
          <ToastViewport />
        </QueryProvider>
      </body>
    </html>
  );
}
