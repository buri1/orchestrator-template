# Accomplish

> **Free, open-source AI desktop agent that reads files, creates documents, and automates repetitive knowledge work -- all running locally with user-approved actions.**

| Field | Value |
|-------|-------|
| Category | General Interest / Desktop Agents |
| Website | [accomplish.ai](https://accomplish.ai/) |
| Repository | [github.com/accomplish-ai/accomplish](https://github.com/accomplish-ai/accomplish) |
| Publisher | Accomplish Inc |
| License | MIT |
| Version | 0.4.14 (as of 2026-04) |
| Platforms | macOS (Apple Silicon + Intel), Windows 10/11, Linux (deb, AppImage, x64/ARM64) |
| Maturity | Early |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Desktop agent for end-user file/document automation -- different domain from our orchestrator (developer-facing, headless). Interesting as a consumer AI agent reference but not directly applicable. |
| **Novelty** | 4/10 | Local-first desktop agent with multi-provider LLM support is a growing category (Openwork predecessor, similar to Mori, Eigent). The "Skills" system for reusable workflows is the most distinctive feature. |
| **Actionable** | 3/10 | Little direct reuse. The folder-scoped permission model and action-approval UX are interesting design patterns but we operate headless. The MIT license and AGENTS.md adoption are notable ecosystem signals. |

---

## Overview

Accomplish is a free, open-source desktop application that gives an AI agent access to your local files and browser to automate knowledge work. It evolved from "Openwork" and positions itself as a privacy-first alternative to cloud-based AI assistants.

The core value proposition is simple: download the app, select which folders the AI can access, and start delegating tasks like file sorting, document writing/summarizing, and browser-based workflows. All processing happens locally -- external data is only sent to your chosen LLM provider, and nothing is sent to Accomplish's servers.

The "Skills" system lets users create reusable workflows (macros) that chain multiple actions together. This is conceptually similar to our orchestrator's task decomposition, but designed for non-developer end users.

---

## Technical Details

**AI Model Support:**
- Built-in model (no API key required -- works out of the box)
- xAI (Grok), OpenAI (GPT), Anthropic (Claude), Google (Gemini)
- Local models via Ollama
- Enterprise: Azure, AWS Bedrock, DeepSeek, GCP, LiteLLM, OpenRouter, Vertex AI

**Key Capabilities:**
- File management (sort, rename, organize across selected folders)
- Document operations (write, summarize, rewrite)
- Browser automation
- Custom Skills (reusable workflow templates)
- User approves all actions before execution

**Privacy Model:**
- Folder-level access permissions (user selects which directories are accessible)
- No data sent to Accomplish servers
- External calls only go to user's chosen LLM provider
- Full action transparency with approval gates

---

## Publisher Background

Accomplish Inc is the company behind the product, which evolved from an earlier project called "Openwork." The GitHub organization is `accomplish-ai`. The product ships AGENTS.md in its repository root, which is a notable signal of the AGENTS.md convention spreading beyond developer tools into consumer desktop applications.

---

## What's Valuable for Us

1. **AGENTS.md adoption signal**: A consumer desktop app shipping AGENTS.md validates the convention's spread beyond developer-only tooling. Worth tracking as ecosystem evidence.

2. **Folder-scoped permissions**: The model of granting AI access at the folder level (rather than full filesystem) is a clean permission primitive. Our orchestrator currently gives agents full worktree access -- folder scoping could be a safety mechanism for multi-tenant scenarios.

3. **Skills system**: Reusable workflow templates that chain actions. Conceptually adjacent to our task decomposition, but targeted at non-technical users. Could inform how we expose orchestrator capabilities to less technical team members.

---

## What's NOT Relevant

- **Desktop GUI**: We operate headless. The Electron-based desktop app paradigm doesn't apply.
- **Consumer use case**: File sorting, document writing -- these are productivity tasks, not developer workflow orchestration.
- **Built-in model**: Interesting for consumer reach but we use Claude exclusively.
- **Browser automation**: We have Chrome DevTools MCP for E2E testing; Accomplish's browser automation is more general-purpose.

---

## Key Takeaway

> **Accomplish is a consumer-facing desktop AI agent -- architecturally distant from our headless orchestrator, but notable as evidence of AGENTS.md convention spreading to consumer apps and as a reference for folder-scoped permission models.**
