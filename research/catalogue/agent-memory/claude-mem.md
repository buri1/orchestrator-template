# Claude-Mem

> **Persistent memory compression system built for Claude Code. Automatically captures everything Claude does during coding sessions, compresses it with AI, and injects relevant context back into future sessions.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory |
| Repository | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) |
| GitHub Stars | 39,266 (as of 2026-03-22) |
| Publisher | thedotmack (solo) |
| License | AGPL-3.0 |
| Tech Stack | TypeScript, Node.js 18+, ChromaDB, SQLite, Claude Agent SDK |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *39K stars — this is the most popular Claude Code memory plugin. It captures session activity, compresses it using the agent-sdk, and stores embeddings in ChromaDB for RAG-based context injection. The compression approach is interesting — instead of just dumping raw history, it uses AI to extract the meaningful patterns. Compare to our devlog + MEMORY.md approach which is more manual but more controlled.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Memory persistence is a core need; their approach complements our MEMORY.md pattern |
| **Novelty** | 6/10 | AI-compressed session memory with RAG retrieval is a step beyond manual memory files |
| **Actionable** | 7/10 | Could adopt the compression + embedding pattern for our devlog system |

---

## Overview

Claude-Mem is a Claude Code plugin (installed via agent-sdk hooks) that automatically captures everything Claude does during coding sessions. It compresses session transcripts using AI, stores them as embeddings in ChromaDB, and injects the most relevant context back into future sessions through a RAG pipeline.

The system runs as a background process alongside Claude Code, intercepting session events and building a persistent knowledge base. When a new session starts, it queries the embedding store for relevant past context and injects it into Claude's context window, giving the agent "memory" across sessions.

With nearly 40K GitHub stars and translations in 30+ languages, it's the most widely adopted Claude Code memory solution. The AGPL license means any modifications must be open-sourced.

---

## Technical Architecture

- **Capture**: Hooks into Claude Code sessions via agent-sdk
- **Compression**: AI-powered summarization of session transcripts
- **Storage**: ChromaDB for vector embeddings, SQLite for metadata
- **Retrieval**: RAG pipeline queries relevant past context at session start
- **Injection**: Relevant memories injected into Claude's context window

---

## What's Valuable for Us

- **Compression algorithm**: Their approach to AI-summarizing session transcripts could improve our devlog quality
- **Embedding-based retrieval**: More sophisticated than our keyword-matching MEMORY.md approach
- **Agent-SDK hook integration**: Shows how to build plugins that ride alongside Claude Code
- **Session boundary detection**: How they determine what constitutes a meaningful "session" worth remembering

---

## What's NOT Relevant

- **ChromaDB dependency**: We prefer file-based state (JSON/MD) over database dependencies per Governing Principle 7
- **AGPL license**: Restrictive for commercial integration
- **Automatic injection**: We prefer explicit context control over automatic injection per Principle 3 (context is zero-sum)

---

## Key Takeaway

> **The most popular Claude Code memory plugin (39K stars) — study their AI compression and RAG retrieval patterns for potential adoption into our devlog/MEMORY.md system, but maintain explicit context control rather than automatic injection.**
