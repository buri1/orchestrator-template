# AgentCraft — Side Panel

> **AgentCraft Docs (getagentcraft.com), 2026-04**

| Field | Value |
|-------|-------|
| Source | https://www.getagentcraft.com/docs/features/side-panel |
| Author | AgentCraft team |
| Publication | AgentCraft Docs |
| Date | 2026-04 (accessed 2026-04-11) |
| Topics | agent-gui, developer-ux, side-panel, workflow-design, heroes-metaphor |
| Read Time | 6 min |

---

## Burak's Notes

> AgentCraft is the second agent-authoring product I've seen that leans hard into a "game-like" metaphor — they call agents "heroes," tasks "missions," and files "scribed." The side panel itself is a useful reference design for our own dashboards: Chat + Git + Files tabs, vitals header with model selector + color-coded context bar, tool-use/thinking blocks, plan mode takeover, yellow-glow permission prompts (Y/N). The `@`-file autocomplete, Cmd+Enter send, and scroll management details are exactly the UX primitives I want to replicate in the cmux + orchestrator dashboard. Question: is AgentCraft running on top of Claude Agent SDK / Codex, or their own harness? Worth a follow-up on the homepage + architecture docs.

---

## Key Takeaways

1. **Three-tab side panel as the primary agent IDE** — AgentCraft collapses per-agent interaction into Chat / Git / Files tabs inside a single side panel, opened by pressing Enter on a selected agent ("hero"). This is a cleaner mental model than separate windows per agent.
2. **Agent vitals header with color-coded context bar** — Green <70%, yellow 70-90%, red >90%. Plus model selector dropdown, current activity, and last mission summary. A great at-a-glance health widget we should copy for our own worker dashboard.
3. **Tool-use + thinking blocks rendered inline** — Messages stream via WebSocket; tool calls show name + arguments; thinking blocks reveal agent reasoning. An operation ticker shows current activity ("Reading App.tsx", "Running git status...").
4. **Plan review is full-screen** — When an agent enters plan mode, the side panel takes over the full screen with markdown rendering, gold-highlighted file paths, section navigation, and a feedback textarea. Plans are first-class, not just another chat message.
5. **Permission requests use a yellow glow + Y/N hotkeys** — Instead of modal dialogs, the hero "glows yellow" when tool approval is needed; press Y to approve, N to deny. Low-friction human-in-the-loop gating.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | AgentCraft is a competing/adjacent agent-authoring tool. Their side panel is the reference design we should benchmark our future cmux + orchestrator dashboard against. The "heroes / missions / scribed" metaphor is distinctive but less important than the UX primitives. |
| **Actionable** | 8/10 | Every feature here is directly translatable to our tmux + cmux setup: vitals header, color-coded context bar, inline tool-use blocks, plan-mode takeover, yellow-glow permission prompts, `@`-file autocomplete, Cmd+Enter composer, auto-scroll with "new content" badge. Short list for our own dashboard backlog. |

---

## Summary

AgentCraft's Side Panel doc describes the "primary interface for interacting with individual agents" in their product. An agent (called a "hero") is selected in the parent view, then pressing Enter opens the side panel. The panel is split into three tabs — Chat, Git, Files — plus an always-visible Agent Vitals Header at the top.

The Vitals Header displays the hero name (clickable for rename), a model selector dropdown, a color-coded context usage bar (green/yellow/red at 70% and 90% thresholds), the current activity status, and a summary of the last completed mission. This is a compact, glanceable health widget that pulls together all the state a user needs to know about an agent without scrolling.

The Chat tab renders user messages (right-aligned), assistant markdown responses, tool-use blocks (name + arguments), and thinking blocks (agent reasoning). Messages stream in real time via WebSocket, and an operation ticker shows fine-grained activity like "Reading App.tsx" or "Running git status...". Scroll management auto-scrolls to bottom on new content, surfaces a "new content" badge when the user has scrolled up, and offers quick navigation buttons. The composer supports `@`-file autocomplete (arrow keys to navigate, Enter to select, Escape to close) and Cmd/Ctrl+Enter to send.

Advanced features include a full-screen Plan Review mode (when an agent enters plan mode) with markdown rendering, gold-highlighted file paths, section navigation, and a feedback textarea; Permission Requests surfaced by a yellow glow on the hero with Y/N hotkeys; a Git tab (Codex) grouping changes by directory with hero filtering and status labels (altered, sealed, newly scribed, destroyed) — notably using game-like vocabulary; and Handoff/Fork Citations showing links back to source heroes when agents are spawned via handoff or fork operations. External heroes get extra composer buttons for forking sessions or spawning fresh heroes.

The doc references related pages on Keyboard Shortcuts, Settings, and other AgentCraft features (Teams, Remote Access, Voice Input), suggesting a broader product surface worth a separate deep dive.

---

## Notable Quotes

> "The Side Panel is AgentCraft's primary interface for interacting with individual agents."

> "Context usage bar (color-coded: green <70%, yellow 70-90%, red >90%)"

> "When tool approval is needed, the hero glows yellow; press Y to approve or N to deny."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.getagentcraft.com/docs/features/teams | Multi-agent teams UX — how does AgentCraft coordinate multiple heroes? Likely relevant to our L-Thread multi-worker pattern. | `/ingest-article` |
| https://www.getagentcraft.com/docs/features/remote-access | Remote access model — web/cloud surface for agents? | `/ingest-article` |
| https://www.getagentcraft.com/docs/features/voice-input | Voice composer — intersects with Burak's Voice AI portfolio + ColdyAI work. | `/ingest-article` |
| https://www.getagentcraft.com/docs/keyboard-shortcuts | Full keyboard shortcut reference — useful for benchmarking our own hotkey coverage. | `/ingest-article` |
| https://www.getagentcraft.com/ | Homepage / overview — figure out what AgentCraft actually *is* and which harness it runs on top of. | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| AgentCraft | The product being documented; agent authoring tool with "heroes/missions" metaphor | No — candidate for `/tool-catalogue` once homepage/architecture is surveyed |
| Codex | Git tab is labelled "(Codex)" — unclear if this refers to OpenAI Codex or a local Codex module | Partial (Codex ecosystem tracked) |

---

## Action Items

- [ ] Run `/tool-catalogue` on getagentcraft.com homepage to classify AgentCraft (harness vs GUI vs orchestration platform)
- [ ] Extract the side panel's vitals header design as a reference for our cmux + orchestrator dashboard (color-coded context bar is the highest-value primitive)
- [ ] Port the yellow-glow + Y/N permission pattern to our own human-in-the-loop gating (replacement for --dangerously-skip-permissions)
- [ ] Benchmark AgentCraft's `@`-file autocomplete + Cmd+Enter composer against Claude Code's native composer
- [ ] Ingest the Teams doc to understand AgentCraft's multi-agent coordination model
