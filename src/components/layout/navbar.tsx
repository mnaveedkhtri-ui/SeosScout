"use client";
import { useState } from "react";
import Link from "next/link";
import { Zap, LogOut, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/reports", label: "Reports" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
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

        <div className="hidden md:flex items-center gap-3">
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

        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border text-foreground"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t border-border/60 pt-3">
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-foreground">
                    {(session.user.firstName?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <span>{session.user.firstName || session.user.email}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/login?mode=register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
