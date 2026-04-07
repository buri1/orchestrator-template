# Harness Engineering: Codex in an Agent-Centric World

> **Ryan Lopopolo, Member of Technical Staff — OpenAI Engineering Blog, 2026-02-11**

| Field | Value |
|-------|-------|
| Source | https://openai.com/index/harness-engineering/ |
| Author | Ryan Lopopolo (Member of Technical Staff, OpenAI) |
| Publication | OpenAI Engineering Blog |
| Date | 2026-02-11 |
| Topics | harness engineering, agent-generated code, context engineering, AGENTS.md, Codex, autonomous development, architecture enforcement, feedback loops |
| Read Time | ~20 min |

---

## Burak's Notes

> *OpenAI's internal team built a real product with 0 lines of hand-written code using Codex agents — 1M LOC, ~1500 PRs, 3 engineers scaling to 7. This is the most detailed public account of full agent-driven development at scale. The patterns directly validate our architecture: progressive disclosure for context, mechanical enforcement of architecture, repo-as-knowledge-base, and the "garbage collection" pattern for tech debt. The Ralph Wiggum Loop reference connects to Geoffrey Huntley's work already in our catalogue. The 70/30 split shows up here too: humans design scaffolding (30%), agents write all code (100% of code output). Key tension: they say "not generalizable without similar investment" — honest about the setup cost.*

---

## Key Takeaways

1. **Zero hand-written code is viable at scale** — A team of 3 (later 7) engineers shipped a product with ~1M LOC and ~1,500 merged PRs over 5 months, with every line written by Codex agents. Throughput averaged 3.5 PRs per engineer per day and *increased* as the team grew.

2. **The engineer's role shifts from coding to scaffolding** — When agents write all code, the human job becomes designing environments, specifying intent, building feedback loops, and creating the tooling/abstractions that unlock agent capability. Failures are signals that scaffolding is missing, not that the agent needs to "try harder."

3. **AGENTS.md should be a table of contents, not an encyclopedia** — One big instruction file fails predictably (context crowding, everything-is-important problem, immediate rot). Instead, keep AGENTS.md short (~100 lines) as a map pointing to structured docs/ as the system of record.

4. **Mechanical enforcement beats documentation** — Architecture, naming conventions, schema validation, file size limits, and "taste invariants" are enforced via custom linters and structural tests (all written by Codex). Custom lint error messages inject fix instructions directly into agent context.

5. **Garbage collection is mandatory for agent-generated codebases** — Codex replicates existing patterns including bad ones. A recurring "doc-gardening" agent and background Codex tasks scan for drift, update quality scores, and open targeted refactoring PRs. Tech debt treated as high-interest loan: pay down continuously.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates our harness engineering approach: context separation, repo-as-truth, mechanical enforcement, progressive disclosure. The most authoritative public case study of full agent-driven development from a major AI lab. |
| **Actionable** | 9/10 | Concrete patterns we can adopt: short AGENTS.md as map, structured docs/ with indexing, custom linters with agent-friendly error messages, recurring garbage collection agents, per-worktree observability stacks, Chrome DevTools integration for agent E2E validation. |

---

## Summary

Ryan Lopopolo describes how a small OpenAI team (3 engineers, later 7) built and shipped an internal product with zero hand-written code over five months, producing approximately 1 million lines of code across ~1,500 merged pull requests using Codex agents exclusively. The product has internal daily users and external alpha testers.

The core insight is that when agents write all the code, engineering becomes "harness engineering" — designing environments, specifying intent, and building feedback loops rather than writing implementation. Early progress was slower than expected not because Codex was incapable, but because the environment lacked the tools, abstractions, and internal structure the agent needed. Every failure was treated as a signal that scaffolding was missing.

The team developed several key patterns: (1) A short AGENTS.md (~100 lines) serving as a table of contents pointing to a structured docs/ directory as the system of record, enforced by CI linting; (2) Making the application "agent-readable" by integrating Chrome DevTools Protocol, per-worktree observability stacks (Logs via LogQL, Metrics via PromQL), and bootable app instances per git worktree; (3) Rigid architectural enforcement through custom linters and structural tests — fixed layer ordering per business domain with mechanically checked dependency directions; (4) A "garbage collection" pattern using recurring Codex background tasks to detect drift, update quality scores, and open refactoring PRs — replacing the manual "20% Friday cleanup" that did not scale.

The article describes a pipeline where a single prompt can trigger an agent to inspect the codebase, reproduce a bug, record a video, implement a fix, verify it, record a second video, open a PR, respond to feedback, fix build errors, and merge — escalating to humans only when judgment is required. Human review has been almost entirely replaced by agent-to-agent review (a "Ralph Wiggum Loop" pattern).

---

## Notable Quotes

> "The early progress was slower than expected, not because Codex was incapable, but because the environment was underspecified."

> "Give Codex a map, not a 1000-page manual."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/codex-test-scaffolding/ | Companion article: "Codex Test Scaffolding: App Server Development" — detailed testing patterns for agent-generated code | `/ingest-article` |
| https://openai.com/index/openai-internal-data-agent/ | "A Look Inside OpenAI's Internal Data Agent" — Aardvark agent mentioned in article | `/ingest-article` |
| https://openai.com/index/beyond-rate-limits/ | "Beyond Rate Limits: Scaled Access to Codex and Sora" — scaling infrastructure for Codex | `/ingest-article` |
| https://ghuntley.com/specs/ | Geoffrey Huntley's "Ralph Wiggum Loop" — the review loop pattern OpenAI adopted (already referenced in our catalogue under practitioners) | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Codex (OpenAI) | Primary agent that writes all code; CLI + cloud modes | Yes — [OpenAI Codex](../agent-harnesses/openai-codex.md) |
| AGENTS.md | Convention file used as table-of-contents; initial version written by Codex itself | Yes — [AGENTS.md](../agent-protocols/agents-md.md) |
| Aardvark | Other OpenAI agent also working on the codebase alongside Codex | No — internal OpenAI tool, not catalogueable |
| GPT-5 | Model powering initial scaffolding generation via Codex CLI | No — model, not tool |
| Chrome DevTools Protocol | Integrated into agent runtime for DOM snapshots, screenshots, navigation | No — standard protocol |
| Zod | Preferred by Codex for boundary data parsing; not mandated by team | No — standard library |
| OpenTelemetry | Instrumentation for observability; integrated into custom utilities | No — standard library |
| LogQL / PromQL | Query languages for agent-accessible logs and metrics per worktree | No — standard query languages |
| gh (GitHub CLI) | Used directly by agents for PR workflows, review, merge | No — standard tool |
| Ralph Wiggum Loop | Agent review loop pattern (from Geoffrey Huntley) adopted for PR review | Yes — referenced in [Geoffrey Huntley](../practitioners/geoffrey-huntley.md) |

---

## Action Items

- [ ] Restructure our AGENTS.md to be a short map (~100 lines) pointing to structured docs/ — adopt the "table of contents" pattern
- [ ] Implement custom linters with agent-friendly error messages that inject fix instructions into context
- [ ] Build a recurring "garbage collection" agent that scans for pattern drift and opens refactoring PRs
- [ ] Explore per-worktree observability stacks (ephemeral logs/metrics per agent task)
- [ ] Investigate Chrome DevTools Protocol integration for agent-driven E2E testing (validates our existing Chrome DevTools MCP approach)
- [ ] Consider adopting the "golden principles" pattern — codify taste invariants as mechanical rules rather than documentation
