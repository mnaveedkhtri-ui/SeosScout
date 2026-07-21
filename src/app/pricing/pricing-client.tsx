"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

const FEATURES = [
  "Unlimited audits",
  "Full technical + content checks",
  "Live PageSpeed / Core Web Vitals",
  "Rule-based prioritized recommendations",
  "PDF export",
  "Competitor comparisons",
  "Audit history & dashboard",
];

export function PricingClient() {
  const { status } = useSession();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">100% free. No pricing, ever.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Every feature in SiteScout is free for everyone — no plans, no limits, no card required.
        </p>

        <div className="glass mt-12 rounded-2xl p-8 text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold">$0</span>
            <span className="text-sm text-muted">forever</span>
          </div>
          <ul className="mt-6 space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check size={15} className="mt-0.5 shrink-0 text-success" />
                <span className="text-foreground/90">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href={status === "authenticated" ? "/dashboard" : "/login?mode=register"}
            className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            {status === "authenticated" ? "Go to dashboard" : "Get started free"}
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted">
          No credit card, no trial period, no upgrade prompts. SiteScout doesn&apos;t charge for anything.
        </p>
      </div>
    </div>
  );
}
