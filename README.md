# Knollside

A real, multi-tenant SaaS app: businesses sign up, configure their pricing, and
get an embeddable widget that gives their customers instant quotes. Built with
Next.js (App Router), Supabase (Postgres + Auth), and Stripe.

This isn't a demo — it's the actual codebase. Follow the steps below in order
and you'll have it live on a real URL, ready to show a real business, in
roughly 20–30 minutes.

## 1. Create your Supabase project (~5 min)

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. Once it's created, go to **Project Settings → API**. Copy three values —
   you'll need them in step 5:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret — never put it in client code)
3. Go to the **SQL Editor**, paste in the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   every table, the security rules that keep one business's data separate
   from another's, and seeds sensible defaults for any new signup.
4. (Optional, for faster testing) Go to **Authentication → Providers → Email**
   and turn off "Confirm email" so new accounts can log in immediately
   without clicking an email link. Turn it back on before real customers sign up.

## 2. Create your Stripe products (~5 min)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) (test mode is fine to start).
2. **Product catalog → Add product**, create three products with a **recurring
   monthly** price each:
   - Starter — $39/mo
   - Growth — $129/mo
   - Pro — $349/mo
3. For each, copy the **Price ID** (starts with `price_...`) — you'll need these in step 5.
4. Go to **Developers → API keys**, copy the **Secret key** → `STRIPE_SECRET_KEY`.
5. You'll set up the webhook in step 6, after you have a live URL.

## 3. Push this code to GitHub

```bash
cd knollside
git init
git add .
git commit -m "Knollside"
```
Create a new repo on GitHub and push it there.

## 4. Deploy to Vercel (~5 min)

1. Go to [vercel.com](https://vercel.com) → New Project → import the repo you just pushed.
2. Before deploying, add all the environment variables from
   [`.env.local.example`](./.env.local.example) in the Vercel project settings,
   using the real values from steps 1–2. Leave `STRIPE_WEBHOOK_SECRET` blank
   for now — you'll add it in the next step. Set `NEXT_PUBLIC_SITE_URL` to
   whatever Vercel tells you your URL will be (e.g. `https://knollside.vercel.app`).
3. Deploy.

## 5. Connect the Stripe webhook (~5 min)

This is what keeps a business's subscription status in sync after they pay.

1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-VERCEL-URL/api/stripe/webhook`
3. Events to send: `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. Copy the **Signing secret** (`whsec_...`) → add it as `STRIPE_WEBHOOK_SECRET`
   in Vercel's environment variables, then redeploy (Vercel → Deployments →
   redeploy) so it picks up the new value.

## 6. Try it end to end

1. Visit your live URL → **Start free trial** → create an account.
2. You'll land on the **Setup** tab with sample materials/edges/add-ons
   already seeded — edit them to match the real pilot business.
3. Copy the embed snippet shown at the top of Setup, or just share the
   live embed link directly (`/embed/your-slug`) as a quick way to test
   before it's on a real website.
4. Open that link in a new tab, get an estimate, submit it with a real
   email — then check the **Leads** tab and confirm it showed up.
5. In **Billing**, click a plan and walk through Stripe Checkout with a
   [test card](https://docs.stripe.com/testing#cards) (`4242 4242 4242 4242`,
   any future date/CVC) to confirm the whole loop works.

At this point it's genuinely live — you could hand the embed link or embed
snippet to your brother's shop today.

## Known v1 simplifications (worth knowing, not blockers)

- **Material photos are a pasted URL, not a file uploader.** Fastest way to
  add a real one for now: upload the photo anywhere public (e.g. imgur) and
  paste the link. A proper upload button via Supabase Storage is a
  straightforward next addition.
- **One login per business.** No multi-staff accounts yet.
- **Webhook testing needs a real HTTPS URL.** Stripe webhooks won't reach
  `localhost` — test billing after deploying to Vercel, not locally. (If you
  do want to run this locally first, the [Stripe CLI](https://docs.stripe.com/stripe-cli)
  can forward webhook events to your machine.)
- **This code has been syntax- and import-checked, but not fully build-tested.**
  Package registry access wasn't available in the sandbox this was written in,
  so `npm install`/`npm run build` couldn't run. To still catch real mistakes,
  every file was run through esbuild directly: each one parses as valid
  JS/JSX with no syntax errors, and every `@/...` and relative import across
  all 32 entry points resolves to a real export with no typos or broken
  paths. What that *doesn't* catch is anything that depends on the actual
  library internals — e.g. a Supabase or Stripe method name that doesn't
  exist, or a subtly wrong option shape. Those would only surface via a real
  `npm run build`, which Vercel will run automatically the moment you deploy.
  If it throws an error there, paste it back and it's a fast fix.

## Project structure

```
app/
  page.js                      marketing landing page
  login/, signup/               auth pages
  dashboard/                    the business owner's app (auth-protected)
    page.js                     materials, edges, add-ons, pricing settings
    leads/page.js                lead inbox
    billing/page.js              subscription management
  embed/[slug]/page.js          the public customer-facing widget
  api/
    materials/, edges/, addons/, settings/, leads/    authenticated CRUD
    public/[slug]/config/        public: widget reads business config here
    public/[slug]/leads/         public: widget submits a lead here
    stripe/checkout/, stripe/webhook/   billing
lib/                            shared server/client helpers + pricing math
components/                     shared UI (NumberInput, the widget itself, nav)
supabase/schema.sql             the entire database, in one file
```
