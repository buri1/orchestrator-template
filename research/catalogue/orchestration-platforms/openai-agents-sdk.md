# OpenAI Agents SDK

> **A lightweight, powerful framework for multi-agent workflows with handoffs, guardrails, tracing, and MCP support**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [github.com/openai/openai-agents-python](https://github.com/openai/openai-agents-python) (Python) / [github.com/openai/openai-agents-js](https://github.com/openai/openai-agents-js) (TypeScript) |
| GitHub Stars | Python: 19,417 / TypeScript: 2,398 (as of 2026-03-08) |
| Publisher | OpenAI — bigtech |
| License | MIT |
| Tech Stack | Python 3.10+ (primary), TypeScript/Node.js 22+ (secondary). Deps: Pydantic, LiteLLM, zod. Supports 100+ LLMs via LiteLLM |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | We're Claude-first with our own L-Thread orchestrator. OpenAI's SDK is a competitor framework, not something we'd adopt. However, the handoff pattern and guardrails architecture are worth studying — they validate some of our own patterns. |
| **Novelty** | 4/10 | Manager pattern and handoffs are patterns we've already documented in our Master Blueprint. The guardrails concept and tracing integration are known. LiteLLM multi-provider support is interesting but not new to us. |
| **Actionable** | 3/10 | We won't adopt this SDK — we have our own orchestrator. But the TypeScript version's agent-as-tool pattern and the guardrails implementation are good reference material for hardening our own system. |

---

## Overview

The OpenAI Agents SDK is a lightweight framework for building multi-agent systems, released in March 2025 (Python) and May 2025 (TypeScript). Despite the "OpenAI" branding, it's provider-agnostic — supporting 100+ LLMs via LiteLLM integration, including Claude. The SDK has achieved massive adoption: 19,400+ stars on the Python repo and 2,400+ on TypeScript, with 504+ dependent projects.

The core abstraction is simple: an **Agent** is an LLM configured with instructions, tools, guardrails, and handoff targets. Agents can delegate to other agents via two patterns: **Manager** (a central agent invokes sub-agents as tools and retains control) and **Handoffs** (an agent transfers conversation control to a peer agent). This maps directly to our orchestrator's conduit mode (manager) and potential peer-to-peer patterns.

The SDK includes built-in **guardrails** (input/output validation), **sessions** (persistent conversation history), **human-in-the-loop** mechanisms, **tracing** (full observability of agent runs), and **realtime agents** (voice). It runs with `Runner.run_sync()` for simple cases or async for production workloads.

---

## Technical Architecture

```
OpenAI Agents SDK
├── Core Primitives
│   ├── Agent — LLM + instructions + tools + guardrails + handoffs
│   ├── Runner — execution engine (sync/async)
│   ├── Tool — function, MCP, or hosted tool
│   └── Guardrail — input/output validation layer
│
├── Multi-Agent Patterns
│   ├── Manager Pattern
│   │   ├── Central agent invokes sub-agents as tools
│   │   ├── Manager retains conversation control
│   │   └── ≈ Our orchestrator conduit mode
│   ├── Handoff Pattern
│   │   ├── Agent transfers control to peer
│   │   ├── Peer takes over conversation
│   │   └── ≈ Potential peer-to-peer agent delegation
│   └── Agent-as-Tool
│       ├── Sub-agent wrapped as callable tool
│       └── Results returned to parent agent
│
├── Infrastructure
│   ├── Sessions — persistent context across runs
│   ├── Tracing — full run observability (Agents Tracing UI)
│   ├── Human-in-the-Loop — intervention hooks
│   └── Realtime — voice agent support (WebSocket)
│
├── Provider Support
│   ├── OpenAI (native)
│   ├── 100+ LLMs via LiteLLM (incl. Claude)
│   └── MCP tool integration
│
└── TypeScript Version
    ├── Node.js 22+, Deno, Bun, Cloudflare Workers
    ├── pnpm monorepo, Vitest, Vite
    ├── zod for schema validation
    └── 84 contributors, 504+ dependents
```

Key code patterns:

```python
# Python — minimal agent
from agents import Agent, Runner
agent = Agent(name="Assistant", instructions="You are helpful")
result = Runner.run_sync(agent, "Hello")

# TypeScript — minimal agent
import { Agent, run } from '@openai/agents';
const agent = new Agent({ name: 'Assistant', instructions: 'You are helpful' });
const result = await run(agent, 'Hello');
```

The framework is intentionally thin — no complex DAG definitions, no YAML configs, no visual builders. Agents are Python/TypeScript objects with direct method calls. This aligns with the "code-first" philosophy we share.

---

## Publisher Background

OpenAI is the creator of GPT-4, ChatGPT, and the dominant player in commercial LLM APIs. The Agents SDK represents their official position on how multi-agent systems should be built. With 19K+ stars in under a year, it has become one of the most popular agent frameworks. The Python version has 3,230 forks and active development (last update: 2026-03-08). The TypeScript version is newer but growing fast with 634 forks.

OpenAI is also a founding Platinum member of AAIF and contributed AGENTS.md as a founding project. Their agent strategy spans the SDK (this tool), the Responses API (underlying LLM calls), the Agents Tracing UI (observability), and AGENTS.md (cross-tool agent instructions).

---

## What's Valuable for Us

1. **Handoff pattern validation**: OpenAI's two-pattern taxonomy (Manager vs. Handoff) validates our orchestrator architecture. Our conduit mode IS the Manager pattern. This confirms we're on the right track architecturally.

2. **Guardrails architecture**: The input/output validation layer is something we should formalize in our orchestrator. Currently our agents run without guardrails beyond the orchestrator's oversight. The SDK's guardrails are simple validators that can reject or modify agent inputs/outputs before execution.

3. **Agent-as-tool pattern**: Wrapping a sub-agent as a callable tool (rather than a separate process) is an interesting alternative to our pane-split/tmux approach. It's simpler but loses the process isolation we get from separate Claude instances.

4. **Tracing integration**: The Agents Tracing UI provides full observability of agent runs. We currently rely on tmux capture and state files. A structured tracing approach would improve our debugging capabilities.

5. **TypeScript version maturity**: With Node.js 22+, zod validation, and pnpm monorepo — this is a solid TypeScript reference implementation for multi-agent patterns. If we ever build a TypeScript runtime for our orchestrator, this is the closest reference.

---

## What's NOT Relevant

- **LLM provider abstraction**: We don't need LiteLLM or 100+ provider support. We're Claude-first, Claude-only for the foreseeable future. Our context separation principle means we optimize for one provider deeply rather than abstracting across many.
- **Python-first ecosystem**: Our stack is TypeScript/shell. The Python SDK is interesting to study but we wouldn't adopt it.
- **Realtime/voice agents**: Voice is not in our roadmap. Our agents operate via terminal and text.
- **Sessions abstraction**: We manage context explicitly via state files and orchestrator state. The SDK's automatic session management hides context decisions we want to control.
- **The SDK itself**: We won't adopt this. Our L-Thread orchestrator is pure prompt engineering on Claude Code — no framework dependency. Adding the OpenAI Agents SDK would mean abandoning our architecture and introducing a framework dependency we don't need.
- **OpenAI API dependency**: Even though it supports Claude via LiteLLM, the native integration path assumes OpenAI API conventions. We call Claude directly.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the guardrails implementation and consider adding input/output validation to our orchestrator's agent spawn flow. Simple validators that check agent outputs before marking tasks as done.
- **Phase 3 (Days 60-90)**: If we build the thin shared layer, the Agent-as-tool pattern could inform how business-line agents expose capabilities to each other without full process isolation.
- **Reference only**: This SDK is primarily useful as a reference implementation of patterns we independently developed. It validates our architecture rather than replacing it.

---

## Key Takeaway

> **OpenAI's Agents SDK validates our Manager-pattern orchestrator architecture with 19K+ stars of market proof — the guardrails and tracing patterns are worth studying — but we won't adopt it because our Claude-first L-Thread orchestrator achieves the same patterns without framework dependency.**
