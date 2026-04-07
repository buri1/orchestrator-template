# Community Unconference - Agent Tools, Workflows & Best Practices

> **Various (Rob/Broomie, Raphael, Josh, Yari, Chad, Tevia, Jeremy, Kareem, and community) — Coding Agents: AI Driven Dev Conference, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=99Kxkemj1g8 (03:00:00 - 04:07:20) |
| Speaker | Various community members (Rob/Broomie, Raphael, Josh, Yari, Chad, Tevia, Jeremy, Kareem, others) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~01:07 |
| Date | 2026-03-08 |
| Topics | coding-agents, multi-agent-workflows, planning, hooks, parallel-agents, voice-dictation, memory-systems, context-engineering, skills, visual-qa, entrepreneurship |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Plan-first is the top community consensus** — Multiple speakers independently converged on "always start with a plan." The specific pattern: write a `plan.md` file (not Claude's plan mode) with an executive summary + actionable code snippets, then use that as the contract for execution. Plan files survive context clears and can be passed between agents.

2. **Hooks are the enforcement layer agents ignore instructions for** — Josh demonstrated that putting "run lint, run tests, check TypeScript" in CLAUDE.md is insufficient. Life-cycle hooks are the deterministic enforcement mechanism that actually guarantees quality gates run. This maps directly to our 70/30 deterministic/LLM split architecture.

3. **Screenshot-based visual QA is a massive accelerant** — Rob's pattern: instruct agents to generate Playwright screenshot walkthroughs for every user-facing change. At release time, replay screenshots at the last and new release tags, pixel-diff them, then have a sub-agent analyze whether diffs match PR intents. Prioritizes human review to high-risk changes only. Done on a separate build box, not in CI.

4. **Three-layer memory architecture for cross-tool persistence** — An attendee described combining Memory MCP (shared between Claude Desktop + Claude Code), Claude Code's auto-memory (per-repo), and Joplin (markdown-native personal knowledge base) with CLAUDE.md instructing when to use each layer. Research output goes to Joplin; repo-specific context stays in auto-memory.

5. **Skills as latent-space priming, not instruction delivery** — Raphael explained that skills are short (40-line) persona primers that unlock knowledge the LLM already has. The value isn't providing information but creating reusable expert personas. "LLMs already know how to do whatever a human does. You just need to prime it."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses multi-agent workflows, context engineering, planning patterns, hooks, memory systems, and agent QA — all core to our orchestrator architecture |
| **Actionable** | 8/10 | Multiple immediately implementable patterns: plan.md over plan mode, screenshot-based visual QA, hook enforcement, multi-layer memory, critique-revise loops, voice-first spec drafting |

---

## Summary

This community unconference session at the AI Driven Dev Conference 2026 used a live Slido Q&A format where attendees submitted their best tips for coding agents, upvoted favorites, and then defended their submissions on stage. The session surfaced remarkably consistent themes from practitioners across different backgrounds and tools.

The strongest consensus was around planning-first workflows. Raphael, who received the most upvotes, argued that plan.md files with executive summaries and code snippets dramatically improve agent output quality. Rob (Broomie creator) extended this by advocating for plan.md files over Claude Code's built-in plan mode, noting they are easier to view in markdown, discuss iteratively, commit to git, and pass between agent sessions. Chad described a critique-revise loop system where multiple agents (or models) critique a plan, then a revision agent incorporates feedback into versioned plans (v1, v2, etc.) with acknowledgement files.

The second major theme was enforcement through hooks and containers. Josh emphasized that agents routinely skip quality checks even when instructed in CLAUDE.md, and that life-cycle hooks are the only reliable way to enforce lint, TypeScript compilation, and test passes. Rob advocated always running agents in containers so "dangerously skip permissions" becomes safe, and Yari described building an LLM-powered approval hook that evaluates commands for safety and learns from approval history across sessions.

Rob contributed several more high-value patterns: visual QA via Playwright screenshot walkthroughs that compare release snapshots with pixel diffs analyzed by sub-agents; using Claude Code for open-ended product design research (competitor analysis, customer research, org charts) by giving it broad questions and letting it run; and having agents maintain documentation comments at the top of every file plus README per folder, enforced via a validation skill at submission time.

Other notable contributions included voice dictation for spec writing (using WhisperFlow to capture intent-rich free-form speech that LLMs clean up), a three-layer memory system (Memory MCP + auto-memory + Joplin), and Tevia's workflow of architecture agent, reviewer, TDD agent, coder, and code reviewer in a cycle where the human only reviews architecture. The hot takes section featured debates on domain specialization remaining important even as tools democratize, RAG not equaling vector search, and base models producing richer creative diversity than instruction-tuned models.

---

## Notable Quotes

> "If you always plan whatever you do, coding, life, whatever, if you plan ahead, you will always be more successful." — Raphael [03:16:55]

> "If you run in a container, you can do dangerously skip permissions and it's not dangerous." — Rob [03:22:50]

> "If you've got to do manual QA to see if your agents broke stuff, that's going to be such a bottleneck." — Rob [03:20:33]

> "More context is not always better. You start seeing that it has no inherent sense of what is more important. So having more information can lead to less focus." — Josh [03:27:34]

> "LLMs already know how to do whatever a human does. You just need to prime it." — Raphael [03:39:08]

> "Don't be afraid to scrap and restart... it's so cheap to start again is way better." — Josh [03:27:56]

> "It doesn't matter how good you are at building products, if you can't sell them, you're never going to succeed." — Tevia [03:56:26]

> "Subject matter expertise that could be expressed in one MD file is not specialization." — Community member [04:02:51]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://broomie.org | Rob's open-source parallel agent management tool — worktree creation, agent status dashboard, automated merges/PRs | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Broomie (broomie.org) | Rob's open-source tool for managing parallel agents — creates worktrees, shows agent status (working/blocked/help), automates merges and PR creation | Not yet catalogued — consider `/tool-catalogue` |
| Claude Code | Primary coding agent discussed throughout; hooks, plan mode, skills, auto-memory | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Claude Max | Multiple mentions of 10x cheaper than API; rate limiting tradeoffs | Yes — [Claude Max Economics](../../reference/claude-max-economics.md) |
| Playwright | Used for screenshot-based visual QA workflow (generating screenshots at release tags) | No — standard testing tool, not agent-specific |
| WhisperFlow | Voice dictation tool for feeding speech into Claude Code terminal; hold-shortcut-to-dictate | No — not yet catalogued |
| Joplin | Markdown-native note editor (similar to Obsidian) used as third memory layer | No — standard tool, not agent-specific |
| Memory MCP | Stock memory MCP server used across Claude Desktop and Claude Code | No — not yet catalogued |
| Devin | Mentioned for UI screenshot/video preview feature in PRs | No — not yet catalogued |
| Open Code | Mentioned alongside Codex as alternatives with hooks | No — not yet catalogued |
| Codex | Mentioned alongside Open Code as alternatives | Yes — [OpenAI Codex](../../agent-harnesses/openai-codex.md) |
| BMAD | Chad mentioned it as one of the plan-refining workflow tools | No — not yet catalogued |
| Perplexity | Used for deep research before feeding plans to Claude Code (token saving strategy) | No — not agent-specific |
| Slido | Live Q&A/voting platform used to run the unconference | No — not relevant |

---

## Action Items

- [ ] Evaluate Broomie (broomie.org) via `/tool-catalogue` — parallel agent management with worktree isolation, status dashboard
- [ ] Implement plan.md pattern: always write plans as files instead of using plan mode; add executive summary + code snippets
- [ ] Add screenshot-based visual QA to release workflow: Playwright screenshots at release tags, pixel-diff, sub-agent analysis
- [ ] Build a validation skill that runs at task completion to enforce documentation comments + README updates
- [ ] Implement critique-revise loop pattern for plan/spec refinement (multi-model critique with versioned acknowledgements)
- [ ] Experiment with LLM-powered approval hook (Yari's pattern) that evaluates commands for safety and learns from history
- [ ] Try WhisperFlow for voice-first spec drafting during planning phase
- [ ] Consider three-layer memory architecture: Memory MCP (cross-tool) + auto-memory (per-repo) + external markdown KB
