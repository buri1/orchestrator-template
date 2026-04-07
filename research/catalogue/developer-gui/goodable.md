# Goodable

> **Local-first Desktop AI Workspace (Desktop Agent Runtime) powered by Claude Agent SDK, combining OS/file control, browser automation, and coding into composable Skills.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [github.com/ImGoodBai/goodable](https://github.com/ImGoodBai/goodable) |
| GitHub Stars | 158 (as of 2026-03-08) |
| Publisher | ImGoodBai / goodbai (solo dev, China-based) |
| License | MIT |
| Tech Stack | TypeScript, Next.js 15, Electron 39, Claude Agent SDK, SQLite (better-sqlite3 + Drizzle ORM), Python FastAPI (sub-apps), WebSocket |
| Maturity | 🟡 Early (v0.8.0) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *OSS Claude Cowork clone from @aratahikaru0's collection post. Chinese solo dev ("goodbai") who's clearly been grinding on this since Jan 2026. The "Digital Employee" metaphor is interesting — pre-baked role prompts with system prompts for planning vs execution phases. The dual-mode Skills system (CLI tool + standalone GUI app sharing data) is a genuinely novel pattern. However, this is fundamentally a desktop app builder / personal automation tool, not a multi-agent orchestrator. Different problem domain than ours. The Chinese market focus (WeChat publishing, Feishu/Coze converters, Alibaba Cloud deploy) makes it less directly useful. Worth watching for the Skills architecture pattern.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Desktop app builder for individual users; our system is multi-business agent orchestration. Different problem entirely. |
| **Novelty** | 5/10 | Dual-mode Skills (tool + app) is a genuinely interesting pattern. "Digital Employee" role templates with planning/execution phase prompts are creative. Rest is standard Electron + Next.js wrapping. |
| **Actionable** | 3/10 | The Skills plugin architecture (SKILL.md + template.json, builtin vs user-skills separation) could inform our command/agent template system, but requires significant rethinking to adapt. |

---

## Overview

Goodable is a desktop AI workspace that wraps Claude Agent SDK (and optionally Cursor, Qwen, GLM) into an Electron shell, providing a GUI for non-technical users to interact with AI agents for three categories of tasks: (1) local desktop/file automation, (2) browser automation and social media workflows, and (3) AI-powered app generation with one-click cloud deployment. It positions itself as a "Claude Cowork" alternative — open-source, local-first, with a Chinese-market focus.

The core design insight is the **dual-mode Skills system**: each skill can operate simultaneously as an AI-callable tool in chat (like an MCP tool) AND as a standalone graphical application with its own UI. Both modes share the same data environment, and single-instance locking ensures consistency. This means a user can ask the AI to "process this Excel file" (tool mode) or open the Excel processor directly as an app (GUI mode) — same skill, two interfaces.

The project also introduces "Digital Employees" — pre-configured role templates with elaborate system prompts split into planning and execution phases. Examples include a Python full-stack engineer, a file organizer, a PPT maker, and document/spreadsheet processors. Each employee has a `mode` (code vs work), a `first_prompt` to get started, and separate `system_prompt_plan` and `system_prompt_execution` prompts for the two-phase workflow.

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│              Electron Shell (v39)              │
│  ┌────────────────────────────────────────┐   │
│  │          Next.js 15 Frontend           │   │
│  │  ┌──────────┐ ┌───────────┐ ┌───────┐ │   │
│  │  │ Chat UI  │ │ Preview   │ │ Skill │ │   │
│  │  │          │ │ (iframe)  │ │ Mgmt  │ │   │
│  │  └────┬─────┘ └─────┬─────┘ └───┬───┘ │   │
│  └───────┼──────────────┼───────────┼─────┘   │
│          │              │           │          │
│  ┌───────▼──────────────▼───────────▼─────┐   │
│  │           API Routes (Next.js)          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ CLI      │ │ Project  │ │ Skill  │  │   │
│  │  │ Services │ │ Services │ │ Service│  │   │
│  │  │ (claude, │ │          │ │        │  │   │
│  │  │ cursor,  │ │          │ │        │  │   │
│  │  │ qwen,glm)│ │          │ │        │  │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬───┘  │   │
│  └───────┼────────────┼────────────┼──────┘   │
│          │            │            │           │
│  ┌───────▼────────────▼────────────▼──────┐   │
│  │         SQLite (better-sqlite3)         │   │
│  │  projects | messages | sessions |       │   │
│  │  env_vars | tool_usages | commits |     │   │
│  │  user_requests | service_tokens         │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │          Skills Runtime                 │   │
│  │  builtin-skills/ → user-skills/        │   │
│  │  SKILL.md + template.json              │   │
│  │  Python FastAPI | Next.js sub-apps     │   │
│  │  Process isolation per skill           │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Data Model (Drizzle ORM + SQLite):**
- `projects` — Core entity with mode (code/work), employee_id, project_type (nextjs/python), permission_mode, plan confirmation state
- `messages` — Chat history with token counts, cost tracking (costUsd), CLI source tracking, session/conversation IDs
- `sessions` — CLI session tracking per project (claude/cursor/qwen/glm)
- `env_vars` — Encrypted environment variables with scope and type, per-project isolation
- `tool_usages` — Full tool call audit trail (input, output, error, duration)
- `user_requests` — Request queue with cancel support
- `service_tokens` — Provider authentication storage

**CLI Integrations:** `lib/services/cli/` contains adapters for claude.ts, cursor.ts, qwen.ts, glm.ts, codex.ts — multi-CLI support with fallback capability.

**Skills Plugin System:**
- Detection: `SKILL.md` = AI-callable skill, `template.json` with `projectType` = runnable app, both = hybrid
- Lifecycle: builtin skills auto-copied to writable `user-skills/` on startup; version tracking for upgrades
- Configuration: `plugin.json` (SDK-compliant) + `plugin-ex.json` (extended: disabled list, versions)
- Built-in skills include: WeChat publisher, video-to-text, Coze/Feishu converters, PPT maker, doc/xlsx processors, meeting insights analyzer

---

## Publisher Background

**ImGoodBai** (GitHub handle) / "goodbai" — solo Chinese developer, GitHub account since 2010 (16 years). Bio: "玩遍大模型" ("Play with all large models"). 73 followers, 20 public repos. Single contributor on Goodable. No notable prior open-source projects visible. The project started January 2026 and has reached v0.8.0 by March 2026 — fast iteration for a solo dev. The Chinese-market focus (WeChat, Feishu, Alibaba Cloud, Coze integration) suggests a domestic audience. 158 stars and 34 forks indicate moderate traction. The CLAUDE.md file is entirely in Chinese with opinionated development practices (voice input awareness, no-code-in-replies policy), suggesting an experienced developer with strong workflow preferences.

---

## What's Valuable for Us

1. **Dual-Mode Skills Architecture**: The concept of a single skill manifesting as both an AI-callable tool AND a standalone GUI app sharing data is genuinely creative. Our commands/agents could potentially benefit from this pattern — imagine an orchestrator command that can also be a standalone dashboard.

2. **Planning/Execution Phase Prompts**: The Digital Employee system splits system prompts into `system_prompt_plan` (requirement gathering, no code execution) and `system_prompt_execution` (actual implementation). This maps conceptually to our Phase separation but implemented at the prompt level per agent role.

3. **Tool Usage Audit Trail**: The `tool_usages` table with full input/output/error/duration tracking is a clean implementation of tool observability that aligns with our Langfuse integration goals.

4. **Environment Variable Injection**: Centralized env var management with encryption (`value_encrypted`) distributed to sub-applications is a clean pattern for our federated system where each business line needs different API keys.

5. **Multi-CLI Abstraction**: The `lib/services/cli/` directory with separate adapters for Claude, Cursor, Qwen, GLM, and Codex shows how to abstract over multiple AI backends — relevant if we ever need model routing beyond Claude.

---

## What's NOT Relevant

1. **Desktop App Builder Focus**: Goodable is fundamentally about helping individual users build and deploy apps via AI conversation. Our system is multi-business orchestration with deterministic routing (Master Blueprint Principle 2). Different problem domain entirely.

2. **Electron Desktop Shell**: We operate in terminal/tmux (Master Blueprint Layer 3). Wrapping everything in Electron adds complexity without benefit for our headless orchestration pattern.

3. **Chinese Market Integrations**: WeChat, Feishu, Coze, Alibaba Cloud deployment — none of these are relevant to our European/US market focus with DSGVO compliance requirements.

4. **Single-User Design**: Goodable is designed for one person using one desktop. Our architecture is federated multi-business with isolation boundaries (Principle 6). No multi-tenancy, no business-line separation.

5. **GUI-First Approach**: Conflicts with our "human review is the binding constraint" principle (Principle 5). Adding a desktop GUI increases what the human interacts with rather than reducing it.

---

## Future Use Cases

- **Phase 4 (Days 90+)**: If we ever build a client-facing dashboard for non-technical stakeholders to interact with agents, the dual-mode Skills pattern (tool + app) could inform the UX architecture. Low priority — our Notion meta-layer serves this role for now.

---

## Key Takeaway

> **Goodable is a well-executed Chinese-market Claude Cowork clone with an interesting dual-mode Skills architecture (AI tool + standalone GUI sharing data), but it solves a fundamentally different problem (desktop app building for individuals) than our multi-business agent orchestration system.**
