# Open Models, Open Runtime, Open Harness — Building Your Own AI Agent with LangChain and NVIDIA

> **Harrison Chase (LangChain) — LangChain YouTube / GTC 2026, 2026-03-16**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=BEYEWw1Mkmw) |
| Speaker | Harrison Chase (CEO/co-founder, LangChain) |
| Event | LangChain + NVIDIA GTC 2026 Launch |
| Duration | ~20 min |
| Date | 2026-03-16 |
| Topics | agent harness, open models, agent runtime, OpenShell, DeepAgents, Nemotron, context engineering, harness engineering, open-source agents |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Every AI agent = Model + Runtime + Harness** — Chase presents a clean three-layer decomposition applicable to Claude Code, OpenClaw, Manus, and any general-purpose agent. The model provides intelligence, the runtime provides a safe execution environment, and the harness is "everything around the model" that makes intelligence useful. This is the most concise agent architecture taxonomy in the catalogue.

2. **"Harness engineering" is the new discipline** — Chase argues that when people are impressed by a polished AI agent, they are responding to the harness (system prompts, tools, middleware, skills, sub-agents, memory, context management), not just model quality. He proved this empirically: improving only the DeepAgents harness (no model changes) moved their coding agent from 52.8% to 66.5% on Terminal Bench 2.0, jumping from Top 30 to Top 5.

3. **Open-source stack for the full three layers now exists** — The talk introduces a fully open alternative to proprietary agents: Nemotron 3 Super (open model), NVIDIA OpenShell (open runtime with sandbox + policy engine + privacy router), and LangChain DeepAgents (open harness with planning, sub-agents, compaction, memory). All Apache-2.0 or MIT licensed.

4. **OpenShell solves the autonomy-capability-safety trilemma** — Traditional approaches only achieve two of three (safe+autonomous = limited capability; capable+safe = requires constant approval; capable+autonomous = unguarded). OpenShell's out-of-process policy enforcement creates a fourth option: full autonomy within externally-enforced boundaries that the agent cannot override.

5. **Context management is the harness's most critical job** — DeepAgents implements a three-tier compression strategy: (1) offload large tool results to filesystem at 20K+ tokens, (2) offload large tool inputs at 85% context threshold, (3) full summarization as last resort. Autonomous compression lets the model trigger compaction at clean task boundaries rather than hard token thresholds.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | The three-layer decomposition (model/runtime/harness) is the cleanest conceptual framework for understanding our own architecture. Our system maps directly: Claude Opus = model, tmux+worktree = runtime, orchestrator prompts + CLAUDE.md = harness. OpenShell's sandbox pattern is the right long-term direction for replacing `--dangerously-skip-permissions`. DeepAgents validates our context management approach. |
| **Actionable** | 6/10 | The harness engineering methodology (system prompt phases, middleware hooks, reasoning budget allocation, trace-based iterative improvement) is immediately applicable. OpenShell is too immature for our stack today. Nemotron models are irrelevant given Claude Max flat-rate economics. The "reasoning sandwich" pattern (extended thinking for planning and verification, standard for implementation) is a concrete optimization we can adopt. |

---

## Summary

Harrison Chase presents the thesis that all AI agents — Claude Code, OpenClaw, Manus, Codex — share an identical three-layer architecture: a model, a runtime (execution environment), and a harness (everything else). The talk then demonstrates how each layer can be replaced with an open-source alternative, forming a fully open agent stack.

The **model layer** uses NVIDIA's Nemotron 3 Super, a hybrid Mamba-Transformer MoE architecture delivering up to 3x higher throughput than comparable dense models with native 1M token context windows. Three tiers exist: Nano (30B/3B active), Super (~100B/10B active), and Ultra (~500B/50B active). These are positioning as economically viable research workers — frontier models orchestrate while Nemotron handles the heavy lifting, reportedly cutting costs 50%+.

The **runtime layer** is NVIDIA OpenShell, an open-source (Apache 2.0) secure sandbox that wraps any agent (Claude Code, Codex, OpenClaw) with out-of-process policy enforcement. Its three components — Sandbox (purpose-built for long-running self-evolving agents), Policy Engine (evaluates every action at binary/destination/method/path levels), and Privacy Router (keeps sensitive context on-device using local models, routes to frontier models only when policy permits) — create an enforcement layer external to the agent process itself. Policies are declarative YAML, hot-reloadable, and deny-by-default.

The **harness layer** is LangChain's DeepAgents, an opinionated, batteries-included agent harness built on LangGraph. It provides file system tools modeled on Claude Code, a planning tool (write_todos), sub-agent spawning with complete context isolation, a seven-layer middleware stack (TodoList, Memory, Skills, Filesystem, SubAgent, Summarization, HITL), and a pluggable backend protocol that decouples file operations from storage (real FS, database-backed virtual FS, or remote sandbox). The harness engineering blog demonstrates the methodology: structured system prompts across four phases (Plan, Build, Verify, Fix), middleware hooks (PreCompletionChecklist, LocalContext, LoopDetection), and a "reasoning sandwich" that allocates extended thinking to planning and verification phases.

The partnership between LangChain and NVIDIA was formalized at GTC 2026, with LangChain joining the Nemotron Coalition alongside Mistral AI, Perplexity, Cursor, Reflection AI, and others. Jensen Huang stated: "Claude Code and OpenClaw have sparked the agent inflection point — extending AI beyond generation and reasoning into action."

---

## Notable Quotes

> "Harness engineering is everything around the model." — Harrison Chase

> "A raw model is not an agent. But it becomes one when a harness gives it things like state, tool execution, feedback loops, and enforceable constraints." — LangChain blog

> "Claude Code and OpenClaw have sparked the agent inflection point — extending AI beyond generation and reasoning into action." — Jensen Huang

> "The more that agents know about their environment, constraints, and evaluation criteria, the better they can autonomously self-direct their work." — LangChain harness engineering blog

> "Claude Code's system prompt is nearly 2,000 lines long. It's how you communicate the developer's intent." — Harrison Chase

---

## Comparison with Pi Agent Framework

The talk's three-layer decomposition invites direct comparison with Pi (Mario Zechner's agent framework that powers OpenClaw). The two systems represent philosophically opposite approaches to the same problem.

### Architecture: Maximalism vs. Minimalism

| Dimension | DeepAgents (LangChain) | Pi Agent (Zechner) |
|-----------|----------------------|-------------------|
| System prompt | ~2,000+ lines (Claude Code-style) | ~200 tokens |
| Core tools | 7+ (read, write, edit, ls, glob, grep, execute) + planning + sub-agents | 4 (read, write, edit, bash) |
| Middleware | 9-layer stack (compiled LangGraph state machine) | 25+ lifecycle events, in-process extensions |
| Context management | Three-tier compression (offload, truncate, summarize) | Compaction via `context` event (rewrite messages before LLM sees them) |
| Sub-agents | Built-in SubAgentMiddleware with state isolation | Via extensions (pi-side-agents, pi-agent-teams) |
| Framework dependency | Deep (LangChain + LangGraph + LangSmith) | Zero (pure TypeScript, no frameworks) |
| Model support | Any LangChain ChatModel | 324+ models via pi-ai abstraction |
| Stars | 16.1K | 3.17M monthly npm downloads (via OpenClaw) |

### Philosophy: Batteries-Included vs. Composable Primitives

DeepAgents is an "opinionated, ready-to-run agent out of the box" — you get planning, memory, sub-agents, skills, compaction, and HITL without configuration. The tradeoff is framework lock-in: everything flows through LangChain's abstractions, LangGraph's state machine, and LangSmith's tracing.

Pi takes the opposite bet: a minimal core with maximum extensibility. The ~200-token system prompt trusts the model more. Extensions compose via CLI flags, not compiled middleware stacks. The `context` event (rewriting messages before the LLM sees them) is more powerful than LangChain's middleware — it operates at the message level, not the tool level.

### Context Management: The Critical Comparison

Both systems recognize context management as the harness's most critical job, but solve it differently:

- **DeepAgents**: Three-tier automated compression. Large tool outputs (>20K tokens) are offloaded to filesystem with a 10-line preview. At 85% context, older tool inputs are replaced with filesystem pointers. When offloading is insufficient, full summarization preserves structured summaries in-context and originals on disk. New: autonomous compression lets the model choose when to compact at clean task boundaries.

- **Pi**: Compaction via the `context` event fires extensions that can rewrite the entire message history before the LLM sees it. This is more surgical — extensions can selectively compress, rewrite, or drop specific messages based on domain knowledge. Pi's MCP adapter (pi-mcp-adapter) achieves 50-100x token reduction by proxying all MCP tools through a single tool definition. No automated threshold — the agent or extension decides.

**Our orchestrator's approach** (tmux + worktree + CLAUDE.md + orchestrator-handoff.sh pre-compact hook) is closer to Pi's philosophy: minimal infrastructure, trust the model, intervene only at transition points. DeepAgents' three-tier compression is more sophisticated but requires the LangGraph runtime. The autonomous compression feature (model triggers compaction at task boundaries) is the most interesting idea from either system — it could be adapted as a Claude Code skill or hook.

### Runtime: OpenShell vs. tmux

The talk positions OpenShell as the universal agent runtime. Compared to our tmux-based isolation:

| | OpenShell | Our tmux + worktree |
|---|---|---|
| Isolation | Kernel-level sandbox (K3s/Docker) | Process-level (tmux windows) + filesystem (git worktree) |
| Policy enforcement | Declarative YAML, deny-by-default, hot-reload | None (`--dangerously-skip-permissions`) |
| Privacy routing | Built-in (local vs. cloud model routing) | N/A (Claude Max only) |
| Overhead | 4 vCPU, 8 GB RAM, 20 GB disk per sandbox | ~50 MB per tmux window |
| Maturity | Alpha (single-player) | Battle-tested in production |

OpenShell is architecturally correct but operationally heavy. Our tmux approach sacrifices security for simplicity and speed — the right tradeoff at our scale today, but OpenShell is the long-term direction when we need to run untrusted agent code.

### Verdict

Pi and our orchestrator sit on the "minimal infrastructure, trust the model" end of the spectrum. DeepAgents sits on the "batteries-included, framework-managed" end. The talk validates that both approaches produce working agents — the difference is in deployment context. DeepAgents + OpenShell is built for enterprises with compliance requirements and multi-user deployment. Pi + tmux is built for solo/small-team builders who prioritize velocity and token efficiency. Neither is wrong; they optimize for different constraints.

The most transferable idea from this talk is the **reasoning sandwich** pattern (extended thinking for planning + verification, standard for implementation). This is model-agnostic, framework-agnostic, and immediately applicable to our Claude Code workers via system prompt changes.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://blog.langchain.com/improving-deep-agents-with-harness-engineering/ | Empirical harness engineering methodology: 52.8% -> 66.5% on Terminal Bench 2.0 | `/ingest-article` |
| https://blog.langchain.com/autonomous-context-compression/ | Model-triggered compaction at task boundaries — most interesting context management idea | `/ingest-article` |
| https://blog.langchain.com/context-management-for-deepagents/ | Three-tier compression strategy technical details | `/ingest-article` |
| https://github.com/NVIDIA/OpenShell | Open-source agent sandbox runtime | Already catalogued: [nvidia-nemoclaw.md](../infrastructure/nvidia-nemoclaw.md) |
| https://blog.langchain.com/the-anatomy-of-an-agent-harness/ | Framework vs. runtime vs. harness taxonomy | `/ingest-article` |
| https://sequoiacap.com/podcast/context-engineering-our-way-to-long-horizon-agents-langchains-harrison-chase/ | Sequoia podcast with Harrison Chase on context engineering for long-horizon agents | `/ingest-talk` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| DeepAgents (LangChain) | The "open harness" layer; batteries-included agent harness | [Yes](../agent-harnesses/deep-agents.md) |
| NVIDIA OpenShell | The "open runtime" layer; sandbox + policy engine + privacy router | [Yes](../infrastructure/nvidia-nemoclaw.md) |
| NVIDIA Nemotron 3 | The "open model" layer; hybrid Mamba-Transformer MoE | No (model, not tool) |
| LangGraph | Runtime for stateful multi-agent orchestration beneath DeepAgents | [Yes](../orchestration-platforms/langgraph.md) |
| LangSmith | Observability platform; 15B+ traces, Insights Agent for pattern detection | No (SaaS platform) |
| NVIDIA AI-Q | Enterprise deep research blueprint; #1 on DeepResearch Bench | No |
| NVIDIA NIM | GPU-optimized microservices for model deployment; 2.6x throughput | No |
| NVIDIA Dynamo | Production-ready inference optimization | No |
| Claude Code | Referenced as primary inspiration for DeepAgents' architecture | [Yes](../agent-harnesses/claude-agent-sdk.md) |
| OpenClaw | Referenced by Jensen Huang as "sparking the agent inflection point" | [Yes](../orchestration-platforms/openclaw.md) |
| Manus AI | Referenced as agent sharing the three-layer architecture | [Yes](../agent-harnesses/manus-ai.md) |
| Arcade.dev | Tool runtime for delegated agent auth (from companion talk) | [Yes](../infrastructure/arcade-dev.md) |
| Nemotron Coalition | NVIDIA + Mistral + LangChain + Perplexity + Cursor + others | No (consortium, not tool) |
| Harbor | LangChain's hosted deployment platform for DeepAgents | No |
| Daytona | Sandbox backend for DeepAgents remote execution | No |

---

## Action Items

- [ ] Implement "reasoning sandwich" pattern: extended thinking for planning + verification, standard for implementation — test on Claude Code workers via system prompt
- [ ] Evaluate autonomous context compression concept: let Claude Code trigger compaction at clean task boundaries via a custom skill/hook
- [ ] Monitor DeepAgents harness engineering blog for transferable middleware patterns (LoopDetection, PreCompletionChecklist)
- [ ] Track OpenShell maturity — evaluate for Phase 3 when multi-sandbox support ships
- [ ] Read the Sequoia podcast with Harrison Chase on context engineering for long-horizon agents
