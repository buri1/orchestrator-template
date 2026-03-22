# DeerFlow 2.0

> **An open-source SuperAgent harness that researches, codes, and creates. With the help of sandboxes, memories, tools, skills and subagents, it handles different levels of tasks that could take minutes to hours.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [bytedance/deer-flow](https://github.com/bytedance/deer-flow) |
| GitHub Stars | 33,676 (as of 2026-03-22) |
| Publisher | ByteDance (bigtech) |
| License | MIT |
| Tech Stack | Python (LangGraph/LangChain backend), TypeScript/Next.js (frontend), Docker |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *ByteDance's answer to the super-agent question. v2.0 is a ground-up rewrite with sub-agents, sandboxes, long-term memory, and Claude Code integration. 33K+ stars and #1 on GitHub Trending. The architecture is similar to what we're building but with more infrastructure (Docker sandboxes, MCP server, IM channels). Worth studying their skill system and sandbox isolation model.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Super-agent harness with sub-agents, memory, and sandboxes maps well to our orchestration vision |
| **Novelty** | 5/10 | Similar patterns to what we've seen in Overstory, GSD-2, and our own architecture |
| **Actionable** | 6/10 | Skill system, sandbox isolation, and MCP server integration are adoptable patterns |

---

## Overview

DeerFlow (Deep Exploration and Efficient Research Flow) is ByteDance's open-source super-agent framework. Version 2.0 is a complete rewrite that transforms it from a deep research tool into a full-featured agent harness. It orchestrates sub-agents with memory, sandboxes, skills, and tools to handle tasks ranging from quick questions to multi-hour research and coding projects.

The system uses LangGraph for its agent orchestration backend with a Next.js frontend. It supports multiple LLM providers and has native Claude Code integration. The sandbox mode provides isolated execution environments for code generation and testing.

Key differentiators include IM channel integrations (Slack, Discord, Telegram, Feishu), a built-in podcast generation feature, and ByteDance's InfoQuest intelligent search toolset. The MCP server support allows extending capabilities through the standard tool protocol.

---

## Technical Architecture

- **Backend**: Python 3.12+, LangGraph/LangChain orchestration
- **Frontend**: Next.js/TypeScript web UI
- **Sandbox**: Docker-based isolated execution environments
- **Memory**: Long-term memory system for context persistence
- **Skills**: Extensible skill framework including Claude Code integration
- **Sub-Agents**: Specialized agents for research, coding, and content creation
- **MCP Server**: Standard tool protocol support
- **IM Channels**: Slack, Discord, Telegram, Feishu integrations
- **Deployment**: Docker recommended, local dev supported

---

## Publisher Background

ByteDance, the company behind TikTok, with massive engineering resources. DeerFlow started as a deep research tool and evolved into a general-purpose agent harness. The project has strong community momentum (33K+ stars, #1 GitHub Trending for v2 launch).

---

## What's Valuable for Us

- **Skill system with Claude Code integration**: Their approach to wrapping Claude Code as a sub-agent skill is directly relevant
- **Sandbox isolation model**: Docker-based sandboxes for safe code execution could inform our E2E testing approach
- **MCP server integration**: Standard tool protocol adoption validates our direction
- **Context engineering approach**: Their sub-agent decomposition patterns

---

## What's NOT Relevant

- **LangGraph/LangChain dependency**: We use deterministic orchestration, not LLM framework orchestration
- **Docker sandbox requirement**: We use git worktrees for isolation, which is lighter
- **IM channel integrations**: We use Telegram directly, don't need framework-level support
- **Podcast generation**: Not relevant to our use case

---

## Key Takeaway

> **ByteDance's super-agent harness validates the sub-agent + sandbox + memory + skills architecture at scale (33K stars), with Claude Code integration and MCP support — study their skill decomposition patterns.**
