# pi-web-access

> **Web search, content extraction, and video understanding extension for Pi agent — zero-config with Chrome session cookies, smart fallback chains, GitHub repo cloning, and YouTube/video analysis via Gemini.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access) |
| GitHub Stars | 163 (as of 2026-03-08) |
| Publisher | nicobailon (community contributor, solo) |
| License | MIT |
| Tech Stack | TypeScript, Node.js, Perplexity API, Google Gemini, FFmpeg (optional), yt-dlp (optional) |
| Maturity | 🟢 Production (active development, high adoption, multiple providers) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Web access is a capability we need for research agents and ingest pipelines, but not core to our orchestration architecture. Useful for the catalogue ingest pipeline specifically. |
| **Novelty** | 6/10 | Smart fallback chains (Perplexity → Gemini API → Gemini Web) and the GitHub-clone-instead-of-scrape approach are solid engineering. Chrome cookie reuse for zero-config is clever. |
| **Actionable** | 7/10 | Drop-in `pi install npm:pi-web-access` with zero config if Chrome is available. Could immediately power our `/ingest-bookmarks` pipeline at Day 60+. |

---

## Overview

pi-web-access gives Pi agents the ability to search the web, extract content from URLs, analyze videos, and clone GitHub repositories — all with intelligent fallback chains and zero-configuration setup. When you're signed into Google in Chrome, the extension reads Chrome session cookies to access Gemini directly with no API keys, no setup, and no subscriptions required.

The extension auto-detects content type and applies specialized extraction logic. GitHub URLs are cloned locally (up to 350 MB) instead of scraped, giving the agent real file contents and local paths to explore. YouTube videos get full transcripts with timestamps, visual descriptions, chapter markers, and frame extraction via Gemini. PDFs are converted to searchable markdown. JavaScript-heavy and anti-bot-protected pages fall back through Jina Reader, Gemini URL Context API, and RSC parsing.

Every capability has a fallback chain: search tries Perplexity, then Gemini API, then Gemini Web. Content extraction tries direct fetch, then Jina Reader, then Gemini. This resilience is important for production use — something always works.

---

## Technical Architecture

```
web_search(query)          fetch_content(url)
    │                           │
    ├── Perplexity API          ├── Auto-detect content type
    ├── Gemini API (fallback)   │   ├── GitHub URL → git clone locally
    └── Gemini Web (fallback)   │   ├── YouTube → Gemini video analysis
                                │   ├── PDF → markdown conversion
                                │   ├── HTML → Readability extraction
                                │   └── Blocked → Jina Reader → Gemini URL Context
                                │
                                └── Store results for session retrieval

/websearch                  Interactive browser-based search curator
/search                     Browse stored session results
get_search_content()        Retrieve full results (bypasses 30K char limit)
```

**Provider Fallback Chains:**
| Capability | Primary | Fallback 1 | Fallback 2 |
|-----------|---------|------------|------------|
| Web Search | Perplexity | Gemini API | Gemini Web |
| Content Fetch | Direct + Readability | Jina Reader | Gemini URL Context |
| Video Analysis | Gemini (native) | FFmpeg frames | — |

**Configuration:** `~/.pi/web-search.json`
- API keys (env vars take precedence): `perplexityApiKey`, `geminiApiKey`
- Provider selection: `"auto"`, `"perplexity"`, or `"gemini"`
- GitHub clone limits: size (350 MB default), timeout, clone path
- Video processing: frame extraction settings, transcript preferences
- Search curation: `curateWindow` (seconds before auto-send), `autoFilter` (dedup)

**Bundled Skill:** "Librarian" — combines GitHub cloning, web search, and git history to answer questions about open-source projects with evidence and permalinks.

---

## Publisher Background

nicobailon is the most prolific Pi extension developer, with pi-interactive-shell (287 stars), pi-mcp-adapter (175 stars), and pi-web-access (163 stars) — collectively representing the most-used community extensions in the Pi ecosystem. The quality and breadth of their work suggests deep familiarity with Pi internals and production-grade engineering.

---

## What's Valuable for Us

1. **Research & Ingest Pipeline:** Our `/ingest-bookmarks`, `/ingest-article`, and `/tool-catalogue` commands need web fetching. pi-web-access provides the underlying capability with fallback resilience — critical for batch processing where any individual URL might be blocked or down.

2. **GitHub Clone Pattern:** Cloning repos locally instead of scraping GitHub HTML is the correct approach for our `/tool-catalogue` command. We need to inspect README.md, package.json, and source files — scraping doesn't give us that.

3. **Chrome Cookie Reuse:** Zero-config Gemini access via Chrome session cookies eliminates API key management overhead. Useful for development and personal research, though not suitable for headless production agents.

4. **Fallback Chain Architecture:** The pattern of trying multiple providers for each capability is worth adopting in our orchestrator. Currently, if our WebFetch tool fails, we just fail. A fallback chain adds deterministic resilience.

5. **Interactive Search Curator:** `/websearch` opens results in the browser for human review and selection before sending back to the agent. This is a good pattern for our research workflows where quality matters more than speed.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Video analysis** | YouTube/video understanding via Gemini is a cool feature but not relevant to our orchestration or development workflows. |
| **Chrome dependency for zero-config** | Requires Chrome login for zero-config Gemini. Our production agents run headless without Chrome sessions. API keys are needed for production. |
| **Not core orchestration** | Web access is a capability, not an architecture pattern. It doesn't change how we orchestrate — it adds a tool to our agents' toolbox. |
| **Perplexity/Gemini lock-in** | Search providers are Google-centric. If we need Bing or other providers, we'd need to extend. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the fallback chain pattern for improving our current WebFetch/WebSearch tool resilience in Claude Code.
- **Phase 3 (Days 60-90):** Install as standard Pi extension for research agents. Power our `/ingest-bookmarks` and `/tool-catalogue` pipelines with Pi-native web access.
- **Phase 4 (Days 90+):** Configure with API keys for headless production agents that need web research capabilities. Use the librarian skill for automated open-source project analysis.

---

## Key Takeaway

> **pi-web-access provides production-grade web capabilities for Pi agents with smart fallback chains and zero-config setup — essential infrastructure for our research and ingest pipelines at Day 60+, though it's a capability extension rather than an architecture-shaping tool.**
