# Unlocking the Codex Harness: How We Built the App Server

> **Celia Chen, Member of Technical Staff — OpenAI Engineering Blog, 2026-02-04**

| Field | Value |
|-------|-------|
| Source | https://openai.com/index/unlocking-the-codex-harness/ |
| Author | Celia Chen (Member of Technical Staff, OpenAI) |
| Publication | OpenAI Engineering Blog |
| Date | 2026-02-04 |
| Topics | codex, test scaffolding, app server, JSON-RPC, agent harness, agent loop, bidirectional protocol, IDE integration, MCP, thread lifecycle |
| Read Time | ~16 min |

---

## Burak's Notes

> *Companion article to Ryan Lopopolo's "Harness Engineering" piece already ingested. While that article covered the philosophy and patterns of agent-driven development, this one dives into the actual protocol and architecture that makes the Codex test scaffolding reusable across clients. The JSON-RPC bidirectional protocol with Item/Round/Thread primitives is the most detailed public description of an agent communication protocol from a major lab. The conversation primitives (Item lifecycle: started/delta/completed, Rounds as work units, Threads as persistent containers) map cleanly to our orchestrator's state management. The approval flow (server requests client permission, pauses round until response) validates our human-in-the-loop gate pattern. Notable that they tried MCP first and abandoned it — "MCP semantics so they'd make sense for VS Code proved difficult." The App Server as a stable platform API that multiple clients (VS Code, Xcode, JetBrains, Desktop, Web, TUI) consume is the exact "thin shared layer" pattern from our Master Blueprint.*

---

## Key Takeaways

1. **The Codex test scaffolding is a reusable agent runtime, not a product** — The entire agent loop, thread persistence, tool execution, and configuration lives in "Codex core" — a library + runtime that any client can embed. The App Server exposes this via a bidirectional JSON-RPC protocol over stdio.

2. **Three conversation primitives define the agent protocol** — Item (atomic unit of I/O with started/delta/completed lifecycle), Round (a unit of agent work triggered by user input), and Thread (persistent container for an ongoing session). This layered abstraction enables rich streaming UIs while keeping the protocol stable.

3. **MCP was tried and abandoned for the core protocol** — OpenAI experimented with exposing Codex as an MCP server but found MCP semantics difficult to map to IDE-level interactions (workspace exploration, streaming progress, diff output). They chose a custom JSON-RPC protocol instead. MCP is still supported as a secondary integration path.

4. **Backward compatibility is a first-class design goal** — The protocol is designed so older clients can safely talk to newer servers. Partners like Xcode decouple release cycles by pinning to the App Server binary, picking up improvements without client updates.

5. **Multiple integration tiers serve different use cases** — Full App Server (richest, bidirectional JSON-RPC), MCP Server (fits existing MCP workflows but limited), Codex Exec (lightweight CLI for CI/automation), Codex SDK (TypeScript library for programmatic control). Each trades off richness for simplicity.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | The Item/Round/Thread protocol primitives directly inform how we structure orchestrator-to-agent communication. The approval-flow pattern (server requests permission, pauses round) validates our human gate design. The "thin shared layer" App Server architecture mirrors our Master Blueprint. |
| **Actionable** | 7/10 | The three-primitive protocol model (Item/Round/Thread) is adoptable for our agent communication. The JSON-RPC-over-stdio transport pattern is directly relevant for tmux-based agent sessions. The backward-compatible versioning strategy is useful for our multi-client future. |

---

## Summary

Celia Chen describes the architecture of the Codex App Server, the protocol layer that makes the Codex test scaffolding (agent loop, thread persistence, tool execution) accessible to any client surface. The App Server evolved from a quick internal hack to reuse the CLI's agent logic in the VS Code extension, into a stable platform API serving multiple clients including VS Code, JetBrains, Xcode, the Desktop app, and the Web runtime.

The core insight is that an agent harness needs a well-designed communication protocol to be reusable. The protocol is bidirectional JSON-RPC over stdio, structured around three conversation primitives: Items (atomic I/O units with streaming lifecycle), Rounds (work units triggered by user input), and Threads (persistent session containers). The server can initiate requests back to the client (e.g., approval gates), pausing the agent round until the client responds.

OpenAI tried MCP first for the VS Code integration but found its semantics too limited for rich IDE interactions. The App Server protocol handles workspace exploration, progress streaming, diff output, and approval flows that MCP could not cleanly express. MCP remains available as a secondary integration path for simpler use cases.

The article also covers three deployment patterns: local (bundled binary as child process), web (containerized with SSE streaming to browser), and TUI (planned migration from native in-process to App Server client). The web pattern is notable: since browser tabs are ephemeral, all state lives on the server, enabling reconnection and catch-up without client-side state reconstruction.

---

## Notable Quotes

> "MCP semantics so they'd make sense for VS Code proved difficult"

> "We didn't expect other clients to depend on the app server, so it wasn't designed as a stable API"

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/harness-engineering/ | Companion article (already ingested) | Already in catalogue |
| https://github.com/openai/codex | Open-source Codex CLI repo containing App Server source | `/tool-catalogue` (already catalogued as OpenAI Codex) |
| https://developers.openai.com/codex/workflows/ | Codex workflows documentation — may contain additional scaffolding patterns | `/ingest-article` |
| https://developers.openai.com/blog/eval-skills/ | Testing Agent Skills Systematically with Evals — systematic agent evaluation patterns | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI Codex CLI | The underlying agent runtime; App Server is built on "Codex core" | Yes — [openai-codex.md](../agent-harnesses/openai-codex.md) |
| MCP | Tried as integration protocol, abandoned for core; still supported as secondary path | Yes — referenced across catalogue |
| AGENTS.md | Referenced as optional context for agent tasks | Yes — [agents-md.md](../agent-protocols/agents-md.md) |
| OpenAI Agents SDK | Mentioned as MCP client example | Yes — [openai-agents-sdk.md](../orchestration-platforms/openai-agents-sdk.md) |
| VS Code | Primary IDE integration client for App Server | N/A (not a tool to catalogue) |
| JetBrains | IDE partner integration | N/A |
| Xcode | IDE partner integration with decoupled release cycles | N/A |
| Codex SDK | TypeScript library for programmatic agent control | Not yet catalogued — consider `/tool-catalogue` |
| Codex Exec | Lightweight CLI mode for CI/automation | Not yet catalogued — part of Codex CLI |

---

## Action Items

- [ ] Study the Item/Round/Thread primitive model for potential adoption in orchestrator-to-agent protocol
- [ ] Evaluate JSON-RPC-over-stdio as alternative to current tmux terminal-read/write pattern
- [ ] Review the approval-flow pattern (server-initiated request, round pause) against our human gate implementation
- [ ] Consider backward-compatible protocol versioning for our multi-client roadmap
