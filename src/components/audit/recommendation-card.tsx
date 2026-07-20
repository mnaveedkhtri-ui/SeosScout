import type { Recommendation } from "@/types/audit";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { TrendingUp } from "lucide-react";

const PRIORITY_STYLE: Record<Recommendation["priority"], string> = {
  high: "text-critical",
  medium: "text-warning",
  low: "text-muted",
};

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="glass glass-hover rounded-xl p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SeverityBadge severity={rec.severity} />
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
          {rec.category}
        </span>
        <span className={`ml-auto flex items-center gap-1 text-xs font-medium uppercase tracking-wide ${PRIORITY_STYLE[rec.priority]}`}>
          <TrendingUp size={12} />
          {rec.priority} priority
        </span>
      </div>

      <h4 className="font-semibold text-foreground">{rec.title}</h4>

      <div className="mt-3 space-y-2.5 text-sm">
        <div>
          <span className="font-medium text-muted">Why it matters: </span>
          <span className="text-foreground/90">{rec.whyItMatters}</span>
        </div>
        <div>
          <span className="font-medium text-muted">How to fix: </span>
          <span className="text-foreground/90">{rec.howToFix}</span>
        </div>
        <div>
          <span className="font-medium text-muted">Expected impact: </span>
          <span className="text-foreground/90">{rec.expectedImpact}</span>
        </div>
      </div>
    </div>
  );
}
