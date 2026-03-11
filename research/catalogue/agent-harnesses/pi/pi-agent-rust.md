# Pi Agent Rust

> **High-performance AI coding agent CLI written in Rust with zero unsafe code — a from-scratch port of Pi Agent by Jeff Emanuel (@doodlestein), built on two purpose-designed Rust libraries (asupersync, rich_rust).**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Ecosystem |
| Repository | [Dicklesworthstone/pi_agent_rust](https://github.com/Dicklesworthstone/pi_agent_rust) |
| GitHub Stars | 509 (as of 2026-03-08) |
| Publisher | Jeff Emanuel / @doodlestein (solo — prolific OSS dev, 2.1K followers) |
| License | MIT + OpenAI/Anthropic Rider (see below) |
| Tech Stack | Rust 2024 edition (1.85+), asupersync (custom async runtime), rich_rust (TUI), QuickJS (embedded JS/TS), SQLite, rustls |
| Maturity | 🟡 Early (2,292 commits, rapid iteration, Feb 2026 origin) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Validates Rust-as-harness thesis and proves the Pi Agent design can be ported to a systems language. But we are committed to Claude Code for Phase 1-2, and the original TypeScript Pi Agent is the Day 60+ migration candidate. A Rust rewrite adds a third option that complicates rather than clarifies our harness decision. The license rider explicitly blocking Anthropic is a red flag for our stack. |
| **Novelty** | 7/10 | Purpose-built async runtime (asupersync) with structured concurrency and capability-based contexts is genuinely novel. Embedded QuickJS for extension runtime without system Node dependency is clever. 4-12x performance gains over Node are real. The tamper-evident security model (risk ledger, hostcall reactor, two-stage exec mediation) goes well beyond anything in the TS Pi Agent or Claude Code. |
| **Actionable** | 3/10 | Cannot adopt directly due to license rider (blocks Anthropic). Performance patterns (zero-copy Arc/Cow, SSE byte-tracking parser, SQLite+sidecar session storage) are study-worthy for future Rust infrastructure. The extension security model is the most concrete takeaway but requires substantial adaptation to apply to our Claude Code setup. |

---

## Overview

Pi Agent Rust is a ground-up Rust port of Mario Zechner's Pi Agent, created by Jeff Emanuel with Mario's blessing. It is not a thin wrapper or FFI bridge — it reimplements the entire agent from scratch in Rust 2024 edition, including two custom foundational libraries: **asupersync** (a structured concurrency async runtime with capability-based contexts) and **rich_rust** (a Rust port of Python's Rich library for terminal rendering).

The project achieves dramatic performance improvements over the TypeScript original: 4-5x faster end-to-end on realistic 1-5M token sessions, 8-12x lower memory footprint, and sub-100ms P95 startup. The binary ships as a single <22MB executable (CI-gated budget) with zero system dependencies — no Node, no Python, no OpenSSL. All benchmarks use matched-state workloads with CI-validated artifacts and explicit disclosure of rerun blockers.

The extension system is the most architecturally interesting divergence from the original. While the TS Pi Agent uses in-process TypeScript extensions with lifecycle events, the Rust port embeds a **QuickJS runtime** for JS/TS extensions (sub-100ms P95 cold load, sub-1ms P99 warm) and adds a **native Rust extension** path via `*.native.json` descriptors. Both are governed by a capability-gating system (tool, exec, http, session, ui, events) with a tamper-evident risk ledger and two-stage exec enforcement.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    pi (binary)                       │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │Interactive│  │  Print   │  │    RPC (JSON)     │ │
│  │   TUI    │  │  stdout  │  │   stdin/stdout    │ │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘ │
│       └──────────────┼─────────────────┘            │
│              ┌───────▼───────┐                      │
│              │  Agent Loop   │                      │
│              │  (streaming)  │                      │
│              └───────┬───────┘                      │
│       ┌──────────────┼──────────────┐               │
│  ┌────▼────┐   ┌─────▼──────┐  ┌───▼────────────┐  │
│  │7 Tools  │   │ Extension  │  │ Model Registry │  │
│  │read/    │   │ Runtime    │  │ (multi-provider│  │
│  │write/   │   │            │  │  abstraction)  │  │
│  │edit/    │   │ ┌────────┐ │  └────────────────┘  │
│  │bash/    │   │ │QuickJS │ │                      │
│  │grep/    │   │ │(JS/TS) │ │                      │
│  │find/ls  │   │ ├────────┤ │                      │
│  └─────────┘   │ │Native  │ │                      │
│                │ │(Rust)  │ │                      │
│                │ └────────┘ │                      │
│                └─────┬──────┘                      │
│              ┌───────▼───────┐                      │
│              │  Persistence  │                      │
│              │  JSONL (auth) │                      │
│              │  + SQLite idx │                      │
│              └───────────────┘                      │
│                                                      │
│  Foundation Libraries:                               │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │  asupersync   │  │       rich_rust              │ │
│  │  (async RT)   │  │  (terminal rendering)        │ │
│  │  Cx contexts  │  │  markup, tables, panels,     │ │
│  │  rustls TLS   │  │  markdown, syntax highlight  │ │
│  │  structured   │  │  progress, theming           │ │
│  │  cancellation │  │                              │ │
│  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **Session storage**: Append-only JSONL tree (v3 compatible with TS Pi Agent) + derived SQLite index for metadata queries. O(index+tail) reopen latency.
- **Extension security**: Capability gates (tool, exec, http, session, ui, events) → command-level exec mediation with AST signal detection → tamper-evident runtime risk ledger with verify/replay/calibrate → per-extension trust lifecycle (pending → acknowledged → trusted → killed).
- **Concurrency**: asupersync's region-owned tasks with capability-based contexts (Cx), structured cancellation ensuring clean child task teardown, deterministic replay testing.
- **Zero-copy hot paths**: Arc/Cow usage throughout message flow, typed hostcall opcodes with fast-lane/compat-lane routing, shard-affinity hostcall reactor mesh with backpressure telemetry.
- **Build governance**: CI-gated binary size budget (<22MB), scenario matrices, strict artifact contracts, fail-closed gates, shadow dual-execution sampling with automatic backoff on divergence.

**7 Built-in Tools:** `read` (files + images), `write`, `edit` (surgical string replacement), `bash` (timeout + process tree cleanup), `grep` (context-aware), `find` (pattern-based), `ls`. All include automatic truncation (2,000 lines / 50KB) and detailed metadata.

**Extension Runtime (two-tier):**

| Tier | Format | Cold Load | Dependencies |
|------|--------|-----------|-------------|
| JS/TS | `.js/.ts/.mjs/.cjs/.tsx/.mts/.cts` | <100ms P95 | None (embedded QuickJS + Node API shims) |
| Native Rust | `*.native.json` descriptor | Near-zero | Compiled into binary |

---

## Publisher Background

**Jeff Emanuel** (@doodlestein / @Dicklesworthstone) is a prolific solo open-source developer based in New York with 2,159 GitHub followers and 172 public repositories. His most notable projects:

| Project | Stars | Description |
|---------|-------|-------------|
| beads_viewer | 1,365 | Graph-aware TUI for Beads issue tracker (PageRank, kanban, dependency DAG) |
| agentic_coding_flywheel_setup | 1,237 | VPS bootstrap for multi-agent AI dev environments |
| beads_rust | 694 | Rust port of Steve Yegge's Beads issue tracker |
| bulk_transcribe_youtube_videos | 659 | YouTube playlist transcription via Whisper |
| automatic_log_collector | 424 | Log analysis tool ("replace Splunk") |
| asupersync | 120 | The async runtime underlying pi_agent_rust |

**Assessment:** Emanuel is a serious systems programmer with a clear affinity for Rust rewrites of existing tools (beads_rust, pi_agent_rust, rich_rust). His Beads ecosystem work (viewer + Rust port) shows deep engagement with Yegge's ecosystem. The 509 stars on pi_agent_rust in ~5 weeks is strong traction. However: bus factor of 1, no corporate backing, and the adversarial license rider (blocking OpenAI and Anthropic) limits ecosystem growth and signals an opinionated stance toward the AI lab ecosystem.

---

## What's Valuable for Us

1. **Extension Security Model (study):** The capability-gated, two-stage exec enforcement with a tamper-evident risk ledger is the most sophisticated agent security model we've catalogued. When we build our own extension/tool gating in Phase 3+, this is the reference implementation. Specific patterns: capability gates as first-class types, AST-level command signal detection before shell exec, per-extension trust lifecycle tracking, and the shadow dual-execution sampling for safe fast-path validation.

2. **Performance Benchmarks as Reference:** The 4-5x speed and 8-12x memory improvements over Node.js on realistic 1-5M token sessions establish a concrete ceiling for what a Rust harness can achieve. These numbers are useful for evaluating whether a Rust migration is worth the development cost at Phase 4+.

3. **Embedded JS Runtime Pattern:** QuickJS embedding for extension compatibility without system Node dependency is a clean pattern. If we ever need to run JS/TS extensions in a sandboxed environment (e.g., untrusted community extensions), this approach is validated.

4. **Session Storage Hybrid:** JSONL-as-authority + SQLite-as-derived-index is a pragmatic pattern that preserves git-friendliness (JSONL diffs) while enabling fast metadata queries. Relevant if our orchestrator state files grow beyond simple JSON.

5. **asupersync's Structured Concurrency:** Region-owned tasks with capability-based contexts and deterministic replay testing. If we move any infrastructure to Rust, this runtime design is worth evaluating against tokio.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **License blocks Anthropic** | The MIT + Rider explicitly prohibits use by Anthropic (and OpenAI). Since our entire stack runs on Claude/Anthropic, this creates legal ambiguity even for studying the code for pattern adoption. We should treat this as reference-only, not adoption-candidate. |
| **Duplicates our Pi Agent research** | We already have 15+ deep-dive documents on the TS Pi Agent ecosystem and 12 Pi catalogue entries. Adding a Rust port as a migration target introduces a third harness option (Claude Code → TS Pi Agent → Rust Pi Agent) that violates Governing Principle #7 ("Build only what you have needed in the last 30 days"). |
| **No SDK/embedding mode yet** | The TS Pi Agent's `createAgentSession()` SDK mode is one of its most valuable features for orchestrator patterns. The Rust port only offers Interactive/Print/RPC modes — no programmatic embedding. |
| **Ecosystem fragmentation risk** | This is a separate codebase from Mario's pi-mono, not a contributor. Extensions may diverge. The Pi extension ecosystem (50-80 extensions) targets the TS version. |
| **Too early to evaluate stability** | 2,292 commits in ~5 weeks (Feb 2 → Mar 8) = ~65 commits/day. This is blitz development, not stable software. No version tags visible, no changelog discipline comparable to the TS version. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** No action. Stay with Claude Code. The license rider alone disqualifies this from our stack.
- **Phase 3 (Days 60-90):** If evaluating Pi Agent as primary harness, note that a Rust port exists. If performance on large sessions becomes a bottleneck with the TS version, revisit. Study the extension security model when designing our own tool gating.
- **Phase 4 (Days 90+):** If we decide to build custom Rust infrastructure (per Master Blueprint's "informed rebuild" phase), asupersync's structured concurrency and the JSONL+SQLite session pattern are reference implementations worth evaluating. The license issue would need resolution (fork under MIT before the rider was added, or negotiate with Emanuel directly).

---

## Key Takeaway

> **Pi Agent Rust proves the Pi Agent design ports cleanly to Rust with 4-12x performance gains, and its extension security model (capability gates + tamper-evident risk ledger) is the best we've catalogued — but the Anthropic-blocking license rider and ecosystem fragmentation from the TS original make it a study reference, not an adoption candidate.**
