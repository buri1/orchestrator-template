# HumanLayer (CodeLayer)

> **The best way to get AI coding agents to solve hard problems in complex codebases.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer) |
| GitHub Stars | 9,726 (as of 2026-03-08) |
| Publisher | HumanLayer Inc. (startup, YC X25) — Dex Horthy (James) + team |
| License | Apache-2.0 |
| Tech Stack | TypeScript, Claude Code (built on top), worktrees, cloud workers |
| Maturity | 🟡 Early (waitlist / early access, rapidly shipping) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> Dex's CRISPY talk was 9/10 relevance — the instruction budget ceiling (~150-200) and design discussion as leverage are directly applicable to our orchestrator prompt design. HumanLayer is the productized version of that thinking. The "12 Factor Agents" paper (18.6K stars) essentially coined "context engineering" and pre-dates most of the field's vocabulary. The Agent Control Plane (ACP) is a separate Kubernetes-based orchestrator that shows they're thinking beyond IDE into cloud-native agent scheduling. Watch closely — if CodeLayer ships what the CRISPY talk describes, it could be the most opinionated and battle-tested coding agent IDE on the market.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | CodeLayer is building the productized version of patterns we implement manually — CRISPY phased pipelines, worktree isolation, multi-claude parallelism. The instruction budget research and context engineering principles directly inform our orchestrator prompt design. ACP's Kubernetes-based agent scheduling is a Phase 3+ cloud deployment reference. |
| **Novelty** | 7/10 | The CRISPY pipeline (7-phase evolution from RPI) and instruction budget ceiling (~150-200) are genuinely new insights not replicated elsewhere in our catalogue. The "design discussion as highest-ROI review point" concept is original. The 12 Factor Agents framework pre-dates and influences much of the field's thinking. |
| **Actionable** | 8/10 | Three immediately adoptable patterns: (1) audit our orchestrator prompts against the 150-200 instruction ceiling, (2) add a "design discussion" phase before plan generation, (3) enforce vertical (thin-slice) planning over horizontal. The ACP Kubernetes patterns are Phase 3+ reference material. |

---

## Overview

HumanLayer is a YC X25-backed company building CodeLayer, an open-source IDE for orchestrating AI coding agents. Built on top of Claude Code, it positions itself as "Superhuman for Claude Code" — keyboard-first workflows with advanced context engineering, multi-Claude parallel sessions (worktrees + remote cloud workers), and battle-tested workflows for complex brownfield codebases.

The company's core intellectual contribution is the CRISPY pipeline, an evolution of the widely-adopted Research-Plan-Implement (RPI) methodology. After deploying RPI to thousands of engineers at companies from small startups to Fortune 500s, they identified three systemic failures: research contamination from premature opinion injection, monolithic prompts exceeding the ~150-200 instruction budget ceiling for frontier LLMs, and plan-code divergence making plan review a false economy. CRISPY splits the monolithic workflow into 7 focused phases (Questions, Research, Design, Structure, Plan, Worktree, Implement, PR), each staying under 40 instructions, connected by deterministic control flow rather than LLM routing.

HumanLayer's broader ecosystem includes: the "12 Factor Agents" paper (18.6K stars, coined the term "context engineering" in April 2025), the Agent Control Plane (ACP, 348 stars, Kubernetes-native agent orchestrator with full MCP support), an "Advanced Context Engineering" guide (1.5K stars), and the "AI That Works" weekly podcast. The company also ships a Riptide RPI plugin for Linear ticket integration.

---

## Technical Architecture

### CodeLayer IDE

- **Foundation**: Built on Claude Code, extending it with orchestration capabilities
- **Multi-Claude**: Parallel Claude Code sessions with worktree isolation and remote cloud worker support
- **Keyboard-first**: Superhuman-style keyboard shortcuts for speed and control
- **Workflow engine**: CRISPY pipeline phases as first-class primitives

### CRISPY Pipeline (7 Phases)

```
Questions → Research → Design → Structure → Plan → Worktree → Implement → PR
   (<40)      (<40)     (<40)     (<40)      (<40)    (<40)      (<40)    (<40)
                                                              [instruction count per phase]
```

Key design decisions:
- **Deterministic context isolation**: Ticket text is hidden from the Research phase context window to prevent opinion contamination
- **Design discussion artifact**: ~200-line document capturing resolved decisions, patterns, and open questions — the highest-leverage human review point
- **Vertical planning**: Thin end-to-end slices (mock API → wire frontend → mock services → DB migration → integration) instead of horizontal layer-by-layer

### Agent Control Plane (ACP)

- **Runtime**: Kubernetes-native (CRDs: LLM, Agent, Task, ToolCall)
- **Language**: Go
- **Design**: Long-lived outer-loop agents with async tool calls
- **MCP**: Full MCP server support as tools
- **Agent composition**: Sub-agent delegation, human approval/tools as first-class
- **State model**: Task = Agent + User Message + Current context window

### 12 Factor Agents Framework

The 12 factors that underpin their philosophy:
1. Natural language to tool calls
2. Own your prompts
3. Own your context window (coined "context engineering")
4. Tools are just structured outputs
5. Unify execution state and business state
6. Launch/pause/resume with simple APIs
7. Contact humans with tool calls
8. Own your control flow
9. Compact errors into context window
10. Small, focused agents
11. Trigger from anywhere
12. Make your agent a stateless reducer

### GitHub Ecosystem

| Repo | Stars | Language | Purpose |
|------|-------|----------|---------|
| humanlayer/humanlayer | 9,726 | TypeScript | CodeLayer IDE (main product) |
| humanlayer/12-factor-agents | 18,595 | TypeScript | Agent design principles paper |
| humanlayer/advanced-context-engineering | 1,525 | — | Context engineering guide |
| humanlayer/agentcontrolplane | 348 | Go | Kubernetes agent orchestrator |
| humanlayer/riptide-rpi | 7 | — | Linear + RPI plugin |
| humanlayer/claudelayer | 13 | TypeScript | Sub-agent recursion with Claude Code |
| humanlayer/mcp-cli | 4 | — | Turn MCP servers into CLIs |

---

## Publisher Background

**Dex Horthy (James)** is the co-founder and primary public face. He has been building in the AI agent space since at least 2024 (the humanlayer repo was created August 2024). He authored the "12 Factor Agents" paper which became one of the most influential agent engineering references (18.6K stars), and is credited with coining the term "context engineering" in April 2025 — a term now used universally across the field. He hosts the "AI That Works" podcast with @hellovai and publishes "The Outer Loop" substack.

**Company**: HumanLayer Inc., YC X25 batch. The YC backing signals legitimate startup trajectory with funding. Active Discord community. The company originally built a human-in-the-loop SDK for AI agents (the "legacy" HumanLayer SDK), then pivoted to CodeLayer as the coding agent IDE space exploded.

**Credibility**: Very high. The 12 Factor Agents paper alone has more stars (18.6K) than most production tools in our catalogue. The CRISPY methodology is derived from deploying RPI to thousands of real engineers and doing honest post-mortems on what failed. Dex's conference talks are unusually candid ("I was wrong" about not reading code, critical of agent swarms including Gas Town).

---

## What's Valuable for Us

### 1. Instruction Budget Ceiling (~150-200)
The most immediately actionable insight. Our orchestrator agent prompts, CLAUDE.md, MCP tool definitions, and workflow instructions combined likely exceed this ceiling. **Action**: Audit all prompts, count instructions, split any exceeding 150 into focused phases with deterministic handoff. This directly implements Master Blueprint Principle #2 (deterministic orchestration, LLM execution) — use control flow for control flow, not prompts.

### 2. Design Discussion as Leverage Point
A ~200-line artifact before plan generation that captures: where we're going, patterns to follow, resolved decisions, open questions. This is "brain surgery on the agent" before it writes 1000+ lines. Maps directly to Master Blueprint Principle #5 (human review is the binding constraint) — reviewing 200 lines of design is 5x more leveraged than reviewing 1000 lines of plan or code.

### 3. Vertical Planning Over Horizontal
Enforce thin end-to-end slices (mock → wire → integrate → test) instead of layer-by-layer (all DB, then all services, then all API, then all frontend). Catches errors at each vertical checkpoint instead of discovering at line 1200 that the foundation is wrong.

### 4. Context Isolation Pattern
Deterministically hiding the ticket from the research phase context window prevents the model from confirming the developer's approach instead of genuinely researching alternatives. Implementable today by structuring our agent spawning to pass only codebase queries (not task descriptions) to research-phase agents.

### 5. 12 Factor Agent Principles
Factors 5 (unify execution/business state), 8 (own your control flow), 10 (small focused agents), and 12 (stateless reducer) directly validate and sharpen our Master Blueprint patterns. Factor 8's "don't use prompts for control flow if you can use control flow for control flow" is the perfect articulation of our Principle #2.

### 6. ACP as Phase 3+ Cloud Reference
When we need to move beyond tmux to cloud-native agent scheduling, ACP's Kubernetes CRD model (LLM → Agent → Task → ToolCall) is a clean reference architecture. The "humans as tools" abstraction is particularly elegant.

---

## What's NOT Relevant

### CodeLayer IDE as Replacement
We're building an orchestrator, not adopting someone else's IDE. CodeLayer is built on Claude Code which we already use directly. The value is in stealing their patterns (CRISPY phases, context engineering), not switching to their product. This aligns with Master Blueprint Principle #7 (build only what you've needed in the last 30 days) — we need the patterns, not the wrapping.

### Agent Control Plane (for now)
ACP requires Kubernetes, which conflicts with our current zero-infra tmux-based approach. It's designed for cloud-native deployments which we don't need until Phase 3 (Day 60-90). The Go language also conflicts with our TypeScript-native stack preference.

### Legacy HumanLayer SDK
The original human-in-the-loop Python SDK is effectively deprecated in favor of CodeLayer. Not relevant to our architecture.

### Waitlist/Early Access Status
CodeLayer is still in early access / waitlist mode. We can't adopt it even if we wanted to. The ideas are more valuable than the product at this stage.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Audit orchestrator prompts against 150-200 instruction ceiling. Add design discussion phase to agent task decomposition. Enforce vertical planning in templates.
- **Phase 2 (Days 4-60)**: Implement CRISPY-inspired phased pipeline with deterministic handoffs between question/research/design/plan/implement phases. Adopt context isolation pattern for research agents.
- **Phase 3 (Days 60-90)**: Evaluate ACP's Kubernetes CRD model as reference for cloud-native agent scheduling. Study CodeLayer's multi-Claude / cloud worker architecture for scaling beyond single-machine tmux.
- **Phase 4 (Days 90+)**: If CodeLayer ships and matures, evaluate as potential replacement for custom orchestrator UI layer. Monitor whether their team-scale features (mentioned on website) solve problems we'll face at that stage.

---

## Key Takeaway

> **HumanLayer is the most credible voice in coding agent methodology (12 Factor Agents coined "context engineering", CRISPY is the battle-tested evolution of RPI), and their instruction budget ceiling (~150-200) and design discussion leverage point are immediately adoptable patterns that sharpen our orchestrator architecture — but steal the ideas, don't adopt the IDE.**
