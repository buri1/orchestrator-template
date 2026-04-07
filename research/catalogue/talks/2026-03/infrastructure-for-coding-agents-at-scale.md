# Infrastructure for Coding Agents at Scale — MCPs and Beyond

> **Ankit Mathur (Databricks) — Coding Agents: AI Driven Dev Conference 2026**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (05:13:03 - 05:40:20) |
| Speaker | Ankit Mathur — Infrastructure Engineer, Databricks |
| Co-speaker | Arushi (unable to attend) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~27 min (incl. Q&A) |
| Date | 2026-03-08 |
| Topics | coding agent gateway, agent sprawl, enterprise deployment, MCP security, observability, cost controls, code review bottleneck, shift-left testing |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Key Takeaways

1. **"Agent Sprawl" is the #1 blocker for enterprise coding tool adoption** — IT admins face fragmented vendor contracts, scattered billing, no unified observability, and no way to enforce security/privacy policies across Claude Code, Codex, Cursor, Gemini CLI, etc. Databricks built a "Coding Agent Gateway" to solve this by proxying all coding tools through a single control plane with unified auth, billing, dashboards, and privacy controls.

2. **MCPs are the biggest recent coding innovation, but their security model is broken** — Ankit argues MCPs have dramatically expanded what coding agents can do (calendar, Jira, Glean, cloud infra), but the default setup stores tokens in plaintext locally with no rotation. Databricks solved this by moving MCP token management into their existing data catalog with encryption and auto-rotation — a single OAuth login grants access to all configured MCP servers.

3. **Code review is now the #1 velocity bottleneck, not code writing** — At Databricks (2,000+ engineers, 7+ languages), coding tools have massively increased code output, but the volume of code reviews has exploded and tooling hasn't kept up. Ankit explicitly calls this out as the biggest open problem and opportunity.

4. **CI costs explode at agent scale (10-100 agents per human)** — Deploying many agents per engineer creates massive CI scalability demands. Dependency graph errors become especially painful because they trigger cascading test runs. Proper service abstractions become more important than ever.

5. **Shift-left testing with staging hot-swap is critical for agent code quality** — Agents write unrealistic/unperformant code without early validation signals. Databricks built a "hot swap" technology that deploys agent-written code into a staging instance, creating a virtuous feedback loop. Without it, agent code was "completely unrealistic to deploy."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses enterprise coding agent deployment, multi-tool orchestration, MCP governance, observability — all core concerns for our system. The "agent sprawl" framing maps to our federated architecture challenge. |
| **Actionable** | 6/10 | The gateway concept validates LiteLLM-style model routing. The MCP token governance pattern is useful. The code review bottleneck data confirms our human-review-bottleneck research. However, the gateway itself is Databricks-proprietary (not open source), so we can't directly adopt it. |

---

## Summary

Ankit Mathur presents Databricks' approach to deploying coding agents at enterprise scale. He frames the problem from the IT admin's perspective: when engineers use multiple AI coding tools (Claude Code, Codex, Cursor, Gemini CLI), IT faces fragmented vendor contracts, scattered billing, no unified observability, and difficulty enforcing security policies (e.g., preventing PII from being used for model training). He calls this "agent sprawl" and argues it's the #1 reason enterprises aren't using more coding tools, despite massive productivity gains.

Databricks' solution is a "Coding Agent Gateway" — a lightweight proxy that routes all coding tool traffic through a single control plane. Developers use their preferred tools normally but get unified auth, billing, and dashboards. The gateway provides observability on who's using what tools, how many tokens and requests are consumed, and which teams are most active. All metrics flow into Databricks' data warehouse for custom dashboards, including executive-level views that are reviewed every meeting.

He highlights MCPs as "maybe the number one coding tool innovation" but flags their security model as broken for enterprises — tokens stored in plaintext, no rotation, no centralized management. Databricks solved this by integrating MCP token management into their data catalog with encryption, auto-rotation, and user/org-level token scoping. A single daily OAuth login gives developers access to all their configured MCPs (Glean, Jira, Google, etc.). He notes that selecting too many MCPs floods input context, making requests slower and more expensive.

Internally, Databricks uses a harness called "Isaac" that wraps multiple coding tools with unified metrics, MCP configuration, and token capacity management. They trace all Claude Code requests via MLflow, ingesting tens of thousands of traces per day. One discovery from trace analysis: Claude Code does excessive file search, and adding an explicit CLAUDE.md instruction to "use rg instead" significantly improved performance.

The talk concludes with three shifting bottlenecks: (1) code review volume has exploded and tooling hasn't kept up, (2) CI costs spike when deploying 10-100 agents per human, and (3) testing requires "shift-left" approaches where agents get validation signals early. Databricks built a hot-swap technology that deploys agent code into staging environments for realistic testing, which dramatically improved code quality.

---

## Notable Quotes

> "I really believe that coding tools are going to be a top 10 cost driver for all of these companies." — [05:19:45]

> "We call this thing agent sprawl. It's happening everywhere." — [05:19:34]

> "MCPs — maybe the number one coding innovation that I have experienced in the last couple months." — [05:25:20]

> "At least at Databricks, our velocity is most bottlenecked by our ability to scalably review this code." — [05:32:07]

> "Without [staging hot-swap], the agents were often writing code that was completely unrealistic to deploy or was extremely unperformant." — [05:34:06]

> "It's more important than ever to have the right abstractions between projects and between different services so that agents have a faster dev loop." — [05:32:43]

> "We actually added a very explicit instruction [in CLAUDE.md] which was like please use rg to search for stuff, do not use anything else — and that was super valuable." — [05:37:19]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Databricks AI Gateway docs (if public) | The gateway pattern for multi-tool governance is directly relevant to our LiteLLM + model routing strategy | `/ingest-article` |
| MLflow tracing for Claude Code | Traces tool calls and request patterns; tens of thousands per day at Databricks | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary coding tool Ankit uses for writing code | Yes — referenced across catalogue |
| Codex (OpenAI) | Used by Ankit for code review (cross-model review pattern) | No — not standalone entry |
| Cursor | Mentioned as one of the many coding tools in the landscape | [Yes](../../developer-gui/cursor.md) |
| Gemini CLI | Mentioned as one of the coding tools ("Google actually has two") | No |
| Databricks Coding Agent Gateway | Central product of the talk — multi-tool proxy with unified auth/billing/observability | No — proprietary, not catalogueable |
| Isaac (Databricks internal) | Internal harness wrapping all coding tools with unified metrics, MCP config, token capacity | No — internal tool |
| LiteLLM | Not mentioned by name, but the gateway pattern is functionally similar (unified model proxy) | [Yes](../../infrastructure/litellm.md) |
| MLflow | Used to trace all Claude Code requests; tens of thousands of traces per day | Not yet catalogued — consider `/tool-catalogue` |
| Glean | Mentioned as MCP integration for knowledge search | No |
| Jira | Mentioned as MCP integration; "there just isn't a Jira MCP until there's a reasonable story for how it would be secured" | No |
| Anthropic Tool Search | Mentioned in Q&A: "recently Anthropic launched tool search as a tool within the model" for MCP selection | No — it's a native feature |

---

## Action Items

- [ ] Compare Databricks gateway pattern with our LiteLLM setup — the unified billing + per-user cost caps across tools is a pattern worth adopting
- [ ] Add explicit `rg` instruction to our CLAUDE.md (Databricks found this dramatically improved Claude Code performance by avoiding slow file search)
- [ ] Validate our human-review-bottleneck research against Ankit's data — code review is now the #1 bottleneck at a 2,000+ engineer company
- [ ] Investigate MLflow tracing for Claude Code sessions — could provide the observability layer we need
- [ ] Consider staging hot-swap pattern for agent validation loops — early validation signals create "virtuous loops" for agent code quality
- [ ] Review MCP token governance approach — centralized encrypted storage with auto-rotation vs our current local token setup

---

## Q&A Highlights

**Skills proliferation governance** — Audience asked about managing the explosion of Claude Code skills across teams. Ankit confirmed this is unsolved: "every team has a skill now and most of them are doing the same thing." He wants deduplication/discovery ("if there was some way to know that there was a very similar skill already") but admits "it feels really intractable for humans to read thousands of markdown files."

**Tool call observability** — Asked about tracking actual tool calls (not just HTTP requests). Ankit confirmed they trace all Claude Code requests via MLflow (tens of thousands of traces/day). Key finding: Claude Code over-indexes on file search, and adding a CLAUDE.md instruction to use `rg` instead fixed a major performance bottleneck.

**MCP curation and "MCP for MCPs"** — Audience raised whether you need a meta-layer to manage MCPs. Ankit noted that Anthropic's recently launched Tool Search helps with MCP selection at the harness layer. He expects this to be solved within months but currently recommends developers manually curate per use case. He emphasized needing a "governance layer" for MCPs.

**Staging hot-swap latency** — Asked about time-to-deploy for local changes to become user-testable. Ankit noted it's org-specific but Docker-based services can swap images quickly. The key investment is routing infrastructure — services need code to detect "swap mode" and route to the staging instance.
