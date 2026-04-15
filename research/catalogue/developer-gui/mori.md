# Mori

> **A native macOS workspace terminal organized around Projects and Worktrees, powered by tmux and libghostty.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [vaayne/mori](https://github.com/vaayne/mori) |
| GitHub Stars | 192 (as of 2026-04-04) |
| Publisher | LiuVaayne (@vaayne) — solo developer, Beijing; previously built Anna (AI assistant with LCM memory), Go web scraping tools |
| License | MIT |
| Tech Stack | Swift 6 (95.4%), AppKit + SwiftUI, libghostty (Metal-accelerated terminal rendering), tmux (session persistence), GRDB (SQLite), Sparkle (auto-update), Zig 0.15.2 (libghostty compilation), mise (task runner) |
| Maturity | 🟡 Early (v0.3.3; 11 releases; 290 commits; created 2026-03-19; active daily development; Homebrew tap available) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> Mori is a direct competitor/complement to cmux in the "native macOS terminal for agent workflows" space. The critical difference: Mori keeps tmux as its session substrate (tmux sessions back every worktree), while cmux replaces tmux entirely with its own socket API. For our orchestrator, Mori's approach is actually closer to what we already do -- it wraps tmux with a native GUI rather than eliminating it. The agent hooks (`mori-agent-hook.sh`, `mori-codex-hook.sh`) that set tmux pane options on Claude Code lifecycle events (UserPromptSubmit/Stop/Notification) are a clean pattern we should study. The IPC protocol is simpler than cmux's JSON-RPC v2 (newline-delimited JSON over Unix socket with typed Swift enums). The `paneMessage` command with sender metadata is interesting for inter-agent communication. However, at 192 stars vs cmux's 5.3K, and with cmux already being our chosen tool, Mori is a "watch" not "adopt." The worktree-first navigation model is the genuinely novel UX insight here.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Shares our exact substrate (tmux + libghostty + worktrees) but we've already committed to cmux which replaces tmux entirely. Mori validates our architecture choices but doesn't solve a problem cmux doesn't already solve better. The agent hooks pattern is directly useful. |
| **Novelty** | 5/10 | Worktree-first project navigation is a genuinely good UX concept not seen elsewhere. The tmux-as-backend-with-native-GUI approach is a known pattern (iTerm2, etc.) but applied specifically to agent workflows. The agent state hooks via tmux pane options are clean. However, cmux, dmux, and Agent of Empires cover this ground more completely. |
| **Actionable** | 4/10 | The agent hook scripts (`set_state` via tmux pane options) could be adapted to our current tmux orchestrator today. The IPC protocol design (typed Swift enums + newline-delimited JSON) is a clean reference. But we're migrating to cmux, making most of Mori's patterns moot for our stack. |

---

## Overview

Mori is a native macOS application that reimagines the terminal around git repositories and worktrees rather than anonymous tabs. Each git repository is a "Project," and each branch checkout (worktree) gets its own persistent tmux session containing multiple windows and panes. The sidebar shows all projects and worktrees with git status, and switching between them is instant because tmux sessions persist in the background.

The key architectural decision is using tmux as the session persistence layer while providing a native macOS GUI on top. This means closing Mori doesn't kill running processes -- tmux sessions survive independently. The terminal rendering uses libghostty (the same engine powering Ghostty terminal and cmux), providing Metal-accelerated GPU rendering with full Ghostty configuration compatibility via `~/.config/ghostty/config`.

Mori includes first-class agent integration through hook scripts that set tmux pane metadata on Claude Code and Codex lifecycle events. When an agent transitions between working/waiting states, the hook sets `@mori-agent-state` and `@mori-agent-name` tmux pane options, enabling the GUI to display real-time agent status in the sidebar. A Unix socket IPC system allows the `mori` CLI to control the app programmatically -- listing projects, creating worktrees, sending commands to panes, and reading pane output.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mori.app (Swift 6 / AppKit)              │
│                                                             │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ MoriUI        │  │ MoriTerminal   │  │ MoriSSH       │  │
│  │ (SwiftUI      │  │ (libghostty    │  │ (Remote repo  │  │
│  │  sidebar)     │  │  Metal GPU)    │  │  support)     │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
│                                                             │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ MoriCore      │  │ MoriTmux       │  │ MoriGit       │  │
│  │ (@Observable  │  │ (actor; CLI    │  │ (actor;       │  │
│  │  app state)   │  │  integration)  │  │  worktree     │  │
│  │               │  │               │  │  discovery)   │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
│                                                             │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ MoriPersist.  │  │ MoriIPC        │  │ MoriKeybind.  │  │
│  │ (SQLite/GRDB) │  │ (Unix socket   │  │ (Customizable │  │
│  │               │  │  + CLI)        │  │  shortcuts)   │  │
│  └───────────────┘  └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘

Data Model:
  Project (git repo) → Worktree (branch) → tmux Session → Windows → Panes

IPC Protocol:
  Unix socket (newline-delimited JSON)
  Commands: projectList, worktreeCreate, focus, send, newWindow,
            open, setWorkflowStatus, paneList, paneRead, paneMessage
  Response: IPCResponseEnvelope { response: success(Data?) | error(String), requestId }

Agent Hooks (Claude Code lifecycle → tmux pane options):
  UserPromptSubmit/PreToolUse → @mori-agent-state = "working"
  Stop/Notification           → @mori-agent-state = "waiting"
```

**Key implementation details:**
- Swift 6 strict concurrency: `@MainActor` for UI, actors for tmux/git operations
- AppKit-first: SwiftUI only for sidebar leaf views; AppKit for terminal and window management
- No XCTest: custom test executable targets with `assertEqual`/`assertTrue` helpers
- Theme sync: all windows inherit Ghostty theme via `GhosttyThemeInfo`
- 9 internal Swift packages with clear separation of concerns
- Agent hooks for Claude Code (`mori-agent-hook.sh`), Codex (`mori-codex-hook.sh`), and Pi Agent (`mori-pi-extension.ts`)

---

## Publisher Background

LiuVaayne is a solo developer based in Beijing with a GitHub account since 2014. Their other projects include Anna (a Go-based AI assistant with LCM memory, multi-channel support, and scheduling -- 10 stars), Go-Defuddle (a Go port of a web content extraction library), and various web scraping/MCP tools. The mori repository has the CLAUDE.md and AGENTS.md conventions, suggesting the project itself is being developed with AI agent assistance. With 192 stars in ~2 weeks since creation (March 19, 2026) and 290 commits, this is a fast-moving solo project. The Chinese README translation and Beijing location suggest a Chinese developer community audience as well.

---

## What's Valuable for Us

1. **Agent hook pattern via tmux pane options**: The `set_state` function in `mori-hook-common.sh` that sets `@mori-agent-state` and `@mori-agent-name` as tmux pane options is a clean, zero-dependency way to track agent status. We could adopt this in our current tmux orchestrator for better visibility. Reference: `Sources/Mori/Resources/mori-hook-common.sh`.

2. **Worktree-first navigation model**: Treating worktrees as the primary organizational unit (not tabs, not sessions) aligns with our git worktree isolation pattern. Mori proves this UX concept works for multi-branch parallel development.

3. **`paneMessage` with sender metadata**: The IPC command includes `senderProject`, `senderWorktree`, `senderWindow`, and `senderPaneId` fields, enabling attributed inter-agent communication. This is a pattern we could use for agent-to-agent messaging in our orchestrator.

4. **Typed IPC protocol**: The `IPCCommand` enum in `IPCProtocol.swift` provides a clean reference for how to design a typed, compile-time-safe command protocol for agent-terminal communication. Simpler than JSON-RPC but still structured.

5. **Multi-agent hook support**: Separate hooks for Claude Code, Codex, and Pi Agent (`mori-pi-extension.ts`) show the pattern for supporting multiple agent runtimes in a single terminal app.

---

## What's NOT Relevant

- **tmux dependency**: Our Master Blueprint's direction (via cmux) is to eliminate tmux, not wrap it in a GUI. Mori's core architectural bet -- tmux as the session backend -- is the opposite of where we're heading.
- **SQLite persistence via GRDB**: We use JSON state files, not SQLite, for orchestrator state. The GRDB integration is Swift-specific and not portable.
- **macOS 14+ requirement**: Same platform constraint as cmux, but cmux is the chosen tool.
- **SwiftUI sidebar**: GUI patterns aren't relevant to our headless automation architecture.
- **Sparkle auto-update**: Consumer app distribution concern, not our domain.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Steal the `mori-agent-hook.sh` pattern for our tmux orchestrator -- set `@mori-agent-state` pane options via Claude Code hooks for better agent status visibility before cmux migration.
- **Phase 3 (Days 60-90)**: If cmux doesn't fully replace our needs, Mori's tmux-preserving approach could be a fallback. The worktree-first navigation would map well to our multi-project orchestration.
- **Phase 4 (Days 90+)**: Monitor for SSH remote project support maturity (`MoriSSH` package). Remote agent execution via SSH is a capability neither our current stack nor cmux fully addresses.

---

## Key Takeaway

> **Mori validates our tmux+worktree+libghostty architecture with a native macOS GUI, but cmux's tmux-replacement approach is more aligned with our direction -- steal the agent hook pattern for tmux pane state tracking and watch for SSH remote execution maturity.**
