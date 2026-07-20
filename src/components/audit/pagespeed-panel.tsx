"use client";

import { useState } from "react";
import type { AuditResult } from "@/types/audit";
import type { CoreWebVital, PageSpeedStrategyResult } from "@/lib/audit/pagespeed";
import { Card, CardHeader } from "@/components/ui/card";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { Smartphone, Monitor, Gauge as GaugeIcon, Users, FlaskConical, AlertTriangle } from "lucide-react";

const RATING_LABEL: Record<CoreWebVital["rating"], string> = {
  good: "Good",
  "needs-improvement": "Needs improvement",
  poor: "Poor",
};

const RATING_CLASS: Record<CoreWebVital["rating"], string> = {
  good: "bg-success/10 text-success border-success/30",
  "needs-improvement": "bg-warning/10 text-warning border-warning/30",
  poor: "bg-critical/10 text-critical border-critical/30",
};

function RatingBadge({ rating }: { rating: CoreWebVital["rating"] }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${RATING_CLASS[rating]}`}>
      {RATING_LABEL[rating]}
    </span>
  );
}

function MetricRow({
  label,
  fullName,
  metric,
}: {
  label: string;
  fullName: string;
  metric: CoreWebVital | null;
}) {
  if (!metric) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 opacity-50">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted">{fullName}</p>
        </div>
        <span className="text-xs text-muted">No data</span>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted">{fullName}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{metric.displayValue}</span>
        <RatingBadge rating={metric.rating} />
      </div>
    </div>
  );
}

function StrategyView({ data }: { data: PageSpeedStrategyResult }) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <div className="flex flex-col items-center justify-center">
        <ScoreGauge score={data.performanceScore} size={160} label="Performance" />
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
            <Users size={14} />
            Field Data
            <span className="text-[11px] font-normal text-muted">(real Chrome users, last 28 days)</span>
          </div>
          {data.fieldData.available ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <MetricRow label="LCP" fullName="Largest Contentful Paint" metric={data.fieldData.lcp} />
              <MetricRow label="INP" fullName="Interaction to Next Paint" metric={data.fieldData.inp} />
              <MetricRow label="CLS" fullName="Cumulative Layout Shift" metric={data.fieldData.cls} />
            </div>
          ) : (
            <p className="rounded-lg bg-surface px-3 py-2.5 text-xs text-muted">
              No real-user (CrUX) data is available for this URL yet. It likely doesn&apos;t get enough Chrome
              traffic to be reported. Lab data below is a same-quality estimate instead.
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
            <FlaskConical size={14} />
            Lab Data
            <span className="text-[11px] font-normal text-muted">(simulated Lighthouse run)</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <MetricRow label="LCP" fullName="Largest Contentful Paint" metric={data.labData.lcp} />
            <MetricRow label="CLS" fullName="Cumulative Layout Shift" metric={data.labData.cls} />
            <MetricRow label="FCP" fullName="First Contentful Paint" metric={data.labData.fcp} />
            <MetricRow label="TBT" fullName="Total Blocking Time" metric={data.labData.tbt} />
            <MetricRow label="SI" fullName="Speed Index" metric={data.labData.speedIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSpeedPanel({ performance }: { performance: AuditResult["performance"] }) {
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const ps = performance.pageSpeed;
  const current = strategy === "mobile" ? ps?.mobile : ps?.desktop;
  const currentError = strategy === "mobile" ? performance.pageSpeedMobileError : performance.pageSpeedDesktopError;

  return (
    <Card className="mb-6">
      <CardHeader
        title="Site Speed"
        subtitle="Real mobile and desktop Core Web Vitals, lab data plus real-user field data"
        icon={<GaugeIcon size={16} />}
        action={
          <div className="flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setStrategy("mobile")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                strategy === "mobile" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              <Smartphone size={13} /> Mobile
            </button>
            <button
              onClick={() => setStrategy("desktop")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                strategy === "desktop" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              <Monitor size={13} /> Desktop
            </button>
          </div>
        }
      />

      {current ? (
        <StrategyView data={current} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-surface px-6 py-10 text-center">
          <AlertTriangle size={22} className="text-warning" />
          <p className="text-sm font-medium">{strategy === "mobile" ? "Mobile" : "Desktop"} speed test unavailable right now</p>
          <p className="max-w-md text-xs text-muted">
            {currentError ?? "The speed test service is temporarily unavailable."} In the meantime, here&apos;s a
            directional estimate from page-load timing: LCP ≈ {performance.estimatedLcpMs}ms, layout-shift risk:{" "}
            {performance.estimatedClsRisk}.
          </p>
        </div>
      )}
    </Card>
  );
}
