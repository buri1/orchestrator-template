# Multi-Agent Orchestration: Three-Way Comparison

> **Deep architectural comparison of Gas Town (Yegge), L-Thread Orchestrator, and Pi Agent (indydevdan) -- three independently built systems that converged on the same five universal laws of multi-agent orchestration.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `2026-03-05_multi-agent-orchestration-three-way-comparison.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

This document compares three independently developed multi-agent orchestration systems across architecture, communication, state, error recovery, scalability, and philosophy. Steve Yegge's Gas Town is a factory (20-30 agents, 189K-line Go binary, Git+Dolt backed). The L-Thread Orchestrator is a workshop (2-5 agents, pure prompt engineering, zero custom code). Dan Disler's Pi Agent system is a toolkit (N agents, composable extensions, model-agnostic dispatch).

The central finding is convergence: all three systems, built by people who were not reading each other's code, arrived at the same five structural laws. This suggests these are not preferences but requirements of multi-agent orchestration. The comparison reveals that each system optimizes for a different constraint (throughput, reliability, composability), but all three are converging on the same architecture from radically different starting points.

---

## Key Findings

### System Comparison Matrix

| Dimension | Gas Town (Yegge) | L-Thread Orchestrator | Pi Agent (indydevdan) |
|-----------|------------------|----------------------|----------------------|
| **Scale** | 20-30 agents (factory) | 2-5 agents (workshop) | N agents (extensible) |
| **Codebase** | 189K lines Go | 0 lines (pure prompts) | ~2K lines (extensions) |
| **Model lock-in** | Multi-runtime | Claude Code only | Any model per agent |
| **Philosophy** | Throughput > precision | Reliability > speed | Composability > both |
| **Metaphor** | Mad Max colony | Symphony conductor | UNIX pipeline |
| **Cost** | $2-5K/month | Subscription only | Model-dependent |
| **State** | Git-backed JSONL + Dolt DB | JSON files + tmux persistence | pi.appendEntry() + session JSONL |
| **Communication** | Git commits as messages | tmux send-keys + file inboxes | Pi messenger + file-based |
| **Error handling** | Auto-retry with exponential backoff | FutureLearnings incident DB | Model escalation + fallback |

### The Five Universal Laws

All three systems independently discovered these:

**Law 1: The Orchestrator Must Never Write Code.** Gas Town: Mayor role constraint. L-Thread: "DU BIST KEIN ENTWICKLER." Pi Agent: Dispatcher pattern. Why universal: an orchestrator that writes code loses objective evaluation ability and the meta-cognitive distance to manage workflow.

**Law 2: State Must Persist Across Crashes.** Gas Town: Git-backed JSONL Beads + Dolt. L-Thread: JSON state files + tmux + SessionStart re-injection. Pi Agent: `pi.appendEntry()` + session JSONL. Why universal: crashes are not edge cases in multi-agent systems -- they are the normal operating condition.

**Law 3: Quality Must Be Gated, Not Suggested.** Gas Town: Automated CI/test suite. L-Thread: E2E testing via Chrome DevTools MCP (INC-014, INC-015). Pi Agent: Review chains with explicit pass/fail. Why universal: LLMs will confidently claim a task is "done" even when it is broken. Every successful system learned to verify independently.

**Law 4: Agent Communication Must Be Structured.** Gas Town: Git commits with structured metadata. L-Thread: JSON state files with typed fields. Pi Agent: Typed messages via pi-messenger. Why universal: unstructured natural language between agents compounds ambiguity at each hop.

**Law 5: The Orchestrator Must Know When to Stop.** Gas Town: Time and cost budgets with hard cutoffs. L-Thread: Bounded review loops (max 3 cycles) + AUTO-MODE skip-and-continue. Pi Agent: Chain completion semantics with explicit termination. Why universal: without explicit bounds, agents loop forever.

### Architecture Deep Dive

**Gas Town (Yegge):**
- 189K lines of Go, production since late 2024
- Git as message bus -- agent work products are commits, orchestrator reads git log
- Dolt (git-like SQL database) for structured state
- "Colony" architecture scaling toward federated multi-machine deployment
- "The Factory Floor" metaphor: agents as specialized machines, orchestrator as factory manager
- $2-5K/month API costs at full scale

**L-Thread Orchestrator:**
- Zero lines of custom code -- pure prompt engineering on Claude Code
- 4 Absolute Rules enforced via system prompt
- State via `_bmad/orchestrator-state.json` flat files
- tmux for agent lifecycle and crash recovery
- Chrome DevTools MCP for E2E quality gate
- FutureLearnings incident database for institutional memory
- Claude Max subscription only -- no per-API-call costs

**Pi Agent (indydevdan):**
- ~2K lines of TypeScript extensions
- YAML frontmatter agent definitions with per-agent model selection
- Chain orchestration via .chain.md files
- Model routing: different models for different agent roles
- Extension composability: swap any layer independently
- "Build agents that build agents" meta-capability

### Convergence Points

Despite different starting points, all three converge on:
- Hierarchical task decomposition (not flat peer networks)
- File-based or git-based communication (not sockets/HTTP)
- External state persistence (not in-memory only)
- Bounded review cycles (not unbounded retry)
- Independent quality verification (not trusting agent self-reports)

### Divergence Points

| Aspect | Gas Town | L-Thread | Pi Agent |
|--------|----------|----------|----------|
| **When it fails** | Cost explosion from redundant work | Context window overflow | Extension compatibility breakage |
| **Scaling ceiling** | 30 agents (coordination cost) | 5 agents (manual intervention) | Unknown (extension-dependent) |
| **Upgrade path** | More agents + federated colonies | Pi Agent migration + automation | More extensions + community growth |
| **Biggest weakness** | Cost at scale | Claude lock-in | Pi stability risk |
| **Biggest strength** | Proven at 20-30 agents | Zero infrastructure | Model flexibility |

---

## Actionable Insights

1. **The five laws are structural, not optional.** Three independent teams converging on identical principles means these are load-bearing constraints of multi-agent orchestration. Any system violating them will discover the same failures.

2. **L-Thread's pure-prompt approach has a 5-agent ceiling.** Gas Town and Pi Agent both scale beyond this via custom code. The Pi migration blueprint addresses this by converting prompt-based enforcement to programmatic hooks.

3. **Git-as-communication-bus (Gas Town) is underexplored.** Using commits and branches as the messaging layer provides automatic durability, history, and conflict detection. Worth considering for L-Thread's evolution.

4. **Cost visibility is L-Thread's blind spot.** Gas Town tracks $2-5K/month; Pi Agent enables per-model cost routing. L-Thread on Claude Max has zero cost visibility -- this is both an advantage (no per-call anxiety) and a risk (no optimization signal).

5. **Model routing is Pi Agent's strongest differentiator over L-Thread.** Using Haiku for lint fixes ($0.001/task) vs Opus for architecture decisions ($0.15/task) is a 150x cost difference. L-Thread uses Opus for everything by default.

6. **The "orchestrator must never write code" law validates Rule 1.** Three independent teams discovering this -- including Yegge's 189K-line system -- confirms it is not arbitrary but structural. An orchestrator that writes code loses meta-cognitive objectivity.

7. **Bounded review loops prevent infinite oscillation.** All three systems learned that without explicit bounds (Gas Town: budget, L-Thread: max 3 cycles, Pi Agent: chain termination), agents will review-and-revise forever.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi Agent is one of the three systems compared |
| [practitioners/steve-yegge.md](../practitioners/steve-yegge.md) | Gas Town creator; largest-scale system in comparison |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | Pi Agent orchestration system builder; composability exemplar |
| [reference/pi-orchestrator-blueprint.md](pi-orchestrator-blueprint.md) | Blueprint for L-Thread -> Pi migration informed by this comparison |
| [reference/master-blueprint.md](master-blueprint.md) | Master architecture decision drawing on convergent findings |
| [reference/scaling-economics.md](scaling-economics.md) | Cost analysis validating Gas Town's $2-5K/month and model routing economics |

---

## Burak's Notes

<!-- Add decision notes, updates, or re-evaluations here -->

---

*Reference entry generated from research doc dated 2026-03-05.*
