# SaaS Factory: Shared Infrastructure & Rapid Launch Architecture

**Date**: 2026-03-06
**Research Type**: Architecture Design + Evidence-Based Research (WebSearch)
**Scope**: 7 research domains, 16+ searches, synthesized into actionable blueprint

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Rapid SaaS Launch Frameworks](#2-rapid-saas-launch-frameworks)
3. [Shared Infrastructure Architecture](#3-shared-infrastructure-architecture)
4. [Monorepo vs Multi-Repo Strategy](#4-monorepo-vs-multi-repo-strategy)
5. [Product Validation Strategy](#5-product-validation-strategy)
6. [The Economics](#6-the-economics)
7. [Agent-Augmented SaaS Development](#7-agent-augmented-saas-development)
8. [SaaS Ideas Pipeline](#8-saas-ideas-pipeline)
9. [The Complete SaaS Factory Blueprint](#9-the-complete-saas-factory-blueprint)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Executive Summary

The SaaS Factory is a shared infrastructure and process architecture that enables spinning up new products in hours, not days. It combines:

- A **Turborepo monorepo** with shared packages (auth, billing, UI, analytics)
- **Pre-built boilerplate** for undifferentiated heavy lifting (auth, payments, email)
- **Agent-augmented development** where Claude Code handles 95%+ of CRUD/feature coding
- A **kill-or-continue framework** with clear metrics thresholds
- **Infrastructure that scales from $0 to $50/mo per product** in maintenance mode

**Key insight from research**: The fastest path is NOT building your own boilerplate from scratch. It's using a proven starter kit (MakerKit or ShipFast) as the foundation, extracting shared packages into a monorepo, and letting agents build custom features on top.

**The Pieter Levels lesson**: Pieter ships $3M+/yr with HTML, CSS, jQuery, PHP, and SQLite. No React, no Next.js, no Docker, no Kubernetes. Simplicity wins. The SaaS Factory should bias toward the simplest stack that works, adding complexity only when forced.

---

## 2. Rapid SaaS Launch Frameworks

### 2.1 Boilerplate Landscape (2026)

| Boilerplate | Price | Stack | Best For | Key Differentiator |
|-------------|-------|-------|----------|-------------------|
| **ShipFast** | $199 one-time | Next.js, Prisma, Clerk, Stripe, Tailwind, Resend | Solo founders, speed | Zero to deployed fastest; AI landing page copy |
| **MakerKit** | ~$299 one-time | Next.js 16, React 19, Shadcn, Tailwind 4, TypeScript 5 | B2B SaaS, multi-tenancy | Hybrid account modes, Stripe/Paddle/Lemon Squeezy gateway abstraction, deepest billing |
| **Supastarter** | From $49/mo | Next.js or Nuxt, Drizzle ORM | Standard SaaS | Solid multi-tenancy, Nuxt support |
| **LaunchFast** | $79 one-time | Astro, Next.js, or SvelteKit | Multi-framework | SEO, analytics, storage, auth, payments |

### 2.2 Recommendation

**Primary choice: MakerKit** ($299) for the SaaS Factory because:
- Supports personal-only, org-only, and hybrid account modes (covers B2C and B2B)
- Payment gateway abstraction (Stripe, Paddle, Lemon Squeezy) -- switch providers without code changes
- Seats, metered usage, complex pricing built in
- Built on Next.js 16 + React 19 + Shadcn + Tailwind 4 -- the 2026 standard stack
- Active maintenance and community

**Secondary choice: ShipFast** ($199) for ultra-fast throwaway MVPs where you just need a landing page + auth + payments in under a day.

### 2.3 The Pieter Levels Counter-Argument

Pieter Levels runs NomadList ($600K+/yr), RemoteOK, and PhotoAI ($138K/mo) on:
- Plain HTML, CSS, JavaScript, jQuery, PHP, SQLite
- Single VPS (no Docker, no Kubernetes, no React)
- Ships 40+ products, kills most, doubles down on winners

**Takeaway**: For pure validation, even a static HTML page with Stripe Checkout link works. Don't over-engineer validation. Only graduate to the full stack when a product proves demand.

---

## 3. Shared Infrastructure Architecture

### 3.1 Authentication

| Provider | Cost | DX | Best For | Shared Across Products? |
|----------|------|-----|----------|------------------------|
| **Clerk** | $0.02/MAU after 10K free | 15 min to working auth, pre-built React components | Speed, beautiful UIs | Yes -- single Clerk app with multiple redirect URLs, or separate apps per product |
| **Supabase Auth** | $0.00325/MAU after 50K free | Good, tight DB integration | Full-stack Supabase projects | Yes -- per-project Supabase instance with shared config |
| **NextAuth.js (Auth.js)** | Free (self-hosted) | 1-3 hours basic setup | Budget, data ownership | Yes -- shared package in monorepo |

**Recommendation**: **Clerk** for speed. At $0.02/MAU after 10K free, cost is negligible for early products. Switch to self-hosted Auth.js only if you hit 100K+ MAU and Clerk costs become material ($2K+/mo). MakerKit supports Clerk out of the box.

### 3.2 Payments

**Stripe** is the clear winner for the SaaS Factory model:

- **Single Stripe account, multiple products**: Create separate Products in Stripe Dashboard (Billing > Products). Each product gets its own pricing tiers (monthly, annual, usage-based).
- **No need for separate accounts** unless you have separate legal entities.
- **Handles**: Subscriptions, one-time payments, metered billing, per-seat pricing, upgrades, downgrades, cancellations, failed payments, tax calculation, webhook verification.
- **Stripe Connect**: Only needed if products involve marketplace/platform payments to third parties.

**Cost**: 2.9% + $0.30 per transaction (standard). No monthly fees.

**Key setup**: One Stripe account. One webhook endpoint per product (or a shared webhook router in the monorepo). Separate Product IDs per SaaS product.

### 3.3 Database

| Provider | Type | Free Tier | Best For | Per-Product or Shared? |
|----------|------|-----------|----------|----------------------|
| **Supabase** | Postgres + Auth + Storage + Realtime + Edge Functions | 2 free projects, 500MB DB | Full-stack platform | Per-product (separate Supabase project per SaaS) |
| **Neon** | Serverless Postgres | 0.5 GB storage, auto-suspend | Pure database needs | Per-product |
| **PlanetScale** | MySQL (now also Postgres) | No free tier since 2024 | Scale-proven (Cursor, Intercom) | Per-product |

**Recommendation**: **Supabase** for most products. You get Auth + DB + Storage + Realtime + Edge Functions in one platform. The free tier covers 2 projects with 500MB each -- enough for MVP validation.

**Warning on Neon**: First connection takes 500ms-2s after scale-to-zero. Multiple outages in 2025 including a 5.5-hour incident. Fine for dev, risky for production.

**Strategy**: Each product gets its own Supabase project (data isolation, independent scaling). Shared Supabase client config lives in the monorepo shared package.

### 3.4 Hosting

| Provider | Cost (MVP) | Cost (Growing) | Best For | Switch Point |
|----------|-----------|----------------|----------|-------------|
| **Vercel** | Free (hobby) | $20/mo Pro, but bandwidth $40/100GB | Pre-revenue MVPs, <1K users | Use until you hit PMF |
| **Coolify** (self-hosted) | $5-17/mo (Hetzner VPS) | Same VPS, add more as needed | Post-PMF, cost control | Switch when Vercel bill >$50/mo |
| **Hetzner VPS** | EUR 4.51/mo (CX22) | EUR 8-16/mo | Raw hosting, Docker | When you need full control |

**Recommendation**: **Two-phase approach**.

1. **Phase 1 (Validation)**: Vercel free tier. Zero config, instant deploys, generous free tier for multiple projects.
2. **Phase 2 (Post-PMF)**: Coolify on Hetzner VPS. 85-97% cost reduction vs Vercel at scale. One-hour setup. Docker-native, git-push deploys, SSL automatic.

**Key numbers**: Vercel charges ~$40/100GB bandwidth. Hetzner charges ~$1/100GB. That's a 4000% markup. At 500K monthly visitors, Vercel costs ~$601/mo vs Coolify ~$17-90/mo.

### 3.5 Transactional Email

| Provider | Free Tier | Paid | Best For |
|----------|-----------|------|----------|
| **Resend** | 3,000 emails/mo | $20/mo for 50K | Modern DX, React Email components |
| **Postmark** | None (30-day trial) | $15/mo for 10K | Best deliverability, proven track record |

**Recommendation**: **Resend** for the SaaS Factory. React Email integration means email templates live in the monorepo as React components. Free tier covers validation phase. MakerKit and ShipFast both integrate with Resend.

### 3.6 Analytics

| Provider | Free Tier | Self-Hosted? | Best For |
|----------|-----------|-------------|----------|
| **Plausible** | None ($9/mo) | Yes | Privacy-first, simple traffic analytics, no consent banners needed |
| **PostHog** | 1M events/mo free | Yes (but risky -- may sunset) | Full product analytics: events, funnels, session replay, A/B tests, feature flags |

**Recommendation**: **PostHog Cloud** (free tier). 1M events/mo covers multiple early-stage products. Includes session replay, feature flags, and A/B testing -- critical for product validation. Add Plausible later only if you need cookie-free public dashboards.

### 3.7 Complete Shared Infrastructure Stack

```
Authentication:  Clerk (free tier -> $0.02/MAU)
Payments:        Stripe (single account, multiple products)
Database:        Supabase (per-product project, free tier)
Hosting:         Vercel (free) -> Coolify/Hetzner (post-PMF)
Email:           Resend (free tier -> $20/mo)
Analytics:       PostHog (free tier, 1M events/mo)
DNS/CDN:         Cloudflare (free)
Monitoring:      Sentry (free tier, 5K errors/mo)
Domain:          ~$10-15/yr per product
```

---

## 4. Monorepo vs Multi-Repo Strategy

### 4.1 Decision Framework

| Factor | Monorepo (Turborepo) | Multi-Repo |
|--------|---------------------|------------|
| Shared UI components | Single source of truth | npm packages, version drift |
| Auth/billing updates | One change, all products updated | Update each repo separately |
| Agent coding context | Larger context, but scoped packages | Smaller context per repo |
| CI/CD complexity | Turborepo handles it | Simple per-repo |
| New product spin-up | Copy template app, import shared packages | Clone template repo |
| Breaking changes | Caught immediately | Caught at package update time |

### 4.2 Recommendation: Monorepo with Turborepo

**Why**: Once you cross the "two apps + shared bits" threshold, monorepo wins. The SaaS Factory is designed for 5-10+ products sharing auth, billing, UI, and analytics.

**Structure**:

```
saas-factory/
  apps/
    product-a/          # Next.js app
    product-b/          # Next.js app
    product-c/          # Next.js app
    _template/          # Template app for new products
  packages/
    ui/                 # Shared Shadcn components
    auth/               # Clerk wrapper, middleware, hooks
    billing/            # Stripe integration, pricing tables, webhooks
    email/              # React Email templates + Resend client
    analytics/          # PostHog wrapper, event definitions
    database/           # Supabase client factory, shared types
    config-eslint/      # Shared ESLint config
    config-typescript/  # Shared TypeScript config
    config-tailwind/    # Shared Tailwind config
  tooling/
    scripts/            # Product scaffolding scripts
    templates/          # Landing page templates, email templates
  turbo.json
  package.json
```

### 4.3 New Product Spin-Up Process

```bash
# 1. Copy template app
cp -r apps/_template apps/new-product

# 2. Update package.json (name, description)
# 3. Create Supabase project (free tier)
# 4. Add Stripe Product + Prices
# 5. Configure environment variables
# 6. Deploy to Vercel (auto-detected from monorepo)

# Total time: ~30 minutes for a new product skeleton
# with auth, billing, landing page, and analytics working
```

### 4.4 Agent Coding Compatibility

Agents work well with monorepos when scoped:
- Each product is a self-contained Next.js app
- Agent context: `apps/product-x/` + relevant `packages/`
- Shared packages are stable APIs that agents consume, not modify
- CLAUDE.md per product can scope agent behavior

**Rule**: Agents build features in `apps/product-x/`. Humans maintain `packages/`. This prevents one agent from breaking shared infrastructure.

---

## 5. Product Validation Strategy

### 5.1 The Validation Funnel

```
Stage 0: IDEA (cost: $0, time: 1 hour)
  |  Hormozi test, competitor analysis, ICP definition
  |  Kill criteria: fails 2+ Hormozi criteria
  v
Stage 1: LANDING PAGE (cost: $10-15 domain, time: 2-4 hours)
  |  Problem -> Solution -> CTA ("Join waitlist")
  |  Drive traffic: Twitter, Reddit, ProductHunt upcoming
  |  Kill criteria: <2% email signup rate after 500+ visitors
  v
Stage 2: FAKE DOOR MVP (cost: $0 extra, time: 1 day)
  |  Add "Buy Now" or "Start Free Trial" button
  |  Track clicks (PostHog), collect payment intent
  |  Kill criteria: <1% click-to-signup after 1000+ visitors
  v
Stage 3: REAL MVP (cost: $0-50/mo infra, time: 1-2 weeks)
  |  Build core feature only (agent-augmented)
  |  Manual onboarding for first 10 users
  |  Kill criteria: <40% weekly retention after 4 weeks
  v
Stage 4: PRODUCT (cost: $50-200/mo infra, time: ongoing)
  |  Full feature set, automated onboarding
  |  Kill criteria: <$500 MRR after 3 months
  v
Stage 5: SCALE or MAINTAIN
  |  >$2K MRR: invest in growth
  |  $500-2K MRR: maintain (low-cost, profitable)
  |  <$500 MRR at 6 months: kill or sell
```

### 5.2 The Hormozi Test for SaaS Ideas

Score each idea 1-5 on these criteria (minimum total: 16/25 to proceed):

| Criterion | Score 1-5 | Description |
|-----------|-----------|-------------|
| **Pain** | _ | How painful is the problem? (5 = "hair on fire") |
| **Purchasing Power** | _ | Can the target audience pay? (5 = enterprise budgets) |
| **Easy to Target** | _ | Can you reach them cheaply? (5 = specific online communities) |
| **Growing Market** | _ | Is the market expanding? (5 = trending upward, new category) |
| **Unique Mechanism** | _ | Do you have a novel approach? (5 = AI-native, unique data) |

**Formula**: I help [WHO] get [GOOD STUFF] without [BAD STUFF].

### 5.3 Speed Benchmarks (Agent-Augmented)

| Phase | Traditional | Agent-Augmented |
|-------|------------|----------------|
| Landing page | 1-2 days | 2-4 hours |
| Auth + billing | 3-5 days | Pre-built (0 hours) |
| Core MVP (CRUD) | 2-4 weeks | 3-7 days |
| Full product | 2-3 months | 2-4 weeks |
| Total: idea to revenue | 3-6 months | 2-6 weeks |

---

## 6. The Economics

### 6.1 Cost Per Product Launch

| Item | One-Time Cost | Monthly Cost (MVP) | Monthly Cost (Maintenance) |
|------|--------------|-------------------|--------------------------|
| Domain | $10-15/yr | - | $1/mo amortized |
| Boilerplate (MakerKit) | $299 (shared) | - | $0 (amortized across products) |
| Supabase (free tier) | $0 | $0 | $0 (under limits) |
| Vercel (free tier) | $0 | $0 | $0 (under limits) |
| Clerk (free tier) | $0 | $0 | $0 (under 10K MAU) |
| Stripe | $0 | 2.9% + $0.30/txn | 2.9% + $0.30/txn |
| Resend (free tier) | $0 | $0 | $0 (under 3K emails/mo) |
| PostHog (free tier) | $0 | $0 | $0 (under 1M events/mo) |
| Cloudflare (free) | $0 | $0 | $0 |
| **Total per product** | **~$12** | **~$1/mo** | **~$1/mo** |

**Key finding**: With free tiers, a new product costs ~$12 to launch (domain only) and ~$1/mo to maintain pre-revenue. The boilerplate investment ($299) amortizes to $30/product after 10 products.

### 6.2 Cost at Scale (Post-Free-Tier)

| Revenue Level | Typical Infra Cost | Margin |
|---------------|-------------------|--------|
| $0-100 MRR | $1-5/mo | Negative (validation phase) |
| $100-500 MRR | $10-30/mo | 70-90% |
| $500-2K MRR | $30-100/mo | 85-95% |
| $2K-10K MRR | $100-500/mo | 90-95% |
| $10K+ MRR | $500-2K/mo (Coolify) | 90-95% |

### 6.3 Kill Criteria (Hard Thresholds)

| Metric | Threshold | Timeframe | Action |
|--------|-----------|-----------|--------|
| Waitlist signups | <50 emails | 2 weeks after landing page | Kill |
| Email signup rate | <2% of visitors | After 500+ visitors | Kill |
| Free trial conversion | <5% | After 100+ trials | Pivot or kill |
| Weekly retention (D7) | <40% | After 4 weeks | Pivot or kill |
| Monthly churn | >10% | After 3 months | Fix or kill |
| MRR | <$500 | After 3 months of sales | Kill |
| MRR | <$2K | After 6 months of sales | Maintain-only or kill |
| CAC > LTV | Any time | Ongoing | Fix acquisition or kill |
| Net revenue retention | <80% | After 6 months | Serious concern |

### 6.4 The Portfolio Model

The math behind launching many products:

- **92% of micro-SaaS fail within 18 months** (industry data)
- If you launch 10 products at $12 each = $120 total investment
- Infrastructure cost while validating: ~$10/mo total for all 10
- If 1 out of 10 hits $5K MRR = $60K ARR from $120 + $120 infrastructure
- **ROI**: Even with a 10% hit rate, the portfolio model works because launch cost is near-zero

**Target portfolio**: 3-5 products in active development, 2-3 in maintenance mode, kill the rest.

---

## 7. Agent-Augmented SaaS Development

### 7.1 What Agents Can and Cannot Do

**Fully automatable (let agents handle)**:
- CRUD operations (database models, API routes, forms)
- UI components and pages (given design system)
- API integrations (third-party services)
- Test writing (unit, integration, E2E)
- Database migrations and schema changes
- Landing page copy and layout
- SEO metadata and sitemap generation
- Documentation

**Use pre-built boilerplate (do NOT let agents build from scratch)**:
- Authentication and authorization
- Billing and subscription management
- Webhook handling (Stripe, etc.)
- Session management
- CSRF/XSS protection
- Rate limiting

**Requires human judgment**:
- Product positioning and messaging
- Pricing strategy
- UX decisions (information architecture, user flows)
- Market selection and ICP definition
- Kill/continue decisions
- Security review of agent-generated code
- Legal compliance (terms, privacy policy)

### 7.2 The Claude Code SaaS Workflow

Based on the OnboardingHub case study (713 commits, 55 days, 95%+ AI-authored):

```
1. PLAN (Human, 30 min)
   - Define feature as Linear ticket
   - Write acceptance criteria
   - Specify which shared packages to use

2. BUILD (Agent, 1-4 hours)
   - Claude Code reads project structure
   - Writes code across multiple files
   - Runs test suite
   - Iterates on failures autonomously
   - Creates commit

3. REVIEW (Human, 15-30 min)
   - Review PR diff
   - Check security-sensitive code
   - Verify UX matches intent
   - Approve or request changes

4. DEPLOY (Automated)
   - Merge triggers Vercel/Coolify deploy
   - PostHog tracks feature adoption
   - Sentry catches errors
```

**Observed patterns**: AI agent sessions produce 30-70 commits/day, minutes apart. A full feature (including tests) takes 1-4 hours of agent time. Human review is the bottleneck at 5-6 PRs/day, 3-4 hours cognitive limit.

### 7.3 Agent Prompt Architecture for SaaS Features

Each product in the monorepo gets a CLAUDE.md:

```markdown
# Product: [Name]

## Architecture
- Framework: Next.js 16 (App Router)
- Auth: @saas-factory/auth (Clerk)
- Billing: @saas-factory/billing (Stripe)
- DB: @saas-factory/database (Supabase)
- UI: @saas-factory/ui (Shadcn)

## Conventions
- All pages in app/(dashboard)/
- API routes in app/api/
- Server actions in lib/actions/
- Database queries in lib/queries/
- Types in types/

## Current Sprint
- [Feature]: [Description]
- [Feature]: [Description]
```

### 7.4 Parallel Agent Strategy

For maximum throughput across multiple products:

| Strategy | Agents | Throughput | Risk |
|----------|--------|-----------|------|
| Serial (1 agent, 1 product) | 1 | 1 feature/2-4 hrs | Low |
| Parallel by product (1 agent per product) | 3-4 | 3-4 features/2-4 hrs | Medium (merge conflicts in shared packages) |
| Parallel by feature (multiple agents, 1 product) | 2-3 | 2-3 features/2-4 hrs | High (same-file conflicts) |

**Recommendation**: 1 agent per product, max 3-4 concurrent (per your Phase 2 finding: optimal agent team is 3-4, coordination overhead is super-quadratic at 1.724 exponent).

---

## 8. SaaS Ideas Pipeline

### 8.1 Notion Database Schema

```
Ideas Database:
  - Name (title)
  - Status (select): Idea | Evaluating | Validating | Building | Live | Maintaining | Dead
  - Hormozi Score (number, /25)
  - Pain Score (number, 1-5)
  - Purchasing Power (number, 1-5)
  - Easy to Target (number, 1-5)
  - Growing Market (number, 1-5)
  - Unique Mechanism (number, 1-5)
  - ICP (text): "I help [WHO] get [GOOD STUFF] without [BAD STUFF]"
  - Competitors (multi-select)
  - Revenue Model (select): Subscription | Usage | One-time | Hybrid
  - Target MRR (number)
  - Current MRR (number)
  - Landing Page URL (url)
  - Waitlist Size (number)
  - Signup Rate (number, %)
  - Weekly Retention (number, %)
  - Monthly Churn (number, %)
  - Launch Date (date)
  - Kill Date (date)
  - Post-Mortem (text)
  - Domain (text)
  - Supabase Project (text)
  - Stripe Product ID (text)
  - Vercel Project (text)
  - Git Path (text): apps/product-name/
```

### 8.2 Idea Generation Sources

Systematic scanning of:

1. **Pain mining**: Reddit (r/SaaS, r/startups, r/smallbusiness), Twitter/X complaints, G2 negative reviews, ProductHunt "alternatives" requests
2. **Trend riding**: Google Trends, Exploding Topics, HN front page patterns
3. **Workflow gaps**: What manual tasks do you do repeatedly? What spreadsheets do people share?
4. **API arbitrage**: New APIs (AI models, data sources) that enable products that weren't possible 6 months ago
5. **Regulation-driven**: New compliance requirements (EU AI Act, Colorado AI Act) create software needs
6. **Unbundling**: Take one feature from a bloated SaaS and make it 10x better

### 8.3 Weekly Pipeline Rhythm

```
Monday:    Review metrics for all live products. Kill/continue decisions.
Tuesday:   Idea generation session (30 min). Score new ideas with Hormozi test.
Wednesday: Validation work on top idea (landing page, ads, outreach).
Thursday:  Agent-augmented building on validated products.
Friday:    Agent-augmented building + review PRs + deploy.
Weekend:   Products run autonomously. Check Sentry for errors only.
```

---

## 9. The Complete SaaS Factory Blueprint

### 9.1 Technology Stack (Final)

```
Layer           | Choice              | Cost (per product)  | Why
----------------|---------------------|--------------------|-----------------------
Framework       | Next.js 16          | $0                 | Industry standard, Vercel-native
UI              | Shadcn + Tailwind 4 | $0                 | Copy-paste components, full control
Auth            | Clerk               | $0 (free tier)     | 15-min setup, pre-built UIs
Database        | Supabase (Postgres) | $0 (free tier)     | DB + Auth + Storage + Realtime
Payments        | Stripe              | 2.9% + $0.30/txn   | Single account, multi-product
Email           | Resend              | $0 (free tier)     | React Email, 3K free/mo
Analytics       | PostHog             | $0 (free tier)     | 1M events, session replay, flags
Hosting (MVP)   | Vercel              | $0 (free tier)     | Zero-config deploys
Hosting (Scale) | Coolify + Hetzner   | EUR 5-17/mo          | 97% cheaper than Vercel
DNS/CDN         | Cloudflare          | $0 (free tier)     | DDoS, caching, SSL
Error Tracking  | Sentry              | $0 (free tier)     | 5K errors/mo
Monorepo        | Turborepo + pnpm    | $0                 | Caching, parallel builds
Boilerplate     | MakerKit            | $299 (one-time)    | Auth, billing, multi-tenancy
ORM             | Drizzle             | $0                 | Type-safe, lightweight
```

### 9.2 Architecture Diagram

```
                    saas-factory/ (Turborepo monorepo)
                    |
    +---------------+---------------+
    |               |               |
  apps/           packages/       tooling/
    |               |               |
  product-a/      ui/            scripts/
  product-b/      auth/          templates/
  product-c/      billing/
  _template/      email/
                  analytics/
                  database/
                  config-*/

Each product deploys independently:
  product-a -> Vercel (or Coolify)  -> product-a.com
  product-b -> Vercel (or Coolify)  -> product-b.com

Each product has its own:
  - Supabase project (database)
  - Stripe Product (billing)
  - Clerk application (auth)
  - PostHog project (analytics)
  - Domain + Cloudflare zone

Shared across all products:
  - Stripe account (one)
  - Resend account (one)
  - Sentry organization (one)
  - Git repository (one)
  - CI/CD pipeline (Turborepo-optimized)
```

### 9.3 New Product Launch Checklist

```
[ ] 1. Hormozi test score >= 16/25
[ ] 2. ICP statement written: "I help [WHO] get [GOOD STUFF] without [BAD STUFF]"
[ ] 3. Domain purchased (~$12)
[ ] 4. Copy apps/_template to apps/new-product
[ ] 5. Create Supabase project (free tier)
[ ] 6. Create Clerk application
[ ] 7. Create Stripe Product + Prices
[ ] 8. Create PostHog project
[ ] 9. Configure Cloudflare DNS
[ ] 10. Set environment variables in Vercel
[ ] 11. Agent builds landing page (2-4 hours)
[ ] 12. Deploy to Vercel
[ ] 13. Drive traffic (Twitter, Reddit, PH Upcoming)
[ ] 14. Track waitlist signups for 2 weeks
[ ] 15. Decision: build MVP or kill

Total time: 4-8 hours
Total cost: ~$12
```

### 9.4 Product Lifecycle State Machine

```
                  Hormozi < 16
IDEA ---------> DEAD
  |
  | Hormozi >= 16
  v
LANDING PAGE ---> DEAD (signup rate < 2% after 500 visitors)
  |
  | signup rate >= 2%
  v
FAKE DOOR ------> DEAD (click rate < 1% after 1000 visitors)
  |
  | click rate >= 1%
  v
MVP ------------> DEAD (retention < 40% after 4 weeks)
  |
  | retention >= 40%
  v
PRODUCT --------> DEAD (MRR < $500 after 3 months)
  |
  | MRR >= $500
  v
LIVE -----------> MAINTAIN ($500-2K MRR, minimal investment)
  |               or DEAD (MRR declining, churn > 10%)
  | MRR >= $2K
  v
SCALE (invest in growth, marketing, features)
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1)

- [ ] Purchase MakerKit license ($299)
- [ ] Set up Turborepo monorepo structure
- [ ] Extract shared packages (auth, billing, ui, analytics, database, email)
- [ ] Create product template app (`apps/_template`)
- [ ] Set up Stripe account with test mode
- [ ] Set up Clerk, Supabase, PostHog, Resend accounts
- [ ] Set up Notion ideas database with Hormozi scoring
- [ ] Write CLAUDE.md for monorepo and template app

### Phase 2: First Product (Week 2)

- [ ] Score top 5 ideas with Hormozi test
- [ ] Launch landing page for #1 idea (agent-built, 4 hours)
- [ ] Drive traffic for 2 weeks
- [ ] If validated: agent builds MVP (1-2 weeks)
- [ ] If not validated: kill, launch landing page for #2 idea

### Phase 3: Pipeline (Week 3+)

- [ ] Weekly rhythm: validate 1 new idea, build on 1 validated product
- [ ] Target: 1 new landing page per week, 1 new MVP per month
- [ ] Monthly portfolio review: kill underperformers, double down on winners

### Phase 4: Scale Infrastructure (When Needed)

- [ ] Migrate winning products from Vercel to Coolify/Hetzner
- [ ] Migrate from Clerk to self-hosted Auth.js if MAU costs are high
- [ ] Add Plausible for public-facing analytics dashboards
- [ ] Consider separate Stripe accounts if products need different legal entities

---

## Key Takeaways

1. **Launch cost is effectively $12** (one domain). Free tiers cover everything else.
2. **Time to launch is 4-8 hours** with the SaaS Factory monorepo template.
3. **Agent-augmented development cuts build time by 4-10x** but auth/billing/security should use pre-built boilerplate.
4. **Kill fast**: 92% of micro-SaaS fail within 18 months. The advantage is making failure cheap ($12) and fast (2 weeks to validate).
5. **The Pieter Levels principle**: Simplicity wins. Don't over-engineer validation. The SaaS Factory is the ceiling of complexity you should allow yourself -- most products won't need even half of it.
6. **Portfolio model**: Launch 10, expect 1-2 winners. At $12/launch and $1/mo maintenance, the portfolio approach is economically rational.
7. **Human bottleneck**: Review capacity is 5-6 PRs/day. Agents ship faster than you can review. Batch reviews, use confidence scoring, auto-accept low-risk changes.

---

## Sources

### Rapid SaaS Launch Frameworks
- [ShipFast - Launch Your Startup in Days](https://shipfa.st/)
- [Best Next.js SaaS Templates (2026): 12 Boilerplates Ranked](https://designrevision.com/blog/best-nextjs-saas-templates)
- [Supastarter - SaaS Starter Kit](https://supastarter.dev/)
- [5 Best Next.js SaaS Boilerplates in 2026 (Honest Comparison)](https://dev.to/wsdevguy/5-best-nextjs-saas-boilerplates-in-2026-honest-comparison-4346)
- [MakerKit - SaaS Starter Kit Comparison (2026)](https://makerkit.dev/saas-starter-kit)
- [MakerKit vs SupaStarter](https://makerkit.dev/makerkit-vs-supastarter)
- [LaunchFast - Production-Ready SaaS Starter Kits](https://www.launchfa.st/)

### Pieter Levels
- [How Pieter Levels Built a $3M/Year Business with Zero Employees](https://www.fast-saas.com/blog/pieter-levels-success-story/)
- [How I Build My Minimum Viable Products (levels.io)](https://levels.io/how-i-build-my-minimum-viable-products/)
- [How Pieter Levels Runs Multiple $1M+ AI Products](https://buildloop.ai/how-pieter-levels-runs-multiple-1m-ai-products-with-automation-zero-team/)
- [Pieter Levels Makes $600k a Year from Nomad List and Remote OK](https://www.nocsdegree.com/pieter-levels-learn-coding/)

### Shared Infrastructure
- [The Ultimate Guide to Building a Monorepo in 2026](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa)
- [How We Organize Our Monorepo to Ship Fast (Graphite)](https://graphite.com/blog/how-we-organize-our-monorepo-to-ship-fast)
- [Monorepo Starter: Next.js & Turborepo Template (Vercel)](https://vercel.com/templates/next.js/monorepo-turborepo)
- [Why I Converted My Turborepo Monorepo Back to One App](https://medium.com/@koriigami/i-built-a-monorepo-then-converted-back-to-a-single-app-heres-why-b799413a3476)

### Authentication
- [Clerk vs Supabase Auth vs NextAuth.js: The Production Reality](https://medium.com/better-dev-nextjs-react/clerk-vs-supabase-auth-vs-nextauth-js-the-production-reality-nobody-tells-you-a4b8f0993e1b)
- [Best Auth Provider Comparison: Clerk vs Auth0](https://designrevision.com/blog/auth-providers-compared)

### Payments
- [Stripe SaaS Integration Documentation](https://docs.stripe.com/saas)
- [Multiple SaaS Products via Stripe (Indie Hackers)](https://www.indiehackers.com/post/multiple-saas-products-via-stripe-best-practices-ad32d6eeaf)
- [Stripe Billing for Multi-Entity Business](https://docs.stripe.com/billing/multi-entity-business)

### Database
- [Supabase vs PlanetScale vs Neon: Best Serverless DB](https://getsabo.com/blog/supabase-vs-neon)
- [Neon vs PlanetScale vs Supabase (Bejamas)](https://bejamas.com/compare/neon-vs-planetscale-vs-supabase)
- [Best Database Software for Startups and SaaS (2026)](https://makerkit.dev/blog/tutorials/best-database-software-startups)
- [Serverless PostgreSQL 2025: The Truth](https://dev.to/dataformathub/serverless-postgresql-2025-the-truth-about-supabase-neon-and-planetscale-7lf)

### Hosting
- [Vercel vs Coolify (2026): The DevOps Tax & Self-Hosted PaaS Guide](https://leonstaff.com/blogs/vercel-vs-coolify-cost-analysis/)
- [Vercel vs Self-Hosted Coolify: The True Cost Comparison 2026](https://massivegrid.com/blog/vercel-vs-self-hosted-coolify-cost-comparison/)
- [10 Best Next.js Hosting Providers in 2026](https://makerkit.dev/blog/tutorials/best-hosting-nextjs)

### Email
- [Resend vs Postmark (2026) - Transactional Email Comparison](https://www.sequenzy.com/versus/resend-vs-postmark)
- [Postmark vs Resend Comparison (2026)](https://forwardemail.net/en/blog/postmark-vs-resend-email-service-comparison)

### Analytics
- [PostHog vs Plausible In-Depth Comparison](https://posthog.com/blog/posthog-vs-plausible)
- [The Solopreneur Analytics Stack 2026](https://f3fundit.com/the-solopreneur-analytics-stack-2026-posthog-vs-plausible-vs-fathom-analytics-and-why-you-should-ditch-google-analytics/)

### Product Validation
- [How I Validated My Micro-SaaS Idea Quickly (Indie Hackers)](https://www.indiehackers.com/post/how-i-validated-my-micro-saas-idea-quickly-and-you-can-too-53decf45b9)
- [Building a Landing Page MVP: 5 Proven Steps](https://www.maxiomtech.com/building-a-landing-page-mvp/)
- [Quick Validation Strategies for SaaS Startups](https://www.vldt.ai/blog/quick-validation-saas-startups)

### Economics & Kill Criteria
- [SaaS Metrics 2.0 (For Entrepreneurs)](https://www.forentrepreneurs.com/saas-metrics-2/)
- [The SaaS Metrics That Matter (David Sacks)](https://sacks.substack.com/p/the-saas-metrics-that-matter)
- [92% of Micro SaaS Fail Within 18 Months](https://www.rockingweb.com.au/18-month-rule-micro-saas-startup-failure-analysis/)
- [Friends, Come Warm Yourselves by the Flaming Wreckage of My Micro-SaaS](https://www.indiehackers.com/post/friends-come-warm-yourselves-by-the-flaming-wreckage-of-my-micro-saas-93d393b07f)

### Agent-Augmented Development
- [Building a Complete SaaS Product with Only Claude Code](https://world.hey.com/cpinto/building-a-complete-saas-product-with-only-claude-code-cca13895)
- [How to Build SaaS Quickly in 2026: AI Agents, Boilerplates, and Vibe Coding](https://makerkit.dev/blog/saas/how-to-build-saas-quickly)
- [2026 Agentic Coding Trends Report (Anthropic)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [Inside the Development Workflow of Claude Code's Creator (InfoQ)](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)

### Hormozi Framework
- [Validating Business Ideas with the Alex Hormozi Test](https://blog.businessplanfactory.com/posts/validating-business-ideas-with-the-Alex-Hormozi-test-feature-in-business-plan-factory)
- [$100M Framework to Identify Your Market](https://superframeworks.com/blog/how-to-pick-market)

### Ideas Pipeline
- [SaaS Ideas Tracker Template (Notion)](https://www.notion.com/templates/saasideastracker)
- [SaaS Idea Validator Template (Notion)](https://www.notion.com/templates/saas-idea-validator-software-as-a-service)
