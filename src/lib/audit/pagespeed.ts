// Real Core Web Vitals via the Google PageSpeed Insights API (v5) — the
// exact same API that powers https://pagespeed.web.dev/. Works without an
// API key (shared, rate-limited quota) or with a free key for higher limits
// — see PAGESPEED_API_KEY in README.

export type CwvRating = "good" | "needs-improvement" | "poor";

export interface CoreWebVital {
  value: number; // ms for timing metrics, unitless score for CLS
  displayValue: string;
  rating: CwvRating;
}

export interface PageSpeedStrategyResult {
  performanceScore: number; // 0-100, Lighthouse lab score
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  labData: {
    fcp: CoreWebVital;
    lcp: CoreWebVital;
    cls: CoreWebVital;
    tbt: CoreWebVital;
    speedIndex: CoreWebVital;
  };
  fieldData: {
    available: boolean;
    overallCategory: "FAST" | "AVERAGE" | "SLOW" | null;
    lcp: CoreWebVital | null;
    inp: CoreWebVital | null;
    cls: CoreWebVital | null;
    fcp: CoreWebVital | null;
    ttfb: CoreWebVital | null;
  };
  finalUrl: string;
}

export interface PageSpeedResult {
  fetchedAt: string;
  mobile: PageSpeedStrategyResult | null;
  desktop: PageSpeedStrategyResult | null;
  mobileError: string | null;
  desktopError: string | null;
}

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Short-lived in-memory cache so repeat runs against the same URL (retries,
// dashboard refreshes, someone re-testing during a demo) don't burn through
// the daily quota for no reason. Resets on server restart/deploy — that's
// fine, it only exists to soften bursts, not to persist data.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { at: number; result: PageSpeedStrategyResult }>();

function cacheKey(url: string, strategy: "mobile" | "desktop") {
  return `${strategy}:${url}`;
}

// Turns Google's raw API error (which exposes internal project numbers,
// service names, etc.) into a clean, presentable message. The technical
// detail is still logged server-side for debugging.
function friendlyPsiError(raw: string, strategy: "mobile" | "desktop"): string {
  const lower = raw.toLowerCase();
  if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted")) {
    return `Site speed testing is at capacity right now. Please try this ${strategy} test again in a few minutes.`;
  }
  if (lower.includes("invalid") && lower.includes("url")) {
    return "That URL couldn't be reached for a speed test. Double-check it's publicly accessible and try again.";
  }
  if (lower.includes("too long") || lower.includes("timed out") || lower.includes("timeout")) {
    return `The ${strategy} speed test took too long to complete. The site may be slow to respond right now, try again shortly.`;
  }
  return `The ${strategy} speed test couldn't be completed right now. Please try again in a few minutes.`;
}

// Google's official good / needs-improvement / poor thresholds.
// https://web.dev/articles/defining-core-web-vitals-thresholds
const THRESHOLDS: Record<string, [number, number]> = {
  lcp: [2500, 4000], // ms
  inp: [200, 500], // ms
  cls: [0.1, 0.25], // unitless
  fcp: [1800, 3000], // ms
  ttfb: [800, 1800], // ms
  tbt: [200, 600], // ms (lab-only proxy, not an official CWV)
  si: [3400, 5800], // ms (Speed Index, lab-only)
};

function rate(metric: keyof typeof THRESHOLDS, value: number): CwvRating {
  const [good, poor] = THRESHOLDS[metric];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function labMetric(
  audits: Record<string, { numericValue?: number; displayValue?: string }>,
  auditId: string,
  metric: keyof typeof THRESHOLDS
): CoreWebVital {
  const audit = audits[auditId];
  const value = audit?.numericValue ?? 0;
  return {
    value: Math.round(value * 100) / 100,
    displayValue: audit?.displayValue ?? "N/A",
    rating: rate(metric, value),
  };
}

interface CruxMetric {
  percentile: number;
  category: "FAST" | "AVERAGE" | "SLOW";
}

function fieldMetric(
  metrics: Record<string, CruxMetric> | undefined,
  key: string,
  metric: keyof typeof THRESHOLDS,
  divideBy = 1,
  unit = "ms"
): CoreWebVital | null {
  const m = metrics?.[key];
  if (!m) return null;
  const value = m.percentile / divideBy;
  return {
    value: Math.round(value * 100) / 100,
    displayValue: unit === "ms" ? `${Math.round(value)} ms` : value.toFixed(2),
    rating: rate(metric, value),
  };
}

function parsePsiResponse(json: {
  lighthouseResult?: {
    finalUrl?: string;
    categories?: Record<string, { score: number | null }>;
    audits?: Record<string, { numericValue?: number; displayValue?: string }>;
  };
  loadingExperience?: {
    overall_category?: "FAST" | "AVERAGE" | "SLOW";
    metrics?: Record<string, CruxMetric>;
  };
}): PageSpeedStrategyResult {
  const lh = json.lighthouseResult;
  const audits = lh?.audits ?? {};
  const categories = lh?.categories ?? {};
  const toScore = (c?: { score: number | null }) =>
    c?.score == null ? null : Math.round(c.score * 100);

  const fieldMetrics = json.loadingExperience?.metrics;
  const fieldAvailable = !!fieldMetrics && Object.keys(fieldMetrics).length > 0;

  return {
    performanceScore: toScore(categories.performance) ?? 0,
    seoScore: toScore(categories.seo),
    accessibilityScore: toScore(categories.accessibility),
    bestPracticesScore: toScore(categories["best-practices"]),
    labData: {
      fcp: labMetric(audits, "first-contentful-paint", "fcp"),
      lcp: labMetric(audits, "largest-contentful-paint", "lcp"),
      cls: labMetric(audits, "cumulative-layout-shift", "cls"),
      tbt: labMetric(audits, "total-blocking-time", "tbt"),
      speedIndex: labMetric(audits, "speed-index", "si"),
    },
    fieldData: {
      available: fieldAvailable,
      overallCategory: json.loadingExperience?.overall_category ?? null,
      lcp: fieldMetric(fieldMetrics, "LARGEST_CONTENTFUL_PAINT_MS", "lcp"),
      inp: fieldMetric(fieldMetrics, "INTERACTION_TO_NEXT_PAINT", "inp"),
      cls: fieldMetric(fieldMetrics, "CUMULATIVE_LAYOUT_SHIFT_SCORE", "cls", 100, "unitless"),
      fcp: fieldMetric(fieldMetrics, "FIRST_CONTENTFUL_PAINT_MS", "fcp"),
      ttfb: fieldMetric(fieldMetrics, "EXPERIMENTAL_TIME_TO_FIRST_BYTE", "ttfb"),
    },
    finalUrl: lh?.finalUrl ?? "",
  };
}

async function runPsi(
  url: string,
  strategy: "mobile" | "desktop",
  timeoutMs = 45000
): Promise<PageSpeedStrategyResult> {
  const key = cacheKey(url, strategy);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.result;
  }

  const apiKey = process.env.PAGESPEED_API_KEY;
  const params = new URLSearchParams({ url, strategy });
  params.append("category", "performance");
  params.append("category", "seo");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  if (apiKey) params.set("key", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const rawMsg =
        body?.error?.message ?? `PageSpeed Insights API returned ${res.status} for ${strategy}.`;
      // Keep the raw detail server-side for debugging; never surface it to the UI.
      console.error(`[pagespeed:${strategy}]`, rawMsg);
      throw new Error(friendlyPsiError(rawMsg, strategy));
    }
    const json = await res.json();
    const parsed = parsePsiResponse(json);
    cache.set(key, { at: Date.now(), result: parsed });
    return parsed;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(friendlyPsiError("timed out", strategy));
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Runs a real PageSpeed Insights audit (mobile + desktop, in parallel) —
 * the same engine behind https://pagespeed.web.dev/. Returns whatever
 * succeeded even if one strategy fails, so a slow/blocked desktop check
 * doesn't take down the mobile result (or vice versa).
 */
export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const fetchedAt = new Date().toISOString();
  const [mobileSettled, desktopSettled] = await Promise.allSettled([
    runPsi(url, "mobile"),
    runPsi(url, "desktop"),
  ]);

  return {
    fetchedAt,
    mobile: mobileSettled.status === "fulfilled" ? mobileSettled.value : null,
    desktop: desktopSettled.status === "fulfilled" ? desktopSettled.value : null,
    mobileError:
      mobileSettled.status === "rejected" ? String(mobileSettled.reason?.message ?? mobileSettled.reason) : null,
    desktopError:
      desktopSettled.status === "rejected"
        ? String(desktopSettled.reason?.message ?? desktopSettled.reason)
        : null,
  };
}
