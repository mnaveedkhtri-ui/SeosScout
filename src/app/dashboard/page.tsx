import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your audit history and scores at a glance.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <DashboardView />
    </div>
  );
}
