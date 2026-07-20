"use client";

import { useEffect, useState } from "react";
import type { AuditResult } from "@/types/audit";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { Card, CardHeader } from "@/components/ui/card";
import { CategoryBreakdown } from "@/components/audit/category-breakdown";
import { RecommendationCard } from "@/components/audit/recommendation-card";
import { PageSpeedPanel } from "@/components/audit/pagespeed-panel";
import {
  Loader2,
  AlertTriangle,
  FileText,
  Link2,
  Image as ImageIcon,
  Share2,
  Braces,
  ShieldCheck,
  Gauge as GaugeIcon,
  RefreshCw,
  Download,
} from "lucide-react";
import { saveAuditToHistory } from "@/lib/history";

const LOADING_STEPS = [
  "Fetching page HTML…",
  "Parsing meta tags & headings…",
  "Checking robots.txt & sitemap…",
  "Testing internal links…",
  "Scoring content quality…",
  "Generating recommendations…",
];

export function AuditResults({ url }: { url: string }) {
  const [data, setData] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  async function run() {
    setLoading(true);
    setError(null);
    setData(null);
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1));
    }, 1400);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong running this audit.");
      } else {
        setData(json as AuditResult);
        saveAuditToHistory(json as AuditResult);
      }
    } catch {
      setError("Couldn't reach the audit engine. Check your connection and try again.");
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Loader2 className="mb-6 animate-spin text-accent" size={36} />
        <h2 className="text-lg font-medium">Auditing {url}</h2>
        <p className="mt-2 text-sm text-muted">{LOADING_STEPS[stepIndex]}</p>
        <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700"
            style={{ width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-critical/10 text-critical">
          <AlertTriangle size={22} />
        </div>
        <h2 className="text-lg font-medium">Couldn&apos;t complete this audit</h2>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <button
          onClick={run}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const criticalCount = data.recommendations.filter((r) => r.severity === "critical").length;
  const warningCount = data.recommendations.filter((r) => r.severity === "warning").length;
  const passCount = data.recommendations.filter((r) => r.severity === "pass").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Audit results for</p>
          <h1 className="mt-1 break-all text-xl font-semibold sm:text-2xl">{data.url}</h1>
          <p className="mt-1 text-xs text-muted">
            Fetched {new Date(data.fetchedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={run}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground hover:bg-surface-2"
          >
            <RefreshCw size={14} /> Re-run
          </button>
          <a
            href={`/api/audit/pdf?url=${encodeURIComponent(url)}`}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            <Download size={14} /> Export PDF
          </a>
        </div>
      </div>

      {/* Score overview */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center justify-center animate-fade-up">
          <ScoreGauge score={data.overallScore} size={170} label="Overall SEO Score" />
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <div>
              <div className="font-mono text-lg font-semibold text-critical">{criticalCount}</div>
              <div className="text-[11px] text-muted">Critical</div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold text-warning">{warningCount}</div>
              <div className="text-[11px] text-muted">Warnings</div>
            </div>
            <div>
              <div className="font-mono text-lg font-semibold text-success">{passCount}</div>
              <div className="text-[11px] text-muted">Passed</div>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-up" >
          <CardHeader title="Category Breakdown" subtitle="Weighted contribution to your overall score" icon={<GaugeIcon size={16} />} />
          <CategoryBreakdown categories={data.categoryScores} />
        </Card>
      </div>

      {/* Quick facts row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <QuickFact icon={<FileText size={15} />} label="Word Count" value={data.content.wordCount.toString()} />
        <QuickFact icon={<Link2 size={15} />} label="Internal Links" value={data.links.internal.length.toString()} />
        <QuickFact icon={<ImageIcon size={15} />} label="Images Missing Alt" value={`${data.images.missingAlt}/${data.images.total}`} />
        <QuickFact icon={<ShieldCheck size={15} />} label="HTTPS" value={data.technical.https ? "Yes" : "No"} accent={data.technical.https} />
      </div>

      {/* Site Speed (real PageSpeed Insights / Core Web Vitals) */}
      <PageSpeedPanel performance={data.performance} />

      {/* Meta / Social / Schema detail cards */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Meta Tags" icon={<FileText size={16} />} />
          <dl className="space-y-3 text-sm">
            <Field label="Title" value={data.meta.title} meta={`${data.meta.titleLength} chars`} />
            <Field label="Description" value={data.meta.metaDescription} meta={`${data.meta.metaDescriptionLength} chars`} />
            <Field label="Canonical" value={data.meta.canonical} />
            <Field label="Language" value={data.meta.lang} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Social Preview" icon={<Share2 size={16} />} />
          <dl className="space-y-3 text-sm">
            <Field label="og:title" value={data.social.openGraph["og:title"] ?? null} />
            <Field label="og:description" value={data.social.openGraph["og:description"] ?? null} />
            <Field label="og:image" value={data.social.openGraph["og:image"] ?? null} />
            <Field label="Twitter Card" value={data.social.hasTwitterCard ? "Present" : null} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Structured Data" icon={<Braces size={16} />} />
          {data.schema.found ? (
            <div>
              <p className="text-sm text-success">JSON-LD detected</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.schema.types.map((t) => (
                  <span key={t} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-critical">No structured data found on this page.</p>
          )}
        </Card>
      </div>

      {/* Content Intelligence */}
      <Card className="mb-6">
        <CardHeader
          title="Content Analysis"
          subtitle={data.content.searchIntent}
          icon={<FileText size={16} />}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted">Readability</h4>
            <p className="text-2xl font-semibold">
              {data.content.readabilityScore}{" "}
              <span className="text-sm font-normal text-muted">({data.content.readabilityLabel})</span>
            </p>

            <h4 className="mb-2 mt-5 text-sm font-medium text-muted">Top Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {data.content.topKeywords.slice(0, 8).map((k) => (
                <span
                  key={k.word}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-xs"
                >
                  {k.word} <span className="text-muted">({k.density}%)</span>
                </span>
              ))}
            </div>

            {data.content.missingEntities.length > 0 && (
              <>
                <h4 className="mb-2 mt-5 text-sm font-medium text-muted">Missing Elements</h4>
                <ul className="space-y-1 text-sm text-foreground/90">
                  {data.content.missingEntities.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-critical">•</span> {m}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted">Suggested Headings</h4>
            <ul className="mb-5 space-y-1.5 text-sm text-foreground/90">
              {data.content.suggestedHeadings.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-accent">→</span> {h}
                </li>
              ))}
            </ul>

            <h4 className="mb-2 text-sm font-medium text-muted">FAQ Suggestions</h4>
            <div className="space-y-3">
              {data.content.faqSuggestions.slice(0, 3).map((f) => (
                <div key={f.question} className="rounded-lg bg-surface p-3">
                  <p className="text-sm font-medium">{f.question}</p>
                  <p className="mt-1 text-xs text-muted">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Recommendations{" "}
          <span className="text-sm font-normal text-muted">({data.recommendations.length})</span>
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.recommendations.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function QuickFact({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div
        className={`mt-2 font-mono text-xl font-semibold ${
          accent === true ? "text-success" : accent === false ? "text-critical" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  meta,
}: {
  label: string;
  value: string | null;
  meta?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        {meta && <span className="font-mono text-[11px] text-muted">{meta}</span>}
      </div>
      <dd className={`mt-0.5 break-words text-sm ${value ? "text-foreground/90" : "text-critical"}`}>
        {value ?? "Missing"}
      </dd>
    </div>
  );
}
