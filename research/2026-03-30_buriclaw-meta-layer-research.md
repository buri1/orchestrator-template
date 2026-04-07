# BuriClaw Meta-Layer Research — Deep Research Summary

**Date**: 2026-03-30
**Session**: 15+ Opus agents spawned across multiple waves
**Goal**: Decide on a meta-layer agent architecture for Burak's multi-project orchestration

## Context

Burak runs 8 projects as a solo founder (OmniPort-HH $50K client, CityHub, ADWO, Finance Agent, VASEO, ContentOS, Hoyo Kingdom, Orchestrator). He has:
- **Claude Max** $200/mo (primary, for coding)
- **3x Google AI Pro** $20/mo each (Gemini CLI access)
- **OpenAI Pro** $20/mo (basic, not useful for agent work)
- **Windows PC** (16GB RAM, RTX 3070 8GB VRAM) running 24/7 as dedicated agent machine
- **MacBook** as primary dev machine

He wants a "CEO Agent" that manages projects from his phone via Discord, delegates coding to Claude Code, integrates with Notion, and runs 24/7.

## Critical Meeting

**April 1, 2026**: OmniPort-HH 2nd-round bid meeting (EUR 15M KfW Smart City project). Meeting prep materials at `_bmad/meeting-prep/`.

## Key Findings from Research

### 1. Claude Code Updates (March 2026) — Game Changers

- **Channels** (Mar 20): Discord, Telegram, iMessage plugins. Push events into running session.
- **Remote Control**: `claude remote-control` — persistent server, connect from phone/browser, up to 32 sessions with worktree isolation.
- **Dispatch**: Phone → Desktop app (macOS only currently).
- **`--remote`**: Start tasks on Anthropic cloud VMs from terminal. Monitor from phone.
- **`/teleport`** (`/tp`): Pull web sessions into local terminal. Branch + history transferred.
- **`/loop`**: Up to 7 days recurring execution.
- **`/batch`**: Fan out massive changesets across dozens/hundreds of worktree agents.
- **Scheduled Tasks**: Cloud (min 1h) + Desktop (min 1min).
- **Agent Teams**: Multi-agent with mailbox messaging (experimental).
- **Agent SDK**: Python + TypeScript, same engine as Claude Code.
- **Computer Use**: macOS only (not Windows yet).

### 2. Framework Evaluation Results

| Framework | Score | Verdict |
|-----------|-------|---------|
| **Claude Code + Channels + Remote** | Best for simplicity | Native, $0 extra, proven. No message queue. |
| **Hermes Agent** (Nous Research) | 6-7/8 | Multi-model, 14+ messaging platforms. BUT: bus factor 1, self-improvement overhyped (keyword-overlap fitness), smart routing is crude regex. |
| **OpenClaw** (hardened) | 8/8 | Most complete. BUT: requires security hardening (CVSS 8.8, 20% malicious ClawHub skills). 430K LOC. |
| **NanoClaw** | 7/8 | Best security (micro-VM Docker). BUT: Claude-only, no Gemini/multi-model. |
| **ZeroClaw** | 6-7/8 | Rust, 3.4MB. Multi-model + MCP. Claude Code subprocess unclear. |

### 3. Hermes Agent Deep Dive — Honest Assessment

- **Self-improvement**: Runtime learning = tool-mediated MEMORY.md (same as simple approach). Evolution system uses KEYWORD OVERLAP as fitness function — very weak.
- **Smart model routing**: Keyword regex (`< 160 chars, no backticks? → cheap model`). Not ML-based.
- **Bus factor**: 74% commits from one person (teknium/Karan Malhotra).
- **Real value**: Messaging gateway (14+ platforms) — nothing else offers this breadth.
- **Can piggyback on Claude Max**: Reads `~/.claude/.credentials.json`, spoofs user-agent. ToS risk.
- **No native Claude Code spawning**: Would need custom shell tool integration.

### 4. Gemini CLI — NOT Viable for 24/7 Agent

- Google AI Pro = 1,500 requests/day → 2-3 hours of heavy use, NOT 24/7
- Real-world: quota exhausted after 20-30 minutes of heavy agent use
- No native Discord/Channels integration
- Valuable as SECONDARY terminal tool (1M context, code reviews), not primary agent
- Google AI Pro subscriptions ≠ API access (consumer product, not API keys)
- Proxying (CLIProxyAPI, Antigravity) carries ToS risk, Google actively banning

### 5. Windows PC Setup

- **Claude Computer Use**: macOS only. Docker-based Computer Use API works on Windows but costs API tokens.
- **CUA**: Best open-source computer use for Windows (Docker-based sandboxed desktops).
- **Agent S2**: Native Windows desktop control.
- **Windows 11 Agent Workspace**: Separate Windows session per agent. Insider Preview only, GA likely Oct 2026.
- **24/7 config**: Disable sleep, auto-login, HDMI dummy plug ($5), VNC + Tailscale.
- **Local models**: RTX 3070 8GB → Qwen3 8B (Q4_K_M), useful for routine tasks only.

### 6. Session Persistence (Claude Code)

- Sessions live indefinitely (no timeout) as long as process runs
- Context compaction at ~95% of 200K window — session continues
- Channels: push into RUNNING session only, NO message queue, messages lost during downtime
- Auto-restart: `while true; do claude --continue; sleep 5; done` in tmux
- Rate limits: Claude Max 5-hour rolling window + weekly ceiling. 1 session 24/7 = sustainable. 4 parallel = burns weekly budget in 4 hours.
- `/loop` up to 7 days as keep-alive mechanism

### 7. Existing Infrastructure (Already Built)

- **L-Thread Orchestrator v3** (tmux): Proven, shipped $50K OmniPort project
- **L-Thread Orchestrator v4** (cmux): Event-driven, worktree isolation, up to v4.2 with Beads
- **Pi Orchestrator**: Ambitious but never shipped (too complex, GPT-5.4 supervisor unreliable)
- **Venture Spine**: 8-project portfolio management (shell scripts + Notion sync)
- **BMAD Framework**: 21 agents, 41+ workflows, multi-IDE (claude-code, gemini, kiro-cli, opencode)
- **Research Catalogue**: 417 entries, 82 reference docs, ADOPTABLE-PATTERNS.md
- **82 Claude Code commands** (65 BMAD + 6 ingest + 11 orchestrator)

### 8. BMAD as Bridge Layer — Confirmed

- Framework-agnostic skill/workflow definitions in `_bmad/`
- Agent Skills Open Standard (agentskills.io) adopted by 32+ tools
- Commands can be converted to SKILL.md format for cross-platform portability
- Already multi-IDE: claude-code, gemini, antigravity, kiro-cli, opencode

## FINAL ARCHITECTURE DECISION

### The Answer: Native Claude Code (no framework)

The simplest approach that matches "simplicity over ego":

```
Smartphone (claude.ai/code or Mobile App)
├── Start tasks: claude --remote "..."  → Cloud VM
├── Monitor & steer: Mobile App
├── Teleport to Windows: claude --teleport
│
Windows PC (WSL2, tmux, 24/7)
├── Remote Control Server: claude remote-control
├── Discord Channel: claude --channels plugin:discord
├── Workers: claude -w (worktree sessions)
├── Notion: MCP (already configured)
├── Auto-restart wrapper scripts
│
MacBook (primary dev)
├── L-Thread Orchestrator (tmux/cmux)
├── BMAD workflows
├── Research catalogue curation
```

### Why No Framework

1. Claude Code Channels + Remote Control + --remote + /teleport covers 90% of needs
2. "Simplicity over ego" — proven principle from own experience
3. $0 extra cost (Claude Max covers everything)
4. No bus factor risk (Anthropic-backed)
5. All existing BMAD skills, commands, orchestrator patterns work unchanged
6. Hermes/OpenClaw add complexity for marginal gain (message queue, multi-model)

### What's Missing (and Workarounds)

| Missing | Workaround |
|---------|-----------|
| Message queue | Auto-restart wrapper + /loop keep session alive 99%+ |
| Multi-model (Gemini) | Use Gemini CLI as secondary terminal tool, not primary agent |
| Computer Use on Windows | CUA in Docker (when needed) or wait for Windows Agent Workspace (Q4 2026) |
| Cron/scheduling | /loop (7 days) + /schedule (cloud) + shell cron |
| WhatsApp/Signal | Discord + Telegram covers core needs |

### Google AI Pro Subscriptions

**Recommendation**: Use Gemini CLI for 1M-context code reviews and large codebase analysis. NOT as 24/7 agent (quota too low). Consider cancelling 2 of 3 accounts if not using for other purposes.

## Next Steps

1. **Set up WSL2 on Windows PC** (if not already done)
2. **Install Claude Code** in WSL2: `npm install -g @anthropic-ai/claude-code`
3. **`claude login`** with Claude Max credentials
4. **Start Remote Control**: `tmux new-session -d -s remote 'while true; do claude remote-control; sleep 5; done'`
5. **Start Discord Channel**: `tmux new-session -d -s discord 'while true; do claude --channels plugin:discord@claude-plugins-official --dangerously-skip-permissions; sleep 5; done'`
6. **Clone orchestrator repo** on Windows PC
7. **Configure Windows**: No sleep, auto-login, VNC, Tailscale
8. **Test from phone**: Open claude.ai/code → connect to Windows PC

## Key Files to Read

- `CLAUDE.md` — Project instructions
- `venture-spine/portfolio-state.yaml` — Current project portfolio
- `venture-spine/projects.json` — All 8 projects with paths, tiers, budgets
- `_bmad/meeting-prep/FINAL-BRIEFING-v2.md` — OmniPort meeting prep (April 1!)
- `research/catalogue/ADOPTABLE-PATTERNS.md` — Actionable patterns backlog
- `research/catalogue/INDEX.md` — Full 417-entry catalogue
