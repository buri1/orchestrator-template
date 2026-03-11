# ECC v1.8.0 — "A Complete Agent Harness System"

> **@affaanmustafa (cogsec) — 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/affaanmustafa/status/2030716164817711140) |
| Author | @affaanmustafa (Affaan Mustafa, aka cogsec) — Anthropic hackathon winner, creator of Everything Claude Code (ECC) |
| Date | 2026-03-08 |
| Topics | agent-harness, claude-code, slop-guard, eval-driven-quality-gates, bounded-loop-control, cross-harness-parity |
| Type | Quote-thread |

---

## Burak's Notes

> *68.6K stars — this is the most-starred Claude Code agent harness by a massive margin. 16 agents, 65+ skills, 40+ commands, AgentShield security scanner. v1.8.0 introduces slop guard + eval-driven quality gates + bounded loop control — these are the exact runtime-level guardrails we need. Their hook architecture (SessionStart/SessionEnd with runtime gating via env vars) is more mature than ours. Cross-harness parity across CC/Cursor/OpenCode/Codex is interesting — they're not betting on one tool. Worth a full tool catalogue entry for ECC itself.*

---

## Key Takeaways

1. **ECC has graduated from "setup repo" to "agent harness system"** — v1.8.0 adds runtime-path guardrails (slop guard, eval-driven quality gates, bounded loop control) that move it from configuration files into active agent governance. 68.6K stars, 997 internal tests passing.
2. **Slop guard as a runtime concern** — Not just prompting against slop; this is enforcement at the harness level. Eval-driven quality gates mean write-time verification loops with configurable graders — similar to our E2E testing gate but more granular.
3. **Bounded loop control** — Prevents runaway agent loops at the runtime path, not just via prompt instructions. This is the deterministic control layer (70/30 pattern) applied to loop safety.
4. **Cross-harness parity** — ECC now targets Claude Code, Cursor, OpenCode, and Codex with tightened behavioral consistency. One harness definition, multiple runtimes.
5. **Hook architecture is production-grade** — SessionStart root fallback, stop-phase session summaries, runtime gating via `ECC_HOOK_PROFILE` (minimal/standard/strict) and `ECC_DISABLED_HOOKS` env vars. Script-based hooks replacing fragile inline one-liners.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses agent harness engineering, quality gates, loop control, and cross-platform agent deployment — core to our orchestrator architecture. The slop guard and eval-driven quality gate patterns are immediately adoptable. 68.6K stars validates massive community demand for structured agent governance. |

---

## Full Content

**@affaanmustafa (cogsec) — 2026-03-08 18:43 UTC:**

> here's what's actually BREAKING (as of today)
>
> With ECC v1.8.0 - we've moved past being just "a CC / Codex / OC / Cursor setup repo"
>
> Pushed out slop guard, eval-driven quality gates, and bounded loop control much closer to the runtime path.
>
> A complete agent harness system.

*[Includes 42-second demo video (1920x1080)]*

**Engagement:** 108 likes, 5 retweets, 9 replies, 165 bookmarks, 20.3K views

**Quoted tweet (@godofprompt — 2026-03-08):**
> Highlights @affaanmustafa winning the Anthropic hackathon, building Zenith.chat in 8 hours, then releasing 10+ months of refinement as open-source: "14+ agents, 56+ skills, 33+ commands, AgentShield security scanner" under MIT license (35,000+ stars at time of quote).

---

## Notable Replies

[Replies not accessible via API — 9 replies noted but content not available.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/affaan-m/everything-claude-code | 68.6K stars, 16 agents, 65+ skills, 40+ commands, AgentShield, hook architecture — deserves full tool catalogue entry | `/tool-catalogue` |
| Zenith.chat | Built by @affaanmustafa in 8 hours at Anthropic hackathon — product context for the author | `/ingest-article` (if public writeup exists) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Everything Claude Code (ECC) | Primary subject — v1.8.0 release with slop guard, quality gates, bounded loops | Yes — [everything-claude-code.md](../../agent-harnesses/everything-claude-code.md) |
| Claude Code | One of ECC's target runtimes | Yes — referenced throughout catalogue |
| Cursor | Cross-harness parity target | Yes — [cursor-background-agents.md](../articles/2026-02/cursor-background-agents.md) |
| OpenCode | Cross-harness parity target | Yes — [opencode.md](../agent-harnesses/opencode.md) |
| Codex | Cross-harness parity target | Yes — referenced in multiple posts |
| AgentShield | ECC's integrated security scanner (1,282 tests, 102 rules) | Not yet catalogued |
| Zenith.chat | Built by author at Anthropic hackathon in 8 hours | Not yet catalogued |
