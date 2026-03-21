# Agent Flywheel (ACFS)

> **Bootstraps a fresh Ubuntu VPS into a complete multi-agent AI development environment in 30 minutes: coding agents, session management, safety tools, and coordination infrastructure.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Website | [agent-flywheel.com](https://agent-flywheel.com/) |
| Repository | [Dicklesworthstone/agentic_coding_flywheel_setup](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup) |
| GitHub Stars | 1,237 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel — solo developer, PE/hedge fund consulting background |
| License | NOASSERTION (described as "free and open-source") |
| Tech Stack | Shell (installer), Go (NTM, BV, SLB), Rust (CASS, DCG, PT), TypeScript (CM, CAAM), Python (Agent Mail), Bash (UBS, RU) |
| Maturity | 🟢 Production (actively used by creator for consulting work; 29 tools in ecosystem) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *This is not a single tool — it's an entire ecosystem of 16 core tools + 13 supporting utilities built by one person. The flywheel concept mirrors our own compounding architecture vision. Several individual components are directly relevant: NTM (tmux orchestration — 175 stars), Agent Mail (inter-agent messaging — 1,780 stars), CASS (session search across 11 agent formats — 307 stars), and CM (procedural memory system). The "two-person rule" safety concept in SLB is interesting for gov work. Worth cherry-picking individual tools rather than adopting the full stack.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Multiple components directly map to Master Blueprint layers (tmux orchestration, agent coordination, safety, memory). The full ecosystem validates our architecture direction but is Linux/VPS-only, not macOS. |
| **Novelty** | 6/10 | Validates patterns we've documented (tmux, agent mail, session memory) with more polished implementations. The 3-layer memory system (episodic→working→procedural with 90-day decay) and SIMD-accelerated command guard are genuinely new approaches. |
| **Actionable** | 5/10 | Individual tools (CASS, CM, Agent Mail) could be adopted, but the ecosystem assumes Ubuntu VPS + multi-account Claude/GPT subscriptions — different deployment model than our macOS local setup. Adaptation needed. |

---

## Overview

Agent Flywheel is a comprehensive ecosystem that turns a fresh Ubuntu VPS into a fully-configured multi-agent AI development environment via a single idempotent shell command. Created by Jeffrey Emanuel for his PE/hedge fund consulting practice, it installs and configures three AI coding agents (Claude Code, OpenAI Codex CLI, Google Gemini CLI) alongside 30+ developer tools in ~30 minutes.

The real substance is not the installer script but the 16 core tools and 13 supporting utilities that form a self-reinforcing "flywheel" — the more you use them, the more the system learns and accelerates. The creator claims shipping 20,000+ lines of production Go code in a single day using this setup. The architecture supports 6+ parallel agents with 3+ hours of autonomous operation through a combination of task graph analysis (BV/Beads Viewer), inter-agent messaging (Agent Mail), session search (CASS), and procedural memory (CM).

The ecosystem is opinionated about infrastructure: dedicated VPS ($40-56/mo), Claude Max + ChatGPT Pro subscriptions ($400-600/mo total), and Ubuntu as the OS. It's designed for throwaway environments with passwordless sudo, which is the opposite of our gov/DSGVO compliance posture but makes sense for its target audience. The marketing site (agent-flywheel.com) positions the full stack at $440-656/mo and includes an interactive "onboard" tutorial that guides users from Linux basics through complete agentic workflows after the 13-step installation.

---

## Technical Architecture

### Core Loop

```
NTM spawns agents → Agents register with Mail → BV discovers tasks →
CASS provides context → CM surfaces patterns → Agents execute →
UBS/DCG enforce safety → RU syncs repos → Loop repeats
```

### 16 Core Components

| Tool | Function | Language | Stars |
|------|----------|----------|-------|
| **NTM** | Tmux-based agent orchestration, 80+ commands, prompt broadcasting | Go | 175 |
| **Agent Mail** | FastMCP server: agent identities, threaded messaging, file reservations | Python | 1,780 |
| **UBS** | AST-grep bug scanner, 1000+ patterns, 8 languages, <5s scans | Bash | 132 |
| **BV (Beads Viewer)** | DAG-based task graph, PageRank prioritization, critical path analysis | Go | 891 |
| **CASS** | Session search across 11 agent formats, Tantivy engine, <60ms queries | Rust | 307 |
| **CM** | 3-layer memory (episodic→working→procedural), 90-day decay, MCP native | TypeScript | 152 |
| **CAAM** | Sub-100ms auth/account switching, cooldown tracking, health scoring | TypeScript | 45 |
| **SLB** | Two-person approval for dangerous ops, 4 risk tiers, crypto signing | Go | 49 |
| **DCG** | SIMD-accelerated command guard, PreToolUse hook, 50+ pattern packs | Rust | 89 |
| **RU** | Multi-repo sync, AI-assisted review, parallel operations | Bash | 67 |
| **BR (Beads Rust)** | Local-first issue tracking, SQLite + JSONL git export | Rust | — |
| **MS** | Skill management + MCP server | Rust | — |
| **RCH** | Remote Rust build offloading | Rust | — |
| **WA** | Terminal hypervisor for automation | Rust | — |
| **Brenner** | Research orchestration | TypeScript | — |
| **JFP** | Prompt library browser/installer | TypeScript | — |

### Data Persistence Model

- **Agent Mail**: HTTP-only FastMCP with SQLite + Git + static export
- **BR**: SQLite primary + JSONL git export
- **CM**: Cross-session persistent storage (MCP-integrated)
- **BV**: DAG storage with time-travel diffing
- **CASS**: Tantivy indices across 11 agent formats

### Safety Architecture (3 layers)

1. **DCG** — Pre-execution: SIMD-accelerated pattern matching blocks destructive commands at Claude Code's PreToolUse hook (50+ pattern packs, 17 categories)
2. **UBS** — Pre-commit: AST-grep static analysis catches bugs before they enter version control
3. **SLB** — Critical operations: Two-agent approval required for CRITICAL-tier commands, cryptographic signing, rollback support

---

## Publisher Background

**Jeffrey Emanuel** is a solo developer who built this ecosystem for his private equity and hedge fund consulting work. His background is in quantitative finance, not traditional software engineering, which may explain the unconventional but pragmatic architecture choices. The Agent Mail tool (1,780 stars) has achieved significant traction as a standalone component. His GitHub profile (Dicklesworthstone) shows sustained commit activity across all ecosystem tools. No VC funding; this is a practitioner-built system from actual consulting revenue needs, similar to our own origin story with the L-Thread Orchestrator.

---

## What's Valuable for Us

1. **Agent Mail (MCP Agent Mail)** — The file reservation system (advisory locks preventing edit conflicts between agents) is a pattern we haven't implemented. Our tmux agents currently have no coordination mechanism to prevent simultaneous edits to the same file. Agent Mail's approach of "advisory file leases" over FastMCP could be adapted for our Conduit mode. Repo: `Dicklesworthstone/mcp_agent_mail`.

2. **CASS (Session Search)** — Indexes 11 different agent session formats with <60ms Tantivy-powered queries. We currently have no way to search across past Claude Code sessions. CASS supports Claude Code's JSONL format natively. Could be adopted as-is for our observability layer (Master Blueprint Layer 3).

3. **CM (Memory System)** — The 3-layer cognitive architecture (episodic→working→procedural) with 90-day decay is more sophisticated than anything in our catalogue. Maps directly to our "knowledge compounding" governing principle (#1). The MCP integration means it could plug into our existing Claude Code setup.

4. **DCG (Command Guard)** — The Claude Code PreToolUse hook integration with SIMD-accelerated pattern matching is production-ready safety infrastructure. Relevant for gov/DSGVO compliance where destructive command prevention is not optional. 50+ pattern packs across 17 categories (git, filesystem, databases, Kubernetes, cloud, CI/CD).

5. **NTM (Named Tmux Manager)** — 80+ commands for tmux agent orchestration validates our tmux-based approach. Key features we lack: prompt broadcasting to agent types, file conflict detection, context rotation. Worth studying alongside pi-side-agents and Overstory for our tmux session management layer.

6. **BV (Beads Viewer)** — PageRank-based task prioritization using DAG analysis is a novel approach to the "what should agents work on next" problem. Our current approach is manual task assignment; this could automate prioritization in Phase 2+.

---

## What's NOT Relevant

1. **VPS-first deployment model** — We run on macOS local with tmux. The entire ACFS installer assumes Ubuntu VPS with passwordless sudo, which conflicts with our security posture and DSGVO compliance requirements (Governing Principle #6: federated systems).

2. **Multi-provider agent strategy** — Flywheel runs Claude + Codex + Gemini simultaneously. Our architecture deliberately uses Claude only for code execution, per the 70/30 deterministic/LLM split (Governing Principle #2). CAAM's multi-account rotation is irrelevant.

3. **Throwaway environment philosophy** — Passwordless sudo, disposable VPS, no compliance layer. The opposite of our gov work requirements. SLB's safety model is interesting but the overall security posture is inappropriate for BSI/DSGVO contexts.

4. **Full ecosystem adoption** — 29 tools is massive dependency surface. Governing Principle #7 ("build only what you have needed in the last 30 days") directly contradicts adopting the full stack. Cherry-pick individual tools only.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Evaluate CASS for session search across our Claude Code history. Evaluate DCG as a safety net for agent commands in gov work. Both are low-integration-cost, high-value additions.
- **Phase 2 (Days 4-60)**: Study Agent Mail's file reservation pattern for preventing edit conflicts in our multi-agent tmux setup.
- **Phase 3 (Days 60-90)**: Evaluate CM's 3-layer memory system as our knowledge compounding mechanism. This is when we'll have enough session history to benefit from procedural memory extraction.
- **Phase 4 (Days 90+)**: If scaling to 6+ parallel agents, NTM's prompt broadcasting and context rotation patterns become relevant. BV's PageRank task prioritization could automate agent task assignment.

---

## Key Takeaway

> **Agent Flywheel is not one tool but a 29-tool ecosystem that independently arrived at many of our Master Blueprint patterns (tmux orchestration, agent messaging, session memory, safety layers); its individual components — especially Agent Mail, CASS, CM, and DCG — are worth cherry-picking as standalone adoptions rather than buying the full stack.**
