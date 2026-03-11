# Showboat

> **Create executable demo documents that show and prove an agent's work**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/simonw/showboat](https://github.com/simonw/showboat) |
| GitHub Stars | 766 (as of 2026-03-08) |
| Publisher | Simon Willison (solo — prolific OSS author, Django co-creator) |
| License | Apache-2.0 |
| Tech Stack | Go (100%), single dependency (google/uuid); Python wrapper for PyPI distribution |
| Maturity | 🟡 Early (v0.6.1, 7 releases since Feb 2026, 36 commits, 2 contributors) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Testing documentation tool with fabrication prevention. Relevance 6/10.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Addresses agent trust/verification (Master Blueprint Principle 5: human review is the binding constraint). Could reduce review burden by providing verifiable proof-of-work artifacts. Not on our immediate roadmap but relevant as agent output volume grows. |
| **Novelty** | 7/10 | The "executable document as trust artifact" concept is genuinely novel. We haven't seen this pattern in any of the 192 catalogue entries. Closest analogue is Langfuse traces, but Showboat operates at the document/demo level rather than LLM call level. |
| **Actionable** | 5/10 | Could be integrated into agent workflows today via `showboat exec` + `showboat verify` in post-task hooks, but requires workflow changes we haven't needed yet. More useful when delivering client-facing proof of work. |

---

## Overview

Showboat is a minimal Go CLI that lets AI agents build structured markdown documents combining narrative commentary, executable code blocks, and captured output. The key differentiator is the `verify` command: it re-executes every code block in a document and compares actual output against recorded output, exiting with code 1 on any mismatch. This turns documentation into an executable test suite — if a document verifies, the agent's claimed work is reproducibly proven.

The tool follows Simon Willison's characteristic "do one thing well" philosophy. The entire codebase has a single external dependency (google/uuid). Documents are plain markdown files with code fences and output blocks — no proprietary format, no database, no server requirement. The optional remote streaming feature (via `SHOWBOAT_REMOTE_URL`) enables real-time observation of agent work sessions.

The anti-fabrication angle is the most architecturally interesting aspect: in a world where LLMs can hallucinate test results, documentation, and even screenshots, Showboat provides a deterministic verification layer that proves code actually ran and produced the claimed output. This directly addresses one of the trust gaps identified in our research on code quality failure taxonomies (agent code has 1.7x more issues; multi-agent amplifies 17.2x).

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│              CLI Entry (main.go)              │
│   parseGlobalFlags → command dispatch        │
│   --workdir, --version                       │
└──────────┬───────────────────────────────────┘
           │
    ┌──────▼──────┐
    │  cmd/ pkg   │
    │             │
    │  init.go    │─── Creates doc with title + UUID + timestamp
    │  build.go   │─── note/exec/image: appends blocks to doc
    │  verify.go  │─── Re-runs all code blocks, diffs outputs
    │  extract.go │─── Emits CLI commands to reproduce doc
    │  pop.go     │─── Removes last block
    │  remote.go  │─── POST to SHOWBOAT_REMOTE_URL (graceful degrade)
    └──────┬──────┘
           │
    ┌──────▼──────┐     ┌──────────────┐
    │ markdown/   │     │    exec/     │
    │             │     │              │
    │ blocks.go   │     │ runner.go    │─── Spawns child process per language
    │ parser.go   │     │ image.go     │─── Image embedding
    │ writer.go   │     └──────────────┘
    └─────────────┘

Document Format (plain .md):
  <!-- showboat uuid:abc123 -->
  # Title
  *2026-02-06T15:30:00Z*

  Commentary text (NoteBlock)

  ```bash
  command here        (CodeBlock, lang=bash)
  ```

  ```output
  captured output     (OutputBlock)
  ```
```

**Data model:** Documents are sequences of typed blocks (TitleBlock, NoteBlock, CodeBlock, OutputBlock, ImageBlock) parsed from markdown. No database, no state files — the markdown file IS the state.

**Verification logic (verify.go):** Iterates all CodeBlocks, executes each via `exec.Run(lang, code, workdir)`, checks if the next block is an OutputBlock, and does a direct string equality comparison. Mismatches are collected as `Diff` structs. Optionally writes a corrected document with updated outputs.

**Remote streaming (remote.go):** Form-encoded POST for text commands, multipart for images. 10-second timeout. Graceful degradation — network failures log to stderr without halting. Each document has a UUID for correlation.

---

## Publisher Background

**Simon Willison** is one of the most credible voices in the AI tooling space. He co-created Django (the Python web framework), built Datasette (a tool for exploring and publishing data), and has been writing about LLMs and AI agents since GPT-3. His blog (simonwillison.net) is widely regarded as the highest-quality source of practical LLM analysis. He authored the "Agentic Engineering Patterns" article already in our catalogue (scored 9/10 relevance). He coined or popularized several key concepts including "vibes-based coding" and the importance of heuristic-first agent design.

His OSS track record is extensive: Datasette, shot-scraper, llm, sqlite-utils, and dozens of other tools. Showboat was notably co-authored with Claude (listed as a contributor), making it a meta-example of agent-human collaboration. His tools consistently follow the Unix philosophy — small, composable, dependency-minimal.

---

## What's Valuable for Us

1. **Anti-fabrication pattern for agent deliverables.** The `verify` command is a deterministic quality gate (aligns with Master Blueprint Principle 2: deterministic orchestration). For gov client work (BSI/DSGVO compliance), provably-run code demos could serve as trust artifacts alongside Langfuse traces.

2. **Document-as-test-suite concept.** Instead of separate documentation and tests, the document IS the test. This is a novel approach to the human review bottleneck (Principle 5) — reviewers can `showboat verify` a document rather than re-running agent work manually.

3. **Extract command for reproducibility.** `showboat extract` emits the exact CLI commands needed to recreate a document. This is essentially a deterministic replay log at the demo level — conceptually similar to Flyte/Union replay logs but for documentation rather than workflows.

4. **Remote streaming for live observation.** The `SHOWBOAT_REMOTE_URL` pattern could feed into our observability layer. Real-time POST of agent work steps to a webhook endpoint maps cleanly to our notification layer architecture.

5. **Zero-dependency design.** Single Go binary, one external dependency. Validates the "build only what you need" principle. Could be vendored or forked trivially.

---

## What's NOT Relevant

1. **Not an orchestration tool.** Showboat documents individual agent work sessions. It has no concept of multi-agent coordination, task routing, or state management. It doesn't replace any component in our three-layer architecture.

2. **Limited to CLI-demonstrable work.** The exec command runs shell commands. It can't verify GUI interactions, browser-based E2E tests (our Chrome DevTools MCP pattern), or Notion API operations. Most of our agent work involves code changes verified by test suites, not standalone command demos.

3. **String equality verification is brittle.** Any non-deterministic output (timestamps, UUIDs, memory addresses, random values) will cause false verification failures. Real-world agent code often produces non-deterministic output. Our existing quality gates (lint → SAST → unit tests → E2E) are more robust.

4. **No integration with our stack.** No MCP server, no hook system, no Claude Code awareness. Would require custom wrapper work to integrate into L-Thread workflows.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Could be useful for creating verifiable client demos. When delivering gov contract work, `showboat verify` could serve as part of the acceptance testing evidence package. Low priority — current test suites suffice.

- **Phase 3 (Days 60-90):** If we build a client-facing portal or reporting system, Showboat documents could be auto-generated as "proof of work" artifacts for each completed task. The remote streaming feature would feed real-time progress to a dashboard.

- **Phase 4 (Days 90+):** In a SaaS Factory context where we're shipping multiple products rapidly, Showboat could document the setup/deployment process for each product as a verifiable runbook. The `extract` command would make these runbooks reproducible.

---

## Key Takeaway

> **Showboat introduces a genuinely novel "executable document as trust artifact" pattern — deterministic verification that agent-claimed work actually ran and produced claimed output — but it's a niche tool for demo/documentation scenarios rather than a core infrastructure component for our architecture.**
