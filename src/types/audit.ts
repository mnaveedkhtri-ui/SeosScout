// Core type definitions for the SiteScout audit engine.
// Every field here is populated from REAL analysis of the fetched page —
// nothing in this shape is placeholder/mock data.

import type { PageSpeedResult } from "@/lib/audit/pagespeed";

export type Severity = "critical" | "warning" | "info" | "pass";

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  severity: Severity;
  whyItMatters: string;
  howToFix: string;
  expectedImpact: string;
  priority: "high" | "medium" | "low";
}

export interface HeadingInfo {
  tag: string; // h1..h6
  text: string;
}

export interface ImageInfo {
  src: string;
  alt: string | null;
  hasAlt: boolean;
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isBroken?: boolean;
  statusCode?: number;
}

export interface CategoryScore {
  name: string;
  score: number; // 0-100
  maxScore: number;
  weight: number;
}

export interface AuditResult {
  url: string;
  fetchedAt: string;
  overallScore: number;
  categoryScores: CategoryScore[];

  meta: {
    title: string | null;
    titleLength: number;
    metaDescription: string | null;
    metaDescriptionLength: number;
    canonical: string | null;
    viewport: string | null;
    charset: string | null;
    lang: string | null;
  };

  headings: {
    all: HeadingInfo[];
    h1Count: number;
    counts: Record<string, number>;
    hierarchyIssues: string[];
  };

  images: {
    total: number;
    missingAlt: number;
    items: ImageInfo[];
  };

  links: {
    total: number;
    internal: LinkInfo[];
    external: LinkInfo[];
    brokenCount: number;
    brokenLinks: LinkInfo[];
  };

  social: {
    openGraph: Record<string, string>;
    twitterCard: Record<string, string>;
    hasOgImage: boolean;
    hasTwitterCard: boolean;
  };

  schema: {
    found: boolean;
    types: string[];
    raw: string[];
  };

  technical: {
    robotsTxt: { exists: boolean; url: string; content: string | null; disallowsAll: boolean };
    sitemap: { exists: boolean; url: string | null };
    https: boolean;
    securityHeaders: {
      strictTransportSecurity: boolean;
      xContentTypeOptions: boolean;
      xFrameOptions: boolean;
      contentSecurityPolicy: boolean;
      referrerPolicy: boolean;
    };
    pageSizeBytes: number;
    pageSizeKb: number;
    requestsEstimate: {
      scripts: number;
      stylesheets: number;
      images: number;
    };
    mobileFriendly: {
      hasViewportMeta: boolean;
      usesResponsiveUnits: boolean;
    };
  };

  performance: {
    ttfbMs: number;
    totalLoadMs: number;
    estimatedLcpMs: number;
    estimatedClsRisk: "low" | "medium" | "high";
    domSizeEstimate: number;
    note: string;
    // Real Core Web Vitals + Lighthouse scores from the Google PageSpeed
    // Insights API (same engine as pagespeed.web.dev). Null if the PSI
    // call failed or timed out — the heuristic fields above still apply
    // as a fallback in that case. See pageSpeedMobileError/DesktopError.
    pageSpeed: PageSpeedResult | null;
    pageSpeedMobileError: string | null;
    pageSpeedDesktopError: string | null;
  };

  content: {
    wordCount: number;
    readabilityScore: number; // Flesch Reading Ease
    readabilityLabel: string;
    topKeywords: { word: string; count: number; density: number }[];
    suggestedHeadings: string[];
    suggestedKeywords: string[];
    faqSuggestions: { question: string; answer: string }[];
    contentQualityScore: number;
    searchIntent: string;
    missingEntities: string[];
  };

  recommendations: Recommendation[];
}
