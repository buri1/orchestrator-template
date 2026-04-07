# Pi Subagent Orchestration Skill on LobeHub

> **Dicklesworthstone — LobeHub Skills Marketplace, 2026**

| Field | Value |
|-------|-------|
| Source | [lobehub.com](https://lobehub.com/bg/skills/dicklesworthstone-pi_agent_rust-pi-subagent-orchestration) |
| Author | Dicklesworthstone |
| Publication | LobeHub Skills Marketplace |
| Date | 2026 (analyzed 2026-03-22) |
| Topics | Pi Agent, subagent orchestration, git audit trails, multi-agent |
| Read Time | ~5 min |

---

## Burak's Notes

> *Dicklesworthstone's pi-subagent-orchestration skill published on LobeHub marketplace. This is the same Pi Agent Rust author — this listing shows their orchestration pattern packaged as a distributable skill. Key features: turn-level git commits, PID tracking, tmux session management, max-turns limits, cost-aware model selection. Very aligned with our architecture. The LobeHub marketplace itself is interesting as a skill distribution channel.*

---

## Key Takeaways

1. **Git-based audit trails at turn level** — Per-agent git repos with commit-per-turn create a complete audit log of agent behavior.
2. **Process management via tmux** — PID tracking and tmux session management with predefined cleanup commands — same pattern as our orchestrator.
3. **Safety controls** — Max-turns limits and resource constraints prevent runaway processes.
4. **Cost-aware model selection** — Built-in guidance for choosing cheaper models for less critical tasks.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Same architecture patterns (tmux, git audit, subagent orchestration) |
| **Actionable** | 5/10 | Patterns already in our system; validates our approach |

---

## Summary

This is the LobeHub marketplace listing for Dicklesworthstone's pi-subagent-orchestration skill from the pi_agent_rust project (485 stars, 53 forks). The skill manages complex multi-agent workflows by decomposing tasks into controlled subagents with safety guardrails.

The skill enforces git-based audit trails with turn-level commits, tracks PIDs and tmux sessions for process management, applies max-turns limits for safety, and includes cost-aware model selection guidance. It's designed for research, experiments, and reproducible pipelines.

The listing on LobeHub's marketplace demonstrates the emerging pattern of distributing agent orchestration capabilities as marketplace skills — similar to how our catalogue tracks skills from OpenAI, VoltAgent, and others.

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| pi_agent_rust | Parent project | Yes — [Pi Agent](../../agent-harnesses/pi/pi-agent.md) |
| pi-subagents | Related Pi extension | Yes — [pi-subagents](../../agent-harnesses/pi/pi-subagents.md) |
| LobeHub | Skill marketplace | No |

---

## Key Takeaway

> **Dicklesworthstone's subagent orchestration skill on LobeHub validates our tmux+git audit+max-turns architecture pattern — the marketplace distribution model is an interesting discovery.**
