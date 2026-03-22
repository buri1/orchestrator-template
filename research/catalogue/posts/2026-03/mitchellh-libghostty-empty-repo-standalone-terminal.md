# From Empty Repo to a Functional Minimal Standalone Terminal with libghostty

> **@mitchellh — 2026-03-21**

| Field | Value |
|-------|-------|
| Source | [x.com/mitchellh/status/2035114092151902357](https://x.com/mitchellh/status/2035114092151902357) |
| Author | Mitchell Hashimoto (@mitchellh) — Creator of Vagrant, Terraform, Consul, Ghostty; HashiCorp co-founder |
| Date | 2026-03-21 |
| Topics | libghostty, terminal-emulation, ghostty, agents, embedded-terminal, C-API |
| Type | Single post |

---

## Burak's Notes

> *This follows Hashimoto's Ghostling announcement (already in catalogue). The "empty repo to functional terminal" framing shows how accessible libghostty-vt's C API has become. Combined with his previous post about Ghostling being 100% agent-written, this paints a picture: AI agents can now build standalone terminal emulators from scratch using libghostty.*
>
> *For us, this validates libghostty as the foundation layer. cmux (our primary terminal) is built on it. The fact that you can go from zero to a working terminal emulator means custom agent UIs are now trivially buildable.*

---

## Key Takeaways

1. **libghostty-vt C API is production-ready** — Going from empty repo to functional terminal proves the API is accessible and well-documented enough for rapid adoption.
2. **Agent-buildable terminals** — Combined with Ghostling (100% agent-written), this demonstrates agents can create custom terminal UIs using libghostty as foundation.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Validates libghostty ecosystem maturity; confirms cmux's rendering engine is solid and accessible; incremental over existing Ghostling and libghostty catalogue entries |

---

## Full Content

Mitchell Hashimoto demonstrated building a functional minimal standalone terminal emulator from an empty repository using libghostty. The post shows the progression from zero code to a working terminal, highlighting the accessibility of the libghostty-vt C API.

This follows his previous announcement that Ghostling (a demo terminal) was 100% agent-written using Opus and Codex with CI fix-push loops. Together, these posts establish that: (1) libghostty makes terminal emulation embeddable, and (2) AI agents can build terminals from scratch using this library.

The motto referenced: "Ex minimo, infinita nascuntur" (From the minimal, infinite things are born).

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://mitchellh.com/writing/libghostty-is-coming | Full libghostty manifesto | Already in catalogue |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| libghostty | Foundation library being demonstrated | Yes — [infrastructure/libghostty.md](../../infrastructure/libghostty.md) |
| Ghostty | Parent project | Yes (referenced in libghostty entry) |
| Ghostling | Previous demo, 100% agent-written | Yes — [infrastructure/ghostling.md](../../infrastructure/ghostling.md) |
| cmux | Built on libghostty | Yes — [developer-gui/cmux.md](../../developer-gui/cmux.md) |
