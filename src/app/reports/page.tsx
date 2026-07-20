import { Navbar } from "@/components/layout/navbar";
import { ReportsView } from "@/components/reports/reports-view";

export default function ReportsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ReportsView />
    </div>
  );
}
