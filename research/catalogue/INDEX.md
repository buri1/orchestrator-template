# Knowledge Catalogue

> A categorized reference of all tools, frameworks, platforms, practitioners, articles, talks, and posts analyzed during research.

**Last updated:** 2026-03-08
**Templates:** [Tool](./_TEMPLATE.md) | [Practitioner](./_TEMPLATE-PRACTITIONER.md) | [Article](./_TEMPLATE-ARTICLE.md) | [Talk](./_TEMPLATE-TALK.md) | [Post](./_TEMPLATE-POST.md)

---

## Quick Reference — Tools & Frameworks

| Tool | Category | Relevance | Verdict |
|------|----------|-----------|---------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | ⚙️ Harness | 9/10 | Primary harness — SDK, Agent Teams, 18 hooks, subagents |
| [Oh-My-Pi](./agent-harnesses/oh-my-pi.md) | ⚙️ Harness | 9/10 | Pi fork with worktree isolation, hash state, model routing |
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 🎛️ Orch. Framework | 9/10 | The 70/30 deterministic/LLM blueprint pattern |
| [Pi Agent](./agent-harnesses/pi-agent.md) | ⚙️ Harness | 8/10 | Primary Day 60+ harness candidate |
| [OpenCode](./agent-harnesses/opencode.md) | ⚙️ Harness | 7/10 | Go+TS hybrid, 117K stars, TaskTool + Teams |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 🎛️ Orch. Framework | 6/10 | 271K stars, lane queuing, context checkpoints |
| [Paperclip](./orchestration-platforms/paperclip.md) | 🎛️ Orch. Framework | 6/10 | Reference cost tracking + session persistence |
| [Pi Messenger](./agent-harnesses/pi-messenger.md) | ⚙️ Harness | 6/10 | Multi-agent comms for Pi, steering injection |
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 🧠 Memory | 6/10 | Consolidation-as-sleep pattern |
| [DSPy](./agent-harnesses/dspy.md) | ⚙️ Harness | 5/10 | Declarative agent paradigm, GEPA optimizer |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | ⚙️ Harness | 5/10 | Open-source; Phase 3+ adapter candidate |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | ⚙️ Harness | 4/10 | Proprietary; competitive intelligence only |
| [Factory IDE](./developer-gui/factory-ide.md) | 🖥️ GUI | 4/10 | Proprietary; competitive reference only |
| [Pi Subagents](./agent-harnesses/pi-subagents.md) | ⚙️ Harness | 7/10 | Nico Bailon's role-based delegation for Pi |
| [Airweave](./agent-memory/airweave.md) | 🧠 Memory | 3/10 | Too heavy; Phase 4+ |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 🎛️ Orch. Framework | 3/10 | Web3/chatbot DNA; evaluator pattern only |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | ⚙️ Harness | 3/10 | Qwen-coupled; low relevance |
| [Jean](./developer-gui/jean.md) | 🖥️ GUI | 3/10 | Not relevant; different layer |
| [T3 Code](./developer-gui/t3code.md) | 🖥️ GUI | 2/10 | Market signal only |

---

## Categories

### 🎛️ Orchestration Frameworks
Multi-agent coordination, task routing, governance, business orchestration.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 9/10 | 70/30 deterministic/LLM split — the blueprint pattern for production agent systems |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 6/10 | 271K stars; lane queuing, context checkpoints, stuck-loop detection |
| [Paperclip](./orchestration-platforms/paperclip.md) | 6/10 | Per-token cost attribution + task-keyed session persistence |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 3/10 | Web3/chatbot DNA; Evaluator post-action reflection is the only portable pattern |

---

### ⚙️ Agent Harnesses
CLI tools, SDKs, runtimes, and frameworks that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | 9/10 | SDK + Agent Teams + 18 hooks + subagents — our primary harness |
| [Oh-My-Pi](./agent-harnesses/oh-my-pi.md) | 9/10 | Worktree isolation, hash-anchored state, MCP pooling, model routing, LSP feedback |
| [Pi Agent](./agent-harnesses/pi-agent.md) | 8/10 | Token efficiency, `context` event, SDK embeddability — Day 60+ candidate |
| [Pi Subagents](./agent-harnesses/pi-subagents.md) | 7/10 | Role-based delegation, chain pipelines, observability for Pi |
| [OpenCode](./agent-harnesses/opencode.md) | 7/10 | Go+TS hybrid, 117K stars, TaskTool, Teams — alternative architecture reference |
| [Pi Messenger](./agent-harnesses/pi-messenger.md) | 6/10 | File-based comms, steering injection, wave execution — validates Teams mode patterns |
| [DSPy](./agent-harnesses/dspy.md) | 5/10 | Declarative paradigm, GEPA optimizer, typed contracts — Phase 3+ patterns |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | 5/10 | Only open-source terminal agent from a major lab; credible second adapter |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | 4/10 | Microsoft's platform play; MCP-by-default validates protocol adoption |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | 3/10 | Python/Qwen-coupled; DeepPlanning benchmark is the notable output |

---

### 🧠 Agent Memory & Context
Memory systems, context retrieval, knowledge stores, RAG platforms.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 6/10 | Consolidation-as-sleep pattern for knowledge compounding |
| [Airweave](./agent-memory/airweave.md) | 3/10 | Enterprise retrieval layer; overkill for Phase 1-2 |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Factory IDE](./developer-gui/factory-ide.md) | 4/10 | Validates autonomous agent thesis at enterprise scale; Droid specialization pattern |
| [Jean](./developer-gui/jean.md) | 3/10 | Execution modes (Plan/Build/Yolo) concept |
| [T3 Code](./developer-gui/t3code.md) | 2/10 | Market signal for GUI demand, but architecturally irrelevant |

---

### 👤 Practitioners
Key people in the AI agent space — their workflows, philosophies, and systems.

| Practitioner | Focus Area | Key Insight |
|-------------|------------|-------------|
| [Elvis Sun](./practitioners/elvis-sun.md) | Orchestrator-Worker Swarm | Context separation + deterministic monitoring = compounding intelligence |
| [IndyDevDan](./practitioners/indydevdan.md) | Pi Ecosystem, YouTube | "Customization as moat" — 80/20 Claude Code/Pi portfolio |
| [Steve Yegge](./practitioners/steve-yegge.md) | Gas Town, Wasteland Thesis | 8-stage developer evolution, federation scaling, Absorption Problem |
| [Steipete](./practitioners/steipete.md) | OpenClaw, Multi-Agent | CLI-first, blast radius scaling, Oracle cross-model consultation |
| [Geoffrey Huntley](./practitioners/geoffrey-huntley.md) | Specs-Driven Dev | Ralph Wiggum loop, back pressure hierarchy, kill polluted contexts |
| [Mario Zechner](./practitioners/mario-zechner.md) | Pi Agent Creator | Minimalism thesis — 200-token advantage, "bash is all you need" |
| [Dotta](./practitioners/dotta.md) | Crypto→Agents, Paperclip | Agent org charts with budgets, heartbeats, governance |

---

### 📚 Reference Documents
Internal syntheses, landscape overviews, strategy documents, and architecture blueprints.

| Document | Type | Key Insight |
|----------|------|-------------|
| *Entries coming in Wave 3* | | |

---

## 🎤 Recent Talks & Videos

| Title | Speaker | Date | Relevance | Key Insight |
|-------|---------|------|-----------|-------------|
| *No entries yet* | | | | |

---

## 📝 Recent Articles

| Title | Author | Date | Relevance | Key Insight |
|-------|--------|------|-----------|-------------|
| *No entries yet* | | | | |

---

## 🐦 Notable Posts

| Author | Date | Key Insight |
|--------|------|-------------|
| *No entries yet* | | |

---

## How to Add New Entries

| Content Type | Command | Template |
|-------------|---------|----------|
| Tool/Framework | `/tool-catalogue <repo-url>` | `_TEMPLATE.md` |
| Practitioner | Manual (use `_TEMPLATE-PRACTITIONER.md`) | `_TEMPLATE-PRACTITIONER.md` |
| Talk / YouTube Video | `/ingest-talk <youtube-url>` | `_TEMPLATE-TALK.md` |
| Blog Post / Article | `/ingest-article <url>` | `_TEMPLATE-ARTICLE.md` |
| X Post / Thread | `/ingest-post <url>` | `_TEMPLATE-POST.md` |
| Batch from bookmarks | `/ingest-bookmarks` | Auto-routes to appropriate template |
| Reference Document | Manual (convert from research/) | N/A — freeform |

Or manually: copy the appropriate template, fill it in, save to the correct directory, and update this INDEX.
