# WarCraft 3 Sounds for Claude Hooks — "How to Become 10x Engineer"

> **@JorgeCastilloPr — 2026-02-17**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/JorgeCastilloPr/status/2023779881113579776) |
| Author | [@JorgeCastilloPr — Jorge Castillo, Android developer at Disney+, formerly at X](https://x.com/JorgeCastilloPr) |
| Date | 2026-02-17 |
| Topics | claude-code, hooks, developer-experience, productivity, audio-feedback |
| Type | Single post with video |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Claude Code hooks as a DX extension point** — The post demonstrates using Claude Code's hook system (PreToolUse, PostToolUse, etc.) to trigger custom audio notifications (WarCraft 3 sound effects) when the agent finishes a task or needs permission. This is a creative, non-obvious use of hooks beyond linting and security gates.
2. **Hooks enable ambient awareness of agent state** — Instead of watching the terminal, audio cues let you context-switch to other work and get called back only when the agent needs attention. This maps directly to the orchestrator pattern of polling agent state — audio hooks are the human equivalent.
3. **Viral proof that hooks are the DX killer feature** — 5.1K likes, 804K views, 236 replies on a seemingly trivial post. The engagement signals that the community is hungry for practical, fun hook examples — not just security/lint gates. Hook customization is an adoption driver.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly demonstrates Claude Code hook system creativity; validates hooks as first-class DX surface; aligns with our hook-heavy orchestrator architecture (PreToolUse, PostToolUse gating, session lifecycle); the "ambient awareness" pattern maps to our tmux capture-pane polling — audio feedback is the human-side equivalent |

---

## Full Content

> How to finally become the 10x engineer: Add WarCraft 3 sounds to Claude hooks to get alerts when it finishes a task or needs permission.

The post includes a 48.8-second video (originally published by @delba_oliveira) demonstrating the setup in action — WarCraft 3 sound effects playing as Claude Code completes tasks and requests permissions.

**Engagement:** 5,147 likes · 374 retweets · 236 replies · 804,521 views

---

## Notable Replies

[236 replies reported but not directly accessible via API. Given the high reply count and the viral nature, the thread likely contains implementation details, alternative sound packs, and links to hook configuration examples.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| (none discovered) | Video was embedded media, no external URLs in the post | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The AI coding agent whose hook system is being customized | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Claude Code Hooks | PreToolUse/PostToolUse lifecycle hooks used to trigger audio | Yes — [Hook Event System Comparison](../../reference/hook-event-system-comparison.md) |
