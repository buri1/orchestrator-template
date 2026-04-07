# SaaS Factory Infrastructure

> **Rapid SaaS launch architecture: Turborepo monorepo with shared packages (auth, billing, UI, analytics), MakerKit boilerplate foundation, product validation funnel with Hormozi scoring, kill criteria, and portfolio economics projecting $12 launch cost and 4-8 hour time-to-deploy.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-saas-factory-design.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document specifies the complete SaaS Factory architecture for spinning up new products in hours, not days. The design combines a Turborepo monorepo with shared packages (auth via Clerk, billing via Stripe, UI via Shadcn, analytics via PostHog, database via Supabase, email via Resend), a proven starter kit (MakerKit at $299 one-time) as the foundation rather than building from scratch, agent-augmented development where Claude Code handles 95%+ of CRUD/feature coding, and a strict kill-or-continue validation funnel with clear metrics thresholds.

The key insight from research is that the fastest path is NOT building a custom boilerplate. It is using MakerKit (Next.js 16, React 19, Shadcn, Tailwind 4, hybrid account modes, payment gateway abstraction for Stripe/Paddle/Lemon Squeezy) as the foundation, extracting shared packages into a monorepo, and letting agents build custom features on top. The Pieter Levels counter-argument is noted: Pieter ships $3M+/yr with HTML, CSS, jQuery, PHP, and SQLite -- simplicity wins, and the SaaS Factory should be the ceiling of complexity allowed.

The economic model shows launch cost of ~$12 per product (domain only; all infrastructure on free tiers), maintenance cost of ~$1/month pre-revenue, and the portfolio math: launch 10 products at $120 total investment, if 1 hits $5K MRR = $60K ARR. At a 92% micro-SaaS failure rate within 18 months, the portfolio approach works because failure is cheap ($12) and fast (2 weeks to validate).

---

## Key Findings

### Boilerplate Selection

| Boilerplate | Price | Best For | Recommendation |
|-------------|-------|----------|----------------|
| **MakerKit** | $299 | B2B SaaS, multi-tenancy, complex billing | **Primary choice** -- deepest billing, payment gateway abstraction, hybrid account modes |
| **ShipFast** | $199 | Solo founders, maximum speed | Secondary -- ultra-fast throwaway MVPs, landing page + auth + payments in <1 day |
| **Supastarter** | $49/mo | Standard SaaS with Nuxt support | Alternative if Nuxt needed |
| **LaunchFast** | $79 | Multi-framework (Astro, SvelteKit) | Niche use cases |

### Shared Infrastructure Stack (All Free Tiers)

- **Auth**: Clerk ($0 to 10K MAU, $0.02/MAU after)
- **Payments**: Stripe (single account, multiple products, 2.9%+$0.30/txn)
- **Database**: Supabase (per-product project, 2 free projects, 500MB each)
- **Hosting MVP**: Vercel (free hobby tier)
- **Hosting Scale**: Coolify on Hetzner (EUR 5-17/mo, 85-97% cheaper than Vercel)
- **Email**: Resend (3K emails/mo free, React Email integration)
- **Analytics**: PostHog (1M events/mo free, session replay, feature flags, A/B tests)
- **DNS/CDN**: Cloudflare (free)
- **Monitoring**: Sentry (5K errors/mo free)

### Monorepo Structure

```
saas-factory/
  apps/
    product-a/       # Next.js app
    product-b/       # Next.js app
    _template/        # Template for new products
  packages/
    ui/               # Shared Shadcn components
    auth/             # Clerk wrapper
    billing/          # Stripe integration
    email/            # React Email + Resend
    analytics/        # PostHog wrapper
    database/         # Supabase client factory
    config-*/         # Shared ESLint/TS/Tailwind configs
```

**Rule**: Agents build features in `apps/product-x/`. Humans maintain `packages/`. This prevents one agent from breaking shared infrastructure.

### Product Validation Funnel

5 stages with hard kill criteria:
1. **IDEA** ($0, 1h): Hormozi test score >= 16/25 to proceed
2. **LANDING PAGE** ($12, 2-4h): >= 2% email signup rate after 500+ visitors
3. **FAKE DOOR** ($0, 1 day): >= 1% click-to-signup after 1,000+ visitors
4. **REAL MVP** ($0-50/mo, 1-2 weeks): >= 40% weekly retention after 4 weeks
5. **PRODUCT** ($50-200/mo, ongoing): >= $500 MRR after 3 months

### Agent-Augmented Development Speed

| Phase | Traditional | Agent-Augmented |
|-------|------------|----------------|
| Landing page | 1-2 days | 2-4 hours |
| Auth + billing | 3-5 days | Pre-built (0 hours) |
| Core MVP (CRUD) | 2-4 weeks | 3-7 days |
| Full product | 2-3 months | 2-4 weeks |
| **Idea to revenue** | **3-6 months** | **2-6 weeks** |

Agent sessions produce 30-70 commits/day. Human review bottleneck: 5-6 PRs/day, 3-4 hours cognitive limit. Recommended: 1 agent per product, max 3-4 concurrent (coordination overhead exponent 1.724 per DeepMind).

### Economics

- **Cost per product launch**: ~$12 (domain only)
- **Monthly maintenance pre-revenue**: ~$1/month
- **Boilerplate amortized**: $299 / 10 products = $30/product
- **Infrastructure margins by revenue**: $100-500 MRR = 70-90% margin; $500-2K MRR = 85-95%; $2K-10K MRR = 90-95%
- **Portfolio model**: 92% fail in 18 months, but at $12/launch the expected value is strongly positive even at 10% hit rate

### Product Lifecycle State Machine

IDEA -> (Hormozi < 16 -> DEAD) -> LANDING PAGE -> (signup < 2% -> DEAD) -> FAKE DOOR -> (click < 1% -> DEAD) -> MVP -> (retention < 40% -> DEAD) -> PRODUCT -> (MRR < $500 after 3mo -> DEAD) -> LIVE -> MAINTAIN ($500-2K) or SCALE ($2K+)

---

## Actionable Insights

- **Use MakerKit as the foundation, not a custom boilerplate**: The $299 investment saves weeks of auth/billing/multi-tenancy engineering that agents would do poorly
- **New product spin-up takes ~30 minutes**: Copy template app, create Supabase project, add Stripe product, configure env vars, deploy to Vercel
- **Kill fast and cheap**: The entire point of the factory is that $12 failures are acceptable; spending 2+ weeks validating before building an MVP prevents wasted agent compute
- **Vercel to Coolify migration is a 4000% cost reduction on bandwidth**: Vercel charges ~$40/100GB vs Hetzner ~$1/100GB; migrate when monthly bill exceeds $50
- **PostHog free tier covers multiple early-stage products**: 1M events/mo includes session replay, feature flags, and A/B testing -- critical for validation
- **Weekly pipeline rhythm**: Monday=metrics review + kill decisions, Tuesday=idea generation + Hormozi scoring, Wednesday=validation work, Thursday-Friday=agent-augmented building + review
- **Neon warning**: First connection takes 500ms-2s after scale-to-zero, multiple outages in 2025; fine for dev, risky for production

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | SaaS Factory is one of the five federated business lines in the portfolio architecture |
| [reference/hormozi-framework-encoding.md](hormozi-framework-encoding.md) | Hormozi test scoring (minimum 16/25) is the Stage 0 kill criteria; SaaS pricing tiers use Value Equation |
| [reference/notion-as-agent-backend.md](notion-as-agent-backend.md) | Products and Launches databases track the SaaS portfolio; Ideas database schema with Hormozi scoring fields |
| [reference/scaling-economics.md](scaling-economics.md) | Human review bottleneck (5-6 PRs/day) and coordination overhead exponent (1.724) apply to parallel agent strategy |
| [reference/lead-gen-pipeline-architecture.md](lead-gen-pipeline-architecture.md) | Cloudflare Pages hosting strategy shared; both use free tier infrastructure |
| [reference/legal-compliance-framework.md](legal-compliance-framework.md) | Terms of service, privacy policy, and DSGVO compliance apply to all SaaS products |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi Agent orchestrates Claude Code workers building SaaS features in isolated worktrees |
