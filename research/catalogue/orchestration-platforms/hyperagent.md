# HyperAgent

> **Generalist Software Engineering Agents to Solve Coding Tasks at Scale**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [FSoft-AI4Code/HyperAgent](https://github.com/FSoft-AI4Code/HyperAgent) |
| GitHub Stars | 235 (as of 2026-03-08) |
| Publisher | FPT Software AI Center (enterprise R&D lab) |
| License | Apache-2.0 |
| Tech Stack | Python, Zoekt (Go-based code search), universal-ctags, Jupyter kernels, Anthropic + OpenAI APIs |
| Maturity | 🔵 Research (academic benchmarking system, last pushed Dec 2024) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Solves a different problem domain (SWE-Bench-style automated bug fixing). The four-agent architecture is interesting as a reference for role specialization, but the system is benchmark-focused, not production orchestration. |
| **Novelty** | 5/10 | The Planner/Navigator/Editor/Executor decomposition is a known pattern (similar to SWE-agent, Devin, etc.). Zoekt integration for code search and the multi-language ambition are differentiators. |
| **Actionable** | 2/10 | Benchmark-specific tooling. The role decomposition concept is already embedded in our orchestrator architecture. No transferable code or patterns for our stack. |

---

## Overview

HyperAgent is a multi-agent system from FPT Software's AI Center designed to tackle software engineering tasks across multiple programming languages. Unlike single-purpose SE agents, HyperAgent decomposes the software development lifecycle into four specialized agents: Planner (task decomposition and strategy), Navigator (code search and understanding), Code Editor (patch generation), and Executor (testing and verification). Each agent can be configured with different LLM backends and capability levels.

The system targets SWE-Bench (GitHub issue resolution), RepoExec (repository-level code generation), and Defects4J (fault localization and program repair). It achieves 31.4% on SWE-Bench Verified and 25% on SWE-Bench Lite, with 249 bugs fixed on Defects4J. Performance is competitive but not state-of-the-art in the rapidly evolving SWE-Bench landscape.

HyperAgent uses Zoekt (Sourcegraph's code search engine) for semantic code navigation and universal-ctags for symbol extraction, giving it strong code understanding capabilities. The system supports both "patch" mode (generate code changes) and "predict" mode (fault localization, code QA). It currently handles Python and Java, with plans to expand to other languages.

---

## Technical Architecture

### Four-Agent Decomposition

```
Task Input
  → Planner Agent (task analysis, strategy formulation)
     → Navigator Agent (code search via Zoekt, symbol lookup via ctags)
        → Code Editor Agent (patch generation, code modification)
           → Executor Agent (test execution via Jupyter kernel, verification)
              → Output (patch / prediction / fault location)
```

### Key Components

| Component | Function | LLM Config |
|-----------|----------|------------|
| **Planner** | Decomposes task into sub-tasks, formulates strategy | Configurable (e.g., Claude Sonnet) |
| **Navigator** | Searches codebase using Zoekt index + ctags symbols | Lighter model (e.g., Claude Haiku) |
| **Code Editor** | Generates patches, modifies code files | Heavier model (e.g., Claude Sonnet) |
| **Executor** | Runs tests in isolated Jupyter kernel, verifies patches | Heavier model (e.g., Claude Sonnet) |

### Infrastructure Dependencies

- **Zoekt** (Go): Pre-indexes repository for fast code search. Requires Go installation + `zoekt-index` + `zoekt-webserver`.
- **universal-ctags**: Semantic symbol extraction for code navigation.
- **Conda environment**: Executor uses a dedicated Jupyter kernel named `hyperagent` for isolated code execution.
- **Python API**: Main interface via `HyperAgent(repo, commit, language, clone_dir)` constructor.

### Configuration Model

```python
config = {
    "name": "claude",
    "nav": [{"model": "claude-3-haiku", "api_type": "anthropic"}],
    "edit": [{"model": "claude-3-5-sonnet", "api_type": "anthropic"}],
    "exec": [{"model": "claude-3-5-sonnet", "api_type": "anthropic"}],
    "plan": [{"model": "claude-3-5-sonnet", "api_type": "anthropic"}]
}
```

Each agent role can be configured with different models, API keys, and pricing tiers — using cheaper models for navigation and heavier models for editing/execution.

---

## Publisher Background

**FPT Software AI Center (FSoft-AI4Code)** is the AI research division of FPT Software, Vietnam's largest IT services company (~50K employees). The team focuses on code intelligence, LLM-based SE tools, and code generation. They maintain several open-source projects including RepoExec (code generation benchmark) and other code-related tools. The paper was submitted to academic venues. FPT Software is a legitimate enterprise with R&D budget, but the AI4Code team is a research lab producing papers and benchmarks, not production developer tools.

---

## What's Valuable for Us

### 1. Tiered Model Assignment Pattern

HyperAgent's approach of assigning cheaper, faster models to navigation/search tasks and heavier models to code editing and execution is a cost-optimization pattern worth noting. In our orchestrator, we could apply this when spawning agents — use a lighter model for analysis/research agents and reserve heavier models for code-writing agents.

### 2. Zoekt as Code Search Infrastructure

Zoekt (from Sourcegraph) is a high-quality code search engine. If we ever need semantic code search across large repositories, Zoekt is a proven tool. HyperAgent's integration shows it works well in an agent pipeline context.

### 3. Four-Role Decomposition as Reference

The Planner/Navigator/Editor/Executor split is a clean mental model for how to decompose software engineering tasks. We already do this implicitly in our orchestrator (task decomposition → agent work → verification), but the explicit naming helps communicate the pattern.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **SWE-Bench focus** | Benchmark optimization is a research concern, not a production concern. Our agents work on real tasks, not standardized issue resolution benchmarks. |
| **4-agent fixed architecture** | Our coordination overhead research shows 4 agents is universally suboptimal (exponent 1.724). HyperAgent's 4-agent design trades efficiency for specialization. |
| **Python/Conda dependency chain** | We run TypeScript/shell. The Zoekt + ctags + Conda + Jupyter stack is heavy infrastructure we don't need. |
| **Patch-mode output** | HyperAgent outputs unified diffs. Our agents write code directly via Claude Code's Edit tool. Different execution model. |
| **Language-specific tooling** | Python/Java only. We work across whatever languages our clients need, with Claude Code handling the language differences. |
| **Academic evaluation methodology** | Pass@K metrics, benchmark comparisons, and ablation studies are academic concerns with no production relevance. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None.
- **Phase 2 (Days 4-60):** None directly. Note Zoekt as a potential code search tool if we need codebase-wide search capabilities.
- **Phase 3 (Days 60-90):** If building specialized agent configurations, reference HyperAgent's tiered model assignment as a cost optimization pattern.
- **Phase 4 (Days 90+):** If scaling to handle SWE-Bench-style automated issue resolution for clients, HyperAgent's architecture provides a reference decomposition — but we'd implement it differently using our L-Thread pattern.

---

## Key Takeaway

> **HyperAgent demonstrates a clean four-role agent decomposition (Plan/Navigate/Edit/Execute) with smart model-tier assignment, but it's a benchmark-focused research system — not production orchestration — and its 4-agent fixed architecture conflicts with our proven optimal team size of 2-3.**
