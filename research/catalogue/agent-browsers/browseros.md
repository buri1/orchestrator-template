# BrowserOS

> **BrowserOS AI — [github.com/browseros-ai/BrowserOS](https://github.com/browseros-ai/BrowserOS)**

| Field | Value |
|-------|-------|
| Source | [browseros.com](https://www.browseros.com/) |
| Type | Agent Browser / Chromium Fork |
| Stars | 10,100 (as of 2026-03-25) |
| License | AGPL-3.0 |
| Tech Stack | TypeScript, Chromium, Multi-LLM (Claude/GPT/Gemini/Ollama) |
| Maturity | Early-Production |

---

## Summary

BrowserOS is an open-source Chromium fork that runs AI agents natively inside the browser. It enables task automation through natural language -- describe what you want, and the built-in agent handles clicking, typing, navigating, reading files, and executing multi-step workflows. It supports 11+ LLM providers including local models via Ollama.

Privacy-focused: all data stays local, API keys stored in OS encrypted keychain (never plain text on disk). Positioned as the open-source alternative to ChatGPT Atlas, Perplexity Comet, and Dia. YC-backed company.

## Pros
- Open source (AGPL-3.0)
- Runs AI agents natively inside the browser
- Privacy-first: data never leaves machine
- 11+ LLM providers (Claude, GPT, Gemini, Ollama local)
- YC-backed
- 10K stars, growing fast
- BYOK (bring your own keys)
- No external server process needed
- Desktop application (macOS, Linux, Windows)

## Cons
- AGPL-3.0 license (restrictive for embedding)
- Chromium fork = heavy maintenance burden
- Not headless -- requires desktop GUI
- Not designed for CI/E2E testing
- No MCP server
- No CLI interface for agent automation
- Consumer-oriented, not developer-tool
- Cannot be driven programmatically by our orchestrator

## Best Use Case
End-users wanting an AI-powered browser for personal task automation with privacy. Not suitable for developer tooling, CI/E2E testing, or headless agent workflows.

## Claude Code Integration
None. BrowserOS is a consumer browser application, not a tool that integrates with Claude Code. Irrelevant for our orchestrator architecture.
