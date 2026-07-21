"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardHeader } from "@/components/ui/card";
import { clearHistory } from "@/lib/history";
import { User, Bell, Trash2, Check, CreditCard } from "lucide-react";

export function SettingsClient() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(`${session.user.firstName ?? ""} ${session.user.lastName ?? ""}`.trim());
    }
  }, [session]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    clearHistory();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Settings</h1>

        {!session?.user ? (
          <p className="mt-3 mb-8 text-sm text-muted">
            <Link href="/login" className="text-accent underline underline-offset-2">
              Log in
            </Link>{" "}
            to manage your profile and billing.
          </p>
        ) : (
          <p className="mt-3 mb-8 text-sm text-muted">
            Signed in as <span className="text-foreground">{session.user.email}</span>
          </p>
        )}

        <Card className="mb-6">
          <CardHeader title="Plan & billing" icon={<CreditCard size={16} />} />
          <p className="text-sm">
            Current plan: <span className="font-medium text-foreground">Free forever</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            SiteScout is completely free — every feature is included for every account, no charges.
          </p>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Profile" icon={<User size={16} />} />
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
              <input
                value={session?.user?.email ?? ""}
                readOnly
                type="email"
                placeholder="you@company.com"
                className="w-full cursor-not-allowed rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              {saved ? <Check size={14} /> : null}
              {saved ? "Saved" : "Save changes"}
            </button>
          </form>
        </Card>

        <Card className="mb-6">
          <CardHeader title="Notifications" icon={<Bell size={16} />} />
          <label className="flex items-center justify-between">
            <span className="text-sm">Email me when a scheduled audit finds critical issues</span>
            <button
              onClick={() => setEmailAlerts((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                emailAlerts ? "bg-accent" : "bg-surface-2"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  emailAlerts ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </Card>

        <Card>
          <CardHeader title="Data" icon={<Trash2 size={16} />} />
          <p className="mb-4 text-sm text-muted">
            Clear all locally stored audit history from this browser. This can&apos;t be undone.
          </p>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 rounded-lg border border-critical/30 bg-critical/10 px-4 py-2 text-sm font-medium text-critical hover:bg-critical/15"
          >
            {cleared ? <Check size={14} /> : <Trash2 size={14} />}
            {cleared ? "History cleared" : "Clear audit history"}
          </button>
        </Card>
      </div>
    </div>
  );
}
