import * as cheerio from "cheerio";
import { fetchPage } from "./fetcher";
import {
  parseMeta,
  parseHeadings,
  parseImages,
  parseLinks,
  parseSocial,
  parseSchema,
  extractVisibleText,
  countResources,
  usesResponsiveUnits,
} from "./parser";
import { checkRobotsTxt, checkSitemap, checkSecurityHeaders, checkBrokenLinks } from "./technical";
import { fetchPageSpeed } from "./pagespeed";
import {
  fleschReadingEase,
  extractKeywords,
  estimateSearchIntent,
  suggestHeadings,
  suggestKeywords,
  generateFaqSuggestions,
  detectMissingEntities,
  contentQualityScore,
} from "./content";
import { computeOverallScore } from "./scoring";
import { generateRecommendations } from "./recommendations";
import type { AuditResult } from "@/types/audit";

export async function runAudit(inputUrl: string): Promise<AuditResult> {
  const page = await fetchPage(inputUrl);
  const $ = cheerio.load(page.html);
  const baseUrl = page.finalUrl;

  const meta = parseMeta($);
  const headings = parseHeadings($);
  const images = parseImages($, baseUrl);
  const linksParsed = parseLinks($, baseUrl);
  const social = parseSocial($);
  const schema = parseSchema($);
  const resources = countResources($);
  const responsive = usesResponsiveUnits($);
  const visibleText = extractVisibleText($);

  // --- Technical checks + real PageSpeed Insights, run in parallel ---
  // (robots.txt -> sitemap -> broken links is a dependent chain, but none
  // of it depends on the PSI call, so we kick that off at the same time.)
  const technicalChain = (async () => {
    const robotsTxt = await checkRobotsTxt(baseUrl);
    const sitemap = await checkSitemap(baseUrl, robotsTxt.content);
    const brokenChecked = await checkBrokenLinks(linksParsed.internal.slice(0, 15));
    return { robotsTxt, sitemap, brokenChecked };
  })();

  const pageSpeedPromise = fetchPageSpeed(baseUrl).catch((err) => ({
    fetchedAt: new Date().toISOString(),
    mobile: null,
    desktop: null,
    mobileError: err instanceof Error ? err.message : "PageSpeed Insights request failed.",
    desktopError: err instanceof Error ? err.message : "PageSpeed Insights request failed.",
  }));

  const [{ robotsTxt, sitemap, brokenChecked }, pageSpeed] = await Promise.all([
    technicalChain,
    pageSpeedPromise,
  ]);

  const allInternalChecked = [...brokenChecked, ...linksParsed.internal.slice(15)];
  const brokenLinks = allInternalChecked.filter((l) => l.isBroken);

  const https = new URL(baseUrl).protocol === "https:";
  const securityHeaders = checkSecurityHeaders(page.headers);

  const technical: AuditResult["technical"] = {
    robotsTxt,
    sitemap,
    https,
    securityHeaders,
    pageSizeBytes: page.sizeBytes,
    pageSizeKb: Math.round(page.sizeBytes / 1024),
    requestsEstimate: resources,
    mobileFriendly: {
      hasViewportMeta: !!meta.viewport,
      usesResponsiveUnits: responsive,
    },
  };

  // --- Performance estimation (heuristic, not a real browser trace) ---
  const domSizeEstimate = $("*").length;
  let clsRisk: "low" | "medium" | "high" = "low";
  if (images.total > 10 && !meta.viewport) clsRisk = "high";
  else if (images.total > 5) clsRisk = "medium";

  const performance: AuditResult["performance"] = {
    ttfbMs: page.ttfbMs,
    totalLoadMs: page.totalMs,
    estimatedLcpMs: Math.round(page.totalMs * 1.4 + resources.images * 15),
    estimatedClsRisk: clsRisk,
    domSizeEstimate,
    note:
      pageSpeed.mobile || pageSpeed.desktop
        ? "Core Web Vitals and the performance score below are real, from the Google PageSpeed Insights API (the same engine behind pagespeed.web.dev). The estimatedLcpMs/estimatedClsRisk fields are a lightweight fallback only used when PSI is unavailable."
        : "PageSpeed Insights was unavailable for this run, so performance figures are estimated from raw HTML fetch timing and static analysis instead. Treat as directional. See pageSpeedMobileError/pageSpeedDesktopError.",
    pageSpeed: pageSpeed.mobile || pageSpeed.desktop ? pageSpeed : null,
    pageSpeedMobileError: pageSpeed.mobileError,
    pageSpeedDesktopError: pageSpeed.desktopError,
  };

  // --- Content analysis ---
  const wordCount = visibleText.split(/\s+/).filter(Boolean).length;
  const readability = fleschReadingEase(visibleText);
  const topKeywords = extractKeywords(visibleText, 12);
  const h1Text = headings.all.find((h) => h.tag === "h1")?.text ?? "";

  const content: AuditResult["content"] = {
    wordCount,
    readabilityScore: readability.score,
    readabilityLabel: readability.label,
    topKeywords,
    suggestedHeadings: suggestHeadings(topKeywords, h1Text),
    suggestedKeywords: suggestKeywords(topKeywords),
    faqSuggestions: generateFaqSuggestions(topKeywords, meta.title),
    contentQualityScore: contentQualityScore({
      wordCount,
      readability: readability.score,
      h1Count: headings.h1Count,
      hasMetaDescription: !!meta.metaDescription,
      imageAltRatio: images.total > 0 ? (images.total - images.missingAlt) / images.total : 1,
    }),
    searchIntent: estimateSearchIntent(
      meta.title,
      headings.all.map((h) => h.text),
      topKeywords.map((k) => k.word)
    ),
    missingEntities: detectMissingEntities(visibleText, meta.title),
  };

  const links: AuditResult["links"] = {
    total: linksParsed.total,
    internal: allInternalChecked,
    external: linksParsed.external,
    brokenCount: brokenLinks.length,
    brokenLinks,
  };

  const partial = {
    url: inputUrl,
    fetchedAt: new Date().toISOString(),
    meta,
    headings,
    images,
    links,
    social,
    schema,
    technical,
    performance,
    content,
  };

  const { overallScore, categoryScores } = computeOverallScore(partial);
  const recommendations = generateRecommendations(partial);

  return {
    ...partial,
    overallScore,
    categoryScores,
    recommendations,
  };
}
