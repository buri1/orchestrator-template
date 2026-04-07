# I Built an AI Factory That Uses Claude Code Agents to Build Apps While I Sleep

> **@BenjaminDEKR — 2026-01-04**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/BenjaminDEKR/status/2007842172666560983) |
| Author | @BenjaminDEKR (Benjamin De Kraker) — AI content creator, agent factory builder |
| Date | 2026-01-04 |
| Topics | AI factory, Claude Code, agent orchestration, Kanban pipeline, autonomous development, overnight agents |
| Type | Single post with video |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Kanban-style automated assembly line** — Projects move through stages: Idea -> Research -> Architecture -> Coding -> Testing. Each stage is handled by specialized Claude Opus 4.5 agents. This mirrors our orchestrator loop (GET_NEXT_TASK -> SPAWN_WORKER -> WAIT_FOR_PR -> REVIEW-FIX LOOP).
2. **Factory workers do full lifecycle autonomously** — Agents start with market research (web + social media search), validate ideas (check app stores, secure domain names via APIs/MCPs), create multiple rounds of UI revisions, then code and test. Human only reviews results in the morning.
3. **Worker documents travel with projects** — Each project carries a "worker document" through every stage, like a real factory traveler sheet. This is the same pattern as our state files and devlogs that persist across agent sessions.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is essentially our L-Thread orchestrator architecture applied to app generation instead of client work. Kanban pipeline = our issue queue, factory workers = our tmux agents, worker documents = our state files. The overnight autonomous operation validates the "sleep while agents work" model Burak already runs. Key difference: De Kraker's factory includes market research + domain acquisition + UI design stages we haven't automated yet. |

---

## Full Content

I built an AI Factory that uses Claude Code agents to build apps while I sleep. This is an automated 'assembly line' pipeline, all run by Claude Opus 4.5. Projects move through a Kanban-like system from Idea to Research, Architecture, Coding and Testing. Factory workers start with market research, searching the web and social media. Then they validate everything, checking app stores for competition and securing a domain name. (All automated by APIs and MCPs) They automatically create several rounds of app UI revisions. When I wake up, there are projects waiting for me to review: approve this design, give feedback, send that one back for improvement. Projects are actively coded and tested by the agents, while the entire process is tracked and logged (with 'worker documents' that travel each step of the way, like a real factory.)

**Engagement:** 339 replies — includes video demonstration of the factory pipeline

---

## Notable Replies

[X blocks automated reply fetching — 339 replies suggest active discussion about implementation details]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Benjamin De Kraker's AI Factory repo/guide (find via profile) | Full pipeline implementation — research, validation, UI generation, coding, testing stages | `/tool-catalogue` or `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary agent harness running the factory | Yes — throughout catalogue |
| Claude Opus 4.5 | Model powering all factory workers | Yes — referenced in model discussions |
| MCP servers | Used for API integrations (domain registration, app store checking) | Yes — [MCP protocol entries](../../agent-protocols/) |
