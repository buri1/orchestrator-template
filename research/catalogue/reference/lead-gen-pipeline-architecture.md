# Lead Gen Pipeline Architecture

> **Complete automated lead generation swarm for the DACH market: local business discovery APIs, programmatic landing page generation, UWG-compliant multi-channel outreach, Hormozi-style upsell strategy, and unit economics projecting EUR 171K Year 1 profit.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-lead-gen-swarm-design.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document specifies a six-stage automated lead generation pipeline targeting German local businesses without websites. The pipeline flows from DISCOVER (scraping Google Maps and Gelbe Seiten for businesses without websites) through QUALIFY (DNS/email/phone validation + lead scoring) to BUILD (programmatic Next.js landing page generation on Cloudflare Pages at ~$0.04/page) to OUTREACH (multi-channel with physical mail, cold calling, and LinkedIn) to CLOSE (reply detection, Calendly booking, PandaDoc proposals, Stripe/Mollie SEPA payments) to DELIVER (domain transfer, analytics setup, automated upsell triggers).

The critical legal finding is that B2B cold email in Germany is prohibited without consent under UWG Section 7(2)(2) -- there is no "implied consent" exception for email as there is for phone. The compliant outreach strategy prioritizes physical mail (postcards with QR codes, legal, EUR 0.80-1.50/piece) and cold calling (legal with conditions under "mutmassliche Einwilligung"), with LinkedIn as a warm-up channel. Email remains high-risk and requires mitigation strategies if pursued.

The economic model projects break-even at 3 deals/month, with steady-state monthly revenue of EUR 18,490 at 60 active customers and EUR 1,400 operating cost (92% margin). Year 1 cumulative profit projection: EUR 171K on EUR 190K revenue, assuming 10 new customers/month from month 4 and 5% monthly churn from month 4.

---

## Key Findings

### Business Discovery: APIs and Tools

- **Outscraper (recommended primary)**: Pay-as-you-go, first 500 free, $3/1K records, built-in "without websites" filter, 10K/day throughput
- **Apify Gelbe Seiten actors (4+ available)**: Primary German directory scraper, ~$60/50K records, lead-focused with full data extraction
- **Open-source options**: omkarcloud/google-maps-scraper (50+ data points, email enrichment), gosom/google-maps-scraper (CLI + REST API, deployable to K8s)
- **"No website" detection**: Primary filter on scraped `website` field (null/empty = target), secondary DNS resolution check, tertiary placeholder detection (Wix free tier, parked domains)
- **Cost per qualified lead**: ~$0.06-0.10

### Programmatic Landing Pages

- **MVP (Landingi)**: $65/month, 100 pages/batch, 3 German-market templates (Gastronomie, Handwerk, Dienstleistung), 30 pages/day
- **Scale (custom Next.js + Cloudflare Pages)**: 5 industry templates, unlimited generation, $0 hosting, ~60 dev hours initial investment
- **Content per page**: Hero (business name + Google Maps embed), About (AI-generated from category + reviews), Services (from Maps categories), Reviews (top Google reviews with attribution), Contact (phone, email, hours), CTA
- **URL strategy**: Subdomain-based (`baeckerei-mueller-berlin.deine-webseite-demo.de`), wildcard DNS to Cloudflare, ~$10/year for domain

### Legal Framework: UWG Section 7

- **Cold calling**: ALLOWED with conditions (product must be directly relevant; web design IS relevant for a business without a website)
- **Cold email**: PROHIBITED without consent (UWG ss7(2)(2), no implied consent exception even in B2B)
- **Physical mail**: ALLOWED (no UWG restriction on postal advertising)
- **LinkedIn DM**: PROHIBITED without consent (same as email)
- **Risk mitigation for email**: Legitimate Interest Assessment, extreme relevance, value-first framing, immediate opt-out, low volume, separate legal entity consideration

### Compliant Multi-Channel Sequence

1. Day 0: Physical postcard with demo URL + QR code
2. Day 3: Cold call referencing postcard ("Haben Sie unsere Postkarte erhalten?")
3. Day 5: LinkedIn connection request (if owner found)
4. Day 7: Follow-up call if no response
5. Day 14: Second postcard with urgency ("Ihre Demo-Seite wird in 14 Tagen deaktiviert")

### Revenue Model (Hormozi Grand Slam Offer)

- **Tier 1 Starter**: EUR 499 one-time (landing page + domain + basic SEO + 1 year hosting)
- **Tier 2 Professional**: EUR 149/month (+ Google Business management + monthly updates + analytics)
- **Tier 3 Wachstum**: EUR 499/month (+ Google Ads management + local SEO + social media + review management + monthly strategy call)
- **Average customer LTV (12 months)**: EUR 4,699 (with 50% upsell rate on each service)
- **Guarantee**: 30-day unconditional money-back; actual cost per page ~EUR 20, profitable even at 20% refund rate

### Conversion Funnel (Per 1,000 Leads)

1,000 qualified leads -> 800 postcards sent -> 500 cold calls made -> 150-200 responses (15-20%) -> 50-70 demo views -> 15-25 meetings -> 8-15 closed deals (50-60% close rate with demo already built)

---

## Actionable Insights

- **Physical mail is the primary channel, not email**: This is counterintuitive but legally mandated in Germany; Deutsche Post DIALOGPOST provides bulk rates
- **The demo page IS the lead magnet**: It collapses perceived likelihood to near-certainty and time delay to near-zero, creating extreme Value Equation scores
- **SEPA Lastschrift is essential for German businesses**: They strongly prefer direct debit over credit card; Mollie supports SEPA natively
- **MVP tool cost is EUR 160-215/month**: Outscraper + Apify + Cloudflare (free) + Instantly + n8n + Calendly + Stripe transaction fees
- **Consult a German UWG/DSGVO attorney before any email campaigns**: A single unauthorized marketing email can trigger damages claims
- **German market nuances**: Always use "Sie" (formal), every commercial page needs Impressum (TMG ss5) and Datenschutzerklaerung, decision cycles are 2-4 weeks, avoid outreach during Betriebsferien (August, late December)

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/legal-compliance-framework.md](legal-compliance-framework.md) | UWG and DSGVO constraints that shape the outreach strategy |
| [reference/hormozi-framework-encoding.md](hormozi-framework-encoding.md) | Grand Slam Offer architecture, Value Equation scoring, and pricing tiers applied to local business services |
| [reference/master-blueprint.md](master-blueprint.md) | Lead gen is one of the five federated business lines; DSGVO isolation mandatory |
| [reference/notion-as-agent-backend.md](notion-as-agent-backend.md) | Campaign, Lead, and CRM database schemas for tracking the pipeline |
| [reference/saas-factory-infrastructure.md](saas-factory-infrastructure.md) | Cloudflare Pages hosting strategy shared with SaaS Factory |
| [reference/german-government-compliance.md](german-government-compliance.md) | Shared compliance requirements (Impressum, Datenschutzerklaerung) across both government and lead gen contexts |
