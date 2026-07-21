"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Zap, AlertCircle } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.1H1.27A11.96 11.96 0 000 12c0 1.94.46 3.77 1.27 5.39l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const initialMode = params.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not create your account.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <span className="font-semibold tracking-tight">
            Site<span className="text-accent">Scout</span>
          </span>
        </Link>

        <h1 className="sr-only">Log in or create your SiteScout account</h1>

        <div className="glass rounded-2xl p-6">
          <div className="mb-5 flex rounded-lg bg-surface-2 p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 transition-colors ${
                mode === "login" ? "bg-surface text-foreground" : "text-muted"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-md py-1.5 transition-colors ${
                mode === "register" ? "bg-surface text-foreground" : "text-muted"
              }`}
            >
              Register
            </button>
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    First name
                  </label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ayesha"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Last name
                  </label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Khan"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Password</label>
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
              {mode === "register" && (
                <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-critical/30 bg-critical/5 p-2.5 text-xs text-critical">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-foreground underline underline-offset-2"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-foreground underline underline-offset-2"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export function LoginClient() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
