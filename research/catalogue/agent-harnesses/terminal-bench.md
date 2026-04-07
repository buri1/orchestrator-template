# Terminal Bench 2.0

> **Harbor-native benchmarks to help agent makers quantify their agents' terminal mastery.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses (Benchmark) |
| Website | [tbench.ai](https://tbench.ai) |
| Repository | [laude-institute/terminal-bench](https://github.com/laude-institute/terminal-bench) |
| GitHub Stars | 1,800 (as of 2026-03-22) |
| Publisher | Stanford + Laude Institute — research collaboration |
| License | Apache-2.0 |
| Tech Stack | Python (43%), Shell (34%), C++ (7%), Docker (5%), C (4%) |
| Maturity | 🟢 Production (v2.0 active; 120+ leaderboard entries; verified submissions) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *THE benchmark for evaluating agent harnesses. LangChain proved harness engineering > model selection here (52.8% to 66.5% with zero model changes). Claude Code stock scores 58.0% with Opus 4.6 while ForgeCode hits 81.8% with the same model -- that's a 23.8pp gap that's pure harness engineering. This is how we measure whether our orchestrator architecture improvements actually move the needle. Not a tool to adopt, but a tool to measure against.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly quantifies harness engineering ROI -- the core thesis of our orchestrator work. Every architectural decision (reasoning sandwich, pre-completion verification, context management) can be measured here. |
| **Novelty** | 8/10 | Only benchmark that isolates harness impact from model capability. The 120-entry leaderboard is the definitive comparison matrix for agent+model combinations. |
| **Actionable** | 6/10 | We can submit our orchestrator-spawned agents against it, but requires Docker sandbox setup and `tb` CLI integration. Not immediate priority but Phase 3+ validation target. |

---

## Overview

Terminal Bench is a benchmark suite from Stanford and the Laude Institute that evaluates AI agents on realistic, end-to-end tasks in terminal environments. Version 2.0 contains 89 high-quality tasks spanning software engineering, machine learning, security, and data science -- from building Linux kernels with custom modifications to training FastText models with size/accuracy constraints to cracking 7z archives.

The benchmark's core insight is separating harness engineering from model capability. The same model (Claude Opus 4.6) scores anywhere from 58.0% (stock Claude Code) to 81.8% (ForgeCode) depending purely on the agent harness wrapping it. This 23.8 percentage point gap proves that systems engineering around models -- context management, self-verification, reasoning budget allocation, tool design -- matters as much or more than model selection. LangChain's Deep Agents demonstrated this most dramatically: pure harness engineering (middleware, reasoning sandwich, trace analysis) moved them from 52.8% to 66.5% (top-30 to top-5) with GPT-5.2-Codex held constant.

The leaderboard tracks 120+ agent/model combinations from 30+ organizations, with both self-reported and Terminal Bench-verified submissions. Tasks include explicit requirements and success criteria validated by test scripts. Version 3.0 is in development with community contributions, and Terminal Bench Science extends to scientific computing domains.

---

## Technical Architecture

### Benchmark Components

```
┌─────────────────────────────────────────┐
│           Terminal Bench 2.0            │
├─────────────────────────────────────────┤
│                                         │
│  89 Tasks                               │
│  ├── English instruction                │
│  ├── Verification test script           │
│  ├── Reference solution                 │
│  └── Difficulty: medium → hard          │
│                                         │
│  Execution Harness (Harbor Framework)   │
│  ├── Docker sandbox environment         │
│  ├── Agent adapter (pluggable)          │
│  ├── Concurrent execution (N workers)   │
│  └── Result collection + scoring        │
│                                         │
│  Leaderboard                            │
│  ├── HuggingFace dataset backend        │
│  ├── Accuracy ± standard error          │
│  ├── Verification status (TB team)      │
│  └── Organization attribution           │
│                                         │
└─────────────────────────────────────────┘
```

### Installation & Execution

```bash
# Install
uv tool install terminal-bench   # or: pip install terminal-bench

# Run evaluation
tb run --agent terminus --model anthropic/claude-3-7-latest \
  --dataset-name terminal-bench-core --dataset-version 0.1.1 \
  --n-concurrent 8
```

### Task Categories

| Category | Example Tasks | Skills Tested |
|----------|---------------|---------------|
| **Software Engineering** | Build Linux kernel, configure git webserver | Compilation, server config, package management |
| **Machine Learning** | Train FastText with size/accuracy constraints | Model training, hyperparameter tuning, evaluation |
| **Security** | Crack 7z hash, OpenSSL self-signed cert | Cryptography, PKI, penetration testing |
| **Data Science** | Reshard C4 data with file/dir constraints | Data pipeline engineering, file manipulation |

### Key Repository Structure

```
terminal_bench/     # Main Python package
adapters/           # Agent adapter implementations
dashboard/          # Monitoring/visualization
docker/             # Container configs for sandboxed execution
tasks/              # Task definitions + verification scripts
registry.json       # Dataset registry
```

---

## Leaderboard Highlights (Terminal Bench 2.0)

### Top 10

| Rank | Agent | Model | Accuracy | Verified |
|------|-------|-------|----------|----------|
| 1 | ForgeCode | Claude Opus 4.6 | 81.8%±1.7 | No |
| 2 | ForgeCode | GPT-5.4 | 81.8%±2.0 | No |
| 3 | TongAgents | Gemini 3.1 Pro | 80.2%±2.6 | No |
| 4 | ForgeCode | Gemini 3.1 Pro | 78.4%±1.8 | No |
| 5 | SageAgent | GPT-5.3-Codex | 78.4%±2.2 | No |
| 6 | Droid (Factory) | GPT-5.3-Codex | 77.3%±2.2 | No |
| 7 | Capy | Claude Opus 4.6 | 75.3%±2.4 | No |
| 8 | Simple Codex | GPT-5.3-Codex | 75.1%±2.4 | Yes |
| 9 | Terminus-KIRA | Gemini 3.1 Pro | 74.8%±2.6 | No |
| 10 | Terminus-KIRA | Claude Opus 4.6 | 74.7%±2.6 | No |

### Harness Variance (Same Model = Claude Opus 4.6)

| Agent | Accuracy | Delta from Stock |
|-------|----------|------------------|
| ForgeCode | 81.8% | +23.8pp |
| Capy | 75.3% | +17.3pp |
| Terminus-KIRA | 74.7% | +16.7pp |
| MAYA-V2 | 72.1% | +14.1pp |
| TongAgents | 71.9% | +13.9pp |
| Droid (Factory) | 69.9% | +11.9pp |
| Mux (Coder) | 66.5% | +8.5pp |
| Terminus 2 | 62.9% | +4.9pp |
| **Claude Code (stock)** | **58.0%** | **baseline** |

This table is the single most important artifact in the catalogue for proving harness engineering ROI.

### Notable Verified Results

| Agent | Model | Accuracy | Organization |
|-------|-------|----------|-------------|
| Simple Codex | GPT-5.3-Codex | 75.1% | OpenAI |
| Terminus 2 | GPT-5.3-Codex | 64.7% | Terminal Bench |
| Codex CLI | GPT-5.2 | 62.9% | OpenAI |
| Claude Code | Claude Opus 4.6 | 58.0% | Anthropic |
| OpenHands | Claude Opus 4.5 | 51.9% | OpenHands |
| Claude Code | Claude Opus 4.5 | 52.1% | Anthropic |
| Claude Code | Claude Sonnet 4.5 | 40.1% | Anthropic |

---

## Publisher Background

Terminal Bench is a collaboration between Stanford University and the Laude Institute. Key contributors include Nicholas Carlini (kernel/git tasks), Jan-Lucas Uslu (security tasks), Junhong Shen (OpenSSL tasks), and jeffreywpli/dwahdany (data processing tasks). The project is formally cited via an arXiv paper (arXiv:2601.11868) titled "Terminal-Bench: Benchmarking Agents on Hard, Realistic Tasks in Command Line Interfaces."

The benchmark is integrated with the Harbor Framework for execution, with results hosted on HuggingFace (harborframework/terminal-bench-2-leaderboard). The project has 1.8K stars, 488 forks, and 903 commits, indicating active development and strong community adoption.

---

## What's Valuable for Us

1. **Harness Engineering ROI Quantification**: The 23.8pp gap between stock Claude Code (58.0%) and ForgeCode (81.8%) on the same model (Opus 4.6) is the definitive proof that our orchestrator work matters. Every middleware, hook, and context strategy we implement can be measured here.

2. **Reasoning Sandwich Validation**: LangChain's 52.8% to 66.5% improvement was achieved partly through the "reasoning sandwich" (xhigh plan, high implement, xhigh verify) -- the exact pattern our orchestrator uses when spawning workers with different task phases.

3. **Pre-Completion Verification**: LangChain's PreCompletionChecklistMiddleware (intercept before exit, force self-verification) maps directly to our E2E testing gate (Rule #2). Their data shows this single middleware contributed significant accuracy gains.

4. **Trace Analysis Meta-Loop**: The Trace Analyzer Skill (fetch failed traces, spawn parallel error analysts, synthesize, fix harness) is a meta-improvement loop we should build for our orchestrator. Debugging agent failures by spawning more agents.

5. **Benchmark Submission Target**: We can submit our tmux+worktree orchestrated agents to Terminal Bench 2.0 to measure where our harness engineering stands relative to the field. A score above 58.0% (stock Claude Code) proves our orchestrator adds value.

---

## What's NOT Relevant

- **Docker Sandbox Requirement**: Terminal Bench runs tasks in Docker containers. Our orchestrator uses tmux+worktree on bare metal. We'd need a Docker adapter to submit, but our architecture wouldn't change.
- **Harbor Framework Dependency**: The execution harness is tightly coupled to Harbor. We'd use Terminal Bench as a measurement tool, not integrate Harbor into our stack.
- **Terminus 2 Agent**: Terminal Bench's own reference agent. It's a baseline comparison point, not an architecture we'd adopt.
- **Science/3.0 Extensions**: Domain-specific benchmarks (biology, scientific computing) are out of scope for our engineering-focused orchestrator.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the top-10 harnesses' architectures (ForgeCode, TongAgents, SageAgent) to identify specific techniques driving their advantage over stock Claude Code.
- **Phase 3 (Days 60-90)**: Submit our orchestrator-spawned agents to Terminal Bench 2.0. Target: beat stock Claude Code (58.0%) by at least 10pp through harness engineering alone.
- **Phase 4 (Days 90+)**: Use Terminal Bench as a regression test -- every orchestrator architecture change gets measured. Build a Trace Analyzer meta-loop that automatically diagnoses failed tasks and proposes harness improvements.

---

## Key Takeaway

> **Terminal Bench 2.0 is the benchmark that quantifies harness engineering ROI: the same model scores 58.0% to 81.8% depending purely on the agent harness, proving that systems engineering around models matters as much as model selection.**
