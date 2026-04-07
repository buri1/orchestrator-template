# General Purpose Agents — The Agent Harness and Tool Runtime

> **Harrison Chase (LangChain) & Sam Partee (Arcade.dev) — Coding Agents: AI Driven Dev Conference 2026, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (06:07:22 – 06:43:39) |
| Speaker | Harrison Chase (CEO/co-founder, LangChain) & Sam Partee (CTO/co-founder, Arcade.dev) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~36 min (incl. Q&A) |
| Date | 2026-03-08 |
| Topics | agent harness, tool runtime, delegated authorization, general purpose agents, deep agents, MCP, multi-user agents, enterprise auth |

---

## Burak's Notes

> *(empty — reserved for Burak)*

---

## Key Takeaways

1. **Coding agents are the foundation for general purpose agents** — The harness pattern (file system tools, planning, sub-agents, skills, compaction, human-in-the-loop) that powers Claude Code and Codex is the same scaffolding you need to build any general purpose agent. The difference is replacing the terminal interface with a user-friendly UI and adding authenticated tool access.

2. **Agent harness vs. tool runtime is the key architectural split** — The harness manages the local agent environment (file system, planning, sub-agents, context window management, compaction). The tool runtime manages authentication, authorization, and third-party service integration for multi-user deployment. These two layers have distinct responsibilities and must not be conflated.

3. **Delegated agent authorization is the enterprise unlock** — Service tokens are either over-privileged (CISO blocks adoption) or under-privileged (agent is useless). The solution is delegated subset tokens: the agent acts *as* the user with the minimum privilege needed for each specific tool action, not *for* the user with a generic service token.

4. **Virtual file systems enable remote/scalable agents** — LangChain's Deep Agents support pluggable backends where the "file system" can be a real local FS or a database-backed virtual FS. This makes the same agent code work locally on a laptop or remotely in a sandbox, which is critical for scaling beyond single-user.

5. **Agent identity is an emerging unsolved problem** — OpenClaw demonstrated agents taking on their own identity (with their own memory and credentials) rather than always passing through user credentials. Harrison acknowledges this is a new paradigm they hadn't seen before and the implications are still being figured out.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses our core architecture: agent harness design, multi-agent orchestration, the harness+runtime split maps cleanly to our 70/30 deterministic/LLM boundary. Deep Agents is a direct competitor/reference for our L-Thread harness. |
| **Actionable** | 7/10 | Validates several patterns we already use (file-system-as-state, planning tools, sub-agent context isolation, compaction). The delegated auth pattern via Arcade is actionable if/when we build multi-user agents for gov clients. The virtual FS concept is worth evaluating for remote agent deployment. |

---

## Summary

Harrison Chase and Sam Partee present a framework for understanding what it takes to go from a coding agent (single user, local laptop) to a general purpose agent (multi-user, enterprise-deployed). They split the problem into two distinct architectural layers.

The **agent harness** is the scaffolding around the LLM that lets it interact with its environment. Harrison describes six components in LangChain's "Deep Agents" harness: file system tools (list, read, write, edit, glob, grep — modeled closely on Claude Code), a planning tool (generates a plan into the context window, similar to Claude Code's approach), sub-agents with context isolation (each sub-agent sees only its task, parent sees only the result), skills (packaged instructions + tools discoverable at runtime), context engineering (offloading large tool results to files, compaction with original messages saved to file system, LLM self-managed context), and human-in-the-loop (configurable per-tool interrupts via LangGraph). A distinctive feature is the pluggable file system backend — the same agent code can run against a real local FS or a database-backed virtual FS, enabling remote/sandboxed deployment.

The **tool runtime** (Arcade's domain) handles the problem that arises once the agent needs to interact with third-party services on behalf of multiple users. Sam walks through a flight-booking example: checking calendars (which calendar system? whose credentials?), finding flights (personalized results), booking and paying, notifying on Slack — each step requires authentication and authorization against different services. The core insight is that service tokens fail in two ways: over-privileged (no CISO will approve) or under-privileged (agent is useless beyond one local user). The solution is "delegated agent authorization" — Arcade holds a token for the exact subset of permissions authorized for that specific agent, at that specific time, for that specific user, for that specific service. This gives agents the same security profile that CISOs have approved for web apps for 15 years. Pre/post-execution hooks allow integration with existing entitlement systems (RBAC, PII detection, named entity recognition).

The Q&A surfaced several notable points: prompt injection defense relies on human-in-the-loop for write operations by default; OpenClaw's concept of agent identity (agents with their own credentials vs. pass-through user credentials) is recognized as a genuinely new paradigm; background event-triggered agents with an "inbox" for human approvals is the direction both see the space going; open-source models are not yet reliable enough to drive these harnesses (Sam: "there's a severe degradation if you're going from 4.6 Opus to anything right now").

---

## Notable Quotes

> "You can represent an agent as basically an agent.md and skills and an mcp.json." — Harrison Chase [06:12:09]

> "Doing work for the user is good. Doing work as the user is much better." — Sam Partee [06:25:57]

> "You don't want to give an agent rm -rf to your Google Drive. That's a bad idea. Giving them delete is almost never a good idea." — Sam Partee [06:23:51]

> "There's a severe degradation if you're going from 4.6 Opus to anything pretty much right now." — Sam Partee [06:40:58]

> "Pretty clearly the agent of the future — they can write and execute code, they have some aspect of memory, they're connected to a bunch of tools, they're exposed through different services." — Harrison Chase [06:35:40]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/langchain-ai/deep-agents | LangChain's open-source agent harness — direct competitor/reference for our L-Thread pattern | `/tool-catalogue` |
| https://arcade.dev | Tool runtime for delegated agent auth; 8,000+ tools; enterprise auth patterns | `/tool-catalogue` |
| Arcade "80 tool patterns" blog/website | Harrison references a resource with "80 different tips and tricks for tools" — worth finding | `/ingest-article` |
| LangChain Agent Builder | No-code agent creation UI powered by Deep Agents + Arcade; background event-triggered agents with inbox | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LangChain | Harrison's company; framework for abstractions and integrations | Not as separate entry (mentioned across reference docs) |
| LangGraph | Lower-level agent runtime with durable execution, streaming, human-in-the-loop, persistence; Deep Agents built on top | [Yes](../orchestration-platforms/langgraph.md) |
| Deep Agents | LangChain's agent harness; open source; file system tools, planning, sub-agents, skills, compaction, HITL | Not yet catalogued — consider `/tool-catalogue` |
| Arcade.dev | Tool runtime for multi-user agent auth; 8,000+ tools; delegated authorization; MCP gateway | Not yet catalogued — consider `/tool-catalogue` |
| Claude Code | Referenced as primary inspiration for Deep Agents' file system tools and planning tool | [Yes](../agent-harnesses/claude-agent-sdk.md) |
| Codex (OpenAI) | Referenced as alternative harness with smaller file system tool set (just read/write + bash) | [Yes](../agent-harnesses/openai-codex.md) |
| OpenClaw | Discussed in Q&A; agent identity concept; channels; praised as "scorched the earth" | [Yes](../orchestration-platforms/openclaw.md) |
| Manus AI | Referenced as pushing toward user-friendly agent interfaces | [Yes](../agent-harnesses/manus-ai.md) |
| Claude Co-work | Referenced alongside Manus as direction for user-friendly agent interfaces | No |
| LangSmith | Referenced as IDP for Agent Builder authentication flow | No (LangChain's SaaS platform) |
| Agent Builder | LangChain's no-code agent creation product; powered by Deep Agents; email assistant, LinkedIn recruiter templates | Not yet catalogued |
| Agent Inbox | LangChain concept for surfacing agents that need human approval | Not yet catalogued |
| GLM / Kimmy | Open-source model tested on Deep Agents; "wasn't amazing" | No |

---

## Action Items

- [ ] Evaluate LangChain Deep Agents as a reference architecture — compare harness components to our L-Thread Orchestrator
- [ ] Investigate Arcade.dev's delegated authorization model for future gov client multi-user deployment
- [ ] Consider the virtual file system pattern (database-backed FS) for remote agent deployment in Phase 3+
- [ ] Find and ingest Arcade's "80 tool patterns" resource
- [ ] Watch for Agent Builder + Arcade integration release — test with email assistant template
- [ ] Evaluate the "agent identity" concept (agents with own credentials vs pass-through) for our federated architecture
