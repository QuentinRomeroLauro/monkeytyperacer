import type { Metadata } from "next";
export const siteUrl = "https://monkeytyperacer.com";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Monkeytype Racer",
      type: "website",
      images: [
        {
          url: "/social-card",
          width: 1200,
          height: 630,
          alt: "Monkeytype Racer — a little friendly competition",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social-card"],
    },
  };
}
