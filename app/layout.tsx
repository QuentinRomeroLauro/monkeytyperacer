import { siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/context";
import { Analytics } from "@/components/analytics";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Monkeytype Racer | Quote races with friends", template: "%s | Monkeytype Racer" },
  description: "Race quotes with real people, invite friends to private races, and practice your typing in a calm, customizable workspace.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon-roadster.svg?v=2", type: "image/svg+xml", sizes: "any" },
      { url: "/brand/favicon-32.png?v=2", type: "image/png", sizes: "32x32" },
    ],
    apple: { url: "/brand/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <Analytics />
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
