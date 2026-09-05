export const metadata = {
  title: "Terms of Service | Knollside",
  description:
    "The terms that govern your use of Knollside's instant-quote widgets and dashboard.",
};

const EFFECTIVE_DATE = "August 8, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] text-[#211F1B]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#B08A44]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-[#211F1B]/60">
          Effective {EFFECTIVE_DATE}
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-[#211F1B]/85">
          <Section n="1" title="Who we are">
            <p>
              Knollside (&ldquo;Knollside,&rdquo; &ldquo;we,&rdquo;
              &ldquo;us&rdquo;) provides embeddable instant-quote and pricing
              widgets for service businesses, along with a dashboard for
              configuring pricing and viewing captured leads. Knollside is
              operated by Knollside LLC, a California limited liability company.
            </p>
            <p>
              These Terms are a binding agreement between Knollside and you. If
              you are signing up on behalf of a company, you confirm you have
              authority to bind that company, and &ldquo;you&rdquo; means that
              company.
            </p>
          </Section>

          <Section n="2" title="Your account">
            <p>
              You need an account to use the service. You must be at least 18
              years old and provide accurate information. You are responsible for
              activity that happens under your account, including keeping your
              login email secure. Tell us at{" "}
              <Mail /> if you think someone else has
              access to your account.
            </p>
          </Section>

          <Section n="3" title="Plans, billing, and cancellation">
            <p>
              Paid plans are billed in advance on a recurring monthly basis
              through our payment processor, Stripe. By subscribing, you
              authorize us to charge your payment method on each renewal date
              until you cancel.
            </p>
            <p>
              You can cancel any time from your dashboard. Cancellation takes
              effect at the end of your current billing period, and your widget
              will stop serving quotes after that date. Payments already made are
              non-refundable except where required by law, though we&rsquo;ll
              look at individual situations in good faith if something has gone
              wrong on our end.
            </p>
            <p>
              We may change pricing with at least 30 days&rsquo; notice by email.
              If you keep using a paid plan after a price change takes effect,
              the new price applies.
            </p>
          </Section>

          <Section n="4" title="The website service (Pro plans)">
            <p>
              Pro plans include a website, built and hosted by us, with your
              estimator built into it. This section covers that part of the
              service. If you are on Starter or Growth it does not apply to you.
            </p>
            <p>
              <strong>What&rsquo;s included.</strong> One website, built from our
              template and set up with your business name, logo, colours, photos
              and pricing. Hosting is included for as long as your Pro
              subscription is active.
            </p>
            <p>
              <strong>Keeping it current.</strong> Send us changes to your text,
              photos, prices, hours or contact details and we will make them. This
              covers changes to pages that already exist. We aim to make them
              within a few working days.
            </p>
            <p>
              <strong>Design refresh.</strong> Once every twelve months you can ask
              for a design refresh, meaning a change to the layout or the look of
              the site. Additional pages, custom features or further design work
              are not included and would be quoted separately.
            </p>
            <p>
              <strong>Your domain.</strong> You can point a domain you already own
              at your site, or we can register one for you. Domains costing more
              than roughly $200 are billed separately at cost. Whoever pays for it,
              the domain is yours: ask us at any time and we will transfer it to
              you at no charge.
            </p>
            <p>
              <strong>Your content.</strong> The words, photos and pricing on your
              site are yours. The template, code and design are ours. See
              section 8.
            </p>
            <p>
              <strong>If you cancel.</strong> Hosting stops at the end of your
              billing period and the site stops being available. Your domain
              remains yours, and we will give you a copy of your content on
              request. If you want to keep the site itself running elsewhere, you
              can buy it outright: $750 within the first twelve months, or $500
              after that.
            </p>
            <p>
              <strong>Fair use.</strong> Unlike the software, this part is work
              done by people. We will be reasonable about it and we ask the same of
              you. If requests go well beyond the normal upkeep of a small business
              website, we will talk to you about it rather than simply stopping.
            </p>
          </Section>

          <Section n="5" title="What you can and can't do">
            <p>You agree not to:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                use the service for anything illegal, deceptive, or harmful
              </li>
              <li>
                publish quote logic you know to be misleading to your own
                customers
              </li>
              <li>
                resell, sublicense, or white-label the service without our
                written agreement
              </li>
              <li>
                attempt to access other customers&rsquo; accounts, pricing
                configurations, or leads
              </li>
              <li>
                scrape, overload, reverse engineer, or interfere with the
                service or its infrastructure
              </li>
              <li>
                upload content that infringes someone else&rsquo;s intellectual
                property or privacy rights
              </li>
            </ul>
            <p>
              We may suspend or terminate accounts that violate these Terms. When
              the situation allows it, we&rsquo;ll reach out first.
            </p>
          </Section>

          <Section n="6" title="Quotes are estimates, not contracts">
            <p>
              This is the most important thing on this page. Knollside generates
              price estimates from pricing rules that{" "}
              <strong className="font-semibold text-[#211F1B]">you</strong>{" "}
              configure. We do not set, review, verify, or endorse your prices,
              and we are not a party to any agreement between you and the
              customers who request a quote.
            </p>
            <p>
              You are solely responsible for the accuracy of your pricing
              configuration, for any legal disclosures your industry or
              jurisdiction requires, and for honoring or declining any estimate
              your widget produces. We recommend presenting widget output as an
              estimate subject to confirmation.
            </p>
          </Section>

          <Section n="7" title="Your content and your leads">
            <p>
              You keep ownership of everything you put into Knollside: your
              business details, pricing rules, branding, and the lead records
              your widget captures. You grant us a limited license to host,
              process, and display that content solely to operate the service for
              you.
            </p>
            <p>
              You are the party responsible for the personal information your
              widget collects from your customers, including having a lawful
              basis to collect it and providing your own privacy notice. We
              handle that data on your behalf as described in our{" "}
              <a
                href="/privacy"
                className="underline decoration-[#B08A44] decoration-2 underline-offset-2 hover:text-[#B08A44]"
              >
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section n="8" title="Our intellectual property">
            <p>
              The Knollside software, widget code, dashboard, name, logo, and
              design are ours. Your subscription grants you a limited,
              non-exclusive, revocable right to embed and display the widget on
              websites you own or operate. Nothing here transfers ownership of
              our software to you.
            </p>
            <p>
              If you send us feedback or feature ideas, we may use them without
              obligation or compensation.
            </p>
          </Section>

          <Section n="9" title="Third-party services">
            <p>
              We rely on third parties to run Knollside, including Vercel
              (hosting), Supabase (database and authentication), Stripe
              (payments), and Resend (email delivery). Their availability and
              their own terms affect the service. We aren&rsquo;t responsible for
              outages or actions of these providers, though we&rsquo;ll work to
              route around problems where we can.
            </p>
          </Section>

          <Section n="10" title="Availability">
            <p>
              We aim for high uptime but we don&rsquo;t promise the service will
              be uninterrupted or error-free. We may modify, add, or remove
              features over time. If we discontinue the service entirely,
              we&rsquo;ll give you at least 30 days&rsquo; notice and a way to
              export your leads.
            </p>
          </Section>

          <Section n="11" title="Disclaimers">
            <p className="font-mono text-[13px] leading-relaxed">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
              THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, THAT QUOTES GENERATED
              WILL BE ACCURATE OR PROFITABLE, OR THAT ANY LEAD WILL CONVERT.
            </p>
          </Section>

          <Section n="12" title="Limitation of liability">
            <p className="font-mono text-[13px] leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KNOLLSIDE WILL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST DATA, OR
              BUSINESS INTERRUPTION, ARISING OUT OF OR RELATING TO YOUR USE OF
              THE SERVICE. OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM WILL NOT
              EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US IN THE TWELVE
              MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE
              HUNDRED U.S. DOLLARS.
            </p>
            <p>
              Some jurisdictions don&rsquo;t allow certain limitations, so parts
              of this section may not apply to you.
            </p>
          </Section>

          <Section n="13" title="Indemnification">
            <p>
              You agree to defend and indemnify Knollside against claims, losses,
              and reasonable legal costs arising from your use of the service,
              your pricing configuration, the estimates your widget produces,
              your handling of customer data, or your breach of these Terms.
            </p>
          </Section>

          <Section n="14" title="Governing law and disputes">
            <p>
              These Terms are governed by the laws of the State of California,
              without regard to conflict-of-laws rules. Any dispute will be
              brought in the state or federal courts located in San Diego County,
              California, and you and we consent to that jurisdiction. Before
              filing anything, please email us at <Mail /> so we can try to sort
              it out directly.
            </p>
          </Section>

          <Section n="15" title="Changes to these Terms">
            <p>
              We may update these Terms. If a change is material, we&rsquo;ll
              email account holders and update the effective date above.
              Continuing to use Knollside after a change takes effect means you
              accept the revised Terms.
            </p>
          </Section>

          <Section n="16" title="Contact">
            <p>
              Questions about these Terms: <Mail />
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
      <h2 className="flex items-baseline gap-3 font-display text-xl text-[#211F1B]">
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
