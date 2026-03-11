# OpenDev

> **AI-powered terminal-native coding agent with compound AI architecture, 5-model workload routing, 5-stage adaptive compaction, 8 specialized subagents, channel adapter framework, and Docker sandboxing — the first fully-documented open-source agent architecture.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [opendev-to/opendev](https://github.com/opendev-to/opendev) |
| GitHub Stars | 91 (as of 2026-03-09) |
| Publisher | Nghi D. Q. Bui (solo — academic researcher, arXiv paper author) |
| License | MIT (CC BY 4.0 for the paper) |
| Tech Stack | Python (92.8%), 116K LOC, Pydantic, Textual TUI, FastAPI+React Web UI, Playwright, fastmcp, tiktoken, crawl4ai, ast-grep |
| Maturity | 🟡 Early (v0.1.7, created 2026-03-04, 5 days old at analysis) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *Paper undersells the actual codebase significantly. 116K lines of Python is a serious project — not just an academic toy. The channel adapter framework (Telegram/WhatsApp/Web) is something Pi has zero concept of, and could matter for our marketing/lead-gen business lines. Docker subagent runtime is stronger isolation than tmux. BUT: subagents are ephemeral (fire-and-forget), no agent-to-agent messaging, no shared task queues, no coordination primitives. This is a sophisticated single-agent system with delegation, not a multi-agent orchestration platform. Best value: steal the compaction thresholds, escalating reminders, and schema-level isolation patterns for our Pi extensions.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The most comprehensive open-source documentation of terminal-agent architecture patterns. Validates our compound AI approach. Channel adapter framework opens a path we haven't considered (agents accessible via Telegram/WhatsApp). Docker sandboxing relevant for DSGVO gov work. But subagents are ephemeral — no persistent multi-agent coordination, which is our core need. |
| **Novelty** | 7/10 | 5-stage compaction with concrete thresholds (70/80/85/90/99%), escalating system reminders (gentle→strong→veto), schema-level subagent isolation, dual hook system (10 shell + 2 in-process plugin), channel adapter framework, Docker subagent runtime. Several patterns we haven't seen elsewhere. |
| **Actionable** | 7/10 | Compaction thresholds immediately adoptable. Custom agent definitions (JSON + Markdown) validate our approach. Channel adapter framework is a clean abstraction if we ever want Telegram/WhatsApp agents. Schema-level tool filtering for subagents is directly implementable as a Pi extension. |

---

## Overview

OpenDev is the first terminal-native coding agent to publish a comprehensive technical report (arXiv 2603.05344) documenting its full architecture with design rationale. Created by Nghi D. Q. Bui, it's a 116K-line Python codebase implementing a compound AI system with 5 model roles, 8 specialized subagents, a 5-stage adaptive compaction engine, dual hook systems, a channel adapter framework for multi-platform deployment (CLI + TUI + Web + Telegram + WhatsApp), and Docker sandboxing for subagent isolation.

The central architectural thesis is that **context pressure is THE unifying design constraint** — every decision (compaction, model routing, tool discovery, subagent isolation, memory) exists to manage finite context windows. This framing is consistent with our own research findings and the compound AI systems paper (Zaharia et al.) that we've catalogued.

What makes OpenDev architecturally interesting beyond the paper is what the code actually ships: custom agent definitions via JSON/Markdown (already working, despite roadmap listing it as "planned"), a full ACE Playbook memory system with embedding-based retrieval and feedback scoring, priority-ordered conditional prompt composition with cache boundary splitting for Anthropic prompt caching, and a production-ready session management system with session forking. The channel adapter framework is particularly notable — a clean `InboundMessage`/`OutboundMessage` abstraction with a message router that handles session resolution per channel, something no other terminal agent in our catalogue offers.

---

## Technical Architecture

```
Entry Layer
├── CLI (opendev.cli:main)
├── TUI (Textual — chat_app.py, runner.py)
└── Web UI (FastAPI + React/Vite + WebSocket)
    └── Channel Adapters (Telegram, WhatsApp skeletons)
        └── MessageRouter → InboundMessage/OutboundMessage

Agent Layer (core/agents/)
├── MainAgent (HttpClientMixin + LlmCallsMixin + RunLoopMixin + BaseAgent)
│   ├── 5 HTTP clients: Normal, Thinking, Critique, VLM, Compact
│   ├── ToolSchemaBuilder (allowed_tools filtering per agent)
│   ├── _injection_queue (thread-safe, bounded to 10)
│   └── build_system_prompt() → stable/dynamic split for cache boundary
│
├── SubAgentManager (Registration + Docker + Execution mixins)
│   ├── 8 built-in: planner, code_explorer, pr_reviewer, security_reviewer,
│   │              project_init, web_clone, web_generator, ask_user
│   ├── Custom agents: ~/.opendev/agents.json + ~/.opendev/agents/*.md
│   └── Docker subagent execution (file copy in/out, workspace isolation)
│
└── PromptComposer (priority 10-95, conditional sections, cache boundary)

Tool Layer (core/context_engineering/tools/)
├── 25+ built-in tools (file, bash, git, web, VLM, PDF, notebook, LSP, memory, todo, schedule)
├── Tool Registry with schema dispatch
├── MCP integration (lazy discovery via search_tools)
└── 9-pass fuzzy edit matching (exact→whitespace→comment→fuzzy→context→multi-candidate→AI→line-range→line-number)

Context Engineering (core/context_engineering/)
├── Compaction: 5-stage (70%→80%→85%→90%→99%)
│   ├── ArtifactIndex (files touched, survives compaction)
│   ├── History archival (full messages to scratch file)
│   └── compact_with_retry (up to 2 retries with replay)
├── Memory: ACE Playbook (bullet-based, embedding retrieval, delta updates, feedback scoring)
└── Retrieval: ContextTokenMonitor + anchor-based tool selection

Hooks (core/hooks/)
├── Shell-based (10 events): SessionStart, UserPromptSubmit, PreToolUse, PostToolUse,
│   PostToolUseFailure, SubagentStart, SubagentStop, Stop, PreCompact, SessionEnd
│   └── HookManager: regex matchers, exit code 2 = block, JSON stdin/stdout protocol
└── In-process Python plugins (2 methods): on_pre_tool_use, on_post_tool_use
    └── PluginHookManager: ~/.opendev/plugins/*.py + .opendev/plugins/*.py

Safety (5 independent layers)
├── Layer 1: Prompt guardrails (security-policy.md, action-safety.md)
├── Layer 2: Schema filtering (allowed_tools at construction)
├── Layer 3: Runtime approval (Manual/Semi-Auto/Auto with persistent patterns)
├── Layer 4: Tool-level validation (DANGEROUS_PATTERNS blocklist)
└── Layer 5: Lifecycle hooks (exit code 2 = rejection)

Persistence
├── Sessions: ~/.opendev/sessions/ (JSON, 8-char IDs, project-scoped)
├── Config: .opendev/settings.json (project) > ~/.opendev/settings.json (user) > env > defaults
├── Memory: ACE Playbook persistence
└── Provider cache: ~/.opendev/cache/providers/*.json (24h TTL)
```

**Key Data Models:**
- `SubAgentSpec`: name, description, system_prompt, tools (list | "*" | {"exclude": [...]}), model override, docker_config
- `AgentConfig`: name, description, tools, skill_path, source (builtin/user-global/project), model
- `PromptSection`: name, file_path, condition (callable), priority (10-95), cacheable (bool)
- `HookEvent`: 10 lifecycle events, regex matchers, JSON stdin protocol
- `InboundMessage`/`OutboundMessage`: channel, user_id, thread_id, text, attachments, metadata

**Compaction Thresholds (from compaction.py):**

| Stage | Threshold | Action |
|-------|-----------|--------|
| WARNING | 70% | Log warning, tracking begins |
| MASK | 80% | Replace old tool results with `[ref: tool result {id}]` (keep recent 6) |
| PRUNE | 85% | Strip old tool outputs (protect recent 40K tokens + skill/plan/read_file results) |
| AGGRESSIVE | 90% | Minimal refs (keep only recent 3 tool results) |
| COMPACT | 99% | Full LLM-powered summarization + artifact index injection + history archival |

---

## Publisher Background

Nghi D. Q. Bui (bdqnghi@gmail.com) is an academic researcher who published the comprehensive arXiv paper (2603.05344) documenting OpenDev's architecture. Limited public profile beyond this project. The repo was created 2026-03-04 — only 5 days old at time of analysis. 91 stars, 3 forks, 0 open issues. Solo developer with no visible team, funding, or organizational backing.

**Risk factors:** Bus factor of 1 with no established open-source track record (unlike Pi Agent's Mario Zechner who created libGDX with 24.8K stars). MIT license mitigates abandonment risk. The 116K LOC codebase is substantial for a solo project — maintenance burden is high. No governance structure, no roadmap execution history, no community contributors yet.

**Credibility signal:** The arXiv paper demonstrates deep architectural thinking and willingness to document design decisions publicly. The code quality is solid (mypy strict, Black+Ruff, Google docstrings, comprehensive test infrastructure). But academic origin means unclear commitment to production-grade maintenance and backwards compatibility.

---

## What's Valuable for Us

1. **5-Stage Compaction with Concrete Thresholds** (`compaction.py`): 70/80/85/90/99% thresholds with distinct strategies at each level. The `ArtifactIndex` pattern (files touched survive compaction) and history archival to scratch files for post-compaction grep are directly adoptable. Build as `context-pressure-manager.ts` Pi extension using the `context` event.

2. **Channel Adapter Framework** (`core/channels/`): Clean `InboundMessage`/`OutboundMessage` abstraction with `MessageRouter` handling session resolution per (channel, user_id, thread_id). If we ever want agents accessible via Telegram/WhatsApp for marketing/lead-gen, this is the cleanest architecture we've seen. No Pi equivalent exists.

3. **Custom Agent Definitions Already Working** (`registration.py`): JSON (`~/.opendev/agents.json`) and Markdown (`~/.opendev/agents/*.md`) with YAML frontmatter. Tools specified as list, `"*"`, or `{"exclude": [...]}`. Model override per agent. Skill file loading for system prompts. Validates our `.claude/agents/*.md` approach and adds the exclude pattern we should adopt.

4. **Schema-Level Subagent Isolation** (`agent.py:157`): `ToolSchemaBuilder(tool_registry, allowed_tools)` — subagents are the same `MainAgent` class but constructed with filtered tool allowlists. The LLM never sees tools it cannot use. This is **stronger than our prompt-based enforcement** (Rule 1: "Du schreibst niemals Code"). Implement as Pi extension that strips tools from the schema at `before_agent_start`.

5. **Docker Subagent Runtime** (`subagents/manager/docker.py`): Full container lifecycle — image pull, file copy in, task rewriting for Docker paths, execution, file copy out. Subagents run in isolated containers with workspace separation. More robust than tmux for untrusted code execution (DSGVO gov contracts).

6. **Dual Hook System** (10 shell + 2 plugin): Shell hooks follow Claude Code's protocol (JSON stdin, exit code 2 = block) but add `SubagentStart`/`SubagentStop`, `PreCompact`, and `SessionEnd` events that Claude Code lacks. In-process Python plugins (`~/.opendev/plugins/*.py`) fire ~100x faster. Both running simultaneously gives defense-in-depth.

7. **Priority-Ordered Prompt Composition** (`composition.py`): `PromptComposer` with sections at priority 10-95, conditional loading via callables, and cache boundary splitting (`cacheable=True/False`). Provider-conditional sections (different prompts for Anthropic vs OpenAI vs Fireworks). More granular than our CLAUDE.md monolith.

8. **ACE Playbook Memory** (`memory/`): Bullet-based knowledge with sections, delta updates, embedding-based retrieval, and feedback scoring (helpful/harmful/neutral counters). Cross-session persistence. More sophisticated than our current MEMORY.md approach, though simpler than CASS's 3-layer architecture.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **No multi-agent coordination** | Subagents are ephemeral — execute task, return result, die. No persistent agents, no agent-to-agent messaging, no shared task queues, no dependency graphs. Pi's ecosystem (pi-agent-teams, pi-messenger, pi-side-agents, pi-collaborating-agents) is orders of magnitude ahead here. Violates Master Blueprint §4 (multi-agent orchestration is core requirement). |
| **Python stack** | Our architecture is TypeScript/Node.js. OpenDev is 116K lines of Python. No SDK or embedding API. Cannot be composed into our orchestrator without subprocess spawning. Pi's `createAgentSession()` API is dramatically superior for embedding. |
| **5 days old** | Created 2026-03-04. 91 stars. No community. No production deployments. No backwards compatibility track record. Pi Agent (v0.56.1, 30 versions, 3.17M npm downloads via OpenClaw) is far more battle-tested. |
| **In-process subagents** | Subagents share Python process (or Docker — heavy). No middle ground like tmux. Our 2-5 agent scale needs process isolation without container overhead. Pi's tmux-based approach (pi-side-agents) hits the sweet spot. |
| **Plugin hooks too narrow** | Only `on_pre_tool_use` and `on_post_tool_use` for in-process plugins. No equivalent to Pi's `context` event (message rewriting before LLM), `before_agent_start` (dynamic prompt modification), or `session_before_compact` (state preservation). Pi has 25+ events vs. OpenDev's 12 (10 shell + 2 plugin). |
| **No `context` event equivalent** | The single most powerful extension primitive in the Pi ecosystem has no counterpart in OpenDev. Cannot rewrite messages before the LLM sees them. Cannot inject orchestration state. Cannot filter irrelevant history per-agent. |
| **Web UI overhead** | React + FastAPI + WebSocket is 20K+ lines. We don't need a Web UI — our orchestrator runs in terminal. This adds attack surface and maintenance burden without benefiting our workflow. |
| **Compaction thresholds differ from paper** | Paper claims 60/75/85/95/100%. Code implements 70/80/85/90/99%. Trust the code, not the paper. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** Extract compaction thresholds (70/80/85/90/99%) and adopt as reference for our context management strategy. Study the `ArtifactIndex` survival-across-compaction pattern. Implement escalating system reminders (gentle→strong→veto) in our event-driven patterns using `role:"user"` injection.

- **Phase 2 (Days 4-60):** Study the channel adapter framework architecture if marketing/lead-gen business lines need Telegram/WhatsApp agent access. The `InboundMessage`/`OutboundMessage` abstraction is clean enough to port to TypeScript.

- **Phase 3 (Days 60-90):** If migrating to Pi, build `schema-level-isolation.ts` extension using OpenDev's `allowed_tools` construction pattern — filter tools from schema entirely rather than prompt-level enforcement. Build `compaction-manager.ts` using OpenDev's 5-stage thresholds as reference.

- **Phase 4 (Days 90+):** Re-evaluate if OpenDev ships multi-agent coordination (roadmap mentions "Team Collaboration" and "Custom Agent Definitions" expansion). If the Rust rewrite mentioned in some contexts materializes, could become a legitimate Pi competitor. Monitor but don't depend.

---

## Comparison: OpenDev vs Pi Agent for Our Orchestration

| Dimension | OpenDev | Pi Agent | Winner for Us |
|-----------|---------|----------|---------------|
| Multi-agent coordination | Ephemeral subagents only | 4+ coordination extensions | **Pi** |
| Extension power | 12 hooks (10 shell + 2 plugin) | 25+ in-process events + `context` | **Pi** |
| Token efficiency | Large composed prompt | ~200 tokens (99.5% available) | **Pi** |
| Model support | 8 providers | 324+ models, 20+ providers | **Pi** |
| SDK/Embedding | None | `createAgentSession()` + RPC | **Pi** |
| Channel adapters | Built-in (Telegram, WhatsApp, Web) | None | **OpenDev** |
| Docker isolation | Built-in per-subagent | None (tmux via extensions) | **OpenDev** |
| Compaction | 5-stage with artifact survival | Provider-side | **OpenDev** |
| Memory | ACE Playbook (embeddings + feedback) | None native (CASS external) | **OpenDev** |
| Custom agents | JSON + Markdown definitions | YAML frontmatter extensions | **Tied** |
| Community | 91 stars, 0 contributors | 3.17M npm downloads, 50-80 extensions | **Pi** |
| Architecture docs | Best-in-class (arXiv paper) | Scattered across READMEs | **OpenDev** |

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Codebase size | 116,825 lines Python |
| Version | 0.1.7 |
| Age | 5 days (created 2026-03-04) |
| GitHub stars | 91 |
| Built-in subagents | 8 |
| Built-in tools | 25+ |
| Hook events (shell) | 10 |
| Plugin methods (in-process) | 2 |
| Blocking-capable hooks | 4 (UserPromptSubmit, PreToolUse, SubagentStart, plugin pre_tool) |
| Compaction stages | 5 (70/80/85/90/99%) |
| Model roles | 5 (Normal, Thinking, Critique, VLM, Compact) |
| Safety layers | 5 (independent) |
| Providers | 8 (Fireworks, Anthropic, OpenAI, Azure, Groq, Mistral, DeepInfra, OpenRouter) |
| Prompt sections | 16+ (priority 10-95) |
| Channel adapters | 2 skeletons (Telegram, WhatsApp) + CLI + TUI + Web |
| Fuzzy edit passes | 9 |
| Prune protected tokens | 40,000 |

---

## Key Takeaway

> **OpenDev is the best-documented open-source agent architecture and a genuinely capable batteries-included coding agent (116K LOC, 8 subagents, Docker runtime, channel adapters, ACE memory) — but it's solving a different problem than Pi: sophisticated single-agent-with-delegation vs. multi-agent orchestration. Steal its 5-stage compaction thresholds, schema-level isolation, and channel adapter patterns; don't adopt the platform.**
