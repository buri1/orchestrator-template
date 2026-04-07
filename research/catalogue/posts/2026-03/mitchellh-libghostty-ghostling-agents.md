# Mitchell Hashimoto: Ghostling (libghostty demo) — 100% Agent-Written

> **@mitchellh — 2026-03-21**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/mitchellh/status/2035425239400890639) |
| Author | @mitchellh — Mitchell Hashimoto, creator of Vagrant/Terraform/Vault, founder of HashiCorp, creator of Ghostty |
| Date | 2026-03-21 |
| Topics | libghostty, Ghostty, agent-written code, Opus, Codex, CI automation, AGENTS.md, code review |
| Type | Thread |

---

## Burak's Notes

> *Mitchell Hashimoto — the creator of Ghostty, which is the rendering engine underneath cmux — just announced that libghostty's demo project (Ghostling) was 100% agent-written. This is directly relevant because cmux is our primary terminal and libghostty is the library that powers it. The fact that the Ghostty creator himself uses Opus+Codex in agent loops, references AGENTS.md, and has agents run CI fix-push loops validates our entire workflow pattern. Also notable: libghostty-vt is now available as a C API — this means any terminal/TUI project can embed Ghostty's battle-tested VT parsing. Potential future: cmux could embed libghostty-vt directly instead of wrapping the full Ghostty binary.*

---

## Key Takeaways

1. **libghostty-vt is real and embeddable** — Zero-dependency C library extracted from Ghostty providing VT parsing, terminal state management, and renderer state management. Ghostling demonstrates a full terminal emulator in a single C file using Raylib for rendering. 642 stars already.
2. **100% agent-written demo project** — Hashimoto used Opus+Codex agents to write every line of Ghostling including Nix flakes and GitHub Actions CI. He reviewed manually and "constantly nudged agents in the right direction."
3. **Agent CI fix-push loop** — Had agents sit in a `gh` CLI loop watching CI failures, fixing, pushing, iterating. Calls this "the only way I stay sane" for GitHub Actions work. This is exactly our orchestrator's WAIT_FOR_PR -> REVIEW-FIX loop.
4. **AGENTS.md as style guide** — Comment-heavy style was explicitly configured in AGENTS.md, not an AI artifact. Points critics to the file. Validates AGENTS.md as the canonical agent configuration convention.
5. **"Good enough" quality bar** — "If an engineer I worked with PRed all this, I would've accepted it." Pragmatic acceptance criteria, not perfection.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Ghostty is the rendering engine under cmux (our primary terminal, scored 10/10 in catalogue). libghostty-vt as embeddable C library opens future integration paths. Hashimoto's agent workflow (Opus+Codex, AGENTS.md, CI loops) mirrors our orchestrator pattern exactly. 172K followers amplifying agent-first development to infra/DevOps audience. |

---

## Full Content

**Post 1/1 (thread):**

Btw, for Ghostling (libghostty demo), I didn't write a single line of... anything. Agents wrote 100% of everything you see incl. Nix flakes, CI jobs, etc. I reviewed every line of code manually and constantly nudged the agents in the right direction. I used a mix of Opus+Codex.

Note: libghostty itself is of course heavily hand written (with agent assistance all over too, though). I'm just talking about Ghostling itself.

Even for CI setup (GitHub actions), I had the agent sit in a `gh` CLI loop watching failures, fixing, pushing, fixing, pushing, etc. Doing GHA with agents are the only way I stay sane, honestly.

I just re-read the full main.c from top to bottom and I'm very satisfied. I would've done some things differently but if an engineer I worked with PRed all this, I would've accepted it. Its good enough.

Some people have pointed out the commenting is over the top and indicative of AI. This is actually my personal comment style, and I told the agent to comment heavily (its even in the AGENTS.md, look for yourself!). Anyone who has worked with me professionally or in OSS knows that I comment everything all the time.

**Engagement:** 614 likes, 38 retweets, 65 replies, 215 bookmarks, 70.9K views

**Media:** 1 screenshot (1172x4096px) — likely code or AGENTS.md excerpt

---

## Notable Replies

> Replies not available via API extraction. Given 65 replies and Hashimoto's 172K follower base, likely contains valuable discussion from terminal/DevOps practitioners about agent-written infrastructure code quality and libghostty adoption.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/ghostty-org/ghostling | Ghostling repo — the 100% agent-written libghostty demo; single-file C terminal emulator; 642 stars | `/tool-catalogue` |
| https://github.com/ghostty-org/ghostty | Ghostty main repo — 48.1K stars, Zig terminal emulator; libghostty-vt source | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Ghostty | Terminal emulator by Hashimoto; libghostty extracted from it | [Yes](../../infrastructure/libghostty.md) |
| libghostty / libghostty-vt | Zero-dependency embeddable terminal library (C API) | [Yes](../../infrastructure/libghostty.md) |
| Ghostling | Demo project for libghostty; 100% agent-written | Referenced in [libghostty](../../infrastructure/libghostty.md) |
| Opus (Claude) | Used alongside Codex for agent coding | Yes (referenced throughout) |
| Codex (OpenAI) | Used alongside Opus for agent coding | Yes (referenced throughout) |
| AGENTS.md | Convention file for agent configuration | [Yes](../agent-protocols/agents-md.md) |
| cmux | Built on Ghostty; our primary terminal | [Yes](../developer-gui/cmux.md) |
| GitHub Actions | CI automated via agent fix-push loops | N/A |
