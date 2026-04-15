# node9

> **The execution security layer for AI agents — intercepts every tool call before it runs, giving you human-in-the-loop approvals, credential scanning, and one-command undo.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [node9ai/node9](https://github.com/node9ai/node9) |
| GitHub Stars | Not publicly indexed (as of 2026-03-25) — repo may be private/new |
| Publisher | node9ai — small startup/team, node9.ai domain, $29 one-time product |
| License | Unknown (proprietary or source-available based on $29 pricing) |
| Tech Stack | Unknown internals; CLI distributed via `brew install node9`, `npm install -g @node9/proxy`, `pip install node9` |
| Maturity | 🟡 Early — newly launched, limited public information |
| Last Analyzed | 2026-03-25 |

---

## Burak's Notes

> *This is DCG's more ambitious sibling — while DCG guards a specific class of destructive shell commands, node9 intercepts EVERY tool call across ANY agent (Claude Code, Gemini CLI, Cursor, LangChain, CrewAI). The multi-channel approval race is genuinely interesting — instead of a single blocking approval gate, it fires native popup + browser + Slack + terminal simultaneously and uses whichever responds first. That's the right UX design for async approval workflows. The DLP scanner is always-on with zero config, which is the correct default. The AI negotiation loop (where blocked agents are steered toward safer alternatives) goes further than any other tool I've seen — it's not just a hard block, it's a redirect. Shadow undo + git snapshots before every file edit is the safety net we wish existed when agents do unexpected rewrites. The $29 price point is interesting — implies this is a developer tool, not enterprise SaaS. But the GitHub repo was 404 at analysis time, which is a concern for a tool claiming to intercept production agent traffic. Treat as a strong conceptual reference; validate before adopting into agent bootstrap.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly fills a gap in Layer 3 Shared Infrastructure (Master Blueprint). We already use DCG for git/filesystem guards, but node9 covers the full tool-call surface including secrets leakage via any tool. The DLP scanner addresses the `--dangerously-skip-permissions` risk surface that AgentShield flags at static analysis time — node9 does it at runtime. |
| **Novelty** | 9/10 | Multi-channel approval race, AI negotiation loop on block, and shadow undo as git snapshots are patterns we have not seen in any other tool in the catalogue. DCG is conceptually adjacent but only covers shell commands; node9 covers MCP tools, Python decorators, and proxy mode universally. |
| **Actionable** | 6/10 | Concepts are immediately adoptable; the `brew install node9` path is simple. However the GitHub repo returned 404 (private or unpublished), the $29 pricing implies a proprietary binary, and no source is available for inspection. Cannot adopt production agents onto a closed-source binary intercepting every tool call without source audit. Pattern reference today; revisit when open-sourced or properly documented. |

---

## Overview

node9 positions itself as a "deterministic execution firewall and sudo wrapper" for AI agents. It sits between the agent runtime and every tool call, intercepting the execution before it reaches the system. Unlike DCG (which hooks into Claude Code's `PreToolUse` specifically for shell/bash commands) or AgentShield (which statically scans agent configs for security misconfigurations), node9 claims universal coverage: any agent, any tool invocation, any runtime.

The product ships three integration paths: (1) a native CLI for Claude Code and Gemini CLI, installed via `brew install node9`; (2) an MCP proxy mode via `npm install -g @node9/proxy` that wraps any MCP server transparently; (3) a Python `@protect` decorator via `pip install node9` that works with LangChain and CrewAI tool registries. This three-path distribution is architecturally notable — it means the same approval/scanning/undo logic applies whether the agent is making file edits via a bash tool, calling an MCP server, or invoking Python functions.

The five core capabilities — multi-channel approval race, always-on DLP scanning, AI negotiation loop, flight recorder, and shadow undo — form a coherent "defense in depth" stack. The approval race is the entry point (gate every action), DLP catches secrets exfiltration before approval is even needed, the AI negotiation loop handles the case where an agent is blocked and needs steering, the flight recorder provides audit trail for post-hoc review, and shadow undo is the last resort if something slips through. This layering maps cleanly to our Master Blueprint's "Quality Gates (deterministic, non-LLM)" principle.

---

## Technical Architecture

### Interception Model

```
Agent (Claude Code / Gemini CLI / Cursor / LangChain / CrewAI)
        │
        ▼
  node9 Interceptor ──────────────────────────────────────────────┐
        │                                                         │
        ├─ 1. DLP Scan ──── AWS keys / GitHub tokens /           │
        │                   Stripe keys / PEM certs              │
        │                   → BLOCK immediately if hit           │
        │                                                         │
        ├─ 2. Approval Race ─────────────────────────────────────┤
        │     ├─ Native macOS popup                              │
        │     ├─ Browser notification                            │
        │     ├─ Slack message                                   │
        │     └─ Terminal prompt                                 │
        │         → First approval wins, rest cancelled          │
        │                                                         │
        ├─ 3. If BLOCKED → AI Negotiation Loop                   │
        │     → Tell agent WHY + guide to safer path             │
        │                                                         │
        └─ 4. If APPROVED → Execute + Shadow Snapshot            │
              → Silent git commit before file changes            │
              → node9 tail (live stream)                         │
              → node9 undo --steps N (rollback)                  │
```

### Five Core Capabilities

**1. Multi-Channel Approval Race**
Unlike single-channel human approval gates (e.g., HumanLayer's Slack-only or terminal-only modes), node9 fires all channels simultaneously and uses whichever human responds first. This eliminates the "wrong channel" problem — if Slack is open, Slack responds; if the terminal is focused, terminal responds. Remaining channels are cancelled automatically.

**2. DLP Scanner (always-on, zero config)**
Every tool call is scanned for known secret patterns before reaching the approval gate:
- AWS access keys (`AKIA...`, `ASIA...`)
- GitHub personal access tokens (`ghp_...`, `github_pat_...`)
- Stripe secret keys (`sk_live_...`, `sk_test_...`)
- PEM private key blocks (`-----BEGIN ... PRIVATE KEY-----`)

Zero-config means no rule authoring — the scanner runs at process start with pre-baked patterns. This is the right default; agents writing code frequently reference API keys in test fixtures or environment variable assignments.

**3. AI Negotiation Loop**
When an action is blocked (by DLP or approval denial), node9 does not just return an error. It constructs a structured explanation of why the action was blocked and suggests an alternative path. This reduces the "agent gets stuck on repeated denials" problem where agents loop on the same blocked action. The negotiation loop is what distinguishes node9 from a pure gate — it's a co-pilot for the block, not just a wall.

**4. Flight Recorder**
```bash
node9 tail          # Stream live tool calls and approval decisions
node9 --history     # Full audit trail of past sessions
node9 --clear       # Reset session history
```
This is observability at the tool-call level, not just at the LLM trace level (which Langfuse provides). The distinction matters: LLM traces show what the model decided; the flight recorder shows what the system did.

**5. Shadow Undo**
```bash
node9 undo --steps 3    # Roll back last 3 file edits
```
Before every AI file write, node9 silently creates a git snapshot. This is equivalent to Git's `stash` but automated and invisible to the agent. Rolling back 3 steps undoes the last 3 file changes regardless of what the agent did between them.

### Integration Paths

| Path | Install | Use Case |
|------|---------|----------|
| Native CLI | `brew install node9` | Claude Code, Gemini CLI — wraps the entire session |
| MCP Proxy | `npx @node9/proxy` | Any MCP server — transparent proxy mode |
| Python SDK | `pip install node9` | LangChain, CrewAI — `@protect` decorator on tools |

---

## Publisher Background

**node9ai** — the company/team behind this tool has minimal public footprint at time of analysis. The domain `node9.ai` is live and the product is priced at $29 USD (one-time). The GitHub repo `node9ai/node9` returned 404 from the GitHub API, suggesting the repo is either private, very recently created, or operating under a different name. The npm package `@node9/proxy` may have a public registry entry (403 at time of fetch). The `pip install node9` package name is claimed.

The product is listed as supporting Windows, macOS, and Linux — and the installation paths (`brew`, `npm`, `pip`) suggest a developer-tool orientation, not enterprise SaaS. Three distribution mechanisms for one security product is a credibility signal — it suggests the team has thought through the polyglot agent ecosystem rather than building a one-harness-only tool.

No known funding, team size, or prior track record is publicly available. **Credibility risk: medium-high.** The claims (especially "AI negotiation loop" and "multi-channel approval race") are specific and architecturally coherent, but cannot be verified without source code or public test results.

---

## What's Valuable for Us

**1. Multi-channel approval race pattern**
Our current approval flow for agent actions is either fully automatic (AUTO_MODE=ENABLED) or blocks on terminal. The racing pattern — fire Telegram + terminal + browser simultaneously — is directly adoptable as our "human in the loop" mechanism for medium-risk actions. We already use Telegram for notifications; adding it as a first-class approval channel with fallback to terminal is a one-day implementation.

**2. DLP scanning before every tool call**
Our agents run with `--dangerously-skip-permissions`. AgentShield audits our config statically, but nothing scans outbound tool call payloads at runtime. If an agent is writing a test file that embeds an API key from the environment, nothing catches it today. The DLP pattern (scan for AWS/GitHub/Stripe/PEM patterns in every tool call) is implementable as a Claude Code `PreToolUse` hook that runs before DCG — same hook slot, sequential.

**3. AI negotiation loop as block handler**
Our orchestrator currently either allows or denies agent actions. When a roadblock occurs, the agent has to figure out a workaround on its own. Building a "block reason + safer alternative" structured response into our hook layer — even as a prompt-based response rather than a dedicated ML model — is a significant UX improvement for AUTO_MODE operations. The Master Blueprint's Governing Principle 5 ("Human review is the binding constraint") is served by negotiating the agent toward a correct path rather than requiring human intervention for every denial.

**4. Shadow undo = instant rollback for agent experiments**
We currently rely on `git worktree` isolation + branch-per-agent to prevent cross-contamination. Shadow undo within a single worktree (silent git snapshots before each file write) is a complementary safety layer — it enables "undo last 3 agent file writes" without `git reset`. This is especially valuable during the review-fix loop (Orchestrator Step 5) where a fixer agent might make 3 file changes that all need to be rolled back.

**5. Flight recorder for agent audit trails**
Beyond Langfuse LLM traces, recording the specific tool calls and approval decisions creates a forensics layer. When an agent fails in a way that doesn't produce an LLM trace (e.g., crashes, timeout), the flight recorder gives a post-mortem. This maps to our Observability layer in Layer 3 of the Master Blueprint.

---

## What's NOT Relevant

**1. Python SDK / CrewAI / LangChain integration**
We are a TypeScript-first, Claude Code-native stack. The `pip install node9` path and CrewAI/LangChain integrations are irrelevant. The Master Blueprint's Governing Principle 2 ("Deterministic orchestration, LLM execution") and our all-in-on Claude Code harness means Python agent frameworks are not in scope.

**2. Cursor integration**
We use Claude Code as our coding agent, not Cursor. Cursor-specific features add no value.

**3. The $29 black-box binary as production dependency**
We cannot inject a closed-source binary between our agents and their tool calls without source code review. A tool that intercepts every tool call is a potential security liability if it has bugs, exfiltrates data, or modifies payloads. For production use, this is a hard blocker until the source is auditable. Reference the patterns; do not adopt the binary.

**4. Browser approval channel**
Our orchestration runs headless in tmux. Browser-based approvals require a browser session to be open. Terminal + Telegram are the only relevant approval channels for our setup.

---

## Future Use Cases

**Phase 1 (Days 1-3):** Extract the DLP scan patterns (AWS/GitHub/Stripe/PEM regex) and implement them as a 20-line PreToolUse hook alongside DCG. Zero dependency on node9 binary, immediate security improvement.

**Phase 2 (Days 4-60):** Implement a lightweight version of the multi-channel approval race: when the orchestrator needs human approval (rare in FULL AUTO MODE, but exists for production deploys), fire Telegram + terminal simultaneously and accept first response. The `roadblock-recovery` skill is the correct hook point.

**Phase 3 (Days 60-90):** If node9 open-sources or provides source-available code, evaluate the full interceptor as a drop-in for our PreToolUse hooks. By Phase 3 we'll be running 6+ parallel workers with `--dangerously-skip-permissions` and the multi-layer defense is worth the overhead.

**Phase 4 (Days 90+):** The flight recorder + audit trail becomes mandatory for gov client work (BSI/DSGVO compliance). node9's structured log format — if auditable and tamper-evident — could serve as the compliance artifact layer in our client delivery workflow.

---

## Key Takeaway

> **node9 introduces three patterns not found elsewhere in the catalogue: multi-channel approval racing, AI negotiation on block, and shadow undo — extract the DLP regex patterns now as a 20-line hook; defer the binary adoption until source code is auditable.**
