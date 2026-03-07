# Tool Catalogue

> A categorized reference of all tools, frameworks, and platforms analyzed during research for the L-Thread Orchestrator project.

**Last updated:** 2026-03-08
**Template:** [_TEMPLATE.md](./_TEMPLATE.md)

---

## Quick Reference

| Tool | Category | Relevance | Verdict |
|------|----------|-----------|---------|
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 🧠 Memory | 6/10 | Reference consolidation pattern |
| [Airweave](./agent-memory/airweave.md) | 🧠 Memory | 3/10 | Too heavy; Phase 4+ |
| [Paperclip](./orchestration-platforms/paperclip.md) | 🎛️ Orchestration | 6/10 | Reference cost tracking + session persistence |
| [Qwen-Agent](./orchestration-platforms/qwen-agent.md) | 🎛️ Orchestration | —/10 | *Profile pending* |
| [Jean](./developer-gui/jean.md) | 🖥️ GUI | 3/10 | Not relevant; different layer |
| [T3 Code](./developer-gui/t3code.md) | 🖥️ GUI | 2/10 | Not relevant; same category as Jean |
| [Factory IDE](./developer-gui/factory-ide.md) | 🖥️ GUI | —/10 | *Profile pending* |
| [Pi Agent](./agent-harnesses/pi-agent.md) | ⚙️ Harness | —/10 | *Profile pending (consolidation from 15+ docs)* |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | ⚙️ Harness | —/10 | *Profile pending* |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | ⚙️ Harness | —/10 | *Profile pending* |

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
| [Qwen-Agent](./orchestration-platforms/qwen-agent.md) | — | *Pending* |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Jean](./developer-gui/jean.md) | 3/10 | Execution modes (Plan/Build/Yolo) concept |
| [T3 Code](./developer-gui/t3code.md) | 2/10 | Same category as Jean, less mature |
| [Factory IDE](./developer-gui/factory-ide.md) | — | *Pending* |

---

### ⚙️ Agent Harnesses / SDKs
CLI tools, SDKs, and runtimes that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Pi Agent](./agent-harnesses/pi-agent.md) | — | *Pending (consolidation)* |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | — | *Pending* |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | — | *Pending* |

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
