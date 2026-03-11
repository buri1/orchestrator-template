# OpenWork

> **An open-source alternative to Claude Cowork built for teams, powered by OpenCode**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [different-ai/openwork](https://github.com/different-ai/openwork) |
| GitHub Stars | 11,345 (as of 2026-03-08) |
| Publisher | Different AI (startup, @benjamin.shafii) |
| License | MIT |
| Tech Stack | TypeScript (72%), Rust/Tauri (8%), OpenCode SDK, SSE, pnpm monorepo, Bun |
| Maturity | 🟢 Production (933 releases, 1,399 commits, desktop downloads available) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *OSS Claude Cowork clone from @aratahikaru0's collection post. 11K+ stars, extremely active. Different AI previously built obsidian-ava and embedbase — credible team. Key question: is the OpenCode-specific architecture transferable to our Claude Code stack, or is this a "look but don't touch" entry? The orchestrator package (`openwork-orchestrator` on npm) and the 3-mode runtime (host/client/cloud) are the most interesting pieces architecturally.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves a real UI problem but is built on OpenCode, not Claude Code; our stack diverges at the runtime level |
| **Novelty** | 6/10 | The 3-mode runtime pattern (host/client/cloud) and the extensibility primitive taxonomy (MCP/plugins/skills/agents/commands) are well-designed; we've seen session management and permission UIs elsewhere |
| **Actionable** | 4/10 | Can't drop in — OpenCode-specific SDK; but the orchestrator CLI package pattern and the skill/command filesystem conventions are worth studying as reference |

---

## Overview

OpenWork is a Tauri-based desktop application (and optional CLI server) that wraps OpenCode — an open-source coding agent — with a team-friendly control surface. It provides session management, real-time execution visualization (SSE-driven timelines), a permission approval UI, and a skills/plugin marketplace. The project positions itself explicitly as an OSS alternative to Claude's Cowork product.

The architecture is a pnpm monorepo with three packages: `app/` (UI components), `desktop/` (Tauri shell with Rust backend), and `orchestrator/` (headless CLI runtime). The system communicates with OpenCode via `@opencode-ai/sdk/v2/client`, consuming SSE event streams for real-time updates and routing permission requests through an approval UI.

What makes OpenWork notable is its three runtime modes: **Host mode** (spawn OpenCode locally on loopback), **Client mode** (connect to a remote OpenCode server via QR-paired transport), and **Cloud mode** (authenticate against a hosted control plane, provision cloud workers, receive workspace-scoped credentials). This is a more mature deployment topology than most tools in this category have achieved.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│                  OpenWork Desktop                 │
│                 (Tauri + Rust)                    │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │            React UI (TypeScript)            │  │
│  │                                             │  │
│  │  Session Manager │ Timeline │ Permissions   │  │
│  │  Skills Manager  │ Config   │ File Browser  │  │
│  └───────────────┬─────────────────────────────┘  │
│                  │ SSE + REST                      │
│  ┌───────────────▼─────────────────────────────┐  │
│  │         @opencode-ai/sdk/v2/client          │  │
│  └───────────────┬─────────────────────────────┘  │
└──────────────────┼───────────────────────────────┘
                   │
    ┌──────────────▼──────────────────┐
    │    OpenCode Server (local or    │
    │    remote, 127.0.0.1:4096)      │
    │                                 │
    │  Sessions │ Files │ Permissions │
    │  Projects │ Config │ Health     │
    └─────────────────────────────────┘
```

### Extensibility Primitives (6-layer taxonomy)

| Primitive | Scope | Risk | Use Case |
|-----------|-------|------|----------|
| MCP | OAuth-safe, product boundary | Low | Third-party auth flows |
| Plugins | Code-based, scoped permissions | Medium | Tool extensions (e.g., wakatime) |
| Skills | Plain-English markdown in `.opencode/skills/` | Low | Behavioral patterns |
| Bash/CLI | Arbitrary execution | High | Internal/advanced workflows |
| Agents | Cross-model task execution | Medium | Separate model contexts |
| Commands | Slash-triggered markdown in `.opencode/commands/` | Low | Reusable workflows |

### Key Technical Decisions

- **Tauri over Electron**: Rust backend, smaller footprint, capability-based security model for filesystem access
- **SSE over WebSockets**: Server-Sent Events for real-time streaming from OpenCode server
- **pnpm monorepo**: Three packages (app, desktop, orchestrator) with shared types
- **Headless CLI alternative**: `openwork-orchestrator` npm package for server-only mode without desktop UI
- **Config convention**: `opencode.json` at workspace and global (`~/.config/opencode/`) scopes
- **Permission model**: Two-layer — UI-level folder authorization via native pickers + server-level per-action approval (allow once / session / always)

### Cloud Worker Provisioning

1. User authenticates in OpenWork Cloud control plane
2. Worker provisioned and health-checked
3. Workspace-scoped URL (`/w/ws_*`) + access token generated
4. User connects via deep link or manual entry

---

## Publisher Background

**Different AI** is a small startup led by Benjamin Shafii. Their track record includes:

- **obsidian-ava** (657 stars) — ChatGPT-powered note formatting for Obsidian
- **embedbase** (522 stars) — Simple API for building LLM-powered apps
- **agent-bank** (203 stars) — CLI-first banking for agents
- **opencode-browser** (216 stars) — Chrome automation plugin for OpenCode
- **opencode-scheduler** (162 stars) — Recurring job scheduling via launchd/systemd

The team has been building in the AI/LLM space since the GPT-3/4 era and shows genuine product taste (obsidian-ava was well-received). OpenWork at 11K+ stars and 1K+ forks is their breakout project, suggesting they hit a real nerve with the "OSS Cowork" positioning. 40 public repos, 324 followers on the org. Credible but small — sustainability depends on whether they can monetize the cloud tier.

---

## What's Valuable for Us

### 1. The 6-Layer Extensibility Taxonomy
Their classification of extensibility primitives (MCP / Plugins / Skills / Bash / Agents / Commands) is the cleanest taxonomy we've seen. Our `.claude/agents/` and `.claude/commands/` conventions map directly to their agents + commands layers. Worth studying how they separate "Skills" (behavioral markdown) from "Commands" (slash-triggered flows) — we currently conflate these.

### 2. Orchestrator CLI Package Pattern
`openwork-orchestrator` (`npm install -g openwork-orchestrator`) provides a headless runtime: `openwork start --workspace /path --approval auto`. This is exactly the pattern we'd need if we ever ship our orchestrator as a package — a headless server mode separate from any UI.

### 3. Three-Mode Runtime Topology
Host / Client / Cloud modes with credential passing is a pattern we'll need when we move from single-machine Claude Max to multi-machine orchestration. The QR-pairing for client mode and workspace-scoped URL tokens for cloud mode are practical solutions to the "how do I connect a remote control surface to a local agent" problem.

### 4. Permission Approval Flow
Their three-tier permission model (allow once / allow for session / always allow, all reversible) is cleaner than our current all-or-nothing `--dangerously-skip-permissions`. Worth referencing when we build our own approval flows.

### 5. Hot Reload for Skills
Conservative reload triggering with workspace isolation and session awareness — agents can update skills without tearing down active sessions. Relevant when we implement live skill updates in our orchestrator.

---

## What's NOT Relevant

### OpenCode Runtime Dependency
The entire system is built around `@opencode-ai/sdk/v2/client` and the OpenCode server. Our stack is Claude Code / Claude Agent SDK. There is zero code reuse path — this is a "study the patterns, ignore the implementation" tool.

### Tauri/Desktop UI
We operate headless via tmux and SSH. A Tauri desktop app adds no value to our CLI-first, server-first architecture. This conflicts with Master Blueprint Principle 7 ("Build only what you have needed in the last 30 days") — we haven't needed a GUI.

### Cloud Worker Provisioning
We run on Claude Max ($200/mo) with local execution. Cloud worker provisioning, checkout/paywall gates, and managed infrastructure are irrelevant to our federated, local-first approach for at least Phase 3 (Days 60-90).

### Performance Targets
Their <500ms FCP, 60fps, <200KB bundle targets are frontend concerns. We have no frontend.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** No immediate use. We're building deterministic infrastructure, not desktop GUIs.
- **Phase 3 (Days 60-90):** If we need a web dashboard for client-facing orchestrator visibility, the OpenWork UI architecture (SSE-driven session timeline + permission approval) could serve as reference. But we'd likely use Notion dashboards first per Master Blueprint Layer 1.
- **Phase 4 (Days 90+):** If we ever productize our orchestrator for external teams, the headless CLI + optional desktop UI + cloud mode topology is the right architecture. The `openwork-orchestrator` package structure would be a direct reference.

---

## Key Takeaway

> **OpenWork is the best-executed OSS "Cowork clone" at 11K stars, but its OpenCode dependency makes it a pattern reference rather than an adoption candidate — study the 6-layer extensibility taxonomy, the 3-mode runtime topology, and the headless orchestrator CLI package pattern.**
