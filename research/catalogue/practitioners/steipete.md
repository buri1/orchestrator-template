# Peter Steinberger

> **Austrian founder-turned-AI-engineer who coined "Polyagentmorous" development, created OpenClaw (250K+ GitHub stars), and runs 3-8 coding agents in parallel on a single main branch.**

| Field | Value |
|-------|-------|
| Handle | [@steipete](https://x.com/steipete) |
| Role | Engineer at OpenAI (since Feb 2026) / Ex-Founder of PSPDFKit |
| Known For | OpenClaw, "Polyagentmorous" multi-agent workflow, CLIs-over-MCPs philosophy |
| Platforms | [X/Twitter](https://x.com/steipete), [GitHub](https://github.com/steipete), [Blog](https://steipete.me), [YouTube](https://www.youtube.com/@steipete) |
| Last Analyzed | 2026-03-05 |

---

## Burak's Notes

> *(empty)*

---

## Relevance to Our Work

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly solves the same problem we solve: multi-agent orchestration on a single codebase. His human-as-hub pattern mirrors our orchestrator, and his tmuxwatch tooling parallels our tmux mode. His shift from MCPs to CLIs validates our deterministic monitoring approach. |
| **Signal Quality** | 10/10 | Ships publicly, shares exact configs and token numbers, has verifiable output (6,600 commits/month, $116M exit, 250K-star repo). Zero hype -- everything is backed by personal production use. |

---

## Background & Track Record

Peter Steinberger is an Austrian software engineer (Vienna/London) who founded PSPDFKit, a PDF SDK used by Apple, Dropbox, and SAP across a billion devices. He bootstrapped it for a decade before a $116M investment from Insight Partners in 2021. After exiting, he went deep into AI-native development, becoming one of the most influential voices in the agentic engineering space with 410K followers.

He created OpenClaw (originally "Clawdbot"), a free and open-source autonomous AI agent that uses messaging platforms (Signal, Telegram, Discord, WhatsApp) as its primary interface. OpenClaw went from 0 to 180K GitHub stars in 72 hours and eventually surpassed React as the most-starred non-aggregator project (~250K+ stars). In February 2026, he joined OpenAI while ensuring OpenClaw moved to an independent foundation under MIT license.

His credibility is exceptional: Lex Fridman podcast (#491), The Pragmatic Engineer feature, coverage in Fast Company, Fortune, TechCrunch, WIRED, and VentureBeat. He co-created the "Claude Code Anonymous" meetup format with Orta Therox, now running in six cities worldwide.

---

## System / Workflow

### Architecture

- **Terminal**: Ghostty (ditched VS Code terminal for stability)
- **Monitor**: Dell UltraSharp U4025QW ultrawide (3840x1620) -- fits 4 Claude instances + Chrome
- **Agent CLIs**: Claude Code + Codex CLI as primary interfaces
- **Review**: Tower (Git GUI) for diff review, Cursor/GPT-5 for plan review
- **IDE**: VS Code as side panel for code lookup only

### Daily Workflow

Runs 1-8 agents in parallel in a 3x3 terminal grid, all on the main branch (explicitly rejects git worktrees). Agent count scales by "blast radius":
- 1-2 agents for focused single-task work
- ~4 agents for cleanup/tests/UI ("the sweet spot")
- Up to 8 for maximum parallel throughput

The human (steipete) acts as the central hub -- dispatching work, steering agents when they drift, and reviewing output in Tower. He interrupts agents mid-run with `escape` for status checks. Commits atomically, reverts bad output immediately.

### Key Numbers

- 6,600+ commits in January 2026
- 3-8 agents in parallel daily
- Token auto-compact limit: 233,000 tokens (formula: 273,000 - tool_output_limit - 15,000)
- $116M PSPDFKit investment (track record)
- OpenClaw: 250K+ GitHub stars

### Unique Patterns

- **All agents on main branch** -- no worktrees, partitions work by area instead
- **CLIs over MCPs** -- GitHub MCP costs 23K tokens; `gh` CLI costs zero
- **Compaction as quality gate** -- treats context overflow as an implicit review pass
- **"Slot machine" philosophy** -- re-execute the same prompt for different outputs, like pulling a lever
- **Screenshots in 50%+ of prompts** -- images as a primary context-passing mechanism
- **Oracle tool** -- cross-model consultation (GPT-5 Pro) when primary agent gets stuck
- **Telegraphic AGENTS.md** -- minimal tokens, drop grammar, universal instructions only

### Agent Monitoring Stack

| Tool | Purpose |
|------|---------|
| tmuxwatch | TUI dashboard for all tmux sessions/panes |
| CodexBar | macOS menu bar showing agent quota/usage |
| VibeTunnel | Browser-based remote terminal access |
| Poltergeist | Universal hot reload / file watcher |
| RepoBar | CI, PRs, releases at a glance |

---

## Key Insights

1. **"Almost all MCPs should be CLIs"** -- MCPs consume constant context space (23K tokens for GitHub MCP). A CLI has zero context cost because the agent discovers usage from `--help` output on first call. He removed his last MCP after Claude started spinning up Playwright unprompted.

2. **Human-as-hub beats automated orchestration** -- He explicitly rejects background agents: "Still don't see how this could be moved to background agents. I steer the models a lot as I notice them drifting off." The human's role shifts from writing code to making architectural decisions and steering.

3. **Blast radius determines agent count** -- Don't scale agents linearly. Scale by how many files a change touches. Many small bombs (isolated changes) beat one large bomb (sweeping refactor). Large changes make rollback impossible.

4. **Compaction is a feature, not a bug** -- Context window overflow forces the model to re-read code, which acts as an implicit review pass. Tasks should be designed to survive multiple compactions.

5. **"Ship beats perfect"** -- 6,600 commits in a month by shipping code he never reads. Let agents generate, review diffs, revert bad output, ship what works. Perfection is the enemy of velocity.

6. **Context engineering is the highest-leverage skill** -- Single canonical AGENTS.md symlinked across all repos. Per-repo files contain only a pointer line plus truly repo-specific rules. "Since CLAUDE.md goes into every single session, ensure its contents are as universally applicable as possible."

---

## What We Can Learn

- **CLI-first tooling**: Our orchestrator should expose every capability as a CLI before wrapping it in any other interface. This matches our existing deterministic monitoring approach (Elvis Sun's check-agents.sh pattern).

- **Blast radius scaling**: Our agent spawning logic should factor in task scope. The orchestrator should assess file-touch count before deciding how many agents to spawn.

- **AGENTS.md pointer architecture**: Instead of duplicating instructions across projects, maintain one canonical file and have per-repo files point to it. Reduces maintenance and context waste.

- **tmuxwatch pattern**: His tmux monitoring TUI validates our tmux mode approach. We should study tmuxwatch's implementation for our own monitoring dashboard.

- **Compaction-safe task design**: Design orchestrator tasks to survive compaction. Treat compaction as a review gate rather than a failure mode.

- **Cross-model consultation (Oracle pattern)**: When an agent gets stuck, invoke a different model for a second opinion rather than retrying with the same model. We could integrate this into our roadblock recovery flow.

- **Atomic commits as rollback points**: Configure every agent for atomic commits so any bad output can be surgically reverted without affecting other agents' work.

---

## What Doesn't Apply

- **All-on-main-branch approach**: Works for a solo developer who is constantly steering. Our orchestrator manages agents that may run with less supervision, making git worktrees or branch isolation more appropriate for us (especially for gov/DSGVO work requiring audit trails).

- **"Ship code I don't read" philosophy**: Our gov SaaS contracts require review and compliance. We need the E2E testing gate (INC-014/015) that steipete explicitly skips.

- **Rejection of automated orchestration**: His skepticism of background agents is valid for his solo workflow but contradicts our core thesis. We are building the automated orchestrator he says doesn't work yet -- our bet is that deterministic monitoring + structured state can replace some of his manual steering.

- **No formal A2A protocol**: His agents communicate only through the codebase. For our multi-business federated architecture, we need explicit state schemas and task interfaces between business lines.

---

## Referenced Tools/Projects

| Tool/Project | How They Use It | In Our Catalogue? |
|-------------|-----------------|-------------------|
| OpenClaw | Created it -- autonomous AI agent via messaging platforms | No |
| tmuxwatch | TUI dashboard to monitor all tmux agent sessions | No |
| Claude Code | Primary agent CLI for code generation | No |
| Codex CLI | Daily driver agent CLI (3-8 instances in 3x3 grid) | No |
| Ghostty | Terminal emulator (replaced VS Code terminal) | No |
| Tower | Git GUI for reviewing agent diffs | No |
| Peekaboo | macOS screenshots + GUI automation (MCP + CLI) | No |
| claude-code-mcp | "Agent in your agent" -- runs Claude Code as one-shot MCP | No |
| mcp-agentify | Converts MCP servers into orchestratable agents | No |
| Oracle | Cross-model consultation tool (GPT-5 Pro) | No |
| CodexBar | macOS menu bar agent quota/usage monitor | No |
| VibeTunnel | Browser-based remote terminal access for agents | No |
| Poltergeist | Universal hot reload / file watcher | No |
| mcporter | TypeScript MCP caller / CLI packager | No |

---

## Key Takeaway

> **The human is still the best orchestrator -- steipete's "Polyagentmorous" workflow proves that 3-8 parallel agents on a single codebase work when the human actively steers, partitions work by blast radius, and treats every tool as a CLI with zero context cost.**
