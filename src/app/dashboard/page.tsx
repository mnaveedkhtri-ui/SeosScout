import { Navbar } from "@/components/layout/navbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <DashboardView />
    </div>
  );
}
