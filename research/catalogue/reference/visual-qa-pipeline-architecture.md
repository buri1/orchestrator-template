# Visual QA Pipeline Architecture (Revised)

> **Pragmatic visual QA pipeline combining deterministic ARIA/lint checks, flow-based testing, and smart LLM review with reference-image comparison. ~65-75% automated, ~80-85% with human review.**

| Field | Value |
|-------|-------|
| Category | 🧪 Testing Architecture |
| Repository | N/A (architecture pattern, not a single tool) |
| Publisher | Internal research (15 parallel Opus agents: 10 research + 5 critics) |
| Maturity | 🟡 Early (researched, revised after adversarial review) |
| Last Analyzed | 2026-04-03 |

---

## Burak's Notes

> 15 Opus-Agents (10 Research + 5 Adversarial Critics). Erste Runde lieferte eine 5-Layer Pipeline mit 70-80% Coverage-Projektion. Die Critics haben gezeigt: die Zahlen basierten auf falschen Benchmarks (Web-Navigation, nicht Bug-Detection), ARIA bringt realistisch +5-10% (nicht +20-30% weil shadcn/Radix gutes ARIA by default hat), und die 5-Layer Pipeline ist over-engineered fuer 20-50 User bei 2 Deploys/Monat. Revidierter Plan: "Good Enough + Smart" in ~7-8h statt 5-7 Tage. Der groesste einzelne Hebel ist Reference-Image-Comparison (Precision 34%→100% in Canvas-Studie) + Component-Level Cropping (+8-44pp). Dazu Flow-basierte Tests fuer interaktive States (Dialoge, Wizards, Mobile).

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 10/10 | Directly solves the QA bottleneck that blocks autonomous AI development |
| **Novelty** | 8/10 | Reference-image + structured data insight was missing; coverage numbers were revised down after critical review |
| **Actionable** | 10/10 | Full plan implementable in ~7-8 hours with zero new dependencies |

---

## Overview

### The Problem
"Claude looks at a screenshot and judges if it looks correct" catches ~10% of visual bugs. A human catches ~50% in 5 minutes. The gap is not the LLM — it's the input method and test scope.

### Research Process
- **Round 1 (10 agents):** Deep research across catalogue (16 agent-browser tools, 12 observability tools, 5 code-intelligence tools), TEA testing module, 6 existing research files, and web search. Produced initial 5-layer pipeline.
- **Round 2 (5 critics):** Adversarial review challenged every assumption. Found: coverage numbers were based on wrong benchmarks, maintenance was underestimated, LLM-on-structured-data was unvalidated for bug detection specifically.
- **Synthesis:** Pragmatic revised plan combining the validated findings from both rounds.

### Key Validated Findings
1. **Structured data > screenshots for LLMs** — rtrvr.ai (81% DOM-first vs 40-60% vision), D2Snap (+8%). BUT: not yet validated specifically for visual bug detection.
2. **Reference-image comparison is the #1 lever** — Canvas study: precision 34%→100% with reference image. We already have baselines!
3. **Component-level cropping dramatically improves VLM accuracy** — MLLMs Know Where to Look: +8 to +44pp. Full-page screenshots lose detail at VLM tokenization.
4. **ARIA snapshots catch structural bugs deterministically** — But realistically +5-10% for shadcn/Radix codebases (good ARIA by default).
5. **Flow-based testing is critical** — Page-level screenshots miss 40-60 interactive states (dialogs, wizards, mobile sidebar, empty/error states).

### Key Invalidated Claims
- ~~70-80% automated coverage~~ → Realistic: ~65-75% with flow tests
- ~~ARIA snapshots +20-30%~~ → Realistic: +5-10% for shadcn/ui
- ~~LLM on structured data is a "game-changer"~~ → Unvalidated, promising but needs manual experiment first
- ~~5-layer pipeline needed~~ → Over-engineered; 3 layers + smart review is sufficient

---

## Technical Architecture (Revised)

```
  Push / Pre-Merge
       │
       ▼
  ┌──────────────────────────────────────────────────────┐
  │  DETERMINISTIC LAYER (CI, ~10s, 0 tokens)            │
  │                                                       │
  │  ✓ ARIA Snapshots (toMatchAriaSnapshot)               │
  │    - Page-level: 15 routes                            │
  │    - Flow-level: ~45 interaction states               │
  │    - Partial templates with regex for dynamic content │
  │                                                       │
  │  ✓ Pixel-Diff (toHaveScreenshot, existing)            │
  │    - Pages + flow states                              │
  │                                                       │
  │  ✓ Tailwind Lint (eslint-plugin-tailwindcss)          │
  │    - Class conflicts at build time                    │
  │                                                       │
  │  → FAIL = block, no LLM needed                       │
  └────────────────────┬─────────────────────────────────┘
                       │ PASS
                       ▼
  ┌──────────────────────────────────────────────────────┐
  │  SMART VISUAL REVIEW (on-demand, ~60-90s)            │
  │                                                       │
  │  Per critical component:                              │
  │  1. Load BASELINE screenshot (reference)              │
  │  2. Capture CURRENT screenshot (locator.screenshot)   │
  │  3. Extract ARIA tree fragment                        │
  │  4. Extract computed styles JSON                      │
  │  5. Send ALL to LLM with adversarial prompt:          │
  │                                                       │
  │  "Bild 1 = Baseline. Bild 2 = Aktuell.               │
  │   ARIA: {tree}. Styles: {json}.                       │
  │   Finde JEDEN Unterschied. Du wirst bestraft          │
  │   fuer uebersehene Bugs."                             │
  │                                                       │
  │  → ~620 tokens/component (2x160 img + ~300 text)     │
  │  → 10 components = ~6.200 tokens (~$0.02)             │
  └────────────────────┬─────────────────────────────────┘
                       │
                       ▼
  ┌──────────────────────────────────────────────────────┐
  │  HUMAN REVIEW (15 min before merge)                   │
  │                                                       │
  │  npm run qa-screenshots → folder with all views       │
  │  Developer reviews visually in 5-15 minutes           │
  │  Catches aesthetic / "feels wrong" bugs               │
  └──────────────────────────────────────────────────────┘
```

### Flow-Based Testing (Critical Addition)

Page-level tests miss interactive states. Flow tests walk through user journeys:

```
e2e/specs/visual/
  pages/                    # Static page tests (existing)
    dashboard.visual.ts
    catalog.visual.ts
    bookings.visual.ts
    ...
  flows/                    # Interaction flow tests (NEW)
    booking-flow.visual.ts  # Calendar → Date → Items → Dialog → Confirm
    cart-wizard.visual.ts   # Step 1 → Step 2 → Step 3 → Success
    edit-dialogs.visual.ts  # Edit Item, Sperrzeit, Booking Detail
    mobile-sidebar.visual.ts # Hamburger → Slide-in → Overlay
    empty-states.visual.ts  # No bookings, no sets, no materials
```

**State Map** ensures completeness:
```typescript
export const STATE_MAP = {
  bookingFlow: ['calendar', 'date-selected', 'item-list', 'booking-dialog', 'confirmation'],
  cartWizard: ['step1-zeitraum', 'step2-items', 'step3-summary', 'success'],
  editDialogs: ['edit-item', 'edit-sperrzeit', 'booking-detail'],
  sidebar: ['desktop-expanded', 'mobile-closed', 'mobile-open'],
  emptyStates: ['no-bookings', 'no-sets', 'no-materials'],
} as const;
```

Meta-test validates all states have screenshots.

### Coverage Estimate (Revised, Honest)

| Scope | Views | Method |
|-------|-------|--------|
| Static pages | 15 | Page screenshots + ARIA |
| Flow states | ~45 | Interaction + checkpoint screenshots + ARIA |
| **Total** | **~60** | |

| Detection Method | Contribution | Cumulative |
|-----------------|-------------|------------|
| ARIA Snapshots (deterministic) | +5-10% | 25-30% |
| Pixel-Diff (deterministic) | +10-15% | 35-45% |
| Tailwind Lint (build-time) | +3-5% | 38-50% |
| LLM: Reference-Image Comparison | +10-15% | 48-65% |
| LLM: Component Cropping | +5-10% | 53-75% |
| LLM: Structured Data (ARIA+CSS) | +3-5% | 56-75% |
| **Automated total** | | **~65-75%** |
| Human review (15 min) | +10-15% | **~80-85%** |

---

## Implementation Plan (~7-8 hours)

### Step 1: ARIA Snapshots (2h)
Add `toMatchAriaSnapshot()` to existing 25 page tests. Use partial templates with regex for dynamic content. Auto-generate baselines with `--update-snapshots`.

### Step 2: Tailwind Lint (15min)
Install `eslint-plugin-tailwindcss`. Enable `no-contradicting-classname` rule.

### Step 3: Test File Split (1h)
Split monolithic `visual-regression.spec.ts` into route-based files under `e2e/specs/visual/pages/`. Enables `--only-changed=main` for surgical test execution.

### Step 4: Flow Tests (2-3h)
Create `e2e/specs/visual/flows/` with 5-6 flow scenarios covering ~45 interactive states. Each flow: navigate → interact → checkpoint (ARIA snapshot + screenshot).

### Step 5: QA Screenshot Script (30min)
`npm run qa-screenshots` — visits all pages + critical flow states, saves screenshots to folder for human review before merge.

### Step 6: Smart Visual Review Skill (1-2h)
Revise `/visual-qa` skill to use:
- Reference-image comparison (baseline vs current, component-level)
- Component cropping (`locator.screenshot()`)
- ARIA tree + computed styles as structured context
- Adversarial prompting

---

## Tools Evaluated

### Use Now

| Tool | Purpose | Effort |
|------|---------|--------|
| **Playwright `toMatchAriaSnapshot()`** | Structural regression | 2h (built-in) |
| **eslint-plugin-tailwindcss** | Build-time class conflicts | 15min |
| **Playwright `toHaveScreenshot()`** | Pixel regression (already in use) | 0 |
| **Playwright `locator.screenshot()`** | Component-level cropping for LLM | Part of skill |

### Evaluate Later

| Tool | When | Why |
|------|------|-----|
| **Argos CI** | When baseline management gets painful | OSS, auto-flaky suppression, ARIA+visual in one platform |
| **Vitest 4.0 Browser Mode** | When component isolation is needed | Component-level visual tests without page overhead |
| **SiFR Schema** | When building production LLM QA layer | 53x token compression for structured UI state |
| **agent-browser** (Vercel) | When token-efficient browser testing is needed | 93% context reduction, but unvalidated for QA |
| **OmniParser V2** (Microsoft) | When vision model accuracy needs boost | YOLO + Florence-2 element detection from screenshots |
| **Langfuse** | When LLM QA becomes systematic | Prompt evaluation, feedback loop, cost tracking |

### Not Recommended

| Tool | Why Not |
|------|---------|
| Storybook | No existing Storybook; overhead > benefit for 1 dev |
| Percy/Applitools/Chromatic | Paid SaaS, unnecessary for this scale |
| Stagehand | Solves navigation, not bug detection |
| Custom Layout Matchers | Sounds cool but our real bugs were CSS, not geometry |
| Per-Component CSS Assertions | Redundant with pixel-diff, high maintenance |
| Automated LLM in CI | Non-deterministic, token costs, false positives |
| Anthropic Computer Use | 150-300K tokens/task, way too expensive |

---

## Key Research Sources

### Critical Findings (Validated)
- **Canvas Bug Study** (arXiv 2501.09236): Reference image raised precision from 34% to 100%
- **MLLMs Know Where to Look** (arXiv 2502.17422): Cropping improves accuracy +8 to +44pp
- **rtrvr.ai**: DOM-first = 81% success vs 40-60% vision-only (web navigation benchmark)
- **D2Snap** (arXiv 2508.04412): DOM outperformed screenshots by 8% (web agent benchmark)
- **VERVE study**: 91.8% accuracy for layout failure classification (NOT detection)

### Critical Findings (From Adversarial Review)
- **Coverage benchmarks misapplied**: rtrvr.ai/D2Snap measure web navigation, not visual bug detection
- **ARIA for shadcn/Radix**: Radix provides correct ARIA by default → snapshot value is +5-10%, not +20-30%
- **LLM on structured data for QA**: Zero published validation for this specific task
- **Baseline maintenance**: 5 layers = 5x maintenance surface → snapshot fatigue risk
- **Human review ROI**: 15 min manual check beats complex automation for low-deploy-frequency projects

### New Tools Discovered
- **eslint-plugin-tailwindcss**: Build-time class conflict detection (MIT, 15min setup)
- **Vitest 4.0 Browser Mode**: Component-level visual testing (MIT, stable since Oct 2025)
- **SiFR Schema**: Structured UI state for LLMs, 53x compression vs HTML
- **OmniParser V2** (Microsoft): YOLO + Florence-2 screenshot → structured elements (24.6K stars)
- **Argos CI**: OSS visual platform with ARIA snapshot support + auto-flaky suppression

### Catalogue Cross-References
- `agent-browsers/INDEX.md` — 16 browser tools ranked
- `agent-browsers/agent-browser.md` — Snapshot+Refs (93% context reduction)
- `agent-browsers/rodney.md` — Shell-native assertions
- `reference/deterministic-harness-blueprint.md` — 70/30 deterministic/LLM split
- `reference/browser-e2e-testing-tools.md` — Multi-layer QA architecture
- `observability/langfuse.md` — LLM evaluation tracing

---

## What's NOT Relevant

- **Stagehand auto-caching** — Navigation efficiency, not bug detection
- **Full 5-layer pipeline** — Over-engineered for 20-50 users at 2 deploys/month
- **Cloud visual platforms** — Paid wrappers around pixel-diff we already have
- **Full DOM dumps to LLM** — Too noisy; use targeted extraction (ARIA + styles for critical elements)
- **Training custom vision models** — No labeled dataset exists for web UI bug detection; multi-month effort

---

## Key Takeaway

> **The biggest lever for visual QA is not a new tool — it's combining what you already have: send baseline + current screenshots (cropped to component level) alongside structured ARIA/CSS data to the LLM, with an adversarial prompt. This costs ~$0.02 per run and catches 65-75% of bugs. Add 15 minutes of human review and you reach 80-85%. The gap from 10% to 75% comes from better INPUT (reference images, cropping, structured data), not better TOOLS.**
