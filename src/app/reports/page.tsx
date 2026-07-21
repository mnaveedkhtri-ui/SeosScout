import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = {
  title: "Reports",
  description: "View and export your saved SEO audit reports.",
  robots: { index: false, follow: false },
};

export default function ReportsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ReportsView />
    </div>
  );
}
