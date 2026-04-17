# Agentic Stack

> **"One brain, many harnesses." A portable `.agent/` folder (memory + skills + protocols) that plugs into Claude Code, Cursor, Windsurf, OpenCode, OpenClaw, Hermes, or DIY Python — and keeps its knowledge when you switch.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness (cross-harness skill/memory substrate) |
| Repository | https://github.com/codejunkie99/agentic-stack |
| GitHub Stars | 217 (as of 2026-04-17) |
| Forks | 28 |
| Publisher | @AV1DLIVE (codejunkie99) — solo, Twitter handle on repo |
| License | MIT |
| Tech Stack | Python (primary), JSONL lessons store, Homebrew tap + PowerShell installer, optional FTS memory search (BETA) |
| Maturity | 🟡 Early (last push 2026-04-17, active) |
| Last Analyzed | 2026-04-17 |

---

## Burak's Notes

> *This is the same design space as Koylan Skills, SkillKit, GBrain's THIN_HARNESS_FAT_SKILLS, and Karpathy's LLM Wiki — "portable brain across harnesses". The differentiator here is the **host-agent review loop with mandatory `--rationale`** on graduation. "Rubber-stamping is structurally impossible." That maps 1:1 onto our lesson-curation problem. Cross-check against our BMAD skills and the `/research-librarian` graduation pattern for ADOPTABLE-PATTERNS.md. Author is unknown (@AV1DLIVE, not on our practitioner list yet) — worth tracking.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses cross-harness skill portability (Claude Code + OpenClaw + Hermes are all on our radar). Master Blueprint Principle 1 (orchestration as compounding asset) + Principle 7 (build only what we've needed in last 30 days) both fit. Matches the Harness Convergence Wave thesis — general harness is commodity, skills + memory are the moat. |
| **Novelty** | 6/10 | Portable `.agent/` idea is now industry-standard (AGENTS.md, Koylan, GBrain, SkillKit). Novel pieces: mandatory `--rationale` on graduation, `auto_dream.py` nightly mechanical staging, 4-tier memory (working/episodic/semantic/personal), failure-rewrite flag (3 failures / 14 days). |
| **Actionable** | 7/10 | MIT license, Python, 1-day evaluation. The graduation CLI (`graduate.py <id> --rationale`) is a 50-line drop-in for our ADOPTABLE-PATTERNS curation. Homebrew installer is a nice pattern too. |

---

## Overview

Agentic Stack ships a `.agent/` directory containing four things: **memory layers**, **skills**, **protocols**, and **host-agent review tools**. The core claim: the same folder plugs into 7+ harnesses (Claude Code, Cursor, Windsurf, OpenCode, OpenClaw, Hermes, standalone Python) and *keeps its knowledge* when you switch. Each harness adapts via a thin config shim (e.g. `CLAUDE.md` for CC, `.cursor/rules/*.mdc` for Cursor, `AGENTS.md` for Hermes).

The knowledge-compounding loop is mechanical on the ingest side and reasoning-gated on the graduation side:

1. Skills log actions to `episodic/` memory during sessions.
2. Nightly `auto_dream.py` clusters patterns into candidate lessons (no network, no git commits — safe unattended).
3. A **host agent** reviews each candidate via CLI and must pass `--rationale "<why>"` to graduate it into `lessons.jsonl` (the semantic-memory source of truth).
4. Future sessions auto-load relevant lessons.
5. Skills that fail 3+ times in 14 days flag for rewrite.

The phrase that captures the design: *"rubber-stamping is structurally impossible"* — because graduation demands a rationale and the git history of `.agent/memory/` becomes the agent's autobiography.

---

## Technical Architecture

### Memory (4 tiers)

| Tier | Retention | Purpose |
|------|-----------|---------|
| `working/` | Session | Immediate scratch context |
| `episodic/` | Timestamped log | Action history for clustering |
| `semantic/` | `lessons.jsonl` (append-only) | Graduated, reasoned lessons (source of truth) |
| `personal/` | Stable | User preferences (first file the agent reads each session) |

### Skills (progressive disclosure)

- Lightweight manifest always loads.
- Full skill doc loads only when task triggers match.
- Five seed skills ship by default: `skillforge` (generates new skills), `memory-manager`, `git-proxy`, `debug-investigator`, `deploy-checklist`.

### Protocols

- Typed tool schemas.
- Permission enforcement.
- Sub-agent delegation contracts.

### Host-Agent Review CLI

```bash
python3 .agent/tools/list_candidates.py
python3 .agent/tools/graduate.py <id> --rationale "reason"   # rationale REQUIRED
python3 .agent/tools/reject.py <id> --reason "why"
python3 .agent/tools/reopen.py <id>
```

### Harness Adapters

| Harness | Config File | Hook Support |
|---------|-------------|--------------|
| Claude Code | `CLAUDE.md` + `settings.json` | Full |
| Cursor | `.cursor/rules/*.mdc` | Manual reflects |
| Windsurf | `.windsurfrules` | Manual reflects |
| OpenCode | `opencode.json` | Partial |
| OpenClaw | System-prompt include | Varies |
| Hermes | `AGENTS.md` | Partial |
| Standalone Python | `run.py` | Full control |

### Onboarding Wizard

Populates `.agent/memory/personal/PREFERENCES.md` with: user name, primary languages, explanation style, test strategy, commit conventions, review depth. "First file your AI reads at the start of every session."

### Nightly Cron

```bash
0 3 * * * python3 /path/to/project/.agent/memory/auto_dream.py >> dream.log 2>&1
```

Mechanical clustering only — no reasoning, no network, no commits. Safe to run unattended.

---

## Publisher Background

- GitHub handle: `codejunkie99`.
- Twitter/X: [@AV1DLIVE](https://twitter.com/AV1DLIVE).
- Not yet in our practitioners catalogue.
- Solo project (28 forks, 217 stars) — early-stage but active (pushed today 2026-04-17).
- MIT licensed, installable via Homebrew tap + PowerShell, suggesting intent to reach non-technical users.
- No public track record visible from repo metadata; bears watching as harness-portability becomes commoditized.

---

## What's Valuable for Us

1. **`graduate.py --rationale` pattern** — our ADOPTABLE-PATTERNS.md curation currently relies on me (Burak) deciding mid-session whether to promote. Lifting their CLI (a stage/review/graduate-with-rationale loop) into our `/research-librarian` skill would make the promotion auditable. Appendable to `_bmad/ingest-ledger.json` as a new `graduation_log` field.

2. **4-tier memory taxonomy** (`working/episodic/semantic/personal`) — validates CASS Memory System's 3-layer cognitive model already catalogued. Adds a 4th tier (`personal/`) that is literally `PREFERENCES.md`. Our `CLAUDE.md` already serves this role but the *separation* is interesting for multi-user setups (future: giving each client their own `personal/`).

3. **Mechanical-only nightly staging** (`auto_dream.py`) — no reasoning, no git, no network. Principle 2 match (deterministic orchestration, LLM execution): clustering/staging is mechanical, graduation (reasoning) is LLM-in-the-loop. The split is the right one.

4. **Skill failure-rewrite flag** (3 failures / 14 days → flag) — deterministic signal that a skill is broken. Transferable to our BMAD skills.

5. **Cross-harness portability as a shipping artifact** — we've been sketching this (MC research mentioned CLAUDE.md + AGENTS.md unification). Agentic Stack ships it with a concrete adapter table. Steal the adapter map for our own `.agent/` migration if/when we need Cursor/Windsurf parity.

6. **Homebrew + PowerShell installer pattern** — lowers adoption friction. If we ever package the orchestrator or MC for wider use, this is the template.

---

## What's NOT Relevant

- **Full adoption as our harness** — we run Claude Code + tmux + worktrees + BMAD skills. Adopting `.agent/` wholesale means rewriting our skill system. Not worth it.
- **"One brain across all harnesses" goal** — we're Claude Code–native and happy. Principle 3 (context is zero-sum) argues against optimising for portability we don't need in the next 30 days.
- **Optional FTS memory search (BETA)** — our Obsidian/catalogue stack already does semantic retrieval. Skip.
- **Python runtime as primary** — we're TS/Bash/CC-native. The Python host-agent CLI would need reimplementation in Bash + `jq` to fit. Doable but cost is real.

---

## Future Use Cases

- **Phase 1 (now)**: lift the `graduate.py --rationale` pattern into `/research-librarian` ADOPTABLE-PATTERNS workflow. 2-4h task.
- **Phase 2 (Day 30-60)**: if MC Nag Agent graduates a lesson loop, adopt the `auto_dream.py` mechanical-staging split as architecture. Prevents Nag Agent from "reasoning itself into rubber-stamping."
- **Phase 3 (Day 60-90)**: if we ever need Cursor/Windsurf parity for client work, lift the adapter table.
- **Phase 4 (Day 90+)**: if we productize the orchestrator, the Homebrew + PowerShell installer pattern becomes the distribution template.

---

## Key Takeaway

> **Rubber-stamping is structurally impossible because graduation requires a `--rationale` — that single CLI constraint is the cleanest lesson-curation primitive we've seen, and it's a 50-line port to our `/research-librarian` pipeline.**
