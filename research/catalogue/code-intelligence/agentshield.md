# AgentShield

> **Security auditor for AI agent configurations — scans Claude Code setups for hardcoded secrets, permission misconfigurations, hook injection, MCP server risks, and agent prompt injection vectors.**

| Field | Value |
|-------|-------|
| Category | 🧬 Code Intelligence |
| Repository | [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield) |
| GitHub Stars | 183 (as of 2026-03-22) |
| Publisher | @affaanmustafa (solo — Everything Claude Code ecosystem) |
| License | MIT |
| Tech Stack | TypeScript, Node.js 18+, Vitest (912 tests), Commander (CLI), React 18+ (optional dashboard) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *Directly addresses the `--dangerously-skip-permissions` security gap in our orchestrator. 102 rules we can run against our configs today. The Opus adversarial audit mode (Red Team / Blue Team / Auditor) is the most interesting part — it simulates attack chains against our agent configs, not just pattern matching. MiniClaw sandbox is overkill for us but validates the sandboxed-runtime idea.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Our orchestrator runs `--dangerously-skip-permissions` on every worker. AgentShield's 102 rules scan exactly the configs we produce: `.claude/settings.json`, hooks, MCP servers, agent prompts. The Permission Audit and Hook Analysis categories map 1:1 to our attack surface. |
| **Novelty** | 8/10 | First purpose-built security scanner for AI agent configurations. The three-agent Opus adversarial pipeline (Red Team attacker, Blue Team defender, Auditor synthesizer) goes beyond static SAST into LLM-powered security reasoning. Nothing else in the catalogue does this. |
| **Actionable** | 9/10 | `npx ecc-agentshield scan` works today against our repo. GitHub Action for CI. Auto-fix mode can remediate secrets and wildcard permissions. Can wire into our orchestrator as a pre-spawn quality gate. |

---

## Overview

AgentShield is a security scanner purpose-built for AI agent configurations. Where Semgrep scans application source code, AgentShield scans the configuration layer that governs agent behavior: `CLAUDE.md` files, `.claude/settings.json`, hook scripts, MCP server definitions, and agent prompt files. It ships 102 rules across five categories and produces a 0-100 security score with letter grades (A-F).

The tool operates in two modes. **Static analysis** runs 102 deterministic pattern-matching rules across five categories: Secrets Detection (10 rules, 14 patterns), Permission Audit (10 rules), Hook Analysis (34 rules), MCP Server Security (23 rules), and Agent Config Review (25 rules). This catches hardcoded API keys, wildcard permissions, command injection in hooks, dangerous MCP transports, prompt injection payloads in CLAUDE.md, and auto-run instructions.

**Opus adversarial audit** (`--opus` flag) is the differentiator. It runs a three-agent pipeline: a Red Team agent that generates attack chains against the scanned config, a Blue Team agent that evaluates defenses and proposes mitigations, and an Auditor agent that synthesizes findings into a prioritized report. This catches semantic vulnerabilities that static patterns miss — e.g., a hook that looks safe individually but enables privilege escalation when combined with a permissive MCP server.

---

## Technical Architecture

```
src/
├── index.ts              CLI entry (Commander)
├── action.ts             GitHub Actions interface
├── scanner/
│   └── discovery.ts      Auto-discovers ~/.claude, config.json, hooks
├── rules/                102 rules across 5 categories
│   ├── secrets.ts        10 rules, 14 patterns (API keys, tokens, env leaks)
│   ├── permissions.ts    10 rules (wildcards, deny lists, dangerous flags)
│   ├── hooks.ts          34 rules (injection, exfiltration, reverse shells)
│   ├── mcp.ts            23 rules (supply chain, transport, shell metachar)
│   └── agents.ts         25 rules (prompt injection, jailbreak, time bombs)
├── reporter/
│   ├── score.ts          0-100 grade calculation
│   ├── terminal.ts       Colored output with progress bars
│   ├── html.ts           Self-contained dark-theme report
│   └── json.ts / md.ts   CI-friendly and PR-friendly formats
├── fixer/
│   └── transforms.ts     Auto-remediation (secrets→env, wildcards→scoped)
├── init/                 Secure baseline config generator
├── opus/
│   ├── pipeline.ts       Three-agent adversarial orchestration
│   └── prompts.ts        Red/Blue/Auditor system instructions
└── miniclaw/
    ├── server.ts         HTTP runtime (localhost, rate-limited)
    ├── router.ts         Prompt sanitization (12+ injection patterns)
    └── sandbox.ts        Per-session isolated filesystem
```

**MiniClaw Sandbox Runtime** — A four-layer sandboxed HTTP runtime for agent execution:
1. **Server layer**: Rate limiting (10 req/min/IP), CORS, 10KB request cap, localhost binding
2. **Prompt Router**: Strips 12+ injection patterns (system override, identity reassignment, zero-width Unicode, base64 payloads)
3. **Tool Whitelist**: Three tiers — Safe (read/search/list), Guarded (write/edit), Restricted (bash/network)
4. **Sandbox**: Per-session isolated filesystem, path traversal blocking, symlink escape detection, 10MB file cap, 5-min timeout, no network by default

---

## Publisher Background

Built by @affaanmustafa as part of the Everything Claude Code (ECC) ecosystem, which has grown to 68.8K+ stars. AgentShield originated at the Claude Code Hackathon (Cerebral Valley x Anthropic, Feb 2026). It is published as `ecc-agentshield` on npm. The ECC ecosystem is the largest community-driven Claude Code project, shipping 16 agents, 65 skills, and 40 commands — AgentShield is its security pillar.

---

## What's Valuable for Us

1. **Immediate config audit** — `npx ecc-agentshield scan --path .` against our orchestrator repo catches: hardcoded paths in hooks, `--dangerously-skip-permissions` usage without compensating controls, MCP server configs in `.claude/settings.json`, and any secrets that slipped into committed files.

2. **Permission Audit rules** — The 10 permission rules specifically target wildcard tool permissions, missing deny lists, and destructive operation exposure. Our orchestrator grants full permissions to workers — these rules quantify the exact gap.

3. **Hook Analysis rules** — 34 rules covering command injection, data exfiltration, silent errors, network exposure, container escape, and reverse shells in hook scripts. Our `orchestrator-session-start.sh` and `orchestrator-handoff.sh` should pass these.

4. **GitHub Action for CI** — Add `affaan-m/agentshield@v1` to our CI pipeline. Outputs: score (0-100), grade (A-F), total-findings, critical-count. Set `fail-on-findings: true` with `min-severity: medium`.

5. **Opus adversarial audit for pre-deployment** — Run `agentshield scan --opus` before deploying orchestrator changes to catch semantic vulnerabilities that static rules miss.

6. **Auto-fix mode** — `agentshield scan --fix` automatically remediates secrets (replace with env vars) and permissions (narrow wildcards to scoped). Safe to run and review the diff.

7. **Agent Config Review rules** — 25 rules scanning for prompt injection payloads, hidden directives, auto-run instructions, URL execution, time bombs, and jailbreak patterns in CLAUDE.md and agent files. Critical for validating worker agent prompts.

---

## What's NOT Relevant

- **MiniClaw sandbox runtime** — We use tmux + `--dangerously-skip-permissions` for workers, not an HTTP sandbox runtime. MiniClaw's per-session isolation model is interesting conceptually but we don't need another runtime layer.

- **React dashboard** — We have our own `dashboard.mjs` for tmux monitoring. The optional React dashboard component is not needed.

- **ECC plugin ecosystem integration** — We don't use the ECC skill/agent framework. We use AgentShield standalone.

- **`agentshield init`** — Generates an ECC-flavored secure baseline. Our configs are already established; we need scanning, not bootstrapping.

---

## Future Use Cases

- **Phase 1 (Now)**: Run `npx ecc-agentshield scan` against the orchestrator repo. Triage findings. Add GitHub Action to CI with `min-severity: medium`.
- **Phase 2 (Days 4-60)**: Wire AgentShield scan as a pre-spawn gate in the orchestrator loop — scan each worker's agent prompt before spawning. Run Opus adversarial audit on new agent definitions.
- **Phase 3 (Days 60-90)**: Integrate with Semgrep MCP for layered scanning — Semgrep for application code, AgentShield for agent configs. Produce a unified security posture score.
- **Phase 4 (Days 90+)**: For client deployments, run AgentShield as part of the delivery checklist. The HTML report becomes a trust artifact alongside Langfuse traces.

---

## Key Takeaway

> **AgentShield is the only purpose-built security scanner for AI agent configurations — 102 rules covering secrets, permissions, hooks, MCP servers, and prompt injection, plus Opus-powered adversarial auditing — and it works against our exact config surface today.**
