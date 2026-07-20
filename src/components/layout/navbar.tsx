"use client";

import Link from "next/link";
import { Zap, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/reports", label: "Reports" },
  { href: "/pricing", label: "Free" },
];

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <span className="font-semibold tracking-tight">
            Site<span className="text-accent">Scout</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" && session?.user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-foreground">
                  {(session.user.firstName?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
                </div>
                <span className="hidden sm:inline">{session.user.firstName || session.user.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=register"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
