import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  // Allow crawlers to read noindex on account and temporary race pages.
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
