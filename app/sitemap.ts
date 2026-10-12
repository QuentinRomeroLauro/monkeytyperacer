import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { guides } from "@/lib/guides";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/practice",
    "/about",
    "/licenses",
    "/leaderboards",
    "/guides",
    "/typing-race-with-friends",
    "/1-minute-typing-test",
    "/quote-typing-practice",
    "/privacy",
    "/terms",
    "/security",
    ...guides.map((g) => `/guides/${g.slug}`),
  ].map((path) => ({ url: `${siteUrl}${path}` }));
}
