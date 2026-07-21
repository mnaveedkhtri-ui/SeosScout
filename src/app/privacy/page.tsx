import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SiteScout collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

      <div className="glass mt-10 space-y-8 rounded-2xl p-8 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">1. Overview</h2>
          <p>SiteScout (&quot;we&quot;, &quot;us&quot;) provides free website SEO audits. This policy explains what information we collect when you use the service and how we handle it.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">2. Information we collect</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="text-foreground">Account information</span> — if you sign up or log in with Google, we receive your name, email address, and profile picture from Google.</li>
            <li><span className="text-foreground">Audit data</span> — the URLs you submit for audits, and the resulting reports, are stored so you can access your audit history and dashboard.</li>
            <li><span className="text-foreground">Usage data</span> — basic technical information such as browser type and pages visited, used to keep the service reliable.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">3. How we use your information</h2>
          <p>We use your data solely to operate SiteScout: authenticating your account, running and storing your audits, and improving the product. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">4. Third-party services</h2>
          <p>We use Google for authentication and Google PageSpeed Insights to power parts of our audit results. These providers process data under their own privacy policies.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">5. Data retention</h2>
          <p>Your account and audit history are retained until you request deletion. You can request removal of your account and associated data at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">6. Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by reaching out through our <a href="/contact" className="text-accent underline underline-offset-2">Contact page</a>.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">7. Contact</h2>
          <p>Questions about this policy? Email <a href="mailto:naveedkhtri7@gmail.com" className="text-accent underline underline-offset-2">naveedkhtri7@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
