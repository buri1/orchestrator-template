# Lightning Talk: How to Productionize Sub-Agents for LM Post-Training

> **Fay — Coding Agents: AI Driven Dev Conference 2026, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (04:35:12 - 04:44:21) |
| Speaker | Fay — Tech Lead, Pinterest Growth AI Applications |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~9 min (lightning talk) |
| Date | 2026-03-08 |
| Topics | sub-agents, post-training, agent orchestration, agent memory, ML engineering, Claude Code |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Key Takeaways

1. **Sub-agents beat swarms for ML post-training** — Agent Teams/swarms hit two bottlenecks in the post-training loop: exponential context window expansion (agents passing results to each other) and the "hot celebrity problem" (one agent becomes a bottleneck with no dynamic scaling). Sub-agent architecture avoids both.

2. **"Tool Calling 2.0" cuts token consumption 50-70%** — Instead of multi-turn request/response loops (5 requests, 5 responses), let agents write their own scripts to self-check in a loop. One response with a script replaces many round-trips. This is the biggest efficiency unlock mentioned.

3. **Data representation bias is the #1 training failure mode** — Uneven data distribution across countries/users causes training loss instability. Fix: have agents generate their own dataset reports with representation breakdowns per country/user as gated artifacts before training proceeds.

4. **Custom agent memory with pruning + reward model** — Default Claude Code memory (procedural .md + episodic) is insufficient for post-training. Pinterest built a custom Memory API tool with server-side pruning/compression and a lightweight reward model to control what gets written. Acknowledged this will likely become tech debt in 3-6 months.

5. **4-6 weeks to ~1 week** — The entire ML post-training pipeline (data cleaning, model download, hyperparameter selection, LoRA/QLoRA/full fine-tuning, loss function, reward config, eval loop, RLHF/DPO) compressed from 4-6 weeks to roughly 1 week using Claude Code sub-agents.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Sub-agent vs swarm tradeoffs directly applicable to our orchestrator architecture. The "hot celebrity problem" validates our concern about coordination overhead. Memory pruning pattern is novel. |
| **Actionable** | 6/10 | "Tool Calling 2.0" pattern (agents write scripts instead of multi-turn) is immediately adoptable. Custom memory pruning is interesting but we don't run post-training pipelines. Structured skills.md tip reinforces what we already do. |

---

## Summary

Fay, a tech lead at Pinterest Growth AI Applications, presents how her team uses Claude Code sub-agents to accelerate LM post-training from a 4-6 week manual process to approximately one week. The traditional pipeline -- data cleaning, model download, hyperparameter tuning (LoRA/QLoRA/full fine-tune), loss function definition, eval-retrain loops, and RLHF/DPO -- was entirely linear and manual.

The team evaluated both sub-agents (hub-and-spoke, reporting only to the main agent) and agent swarms/teams (shared task list, peer-to-peer communication). They chose sub-agents because swarms hit two critical bottlenecks: (1) context window explosion from agents sharing results with each other, and (2) the "hot celebrity problem" -- one agent becomes overwhelmed with no way to dynamically scale. She also recommends MiniMax 2.5 as a cost-effective alternative to Opus (27 cents on the dollar), noting it handles dynamic sub-agent scaling natively due to its PARL (preference alignment reinforcement learning) training.

The talk identifies four failure patterns when agents handle post-training: spec drift (forgetting success metrics across iterations), data representation bias (uneven country/user distribution causing training loss instability), memory collapse (hallucination after 20-100 epochs), and tool misuse (less of an issue in 2026). The fixes include: using Agent SDK for gated orchestration with hooks (reject/ship decisions at each stage), structured skills.md files over natural language instructions, "Tool Calling 2.0" (agents write self-checking scripts instead of multi-turn conversations, reducing tokens 50-70%), and a custom Memory API with server-side pruning and a reward model controlling what gets persisted.

The talk closes with an open question about long-horizon development memory, referencing Cursor's hybrid retrieval using Merkle trees and Letta's blocked memory from archive retrieval over vector databases, plus two research papers on treating memory as a learned parameter via PPO/GRPO and "InfraITE" which condenses memory into hot/cold storage via MCP.

---

## Notable Quotes

> "We quickly find out two bottlenecks. Number one is context limitation... the context window quickly expands exponentially. And number two is the rigidness of the orchestration... you will quickly run into what we call the hot celebrity problem." — 04:37:57

> "Just letting the agent handle you one response with the script and then have the loop until it checks its own work drastically reduces 70 to 50% of the token consumption." — 04:42:02

> "I do want to claim that it is working in our production now but very likely in the next three to six months this is going to become tech debt." — 04:42:51

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| MiniMax 2.5 model | Budget sub-agent model (27 cents on the dollar vs Opus); PARL-trained for dynamic scaling | `/tool-catalogue` |
| InfraITE paper (hot/cold memory via MCP) | Novel memory architecture condensing into hot domain and cold storage via MCP | Research paper — manual review |
| PPO/GRPO learned memory paper | Treating agent memory as a learned parameter via reinforcement learning | Research paper — manual review |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary agent runtime for the post-training pipeline | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| Agent SDK | Used for gated orchestration with hooks | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| Letta | Mentioned for blocked memory from archive retrieval + vector DB | Yes — [Letta / MemGPT](../agent-memory/letta.md) |
| Cursor | Referenced for hybrid retrieval + Merkle tree memory | Yes — [Cursor](../developer-gui/cursor.md) |
| MiniMax 2.5 | Budget model recommendation (27% cost of Opus); PARL-trained | No — not yet catalogued |
| Hugging Face | Model download source | No — infrastructure, not relevant to catalogue |

---

## Action Items

- [ ] Evaluate "Tool Calling 2.0" pattern — have agents write self-checking scripts instead of multi-turn conversations to reduce token consumption
- [ ] Consider the gated artifact pattern — agents produce machine-readable reports at each stage that gate progression (reject/ship decisions)
- [ ] Research MiniMax 2.5 as budget sub-agent model for non-critical tasks
