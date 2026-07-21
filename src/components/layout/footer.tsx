import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Run an audit", href: "/audit" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Compare", href: "/compare" },
  { label: "Reports", href: "/reports" },
];

const COMPANY_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-semibold tracking-tight">
                Site<span className="text-accent">Scout</span>
              </span>
            </Link>
            <p className="mt-3 max-w-[22ch] text-sm text-muted">
              Real-time SEO audits. No mock data, no upsells.
            </p>
            <div className="mt-5 flex items-center gap-3">
              
                href="https://github.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="SiteScout on GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-foreground"
              >
                <Github size={15} />
              </a>
              
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="SiteScout on Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-foreground"
              >
                <Twitter size={15} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} SiteScout. Built for demonstration purposes.
          </p>
          <p className="text-xs text-muted">Free forever. No credit card, ever.</p>
        </div>
      </div>
    </footer>
  );
}
