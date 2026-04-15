# VERIFY-09: OpenHands and Contenders -- Deep Evaluation

**Date**: 2026-04-04 (updated 2026-04-04 with SWE-bench, observability, community, and tmux ecosystem data)
**Researcher**: Claude Opus 4.6 (1M context)
**Status**: COMPLETE
**Verdict**: OpenHands is impressive infrastructure but NOT a replacement for our tmux orchestrator + Claude Code architecture. Docker Sandboxes (`sbx`) is the most relevant new contender.

---

## Executive Summary

OpenHands (formerly OpenDevin) is the leading open-source AI agent platform with 71k GitHub stars, $18.8M Series A funding, and a mature Docker-based sandboxing architecture. However, it is fundamentally a *different tool* than what we use. It wraps LLM API calls in its own agent framework, while our system dispatches native Claude Code processes. The critical blocker: **Anthropic banned third-party tools from using Claude Pro/Max OAuth tokens** (January 2026, formalized April 4, 2026). OpenHands requires a pay-as-you-go API key for Claude -- no Max subscription arbitrage.

**Docker Sandboxes** (`sbx`), launched March 2026, is the most relevant discovery. It runs Claude Code natively inside microVM sandboxes with `--dangerously-skip-permissions`, supports parallel agents via branch mode, and is the only sandbox that lets agents build Docker containers while remaining host-isolated. This directly competes with our tmux isolation approach.

---

## 1. OpenHands (formerly OpenDevin)

**Repo**: https://github.com/OpenHands/OpenHands
**Stars**: 71,097 | **Forks**: 8,933 | **Contributors**: 490+ | **License**: Custom (NOASSERTION)
**Funding**: $18.8M Series A (Madrona, Menlo Ventures, Fujitsu Ventures, Nov 2025)
**Latest**: v1.6.0 (March 2026)

### 1.1 What Is It?

An open-source AI agent platform with three interfaces:
- **SDK**: Composable Python library for building custom agents
- **CLI**: Terminal-based workflow (`openhands serve` at localhost:3000)
- **Cloud**: Team collaboration platform (hosted)

Uses an **event-stream architecture**: Agent -> Actions -> Environment -> Observations -> Agent. Model-agnostic -- supports Claude, GPT-4o, Gemini, Mistral, Ollama. Built on the CodeAct architecture with web browsing and code editing specialists.

### 1.2 Sandboxing Architecture

**Docker-based isolation** with client-server architecture:

1. Builds an "OH Runtime Image" from user-provided base image + OpenHands runtime client
2. Spawns Docker container with the prepared image
3. Inside container: bash shell, browser (Chromium), Jupyter kernel, VSCode, plugin system
4. Backend communicates via REST API (actions in, observations out)
5. Security hardening: `cap-drop ALL`, `no-new-privileges` by default

**V1 Architecture Transition** (April 2026):
- V0 (mandatory Docker) deprecated April 1, 2026
- V1 offers `LocalWorkspace` (default, no Docker) and `DockerWorkspace` (containerized)
- Same agent code works in both via factory pattern

**Volume mounting**: bind mounts, named volumes, overlay mode (copy-on-write)
**Port management**: file-locked port ranges, auto-allocation, VSCode with auth tokens

### 1.3 Can It Run Claude Code Inside?

**No.** OpenHands is a standalone agent framework. It uses Claude's API to power its own agents (CodeAct architecture). It does NOT wrap or launch Claude Code CLI. There is no integration path to run Claude Code as a subprocess within OpenHands containers.

The fundamental difference: OpenHands builds its own agent loop around raw LLM API calls. Claude Code is Anthropic's proprietary agent with its own tool-use loop, memory, and MCP protocol. They are competing implementations, not composable layers.

### 1.4 Self-Hosted Mode

**Fully self-hostable.** Requirements:
- Docker Desktop (macOS, Linux, WSL2 on Windows)
- Python 3.12, Node.js
- 4GB RAM minimum
- Install: `uv tool install openhands --python 3.12 && openhands serve`

**WSL2 specifics**: Keep files in WSL filesystem (not /mnt/c). Docker Desktop provides Docker daemon. Docker-in-Docker is the main friction point.

**Enterprise**: Kubernetes deployment with RBAC, audit trails, multi-user support (v1.6.0+, enterprise license)

### 1.5 Claude Max Support

**BLOCKED.** On January 9, 2026, Anthropic deployed server-side checks rejecting OAuth tokens from third-party tools. Formalized in updated ToS on February 19, 2026. As of April 4, 2026, Claude subscriptions no longer cover third-party tools at all.

OpenHands requires a **pay-as-you-go Anthropic API key** (console.anthropic.com). No Max subscription arbitrage. Token costs: $3/M input, $15/M output for Sonnet 4. Estimated $0.15-$0.60 per task with Claude 4.5 Sonnet.

This kills the economic advantage. Our tmux orchestrator uses Claude Code with Max subscription ($200/mo unlimited), achieving 18-36x cost arbitrage vs API pricing.

### 1.6 Multi-Agent

**Supported via delegation tool:**
- Main agent spawns sub-agents with `delegate` command
- Each sub-agent gets unique ID, same workspace, independent conversation context
- Parallel execution via threads (blocking -- main agent waits for all to complete)
- Consolidated results returned as single observation
- Configurable max concurrent sub-agents

**Limitation**: Sequential within a single session's agent. The SDK scales to 1000s of parallel sessions via the cloud/server deployment, but each session runs one primary agent with optional sub-delegation.

### 1.7 Observability

Strong on infrastructure, weak on native dashboard:

**Built-in UI surfaces**:
- **Web UI**: Real-time file browser, terminal, code editor, browser view
- **VNC Desktop**: Full GUI access to sandbox environment
- **VSCode**: Embedded editor with auth token access
- **Event Log**: Immutable event stream of all actions/observations
- **REST/WebSocket APIs**: Programmatic access to all events

**OpenTelemetry integration** (SDK v1+):
- Automatically traces: `agent.step` (each loop iteration), tool calls with input/output, LLM API requests (via LiteLLM), browser sessions (Laminar only), conversation lifecycle events
- Span attributes include `conversation_id`, `tool_name`, `action.kind`, `session_id`
- Configuration: 3 environment variables (e.g., `LMNR_PROJECT_API_KEY` for Laminar, or generic OTLP endpoint/headers)
- Supported backends: Laminar, MLflow, Honeycomb, Jaeger, Datadog, New Relic, any OTLP-compatible
- Asynchronous exporters for minimal performance impact

**MLflow governance integration**: Budget control, usage tracking with token-level cost visibility, secret management, fallback routing

**Gap**: No native dashboard for visualizing the agent loop -- action-observation pairs, per-turn token usage, and aggregated metrics require external observability backends (GitHub issue #8916 tracks this). The built-in Web UI shows actions but lacks structured analytics.

### 1.8 Auto-Recovery

**Partial.** The V1 SDK uses event sourcing for state:
- Immutable event log enables replay and recovery
- State persists via `base_state.json` + individual event JSON files
- On restart: replays events to rebuild exact pre-crash state
- **Requires** volume mapping (`./state:/app/state`) -- without it, events are RAM-only

**Limitation**: Known issues with webhook connection failures causing container crashes. Recovery often requires manual container restart. Automatic restart is not built-in -- needs external orchestration (systemd, Kubernetes, etc.).

### 1.9 Community

| Metric | Value |
|--------|-------|
| GitHub Stars | 71,097 |
| Forks | 8,933 |
| Contributors | 490+ |
| PyPI Downloads | 4M+ (as of Nov 2025) |
| Funding | $18.8M Series A |
| Enterprise Users | AMD, Apple, Google, Amazon, Netflix, TikTok, NVIDIA (reported) |
| Academic Paper | NeurIPS 2024, arXiv:2407.16741 |
| SWE-bench Score | 53%+ (Claude 4.5 Sonnet) |

### 1.10 SWE-Bench Rankings and the OpenHands Index

**SWE-bench Verified**: OpenHands claims #1 overall on the SWE-bench Verified leaderboard and is the only open-source agent in the top 10. Score with Claude Sonnet 4.5: **72.8%**. With extended thinking enabled: **72%** (per SDK paper, arXiv:2511.03690).

**GAIA Benchmark**: 67.9% with Claude Sonnet 4.5 (general-purpose assistant tasks).

**SWE-bench Live** (real-world, non-curated): Both OpenHands and SWE-Agent score only ~18-20%, showing the gap between curated benchmarks and real-world performance.

**Mini-SWE-Agent comparison**: Princeton's 100-line mini-SWE-agent scores >74% on SWE-bench Verified, raising questions about whether complex scaffolding actually helps or if the model does the heavy lifting.

**The OpenHands Index** (launched January 2026): A broader evaluation beyond SWE-bench that tests issue resolution, greenfield app development, frontend tasks, and testing. Key finding: Claude Opus and GPT-5.2-codex are clear leaders, while other models fall significantly behind in the broader evaluation.

**Honest interpretation**: The SWE-bench score depends overwhelmingly on the underlying model, not the harness. The fact that a 100-line agent nearly matches OpenHands' elaborate framework suggests the agent scaffolding contributes marginal improvement. The real value of OpenHands is operational (sandboxing, UI, multi-agent) not benchmark performance.

### 1.11 Real-World Community Sentiment

**Positive signals**:
- ~20% of OpenHands' own commits are co-authored by OpenHands itself
- Users report strong results on well-defined tasks (bug fixes with reproducible tests, API endpoints, refactoring)
- Enterprise adoption claimed by AMD, Apple, Google, Amazon, Netflix, TikTok, NVIDIA

**Honest limitations from real users**:
- "This is not a download and go experience" -- Docker-in-Docker is real friction
- Agent "sometimes gets stuck repeating the same failing approach" (infinite loop problem)
- Frontend/UI code generation unreliable ("the agent struggles with visual requirements it cannot see")
- Git integration issues: "tried to push changes into the default branch, used credentials wrong way, couldn't deal with Git issues in general"
- Performance degrades significantly with weaker LLMs -- reliable results require Claude 4.5 or GPT-4o ($0.15-$0.60/task)
- Setup guides assume Docker and LLM API familiarity -- steep learning curve

**HN creator comment** (u/rbren, OpenHands co-creator): Acknowledged the limitations, noting the tool works best for "simple, tedious things like fixing merge conflicts or failing linters" and "getting an existing PR over the line."

### 1.12 vs. Our Use Case

| Dimension | OpenHands | Our tmux Orchestrator |
|-----------|-----------|----------------------|
| Agent engine | Custom CodeAct framework | Native Claude Code |
| LLM access | API keys (pay-per-token) | Claude Max subscription ($200/mo flat) |
| Sandboxing | Docker containers | tmux windows + git worktrees |
| Multi-agent | SDK delegation (threads) | tmux windows (true process isolation) |
| Observability | Web UI + VNC + OTEL + MLflow | tmux capture-pane + devlog |
| Recovery | Event replay (needs volume) | State JSON + tmux session persistence |
| MCP support | None (custom integrations) | Native first-class |
| Setup complexity | Docker-in-Docker, Python 3.12 | tmux + Claude Code CLI |
| Cost at scale | $0.15-$0.60/task (API) | Flat $200/mo unlimited |

**Verdict**: OpenHands solves a different problem. It is an agent *framework* for building custom AI agents. We use Claude Code as a *finished agent* and orchestrate multiple instances. The economic model (API pricing vs Max subscription) makes OpenHands 10-50x more expensive at our usage levels. The sandboxing is superior, but our git worktree isolation is sufficient for our trust model (we trust Claude Code, we just want parallel isolation).

---

## 2. SWE-Agent (Princeton/Stanford)

**Repo**: https://github.com/SWE-agent/SWE-agent
**Stars**: 18,972 | **Forks**: 2,050 | **Contributors**: ~50 | **License**: MIT
**Latest**: v1.0 (February 2026)
**Academic**: NeurIPS 2024 publication

### Architecture
- Agent-Computer Interface (ACI): abstraction layer for LLM agents with simplified file viewing, searching, editing
- Built on **SWE-ReX** (remote execution framework): maintains terminal sessions on local or container backends
- Sandbox options: Docker, Podman, Singularity/Apptainer, Bubblewrap, SWE-ReX (AWS/Modal)

### Key Features
- Single-agent architecture (no multi-agent delegation)
- CLI-focused, web GUI available but minimal
- Model-agnostic (Claude, GPT-4o, local models)
- SWE-bench SoTA with Claude 3.7 (February 2026)
- **EnIGMA mode**: Specialized variant for offensive cybersecurity/CTF challenges
- **mini-SWE-agent**: 100-line Python agent scoring >74% on SWE-bench Verified -- the most provocative data point in this entire evaluation. If 100 lines can match 70k-star frameworks, the scaffolding overhead is questionable.

### Docker Isolation Detail
- Uses `subprocess.run` for actions; switching to Docker is literally `docker exec` substitution
- SWE-ReX remote execution framework handles container lifecycle
- Supports Docker, Podman, Singularity/Apptainer, Bubblewrap, and cloud (AWS/Modal)
- 2x speed improvement in v1.0 from faster Docker communication

### Self-Hosted
Fully self-hostable. Lightweight Python CLI (`pip install sweagent`). Multiple sandbox backends. No enterprise deployment infrastructure. Clean, understandable codebase ideal for learning agent development.

### Verdict
Research-focused tool, excellent for benchmarking and automated issue fixing. No dashboard, no multi-agent, no recovery mechanisms. Not suitable as an orchestration platform. But the mini-SWE-agent result is a useful reality check: most agent "value" comes from the LLM, not the framework.

---

## 3. Aider

**Repo**: https://github.com/paul-gauthier/aider
**Stars**: 43,245 | **Forks**: 4,195 | **License**: Apache-2.0

### Architecture
- Terminal-based AI pair programming tool
- Operates directly on local filesystem (no sandboxing)
- Git-native: auto-stages and commits changes with descriptive messages
- Codebase mapping: understands entire project structure
- Supports 100+ languages, 100+ LLM providers

### Key Features
- Voice commands for feature requests
- IDE integration (VS Code comments trigger edits)
- Auto-linting and test running
- **No sandboxing**: runs directly in your environment
- **No multi-agent**: single agent, single session
- **No dashboard**: terminal-only

### Self-Hosted
Runs entirely locally. Supports Ollama and local models. No container infrastructure.

### Verdict
Excellent pair programming tool for individual developers. No sandboxing, no multi-agent, no orchestration. Complementary to but not competing with our architecture.

---

## 4. Bolt.new / bolt.diy (StackBlitz)

**Repo (bolt.diy)**: https://github.com/stackblitz-labs/bolt.diy
**Stars**: 19,246 | **Forks**: 10,387 | **License**: MIT

### Architecture
- Full-stack web app builder powered by AI
- Runs in browser via **WebContainers** (WASM-based Node.js runtime)
- Gives AI control over filesystem, Node server, package manager, terminal, browser console
- Templates: React, Vue, Angular, Next.js, Astro, Remix, Expo, etc.

### Self-Hosted (bolt.diy)
- Open-source fork of Bolt.new
- Self-hostable via Docker or bare metal
- Supports 19+ LLM providers including Anthropic Claude
- MIT licensed, fully open

### Key Limitations
- **Web app generation only**: not a general-purpose agent platform
- **No multi-agent**: single AI session per project
- **No sandboxing for arbitrary code**: WebContainers are browser-sandboxed but limited to Node.js ecosystem
- **No orchestration primitives**: no delegation, no parallel execution

### Verdict
Different category entirely. Bolt.diy is a vibe-coding app builder, not an agent orchestration platform. Irrelevant to our use case.

---

## 5. Windsurf

### Architecture
- Full desktop IDE (fork of VS Code) with AI agent ("Cascade")
- SaaS and Docker-based self-host options
- Cascade agent has "Turbo Mode" for auto-executing fixes
- Enterprise plan offers hybrid on-premises deployment

### Self-Hosted
Available under Enterprise plan. Docker-based. Thick client required on every workstation.

### Sandboxing
IDE-level isolation. No container-per-agent model. Agent operates in the IDE's workspace.

### Verdict
IDE-first tool. No multi-agent orchestration. No API for programmatic control. Enterprise self-hosting exists but is IDE-bound. Not relevant to our headless agent orchestration model.

---

## 6. Cline

**Marketplace**: VS Code extension (5M+ users)
**Architecture**: TypeScript extension for VS Code, JetBrains, Cursor

### Key Features
- Plan-Act loop with explicit approval gates for every file diff
- Zero telemetry by default
- Host-agnostic core via HostProvider abstraction
- Supports any LLM via configurable proxy

### Security Incident
**February 2026**: Cline was compromised via prompt injection chain that exfiltrated npm release tokens. Highlights risk of running agents with full filesystem access without sandboxing.

### Self-Hosted
Runs locally in VS Code. No Docker isolation. No multi-agent. No orchestration API.

### Verdict
Individual developer tool with strong privacy stance but no sandboxing, no multi-agent, no orchestration. The security incident validates our approach of process isolation.

---

## 7. Docker Sandboxes (`sbx`) -- THE MOST RELEVANT DISCOVERY

**Product Page**: https://www.docker.com/products/docker-sandboxes/
**Docs**: https://docs.docker.com/ai/sandboxes/
**Status**: Experimental (March 2026 launch)
**Requires**: Docker Desktop 4.60+

### What It Is
Docker Sandboxes run coding agents (including Claude Code) in **lightweight microVMs** with their own dedicated Linux kernel. This is NOT Docker-in-Docker -- each sandbox is a full microVM with its own kernel, daemon, filesystem, and network stack.

### Architecture
- Each sandbox = isolated microVM (not a container sharing host kernel)
- Own Docker daemon inside (agents can build/run containers)
- Own filesystem, network stack
- Network isolation with allow/deny lists
- **Branch mode**: multiple agents on same repo, each on its own branch

### Supported Agents (at launch)
- **Claude Code** (`sbx run claude ~/my-project`)
- Gemini CLI
- GitHub Copilot CLI
- OpenAI Codex
- OpenCode
- Kiro
- Docker Agent
- Generic shell mode

### Claude Code Specifics
- Launches with `--dangerously-skip-permissions` by default
- Authentication: API key via `sbx secret set -g anthropic` OR OAuth flow (subscription)
- Uses `docker/sandbox-templates:claude-code` base image
- Project-level `.claude` settings accessible; user-level `~/.claude` does NOT transfer
- CLI arguments pass through after `--` separator

### Parallel Agent Execution
- Multiple sandboxes run simultaneously
- **Branch mode**: each agent gets its own git branch, preventing overwrites
- Focused agents produce higher-quality work in their domain
- Clear separation makes debugging easier

### Platform Support
| Platform | Install |
|----------|---------|
| macOS | `brew install docker/tap/sbx` |
| Windows | `winget install -h Docker.sbx` |
| Linux (Ubuntu) | `docker-sbx` package + KVM group |

### Pricing
Experimental, currently bundled with Docker Desktop. No separate pricing announced yet.

### vs. Our tmux Orchestrator

| Dimension | Docker Sandboxes | tmux Orchestrator |
|-----------|-----------------|-------------------|
| Isolation | MicroVM (own kernel) | tmux window (shared OS) |
| Security | Hardware-level isolation | Process-level isolation |
| Claude Code | Native, `--dangerously-skip-permissions` | Native, `--dangerously-skip-permissions` |
| Parallel agents | Branch mode, multiple sandboxes | Multiple tmux windows + git worktrees |
| Workspace | Mounted project dir | Git worktree per worker |
| Networking | Isolated with allow/deny lists | Shared host network |
| Observability | Docker Desktop UI | tmux capture-pane |
| Recovery | Sandbox restart | tmux session persistence |
| Setup | Docker Desktop 4.60+ | tmux + Claude Code |
| Auth | API key or OAuth | Claude Max subscription |
| Maturity | Experimental (March 2026) | Proven in production |

### Verdict
**Docker Sandboxes is the closest thing to a direct upgrade for our architecture.** It provides genuine hardware-level isolation (microVM) while running native Claude Code with the same `--dangerously-skip-permissions` flag we use. Branch mode is essentially our git worktree pattern but automated. The main gaps: experimental status, Docker Desktop dependency, and unclear pricing trajectory.

**Action item**: Monitor Docker Sandboxes maturity. When it exits experimental, evaluate replacing our tmux isolation layer with `sbx` while keeping our orchestrator loop logic.

---

## 8. tmux Orchestration Ecosystem (Context for Our Approach)

The search for OpenHands alternatives revealed a growing ecosystem of tmux-based agent orchestrators -- tools that solve the same problem we do, in the same way:

| Tool | Description | Stars |
|------|-------------|-------|
| **amux** (mixpeek) | Claude Code agent multiplexer -- runs dozens of parallel AI coding agents unattended. Self-healing watchdog, shared kanban board, agent-to-agent orchestration. Browser/phone control. | ~500 |
| **dmux** (dmux.ai) | Node.js CLI that orchestrates tmux sessions + git worktrees. Does not wrap agents -- launches them in isolated environments. | ~300 |
| **workmux** (raine) | Every task gets a dedicated git worktree + tmux window. Conflict-free parallel coding. | ~200 |
| **Tmux Orchestrator** (Jedward23) | Claude agents work autonomously, schedule own check-ins, coordinate across projects. | ~100 |
| **Codex Orchestrator** | OpenAI Codex agents in parallel using tmux. | ~50 |

**Key insight**: Our architecture is not unique -- a pattern is emerging. The community independently converged on tmux + git worktrees + Claude Code as the optimal lightweight orchestration stack. This validates our approach but also means we should watch these tools for ideas (amux's watchdog, dmux's clean separation of concerns).

**amux's framing**: "sandboxed agent vs. tmux-native fleet" -- this captures the fundamental architectural divide between OpenHands (container-per-agent) and our approach (process-per-agent in tmux).

---

## Comparison Matrix

| Feature | OpenHands | SWE-Agent | Aider | bolt.diy | Windsurf | Cline | Docker Sandboxes |
|---------|-----------|-----------|-------|----------|----------|-------|-----------------|
| GitHub Stars | 71k | 19k | 43k | 19k | Closed | 5M+ users | N/A (Docker) |
| Sandboxing | Docker containers | Docker/Podman/etc | None | WebContainers | IDE-level | None | MicroVM |
| Runs Claude Code | No (uses API) | No (uses API) | No (uses API) | No (uses API) | No | No | **Yes (native)** |
| Multi-Agent | Delegation tool | No | No | No | No | No | Branch mode |
| Self-Hosted | Yes | Yes | Yes | Yes | Enterprise | Yes (VS Code) | Yes (Docker Desktop) |
| Claude Max Support | **Blocked** (API only) | **Blocked** (API only) | **Blocked** (API only) | **Blocked** (API only) | N/A | **Blocked** (API only) | **OAuth supported** |
| Dashboard/UI | Web + VNC + VSCode | CLI only | CLI only | Web UI | IDE | IDE | Docker Desktop |
| Auto-Recovery | Event replay | None | None | None | None | None | Sandbox restart |
| MCP Support | None | None | None | None | IDE plugins | IDE plugins | Via Claude Code |
| Our Use Case Fit | Low | Low | None | None | None | None | **High** |

---

## Key Findings

### 1. The OAuth Wall
Anthropic's January 2026 ban on third-party OAuth tokens is the single most important factor. Every tool that wraps Claude's API (OpenHands, SWE-Agent, Aider, bolt.diy) now requires pay-as-you-go API keys. Only tools that run Claude Code natively (our tmux orchestrator, Docker Sandboxes) can use the Max subscription.

### 2. OpenHands is Not What We Need
Despite being the most sophisticated platform, OpenHands solves a different problem. It builds custom agents around LLM APIs. We use Anthropic's finished agent (Claude Code) and orchestrate instances. The economic and architectural models are incompatible.

### 3. Docker Sandboxes is the Real Contender
Docker Sandboxes (`sbx`) is the only tool that:
- Runs Claude Code natively
- Provides hardware-level isolation (microVM)
- Supports parallel agents with branch mode
- Works with Claude Max OAuth
- Requires minimal setup changes from our current workflow

### 4. Our Architecture Remains Optimal for Now
Our tmux + git worktree approach provides:
- Zero additional infrastructure cost
- Claude Max subscription economics ($200/mo flat)
- Proven production reliability
- Full MCP protocol support
- Simple recovery via state JSON

The only genuine upgrade path is Docker Sandboxes when it exits experimental status.

---

## Recommendations

1. **Do not adopt OpenHands** -- wrong architecture, wrong economics
2. **Do not adopt SWE-Agent/Aider** -- no orchestration capabilities
3. **Monitor Docker Sandboxes** -- track `sbx` maturity, test branch mode against our git worktree pattern
4. **Prototype `sbx` integration** -- when stable, test replacing tmux windows with `sbx run claude` instances while keeping our orchestrator loop
5. **Keep current architecture** -- tmux + Claude Code + Max subscription remains the optimal cost/capability balance

---

## Sources

- [OpenHands GitHub](https://github.com/OpenHands/OpenHands)
- [OpenHands Runtime Architecture Docs](https://docs.openhands.dev/openhands/usage/architecture/runtime)
- [OpenHands SDK Paper (arXiv:2511.03690)](https://arxiv.org/html/2511.03690v1)
- [OpenHands Sub-Agent Delegation Docs](https://docs.openhands.dev/sdk/guides/agent-delegation)
- [OpenHands Local Setup Docs](https://docs.openhands.dev/openhands/usage/run-openhands/local-setup)
- [OpenHands Review 2026 (vibecoding.app)](https://vibecoding.app/blog/openhands-review)
- [OpenHands vs SWE-Agent Comparison](https://localaimaster.com/blog/openhands-vs-swe-agent)
- [Claude Code vs OpenHands Comparison](https://www.lowcode.agency/blog/claude-code-vs-openhands)
- [MLflow + OpenHands Observability](https://mlflow.org/blog/mlflow-openhands)
- [Anthropic OAuth Ban (The Register)](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/)
- [Anthropic OAuth Ban Analysis (MindStudio)](https://www.mindstudio.ai/blog/anthropic-openclaw-ban-oauth-authentication)
- [SWE-Agent GitHub](https://github.com/SWE-agent/SWE-agent)
- [SWE-ReX GitHub](https://github.com/SWE-agent/SWE-ReX)
- [Aider GitHub](https://github.com/paul-gauthier/aider)
- [bolt.diy GitHub](https://github.com/stackblitz-labs/bolt.diy)
- [Docker Sandboxes Product Page](https://www.docker.com/products/docker-sandboxes/)
- [Docker Sandboxes Docs](https://docs.docker.com/ai/sandboxes/)
- [Docker Sandboxes Claude Code Setup](https://docs.docker.com/ai/sandboxes/agents/claude-code/)
- [Docker Sandboxes Blog Post](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [Cline Security Incident (Bunnyshell)](https://www.bunnyshell.com/guides/coding-agent-sandbox/)
- [OpenHands #1 on SWE-bench (X/Twitter)](https://x.com/allhands_ai/status/1921921598635815129)
- [OpenHands Index Launch (January 2026)](https://openhands.dev/blog/openhands-index)
- [SWE-bench February 2026 Leaderboard (simonwillison.net)](https://simonwillison.net/2026/Feb/19/swe-bench/)
- [OpenHands Observability Docs](https://docs.openhands.dev/sdk/guides/observability)
- [OpenHands Dashboard Feature Request (GitHub #8916)](https://github.com/OpenHands/OpenHands/issues/8916)
- [Real-world OpenHands Experience (Medium)](https://medium.com/@mchechulin/real-world-experience-with-development-using-ai-and-openhands-61d267bc6cd2)
- [HN: Thoughts on Devin + OpenHands creator response](https://news.ycombinator.com/item?id=42736810)
- [Open-Source AI Coding Agents 2026 Comparison](https://wetheflywheel.com/en/guides/open-source-ai-coding-agents-2026/)
- [Mini-SWE-Agent (100 lines, 74% SWE-bench)](https://github.com/SWE-agent/mini-swe-agent)
- [amux - tmux agent multiplexer](https://github.com/mixpeek/amux)
- [dmux - parallel agents with tmux and worktrees](https://dmux.ai/)
- [workmux - parallel AI agents in terminal](https://workmux.raine.dev/)
- [Anthropic OAuth cutoff announcement (April 2026)](https://www.threads.com/@boris_cherny/post/DWsAWeND5nm)
- [SWE-MiniSandbox: Container-Free RL for Agents (arXiv)](https://arxiv.org/html/2602.11210v3)
