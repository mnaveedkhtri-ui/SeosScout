"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";

export function UrlInputForm({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Enter a URL to audit.");
      return;
    }
    setError(null);
    setLoading(true);
    // Navigate to the results page; it performs the actual audit fetch
    // (keeps this form simple and lets the results page own loading state).
    router.push(`/audit?url=${encodeURIComponent(url.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`glass flex items-center gap-2 rounded-2xl p-2 transition-shadow ${
          compact ? "" : "shadow-2xl shadow-black/40"
        }`}
      >
        <div className="flex items-center gap-2 pl-3 text-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a website URL, e.g. example.com"
          className="flex-1 bg-transparent py-3 text-sm sm:text-base text-foreground placeholder:text-muted focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Starting…
            </>
          ) : (
            <>
              Run Audit <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-critical">{error}</p>}
    </form>
  );
}
