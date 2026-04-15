# Giving the Keys to My Life to OpenClaw

> **Radik Shankovich (OpenClaw maintainer) — AI Engineer Europe 2026 (London), 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=11570s |
| Speaker | Radik Shankovich, OpenClaw maintainer |
| Event | AI Engineer Europe 2026 (London) |
| Duration | ~20:00 |
| Date | 2026-04-09 |
| Topics | personal agents, incremental trust, Obsidian knowledge base, ambient operations, attention filtering, critical rules MD, markdown memory, soul.md, Discord agent interface, OpenClaw, personal productivity |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Incremental trust is the only safe on-ramp to a life-scale agent** — Radik never took a "big leap" of access. He started with a WhatsApp chat (just messages in, messages out) and added one small capability at a time: Telegram, Discord, email read, email write, calendar read, calendar write, file access, OS access, persistent memory. When something broke, he stepped back exactly one step, diagnosed why, and added a guardrail before moving forward. Because every increment was small, the system never "completely bricked."

2. **A 3,000-note Obsidian vault is the force multiplier that makes the agent useful** — The real unlock isn't the model or the tools, it's the accumulated personal corpus. Work notes, tasks, projects, research, articles, and an inbox of links — all in markdown, all searchable with multiple retrieval strategies (QMD search, memory, dedicated memories). Radik cited Karpathy's LLM knowledge base tweet and said "that's exactly what I have."

3. **The Obsidian graph IS the agent's long-term memory** — He showed a real screenshot of his 3,000-node vault. Big clusters are active projects; one-off nodes are bookmarks. When anything new lands in the inbox (link, tweet, thread, article, video), the agent tags it, adds context, looks for related notes already in the vault, and writes back-links. Crucially, adding a new bookmark surfaces forgotten related nodes — the agent becomes a memory defibrillator for things Radik had already researched once.

4. **Nightly ambient operations at 4am keep the system fresh** — A systemd-style service on his Mac runs every night: indexes the vault, refreshes QMD/memory/Obsidian indexes, backs everything up, updates OpenClaw to the latest version via custom scripts that know what breaks, why it breaks, and how to verify before restart. "Fresh and ready for me as I get up." The key phrase: custom update scripts, not blind `upgrade --latest`.

5. **Five-type job taxonomy for a personal agent** — Radik classified every job his agent performs into five buckets:
   - **Ambient operations** — plumbing, updates, backups, indexing
   - **Attention filtering** — urgent/important surfacing with full context attached
   - **Execution support** — drafting replies using email + project context the agent already has
   - **Synthesis** — knowledge base building from the inbox (tagging, linking, summarizing)
   - **Proactive suggestions** — morning briefings and wake-up alerts

6. **Attention filtering prevented real financial and operational damage** — Concrete examples: Netflix payment failure detected and fixed within 5 minutes; domain renewal email that would have been missed caught and handled; customer emails already drafted in the drafts folder with project context when Radik arrived at his laptop. These are not toy demos — they are the ROI justification for the whole stack.

7. **Discord as the unified agent UI, with one channel per context** — Radik routes everything through a private Discord server with channel-per-purpose: General (open conversations, experiments), Inbox (link drops → knowledge base building), Consulting (client projects with attached context), Video Research (YouTube research for the next episode), Briefing (morning digests), Instagram (social posting), YouTube (video creation), OpenClaw (maintainer work), Playground (testing new models / workspaces / memory configs). The channel is the context scoper.

8. **Architecture has three working parts, not one** — (a) **LLM for judgment** — understanding, connections, context building; (b) **Files, tools, scripts** — deterministic if-this-then-that that skips the LLM entirely; (c) **Optimized memory / soul.md** — agent identity and rules. He added a dedicated "critical rules MD" file placed high in the context hierarchy because the agent kept forgetting important constraints. Markdown files are everywhere — inspectable, editable, human-readable, versionable, and they just work.

9. **Memory evolution: one file → folder → dreaming/promoting** — Radik walked through his memory lifecycle. Started with a single `memory.md`. It grew too big, so it became a folder with files per topic. Then he added a "dreaming" step — an ambient job that promotes frequently-used memories up the hierarchy and demotes stale ones. Without active maintenance, bad memory compounds: "brittle automations break, noisy nodes accumulate, weak boundaries in soul files let the agent drift."

10. **The Past/Present/Future Me philosophy reframes agent ROI** — Radik's closing frame: "Past me is stupid, lazy, didn't do anything. Present me has to do everything for past me. Future me is a godlike creature, all-powerful." The job of the agent is to become friends with future me and treat future me as a person to help. "I don't need to do as much as I used to because my agent helps future me as much as possible." This is a useful mental model for deciding which automations are worth building — does it help future me, or does it just amuse present me?

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | HIGH for personal productivity use of agents — lower for our specific enterprise/multi-agent orchestrator focus. But four patterns transfer directly: (1) incremental trust is exactly the right frame for how we add tools/permissions to the L-Thread workers; (2) markdown-first memory with critical-rules-MD mirrors our `.claude/agents/orchestrator.md` + `CLAUDE.md` hierarchy; (3) nightly ambient operations map to our not-yet-built cron layer for catalogue indexing, state backup, and harness updates; (4) the 5-job taxonomy is a useful prompt for classifying what work the orchestrator should be doing beyond just coding agents. |
| **Novelty** | 6/10 | Nothing individually new — Obsidian-as-memory, Discord-as-UI, markdown-first, soul.md are all in the catalogue (Greg Isenberg, Rick Mulready, Cole Medin, Mark Kashef, Ballred, Omar Sanseviero). What IS novel: the 5-job classification, the explicit "critical rules MD" recovery pattern for agent forgetfulness, the "dreaming/promoting" memory lifecycle, and the Past/Present/Future Me ROI frame. Radik is also one of the few OpenClaw maintainers on stage, which gives the talk maintainer credibility. |
| **Actionable** | 7/10 | Immediately actionable patterns: (1) add a `critical-rules.md` high in the orchestrator's context hierarchy for constraints that keep getting forgotten (we already have this de facto in `.claude/agents/orchestrator.md` — could formalize); (2) formalize the "step back exactly one step" recovery rule in `/roadblock-recovery`; (3) classify orchestrator jobs with the 5-type taxonomy to identify gaps (we're heavy on execution support, light on ambient ops, missing attention filtering entirely); (4) plan a nightly 4am cron for catalogue indexing + state backup + harness version bump with pre-verified custom update scripts. |

---

## Summary

Radik Shankovich, an OpenClaw maintainer who became a contributor after hitting errors with early PRs, opened his AI Engineer Europe 2026 talk with a confession: "I didn't realize how sophisticated my setup became." What started as a single WhatsApp chat with his agent grew, one small step at a time, into a system that has the keys to his entire life — email, calendar, notes, files, the OS, persistent memory. The talk is a case study in how that happened without disaster.

**The incremental trust approach is the spine of the talk.** Radik was never tempted to grant broad access in a single step. Each capability — Telegram on top of WhatsApp, then Discord, then email read, then email write, then calendar, then file system, then OS commands — was added only after the previous layer had been stable for a while. Critically, when something broke, his recovery rule was "step back exactly one step, fix it, understand why, and add a guardrail to prevent recurrence." Because every increment was small, the blast radius of any failure was bounded. "It never completely bricks because of the incremental approach."

**The Obsidian knowledge base is the force multiplier.** Radik showed a screenshot of his 3,000-note vault graph — big clusters for active projects, one-off nodes for bookmarks. Work notes, personal notes, tasks, research, articles, an inbox of links. All markdown, all searchable with multiple strategies (QMD search, memory stores, dedicated memories). He cited Karpathy's recent LLM Knowledge Bases tweet and said "that's exactly what I have." When anything new lands in the inbox — a link, a tweet, a thread, an article, a video — the agent takes it, analyzes it, adds tags and context, looks at what's already in the vault on that topic, and writes back-links. A nice emergent behavior: adding a new bookmark often surfaces a forgotten related note, making the agent a memory defibrillator for things Radik had already researched once.

**Nightly ambient operations run at 4am.** A systemd-style service on his Mac indexes everything, refreshes all the indexes (QMD, memory, Obsidian vault), backs everything up, and updates OpenClaw to the latest version via custom scripts that know what breaks, why, and how to verify before restart. Not `upgrade --latest` — hand-written update scripts with pre-flight checks. "Fresh and ready for me as I get up."

**The five-job taxonomy structures what the agent actually does.** Radik classified every job into five buckets: **Ambient operations** (plumbing, updates, backups), **Attention filtering** (urgent/important surfacing with full context), **Execution support** (drafted replies with project context already attached), **Synthesis** (knowledge base building from the inbox), and **Proactive suggestions** (morning briefings and wake-up alerts). Real examples from attention filtering: a Netflix payment failure caught and fixed within 5 minutes; a domain renewal email that would have been missed, picked up, notified, and renewed; customer emails already drafted in the drafts folder with project context when he opened his laptop.

**Discord is the unified agent UI.** Every use case has its own channel: General, Inbox, Consulting (client context), Video Research, Briefing, Instagram, YouTube, OpenClaw (maintainer), Playground (testing new models / memory configs / workspaces). The channel itself scopes the context the agent uses.

**Three working parts, not one.** Radik insisted the architecture has three: (1) **LLM for judgment** — understanding, context, connections; (2) **Files, tools, scripts** — if-this-then-that that skips the LLM entirely for deterministic jobs; (3) **Optimized memory / soul.md** — agent identity and rules. He added a dedicated "critical rules MD" file placed high in the hierarchy because the agent kept forgetting important constraints. Markdown everywhere — inspectable, editable, human-readable, versionable, and it just works. Memory evolved from a single file to a folder to a "dreaming/promoting" step where ambient jobs rank memories by usage and promote/demote them.

**What gets hard as the system grows.** Bad memory compounds — active maintenance is mandatory as the vault passes a few thousand notes. Brittle automations break — keep them simple or add guardrails. Noisy nodes accumulate — clean regularly. Weak boundaries in the soul file let the agent drift.

**The closing frame is a philosophy.** Radik invoked Past Me, Present Me, and Future Me. "Past me is stupid, lazy, didn't do anything. Present me has to do everything for past me. Future me is a godlike creature, all-powerful. The job of my agent is to become friends with future me and treat future me as a person to help. I don't need to do as much as I used to because my agent helps future me as much as possible." The takeaway he left the audience with: "Do what I did — start with one recurring pain, grow trust incrementally. Build the knowledge base. Move as much as you can to markdown. Optimize for the future you."

---

## Notable Quotes

> "I didn't realize how sophisticated my setup became." — opening

> "One small step at a time. If something breaks, step back one small step, fix it, understand why, and prevent recurrence. It never completely bricks."

> "Do what I did — start with one recurring pain, grow trust incrementally."

> "Build the knowledge base. Move as much as you can to markdown."

> "Inspecting the system should be expectable — easy for you, done for you with OpenClaw."

> "Optimize for the future you."

> "Past me is stupid, lazy, didn't do anything. Present me has to do everything for past me. Future me is a godlike creature, all-powerful. Become friends with future me."

---

## Adoptable Patterns for Orchestrator Research

### 1. Incremental Trust Approach

**Pattern:** Never grant the agent a large new capability in a single step. Add one small capability at a time, stabilize, and only then add the next. When something breaks, step back exactly one capability, fix it, add a guardrail, and re-advance.

**Transfer to our system:**
- Apply to tool permissions and `--dangerously-skip-permissions` scope: rather than granting all tools at once, gate new tools behind a "one per week" rule and add a hook-level guard before enabling.
- Formalize "step back one step" in `/roadblock-recovery.md` as the first recovery action: identify the most recent capability/permission change, revert it, diagnose, then re-advance with a guard.
- Use the same rule for `.claude/agents/orchestrator.md` persona edits — one rule added at a time, observed in production before the next.

### 2. Obsidian Knowledge Base as Agent Memory

**Pattern:** Treat a markdown vault (Obsidian, or just a directory tree) as the agent's long-term memory substrate. Every bookmark, note, and artifact goes in. The agent reads it, tags it, backlinks it, and surfaces forgotten related nodes when something new arrives.

**Transfer to our system:**
- `research/catalogue/` IS already this vault — we have ~510 entries. The missing piece is the automatic back-linking and related-node surfacing on new ingests.
- Add an "on new ingest" step to the research librarian: before writing the sidecar, query the catalogue for topically-related existing entries and add cross-links in both directions.
- Our `ADOPTABLE-PATTERNS.md` and `INDEX.md` are flat right now — consider an Obsidian-style graph view (the `catalogue-explorer.html` is a start) to surface forgotten adjacent patterns.
- Already overlaps strongly with our existing catalogue entries on Karpathy LLM Wiki, Omar Sanseviero's Obsidian PKB, Greg Isenberg + Vin, Cole Medin's second brain, Rick Mulready, Mark Kashef, Ballred — Radik is the OpenClaw-flavored variant.

### 3. Nightly Ambient Operations Pattern (4am cron)

**Pattern:** A nightly systemd/launchd/cron job runs while you sleep: refreshes indexes, backs up state, updates tooling to latest version via pre-verified custom scripts (not blind `upgrade --latest`), and leaves the system fresh for the morning.

**Transfer to our system:**
- We have NO ambient ops layer right now. The orchestrator is purely reactive/task-driven.
- Candidates for a nightly 4am job: (a) rebuild `INDEX.md` and `TIMELINE.md` from catalogue sidecars; (b) backup `_bmad/` state to a remote; (c) run `gh pr list` and `gh issue list` to pre-populate tomorrow's backlog; (d) refresh the research librarian's recent-bookmarks ingest queue; (e) pre-verified harness version bump (check Claude Code version, run a smoke test, report delta).
- Use launchd on macOS (we're on Darwin, not systemd) — write a single `.plist` in `~/Library/LaunchAgents/` that runs `.bmad/scripts/orchestrator-nightly.sh`.
- Custom update scripts with pre-flight verification is the key discipline — not "upgrade to latest and pray."

### 4. Critical Rules MD for Agent Reliability

**Pattern:** When the agent keeps forgetting important constraints, carve them out of the general memory/soul file into a dedicated `critical-rules.md` placed high in the context hierarchy. Not general identity — just the hard rules that the agent keeps violating.

**Transfer to our system:**
- We already have this de facto in `.claude/agents/orchestrator.md` ("4 Absolute Rules" section at the top). Validate that the 4 rules are placed earliest in the prompt load order.
- Consider a dedicated `critical-rules.md` as a separate file loaded as the first line of every subagent's context — isolated from the longer orchestrator prompt so it's never truncated by compaction.
- Use this pattern for recurring failure modes surfaced in `_bmad/devlog.md`: when a class of violation repeats, promote it to `critical-rules.md` rather than burying it deeper in orchestrator.md.
- Parallels `SOUL.md` + `USER.md` + `MEMORY.md` layering from Cole Medin's AI Second Brain talk — critical-rules.md would be the highest-priority layer.

### 5. Five Job Types Classification

**Pattern:** Classify every job the agent performs into five mutually exclusive buckets: Ambient Operations, Attention Filtering, Execution Support, Synthesis, Proactive Suggestions.

**Transfer to our system:**

| Job Type | Our System Today | Gap |
|----------|------------------|-----|
| **Ambient operations** | None — no nightly job, no background indexing | BUILD — launchd nightly script (see Pattern 3) |
| **Attention filtering** | None — orchestrator only reacts to `/orchestrator` start | BUILD — agent watches `gh notifications`, dependabot, CI failures, client email, and surfaces urgent + important items with full context attached |
| **Execution support** | HEAVY — this is essentially all we do (spawn workers, PR review, E2E) | OPTIMIZE — already the core loop |
| **Synthesis** | PARTIAL — research librarian does ingestion, but no automatic cross-linking | EXTEND — add back-linking + related-node surfacing on new ingests (see Pattern 2) |
| **Proactive suggestions** | None — no morning briefing, no wake-up alerts | BUILD — nightly job composes `_bmad/morning-briefing.md` with overnight PR status, blocked workers, roadblocks, and recommended next tasks |

**Action item:** Add this table to `_bmad/orchestrator-roadmap.md` (or similar) as a planning frame for which patterns from the catalogue should land first. We're overweight on execution support and have zero coverage of three of the five buckets.

---

## Relevance for Orchestrator Research

This is a **personal productivity** agent talk, not an enterprise multi-agent orchestration talk. The direct transfer is limited because our L-Thread orchestrator is fundamentally different in scope (it spawns ephemeral coding workers for PR lifecycles, not a persistent life-assistant).

That said, **four patterns port cleanly** and are worth adopting:

1. **Incremental trust as a hard recovery rule** — formalize "step back one step" in `/roadblock-recovery`.
2. **Catalogue-as-Obsidian-vault with auto back-linking** — extend the research librarian to cross-link on new ingest.
3. **Nightly 4am ambient ops via launchd** — we have none; this is a missing capability, not an optimization.
4. **Five-job classification** — use as a gap-analysis frame for planning which future capabilities to add.

Radik's specific stack (OpenClaw + Obsidian + Discord) is not a transfer target for us (we're Claude Code + tmux + cmux + GitHub). But the **philosophy** — incremental trust, markdown-first memory, ambient operations while you sleep, critical-rules.md as a separate high-priority file, optimize for future you — is directly portable to any agent system.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/openclaw/openclaw | OpenClaw repo itself — to understand the harness Radik maintains and compare to our orchestrator primitives | `/ingest-tool` |
| https://x.com/karpathy (LLM Knowledge Bases tweet) | Already catalogued — this is the conceptual foundation Radik explicitly referenced; cross-link from Radik's entry | already in catalogue |
| (Radik's soul.md / critical-rules.md templates if published) | Reference templates for the dedicated critical-rules.md pattern | `/ingest-article` |
| (OpenClaw update-script examples if published) | Reference for pre-verified custom update scripts vs blind upgrades | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenClaw | The personal agent harness Radik maintains and entrusts his life to | Partial (referenced in multiple posts — Malte Ubl keynote, Theo Browne talk, Felixba satire, Matt Shumer post, mattshumer-memory-systems-openclaw-hermes, better-openclaw sidecar; no dedicated tool entry yet) |
| Obsidian | 3,000-note markdown vault as the agent's long-term memory | Yes (multiple entries — steph-ango-obsidian-ceo-notes, greg-isenberg-vin-obsidian-claude-code, cole-medin-ai-second-brain, rick-mulready-ai-system, mark-kashef-obsidian-dream) |
| Discord | Unified agent UI with channel-per-context scoping | Partial (referenced in other personal agent setups) |
| QMD search | Query engine across the vault (one of several retrieval strategies Radik uses) | No |
| WhatsApp / Telegram | Earliest-stage agent UI before Discord | No |
| launchd / systemd | Nightly ambient ops job runner (Mac) | No (implicit — we're on Darwin) |
| Karpathy LLM Wiki / Knowledge Bases | Explicitly cited — "that's exactly what I have" | Yes (`posts/2026-04/karpathy-llm-wiki-knowledge-bases.md`, 10/10 relevance) |
| soul.md / memory.md / critical-rules.md | Agent identity and constraint files | Partial (soul.md referenced in Felixba, Cole Medin uses SOUL.md/USER.md/MEMORY.md layering) |

---

## Action Items

- [ ] Add "incremental trust / step-back-one-step" as the first rule in `.claude/commands/roadblock-recovery.md`
- [ ] Sketch `.bmad/scripts/orchestrator-nightly.sh` + launchd plist for a 4am ambient ops job (index rebuild, state backup, harness version check)
- [ ] Extend research librarian prompt so that new ingests automatically query for related catalogue entries and add cross-links in both directions
- [ ] Add the 5-job-classification gap table to `_bmad/orchestrator-roadmap.md` as a prioritization frame
- [ ] Evaluate whether to extract a dedicated `critical-rules.md` from `.claude/agents/orchestrator.md` and load it first in every subagent's context
- [ ] Consider a dedicated OpenClaw tool entry in the catalogue now that multiple talks have referenced it as a first-class harness
