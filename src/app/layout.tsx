import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const SITE_URL = "https://seos-scout.vercel.app";
const SITE_NAME = "SiteScout";
const DEFAULT_TITLE = "SiteScout | Free SEO Audit Tool for Technical, Content & On-Page SEO";
const DEFAULT_DESCRIPTION =
  "Run a full technical, content, and on-page SEO audit on any website in under a minute. Get a 0 to 100 score, prioritized fixes, and shareable reports, completely free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | SiteScout",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "free seo audit tool",
    "seo audit",
    "website seo checker",
    "technical seo audit",
    "on-page seo checker",
    "seo score",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "XKqDOIporTLwhEyizWES5BzLGewgVKX3ymxqUbKwjvE",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SiteScout, Free SEO Audit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "SiteScout",
      applicationCategory: "SEO Tool",
      operatingSystem: "Web",
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.png`,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08090b] text-zinc-100 font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
