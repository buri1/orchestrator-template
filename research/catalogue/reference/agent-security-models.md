# Agent Security, Safety, and Permission Models

> **OWASP Agentic Top 10 (2026), per-agent permission architectures, sandboxing tiers (Docker MicroVM to Firecracker), privilege escalation patterns, audit/observability frameworks, and the fundamental tension between agent autonomy and safety.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `2026-03-05_agent-security-safety-models.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The security landscape for multi-agent systems shifted dramatically by 2026. 48% of cybersecurity professionals identify agentic AI as the number-one attack vector, yet only 29% feel prepared to secure agentic deployments. The OWASP Foundation responded with its first Top 10 for Agentic Applications, covering risks from agent goal hijacking (ASI01) through insufficient observability (ASI10). A single compromised agent can poison 87% of downstream decision-making within 4 hours in multi-agent networks. The OpenAI plugin supply chain attack of 2026 compromised 47 enterprise deployments for six months, demonstrating the cascading risk when orchestrators hold credentials.

The research identifies three permission model architectures: global permissions (current L-Thread approach -- all agents inherit orchestrator access), per-agent permissions (scoped by task), and capability-based ring models (Agent Hypervisor with trust scores and cryptographic vouching). Five sandboxing tiers are evaluated, from Docker Sandboxes with MicroVM isolation (production-ready, recommended) through Firecracker microVMs (maximum isolation). The emerging consensus: use `--dangerously-skip-permissions` ONLY inside a sandbox, where the sandbox itself provides the security boundary.

Five privilege escalation patterns and five misbehavior response strategies are documented. IronCurtain (by security veteran Niels Provos) emerges as the gold standard for OSS agent safety: treat agents as untrusted by default, proxy all actions through a policy engine, define policies in plain English "constitutions." The document concludes with a seven-layer security architecture for orchestrator implementations and a prioritized implementation roadmap from P0 (Docker isolation, audit logging) through P3 (Agent Hypervisor ring model, IronCurtain-style constitution).

---

## Key Findings

### OWASP Agentic Top 10 (2026)

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
- **45.6%** of teams still rely on shared API keys for agent-to-agent authentication
- Only **21.9%** treat AI agents as independent, identity-bearing entities
- A single compromised agent can poison **87%** of downstream decisions within **4 hours**

### Permission Model Architectures

**A. Global Permissions (Current L-Thread -- highest risk):**
All agents inherit the orchestrator's full permissions. One compromised agent = total system compromise.

**B. Per-Agent Permissions (Recommended minimum):**
Each agent receives a scoped permission set matching its task. Claude Code's `allowedTools` supports granular patterns (e.g., `Bash(npm test *)`, `Read`, deny `Bash(rm -rf *)`).

**C. Capability-Based Ring Model (Agent Hypervisor):**

| Ring | Trust Level | Capabilities | Example |
|------|------------|--------------|---------|
| Ring 0 | Highest (requires SRE witness) | Critical infrastructure, IAM, raw SQL | Deploy agent with human approval |
| Ring 1 | High (sigma > 0.95 + consensus) | Write access, package install | Senior coding agent |
| Ring 2 | Medium (sigma > 0.60) | Read + limited write | Test runner, lint fixer |
| Ring 3 | Default (unknown agents) | Read-only, sandboxed execution | New/untrusted agents |

Uses cryptographic vouching -- agents sign payloads when handing off tasks, accepting joint liability. Slashing module auto-degrades trust scores in the vouching chain on downstream anomalies.

### Sandboxing Tiers

| Approach | Isolation Strength | Setup Complexity | Performance Overhead | Docker-in-Docker |
|----------|-------------------|-----------------|---------------------|------------------|
| Docker Sandboxes (MicroVM) | Very High | Low | Medium | Yes |
| Lima/Colima | High | Medium | Medium | Yes |
| nsjail | Medium | Medium | Low | No |
| gVisor | Very High | High | High | Partial |
| Firecracker | Maximum | High | Low | Yes |
| macOS sandbox-exec | Medium | Very High | Low | No |

**Key insight**: Docker Sandboxes with MicroVM isolation is the only solution that lets coding agents build and run Docker containers while remaining isolated from the host. Claude Code starts with `--dangerously-skip-permissions` inside the sandbox; the sandbox itself is the permission boundary.

### Why AI Agents Bypass Traditional Security

Traditional monitoring (even eBPF-based like Falco) is necessary but insufficient because agents:
- Use legitimate APIs and approved channels while performing unauthorized activities
- Reason about their environment and adapt when blocked
- Chain multiple benign operations into harmful sequences (no single operation triggers alerts)
- Operate at machine speed -- faster than human incident response

The classic "confused deputy" problem is amplified: agents have broad, context-dependent permissions; tool descriptions can be manipulated via prompt injection; and multi-agent delegation creates chains where original intent is lost.

### Privilege Escalation Patterns

| Pattern | Mechanism | Best For |
|---------|-----------|----------|
| Explicit Escalation Requests | Agent requests, orchestrator validates and grants/denies | Default approach |
| Time-Bounded Grants | Capability tokens with expiration | API access, package install |
| Proxy Execution | Orchestrator executes on agent's behalf, agent never sees credentials | Sensitive operations |
| Human-in-the-Loop Gates | Human reviews and approves | Critical operations |
| Consensus-Based | Multiple agents co-sign via cryptographic vouching | High-stakes, multi-agent |

### Misbehavior Response Strategies

1. **Kill** -- immediate termination for destructive operations
2. **Rollback** -- git-based undo for incorrect modifications
3. **Quarantine** -- revoke write permissions, isolate, continue monitoring
4. **Human Intervention** -- pause and surface context for review
5. **Graceful Degradation** -- reduce permission scope dynamically

### Audit and Logging Requirements

Per-action log entry schema (minimum):
- `timestamp`, `agent_id`, `agent_ring`, `session_id`
- `action`, `command`, `authorization_scope`
- `policy_decision` (ALLOW/DENY), `policy_rule`
- `result`, `exit_code`, `files_modified`
- `delegation_chain`, `parent_task`

Industry consensus: OpenTelemetry for portable, vendor-neutral observability (traces, spans, metrics).

### IronCurtain: Gold Standard for OSS Agent Safety

Created by veteran security engineer Niels Provos (Feb 2026):
- Agent does NOT interact with the system directly
- All actions go through a trusted proxy process
- A "constitution" (plain-English security policy) governs what is allowed
- Each action evaluated against the constitution before execution
- Escalation to human for ambiguous cases

Most principled approach: treat agents as untrusted by default, require every action to pass through a policy gate.

### OSS vs Corporate Security

| Dimension | OSS Approach | Corporate Approach |
|-----------|-------------|-------------------|
| Default stance | Permissive | Restrictive |
| Security responsibility | User/operator | Platform/vendor |
| Speed of innovation | Fast | Slow |
| Permission model | Opt-in security | Opt-out permissions |

Convergence: OSS tooling with enterprise-grade safety as a composable layer. IronCurtain model -- safety as a composable layer that can be enabled/disabled.

---

## Actionable Insights

### Implementation Priority

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Docker Sandbox isolation for agents | Medium | Critical |
| P0 | Audit logging (append-only JSONL at `_bmad/orchestrator-audit.jsonl`) | Low | High |
| P1 | Per-agent `allowedTools` configuration based on task type | Medium | High |
| P1 | Git-based rollback per agent task (branch/stash before each task) | Low | High |
| P1 | Circuit breakers for dangerous patterns (`rm -rf`, credential access, network exfil) | Medium | High |
| P2 | State integrity checksums (hash after write, verify before read) | Low | Medium |
| P2 | Communication sanitization (validate `tmux send-keys` content) | Medium | Medium |
| P3 | Agent Hypervisor ring model with trust scores | High | Medium |
| P3 | OpenTelemetry integration | Medium | Medium |
| P3 | IronCurtain-style constitution engine | High | High |

### Seven-Layer Security Architecture

1. **Agent Isolation** -- Docker Sandbox MicroVMs with network/filesystem isolation per agent
2. **Per-Agent Permission Scoping** -- policy engine via `tool_call` interceptor hook
3. **State Integrity Protection** -- checksum verification, write-ahead logging, backup on transition
4. **Communication Security** -- input sanitization, output validation, rate limiting, dead agent detection
5. **Audit Trail** -- append-only JSONL with full action context
6. **Circuit Breakers** -- auto-kill for `rm -rf`, credential access; quarantine for scope violations
7. **Recovery Mechanisms** -- git-based rollback, tmux session recording, state snapshots

### Immediate Steps for L-Thread

1. Move spawned agents into Docker Sandboxes (use `--dangerously-skip-permissions` inside sandbox only)
2. Add per-agent `allowedTools` configs: lint-fixers get `Read + Edit(src/**)`, test-runners get `Read + Bash(npm test)` only
3. Log every agent spawn/kill with task context to `_bmad/orchestrator-audit.jsonl`
4. Create git branch/stash before each agent task for rollback capability
5. When AUTO_MODE enabled: use explicit escalation with conservative defaults; when disabled: add human gates for sensitive operations

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-memory/always-on-memory-agent.md](../agent-memory/always-on-memory-agent.md) | Memory stores are targets for ASI06 (Memory & Context Poisoning); the consolidation pattern needs integrity checks |
| [agent-memory/airweave.md](../agent-memory/airweave.md) | Airweave's 50+ connectors expand the attack surface per ASI04 (Supply Chain); enterprise security layer is relevant |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | Stripe runs agents in isolated devboxes (validates Docker Sandbox recommendation) with hard CI caps (validates circuit breaker pattern) |
| [reference/agent-memory-deep-landscape.md](agent-memory-deep-landscape.md) | Memory architectures described there are subject to ASI06 poisoning risks documented here |
| [reference/orchestration-patterns-2026.md](orchestration-patterns-2026.md) | Error recovery patterns complement the misbehavior response strategies; guardrails-as-pipeline aligns with the seven-layer security architecture |
