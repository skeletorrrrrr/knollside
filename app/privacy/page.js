export const metadata = {
  title: "Privacy Policy | Knollside",
  description:
    "What data Knollside collects, why we collect it, who we share it with, and the choices you have.",
};

const EFFECTIVE_DATE = "August 8, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#211F1B]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#B08A44]">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#211F1B]/60">
          Effective {EFFECTIVE_DATE}
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-[#211F1B]/85">
          <Section n="1" title="Two kinds of people, two kinds of data">
            <p>
              Knollside serves service businesses, and those businesses put our
              quote widget in front of their own customers. That means this policy
              covers two relationships, and it matters which one you are.
            </p>
            <div className="space-y-4 border-l-2 border-[#B08A44] pl-5">
              <p>
                <strong className="font-semibold">
                  If you run a business that uses Knollside,
                </strong>{" "}
                we handle your account data directly, and this policy describes
                what we do with it.
              </p>
              <p>
                <strong className="font-semibold">
                  If you requested a quote from a business&rsquo;s website,
                </strong>{" "}
                that business decides what to collect and how to use it. We
                process your information on their behalf and under their
                instructions. For requests about your data, contact that
                business. You can also email us at <Mail /> and we&rsquo;ll route
                you to them.
              </p>
            </div>
          </Section>

          <Section n="2" title="What we collect from businesses">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong className="font-semibold">Account details</strong> — name,
                business name, email address, and the one-time codes we email you
                to sign in
              </li>
              <li>
                <strong className="font-semibold">Configuration</strong> — your
                trade, pricing rules, service areas, and widget branding
              </li>
              <li>
                <strong className="font-semibold">Billing</strong> — your plan,
                subscription status, and the last four digits and expiry of your
                card. Full card numbers go directly to Stripe and never touch our
                servers.
              </li>
              <li>
                <strong className="font-semibold">Usage and technical data</strong>{" "}
                — pages visited in the dashboard, widget load counts, IP address,
                browser type, and error logs
              </li>
              <li>
                <strong className="font-semibold">Correspondence</strong> — emails
                you send us and support conversations
              </li>
            </ul>
          </Section>

          <Section n="3" title="What the widget collects from quote requesters">
            <p>
              When someone uses a quote widget, we collect the answers they give
              to the estimator questions along with the contact details the
              business asked for, typically name, email, phone number, and
              project address or ZIP code. We also record technical information
              such as IP address, the page the widget was embedded on, and
              timestamps, which we use for spam prevention and reliability.
            </p>
            <p>
              The widget does not use advertising cookies and does not track
              people across other websites.
            </p>
          </Section>

          <Section n="4" title="Why we use it">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>to run the service: generate quotes and deliver leads</li>
              <li>to authenticate you and secure accounts</li>
              <li>to process payments and manage subscriptions</li>
              <li>
                to send service email — sign-in codes, lead notifications,
                receipts, and important account notices
              </li>
              <li>
                to fix bugs, monitor performance, and prevent fraud and abuse
              </li>
              <li>
                to send occasional product updates or marketing to business
                account holders, which you can opt out of at any time
              </li>
              <li>to comply with legal obligations</li>
            </ul>
            <p>
              We do not sell personal information, and we do not share it for
              cross-context behavioral advertising.
            </p>
          </Section>

          <Section n="5" title="Who we share it with">
            <p>
              We use a small set of service providers, and only for the purposes
              below:
            </p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong className="font-semibold">Vercel</strong> — application
                hosting and delivery
              </li>
              <li>
                <strong className="font-semibold">Supabase</strong> — database and
                authentication
              </li>
              <li>
                <strong className="font-semibold">Stripe</strong> — payment
                processing
              </li>
              <li>
                <strong className="font-semibold">Resend</strong> — transactional
                email delivery
              </li>
            </ul>
            <p>
              We also share leads with the business whose widget captured them,
              which is the entire point of the product. Beyond that, we may
              disclose information if required by law or valid legal process, or
              in connection with a sale or transfer of the business, in which case
              we&rsquo;ll notify account holders by email.
            </p>
          </Section>

          <Section n="6" title="How long we keep it">
            <p>
              Account and configuration data is kept while your account is active.
              After you cancel, we keep it for 90 days so you can reactivate,
              then delete or anonymize it. Lead records are kept as long as the
              business&rsquo;s account is active, or until the business deletes
              them. Billing records are kept as long as tax and accounting law
              requires, generally seven years.
            </p>
          </Section>

          <Section n="7" title="Security">
            <p>
              Data is encrypted in transit with TLS and at rest by our
              infrastructure providers. Access to production data is limited and
              protected by multi-factor authentication. We use one-time email
              codes rather than passwords for sign-in. No system is perfectly
              secure, and we can&rsquo;t guarantee absolute security, but if a
              breach affects your data we&rsquo;ll notify you promptly and as the
              law requires.
            </p>
          </Section>

          <Section n="8" title="Your rights">
            <p>
              Depending on where you live, you may have the right to know what
              personal information we hold, to get a copy of it, to correct it, to
              delete it, to opt out of sale or sharing (we do neither), and to not
              be discriminated against for exercising these rights. California
              residents have these rights under the CCPA as amended by the CPRA;
              residents of the EEA and UK have comparable rights under the GDPR.
            </p>
            <p>
              To exercise any of them, email <Mail />. We&rsquo;ll verify your
              request by replying to the email address on your account and respond
              within 45 days. You may use an authorized agent, and we may ask for
              proof of their authority.
            </p>
          </Section>

          <Section n="9" title="Cookies">
            <p>
              We use cookies that are strictly necessary to keep you signed in and
              to keep the service secure. We do not use advertising or
              cross-site-tracking cookies. Blocking necessary cookies will prevent
              you from signing in.
            </p>
          </Section>

          <Section n="10" title="Children">
            <p>
              Knollside is a business tool and is not directed to anyone under 18.
              We don&rsquo;t knowingly collect personal information from
              children. If you believe a child&rsquo;s information has reached us,
              email <Mail /> and we&rsquo;ll delete it.
            </p>
          </Section>

          <Section n="11" title="International transfers">
            <p>
              We operate in the United States, and our providers store and process
              data there. If you access Knollside from outside the U.S., you
              understand your information will be transferred to and processed in
              the United States.
            </p>
          </Section>

          <Section n="12" title="Changes to this policy">
            <p>
              We&rsquo;ll update this page when our practices change and revise
              the effective date above. If a change is material, we&rsquo;ll email
              business account holders before it takes effect.
            </p>
          </Section>

          <Section n="13" title="Contact">
            <p>
              Privacy questions or requests: <Mail />
            </p>
          </Section>
        </div>

        <div className="mt-16 border-t border-[#211F1B]/10 pt-6">
          <a
            href="/"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[#211F1B]/60 hover:text-[#B08A44]"
          >
            &larr; Back to Knollside
          </a>
        </div>
      </div>
    </main>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-baseline gap-3 font-serif text-xl text-[#211F1B]">
        <span className="font-mono text-xs text-[#B08A44]">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Mail() {
  return (
    <a
      href="mailto:hello@knollside.com"
      className="font-mono text-[13px] underline decoration-[#B08A44] decoration-2 underline-offset-2 hover:text-[#B08A44]"
    >
      hello@knollside.com
    </a>
  );
}
