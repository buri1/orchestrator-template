# Claude-Sneakpeek

> **Get a parallel build of Claude Code that unlocks feature-flagged capabilities like swarm mode.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [mikekelly/claude-sneakpeek](https://github.com/mikekelly/claude-sneakpeek) |
| GitHub Stars | 1,063 (as of 2026-03-08) |
| Publisher | Mike Kelly (@NicerInPerson / @realmikekelly) — solo, serial builder |
| License | MIT |
| Tech Stack | TypeScript (98.5%), Shell, npm (npx installer), Node.js |
| Maturity | 🟢 Production (100 forks, 1,063 stars, active development since Jan 2026) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *From NicerInPerson's swarms unlock post (9/10 relevance). This is the tool that cracked open Claude Code's hidden native multi-agent features — swarm mode, TeammateTool, delegate mode, team coordination. The orchestration skill bundled inside (`src/skills/orchestration/SKILL.md`) is essentially a polished, opinionated version of what we built in the L-Thread Orchestrator. The swarm-mode-patch.ts is the crown jewel: it patches the `tengu_brass_pebble` statsig gate to force-enable native multi-agent features. This is NOT a wrapper or external orchestration layer — it literally patches the Claude Code binary to unlock built-in but feature-flagged capabilities. The team-pack system prompt injection is also very clever.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Directly unlocks the native swarm capabilities we need; the orchestration skill validates our orchestrator pattern; team-pack prompts are adoptable today |
| **Novelty** | 8/10 | Binary patching of Claude Code feature flags is a completely new approach; the `tengu_brass_pebble` gate discovery is reverse-engineering gold; the team-pack prompt injection pattern for overriding tool descriptions is novel |
| **Actionable** | 9/10 | `npx @realmikekelly/claude-sneakpeek quick --name claudesp` and you have native swarms running in 60 seconds; orchestration skill is directly adoptable; team-pack prompts can inform our prompt engineering |

---

## Overview

Claude-sneakpeek installs a completely isolated instance of Claude Code — separate config, sessions, MCP servers, and credentials — that has hidden feature flags force-enabled. The key capability it unlocks is **swarm mode**: native multi-agent orchestration with `TeammateTool`, delegate mode (Task tool spawning background agents), and team coordination (teammate messaging and task ownership). Your existing Claude Code installation remains untouched.

The tool works by downloading the official Claude Code npm package into an isolated directory (`~/.claude-sneakpeek/<name>/`), then binary-patching the minified CLI JavaScript to bypass statsig feature gate checks. Specifically, it finds the function that checks the `tengu_brass_pebble` flag and replaces it with `function XX(){return!0}` — forcing the swarm features on unconditionally. A similar patch disables `TodoWrite` and replaces it with the `Task*` tools (TaskCreate, TaskUpdate, TaskList, TaskGet) for multi-agent task management.

Beyond the binary patches, sneakpeek injects a "team-pack" of enhanced system prompts into the isolated instance. These override tool descriptions (Skill, TaskList, TaskUpdate) and add mandatory orchestration behavior via `system-prompt-orchestration-skill.md`. The bundled orchestration skill is a comprehensive multi-agent orchestration framework that defines orchestrator/worker roles, model selection (haiku/sonnet/opus), parallel-first execution, and user communication patterns.

---

## Technical Architecture

### Core Patching Mechanism

```
npx @realmikekelly/claude-sneakpeek quick --name <name>
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  1. Install: npm install Claude Code → isolated dir  │
│     ~/.claude-sneakpeek/<name>/npm/                  │
│     ~/.claude-sneakpeek/<name>/config/               │
│     ~/.claude-sneakpeek/<name>/variant.json          │
│                                                      │
│  2. Patch: VariantBuilder applies patches             │
│     ├── swarm-mode-patch.ts                          │
│     │   Find: function XX(){...tengu_brass_pebble...}│
│     │   Replace: function XX(){return!0}             │
│     │                                                │
│     └── team-mode-patch.ts                           │
│         Find: TodoWrite gate function                │
│         Replace: force Task* tools enabled           │
│                                                      │
│  3. Inject: team-pack prompt overrides               │
│     └── Copy to tweakDir/system-prompts/             │
│         ├── system-prompt-orchestration-skill.md     │
│         ├── system-prompt-task-management-note.md    │
│         ├── tool-description-tasklist.md             │
│         ├── tool-description-taskupdate.md           │
│         ├── tool-description-skill.md                │
│         └── agent-prompt-task-tool-extra-notes.md    │
│                                                      │
│  4. Wrapper: ~/.local/bin/<name>                     │
│     Launches patched Claude Code with isolated config│
└──────────────────────────────────────────────────────┘
```

### Source Structure

```
src/
├── brands/          # Provider branding (z.ai, MiniMax, OpenRouter, cc-mirror)
├── cli/             # CLI commands (quick, update, remove)
├── core/
│   ├── tweakcc.ts           # Config management and theme patching
│   ├── install.ts           # npm install + CLI path resolution
│   ├── variants.ts          # Variant metadata (variant.json)
│   ├── variant-builder/
│   │   ├── swarm-mode-patch.ts   # ★ The key innovation: statsig gate bypass
│   │   ├── team-mode-patch.ts    # TodoWrite → Task* tools switch
│   │   └── steps/               # Build pipeline steps
│   ├── prompt-pack/         # Base prompt overlays
│   └── skills.ts            # Skill loading
├── skills/
│   ├── orchestration/
│   │   ├── SKILL.md         # ★ Complete orchestration framework (~730 lines)
│   │   └── references/      # Domain guides (software-dev, testing, etc.)
│   └── task-manager/
│       └── SKILL.md         # Task management skill
├── team-pack/               # ★ System prompt overrides for team mode
│   ├── index.ts             # Copy/remove prompt files
│   ├── orchestration-skill.md
│   ├── skill-tool-override.md
│   ├── tasklist.md
│   ├── taskupdate.md
│   ├── task-extra-notes.md
│   └── task-management-note.md
└── tui/                     # Terminal UI components
```

### Key Data: Swarm Gate Patch

The `tengu_brass_pebble` statsig flag controls access to:
- `TeammateTool` — native teammate messaging
- `teammate_mailbox` — message delivery between agents
- `launchSwarm` — multi-agent orchestration startup
- Delegate mode via `Task` tool background spawning

The regex that finds the gate function:
```typescript
/function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_AGENT_SWARMS\)\)return!1;return\s*[\w$]+\("tengu_brass_pebble",!1\)\}/
```

### Team-Pack Toolset Configuration

The team-pack creates a "team" toolset that:
1. Blocks `TodoWrite` (replaced by Task* tools)
2. Inherits all other blocked tools from the default toolset
3. Sets itself as both `defaultToolset` and `planModeToolset`

---

## Publisher Background

**Mike Kelly** (@NicerInPerson on Twitter/X, mikekelly on GitHub) is a Dubai-based serial builder and former software engineer. He has significant open-source credibility:

- **hal-browser** (849 stars) — API browser for HAL+JSON media type
- **hal_specification** (626 stars) — HAL specification documentation
- **AgentK** (959 stars) — Self-evolving, modular autoagentic AGI system
- **btc-endgame** (214 stars) — Bitcoin analysis tool
- 308 GitHub followers, 147 public repos

His background spans API design (HAL), alternative payments, and now AI agents. The AgentK project (959 stars) demonstrates deep expertise in agent architectures. Claude-sneakpeek (1,063 stars) is now his most-starred project, indicating strong community signal. The fact that he built a tool to reverse-engineer and unlock Claude Code's internal features shows both technical depth and willingness to push boundaries.

---

## What's Valuable for Us

### 1. Native Swarm Mode Access (HIGHEST VALUE)

The `tengu_brass_pebble` gate bypass gives us access to Claude Code's built-in multi-agent capabilities without our tmux-based workarounds. The native `Task` tool with `run_in_background=True` spawns real background agents with their own context windows. This is what we're currently simulating with tmux + `terminal-write` + `terminal-wait`.

**Directly relevant to**: Master Blueprint Principle 2 (Deterministic orchestration, LLM execution) — the native Task* tools provide deterministic task routing while agents handle LLM execution.

### 2. Orchestration Skill as Prompt Engineering Reference

The bundled `src/skills/orchestration/SKILL.md` (730 lines) is a polished orchestrator prompt that validates our L-Thread patterns:
- Orchestrator/Worker role separation (matches our DU BIST KEIN ENTWICKLER rule)
- Model routing (haiku for gathering, sonnet for implementation, opus for thinking)
- Task decomposition via TaskCreate with dependency chains via addBlockedBy
- Background-only agents (`run_in_background=True` always)
- Worker preamble template with explicit anti-patterns

**Key differences from our approach**: Their orchestrator CAN use `Read` directly for 1-2 files (coordination reads). Our rule is stricter — we never touch code files. Their approach is arguably more practical for quick lookups.

### 3. Team-Pack Prompt Injection Pattern

The technique of overriding Claude Code's built-in tool descriptions by placing files in `tweakDir/system-prompts/` with naming convention `tool-description-<toolname>.md` and `system-prompt-<name>.md` is extremely valuable. We could use this pattern to inject our own orchestrator behaviors without prompt-level hacks.

### 4. Binary Patching Methodology

The `swarm-mode-patch.ts` demonstrates a clean, maintainable approach to patching minified JavaScript:
- State detection before patching (enabled/disabled/unknown)
- Regex-based function finding with named capture groups
- Idempotent patching (detects already-patched state)
- Diagnostics via `getSwarmGateInfo()`

---

## What's NOT Relevant

### 1. Provider Branding System

The brands system (z.ai, MiniMax, OpenRouter, cc-mirror) is about using alternative LLM providers with the Claude Code UI. We're on Claude Max and committed to Anthropic models. The entire `src/brands/` directory is irrelevant.

### 2. The "Personality" Orchestration Style

The orchestration skill is heavily focused on user-facing personality ("the swagger of someone who's very, very good at this", celebrations, milestone boxes). Our orchestrator runs in AUTO_MODE and needs no personality — it logs, routes, and monitors. Per Master Blueprint Principle 5, human review is the binding constraint, not human entertainment.

### 3. Isolated Instance Architecture

We don't need Claude Code isolation. We run multiple agents via tmux sessions, each with their own worktree. The sneakpeek wrapper/isolation pattern solves a different problem (running a patched build alongside the official one).

### 4. Fragile Version Coupling

The binary patching is inherently fragile — it depends on specific minified function patterns that change with every Claude Code release. The `tengu_brass_pebble` gate will eventually be removed when Anthropic officially ships swarm mode. This tool has a limited shelf life by design.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Install sneakpeek immediately to access native swarm mode for testing. Compare native Task* tool performance vs our tmux-based agent spawning. Evaluate if native swarms eliminate the need for our tmux+worktree infrastructure.

- **Phase 2 (Days 4-60)**: If native swarms prove reliable, migrate from tmux-based orchestration to native Task/TaskCreate/TaskUpdate tools. The team-pack prompt injection pattern could replace our `.claude/agents/orchestrator.md` with system-level prompt overrides. Study the orchestration skill's model routing (haiku/sonnet/opus) for adoption.

- **Phase 3 (Days 60-90)**: By this point, Anthropic may have officially shipped swarm mode, making sneakpeek unnecessary. The patterns it validated (native task management, background agents, teammate coordination) will be in the official product.

- **Phase 4 (Days 90+)**: Tool becomes obsolete once native swarm mode ships officially. The orchestration skill and team-pack prompt patterns remain valuable as reference architecture.

---

## Key Takeaway

> **Claude-sneakpeek reverse-engineers and unlocks Claude Code's built-in but feature-flagged native multi-agent swarm mode via binary patching of the `tengu_brass_pebble` statsig gate — giving immediate access to TaskCreate/TaskUpdate/TeammateTool without waiting for Anthropic's official release.**
