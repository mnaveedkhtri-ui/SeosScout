"use client";

import { useEffect, useState } from "react";
import { getHistory, type HistoryEntry } from "@/lib/history";
import { Card } from "@/components/ui/card";
import { Download, Link2, FileText, Inbox, Check } from "lucide-react";

export function ReportsView() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(getHistory());
    setMounted(true);
  }, []);

  function copyShareLink(entry: HistoryEntry) {
    const link = `${window.location.origin}/audit?url=${encodeURIComponent(entry.url)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  }

  if (!mounted) return null;

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Inbox size={24} />
        </div>
        <h1 className="text-xl font-semibold">No reports yet</h1>
        <p className="mt-2 text-sm text-muted">
          Run an audit from the homepage. Completed audits appear here as downloadable and shareable reports.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="mt-1 mb-8 text-sm text-muted">
        Export a PDF or copy a shareable link. Re-opening a shared link re-runs the audit live.
      </p>

      <div className="space-y-3">
        {history.map((h) => (
          <Card key={h.id} className="!p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FileText size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{h.url}</p>
                  <p className="text-xs text-muted">
                    Score {h.overallScore}/100 · {new Date(h.fetchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => copyShareLink(h)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-surface-2"
                >
                  {copiedId === h.id ? <Check size={13} className="text-success" /> : <Link2 size={13} />}
                  {copiedId === h.id ? "Copied" : "Share link"}
                </button>
                <a
                  href={`/api/audit/pdf?url=${encodeURIComponent(h.url)}`}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white"
                >
                  <Download size={13} /> PDF
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
