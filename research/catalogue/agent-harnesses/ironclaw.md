# Ironclaw

> **Your secure personal AI assistant, always on your side — OpenClaw reimagined in Rust with WASM sandbox isolation and security-first design.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/nearai/ironclaw](https://github.com/nearai/ironclaw) |
| GitHub Stars | 7,566 (as of 2026-03-08) |
| Publisher | NEAR AI (org) — led by Illia Polosukhin (NEAR Protocol co-founder, ex-Google Brain, Transformer paper co-author) |
| License | Apache-2.0 / MIT (dual-licensed) |
| Tech Stack | Rust (91%), wasmtime (WASM runtime), PostgreSQL + pgvector, axum (HTTP), tokio (async), rig-core (LLM), Docker, MCP |
| Maturity | 🟡 Early (v0.16.1, 380 commits, 19 releases, 55 contributors) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves a different primary problem (personal AI assistant with multi-channel messaging) than our dev-workflow orchestration. However, the WASM sandbox security model and credential isolation patterns directly address agent security concerns from our Master Blueprint's quality gates layer. |
| **Novelty** | 7/10 | The WASM capability-based sandboxing with credential host-boundary injection is a genuinely new approach we haven't seen in other catalogue entries. Rust + WASM + pgvector is a unique stack. The leak detection system scanning for secret exfiltration is novel. |
| **Actionable** | 5/10 | Security patterns are study-worthy but require substantial adaptation. We're not running Rust or WASM. The credential injection model and endpoint allowlisting concepts could be applied to our hook-based security layer in Phase 3. |

---

## Overview

Ironclaw is a Rust-based reimplementation of [OpenClaw](./../../orchestration-platforms/openclaw.md) (271K stars, TypeScript) that trades the original's JavaScript ecosystem for Rust's memory safety and native performance. The project is positioned as a "security-first" alternative: user data stays encrypted and local, untrusted tools execute in WASM sandboxes with capability-based permissions, and credentials never leave the host boundary.

The architecture follows a channel-router-worker pattern. Input arrives via multiple channels (REPL, HTTP, Telegram, Slack, web gateway), the Agent Loop classifies intent and routes to workers, and a Scheduler manages parallel job execution with LLM reasoning. A Routines Engine handles background/cron tasks with heartbeat monitoring. The Tool Registry dynamically integrates built-in tools, MCP servers, and WASM-sandboxed tools without requiring restarts.

What makes Ironclaw architecturally interesting for our research is not the assistant capabilities (which target consumer messaging, not dev workflows) but the security isolation layer. The WASM sandbox provides capability-based permissions with explicit opt-in for HTTP, secrets, and tool invocation. Credentials are injected at the host boundary — the WASM code never sees raw secrets. A leak detection system scans all outbound requests and responses for secret exfiltration attempts. This is the most production-ready agent sandboxing model in our catalogue.

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────┐
│                    CHANNELS                            │
│   REPL  |  HTTP  |  Telegram  |  Slack  |  Web GW    │
├───────────────────────────────────────────────────────┤
│                  AGENT LOOP                            │
│   Intent Router → Job Coordinator → Response Builder  │
├───────────────────────────────────────────────────────┤
│         SCHEDULER + ROUTINES ENGINE                    │
│   Parallel jobs  |  Cron scheduling  |  Heartbeat     │
├─────────────┬─────────────┬───────────────────────────┤
│ Local       │ Docker      │ WASM Sandbox              │
│ Workers     │ Orchestrator│ (wasmtime v28)            │
│             │             │                           │
│ LLM calls   │ Container   │ ┌─────────────────────┐  │
│ via rig-core│ lifecycle   │ │ Capability Perms    │  │
│             │             │ │ Endpoint Allowlist  │  │
│ 8 providers │             │ │ Credential Inject   │  │
│             │             │ │ Leak Detection      │  │
│             │             │ │ Rate Limiting       │  │
│             │             │ └─────────────────────┘  │
├─────────────┴─────────────┴───────────────────────────┤
│                TOOL REGISTRY                           │
│   Built-in  |  MCP Servers  |  WASM Tools             │
├───────────────────────────────────────────────────────┤
│              SAFETY LAYER                              │
│   Prompt injection defense  |  Env sanitization       │
│   Session file perms (0o600)  |  SSRF protection      │
├───────────────────────────────────────────────────────┤
│              PERSISTENCE                               │
│   PostgreSQL 15+ / pgvector  |  Hybrid FTS + vector   │
│   Encrypted secrets (AES-GCM, blake3, ed25519)        │
│   Workspace filesystem  |  Identity files             │
└───────────────────────────────────────────────────────┘
```

**Core components:**

- **wasmtime v28 runtime**: Component Model support for WASM tools with WIT (WebAssembly Interface Types) definitions in `wit/` directory
- **rig-core**: Multi-provider LLM abstraction supporting 8 providers (NEAR AI, Anthropic, OpenAI, Gemini, Mistral, Ollama, Cloudflare, NVIDIA)
- **Hybrid memory**: PostgreSQL with pgvector for combined full-text + vector search; optional libSQL/Turso for embedded use
- **Cryptography stack**: AES-GCM encryption, blake3 hashing, ed25519-dalek signatures, constant-time comparison via `subtle` crate, `secrecy` crate for sensitive values
- **Gateway**: axum-based HTTP server with 40+ endpoints, SSE broadcast, token auth, health checks
- **Docker orchestrator**: Container lifecycle management via `bollard` crate for heavier sandboxing alongside WASM

**Key files/directories:**
- `tools-src/` — WASM tool source code
- `wit/` — WebAssembly Interface Type definitions (the sandbox contract)
- `skills/` — Prompt-based capabilities with trust gating
- `channels-src/` — Channel implementations (Telegram, Slack, etc.)
- `migrations/` — PostgreSQL schema migrations
- `registry/` — Tool registry definitions

---

## Publisher Background

**NEAR AI** is the AI research division of NEAR Protocol, a Layer 1 blockchain with ~$1B+ market cap. The project is led by **Illia Polosukhin**, who is notably a co-author of the original "Attention Is All You Need" Transformer paper at Google Brain (2017) — one of the most influential ML papers ever published. He has 1,172 GitHub followers and 156 commits on Ironclaw (the dominant contributor).

Other notable contributors include **Zaki Manian** (zmanian, 45 commits) — a well-known figure in the blockchain/Cosmos ecosystem. The project has 55 total contributors and 814 forks, indicating real community traction.

The NEAR AI organization has 59 public repositories. The blockchain backing provides sustainable funding but also introduces a potential bias toward Web3 integration (NEAR AI OAuth, Tinfoil private inference) that may not align with traditional enterprise use cases.

**Credibility assessment**: Very high technical credibility (Transformer paper co-author + established protocol). The Rust implementation quality is backed by serious cryptography choices (constant-time comparison, `secrecy` crate). However, the project is only ~5 weeks old (created 2026-02-03) with rapid iteration (v0.16.1, 19 releases), so production stability is unproven.

---

## What's Valuable for Us

1. **WASM capability-based sandboxing model**: The most concrete implementation of agent tool isolation in our catalogue. Each WASM tool explicitly opts in to capabilities (HTTP access, secret access, tool invocation). This maps to our Master Blueprint's quality gates layer — we could apply this permission model to our hook-based tool governance without adopting WASM itself. Study the `wit/` directory for the interface contract.

2. **Credential host-boundary injection**: Secrets are injected by the host runtime at the boundary — the sandboxed tool code never has access to raw credentials. This pattern is directly applicable to our DSGVO-compliant agent architecture where gov client credentials must never leak into agent context windows. This addresses Master Blueprint Principle 6 (federated systems, no cross-contamination).

3. **Leak detection system**: Outbound request/response scanning for secret exfiltration. This is a deterministic security check that fits perfectly into our 70/30 split — it's a non-LLM quality gate that should run on every agent action.

4. **Multi-provider LLM failover**: Via `rig-core`, supports 8 providers with failover chains. Validates our planned LiteLLM integration but shows a Rust-native alternative approach.

5. **Hybrid FTS + vector search memory**: PostgreSQL with pgvector combining full-text and semantic search. More production-ready than our current JSON-in-git memory, worth studying for Phase 3 memory architecture.

---

## What's NOT Relevant

- **Personal assistant / messaging channel focus**: The multi-channel messaging system (Telegram, Slack, Signal, etc.) solves consumer AI assistant distribution, not dev-workflow orchestration. Our agents write code, they don't chat on Slack. This is the same reason OpenClaw scored only 6/10 relevance.

- **NEAR AI OAuth / Web3 integration**: The blockchain-native authentication and Tinfoil private inference are tied to NEAR Protocol ecosystem. We use standard OAuth/API keys. This coupling makes parts of the stack less portable.

- **PostgreSQL requirement**: Our architecture deliberately uses JSON-in-git and SQLite for zero-infra simplicity (Master Blueprint Principle 7: "build only what you've needed in the last 30 days"). PostgreSQL adds operational overhead we don't need in Phase 1-2.

- **Rust tech stack**: We operate in TypeScript/Shell/prompt-engineering space. Adopting Rust components requires a language boundary crossing that adds complexity without proportional benefit for our current scale.

- **Gateway / web UI**: The 40+ endpoint HTTP gateway with web chat UI serves a different use case. Our orchestrator is headless and state-file driven.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the WASM sandbox permission model (`wit/` definitions) as a reference architecture for our hook-based tool governance. Even without adopting WASM, the capability-based opt-in pattern can inform how we restrict agent tool access.

- **Phase 3 (Days 60-90)**: The credential host-boundary injection pattern becomes critical when we onboard more gov clients with strict DSGVO requirements. Adopt the concept (not the code) for our agent security layer. The leak detection scanning could be implemented as a deterministic hook in our quality gate pipeline.

- **Phase 4 (Days 90+)**: If we need production-grade agent memory beyond JSON-in-git, the PostgreSQL + pgvector hybrid search architecture is a proven reference. The multi-provider LLM failover via `rig-core` is worth studying if we outgrow Claude Max and need model routing.

---

## Key Takeaway

> **Ironclaw's WASM capability-based sandbox with host-boundary credential injection is the most production-ready agent security isolation model in our catalogue — study the permission patterns for our Phase 3 security layer, but the consumer-assistant focus means the tool itself is not adoptable for dev workflows.**
