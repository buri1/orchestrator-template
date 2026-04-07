# Build vs. Buy Orchestration Strategy

> **When to build a custom agent orchestrator vs. use an existing framework -- with Gas Town, L-Thread, OpenClaw, and Paperclip as case studies, and the "harness over framework" thesis as the 2026 industry consensus.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_build-vs-buy-orchestration-analysis.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The agent orchestration landscape in early 2026 has stratified into three tiers: monolithic frameworks (LangGraph, CrewAI, AutoGen), lightweight harnesses (Pi Agent, Inngest AgentKit, OpenAI Agents SDK), and fully custom systems (Gas Town, L-Thread, Paperclip). The defining intellectual shift of 2026 is the move from "agent frameworks" to "agent harnesses" -- infrastructure that wraps around an AI model to manage long-running tasks, rather than dictating how the agent is built. This philosophy, validated by Anthropic, OpenAI, and Martin Fowler, centers on progressive deletability: every piece of harness logic should be removable when the model no longer needs it.

Four case studies span the full spectrum. Gas Town (Steve Yegge, 189K LOC Go) represents maximum custom investment with 20-30 parallel agents, hierarchical roles, and MEOW workflows, costing $2K-$5K/month in API costs. L-Thread Orchestrator represents the opposite extreme: zero framework code, pure prompt engineering encoded in markdown files, constrained only by the host tool's capabilities. OpenClaw uses Pi Agent SDK as a minimal foundation (~1,000 token system prompt) with custom code handling orchestration. Paperclip operates at the management plane level -- org charts, budgets, task ownership -- while being deliberately unopinionated about agent runtimes.

The industry consensus: start with the least abstraction that solves your problem. The hybrid approach (minimal harness/SDK for the agent loop + custom orchestration logic) is the most pragmatic path. Sixty percent of deployed "agent systems" are single-LLM-call applications that need no orchestration framework at all. Gartner predicts 40%+ of agentic AI projects will be canceled by end of 2027 due to escalating costs, unclear value, or inadequate risk controls -- applying equally to custom and framework approaches.

---

## Key Findings

### The Harness Over Framework Philosophy

The 2026 consensus, articulated by Philipp Schmid, Martin Fowler, and Inngest's Dan Farrelly: a framework dictates how your agent is built; a harness governs how your agent operates. Every agent framework rebuilds the same infrastructure from scratch (retry logic, state persistence, job queues, event routing) when durable, event-driven infrastructure already solves these problems. The correct level of abstraction is wrapping agents in existing infrastructure, not building yet another framework.

**Progressive deletability** is the core design principle: every piece of harness logic should be removable when the model outgrows it. As models improve, capabilities that required complex pipelines become single context-window prompts. If your infrastructure gets more complicated as models improve, you are over-engineering.

### Case Studies

**Gas Town (Full Custom)**
- 189K LOC Go, 7 agent roles (Mayor, Polecats, Refinery, Witness, Deacon, Dogs, Crew)
- MEOW workflow stack for persistent, composable, crash-recoverable orchestration
- $2K-$5K/month API costs; $100 per 60-minute session in Claude tokens
- 100% vibecoded (Yegge has never read the code)
- Proves: custom orchestration achieves what no framework supports. Costs: constant maintenance, high spend

**L-Thread Orchestrator (Pure Prompt Engineering)**
- Zero lines of framework code; entire system encoded in markdown files
- State management via JSON files, agent lifecycle via tmux/pane-splitting/Task tool
- Proves: meaningful multi-agent orchestration is possible with zero framework dependencies
- Constrained by host tool capabilities; debugging means debugging prompt behavior

**OpenClaw + Pi Agent (Hybrid)**
- Pi Agent SDK: minimal foundation (~1,000 token system prompt, 4 base tools)
- ~700 lines of code per complex extension
- Lobster workflow engine: deterministic multi-agent pipelines (LLMs for creative work, YAML for plumbing)

**Paperclip (Management Plane)**
- Orchestration layer for "zero-human companies" -- org charts, budgets, task ownership
- Deliberately unopinionated about agent runtimes (Claude Code, OpenClaw, Python, shell, HTTP)
- Atomic task checkout and budget enforcement prevent double-work and runaway spend
- Agents resume same task context across heartbeats

### Framework Landscape (2026)

| Framework | Best For | Lock-in Risk |
|-----------|----------|-------------|
| LangGraph (v1.0+) | Stateful graph workflows | Medium (LangChain ecosystem) |
| CrewAI | Role-based agent teams | Low (open source) |
| OpenAI Agents SDK | Lightweight handoff chains | High (OpenAI-only) |
| AutoGen | Conversational collaboration | Low (open source) |
| Amazon Bedrock AgentCore | AWS-native deployments | High (AWS lock-in) |

### The Abstraction Tax

- LangChain adds ~450 tokens per request for internal context management
- CrewAI with 5 agents costs 5x a single-agent approach per task
- 60% of "AI agent" deployments are single-LLM-call applications that need no framework
- Auto-scaling frameworks generate surprise bills ($200/day reported)
- Learning curve for LangGraph demands significant upfront investment before productivity

### The Hybrid Approach

The most pragmatic path: use a minimal harness or SDK for the agent loop, build custom orchestration logic on top, steal architectural patterns from frameworks without adopting them. The SitePoint "Orchestration Wars" comparison built the same pipeline three ways -- the custom approach required ~60 lines of coordination code with no npm dependencies beyond the LLM SDK.

**Patterns worth stealing (without adopting the framework):**
- From LangGraph: state machines with checkpointing, reducers for concurrent updates, interrupt nodes
- From CrewAI: role-based decomposition, task delegation with ownership
- From AutoGen: conversational collaboration, dynamic role-playing
- From Anthropic: two-agent harness (initializer + worker), progress files, test gates

---

## Actionable Insights

1. **Start with the least abstraction.** If a single agent with tool calling solves the problem, skip the entire framework question. Sixty percent of deployed systems are over-architectured.

2. **Design for progressive deletability.** Every piece of infrastructure should be removable when the model outgrows it. If the harness gets more complex as models improve, the architecture is wrong.

3. **Steal patterns, not code.** LangGraph's checkpointing, CrewAI's role decomposition, and Anthropic's two-agent harness are all implementable without framework dependencies -- as JSON state files, prompts, and structured message passing.

4. **The hybrid path is optimal for solo/small teams.** Use a minimal SDK (Pi Agent, OpenAI Agents SDK) for the agent loop; build custom orchestration for everything above it. This is what OpenClaw and L-Thread both chose.

5. **Management plane and agent runtime are separate concerns.** Paperclip proves you can orchestrate agents without dictating their implementation. Decouple task assignment, budget enforcement, and lifecycle management from how agents actually execute.

6. **Frameworks for speed, custom for control.** CrewAI gets a demo in days; custom gets maximum flexibility in months. Match the approach to your time horizon: under 6 months use a framework, 6-18 months go hybrid, over 18 months consider custom.

7. **Gartner's 40% cancellation rate applies to all approaches.** Custom fails from scope creep and maintenance burden; frameworks fail from abstraction mismatch and cost surprises. The failure mode differs but the probability is comparable.

---

## Decision Matrix

| If you are... | Do this | Because... |
|---------------|---------|-----------|
| Validating a concept | CrewAI or OpenAI Agents SDK | Days to demo, not weeks |
| Building enterprise workflows | LangGraph + LangSmith | Proven at LinkedIn, Uber, Replit |
| Building a personal dev tool | Hybrid (Pi/SDK + custom) | Maximum flexibility, minimal overhead |
| Exploring novel patterns | Full custom | Frameworks constrain frontier work |
| Not sure what you need | Single agent + tools | Earn your complexity incrementally |
| Running autonomous operations | Paperclip-style management plane | Decouple orchestration from agent runtime |
| Need zero dependencies | L-Thread style prompt engineering | Pure prompts, zero framework code |

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [orchestration-platforms/openclaw](../orchestration-platforms/openclaw.md) | OpenClaw + Pi Agent as hybrid case study; Lobster workflow engine |
| [orchestration-platforms/paperclip](../orchestration-platforms/paperclip.md) | Paperclip as management-plane-only orchestration case study |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town as full-custom extreme (189K LOC, $2-5K/month API) |
| [reference/harness-comparison-matrix](harness-comparison-matrix.md) | Detailed scoring of 10 harnesses across 20 dimensions |
| [reference/scaling-economics](scaling-economics.md) | Cost curves that inform build-vs-buy economics at different agent counts |
| [agent-harnesses/pi-agent](../agent-harnesses/pi-agent.md) | Pi Agent SDK as minimal foundation for hybrid approach |

---

*Source: research/2026-03-05_build-vs-buy-orchestration-analysis.md*
