# Pi Subagent Orchestration Skill (LobeHub)

> **LobeHub marketplace skill for orchestrating multiple Pi subagents with per-agent git audit trails, PID/tmux tracking, max-turn limits, Mission Control integration, and cost-aware model selection.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [Dicklesworthstone/pi_agent_rust](https://github.com/Dicklesworthstone/pi_agent_rust) |
| Marketplace | [LobeHub Skills](https://lobehub.com/bg/skills/dicklesworthstone-pi_agent_rust-pi-subagent-orchestration) |
| GitHub Stars | 574 (as of 2026-03-14, parent repo) |
| Publisher | Jeff Emanuel / @doodlestein (solo — same author as Agent Flywheel, Pi Agent Rust, Beads Viewer) |
| License | NOASSERTION (parent repo has MIT + OpenAI/Anthropic Rider) |
| Tech Stack | Rust (parent agent), skill definition (LobeHub YAML/JSON packaging) |
| Maturity | 🟡 Early (v1.0.1, published to LobeHub marketplace) |
| Last Analyzed | 2026-03-14 |

---

## Burak's Notes

> *This is a skill packaged for the LobeHub marketplace that codifies multi-agent orchestration patterns from Emanuel's pi_agent_rust into a reusable module. The interesting thing is not the skill itself but what it represents: orchestration patterns being distributed as marketplace skills. The per-agent git repos with turn-level commits, max-turn limits, and runaway agent termination are all patterns we've independently arrived at. The LobeHub distribution channel is notable — it's one of the first orchestration-focused skills on a public marketplace. Cross-ref with our existing [Pi Agent Rust](../agent-harnesses/pi/pi-agent-rust.md) entry for the parent project and [Agent Flywheel](../agent-harnesses/agent-flywheel.md) for the broader Emanuel ecosystem.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Validates that orchestration patterns are being packaged as distributable skills. The actual techniques (git audit, tmux tracking, turn limits) are patterns we already implement in our L-Thread Orchestrator. |
| **Novelty** | 4/10 | The individual patterns (per-agent git, PID tracking, max-turn limits, runaway detection) are all documented in our existing catalogue entries. The novel aspect is the LobeHub marketplace distribution — orchestration-as-skill is a new packaging model. |
| **Actionable** | 3/10 | Requires LobeHub ecosystem adoption, which is not in our stack. The patterns are already in our architecture. Main actionable insight is studying the skill packaging format for potential future skill marketplace distribution of our own orchestration patterns. |

---

## Overview

The Pi Subagent Orchestration Skill is a marketplace-distributed skill on LobeHub that enables users of pi_agent_rust (Jeff Emanuel's Rust port of Pi Agent) to decompose complex tasks into managed subagents with comprehensive lifecycle and audit management. It packages orchestration best practices into an installable skill module.

The skill provides six core capabilities: (1) per-agent git repositories with turn-level commits for complete audit trails and rollback, (2) process tracking via PIDs and tmux sessions with configurable max-turn limits, (3) Mission Control integration for centralized monitoring and termination of agent fleets, (4) shadow-git extension support for enhanced version control, (5) automated cleanup with predefined commands and resource management, and (6) cost-aware model selection guidance to optimize token spend across subagents.

The primary use cases are multi-agent research, long-running experiments, parallel data collection, reproducible workflows, and cost-sensitive pipelines. The skill emphasizes reducing resource waste, improving reproducibility, and simplifying debugging through monitoring hooks that detect and terminate runaway agents.

---

## Technical Architecture

### Skill Package Structure
```
dicklesworthstone-pi_agent_rust-pi-subagent-orchestration (v1.0.1)
├── Skill definition (LobeHub marketplace format)
├── Orchestration rules (per-agent git, turn limits, cleanup)
├── Mission Control hooks (monitoring, termination)
└── Model selection guidance (cost-aware routing)
```

### Core Lifecycle Pattern
```
Task Decomposition → Subagent Spawn (with git repo + tmux session) →
  Turn-level Commits → Max-turn Guard → Mission Control Monitoring →
    Runaway Detection → Cleanup/Rollback
```

### Integration Points
- **LobeHub Marketplace**: `npx -y @lobehub/market-cli skills install dicklesworthstone-pi_agent_rust-pi-subagent-orchestration`
- **Parent Agent**: pi_agent_rust (Rust CLI)
- **Git**: Per-agent repositories for audit trails
- **tmux**: Session tracking and process management
- **Shadow-git**: Enhanced version control extension

---

## Publisher Background

**Jeff Emanuel** (@doodlestein / @Dicklesworthstone) is the same publisher behind [Pi Agent Rust](../agent-harnesses/pi/pi-agent-rust.md) (574 stars), [Agent Flywheel](../agent-harnesses/agent-flywheel.md) (1,237 stars), and [Beads Viewer](https://github.com/Dicklesworthstone/beads_viewer) (1,365 stars). He's a prolific solo developer with a PE/hedge fund consulting background who has built a comprehensive ecosystem of agent tools. See the existing Pi Agent Rust and Agent Flywheel entries for full publisher assessment.

---

## What's Valuable for Us

1. **Orchestration-as-Skill Distribution Model**: The packaging of multi-agent orchestration patterns as a marketplace skill is a signal that orchestration knowledge is becoming a distributable commodity. If we ever publish our L-Thread patterns to a skill marketplace (OpenSkills, LobeHub, PM Skills), this is a packaging reference.

2. **Per-Agent Git Audit Trail Pattern**: Turn-level commits per subagent create a complete forensic record. We use git in our orchestrator but don't commit per-turn. Worth evaluating whether turn-level granularity would improve our incident investigation (cf. INC-001 through INC-008).

3. **Runaway Agent Detection Hooks**: Automated monitoring that detects and terminates agents exceeding turn limits or exhibiting stuck behavior. Our supervisor mode has similar functionality but Emanuel's packaging as a reusable skill module is cleaner.

4. **Cost-Aware Model Selection**: Guidance for routing subagent tasks to cheaper models when appropriate, echoing our own Sonnet-for-subagents pattern. Validates that cost-aware model routing is becoming a standard orchestration concern.

---

## What's NOT Relevant

1. **LobeHub Ecosystem Lock-in**: Requires the LobeHub marketplace infrastructure, which is not part of our stack and adds a dependency we don't need.

2. **pi_agent_rust Dependency**: The skill is built for Emanuel's Rust Pi Agent, which has the Anthropic-blocking license rider. Same adoption blocker as the parent project.

3. **Patterns Already Implemented**: Per-agent git, tmux tracking, max-turn limits, and runaway detection are all patterns we've independently implemented in our L-Thread Orchestrator. The skill doesn't add new techniques, just packages existing ones.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90)**: No action. Our existing orchestrator already implements these patterns natively.
- **Phase 4 (Days 90+)**: If publishing our orchestration patterns as distributable skills (OpenSkills, PM Skills Marketplace), study this as a packaging reference. The LobeHub marketplace format and installation flow are worth understanding.

---

## Key Takeaway

> **The Pi Subagent Orchestration Skill packages familiar multi-agent patterns (per-agent git, tmux tracking, turn limits, runaway detection) into a LobeHub marketplace module — its main significance is as a signal that orchestration knowledge is becoming a distributable skill commodity, not as a source of new patterns.**
