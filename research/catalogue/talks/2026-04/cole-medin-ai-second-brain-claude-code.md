# Full Guide - Build Your Own AI Second Brain with Claude Code

> **Cole Medin (@ColeMedin) — YouTube, 2026-04-04**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=1FiER-40zng |
| Speaker | Cole Medin, AI content creator & builder (@ColeMedin) |
| Event | Cole Medin YouTube Channel |
| Duration | ~01:00 (estimated) |
| Date | 2026-04-04 |
| Topics | obsidian, claude-code, second-brain, memory-architecture, hooks, skills, hybrid-rag, proactive-agents, python-cli-wrapper |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Context beats prompts -- persistent markdown files create compounding value** — Instead of re-explaining yourself every session, you embed your knowledge, preferences, and project state into markdown files (SOUL.md, USER.md, MEMORY.md, daily logs) that Claude reads automatically at startup. Each session builds on everything before it.

2. **Three hooks maintain cross-session continuity** — SessionStart loads memory into every new conversation, PreCompact saves critical context before Claude's automatic compaction, and SessionEnd captures decisions and learnings when you exit. This solves the "amnesia between sessions" problem.

3. **Python CLI wrapper pattern keeps API keys away from the LLM** — External platforms (Gmail, Slack, Calendar, Asana, GitHub) connect through a Python CLI where the LLM calls scripts like `query.py gmail list` and never sees credentials. Clean security boundary.

4. **Proactive Heartbeat at $0.05/run replaces expensive MCP polling** — Python scripts gather platform data on ~30-minute intervals, Claude reasons about it, and notifications are delivered. This is 7x cheaper than MCP-based approaches ($0.38/run).

5. **Hybrid RAG (70% vector + 30% keyword) for memory search** — Combines FastEmbed (local ONNX embeddings) with SQLite/PostgreSQL for retrieval. The blend outperforms pure vector or pure keyword search for knowledge base queries.

6. **Skills with progressive disclosure prevent context bloat** — Skills load metadata automatically but activate full instructions only on-demand via `/skill-name`. Prevents wasting context window on unused capabilities.

7. **A PRD-based personalization approach** — The starter repo includes a requirements template (8 sections: personal details, tool stack, proactive tasks, autonomy level, security, memory categories, infrastructure, integration priority). Running `/create-second-brain-prd` generates a phased build plan tailored to your setup.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps to our architecture. We already use CLAUDE.md, memory files, and hooks. The SOUL.md/USER.md/MEMORY.md layering validates and extends our approach. The Obsidian-as-backend pattern aligns with our markdown-first philosophy. The proactive heartbeat and skill architecture are patterns we can adopt almost verbatim. |
| **Actionable** | 9/10 | Immediately usable: the three-hook pattern (SessionStart/PreCompact/SessionEnd), the Python CLI wrapper for secure integrations, the progressive-disclosure skill loading, the hybrid RAG formula (70/30), and the four autonomy levels are all concrete patterns with working reference implementations in the starter repo. |

---

## Summary

Cole Medin presents a comprehensive guide for turning Claude Code into a "second brain" -- a persistent, context-aware AI assistant that remembers across sessions, connects to your platforms, and proactively monitors your workflows. The system is built entirely on markdown files, Python scripts, and an Obsidian vault, deliberately avoiding heavy frameworks. The core thesis: context beats prompts, and compounding knowledge over time is the real unlock.

The memory layer consists of four files: SOUL.md (agent personality and boundaries), USER.md (your profile and preferences), MEMORY.md (key decisions, lessons, active projects), and daily session logs. Three hooks -- SessionStart, PreCompact, and SessionEnd -- maintain continuity across sessions by loading context at start, preserving it before compaction, and capturing learnings at exit. This solves the fundamental problem of LLM amnesia between conversations.

External platform integrations (Gmail, Slack, Calendar, Asana, Linear, GitHub) connect through a Python CLI wrapper pattern where the LLM never touches API keys. The proactive heartbeat system runs on ~30-minute intervals at approximately $0.05/run, gathering data from platforms and reasoning about what needs attention. Skills use progressive disclosure to avoid context bloat -- metadata loads automatically but full instructions activate only on invocation.

The video introduces a nine-phase build plan (memory setup, hooks, search, platform connectors, skill architecture, proactive systems, messaging interface, security controls, deployment pipeline) and four autonomy levels ranging from Observer (notifications only) to Partner (autonomous low-risk actions). The accompanying starter repo at coleam00/second-brain-starter includes a requirements template that generates a personalized PRD via Claude Code skill invocation.

The entire system runs at approximately 20 EUR/month (Obsidian free + Claude Pro) and treats the Obsidian vault as the persistence backend. All data stays as plain-text markdown on your machine with no vendor lock-in.

---

## Notable Quotes

> "Context beats prompts." — Core thesis throughout the video

> "The system creates compounding value over time -- each session builds on everything before it." — On the memory architecture

> "The LLM never sees API keys." — On the Python CLI wrapper security pattern

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/coleam00/second-brain-starter | Starter repo with requirements template, PRD generator skill, and reference implementation of the full architecture | `/ingest-post` |
| https://github.com/coleam00/second-brain-skills | Skills library including SOP creation, presentation generation, MCP client integration, brand/voice generation, and a meta-skill for creating new skills | `/ingest-post` |
| https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain | Noah Vincent's detailed Substack writeup on building an AI second brain using Obsidian + Claude Code | `/ingest-article` |
| https://www.linkedin.com/posts/cole-medin-727752184_i-spent-two-months-building-a-second-brain-activity-7421356217605779456-MIa3 | Cole Medin's LinkedIn post with additional context on the two-month build journey | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Core runtime -- the AI agent that reads markdown files and executes skills | Yes -- extensively catalogued |
| Obsidian | Used as the knowledge base / vault backend for all markdown files | No |
| FastEmbed | Local ONNX embeddings for the vector search component of hybrid RAG | No |
| SQLite/PostgreSQL | Storage backends for the RAG search index | No (commodity) |
| second-brain-starter | Cole's starter repo with PRD generator and reference implementation | No |
| second-brain-skills | Companion repo with reusable skill definitions | No |

---

## Action Items

- [ ] Evaluate adopting the SOUL.md/USER.md/MEMORY.md layering pattern to complement our existing CLAUDE.md structure
- [ ] Implement PreCompact hook to preserve critical context before Claude's automatic compaction
- [ ] Review the Python CLI wrapper pattern for our own platform integrations (security boundary)
- [ ] Prototype the proactive heartbeat system for monitoring Notion DBs and email
- [ ] Clone coleam00/second-brain-starter and evaluate the PRD generator skill for our orchestrator
- [ ] Test the 70% vector + 30% keyword hybrid RAG formula against our current search approach
- [ ] Evaluate the four autonomy levels (Observer/Advisor/Assistant/Partner) as a framework for our agent permission model
