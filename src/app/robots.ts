import type { MetadataRoute } from "next";

const SITE_URL = "https://seos-scout.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/settings", "/reports", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
