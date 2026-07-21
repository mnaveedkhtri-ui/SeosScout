import type { Metadata } from "next";
import { PricingClient } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing — 100% Free SEO Audit Tool, No Plans, No Limits",
  description:
    "SiteScout is completely free. Unlimited audits, full technical and content checks, PDF export, and competitor comparisons — no credit card, ever.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingClient />;
}
