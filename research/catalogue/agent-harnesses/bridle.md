# Bridle

> **Unified configuration manager for AI coding assistants. Manage profiles, install skills/agents/commands, and switch configurations across Claude Code, OpenCode, Goose, Amp, Copilot CLI, and Crush.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [neiii/bridle](https://github.com/neiii/bridle) |
| GitHub Stars | 391 (as of 2026-03-08) |
| Publisher | neiii (solo developer) |
| License | MIT |
| Tech Stack | Rust (100%), TOML config, TUI |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | We're Claude-first so multi-harness config management isn't a primary need. However, if we ever support multiple coding agents (Claude Code + OpenCode + Codex), Bridle becomes the obvious config layer. |
| **Novelty** | 6/10 | The concept of a unified config manager that auto-translates between harness config formats is genuinely novel. Nobody else is solving the "I use 3 different coding agents and need the same skills in all of them" problem. |
| **Actionable** | 4/10 | Not immediately useful — we don't need multi-harness support today. The profile switching concept is mildly interesting for managing different CLAUDE.md configurations across projects. |

---

## Overview

Bridle is a TUI/CLI tool written in Rust that solves the configuration fragmentation problem for developers using multiple AI coding assistants. As the agentic coding tool landscape proliferates (Claude Code, OpenCode, Goose, Amp, Copilot CLI, Cursor, Crush, etc.), each tool has its own configuration format for skills, agents, commands, and MCP server definitions. Bridle provides a single management layer that auto-translates configurations between these formats.

The core workflow is: scan a GitHub repository for reusable skills/agents/commands, select which components to install, choose target harnesses and profiles, and Bridle handles the path translation and config generation. Profiles allow switching between different configurations per harness (e.g., work vs personal vs minimal), with Bridle copying the active profile into each harness's config directory.

It's an early-stage project (v0.2.9, 247 commits) but addresses a real pain point that will only grow as the coding agent ecosystem fragments further.

---

## Technical Architecture

- **Runtime**: Compiled Rust binary (no runtime dependencies)
- **Installation**: npm (`npx bridle-ai`), Homebrew, Cargo, or from source
- **Config Storage**: `~/.config/bridle/config.toml` for global settings
- **Profile System**: Per-harness profiles stored as separate config directories; active profile is symlinked/copied into harness config location
- **Repository Scanner**: Scans GitHub repos for `.claude/`, `.opencode/`, `.goose/` directories to discover installable components
- **Auto-Translation**: Converts skill/agent/command definitions between harness-specific formats (e.g., Claude Code's `.claude/commands/` to OpenCode's equivalent)
- **TUI**: Interactive terminal UI for browsing, selecting, and managing configurations
- **Output Formats**: JSON, text, and auto-detect modes

**Supported Harnesses (with support level):**
| Harness | Status |
|---------|--------|
| Claude Code | Full support |
| OpenCode | Full support |
| Goose | Full support |
| Amp | Full support |
| Copilot CLI | Full support |
| Crush | Full support |

---

## Publisher Background

neiii is an individual developer on GitHub. Limited public information available about their background or other projects. The project has 391 stars and active development (247 commits through January 2026), suggesting a real user base despite the solo maintainer status. The choice of Rust for a config management tool indicates strong systems engineering background.

---

## What's Valuable for Us

- **Profile switching concept**: The idea of maintaining multiple configurations per harness and hot-swapping them is useful even in a Claude-only setup. We could adopt a similar pattern for switching between orchestrator configurations (e.g., conduit mode vs teams mode vs tmux mode CLAUDE.md presets).
- **Repository scanning for skills**: Bridle's approach to scanning GitHub repos for installable skills/agents/commands is relevant to our catalogue system. Could inform how we distribute and install skills from the catalogue.
- **Config format translation as a reference**: Understanding how Bridle translates between harness config formats gives us insight into the data model differences between coding agents — useful knowledge if we ever need to support non-Claude agents in the federated system.

---

## What's NOT Relevant

- **Multi-harness support**: We're committed to Claude Code as our primary harness. Managing configurations across 6 different coding agents is solving a problem we've intentionally avoided by standardizing on one.
- **TUI interface**: We're terminal-first but our orchestrator operates through commands and state files, not interactive TUIs. The TUI is nice for browsing but doesn't fit our event-driven, non-interactive automation model.
- **Rust dependency**: Adding a Rust binary to our TypeScript/shell stack just for config management is overhead we don't need.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: If we standardize a "skills distribution" format for sharing orchestrator capabilities, Bridle's repo scanning approach is a useful reference.
- **Phase 4 (Days 90+)**: If the federated system needs to support heterogeneous coding agents (Claude Code for primary work, OpenCode for cost-sensitive tasks, Codex for OpenAI-specific integrations), Bridle becomes the obvious config unification layer. This is the "informed rebuild" phase where multi-agent support might matter.

---

## Key Takeaway

> **Bridle solves the config fragmentation problem for multi-harness users — not immediately relevant for our Claude-first stack, but the profile switching and repo scanning patterns are worth studying for skills distribution.**
