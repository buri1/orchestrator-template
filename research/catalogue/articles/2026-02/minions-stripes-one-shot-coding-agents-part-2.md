# Minions: Stripe's One-Shot, End-to-End Coding Agents — Part 2

> **Alistair Gray — Stripe Engineering Blog, 2026-02-19**

| Field | Value |
|-------|-------|
| Source | https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2 |
| Author | Alistair Gray, Software Engineer, Leverage Team @ Stripe |
| Publication | Stripe Engineering Blog |
| Date | 2026-02-19 |
| Topics | coding agents, devboxes, blueprints, context engineering, MCP, CI iteration, deterministic/LLM split |
| Read Time | 8 min |
| Companion | [Part 1](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents) (catalogued as [Stripe Minions tool entry](../orchestration-platforms/stripe-minions.md)) |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Key Takeaways

1. **Blueprints formalize the 70/30 split** -- Stripe's blueprints are workflow graphs that combine deterministic code nodes (linting, pushing, CI) with agentic LLM nodes (implement task, fix failures). This is the clearest production validation of the deterministic/LLM separation principle we adopted from Part 1. Individual teams can author specialized blueprints for their domains.

2. **Toolshed centralizes ~500 MCP tools, but agents receive intentionally small subsets** -- Stripe built a centralized internal MCP server called "Toolshed" with nearly 500 tools. The critical insight: agents get only task-relevant subsets, not all 500. This mirrors the "15 from 400" curation principle from Part 1 and directly validates our approach of scoping tool access per agent.

3. **Rule files solve large-repo context engineering** -- Instead of global CLAUDE.md/AGENTS.md files that would saturate context in a monorepo, Stripe uses Cursor-format rule files scoped to directories and file patterns. Rules attach automatically as agents traverse the filesystem. They sync between Cursor, Claude Code, and minions.

4. **Devboxes as "cattle not pets" enable full-permission agent isolation** -- Pre-provisioned EC2 instances boot in ~10 seconds with warm caches. Because devboxes are quarantined (no production access, no real data, no arbitrary network egress), agents run without confirmation prompts -- enabling fully unattended operation.

5. **Two-push CI cap prevents diminishing returns** -- After two push-and-CI cycles, the minion hands off to a human. This hard cap acknowledges that indefinite CI loops produce diminishing returns while burning tokens, compute, and time. Between pushes, deterministic autofixes are applied before falling back to an agentic fix attempt.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct companion to the Part 1 article that shaped our 70/30 split architecture. Blueprints, tool curation, rule scoping, and CI caps are all patterns we can adopt directly. |
| **Actionable** | 9/10 | Every section maps to a concrete implementation: blueprint DAGs for our orchestrator, MCP tool subsetting, directory-scoped rules, pre-warmed environments, and hard retry limits. |

---

## Summary

Part 2 of Stripe's Minions series dives into the infrastructure and engineering patterns that make their one-shot coding agents work at scale (1,300+ merged PRs/week, up from 1,000 in Part 1).

The foundation is **devboxes** -- standardized AWS EC2 instances treated as "cattle, not pets." Pre-provisioning pools warm up environments (git clone, Bazel cache, code generation services) so agents get a fully operational development environment in about 10 seconds. This infrastructure, originally built for human developers, proved equally valuable for agents -- a key insight about reusing existing developer tooling.

The agent itself is a **customized fork of Block's Goose**, adapted for fully unattended operation. Unlike human-facing tools like Cursor and Claude Code, minions don't need interruptibility or human-triggered commands. The devbox quarantine model (no production access, no real user data, no arbitrary network egress) means agents can run with full permissions without confirmation prompts.

**Blueprints** are the article's most architecturally significant concept. They're workflow graphs that combine deterministic code nodes (run linters, push changes) with agentic LLM nodes (implement task, fix CI failures). This formalization of the deterministic/LLM split prevents LLMs from being invoked where simple code suffices -- saving tokens, reducing errors, and guaranteeing subtask completion. Teams can create specialized blueprints for their specific workflows.

Context engineering is handled through two mechanisms. **Rule files** (using Cursor's format for directory and file-pattern scoping) attach automatically as agents traverse the filesystem, avoiding context saturation from global rules in a large monorepo. **Toolshed**, Stripe's centralized MCP server with nearly 500 tools, provides dynamic access to internal docs, ticket details, build statuses, and code intelligence -- but agents receive only intentionally small, task-relevant subsets.

The **iteration and feedback** strategy is pragmatic: Stripe's 3+ million test suite provides automated feedback. Deterministic lint nodes run pre-push, a background daemon precomputes lint heuristics in under one second, and CI iteration is capped at two rounds. After the second push, unresolved failures go to human review -- a deliberate cap against diminishing marginal returns.

---

## Notable Quotes

> "Cattle, not pets" -- describing devbox standardization (ephemeral, replaceable infrastructure rather than bespoke developer setups)

> "Shifting feedback left" -- providing IDE-level feedback immediately rather than waiting for CI detection

> "Putting LLMs into contained boxes" -- composing deterministic and agentic nodes within blueprints to constrain where LLMs operate

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents | Part 1 companion -- already catalogued as tool entry but could benefit from a dedicated article ingest | `/ingest-article` |
| https://cursor.com/docs/context/rules | Cursor's rule file format specification -- Stripe standardized on this for cross-tool rule sharing | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Block's Goose | Agent framework that Stripe forked for minions | Yes -- [Goose](../agent-harnesses/goose.md) (7/10) |
| Cursor | Human-facing coding tool; rule file format adopted by Stripe for cross-tool compatibility | Yes -- [Cursor](../developer-gui/cursor.md) (3/10) |
| Claude Code | Human-facing coding tool; contrasted with unattended minion operation; rule files synced to CC format | Yes -- implicit (our primary harness) |
| Toolshed | Stripe's centralized internal MCP server (~500 tools) | No -- proprietary internal system |
| MCP (Model Context Protocol) | Industry standard for networked tool access; Stripe's agentic ecosystem built on it | Yes -- referenced across catalogue |
| Bazel | Build system; cache warming part of devbox pre-provisioning | No -- build tool, not agent-specific |
| AGENTS.md | Alternative rule file format mentioned alongside CLAUDE.md | Yes -- [AGENTS.md](../agent-protocols/agents-md.md) (9/10) |
| Stripe Minions | The system described in this article | Yes -- [Stripe Minions](../orchestration-platforms/stripe-minions.md) (9/10) |

---

## Action Items

- [ ] Implement directory-scoped rule files (Cursor format) to replace/supplement global CLAUDE.md for large projects
- [ ] Add hard retry cap (2 rounds) to our CI iteration blueprint -- avoid infinite fix loops
- [ ] Design MCP tool subsetting: define per-task tool groups rather than exposing all available tools
- [ ] Update Stripe Minions tool entry with Part 2 details (500 MCP tools via Toolshed, blueprint formalization, rule file strategy)
- [ ] Evaluate Cursor rule format as cross-tool standard for our rule files
