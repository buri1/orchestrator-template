# OpenTUI

> **OpenTUI is a native terminal UI core written in Zig with TypeScript bindings — the rendering engine powering OpenCode in production today.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [anomalyco/opentui](https://github.com/anomalyco/opentui) |
| GitHub Stars | 9,322 (as of 2026-03-12) |
| Publisher | Anomaly (company — SST/OpenCode org; open-source infrastructure focused) |
| License | MIT |
| Tech Stack | Zig (28.7%), TypeScript (67.2%), Bun runtime; SolidJS + React reconcilers; Yoga layout engine |
| Maturity | 🟢 Production (powers OpenCode 120K stars; v0.1.87 released 2026-03-09) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | We build orchestrators, not terminal UIs — this is infrastructure for the tooling we use, not something we'd build on directly. However: our orchestrator DOES live in the terminal, and if we ever build a rich status dashboard or TUI frontend for the orchestrator, this is the production-proven engine. The connection is secondhand — OpenCode uses this, and OpenCode is in our catalogue. |
| **Novelty** | 7/10 | Zig core with C ABI exposure is a genuinely novel approach — most TUI libraries are pure Go (Bubble Tea) or Python (Textual). The C ABI makes it language-agnostic. The SolidJS/React reconciler pattern for terminal rendering is novel — component-model UI in the terminal using actual framework reconcilers, not custom diffing logic. |
| **Actionable** | 4/10 | Not immediately actionable for our orchestrator work. If we were building a TUI frontend for orchestrator dashboards, this would be the library. For now it's reference material. Agent skill integration (`npx skills add msmps/opentui-skill`) is a concrete 10-minute win if building terminal UI tools. |

---

## Overview

OpenTUI is the native rendering engine behind [OpenCode](https://opencode.ai) (120K stars) — the open-source coding agent. Built by Anomaly (the SST organization), it provides a Zig-native terminal UI core with a C ABI that TypeScript, and in principle any language, can call into. The design decision to write the hot path in Zig rather than TypeScript gives it high-performance rendering, sub-millisecond cell diffing, and memory-efficient framebuffer operations that a pure-JS TUI library cannot match.

The library's architecture separates the rendering primitive (Zig core → `@opentui/core`) from the UI component model. Rather than inventing its own component paradigm, OpenTUI ships two full framework reconcilers: `@opentui/solid` (SolidJS) and `@opentui/react` (React). This means developers use the same component mental model they already know — signals, hooks, JSX — but targeting a terminal framebuffer instead of a DOM. The Yoga layout engine handles flexbox-compatible layout in the terminal, enabling responsive terminal UIs that behave like modern web UIs.

The project is actively maintained and shipping quickly — v0.1.87 released 2026-03-09, with 427 forks, 121 open issues, and a plugin system (Slots) just merged. An official AI agent skill (`msmps/opentui-skill`) teaches coding assistants the OpenTUI API, signaling the project understands the agent-assisted development workflow. The `awesome-opentui` list (228 stars) tracks the growing ecosystem.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  ZIG NATIVE CORE                         │
│                                                          │
│  CliRenderer — manages terminal I/O, FPS loop            │
│  FrameBuffer (OptimizedBuffer) — 2D cell grid, RGBA      │
│  Yoga Layout Engine — flexbox in terminal                │
│  Input System — keyboard events, paste, focus            │
│  C ABI Export — callable from TS, any FFI language       │
└──────────────────────┬───────────────────────────────────┘
                       │  FFI / C ABI
                       ▼
┌──────────────────────────────────────────────────────────┐
│              @opentui/core (TypeScript)                   │
│                                                          │
│  createCliRenderer() — renderer factory                  │
│  Renderables — TextRenderable, BoxRenderable, etc.       │
│  Constructs (Components) — VNode-based declarative API   │
│  ConsoleOverlay — debug console without disrupting UI    │
│  RGBA color system — normalized float (0.0-1.0)          │
│  KeyEvent system — structured keyboard input             │
│  Plugin system — runtime-plugin.ts + Slots (core-slot)   │
│  3D module — @opentui/core/3d                            │
│  Testing harness — @opentui/core/testing                 │
└────────────┬─────────────────────┬────────────┬──────────┘
             │                     │            │
             ▼                     ▼            ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ @opentui/solid │  │ @opentui/react │  │  @opentui/web  │
│                │  │                │  │  (docs site)   │
│ SolidJS        │  │ React JSX      │  │  Astro         │
│ reconciler     │  │ reconciler     │  │                │
│ for terminal   │  │ for terminal   │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

### Core Abstractions

1. **CliRenderer** — The heart of OpenTUI. Manages terminal output, input events, and the rendering loop. Two modes: `live` (FPS-capped loop via `renderer.start()`) and on-demand (renders only when state changes).

2. **FrameBuffer (OptimizedBuffer)** — Low-level 2D cell array. Methods: `setCell`, `setCellWithAlphaBlending`, `drawText`, `fillRect`, `drawFrameBuffer`. Supports transparent cells and alpha blending.

3. **Renderables** — Hierarchical UI objects. Each has position, style, and children. Uses Yoga for flexible layout. Core renderables: `TextRenderable`, `BoxRenderable`, `EditorView`, plus 3D primitives.

4. **Constructs (Components)** — VNode-based declarative API. Look like React/Solid components but are constructors, not render functions. Composable from primitives.

5. **Plugin System** — `runtime-plugin.ts` provides a Bun module loader plugin (`CreateRuntimePluginOptions`) with specifier rewriting. `packages/core/src/plugins/` contains: `registry.ts` (plugin registry), `types.ts` (plugin interfaces), `core-slot.ts` (the new Slots feature from v0.1.87).

6. **ConsoleOverlay** — Built-in debug console that captures all `console.log/warn/error/info/debug` calls and renders them as a visual overlay at any terminal edge. Critical for debugging TUI apps where stdout would corrupt the interface.

7. **Theme Detection** — Reads terminal color scheme preference via DEC mode 2031. Emits `theme_mode` events on changes (`"dark"` | `"light"` | `null`).

### File Structure (packages/core/src)

```
src/
├── index.ts              — Public API surface
├── renderer.ts           — CliRenderer implementation
├── buffer.ts             — FrameBuffer (OptimizedBuffer)
├── editor-view.ts        — Text editor renderable
├── console.ts            — Debug console overlay
├── ansi.ts               — ANSI escape code handling
├── runtime-plugin.ts     — Bun module loader plugin
├── runtime-plugin-support.ts
├── plugins/
│   ├── registry.ts       — Plugin registry
│   ├── types.ts          — Plugin type interfaces
│   └── core-slot.ts      — Slots plugin (v0.1.87)
├── renderables/          — All renderable types
├── animation/            — Animation system
├── 3d/                   — 3D rendering module
├── testing/              — Test harness
└── examples/             — Runnable demos
```

---

## Publisher Background

**Anomaly** (github.com/anomalyco) is the organization behind SST (25K stars — "Build full-stack apps on your own infrastructure"), **OpenCode** (120K stars — "The open source coding agent"), Models.dev (3K stars), and Console (SST web dashboard). With 64 public repositories and active cross-project maintenance, this is a serious, well-funded (or at minimum highly sponsored) open-source company focused on developer infrastructure.

The OpenTUI project is a direct extraction from OpenCode's rendering needs — it was built for production, proven in production, and then open-sourced. This is a strong credibility signal: the library exists because it was needed, not because it was a product idea. The same team maintains both the consumer (OpenCode) and the library (OpenTUI), which means the library gets real-world production feedback on every OpenCode release.

The upcoming adoption by [terminal.shop](https://terminal.shop) (a terminal-based storefront) further validates the library as general-purpose TUI infrastructure, not just OpenCode internals.

---

## What's Valuable for Us

**1. Production Validation of Terminal-First Architecture**

Our entire orchestrator stack lives in the terminal (tmux, Claude Code, shell scripts). OpenTUI demonstrates that high-fidelity, production-grade UIs can be built natively in the terminal — this validates a potential Phase 3 evolution where our orchestrator gets a rich TUI status dashboard rather than just log output. The fact that OpenCode (our primary harness) uses this means any OpenCode-adjacent tooling we build could tap directly into OpenTUI.

**2. Zig-Core + C ABI Pattern**

The Zig-for-performance, TypeScript-for-API pattern is architecturally significant. For our orchestrator's deterministic 70% (state management, routing, health checks), this Zig-as-hot-path pattern is a template for how to build truly high-performance primitives without sacrificing TypeScript ergonomics. Not something to build now, but a pattern to internalize for Phase 4.

**3. Agent AI Skill Distribution Model**

The `msmps/opentui-skill` package (`npx skills add msmps/opentui-skill`) is a concrete example of the agent skill packaging pattern we're tracking across the catalogue (AGENTS.md, OpenAI Skills, Awesome Agent Skills). OpenTUI ships an agent skill as a first-class distribution artifact alongside the npm package — this is the 2026 standard for developer libraries.

**4. ConsoleOverlay Pattern**

The built-in debug console overlay that intercepts `console.log` without corrupting the TUI is a pattern directly applicable to our orchestrator. When agents log debug output, it needs to go somewhere visible without corrupting tmux pane layout. This is the same problem OpenTUI solves for TUI apps.

**5. Plugin/Slots Architecture**

The freshly merged Slots system (v0.1.87) provides extension points for TUI applications — analogous to how we think about hook points in our orchestrator pipeline. The `runtime-plugin.ts` Bun module loader pattern is also relevant for our Claude Code hook infrastructure.

---

## What's NOT Relevant

**1. Direct Library Adoption (Phase 1-2)**

We are not building terminal UI applications. We are building an orchestrator that runs IN the terminal. Adding a Zig build step and a React reconciler to our orchestrator is out of scope until we have a concrete TUI dashboard need.

**2. SolidJS/React Reconcilers**

We don't use SolidJS or React anywhere in our stack. The framework reconcilers are irrelevant until we commit to a component framework for a potential TUI dashboard.

**3. Zig Build Requirement**

OpenTUI requires Zig installed to build from source. This adds a non-trivial dependency that conflicts with our zero-infra, shell-native approach (Master Blueprint Principle #7: "Build only what you have needed in the last 30 days").

**4. 3D Module**

The `@opentui/core/3d` module provides 3D rendering in terminals. Completely out of scope for our use cases.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the agent skill distribution model (`msmps/opentui-skill`) as a template for packaging our orchestrator patterns as skills. Monitor the awesome-opentui ecosystem for terminal-based tooling that could augment our agent monitoring.

- **Phase 3 (Days 60-90):** If building a TUI dashboard for the orchestrator (agent status, token usage, queue depth, health), OpenTUI is the only serious choice for TypeScript TUI infrastructure. Pre-built npm package, no Zig build needed for consumers.

- **Phase 4 (Days 90+):** OpenCode + OpenTUI = the full stack for a rich coding agent interface. If we evolve the orchestrator into something users interact with directly (beyond tmux panes), this is the rendering layer. terminal.shop will stress-test it beyond developer tooling, giving broader production validation.

---

## Deep Dive Candidates

- **[awesome-opentui](https://github.com/msmps/awesome-opentui)** — Curated list of TUI apps built on OpenTUI. 228 stars. Worth scanning for agent monitoring tools or dashboard patterns that could plug into our orchestrator. (suggested type: tool, relevance: reference for TUI ecosystem)
- **[msmps/opentui-skill](https://github.com/msmps/opentui-skill)** — The official AI agent skill for OpenTUI. Concrete example of skill packaging pattern. (suggested type: tool, relevance: skill distribution model)
- **[msmps/create-tui](https://github.com/msmps/create-tui)** — `bun create tui` scaffolding template. Pattern reference for TUI project bootstrapping. (suggested type: tool, relevance: low — scaffolding only)

---

## Key Takeaway

> **OpenTUI is the production-proven Zig+TypeScript terminal rendering engine behind OpenCode — not immediately adoptable for our orchestrator, but the definitive reference if we ever build a rich TUI status dashboard, and a concrete example of the agent skill distribution pattern in action.**
