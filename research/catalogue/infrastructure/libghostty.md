# libghostty

> **A modular family of C-ABI compatible libraries extracted from Ghostty, providing production-grade terminal emulation, VT parsing, input encoding, GPU rendering, and platform widgets -- the rendering engine underneath cmux.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure / Terminal Library |
| Repository | [ghostty-org/ghostty](https://github.com/ghostty-org/ghostty) (monorepo; libghostty lives inside) |
| GitHub Stars | 48,100+ (Ghostty monorepo, as of 2026-03-22) |
| API Docs | [libghostty-vt reference](https://libghostty.tip.ghostty.org/index.html) |
| Blog Post | [Libghostty Is Coming](https://mitchellh.com/writing/libghostty-is-coming) |
| Ecosystem | [awesome-libghostty](https://github.com/Uzaaft/awesome-libghostty) (48+ projects) |
| Demo | [Ghostling](https://github.com/ghostty-org/ghostling) — minimal terminal emulator in a single C file |
| Publisher | Mitchell Hashimoto (solo; creator of Vagrant, Terraform, Vault, Consul; founded HashiCorp; 172K X followers) |
| License | MIT |
| Tech Stack | Zig (core), C ABI (public API), WASM (browser target), Metal/OpenGL (GPU rendering) |
| Maturity | 🟡 Early (API not stable; no tagged release yet; core logic production-proven via Ghostty 1.3.1) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> libghostty is THE engine underneath cmux -- my primary terminal. Understanding it means understanding what cmux can and cannot do at the rendering/emulation layer. The fact that Hashimoto explicitly called cmux "a perfect example of what Ghostty is trying to achieve" and "a huge success story" means cmux has first-class upstream support. The modular library architecture (libghostty-vt -> libghostty-input -> libghostty-gpu -> libghostty-gtk/swift) means the entire terminal stack is composable. For our orchestrator: we don't need to use libghostty directly (cmux abstracts it), but understanding the capabilities explains WHY cmux can do GPU-accelerated rendering, WASM browser terminals, proper VT parsing with Kitty keyboard protocol, etc. The 48+ project ecosystem (terminals on iOS, Android, Windows, WASM, Emacs, JupyterLab, Obsidian) proves this is becoming the WebKit of terminals. The Ghostling demo being 100% agent-written using the same Opus+Codex+AGENTS.md+CI-loop pattern we use is validation from the creator of Terraform himself.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Powers cmux (our 10/10 primary terminal); explains all cmux terminal rendering capabilities; modular architecture enables future direct integration; Hashimoto explicitly endorses cmux as libghostty success story; ecosystem of 48+ projects proves platform viability |
| **Novelty** | 8/10 | First production-grade terminal library with zero-dependency C ABI, WASM support, SIMD-optimized parsing, and modular decomposition (VT/input/GPU/widgets). Nothing comparable existed before -- terminal emulation was always reimplemented ad-hoc. |
| **Actionable** | 6/10 | We use libghostty indirectly through cmux today. Direct integration not needed for current orchestrator. Becomes 9/10 actionable if we build custom terminal tooling, WASM-based web dashboards, or need programmatic VT parsing for agent output analysis. |

---

## Overview

libghostty is a family of modular libraries extracted from the Ghostty terminal emulator, providing a complete stack for building terminal applications. Rather than being a single monolithic library, it is organized as progressively richer layers that applications can adopt based on their needs:

1. **libghostty-vt** (available now) -- Zero-dependency VT parsing + terminal state management
2. **libghostty-input** (roadmap) -- Keyboard encoding with Kitty Keyboard Protocol
3. **libghostty-gpu** (roadmap) -- GPU-accelerated rendering via Metal/OpenGL
4. **libghostty-gtk / libghostty-swift** (roadmap) -- Ready-made widgets for GTK and Swift/AppKit

The key insight is that terminal emulation is reimplemented ad-hoc across hundreds of programs -- text editors, multiplexers, web consoles, CI/CD platforms, SSH clients -- each with inconsistent quality. libghostty provides a single, battle-tested implementation that any application can embed. Hashimoto describes it as doing for terminal emulation what WebKit did for web rendering: a shared engine that many different applications build on top of.

The library was successfully extracted from Ghostty during the 1.3 development cycle (March 2026) and now has its own independent release schedule. The core logic has been production-proven through years of Ghostty usage, fuzzed with Valgrind, and SIMD-optimized. Despite the API being alpha-quality (not yet tagged), dozens of commercial and open-source projects already use it in production.

---

## Technical Architecture

### Library Family (Modular Layers)

```
┌─────────────────────────────────────────────────────────────────┐
│  libghostty-swift / libghostty-gtk     [ROADMAP]               │
│  Complete native widgets for AppKit/SwiftUI and GTK4            │
├─────────────────────────────────────────────────────────────────┤
│  libghostty-gpu                         [ROADMAP]               │
│  GPU-accelerated rendering (Metal, OpenGL surfaces)             │
├─────────────────────────────────────────────────────────────────┤
│  libghostty-input                       [ROADMAP]               │
│  Keyboard encoding (Kitty KBD Protocol, legacy xterm)           │
├─────────────────────────────────────────────────────────────────┤
│  libghostty-vt                          [AVAILABLE]             │
│  Zero-dependency VT parsing + terminal state management         │
│  - SIMD-optimized escape sequence parser                        │
│  - Terminal state (cursor, styles, wrap, reflow, scrollback)    │
│  - Renderer state management (incremental updates)              │
│  - Input event encoding (key, mouse, focus, paste)              │
│  - Format output (plain text, VT sequences, HTML)               │
│  - 19 C API modules (see below)                                 │
│  - Zero dependencies (not even libc)                            │
└─────────────────────────────────────────────────────────────────┘
```

### libghostty-vt C API Modules (19 headers)

| Module | Purpose |
|--------|---------|
| `vt/types.h` | Core type definitions |
| `vt/allocator.h` | Custom memory allocator support |
| `vt/build_info.h` | Build configuration queries |
| `vt/terminal.h` | Complete terminal emulator state |
| `vt/screen.h` | Screen content access |
| `vt/grid_ref.h` | Grid cell traversal |
| `vt/render.h` | Incremental render state updates |
| `vt/formatter.h` | Output as plain text, VT sequences, or HTML |
| `vt/color.h` | 24-bit + 256-color palette handling |
| `vt/style.h` | Text styling (SGR attributes) |
| `vt/sgr.h` | SGR sequence parsing |
| `vt/osc.h` | OSC sequence parsing (clipboard, notifications, titles) |
| `vt/modes.h` | Terminal mode management (DEC private modes) |
| `vt/key.h` | Key event encoding (Kitty KBD Protocol + legacy) |
| `vt/mouse.h` | Mouse event encoding (multiple tracking modes) |
| `vt/focus.h` | Focus in/out event encoding |
| `vt/paste.h` | Paste data validation (bracketed paste safety) |
| `vt/size_report.h` | Terminal size reporting |
| `vt/wasm.h` | WebAssembly convenience functions |

### Platform Support

| Platform | libghostty-vt | libghostty-gpu | Ghostty GUI |
|----------|:------------:|:--------------:|:-----------:|
| macOS (x86_64, aarch64) | Yes | Yes (Metal) | Yes |
| Linux (x86_64, aarch64) | Yes | Yes (OpenGL) | Yes |
| FreeBSD | Yes | Yes | Yes |
| Windows | Yes | Planned | No |
| Android | Yes | Planned | No |
| iOS / iPadOS | Yes | Yes (Metal) | No (via cmux, Echo, etc.) |
| WebAssembly | Yes | Via WebGPU | No |
| 32-bit architectures | Yes | - | No |

### Terminal Capabilities (VT Sequence Support)

- Full DEC ANSI parser state machine
- 24-bit color + 256-color palette + dynamic color queries
- Kitty Graphics Protocol (inline images)
- Kitty Keyboard Protocol (modern key encoding)
- tmux Control Mode
- OSC 52 (clipboard), OSC 9/99/777 (notifications), OSC 133 (shell integration)
- Synchronized rendering (prevents frame tearing in Neovim etc.)
- Mouse tracking (multiple modes)
- Scrollback with viewport scrolling + text reflow on resize
- Light/dark mode notifications
- Hyperlink support (OSC 8)
- Unicode with multi-codepoint grapheme handling
- Focus reporting

---

## Publisher Background

**Mitchell Hashimoto** is one of the most influential infrastructure engineers of the past decade. He founded **HashiCorp** and created Vagrant, Terraform, Vault, Consul, Packer, and Nomad -- tools used by virtually every enterprise. After departing HashiCorp (which IPO'd in 2023), he built Ghostty as a personal project, betting that terminal emulation was a neglected infrastructure layer ripe for a modern rewrite.

Ghostty reached 48K+ stars on GitHub, became one of the fastest-growing terminal emulators, and transitioned to **non-profit status under Hack Club** (January 2026) with enforceable assurances that it cannot be sold, pivoted, or commercialized. This makes libghostty a uniquely stable dependency -- there is zero risk of rug-pull or license change.

Hashimoto actively uses Claude Opus + OpenAI Codex with AGENTS.md-based configuration for Ghostty development. The Ghostling demo was 100% agent-written. He runs agents in `gh` CLI CI fix-push loops -- the same pattern as our orchestrator's WAIT_FOR_PR -> REVIEW-FIX cycle.

---

## Ecosystem: What's Being Built with libghostty (48+ Projects)

### Terminal Emulators (16 projects)
Full terminal applications built on libghostty as their rendering engine:

| Project | Platform | Notable Feature |
|---------|----------|-----------------|
| **cmux** | macOS | Our primary terminal; socket API, agent notifications, browser automation |
| **Echo** | iOS/iPadOS | SSH/Mosh client powered by Ghostty |
| **Ghostree** | macOS | Ghostty fork with native git worktree + AI agent support |
| **Husk** | Linux (Wayland) | Lightweight daemon-based C++ terminal |
| **Umbra** | Android | GPU-accelerated Android terminal |
| **phantty** | Windows | Windows renderer for libghostty-vt |
| **Dotty** | Cross-platform | .NET terminal emulator |
| **kytos** | macOS | macOS terminal with KelyphosKit |
| **fantastty** | macOS | Session workspaces + notes + live previews |
| **Spectty** | iOS | Fast SSH/Mosh terminal |
| **VVTerm** | iOS/iPad/macOS | SSH client with iCloud sync + voice-to-command |
| **RootShell** | Apple platforms | "Terminal reimagined for Apple" |
| **OpenOwl** | macOS | Git GUI + terminal with Metal GPU rendering |
| **Ghostling** | macOS | Official demo; single C file, 100% agent-written |
| **vanish** | Cross-platform | Lightweight session multiplexer |
| **tuidoscope** | Cross-platform | Terminal multiplexer with fuzzy palette + vim nav |

### AI Agent Tooling (9 projects)
Agent-first terminals and orchestration tools:

| Project | Key Feature |
|---------|-------------|
| **cmux** | Socket API + claude-teams + browser automation (our stack) |
| **Commander** | Native macOS AI workspace with diff review + git workflow |
| **Supacode** | Open-source command center for parallel coding agents |
| **Mux (Coder)** | Desktop + browser app for isolated parallel agentic dev |
| **Aizen** | macOS workspace for parallel development |
| **agtmux-term** | AI-agent-aware terminal with SwiftUI sidebar |
| **frep** | Agentic terminal emulator |
| **taskers** | Agent-first workspace with Rust shell + Niri-like tiling |
| **YEN** | Terminal-first IDE with speech-to-text |

### Web/Embedded Terminals (7 projects)
libghostty in browsers and embedded contexts:

| Project | How It Uses libghostty |
|---------|----------------------|
| **ghostty-web** (Coder) | xterm.js-compatible Ghostty for the web |
| **browstty** | Zig WASM module for browser terminal emulation |
| **vscode-bootty** | VS Code terminal extension via WebAssembly |
| **obsidian-ghostty-terminal** | Ghostty terminal embedded in Obsidian |
| **jupyterlab-ghostty-terminal** | JupyterLab terminal extension |
| **webterm** | Web terminal server with dashboard + live tiles |
| **Restty** | Web terminal library with WebGPU + text-shaper |

### Libraries & Language Bindings (5 projects)

| Project | Language | Purpose |
|---------|----------|---------|
| **ghostty-opentui** | Zig | ANSI/VT parser with JSON output + TUI viewer |
| **libghostty-dart** | Dart | FFI bindings for Flutter terminal emulators |
| **libghostty-spm** | Swift | Prebuilt GhosttyKit.xcframework as Swift Package |
| **Zmx** | Zig | Session persistence using libghostty-vt for state restore |
| **hauntty** | Go | Session persistence via WASM-compiled VT parser |

### System Integrations (11 projects)

| Project | What It Does |
|---------|-------------|
| **OrbStack** | Docker/Linux on macOS with built-in Ghostty terminal |
| **mdnb** | Markdown editor with embedded Ghostty terminal |
| **pynb** | Jupyter-compatible Python notebook with Ghostty terminal |
| **findr** | Keyboard-driven file manager with embedded terminal |
| **Watchtower** | Stacked terminal + integrated browser pane |
| **OmniWM** | macOS tiling WM with Ghostty quake terminal |
| **Ribari** | Niri-inspired tiling browser with libghostty |
| **NeoShell** | Shell-first remote workspace on iPad |
| **Trolley** | Terminal runtime for distributing cross-platform TUI apps |
| **Hot Notes** | macOS Notes fuzzy search |
| **emacs-libgterm** | Terminal emulator for Emacs |

---

## What's Valuable for Us

### 1. UNDERSTANDING CMX'S CAPABILITIES (Immediate)
cmux is built on libghostty. Knowing the library's capabilities explains what cmux can do at the terminal layer:
- **GPU rendering** -- cmux's smooth rendering comes from libghostty's Metal backend
- **Kitty Keyboard Protocol** -- modern key encoding for agent tools that need modifier keys
- **OSC 9/99/777** -- the notification escape sequences cmux uses for agent attention rings
- **Synchronized rendering** -- why Neovim/TUI apps don't tear in cmux
- **Text reflow on resize** -- why cmux handles split resizing gracefully
- **Kitty Graphics Protocol** -- inline images in the terminal (potential for agent screenshots)

### 2. WASM TERMINAL FOR WEB DASHBOARDS (Phase 3+)
libghostty-vt compiles to standalone WASM. Projects like ghostty-web, browstty, and vscode-bootty prove it works. This means:
- We could build a web-based orchestrator dashboard with real terminal rendering
- Agent output could be displayed in a browser with full VT fidelity (colors, graphics, mouse)
- The same rendering engine as our local cmux, but in a browser

### 3. PROGRAMMATIC VT PARSING FOR AGENT OUTPUT ANALYSIS (Phase 2+)
libghostty-vt can parse VT sequences and maintain terminal state programmatically. This enables:
- Parsing agent terminal output to extract structured data (exit codes, error patterns)
- Building a `capture-pane` equivalent that understands terminal state (cursor position, active styles)
- Analyzing scrollback for stuck-detection without regex on raw bytes

### 4. SESSION PERSISTENCE VIA VT STATE (Phase 3+)
Zmx and hauntty demonstrate using libghostty-vt for terminal session persistence -- serializing and restoring terminal state. This is the missing piece in cmux (which cannot persist live process state across restarts). A libghostty-vt-based state snapshot could enable:
- Crash recovery with full scrollback + visual state
- Checkpoint/restore for agent sessions
- Forensic replay of agent terminal interactions

### 5. CROSS-PLATFORM AGENT TERMINALS (Phase 4+)
libghostty supports Windows, Android, iOS, and WASM -- platforms cmux doesn't reach. If we need agent terminals on:
- **Windows** -- phantty demonstrates it works
- **iOS/iPad monitoring** -- Echo, Spectty, VVTerm all use libghostty
- **Browser-based access** -- ghostty-web provides xterm.js compatibility
- **Android** -- Umbra demonstrates GPU-accelerated Android terminal

### 6. UPSTREAM STABILITY (Strategic)
- Non-profit under Hack Club -- cannot be sold or commercialized
- MIT license -- no copyleft concerns (unlike cmux's AGPL)
- Hashimoto's track record (Terraform/Vault scale) -- this is enterprise-grade infrastructure
- Independent release cycle from Ghostty GUI -- library evolves on its own schedule

---

## What's NOT Relevant

1. **Direct libghostty integration for orchestrator v3** -- We use cmux, which already wraps libghostty. Adding another abstraction layer would be overengineering. cmux's socket API is the right interface for our orchestrator.

2. **GTK/Swift widget libraries** -- These are for building GUI terminals. We have cmux for macOS and don't need to build our own terminal app.

3. **Zig API** -- Our stack is TypeScript/Shell. The C API is the relevant binding surface if we ever need direct integration, but even then we'd go through a language binding (Node.js FFI or WASM).

4. **GPU rendering internals** -- We consume this through cmux. Understanding Metal/OpenGL shader details provides no orchestration value.

---

## Comparison with Related Tools

### vs. xterm.js (web terminal standard)
xterm.js is the dominant web terminal library (used by VS Code, JupyterLab, etc.). libghostty-vt is a superset: SIMD-optimized parsing, Kitty Graphics Protocol, proper Unicode grapheme handling, tmux Control Mode, and zero dependencies. ghostty-web provides xterm.js API compatibility, meaning it's a drop-in upgrade.

### vs. VTE (GNOME terminal library)
VTE is the GTK terminal widget used by GNOME Terminal. It's C/GTK-only, tightly coupled to GNOME, and Linux-only. libghostty is zero-dependency, cross-platform, and supports WASM. VTE has no modular separation.

### vs. alacritty_terminal (Alacritty's internal library)
Alacritty's terminal logic is a Rust library but tightly coupled to Alacritty's rendering. It was never designed for external consumption. libghostty was designed from day one to be embeddable, with a stable C ABI and modular architecture.

### vs. tmux's terminal parser
tmux has its own VT parser for its virtual terminals. It's C, undocumented, and deeply coupled to tmux's internal state. libghostty-vt provides the same parsing with a clean API, better feature coverage (Kitty protocol, graphics), and WASM portability.

---

## Future Use Cases

- **Phase 1 (Now):** No direct action needed. We use libghostty through cmux. Understanding the library explains cmux's capabilities and limitations.

- **Phase 2 (Days 4-60):** Explore using libghostty-vt (via WASM or C FFI) for programmatic agent output parsing -- extracting structured data from terminal sessions without regex on raw escape sequences. Evaluate Zmx's session persistence pattern for cmux crash recovery.

- **Phase 3 (Days 60-90):** Build a web-based orchestrator dashboard using ghostty-web or browstty for real terminal rendering in the browser. Use libghostty-vt WASM for agent session replay and forensic analysis.

- **Phase 4 (Days 90+):** Cross-platform agent terminals via libghostty. Windows agent deployment (phantty), iPad monitoring (Echo/VVTerm pattern), browser-based remote orchestrator access. Contribute to libghostty C API stabilization via Ghostty Discord.

---

## Cross-References

- **[cmux](../developer-gui/cmux.md)** -- Our primary terminal (10/10); BUILT ON libghostty. cmux is the most successful libghostty consumer, explicitly endorsed by Hashimoto.
- **[zmx](./zmx.md)** -- Uses libghostty-vt for session state persistence/restore. Reference for crash recovery pattern.
- **[Ghostling post](../posts/2026-03/mitchellh-libghostty-ghostling-agents.md)** -- Hashimoto's 100% agent-written demo; validates our Opus+AGENTS.md+CI-loop workflow.
- **[AGENTS.md](../agent-protocols/agents-md.md)** -- Convention file Hashimoto uses for Ghostty/Ghostling agent configuration.
- **[dmux](../orchestration-platforms/dmux.md)** -- Competing orchestrator; does NOT use libghostty (uses tmux). This is a differentiator for our cmux-based stack.

---

## Key Takeaway

> **libghostty is the "WebKit of terminals" -- a modular, zero-dependency, WASM-portable library by the creator of Terraform that powers cmux (our primary terminal) and 48+ other projects; it explains all of cmux's rendering capabilities and opens future paths to web dashboards, programmatic VT parsing, session persistence, and cross-platform agent terminals.**
