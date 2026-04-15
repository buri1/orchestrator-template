# Kaku

> **A fast, out-of-the-box terminal built for AI coding.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [tw93/Kaku](https://github.com/tw93/Kaku) |
| GitHub Stars | 3,979 (as of 2026-04-04) |
| Homepage | [x.com/hitw93 announcement](https://x.com/hitw93/status/2040587400582443362) |
| Publisher | tw93 — solo developer; prolific macOS/web toolmaker (Pake 47.6K stars, Mole 45.8K stars, MiaoYan 7.8K stars) |
| License | MIT (NOASSERTION in GitHub API; MIT stated in README) |
| Tech Stack | Rust (97.9%), Shell (1.4%), Lua (0.7%), GLSL/WGSL; customized WezTerm fork; GPU-accelerated rendering |
| Maturity | 🟡 Early (v0.9.0; 1,006 commits; macOS-only; active daily development; Apple-notarized) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *We're already on cmux (Ghostty-based, socket API, claude-teams tmux shim). Kaku is a WezTerm fork with bolted-on AI features (error recovery, natural language commands). It has NO programmatic API, NO agent notification system, NO multi-agent coordination primitives. It's a polished developer terminal with AI sprinkles, not an agent substrate. The publisher (tw93) is extremely credible -- Pake alone has 47K stars -- but this tool solves a different problem than ours. File under "nice terminal, wrong architecture" and move on.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Kaku is a personal developer terminal with AI command suggestions. It has zero orchestration primitives, no programmatic API, no socket control, no agent-to-agent messaging, no notification system for agent status. Our Master Blueprint requires scriptable terminal substrates with handle-based addressing and event signaling -- Kaku offers none of this. cmux already fills this slot at 10/10. |
| **Novelty** | 3/10 | WezTerm fork with AI error recovery and `# natural language` command translation. Both patterns are well-documented in our catalogue (Warp had AI command suggestions in 2024, cmux has scriptable browser + agent notifications). The 40% binary size reduction via aggressive stripping is a nice engineering detail but not architecturally novel. |
| **Actionable** | 1/10 | Nothing to adopt. No API, no hooks, no extensibility beyond Lua config. We cannot script it, cannot poll agent status from it, cannot spawn agents into it programmatically. It would be a regression from both tmux and cmux. |

---

## Overview

Kaku is a macOS-only terminal emulator built as a heavily customized fork of WezTerm. The creator (tw93) stripped WezTerm down by 40% in binary size (~40MB vs ~67MB), added sensible macOS defaults (JetBrains Mono font, automatic dark/light theme switching, copy-on-select), and bolted on two AI features: command error recovery (Cmd+Shift+E to apply a fix when a command fails) and natural language command generation (type `# description` at the prompt to get an executable command).

The AI features support OpenAI-compatible endpoints with configurable base URLs, making them provider-agnostic. Shell bootstrap time is reduced to ~100ms (vs ~200ms upstream). It includes built-in keybindings for lazygit (Cmd+Shift+G) and yazi file manager (Cmd+Shift+Y). Configuration is Lua-based, maintaining full WezTerm API compatibility.

The project is clearly targeted at individual developers who want a fast, opinionated terminal with AI assistance baked in. It is NOT an agent orchestration substrate, has no programmatic control API, and provides no multi-session management beyond standard tabs and splits.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Kaku (macOS .app)               │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  WezTerm Core (heavily stripped)      │   │
│  │  - kaku (main binary)                │   │
│  │  - term / termwiz (VT engine)        │   │
│  │  - mux (multiplexing)               │   │
│  │  - window (GUI)                      │   │
│  │  - kaku-gui (macOS frontend)         │   │
│  │  - lua-api-crates (Lua bindings)     │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  AI Module                           │   │
│  │  - Error recovery (Cmd+Shift+E)      │   │
│  │  - NL-to-command (# prefix)          │   │
│  │  - OpenAI-compatible API backend     │   │
│  │  - Provider presets (OpenAI, custom)  │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Shell Suite (zsh plugins)           │   │
│  │  - Auto-setup on first launch        │   │
│  │  - CLI: kaku ai / kaku config /      │   │
│  │    kaku doctor                        │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  GPU-accelerated rendering (GLSL/WGSL)      │
│  Lua configuration (WezTerm-compatible)     │
└─────────────────────────────────────────────┘
```

**Key directories**: `kaku/` (main), `term/` + `termwiz/` (VT engine), `mux/` (multiplexing), `window/` (GUI), `kaku-gui/` (macOS frontend), `lua-api-crates/` (Lua API bindings), `deps/` + `crates/` (dependencies).

**Performance optimizations**: Lazy-loaded color schemes, aggressive symbol stripping, just-in-time initialization. Binary reduced from ~67MB to ~40MB. Shell bootstrap from ~200ms to ~100ms.

---

## Publisher Background

**tw93** is a prolific solo developer with an extraordinary track record in macOS developer tooling:

- **Pake** (47,663 stars): Turn any webpage into a desktop app with one command. Rust/Tauri-based. One of the most-starred Rust projects on GitHub.
- **Mole** (45,873 stars): Deep clean and optimize your Mac. Another wildly popular macOS utility.
- **MiaoYan** (7,820 stars): Lightweight Markdown editor.
- **Kaku** (3,979 stars): This terminal.

tw93 clearly knows how to ship polished macOS apps that developers love. The star counts speak for themselves. However, their focus is consumer/developer UX tools, not agent infrastructure or orchestration.

---

## What's Valuable for Us

Very little for our specific use case. The only patterns worth noting:

1. **WezTerm fork strategy**: Demonstrates that WezTerm's Rust codebase is forkable and strippable. If we ever needed to build a custom terminal (unlikely given cmux and libghostty), WezTerm is a viable base. The 40% size reduction shows aggressive dead-code elimination is feasible.

2. **AI error recovery UX**: The pattern of detecting command failure → suggesting fix → one-keystroke apply (Cmd+Shift+E) is a clean UX pattern. However, this is a human-in-the-loop feature, not relevant to autonomous agents.

3. **Provider-agnostic AI config**: Support for OpenAI and custom API endpoints with configurable base URLs is a reasonable design for portable AI features. Not novel but well-executed.

---

## What's NOT Relevant

Almost everything, for these architectural reasons:

- **No programmatic API**: Our Master Blueprint requires scriptable control of the terminal substrate (spawn agents, read output, send commands, receive notifications). Kaku has zero API surface -- no socket, no CLI control protocol, no event system. This is a deal-breaker.
- **No multi-agent support**: No session management, no agent status tracking, no notification rings, no handle-based addressing. It's a single-user terminal.
- **macOS-only with no cloud/headless story**: No remote daemon, no SSH integration, no headless mode. Cannot be used for cloud agent infrastructure.
- **WezTerm base vs Ghostty base**: We're invested in the Ghostty/libghostty ecosystem (cmux, libghostty, Ghostling). WezTerm is a different lineage entirely.
- **Human-centric AI features**: The `#` natural language commands and error recovery are designed for a human sitting at the keyboard, not for autonomous agents.

---

## Future Use Cases

None foreseeable across any roadmap phase:

- **Phase 1-2**: cmux is already our terminal substrate with a vastly richer API surface.
- **Phase 3**: If we needed WezTerm-specific features, we'd look at upstream WezTerm directly, not a stripped fork.
- **Phase 4+**: No trajectory toward orchestration or agent infrastructure.

The only scenario where Kaku becomes relevant is if tw93 pivots toward agent orchestration and adds a programmatic API -- but given their portfolio focus on polished consumer tools, this seems unlikely.

---

## Key Takeaway

> **Kaku is a beautifully polished personal terminal from a credible publisher, but it has zero orchestration primitives and is architecturally irrelevant to our agent substrate needs -- cmux already occupies this slot at 10/10.**
