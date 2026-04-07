# CASS Memory System (cm)

> **Procedural memory for AI coding agents: transforms scattered session history into persistent, cross-agent memory so every agent learns from every other.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | [Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system) |
| GitHub Stars | 268 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel (Dicklesworthstone) — solo developer, PE/hedge fund consulting; creator of Agent Flywheel ecosystem (29 tools) |
| License | NOASSERTION (described as free and open-source) |
| Tech Stack | TypeScript, Bun runtime, YAML (playbook storage), MCP (Model Context Protocol) |
| Maturity | 🟡 Early (Alpha; actively developed; part of production Agent Flywheel stack) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *This is the dedicated memory component from Jeffrey Emanuel's Agent Flywheel ecosystem. Already referenced in the [Agent Flywheel](../agent-harnesses/agent-flywheel.md) catalogue entry but deserves its own deep-dive because the 3-layer cognitive architecture (episodic->working->procedural) with confidence decay is the most sophisticated memory model in the catalogue. The 90-day half-life decay + 4x harmful multiplier is a genuinely novel approach to preventing stale knowledge from poisoning agent context. The "deterministic curation" principle (LLM extracts insights, but NEVER rewrites the playbook — only delta merges) directly aligns with our 70/30 deterministic/LLM split. MCP integration means it could plug into our Claude Code setup. The key question is whether the Bun runtime dependency and the tight coupling to CASS (Rust search engine) make adoption practical on our macOS local stack vs. the Linux VPS it was built for.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly implements "knowledge compounding" (Master Blueprint Governing Principle #1: "the orchestration layer is the compounding asset"). The 3-layer memory architecture maps to our need for cross-session agent learning. MCP-native means zero-integration-cost with Claude Code. |
| **Novelty** | 8/10 | Confidence decay with 90-day half-life and 4x harmful multiplier is genuinely new — nothing else in the catalogue tracks rule reliability over time with this level of sophistication. The "deterministic curation" (no LLM rewrites of stored knowledge) is a pattern we haven't seen elsewhere. Anti-pattern inversion is clever. |
| **Actionable** | 6/10 | Could install and test within a day via `brew install dicklesworthstone/tap/cm`. But meaningful value requires accumulated session history — Phase 3 (Day 60+) is the realistic adoption window. The onboarding pipeline (`cm onboard`) is designed for zero-additional-cost analysis using your existing Claude Max subscription. |

---

## Overview

CASS Memory System (invoked as `cm`) is the procedural memory layer of Jeffrey Emanuel's Agent Flywheel ecosystem. It sits atop CASS (Cross-Agent Session Search, a Rust-based Tantivy search engine that indexes session logs from 11 different AI coding agents) and transforms raw session history into actionable, confidence-tracked rules.

The core insight is a three-layer cognitive architecture modeled after human memory formation: **Episodic Memory** (raw session logs — the ground truth, provided by CASS), **Working Memory** (structured diary entries that summarize sessions into accomplishments, decisions, challenges, and preferences), and **Procedural Memory** (a playbook of distilled rules with helpful/harmful counters, confidence decay, and maturity progression). The flow is always upward: raw logs are reflected into diary entries, diary entries are curated into playbook bullets, and playbook bullets are scored and served to agents before new tasks.

The critical design decision is **deterministic curation**: the LLM is used to extract insights during the reflection phase, but the curator that merges insights into the playbook is fully deterministic — delta-only updates, no LLM rewriting of stored knowledge. This prevents "context collapse" where repeated summarization progressively loses nuance. This directly mirrors our Master Blueprint's Governing Principle #2 (deterministic orchestration, LLM execution).

---

## Technical Architecture

### Three-Layer Cognitive Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                EPISODIC MEMORY (CASS Search Engine)              │
│  Raw session logs from 11 agent formats — ground truth          │
│  Claude Code │ Codex │ Cursor │ Aider │ Gemini │ ChatGPT │ ... │
│  Storage: Tantivy indices, <60ms queries                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │ cass search --robot
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                WORKING MEMORY (Diary Layer)                      │
│  Structured summaries: accomplishments, decisions, challenges   │
│  Cross-agent enrichment via related session discovery            │
│  Storage: structured diary entries with search anchors           │
└───────────────────────┬─────────────────────────────────────────┘
                        │ ACE Pipeline: Generator → Reflector → Curator
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                PROCEDURAL MEMORY (Playbook)                      │
│  Distilled rules with confidence tracking + decay               │
│  Maturity: candidate → established → proven → deprecated        │
│  Storage: playbook.yaml at ~/.cass-memory/                      │
└─────────────────────────────────────────────────────────────────┘
```

### ACE Pipeline (Generator -> Reflector -> Curator -> Validator)

The reflection pipeline follows the ACE (Agentic Context Engineering) framework:

1. **Generator** — Pre-task hydration: queries CASS + playbook to assemble relevant context for the current task
2. **Reflector** — Post-task LLM insight extraction with multi-iteration passes to prevent missing insights
3. **Curator** — Deterministic delta merge into playbook (NO LLM involvement — prevents context collapse)
4. **Validator** — Scientific validation: checks proposed rules against CASS history before accepting (GPT Pro innovation)

### Confidence Decay Algorithm

The most novel component. Each rule's effective score decays based on recency:

- **90-day half-life**: Confidence halves every 90 days without revalidation (configurable per-bullet)
- **4x harmful multiplier**: One harmful event counts as 4x one helpful event
- **Maturity multiplier**: candidate (0.5x), established (1.0x), proven (1.5x), deprecated (0x)
- **Auto-promotion**: candidate -> established (score >= 2, 1+ recent helpful), established -> proven (score >= 5, 2+ recent helpful)
- **Anti-pattern inversion**: Rules with multiple harmful marks auto-invert into warnings (e.g., "Cache auth tokens" becomes "PITFALL: Don't cache auth tokens without expiry validation")

### Playbook Bullet Data Model

Key fields per rule:
- `id`: `b-{timestamp36}-{random}`
- `scope`: global | workspace | language | framework | task
- `kind`: project_convention | stack_pattern | workflow_rule | anti_pattern
- `state`: draft | active | retired
- `maturity`: candidate | established | proven | deprecated
- `helpfulEvents` / `harmfulEvents`: timestamped feedback with decay
- `searchPointer`: optional CASS query for deep-diving the evidence
- `verification`: optional code-based validation (regex, file_exists, cass_query)
- `sourceSessions` / `sourceAgents`: full provenance chain

### Agent Interface

Primary command for agents:
```bash
cm context "<task description>" --json
```

Returns structured JSON with:
- `relevantBullets`: Task-scored rules from playbook with effective scores
- `antiPatterns`: Known pitfalls to avoid
- `historySnippets`: Past successful sessions
- `suggestedCassQueries`: Deeper investigation paths

Inline feedback protocol (agents embed in code comments):
```
// [cass: helpful b-8f3a2c] - saved from rabbit hole
// [cass: harmful b-x7k9p1] - incorrect for our case
```

### Graceful Degradation

- No CASS installed: playbook-only scoring (no history snippets)
- No playbook: empty playbook, commands functional
- No LLM available: deterministic reflection only
- Offline: cached playbook + local diary

---

## Publisher Background

**Jeffrey Emanuel** (GitHub: Dicklesworthstone) is a solo developer from a PE/hedge fund consulting background who built the 29-tool Agent Flywheel ecosystem for his own practice. His most popular tools include Agent Mail (1,780 stars — inter-agent MCP messaging), BV/Beads Viewer (891 stars — DAG task graph), Pi Agent Rust (509 stars — Rust coding agent CLI), and CASS (307 stars — cross-agent session search). He claims shipping 20,000+ lines of production Go code in a single day using his ecosystem. The CASS Memory System design was synthesized from four competing AI proposals (Claude, GPT Pro, Gemini, Grok) — he used competing LLMs to design the architecture and took the best elements from each, which is a meta-demonstration of the cross-agent learning the tool enables.

---

## What's Valuable for Us

1. **Confidence Decay Algorithm** — The 90-day half-life with 4x harmful multiplier is directly adoptable for any knowledge store we build. Our CLAUDE.md and MEMORY.md files currently have no mechanism for aging out stale guidance. Even without adopting cm itself, we should implement decay-based scoring for our own memory files. The exact algorithm is in `PLAN_FOR_CASS_MEMORY_SYSTEM.md` with TypeScript implementations of `getDecayedScore()` and `getEffectiveScore()`.

2. **Deterministic Curation Principle** — LLM extracts, deterministic code merges. This is our 70/30 split (Master Blueprint Principle #2) applied to memory management. The explicit prohibition against LLM rewriting stored knowledge prevents the "summarization death spiral" we've seen in other memory systems (Letta, Mem0). Adopt this principle regardless of tooling.

3. **Anti-Pattern Inversion** — Automatically converting failed rules into warnings is a pattern we should adopt. Bad experiences become explicitly-labeled pitfalls rather than silently deleted, which means agents learn from failures, not just successes.

4. **Zero-Cost Onboarding** — The `cm onboard` workflow leverages your existing Claude Max subscription to analyze past sessions. No additional API costs. The "fill-gaps" sampling strategy and template-based session reading are worth studying for our own session analysis needs.

5. **MCP Integration** — cm exposes its playbook and context via MCP, which means it could plug directly into our Claude Code setup as an MCP server. The `cm context "<task>" --json` command is designed for agent consumption with token budget controls (`--limit`, `--min-score`, `--no-history`).

6. **Structured Error Handling** — Every error returns `{success, code, error, hint, retryable}`. This error schema is worth adopting for our own state management tooling.

---

## What's NOT Relevant

1. **CASS Dependency** — The full episodic memory layer requires CASS (a separate Rust tool with Tantivy indices). We're not running 11 different coding agents — we use Claude Code exclusively. Installing CASS for a single-agent setup is overkill, though cm degrades gracefully without it (playbook-only mode).

2. **Cross-Agent Learning** — The headline feature ("every agent learns from every other") assumes you're running Claude + Codex + Cursor + Gemini simultaneously. Our Master Blueprint deliberately uses a single coding agent per task (Governing Principle #4: coordination overhead at exponent 1.724). Cross-agent memory aggregation is irrelevant for our architecture.

3. **Bun Runtime** — Adds a runtime dependency we don't currently have. Homebrew installation mitigates this, but it's still TypeScript/Bun in an ecosystem where we prefer deterministic shell scripts and Go/Rust tooling.

4. **VPS-First Design** — Like all Agent Flywheel tools, cm assumes Ubuntu VPS deployment. Homebrew support exists, but the testing and primary development target is Linux. macOS compatibility is secondary.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Implement the confidence decay algorithm pattern in our own MEMORY.md management — even manually, start timestamping learnings and marking which ones remain valid vs. stale. Study the `PlaybookBullet` schema for inspiration on structuring our own state files.
- **Phase 3 (Days 60-90)**: Install cm via Homebrew and run `cm onboard` against our accumulated Claude Code session history. By Day 60 we'll have enough sessions to make procedural memory extraction meaningful. Test in playbook-only mode (no CASS) first.
- **Phase 4 (Days 90+)**: If we expand to multiple coding agents or multiple team members, the cross-agent learning pipeline becomes valuable. Evaluate full CASS + cm stack for shared institutional memory across the team.

---

## Key Takeaway

> **CASS Memory System's 3-layer cognitive architecture with confidence decay (90-day half-life, 4x harmful multiplier) and deterministic curation (LLM extracts, code merges) is the most sophisticated agent memory model in the catalogue — adopt the decay algorithm and anti-pattern inversion patterns immediately, install the tool itself at Phase 3 when we have enough session history to feed it.**
