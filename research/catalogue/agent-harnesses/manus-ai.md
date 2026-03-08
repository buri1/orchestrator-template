# Manus AI

> **Autonomous AI agent for complex multi-step tasks — plans, executes, and delivers end-to-end without human intervention.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | N/A — proprietary, closed-source (open-source clones: [OpenManus](https://github.com/mannaandpoem/OpenManus), [ai-manus](https://github.com/Simpleyyt/ai-manus)) |
| GitHub Stars | N/A — proprietary product |
| Publisher | Manus / Butterfly Effect Technology (Xiao Hong) — startup, acquired by Meta for ~$2-3B in Dec 2025 |
| License | Proprietary (free tier: 300 daily credits) |
| Tech Stack | Claude 3.5 + Alibaba Qwen (multi-model), Python (CodeAct paradigm), Docker sandbox, Playwright, Ubuntu VM |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Manus solves a different problem — general-purpose task automation for end users, not developer orchestration. Our system is code-first, terminal-first, and developer-operated. Manus is consumer-facing. |
| **Novelty** | 6/10 | The CodeAct paradigm (generating executable Python code as action mechanism instead of rigid tool calls) and the file-based memory system (`todo.md` for progress tracking) are interesting patterns we haven't explored. |
| **Actionable** | 3/10 | Manus is proprietary and now owned by Meta. The architecture patterns are informative but can't be directly adopted. The open-source clones (OpenManus) are research-grade, not production-ready. |

---

## Overview

Manus is an autonomous AI agent that executes complex, multi-step tasks end-to-end — from research to analysis to deliverable creation — without human intervention. Originally built by Chinese startup Butterfly Effect Technology (also known as Monica.Im), it was acquired by Meta for approximately $2-3 billion in December 2025, making it one of the most significant AI acquisitions.

The system operates through an iterative agent loop: analyze current state, plan next action, execute in sandbox, observe results, repeat. Each iteration executes exactly one tool action, ensuring monitoring at every step. The Planner module decomposes high-level objectives into ordered step lists injected as "Plan" events. Rather than using fixed tool APIs, Manus employs the CodeAct paradigm — the agent generates executable Python code as its primary action mechanism, which the sandbox executes and returns results for analysis.

Manus runs in an isolated Ubuntu Docker container with full access to web search, browser automation (Playwright), shell commands, file operations, and code execution. Multiple specialized sub-agents can operate in parallel within isolated sandboxes — one handling web research, another managing code, a third performing analysis — coordinated by a central orchestrator. Context management uses event stream compression, file externalization, and RAG integration to stay within token limits.

---

## Technical Architecture

```
┌─────────────────────────────────────┐
│           User Interface            │
│     (Web app, API, scheduled)       │
├─────────────────────────────────────┤
│         Planner Module              │
│  - Decomposes goals → ordered steps │
│  - Injects "Plan" events           │
│  - Dynamic re-planning on failure   │
├─────────────────────────────────────┤
│         Agent Loop Controller       │
│  Analyze → Plan → Execute → Observe │
│  (One action per iteration)         │
├──────────┬──────────┬───────────────┤
│ Sub-agent│ Sub-agent│ Sub-agent     │
│ (Search) │ (Code)   │ (Analysis)   │
│ Sandbox  │ Sandbox  │ Sandbox      │
├──────────┴──────────┴───────────────┤
│     Tool Layer (CodeAct)            │
│  - Python code generation as action │
│  - Web search, Playwright browser   │
│  - Shell, file ops, code execution  │
├─────────────────────────────────────┤
│     Memory Layer                    │
│  - Event stream (working memory)    │
│  - todo.md (progress tracking)      │
│  - Workspace files (persistent)     │
│  - RAG (external knowledge)         │
│  - Compression for long contexts    │
├─────────────────────────────────────┤
│     Docker Sandbox (Ubuntu)         │
│  Python, Node, headless browsers    │
│  Resource limits, isolation         │
└─────────────────────────────────────┘
```

**Key technical decisions:**
- **CodeAct paradigm**: Agent writes executable Python code instead of making fixed tool calls. Higher success rate on complex tasks.
- **One action per iteration**: Prevents uncontrolled cascading. Human and system monitoring at every step.
- **File-based memory**: `todo.md` for progress tracking, workspace files for persistence. Externalizes information to preserve reasoning capacity.
- **Multi-model**: Uses Claude 3.5 and Alibaba Qwen rather than a single model.
- **Prompt-engineered governance**: Detailed system prompts with `<tool_use_rules>`, `<error_handling>`, `<information_rules>` sections create hard-coded behavioral guardrails.

---

## Publisher Background

Originally Butterfly Effect Technology, founded by Xiao Hong in 2022, headquartered in Beijing before relocating to Singapore in mid-2025. Key team: Chief Scientist Ji Yichao, Product Partner Zhang Tao, ~100 employees. Backed by Tencent, HongShan Capital (formerly Sequoia China), and Benchmark ($85M raised, $500M valuation before acquisition). Acquired by Meta in December 2025 for reportedly $2-3B. Currently under Chinese regulatory review regarding technology export regulations. The Meta acquisition provides massive resources but introduces uncertainty about Manus's future direction and independence.

---

## What's Valuable for Us

1. **CodeAct paradigm**: The idea of having agents generate executable code as their action mechanism (instead of using rigid tool APIs) achieves higher success rates on complex tasks. We could apply this principle to our worker agents — let them write and execute scripts rather than being constrained to predefined tool calls.

2. **File-based memory pattern**: Using `todo.md` for progress tracking and workspace files for persistence is simple and effective. Our orchestrator state is JSON-based; a `todo.md` approach would be more transparent and debuggable for human review.

3. **Prompt-engineered governance sections**: The structured prompt sections (`<tool_use_rules>`, `<error_handling>`) creating hard-coded behavioral guardrails validate our CLAUDE.md approach. Their XML-tagged prompt structure is more organized than our current flat markdown.

4. **One-action-per-iteration principle**: Preventing cascading actions is a safety pattern we should consider for our agent spawning — especially for high-risk operations on production systems.

---

## What's NOT Relevant

- **Consumer-facing UX**: Manus is designed for non-technical end users doing research, travel planning, analysis. We're developer-facing and code-first.
- **Docker sandbox isolation**: We use tmux + worktrees for isolation, not Docker containers. Docker adds infrastructure overhead we don't need for code-focused agents.
- **Multi-model with Qwen**: We're Claude-first. Adding Alibaba Qwen adds complexity without clear benefit for our use case.
- **Meta ownership**: The acquisition makes Manus's future direction dependent on Meta's strategy, which may diverge from our needs.
- **Credit-based pricing**: At $19-200/mo with non-rolling credits, it's an ongoing cost for a tool that doesn't fit our core workflow.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the CodeAct paradigm for potential application to our worker agents. Could we let agents write bash/TypeScript scripts instead of using only predefined tool calls?
- **Phase 3 (Days 60-90)**: The file-based memory pattern (`todo.md`) could be adopted for agent progress tracking that's human-readable alongside our JSON state files.
- **Phase 4 (Days 90+)**: If Meta keeps Manus running as a service, it could be useful for non-coding automation tasks (research, analysis) in our business operations — but this is speculative given the acquisition uncertainty.

---

## Key Takeaway

> **Manus proves that the CodeAct paradigm (agents generating executable code instead of fixed tool calls) achieves higher success rates on complex tasks — a pattern worth evaluating for our worker agents, even though Manus itself is a consumer product that doesn't fit our developer workflow.**
