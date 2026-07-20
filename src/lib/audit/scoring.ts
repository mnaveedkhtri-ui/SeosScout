import type { AuditResult, CategoryScore } from "@/types/audit";

// Category weights sum to 100. Each category score is 0-100 internally,
// then weighted down into its contribution to the overall score.
const WEIGHTS = {
  meta: 15,
  headings: 10,
  content: 15,
  images: 8,
  links: 8,
  social: 7,
  schema: 7,
  technical: 20,
  performance: 10,
};

export function scoreMeta(meta: AuditResult["meta"]): number {
  let score = 0;
  if (meta.title) {
    score += 20;
    if (meta.titleLength >= 30 && meta.titleLength <= 60) score += 20;
    else if (meta.titleLength > 0) score += 8;
  }
  if (meta.metaDescription) {
    score += 20;
    if (meta.metaDescriptionLength >= 70 && meta.metaDescriptionLength <= 160) score += 20;
    else score += 8;
  }
  if (meta.canonical) score += 10;
  if (meta.viewport) score += 5;
  if (meta.lang) score += 5;
  return Math.min(100, score);
}

export function scoreHeadings(headings: AuditResult["headings"]): number {
  let score = 100;
  if (headings.h1Count === 0) score -= 40;
  if (headings.h1Count > 1) score -= 20;
  if (headings.counts.h2 === 0 && headings.all.length > 3) score -= 15;
  score -= headings.hierarchyIssues.length * 5;
  return Math.max(0, Math.min(100, score));
}

export function scoreImages(images: AuditResult["images"]): number {
  if (images.total === 0) return 100; // nothing to penalize
  const ratio = (images.total - images.missingAlt) / images.total;
  return Math.round(ratio * 100);
}

export function scoreLinks(links: AuditResult["links"]): number {
  let score = 100;
  if (links.internal.length === 0) score -= 30;
  if (links.external.length === 0) score -= 10;
  if (links.total > 0) {
    const brokenRatio = links.brokenCount / Math.min(links.total, 15);
    score -= Math.round(brokenRatio * 50);
  }
  return Math.max(0, Math.min(100, score));
}

export function scoreSocial(social: AuditResult["social"]): number {
  let score = 0;
  const ogKeys = Object.keys(social.openGraph);
  if (ogKeys.includes("og:title")) score += 20;
  if (ogKeys.includes("og:description")) score += 20;
  if (social.hasOgImage) score += 20;
  if (ogKeys.includes("og:url")) score += 10;
  if (social.hasTwitterCard) score += 30;
  return Math.min(100, score);
}

export function scoreSchema(schema: AuditResult["schema"]): number {
  if (!schema.found) return 0;
  let score = 60;
  if (schema.types.length > 0) score += 20;
  if (schema.types.length > 1) score += 20;
  return Math.min(100, score);
}

export function scoreTechnical(technical: AuditResult["technical"]): number {
  let score = 0;
  if (technical.https) score += 25;
  if (technical.robotsTxt.exists) score += 10;
  if (!technical.robotsTxt.disallowsAll) score += 10;
  else score -= 20;
  if (technical.sitemap.exists) score += 15;

  const headerChecks = Object.values(technical.securityHeaders);
  const headerScore = (headerChecks.filter(Boolean).length / headerChecks.length) * 25;
  score += headerScore;

  if (technical.pageSizeKb < 2000) score += 10;
  else if (technical.pageSizeKb < 5000) score += 5;

  if (technical.mobileFriendly.hasViewportMeta) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scorePerformance(performance: AuditResult["performance"]): number {
  // Prefer the real Lighthouse performance score from PageSpeed Insights,
  // weighted mobile-first (75/25) to match Google's mobile-first indexing.
  const ps = performance.pageSpeed;
  if (ps && (ps.mobile || ps.desktop)) {
    const entries: Array<[number, number]> = [];
    if (ps.mobile) entries.push([ps.mobile.performanceScore, 0.75]);
    if (ps.desktop) entries.push([ps.desktop.performanceScore, 0.25]);
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    const weighted = entries.reduce((sum, [s, w]) => sum + s * w, 0) / totalWeight;
    return Math.round(weighted);
  }

  // Fallback heuristic — only used when PSI was unavailable for this run.
  let score = 100;
  if (performance.ttfbMs > 600) score -= 25;
  else if (performance.ttfbMs > 300) score -= 12;

  if (performance.totalLoadMs > 3000) score -= 25;
  else if (performance.totalLoadMs > 1500) score -= 12;

  if (performance.estimatedClsRisk === "high") score -= 20;
  else if (performance.estimatedClsRisk === "medium") score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function scoreContent(content: AuditResult["content"]): number {
  return content.contentQualityScore;
}

export function computeOverallScore(
  raw: Omit<AuditResult, "overallScore" | "categoryScores" | "recommendations">
): { overallScore: number; categoryScores: CategoryScore[] } {
  const scores: Record<keyof typeof WEIGHTS, number> = {
    meta: scoreMeta(raw.meta),
    headings: scoreHeadings(raw.headings),
    content: scoreContent(raw.content),
    images: scoreImages(raw.images),
    links: scoreLinks(raw.links),
    social: scoreSocial(raw.social),
    schema: scoreSchema(raw.schema),
    technical: scoreTechnical(raw.technical),
    performance: scorePerformance(raw.performance),
  };

  const categoryScores: CategoryScore[] = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map(
    (key) => ({
      name: key,
      score: scores[key],
      maxScore: 100,
      weight: WEIGHTS[key],
    })
  );

  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const weightedSum = categoryScores.reduce(
    (sum, c) => sum + (c.score / 100) * c.weight,
    0
  );

  const overallScore = Math.round((weightedSum / totalWeight) * 100);

  return { overallScore, categoryScores };
}
