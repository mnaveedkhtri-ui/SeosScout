import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of SiteScout.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

      <div className="glass mt-10 space-y-8 rounded-2xl p-8 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">1. Acceptance of terms</h2>
          <p>By accessing or using SiteScout, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">2. Description of service</h2>
          <p>SiteScout provides automated technical, content, and on-page SEO audits for websites, along with related reporting features. The service is provided free of charge, as-is, with no paid plans.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">3. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Use the service to audit websites you do not have permission to scan</li>
            <li>Attempt to disrupt, overload, or reverse-engineer the service</li>
            <li>Use automated means to abuse or excessively query the service</li>
            <li>Use the service for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">4. Accounts</h2>
          <p>You may sign in using Google or a SiteScout account. You are responsible for maintaining the confidentiality of your credentials and for any activity under your account.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">5. No warranty</h2>
          <p>SiteScout is provided &quot;as is&quot; without warranties of any kind. Audit results, scores, and recommendations are generated automatically and may not be fully accurate or complete. They should not be treated as professional guarantees.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">6. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, SiteScout and its operator are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">7. Changes to these terms</h2>
          <p>We may update these terms from time to time. Continued use of SiteScout after changes are posted constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">8. Contact</h2>
          <p>Questions about these terms? Email <a href="mailto:naveedkhtri7@gmail.com" className="text-accent underline underline-offset-2">naveedkhtri7@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
