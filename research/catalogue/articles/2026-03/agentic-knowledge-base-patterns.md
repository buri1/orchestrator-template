# 6 Agentic Knowledge Base Patterns Emerging in the Wild

> **Bill Doerrfeld — The New Stack, Feb 18, 2026**

| Field | Value |
|-------|-------|
| Source | https://thenewstack.io/agentic-knowledge-base-patterns/ |
| Author | Bill Doerrfeld |
| Publication | The New Stack |
| Date | 2026-02-18 |
| Topics | agentic knowledge bases, MCP, RAG, enterprise AI, context engineering, multi-agent |
| Read Time | 8 min |

---

## Burak's Notes

> *Six enterprise patterns for how organizations are building knowledge bases that feed AI agents. The "Multi-Agent Home Base" pattern (R Systems) and "Playbook for Coding Assistants" (LinkedIn CAPT) are the most directly relevant -- they describe exactly the problem our CLAUDE.md + catalogue + orchestrator-state.json setup solves. The MCP-Powered Capability Layer (Vendia) explicitly calls out migration from RAG prompt-stuffing to MCP-based retrieval, which aligns with our deferred tool loading research. The Amazon "Source of Truth" pattern -- YAML configs, versioned markdown, structured catalog tables exposed via API -- is literally what our catalogue already is.*

---

## Key Takeaways

1. **Agentic knowledge bases are not centralized products but purpose-built layers** — Every enterprise quoted builds these as federated, domain-specific layers rather than one monolithic knowledge base. This validates our approach of distributed CLAUDE.md + catalogue + state files over a single "brain" database.

2. **LinkedIn's CAPT architecture anticipated what became "agent skills"** — Contextual Agent Playbooks and Tools encode rules, conventions, procedures, and verification steps, surfaced via MCP. Saw 20% increase in AI coding adoption and 70% reduction in issue triage time. The playbook pattern maps directly to our `.claude/agents/` and `.claude/commands/` structure.

3. **MCP is replacing RAG as the preferred knowledge retrieval pattern** — Vendia explicitly frames MCP as the successor to prompt-stuffing/RAG: "let the LLM automate its own searching, retrieval, and results exploration." This aligns with our deferred tool loading research and the broader shift toward agent-driven context assembly.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Validates our federated knowledge architecture (catalogue + CLAUDE.md + state files); confirms MCP-over-RAG trend; LinkedIn CAPT is closest enterprise analog to our playbook structure |
| **Actionable** | 5/10 | Patterns are descriptive not prescriptive; no new tools to adopt; reinforces existing architectural decisions rather than introducing new ones |

---

## Summary

Bill Doerrfeld surveys six enterprise patterns for building knowledge bases that serve AI agents, drawing on interviews with practitioners at LinkedIn, Amazon, Epicor, R Systems, Adeptia, and Vendia.

The core thesis is that agentic knowledge bases are not emerging as centralized products but as purpose-built layers within existing systems. LinkedIn's CAPT (Contextual Agent Playbooks and Tools) encodes organizational rules, conventions, and procedures as MCP-surfaced playbooks -- a pattern they claim anticipated the industry's later standardization of "agent skills." Their debug playbook chains: fetch ticket, pull logs, search historical tickets, identify code paths, classify team owners, apply fix, run validation, create PR. Results: 20% increase in AI coding adoption, 70% reduction in issue triage time.

Amazon's BI team builds "The Source of Truth for Data Intelligence" -- machine-readable definitions of tasks, schemas, data quality rulesets, and incident runbooks. "Most of it is YAML configs, versioned markdown, and structured catalog tables exposed via API." The explicit goal: "The knowledge base isn't there to help the agent be creative. It's there to keep it inside the lines." This constraint-first philosophy mirrors our 70/30 deterministic/LLM split.

R Systems' "Multi-Agent Home Base" uses vectorized document repos + semantic search + RAG for multi-agent workflows, emphasizing that all agents share the same rules, voice, and playbook. Vendia frames MCP as the next evolution beyond RAG, arguing companies should "let the LLM automate its own searching, retrieval, and results exploration" rather than pre-stuffing prompts.

The article cites a 2026 Zapier study: 25% of enterprises expect full-scale orchestration by 2026; 43% anticipate reaching the "agentic AI stage." Key challenges: keeping data fresh, open standards, distributed ownership, version control, and intentionally federated architecture.

---

## Notable Quotes

> "Out of the box, AI coding agents weren't effective. They lacked context and awareness of internal systems, frameworks, and practices." — Ajay Prakash, LinkedIn

> "Organizations are definitely building these, though it rarely looks like one centralized knowledge base product." — Anusha Kovi, Amazon

> "It gives every agent the same rules, voice, and playbook so they don't improvise policy on the fly." — R Systems

> "Most of it is YAML configs, versioned markdown, and structured catalog tables exposed via API." — Anusha Kovi, Amazon

> "The knowledge base isn't there to help the agent be creative. It's there to keep it inside the lines." — Amazon

> "Companies are starting to migrate from prompt stuffing techniques like RAG... instead let the LLM automate its own searching, retrieval, and results exploration." — Vendia

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| LinkedIn CAPT blog/docs (if published) | Closest enterprise analog to our playbook architecture; MCP-surfaced organizational rules | `/ingest-article` |
| Vendia MCP gateway docs | MCP-as-knowledge-retrieval replacing RAG; concrete implementation details | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LinkedIn CAPT | Contextual Agent Playbooks and Tools -- MCP-surfaced coding assistant playbooks | No |
| Adeptia AI | Integration knowledge center with institutional + situational context layers | No |
| Vendia MCP Gateway | MCP-powered capability layer replacing RAG for agent knowledge retrieval | No |
| Epicor ERP AI | Shared business context knowledge base for financial and customer support agents | No |
| MCP (Model Context Protocol) | Referenced as the protocol enabling Vendia's capability layer and LinkedIn's CAPT delivery | Yes (multiple entries) |

---

## Action Items

- [ ] Monitor LinkedIn engineering blog for public CAPT documentation -- their playbook-as-MCP-tool pattern is the closest enterprise validation of our `.claude/commands/` architecture
- [ ] Track Vendia's MCP gateway for potential catalogue entry if they open-source or publish detailed architecture docs
- [ ] Consider formalizing our catalogue's YAML/markdown structure as an explicit "Source of Truth" pattern a la Amazon's approach -- we already do this but haven't named it
