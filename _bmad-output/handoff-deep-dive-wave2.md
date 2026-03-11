# Handoff: Deep Dive Wave 2 — Remaining Catalogue Candidates

## Context
We ingested a 6-hour conference (14 talks), then spawned 16 deep-dive agents + 12 bookmark agents (42 total).
Then did a deep ingest of Simon Willison's full 10-chapter guide.
Total catalogue grew from ~206 to ~222 entries this session.

The deep-dive candidates below were surfaced FROM the entries we created but not yet ingested.
23 items remaining, 7 high-priority.

## Instructions
Spawn parallel subagents for each item below. Use the skill indicated.
All entries go into `research/catalogue/` following existing templates.

---

## HIGH PRIORITY (8+ relevance) — Do these first

### /ingest-article (3 items)
1. `https://www.anthropic.com/research/measuring-agent-autonomy` — Anthropic full autonomy research paper. 998K API tool calls analyzed, deployment overhang data. [9/10]
2. `https://openai.com/index/codex-test-scaffolding/` — OpenAI Codex Test Scaffolding patterns. Companion to the Harness Engineering article already ingested. [8/10]
3. `https://ghuntley.com/specs/` — Geoffrey Huntley "Ralph Wiggum Loop" specs. The agent-to-agent review loop OpenAI adopted. [8/10]

### /ingest-post (3 items)
4. `https://x.com/trq212/status/2024574133011673516` — Thariq (Anthropic): prompt caching + ExitPlanTool design [8/10]
5. `https://x.com/trq212/status/2014480496013803643` — Thariq (Anthropic): Task Tool replacing TodoWrite [8/10]
6. `https://x.com/RLanceMartin/status/2027450018513490419` — Lance Martin (LangChain): programmatic tool calling in Claude API [8/10]

### /tool-catalogue (1 item)
7. `https://github.com/nearai/ironclaw` — Ironclaw: Rust AI assistant framework, WASM sandbox, MCP integration, 7.5K stars [8/10]

---

## MEDIUM PRIORITY (6-7 relevance) — Do after high priority

### /ingest-article (8 items)
8. `https://openai.com/index/openai-internal-data-agent/` — OpenAI Internal Data Agent "Aardvark" [7/10]
9. `https://ghuntley.com/papercuts` — Corporate friction vs AI velocity [7/10]
10. `https://ghuntley.com/six-month-recap` — 6-month AI productivity longitudinal data [7/10]
11. `https://latentpatterns.com/principles` — AI-native software development principles [7/10]
12. `https://hamel.dev/blog/posts/prompt/` — Hamel Husain prompt engineering (cited as key reference in 12 Factor Agents) [7/10]
13. `https://openai.com/index/beyond-rate-limits/` — Scaling Codex infrastructure [6/10]
14. `https://ghuntley.com/screwed` — Student career impact of AI [6/10]
15. `https://minimaxir.com/2026/02/ai-agent-coding/` — Max Woolf AI agent coding patterns [6/10]

### /ingest-post (2 items)
16. `https://x.com/LLMJunky/status/2014521564864110669` — am.will Codex swarms Part 1 (fundamentals) [7/10]
17. `https://x.com/LLMJunky/status/2024152021436121220` — am.will Codex swarms Part 2 (custom agents) [7/10]

### /tool-catalogue (6 items)
18. `https://github.com/vercel-labs/json-render` — Generative UI framework, 12.1K stars [7/10]
19. `https://github.com/ctate/manaflow` — OSS Claude Code web/Codex Cloud/Devin alternative [7/10]
20. `https://github.com/simonw/rodney` — CDP browser automation purpose-built for coding agents [7/10]
21. `https://github.com/simonw/showboat` — Testing documentation tool with fabrication prevention [6/10]
22. `https://github.com/am-will/codex-skills` — Custom agent role definitions for Codex swarms [6/10]
23. `https://github.com/am-will/swarms` — Swarm Planner and Parallel Task skills for Codex [6/10]
