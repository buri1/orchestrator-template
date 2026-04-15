# Icarus Memory Protocol — ~50 Lines of Bash for Agent Memory + Self-Training

> **@IcarusHermes — 2026-04-03**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/icarushermes/status/2039132856979435764) |
| Author | @IcarusHermes — "Icarus", creator of Icarus Memory Protocol & Icarus Cloud |
| Date | 2026-04-03 |
| Topics | agent-memory, self-training, markdown-memory, obsidian |
| Type | Thread |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Radical simplicity as architecture** — The entire agent memory protocol is ~50 lines of bash writing markdown files with YAML frontmatter to a shared `~/fabric/` directory. No vector DB, no embedding pipeline, no infrastructure. Plain text files that are human-readable and Obsidian-native.

2. **Memory tiering without a database** — Hot (<24h, always loaded), Warm (1-7 days, on query), Cold (>7 days, archived). The tiering is implicit via timestamps in the YAML frontmatter, not a separate system. This is the kind of thing that sounds too simple until you realize it covers 90% of use cases.

3. **Self-training pipeline closes the loop** — Agents accumulate decision logs during normal operation, export training pairs (task completions, review-correction cycles, cross-platform context), and fine-tune smaller models (default: Qwen2-7B-Instruct) via Together AI on their own history. The claim: replace expensive frontier models with domain-tuned small models at a fraction of the cost.

4. **Multi-agent handoff with referential integrity** — Builder -> Reviewer -> Revision chains where each step cross-references the previous via linked markdown files. Validation ensures nothing is orphaned. Designed for agent teams, not single-agent use.

5. **Obsidian as the knowledge layer** — Everything is markdown with YAML frontmatter, so the knowledge graph is natively browsable in Obsidian. No export step, no separate visualization tool. The vault *is* the memory.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly maps to our interest in agent memory, markdown-native workflows, and Obsidian integration. The "~50 lines of bash" philosophy resonates with Principle #7 (build only what you need). The self-training pipeline is the most interesting angle — it suggests a path from expensive frontier model usage to self-sustaining domain-tuned models. Our own catalogue + devlog system uses the same file-based memory pattern but without the tiering or self-training loop. |
| **Actionable** | 8/10 | The repo is open source and the approach is immediately inspectable. The memory tiering concept (Hot/Warm/Cold via timestamps) could be adopted into our own agent memory without any infrastructure changes. The self-training pipeline via Together AI is a concrete next step if we ever want to distill agent behavior into cheaper models. |

---

## Full Content

**Known tweet (March 30, 2026) from same thread:**
> "installed the icarus plugin on my Hermes agent. it picked up all 6 tools automatically. The agent works across slack, telegram, discord. every session gets captured. after a month of running you have hundreds of real decisions logged. then you tell the agent 'train yourself.'" — [link to GitHub repo]

*(19K+ views. The specific tweet ID 2039132856979435764 from April 3 was not directly fetchable due to X/Twitter scraping blocks and recency of the post. It likely continues this narrative with Icarus Cloud or new protocol features.)*

**Core protocol architecture:**
- `fabric_write` — create timestamped memory entries
- `fabric_read` — retrieve entries by agent and tier
- `fabric_search` — keyword lookup across all entries
- 7 tools total: `fabric_pending`, `fabric_recall`, `fabric_write`, `fabric_search`, `fabric_export`, `fabric_train`, `fabric_train_status`
- 4 hooks: context injection at session start, memory retrieval on topic change, decision capture post-response, session summary on end

**Icarus Cloud (commercial layer):**
- Website: https://icarushermes.com/
- Auto-capture from Slack, Telegram, Discord
- Creates linked notes in Obsidian vaults (code reviews -> fixes -> decisions)
- Builds knowledge graph of team reasoning chains
- Uses vault data to train custom replacement models
- Pro: Desktop companion app, Dynamic Island overlay (Mac), multi-profile view, memory notifications, training data dashboard

---

## Notable Replies

[Replies not accessible via automated fetch at time of ingestion. The March 30 tweet had 19K+ views, suggesting high-signal replies are likely present. Worth checking manually.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/esaradev/icarus-daedalus | Core open-source repo — ~50 lines bash, inspect the actual implementation | `/ingest-repo` |
| https://icarushermes.com/ | Commercial product site — shows where the OSS protocol is heading | `/ingest-article` |
| https://github.com/NousResearch/hermes-agent | Parent agent framework this plugs into | `/ingest-repo` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Icarus Memory Protocol | Core subject — ~50 lines bash, markdown+YAML memory for agents | No |
| Icarus Cloud | Commercial SaaS layer on top of the protocol | No |
| Hermes Agent (Nous Research) | Agent framework the plugin is built for | No |
| Together AI | Used for self-training fine-tune pipeline (Qwen2-7B-Instruct) | No |
| Obsidian | Knowledge layer — vault is the memory store | Yes (referenced in multiple entries) |
| Qwen2-7B-Instruct | Default target model for self-training distillation | No |
