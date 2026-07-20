import { Navbar } from "@/components/layout/navbar";
import { CompareView } from "@/components/compare/compare-view";

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CompareView />
    </div>
  );
}
