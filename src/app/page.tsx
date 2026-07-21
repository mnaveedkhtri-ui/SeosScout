import Link from "next/link";
import {
  Gauge,
  FileText,
  Users,
  FileDown,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { UrlInputForm } from "@/components/audit/url-input-form";
import { Card } from "@/components/ui/card";

const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SiteScout",
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  description:
    "Free SEO audit tool that runs a full technical, content, and performance audit on any URL, no signup required.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};


const FEATURES = [
  {
    icon: Gauge,
    title: "Full Technical Audit",
    desc: "Titles, meta tags, headings, images, canonical tags, robots.txt, sitemap, broken links, and security headers, all checked live against your actual site.",
  },
  {
    icon: Sparkles,
    title: "Prioritized Recommendations",
    desc: "Every issue comes with severity, why it matters, exactly how to fix it, and the expected SEO impact, so you know what to do first.",
  },
  {
    icon: FileText,
    title: "Content Intelligence",
    desc: "Readability scoring, keyword density, search intent detection, and automated heading and FAQ suggestions.",
  },
  {
    icon: Users,
    title: "Competitor Snapshot",
    desc: "Benchmark your SEO score, content depth, and meta optimization against any competitor URL.",
  },
  {
    icon: FileDown,
    title: "Shareable Reports",
    desc: "Export a polished audit summary or share a live report link with your team or client.",
  },
  {
    icon: ShieldCheck,
    title: "Security & HTTPS Checks",
    desc: "HTTPS enforcement, HSTS, CSP, X-Frame-Options and more, surfaced as real, actionable findings.",
  },
];

const STEPS = [
  { n: "01", title: "Paste your URL", desc: "No setup, no crawler installs. Just drop in any live website." },
  { n: "02", title: "We analyze everything", desc: "Technical SEO, content, structured data, and performance signals, all in one pass." },
  { n: "03", title: "Get a prioritized plan", desc: "A 0 to 100 score plus recommendations ranked by impact and effort." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_SCHEMA) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          <Zap size={12} className="text-accent" />
          Real-time audits, not mock data
        </div>
        <h1
          className="animate-fade-up text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          The SEO audit that
          <br />
          <span className="text-accent">actually reads your site.</span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-5 max-w-xl text-balance text-base text-muted sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Enter any URL. Get a full technical, content, and on-page SEO audit
          with prioritized fixes in under a minute.
        </p>

        <div
          className="animate-fade-up mx-auto mt-8 max-w-xl"
          style={{ animationDelay: "180ms" }}
        >
          <UrlInputForm />
          <p className="mt-3 text-xs text-muted">
            Try it on your own site. It&apos;s free, no signup required for a single audit.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="glass grid grid-cols-2 gap-6 rounded-2xl p-8 sm:grid-cols-4">
          {[
            ["20+", "Checks per audit"],
            ["<60s", "Average audit time"],
            ["0-100", "Weighted SEO score"],
            ["9", "Scored categories"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="font-mono text-2xl font-semibold text-accent sm:text-3xl">
                {stat}
              </div>
              <div className="mt-1 text-xs text-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Everything a premium audit needs</h2>
          <p className="mt-2 text-muted">Built on real page analysis, not templated scores.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} hover>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon size={19} />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="font-mono text-sm text-accent">{s.n}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-28">
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--accent)" }}
          />
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to see your score?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Run your first audit in seconds. No account needed to try it.
          </p>
          <Link
            href="/audit"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            Start free audit <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        SiteScout, built for demonstration purposes.
      </footer>
    </div>
  );
}
