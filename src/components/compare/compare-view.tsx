"use client";

import { useState } from "react";
import type { AuditResult } from "@/types/audit";
import { Card, CardHeader } from "@/components/ui/card";
import { Plus, X, Loader2, Users, Trophy } from "lucide-react";

interface Row {
  url: string;
  result: AuditResult | null;
  error: string | null;
  loading: boolean;
}

const METRICS: { key: string; label: string; get: (r: AuditResult) => string | number }[] = [
  { key: "score", label: "SEO Score", get: (r) => r.overallScore },
  { key: "words", label: "Content Length (words)", get: (r) => r.content.wordCount },
  { key: "readability", label: "Readability", get: (r) => `${r.content.readabilityScore} (${r.content.readabilityLabel})` },
  { key: "h1", label: "H1 Count", get: (r) => r.headings.h1Count },
  { key: "headings", label: "Total Headings", get: (r) => r.headings.all.length },
  { key: "meta", label: "Meta Description", get: (r) => (r.meta.metaDescription ? "Present" : "Missing") },
  { key: "https", label: "HTTPS", get: (r) => (r.technical.https ? "Yes" : "No") },
  { key: "schema", label: "Structured Data", get: (r) => (r.schema.found ? "Found" : "Missing") },
  { key: "images", label: "Images Missing Alt", get: (r) => `${r.images.missingAlt}/${r.images.total}` },
  { key: "internal", label: "Internal Links", get: (r) => r.links.internal.length },
];

export function CompareView() {
  const [rows, setRows] = useState<Row[]>([
    { url: "", result: null, error: null, loading: false },
    { url: "", result: null, error: null, loading: false },
  ]);
  const [running, setRunning] = useState(false);

  function updateUrl(i: number, url: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, url } : row)));
  }

  function addRow() {
    if (rows.length >= 4) return;
    setRows((r) => [...r, { url: "", result: null, error: null, loading: false }]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  async function runComparison() {
    const active = rows.filter((r) => r.url.trim());
    if (active.length < 2) return;
    setRunning(true);

    setRows((r) => r.map((row) => (row.url.trim() ? { ...row, loading: true, error: null, result: null } : row)));

    await Promise.all(
      rows.map(async (row, i) => {
        if (!row.url.trim()) return;
        try {
          const res = await fetch("/api/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: row.url }),
          });
          const json = await res.json();
          setRows((r) =>
            r.map((rr, idx) =>
              idx === i
                ? res.ok
                  ? { ...rr, result: json, loading: false }
                  : { ...rr, error: json.error, loading: false }
                : rr
            )
          );
        } catch {
          setRows((r) =>
            r.map((rr, idx) => (idx === i ? { ...rr, error: "Failed to fetch", loading: false } : rr))
          );
        }
      })
    );

    setRunning(false);
  }

  const completed = rows.filter((r) => r.result);
  const winner =
    completed.length > 1
      ? completed.reduce((best, r) => ((r.result!.overallScore > best.result!.overallScore) ? r : best))
      : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Competitor Snapshot</h1>
      <p className="mt-1 mb-8 text-sm text-muted">
        Compare your site against up to 3 competitors. Each column runs a full live audit.
      </p>

      <Card className="mb-8">
        <CardHeader title="Sites to compare" icon={<Users size={16} />} />
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.url}
                onChange={(e) => updateUrl(i, e.target.value)}
                placeholder={i === 0 ? "yoursite.com" : "competitor.com"}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              {row.loading && <Loader2 size={16} className="animate-spin text-accent" />}
              {rows.length > 2 && (
                <button onClick={() => removeRow(i)} className="rounded-lg border border-border p-2 text-muted hover:text-critical">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          {rows.length < 4 && (
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              <Plus size={14} /> Add site
            </button>
          )}
          <button
            onClick={runComparison}
            disabled={running}
            className="ml-auto flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {running && <Loader2 size={14} className="animate-spin" />}
            {running ? "Running audits…" : "Compare"}
          </button>
        </div>
      </Card>

      {completed.length > 1 && (
        <Card className="overflow-x-auto">
          <CardHeader title="Comparison" icon={<Trophy size={16} />} />
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 pr-4 font-medium">Metric</th>
                {completed.map((r) => (
                  <th key={r.url} className="pb-3 pr-4 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[160px]">{r.result!.url}</span>
                      {winner?.url === r.url && <Trophy size={12} className="shrink-0 text-warning" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 text-muted">{m.label}</td>
                  {completed.map((r) => (
                    <td key={r.url} className="py-2.5 pr-4 font-mono">
                      {m.get(r.result!)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {rows.some((r) => r.error) && (
        <div className="mt-4 space-y-2">
          {rows
            .filter((r) => r.error)
            .map((r, i) => (
              <p key={i} className="text-sm text-critical">
                {r.url}: {r.error}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
