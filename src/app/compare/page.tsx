import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { CompareView } from "@/components/compare/compare-view";

export const metadata: Metadata = {
  title: "SEO Competitor Comparison — Benchmark Your Site vs Any Competitor",
  description:
    "Compare your SEO score, content depth, and meta optimization against any competitor URL side by side, for free.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CompareView />
    </div>
  );
}
