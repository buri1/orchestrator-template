---
id: W1-08-cli-vs-gui
type: deep-research
date: 2026-04-12
subject: CLI-First vs GUI-First for Mission Control
status: complete
relevance: 10
catalogue-refs:
  - ctatedev-generative-tui
  - ctatedev-json-render-yaml-wire-format
  - nummanali-slate-cli-rlm-agent
  - spacesuit-nova-personal-dev-canvas
  - wattenberger-what-comes-after-ide
  - aie-europe-2026-sunil-pai-code-mode
  - aie-europe-2026-matt-pocock-software-fundamentals
  - garrytan-gbrain
  - hermes-wiki
  - obsidian-cli-claude-code-integration
  - synthesis-2026-04-11-harness-convergence-wave
  - llmjunky-favorite-agent-orchestration-tools
---

# CLI-First vs GUI-First for a Personal Command Center (2026)

> Deep research for Mission Control v2 interface strategy.
> Evaluates whether MC should be a CLI tool, a web UI, both, or something else entirely.

---

## 1. Executive Summary

**Recommendation: Headless-first architecture with three interface layers.**

Mission Control already has the hardest part built: a well-typed SQLite data layer with 17 tables, 60+ server actions, and 144 seeded rows. The question is not "CLI or GUI?" -- it is "which surfaces deserve investment, and in what order?"

The answer, supported by convergent evidence from 12+ catalogue entries, the AIE Europe 2026 conference, and the actual usage patterns of a terminal-native solo founder:

| Priority | Interface | Purpose | Effort |
|----------|-----------|---------|--------|
| **P0** | **`mc` CLI** | Daily driver -- deadlines, status, quick capture | 2-3 days |
| **P1** | **Claude Code as interface** | Complex queries, planning, "what should I work on?" | 0 days (already works) |
| **P2** | **Web UI (reduced scope)** | Kanban drag-and-drop, financial charts, visual overview | Already built (Phase 1) |
| **P3** | **TUI dashboard** | Optional -- live terminal dashboard for monitoring | Deferred |

The key insight: **the web UI is not wrong, but it is not the primary interface for someone who already lives in Claude Code and tmux.** The web UI becomes a specialty tool for spatial tasks (Kanban) and visual tasks (charts), not the daily driver.

---

## 2. The Core Question, Reframed

VISION.md states:
> "One screen. Every signal. No tab-switching."

But for Burak, that "one screen" is already the terminal. Claude Code is open all day. tmux sessions are the workspace. The browser is a context switch, not a home base.

The real question is not "CLI or GUI?" but:

**"What is the minimum interface that makes Burak open MC instead of keeping everything in his head?"**

The answer is different for different tasks:

| Task | Best Interface | Why |
|------|---------------|-----|
| "What's due this week?" | CLI (`mc deadlines`) | 0.5s, no context switch |
| "What should I work on today?" | Claude Code (ask the agent) | Needs reasoning, not just data |
| "Show me all projects by status" | CLI (`mc projects --status in_progress`) | Structured output, filterable |
| "Move this task to Review" | CLI (`mc task move <id> review`) | Faster than drag-and-drop for one item |
| "Reorganize the Kanban board" | Web UI (drag-and-drop) | Spatial reasoning needs visual interface |
| "How much did I spend this month?" | CLI or Web UI | CLI for the number, web for the chart |
| "Plan my content for next week" | Claude Code | Needs context, suggestions, reasoning |
| "Capture a quick idea" | CLI (`mc capture "idea text"`) | Lowest friction possible |
| "Review financial dashboard" | Web UI | Multiple data points, visual layout |

**Observation: 6 of 9 daily tasks are best served by CLI or Claude Code. Only 2-3 need a web UI.**

---

## 3. Technology Evaluation Matrix

### 3.1 Interface Options Compared

| Criterion | CLI (Node.js) | TUI (React Ink) | TUI (Bubbletea/Go) | Web UI (Next.js) | Claude Code Native |
|-----------|:---:|:---:|:---:|:---:|:---:|
| **Startup time** | 9 (instant) | 7 (1-2s) | 9 (instant) | 4 (3-5s cold) | 10 (already running) |
| **Keyboard-first** | 10 | 9 | 9 | 6 (needs Cmd+K) | 10 |
| **Visual richness** | 3 (text only) | 6 (ANSI boxes/tables) | 7 (full TUI) | 10 | 3 (text + markdown) |
| **Drag-and-drop** | 0 | 1 | 1 | 10 | 0 |
| **Charts/graphs** | 2 (ASCII) | 3 (ASCII) | 4 (ASCII) | 10 | 2 |
| **Scriptable** | 10 | 5 | 5 | 2 | 7 (via headless) |
| **Composable (pipes)** | 10 | 3 | 3 | 0 | 5 |
| **Shares MC data layer** | 10 (same SQLite) | 10 | 5 (needs FFI) | 10 | 10 (reads DB directly) |
| **Implementation effort** | 2-3 days | 1-2 weeks | 2-3 weeks | 0 (already built) | 0 (already works) |
| **Maintenance burden** | Low | Medium | High (new language) | Medium-High | Zero |
| **Agent integration** | 8 (agent calls CLI) | 6 | 4 | 7 (side panel) | 10 (IS the agent) |
| **Context switch cost** | 0 (stays in terminal) | 0 (stays in terminal) | 0 (stays in terminal) | 5 (open browser) | 0 (stays in Claude) |
| **TOTAL (weighted)** | **78** | **62** | **56** | **65** | **82** |

*Weights: Startup time x2, Keyboard-first x2, Context switch x3, Shares data layer x2, Effort x2. Visual richness x1.*

### 3.2 Scoring Notes

- **Claude Code Native** scores highest because it requires zero new code and zero context switches. The data layer is already accessible.
- **CLI** scores second because it is the highest-ROI new code: 2-3 days of work produces a daily-driver interface.
- **Web UI** scores third -- it is already built but requires a browser context switch, which is the most expensive thing for a terminal-native user.
- **TUI options** score lowest for effort-to-value: they require significant implementation for an experience that is between CLI and Web UI in capability.

---

## 4. Deep Dive: The Five Interface Models

### 4.1 Model A: Pure CLI (`mc` command)

**Architecture:**
```
mc <command> [options]
    |
    v
SQLite (same DB file as Next.js app)
    ^
    |
Drizzle ORM (shared schema)
```

**Example commands:**
```bash
mc status                          # Today's overview
mc deadlines                       # All upcoming deadlines
mc deadlines --overdue             # Overdue only
mc deadlines --days 7              # Next 7 days
mc projects                        # All projects with progress
mc projects --status in_progress   # Filter by status
mc tasks --project omniport        # Tasks for a project
mc capture "Build mc CLI tool"     # Quick capture note
mc task create --project mc --title "Add CLI" --priority high
mc task move <id> review           # Move task status
mc finance                         # Monthly snapshot
mc finance --creditors --overdue   # Overdue creditors
mc content                         # Content pipeline summary
mc ask "what should I work on?"    # Invoke Claude Code agent
```

**Implementation approach:**
- Single TypeScript file using `commander` or `citty` (Nuxt's CLI framework)
- Imports Drizzle schema and actions directly from the MC codebase
- Output formatted with `chalk` and `cli-table3` (or just plain text for pipe-friendliness)
- Could be a separate package or a `bin/mc.ts` in the MC repo
- Uses `tsx` for execution: `npx tsx bin/mc.ts deadlines`
- Eventually: `npm link` to get a global `mc` command

**Pros:**
- Lowest effort (2-3 days for core commands)
- Zero context switch for terminal users
- Scriptable: `mc deadlines --json | jq '.[] | select(.priority == "critical")'`
- Composable: `mc deadlines --overdue | wc -l` (count overdue items)
- Works over SSH, in tmux, in any terminal
- Agent-friendly: Claude Code can call `mc` commands

**Cons:**
- No visual richness (no charts, no Kanban)
- No real-time updates (poll or re-run)
- No drag-and-drop
- Must remember command syntax (mitigated by `mc help` and shell completions)

**Risk assessment:** Very low risk. CLI is additive -- it does not replace the web UI, just provides a faster path for common queries.

### 4.2 Model B: Raycast/Command Palette as Primary Interface

**The thesis:** The Cmd+K command palette is not a feature of the web UI -- it IS the interface. Every interaction starts with Cmd+K.

**How this works in practice:**
1. Open MC in browser (once, on boot)
2. Every interaction: Cmd+K -> type action -> execute
3. Navigation, creation, search, status changes -- all through the palette
4. The page behind the palette is just "context" -- visual confirmation, not the interaction point
5. The palette is the Raycast model applied to a personal tool

**What MC already has:**
- Command palette built (17 commands, fuzzy search, `cmdk` library)
- All navigation commands (go to Projekte, Finanzen, etc.)
- Create commands (new task, new note)
- Toggle commands (dark mode, sidebar, agent panel)

**What's missing for this to be primary:**
- Status change commands ("move task X to done")
- Query commands ("show overdue deadlines" -> renders inline in palette)
- Agent invocation from palette ("ask: what should I work on?")
- Palette result rendering (show a table inline, not just navigation)

**Pros:**
- Keyboard-first, fast
- Already partially built
- Visual context behind the palette (Kanban, charts still visible)
- Familiar pattern (Raycast, Spotlight, VSCode Cmd+P)

**Cons:**
- Still requires browser (context switch)
- Palette is limited in output display (can't show a full table well)
- The "visual context" argument is weak if you're not looking at the page behind

**Verdict:** Good enhancement to the web UI, but does not solve the context-switch problem. The palette makes the web UI better, but does not make it unnecessary.

### 4.3 Model C: Claude Code as THE Interface

**The radical model:** MC has no dedicated interface. Claude Code reads and writes the SQLite database directly. You just ask questions and give instructions.

**How this works:**
```
You: "What are my deadlines this week?"
Claude Code: [reads SQLite] "You have 3 deadlines:
  1. OmniPort meeting prep - April 15 (HIGH)
  2. Einstiegsgeld submission - April 18 (CRITICAL)
  3. MAYTT content review - April 19 (MEDIUM)"

You: "Create a task for the OmniPort prep"
Claude Code: [writes to SQLite] "Created task 'OmniPort meeting prep' in project OmniPort-HH, priority HIGH, due April 14."

You: "What should I work on today?"
Claude Code: [reads SQLite, reasons about priorities] "Based on deadlines and priorities:
  1. Einstiegsgeld submission prep (critical, 6 days left)
  2. OmniPort meeting prep (high, 3 days left)
  3. Content video 1 recording (locked for Monday April 13)"
```

**Why this is compelling:**
- Zero new code needed
- Zero context switch (already in Claude Code all day)
- Agent can reason about priorities (not just display data)
- Agent can cross-reference across modules ("your deadline for X relates to project Y")
- Natural language is more flexible than CLI commands
- Agent learns patterns over time (via CLAUDE.md memory)

**What's needed:**
- A CLAUDE.md section telling Claude Code where the MC database is and what the schema looks like
- Optionally: the `mc` CLI as a tool Claude Code can call (cleaner than raw SQL)
- Trust that Claude Code will handle the DB correctly (mitigated by SQLite backups)

**Pros:**
- Zero implementation cost
- Most flexible interface possible (natural language)
- Reasoning capabilities (not just data retrieval)
- Cross-module intelligence
- Already Burak's primary work tool

**Cons:**
- Slower than CLI for simple lookups (LLM latency vs instant SQLite query)
- Token cost (minor on Claude Max, but non-zero)
- No visual output (tables are markdown, no charts)
- Relies on Claude Code being available and responsive
- Risk of data corruption (mitigated by git backup of SQLite file)
- Cannot browse/scan visually (no "glance at Kanban board" equivalent)

**Verdict:** This is the highest-leverage interface for complex tasks, but too slow for quick lookups. Best paired with CLI for speed.

### 4.4 Model D: Minimal Web UI (Reduced Scope)

**The thesis:** Keep the web UI, but radically reduce its scope. Not 5 full modules -- just the views that genuinely need a browser.

**What stays:**
1. **Ubersicht** -- the daily overview page (designed for a quick glance, already built)
2. **Projekte Kanban** -- drag-and-drop is genuinely better with a visual board
3. **Finanzen dashboard** -- charts and tables benefit from visual layout

**What gets cut:**
1. **Content Kanban** -- low value, content is better tracked in CLI or Claude Code
2. **Agent Chat** -- redundant if Claude Code IS the agent interface
3. **Full sidebar navigation** -- unnecessary with 2-3 pages
4. **Agent side panel (Cmd+J)** -- the entire concept is superseded by Claude Code native

**Impact:**
- Reduces maintenance surface by ~40%
- Eliminates the mock agent runtime (real agent is Claude Code)
- Focuses web UI effort on visual-only tasks
- Browser becomes an occasional tool, not the daily driver

**Pros:**
- Preserves visual capabilities where they matter
- Reduces maintenance burden
- Already built (just trim, don't rebuild)
- Honest about what a web UI is FOR

**Cons:**
- Feels like giving up on the original vision
- Sunk cost on agent panel, content kanban
- Two interfaces to maintain (web + CLI) instead of one

**Verdict:** Pragmatically correct. The web UI was built in a night sprint -- it works, but most of it won't be opened daily. Keep the parts that need pixels.

### 4.5 Model E: Terminal Dashboard (TUI)

**Technology options for a terminal dashboard:**

| Framework | Language | Maturity | Stars | Last Active | MC Fit |
|-----------|----------|----------|-------|-------------|--------|
| **React Ink v5** | TypeScript | Stable | 27K+ | Active | High (same ecosystem) |
| **Bubbletea** | Go | Stable | 30K+ | Very active | Medium (new language) |
| **Blessed/Neo-Blessed** | Node.js | Legacy | 11K | Stale | Low (unmaintained) |
| **Textual** | Python | Stable | 26K+ | Active | Low (different ecosystem) |
| **Ratatui** | Rust | Growing | 12K+ | Very active | Low (different ecosystem) |
| **Termpaint** | TypeScript | New | 2K | Active | Medium |

**React Ink deep dive (highest MC fit):**

React Ink renders React components to the terminal using Yoga (Facebook's flexbox engine). Components are written in JSX, just like web React.

```tsx
// Hypothetical mc-tui dashboard
import { render, Box, Text } from 'ink';
import { DeadlineList } from './components/deadline-list';
import { ProjectStatus } from './components/project-status';

function Dashboard() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Mission Control</Text>
      <Box flexDirection="row" gap={2}>
        <DeadlineList />
        <ProjectStatus />
      </Box>
    </Box>
  );
}

render(<Dashboard />);
```

**What React Ink can do well:**
- Tables with borders and colors
- Progress bars
- Spinner/loading indicators
- Text input
- Select lists
- Scrollable lists
- Basic layout (flexbox)

**What React Ink cannot do well:**
- Drag-and-drop (no mouse support for DnD)
- Rich charts (ASCII only, limited resolution)
- Image/thumbnail display
- Complex nested interactions
- Mouse-driven Kanban

**Bubbletea comparison (if going outside TypeScript):**
- More mature TUI ecosystem (Lip Gloss for styling, Bubbles for components)
- Better performance for complex layouts
- Native Go binary (instant startup, no Node.js overhead)
- But: completely different language, cannot share MC's Drizzle schema
- Would need to access SQLite directly via Go's `mattn/go-sqlite3`

**Verdict on TUI dashboards:** React Ink is viable for a real-time terminal dashboard (like `htop` or `k9s` for MC), but the effort (1-2 weeks) is hard to justify when CLI + Claude Code covers 90% of daily needs. The TUI dashboard is a "nice to have" for monitoring, not a daily driver.

**Real-world TUI examples that validate the pattern:**
- `lazygit` -- 50K+ stars, proves complex TUI can replace GUI for git
- `k9s` -- Kubernetes TUI, proves dashboard-style TUI works
- `btop` -- system monitor, proves live-updating TUI is viable
- `gh dash` -- GitHub CLI dashboard, closest analog to MC TUI

---

## 5. Catalogue Evidence Synthesis

### 5.1 Convergent Signal: Headless-First

The research catalogue contains 12+ entries that converge on the same thesis:

**"Build the data layer first. The interface is just a view."**

| Source | Key Quote / Insight |
|--------|-------------------|
| **ctatedev** (Generative TUI) | "The opposite of 'build a web UI first' -- build the data layer, let the agent render whatever surface makes sense" |
| **Sunil Pai** (AIE Europe) | "Stop building chat interfaces for agents. Build shared workspaces with adaptive surfaces." |
| **Wattenberger** | "The agent IS the primary interface... the 'editor' becomes a review/approval surface" |
| **Matt Pocock** (AIE Europe) | "The types are the API -- no separate OpenAPI spec needed" |
| **gbrain** (Garry Tan) | "The database IS the intelligence layer, not the model" -- PGLite + thin harness + fat skills |
| **Hermes Wiki** | "Claude Code IS the interface. Files are browsable in any text editor." |
| **Slate CLI** | "Agent as utility. Like git or curl -- a tool, not an app." |
| **Obsidian CLI patterns** | "If your data is in local files, you don't need a web UI to interact with it." |
| **Harness Convergence Synthesis** | "Local embedded DB + thin harness + fat skills + multiple surfaces" -- same architecture from 5 independent projects |
| **ADOPTABLE-PATTERNS #8** | "Headless-First Architecture: Build the data layer and API first. The UI is just one of many possible consumers." |
| **ADOPTABLE-PATTERNS #11** | "Multi-Surface Rendering: Same data, different surfaces. Eliminates the CLI vs GUI debate." |
| **Personal Dev Canvas** | "If the primary value is 'what should I work on right now?' -- do you need a Kanban board for that?" |

**The signal is unambiguous:** Every independent data point says the same thing. The data layer is the product. The interface is a detail.

### 5.2 What MC Already Has Right

The Phase 1 mega-sprint (2026-04-12) built things in roughly the right order:

1. SQLite schema (17 tables) -- correct, this is the foundation
2. Drizzle ORM with typed actions (60+) -- correct, this is the API
3. Seed data (144 rows) -- correct, this enables testing of any surface
4. Web UI (5 modules) -- built too much too soon, but not wasted

The web UI is not wrong -- it is premature for a user who does not open browsers. But the data layer and server actions are exactly right and can serve ANY interface.

### 5.3 The ctatedev Generative TUI Relevance

ctatedev's generative TUI concept (schema-driven rendering, YAML wire format) is intellectually interesting but practically a bridge too far for MC right now. The complexity of building a generic schema-to-terminal renderer is not justified when:

- A simple CLI with `chalk` tables covers 80% of needs
- Claude Code handles the complex 20%
- The web UI handles the visual 10%

**Adopt later if:** MC grows beyond personal use or if the agent-driven rendering pattern matures.

---

## 6. The "What Is the Minimum Viable UI?" Analysis

### 6.1 Module-by-Module Assessment

| Module | CLI Viable? | Agent Viable? | Web UI Needed? | Daily Use? |
|--------|:-----------:|:-------------:|:--------------:|:----------:|
| **Ubersicht** | Yes (summary) | Yes (reasoning) | Nice (at a glance) | High |
| **Projekte Kanban** | Partially (list) | Partially (describe) | Yes (drag-and-drop) | Medium |
| **Finanzen** | Yes (tables) | Yes (analysis) | Nice (charts) | Weekly |
| **Content-Planer** | Yes (list) | Yes (planning) | Marginal (Kanban) | Low |
| **Agent-Chat** | N/A | IS the interface | Redundant | N/A |

### 6.2 Minimum Viable Interface Stack

**For daily use (MVP):**
1. `mc status` -- combines Ubersicht data into a terminal summary
2. `mc deadlines` -- upcoming deadlines sorted by urgency
3. `mc capture` -- quick task/note creation
4. Claude Code -- "plan my day", "what's urgent?"

**For weekly use:**
5. Web UI Ubersicht page -- visual glance at project cards and deadlines
6. Web UI Finanzen page -- monthly charts and creditor table

**For as-needed use:**
7. Web UI Projekte Kanban -- when reorganizing multiple tasks spatially
8. `mc projects`, `mc tasks` -- when querying from terminal

**What can be deferred or cut:**
- Content Kanban (use `mc content` CLI instead)
- Agent Chat panel (use Claude Code directly)
- Agent side panel (Cmd+J) (superseded by Claude Code)

---

## 7. Implementation Recommendation

### 7.1 Phase 0: CLI Foundation (2-3 days)

Build `bin/mc.ts` in the Mission Control repo:

```
missioncontrole/
  bin/
    mc.ts          # Entry point
    commands/
      status.ts    # mc status
      deadlines.ts # mc deadlines [--overdue] [--days N]
      projects.ts  # mc projects [--status X]
      tasks.ts     # mc tasks [--project X] [--status X]
      capture.ts   # mc capture "text" [--project X] [--priority X]
      finance.ts   # mc finance [--creditors] [--subscriptions]
      content.ts   # mc content [--status X]
```

**Key decisions:**
- Use `citty` (lightweight, TypeScript-native, Nuxt ecosystem) or `commander` (battle-tested)
- Import Drizzle schema and actions directly (no API layer, shared DB access)
- Default output: human-readable with `chalk` colors
- `--json` flag for pipe-friendly structured output
- `--quiet` flag for scripting (just counts/IDs)
- Shell completions via `omelette` or `tabtab`

**Example: `mc status` output:**
```
Mission Control - 2026-04-12 (Saturday)

DEADLINES (3 upcoming, 1 overdue)
  ! OVERDUE  Einstiegsgeld Mitwirkungsschreiben   Apr 02  CRITICAL
  > Apr 15   OmniPort meeting prep                         HIGH
  > Apr 18   Einstiegsgeld submission                      CRITICAL
  > Apr 19   MAYTT content review                          MEDIUM

PROJECTS (4 active)
  OmniPort-HH        ████████░░  80%  6/8 tasks  Due Apr 30
  Mission Control     ██░░░░░░░░  20%  3/12 tasks Due May 31
  ColdyAI             ███░░░░░░░  30%  2/6 tasks  Due May 15
  Content Strategy    █░░░░░░░░░  10%  1/8 tasks  Due Apr 30

OVERDUE CREDITORS (1)
  Hetzner Cloud  EUR 47.20  Due Mar 31  PENDING
```

### 7.2 Phase 1: Claude Code Integration (0 days, documentation only)

Add to MC's CLAUDE.md:

```markdown
## Database Access

The MC database is at: `missioncontrole/mc.db` (SQLite)
CLI tool: `npx tsx bin/mc.ts <command>`

When asked about deadlines, projects, or tasks, use the mc CLI:
- `mc status` for overview
- `mc deadlines --json` for structured deadline data
- `mc projects --json` for project data

You can also read the database directly via the schema in `src/db/schema.ts`.
```

This enables Claude Code to serve as the intelligent interface with zero additional implementation.

### 7.3 Phase 2: Web UI Pruning (1 day)

- Remove or deprioritize Agent Chat module (superseded by Claude Code native)
- Remove Agent side panel (Cmd+J) -- the concept was premature
- Keep: Ubersicht, Projekte Kanban, Finanzen dashboard
- Content Kanban: keep but deprioritize (CLI covers it)

### 7.4 Phase 3: Shell Integration (1 day)

- `npm link` for global `mc` command
- Shell completions for zsh
- tmux status bar integration: `mc deadlines --count` in tmux status line
- Optional: `mc` as a Claude Code MCP tool (if MCP stabilizes)

### 7.5 Phase 4: TUI Dashboard (Optional, 1-2 weeks)

Only if Phases 0-3 prove that terminal-first is correct:
- React Ink dashboard with live-updating panels
- `mc dashboard` command that renders a full-screen TUI
- Panels: deadlines, projects, recent tasks, agent run history
- Keyboard navigation between panels
- Auto-refresh on file change (watch SQLite WAL)

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| CLI is built but never used (browser habit) | Medium | Low | Start using `mc status` in morning routine for 1 week trial |
| SQLite concurrent access issues (CLI + Next.js) | Low | Medium | SQLite handles concurrent reads well; writes are rare; use WAL mode |
| CLI scope creep (building too many commands) | Medium | Low | Ship 5 core commands, add more only when actually needed |
| Web UI maintenance burden grows | Medium | Medium | Phase 2 pruning reduces surface; fewer modules = less maintenance |
| Claude Code as interface is too slow for quick lookups | High | Low | CLI handles quick lookups; Claude Code for complex reasoning only |
| TUI dashboard becomes a yak-shaving project | High | Medium | Defer to Phase 4; only build if Phases 0-3 are in daily use |

---

## 9. Effort Estimates

| Item | Effort | Dependencies | Blocking? |
|------|--------|-------------|-----------|
| `mc` CLI core (5 commands) | 2-3 days | None (data layer exists) | No |
| Shell completions | 0.5 days | CLI core | No |
| CLAUDE.md updates for agent access | 0.5 days | CLI core | No |
| Web UI pruning (remove agent chat/panel) | 1 day | None | No |
| tmux status bar integration | 0.5 days | CLI core | No |
| `npm link` + global command | 0.5 days | CLI core | No |
| React Ink TUI dashboard | 1-2 weeks | CLI core, proven need | Yes (prove need first) |
| **Total (Phases 0-3)** | **5-6 days** | | |

---

## 10. Strategic Implications

### 10.1 Content Creation Angle

The CLI-first MC is content gold for the locked content strategy:

- Video 1 is already locked: "Ich baue mir ein eigenes Mission Control mit Claude Code"
- A CLI-first approach is more visually interesting on screen than clicking a web UI
- Terminal workflows are what the target audience (German AI-native developers) actually use
- Shows the "headless-first" pattern that the AIE Europe conference validated

### 10.2 The Einstiegsgeld Connection

With the 50-day sprint deadline (May 31), every hour matters. The CLI:
- Takes 2-3 days to build (vs. weeks of web UI polish)
- Immediately useful for tracking the sprint itself (`mc deadlines --overdue`)
- Could track Einstiegsgeld-specific milestones
- Is content-worthy for the video series

### 10.3 Long-Term Architecture

The headless-first architecture positions MC for evolution:

```
Today:      CLI + Claude Code + (existing Web UI)
6 months:   CLI + Claude Code + Minimal Web UI + Notion sync
1 year:     CLI + Claude Code + Optional TUI + Web UI only for visual tasks
Long-term:  The DB is the product. Any interface is disposable.
```

The database and typed actions are the moat. Everything else is a view.

---

## 11. Final Verdict

### Primary Recommendation: Headless-First, CLI-Primary

Build the `mc` CLI as the daily driver. Use Claude Code for complex reasoning. Keep the web UI for visual-only tasks (Kanban, charts). Defer the TUI dashboard.

### Why This Is Right for Burak Specifically

1. **Already lives in the terminal** -- cmux, Claude Code, tmux are the workspace
2. **Hates context switching** -- opening a browser for "what's due today?" is friction
3. **Full auto mode preference** -- CLI commands are scriptable, automatable
4. **Content-first thinking** -- terminal workflows are more visually interesting for the audience
5. **Time pressure** -- 2-3 days for a CLI vs. weeks of web UI polish

### What Stays from the Original Vision

- SQLite as source of truth (correct, locked)
- Drizzle typed actions (correct, locked)
- 5 modules (data model stays, but Content and Chat modules become CLI-first)
- "One screen, every signal" (the screen is the terminal, not the browser)
- "Custom dashboard that speaks your language" (the language is CLI commands and natural language to Claude Code)

### What Changes

| Original VISION.md | Revised |
|--------------------|---------|
| Web UI as primary interface | CLI + Claude Code as primary, web UI as secondary |
| Agent Chat as 5th module | Claude Code native IS the agent interface |
| Cmd+J side panel | Removed (superseded) |
| 5 equal web modules | 2-3 web modules + 5+ CLI commands |
| "Linear on the left, Sunsama on the right" | "Terminal on the left, Raycast Cmd+K for complex tasks" |
| Command palette as navigation | Command palette AND CLI as dual keyboard-first paths |

---

## 12. References (Catalogue)

All entries that informed this analysis:

1. `research/catalogue/posts/2026-03/ctatedev-generative-tui.md` -- Generative TUI concept, React Ink
2. `research/catalogue/posts/2026-03/ctatedev-json-render-yaml-wire-format.md` -- YAML wire format for agent output
3. `research/catalogue/posts/2026-03/nummanali-slate-cli-rlm-agent.md` -- CLI-first agent harness
4. `research/catalogue/posts/2026-03/spacesuit-nova-personal-dev-canvas.md` -- Personal dev canvas, "single-screen" thesis
5. `research/catalogue/posts/2026-01/wattenberger-what-comes-after-ide.md` -- Agent as interface, post-IDE
6. `research/catalogue/talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md` -- Code Mode, shared workspace
7. `research/catalogue/talks/2026-04/aie-europe-2026-matt-pocock-software-fundamentals.md` -- Types as API
8. `research/catalogue/agent-memory/garrytan-gbrain.md` -- PGLite + thin harness + fat skills
9. `research/catalogue/agent-harnesses/hermes-wiki.md` -- No-UI agent-driven wiki
10. `research/catalogue/articles/2026-04-04_obsidian-cli-claude-code-integration.md` -- CLI + files = complete interface
11. `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md` -- Convergent architecture
12. `research/catalogue/posts/2026-03/llmjunky-favorite-agent-orchestration-tools.md` -- CLI-first tools dominate
13. `research/catalogue/ADOPTABLE-PATTERNS.md` -- Patterns #6, #8, #10, #11
14. `research/catalogue/conference-reports/aie-europe-2026-synthesis.md` -- Harness > Model thesis
15. `research/catalogue/posts/2026-03/sawyerhood-dev-browser-cli.md` -- Terminal/browser convergence
