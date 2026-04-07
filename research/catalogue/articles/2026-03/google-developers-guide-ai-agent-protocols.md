# Developer's Guide to AI Agent Protocols

> **Kristopher Overholt — Google Developers Blog, 2026-03-18**

| Field | Value |
|-------|-------|
| Source | [developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/) |
| Author | Kristopher Overholt |
| Publication | Google Developers Blog |
| Date | 2026-03-18 |
| Topics | agent-protocols, MCP, A2A, UCP, AP2, A2UI, AG-UI, ADK, agent-interoperability, agent-commerce, agent-streaming |
| Read Time | 15 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Six protocols form the emerging agent communication stack** — Google identifies six key protocols that replace custom integration code with standardized patterns: MCP (tool/data access), A2A (agent-to-agent discovery and communication), UCP (universal commerce), AP2 (payment authorization with audit trails), A2UI (declarative UI composition from 18 primitives), and AG-UI (standardized SSE streaming from agent to frontend). Each solves a different layer of the agent stack.

2. **ADK (Agent Development Kit) is Google's first-class integration layer for all six protocols** — Every protocol is demonstrated through ADK, Google's agent framework. ADK provides `McpToolset` for MCP, `RemoteA2aAgent` and `to_a2a()` for A2A, native A2UI rendering in `adk web`, and AG-UI middleware via `ag_ui_adk`. This positions ADK as a "protocol-native" agent framework, distinct from framework-locked approaches.

3. **Discovery via well-known URLs is the unifying pattern** — A2A uses `/.well-known/agent-card.json` for agent discovery, UCP uses `/.well-known/ucp` for commerce capability discovery. This mirrors DNS/TLS certificate conventions and suggests a future where agents discover each other's capabilities automatically without registry services.

4. **AP2 introduces typed mandates with cryptographic audit trails for agent payments** — The IntentMandate -> PaymentMandate (signed) -> PaymentReceipt flow provides non-repudiatable proof of authorization with configurable guardrails (merchant allowlists, spending limits, expiry). This is the most mature agent payment authorization model catalogued, ahead of x402's HTTP 402 micropayments approach.

5. **A2UI's 18-component primitive catalogue enables agents to compose novel UIs dynamically** — Flat component list with ID references (not nested), separate data model from structure, renderable by any frontend framework (Lit, Flutter, Angular). This is the "generative UI" pattern done right — constrained composition from safe primitives rather than arbitrary HTML generation.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | This is the most comprehensive single-source overview of the agent protocol stack. MCP is already core to our architecture. A2A validates our Phase 3-4 federation plans. The protocol layering (data -> agents -> commerce -> payments -> UI -> streaming) maps directly to our system evolution roadmap. AP2's mandate model is the missing piece for autonomous agent spending in our Finance Agent. |
| **Actionable** | 6/10 | MCP integration already in place. A2A adoption is Phase 3-4 (agent federation). UCP/AP2 relevant for SaaS factory commerce flows and Finance Agent. A2UI pattern interesting for agent dashboards but we use Chrome DevTools MCP for E2E, not custom UIs. AG-UI streaming pattern applicable if we build web frontends for agent status. |

---

## Summary

Google published a comprehensive developer guide walking through six protocols that standardize different layers of AI agent communication. The article uses a restaurant supply chain agent scenario built with Google's Agent Development Kit (ADK) to demonstrate each protocol progressively.

**MCP (Model Context Protocol)** eliminates custom API integration code by providing a single connection pattern. The article shows `McpToolset` in ADK connecting to PostgreSQL via MCP Toolbox for Databases, Notion MCP for recipes, and Mailgun MCP for supplier emails.

**A2A (Agent2Agent Protocol)** standardizes agent discovery and communication. Each agent publishes an Agent Card at `/.well-known/agent-card.json` describing capabilities and endpoints. ADK's `RemoteA2aAgent` routes to remote agents, and `to_a2a()` converts any ADK agent into an A2A service.

**UCP (Universal Commerce Protocol)** standardizes the shopping lifecycle with typed request/response schemas across any transport (REST, MCP, A2A). Discovery uses `/.well-known/ucp`. The protocol provides `CheckoutCreateRequest` with typed line items and payment handling.

**AP2 (Agent Payments Protocol)** adds authorization guardrails with typed mandates: `IntentMandate` (what's allowed), `PaymentMandate` (bound to specific cart, signed), and `PaymentReceipt` (audit trail). Supports merchant allowlists, spending limits, expiry, and refundability requirements. Currently v0.1.

**A2UI (Agent-to-User Interface Protocol)** enables agents to compose UIs from 18 safe component primitives (Card, Column, Text, Button, CheckBox, TextField, DateTimeInput, etc.) via declarative JSON. Components are a flat list with ID references, and data is sent separately from structure. ADK's `adk web` renders A2UI natively.

**AG-UI (Agent-User Interaction Protocol)** standardizes the SSE event stream between agent backends and frontends. Typed events like `TEXT_MESSAGE_CONTENT`, `TOOL_CALL_START`, `TOOL_CALL_RESULT` replace custom parsing code. ADK integration via `ag_ui_adk` package wraps agents as FastAPI endpoints.

The article emphasizes an incremental adoption strategy: start with MCP for data access, add protocols as requirements grow.

---

## Notable Quotes

> "Six protocols, each solving a different problem, all working through a single agent."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://google.github.io/adk-docs/ | ADK documentation — Google's protocol-native agent framework | `/tool-catalogue` |
| https://a2a-protocol.org/ | A2A protocol spec — already catalogued but may need update | cross-reference |
| https://ucp.dev/ | Universal Commerce Protocol — new to catalogue | `/tool-catalogue` |
| https://github.com/google-agentic-commerce/AP2 | Agent Payments Protocol reference implementation | `/tool-catalogue` |
| https://a2ui.org/ | Agent-to-User Interface Protocol — 18-component primitive spec | `/tool-catalogue` |
| https://docs.ag-ui.com/ | AG-UI streaming protocol docs | `/tool-catalogue` |
| https://github.com/a2aproject/a2a-samples | A2A sample implementations | reference |
| https://github.com/Universal-Commerce-Protocol/samples/tree/main/a2a | UCP + A2A shopping assistant | reference |
| https://github.com/google/A2UI/tree/main/samples | A2UI component pattern samples | reference |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| MCP (Model Context Protocol) | Core data/tool access protocol | Yes — referenced across many entries |
| A2A Protocol | Agent-to-agent discovery and communication | Yes — [A2A Protocol](../../agent-protocols/a2a-protocol.md) |
| ADK (Agent Development Kit) | Google's agent framework, integrates all 6 protocols | No — consider `/tool-catalogue` |
| UCP (Universal Commerce Protocol) | Standardized shopping lifecycle | No — consider `/tool-catalogue` |
| AP2 (Agent Payments Protocol) | Payment authorization with typed mandates | No — consider `/tool-catalogue` |
| A2UI (Agent-to-User Interface Protocol) | Declarative agent UI composition | No — consider `/tool-catalogue` |
| AG-UI (Agent-User Interaction Protocol) | Standardized agent-to-frontend SSE streaming | No — consider `/tool-catalogue` |
| MCP Toolbox for Databases | ADK integration for PostgreSQL/SQLite/BigQuery | No — MCP server |
| x402 | Compared — HTTP 402 micropayments (different approach) | Yes — [x402](../../agent-protocols/x402.md) |

---

## Action Items

- [ ] Update existing [A2A Protocol](../../agent-protocols/a2a-protocol.md) entry with ADK integration details and `to_a2a()` conversion pattern
- [ ] Evaluate UCP for SaaS Factory commerce automation (Phase 3+)
- [ ] Evaluate AP2 mandate model for Finance Agent autonomous spending authorization
- [ ] Consider ADK as reference implementation for protocol-native agent design
- [ ] Track A2UI for potential agent dashboard UIs (alternative to Chrome DevTools screenshots)
- [ ] Catalogue UCP, AP2, A2UI, AG-UI as individual protocol entries
