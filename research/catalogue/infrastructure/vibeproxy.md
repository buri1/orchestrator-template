# VibeProxy

> **Native macOS menu bar app to use your Claude Code & ChatGPT subscriptions with AI coding tools — no API keys needed.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [automazeio/vibeproxy](https://github.com/automazeio/vibeproxy) |
| GitHub Stars | 1,646 (as of 2026-03-08) |
| Publisher | Automaze, Ltd. (automaze.io) — Ran Aroussi (solo/startup, 3.5K GitHub followers, 20M+ monthly installs across OSS projects) |
| License | MIT |
| Tech Stack | Swift 91% (SwiftUI), Shell 7%, Makefile 2%; bundles CLIProxyAPIPlus binary; Sparkle auto-updater |
| Maturity | 🟢 Production (v1.8.111, 131 releases, 551 commits, 10 contributors, code-signed & notarized) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves the "paying twice for AI" problem — lets you route Factory Droids, Amp CLI, and other coding tools through existing Claude Max / ChatGPT subscriptions. Directly useful since we run on Claude Max ($200/mo) and could use this to route additional coding tools (Factory, Amp) without extra API spend. However, our core architecture uses Claude Code directly, not third-party coding tools that need a proxy. |
| **Novelty** | 5/10 | macOS-native SwiftUI wrapper is polished, but the underlying proxy pattern (OAuth token harvesting → OpenAI-compatible API) is the same approach as Antigravity Manager, CLIProxyAPI, and others in this space. The Vercel AI Gateway integration for safer Claude access is a genuinely novel addition. |
| **Actionable** | 7/10 | One-click install, MIT license, macOS-only (which is our platform). Could deploy today if we wanted to use Factory Droids or Amp CLI alongside Claude Code without additional API spend. Round-robin multi-account support is interesting for scaling beyond single-account rate limits. |

---

## Overview

VibeProxy is a macOS menu bar application that acts as a local proxy server, converting existing AI subscription credentials (Claude Max, ChatGPT Plus, Gemini, etc.) into OpenAI-compatible API endpoints. This lets third-party coding tools like Factory Droids and Amp CLI use your subscription without requiring separate API keys.

The app is built on [CLIProxyAPIPlus](https://github.com/router-for-me/CLIProxyAPIPlus), which handles the actual proxy server, OAuth token management, and API routing. VibeProxy wraps this in a native SwiftUI interface with one-click authentication, provider priority controls, and real-time connection status monitoring. It monitors `~/.cli-proxy-api/` for credential files and provides automatic failover with round-robin distribution across multiple accounts.

The key design decision is **subscription arbitrage**: instead of paying for both a Claude Max subscription ($200/mo) AND API credits for third-party tools, you proxy through your existing subscription. The recent Vercel AI Gateway integration adds a safety layer — routing Claude requests through Vercel's officially sanctioned gateway rather than using raw OAuth tokens, reducing account ban risk.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│         macOS Menu Bar (SwiftUI)        │
│   AppDelegate → SettingsView            │
│   ServerManager → AuthStatus            │
└───────────────┬─────────────────────────┘
                │ start/stop/configure
                ▼
┌─────────────────────────────────────────┐
│      CLIProxyAPIPlus (bundled binary)   │
│                                         │
│  Local HTTP Server (OpenAI-compatible)  │
│  ├─ OAuth Token Management              │
│  ├─ Provider Priority / Routing         │
│  ├─ Round-Robin Multi-Account           │
│  ├─ Automatic 429/Rate-Limit Failover   │
│  └─ Vercel AI Gateway (optional route)  │
└───────────┬────────┬────────┬───────────┘
            │        │        │
    ┌───────▼──┐ ┌──▼─────┐ ┌▼──────────┐
    │ Claude   │ │ ChatGPT│ │ Gemini/   │
    │ Max/Code │ │ Plus   │ │ Qwen/Z.AI │
    └──────────┘ └────────┘ └───────────┘
```

**Key components:**
- **AppDelegate** (`AppDelegate.swift`): Menu bar item lifecycle, settings window management
- **ServerManager** (`ServerManager.swift`): Controls CLIProxyAPIPlus process, handles OAuth flow
- **SettingsView** (`SettingsView.swift`): SwiftUI interface — provider toggles, status indicators, server control
- **AuthStatus** (`AuthStatus.swift`): File system watcher on `~/.cli-proxy-api/` for credential detection
- **CLIProxyAPIPlus**: Bundled binary — the actual proxy engine (from [router-for-me/CLIProxyAPIPlus](https://github.com/router-for-me/CLIProxyAPIPlus))

**Supported providers & models (as of v1.8):**
- Claude: Sonnet 4.5, Opus 4.5 (extended thinking)
- ChatGPT: GPT-5.1, GPT-5.1 Codex
- Gemini 3 Pro (via Antigravity)
- Qwen, Z.AI GLM-4.7, GitHub Copilot

**Infrastructure:**
- macOS 13+ (Ventura) required
- Self-contained `.app` bundle — no external dependencies
- Auto-updates via Sparkle framework
- Code-signed and notarized (no Gatekeeper friction)

---

## Publisher Background

**Ran Aroussi** (@aroussi / @ranaroussi) is the primary developer, operating through **Automaze, Ltd.** His bio claims "20M+ monthly installs" across OSS tools, though his most visible GitHub repos under his personal account are smaller projects (cc-bridge at 38 stars, aiter, openwork). The 20M+ likely refers to Python finance libraries published under different accounts or organizations. He describes himself as "CTO as a Service @automazeio" and "Building production AI infrastructure @muxi-ai."

The project has 10 contributors, 106 forks, and an extremely active release cadence (131 releases in ~17 months since Oct 2025). This suggests a responsive, production-oriented maintainer. The code-signing and notarization add credibility — this is not a hobbyist project.

Also authored **cc-bridge** (Anthropic API compatibility using Claude Code CLI under the hood), showing a pattern of building infrastructure to squeeze more value from existing AI subscriptions.

---

## What's Valuable for Us

1. **Subscription arbitrage for multi-tool workflows.** If we ever want to experiment with Factory Droids, Amp CLI, or other coding tools alongside Claude Code, VibeProxy lets us do it on our existing Claude Max subscription. This aligns with the Master Blueprint's principle of "build only what you have needed in the last 30 days" — we'd only adopt this when we actually need a second coding tool.

2. **Round-robin multi-account pattern.** The multi-account support with automatic failover on rate limits is a pattern worth noting. If we scale to multiple Claude Max accounts for parallel agent swarms, this rotation logic (account A rate-limited → automatically switch to account B) is exactly what we'd need. The implementation lives in CLIProxyAPIPlus, not VibeProxy itself.

3. **Vercel AI Gateway integration.** Routing through Vercel's sanctioned gateway rather than raw OAuth tokens is a smart risk mitigation. If Anthropic cracks down on direct OAuth usage, this provides a compliant path. Worth monitoring.

4. **Zero-friction macOS deployment.** Code-signed, notarized, Sparkle auto-updates, menu bar native — this is the gold standard for macOS developer tooling distribution. If we ever ship a macOS tool for our orchestrator, this is the UX template.

---

## What's NOT Relevant

1. **We don't use third-party coding tools.** Our architecture runs Claude Code directly via tmux sessions. We don't route through Factory Droids, Amp CLI, or any tool that would need an OpenAI-compatible proxy endpoint. This is VibeProxy's core use case, and it doesn't match ours.

2. **OAuth token harvesting carries risk.** Despite the Vercel AI Gateway mitigation, using subscription credentials as API endpoints is against most providers' ToS. For gov contract work (BSI/DSGVO compliance), this approach is a non-starter. The Master Blueprint's Legal Shield layer explicitly requires compliance posture.

3. **Overlaps with LiteLLM.** For actual model routing and cost tracking in our architecture, LiteLLM (8/10 relevance, MIT license, 38K stars) is the superior choice. VibeProxy solves a different problem (subscription credential proxying) that we don't have.

4. **macOS-only.** While we run macOS, the tool has no server/headless mode. For production orchestration infrastructure, platform-locked GUI apps are architecturally fragile.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** If experimenting with Factory Droids or Amp CLI for specialized coding tasks (e.g., tasks where Claude Code isn't optimal), VibeProxy eliminates the API cost barrier. Low probability but zero-cost to install.
- **Phase 3 (Days 60-90):** The round-robin multi-account pattern becomes relevant if we scale to multiple Claude Max subscriptions for parallel agent teams. Would study CLIProxyAPIPlus (the upstream engine) rather than VibeProxy itself.
- **Phase 4 (Days 90+):** If we build a macOS-native orchestrator dashboard, VibeProxy's SwiftUI + menu bar + Sparkle auto-update architecture is the reference implementation for distribution UX.

---

## Key Takeaway

> **VibeProxy is a polished macOS subscription arbitrage tool that eliminates double-paying for AI, but our Claude Code-native architecture doesn't need it today — bookmark it for when we add a second coding tool or scale to multi-account rotation.**
