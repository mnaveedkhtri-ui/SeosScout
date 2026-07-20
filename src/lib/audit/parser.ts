import * as cheerio from "cheerio";
import type { HeadingInfo, ImageInfo, LinkInfo } from "@/types/audit";

export function parseMeta($: cheerio.CheerioAPI) {
  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const viewport = $('meta[name="viewport"]').attr("content")?.trim() || null;
  const charset =
    $("meta[charset]").attr("charset")?.trim() ||
    $('meta[http-equiv="Content-Type"]').attr("content")?.trim() ||
    null;
  const lang = $("html").attr("lang")?.trim() || null;

  return {
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    canonical,
    viewport,
    charset,
    lang,
  };
}

export function parseHeadings($: cheerio.CheerioAPI) {
  const all: HeadingInfo[] = [];
  const counts: Record<string, number> = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };

  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
    $(tag).each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (text) {
        all.push({ tag, text });
        counts[tag]++;
      }
    });
  });

  const hierarchyIssues: string[] = [];
  if (counts.h1 === 0) hierarchyIssues.push("No H1 tag found on the page.");
  if (counts.h1 > 1)
    hierarchyIssues.push(`Multiple H1 tags found (${counts.h1}). Pages should have exactly one H1.`);
  if (counts.h2 === 0 && (counts.h3 > 0 || counts.h4 > 0))
    hierarchyIssues.push("H3/H4 tags used without any H2. Heading hierarchy is skipped.");

  return { all, h1Count: counts.h1, counts, hierarchyIssues };
}

export function parseImages($: cheerio.CheerioAPI, baseUrl: string) {
  const items: ImageInfo[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt");
    if (!src) return;
    let resolved = src;
    try {
      resolved = new URL(src, baseUrl).toString();
    } catch {
      // keep raw src if unresolvable (e.g. data URIs)
    }
    items.push({
      src: resolved,
      alt: alt ?? null,
      hasAlt: !!alt && alt.trim().length > 0,
    });
  });

  return {
    total: items.length,
    missingAlt: items.filter((i) => !i.hasAlt).length,
    items,
  };
}

export function parseLinks($: cheerio.CheerioAPI, baseUrl: string) {
  const base = new URL(baseUrl);
  const internal: LinkInfo[] = [];
  const external: LinkInfo[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, el) => {
    const hrefRaw = $(el).attr("href")?.trim();
    if (!hrefRaw) return;
    if (
      hrefRaw.startsWith("#") ||
      hrefRaw.startsWith("mailto:") ||
      hrefRaw.startsWith("tel:") ||
      hrefRaw.startsWith("javascript:")
    )
      return;

    let resolved: URL;
    try {
      resolved = new URL(hrefRaw, baseUrl);
    } catch {
      return;
    }

    const key = resolved.toString();
    if (seen.has(key)) return;
    seen.add(key);

    const text = $(el).text().trim().replace(/\s+/g, " ").slice(0, 120);
    const isInternal = resolved.hostname === base.hostname;
    const info: LinkInfo = { href: key, text: text || "(no text)", isInternal };

    if (isInternal) internal.push(info);
    else external.push(info);
  });

  return { internal, external, total: internal.length + external.length };
}

export function parseSocial($: cheerio.CheerioAPI) {
  const openGraph: Record<string, string> = {};
  const twitterCard: Record<string, string> = {};

  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr("property");
    const content = $(el).attr("content");
    if (prop && content) openGraph[prop] = content;
  });

  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr("name");
    const content = $(el).attr("content");
    if (name && content) twitterCard[name] = content;
  });

  return {
    openGraph,
    twitterCard,
    hasOgImage: !!openGraph["og:image"],
    hasTwitterCard: Object.keys(twitterCard).length > 0,
  };
}

export function parseSchema($: cheerio.CheerioAPI) {
  const raw: string[] = [];
  const types: Set<string> = new Set();

  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).contents().text().trim();
    if (!content) return;
    raw.push(content);
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const graph = item["@graph"];
        if (Array.isArray(graph)) {
          graph.forEach((g) => g["@type"] && types.add(String(g["@type"])));
        }
        if (item["@type"]) {
          if (Array.isArray(item["@type"])) {
            item["@type"].forEach((t: string) => types.add(t));
          } else {
            types.add(String(item["@type"]));
          }
        }
      }
    } catch {
      // malformed JSON-LD — still counts as "found" but couldn't extract type
    }
  });

  // Also detect microdata as a fallback signal
  const hasMicrodata = $("[itemscope]").length > 0;
  if (hasMicrodata) types.add("Microdata (itemscope detected)");

  return { found: raw.length > 0 || hasMicrodata, types: Array.from(types), raw };
}

export function extractVisibleText($: cheerio.CheerioAPI): string {
  const clone = $.root().clone();
  clone.find("script, style, noscript, svg, iframe").remove();
  return clone
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

export function countResources($: cheerio.CheerioAPI) {
  return {
    scripts: $("script[src]").length,
    stylesheets: $('link[rel="stylesheet"]').length,
    images: $("img").length,
  };
}

export function usesResponsiveUnits($: cheerio.CheerioAPI): boolean {
  const styleContent = $("style").text();
  return /(%|vw|vh|rem|clamp\()/i.test(styleContent) || $('link[rel="stylesheet"]').length > 0;
}
