import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the SiteScout team — questions, feedback, or support requests welcome.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">Contact us</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Questions, feedback, or found a bug? Reach out — we usually reply within a day.
      </p>

      <div className="glass mt-12 rounded-2xl p-8 text-left">
        <div className="space-y-5">
          <a href="mailto:naveedkhtri7@gmail.com" className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium">naveedkhtri7@gmail.com</p>
            </div>
          </a>

          <a href="tel:+923323219981" className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Phone size={16} />
            </div>
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-sm font-medium">+92 332 3219981</p>
            </div>
          </a>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted">
        SiteScout is free for everyone — support requests don&apos;t require an account.
      </p>
    </div>
  );
}
