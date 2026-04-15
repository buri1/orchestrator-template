# Hermes-Wiki

> **Line-by-line source-verified architecture documentation for Nous Research's Hermes Agent — 36 concept pages covering loops, skills, memory, tools, gateways, hooks, worktrees, multi-agent, and more.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses (reference layer) |
| Repository | https://github.com/cclank/Hermes-Wiki |
| GitHub Stars | 73 (as of 2026-04-11) |
| Publisher | cclank (solo community contributor, not affiliated with Nous Research) |
| License | MIT (per README badge; no LICENSE file checked in yet) |
| Tech Stack | Markdown + YAML frontmatter + Obsidian-style `[[wiki-links]]` (no code) |
| Maturity | 🟡 Early — 4 days old, but exceptionally dense |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Nearly every page maps 1:1 to a component we're building or evaluating in the L-Thread orchestrator: agent loop, prompt assembly, memory store, session search, skills-vs-memory boundary, prompt caching, worktree isolation, multi-agent delegation, hook system, terminal backends. It's a free architectural reference book for an agent stack that's already catalogued as `Hermes Function Calling` on our side. |
| **Novelty** | 7/10 | The wiki itself isn't a new product — it's derivative documentation. What's novel is (a) the methodology (line-by-line source verification with commit-range changelogs, SCHEMA.md-enforced YAML frontmatter, mandatory `log.md` append-only audit) and (b) the exposed surface area of Hermes Agent internals we hadn't catalogued: `error_classifier.py` (13 FailoverReason types), spawn-per-call terminal model across 6 backends, 8-strategy fuzzy matching, 75% prefix-cache savings, `min_tail=3` context compression, 4 multi-agent runtime mechanisms (`delegate_task` / MoA / Background Review / `send_message`), 14+ platform toolsets, 15-platform gateway with PII scrubbing. |
| **Actionable** | 8/10 | This wiki is itself a worked example of **"build a wiki-as-skill for your own harness"** — exactly the "Obsidian LLM wiki second brain" pattern we've been planning (`2026-04-04_SYNTHESIS_obsidian-llm-wiki-second-brain.md`). The SCHEMA.md, frontmatter tag taxonomy, and `log.md` append-only pattern are directly copy-pasteable for our orchestrator docs. The architectural insights (error classifier, spawn-per-call, prompt caching strategy) can be lifted into our own devlog and worker prompts this week. |

---

## Overview

**Hermes-Wiki** is a 4-day-old solo community documentation project that exhaustively reverse-engineers Nous Research's [`hermes-agent`](https://github.com/NousResearch/hermes-agent) into 36 cross-linked concept pages plus 2 entity pages, organized as an Obsidian-compatible vault with wiki-style `[[double bracket]]` links. Every page is marked "逐行源码验证" ("line-by-line source code verified") and cites specific file paths and class names. The stated methodology (in `SCHEMA.md`) enforces YAML frontmatter, a fixed tag taxonomy (11 categories from `architecture` to `trajectory`), a ~200-line page-splitting threshold, and a mandatory append-only `log.md` audit of every wiki operation.

The content is **all in Chinese**, but every source file path, class name, function name, commit hash, and architectural term is in English — which makes it fully usable as a reference for an English-speaking engineer who knows what to grep for. The wiki is explicitly designed to be (a) browsed on GitHub, (b) cloned as an Obsidian vault (`git clone ... ~/Hermes-Wiki`), **or** (c) consumed by Hermes Agent itself via `skills.config.wiki.path: ~/Hermes-Wiki` — meaning the wiki is both human docs and an agent skill pack in the same repository.

Key design decisions worth noting: (1) Every concept page has ≥2 outbound wiki links, enforcing graph density. (2) Changelogs are tied to commit ranges (`commit_range: 4f467700..268ee6bd`) and summarize both new features and refactors with file names and line counts. (3) The schema explicitly allows 5 page types (`entity | concept | comparison | query | summary`) — a clean ontology for any agent-knowledge-base project.

---

## Technical Architecture

### Repository layout

```
Hermes-Wiki/
├── README.md              # Categorized TOC + 36 page links (Chinese)
├── SCHEMA.md              # YAML frontmatter spec + tag taxonomy + thresholds
├── index.md               # Agent-consumable index (one-line summaries per page)
├── log.md                 # Append-only audit of all wiki operations
├── concepts/              # 36 architecture deep-dives
│   ├── agent-loop-and-prompt-assembly.md
│   ├── memory-system-architecture.md
│   ├── skills-system-architecture.md
│   ├── tool-registry-architecture.md
│   ├── ... (32 more)
├── entities/              # 2 core class pages (aiagent-class, memorystore-class)
└── changelog/
    └── 2026-04-09-update.md  # 59 commits summarized with file/line counts
```

### Page schema (SCHEMA.md)

```yaml
---
title: Page Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [architecture, tool, gateway, ...]
sources: [raw/articles/source-file.md]
---
```

Tag taxonomy groups: `architecture`, `skills`, `memory`, `tools`, `agent`, `gateway`, `cli`, `performance`, `security`, `data`, `ops`.

### Content catalogue (36 concept pages, 2 entities)

**Core architecture (6):** agent-loop-and-prompt-assembly, tool-registry-architecture, model-tools-dispatch, toolsets-system (14+ toolsets), prompt-builder-architecture (injection-defense + skill caching), auxiliary-client-architecture (8-level provider fallback chain).

**Memory & sessions (5):** memory-system-architecture (3-layer: MemoryStore/MemoryManager/MemoryProvider, frozen-snapshot mode), session-search-and-sessiondb (FTS5 + LLM summaries, orphan deletion), context-compressor-architecture (token-budget tail protection with `min_tail=3`, session splitting), skills-and-memory-interaction (decision tree), skills-system-architecture (progressive disclosure).

**Tools & capabilities (7):** browser-tool-architecture (multi-backend, accessibility tree, 3-layer security), web-tools-architecture (LLM content compression), code-execution-sandbox (7-tool limit, UDS/File RPC), voice-mode-architecture (3 STT × 5 TTS providers), context-references (@file/@folder/@diff/@url/@git), fuzzy-matching-engine (8-strategy chain), large-tool-result-handling (3-layer overflow: intra-tool truncation → single-result persistence → round aggregation budget).

**Performance (3):** parallel-tool-execution (3-tier safety classifier + path-conflict detection), prompt-caching-optimization (frozen snapshot → prefix cache → 75% cost savings), smart-model-routing.

**Security & reliability (3):** security-defense-system (5 layers + manual/smart/off approval modes for dangerous commands), interrupt-and-fault-tolerance (`error_classifier.py` 13 FailoverReason types + Fallback model chain), credential-pool-and-isolation (multi-key auto-rotation, 4 pool strategies, Profile isolation).

**Multi-Agent (2):** multi-agent-architecture (4 runtime mechanisms: `delegate_task` / MoA / Background Review / `send_message`), configuration-and-profiles (multi-profile = fully-isolated agent instances, "second multi-agent approach").

**Platform & extensions (10):** cli-architecture (+ `hermes dump`), terminal-backends (6 backends unified under spawn-per-call), messaging-gateway-architecture (15 platforms incl. BlueBubbles/iMessage), gateway-session-management (PII scrubbing, reset strategies), hook-system-architecture (dual system: Gateway Hooks + Plugin System), mcp-and-plugins (OAuth support), skin-engine (YAML-driven theming), **worktree-isolation** (Git Worktree parallel isolation), cron-scheduling (natural-language scheduling, multi-platform delivery), trajectory-and-data-generation (RL training env).

**Entities (2):** `aiagent-class` (core dialogue loop, model + tool-call management), `memorystore-class` (MEMORY.md + USER.md management).

**Changelog (1):** 2026-04-09 covers 59 commits including (a) `error_classifier.py` 789 lines replacing string-matching failover, (b) `hermes dump` command (337 lines), (c) BlueBubbles iMessage platform, (d) unified spawn-per-call execution layer replacing per-backend persistent shells.

---

## Publisher Background

`cclank` is a solo GitHub user (ID 29557585, public since before 2026). The Hermes-Wiki repo is their only notable public work at the time of analysis — no other public repositories with stars. The project was created 2026-04-08 and has 73 stars, 7 forks, 0 open issues in its first 4 days, which is unusually high velocity for a solo docs project and suggests the Nous Research / HermesAgent community is actively boosting it.

Crucially: **this is not an official Nous Research project.** It's a community reverse-engineering effort, which is both its strength (independent, no marketing gloss) and its weakness (no guarantees of long-term maintenance, no authoritative status if the upstream refactors). The README explicitly frames the work as "based on Hermes Agent source analysis" and the `log.md` shows the author is running this as a scheduled "Hermes Wiki 专题编写 (每小时一个), 8 次重复" — i.e. one topic-page per hour on a cron schedule, almost certainly generated by an agent (possibly Hermes Agent itself) and then human-reviewed.

Cross-reference: Our existing catalogue already has the related but distinct community post [Memory Systems for OpenClaw / Hermes Agent](../posts/2026-04/mattshumer-memory-systems-openclaw-hermes.md) and [HermesAgent Workspace Dashboard](../posts/2026-04/outsource-hermesagent-workspace-dashboard.md). The `Hermes Function Calling` entry under [Agent Protocols](../agent-protocols/hermes-function-calling.md) is a separate, older NousResearch repo. **Note on naming collision:** "Hermes Agent" is used by at least two distinct projects in our corpus — (1) Nous Research's `hermes-agent` (the one this wiki documents), and (2) Matt Shumer's OpenClaw-adjacent HermesAgent (no source link confirmed yet). These should not be conflated.

---

## What's Valuable for Us

1. **Meta-pattern: wiki-as-skill-pack.** The single most valuable insight is that Hermes-Wiki is both a human-readable architecture reference and an agent-consumable skill pack (`skills.config.wiki.path`). This validates our own `2026-04-04_SYNTHESIS_obsidian-llm-wiki-second-brain.md` plan. We should adopt the dual-use pattern: one markdown repo consumed by humans in Obsidian AND by workers via skill-pack loading. Immediate action: fold `research/catalogue/` into our orchestrator's worker prompt as a skill index.

2. **SCHEMA.md + log.md as governance primitives.** The YAML frontmatter spec (`type`, `tags`, `sources`, `contradictions`), fixed tag taxonomy, ≥2-outbound-links rule, 200-line page-split threshold, and append-only `log.md` together form a lightweight governance layer that could replace our current ad-hoc devlog formatting. Lift `SCHEMA.md` directly and adapt the tag taxonomy to L-Thread categories. This maps to Master Blueprint principle #3 (context is zero-sum — enforce structure so agents don't drift).

3. **Error classifier as pattern.** The `agent/error_classifier.py` breakdown (13 FailoverReason enums, each with structured `retryable` / `should_compress` / `should_rotate_credential` / `should_fallback` flags) is directly translatable to our `/roadblock-recovery` command. We should build a `RoadblockClassifier` that reads tmux `capture-pane` output and emits the same four flags. File to study: https://github.com/NousResearch/hermes-agent/blob/main/agent/error_classifier.py (via this wiki's changelog entry).

4. **Spawn-per-call terminal model.** Hermes's unification of 6 backends (local/docker/ssh/singularity/modal/daytona) under a single "spawn `bash -c` per command + replay session snapshot" model is a cleaner abstraction than persistent shells. Relevant to our tmux-based workers: we already spawn-per-call, but the session-snapshot replay (env vars, functions, aliases captured once, re-sourced every call) is a pattern worth adding to our worker bootstrap. See `concepts/terminal-backends.md`.

5. **Worktree isolation page.** The wiki has a dedicated `worktree-isolation.md` page — Hermes Agent independently arrived at the same git-worktree pattern we (and Oh-My-Pi, pi-side-agents, Broomie, GasCity) converged on. We should diff their implementation against ours for any missed edge cases. Cross-link target: our own `ADOPTABLE-PATTERNS.md` worktree section.

6. **Multi-agent 4-mechanism taxonomy.** Hermes exposes 4 distinct multi-agent runtime mechanisms: `delegate_task` (sub-agent), MoA (Mixture of Agents), Background Review (async parallel), `send_message` (cross-platform). Our orchestrator currently only does `delegate_task`-equivalent (spawn-tmux-worker). Adding a "Background Review" channel for linting/static analysis without blocking the main loop is a low-cost upgrade.

7. **Prompt caching strategy.** "Frozen snapshot protects prefix cache → 75% cost savings" — this is the clearest prose explanation of Anthropic prompt caching I've seen. Directly applicable to our worker-spawn prompts: freeze the system+tool blocks so the prefix is identical across all workers in a session. Maps to Master Blueprint principle #2 (token efficiency is a first-class concern).

8. **Large-tool-result 3-layer overflow.** The pattern (intra-tool truncation → single-result persistence → round-aggregation budget) is a clean 3-layer defense against context explosion. Our current approach is ad-hoc. Adopt the 3-layer taxonomy as a worker rule in `.claude/agents/orchestrator.md`.

---

## What's NOT Relevant

- **The wiki's Chinese prose.** Not a blocker (we can LLM-translate on demand) but means we can't grep for English architectural terms inside page bodies — only in file paths, class names, and code fences. Agents searching the vault should use code-block / heading-anchor search, not prose search.
- **Hermes Agent's messaging gateway (15 platforms).** Cool, but our orchestrator runs in tmux on one operator's machine. Telegram/Discord/WhatsApp/BlueBubbles adapters are a Phase 4+ concern if we ever expose the orchestrator as a remote control plane.
- **Skin engine / YAML theming.** Pure UX polish for a user-facing CLI; our orchestrator has no user-facing UI beyond `tmux capture-pane`.
- **Voice mode (STT×TTS provider matrix).** Not on our roadmap.
- **Cron scheduling with natural language.** We use `launchd` + bash; no need for an in-agent scheduler.
- **The wiki itself is not code.** Treat it as pure reference, not dependency. If Nous Research refactors `hermes-agent`, this wiki will silently drift out of date and `cclank` may or may not update it.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Lift `SCHEMA.md` frontmatter convention into `research/catalogue/_TEMPLATE.md`. Adopt append-only `log.md` audit pattern for `_bmad/devlog.md`. Translate `concepts/error_classifier` and `concepts/worktree-isolation` pages to English and cross-link from `ADOPTABLE-PATTERNS.md`.
- **Phase 2 (Days 4-60):** Build `RoadblockClassifier` modeled on Hermes's error_classifier (13 FailoverReason → 4 structured flags). Integrate into `/roadblock-recovery` and `/tmux-recovery` commands. Add Background Review channel (non-blocking linter subagent) to the orchestrator loop.
- **Phase 3 (Days 60-90):** Adopt the "wiki-as-skill-pack" dual-use pattern — our `research/catalogue/` becomes both an Obsidian vault and a skill pack loaded by worker agents via a `CATALOGUE_PATH` env var. Workers query the catalogue for architectural precedents before implementing patterns.
- **Phase 4 (Days 90+):** If we ever expose the orchestrator as a remote control plane, revisit Hermes's 15-platform messaging gateway + PII scrubbing + reset strategies as reference for safe multi-tenant session management.

---

## Key Takeaway

> **Hermes-Wiki is the most concise architectural reference book for a production agent harness I've seen — and its SCHEMA.md + log.md governance pattern is a directly stealable blueprint for our own catalogue becoming a dual-use skill pack.**
