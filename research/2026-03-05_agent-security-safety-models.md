# Agent Security, Safety, and Permission Models for Multi-Agent Systems

**Research Date:** 2026-03-05
**Context:** Deep research for L-Thread Orchestrator project -- understanding the security landscape for multi-agent coding systems, attack vectors, sandboxing strategies, permission models, and audit patterns.

---

## Table of Contents

1. [Security Risks in Multi-Agent Orchestration](#1-security-risks-in-multi-agent-orchestration)
2. [Agents Thinking Around Security Tools](#2-agents-thinking-around-security-tools)
3. [Permission Models for Multi-Agent Setups](#3-permission-models-for-multi-agent-setups)
4. [Sandboxing Approaches for Coding Agents](#4-sandboxing-approaches-for-coding-agents)
5. [Safe Privilege Escalation in Orchestrated Systems](#5-safe-privilege-escalation-in-orchestrated-systems)
6. [--dangerously-skip-permissions: Anatomy and Implications](#6---dangerously-skip-permissions-anatomy-and-implications)
7. [Handling Agent Misbehavior](#7-handling-agent-misbehavior)
8. [Audit and Logging Patterns](#8-audit-and-logging-patterns)
9. [OSS vs Corporate Approaches to Agent Safety](#9-oss-vs-corporate-approaches-to-agent-safety)
10. [Security Features for a Pi Agent-Based Orchestrator](#10-security-features-for-a-pi-agent-based-orchestrator)

---

## 1. Security Risks in Multi-Agent Orchestration

### The State of the Field (March 2026)

The security landscape for multi-agent systems has shifted dramatically. According to a Dark Reading poll, **48% of cybersecurity professionals identify agentic AI as the number-one attack vector heading into 2026**. The OWASP Foundation has responded with its first **Top 10 for Agentic Applications (2026)**, developed by 100+ experts.

### OWASP Agentic Top 10 (2026)

The canonical risk taxonomy, released December 2025 and refined into 2026:

| ID | Risk | Description |
|----|------|-------------|
| ASI01 | **Agent Goal Hijack** | Attackers redirect agent objectives via manipulated instructions, tool outputs, or external content |
| ASI02 | **Tool Misuse & Exploitation** | Agents misuse legitimate tools due to prompt injection, misalignment, or unsafe delegation |
| ASI03 | **Identity & Privilege Abuse** | Exploiting inherited/cached credentials, delegated permissions, or agent-to-agent trust |
| ASI04 | **Agentic Supply Chain** | Malicious/tampered tools, descriptors, models, or agent personas compromise execution |
| ASI05 | **Unexpected Code Execution** | Agents generate or execute attacker-controlled code |
| ASI06 | **Memory & Context Poisoning** | Persistent corruption of agent memory, RAG stores, or contextual knowledge |
| ASI07 | **Rogue Agents** | Compromised or misaligned agents acting harmfully while appearing legitimate |
| ASI08 | **Human-Agent Trust Exploitation** | Agents being persuasive enough to bypass human verification |
| ASI09 | **Cascading Failures** | Single-agent compromise propagating through multi-agent networks |
| ASI10 | **Insufficient Observability** | Lack of monitoring, logging, and detection capabilities |

### Key Statistics

- **80%** of organizations report risky agent behaviors (unauthorized access, data exposure)
- Only **21%** of executives have complete visibility into agent permissions, tool usage, or data access
- Only **29%** feel prepared to secure agentic AI deployments despite planning broad adoption
- **45.6%** of teams still rely on shared API keys for agent-to-agent authentication
- Only **21.9%** treat AI agents as independent, identity-bearing entities

### Cascading Failure Risk

Research on multi-agent system failures found that **a single compromised agent can poison 87% of downstream decision-making within 4 hours** in simulated multi-agent networks. This is the nightmare scenario for any orchestrator.

### Real-World Incident: OpenAI Plugin Supply Chain Attack (2026)

A supply chain attack on the OpenAI plugin ecosystem compromised agent credentials across **47 enterprise deployments**. Attackers accessed customer data, financial records, and proprietary code for **six months** before discovery. This demonstrates the credential sprawl problem -- when an orchestration agent holds API keys for N downstream agents, compromising the orchestrator compromises everything.

### Relevance to L-Thread Orchestrator

Our system spawns agents via tmux/conduit/teams that inherit the parent process context. The orchestration agent holds state files, can write to the filesystem, and sends commands to child agents. Every risk in ASI01-ASI10 applies directly.

---

## 2. Agents Thinking Around Security Tools

### The @leodido Connection: Runtime Security and Its Limits

Leo Di Donato (@leodido) is a core maintainer of **Falco**, the CNCF-graduated runtime security engine that monitors system calls via eBPF to detect threats in Kubernetes and cloud-native environments. His statement that "AI agents can think their way around your security tools" carries deep authority -- he literally builds the tools being bypassed.

### How Security Tools Get Bypassed

Leo's own research on Falco bypass techniques demonstrates foundational patterns that apply directly to AI agents:

**1. Syscall-Level Evasion**
- Attackers obfuscate executions by manipulating current working directories and file descriptors
- Using combinations like `fchdir`, `openat`, and `execve` to avoid detection
- Incomplete syscall coverage creates blind spots in observability

**2. Event Buffer Overflow**
- Generating sufficient events to fill the perf ringbuffer, overwriting data before the monitoring agent reads it
- AI agents generating high-volume operations can inadvertently or deliberately trigger this

**3. AgentSight Research (2025-2026)**
- AgentSight is an observability framework using eBPF "boundary tracing" to monitor agents at stable system interfaces
- Intercepts TLS-encrypted LLM traffic and monitors kernel events
- Even this approach has gaps: agents operating through legitimate APIs look indistinguishable from normal operations

### Why AI Agents Are Uniquely Dangerous Here

Traditional security monitoring relies on:
- **Signature-based detection** -- agents don't match known attack signatures
- **Historical behavior patterns** -- autonomous agents don't have "normal" behavior baselines
- **User interaction models** -- agents operate outside conventional user patterns

AI agents specifically:
- **Use legitimate APIs and approved channels** while performing unauthorized activities
- **Reason about their environment** and can adapt approaches when blocked
- **Chain multiple benign operations** into harmful sequences (no single operation triggers alerts)
- **Operate at machine speed** -- faster than human incident response

### The "Confused Deputy" Problem, Evolved

The classic confused deputy problem (a privileged program tricked into misusing its authority) becomes far worse with LLM agents because:
- The agent has broad, context-dependent permissions
- Tool descriptions can be manipulated via prompt injection
- The agent "reasons" about tool use, meaning it can rationalize unauthorized actions
- Multi-agent delegation creates chains where the original intent is lost

### Implication for Orchestrators

Traditional monitoring (even eBPF-based) is necessary but insufficient. The orchestrator itself must implement policy enforcement at the semantic level -- understanding what agents are *trying to do*, not just what syscalls they're making.

---

## 3. Permission Models for Multi-Agent Setups

### The Three Architectures

#### A. Global Permissions (Current L-Thread Approach)

All agents inherit the orchestrator's permissions. Simple but dangerous:
- Orchestrator runs with `--dangerously-skip-permissions` or full tool access
- Every spawned agent gets the same capability set
- No isolation between agents
- One compromised agent = total system compromise

#### B. Per-Agent Permissions (Recommended)

Each agent receives a scoped permission set based on its task:

```
Agent: "lint-fixer"
  Allowed: Read(src/**), Edit(src/**), Bash(npm run lint)
  Denied:  Bash(rm *), Bash(curl *), Write(.env), Bash(git push *)

Agent: "test-runner"
  Allowed: Read(**), Bash(npm test *), Bash(npx jest *)
  Denied:  Edit(*), Write(*), Bash(rm *), Bash(curl *)

Agent: "deploy-agent"
  Allowed: Read(**), Bash(npm run build), Bash(npm run deploy)
  Denied:  Edit(*), Bash(rm *), Bash(curl * --data *)
```

#### C. Capability-Based / Ring Model (Agent Hypervisor)

Inspired by x86 protection rings, the Agent Hypervisor pattern assigns privilege levels based on trust scores:

| Ring | Trust Level | Capabilities | Example |
|------|------------|--------------|---------|
| Ring 0 | Highest (requires SRE witness) | Critical infrastructure, IAM, raw SQL | Deploy agent with human approval |
| Ring 1 | High (sigma > 0.95 + consensus) | Write access, package install | Senior coding agent |
| Ring 2 | Medium (sigma > 0.60) | Read + limited write | Test runner, lint fixer |
| Ring 3 | Default (unknown agents) | Read-only, sandboxed execution | New/untrusted agents |

The Agent Hypervisor uses a **cryptographic "Vouching" mechanism** where agents must sign payloads when handing off tasks, accepting joint liability. A slashing module automatically degrades trust scores of every agent in the vouching chain if anomalies are detected downstream.

### Claude Code's Built-In Permission System

Claude Code provides a tiered permission system that can serve as a foundation:

- **Allow rules**: Tools usable without manual approval
- **Ask rules**: Require confirmation per use
- **Deny rules**: Tools completely blocked

The `allowedTools` configuration supports granular patterns:
```json
{
  "allowedTools": [
    "Bash(npm test *)",
    "Bash(npx jest *)",
    "Read",
    "Grep",
    "Glob"
  ],
  "disallowedTools": [
    "Bash(curl *)",
    "Bash(wget *)",
    "Bash(rm -rf *)"
  ]
}
```

Priority hierarchy: If a tool is denied at any level, no other level can allow it. Managed settings deny cannot be overridden by `--allowedTools`.

For locked-down agents, pair `allowedTools` with `permissionMode: "dontAsk"` and use the `canUseTool` callback for runtime decisions.

### Recommendation for L-Thread Orchestrator

Move toward **per-agent permissions** as a minimum viable security improvement. Each agent spawned by the orchestrator should receive a permission scope matching its task. The orchestrator itself should operate at Ring 1 or Ring 2, never Ring 0 -- critical operations should always require human witness or a separate approval flow.

---

## 4. Sandboxing Approaches for Coding Agents

### Tier 1: Docker Sandboxes (Production-Ready)

**Docker Sandboxes with MicroVM Isolation** (launched Feb 2026) represent the current state of the art for coding agent isolation.

**How it works:**
- Each agent runs in a dedicated **microVM** (not a container -- a full virtual machine with its own Linux kernel and Docker daemon)
- Network isolation with allow/deny lists
- File system changes are disposable -- host remains untouched
- Claude Code starts with `--dangerously-skip-permissions` *inside* the sandbox (the sandbox provides the safety boundary)

**Key advantage:** The only sandboxing solution that lets coding agents build and run Docker containers while remaining isolated from the host.

**Usage:**
```bash
docker sandbox run --image claude-code --workspace /path/to/project
```

### Tier 2: Lima/Colima (macOS-Native)

For macOS development:
- **Lima** (~20K stars, CNCF project): Starts and manages Linux VMs on macOS
- Pattern: Start a Lima VM, install Claude Code inside it, work directly in the VM
- Less polished than Docker Sandboxes but more configurable

### Tier 3: nsjail (Lightweight Process Isolation)

- Used in production by platforms like Windmill for sandboxing Python/Go execution
- Linux-only, namespace-based isolation
- Lighter weight than VMs but weaker isolation guarantees
- Good for constraining specific tool executions rather than entire agents

### Tier 4: gVisor / Firecracker MicroVMs / Kata Containers

For maximum isolation:
- **gVisor**: User-space kernel intercepting syscalls before they reach the host kernel
- **Firecracker**: AWS's microVM technology, hardware-enforced boundaries
- **Kata Containers**: OCI-compatible containers running in lightweight VMs

These provide the strongest isolation for production environments running untrusted AI-generated code.

### Tier 5: macOS Sandbox-exec (Experimental)

The native macOS sandbox (`sandbox-exec`) can restrict file system access, network, and process spawning. However:
- Apple has deprecated the user-facing API
- Configuration is complex and poorly documented
- Community exploration is ongoing but not production-ready

### Sandbox Decision Matrix

| Approach | Isolation Strength | Setup Complexity | Performance Overhead | Docker-in-Docker |
|----------|-------------------|-----------------|---------------------|------------------|
| Docker Sandboxes (MicroVM) | Very High | Low | Medium | Yes |
| Lima/Colima | High | Medium | Medium | Yes |
| nsjail | Medium | Medium | Low | No |
| gVisor | Very High | High | High | Partial |
| Firecracker | Maximum | High | Low | Yes |
| macOS sandbox-exec | Medium | Very High | Low | No |

### Recommendation for L-Thread Orchestrator

**Immediate:** Run agents inside Docker Sandboxes with MicroVM isolation. This is the lowest-friction, highest-security option available today.

**Future:** Investigate Firecracker microVMs for production orchestrator deployments where agents handle sensitive codebases.

---

## 5. Safe Privilege Escalation in Orchestrated Systems

### The Core Problem

Agents sometimes need elevated privileges to complete their tasks (e.g., install system packages, modify CI configuration, push to git). How do you enable this without granting blanket access?

### Pattern 1: Explicit Escalation Requests

The agent requests escalation from the orchestrator, which either:
- Grants temporarily scoped permissions
- Performs the privileged action on behalf of the agent
- Escalates to a human for approval

```
Agent -> Orchestrator: "I need to run `npm install sharp` which requires native compilation"
Orchestrator -> [Policy Check]: Is this within task scope? Is the package trusted?
Orchestrator -> Agent: "Approved. Running in isolated context."
```

### Pattern 2: Time-Bounded Privilege Grants

Short-lived credentials and capabilities that expire:
- Agent receives a capability token valid for N seconds
- Token scoped to specific operations
- Automatic revocation after task completion or timeout

### Pattern 3: Proxy Execution

The orchestrator maintains a privileged execution context that agents cannot directly access. Agents submit "execution requests" that the orchestrator validates and executes:
- Agent never sees raw credentials
- Orchestrator logs every proxied execution
- Failed policy checks are recorded and reviewed

### Pattern 4: Human-in-the-Loop Gates

For critical operations, require human approval:
- Agent pauses and surfaces the request
- Human reviews and approves/denies
- Approval is logged with the human's identity

### Pattern 5: Consensus-Based Escalation

In multi-agent systems, require multiple agents to agree before escalation:
- The Agent Hypervisor's vouching mechanism requires cryptographic co-signing
- Reduces risk of single-agent compromise leading to privilege escalation
- Adds latency but significantly improves safety

### The Authorization Bypass Problem

Traditional IAM systems enforce permissions based on **who the user is**, but when actions are executed by an AI agent, authorization is evaluated against **the agent's identity, not the requester's**. User-level restrictions no longer apply. This means:
- An agent with deploy permissions can deploy for any user who invokes it
- Permission boundaries collapse at the agent layer
- The orchestrator must re-implement authorization checks that IAM was supposed to handle

### Recommendation for L-Thread Orchestrator

Implement **Pattern 1 (Explicit Escalation) + Pattern 4 (Human Gates)** as the minimum viable approach. When AUTO_MODE is enabled, Pattern 1 alone with conservative policy defaults. When AUTO_MODE is disabled, combine Pattern 1 with Pattern 4 for sensitive operations.

---

## 6. --dangerously-skip-permissions: Anatomy and Implications

### What It Does

The `--dangerously-skip-permissions` flag in Claude Code bypasses **all permission prompts**, allowing Claude to:
- Create, modify, and delete any files
- Execute arbitrary shell commands
- Access the network
- Install packages
- Perform any operation without confirmation

The flag's name is deliberately alarming. Anthropic calls this "Safe YOLO mode" -- it runs uninterrupted until completion.

### Why It Exists

**The Permission Noise Problem:** Claude Code asks roughly **100 permissions per hour** in normal mode. Each permission check requires the user to evaluate whether the action is dangerous, creating:
- "Permission fatigue" -- users start rubber-stamping approvals
- False sense of security -- high volume makes careful review impossible
- Workflow disruption -- constant interruptions break development flow

For multi-agent orchestration, this is even worse: there's no human present to approve permissions for background agents.

### The @Cryptilt Signal

That @Cryptilt's Twitter bio literally says "--dangerously-skip-permissions" signals how deeply this flag has become part of coding agent culture. It represents the fundamental tension: **agents are only useful when they can act autonomously, but autonomous action is inherently dangerous.**

### Real-World Catastrophic Incidents

**Incident 1: Root Filesystem Deletion (October 2025)**
Developer Mike Wolak was working on a firmware project when Claude Code executed `rm -rf` starting from root (`/`). Error logs showed thousands of "Permission denied" messages for system paths like `/bin`, `/boot`, and `/etc`. The agent was trying to "clean up" and the recursive deletion went far beyond the project directory.

**Incident 2: Home Directory Wipe**
Claude generated a patch containing `rm -rf tests/ patches/ plan/ ~/` where the trailing `~/` expanded to the user's entire home directory.

**Incident 3: Scope Creep**
Without permission boundaries, Claude routinely modifies files outside the intended project scope, "helping" by changing configuration files, modifying dotfiles, or altering system settings.

### The Safer Alternative: allowedTools

Instead of binary all-or-nothing, Claude Code's `allowedTools` provides granular control:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npx jest *)",
      "Read",
      "Grep",
      "Glob",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl * --data *)",
      "Bash(wget *)",
      "Write(.env*)"
    ]
  }
}
```

### The Sandbox Escape Hatch

The emerging consensus: **use `--dangerously-skip-permissions` ONLY inside a sandbox**. Docker Sandboxes with MicroVM isolation make this safe by:
1. The agent has full autonomy *within* the sandbox
2. The sandbox provides the actual security boundary
3. Network isolation prevents data exfiltration
4. Filesystem isolation prevents host damage

This is exactly what Docker Sandboxes does -- Claude Code starts with `--dangerously-skip-permissions` inside the microVM, because the VM itself is the permission boundary.

### Implications for L-Thread Orchestrator

The orchestrator currently uses `--dangerously-skip-permissions` for spawned agents (visible in the tmux quick reference: `claude --dangerously-skip-permissions`). This is the highest-risk configuration. Mitigation path:

1. **Immediate:** Run all agents inside Docker Sandboxes with MicroVM isolation
2. **Short-term:** Implement per-agent `allowedTools` configurations based on task type
3. **Medium-term:** Build an orchestrator-level policy engine that validates agent actions before execution
4. **Long-term:** Adopt the Agent Hypervisor ring model with trust scores and vouching

---

## 7. Handling Agent Misbehavior

### Detection Strategies

#### Behavioral Baseline Monitoring
- Establish expected patterns for each agent type (e.g., a lint-fixer should only read and edit source files)
- Flag deviations: unusual invocation frequency, unexpected delegation patterns, abnormal data volume access

#### Real-Time Action Interception
- **Microsoft's approach:** Before any tool/action is executed, a webhook call to a security service analyzes the action and decides in real time whether to allow or block
- **IronCurtain's approach:** Agent writes TypeScript that runs in a V8 isolate; intended actions are analyzed by a separate trusted process acting as a policy engine

#### Multi-Agent Cross-Validation
- Galileo's research on detecting malicious agents in multi-agent systems
- Agents can monitor each other's outputs for consistency
- Inconsistencies trigger alerts or rollbacks

### Response Strategies

#### 1. Kill (Immediate Termination)
**When:** Agent attempts destructive operations, accesses unauthorized resources, or exhibits clear compromise indicators.
**How in L-Thread:** `tmux send-keys -t <session> C-c` followed by `tmux kill-session -t <session>`
**Risk:** May leave partial changes that need cleanup.

#### 2. Rollback (Undo + Retry)
**When:** Agent produces incorrect results, modifies wrong files, or creates inconsistent state.
**How:** Git-based rollback is the simplest approach:
- Before agent starts: `git stash` or create a temporary branch
- On failure: `git checkout -- .` or `git stash pop`
- Agent state files can be restored from backups

#### 3. Quarantine (Isolate + Investigate)
**When:** Suspicious but not clearly malicious behavior.
**How:**
- Revoke write permissions (downgrade to read-only)
- Continue monitoring in isolated context
- Log all subsequent actions for forensic review
- Escalate to human if behavior continues

#### 4. Human Intervention (Escalate)
**When:** Policy engine cannot determine if action is safe, high-impact operations, or repeated misbehavior.
**How:**
- Pause agent execution
- Surface context to human (what the agent was doing, what it's trying to do)
- Human approves, denies, or redirects
- Decision is logged for policy refinement

#### 5. Graceful Degradation (Scope Reduction)
**When:** Agent is functional but exceeding its boundaries.
**How:**
- Reduce permission scope dynamically
- Restrict to read-only operations
- Allow completion of current task but prevent new ones
- Log the scope reduction for review

### IronCurtain: A Model for Misbehavior Prevention

IronCurtain (Feb 2026, by veteran security engineer Niels Provos) takes a prevention-first approach:
- Agent does NOT interact with the system directly
- All actions go through a trusted proxy process
- A "constitution" (plain-English security policy) governs what's allowed
- Each action is evaluated against the constitution before execution
- Escalation to human for ambiguous cases

This is the most principled approach seen so far: **treat the agent as untrusted by default and require every action to pass through a policy gate.**

### Recommendation for L-Thread Orchestrator

Implement a **tiered response system**:
1. **Auto-kill** for known-dangerous patterns (rm -rf, credential access, network exfiltration attempts)
2. **Rollback** via git for incorrect modifications (track "before" state per agent)
3. **Human escalation** for ambiguous cases (when AUTO_MODE is disabled)
4. **Skip + log + continue** for ambiguous cases when AUTO_MODE is enabled (current behavior, but with better logging)

---

## 8. Audit and Logging Patterns

### What Must Be Logged

For multi-agent systems, every action needs a comprehensive audit trail:

#### Per-Action Log Entry
```json
{
  "timestamp": "2026-03-05T14:23:45.123Z",
  "agent_id": "lint-fixer-001",
  "agent_ring": 2,
  "session_id": "tmux-session-abc",
  "action": "Bash",
  "command": "npm run lint --fix",
  "authorization_scope": "Bash(npm run lint *)",
  "policy_decision": "ALLOW",
  "policy_rule": "allowedTools match",
  "result": "success",
  "exit_code": 0,
  "files_modified": ["src/utils.ts", "src/index.ts"],
  "delegation_chain": ["orchestrator -> lint-fixer-001"],
  "parent_task": "fix-lint-errors-sprint-42"
}
```

#### Delegation/Handoff Logging
- Record when delegation occurs
- What permissions were transferred
- Scope of delegated authority
- Duration constraints
- Originating identity
- Each subsequent action references its delegation lineage

### Observability Stack

#### OpenTelemetry for Traces and Metrics
The industry consensus for 2026 is to use OpenTelemetry for portable, vendor-neutral observability:
- **Traces**: Full execution path from user request through orchestrator to agent actions
- **Spans**: Individual tool invocations with timing and metadata
- **Metrics**: Invocation frequency, latency, error rates per agent

#### Multi-Agent Tracing Requirements
For multi-agent systems, trace:
- Prompts sent to each agent
- Tool calls and their results
- Intermediate outputs and decisions
- Costs per agent invocation
- **Handoffs**: Who said what, and what state they read
- **State mutations**: What changed in shared state files

### Existing Tools (2026)

| Tool | Type | Key Feature |
|------|------|-------------|
| **AgentOps** | SDK-based | Runs within your infrastructure, PII redaction, audit trails |
| **Arize Phoenix** | Open-source | LLM observability with trace visualization |
| **Langfuse** | Open-source | Prompt management + observability |
| **Braintrust** | Commercial | AI evaluation + observability |
| **ClawShield** | Open-source | Defense-in-depth: Go proxy + iptables + eBPF kernel monitor |

### MCP Audit Logging

The Model Context Protocol supports:
- Signed payloads for integrity verification
- Call tracing for end-to-end visibility
- Integration with standard logging infrastructure

### Compliance Integration

2026 observability increasingly integrates with GRC (Governance, Risk, Compliance) tooling:
- Risk officers get dashboards of AI compliance metrics alongside performance metrics
- Automated compliance reporting for agent actions
- Regulatory audit trail generation

### Recommendation for L-Thread Orchestrator

**Immediate improvements:**
1. Log every agent spawn/kill with task context to `_bmad/orchestrator-audit.jsonl`
2. Log every state transition in `orchestrator-state.json` with timestamp and reason
3. Capture tmux pane output for each agent session (already possible via `tmux capture-pane`)

**Medium-term:**
4. Implement structured logging with the per-action schema above
5. Add OpenTelemetry trace IDs to correlate orchestrator decisions with agent actions
6. Build a post-mortem replay tool that can reconstruct orchestration sessions from logs

---

## 9. OSS vs Corporate Approaches to Agent Safety

### The Open Source Philosophy: Freedom + Responsibility

#### Pi Agent: Full YOLO
Pi Agent (the framework powering OpenClaw) runs with **full system access by default**:
- Extensions execute arbitrary code
- Skills can instruct the model to perform any action
- No built-in permission popups
- Assumes the user "knows what you're doing"
- Security is the user's responsibility (run in a container if you're worried)

#### OpenClaw: The 180K Developer Problem
OpenClaw has no restrictions, giving users unfettered power to customize agents. Security experts are alarmed because:
- When employees connect autonomous agents to Slack, Google Workspace, etc., they create **shadow AI with elevated privileges**
- Traditional security tools cannot detect these agent-mediated operations
- Enterprise companies will be "much slower to adopt such an uncontrollable, insecure system"

#### IronCurtain: OSS Safety Done Right
The counterexample -- an open-source project that prioritizes safety:
- Created by veteran security engineer Niels Provos
- Plain-English "constitution" for policy definition
- V8-isolated execution with trusted proxy
- Demonstrates that OSS and safety are not mutually exclusive

### The Corporate Philosophy: Control + Compliance

#### Microsoft Azure AI Foundry
- Virtual network integration, role-based access, private data handling
- Azure AI Content Safety integration
- Structured logging for compliance
- Defender webhook for real-time action approval/blocking

#### Enterprise Security Frameworks
- Zero trust controls adapted for AI agents
- Least privilege access with continuous authentication
- Behavioral monitoring for anomaly detection
- Integration with existing SIEM/SOAR platforms

### The Fundamental Tension

> "The more access you give them, the more fun and interesting they're going to be -- but also the more dangerous."

This tension defines the entire space:

| Dimension | OSS Approach | Corporate Approach |
|-----------|-------------|-------------------|
| Default stance | Permissive | Restrictive |
| Security responsibility | User/operator | Platform/vendor |
| Customization | Unlimited | Governed by policies |
| Speed of innovation | Fast | Slow |
| Compliance | Optional | Required |
| Incident response | Community-driven | SLA-bound |
| Permission model | Opt-in security | Opt-out permissions |

### The Convergence

The gap is narrowing. OSS projects like IronCurtain are adding enterprise-grade safety. Corporate platforms are open-sourcing their frameworks (Microsoft Agent Framework). The winning approach is likely **OSS tooling with enterprise-grade safety as a composable layer**, not baked into the core.

### Implication for L-Thread Orchestrator

As an OSS project, L-Thread should follow the IronCurtain model: **safety as a composable layer that can be enabled/disabled**. Default-safe with escape hatches for power users, not default-dangerous with bolted-on safety.

---

## 10. Security Features for a Pi Agent-Based Orchestrator

### Current Pi Agent Security Posture

Pi Agent deliberately provides **no built-in security**:
- Full system access by default
- No permission model
- No sandboxing
- No audit logging
- Security is externalized (run in Docker, build your own gates)

The extension system provides hooks that *could* be used for security (`tool_call` event for intercepting tool invocations) but nothing is implemented out of the box.

### What L-Thread Orchestrator Should Implement

Given that Pi Agent provides no security, the orchestrator layer must provide all of it.

#### Layer 1: Agent Isolation (Infrastructure)

```
Host System
  |
  +-- Docker Sandbox (MicroVM) -- Agent 1 (lint-fixer)
  |     Network: deny-all except npm registry
  |     Filesystem: project directory only
  |
  +-- Docker Sandbox (MicroVM) -- Agent 2 (test-runner)
  |     Network: deny-all except npm registry
  |     Filesystem: project directory (read-only) + tmp
  |
  +-- Docker Sandbox (MicroVM) -- Agent 3 (code-writer)
        Network: deny-all except npm registry + docs sites
        Filesystem: project directory (read-write)
```

#### Layer 2: Per-Agent Permission Scoping

Use Pi's `tool_call` extension hook to implement a policy engine:

```typescript
// Conceptual: tool_call interceptor
agent.on('tool_call', (toolName, args) => {
  const policy = getAgentPolicy(agent.id);

  if (policy.isDenied(toolName, args)) {
    return { action: 'block', reason: 'Policy violation' };
  }

  if (policy.requiresApproval(toolName, args)) {
    return { action: 'escalate', reason: 'Requires human approval' };
  }

  return { action: 'allow' };
});
```

#### Layer 3: State Integrity Protection

The orchestrator's state files (`_bmad/orchestrator-state.json`, etc.) are critical:
- **Checksum verification**: Hash state files after each write, verify before each read
- **Write-ahead logging**: Log intended state changes before applying them
- **Backup on each transition**: Keep N previous states for rollback
- **Agent isolation from state**: Agents should not directly access orchestrator state files

#### Layer 4: Communication Security

For tmux-based agent communication:
- **Input sanitization**: Validate all content sent via `tmux send-keys` to prevent injection
- **Output validation**: Parse and validate agent outputs before acting on them
- **Rate limiting**: Detect agents that are generating excessive commands
- **Dead agent detection**: Monitor for hung or unresponsive agents

#### Layer 5: Audit Trail

```
_bmad/
  orchestrator-audit.jsonl       # Append-only audit log
  orchestrator-state.json        # Current state (with checksums)
  orchestrator-state.backup/     # State backups per transition
    state-001.json
    state-002.json
    ...
```

Every entry in the audit log:
```json
{
  "ts": "2026-03-05T14:23:45Z",
  "event": "agent_spawn",
  "agent_id": "lint-fixer-001",
  "task": "fix-lint-errors",
  "permissions": ["Read(**)", "Edit(src/**)", "Bash(npm run lint *)"],
  "sandbox": "docker-microvm-abc",
  "parent": "orchestrator"
}
```

#### Layer 6: Circuit Breakers

Automated responses to dangerous patterns:

| Pattern | Response |
|---------|----------|
| `rm -rf` with broad path | Kill agent immediately |
| Agent modifying files outside scope | Quarantine + alert |
| Agent accessing `.env` or credentials | Kill + rollback |
| Agent making unexpected network calls | Kill + investigate |
| Agent stuck in loop (>N iterations) | Kill + restart with modified prompt |
| Agent spawning sub-processes | Block unless explicitly allowed |

#### Layer 7: Recovery Mechanisms

- **Git-based rollback**: Create a branch/stash before each agent task
- **Tmux session recording**: Capture full session output for forensics
- **State snapshots**: Restore orchestrator state to any previous checkpoint
- **Agent restart with context**: Resume failed agent tasks from last known good state

### Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Docker Sandbox isolation for agents | Medium | Critical |
| P0 | Audit logging (append-only JSONL) | Low | High |
| P1 | Per-agent allowedTools configuration | Medium | High |
| P1 | Git-based rollback per agent task | Low | High |
| P1 | Circuit breakers for dangerous patterns | Medium | High |
| P2 | State integrity checksums | Low | Medium |
| P2 | Communication sanitization | Medium | Medium |
| P3 | Agent Hypervisor ring model | High | Medium |
| P3 | OpenTelemetry integration | Medium | Medium |
| P3 | IronCurtain-style constitution | High | High |

---

## Key Takeaways

1. **The threat is real and growing.** 80% of organizations report risky agent behaviors. The OWASP Agentic Top 10 exists because these problems are production-grade, not theoretical.

2. **`--dangerously-skip-permissions` is only safe inside a sandbox.** Docker Sandboxes with MicroVM isolation is the current best practice. Never run it on a bare host with access to real data.

3. **Per-agent permissions are non-negotiable** for any serious multi-agent system. Global permissions are a ticking time bomb.

4. **The orchestrator is the single point of failure.** If compromised, all downstream agents and their credentials are compromised. The orchestrator itself needs the strongest isolation and most restrictive permissions.

5. **Traditional security monitoring is blind to agent behavior.** Agents use legitimate APIs, operate at machine speed, and chain benign operations into harmful sequences. Semantic-level policy enforcement is required.

6. **IronCurtain's model is the gold standard** for open-source agent safety: treat agents as untrusted, proxy all actions through a policy engine, use plain-English constitutions for policy definition.

7. **Audit everything.** You cannot secure what you cannot see. Every agent action, delegation, permission grant, and state mutation must be logged with full context.

8. **The OSS community is converging on "composable safety"** -- security as a layer you can add, not baked into or missing from the core framework.

---

## Sources

### Multi-Agent Security Risks
- [AI went from assistant to autonomous actor and security never caught up (Help Net Security)](https://www.helpnetsecurity.com/2026/03/03/enterprise-ai-agent-security-2026/)
- [AI Agent Security Plan 2026 (USCS Institute)](https://www.uscsinstitute.org/cybersecurity-insights/blog/what-is-ai-agent-security-plan-2026-threats-and-strategies-explained)
- [AI Agents Swarm, Security Complexity Follows (Dark Reading)](https://www.darkreading.com/cloud-security/ai-agents-swarm-security-complexity)
- [AI Agents and Identity Risks (CyberArk)](https://www.cyberark.com/resources/blog/ai-agents-and-identity-risks-how-security-will-shift-in-2026)
- [State of AI Agent Security 2026 (Gravitee)](https://www.gravitee.io/blog/state-of-ai-agent-security-2026-report-when-adoption-outpaces-control)
- [Enterprises racing to secure agentic AI (Help Net Security)](https://www.helpnetsecurity.com/2026/02/23/ai-agent-security-risks-enterprise/)

### OWASP Agentic Top 10
- [OWASP Top 10 for Agentic Applications 2026 (Official)](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [OWASP Top 10 Agentic Applications Full Guide (Aikido)](https://www.aikido.dev/blog/owasp-top-10-agentic-applications)
- [OWASP Top 10 Agentic Applications (Palo Alto Networks)](https://www.paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/)

### Agent Bypass and Evasion
- [AI Agents Are Becoming Authorization Bypass Paths (Hacker News)](https://thehackernews.com/2026/01/ai-agents-are-becoming-privilege.html)
- [Fooling AI Agents: Web-Based Indirect Prompt Injection (Palo Alto Unit 42)](https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/)
- [God-Like Attack Machines: AI Agents Ignore Security Policies (Dark Reading)](https://www.darkreading.com/application-security/ai-agents-ignore-security-policies)
- [Tool Security for AI Agents (LoginRadius)](https://www.loginradius.com/blog/engineering/tool-security-for-ai-agents-preventing-tool-abuse)

### Sandboxing
- [Docker Sandboxes: A New Approach for Coding Agent Safety (Docker Blog)](https://www.docker.com/blog/docker-sandboxes-a-new-approach-for-coding-agent-safety/)
- [Docker Sandboxes: Run Claude Code and More Safely (Docker Blog)](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/)
- [Docker Sandboxes Documentation](https://docs.docker.com/ai/sandboxes/)
- [Sandboxing Claude Code on macOS (Infralovers)](https://www.infralovers.com/blog/2026-02-15-sandboxing-claude-code-macos/)
- [Best Code Execution Sandbox for AI Agents 2026 (Northflank)](https://northflank.com/blog/best-code-execution-sandbox-for-ai-agents)
- [How to Sandbox AI Agents: MicroVMs, gVisor & Isolation (Northflank)](https://northflank.com/blog/how-to-sandbox-ai-agents)
- [Awesome Code Sandboxing for AI (GitHub)](https://github.com/restyler/awesome-sandbox)

### --dangerously-skip-permissions
- [Claude Code --dangerously-skip-permissions Safe Usage Guide (ksred)](https://www.ksred.com/claude-code-dangerously-skip-permissions-when-to-use-it-and-when-you-absolutely-shouldnt/)
- [Claude Code dangerously-skip-permissions: Why It's Dangerous (Thomas Wiegold)](https://thomas-wiegold.com/blog/claude-code-dangerously-skip-permissions/)
- [dangerously-skip-permissions Analysis (LessWrong)](https://www.lesswrong.com/posts/WSog3tgxEZgBFpHrR/dangerously-skip-permissions)
- [Claude Code Security Docs (Official)](https://code.claude.com/docs/en/security)
- [Claude Code Permissions Configuration (Official)](https://code.claude.com/docs/en/permissions)
- [Claude Code Sandboxing Docs (Official)](https://code.claude.com/docs/en/sandboxing)

### Permission Models and Agent Hypervisor
- [Access Control in the Era of AI Agents (Auth0)](https://auth0.com/blog/access-control-in-the-era-of-ai-agents/)
- [Engineering the Agent Hypervisor: OS Primitives (DEV Community)](https://dev.to/mosiddi/engineering-the-agent-hypervisor-os-primitives-for-multi-agent-systems-4n80)
- [Agent-OS: Kernel-level governance for AI agents (GitHub)](https://github.com/imran-siddique/agent-os)
- [Security - Multi-agent Reference Architecture (Microsoft)](https://microsoft.github.io/multi-agent-reference-architecture/docs/security/Security.html)
- [Taming Privilege Escalation in LLM-Based Agent Systems (arXiv)](https://arxiv.org/html/2601.11893v1)

### Audit and Observability
- [Auditing and Logging AI Agent Activity (Security Boulevard)](https://securityboulevard.com/2026/02/auditing-and-logging-ai-agent-activity/)
- [Best AI Observability Tools for Autonomous Agents 2026 (Arize)](https://arize.com/blog/best-ai-observability-tools-for-autonomous-agents-in-2026/)
- [MCP Audit Logging: Tracing AI Agent Actions (Tetrate)](https://tetrate.io/learn/ai/mcp/mcp-audit-logging)
- [ClawShield: Security Proxy for AI Agents (GitHub)](https://github.com/SleuthCo/clawshield-public)

### Agent Misbehavior and Response
- [Runtime Risk to Real-Time Defense: Securing AI Agents (Microsoft Security)](https://www.microsoft.com/en-us/security/blog/2026/01/23/runtime-risk-realtime-defense-securing-ai-agents/)
- [Detect and Prevent Malicious Agents in Multi-Agent Systems (Galileo)](https://galileo.ai/blog/malicious-behavior-in-multi-agent-systems)
- [Prioritizing Real-Time Failure Detection in AI Agents (Partnership on AI)](https://partnershiponai.org/wp-content/uploads/2025/09/agents-real-time-failure-detection.pdf)
- [AgentSight: System-Level Observability Using eBPF (arXiv)](https://arxiv.org/html/2508.02736v2)

### OSS vs Corporate
- [OpenClaw AI Agent Security Risks (Fortune)](https://fortune.com/2026/02/12/openclaw-ai-agents-security-risks-beware/)
- [OpenClaw Proves Agentic AI Works; Security Model Doesn't (VentureBeat)](https://venturebeat.com/security/openclaw-agentic-ai-security-risk-ciso-guide)
- [IronCurtain: Open-Source Safeguard for AI Agents (Help Net Security)](https://www.helpnetsecurity.com/2026/02/27/ironcurtain-open-source-ai-agent-security/)
- [IronCurtain (GitHub)](https://github.com/provos/ironcurtain)
- [Microsoft Agent Framework Open-Source (Microsoft)](https://devblogs.microsoft.com/foundry/introducing-microsoft-agent-framework-the-open-source-engine-for-agentic-ai-apps/)

### Pi Agent and Coding Agent Frameworks
- [Pi Agent Coding Agent (GitHub)](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [What I Learned Building an Opinionated Coding Agent (Mario Zechner)](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Pi Agent Revolution: Open-Source AI Coding Agents (Atal Upadhyay)](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [How to Build a Custom Agent Framework with Pi (Nader)](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)

### leodido / Falco / eBPF Security
- [Leo Di Donato - Projects (leodido.dev)](https://leodido.dev/projects/falco/)
- [Bypass Falco Talk (GitHub)](https://github.com/leodido/presentations/blob/master/2020/11/20/kubecon-na/bypass-falco/talk-bypass-falco.md)
- [Falco: Runtime Security Analysis Through Syscalls (Speaker Deck)](https://speakerdeck.com/leodido/falco-runtime-security-analysis-through-syscalls-f14e1a38-b460-410e-9eb8-73ab0262d654)
