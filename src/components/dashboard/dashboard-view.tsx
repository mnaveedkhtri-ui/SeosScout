"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getHistory, deleteHistoryEntry, type HistoryEntry } from "@/lib/history";
import { Card, CardHeader } from "@/components/ui/card";
import { UrlInputForm } from "@/components/audit/url-input-form";
import { Activity, Trash2, ArrowUpRight, Inbox } from "lucide-react";

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-critical";
}

export function DashboardView() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setMounted(true);
  }, []);

  function remove(id: string) {
    deleteHistoryEntry(id);
    setHistory(getHistory());
  }

  if (!mounted) return null;

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Inbox size={24} />
        </div>
        <h1 className="text-xl font-semibold">No audits yet</h1>
        <p className="mt-2 text-sm text-muted">
          Run your first audit and it will show up here. History is stored locally in your browser.
        </p>
        <div className="mt-6">
          <UrlInputForm />
        </div>
      </div>
    );
  }

  const avgScore = Math.round(
    history.reduce((sum, h) => sum + h.overallScore, 0) / history.length
  );
  const totalCritical = history.reduce((sum, h) => sum + h.criticalCount, 0);
  const chartData = [...history]
    .reverse()
    .map((h, i) => ({ name: `#${i + 1}`, score: h.overallScore }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            {history.length} audit{history.length !== 1 ? "s" : ""} stored in this browser
          </p>
        </div>
        <div className="w-full sm:w-96">
          <UrlInputForm compact />
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Average Score</p>
          <p className={`mt-1 font-mono text-3xl font-semibold ${scoreColor(avgScore)}`}>{avgScore}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Total Audits</p>
          <p className="mt-1 font-mono text-3xl font-semibold">{history.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Open Critical Issues</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-critical">{totalCritical}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Score Trend" subtitle="Across your recent audits, oldest to newest" icon={<Activity size={16} />} />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Recent Audits" icon={<Activity size={16} />} />
        <div className="divide-y divide-border">
          {history.map((h) => (
            <div key={h.id} className="flex items-center gap-4 py-3">
              <span className={`font-mono text-lg font-semibold ${scoreColor(h.overallScore)} w-10 shrink-0`}>
                {h.overallScore}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{h.url}</p>
                <p className="text-xs text-muted">{new Date(h.fetchedAt).toLocaleString()}</p>
              </div>
              {h.criticalCount > 0 && (
                <span className="hidden shrink-0 rounded-full border border-critical/25 bg-critical/10 px-2 py-0.5 text-[11px] text-critical sm:inline-block">
                  {h.criticalCount} critical
                </span>
              )}
              <Link
                href={`/audit?url=${encodeURIComponent(h.url)}`}
                className="shrink-0 rounded-lg border border-border p-2 text-muted hover:text-foreground"
                title="Re-open audit"
              >
                <ArrowUpRight size={15} />
              </Link>
              <button
                onClick={() => remove(h.id)}
                className="shrink-0 rounded-lg border border-border p-2 text-muted hover:text-critical"
                title="Remove from history"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
