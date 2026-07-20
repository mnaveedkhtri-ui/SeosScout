import type { Severity } from "@/types/audit";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

const CONFIG: Record<
  Severity,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  critical: {
    label: "Critical",
    className: "bg-critical/10 text-critical border-critical/25",
    icon: AlertTriangle,
  },
  warning: {
    label: "Warning",
    className: "bg-warning/10 text-warning border-warning/25",
    icon: AlertCircle,
  },
  info: {
    label: "Info",
    className: "bg-info/10 text-info border-info/25",
    icon: Info,
  },
  pass: {
    label: "Passed",
    className: "bg-success/10 text-success border-success/25",
    icon: CheckCircle2,
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = CONFIG[severity];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.className}`}
    >
      <Icon size={13} strokeWidth={2.2} />
      {cfg.label}
    </span>
  );
}
