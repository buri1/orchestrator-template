# Tool Catalogue

> A categorized reference of all tools, frameworks, and platforms analyzed during research for the L-Thread Orchestrator project.

**Last updated:** 2026-03-08
**Template:** [_TEMPLATE.md](./_TEMPLATE.md)

---

## Quick Reference

| Tool | Category | Relevance | Verdict |
|------|----------|-----------|---------| 
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 🧠 Memory | 6/10 | Reference consolidation-as-sleep pattern |
| [Airweave](./agent-memory/airweave.md) | 🧠 Memory | 3/10 | Too heavy; Phase 4+ |
| [Paperclip](./orchestration-platforms/paperclip.md) | 🎛️ Orchestration | 6/10 | Reference cost tracking + session persistence |
| [Qwen-Agent](./orchestration-platforms/qwen-agent.md) | 🎛️ Orchestration | 3/10 | Qwen-coupled Python framework; low relevance |
| [Jean](./developer-gui/jean.md) | 🖥️ GUI | 3/10 | Not relevant; different layer |
| [T3 Code](./developer-gui/t3code.md) | 🖥️ GUI | 2/10 | Not relevant; same category as Jean, less mature |
| [Factory IDE](./developer-gui/factory-ide.md) | 🖥️ GUI | 4/10 | Proprietary; competitive reference only |
| [Pi Agent](./agent-harnesses/pi-agent.md) | ⚙️ Harness | 8/10 | Primary Day 60+ harness candidate |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | ⚙️ Harness | 4/10 | Proprietary; competitive intelligence only |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | ⚙️ Harness | 5/10 | Open-source; Phase 3+ adapter candidate |

---

## Categories

### 🧠 Agent Memory & Context
Memory systems, context retrieval, knowledge stores, RAG platforms.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 6/10 | Consolidation-as-sleep pattern for knowledge compounding |
| [Airweave](./agent-memory/airweave.md) | 3/10 | Enterprise retrieval layer; overkill for Phase 1-2 |

---

### 🎛️ Orchestration Platforms
Multi-agent coordination, task routing, governance, business orchestration.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Paperclip](./orchestration-platforms/paperclip.md) | 6/10 | Per-token cost attribution + task-keyed session persistence |
| [Qwen-Agent](./orchestration-platforms/qwen-agent.md) | 3/10 | Python/Qwen-coupled agent framework; DeepPlanning benchmark is the notable output |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Jean](./developer-gui/jean.md) | 3/10 | Execution modes (Plan/Build/Yolo) concept |
| [T3 Code](./developer-gui/t3code.md) | 2/10 | Market signal for GUI demand, but architecturally irrelevant |
| [Factory IDE](./developer-gui/factory-ide.md) | 4/10 | Validates autonomous agent thesis at enterprise scale; Droid specialization pattern |

---

### ⚙️ Agent Harnesses / SDKs
CLI tools, SDKs, and runtimes that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Pi Agent](./agent-harnesses/pi-agent.md) | 8/10 | Token efficiency, `context` event, SDK embeddability, model agnosticism — validated Day 60+ replacement candidate |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | 4/10 | Microsoft's platform play; MCP-by-default validates protocol adoption |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | 5/10 | Only open-source (Apache-2.0) terminal agent from a major lab; credible second adapter |

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
| Talk / YouTube Video | `/ingest-talk <youtube-url>` | `_TEMPLATE-TALK.md` |
| Blog Post / Article | `/ingest-article <url>` | `_TEMPLATE-ARTICLE.md` |
| X Post / Thread | `/ingest-post <url>` | `_TEMPLATE-POST.md` |

Or manually: copy the appropriate template, fill it in, save to the correct directory, and update this INDEX.
