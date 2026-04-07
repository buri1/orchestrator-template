# RamAIn

> **Super fast computer-use agents to build AI employees.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [RamainHQ/Ramain-Releases](https://github.com/RamainHQ/Ramain-Releases) (release binaries only) |
| GitHub Stars | 0 (as of 2026-03-08) — closed-source; repo is releases-only |
| Publisher | RamAIn (YC W26 startup, 2 employees) |
| License | Proprietary |
| Tech Stack | Desktop app (macOS + Windows); Electron-based; MCP bridge; computer vision + LLM reasoning |
| Maturity | 🟡 Early (v1.8.0, Feb 2026; 7 releases since Feb 5 2025) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *YC W26 batch. Interesting "pre-trained UI policies" approach — they claim 10x faster than standard CUA by learning interface structures ahead of time rather than reasoning from scratch at every step. Closed-source, enterprise-focused (insurance, procurement, healthcare). Not directly useful for our code-centric orchestrator but represents the computer-use agent landscape we should track. The MCP bridge in their releases is worth noting — they're integrating with the MCP ecosystem.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Desktop GUI automation for enterprise workflows (insurance portals, EHRs) — completely different problem domain from our code orchestration. No overlap with the Master Blueprint's deterministic routing, context separation, or federated business lines. |
| **Novelty** | 5/10 | The "pre-trained UI policies" concept is genuinely interesting — learning interface structures offline to enable 10x faster execution vs standard computer-use agents that reason every action. But computer-use agents are a crowded space (Anthropic's own CUA, Browser Use, Manus, etc.). |
| **Actionable** | 2/10 | Closed-source proprietary product. No code to study, no patterns to adopt. Enterprise sales motion with subscription auth. Zero applicability to our prompt-engineering-based orchestrator. |

---

## Overview

RamAIn is a YC W2026 desktop automation platform that deploys pre-trained computer-use agents (CUAs) to automate complex, repetitive workflows across browser and desktop applications. The core differentiator is their approach to UI interaction: rather than having an LLM reason about every click and keyboard action at execution time (as standard CUAs do), RamAIn pre-trains on specific interfaces to learn "UI policies" — structural understanding of how applications are laid out and how to navigate them. This reportedly makes their agents 10x faster than standard computer-use approaches while maintaining reliability.

The product ships as a native desktop app for macOS (Apple Silicon + Intel) and Windows. It simulates mouse and keyboard input to interact with applications like WhatsApp Desktop, Outlook, carrier insurance portals, EHR systems, and web browsers. It includes a self-healing capability that uses AI to handle unexpected pop-ups or UI changes, and a human-in-the-loop system where agents can ask clarifying questions when context is missing.

RamAIn targets enterprise verticals: insurance brokers (carrier portals, quote extraction), healthcare (EHRs, prior authorizations), procurement (vendor onboarding, PO creation), and finance operations (AP/AR automation). They position against traditional RPA solutions (UiPath, Automation Anywhere) with claims of 80% cost savings and deployment in days rather than months.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│         RamAIn Desktop App           │
│  (Electron, macOS + Windows)         │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │ Voice      │  │ Pre-trained    │  │
│  │ Interface  │  │ UI Policies    │  │
│  │ (NLU)      │  │ (per-app)      │  │
│  └─────┬──────┘  └───────┬────────┘  │
│        │                 │           │
│  ┌─────▼─────────────────▼────────┐  │
│  │   Agent Runtime                │  │
│  │   - Computer Vision            │  │
│  │   - Contextual Reasoning       │  │
│  │   - Self-healing (AI fallback) │  │
│  │   - Human-in-the-loop          │  │
│  └─────┬──────────────────────────┘  │
│        │                             │
│  ┌─────▼──────────────────────────┐  │
│  │   MCP Bridge                   │  │
│  │   (tool integration layer)     │  │
│  └─────┬──────────────────────────┘  │
│        │                             │
│  ┌─────▼──────────────────────────┐  │
│  │   OS-level I/O                 │  │
│  │   - Mouse/keyboard simulation  │  │
│  │   - Screenshot capture         │  │
│  │   - API fallback when avail.   │  │
│  └────────────────────────────────┘  │
│                                      │
│  Auth: Subscription-based locking    │
│  Updates: Auto-updater built-in      │
│  Audit: Full trail logging           │
└──────────────────────────────────────┘
```

Key architectural points:
- **Pre-trained UI policies**: Offline learning of interface structures per application, stored as navigation models
- **Two-tier action model**: Uses pre-trained policies first (fast path), falls back to real-time AI reasoning for unseen states (slow path / self-healing)
- **MCP bridge**: Integration point for external tool calls; stability improvements noted in v1.8.0 release notes
- **Subscription auth**: App locks by default, validates subscription server-side
- **No open API**: No documented API endpoints, SDKs, or extension mechanisms

---

## Publisher Background

**Founders:**
- **Shourya Vir Jain** (CEO) — IIT Delhi (EE), ex-McKinsey & Company, previously founded Genoshi (enterprise AI studio, bootstrapped to six figures). FIDE-rated chess player (2118), represented India internationally.
- **Vansh Ramani** (CTO) — IIT Delhi (CS), published at ICLR and ACS (20+ citations), built PANORAMA algorithm (merged into Meta's FAISS), researcher at CMU Machine Learning Dept and University of Copenhagen, funded by Danish Data Science Academy and Pioneer Centre for AI. National robotics champion.

**Company:** Founded 2025, YC W2026 batch, 2 employees, San Francisco. YC Partner: Tyler Bosmeny.

Strong technical credentials, especially the CTO's ML research background (FAISS contribution is notable). Very early stage — 2-person team, ~1 month of public releases. The McKinsey background suggests enterprise sales orientation which aligns with their target verticals.

---

## What's Valuable for Us

**Minimal direct value.** RamAIn operates in a completely different domain (enterprise desktop GUI automation) from our code orchestration system.

One transferable concept worth noting:

1. **Pre-trained UI policies pattern**: The idea of learning interface structures offline to avoid expensive per-action reasoning at runtime is conceptually interesting. It's analogous to our Master Blueprint's principle of "deterministic orchestration, LLM execution" — push as much as possible into pre-computed, deterministic paths and only invoke the LLM for genuinely novel situations. RamAIn applies this to GUI navigation; we apply it to task routing.

2. **MCP bridge**: They're building MCP integration into a desktop automation tool, which validates MCP as a universal integration protocol extending beyond code editors into GUI agents.

---

## What's NOT Relevant

- **Enterprise GUI automation**: Our agents write code, they don't click through insurance portals. Master Blueprint Principle #3 (context is zero-sum) means mixing GUI automation context into coding agents would be harmful.
- **Closed-source proprietary**: No code to study, no patterns to extract at implementation level. Conflicts with our "harness over framework" thesis — we need tools we can inspect, fork, and modify.
- **Subscription-locked desktop app**: Opposite of our zero-infra, CLI-first approach. Cannot be composed into our tmux-based orchestrator pipeline.
- **Voice interface**: Irrelevant to autonomous agent workflows where there is no human speaking.
- **Enterprise sales motion**: Different GTM from our contractor/SaaS approach.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90)**: No use case. Our E2E testing uses Chrome DevTools MCP, not desktop GUI automation.
- **Phase 4 (Days 90+)**: If we ever need to automate interactions with desktop applications (e.g., automating a client's legacy desktop software as part of a gov contract), RamAIn or similar CUA tools could be relevant. But this would be a separate business line agent, not part of the code orchestrator. The pre-trained UI policies approach would be worth revisiting if computer-use becomes part of our agent capabilities.

---

## Key Takeaway

> **RamAIn is a YC W26 enterprise desktop automation play using pre-trained UI policies for 10x faster computer-use agents — interesting as a market signal and for the offline-learning-beats-per-action-reasoning pattern, but zero direct applicability to our code orchestration system.**
