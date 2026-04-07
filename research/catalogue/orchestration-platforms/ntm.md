# NTM (Named Tmux Manager)

> **Spawn, tile, and coordinate multiple AI coding agents (Claude, Codex, Gemini) across tmux panes with a TUI command palette.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [Dicklesworthstone/ntm](https://github.com/Dicklesworthstone/ntm) |
| GitHub Stars | 175 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel (Dicklesworthstone) — solo developer, PE/hedge fund consulting background |
| License | MIT + OpenAI/Anthropic Rider |
| Tech Stack | Go 1.25+, tmux, Charmbracelet TUI stack (bubbletea, lipgloss, glamour), SQLite, chromedp, fsnotify, goreleaser |
| Maturity | 🟢 Production (actively developed, pushed 2026-03-07; part of 29-tool Agent Flywheel ecosystem) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *This is the dedicated entry for NTM, the tmux orchestration layer from Jeffrey Emanuel's Agent Flywheel ecosystem. The parent ecosystem is catalogued at [Agent Flywheel](../agent-harnesses/agent-flywheel.md). NTM is the single most directly comparable tool to our L-Thread Orchestrator's tmux layer — same problem, same substrate (tmux), same approach (named panes, prompt injection, session lifecycle). The 80+ command surface is impressive but may indicate feature bloat. The robot-mode JSON API is the standout feature we lack. The Agent Mail integration for inter-agent coordination is more sophisticated than our terminal-write/terminal-read pattern. Worth deep study alongside Relay App (which moved away from tmux to PTY) and Overstory (which uses tmux+worktree+SQLite).*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | NTM solves the exact same problem as our L-Thread Orchestrator's tmux layer: named sessions, agent spawning, prompt broadcasting, output capture, lifecycle management. The robot-mode JSON API, multi-session labels, and Agent Mail integration directly map to Master Blueprint Layer 3 (Shared Infrastructure). Loses 2 points because it targets multi-provider (Claude+Codex+Gemini) while we're Claude-only, and it has no worktree isolation (a critical gap). |
| **Novelty** | 7/10 | The robot-mode JSON API (`--robot-status`, `--robot-send`, `--robot-list`) for machine-readable orchestration is genuinely novel — we have nothing like it. The TUI command palette with fuzzy search, pinned commands, and live preview is more polished than any tmux orchestrator we've catalogued. Context monitoring with automatic compaction detection and token velocity badges are features we've discussed but not built. The multi-session label system (frontend/backend swarms on the same project) is a clean abstraction we haven't seen elsewhere. |
| **Actionable** | 7/10 | Three immediately actionable patterns: (1) Robot-mode JSON API — add `--robot-status` equivalent to our orchestrator for machine-readable state; (2) Prompt broadcasting by agent type — our `terminal-write` is one-at-a-time, NTM broadcasts to all agents of a type simultaneously; (3) Output extraction with regex filtering and code-block-only modes (`ntm copy --pattern`, `--code`). All three could be adapted into our bash scripts within a day. |

---

## Overview

NTM transforms tmux into a purpose-built multi-agent command center. Written in Go with a rich TUI powered by Charmbracelet's bubbletea/lipgloss stack, it provides 80+ commands (with shell aliases) for spawning, monitoring, broadcasting to, and extracting output from AI coding agents running in tmux panes.

The core abstraction is the **named pane**: each agent gets a deterministic identifier following the pattern `<session>__<type>_<instance>` (e.g., `myproject__cc_1` for Claude Code instance 1, `myproject__cod_2` for Codex instance 2). This naming convention enables type-aware broadcasting — send a prompt to all Claude agents, all Codex agents, or all agents simultaneously with a single command.

NTM goes significantly beyond basic tmux session management. It includes a full TUI dashboard with color-coded agent cards, token velocity badges, and live status indicators. A command palette with fuzzy search, pinned favorites, and animated gradient banners provides quick access to all operations. The robot-mode JSON API (`--robot-*` flags) makes the entire system scriptable for CI/CD integration and programmatic orchestration by other agents. Integration with Agent Mail (from the same ecosystem) provides inter-agent messaging with file reservation leases, and integration with Beads provides task-aware coordination using issue IDs as message thread identifiers.

---

## Technical Architecture

### Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NTM Binary (Go)                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ CLI/TUI  │  │  Robot   │  │ Session  │  │ Agent   ││
│  │ Layer    │  │  API     │  │ Manager  │  │ Registry││
│  │(palette, │  │(JSON on  │  │(create,  │  │(cc,cod, ││
│  │ dash,    │  │ stdout)  │  │ spawn,   │  │ gmi     ││
│  │ aliases) │  │          │  │ kill)    │  │ types)  ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘│
│       └──────────────┴─────────────┴─────────────┘     │
│                        │                                │
│  ┌─────────────────────┴───────────────────────────┐   │
│  │              Internal Packages (80+)             │   │
│  │                                                  │   │
│  │  session/ tmux/ agent/ coordinator/ ensemble/   │   │
│  │  agentmail/ swarm/ pipeline/ workflow/ watcher/  │   │
│  │  checkpoint/ handoff/ recovery/ state/ events/   │   │
│  │  tokens/ context/ scoring/ scheduler/ hooks/     │   │
│  │  safety/ privacy/ redaction/ encryption/         │   │
│  │  metrics/ profiler/ cost/ audit/ health/         │   │
│  │  tui/ palette/ output/ clipboard/ codeblock/     │   │
│  │  git/ worktrees/ approval/ policy/ invariants/   │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┴──────────────────────────┐   │
│  │                 tmux (subprocess)                │   │
│  │  Named sessions → Named panes → Agent CLIs      │   │
│  │  <session>__cc_1  |  <session>__cod_2  |  ...   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ Claude  │          │ Codex   │          │ Gemini  │
    │ Code    │          │ CLI     │          │ CLI     │
    └─────────┘          └─────────┘          └─────────┘
```

### 80+ Internal Packages

The Go codebase is massively modular with 80+ internal packages covering:

- **Core orchestration**: `session/`, `agent/`, `coordinator/`, `ensemble/`, `swarm/`, `pipeline/`, `workflow/`
- **State & persistence**: `state/`, `checkpoint/`, `events/`, `history/`, `context/`
- **Communication**: `agentmail/`, `handoff/`, `assign/`, `rotation/`
- **Safety & compliance**: `safety/`, `privacy/`, `redaction/`, `encryption/`, `approval/`, `policy/`, `invariants/`
- **Monitoring**: `metrics/`, `profiler/`, `cost/`, `audit/`, `health/`, `tokens/`, `scoring/`
- **TUI**: `tui/`, `palette/`, `output/`, `clipboard/`, `codeblock/`
- **Infrastructure**: `tmux/`, `git/`, `worktrees/`, `process/`, `hooks/`, `plugins/`
- **External integrations**: `webhook/`, `notify/`, `alerts/`, `integrations/`, `serve/` (REST/WebSocket planned)

### Key Dependencies

| Dependency | Purpose |
|-----------|---------|
| `charmbracelet/bubbletea` | TUI framework (dashboard, palette) |
| `charmbracelet/lipgloss` | Terminal styling (Catppuccin theme) |
| `charmbracelet/glamour` | Markdown rendering in terminal |
| `mattn/go-sqlite3` | Local state persistence |
| `chromedp/chromedp` | Browser automation (testing?) |
| `fsnotify/fsnotify` | File system watching for agent output |
| `go-chi/chi` | HTTP router (REST API planned) |
| `gorilla/websocket` | WebSocket support (API planned) |
| `BurntSushi/toml` | Configuration parsing |

### Robot-Mode JSON API

All robot commands return JSON on stdout, diagnostics on stderr, exit 0 on success:

```bash
ntm --robot-status          # Full session triage (JSON)
ntm --robot-list            # Machine-readable session listing
ntm --robot-send=proj \
  --message "task"          # Scriptable agent interaction
ntm --robot-context         # Token usage / context window state
ntm --robot-interrupt       # Programmatic Ctrl+C to all panes
ntm --robot-ack             # Acknowledge messages with timeout
```

### Multi-Session Labels

```bash
ntm spawn myproject --label frontend --cc=3
ntm spawn myproject --label backend --cc=2
ntm send --project myproject "commit changes"   # broadcasts to all labels
ntm kill --project myproject                     # kills all labels
```

---

## Publisher Background

**Jeffrey Emanuel** (GitHub: Dicklesworthstone, X: @doodlestein, 29K followers) is a solo developer based in New York with a background in quantitative finance (PE/hedge fund consulting). He built the Agent Flywheel ecosystem — 29 interconnected tools — for his own consulting practice, claiming 20,000+ lines of production Go code shipped in a single day using this setup.

Notable credibility markers:
- **2.2K GitHub followers**, 172 repositories, 16.7K+ total stars across projects
- **Agent Mail** (1,780 stars) achieved significant standalone traction as an MCP server
- **Beads Viewer** (891 stars), **CASS** (307 stars) — multiple ecosystem tools with organic adoption
- **Nvidia Short Thesis** (Jan 2025) — 12,000-word analysis that contributed to ~$600B market cap movement, recognized by Naval Ravikant and Matt Levine
- Active daily pushes across the ecosystem; NTM last pushed 2026-03-07
- No VC funding — practitioner-built system from actual consulting revenue, similar to our L-Thread Orchestrator origin

The Agent Flywheel ecosystem includes: NTM (tmux orchestration), Agent Mail (inter-agent messaging), CASS (session search), CM (procedural memory), BV/Beads (task graphs), DCG (command guard), SLB (two-person approval), UBS (bug scanner), and 20+ supporting tools. NTM is the central orchestration hub that spawns and coordinates agents, while Agent Mail provides the communication layer.

---

## What's Valuable for Us

### 1. Robot-Mode JSON API — Highest Priority

NTM's `--robot-*` flags provide machine-readable JSON output for all orchestration operations. This is the single biggest gap in our L-Thread Orchestrator. Our `terminal-write`/`terminal-read` pattern requires parsing unstructured terminal output; NTM's approach returns structured JSON that any parent orchestrator can consume programmatically.

**Concrete pattern to steal:**
```bash
# Our current approach (fragile):
tmux capture-pane -t agent-1 -p -S -50 | grep "DONE"

# NTM's approach (structured):
ntm --robot-status  # Returns JSON with agent states, context usage, etc.
```

This maps directly to Master Blueprint Governing Principle #2 (deterministic orchestration) — the orchestrator should never parse free-text output when structured data is available.

### 2. Prompt Broadcasting by Agent Type

NTM's `send` command broadcasts identical prompts to agent subsets by type (`--cc`, `--cod`, `--all`). Our orchestrator sends prompts one-at-a-time via `terminal-write`. For scenarios like "all agents commit and push," broadcasting eliminates sequential overhead.

**Adaptation for our system:** Even though we're Claude-only, broadcasting to all active agent panes simultaneously (rather than sequentially) would reduce orchestration latency for common operations like "commit," "run tests," or "context refresh."

### 3. Output Extraction Modes

NTM provides sophisticated output capture:
- `ntm copy --pattern 'ERROR'` — regex-filtered extraction
- `ntm copy --code` — extracts only markdown code blocks from agent output
- `ntm copy --output file` — timestamped file export
- `ntm save -o ~/logs` — bulk session archival

Our `tmux capture-pane` approach is raw and undifferentiated. The `--code` mode in particular would be valuable for extracting agent-generated code from verbose output.

### 4. Context Monitoring & Token Velocity

NTM tracks token usage per agent, displays token velocity badges (tokens/minute) on the dashboard, and detects when agents hit context limits for automatic compaction. This is observability infrastructure we've discussed but haven't implemented. Maps to Master Blueprint Layer 3 (Observability: token tracking, cost per task).

### 5. Multi-Session Labels

The label system (`--label frontend`, `--label backend`) allows multiple agent swarms on the same project with unified lifecycle commands. This maps to our federated architecture (Governing Principle #6) — different business lines could be different labels within a project, with cross-label operations for portfolio-level commands.

### 6. Event Logging (JSONL)

NTM logs all session activity in JSONL format. Combined with CASS (session search across 11 agent formats), this provides a complete audit trail. Our orchestrator currently has no structured event logging — we rely on tmux scrollback which is volatile.

---

## What's NOT Relevant

### 1. Multi-Provider Agent Strategy

NTM is designed for Claude + Codex + Gemini simultaneously. Our architecture deliberately uses Claude only for code execution per the 70/30 deterministic/LLM split (Governing Principle #2). The agent type system (`cc`/`cod`/`gmi`) is over-engineered for our single-provider approach. However, the *abstraction* of agent types is valuable even if we only have one type.

### 2. No Worktree Isolation

NTM's agents all work in the same directory. There is no git worktree-per-agent isolation. This is a critical gap — our architecture (and Overstory, pi-side-agents, Broomie) all agree that agents must have isolated worktrees to prevent merge conflicts. NTM relies on Agent Mail's file reservation system for conflict prevention, which is advisory (not enforced). Master Blueprint Layer 3 specifies "Worktree-per-agent" as infrastructure, not optional.

### 3. TUI Polish Over Architectural Depth

The animated gradient banners, Catppuccin themes, Nerd Font icons, and pulsing indicators are impressive UX but irrelevant to our headless orchestrator. Our orchestrator runs in the background with no interactive TUI. The 80+ internal packages suggest significant complexity that may be over-engineered for the core problem of spawning and coordinating agents.

### 4. VPS/Linux-First Deployment

The Agent Flywheel ecosystem (of which NTM is a part) assumes Ubuntu VPS deployment. While NTM itself runs on macOS, the broader ecosystem integration (Agent Mail, CASS, etc.) is optimized for Linux. Our system runs on macOS with tmux.

### 5. Feature Surface Area

80+ internal packages, 80+ commands, project scaffolding, VS Code integration, Docker images — this is a large surface area to maintain for a solo developer. Governing Principle #7 ("build only what you have needed in the last 30 days") suggests cherry-picking specific patterns rather than adopting the tool wholesale.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study and adapt the robot-mode JSON API pattern for our orchestrator state. Add `--robot-status` equivalent to our `orchestrator-state.json` tooling. Study the prompt broadcasting mechanism for parallel commands to all active agents.
- **Phase 2 (Days 4-60)**: Evaluate NTM's output extraction modes (`--pattern`, `--code`) as improvements over our raw `tmux capture-pane` approach. The regex-filtered and code-block-only modes would reduce noise in agent output parsing.
- **Phase 3 (Days 60-90)**: If scaling beyond 3 agents, NTM's multi-session label system becomes relevant for managing multiple agent swarms per business line. The JSONL event logging + CASS session search combination provides the audit trail we'll need for gov compliance.
- **Phase 4 (Days 90+)**: Evaluate whether NTM's Go binary could replace our bash-based tmux management scripts entirely. The structured Go codebase with 80+ internal packages is more maintainable than shell scripts at scale. However, by Phase 4, Relay App's PTY-over-tmux approach may be more appropriate.

---

## Key Takeaway

> **NTM is the closest direct competitor to our L-Thread Orchestrator's tmux layer — same problem, same substrate — and its robot-mode JSON API for machine-readable agent orchestration, prompt broadcasting by agent type, and structured output extraction are three patterns we should adapt immediately, while its lack of worktree isolation and multi-provider complexity are architectural gaps that confirm our design choices.**
