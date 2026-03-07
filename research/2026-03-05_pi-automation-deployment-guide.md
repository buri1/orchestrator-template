# Pi Agent Automation & Deployment Guide

**Date:** 2026-03-05
**Type:** Practical Research Guide
**Scope:** Automating, scheduling, and deploying Pi Agent (and coding agents generally) to run autonomously

---

## Table of Contents

1. [The Automation Landscape in 2026](#the-automation-landscape-in-2026)
2. [Execution Modes: How to Run an Agent Headlessly](#execution-modes)
3. [Trigger.dev: Event-Driven Agent Orchestration](#triggerdev)
4. [Scheduling Approaches: Cron, GitHub Actions, Schedulers](#scheduling-approaches)
5. [Deployment Targets: Where to Run Agents](#deployment-targets)
6. [Workflow Orchestration Frameworks](#workflow-orchestration-frameworks)
7. [The Claude Agent SDK: Programmatic Control](#claude-agent-sdk)
8. [Sandbox Environments: E2B and Daytona](#sandbox-environments)
9. [Self-Hosted VPS + tmux: The Battle-Tested Pattern](#self-hosted-vps-tmux)
10. [Failure Handling & Retry Strategies](#failure-handling)
11. [Cost Management for Automated Runs](#cost-management)
12. [Reference Architectures](#reference-architectures)
13. [Recommendations for Pi Agent](#recommendations-for-pi-agent)

---

## 1. The Automation Landscape in 2026 <a name="the-automation-landscape-in-2026"></a>

The consensus from the industry in early 2026 is clear: **2025 was the year of AI agents; 2026 is the year of the sandbox and deployment infrastructure**. Gartner predicts that 40% of enterprise applications will feature task-specific AI agents by end of 2026, up from less than 5% in 2025. The tools and patterns for running agents autonomously have matured significantly.

Key developments shaping the landscape:

- **Claude Code 2.0** (Sep 2025) introduced 30-hour autonomous coding sessions and subagent orchestration
- **Agent Teams** (Feb 2026, alongside Opus 4.6) enabled multi-agent coordination with shared task lists and direct messaging
- **OpenAI Codex** demonstrated million-line codebases built entirely by agents with human guidance through PRs
- **Trigger.dev** pivoted fully to "build and deploy fully-managed AI agents and workflows"
- **E2B + Docker partnership** brought sandbox-as-a-service to the mainstream
- **Daytona** pivoted from dev environments to AI code execution infrastructure

The practical question is no longer "can agents work autonomously?" but rather "how do I trigger them, where do I run them, and how do I manage cost and failure?"

---

## 2. Execution Modes: How to Run an Agent Headlessly <a name="execution-modes"></a>

Before choosing a deployment strategy, you need to understand the execution modes available for coding agents.

### 2.1 CLI Headless Mode (--print / -p)

The most fundamental pattern. Run the agent non-interactively from any script, cron job, or CI pipeline:

```bash
# Basic headless execution
claude -p "Review all files in src/ for security vulnerabilities" \
  --output-format json \
  --dangerously-skip-permissions

# With turn limits to control cost
claude -p "Fix the failing test in tests/auth.test.ts" \
  --max-turns 25 \
  --output-format stream-json \
  --dangerously-skip-permissions

# Pi equivalent (adapt flags to Pi's CLI interface)
pi --headless --prompt "Refactor the database module" \
  --max-iterations 30
```

**Output formats matter for automation:**
- `text` -- human-readable, good for logs
- `json` -- structured, good for post-processing and result extraction
- `stream-json` -- real-time streaming, good for dashboards and live monitoring

### 2.2 SDK / Programmatic Mode

The Claude Agent SDK (TypeScript and Python) provides full programmatic control. It works by spawning a Claude Code CLI process as a subprocess, giving you:

- Programmatic subagent definition (no filesystem dependency)
- Custom spawn functions for VMs, containers, or remote environments
- Hooks at lifecycle points (agent start, file modification, tool use)
- Context management and token tracking
- Permission mode control (`manual`, `acceptEdits`, `acceptAll`)

For Pi Agent, the equivalent is using Pi's SDK or API layer to spawn and control agents programmatically.

### 2.3 Docker Container Mode

Running the agent inside an isolated Docker container with full permissions:

```dockerfile
FROM node:20-slim
RUN npm install -g @anthropic-ai/claude-code
ENV ANTHROPIC_API_KEY=your-key
WORKDIR /workspace
COPY . .
CMD ["claude", "-p", "Your prompt here", "--dangerously-skip-permissions"]
```

This pattern is foundational for all cloud deployment strategies. As of early 2026, there is no official Anthropic Docker image, but community projects like `claudebox` and `klaude` provide production-ready containers.

---

## 3. Trigger.dev: Event-Driven Agent Orchestration <a name="triggerdev"></a>

[Trigger.dev](https://trigger.dev/) is the strongest candidate for orchestrating agent runs at scale. It is an open-source TypeScript platform for building background jobs, cron jobs, and event-driven workflows with features specifically designed for AI agents.

### 3.1 Why Trigger.dev Fits

| Feature | Why It Matters for Agent Automation |
|---------|-------------------------------------|
| **No timeouts** | Unlike Lambda (15 min) or Vercel (60s), tasks run indefinitely -- critical for long agent sessions |
| **Checkpoint-Resume** | Tasks can pause, save state, and resume -- handles agent interruptions gracefully |
| **Fan-Out Pattern** | An orchestrator task spawns N child tasks in parallel, waits for all, aggregates results |
| **Retries with backoff** | Automatic retry on failure with configurable strategies |
| **Queues** | Rate-limit concurrent agent runs to control cost |
| **Full observability** | Logs, traces, and metrics for every agent run |
| **Cron scheduling** | Native cron expression support for scheduled agent tasks |

### 3.2 Integration Architecture

Trigger.dev does not natively "run Pi" -- but it provides the orchestration layer. The pattern is:

```typescript
import { task, schedules } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";

// Define an agent task
export const runPiAgent = task({
  id: "run-pi-agent",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
  },
  run: async (payload: { prompt: string; repo: string }) => {
    // Clone or checkout the target repo
    await exec(`git clone ${payload.repo} /tmp/workspace`);

    // Spawn the agent as a subprocess
    const result = await exec(
      `cd /tmp/workspace && claude -p "${payload.prompt}" \
        --output-format json \
        --dangerously-skip-permissions \
        --max-turns 50`
    );

    // Parse and return structured results
    return JSON.parse(result.stdout);
  },
});

// Schedule it with cron
export const dailyCodeReview = schedules.task({
  id: "daily-code-review",
  cron: "0 9 * * 1-5", // Weekdays at 9 AM
  run: async () => {
    await runPiAgent.trigger({
      prompt: "Review all changes from the last 24 hours for bugs and security issues",
      repo: "https://github.com/org/repo.git",
    });
  },
});
```

### 3.3 Trigger.dev + Claude Code Skills

In 2026, Trigger.dev added an "Agent Skills" standard that works with Claude Code, Cursor, Windsurf, and other AI coding assistants. When you install Trigger.dev rules for Claude Code, it provides a `trigger-dev-expert` subagent that knows how to write well-structured Trigger.dev code. This makes it possible to have Claude Code itself write and maintain your Trigger.dev automation tasks.

### 3.4 Deployment Options

Trigger.dev offers:
- **Trigger.dev Cloud** -- fully managed, zero infrastructure
- **Self-hosted** -- deploy on your own infrastructure with Docker
- Both options support elastic scaling of agent workers

---

## 4. Scheduling Approaches <a name="scheduling-approaches"></a>

### 4.1 System Cron (Linux/macOS)

The simplest approach. Write a bash script, schedule with crontab:

```bash
#!/bin/bash
# /home/user/scripts/pi-daily-review.sh

export ANTHROPIC_API_KEY="sk-..."
cd /path/to/project

RESULT=$(claude -p "Review recent changes, run tests, report issues" \
  --output-format json \
  --dangerously-skip-permissions \
  --max-turns 30 2>&1)

# Post results to Slack
curl -X POST "$SLACK_WEBHOOK" \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"Daily Review Complete: $RESULT\"}"
```

```cron
# crontab -e
0 9 * * 1-5 /home/user/scripts/pi-daily-review.sh >> /var/log/pi-agent.log 2>&1
```

**Limitations:** No retry logic, no observability, no queue management. Fine for simple recurring tasks; insufficient for production-scale automation.

### 4.2 GitHub Actions (Recommended for Repo-Scoped Work)

Anthropic provides an official `anthropics/claude-code-action` for GitHub Actions:

```yaml
name: Daily Code Review
on:
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays 9 AM UTC
  workflow_dispatch:         # Manual trigger

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          prompt: |
            Analyze all commits from the last 24 hours.
            Check for bugs, security issues, and missing tests.
            Create a summary issue with findings.
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 30
```

**Advantages over raw cron:** Secret management, logging, error notifications, artifact storage, matrix builds for parallel runs across repos.

### 4.3 Specialized Schedulers

Several tools have emerged specifically for scheduling coding agent runs:

- **[claude-code-scheduler](https://github.com/jshchnz/claude-code-scheduler)** -- "Put Claude on autopilot." Schedule code reviews, test runs, and maintenance tasks with natural language descriptions that get translated to cron expressions.
- **[claude-tasks](https://github.com/kylemclaren/claude-tasks)** -- TUI scheduler with 6-field cron expressions, Discord/Slack webhook integration, and usage tracking.
- **[claude-mcp-scheduler](https://github.com/tonybentley/claude-mcp-scheduler)** -- Integrates cron scheduling with MCP servers for tool-augmented scheduled runs.
- **[runCLAUDErun](https://runclauderun.com/)** -- macOS-native scheduler for Claude Code, runs in the background.

These can serve as reference implementations or direct tools for Pi agent scheduling.

---

## 5. Deployment Targets: Where to Run Agents <a name="deployment-targets"></a>

### 5.1 Comparison Matrix

| Target | Startup | Cost | Isolation | Persistence | Best For |
|--------|---------|------|-----------|-------------|----------|
| **Local machine** | Instant | Free (API only) | None | Full | Development, testing |
| **VPS + tmux** | Seconds | $5-50/mo | OS-level | Full | Always-on agents, small teams |
| **Docker (self-hosted)** | Seconds | $10-100/mo | Container | Per-run | CI/CD, scheduled tasks |
| **E2B Sandbox** | <200ms | Per-use | Firecracker VM | Ephemeral | Untrusted code, sandboxed exec |
| **Daytona Sandbox** | <60ms | Per-use | VM-level | Configurable | Code execution, browser use |
| **GitHub Actions** | 30-60s | Per-minute | Container | Ephemeral | Repo-scoped automation |
| **Trigger.dev Cloud** | Seconds | Per-use | Container | Checkpoint | Event-driven orchestration |
| **Cloud Run / Lambda** | Seconds | Per-invocation | Container | Ephemeral | Webhook-triggered runs |
| **Kubernetes** | Variable | Cluster cost | Pod-level | Configurable | Enterprise scale |

### 5.2 Cloud Functions (Lambda, Cloud Run)

**Challenge:** Most serverless platforms have hard timeout limits (Lambda: 15 min, Cloud Run: 60 min). Coding agents often need 30+ minutes for complex tasks.

**Workaround patterns:**
- Use Cloud Run with max timeout (60 min) for bounded tasks
- For longer tasks, use Cloud Run Jobs (no HTTP timeout constraints)
- Trigger.dev's checkpoint-resume works around this entirely

### 5.3 Kubernetes

For enterprise-scale deployments with many concurrent agents:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-agent-task
spec:
  template:
    spec:
      containers:
      - name: pi-agent
        image: your-registry/pi-agent:latest
        env:
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: anthropic
        command: ["claude", "-p", "$(TASK_PROMPT)",
                  "--dangerously-skip-permissions",
                  "--output-format", "json"]
      restartPolicy: OnFailure
  backoffLimit: 3
```

---

## 6. Workflow Orchestration Frameworks <a name="workflow-orchestration-frameworks"></a>

Beyond Trigger.dev, several frameworks can orchestrate agent runs:

### 6.1 Temporal.io

**Best for:** Mission-critical reliability, complex multi-step agent workflows.

Temporal provides durable workflow execution with automatic state persistence. If a worker crashes mid-agent-run, Temporal replays the workflow from the last checkpoint. As of early 2026, Temporal has GA'd Temporal Nexus (cross-namespace workflows) and multi-region replication with 99.99% SLA.

**Fit for Pi agents:** Excellent for workflows where an agent run is one step in a larger pipeline (e.g., "clone repo -> run agent -> review output -> create PR -> notify team"). The overhead of running Temporal infrastructure is justified only at enterprise scale.

### 6.2 Inngest

**Best for:** Serverless, event-driven agent triggers without infrastructure management.

Inngest provides durable functions that replace queues, state management, and scheduling. It takes a serverless, event-driven approach -- you define functions that respond to events, and Inngest handles retries, concurrency, and step management.

**Fit for Pi agents:** Good for webhook-triggered agent runs (e.g., "on PR opened, run code review agent"). Lower infrastructure overhead than Temporal. TypeScript-native.

### 6.3 Prefect

**Best for:** Python-native ML/data pipelines that include agent steps.

Prefect is a Python orchestration platform where workflows are Python code with decorators. Less relevant for TypeScript-based coding agent automation, but useful if your pipeline is primarily Python.

### 6.4 n8n

**Best for:** Visual workflow building with coding agent integration.

n8n provides a visual canvas for building automation workflows, with 1,236+ integration nodes. The n8n-MCP and n8n-skills projects enable Claude Code to directly create and manage n8n workflows. The "self-building workflow" pattern -- where an agent architects, tests, and deploys its own automation pipeline -- is emerging as a powerful paradigm.

### 6.5 Comparison Summary

| Framework | Language | Self-Hosted | Serverless Option | Agent Fit |
|-----------|----------|-------------|-------------------|-----------|
| **Trigger.dev** | TypeScript | Yes | Yes (Cloud) | Purpose-built for agents |
| **Temporal.io** | Multi-lang | Yes | Yes (Cloud) | Enterprise-grade durability |
| **Inngest** | TypeScript | No | Yes | Event-driven simplicity |
| **Prefect** | Python | Yes | Yes (Cloud) | ML/data pipeline focus |
| **n8n** | TypeScript | Yes | Yes (Cloud) | Visual workflow building |

---

## 7. The Claude Agent SDK: Programmatic Control <a name="claude-agent-sdk"></a>

The Claude Agent SDK (formerly Claude Code SDK, renamed Sep 2025) is the most direct path to programmatic agent control. As of early 2026, it has 1.85M+ weekly npm downloads.

### 7.1 Core Architecture

The SDK spawns a Claude Code CLI process as a subprocess. This means:
- You need Claude Code installed in your deployment environment
- The SDK manages the process lifecycle, I/O, and result parsing
- Custom spawn functions allow running in VMs, containers, or remote environments

### 7.2 Key Capabilities for Automation

**Subagent Definition (Inline):**
```typescript
import { ClaudeAgent } from "@anthropic-ai/claude-agent-sdk";

const agent = new ClaudeAgent({
  agents: [{
    name: "code-reviewer",
    description: "Reviews code for bugs and security issues",
    tools: ["Read", "Grep", "Glob"],
    prompt: "You are a senior code reviewer. Focus on security and correctness."
  }],
  permissionMode: "acceptAll",
  maxTurns: 50,
});

const result = await agent.run("Review all TypeScript files in src/");
```

**Hooks for Lifecycle Events:**
```typescript
const agent = new ClaudeAgent({
  hooks: {
    onSubagentStart: async (subagent) => {
      console.log(`Agent ${subagent.name} started`);
      await notifySlack(`Agent started: ${subagent.name}`);
    },
    onFileModified: async (filePath) => {
      await runLinter(filePath);
    },
    onComplete: async (result) => {
      await saveResults(result);
      await notifySlack(`Agent complete. Tokens used: ${result.usage.total}`);
    }
  }
});
```

**Cost Tracking:**
The SDK provides detailed token usage per interaction, enabling real-time cost monitoring and automated budget enforcement.

### 7.3 Applying to Pi Agent

Pi Agent's architecture should provide equivalent programmatic capabilities. The key interfaces to look for or build:

1. **Headless execution** -- CLI flag or API endpoint for non-interactive runs
2. **Structured output** -- JSON or streaming output format for machine consumption
3. **Subprocess spawning** -- SDK that spawns and manages agent processes
4. **Lifecycle hooks** -- Events for start, progress, error, and completion
5. **Cost/token tracking** -- Usage reporting per run for budget management

---

## 8. Sandbox Environments: E2B and Daytona <a name="sandbox-environments"></a>

When running agents autonomously, isolation is critical. You do not want an agent with `--dangerously-skip-permissions` accidentally deleting production data.

### 8.1 E2B (e2b.dev)

E2B provides cloud sandboxes using Firecracker microVMs (the same tech behind AWS Lambda):

- **Startup time:** <200ms, no cold starts
- **Isolation:** Each execution runs in its own kernel (hardware-level isolation)
- **Docker partnership:** Every E2B sandbox includes access to Docker's MCP Catalog (200+ tools)
- **Deployment:** Cloud, BYOC (Bring Your Own Cloud), or self-hosted
- **SDK:** Python and TypeScript SDKs for programmatic sandbox management

**Usage pattern for Pi agents:**
```typescript
import { Sandbox } from 'e2b';

const sandbox = await Sandbox.create();

// Install Pi agent in the sandbox
await sandbox.process.start({ cmd: 'npm install -g pi-agent' });

// Run the agent
const result = await sandbox.process.start({
  cmd: 'pi --headless --prompt "Refactor auth module" --output-format json',
  envs: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
});

// Get results
console.log(result.stdout);
await sandbox.close();
```

### 8.2 Daytona (daytona.io)

Daytona provides "composable computers for AI agents" with a focus on stateful, long-running workloads:

- **Startup time:** <60ms
- **Focus:** Coding agents, command execution, browser-use systems, RL training
- **Deployment:** Daytona Cloud, customer-managed compute, or self-hosted (including EKS)
- **Pivoted** Feb 2025 from dev environments to AI code execution infrastructure

**Key difference from E2B:** Daytona emphasizes statefulness -- sandboxes can persist across runs, making them suitable for iterative agent workflows where the agent needs to pick up where it left off.

### 8.3 When to Use Sandboxes

| Scenario | Sandbox Needed? |
|----------|-----------------|
| Agent runs on your own codebase | Maybe -- depends on trust level |
| Agent runs untrusted/generated code | Yes -- mandatory |
| Agent has shell access | Yes -- recommended |
| Agent modifies files and runs tests | Yes -- recommended for isolation |
| Agent only reads and analyzes | No -- but still good practice |

---

## 9. Self-Hosted VPS + tmux: The Battle-Tested Pattern <a name="self-hosted-vps-tmux"></a>

For teams that want full control, the VPS + tmux pattern remains the most practical approach in 2026.

### 9.1 Architecture

```
VPS (Ubuntu, 4-8 CPU, 16-32GB RAM)
 |
 +-- tmux session: "pi-agents"
 |    +-- window 0: orchestrator (monitors and coordinates)
 |    +-- window 1: agent-backend (working on backend tasks)
 |    +-- window 2: agent-frontend (working on frontend tasks)
 |    +-- window 3: agent-tests (running test suites)
 |
 +-- cron: schedules agent runs
 +-- webhook server: triggers agent runs on events
 +-- monitoring: collects logs, tracks costs
```

### 9.2 Bootstrap Script

The [agentic_coding_flywheel_setup](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup) project can bootstrap a fresh Ubuntu VPS into a complete multi-agent AI development environment in 30 minutes, with coding agents, session management, safety tools, and coordination infrastructure.

### 9.3 Key Patterns

**The Ralph Loop (Ralph Wiggum Pattern):**
Popularized mid-2025. Run an agent in a loop, re-feeding it with updated context until success criteria are met:

```bash
#!/bin/bash
MAX_ATTEMPTS=5
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  RESULT=$(claude -p "Continue working on the task described in TASK.md. \
    Check PROGRESS.md for what's been done." \
    --output-format json \
    --dangerously-skip-permissions \
    --max-turns 50)

  # Check if task is complete
  if echo "$RESULT" | jq -e '.result | contains("TASK COMPLETE")' > /dev/null; then
    echo "Task completed on attempt $((ATTEMPT+1))"
    break
  fi

  ATTEMPT=$((ATTEMPT+1))
  echo "Attempt $((ATTEMPT)) incomplete, retrying..."
done
```

**The Handoff Pattern:**
Cycle worker agents onto a "new shift" -- clear context while preserving session state in a tmux window. This is exactly what the L-Thread Orchestrator's `orchestrator-handoff.sh` script does.

**Tmux Session Persistence:**
Sessions survive terminal disconnects, SSH drops, and even reboots (with tmux-resurrect). Critical for long-running agent tasks. Pair with `mosh` and Tailscale for reliable remote access from any device.

### 9.4 Recommended VPS Providers (2026)

| Provider | Min Plan | Notes |
|----------|----------|-------|
| Hetzner | ~$5/mo | Best value, EU data centers |
| DigitalOcean | ~$12/mo | Good developer experience |
| Linode (Akamai) | ~$12/mo | Reliable, good networking |
| AWS Lightsail | ~$10/mo | If you need AWS ecosystem |
| Fly.io | Per-use | Container-native, global edge |

---

## 10. Failure Handling & Retry Strategies <a name="failure-handling"></a>

Automated agent runs will fail. The question is how gracefully.

### 10.1 Error Classification

| Error Type | Code | Strategy |
|------------|------|----------|
| Rate limit | 429 | Exponential backoff, respect Retry-After header |
| Server error | 500/502/503 | Retry with backoff (transient, usually resolves in minutes) |
| Overloaded | 529 | Back off significantly, consider switching models |
| Auth failure | 401/403 | Do not retry -- fix API key or permissions |
| Context overflow | -- | Reduce prompt size, clear conversation history |
| Agent stuck | -- | Kill after timeout, restart with narrower prompt |

### 10.2 Exponential Backoff with Jitter

```bash
BASE_DELAY=1
MAX_DELAY=3600  # 1 hour cap
JITTER_FACTOR=0.25

delay() {
  local attempt=$1
  local base=$((BASE_DELAY * (2 ** (attempt - 1))))
  local capped=$((base > MAX_DELAY ? MAX_DELAY : base))
  local jitter=$(echo "$capped * $JITTER_FACTOR" | bc)
  local final=$(echo "$capped + ($RANDOM % ($jitter * 2 + 1)) - $jitter" | bc)
  echo "${final%.*}"
}
```

### 10.3 Circuit Breaker Pattern

For production systems, implement a circuit breaker:

- **CLOSED** (normal): Requests flow through. Track failure count.
- **OPEN** (failures exceeded threshold): All requests immediately fail. Wait for recovery period.
- **HALF_OPEN** (testing recovery): Allow one request through. If it succeeds, go CLOSED. If it fails, go OPEN.

This prevents hammering a failing API and burning through budget on failed requests.

### 10.4 Multi-Model Fallback

When using automated pipelines, define fallback models:

```
Primary: claude-opus-4-6 (highest capability)
Fallback 1: claude-sonnet-4-6 (lower cost, still capable)
Fallback 2: gpt-5-mini (cross-provider fallback)
```

Set a minimum-success threshold (e.g., 2 out of 3 parallel agents must succeed) and proceed with partial results rather than failing entirely.

---

## 11. Cost Management for Automated Runs <a name="cost-management"></a>

Automated agents can burn through API budgets quickly if not controlled.

### 11.1 Cost Benchmarks (2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical Agent Session |
|-------|----------------------|------------------------|----------------------|
| Claude Opus 4.6 | $15 | $75 | $5-25 per run |
| Claude Sonnet 4.6 | $3 | $15 | $1-5 per run |
| GPT-5.2-Codex | Varies | Varies | $2-10 per run |

Average cost for Claude Code users: ~$6/developer/day, with 90% of users below $12/day.

### 11.2 Cost Control Strategies

1. **Use Sonnet for routine tasks.** Reserve Opus for complex architectural work. Sonnet is 5x cheaper and handles code review, test writing, and simple refactoring well.

2. **Set `--max-turns` on every automated run.** This is the single most important cost control. A runaway agent without turn limits can consume hundreds of dollars.

3. **Implement spend limits per task.** Track cumulative token usage and kill the agent if it exceeds the budget:
   ```bash
   # Monitor token usage in stream-json output
   claude -p "..." --output-format stream-json | while read line; do
     TOKENS=$(echo "$line" | jq '.usage.total_tokens // 0')
     if [ "$TOKENS" -gt 100000 ]; then
       kill $CLAUDE_PID
       echo "Budget exceeded"
       break
     fi
   done
   ```

4. **Queue concurrent runs.** Don't run 10 agents simultaneously unless necessary. Use Trigger.dev queues or a simple semaphore to limit concurrency.

5. **Agent Teams multiply cost.** Each teammate runs its own context window. Token usage is roughly proportional to team size. Claude Code Agent Teams use ~4x more tokens than single-agent runs for the same task.

6. **Clean up idle agents.** Active teammates continue consuming tokens even when idle. Shut down teams when work is done.

7. **Use Datadog or custom dashboards.** Anthropic provides usage data via API. Datadog has a native integration for monitoring Claude usage and costs.

### 11.3 Budget Automation

```typescript
// Trigger.dev task with cost guard
export const costGuardedAgentRun = task({
  id: "cost-guarded-agent",
  run: async (payload: { prompt: string; maxBudgetUsd: number }) => {
    const startUsage = await getAccountUsage();

    const result = await runAgent(payload.prompt);

    const endUsage = await getAccountUsage();
    const cost = endUsage.totalCost - startUsage.totalCost;

    if (cost > payload.maxBudgetUsd) {
      await notifySlack(`Agent run exceeded budget: $${cost} > $${payload.maxBudgetUsd}`);
    }

    return { result, cost };
  },
});
```

---

## 12. Reference Architectures <a name="reference-architectures"></a>

### 12.1 Small Team / Solo Developer

```
GitHub Actions (cron schedule)
  -> claude-code-action
  -> Posts results to Slack/Discord
  -> Creates GitHub Issues for findings

Cost: ~$30-100/month in API usage
Infrastructure: $0 (GitHub Actions free tier)
```

### 12.2 Startup / Growing Team

```
Trigger.dev Cloud
  -> Scheduled tasks (daily reviews, weekly audits)
  -> Webhook triggers (PR opened, issue created)
  -> Fan-out pattern for parallel agent work
  -> Results stored in database
  -> Slack notifications

Cost: ~$100-500/month in API usage + Trigger.dev pricing
Infrastructure: Managed by Trigger.dev
```

### 12.3 Enterprise / Production Scale

```
VPS Cluster (3-5 servers)
  -> Temporal.io for workflow orchestration
  -> E2B/Daytona sandboxes for isolated execution
  -> Kubernetes for scaling agent workers
  -> Custom monitoring dashboard (Grafana + Prometheus)
  -> Circuit breakers and multi-model fallback
  -> Cost tracking per team/project

Cost: $500-5000/month in API usage + infrastructure
Infrastructure: Self-managed or cloud-managed
```

### 12.4 The L-Thread Orchestrator Pattern (This Project)

This project already implements a sophisticated agent orchestration system. The automation layer would be:

```
Cron / Webhook / Trigger.dev
  -> Spawns L-Thread Orchestrator session (tmux)
  -> Orchestrator reads task backlog from state file
  -> Spawns agent workers in tmux panes (Conduit mode)
     or Task tool workers (Teams mode)
  -> Monitors progress via terminal-read / messages
  -> Handles roadblocks via roadblock-recovery
  -> Reports results and updates state
  -> Session persists via tmux crash protection
```

The `_bmad/orchestrator-tmux-state.json` state file and `orchestrator-handoff.sh` script already handle session persistence and context handoff -- these are the building blocks for automated deployment.

---

## 13. Recommendations for Pi Agent <a name="recommendations-for-pi-agent"></a>

Based on this research, here is the recommended approach for automating and deploying Pi agents, ordered from simplest to most sophisticated:

### Tier 1: Start Here (Day 1)

1. **Cron + headless CLI.** Write a bash script that runs Pi in headless mode with `--max-turns` and structured output. Schedule with cron. Log results. This gets you automated runs with zero infrastructure.

2. **GitHub Actions for repo-scoped work.** Use scheduled workflows for daily code review, test runs, and audits. Free tier gives you 2,000 minutes/month.

### Tier 2: Scale Up (Week 2-4)

3. **Trigger.dev for orchestration.** Move your cron scripts into Trigger.dev tasks. Get retries, queues, observability, and webhook triggers. Use the fan-out pattern for parallel agent runs.

4. **Docker containers for isolation.** Wrap your agent setup in a Dockerfile. Run it anywhere -- local, VPS, Kubernetes, or Trigger.dev workers.

### Tier 3: Production Grade (Month 2+)

5. **VPS + tmux for always-on agents.** Deploy to a Hetzner or DigitalOcean VPS. Use the L-Thread Orchestrator pattern with tmux persistence. Add mosh + Tailscale for remote access.

6. **E2B/Daytona sandboxes for untrusted execution.** When agents generate and run code, isolate them in sandboxes. Critical for security.

7. **Cost monitoring and circuit breakers.** Implement spend limits, multi-model fallback, and alerting. Use the Claude Agent SDK's token tracking or Datadog's Anthropic integration.

### The Full Stack

```
Trigger Event (cron / webhook / manual)
  |
  v
Orchestration Layer (Trigger.dev / Temporal / GitHub Actions)
  |
  v
Agent Execution (Pi CLI headless / Claude Agent SDK / Docker)
  |
  v
Isolation Layer (E2B / Daytona / Docker / VPS tmux)
  |
  v
Result Collection (JSON output / webhook / database)
  |
  v
Monitoring & Alerting (Datadog / Grafana / Slack)
  |
  v
Cost Management (spend limits / model selection / turn caps)
```

---

## Sources

- [Trigger.dev - Build and deploy fully-managed AI agents and workflows](https://trigger.dev/)
- [Trigger.dev AI Agents Product Page](https://trigger.dev/product/ai-agents)
- [Trigger.dev AI Agents Overview Docs](https://trigger.dev/docs/guides/ai-agents/overview)
- [Trigger.dev Agent Skills](https://trigger.dev/changelog/skills)
- [Trigger.dev Deep Dive: Background Jobs, Queue Fan-Out, MCP](https://vadim.blog/trigger-dev-deep-dive)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Agent SDK TypeScript Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Claude Agent SDK - Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Claude Agent SDK - Cost Tracking](https://platform.claude.com/docs/en/agent-sdk/cost-tracking)
- [Claude Agent SDK on npm](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- [Building Agents with the Claude Agent SDK (Anthropic Engineering)](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Effective Harnesses for Long-Running Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Enabling Claude Code to Work More Autonomously (Anthropic)](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- [Run Claude Code Programmatically - Headless Mode Docs](https://code.claude.com/docs/en/headless)
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code Cost Management](https://code.claude.com/docs/en/costs)
- [Claude Code Cron Automation Guide (SmartScope)](https://smartscope.blog/en/generative-ai/claude/claude-code-cron-schedule-automation-complete-guide-2025/)
- [Claude Code Scheduled Automation with GitHub Actions (SmartScope)](https://smartscope.blog/en/generative-ai/claude/claude-code-scheduled-automation-guide/)
- [Claude Code Error Handling and Retry Deep Dive (SmartScope)](https://smartscope.blog/en/generative-ai/claude/claude-code-cron-error-handling-retry-deep-dive/)
- [Docker Sandboxes: Run Claude Code Safely](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [E2B - The Enterprise AI Agent Cloud](https://e2b.dev/)
- [Docker + E2B Partnership](https://www.docker.com/blog/docker-e2b-building-the-future-of-trusted-ai/)
- [Daytona - Secure Infrastructure for AI-Generated Code](https://www.daytona.io/)
- [Daytona vs E2B in 2026 (Northflank)](https://northflank.com/blog/daytona-vs-e2b-ai-code-execution-sandboxes)
- [Agentic Coding Flywheel Setup (VPS Bootstrap)](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup)
- [claude-code-scheduler (GitHub)](https://github.com/jshchnz/claude-code-scheduler)
- [claude-tasks (GitHub)](https://github.com/kylemclaren/claude-tasks)
- [claude-mcp-scheduler (GitHub)](https://github.com/tonybentley/claude-mcp-scheduler)
- [runCLAUDErun - macOS Scheduler](https://runclauderun.com/)
- [anthropics/claude-code-action (GitHub)](https://github.com/anthropics/claude-code-action)
- [claudebox - Docker Dev Environment (GitHub)](https://github.com/RchGrav/claudebox)
- [klaude - Dockerized Claude Code (GitHub)](https://github.com/farmer1st/klaude)
- [Temporal.io for AI](https://temporal.io/solutions/ai)
- [Durable Multi-Agentic AI with Temporal](https://temporal.io/blog/using-multi-agent-architectures-with-temporal)
- [Inngest - AI and Backend Workflows](https://www.inngest.com/)
- [Ultimate Guide: Temporal vs Trigger.dev vs Inngest (Medium)](https://medium.com/@matthieumordrel/the-ultimate-guide-to-typescript-orchestration-temporal-vs-trigger-dev-vs-inngest-and-beyond-29e1147c8f2d)
- [n8n AI Workflow Automation](https://n8n.io/ai/)
- [Claude Code n8n Workflows: Self-Building Agents](https://www.ability.ai/blog/claude-code-n8n-workflows)
- [Codex-Orchestrator: Parallel Agents with tmux (Medium)](https://medium.com/coding-nexus/codex-orchestrator-run-openai-codex-agents-in-parallel-using-tmux-8e89edc6f6bd)
- [OpenAI Codex App Architecture (InfoQ)](https://www.infoq.com/news/2026/02/opanai-codex-app-server/)
- [OpenAI Harness Engineering with Codex (InfoQ)](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex/)
- [Anthropic Usage and Costs with Datadog](https://www.datadoghq.com/blog/anthropic-usage-and-costs/)
- [Claude Code Token Limits Guide (Faros AI)](https://www.faros.ai/blog/claude-code-token-limits)
