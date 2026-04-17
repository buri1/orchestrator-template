# runtimeuse (getlark)

> **Run AI agents inside sandboxes and communicate with them over WebSocket — TypeScript runtime server (runs inside the sandbox) + Python client (connects from outside) with pre-agent downloadable artifacts.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure — Agent sandboxing / remote execution |
| Repository | https://github.com/getlark/runtimeuse |
| GitHub Stars | 8 (as of 2026-04-17) |
| Publisher | getlark (small; Twitter @getlark; no bigtech affiliation visible) |
| License | FSL-1.1-ALv2 (Functional Source License, Apache 2.0 after 2 years — source-available) |
| Tech Stack | TypeScript server (npm `runtimeuse`) + Python client (pip `runtimeuse-client`) + WebSocket wire protocol (port 8080) |
| Maturity | 🟡 Early — created 2026-03-11, 1 fork, 8 stars; topics: `agents`, `claude-code`, `mcp`, `openai` |
| Last Analyzed | 2026-04-17 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Directly maps to our **self-hosted agent infra** research wave (the 20-file `research/catalogue/infrastructure/self-hosted-agent-infra/` + `remote-agent-sandboxing/` cluster) and to the **Sunil Pai "Code Mode"** pattern from AIE Europe 2026. The thesis "agent-inside-sandbox + thin WebSocket client-outside-sandbox" is a direct expression of capability-bounded worker sandboxing, which we've flagged as the 3-6 week strategic bet to replace `--dangerously-skip-permissions`. Repo is tiny (8 stars) but the architecture is exactly what we'd want to prototype. |
| **Novelty** | 4/10 | The "agent in sandbox, client outside" pattern is already well-represented — E2B, microsandbox, Daytona (rejected), and node9 cover the same ground. What's marginally novel is (1) the **WebSocket wire protocol** as the bridge (simpler than gRPC, more capable than raw HTTP), (2) the **pre-agent downloadables** API (the client declares "download this zip to /workdir before the agent runs" — clean dependency injection), and (3) the deliberate **TypeScript-inside / Python-outside** split, which matches our stack (TS for runtime, Python/Shell for orchestrator glue). |
| **Actionable** | 6/10 | Tiny enough (two packages, ~~hundreds of LOC~~ estimated) to read end-to-end in an afternoon. Can run with `npx -y runtimeuse@latest` inside any sandbox (Docker, microsandbox, E2B) and drive from our orchestrator via a WebSocket Python client. FSL license means source-available AND usable commercially for our orchestration work (FSL is friendlier than AGPL — becomes Apache-2.0 at 2 years). The OpenAI-default handler + Claude examples in `examples/` tell us the wire protocol is provider-agnostic. **Caveat**: 8-star / 1-fork means high bus-factor risk; treat as "read the code, lift the pattern, don't depend on the package." |

---

## Overview

**runtimeuse** is a two-package project from small publisher **getlark** implementing the "agent inside a sandbox, client outside" pattern over WebSocket. The TypeScript package `runtimeuse` is the runtime server that runs **inside** the sandbox — it wraps an LLM (OpenAI by default, Claude via examples) and exposes a WebSocket server on port 8080. The Python package `runtimeuse-client` is the **outside**-the-sandbox client that connects to the runtime, sends query prompts with options (system prompt, model, pre-agent downloadables), and receives typed results (`TextResult`, etc.).

The WebSocket wire protocol is the notable design choice — it keeps the runtime simple (one port, one protocol), decouples agent identity from client identity (the client doesn't need OPENAI_API_KEY; that's scoped to the sandbox), and supports streaming / cancel semantics naturally. The **pre-agent downloadables** feature is a clean capability: the client declares artifacts to fetch into the sandbox workdir before the agent runs (e.g., "download this GitHub repo zip to `/runtimeuse` before answering"), which composes nicely with capability-based security — the agent never has full network access, only pre-declared fetches happen.

The README quick-start literally runs `npx -y runtimeuse@latest` with `OPENAI_API_KEY` set — so it's zero-install-friendly, matching the "one-command sandbox" ergonomics of microsandbox (but real, not vaporware).

---

## Technical Architecture

### Two-package split

```
┌─ Sandbox boundary ────────────────────────────┐
│                                               │
│  runtimeuse (TypeScript, npm)                 │
│   ├─ WebSocket server :8080                   │
│   ├─ Default handler: OpenAI                  │
│   ├─ Example handlers: Claude (examples/)     │
│   └─ Workdir: /runtimeuse                     │
│                                               │
└───────────────── WebSocket ───────────────────┘
                        │
                        ▼
      runtimeuse-client (Python, pip)
       ├─ RuntimeUseClient(ws_url=...)
       ├─ .query(prompt, options=QueryOptions(...))
       ├─ QueryOptions:
       │    ├─ system_prompt
       │    ├─ model
       │    └─ pre_agent_downloadables=[
       │          RuntimeEnvironmentDownloadableInterface(
       │            download_url=...,
       │            working_dir=...
       │          )
       │       ]
       └─ Returns: TextResult (typed)
```

### Integration points

- **Transport**: WebSocket over port 8080; no mention of TLS (assumes Tailscale / localhost / private network)
- **Model providers**: OpenAI (default), Claude (via examples); provider-agnostic server architecture
- **Artifact injection**: client-declared pre-agent downloadables (URL + working_dir); server fetches before invoking model
- **Return types**: typed results including `TextResult` (implies more types exist — code read would reveal them)
- **Topics declared**: `agents`, `agents-sdk`, `ai-agents`, `claude-code`, `mcp`, `openai`, `websockets`

### License note

**FSL-1.1-ALv2** (Functional Source License) is:
- Source-available immediately (read, modify, self-host)
- Restricts "competing product" use in first 2 years
- Becomes full Apache 2.0 after 2 years from release
- Friendlier than AGPL for our orchestration use (we're not building a competing agent-sandbox SaaS)

---

## Publisher Background

**getlark** is a small publisher with minimal public footprint — Twitter presence (@getlark), 8 stars on this repo, 1 fork. The repo was created 2026-03-11 and pushed as recently as 2026-04-15 (active). The FSL license choice suggests a small team planning a commercial product down the line (`getlark` might be a SaaS) and open-sourcing the runtime to seed adoption.

No bigtech backing, no YC branding, no visible funding signals in the repo. Treat as **pattern source, not dependency**.

---

## What's Valuable for Us

1. **WebSocket wire protocol for agent-in-sandbox**: directly applicable to our self-hosted agent infra research. WebSocket is simpler than gRPC, more capable than HTTP (streaming, cancel), and already well-supported in every language we care about. Steal the wire protocol shape for any sandbox bridge we build.
2. **Pre-agent downloadables API**: clean dependency-injection pattern. The client says "fetch this URL into this workdir before the agent runs" — composes with capability-based security because the runtime can whitelist allowed URLs. Directly useful for our "deterministic artifact preparation" phase before worker spawn.
3. **Two-package split (TS server, Python client)**: validates our stack choice (TS for runtime, Python/Shell for orchestrator glue) — same split runtimeuse makes.
4. **`npx -y runtimeuse@latest` one-command start**: the quick-start ergonomics are what microsandbox *claims* but doesn't deliver. This one actually works. Good baseline for "what's the minimum viable sandbox runtime?"
5. **`claude-code` + `mcp` + `agents` topics**: the publisher explicitly positions this as Claude-Code-compatible — worth checking `examples/` for the Claude handler specifically and understanding how they wrap the Claude Code SDK.
6. **Typed return values (`TextResult` + others)**: discriminated-union return types are what our orchestrator should mandate for worker results. Runtimeuse-client gives a concrete example of the contract shape.

---

## What's NOT Relevant

- **8 stars / 1 fork / unknown publisher**: too small to depend on. Lift patterns, don't adopt.
- **No TLS / auth in README**: the WebSocket is unauthenticated on port 8080 — fine for localhost / Tailscale, insecure for any production deploy. Would need a wrapper.
- **OpenAI-default**: we're Claude Max / Claude Code first. The OpenAI handler is fine for examples but not our path.
- **FSL "competing product" clause**: if we ever ship L-Thread orchestrator as a public product that includes agent-sandbox functionality, the FSL clause could apply during its 2-year window. Read it carefully before lifting whole code, not just patterns.
- **No benchmark / production evidence**: no latency numbers, no concurrent-agent numbers, no "ran this for 10k agents" blog post. Early-stage artifact.

---

## Future Use Cases

- **Phase 1 (now — self-hosted agent infra research)**: read the source end-to-end. Check the Claude handler in `examples/`. Compare the WebSocket wire protocol to what we'd design for our own Deno-based capability-bounded worker sandbox prototype.
- **Phase 2 (Day 4-60)**: if we prototype an agent-sandbox bridge, use runtimeuse's WebSocket protocol + pre-agent downloadables as the starting API shape. Implement our own TS server (FSL-safe).
- **Phase 3 (Day 60-90)**: if we ever expose sandboxed agents to client endpoints (e.g., OmniPort-HH Voice Interface calling a sandboxed agent for computation), the runtimeuse wire protocol is production-shaped enough to adapt.

---

## Key Takeaway

> **runtimeuse is a tiny but architecturally clean expression of "agent-in-sandbox over WebSocket + pre-agent downloadables" — too small and unproven to adopt as a dependency, but the wire protocol and artifact-injection API are directly liftable for our own capability-bounded worker sandbox prototype.**
