# Ghostling

> **A minimum viable terminal emulator built on top of the libghostty C API. Ex minimo, infinita nascuntur.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure / Terminal Demo |
| Repository | [ghostty-org/ghostling](https://github.com/ghostty-org/ghostling) |
| GitHub Stars | 644 (as of 2026-03-22) |
| Publisher | Mitchell Hashimoto (solo; creator of Vagrant, Terraform, Vault, Consul; founded HashiCorp) |
| License | MIT |
| Tech Stack | C (single file), Zig 0.15.x (build dependency), CMake + Ninja, Raylib (windowing/2D rendering) |
| Maturity | 🟡 Early (demo project, not daily-driver terminal) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *This is the proof-of-concept that validates our entire orchestrator workflow — from the creator of Terraform himself. 100% agent-written (Opus + Codex), using AGENTS.md for style configuration, with agents running CI fix-push loops via `gh` CLI. That is literally our WAIT_FOR_PR -> REVIEW-FIX cycle. The fact that Hashimoto's quality bar is "if an engineer I worked with PRed all this, I'd accept it" confirms the pragmatic acceptance threshold we operate under. The technical value is secondary — this is a ~1,200 line C file. The strategic value is enormous: the most respected infrastructure engineer alive just publicly validated agent-written code + CI verification loops as production-viable methodology.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Validates our exact workflow (agent-written code + AGENTS.md config + CI fix-push loops) by the creator of Terraform; demonstrates libghostty-vt embeddability (powers cmux, our primary terminal) |
| **Novelty** | 7/10 | First official demo of libghostty-vt C API; most high-profile public case of 100% agent-written code from a top-tier infrastructure engineer; AGENTS.md convention validated at scale |
| **Actionable** | 6/10 | The code itself is a reference implementation, not something we'd adopt. The patterns (AGENTS.md, CI loops, Opus+Codex tandem, pragmatic quality bar) are already in our workflow. The libghostty-vt API surface documented here informs future cmux/terminal integration. |

---

## Overview

Ghostling is Mitchell Hashimoto's official demo project for libghostty-vt — a minimal but fully functional terminal emulator implemented in a single C file (~1,200 lines). It uses Raylib for windowing and 2D rendering, operates single-threaded, and demonstrates that libghostty-vt provides everything needed to build a correct terminal emulator without reimplementing VT parsing from scratch.

The project was 100% written by AI agents (Claude Opus + OpenAI Codex), with Hashimoto reviewing every line and nudging agents directionally. Even the Nix flakes and GitHub Actions CI were agent-authored. Agents ran in `gh` CLI loops watching CI failures, fixing, and pushing — the same pattern as our orchestrator's WAIT_FOR_PR -> REVIEW-FIX cycle.

Despite being a demo, Ghostling supports text reflow on resize, full 24-bit and 256-color rendering, Unicode/grapheme handling, Kitty keyboard protocol, mouse tracking (multiple modes), scroll wheel, and scrollbar — all via libghostty-vt APIs. It deliberately excludes GUI features (tabs, splits, session management) to show that those are consumer concerns, not library concerns.

---

## Technical Architecture

### Single-File Architecture (~1,200 lines of C)

```
main.c
├── PTY Helpers ─────── pty_spawn(), pty_read(), pty_write()
│                        Non-blocking I/O (O_NONBLOCK)
├── Input Handling ───── raylib_key_to_ghostty(), handle_input()
│                        Kitty Keyboard Protocol via ghostty_key_encoder_*
├── Mouse Handling ───── raylib_mouse_to_ghostty(), handle_mouse()
│                        Multiple tracking modes via ghostty_mouse_encoder_*
├── Scrollbar ────────── handle_scrollbar()
│                        Viewport scrolling via ghostty_terminal_scroll_viewport()
├── Rendering ────────── resolve_color(), render_terminal()
│                        Immediate-mode Raylib drawing
│                        Row iterator + cell iterator pattern
│                        Bold=double-draw, Italic=shear transform
└── Main Loop ────────── Raylib polling → input → PTY read → VT write → render
```

### libghostty-vt API Surface Used

Ghostling exercises a comprehensive subset of the libghostty-vt C API:

**Terminal Management:**
- `ghostty_terminal_new()` / `ghostty_terminal_free()` — lifecycle
- `ghostty_terminal_resize()` — handle window size changes
- `ghostty_terminal_vt_write()` — feed PTY output into VT parser
- `ghostty_terminal_mode_get()` — query terminal modes (DEC private modes)
- `ghostty_terminal_scroll_viewport()` — scrollback navigation

**Render State (double-buffered snapshots):**
- `ghostty_render_state_new()` / `ghostty_render_state_update()` / `ghostty_render_state_free()`
- `ghostty_render_state_colors_get()` — palette resolution
- Row iterator: `ghostty_render_state_row_iterator_new()` → `_next()` → `_free()`
- Cell iterator: `ghostty_render_state_row_cells_new()` → `_next()` → `_free()`

**Keyboard Input Encoding:**
- `ghostty_key_encoder_new()` / `ghostty_key_encoder_encode()` / `ghostty_key_encoder_free()`
- `ghostty_key_event_new()` + `set_key()`, `set_action()`, `set_mods()`, `set_utf8()`, etc.
- `ghostty_key_encoder_setopt_from_terminal()` — sync encoder with terminal state

**Mouse Input Encoding:**
- `ghostty_mouse_encoder_new()` / `ghostty_mouse_encoder_encode()` / `ghostty_mouse_encoder_free()`
- `ghostty_mouse_event_new()` + `set_position()`, `set_action()`, `set_button()`, `set_mods()`

**Focus & Build Info:**
- `ghostty_focus_encode()` — focus in/out events
- `ghostty_build_info()` — library diagnostics

### Key Architectural Patterns

1. **Separation of concerns** — PTY I/O, input encoding, terminal state, and rendering are fully independent modules connected only through the main loop
2. **Double-buffered render state** — Terminal state is snapshotted into a separate render state each frame, isolating drawing from VT updates
3. **Event-driven polling** — Raylib event loop feeds keyboard, mouse, and window resize through libghostty encoders
4. **Non-blocking PTY** — PTY set to `O_NONBLOCK` for frame-based polling without blocking the render loop
5. **Dirty-flag optimization** — Changed rows tracked to skip unnecessary redraws

### AGENTS.md Content

```
# Ghostling

## Building
- Requires CMake 3.19+, Ninja, a C compiler, and Zig 0.15.x on PATH
- Configure: cmake -B build -G Ninja
- Build: cmake --build build
- Release build: cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
- Run: ./build/ghostling

## Code Conventions
- C (not C++), single-file project in main.c
- Never put side-effect calls inside assert() — removed in release builds
- Comment heavily — explain *why*, not just *what*
```

Concise, practical, defensive. The "comment heavily" directive explains the well-documented code style. The `assert()` warning shows defensive coding awareness for agents.

---

## Publisher Background

**Mitchell Hashimoto** is arguably the most influential infrastructure engineer of the past decade. He founded HashiCorp and created Vagrant, Terraform, Vault, Consul, Packer, and Nomad — tools used by virtually every enterprise engineering team. After departing HashiCorp (IPO'd 2023), he built Ghostty as a personal project, which reached 48K+ GitHub stars and transitioned to non-profit status under Hack Club (January 2026).

Hashimoto actively uses Claude Opus + OpenAI Codex with AGENTS.md-based configuration for Ghostty development. He publicly stated agents wrote 100% of Ghostling, including CI configuration, and that he had agents running `gh` CLI fix-push loops for GitHub Actions work. His quality bar: "If an engineer I worked with PRed all this, I would've accepted it."

With 172K X followers, his endorsement of agent-written code carries significant weight in the infrastructure/DevOps community.

---

## What's Valuable for Us

### 1. WORKFLOW VALIDATION (Strategic)
Hashimoto's agent workflow mirrors ours exactly:
- **Opus + Codex tandem** — multiple models for different strengths (we use Opus exclusively but same principle)
- **AGENTS.md for configuration** — convention file controlling code style, build instructions, constraints
- **CI fix-push loops** — agents watching CI, fixing failures, pushing, iterating (our WAIT_FOR_PR -> REVIEW-FIX cycle)
- **Human review + directional nudging** — not fully autonomous but human-in-the-loop at review stage
- **Pragmatic quality bar** — "good enough for a PR from a colleague," not perfection

### 2. LIBGHOSTTY-VT API REFERENCE (Technical)
Ghostling is the most complete reference implementation of the libghostty-vt C API. The ~50 API calls documented above show exactly what's available for:
- Terminal state management (create, resize, write VT data, query modes)
- Render state snapshots (incremental, double-buffered)
- Input encoding (keyboard with Kitty protocol, mouse with multiple tracking modes)
- The row/cell iterator pattern for reading terminal content programmatically

This informs what cmux can do at the library level and what we could do with direct libghostty integration in Phase 3+.

### 3. AGENTS.MD CONVENTION REFINEMENT (Immediate)
The AGENTS.md is notably minimal — just build instructions and 3 code conventions. No complex persona, no detailed architecture. This suggests that for focused single-file projects, less is more in agent configuration. Compare with our multi-page orchestrator CLAUDE.md.

---

## What's NOT Relevant

1. **The terminal emulator itself** — Ghostling is a demo, not a daily driver. We have cmux. There is zero reason to use Ghostling directly.

2. **Raylib rendering approach** — Immediate-mode 2D rendering is appropriate for a demo but cmux uses libghostty's native Metal/GPU path. The rendering layer is not transferable.

3. **C language patterns** — Our stack is TypeScript/Shell. The C implementation details (PTY spawning, `O_NONBLOCK`, `assert()` conventions) are not applicable to our codebase.

4. **Single-threaded architecture** — Ghostling is deliberately simple. Production terminals (cmux, Ghostty) use multi-threaded architectures with separate IO/render/VT threads.

---

## Future Use Cases

- **Phase 1 (Now):** Reference for understanding libghostty-vt API surface. Cross-reference when debugging cmux behavior or evaluating what cmux can/cannot do at the terminal layer.

- **Phase 2 (Days 4-60):** If building programmatic agent output analysis, Ghostling's row/cell iterator pattern shows exactly how to traverse terminal state via libghostty-vt. The render state snapshot approach could inform a `capture-pane` replacement with semantic understanding.

- **Phase 3 (Days 60-90):** If we build WASM-based web dashboards, Ghostling's architecture (minus Raylib, plus WebGPU/Canvas) is the starting template for a browser terminal backed by libghostty-vt.

- **Phase 4 (Days 90+):** Ghostling proves that a functional terminal can be built in ~1,200 lines of C with libghostty. If we need custom lightweight terminals for specific agent use cases (embedded, headless, stripped-down), this is the blueprint.

---

## Cross-References

- **[libghostty](./libghostty.md)** — The library Ghostling demonstrates. 9/10 in catalogue. Powers cmux. Ghostling is listed as the official demo in the libghostty entry.
- **[cmux](../developer-gui/cmux.md)** — Our primary terminal (10/10). Built on libghostty. Ghostling shows what cmux does at the library layer.
- **[@mitchellh — Ghostling post](../posts/2026-03/mitchellh-libghostty-ghostling-agents.md)** — The X thread where Hashimoto announced 100% agent-written code. Covers the CI fix-push loop pattern and quality bar.
- **[AGENTS.md](../agent-protocols/agents-md.md)** — Convention file used by Hashimoto. Ghostling's AGENTS.md is a minimal reference implementation of the convention.
- **[zmx](./zmx.md)** — Uses libghostty-vt for session persistence. Complementary to Ghostling's terminal rendering use case.

---

## Key Takeaway

> **Ghostling is Mitchell Hashimoto's proof that a fully functional terminal emulator can be 100% agent-written using Opus + Codex + AGENTS.md + CI fix-push loops — validating our exact orchestrator workflow pattern from the creator of Terraform, while serving as the definitive reference implementation for the libghostty-vt C API that powers cmux.**
