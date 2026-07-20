import type { CategoryScore } from "@/types/audit";

const LABELS: Record<string, string> = {
  meta: "Meta Tags",
  headings: "Headings",
  content: "Content Quality",
  images: "Images",
  links: "Links",
  social: "Social Tags",
  schema: "Structured Data",
  technical: "Technical SEO",
  performance: "Performance",
};

function barColor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--critical)";
}

export function CategoryBreakdown({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="space-y-4">
      {categories.map((c) => (
        <div key={c.name}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-foreground">{LABELS[c.name] ?? c.name}</span>
            <span className="font-mono text-muted">{c.score}/100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${c.score}%`, background: barColor(c.score) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
