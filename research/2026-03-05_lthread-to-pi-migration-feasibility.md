# L-Thread Orchestrator to Pi Agent: Migration Feasibility Analysis

**Date:** 2026-03-05
**Author:** Deep Research Agent
**Scope:** Full feasibility assessment for migrating L-Thread Orchestrator patterns to Pi Agent as the custom harness foundation
**Sources:** L-Thread Orchestrator v2.1 codebase, Pi-mono (badlogic), Oh-My-Pi (can1357), pi-subagents, pi-side-agents, pi-collaborating-agents, pi-mcp-adapter, Overstory

---

## Executive Summary

Migration is **feasible but non-trivial**. Every L-Thread pattern can be replicated in Pi, but the effort shifts from prompt engineering (0 lines of code) to TypeScript extension development (~2,000-4,000 lines across 6-8 extensions). The payoff is substantial: model flexibility, deeper lifecycle control, composable extensions across all projects, and independence from Claude Code's release cycle. The critical risk is the MCP gap -- Pi deliberately excludes native MCP, and the Chrome DevTools MCP dependency for E2E testing requires either the pi-mcp-adapter or a custom Playwright-based replacement.

**Recommendation:** Progressive migration. Run both systems in parallel during a 3-phase transition. Start with the state management and enforcement extensions (low risk, high value), then tackle sub-agent orchestration, and finally migrate the E2E testing pipeline.

---

## Table of Contents

1. [Migration Feasibility: Pattern-by-Pattern Mapping](#1-migration-feasibility)
2. [The MCP Problem](#2-the-mcp-problem)
3. [The Sub-Agent Gap](#3-the-sub-agent-gap)
4. [State Migration](#4-state-migration)
5. [The "No Code" Rule Enforcement](#5-the-no-code-rule-enforcement)
6. [Progressive Migration Path](#6-progressive-migration-path)
7. [Extensions to Build](#7-extensions-to-build)
8. [Risk Assessment](#8-risk-assessment)
9. [Timeline Estimate](#9-timeline-estimate)
10. [Recommendation](#10-recommendation)

---

## 1. Migration Feasibility

### Pattern-by-Pattern Mapping

| L-Thread Pattern | Current Implementation | Pi Equivalent | Feasibility | Effort |
|-----------------|----------------------|---------------|-------------|--------|
| Orchestrator persona | `.claude/agents/orchestrator.md` | `AGENTS.md` + system prompt + extension hooks | Direct | Low |
| Conduit Mode (tmux pane-split) | `conduit pane-split` + `terminal-write/read` | `pi-side-agents` or `pi-subagents` extension | Requires extension | Medium |
| Teams Mode (Task/SendMessage) | Native Claude Code Teams tools | `pi-collaborating-agents` or custom extension | Requires extension | High |
| Tmux crash recovery | `tmux new-session` + state probe | Native tmux (Pi already runs in terminal) | Direct | Low |
| SessionStart hook | `.bmad/scripts/orchestrator-session-start.sh` | `session_start` event in extension | Direct | Low |
| PreCompact hook | `.bmad/scripts/orchestrator-handoff.sh` | `session_before_compact` event | Direct | Low |
| State files (JSON) | `_bmad/orchestrator-*.json` | `pi.appendEntry()` + external JSON | Hybrid | Low |
| FutureLearnings (INC-XXX) | `memory/FutureLearnings.md` + manual read | Skill (`SKILL.md`) with auto-load on error | Better than current | Low |
| Tiered Context (T0/T1/T2) | Manual tier loading | `before_agent_start` + `context` events | Better than current | Medium |
| E2E Testing Gate | Chrome DevTools MCP | pi-mcp-adapter OR Playwright extension | Requires work | High |
| AUTO-MODE | `.bmad/AUTO_MODE` file check | Extension flag + `input` event suppression | Direct | Low |
| Bounded review loops | Prompt-enforced max 3 cycles | Extension counter with `tool_call` hook | Better than current | Low |
| Mode detection | Check for Teams tools vs Conduit CLI | Extension auto-detects available sub-agent backend | Direct | Low |
| Devlog | `.bmad/devlog.md` append | Extension with `turn_end` / `agent_end` hooks | Better than current | Low |
| Process cleanup (pkill) | Bash pkill after agent close | `session_shutdown` hook + cleanup | Direct | Low |
| Overseer agent | Separate tmux session monitoring | Dedicated Pi session with monitoring extension | Same approach | Low |

### Verdict: 16/16 patterns mappable. 0 blockers. 3 items require significant extension work.

---

## 2. The MCP Problem

### The Dependency

L-Thread Rule 2 mandates Chrome DevTools MCP for E2E testing before any task is marked done. This is not optional -- it is a hard gate encoded in incidents INC-014 and INC-015. The current workflow:

```
Fix -> PR -> Merge -> Chrome DevTools MCP (desktop + mobile screenshot) -> Done
```

### Pi's Design Choice

Pi deliberately excludes MCP: "No MCP -- build CLI tools with READMEs (skills) or extensions." This is a philosophical choice, not a technical limitation.

### Three Solutions (Ranked by Preference)

#### Solution A: pi-mcp-adapter (Recommended)

The `nicobailon/pi-mcp-adapter` extension bridges MCP into Pi with a token-efficient proxy model:

- Single `mcp` tool costs ~200 tokens (vs 10k+ for full server definitions)
- Lazy server connections (connect on first use)
- Supports stdio and HTTP transports
- Can import existing MCP configs from Claude Desktop, Cursor, etc.
- Chrome DevTools MCP server works via stdio transport

**Configuration:**
```json
// .pi/mcp.json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/chrome-devtools-mcp"],
      "lifecycle": "lazy",
      "directTools": [
        "navigate_page",
        "take_screenshot",
        "emulate",
        "evaluate_script",
        "click",
        "fill"
      ]
    }
  }
}
```

**Pros:** Minimal code change, reuses existing MCP servers, token-efficient.
**Cons:** Extra dependency, MCP server startup latency, adapter maturity.

#### Solution B: Custom Playwright Extension

Build a Pi extension that wraps Playwright directly (no MCP middleman):

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { chromium } from "playwright";

export default function (pi: ExtensionAPI) {
  let browser: any = null;

  pi.registerTool({
    name: "e2e_test",
    label: "E2E Test",
    description: "Run E2E test: navigate, screenshot, emulate mobile",
    parameters: Type.Object({
      url: Type.String({ description: "URL to test" }),
      mobile: Type.Boolean({ description: "Emulate iPhone 14 Pro", default: false }),
      actions: Type.Optional(Type.Array(Type.Object({
        type: Type.String({ description: "click|fill|wait|screenshot" }),
        selector: Type.Optional(Type.String()),
        value: Type.Optional(Type.String()),
      }))),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      if (!browser) browser = await chromium.launch({ headless: true });
      const context = await browser.newContext(
        params.mobile ? { ...devices["iPhone 14 Pro"] } : {}
      );
      const page = await context.newPage();
      await page.goto(params.url);
      // Execute actions, capture screenshots...
      const screenshot = await page.screenshot({ encoding: "base64" });
      await context.close();
      return {
        content: [{ type: "image", source: { type: "base64", data: screenshot } }],
        details: { url: params.url, mobile: params.mobile }
      };
    }
  });
}
```

**Pros:** No MCP dependency, faster (no server startup), full control, works offline.
**Cons:** More code to write, loses MCP ecosystem interoperability.

#### Solution C: CLI Skill Wrapper

Pi's skill system can wrap existing CLI tools:

```markdown
<!-- .pi/skills/e2e-test/SKILL.md -->
# E2E Testing Skill

Use when verifying UI changes after merge.

## Desktop Test
```bash
npx playwright test --project=desktop --grep="<test-name>"
```

## Mobile Test
```bash
npx playwright test --project=mobile --grep="<test-name>"
```

## Screenshot Comparison
```bash
npx playwright show-report
```
```

**Pros:** Zero code, uses existing Playwright infrastructure.
**Cons:** Less integrated, agent must interpret CLI output, no inline screenshots.

### MCP Problem Resolution

Use **Solution A (pi-mcp-adapter)** for immediate migration -- it preserves the existing Chrome DevTools MCP workflow with minimal changes. Transition to **Solution B (Playwright extension)** over time for better performance and fewer dependencies. Solution B is ultimately superior because it eliminates the MCP indirection layer.

---

## 3. The Sub-Agent Gap

### The Problem

Pi has no native sub-agent support. L-Thread's core value is orchestrating multiple agents. Claude Code provides native `Task`, `SendMessage`, and `TaskList` tools. Pi provides none of these.

### The Ecosystem Solutions

The Pi community has already built three sub-agent extensions, each mapping to a different L-Thread mode:

#### For L-Thread Conduit Mode (Sequential): `pi-side-agents`

**Mapping:**

| L-Thread Conduit | pi-side-agents |
|-----------------|----------------|
| `conduit pane-split` | `agent-start` tool |
| `conduit terminal-write` | `agent-send` tool |
| `conduit terminal-read` | `agent-check` tool |
| `conduit terminal-wait` | `agent-wait-any` tool |
| `conduit pane-close` | Agent auto-terminates on task completion |

**Architecture match:** High. Both use tmux under the hood. pi-side-agents creates isolated tmux windows with git worktrees per agent. This is actually *better* than L-Thread Conduit because each agent gets filesystem isolation.

#### For L-Thread Teams Mode (Parallel): `pi-collaborating-agents`

**Mapping:**

| L-Thread Teams | pi-collaborating-agents |
|---------------|------------------------|
| `Task` tool | `subagent` tool |
| `SendMessage` | `agent_message` tool (direct + broadcast) |
| `TaskList` | `agent_message` action: status |
| `TaskUpdate` | `agent_message` action: reserve/release files |
| Peer-to-peer | Auto-registration + inbox delivery |

**Architecture match:** Medium-High. The message passing model is file-system-based (JSONL inboxes) rather than Claude Code's in-memory routing, but the semantics are equivalent. The file reservation system is a bonus L-Thread does not have.

#### For Complex Chains: `pi-subagents`

**Mapping:**

| L-Thread Pattern | pi-subagents |
|-----------------|--------------|
| Sequential agent spawning | Chain orchestration (`.chain.md` files) |
| Agent output as next input | `{previous}` template variable |
| Parallel fan-out | `parallel:` block with concurrency control |
| Async background agents | `--bg` flag / `async: true` |

**Architecture match:** This goes beyond what L-Thread currently supports. Chain definitions allow codified workflows that L-Thread currently hardcodes in prompts.

### Sub-Agent Cost Assessment

| Approach | Lines of Code | Development Time | Risk |
|----------|--------------|-----------------|------|
| Use `pi-side-agents` as-is | 0 (install package) | 1 day integration | Low |
| Use `pi-collaborating-agents` as-is | 0 (install package) | 2 days integration | Medium |
| Use `pi-subagents` for chains | 0 (install package) | 2 days integration | Medium |
| Build custom orchestration extension | ~800-1200 lines | 2-3 weeks | High |
| Hybrid: existing packages + thin wrapper | ~200-400 lines | 1 week | Low-Medium |

### Recommendation

Use the **hybrid approach**: install `pi-side-agents` for tmux-based orchestration (maps directly to Conduit+Tmux modes), install `pi-collaborating-agents` for multi-agent messaging (maps to Teams mode), and write a thin orchestrator extension (~200-400 lines) that provides the L-Thread-specific orchestration loop (GET_NEXT_TASK -> SPAWN -> WAIT -> REVIEW -> MERGE -> E2E -> DONE).

---

## 4. State Migration

### Current State Architecture

L-Thread uses three flat JSON files:

```
_bmad/orchestrator-state.json        # Conduit mode: phase, story, pane_id, PR
_bmad/orchestrator-teams-state.json  # Teams mode: team, PRs, sprint metrics
_bmad/orchestrator-tmux-state.json   # Tmux sessions: alive/dead status
```

### Pi State Options

Pi offers two complementary state mechanisms:

#### Option 1: `pi.appendEntry()` (Session-Scoped)

```typescript
// Append state to session JSONL
pi.appendEntry("orchestrator-state", {
  phase: "reviewing",
  currentStory: { id: "1.4", prNumber: 113 },
  reviewCycle: 2
});
```

**Pros:** Survives compaction, part of session history, can be navigated with `/tree`.
**Cons:** Session-scoped (lost on `/new`), JSONL append-only (no in-place update).

#### Option 2: External JSON Files (Current Approach)

Continue using `_bmad/*.json` files via `pi.exec()`:

```typescript
pi.on("turn_end", async (event, ctx) => {
  const state = buildCurrentState();
  const fs = await import("fs/promises");
  await fs.writeFile("_bmad/orchestrator-state.json", JSON.stringify(state, null, 2));
});
```

**Pros:** Identical to current system, survives session changes, readable by external tools.
**Cons:** Not integrated with Pi session history.

#### Recommended: Hybrid

Use **both**. `pi.appendEntry()` for session-scoped state that benefits from tree navigation and compaction survival. External JSON files for cross-session state that external tools (tmux helpers, monitoring scripts) need to read.

```typescript
// In the orchestrator extension:
function updateState(pi: ExtensionAPI, state: OrchestratorState) {
  // Pi session state (survives compaction, navigable)
  pi.appendEntry("orchestrator-state", state);

  // External file (survives session changes, readable by scripts)
  const fs = require("fs");
  fs.writeFileSync("_bmad/orchestrator-state.json", JSON.stringify(state, null, 2));
}
```

### Migration Path for State

1. Keep existing JSON file format unchanged
2. Add `pi.appendEntry()` as secondary persistence
3. Migrate SessionStart hook logic into `session_start` extension event
4. Migrate PreCompact hook logic into `session_before_compact` extension event

No data migration needed -- the JSON files are the same format.

---

## 5. The "No Code" Rule Enforcement

### Current Enforcement: Prompt-Only

L-Thread enforces Rule 1 ("DU BIST KEIN ENTWICKLER") entirely through prompt engineering. The orchestrator is told to never use Edit/Write on code files. This works but is fragile -- a sufficiently long context or a model that "forgets" can violate it.

### Pi Enforcement: Hook-Based (Strictly Better)

Pi's `tool_call` hook can **programmatically block** code-writing attempts:

```typescript
// .pi/extensions/orchestrator-discipline.ts
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as path from "path";

const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs",
  ".java", ".css", ".scss", ".html", ".vue", ".svelte",
  ".sql", ".sh", ".yaml", ".yml", ".toml"
]);

const ALLOWED_WRITE_PATTERNS = [
  /orchestrator-.*\.json$/,
  /orchestrator-.*-state\.json$/,
  /devlog\.md$/,
  /overseer-state\.json$/,
  /AUTO_MODE$/,
  /\.bmad\/.*\.md$/,
];

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    const { toolName, args } = event;

    // Block Edit and Write on code files
    if (toolName === "edit" || toolName === "write") {
      const filePath = args.file_path || args.path || "";
      const ext = path.extname(filePath).toLowerCase();

      // Check if it's a code file
      if (CODE_EXTENSIONS.has(ext)) {
        // Check if it's in the allowed list
        const isAllowed = ALLOWED_WRITE_PATTERNS.some(p => p.test(filePath));
        if (!isAllowed) {
          return {
            block: true,
            reason: `[ORCHESTRATOR DISCIPLINE] BLOCKED: You are the orchestrator. ` +
              `You NEVER write code. Spawn an agent to handle: ${filePath}`
          };
        }
      }
    }

    // Block bash commands that create/modify code files
    if (toolName === "bash") {
      const cmd = args.command || "";
      if (cmd.match(/\b(cat\s*<<|echo\s.*>|sed\s+-i|tee\s)/)) {
        const hasCodeExt = [...CODE_EXTENSIONS].some(ext => cmd.includes(ext));
        if (hasCodeExt) {
          return {
            block: true,
            reason: `[ORCHESTRATOR DISCIPLINE] BLOCKED: Shell command appears to modify code. ` +
              `Spawn an agent instead.`
          };
        }
      }
    }
  });
}
```

**This is strictly superior to prompt-only enforcement.** The hook fires before every tool execution. The model cannot bypass it regardless of context length, compaction, or prompt injection. The block reason is returned to the model, reinforcing the rule.

### E2E Testing Gate Enforcement

Similarly, the "mark done" action can be gated:

```typescript
let lastE2EResult: { passed: boolean; timestamp: string } | null = null;

pi.on("tool_call", async (event, ctx) => {
  // Track E2E test results
  if (event.toolName === "e2e_test" || event.toolName === "mcp") {
    // Will be populated by tool_result hook
  }

  // Block issue close without E2E
  if (event.toolName === "bash") {
    const cmd = event.args.command || "";
    if (cmd.includes("gh issue close") || cmd.includes("mark_done")) {
      if (!lastE2EResult || !lastE2EResult.passed) {
        return {
          block: true,
          reason: `[E2E GATE - INC-014] Cannot close issue without passing E2E test. ` +
            `Run e2e_test first (desktop + mobile).`
        };
      }
    }
  }
});

pi.on("tool_result", async (event, ctx) => {
  if (event.toolName === "e2e_test") {
    lastE2EResult = {
      passed: !event.isError && event.result?.includes("PASS"),
      timestamp: new Date().toISOString()
    };
  }
});
```

### Bounded Review Loop Enforcement

```typescript
let reviewCycles = 0;
const MAX_REVIEW_CYCLES = 3;

pi.on("tool_call", async (event, ctx) => {
  // Detect review agent spawn
  if (event.toolName === "agent-start" && event.args.task?.includes("review")) {
    reviewCycles++;
    if (reviewCycles > MAX_REVIEW_CYCLES) {
      return {
        block: true,
        reason: `[BOUNDED REVIEW] Max ${MAX_REVIEW_CYCLES} review cycles reached. ` +
          `Evaluate: merge with notes, or skip task.`
      };
    }
  }
});
```

### Summary: Enforcement is *Better* in Pi

| Rule | L-Thread (Prompt) | Pi (Hook) |
|------|-------------------|-----------|
| No code writing | Model must "remember" | Programmatic block, cannot bypass |
| E2E gate | Prompt instruction | Tool call blocked until E2E passes |
| Review bounds | Prompt counter | Extension counter, hard block at limit |
| AUTO-MODE | File check in prompt | Extension reads file, suppresses user prompts |

---

## 6. Progressive Migration Path

### Phase 0: Coexistence Setup (Day 1)

Run Pi alongside Claude Code. They use different config directories (`.pi/` vs `.claude/`) and do not conflict.

```
project/
  .claude/agents/orchestrator.md     # Existing L-Thread
  .claude/commands/orchestrator.md   # Existing Conduit command
  .pi/extensions/                    # New Pi extensions
  .pi/settings.json                  # Pi config
  .pi/agents/                        # Pi agent definitions
  _bmad/                             # Shared state (both systems read/write)
```

**Key insight:** Both systems can read the same `_bmad/*.json` state files. The tmux sessions are also shared infrastructure. This means you can run Claude Code for some projects and Pi for others, with the Overseer agent monitoring both.

### Phase 1: Enforcement Extensions (Week 1-2)

Build the low-risk, high-value extensions first:

1. `orchestrator-discipline.ts` -- No-code rule enforcement
2. `e2e-gate.ts` -- E2E testing gate
3. `state-manager.ts` -- State persistence (dual: appendEntry + JSON file)
4. `session-hooks.ts` -- SessionStart + PreCompact equivalents

These extensions work standalone -- they enforce rules on any Pi session regardless of whether the full orchestration loop is migrated.

### Phase 2: Sub-Agent Integration (Week 3-5)

Install and configure the community sub-agent extensions:

```bash
pi install npm:@pasky/pi-side-agents
pi install npm:@nicobailon/pi-subagents
pi install npm:@nicobailon/pi-mcp-adapter
```

Build the orchestrator loop extension:

1. `orchestrator-loop.ts` -- The main GET_NEXT -> SPAWN -> WAIT -> REVIEW -> MERGE -> E2E -> DONE loop
2. `roadblock-recovery.ts` -- FutureLearnings lookup + recovery agent spawning

### Phase 3: Full Migration (Week 6-8)

1. Migrate E2E testing from Chrome DevTools MCP to Playwright extension
2. Build workflow chain definitions (`.chain.md` files) for standard patterns
3. Migrate the Overseer agent to Pi
4. Deprecate Claude Code dependency

### Parallel Running During Transition

| Project | Week 1-2 | Week 3-5 | Week 6-8 |
|---------|----------|----------|----------|
| Orchestrator meta-project | Pi (testing ground) | Pi | Pi |
| Lagerlink | Claude Code | Claude Code + Pi enforcement | Pi |
| CityHub | Claude Code | Claude Code | Pi |
| Finance Agent | Claude Code | Pi | Pi |
| ContentOS | Claude Code | Claude Code | Pi |

Start with one low-risk project on Pi, expand as confidence grows.

---

## 7. Extensions to Build

### Extension 1: `lthread-orchestrator-discipline` (Core)

**Purpose:** Enforce the 4 Absolute Rules programmatically.
**Hooks used:** `tool_call`, `tool_result`, `input`, `session_start`
**Lines of code:** ~150
**Priority:** P0 -- build first

```typescript
// Functionality:
// - Block Edit/Write on code files (Rule 1)
// - Block issue close without E2E (Rule 2)
// - Suppress user input prompts in AUTO-MODE (Rule 3)
// - Auto-update state after phase transitions (Rule 4)
```

### Extension 2: `lthread-state-manager` (Core)

**Purpose:** Manage orchestrator state with dual persistence.
**Hooks used:** `session_start`, `session_before_compact`, `turn_end`, `session_shutdown`
**Lines of code:** ~200
**Priority:** P0

```typescript
// Functionality:
// - Load state from JSON files on session start (equivalent to SessionStart hook)
// - Save state to both appendEntry and JSON file on every phase change
// - Probe tmux sessions and update tmux state
// - Inject state context via before_agent_start
// - Persist state before compaction (equivalent to PreCompact hook)
```

### Extension 3: `lthread-e2e-testing` (Core)

**Purpose:** E2E testing gate with Chrome DevTools MCP (via adapter) or Playwright.
**Hooks used:** `tool_call` (gate), custom tool registration
**Lines of code:** ~300
**Priority:** P0

```typescript
// Functionality:
// - Register e2e_test tool (Playwright or MCP proxy)
// - Desktop testing (1920x1080)
// - Mobile testing (iPhone 14 Pro emulation, 390px)
// - Screenshot capture and inline display
// - Track test results for gate enforcement
// - Block "mark done" without passing E2E
```

### Extension 4: `lthread-orchestrator-loop` (Orchestration)

**Purpose:** The main automated orchestration loop.
**Hooks used:** `input`, `before_agent_start`, `agent_end`, custom commands
**Lines of code:** ~500
**Priority:** P1

```typescript
// Functionality:
// - /orchestrate command to start the loop
// - GET_NEXT_STORY: query GitHub issues
// - SPAWN_DEV_AGENT: via pi-side-agents or pi-collaborating-agents
// - WAIT_FOR_PR: event-driven via agent-wait-any
// - REVIEW_CYCLE: spawn review agent, bounded to 3 cycles
// - AUTO_MERGE: gh pr merge
// - E2E_TEST: invoke e2e_test tool
// - MARK_DONE: close issue (only if E2E passed)
// - LOG: append to devlog
// - AUTO_CONTINUE: loop without user prompt
```

### Extension 5: `lthread-roadblock-recovery` (Intelligence)

**Purpose:** FutureLearnings incident database lookup and recovery agent spawning.
**Hooks used:** `tool_result` (detect errors), custom command
**Lines of code:** ~200
**Priority:** P1

```typescript
// Functionality:
// - /roadblock command for manual invocation
// - Auto-detect error patterns in tool results
// - Load and search memory/FutureLearnings.md
// - Match error symptoms to INC-XXX entries
// - Send fix instructions to stuck agents
// - Spawn recovery agents if needed
// - AUTO-MODE: skip after 3 attempts
```

### Extension 6: `lthread-tiered-context` (Intelligence)

**Purpose:** Dynamic context injection based on what the agent needs.
**Hooks used:** `before_agent_start`, `context`
**Lines of code:** ~150
**Priority:** P2

```typescript
// Functionality:
// - Tier 0: Always inject absolute rules (via system prompt / AGENTS.md)
// - Tier 1: Inject session state on every agent start
// - Tier 2: On-demand injection:
//   - Load FutureLearnings when errors detected
//   - Load sprint briefings when starting new sprint
//   - Load project docs when agent needs architecture context
// - Context event to strip stale tier 2 data before LLM calls
```

### Extension 7: `lthread-devlog` (Observability)

**Purpose:** Automatic devlog generation.
**Hooks used:** `agent_end`, `session_shutdown`
**Lines of code:** ~100
**Priority:** P2

```typescript
// Functionality:
// - Append to .bmad/devlog.md after each task completion
// - Include: task ID, PR number, duration, review cycles, E2E result
// - Track skipped tasks with reasons
// - Session summary on shutdown
```

### Extension 8: `lthread-cost-tracker` (Observability)

**Purpose:** Token and cost tracking (new capability not in current L-Thread).
**Hooks used:** `message_end`, `turn_end`, `agent_end`
**Lines of code:** ~100
**Priority:** P3

```typescript
// Functionality:
// - Track tokens per agent, per task, per session
// - Calculate cost based on model pricing
// - Display in status line via ctx.ui.setStatus()
// - Log to devlog and state file
// - Alert when approaching budget limits
```

### Total Extension Code Estimate

| Extension | Lines | Priority |
|-----------|-------|----------|
| orchestrator-discipline | 150 | P0 |
| state-manager | 200 | P0 |
| e2e-testing | 300 | P0 |
| orchestrator-loop | 500 | P1 |
| roadblock-recovery | 200 | P1 |
| tiered-context | 150 | P2 |
| devlog | 100 | P2 |
| cost-tracker | 100 | P3 |
| **Total** | **~1,700** | |

Plus configuration files (~200 lines), `AGENTS.md` (~300 lines), skills (~100 lines) = **~2,300 total lines**. This is substantially more than the current 0-code approach but provides programmatic enforcement rather than prompt-only "please follow the rules."

---

## 8. Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Chrome DevTools MCP instability via adapter** | E2E gate breaks, tasks stuck at "merge" phase | Build Playwright fallback extension; test adapter thoroughly before migration |
| **Sub-agent extension immaturity** | Agent spawning failures, communication drops | Use pi-side-agents (simple tmux model); avoid complex chain patterns initially |
| **Pi breaking changes** | Extensions break on Pi update | Pin Pi version; use `pi.lock` or npm lockfile; test extensions before upgrading |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Context window differences across models** | Tiered context assumptions break with smaller models | Test with target models; implement dynamic context sizing based on `ctx.getContextUsage()` |
| **Extension loading order conflicts** | Multiple extensions hooking same events cause race conditions | Define explicit priority ordering; test extension combinations |
| **Loss of Claude Code IDE integration** | Cannot use VS Code / JetBrains inline editing | Pi is terminal-native; accept this as a deliberate trade-off for flexibility |
| **oh-my-pi vs pi-mono divergence** | Community splits, extensions incompatible between forks | Start with pi-mono (upstream); oh-my-pi adds subagents natively if you need them later |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **State file format incompatibility** | JSON files unreadable | Same JSON format; no migration needed |
| **tmux session handling differences** | Sessions don't persist correctly | Both systems use tmux identically |
| **Model quality differences** | Non-Claude models produce worse code | Use Claude via Pi's Anthropic provider initially; experiment with alternatives later |

### The "Oh-My-Pi vs Pi-Mono" Decision

This is a strategic choice that affects the entire migration:

| Dimension | Pi-Mono (badlogic) | Oh-My-Pi (can1357) |
|-----------|-------------------|-------------------|
| Philosophy | Minimal, DIY | Batteries-included |
| Sub-agents | None (use extensions) | Built-in (6 bundled agents) |
| MCP | None (use extensions) | Native MCP support |
| Git integration | Basic (bash tool) | Advanced (split commits, hunk staging) |
| LSP | None | Built-in (40+ languages) |
| Browser | None | Built-in |
| Extension compat | Pi-mono extensions | Pi-mono extensions + omp-specific |
| Release pace | Moderate | Fast (v13.9.2 as of today) |
| Risk | More stable, fewer features | More features, more breaking changes |

**Recommendation:** Start with **pi-mono** for maximum control and stability. The extension ecosystem (pi-subagents, pi-mcp-adapter, pi-collaborating-agents) fills the gaps without vendor lock-in. If you find yourself building too much custom infrastructure, evaluate oh-my-pi -- it has native sub-agents and MCP already built in, which eliminates two of the three high-effort migration items.

---

## 9. Timeline Estimate

### Phase 1: Foundation (Weeks 1-2)

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 1 | Install Pi, set up `.pi/` config, write `AGENTS.md`, build orchestrator-discipline + state-manager extensions | Pi running alongside Claude Code with rule enforcement |
| 2 | Build e2e-testing extension (MCP adapter), test against existing Lagerlink app | E2E gate working in Pi |

**Exit criteria:** Pi can enforce all 4 Absolute Rules and run E2E tests independently.

### Phase 2: Orchestration (Weeks 3-5)

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 3 | Install pi-side-agents, build orchestrator-loop extension (sequential mode) | Single-agent orchestration loop working in Pi |
| 4 | Install pi-collaborating-agents, extend loop for parallel mode | Multi-agent orchestration working |
| 5 | Build roadblock-recovery + tiered-context extensions, test full loop on one project | Complete orchestration on one project |

**Exit criteria:** Full L-Thread loop (GET_NEXT -> SPAWN -> REVIEW -> MERGE -> E2E -> DONE) running in Pi.

### Phase 3: Migration (Weeks 6-8)

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 6 | Migrate Lagerlink and Finance Agent to Pi | 2 projects on Pi |
| 7 | Migrate remaining projects, build Playwright extension (replace MCP adapter) | All projects on Pi |
| 8 | Build devlog + cost-tracker extensions, package as pi-package for sharing | Complete migration, shareable package |

**Exit criteria:** All projects running on Pi. Claude Code optional (can still use for IDE integration).

### Total: ~8 weeks part-time (evenings/weekends) or ~3-4 weeks full-time

---

## 10. Recommendation

### Verdict: Progressive Migration to Pi-Mono

**Do not** do a big-bang migration. **Do** run both systems in parallel and progressively shift.

### Why Migrate

1. **Programmatic enforcement beats prompt engineering.** The `tool_call` hook blocking code writes is categorically more reliable than a German-language instruction in a markdown file. Every L-Thread incident (INC-014, INC-015) would have been prevented by a Pi extension hook.

2. **Model flexibility unlocks cost optimization.** Pi's multi-provider support means using Haiku/Gemini Flash for simple review tasks and Opus for complex architecture decisions. L-Thread is locked to whatever Claude Code ships.

3. **Extension composability across projects.** Build the orchestrator extensions once, install via `pi install` in every project. Currently, you copy markdown files to each project's `.claude/` directory.

4. **Version stability.** Pin Pi to a specific version. Claude Code auto-updates and has historically broken CLAUDE.md parsing, hook behavior, and Teams API.

5. **The Overseer pattern becomes trivial.** The Overseer agent (`.claude/agents/overseer.md`) currently monitors tmux sessions via `capture-pane`. In Pi, it becomes an extension with `turn_end` hooks -- no separate tmux session needed.

### Why Not Migrate Everything

1. **Keep Claude Code for IDE users.** If team members prefer VS Code / JetBrains integration, Claude Code still has value. Pi is terminal-only.

2. **Keep Chrome DevTools MCP as fallback.** Until the Playwright extension is battle-tested, the MCP adapter provides continuity.

3. **Keep the markdown orchestrator prompts.** The orchestrator persona description in `AGENTS.md` (Pi's equivalent of `.claude/agents/`) will be nearly identical to the current `orchestrator.md`. The prompt engineering work is not wasted -- it migrates directly.

### The Pi-Mono + Extensions Stack

```
Layer 4: L-Thread Orchestrator Extension (your custom loop)
         +-- orchestrator-discipline.ts (Rule enforcement)
         +-- orchestrator-loop.ts (Automated loop)
         +-- state-manager.ts (Dual persistence)
         +-- e2e-testing.ts (Playwright or MCP)
         +-- roadblock-recovery.ts (INC-XXX database)
         +-- tiered-context.ts (Dynamic context injection)
         +-- devlog.ts (Observability)
         +-- cost-tracker.ts (Token/cost tracking)

Layer 3: Community Extensions
         +-- pi-side-agents (tmux-based sub-agents)
         +-- pi-collaborating-agents (message passing)
         +-- pi-mcp-adapter (MCP bridge, temporary)

Layer 2: Pi Coding Agent (@mariozechner/pi-coding-agent)
         +-- Session management (JSONL)
         +-- Extension system (25+ hooks)
         +-- Built-in tools (read, write, edit, bash)
         +-- Compaction + tree navigation

Layer 1: Pi AI (@mariozechner/pi-ai)
         +-- Multi-provider LLM API
         +-- 20+ providers (Anthropic, OpenAI, Google, etc.)
         +-- Streaming + tool calling
         +-- Token/cost tracking

Layer 0: Runtime
         +-- Node.js + TypeScript (jiti)
         +-- tmux (session management)
         +-- Git (worktree isolation)
```

### What You Gain vs What You Lose (Final Tally)

| Gain | Lose |
|------|------|
| Programmatic rule enforcement (hooks) | Zero-code simplicity (prompt-only) |
| Multi-model routing (Haiku for reviews, Opus for code) | Locked to Claude family in Claude Code |
| Extension composability (npm packages) | Copy-paste simplicity |
| Version pinning (no surprise updates) | Auto-updates with latest features |
| Cost tracking built into stack | No cost visibility |
| Community extensions (subagents, MCP, etc.) | Native Claude Code features (Teams, Task) |
| Full context manipulation (`context` event) | Opaque context handling |
| RPC mode for external automation | GUI/IDE integration |
| 25+ hook points | 14 hook points |
| Works with any LLM provider | Best-in-class Anthropic integration |

### The Bottom Line

L-Thread Orchestrator proved that pure prompt engineering can build a sophisticated multi-agent system. But prompt engineering has a ceiling: rules can be forgotten, enforcement is soft, and you are locked to one vendor's runtime. Pi removes that ceiling by giving you TypeScript hooks that execute before the model ever sees a tool call.

The migration cost is real (~2,300 lines of TypeScript, ~8 weeks part-time), but the result is a system where your orchestration rules are *code*, not *suggestions*. And every extension you build is reusable across every project you touch.

Start with the enforcement extensions. If they prove their value in Week 1, the rest of the migration justifies itself.

---

## Appendix A: Pi Configuration Files

### `.pi/settings.json`

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "scopedModels": [
    "anthropic/claude-opus-4",
    "anthropic/claude-sonnet-4-5",
    "anthropic/claude-haiku-3-5"
  ],
  "thinking": "medium",
  "extensions": [
    ".pi/extensions/orchestrator-discipline.ts",
    ".pi/extensions/state-manager.ts",
    ".pi/extensions/e2e-testing.ts",
    ".pi/extensions/orchestrator-loop.ts",
    ".pi/extensions/roadblock-recovery.ts",
    ".pi/extensions/tiered-context.ts",
    ".pi/extensions/devlog.ts",
    ".pi/extensions/cost-tracker.ts"
  ],
  "packages": [
    "npm:@pasky/pi-side-agents",
    "npm:@nicobailon/pi-subagents",
    "npm:@nicobailon/pi-mcp-adapter",
    "npm:@baochunli/pi-collaborating-agents"
  ]
}
```

### `AGENTS.md` (Pi equivalent of `.claude/agents/orchestrator.md`)

```markdown
# L-Thread Orchestrator

You are the L-Thread Orchestrator. You NEVER write code. You orchestrate.

## Rules (enforced by extensions -- violations will be BLOCKED)

1. You will never successfully edit or write code files. The system blocks it.
2. You cannot close issues without passing E2E tests. The system blocks it.
3. Review cycles are bounded to 3. The system blocks additional reviews.
4. In AUTO-MODE, user prompts are suppressed. The system handles it.

## Workflow

[Same orchestration loop content as current orchestrator.md]
```

### `.pi/mcp.json` (For MCP adapter, temporary)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/chrome-devtools-mcp"],
      "lifecycle": "lazy",
      "directTools": [
        "navigate_page", "take_screenshot", "emulate",
        "evaluate_script", "click", "fill", "list_pages"
      ]
    }
  }
}
```

---

## Appendix B: Decision Matrix -- Which Pi Fork?

Use this if the choice between pi-mono and oh-my-pi becomes relevant during migration:

| Decision Factor | Choose Pi-Mono | Choose Oh-My-Pi |
|----------------|----------------|-----------------|
| You want maximum control | Yes | |
| You want batteries-included sub-agents | | Yes |
| You want native MCP without adapter | | Yes |
| You want stable, minimal releases | Yes | |
| You want LSP integration | | Yes |
| You want community extension compatibility | Yes (superset) | Yes |
| You want to minimize custom code | | Yes |
| You want to avoid fork risk | Yes (upstream) | |

If you choose oh-my-pi, the migration becomes simpler because sub-agents and MCP are built in. But you take on a faster-moving dependency with more breaking change risk. The extension code estimate drops from ~2,300 to ~1,200 lines (no need for sub-agent glue or MCP adapter config).

---

## Sources

- [Pi-Mono (badlogic/pi-mono)](https://github.com/badlogic/pi-mono)
- [Pi Coding Agent Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi Coding Agent README](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md)
- [Oh-My-Pi (can1357/oh-my-pi)](https://github.com/can1357/oh-my-pi)
- [Pi MCP Adapter](https://github.com/nicobailon/pi-mcp-adapter)
- [Pi-Subagents Extension](https://github.com/nicobailon/pi-subagents)
- [Pi-Side-Agents Extension](https://github.com/pasky/pi-side-agents)
- [Pi-Collaborating-Agents Extension](https://github.com/baochunli/pi-collaborating-agents)
- [Overstory Multi-Agent Orchestration](https://github.com/jayminwest/overstory)
- [@mariozechner/pi-coding-agent on npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Official Site](https://shittycodingagent.ai/)
- [Nader Dabit: How to Build a Custom Agent Framework with PI](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Mario Zechner: What I learned building a coding agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
