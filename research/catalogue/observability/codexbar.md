# CodexBar

> **A tiny macOS menu bar app that keeps your AI coding assistant usage limits visible — session and weekly meters with reset countdowns for 16+ providers.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [steipete/CodexBar](https://github.com/steipete/CodexBar) |
| GitHub Stars | 7,600 (as of 2026-03-08) |
| Publisher | Peter Steinberger / steipete (solo — PSPDFKit founder, €100M exit, now at OpenAI) |
| License | MIT |
| Tech Stack | Swift (98.3%), macOS 14+ (Sonoma), SwiftPM, WidgetKit |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Tracks usage quotas, not agent orchestration. Useful as a personal utility to monitor Claude Max limits, but doesn't solve any architectural problem. |
| **Novelty** | 2/10 | It's a well-built menu bar app that scrapes usage data. No new patterns or concepts for agent orchestration. |
| **Actionable** | 2/10 | Install it as a personal utility. Nothing to adopt architecturally. The "local cost scanning" feature could inform how we monitor agent cost in Phase 3+. |

---

## Overview

CodexBar is a polished macOS menu bar application that displays real-time usage statistics for AI coding assistants. It shows session and weekly usage meters with reset countdowns, provider status with incident badges, and local cost scanning — all without requiring login to each provider's dashboard. Built by Peter Steinberger (legendary iOS developer, PSPDFKit founder with €100M exit), it supports **16+ providers**: Codex, Claude, Cursor, Gemini, Antigravity, Droid/Factory, Copilot, z.ai, Kimi, Kimi K2, Kiro, Vertex AI, Augment, Amp, JetBrains AI, and OpenRouter.

The tool solves a specific pain point: when you're running multiple AI coding assistants (especially on subscription plans like Claude Max), you need visibility into your usage limits and reset times. CodexBar's two-bar menu icon (session on top, weekly on bottom) gives at-a-glance status. A Windows port (`Win-CodexBar`) exists using Rust + egui.

This is a **personal developer utility**, not an orchestration tool. It monitors consumption, not production. But for anyone running agents on Claude Max (which costs $200/mo and is our primary arbitrage vehicle), knowing when your session or weekly limit resets is genuinely useful operational information.

---

## Technical Architecture

```
┌────────────────────────────────────────────┐
│            CodexBar (macOS App)             │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │         Menu Bar Widget              │  │
│  │  ┌────────────────────────────┐      │  │
│  │  │ ████████░░ Session (72%)   │      │  │
│  │  │ ██████░░░░ Weekly  (58%)   │      │  │
│  │  │ Resets in 3h 31m           │      │  │
│  │  └────────────────────────────┘      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ Data Sources  │  │ Display Modes     │  │
│  │               │  │                    │  │
│  │ Browser cookies│  │ Per-provider icon │  │
│  │ CLI RPC       │  │ Merged icon mode  │  │
│  │ OAuth         │  │ WidgetKit widget  │  │
│  │ Local scan    │  │ CLI tool          │  │
│  └──────┬───────┘  └────────────────────┘  │
│         │                                   │
│  ┌──────┴───────────────────────────────┐  │
│  │       Provider Adapters (16+)        │  │
│  │  Claude | Codex | Cursor | Gemini |  │  │
│  │  Copilot | Amp | Droid | z.ai | ... │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Keychain integration for credentials      │
│  Sparkle for auto-updates                  │
│  Privacy-first: on-device parsing          │
└────────────────────────────────────────────┘
```

Key technical details:
- **Swift** native macOS app, requires macOS 14+ (Sonoma)
- **Data collection:** Browser cookies (opt-in with Full Disk Access), CLI RPC, OAuth — no API keys needed
- **Privacy-first:** All parsing happens on-device, no data leaves the machine
- **Keychain integration** for secure credential storage
- **Bundled CLI tool** for scripts and CI integration
- **WidgetKit** widget for home screen/desktop display
- **1,694 commits**, 46+ releases, active development
- **Windows port:** [Finesssee/Win-CodexBar](https://github.com/Finesssee/Win-CodexBar) in Rust + egui

---

## Publisher Background

**Peter Steinberger** (steipete) is one of the most respected iOS developers in the world. He bootstrapped PSPDFKit in 2011, built it into the leading PDF SDK for mobile, and achieved a €100M strategic investment from Insight Partners in 2021. He studied Computer Science at TU Wien, has been building iOS apps since the original iPhone, and is a prolific speaker and open-source contributor (PSTCollectionView, Aspects).

After his PSPDFKit exit, Steinberger pivoted to AI developer tools and has since joined **OpenAI** to work on bringing agents to everyone. CodexBar started as a personal scratch-your-own-itch project and has grown to 7.6K stars. His track record — building polished, reliable, well-maintained software over 13+ years — means CodexBar will continue to be well-supported.

---

## What's Valuable for Us

1. **Claude Max Usage Visibility (Personal Utility)**

   We run our entire operation on Claude Max ($200/mo). Knowing exactly where we stand on session and weekly limits — and when they reset — is useful for scheduling agent work. Install CodexBar, enable Claude, and get at-a-glance usage data.

2. **CLI Tool for Automation**

   The bundled CLI tool could be useful for scripting. For example, our orchestrator could check Claude usage before spawning new agents — if we're near the limit, queue the work for after the reset window.

3. **Provider Status Monitoring**

   The incident badge feature (showing when providers are having outages) is a small but useful signal for diagnosing "why did my agents all fail at the same time?"

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **macOS GUI / menu bar widget** | We work in terminal/tmux. A GUI widget is nice for personal use but irrelevant to our architecture. |
| **16-provider support** | We use Claude Code exclusively. The other 15 providers are noise. |
| **WidgetKit / desktop widget** | Personal convenience feature, not orchestration infrastructure. |
| **Windows port** | We're on macOS. |
| **Cost tracking / local scanning** | Interesting for Phase 3+ cost management, but our current concern is shipping, not optimizing costs. |

**Governing Principle tension:**
- **Terminal is the interface:** CodexBar is a native macOS GUI app. It doesn't integrate with our terminal-first workflow. The CLI tool is the only bridge.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Install as a personal utility for monitoring Claude Max usage.
- **Phase 2 (Days 4–60):** Explore the CLI tool for automated usage checking before spawning agents. Could prevent wasted work by checking limits first.
- **Phase 3 (Days 60–90):** If cost management becomes important, study how CodexBar scans local usage data. Could inform a cost tracking layer in our orchestrator.
- **Phase 4 (Days 90+):** Minimal future relevance. Usage monitoring is a solved problem at this point.

---

## Key Takeaway

> **CodexBar is a beautifully built personal utility by a legendary developer — install it to monitor your Claude Max limits, explore the CLI tool for automation, but don't expect it to solve any orchestration problem. It monitors consumption, not production.**
