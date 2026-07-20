import type { MetadataRoute } from "next";

// TODO: keep this in sync with the domain set in src/app/layout.tsx.
const SITE_URL = "https://seos-scout.vercel.app/";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/audit", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.7, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
    { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
