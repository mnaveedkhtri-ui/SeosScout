import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
const SITE_URL = "https://seos-scout.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SiteScout | Free SEO Audit Tool — Technical, Content & Speed Checks",
    template: "%s | SiteScout",
  },
  description:
    "Run a full technical, content, and performance SEO audit on any URL, free, no signup required. Get a 0-100 score, prioritized fixes, real Core Web Vitals, and a downloadable PDF report.",
  keywords: [
    "free seo audit tool",
    "seo checker",
    "website seo audit",
    "core web vitals checker",
    "seo score checker",
    "technical seo audit",
  ],
  authors: [{ name: "SiteScout" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "wYFUIXoVNRkPCSeAExJZhbNGbE9pcbuFswY8d8GCIdw",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SiteScout",
    title: "SiteScout | Free SEO Audit Tool",
    description:
      "Run a full technical, content, and performance SEO audit on any URL, free, no signup required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteScout | Free SEO Audit Tool",
    description:
      "Run a full technical, content, and performance SEO audit on any URL, free, no signup required.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08090b] text-zinc-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
