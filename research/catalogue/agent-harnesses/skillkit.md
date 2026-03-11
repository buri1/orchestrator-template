# SkillKit

> **Supercharge AI coding agents with portable skills. Install, translate & share skills across Claude Code, Cursor, Codex, Copilot & 40 more.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [rohitg00/skillkit](https://github.com/rohitg00/skillkit) |
| GitHub Stars | 545 (as of 2026-03-08) |
| Publisher | Rohit Ghumare (solo — DevRel professional, GDE, CNCF Ambassador, Docker Captain; company: Motia) |
| License | Apache 2.0 |
| Tech Stack | TypeScript (monorepo via Turbo), Python client, Vitest, tsup |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves a real portability problem, but we're not multi-agent yet (all Claude Code). Becomes relevant at Phase 3 when we start testing Codex/Gemini CLI workers. The MCP server for runtime skill discovery is the most interesting piece for our stack today. |
| **Novelty** | 5/10 | We already catalogued the OpenSkills standard (7/10 relevance). SkillKit is the package manager around it. The auto-translate between 44 agent formats, the MCP server for runtime discovery, and memory compression are genuinely new patterns we haven't seen elsewhere. |
| **Actionable** | 4/10 | No immediate need to install — we run Claude Code exclusively. If we convert `.claude/commands/` to SKILL.md (per our OpenSkills analysis), SkillKit could then manage sync/translate. But today, `npx skillkit recommend` on our repo is the only quick win. |

---

## Overview

SkillKit is an open-source **package manager for AI agent skills** — the npm/pip equivalent for the OpenSkills ecosystem. Where the [Agent Skills (OpenSkills)](../agent-protocols/openskills.md) standard defines the SKILL.md format and directory conventions, SkillKit provides the CLI toolchain to install, translate, sync, generate, and share skills across 44 supported coding agents.

The core value proposition is **write-once, deploy-everywhere**: a single SKILL.md can be automatically translated into Cursor's `.mdc` format, Claude Code's XML-wrapped skills, Codex's markdown tables, Gemini CLI's JSON metadata, and 38 other agent-specific formats. The translation engine understands the quirks of each target (e.g., Cursor needs `globs` and `alwaysApply` fields; Claude Code gets `model`, `hooks`, `permissionMode`).

Beyond translation, SkillKit offers a marketplace of 15,000+ skills (including official collections from Anthropic, Vercel, Expo, Supabase, Stripe), AI-powered skill generation from natural language, memory compression for capturing agent learnings, an MCP server for runtime skill discovery, and a P2P mesh for multi-machine distribution. It's ambitious — arguably trying to be too many things — but the core install/translate/sync loop is solid.

---

## Technical Architecture

```
Monorepo Structure (Turbo):
├── apps/skillkit/          CLI entry point (cli.ts, index.ts)
├── packages/
│   ├── core/               skill-translator.ts, config.ts, types.ts, skills.ts
│   ├── agents/             44 agent adapters (factory pattern)
│   │   ├── claude-code.ts  XML format, hooks, permissionMode
│   │   ├── cursor.ts       MDC format, globs, alwaysApply
│   │   ├── codex.ts        Markdown table format
│   │   ├── gemini-cli.ts   JSON metadata format
│   │   ├── factory.ts      AgentAdapter interface + strategy pattern
│   │   └── ... (40 more)
│   ├── mcp/                MCP server (tools.ts, resources.ts)
│   ├── mcp-memory/         Memory MCP server
│   ├── memory/             Session compression + handoff
│   ├── mesh/               P2P multi-machine distribution
│   ├── messaging/          Inter-agent messaging
│   ├── api/                REST API server (port 3737)
│   ├── cli/                CLI helpers, TUI, badge
│   ├── extension/          Chrome extension (save pages as skills)
│   ├── resources/          Resource management
│   └── tui/                Terminal UI (solid-opentui)
├── clients/python/         Python SDK
├── registry/               Marketplace registry
├── schemas/                Validation schemas
└── skills/find-skills/     Skill discovery
```

**Core Data Model:**

```typescript
// CrossAgentSkill — canonical internal representation
{
  name, description, content,      // Markdown body
  frontmatter,                     // YAML metadata dict
  sourcePath, sourceAgent,         // Origin tracking
  version, author, tags,           // Optional metadata
  allowedTools, agentFields        // Agent-specific extensions
}

// SkillTranslationResult
{
  success, content, filename,
  targetDir, targetAgent,
  warnings[], incompatible[]       // Feature compatibility issues
}
```

**Translation Pipeline:**
1. `parseSkillToCanonical()` — reads SKILL.md, extracts YAML frontmatter + Markdown body into `CrossAgentSkill`
2. `translateSkillToAgent()` — applies agent-specific field mapping + format conversion
3. `generateSkillContent()` — rebuilds output in target format (XML/MDC/JSON/Markdown table)
4. `addAgentSpecificFields()` — injects agent-only fields (e.g., Claude's `hooks`, Cursor's `globs`)
5. `writeTranslatedSkill()` — persists with path traversal guards

**Agent Adapter Pattern:**
Each agent implements `AgentAdapter` interface via strategy pattern:
- `generateConfig()` — wraps skills in agent-native config
- `parseConfig()` — reads existing agent config to find installed skills
- `isDetected()` — checks for agent markers (e.g., `.cursor/`, `.claude/`)
- `getInvokeCommand()` — returns `skillkit read <name>` for runtime loading

**5 Recognized Formats:**

| Format | Agents | Structure |
|--------|--------|-----------|
| XML | Claude Code, OpenCode | `<skill>` tags with usage wrapper |
| MDC | Cursor, Trae, Windsurf | Markdown with Components frontmatter |
| markdown-table | Codex | Pipe-delimited skill reference table |
| json | Gemini CLI | Structured JSON metadata |
| markdown | GitHub Copilot, others | Standard headings + bash blocks |

---

## Publisher Background

**Rohit Ghumare** is a DevRel professional based in London, UK. He is a Google Developer Expert (GDE) for Google Cloud, CNCF Ambassador, Docker Captain, and AWS Community Builder. Previous roles at Solo.io, Cerbos, Oracle, and Reliance Jio. Currently at **Motia** (appears to be his current company). He has 1,671 GitHub followers and 255 public repositories.

This is primarily a **solo effort** — Rohit has 217 of the repository's contributions. The DevRel background explains the breadth of agent support (44 agents) and the marketplace/community focus. The risk is sustainability: a solo maintainer covering 44 agent formats will struggle to keep up with breaking changes. The CNCF/Docker/GDE credentials indicate someone who understands developer tooling ecosystems, but this is a side project, not a funded product.

---

## What's Valuable for Us

1. **Translation Engine Architecture (steal the pattern, not the code)**

   The `packages/agents/` directory with 44 agent adapters following the AgentAdapter strategy pattern is the most comprehensive mapping of agent-specific skill formats anywhere. If we ever need to target multiple agents from a single skill definition, this is the reference implementation. The 5-format taxonomy (XML/MDC/markdown-table/JSON/markdown) is a useful mental model.

2. **MCP Server for Runtime Skill Discovery**

   `packages/mcp/` exposes skills as MCP resources and tools. This means an agent can dynamically discover and load skills at runtime instead of having them statically configured. For our federated architecture, this could enable a "skill registry" MCP server that business-line agents query for domain-specific capabilities.

   ```json
   {
     "mcpServers": {
       "skillkit": { "command": "npx", "args": ["@skillkit/mcp"] }
     }
   }
   ```

3. **Memory Compression Pattern**

   `packages/memory/` and `packages/mcp-memory/` implement session compression and handoff — capturing what an agent learned during a session and making it available to subsequent sessions. This validates our pre-compact handoff hook approach (`orchestrator-handoff.sh`).

4. **Relationship to OpenSkills**

   We already catalogued [OpenSkills](../agent-protocols/openskills.md) at 7/10 relevance. SkillKit is the toolchain that makes OpenSkills practical. If we decide to convert our `.claude/commands/` to SKILL.md format (Phase 2-3 decision), SkillKit becomes the obvious tool to manage that migration: `skillkit init` to scaffold, `skillkit translate` to convert, `skillkit sync` to deploy.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **15,000+ marketplace** | We write domain-specific skills. Generic marketplace skills (React patterns, Supabase helpers) aren't useful for gov contract work with BSI/DSGVO requirements. |
| **P2P mesh networking** | Over-engineered for our setup. We use tmux + worktree isolation on a single machine. Multi-machine distribution adds coordination overhead we've explicitly chosen to avoid (Governing Principle #4). |
| **Chrome extension** | Browser-to-skill conversion is a nice DevRel demo but doesn't solve any problem we have. We already have `/ingest-article` and `/ingest-bookmarks`. |
| **AI skill generation** | We write skills manually with full context. LLM-generated skills from natural language descriptions would lack the precision our orchestrator commands require. |
| **Inter-agent messaging** | We already have established messaging patterns (tmux `send-keys`, Agent SDK `SendMessage`). Adding another messaging layer violates "build only what you've needed" (Principle #7). |
| **REST API server** | We don't need HTTP-based skill serving. MCP is the right protocol for our stack. |
| **44 agent adapters** | We use Claude Code exclusively. 43 of the 44 adapters are wasted weight. |

**Governing Principle Conflict:** The tool's breadth (44 agents, marketplace, mesh, messaging, Chrome extension, REST API, TUI) directly conflicts with Principle #7: "Build only what you have needed in the last 30 days." SkillKit tries to be everything to everyone. We need surgical, specific tools.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No action. We're Claude Code only and our `.claude/commands/` work fine.
- **Phase 2 (Days 4-60):** If we start evaluating alternative coding agents (Codex, Gemini CLI, OpenCode), run `npx skillkit recommend` on our project to see what it suggests. If we convert commands to SKILL.md format, use `skillkit translate` as the conversion engine.
- **Phase 3 (Days 60-90):** If federated business lines use different coding agents, SkillKit's MCP server becomes relevant as a shared skill discovery layer. Install as MCP server to give all agents access to shared organizational skills.
- **Phase 4 (Days 90+):** If we productize our orchestration patterns, SkillKit's marketplace infrastructure could be the distribution channel. Publishing our L-Thread skills as a skill catalogue would be the play.

---

## Key Takeaway

> **SkillKit is the npm for AI agent skills — the package manager built on the OpenSkills/SKILL.md standard we've already catalogued. It's over-engineered for our current single-agent setup, but the translation engine architecture (44 agent adapters, 5 format families) and the MCP skill discovery server are patterns worth bookmarking for Phase 3 when we go multi-agent.**
