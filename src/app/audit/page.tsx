import { Navbar } from "@/components/layout/navbar";
import { UrlInputForm } from "@/components/audit/url-input-form";
import { AuditResults } from "@/components/audit/audit-results";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  return (
    <div className="min-h-screen">
      <Navbar />
      {!url ? (
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">Run an SEO audit</h1>
          <p className="mt-2 text-muted">Enter a URL to get started.</p>
          <div className="mt-6">
            <UrlInputForm />
          </div>
        </div>
      ) : (
        <AuditResults url={url} />
      )}
    </div>
  );
}
