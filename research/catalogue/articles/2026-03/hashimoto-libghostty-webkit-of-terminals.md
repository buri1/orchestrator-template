# Libghostty Is Coming

> **Mitchell Hashimoto — mitchellh.com, 2025-09-22**

| Field | Value |
|-------|-------|
| Source | [mitchellh.com/writing/libghostty-is-coming](https://mitchellh.com/writing/libghostty-is-coming) |
| Author | Mitchell Hashimoto (creator of Vagrant, Terraform, Vault, Consul; founded HashiCorp; Ghostty creator) |
| Publication | Personal blog (mitchellh.com) |
| Date | 2025-09-22 |
| Topics | libghostty, terminal emulation, C ABI, modular architecture, platform libraries, SIMD, WASM, ecosystem design |
| Read Time | ~10 min |

---

## Burak's Notes

> *This is the foundational manifesto for the engine underneath cmux -- our primary terminal. Hashimoto's "WebKit of terminals" vision explains WHY cmux can do GPU rendering, proper VT parsing, Kitty protocols, and WASM browser terminals. The modular decomposition (libghostty-vt -> input -> GPU -> widgets) maps directly to how we think about composable infrastructure. The C ABI decision is the reason 48+ projects (cmux, Echo, Zmx, OrbStack, etc.) can build on it from any language. The fact that terminal emulation is "reimplemented ad-hoc across hundreds of programs" -- and Hashimoto is fixing that with a single battle-tested library -- is the same pattern we see in agent orchestration: everyone reimplements the same thing badly. Understanding this article is prerequisite for understanding why cmux is architecturally sound and why our bet on the Ghostty ecosystem is low-risk.*

---

## Key Takeaways

1. **Terminal emulation is a universally reimplemented problem** -- Hundreds of programs (tmux, VS Code, JetBrains IDEs, GitHub Actions, Vercel, Zed) each maintain separate, incomplete, buggy terminal parsers. The problem appears simple but is "riddled with unexpected complexities and edge cases."

2. **libghostty extracts Ghostty's battle-tested core into a zero-dependency embeddable library** -- The core logic is production-proven through years of Ghostty usage, SIMD-optimized, fuzz-tested, and Valgrind-verified. The "alpha" label applies to the API surface (function signatures), not the implementation.

3. **Modular library family over monolithic design** -- Structured as `libghostty-<x>` modules (vt, input, GPU, widgets) so consumers only pull what they need. libghostty-vt has zero dependencies -- not even libc.

4. **C ABI enables universal adoption** -- A clean public C API allows embedding in "any popular language ecosystem." The existing internal C API was "a mess" -- the new public API takes a clean-slate approach.

5. **Platform reach exceeds the GUI application** -- libghostty targets macOS, Linux, Windows, embedded, and WebAssembly. "libghostty will have broader support than Ghostty the GUI, due to its tighter scope."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Foundational to understanding cmux's rendering engine; explains all terminal capabilities we depend on (GPU rendering, Kitty protocol, VT parsing, OSC notifications); Hashimoto explicitly endorses cmux as libghostty success story |
| **Actionable** | 6/10 | We consume libghostty through cmux today (indirect). Becomes highly actionable if we build WASM web dashboards, programmatic VT parsing for agent output, or session persistence. Direct integration not needed for current orchestrator. |

---

## Summary

Mitchell Hashimoto opens by identifying a systemic problem in the software ecosystem: terminal emulation is reimplemented ad-hoc across hundreds of programs. From full terminal emulators (Ghostty, Kitty, iTerm2, Alacritty) to multiplexers (tmux, zellij), IDE embedded terminals (JetBrains' Jediterm, VS Code's xterm.js, Zed), and web platforms (GitHub Actions, Vercel, Render) -- each maintains its own parser that is typically "incomplete, buggy, and slow." Terminal sequence parsing appears deceptively simple but contains unexpected edge cases. Hashimoto provides concrete examples: Jediterm doesn't handle intermediates correctly, causing the "change cursor shape" sequence to swallow subsequent characters; many web consoles fail complex style sequences; even Ghostty itself got RGB color parsing wrong for nine months.

His solution is libghostty: a family of modular libraries extracted from Ghostty's production codebase. The first module, **libghostty-vt**, provides zero-dependency VT parsing and terminal state management (cursor position, styles, text wrapping, scrollback). It inherits Ghostty's SIMD-optimized parsing, strong Unicode support, optimized memory usage, fuzzing and Valgrind testing, and feature compatibility with the Kitty Graphics Protocol and tmux Control Mode. Crucially, libghostty-vt has zero dependencies -- not even libc -- making it maximally portable.

The architecture follows a **modular library family** pattern rather than monolithic design. Future modules include libghostty-input (keyboard encoding with Kitty Keyboard Protocol), libghostty-gpu (GPU rendering via Metal and OpenGL -- "provide us with a surface and we'll take care of the rest"), and platform-specific widget libraries (libghostty-gtk, libghostty-swift). Each module adds dependencies incrementally, so consumers only pay for what they use.

The **C ABI** is the strategic keystone. While the Zig API is available now for testing (merged in PR #8840 with a minimal example), the public C API is being built from a "clean slate" to enable embedding from any language. The existing internal C API in Ghostty (used by OrbStack and cmux) was never designed for public consumption. The new API will have a stable, documented, clean interface suitable for the broader ecosystem.

Hashimoto positions libghostty as doing for terminal emulation what WebKit did for web rendering: a shared engine that many different applications build on top of, each with their own UI and UX but sharing the same battle-tested core. He states that "libghostty is the next frontier for Ghostty and I think it has the ability to make a far larger impact than Ghostty can as a standalone application itself."

---

## Notable Quotes

> "Terminal emulation is a classic problem that appears simple on the surface but is riddled with unexpected complexities."

> "libghostty is the next frontier for Ghostty and I think it has the ability to make a far larger impact than Ghostty can as a standalone application itself."

> "The core logic is shared with Ghostty and is extremely stable and proven in the real world."

> "libghostty will have broader support than Ghostty the GUI, due to its tighter scope."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| [github.com/ghostty-org/ghostty/pull/8840](https://github.com/ghostty-org/ghostty/pull/8840) | PR that merges the Zig API with minimal example -- shows the actual extraction architecture | Reference only |
| [libghostty.tip.ghostty.org](https://libghostty.tip.ghostty.org/index.html) | Auto-generated API docs for libghostty-vt's 19 C modules | Reference only |
| [github.com/Uzaaft/awesome-libghostty](https://github.com/Uzaaft/awesome-libghostty) | Curated list of 48+ projects built on libghostty | `/ingest-post` if updated significantly |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Ghostty | Parent application from which libghostty is extracted | Yes -- [libghostty](../../infrastructure/libghostty.md) |
| Kitty | Competing terminal with its own protocol implementations | No (terminal, not agent infra) |
| iTerm2 | Example of ad-hoc terminal parsing | No |
| tmux | Example of independent terminal parser; libghostty supports tmux Control Mode | Referenced in many entries |
| zellij | Multiplexer that reimplements terminal parsing | No |
| Jediterm | JetBrains terminal library with intermediate-handling bugs | No |
| xterm.js | VS Code's web terminal library; libghostty is a superset | No (but ghostty-web provides compat) |
| Zed | Editor with embedded terminal that reimplements parsing | No |
| OrbStack | Already using internal Ghostty C API in production | Mentioned in [libghostty](../../infrastructure/libghostty.md) |
| libvte | GNOME's GTK terminal library; limited to Linux/GTK | No |
| cmux | "Perfect example" of libghostty success; our primary terminal | Yes -- [cmux](../../developer-gui/cmux.md) |

---

## Action Items

- [ ] Monitor C API stabilization progress (Ghostty Discord / GitHub PRs)
- [ ] When libghostty-vt ships a tagged release, evaluate direct WASM integration for web orchestrator dashboard
- [ ] Cross-reference with [zmx](../../infrastructure/zmx.md) session persistence pattern for cmux crash recovery
- [ ] Update [libghostty catalogue entry](../../infrastructure/libghostty.md) when C API ships public release
