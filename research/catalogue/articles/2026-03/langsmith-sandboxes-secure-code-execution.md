# Introducing LangSmith Sandboxes: Secure Code Execution for Agents

> **LangChain Accounts — LangChain Blog, 2026-03-17**

| Field | Value |
|-------|-------|
| Source | [LangChain Blog](https://blog.langchain.com/introducing-langsmith-sandboxes-secure-code-execution-for-agents/) |
| Author | LangChain Accounts |
| Publication | LangChain Blog |
| Date | 2026-03-17 |
| Topics | sandboxes, secure code execution, agent infrastructure, microVM isolation, LangSmith, Docker, autoscaling |
| Read Time | ~3 min |

---

## Burak's Notes

> *LangChain productizing the sandbox layer that every agent system needs. The Auth Proxy pattern (secrets never touch the runtime) and microVM isolation are the right architecture -- we've seen this same pattern in NVIDIA OpenShell and Ironclaw's WASM sandboxes. For us this is Phase 3+ infrastructure: we run agents locally via tmux today, but if we ever go cloud-hosted or let untrusted code run, a sandbox layer becomes mandatory. The "shared sandbox across agents" feature is interesting for our multi-agent coordination -- avoids artifact transfer overhead. Private Preview + waitlist = not usable today, but worth tracking.*

---

## Key Takeaways

1. **MicroVM isolation is the right primitive for agent code execution** -- LangSmith Sandboxes use hardware-virtualized microVMs (not just Linux namespaces/containers), providing kernel-level isolation between sandboxes. This is the same direction NVIDIA OpenShell is taking. Traditional containers were designed for known, vetted application code; agent-generated code is untrusted and unpredictable.

2. **Auth Proxy keeps secrets off the sandbox entirely** -- Sandboxes access external services through an Authentication Proxy so credentials never touch the runtime. This is the same "host boundary injection" pattern seen in Ironclaw's WASM sandboxes. Critical for any system running LLM-generated code.

3. **Warm pooling and autoscaling solve cold start latency** -- Pre-provisioned warm sandbox pools eliminate cold starts for agents, with automatic scaling as demand increases. Long-running sessions over WebSockets with real-time output streaming support tasks that take minutes or hours.

4. **Shared sandbox access across agents** -- Multiple agents can access the same sandbox, eliminating artifact transfer across isolated environments. This is relevant for our multi-agent orchestration where workers need to share build artifacts or test results.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 5/10 | We run agents locally via tmux with full local filesystem access today. Sandbox isolation becomes relevant when: (a) running untrusted agent-generated code, (b) moving to cloud-hosted agents, or (c) client deployments with security requirements. The Auth Proxy and microVM patterns are architecturally sound reference material. LangSmith lock-in and Private Preview status reduce immediate utility. |
| **Actionable** | 3/10 | Private Preview with waitlist -- not usable today. The patterns (microVM isolation, auth proxy, warm pooling) are useful as architectural reference for Phase 3+ infrastructure, but we won't integrate this directly. Our current tmux+worktree isolation is sufficient for our trust model (we trust our own agents). |

---

## Summary

LangChain announces LangSmith Sandboxes in Private Preview: secure, scalable environments for running untrusted agent-generated code. The product addresses the fundamental tension that agents become more useful when they can execute code, but running arbitrary LLM-generated code without isolation is dangerous.

The sandbox architecture uses hardware-virtualized microVMs (not just containers or Linux namespaces) for kernel-level isolation between sandboxes. An Authentication Proxy ensures secrets never touch the sandbox runtime -- credentials stay off the sandbox entirely. This mirrors the "host boundary injection" pattern documented in our Ironclaw analysis.

Key features shipping include: bring-your-own Docker images, sandbox templates for reusable configurations, shared sandbox access for multiple agents, warm pooling with autoscaling to eliminate cold starts, long-running sessions over WebSockets with real-time streaming, persistent state across interactions, and tunnels to expose sandbox ports locally for previewing agent output.

The product integrates with the existing LangSmith SDK (Python and JavaScript), LangSmith Deployment, LangChain's Deep Agents open source framework, and Open SWE. LangChain has been using sandboxes internally to power Open SWE. Roadmap items include shared volumes across sandboxes, binary authorization (controlling which binaries can run), and full execution tracing of all processes and network calls inside the VM.

The article positions sandboxes as essential infrastructure for three workloads: coding assistants that validate their own output, CI-style agents that clone repos and run test suites (like Open SWE), and data analysis agents executing Python scripts against datasets.

---

## Notable Quotes

> "Agents get a lot more useful when they can execute code. They can analyze data, call APIs, and build applications from scratch. But letting an LLM run arbitrary code without isolation from your infrastructure is risky."

> "Traditional containers were designed to run known, vetted application code. Agent-generated code is different: it's untrusted and unpredictable. A web server handles a known set of operations. An agent might attempt anything, including malicious commands."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/langchain-ai/open-swe | Open SWE -- LangChain's open-source SWE agent built on top of LangSmith Sandboxes; real-world usage of sandbox primitives | `/tool-catalogue` |
| https://docs.langchain.com/oss/python/deepagents/overview | Deep Agents -- LangChain's agentic workflow framework with native sandbox integration | `/ingest-article` |
| https://www.clawsecure.ai/blog/41-percent-openclaw-skills-vulnerabilities | 41% of OpenClaw skills have vulnerabilities -- security research motivating sandbox need | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LangSmith | Parent platform for Sandboxes; SDK provides sandbox API | No |
| LangSmith Sandboxes | Primary subject -- microVM-isolated secure code execution for agents | No |
| Open SWE | LangChain's SWE agent using Sandboxes internally; CI-style agent workflow | No |
| Deep Agents | LangChain's agentic workflow framework with native sandbox integration | No |
| Cursor | Mentioned as example coding agent that benefits from code execution | No (IDE, not catalogued) |
| Claude Code | Mentioned as example coding agent that benefits from code execution | Yes -- core tool |
| OpenClaw | Mentioned as coding agent; linked to security vulnerability research | Yes -- [OpenClaw](../../orchestration-platforms/openclaw.md) |
| Docker | BYOD images for sandbox runtime configuration | N/A (infrastructure primitive) |

---

## Action Items

- [ ] Monitor LangSmith Sandboxes for GA release -- evaluate if sandbox-as-a-service is useful for cloud-hosted agent deployments
- [ ] Extract Auth Proxy pattern for our agent credential management architecture (Phase 3+)
- [ ] Compare microVM isolation approach with NVIDIA OpenShell's kernel-level isolation and Ironclaw's WASM sandboxes
- [ ] Evaluate Open SWE (github.com/langchain-ai/open-swe) as reference for CI-style agent workflows
