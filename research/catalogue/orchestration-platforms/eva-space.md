# eva. (eva.space)

> **"The AI Operating System" — an OS-level AI assistant that jumps into apps on your device to automate tasks.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | None (closed-source) |
| GitHub Stars | N/A — no public repository |
| Publisher | EVA Live Inc. (NASDAQ: GOAI) / ecomi.io — publicly traded AdTech pivot, startup |
| License | Proprietary |
| Tech Stack | Bubble.io (frontend/investment pages), cloud-based backend, GPT-4 Turbo, Midjourney, Canvas, Suno integrations |
| Maturity | 🔴 Dead/Defunct — domain chain broken (eva.space → sona.space → warmwind.space → empty), ecomi.io → Bubble "domain not supported" |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Domain is dead. Multiple redirect hops ending in empty pages and Bubble.io errors. The company (EVA Live Inc., NASDAQ: GOAI) is primarily an AdTech fraud detection company that attempted to pivot into "AI OS" territory. No GitHub, no SDK, no open source, no technical documentation available. The OMR Hamburg 2024 beta launch appears to have gone nowhere. Smells like a marketing narrative for a stock ticker rather than a real product. Skip entirely.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 1/10 | Consumer AI assistant with no orchestration primitives, no agent coordination, no developer API — zero overlap with Master Blueprint |
| **Novelty** | 2/10 | "OS-level AI assistant" concept is not new (Apple Intelligence, Windows Copilot, various Linux projects). No novel patterns |
| **Actionable** | 0/10 | Product is defunct. No code, no SDK, no patterns to extract |

---

## Overview

eva. (eva.space) positioned itself as "The AI Operating System" — an AI assistant that operates at the OS level rather than within individual applications. Unlike application-specific copilots (e.g., GitHub Copilot in VS Code, Microsoft Copilot in Office), eva. claimed to "jump into" any app on your device to automate tasks like email composition, presentation generation, and social media management.

The product entered public beta at the OMR Festival in Hamburg in May 2024. Each user received a unique AI assistant with a distinct visual appearance and personality. The product claimed to integrate cloud-based services including GPT-4 Turbo, Midjourney, Canvas, and Suno for multi-modal task execution.

As of March 2026, the product appears defunct. The primary domain (eva.space) redirects through a chain (sona.space → warmwind.space) ending at an empty page. The company's other domains (ecomi.io, invest.eva.space) redirect to Bubble.io "domain not supported" errors. The parent company, EVA Live Inc. (NASDAQ: GOAI), is primarily an AdTech company focused on ad fraud prevention (products: NeuroServer, FraudFence) — the "AI OS" appears to have been a side venture or rebranding exercise.

---

## Technical Architecture

Very little technical architecture was ever publicly disclosed. Based on available information:

- **Frontend/Platform**: Built on Bubble.io (no-code platform) — significant red flag for an "operating system"
- **AI Integrations**: Cloud API calls to GPT-4 Turbo, Midjourney, Suno (music), Canvas
- **Device Interaction**: Claimed OS-level app interaction, but no technical details on how this was achieved (no accessibility API documentation, no driver model, no agent runtime specification)
- **Personalization**: Each assistant had unique visual identity and character traits
- **Multi-device**: Claimed laptop, smartphone, and Tesla support
- **Security**: Claimed "secure server" operation vs. cloud-based processing

No data model, no API documentation, no SDK, no architectural diagrams were ever published.

---

## Publisher Background

**EVA Live Inc. (NASDAQ: GOAI)** — publicly traded since October 2021.

- **CEO/Founder**: David Boulette — 20+ years software development, background at RIM/BlackBerry, ATS Automation, BCG Digital Ventures, University of Waterloo CS
- **CFO**: Imran Firoz — corporate finance, co-founder of FDCTech
- **VP Biz Dev**: CJ Melone — former CEO/COO of NUGL
- **Lead Engineer**: Robert Vaccaro — full-stack (iOS, React Native, AWS)
- **Head of Product**: Ryan Bartlette — fintech branding and product design

The company's core business is AdTech: **NeuroServer** (advertising optimization) and **FraudFence** (ad fraud detection). They claim to serve Fortune 100 companies managing 10,000+ campaigns with 100M daily display impressions across 192 countries. The "AI OS" (eva.space) appears to be a secondary venture that has since been abandoned.

The Bubble.io tech stack for what was marketed as an "operating system" is a credibility concern. The multiple domain migrations (eva.space → sona.space → warmwind.space) suggest organizational instability.

---

## What's Valuable for Us

**Nothing actionable.** The product is defunct and never published any technical artifacts.

The only mildly interesting concept is the "OS-level agent" idea — an agent that operates across applications rather than within a single one. However, this is already well-covered by:
- Apple Intelligence (system-level integration)
- Our own tmux-based orchestrator (cross-process agent coordination)
- Computer-use agents (Anthropic's computer use, OpenAI Operator)

---

## What's NOT Relevant

- **Consumer AI assistant**: Our architecture is developer/business-focused agent orchestration, not end-user AI assistants
- **No-code platform**: Built on Bubble.io — violates our Governing Principle #2 (deterministic orchestration requires real code, not no-code platforms)
- **Monolithic AI**: Single AI assistant model contradicts our Governing Principle #4 (small, specialized agents with minimal coordination overhead)
- **No open source**: Nothing to study, fork, or adapt — violates our practical requirement for inspectable tooling
- **AdTech pivot**: Core business is ad fraud detection; the AI OS was a side narrative with no evidence of genuine technical depth

---

## Future Use Cases

None. The product is defunct and was never architecturally relevant.

- Phase 1 (Days 1-3): No use
- Phase 2 (Days 4-60): No use
- Phase 3 (Days 60-90): No use
- Phase 4 (Days 90+): No use

---

## Key Takeaway

> **eva.space is a defunct consumer AI assistant from a publicly traded AdTech company (NASDAQ: GOAI) that built its "AI Operating System" on Bubble.io — zero technical depth, zero relevance to our agent orchestration architecture, skip entirely.**
