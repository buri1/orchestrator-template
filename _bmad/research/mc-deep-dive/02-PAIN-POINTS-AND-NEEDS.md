---
title: "Pain Points & Needs — The Human Side of Mission Control"
created: "2026-04-12"
method: "Filesystem forensics + document analysis across 8 repos, 4 Notion hubs, 46 RL Dokumente, 3 agent systems"
status: diagnostic
---

# Pain Points & Needs — The Human Side of Mission Control

## 1. What Burak Actually Said

> "Ich weiss gerade gar nicht wo die Daten leben"
> "Was jetzt von wo gezogen ist, was jetzt wo gespeichert wird"
> "Ob das jetzt ueberhaupt so der richtige Ansatz war oder ich doch einfach im Notion bleiben sollte"

These are not technical architecture questions. These are the words of someone who is **cognitively overloaded** and has lost the mental map of their own system. The question is not "how should data flow" — the question is "why do I feel lost in my own tools?"

---

## 2. The Data Sprawl — What Actually Exists (Forensic Inventory)

### 2.1 Where Burak's Data Actually Lives Today

| System | What Lives There | Last Activity | Status |
|---|---|---|---|
| **Notion (4 hubs)** | Projects, Goals, Creditors, Deadlines, Subscriptions, Content Agent, Session Logs, Genmedia ToDos | Unknown (no sync_state) | ACTIVE — Burak's actual daily driver |
| **Finance-Agent repo** (`~/Desktop/code2/Finance-agent/`) | Agent state, context, templates, 11 Notion DB mappings, email scan results | Last scan: 2026-02-13, last check: 2026-02-18 | STALE — hasn't run in ~2 months |
| **Obsidian Vault** (`~/Desktop/code2/vault/`) | 14 creditor wiki pages, 1 daily journal entry (2026-04-04), agent state | Last session: 2026-04-04 | BARELY USED — 1 journal entry, 15 total notes |
| **Mission Control SQLite** (`~/Desktop/code2/missioncontrole/`) | 13 projects, 30 tasks, 22 content items, 7 creditors, 12 deadlines, 8 agent runs | Built 2026-04-12 | SEED DATA ONLY — all `in-app` or hardcoded, no Notion sync configured, no `.env.local` exists |
| **Airtable** (`appi9eWFJmE9XS1zM`) | CraftCode leads (21 qualified companies), call notes, pipeline | Unknown | DORMANT — referenced in strategy docs but not actively queried |
| **RL Dokumente** (`~/Desktop/RL Dokumente/`) | 46 PDFs: Jobcenter, Finanzamt, BAfoeg, KfW, Gewerbeanmeldung, EKS, ELSTER | Scanned docs from 2025-05 through 2025-12 | PHYSICAL ARCHIVE — no digital workflow, just scanned PDFs in a folder |
| **CraftCode AI Documents** (subfolder of RL Dokumente) | Kalte Aktiv Projektplan, lead lists (501 rows), brand assets, scraper data | Last modified ~2025 | DORMANT — the actual sales pipeline assets, untouched |
| **Orchestrator research catalogue** (`research/catalogue/`) | 519+ entries, ingestion ledger, practitioner tracking | 2026-04-12 (active) | ACTIVE — but this is research, not operations |
| **ContentOS** (`~/Desktop/code2/ContentOS/`) | 1,051-line brand strategy, Hormozi playbooks | Created, never executed | STRATEGY-ONLY — zero videos published |
| **Multiple code repos** (`~/Desktop/code/` + `~/Desktop/code2/`) | ~30 repos across 2 directories | Various | SCATTERED — ColdyAI, production-app, LivekitDemo, EVERGABE, etc. |

### 2.2 The Overlap Problem

The same data exists in multiple places, at different freshness levels:

| Data | Location 1 | Location 2 | Location 3 | Conflict Risk |
|---|---|---|---|---|
| **Creditors** | Notion Finance Agent (9 active) | Obsidian Vault wiki (14 pages) | MC SQLite (7 rows, seed) | HIGH — Finance-Agent hasn't synced since Feb, Obsidian was a one-time dump, MC has stale seed data |
| **Projects** | Notion Buraks Lab (11 Planning) | MC SQLite (13, mostly seeded) | Obsidian (3 project notes) | MEDIUM — MC doesn't sync from Notion, Obsidian is sparse |
| **Deadlines** | Notion Finance Agent Fristen DB | MC SQLite (12, seed) | Agent-state.json (handoff list from Feb) | HIGH — the real deadlines live in Notion, everything else is snapshots |
| **Content Ideas** | MC SQLite (22 items) | ContentOS docs (strategy only) | Nowhere else | LOW — but none have been executed |
| **Agent Runs** | MC SQLite (8 runs, seed) | Finance-Agent memory (real logs) | Orchestrator telemetry | NONE — these don't overlap, they just don't connect |

---

## 3. The Real Pain Points (Ordered by Severity)

### 3.1 CRITICAL: There Is No Single Place Burak Goes to Start His Day

**The core problem is not architectural. It is behavioral.**

Burak has no morning ritual that goes: "Open X, see everything, decide what to do." Instead, his morning probably looks like:

1. Open Notion? Check Finance Agent deadlines?
2. Open terminal? Check `tmux ls` for running agents?
3. Open email? Check for Jobcenter letters?
4. Open GitHub? Check PRs?
5. Open... what?

**Evidence**: The Finance-Agent's last check was 2026-02-18 (almost 2 months ago). The daily LaunchAgent that was supposed to run at 08:00 has clearly not been running. The Obsidian vault has exactly 1 daily journal entry. Mission Control has never been opened with real data.

**Diagnosis**: Burak has built *three separate systems* that could serve as a daily dashboard (Notion, Obsidian, Mission Control) and uses *none of them consistently*.

### 3.2 HIGH: The Finance Situation Is Tracked in Theory, Ignored in Practice

The Finance-Agent was a beautiful system — Notion DBs, email scanning, escalation tracking, templated letters. But the agent-state.json tells the real story:

- Last scan: 2026-02-13
- Last check: 2026-02-18
- Open todos from February include "3 Stundungsantraege SENDEN" marked as overdue
- The handoff says "Burak muss JETZT die 3 verbliebenen Stundungsantraege senden"

**That was 2 months ago.** The system was built, the data was structured, the agent ran its checks... and then Burak stopped engaging with it. The Mitwirkungsschreiben from 16.12.2025 (due 02.01.2026) is still flagged as "Status unklar" in the April 2026 strategic brief.

**Diagnosis**: The problem is not "where does the data live" — the data lives in Notion and it's well-structured. The problem is that Burak builds systems to manage problems, then gets pulled into building the NEXT system before the first one delivers value.

### 3.3 HIGH: Building Tools Has Become a Coping Mechanism for Avoiding Action

A pattern emerges from the filesystem:

| Month | What Burak Built | What Burak Needed to DO |
|---|---|---|
| Feb 2026 | Finance-Agent (7 Notion DBs, email scan, /check, /draft) | Send 3 overdue letters, fix credit card, file USt Q3 |
| Mar 2026 | Orchestrator v3, OmniPort-HH UI overhaul, 519 research entries | Continue OmniPort delivery, close Kalte Aktiv deal |
| Early Apr | Obsidian vault + wiki, ContentOS strategy (1,051 lines) | Publish first video, check Jobcenter status |
| Apr 12 | Mission Control v2 (5 modules, seeded, no Notion sync) | Start content, send Kalte Aktiv email, USt-VA Q1 |

Each system is genuinely useful in concept. But each one is built to ~80% and then abandoned when the next system catches attention. The Finance-Agent never got its email triggers. The Obsidian vault got 1 journal entry. Mission Control has no `.env.local` — meaning Notion sync was never even attempted.

**Diagnosis**: The question "should I stay in Notion" is really asking: "Am I productive, or am I just building infrastructure that makes me FEEL productive?"

### 3.4 MEDIUM: The 50-Day Clock Changes the Calculus Entirely

Einstiegsgeld ends 2026-05-31. The Kooperationsplan demands "erste Vertraege mit Kunden." The strategic brief identifies Kalte Aktiv Team GmbH as the hottest lead with a 25K EUR project plan from April 2025.

The Kalte Aktiv project plan PDF sits in `~/Desktop/RL Dokumente/CraftCode AI Documents/`. The 501-row lead list sits next to it. The CraftCode Airtable has 21 qualified companies with call notes.

None of these have been touched. Not in Mission Control. Not in a CRM. Not in an email draft. They sit in a folder and an Airtable.

**What Burak needs in the next 50 days is not a better dashboard. It is:**
1. An email to Kalte Aktiv (5 minutes)
2. A USt-Voranmeldung (2 hours in ELSTER)
3. A check on Jobcenter.digital (30 minutes)
4. A published video (1 day)

None of these require Mission Control.

### 3.5 LOW-MEDIUM: Genuine "Where Does It Live" Confusion

There IS a real version of the data-location problem, separate from the avoidance pattern:

- **Jobcenter deadlines** live in scanned PDFs, Notion Fristen, and the Finance-Agent handoff — but no single place shows "what is overdue RIGHT NOW"
- **Client pipeline** lives in Airtable (21 leads) but also in Notion CraftCode hub and also in PDF project plans — no single view of "who should I contact this week"
- **Content plan** lives in ContentOS (strategy), MC SQLite (ideas), and Notion Content Agent — but zero published items
- **Subscriptions** live in Notion Abos DB but also in scattered email receipts — the Amazon Visa, Hetzner, Google Workspace payment failures from Feb are still unresolved

This is real, but it's a symptom of the deeper problem: too many half-finished organizational systems.

---

## 4. What Burak Looks At vs. What He Creates

### 4.1 What He LOOKS AT Most (Inferred from Activity)

1. **Terminal** — Claude Code, tmux sessions, git repos (by far the most active tool)
2. **Notion** — likely checks Finance Agent and Buraks Lab (but we can't verify frequency)
3. **GitHub** — PRs, issues, orchestrator state
4. **Browser** — Vercel deploys, OmniPort preview, research sources
5. **NOT**: Mission Control (never launched with real data), Obsidian (1 entry), Airtable (dormant), Finance-Agent (2 months cold)

### 4.2 What He CREATES Most

1. **Code** — via Claude Code agents (the orchestrator's commit history is prolific)
2. **Research catalogue entries** — 519+ in the orchestrator research system
3. **Strategy documents** — ContentOS, Strategic Briefs, Discovery docs, VISION.md files
4. **Agent configurations** — CLAUDE.md files, state templates, skill definitions

### 4.3 What He SHOULD Be Creating But Isn't

1. **Invoices** — zero EUR revenue in 2026 so far
2. **Client emails** — Kalte Aktiv, Airtable top-5 leads
3. **Published content** — zero videos despite 1,051-line strategy
4. **Tax filings** — USt-VA Q1 due 2026-05-10
5. **Jobcenter correspondence** — Mitwirkungsschreiben status unknown since December

---

## 5. The Five Questions That Need Honest Answers

### Q1: Where does Burak START his day?

**Likely answer**: Terminal. He opens Ghostty/cmux, checks tmux sessions, maybe runs `git status`. He lives in the code world.

**What this means for MC**: If MC doesn't integrate into the terminal workflow (or replace it as the first-open), it will be another tab that gets ignored. The command palette (Cmd+K) and agent chat (Cmd+J) were the right instinct — they're keyboard-first, terminal-adjacent. But they only work if MC is actually running and Burak opens it.

### Q2: What is the actual pain — too many tools? No single view? Stale data? Manual sync?

**Answer: It's not any one of these. It's decision fatigue + avoidance disguised as architecture concerns.**

Burak doesn't actually NEED Notion data in a different UI. He needs to:
- Open Notion, look at Finance Agent Fristen, and ACT on what's overdue
- Open Airtable, look at CraftCode leads, and SEND an email
- Open ELSTER, file USt-VA, and CLOSE that task

The "I don't know where data lives" feeling is real, but the solution isn't better data plumbing — it's fewer systems and more action within the ones that already work.

### Q3: What would "success" look like for Mission Control?

**The honest answer has two versions:**

**Version A (The Dream):** MC is the first thing Burak opens. It shows today's deadlines, active projects across all hubs, content pipeline status, and a Claude agent he can ask "what should I do next?" It replaces Notion as the daily driver within 3 months.

**Version B (The Reality Check):** MC becomes another half-built tool that was exciting to architect but never gets used daily, because the REAL blocker was never the tool — it was the discipline to sit with one system and work through it.

**The success criteria that would prove Version A over Version B:**
- MC is opened every morning for 30+ consecutive days
- At least 3 Notion DBs are syncing live (requires `.env.local` setup)
- Agent chat is used at least 3x per week for real queries
- Content items in MC are actually moving through the kanban (not just seeded)

### Q4: Is the problem architectural or motivational?

**Both, but motivation is 70% of the problem.**

The architectural issue (data in too many places) is real but manageable — Notion is fine as a primary store, and the Finance-Agent's structure is excellent. The motivational issue is harder: Burak reflexively builds new systems when he feels overwhelmed by existing commitments. Building is comfortable. Shipping, invoicing, and calling clients is uncomfortable.

The Strategic Brief from April 12 diagnoses this correctly: "Das Problem ist nicht Planung — es ist Execution." And then proposes... building Mission Control as the first content video. Which is building another system, recorded as content, about building systems.

### Q5: What does Burak actually need in the next 50 days?

**Not Mission Control.** Or at least, not Mission Control as the primary focus.

What he needs:
1. **A forcing function** — something external that makes him DO instead of BUILD
2. **Fewer tools, not more** — stay in Notion for project management, it works fine
3. **One action per day** — not a dashboard that shows 40 things, but a sticky note that says "today: email Kalte Aktiv"
4. **Revenue** — one invoice changes everything. The 25K Kalte Aktiv project plan exists. The lead list exists. The agency Airtable exists.
5. **Content momentum** — one published video breaks the seal. The strategy is over-planned. Just record.

---

## 6. The Uncomfortable Synthesis

### What Burak Wants to Hear
"Mission Control is the right approach, here's how to fix the data flow, let's add Notion sync and you'll have clarity."

### What the Evidence Says
Burak has **four organizational systems** (Notion, Obsidian, Finance-Agent, Mission Control), **none of which he uses consistently**. Adding a fifth layer of abstraction (MC as aggregator) will not solve the problem. The Finance-Agent — which was well-built, well-structured, and connected to real data — went dormant after 5 days of use.

The pattern is:
1. Feel overwhelmed by scattered obligations
2. Build a system to organize them (feels productive, reduces anxiety)
3. System works well enough to surface the actual obligations
4. The obligations are uncomfortable (send overdue letters, call clients, file taxes)
5. Drift away from the system. Start thinking about a better system.
6. Goto 1.

### What Mission Control Could Actually Be (If Honest)

MC has value if — and only if — it becomes **the thing Burak opens first and closes last.** That means:

1. **Phase 1 is NOT "build the skeleton."** Phase 1 is: open Notion in one tab, open MC in another, and use MC for ONE thing that Notion can't do (agent chat, or local content kanban). Grow from there.

2. **Notion sync is table stakes, not a feature.** If MC doesn't show real Notion data within the first session, it's dead. The `.env.local` must exist before anything else.

3. **The agent chat is the differentiator.** Burak already lives in Claude Code. An agent that reads his Notion state and says "Du hast 3 ueberfaellige Fristen und eine Kalte-Aktiv-Email die seit April 2025 wartet" might be the forcing function he needs. Not a dashboard. A nag.

4. **MC should NOT try to replace Notion.** The 5-phase Notion retirement plan in VISION.md is a trap. It adds years of migration work for a single user. Instead: Notion stays as source of truth, MC is the read-only command center + agent layer. Forever. That's enough.

---

## 7. Recommended Next Steps (For the MC Deep-Dive Conversation)

These are questions to bring back to Burak, not decisions to make for him:

1. **"When did you last open Notion? What did you look at?"** — Establishes actual daily workflow.

2. **"The Finance-Agent last ran on Feb 18. What happened?"** — Gets at why well-built systems get abandoned.

3. **"If MC showed you one number every morning, what would it be?"** — Forces prioritization. (Likely answer: "overdue deadlines" or "days until 31.05.")

4. **"Would you use MC if it was just the agent chat and nothing else?"** — Tests whether the dashboard matters or the agent matters.

5. **"What if we just set up `.env.local` and got Notion sync working — no new features, just real data in the existing skeleton?"** — Tests if the blocker is "it's not real yet" vs "I won't open it regardless."

6. **"Kalte Aktiv Projektplan is from April 2025. Have you contacted them?"** — The answer to this question reveals more about what MC needs to solve than any architecture discussion.

---

## 8. One-Sentence Summary

Burak's pain is not that his data lives in too many places — it's that building organizational systems has become a substitute for the uncomfortable actions those systems were designed to trigger, and Mission Control risks becoming the latest iteration of that pattern unless it is deliberately constrained to be a forcing function rather than a new architecture.
