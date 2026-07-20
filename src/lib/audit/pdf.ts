import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { AuditResult } from "@/types/audit";

const MARGIN = 50;
const PAGE_W = 612; // US Letter
const PAGE_H = 792;

// pdf-lib's standard fonts only support WinAnsi encoding. Scraped page text
// (titles, headings, keywords) frequently contains smart quotes, em-dashes,
// arrows, or emoji that would throw at draw time — strip/replace them.
function sanitize(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2192\u2190\u2191\u2193]/g, "->")
    .replace(/[\u2022]/g, "-")
    .replace(/[^\x00-\x7E]/g, ""); // strip anything else non-ASCII/WinAnsi-risky
}

function wrapText(rawText: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const text = sanitize(rawText);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const COLORS = {
  ink: rgb(0.05, 0.05, 0.07),
  muted: rgb(0.45, 0.46, 0.5),
  accent: rgb(0.43, 0.42, 1),
  critical: rgb(0.85, 0.24, 0.24),
  warning: rgb(0.87, 0.58, 0.09),
  success: rgb(0.13, 0.68, 0.36),
  line: rgb(0.88, 0.88, 0.9),
};

function severityColor(sev: string) {
  if (sev === "critical") return COLORS.critical;
  if (sev === "warning") return COLORS.warning;
  if (sev === "pass") return COLORS.success;
  return COLORS.muted;
}

export async function generateAuditPdf(data: AuditResult): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function newPageIfNeeded(neededSpace: number) {
    if (y - neededSpace < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  function text(
    str: string,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number; maxWidth?: number } = {}
  ) {
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const color = opts.color ?? COLORS.ink;
    const maxWidth = opts.maxWidth ?? PAGE_W - MARGIN * 2;
    const lines = wrapText(str, f, size, maxWidth);
    for (const line of lines) {
      newPageIfNeeded(size + 6);
      page.drawText(line, { x: MARGIN, y, size, font: f, color });
      y -= size + 5;
    }
    y -= opts.gap ?? 2;
  }

  function hr() {
    newPageIfNeeded(14);
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.75,
      color: COLORS.line,
    });
    y -= 14;
  }

  // --- Header ---
  page.drawText("SiteScout", { x: MARGIN, y, size: 22, font: bold, color: COLORS.accent });
  y -= 28;
  text(`Audit Report - ${data.url}`, { size: 13, f: bold, gap: 4 });
  text(`Generated ${new Date(data.fetchedAt).toLocaleString()}`, { size: 9, color: COLORS.muted, gap: 14 });

  // --- Score ---
  newPageIfNeeded(60);
  page.drawText(`${data.overallScore}`, { x: MARGIN, y: y - 30, size: 42, font: bold, color: severityColor(data.overallScore >= 80 ? "pass" : data.overallScore >= 50 ? "warning" : "critical") });
  page.drawText("/ 100  Overall SEO Score", { x: MARGIN + 80, y: y - 16, size: 12, font, color: COLORS.muted });
  y -= 60;
  hr();

  // --- Category scores ---
  text("Category Breakdown", { size: 13, f: bold, gap: 8 });
  data.categoryScores.forEach((c) => {
    newPageIfNeeded(14);
    page.drawText(sanitize(c.name), { x: MARGIN, y, size: 10, font });
    page.drawText(`${c.score}/100`, { x: PAGE_W - MARGIN - 40, y, size: 10, font: bold, color: severityColor(c.score >= 80 ? "pass" : c.score >= 50 ? "warning" : "critical") });
    y -= 16;
  });
  y -= 8;
  hr();

  // --- Key facts ---
  text("Key Facts", { size: 13, f: bold, gap: 8 });
  const facts = [
    `Title: ${data.meta.title ?? "Missing"} (${data.meta.titleLength} chars)`,
    `Meta description: ${data.meta.metaDescription ? `${data.meta.metaDescriptionLength} chars` : "Missing"}`,
    `H1 count: ${data.headings.h1Count}`,
    `Images missing alt text: ${data.images.missingAlt} / ${data.images.total}`,
    `Internal links: ${data.links.internal.length}  |  External links: ${data.links.external.length}  |  Broken: ${data.links.brokenCount}`,
    `HTTPS: ${data.technical.https ? "Yes" : "No"}  |  robots.txt: ${data.technical.robotsTxt.exists ? "Found" : "Missing"}  |  Sitemap: ${data.technical.sitemap.exists ? "Found" : "Missing"}`,
    `Word count: ${data.content.wordCount}  |  Readability: ${data.content.readabilityScore} (${data.content.readabilityLabel})`,
    `Structured data: ${data.schema.found ? `Found (${data.schema.types.join(", ") || "type unknown"})` : "Not found"}`,
  ];
  facts.forEach((f) => text(`•  ${f}`, { size: 9.5, gap: 3 }));
  y -= 8;
  hr();

  // --- Recommendations ---
  text(`Recommendations (${data.recommendations.length})`, { size: 13, f: bold, gap: 10 });
  data.recommendations.forEach((rec) => {
    newPageIfNeeded(70);
    page.drawText(rec.severity.toUpperCase(), { x: MARGIN, y, size: 8, font: bold, color: severityColor(rec.severity) });
    page.drawText(`[${rec.priority} priority]`, { x: MARGIN + 70, y, size: 8, font, color: COLORS.muted });
    y -= 13;
    text(rec.title, { size: 11, f: bold, gap: 3 });
    text(`Why it matters: ${rec.whyItMatters}`, { size: 9, color: COLORS.muted, gap: 2 });
    text(`How to fix: ${rec.howToFix}`, { size: 9, color: COLORS.muted, gap: 2 });
    text(`Expected impact: ${rec.expectedImpact}`, { size: 9, color: COLORS.muted, gap: 10 });
  });

  return doc.save();
}
