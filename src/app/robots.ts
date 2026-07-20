import type { MetadataRoute } from "next";

// TODO: keep this in sync with the domain set in src/app/layout.tsx.
const SITE_URL = "https://sitescout.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/reports", "/settings"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
