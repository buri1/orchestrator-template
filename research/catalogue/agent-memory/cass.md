# CASS (Coding Agent Session Search)

> **Unified TUI and CLI to index and search your local coding agent session history across 11+ providers (Codex, Claude, Gemini, Cursor, Aider, etc.)**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | [Dicklesworthstone/coding_agent_session_search](https://github.com/Dicklesworthstone/coding_agent_session_search) |
| GitHub Stars | 554 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel (Dicklesworthstone) — solo developer, PE/hedge fund consulting background |
| License | MIT + OpenAI/Anthropic Rider |
| Tech Stack | Rust, Tantivy (BM25), FastEmbed (MiniLM), FrankenTUI (Elm architecture) |
| Maturity | 🟡 Early (Alpha — 1,765 commits, rapidly evolving, 78 forks) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Part of Jeffrey Emanuel's Agent Flywheel ecosystem (already catalogued at `agent-harnesses/agent-flywheel.md`). This is the episodic memory foundation layer — the raw session search engine that feeds into CM (cass_memory_system, 268 stars), which adds the procedural memory layer on top. The three-layer cognitive model (episodic via CASS, working via diary, procedural via playbook) directly mirrors what our Master Blueprint needs for knowledge compounding. The Rust implementation with Tantivy gives sub-60ms search latency across all agent sessions — this is the "ground truth" layer that makes cross-agent learning possible. The 13+ agent format normalizers are the real value; writing these from scratch would be weeks of work. The robot mode (`--robot`, `--json`) design shows agent-first thinking. Would pair well with ccusage (already 9/10 in our catalogue) for a complete session intelligence stack.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly addresses Master Blueprint Principle #1 ("orchestration layer is the compounding asset") — session history is raw material for knowledge compounding. Our multi-agent setup generates sessions across Claude Code, and potentially Codex/Gemini. CASS unifies all of them into a searchable corpus. The normalized `Conversation -> Message -> Snippet` model is exactly what we need for cross-agent learning without building our own parsers. |
| **Novelty** | 7/10 | The 13+ agent format normalizers, edge n-gram indexing for O(1) prefix lookup, hash embedder fallback (FNV-1a -> 384-dim vector, zero network dependency), and the FSVI memory-mappable vector index format are all new approaches not seen in our research. The analytics dashboard (7 views including heatmap and coverage) goes beyond simple search. |
| **Actionable** | 7/10 | `brew install dicklesworthstone/tap/cass` and immediately index all Claude Code sessions. Works on macOS (Apple Silicon native). Robot mode (`--robot --json`) designed for agent consumption. Could feed our orchestrator's context assembly pipeline within a day of integration. |

---

## Overview

CASS is a Rust-based session search engine that indexes and unifies coding agent session history from 13+ AI coding tools into a single searchable corpus. It solves the fundamental problem of agent amnesia: every time you start a new session, all prior context is lost. CASS preserves it by normalizing disparate session formats (JSONL, SQLite, Markdown, encrypted JSON) into a canonical `Conversation -> Message -> Snippet` model, then indexing everything with Tantivy's BM25 full-text engine plus optional vector similarity search.

The tool operates in two modes: an interactive TUI with three-pane layout, syntax highlighting, and analytics dashboards; and a CLI "robot mode" designed for agent consumption where stdout contains only parseable JSON and stderr holds diagnostics. This dual-mode design makes it both a developer tool and an agent infrastructure component.

CASS serves as the episodic memory foundation in Jeffrey Emanuel's Agent Flywheel ecosystem. It's the "ground truth" layer that feeds CM (cass_memory_system), which transforms raw session history into structured diary entries and then distilled procedural rules with confidence decay. Together they implement a three-layer cognitive model: episodic (CASS) -> working memory (diary) -> procedural memory (playbook).

---

## Technical Architecture

### Data Model

```
Session File (raw)
  -> Connector/Normalizer (per-agent format)
    -> Conversation (normalized)
      -> Message (role, content, timestamp)
        -> Snippet (searchable unit)
          -> Tantivy Index (BM25 full-text)
          -> FSVI Vector Index (optional semantic)
```

### Supported Agent Formats (13+)

| # | Agent | Location | Format |
|---|-------|----------|--------|
| 1 | Codex | `~/.codex/sessions` | Rollout JSONL |
| 2 | Claude Code | `~/.claude/projects` | Session JSONL |
| 3 | Gemini CLI | `~/.gemini/tmp` | Chat JSON |
| 4 | Cursor | `~/Library/Application Support/Cursor/User/` | SQLite (state.vscdb) |
| 5 | Cline (VS Code) | VS Code global storage | Task directories |
| 6 | Aider | `~/.aider.chat.history.md` | Markdown |
| 7 | ChatGPT | `~/Library/Application Support/com.openai.chat` | Encrypted/unencrypted JSON |
| 8 | Clawdbot | `~/.clawdbot/sessions` | Session JSONL |
| 9 | Vibe/Mistral | `~/.vibe/logs/session/*/messages.jsonl` | JSONL |
| 10 | OpenCode | `.opencode` directories | SQLite |
| 11 | Amp | `~/.local/share/amp` + VS Code storage | Mixed |
| 12 | Pi-Agent | `~/.pi/agent/sessions` | Session JSONL (with thinking) |
| 13 | Factory/Droid | `~/.factory/sessions` | JSONL |

### Search Engine Stack

- **Lexical search** (default): Tantivy BM25 with edge n-gram indexing for O(1) prefix lookup
- **Semantic search**: FastEmbed with MiniLM model (optional), stored in FSVI (frankensearch vector index) format with f32/f16 quantization
- **Hybrid search**: Reciprocal Rank Fusion combining BM25 + vector similarity
- **Hash embedder fallback**: FNV-1a hashing -> 384-dimensional vector projection when ML models unavailable (<1ms init, zero network dependency)
- **Auto-fuzzy fallback**: Sparse lexical results automatically retry with `*term*` wildcards

### Key CLI Commands

```bash
# Health check (agent-friendly)
cass health --json

# Full reindex
cass index --full

# Agent-mode search (JSON output, no TUI)
cass search "auth token refresh" --robot --limit 10 --fields minimal --days 30

# View specific session with context
cass view /path/to/session.jsonl -n 42 --json
cass expand /path/to/session.jsonl -n 42 -C 3 --json

# Machine API documentation
cass robot-docs guide
cass robot-docs schemas

# Encrypted HTML export
cass export-html session.jsonl --encrypt --password "secret"

# Interactive TUI
cass tui [--inline] [--ui-height 20]
```

### TUI Analytics Dashboard (7 views)

Toggled with `A` key: Dashboard, Explorer, Heatmap, Breakdowns, Tools, Plans, Coverage. Provides session analytics, agent usage patterns, and temporal distribution of coding activity.

### Storage Locations

```
~/.local/share/coding-agent-search/
  ├── tantivy_index/          # BM25 full-text index
  ├── vector_index/           # FSVI semantic index
  │   └── index-<embedder>.fsvi
  └── config/                 # Configuration
```

---

## Publisher Background

Jeffrey Emanuel (GitHub: Dicklesworthstone) is a solo developer based in New York with a background in PE/hedge fund consulting. He has built a prolific open-source ecosystem around AI coding agents, with 2,159 GitHub followers and 172 public repositories. His top projects demonstrate serious engineering across multiple languages:

- **Beads Viewer** (1,365 stars) — Graph-aware TUI for issue tracking
- **Agent Flywheel Setup** (1,237 stars) — Complete multi-agent VPS bootstrap
- **Beads Rust** (694 stars) — Rust port of Steve Yegge's task tracker
- **CASS** (554 stars) — This tool
- **CM / cass_memory_system** (268 stars) — Procedural memory layer built on CASS
- **ACIP** (291 stars) — Advanced cognitive inoculation prompt

The Agent Flywheel ecosystem represents one of the most complete solo-built multi-agent development stacks in the open-source space. Emanuel's approach is infrastructure-heavy (Rust/Go for core tools, TypeScript for higher-level systems) and opinions-heavy — he ships tools he actually uses daily for consulting work, not academic prototypes.

---

## What's Valuable for Us

### 1. Agent Session Normalizers (Highest Value)
The 13+ format-specific connectors that normalize disparate session formats into a canonical model are weeks of engineering we don't need to replicate. Even if we never run CASS as a daemon, studying the normalization logic for Claude Code sessions (`~/.claude/projects` -> Session JSONL) tells us exactly how to parse our own session history programmatically.

### 2. Robot Mode Protocol Pattern
The strict `stdout=JSON, stderr=diagnostics, exit 0=success` convention with `--robot` and `--json` flags is a clean pattern for any CLI tool that agents consume. This aligns with Master Blueprint Principle #2 (deterministic orchestration) — agents should parse structured output, not scrape terminal text.

### 3. Session Search for Context Assembly
`cass search "auth rate limiting" --robot --days 30 --limit 5` gives our orchestrator the ability to inject historical session context into agent prompts. This is the "knowledge compounding" mechanism the Master Blueprint calls for — past sessions inform future agents without manual curation.

### 4. Edge N-Gram Indexing Strategy
Precomputing prefix matches at index time for O(1) query-time lookup is a smart trade-off (disk space for speed) that we could adopt if we ever build custom search infrastructure.

### 5. Hash Embedder Fallback
FNV-1a hashing to 384-dimensional vectors provides zero-dependency semantic-ish search. No model downloads, no network calls, <1ms init. Useful as a fallback when ML infrastructure isn't available.

### 6. Integration with CM (Procedural Memory)
CASS is designed as the episodic foundation for CM's three-layer cognitive model. The `cm context` command searches CASS under the hood. This layered architecture (raw sessions -> structured diary -> distilled rules with confidence decay) directly mirrors what we need for long-term knowledge compounding across agents.

---

## What's NOT Relevant

### 1. Full TUI Experience
The interactive TUI with FrankenTUI, macro recording, asciicast export, and analytics dashboards is impressive engineering but irrelevant to our orchestrator, which is headless. We only need the `--robot` CLI mode. The TUI is a developer tool, not an agent infrastructure component.

### 2. HTML Export with AES-256-GCM Encryption
Session sharing via encrypted HTML files is a collaboration feature we don't need. Our sessions stay local per Master Blueprint Principle #6 (federated systems).

### 3. Agent Mail MCP Fallback
CASS includes an Agent Mail integration as MCP fallback, but we already have our own inter-agent communication via tmux + state files. Different messaging architecture.

### 4. Linux/VPS Optimizations
The broader Flywheel ecosystem assumes Ubuntu VPS deployment. CASS itself works on macOS (Homebrew tap available), but some session paths and assumptions are Linux-first.

---

## Future Use Cases

### Phase 2 (Days 4-60)
- **Install CASS locally** (`brew install dicklesworthstone/tap/cass`) and index all existing Claude Code sessions
- **Wire `cass search --robot` into orchestrator context assembly** — before spawning a coding agent, search for relevant historical sessions and inject snippets into the prompt
- **Pair with ccusage** for a complete session intelligence stack: ccusage tracks costs, CASS searches content

### Phase 3 (Days 60-90)
- **Evaluate CM (cass_memory_system)** as the procedural memory layer on top of CASS — the 90-day confidence decay, anti-pattern learning, and evidence gates are exactly what we need for long-term knowledge compounding
- **Multi-agent format indexing** — as we potentially add Codex or Gemini agents, CASS already has their normalizers ready
- **Feed CASS search results into Notion knowledge base** via the meta-layer for cross-business visibility

### Phase 4 (Days 90+)
- **Build custom orchestrator integration** where the orchestrator queries CASS before task decomposition to understand what agents have done before on similar tasks
- **Evaluate FSVI vector index format** for custom semantic search infrastructure
- **Contribute additional agent normalizers** if we adopt new coding tools

---

## Key Takeaway

> **CASS is the missing episodic memory layer for multi-agent setups — a Rust-powered, sub-60ms session search engine that normalizes 13+ agent formats into a unified searchable corpus, giving every future agent access to every past agent's experience.**
