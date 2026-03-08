# Roo Code

> **Your AI-powered dev team, right in your editor — a Cline fork with custom modes (Code, Architect, Ask, Debug), multi-agent workflows, MCP server support, and enterprise features (SOC 2, Roo Cloud).**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code) |
| GitHub Stars | 22,600+ (as of 2026-03-08) |
| Publisher | Roo Code Inc. (startup — Danny Leffel CEO, 9 employees, San Rafael CA) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (98.7%), pnpm monorepo, VS Code Extension API, Changesets (versioning) |
| Maturity | 🟢 Production (50K+ installs, $5-6.4M raised, SOC 2 compliance) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | The Custom Modes system (Code, Architect, Ask, Debug + user-defined) directly maps to our context separation principle — different modes with different system prompts and tool access. More relevant than Cline because of this multi-persona design. Still IDE-centric though. |
| **Novelty** | 5/10 | Custom Modes are a known concept (our orchestrator already uses personas via `.claude/agents/`), but Roo Code's implementation as switchable modes within a single agent instance is a cleaner UX pattern. The "whole dev team" framing is marketing, but the mode-switching mechanics are well-executed. |
| **Actionable** | 4/10 | The Custom Modes pattern is directly applicable to how we design agent personas. Can study their mode-switching implementation for improving our `.claude/agents/` system. But the tool itself can't integrate into our pipeline (VS Code dependency). |

---

## Overview

Roo Code is the most successful fork of Cline, created to "move faster" on features the Cline maintainers weren't prioritizing: custom modes, multi-agent workflows, enterprise compliance, and broader model support. Led by Danny Leffel (CEO) with a small team of 9, Roo Code has grown to 22.6K GitHub stars and 50K+ installs, carving out a reputation as the more reliable agent for large, multi-file changes.

The defining feature is Custom Modes — five built-in operational personas (Code, Architect, Ask, Debug, and user-defined custom modes) that change the agent's system prompt, available tools, and behavior. This is effectively context separation applied at the agent level: an Architect mode doesn't have access to code editing tools, a Debug mode gets enhanced terminal and log access, and custom modes can be tailored to specific team workflows. This is more sophisticated than Cline's single-mode approach.

Roo Code added SOC 2 compliance, Roo Cloud (team management), and invested in reliability for complex multi-file operations where other agents (including Cline) reportedly break down. The project uses pnpm monorepo structure with Changesets for versioning and maintains the same multi-model support as Cline (OpenRouter, Anthropic, OpenAI, Gemini, AWS Bedrock, Azure, local models).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│              VS Code Extension Host                   │
│  ┌────────────────────────────────────────────────┐  │
│  │         Mode Router                             │  │
│  │  Code │ Architect │ Ask │ Debug │ Custom        │  │
│  │  (each mode has own system prompt + tool ACL)   │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Agent Core (TypeScript)                 │  │
│  │  Task planning │ Tool selection │ File diffing  │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Tool Layer                              │  │
│  │  File ops │ Terminal │ Browser │ MCP servers    │  │
│  │  (tool availability varies by mode)             │  │
│  ├────────────────────────────────────────────────┤  │
│  │         LLM Provider Layer                      │  │
│  │  OpenRouter │ Anthropic │ OpenAI │ Gemini │    │  │
│  │  AWS Bedrock │ Azure │ Local models             │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Webview UI (React)                      │  │
│  │  Chat │ Mode switching │ Slash commands         │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │         Roo Cloud (Enterprise)                  │  │
│  │  Team management │ Centralized billing │ SOC 2  │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

**Key Components:**

- **Custom Modes System:** Each mode defines: (1) system prompt/persona, (2) tool access list (which tools are available), (3) behavior guidelines. Users can create unlimited custom modes for specialized workflows (e.g., "Security Auditor" mode with only read + search tools, "Migration Agent" mode with file write + terminal).
- **Mode-Specific Tool ACLs:** Unlike Cline's flat tool access, Roo Code's modes can restrict which tools an agent can use. Architect mode might have read + search but no write. This is context separation enforced at the tool level.
- **Slash Commands:** Skill-based commands for common workflows, similar to our `.claude/commands/` pattern.
- **MCP Server Integration:** Same MCP support as Cline, but with mode-aware tool registration.
- **Monorepo Structure:** `packages/` directory with multiple workspace packages, `webview-ui/` separation, pnpm + Changesets. Clean TypeScript architecture.

---

## Publisher Background

Danny Leffel (CEO) leads a 9-person team in San Rafael, CA. Roo Code started as "Roo Cline" — a community fork that diverged when the upstream Cline project wasn't moving fast enough on custom modes and enterprise features. Raised $5-6.4M (reports vary). Small team but high velocity — the fork strategy allowed them to ship features without upstream coordination overhead.

**Risk profile:** Moderate — small team (9 people) and modest funding ($5-6.4M) create bus-factor concerns. The Apache license and TypeScript codebase mean the community can sustain the project if the company struggles, but compared to Cline's $32M and 35+ team, Roo Code is more resource-constrained. SOC 2 compliance signals enterprise seriousness.

---

## What's Valuable for Us

1. **Custom Modes as Context Separation:** Roo Code's mode system is the closest open-source implementation to our agent persona pattern (`.claude/agents/`). Each mode has its own system prompt and tool ACL — this is our context separation principle (business context never enters coding agents) enforced architecturally. Study their mode definitions in the codebase for ideas.

2. **Mode-Specific Tool ACLs:** The ability to restrict which tools an agent can access based on its current role is directly applicable to our worker agents. An architect-worker shouldn't have `Edit` access; a coding-worker shouldn't have business context tools. This pattern is worth adopting.

3. **Fork Strategy Validation:** Roo Code proves that forking an open-source agent and adding orchestration-relevant features (modes, enterprise compliance) is a viable strategy. If we ever need to customize an agent runtime beyond what upstream supports, this is the playbook.

4. **Reliability on Multi-File Changes:** Reports consistently cite Roo Code as more reliable than Cline on large, multi-file operations. If we need a VS Code-based agent for specific tasks, Roo Code is the stronger choice.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **VS Code dependency** | Same fundamental limitation as Cline. Our orchestrator is terminal-first (Claude Code + tmux). Cannot embed Roo Code into our pipeline without running VS Code. |
| **Small team risk** | 9 employees and $5-6.4M funding vs. Cline's 35+ and $32M. Long-term sustainability is less certain. |
| **No CLI mode** | Unlike Cline (which has a CLI preview), Roo Code is exclusively a VS Code extension. No path to terminal-first usage. |
| **Roo Cloud lock-in** | Enterprise features (team management, billing) are proprietary cloud services, not self-hostable. For our gov work (DSGVO), this could be a blocker. |
| **Redundant with our persona system** | We already implement context separation via `.claude/agents/` and system prompts in Claude Code. Roo Code's modes are a nicer UX for the same concept, but we don't need a new tool to achieve it. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** Study Roo Code's Custom Modes implementation as a reference for improving our `.claude/agents/` persona system. Specifically: how they define tool ACLs per mode and how mode-switching works mid-conversation.
- **Phase 3 (Days 60-90):** If we need IDE-based agents for frontend work, Roo Code is preferable to Cline for multi-file reliability and custom modes. Evaluate for specific visual development workflows.
- **Phase 4 (Days 90+):** Monitor if Roo Code adds a CLI or server mode. If they do, the Custom Modes system combined with terminal access could make it a viable worker agent runtime.

---

## Key Takeaway

> **Roo Code's Custom Modes system is the best open-source implementation of context separation at the agent level — directly study their mode-specific tool ACLs for our persona system — but the VS Code dependency and small team make it a reference implementation to learn from, not a tool to adopt into our terminal-first pipeline.**
