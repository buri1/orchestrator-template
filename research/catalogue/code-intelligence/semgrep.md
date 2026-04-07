# Semgrep

> **Lightweight static analysis for many languages. Find bug variants with patterns that look like source code.**

| Field | Value |
|-------|-------|
| Category | 🧬 Code Intelligence |
| Repository | [github.com/semgrep/semgrep](https://github.com/semgrep/semgrep) |
| GitHub Stars | 14,363 (as of 2026-03-08) |
| Publisher | Semgrep, Inc. (startup — formerly r2c / Return to Corporation) |
| License | LGPL-2.1 (core engine); MIT (MCP server) |
| Tech Stack | OCaml (core engine), Python (CLI + MCP server), 5,000+ rule registry |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Agent-generated code needs deterministic security scanning — Semgrep's MCP server integrates directly with Claude Code for real-time SAST on every generated line. Maps directly to our 70/30 split (SAST = deterministic layer). Milan Williams' talk specifically validated this as a quality gate for agent workflows. |
| **Novelty** | 6/10 | SAST is well-established. The novel piece is the MCP server — making deterministic security scanning available as a tool that any LLM agent can invoke natively, turning SAST from a CI-only gate into an inline development companion. |
| **Actionable** | 9/10 | Install today: `uvx semgrep-mcp` or add to `.claude/settings.json`. Zero-config scanning with 5,000+ rules. Free for local use. Can wire into hooks for automatic scanning of all agent-generated code before commit. |

---

## Overview

Semgrep is a fast, deterministic static analysis tool that understands code semantically across 30+ languages. Unlike regex-based linters, Semgrep parses code into ASTs and matches patterns that look like source code itself — making rules readable and writable by developers, not just security specialists. The engine is written in OCaml for speed and correctness, with a Python CLI for usability.

The platform has evolved into a full application security suite: **Semgrep Code** (SAST — finds vulnerabilities and bug patterns), **Semgrep Supply Chain** (SCA — identifies exploitable dependencies with reachability analysis, claiming 98% false positive reduction), and **Semgrep Secrets** (detects hardcoded credentials via semantic + entropy analysis). Over 5,000 community and pro rules cover OWASP Top 10, language-specific anti-patterns, and framework-specific vulnerabilities.

The critical development for our use case is the **Semgrep MCP server** ([github.com/semgrep/mcp](https://github.com/semgrep/mcp), 638 stars). This MCP server exposes Semgrep's scanning capabilities as tools that any MCP-compatible agent can invoke: `security_check` for quick vulnerability scans, `semgrep_scan` for configurable scans, `semgrep_scan_with_custom_rule` for bespoke rules, and `get_abstract_syntax_tree` for code understanding. The MCP server has been merged into the main `semgrep` binary as of late 2025, making it a first-class feature rather than a separate project. It supports stdio, SSE, and streamable HTTP transports, plus a hosted endpoint at `mcp.semgrep.ai`.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Agent / IDE Workflow                     │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │ Claude Code  │  │   Cursor    │  │  Windsurf / VS   │  │
│  │ (MCP client) │  │ (MCP client)│  │  Code (MCP)      │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘  │
│         └────────────┬───┘                   │            │
│                      ▼                       │            │
│           ┌──────────────────┐               │            │
│           │  Semgrep MCP     │◄──────────────┘            │
│           │  Server          │                            │
│           │  (stdio/SSE/HTTP)│                            │
│           └────────┬─────────┘                            │
│                    │                                      │
│      ┌─────────────┼──────────────────┐                   │
│      ▼             ▼                  ▼                   │
│ ┌──────────┐ ┌───────────────┐ ┌──────────────┐          │
│ │ security │ │ semgrep_scan  │ │ get_abstract  │          │
│ │ _check   │ │ (configurable │ │ _syntax_tree  │          │
│ │ (quick)  │ │  + custom     │ │ (AST output)  │          │
│ │          │ │  rules)       │ │               │          │
│ └──────────┘ └───────────────┘ └──────────────┘          │
│                    │                                      │
│                    ▼                                      │
│           ┌──────────────────┐                            │
│           │  Semgrep Engine  │                            │
│           │  (OCaml core)    │                            │
│           │  5,000+ rules    │                            │
│           │  30+ languages   │                            │
│           └──────────────────┘                            │
└──────────────────────────────────────────────────────────┘
```

**MCP Server tools:**
- `security_check` — Quick scan of code for security vulnerabilities (most common use)
- `semgrep_scan` — Scan with configurable rule config string
- `semgrep_scan_with_custom_rule` — Scan using a custom Semgrep YAML rule
- `get_abstract_syntax_tree` — Output the AST of code (useful for code understanding tasks)
- `semgrep_findings` — Fetch findings from Semgrep cloud platform (requires token)
- `supported_languages` — List supported languages
- `semgrep_rule_schema` — Fetch latest rule JSON schema

**MCP Prompts:**
- `write_custom_semgrep_rule` — Guided prompt for writing Semgrep rules

**MCP Resources:**
- `semgrep://rule/schema` — Rule YAML specification
- `semgrep://rule/{rule_id}/yaml` — Fetch specific rule from registry

**Installation for Claude Code:**
```json
// .claude/settings.json
{
  "mcpServers": {
    "semgrep": {
      "command": "uvx",
      "args": ["semgrep-mcp"]
    }
  }
}
```

---

## Publisher Background

Semgrep, Inc. (formerly **r2c** / Return to Corporation) was founded by **Isaac Evans**, **Drew Dennison**, and **Luke O'Malley**. The company is based in San Francisco. The core OCaml engine was inspired by Facebook's pfff and coccinelle tools.

**Funding**: Semgrep has raised significant venture capital, with investors including Redpoint Ventures, Felicis Ventures, and Lightspeed. The company serves 45+ enterprise customers including Lyft, Dropbox, Figma, Slack, GitLab, and HashiCorp.

**Community**: The `semgrep/semgrep` repo has 14.3K stars, 878 forks, and has been actively developed since December 2019. The MCP server repo (`semgrep/mcp`) gained 638 stars in under a year before being merged into the main binary — indicating strong interest in the agent security scanning use case. The community Slack has 4.5K+ members.

**Credibility**: Very high. Semgrep is the most widely adopted open-source SAST tool in the startup/scale-up ecosystem. The MCP server demonstrates Semgrep's awareness that agent-generated code is the next frontier for security scanning — Milan Williams' conference talk explicitly framed this as their strategic direction.

---

## What's Valuable for Us

1. **Deterministic security gate for agent-generated code**: This maps perfectly to our 70/30 split. SAST scanning is deterministic (the 70% side) — it runs the same rules every time, produces deterministic results, and requires zero LLM tokens. Every line of code an agent writes gets scanned for OWASP vulnerabilities, hardcoded secrets, and language-specific anti-patterns before it can ship.

2. **MCP server enables inline scanning during development**: Instead of catching vulnerabilities only in CI (after the agent has moved on), the MCP server lets Claude Code scan code *while writing it*. The agent can invoke `security_check` after generating a function and fix issues immediately — shifting security left into the generation loop itself.

3. **Hook-based integration for automatic scanning**: Milan Williams specifically recommended wiring SAST into hooks. We can create a Claude Code hook that runs `semgrep scan` on every file write, logging results to our audit trail. This creates the deterministic security layer Williams described in his talk.

4. **Custom rules for our specific patterns**: `semgrep_scan_with_custom_rule` lets us write rules targeting our own anti-patterns — e.g., "agent must not write to files outside worktree", "no hardcoded API tokens in orchestrator state files", "no direct database access from agent code". Rules look like source code, so they're easy to write and maintain.

5. **Gov client compliance artifacts**: For DSGVO/BSI compliance, having deterministic SAST scans with logged results provides auditable evidence that all code (human or agent-generated) passes security checks. Semgrep runs locally — no code leaves the machine.

6. **Free for local use**: The core engine and MCP server are free. The paid platform (cloud findings, team dashboards) is optional. For our orchestrator's quality gate use case, local scanning is sufficient.

---

## What's NOT Relevant

- **Semgrep Cloud Platform / AppSec Dashboard**: We don't need the SaaS dashboard for team-level findings management. Our orchestrator is terminal-first, and we track quality gates in state files, not web UIs.
- **Semgrep Supply Chain (SCA)**: Dependency scanning is useful but secondary — our primary concern is the code agents *write*, not the dependencies they import. SCA becomes relevant at scale but isn't the immediate win.
- **Semgrep Assistant (AI triage)**: An AI layer on top of the SAST results. We already have Claude for interpretation — we want the raw deterministic findings, not another LLM in the loop.
- **LGPL-2.1 license on core**: The LGPL license means we can't embed the engine in proprietary software without open-sourcing our modifications. Not a concern since we use it as a standalone tool, but worth noting if we ever consider deep integration.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Install Semgrep MCP server (`uvx semgrep-mcp`). Add to Claude Code MCP config. Add a rule to CLAUDE.md: "Always run security_check on generated code before committing." Test on the orchestrator codebase.
- **Phase 2 (Days 4-60)**: Wire Semgrep into Claude Code hooks — automatic scan on every file write by spawned agents. Log all findings to `_bmad/security-scan-results.jsonl`. Create custom rules for our orchestrator-specific anti-patterns (e.g., no secrets in state files, no writes outside worktree).
- **Phase 3 (Days 60-90)**: Integrate into the merge queue quality gate alongside E2E tests and AI code review (Graphite Diamond). The gate becomes: Semgrep SAST pass + E2E tests pass + AI review pass = merge allowed.
- **Phase 4 (Days 90+)**: Write custom Semgrep rules per business line (gov contracts get stricter DSGVO-specific rules, SaaS factory gets performance anti-pattern rules). Share rule sets across the federated architecture via the registry.

---

## Key Takeaway

> **Semgrep's MCP server turns deterministic security scanning into a native tool for coding agents — install it today as a zero-cost, zero-config quality gate that scans every line of agent-generated code for vulnerabilities before it ships, mapping perfectly to the deterministic (70%) side of our architecture.**
