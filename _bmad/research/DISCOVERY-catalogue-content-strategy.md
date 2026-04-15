# Research Catalogue Discovery: Content Strategy & Personal Branding

**Compiled:** 2026-04-05
**Scope:** Comprehensive search of research catalogue and related files
**Focus Areas:** Content strategy, personal branding, content engines, social media automation, voice AI, YouTube strategy
**Key Practitioners:** IndyDevDan, Alex Hormozi, Yawan/Yolanda Zhang, YouTube creators, social media automation experts

---

## Executive Summary

This discovery document consolidates all content strategy, personal branding, and automation-related research from the orchestrator catalogue. The findings reveal three distinct opportunity clusters:

1. **Hormozi Framework for Content Monetization** — Complete business architecture for lead generation → sales → content engine
2. **IndyDevDan Content Strategy** — Transparent personal brand building through weekly educational content, open-source contributions, and multi-channel distribution
3. **AI Content Factory Pattern** — Multi-agent swarm orchestration for TikTok Shop and social commerce (e.g., Maverick + Nano Banana + Kling)

Additionally, the _bmad research directory shows Burak's emerging focus on **MAYTT** (content generation platform for TikTok/social) and **Notion Portfolio Architecture** for business line management.

---

## Part 1: Core Content Strategy Research

### 1.1 Hormozi Framework System Encoding
**Source:** `/research/2026-03-06_research-hormozi-system-encoding.md`
**Type:** Complete business architecture research

#### What It Covers

Alex Hormozi's frameworks encoded as agent-executable system prompts:

1. **The Value Equation** (Core diagnostic tool)
   ```
   VALUE = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
   ```
   - Scoring: 1-10 per variable
   - Score < 1.0 = commodity; 1.0-3.0 = decent; 3.0-10.0 = strong; > 10.0 = Grand Slam

2. **Grand Slam Offer Creation** (7-step process)
   - Identify dream outcome
   - List 20+ problems/obstacles
   - Convert problems to solutions
   - Design delivery vehicles (attention level × effort × medium × speed)
   - Trim and stack
   - Apply Five Enhancers (Scarcity, Urgency, Bonuses, Guarantees, MAGIC Naming)
   - Price for value, not cost

3. **MAGIC Naming Formula** (M=Magnet, A=Avatar, G=Goal, I=Interval, C=Container)
   - Examples: "The 6-Week Lean Body Blueprint," "CEO Revenue Accelerator for SaaS Founders"

4. **Core Four Lead Generation** (2×2 matrix: you do it vs others do it, 1:1 vs 1:many)
   - Warm Outreach (ACA Framework: Acknowledge, Compliment, Ask)
   - Cold Outreach (3rd-grade reading level)
   - Free Content (Hook-Retain-Reward, 98% value / 2% asks)
   - Paid Ads (only after organic proven)
   - **Rule of 100:** Pick one channel, do it 100 consecutive days

5. **CLOSER Sales Framework** (C=Clarify, L=Label, O=Overview, S=Sell Vacation, E=Explain Away, R=Reinforce)
   - Complete branching scripts with objection handling

6. **Content Engine** (Hook-Retain-Reward methodology)
   - Hook: Grab attention (1-3 seconds)
   - Retain: Keep engagement with stories, open loops
   - Reward: Deliver on the hook's promise
   - **Give-to-Ask Ratio:** Minimum 3.5:1 (pure value before monetization)

#### Key Takeaways for Burak

- **Offer Architect agent:** Implements 6-phase process (discovery → Value Equation re-score → Grand Slam Document)
- **Lead Machine agent:** Avatar deep dive, lead magnet options (3), Core Four channel strategy, Rule of 100 implementation
- **Sales Script Builder:** CLOSER variants with A/B testing, objection handling matrix, close rate tracking
- **Content Engine agent:** 50-hook library, 5 post templates (Framework, Story, Myth-Bust, Value Bomb, CTA), 30-day calendar

**Notion Integration Schema:**
- Offers DB (with Value Equation scoring, MAGIC components, guarantee types)
- Leads DB (qualification scoring, Hormozi funnel stages)
- Content Calendar DB (Hook-Retain-Reward templates, Give-to-Ask ratio tracking)
- Sales Scripts DB (CLOSER variants, A/B testing, close rate tracking)
- Avatars DB (demographics, psychographics, pain points, trust influencers)

#### Actionable Patterns

- **The Value Equation is diagnostic:** Score any offer before building it; if < 3.0, redesign
- **Encode frameworks as context files, not prompts:** Store in `/context/hormozi/` with one file per framework
- **Connected system is the moat:** No existing tool connects offer → leads → sales → content
- **Local business "48-Hour Launch System":** Achieves 72x Value Score (zero time delay + zero effort + visible demo)
- **Content audit requirement:** All agent-generated content must hit 3.5:1 give-to-ask minimum

---

### 1.2 Lead Generation Swarm Design
**Source:** `/research/2026-03-06_research-lead-gen-swarm-design.md`
**Type:** Multi-agent automation architecture

#### What It Covers

Automated lead generation for local businesses (Germany/DACH focus). The architecture demonstrates **multi-agent swarm orchestration applied to B2B/B2C lead gen:**

1. **Local Business Discovery**
   - Google Maps API (official, $2-30 per 1K requests)
   - Outscraper (Google Maps scraper, $3 per 1K records after 500 free)
   - Apify Gelbe Seiten actors (~$60 per 50K records for German market)
   - "No website" detection via null/empty website field

2. **Programmatic Landing Page Generation**
   - **MVP:** Landingi programmatic pages ($65/mo, 100 pages/batch)
   - **Scale:** Custom Next.js templates + Cloudflare Pages (unlimited free sites, global CDN)
   - **AI enhancement:** Use Claude to generate copy from business data
   - **URL strategy:** Subdomain-based (bäckerei-mueller-berlin.deine-webseite-demo.de)

3. **Cold Email Infrastructure** (Germany-Specific Legal Constraints)
   - **CRITICAL:** UWG Section 7 prohibits cold email without consent in Germany (even B2B)
   - **Legal channels:** Physical mail (postcards/letters), cold calling (with implied consent for relevant products)
   - **High-risk mitigation:** Legitimate Interest Assessment (LIA), value-first framing ("free demo"), immediate opt-out, low volume, LinkedIn warm-up
   - **Sending platforms:** Instantly ($47/mo), Smartlead ($39/mo), Mailforge ($2.50-3/mailbox/mo)
   - **Best practice:** 4-6 domains, personal name mailboxes (max.mueller@), 30-50 emails/day after warmup, SPF+DKIM+DMARC required

4. **Personalization at Scale**
   - Data points: business name, owner/contact, category, address, phone, rating, reviews, photos, social presence
   - Level 1: Template variables (minimum viable)
   - Level 2: AI-generated customization (Claude-based, category-specific)
   - Level 3: Behavioral targeting (referrer history, engagement patterns)

#### Key Takeaways for Burak

- **The "Swarm Pattern":** Multiple agents (discovery, page generation, email warmup, follow-up) coordinated through state files
- **Deduplication required:** Unique constraint on (business, page, email_variant) prevents duplicate work
- **Legal compliance layer:** For German/EU expansion, cold email strategy must be defensive (physical mail + calling primary, email secondary with mitigation)
- **Economics:** ~$3-5 per qualified lead; landing page hosting effectively free (Cloudflare); email sending ~$0.02-0.03 per message

---

### 1.3 Notion Portfolio Architecture: Multi-Business Agent Backend
**Source:** `/research/2026-03-06_research-notion-portfolio-architecture.md`
**Type:** Data layer architecture

#### What It Covers

Notion as the coordination backend for a multi-business portfolio (Burak's stated architecture):

1. **Notion Capabilities for Agents** (March 2026)
   - Notion 3.3: Custom Agents, 24/7 autonomous operation on triggers/schedules
   - Official Notion MCP Server: 60K+ repos adopting AGENTS.md convention
   - Enhanced Markdown API: Create, read, update page content via markdown

2. **Rate Limit Reality Check**
   - 3 req/sec (180/min, 2700/15min) — bottleneck at 5+ parallel agents
   - 100 items per page — pagination required for large queries
   - 10K rows per DB — data volume ceiling
   - Rollup on rollup not supported — pre-compute in agent code

3. **Hub-and-Spoke Portfolio Model**
   - **Hub:** Single Portfolio Dashboard with rollups from all business lines
   - **Spokes:** Business-line-specific databases
   - **Hierarchy:** Atomic (Tasks, Contacts) → Aggregate (Projects, Campaigns) → Portfolio (Business Lines) → Executive (Dashboard)

4. **22 Database Schema** (Burak's portfolio architecture)
   - **Level 4 (Executive):** Portfolio Dashboard
   - **Level 3 (Business Lines):** Business Lines DB
   - **Level 2 (Cross-Cutting):** Projects, Tasks, Contacts, Revenue, Knowledge Base, Time Log
   - **Level 2 (Business-Specific):** 
     - Client Work: Contracts, Deliverables
     - SaaS Factory: Products, Launches
     - Lead Gen: Campaigns, Leads
     - **Marketing: Offers, Content Calendar** ← Content strategy hub
   - **Existing Finance Agent:** 7 DBs (Glaubiger, Fristen, E-Mail Entwürfe, etc.)

5. **Notion MCP Integration with Claude Code**
   - OAuth (interactive) vs Internal Integration Token (automated)
   - Batch writes with 300ms delays
   - Check-before-create idempotency pattern
   - Markdown API preferred for page content
   - Retry with exponential backoff on 429

#### Key Takeaways for Burak

- **Offers DB:** Stores Value Equation scores, MAGIC naming components, guarantee types — feeds into Content Calendar
- **Content Calendar DB:** Tracks post templates (Framework, Story, Myth-Bust, Value Bomb, CTA), Hook-Retain-Reward structure, give-to-ask ratio per post
- **Contacts/CRM DB:** Avatar profiles, pain points, trust influencers — segmentation for targeted content
- **Revenue Tracking DB:** Correlates content performance (post → lead → conversion → revenue)
- **Caching strategy:** In-memory (30s), local file JSON (5min for config), Notion API (source of truth)
- **Performance ceiling:** Suitable for meta-layer + human interface; use local files for high-frequency logs/metrics

---

## Part 2: Personal Brand Strategy Research

### 2.1 IndyDevDan Strategic Vision Analysis
**Source:** `/catalogue/practitioners/indydevdan.md` + `/research/2026-03-05_indydevdan-strategic-vision-analysis.md`
**Type:** Practitioner profile + strategy deep-dive

#### What It Covers

Dan Disler's personal brand strategy centered on **transparent content creation + open-source + educational courses + multi-channel distribution:**

1. **Background & Track Record**
   - 10+ years software engineering experience
   - Bet his decade on agentic software (2024-2034)
   - 20+ open-source repos, consistently updated
   - 2 paid courses (Principled AI Coding: 6h; Tactical Agentic Coding: advanced)
   - Weekly YouTube releases (Mondays, 8 AM CST)
   - 87% win rate on publicly tracked 2024 GenAI predictions
   - External validation: Andrej Karpathy shoutout, awesome-claude-code inclusion

2. **Content Platforms & Distribution**
   - [YouTube](https://youtube.com/@IndyDevDan) — Weekly uploads, 40+ min deep dives
   - [Blog](https://indydevdan.com/) — Long-form essays, relationship challenges, financial transparency
   - [GitHub](https://github.com/disler) — 20+ repos demonstrating frameworks
   - [Gumroad](https://indydevdan.gumroad.com/) — Paid courses for revenue
   - [Twitter/X](https://x.com/IndyDevDan) — Real-time takes, quick insights
   - [Agentic Engineer](https://agenticengineer.com/) — Main hub/portal

3. **Core Content Themes**
   - **Agentic Engineering as Discipline:** Coined the term, teaching customization-as-moat
   - **80/20 Portfolio Strategy:** 80% Claude Code (market leader), 20% Pi Agent (open-source hedge)
   - **"Tools Shape What You Believe":** Customization expands cognitive boundaries
   - **"Knowing is Engineering; Not Knowing is Vibe Coding":** Emphasis on observability and understanding
   - **Trust as Highest-Leverage Investment:** 2026 is "Year of Trust"
   - **Context > Prompt > Model:** Over-index on context and prompt design

4. **Key Products & IP**
   - Courses: Principled AI Coding, Tactical Agentic Coding
   - Open-source harnesses: Pi Agent extensions, fork-repository-skill, single-file-agents
   - Tools: claude-code-hooks-multi-agent-observability, benchy (LLM benchmark), beyond-mcp analysis
   - Meta-agents: Big 3 Super Agent (OpenAI voice + Claude code + Gemini browser), Pi-Pi (8 domain experts)

5. **Three-Tier Progression Model** (Used in courses)
   - Tier 1 (Harness Basics): UI customization, focus mode → Personalized workflow
   - Tier 2 (Agent Orchestration): Teams, chains, dispatchers → 2-5x throughput
   - Tier 3 (Meta-Agents): Agents building agents → Compounding returns

#### Key Takeaways for Burak

- **Transparency as moat:** Dan documents relationship challenges, financial struggles, painful transitions — this credibility with engineers is his brand asset
- **Rule of consistency:** Monday 8 AM CST releases for years = trust that audience can depend on
- **Multiple revenue streams:** 80/20 between free (YouTube, blog, open-source) and paid (courses, consulting)
- **Educational positioning:** Teaches practitioners how to achieve what he demonstrates — builds community buy-in
- **Specialization beats scale:** ~700 LOC TypeScript extensions compete with 1.2M LOC systems (270:1 ratio) — focus > breadth
- **Observability first:** Hook-based monitoring (Hook Scripts → HTTP → SQLite → WebSocket → Vue) validates every claim
- **Context preservation through Skills:** MCP causes "instant context loss"; Skills within orchestrator maintain context

---

### 2.2 IndyDevDan Pi CEO Agents Talk
**Source:** `/catalogue/talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md`
**Type:** Video content analysis (40 min talk)

#### What It Covers

Dan's CEO Agent pattern applied to strategic decision-making (not just coding):

1. **Thesis:** Strategic decision-making is the highest-leverage use of multi-agent systems
   - Instead of agents as worker bees, deploy them for "uncertainty → decisions"
   - Seven specialized Claude 1M context agents debating pros/cons/constraints
   - Output: Clear, actionable strategic memo

2. **Key Innovation:** Claude 1M context at flat pricing
   - Opus 4.6 & Sonnet 4.6 maintain useful retrieval past 256K (where others degrade)
   - Enables board-of-agents pattern with massive context per agent

3. **Architecture Details**
   - Customized Pi agent harness running seven agents
   - Each agent holds domain expertise (e.g., legal, financial, technical, market)
   - Structured orchestration pattern with debate flows
   - Workflow compounds over time as harness learns

#### Key Takeaways for Burak

- **Multi-agent for strategic, not just tactical:** Burak's orchestrator is already doing this at infrastructure level; CEO Agent pattern validates the architecture choice
- **1M context enables richer briefings:** Instead of 20K context files, agents can hold comprehensive domain context
- **Pi harness customization reference:** When evaluating Pi migration, use Dan's walkthrough (09:23-15:27)

---

## Part 3: Content Automation & Social Commerce

### 3.1 AI Content Factory: TikTok Shop E-Commerce
**Source:** `/catalogue/posts/2026-01/maverickecom-ai-content-factory-tiktok-shop.md`
**Type:** Practitioner case study

#### What It Covers

Noah Frydberg's fully automated TikTok Shop content pipeline (Multi-Platform Swarm):

1. **Tech Stack** ($300/month replaces $50K+ budget)
   - Manus: Product research + viral script ideas
   - Nano Banana Pro: AI image generation (UGC-style)
   - Kling 2.6: AI video generation
   - Custom phone posting network: Automated account creation + posting

2. **Pipeline Steps**
   1. Research niche, scrape winning TikTok Shop videos
   2. Rebuild with new hooks, angles, UGC-style visuals
   3. Create and post daily to affiliate accounts
   4. Zero touchpoints, no delays
   5. Shoppable videos going live, GMV compounding weekly

3. **Multi-Platform Swarm (MPS) Strategy**
   - Once a concept works on TikTok Shop, flood niche with variations
   - Hundreds of AI agents deployed across accounts
   - All driving back to Shop + Amazon listings
   - CPMs as low as $0.10 (compared to Facebook ads in 2008)

4. **Results Metrics**
   - No paid ads, no ghost creators, no wasted samples
   - 1,144 replies on post (high engagement = validation)

#### Key Takeaways for Burak

- **Multi-agent swarm for commerce:** Validates swarm orchestration pattern beyond software engineering
- **Content → Commerce funnel:** Video generation → posting → metrics → optimization
- **Rapid iteration:** A/B testing at scale with AI-generated variants
- **Integration point for MAYTT:** This is the real-world use case for MAYTT's video generation + posting infrastructure

---

### 3.2 Voice AI & Agent Interfaces
**Sources:** 
- `/catalogue/posts/2026-03/leeleepenkman-dictator-flow-voice-control.md` (Voice control)
- `/catalogue/posts/2026-04/willowvoiceai-atlas1-stt-model.md` (STT models)

#### What It Covers

1. **Dictator Flow** — Voice-controlled computer operation
   - Low engagement (66 likes, 8.6K views) — early-stage/niche
   - Voice as input modality (different from CLI/prompts)
   - Challenges: accuracy, latency, error surface

2. **Atlas 1 STT Model** (Willow Voice AI)
   - New speech-to-text model beating ElevenLabs, Deepgram
   - Viral engagement (791K views, 2,272 likes) — validates STT interest
   - Competitive STT market evolving with new entrants

#### Key Takeaways for Burak

- **Voice input for agents:** Outside current orchestration scope but emerging category
- **STT quality improving:** Could become relevant for voice-based agent interaction in future
- **Content strategy angle:** Voice agents + personal branding = emerging creator niche (IndyDevDan's "Big 3 Super Agent" uses OpenAI Realtime API)

---

## Part 4: MAYTT Platform Research (Emerging)

### 4.1 MAYTT Product Requirements Document
**Source:** `_bmad/MAYTT-PRD.md`
**Type:** Active product specification

#### What It Covers

MAYTT = Multi-purpose AI YoYo Template platform for content generation

**Phase 1: Core Pipeline (Wk 1-2)**
- Supabase setup (schema, auth, RLS)
- Asset management (Google Drive integration)
- Remotion templates for TikTok video combinations
- Remotion player preview
- Lambda rendering + S3 output
- Combinatorial generator with deduplication
- Airtable data migration

**Phase 2: Social Media Integration (Wk 3-4)**
- Account management (OAuth for TikTok, Instagram, YouTube)
- Direct posting APIs
- Content scheduling queue (BullMQ)
- Content calendar UI

**Phase 3: Dashboard & AI Studio (Wk 5-6)**
- Metrics dashboard (views, likes, comments, shares)
- Performance comparison (overlay text, product, influencer)
- AI generation studio (Explore, Compare, Benchmark modes)
- ELO rating system

**Phase 4: Automation & Advanced (Wk 7-8)**
- Playwright TikTok Shop product linking
- Multi-account isolation (browser profiles)
- CPL monitoring dashboard
- AI agent for NL → Remotion template adaptation
- Campaign system

#### Key Takeaways for Burak

- **MAYTT validates AI content factory thesis:** This is Burak's implementation of Maverick's pattern
- **Notion integration missing:** Current PRD doesn't mention Notion portfolio architecture integration — opportunity to add metrics + analytics rollup to MAYTT dashboard
- **Content metadata layer:** MAYTT tracks overlay, product, influencer separately — enables Hook performance analysis (Hormozi pattern)

---

## Part 5: Catalogued Content & Brand Resources

### 5.1 Content Creator & Platform Entries
**Sources:** `/catalogue/general-interest/` and `/catalogue/posts/`

#### Goda Go (AI Productivity YouTuber)
- **URL:** https://www.youtube.com/@godago
- **Followers:** 100K+
- **Focus:** AI tools tutorials, prompt engineering, AI productivity workflows
- **Audience:** "Regular user to AI power user" pipeline
- **Distribution:** YouTube + AI Productivity Hub community + conference speaking + consulting
- **Relevance:** Potential distribution channel for consumer-facing tools; content creation patterns inform SaaS marketing

#### Key Posts Reviewed
1. **Figma Remote MCP + Brand Guide Workflow** (0xSero)
   - Design-to-code pipeline: Figma → brand guide → components
   - Intermediate artifact pattern reduces hallucination
   - Relevance: OmniPort-HH workflow could use Figma MCP for design token extraction

2. **Grok Social Media Growth Claims** (Sabir Hussain)
   - Marketing hype post, low signal
   - Claims Grok as social media agency replacement

3. **Unbounded Agent Skills** (Brendan Falk)
   - Skills-based agent orchestration
   - Relevance: Validates Skills > MCP pattern (IndyDevDan's thesis)

---

## Part 6: Adoptable Patterns for Burak

From `/catalogue/ADOPTABLE-PATTERNS.md`, patterns directly applicable to Burak's content strategy:

### High Priority

1. **Hallucination Guard** (Zero Tool Call Rejection)
   - Workers that complete with zero tool calls are rejected as fabricated
   - Prevents $25+ in wasted inference per milestone
   - **Application:** Content calendar agent must verify posts were actually created in scheduling system

2. **PreCompletionChecklist Middleware**
   - Before worker signals done: verify tests pass, no uncommitted changes, lint clean
   - **Application:** Before content posts go live, verify they're in scheduling queue + metrics tracking enabled

3. **"Engineered Enough" Complexity Gate**
   - Evaluate whether plan is overbuilt, underbuilt, or "engineered enough"
   - Before writing code → Before generating content
   - **Application:** Add to MAYTT content generation prompts: assess if overlay/audio/transition choices are proportionate to the message

4. **Adaptive Roadmap Reassessment**
   - After each story completes, reassess remaining stories
   - Plan evolves based on what was learned
   - **Application:** MAYTT: After each batch of videos analyzes metrics, reorder remaining batches based on performance trends

5. **ccusage Token & Cost Tracking**
   - Zero-install Claude Max usage analytics
   - Tracks cost per merged PR; extended to cost per published post
   - **Application:** MAYTT dashboard should track cost-per-view, cost-per-engagement

### Medium Priority

1. **Autonomous Context Compression**
   - Model chooses when to compact rather than hard limits
   - Model recognizes "I won't need this conversation segment again"
   - **Application:** Content calendar agent self-summarizes old posts before compaction

2. **Scoped Completion Aggregation**
   - Scope child completion announcements to current requester run
   - Prevents stale outputs from previous cycles
   - **Application:** MAYTT: Only count metrics from current posting cycle, discard previous cycle's metrics

---

## Part 7: Content Strategy Framework Integration

### How Burak's Projects Interconnect

```
MAYTT (Video Generation Platform)
  └── Generates Hook-Retain-Reward content per Hormozi
      └── Posts to TikTok/IG/YT via social APIs
          └── Metrics tracked in Notion Content Calendar DB
              └── Performance analyzed for overlay/product/influencer effectiveness
                  └── Results feed back to offer → lead gen → sales cycle
                      └── Orchestrator agents manage entire funnel
```

### Recommended Content Strategy for Burak

Based on research, Burak should consider:

1. **Personal Brand Pillars** (IndyDevDan model)
   - Educational content: "How to build AI orchestrators"
   - Case studies: Client wins, technical challenges
   - Behind-the-scenes: Transparent about failures (like Dan's relationship/financial posts)
   - Open-source: Publish patterns discovered in projects

2. **Content Cadence** (Dan's model)
   - **Weekly deep dives** (40-60 min YouTube): Detailed exploration of one pattern
   - **Bi-weekly blog posts** (1500-2000 words): Long-form thinking, lessons learned
   - **Daily X/Twitter** (threading): Hot takes, quick insights, engagement
   - **Quarterly courses** (on Gumroad): Packaged expertise for practitioners

3. **Multi-Platform Distribution**
   - YouTube: Deep technical dives (target: agenticengineer.com audience)
   - Blog: Long-form philosophy + transparency
   - Twitter: Real-time takes + community engagement
   - GitHub: Open-source orchestrator patterns, example harnesses
   - Notion: Public portfolio showing MAYTT metrics, lead gen results (transparency)

4. **Offer Architecture** (Hormozi model)
   - **Tier 1:** Free YouTube + blog content (Hook-Retain)
   - **Tier 2:** Gumroad courses ($97-297) on orchestrator patterns, MAYTT setup
   - **Tier 3:** Consulting/contract work (premium positioning after establishing brand)

5. **Lead Generation** (Core Four)
   - **Warm outreach:** Email previous clients, existing community
   - **Cold outreach:** Find companies using Claude Code, share orchestrator patterns
   - **Free content:** MAYTT case studies, public metrics from MAYTT campaigns
   - **Paid ads:** Scale what organic proves (later phase)

---

## Part 8: Knowledge Encoding Strategy

### Recommended File Structure for Content IP

```
/context/
  /hormozi/
    /offer-architect.md          — Value Equation, Grand Slam 7-step process
    /lead-machine.md             — Core Four, Rule of 100, Lead Magnet 7-step
    /sales-script-builder.md     — CLOSER framework, objection handling
    /content-engine.md           — Hook-Retain-Reward, Give-to-Ask ratio, 5 templates
  /indydevdan/
    /three-tier-model.md         — Harness Basics, Agent Orchestration, Meta-Agents
    /agentic-engineering.md      — "Knowing is Engineering", customization as moat
    /trust-framework.md          — Observability, testing, justified confidence
  /maytt/
    /content-generation.md       — Remotion templates, video combinations, rendering
    /social-publishing.md        — OAuth flows, native scheduling, rate limits
    /metrics-tracking.md         — Views, engagement, ELO rating, performance comparison
```

### Agent Routing (CLAUDE.md)

```markdown
## Content Strategy Agents

**Offer Architect** → context/hormozi/offer-architect.md
**Lead Machine** → context/hormozi/lead-machine.md
**Sales Script Builder** → context/hormozi/sales-script-builder.md
**Content Engine** → context/hormozi/content-engine.md
**MAYTT Generator** → _bmad/MAYTT-PRD.md + /maytt/ context files
**Metrics Analyst** → /notion/Content-Calendar schema + ELO algorithm
```

---

## Part 9: Quick Reference — Key Metrics & KPIs

From research, Burak should track:

### Content Performance (Hook Level)
- **Views per post:** Baseline engagement
- **Engagement rate:** (Likes + Comments + Shares) / Views
- **Hook effectiveness:** Time-to-first-engagement (e.g., like in first 10s)

### Offer Performance (Hormozi)
- **Value Equation score:** (DO × PL) / (TD × ES) — target > 3.0
- **Lead magnet conversion:** Free content viewers → email list
- **Offer acceptance rate:** Interested prospects → customers
- **Customer lifetime value:** Revenue per customer relationship

### Content Calendar (Give-to-Ask)
- **Give-to-ask ratio:** Minimum 3.5:1 (value posts : promotional posts)
- **Post count:** Target 30+ per month per platform
- **A/B test results:** Which post format drives engagement

### MAYTT Metrics
- **Video combination count:** Overlays × Products × Influencers
- **Render success rate:** Completed renders / Total attempts
- **Cost per view:** Total API costs / Total views across all videos
- **CPL (Cost Per Lead):** Total costs / Leads generated (if e-commerce integration)

---

## Part 10: Immediate Next Steps

**Week 1:**
- [ ] Review Hormozi framework encoding; extract Key 5 principles for agent prompts
- [ ] Decide on personal brand positioning (education + transparency + open-source)
- [ ] Map MAYTT → Hormozi content engine (how do metrics feed back to offer testing)

**Week 2:**
- [ ] Create `/context/hormozi/` and `/context/indydevdan/` context files
- [ ] Add Content Calendar DB to Notion portfolio (if not already present)
- [ ] Plan first 4 weeks of content (YouTube + blog + X cadence)

**Week 3-4:**
- [ ] Publish 1 long-form blog post on orchestrator patterns
- [ ] Record 1 YouTube deep-dive (40-60 min)
- [ ] Launch MAYTT beta with metrics tracking

**Week 5+:**
- [ ] Analyze engagement data; iterate content strategy based on hook performance
- [ ] Create first Gumroad course outline (Orchestrator Fundamentals)
- [ ] Scale paid ads to channels with proven organic traction

---

## Appendix: Source Documents

| Document | Type | Relevance | Location |
|----------|------|-----------|----------|
| Hormozi System Encoding | Architecture | 10/10 | `/research/2026-03-06_research-hormozi-system-encoding.md` |
| Lead Gen Swarm Design | Architecture | 9/10 | `/research/2026-03-06_research-lead-gen-swarm-design.md` |
| Notion Portfolio Architecture | Architecture | 9/10 | `/research/2026-03-06_research-notion-portfolio-architecture.md` |
| IndyDevDan Profile | Practitioner | 10/10 | `/catalogue/practitioners/indydevdan.md` |
| IndyDevDan Strategic Vision | Deep Dive | 9/10 | `/research/2026-03-05_indydevdan-strategic-vision-analysis.md` |
| IndyDevDan CEO Agents Talk | Video | 8/10 | `/catalogue/talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md` |
| Maverick Content Factory | Case Study | 8/10 | `/catalogue/posts/2026-01/maverickecom-ai-content-factory-tiktok-shop.md` |
| Goda Go YouTube Channel | Creator | 5/10 | `/catalogue/general-interest/goda-go-ai-youtube-channel.md` |
| Figma Brand Guide Workflow | Tool Integration | 7/10 | `/catalogue/posts/2026-02/0xsero-figma-mcp-brand-guide-workflow.md` |
| MAYTT PRD | Product | 10/10 | `_bmad/MAYTT-PRD.md` |
| MAYTT Product Brief | Product | 10/10 | `_bmad/MAYTT-PRODUCT-BRIEF.md` |
| Adoptable Patterns Backlog | Patterns | 9/10 | `/catalogue/ADOPTABLE-PATTERNS.md` |
| Catalogue INDEX | Reference | 9/10 | `/catalogue/INDEX.md` |

---

**End of Discovery Document**

*This document synthesizes research conducted April 2026 and provides actionable patterns for Burak's content strategy, personal brand building, and MAYTT platform development.*
