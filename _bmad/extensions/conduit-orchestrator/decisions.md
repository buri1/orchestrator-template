# L-Thread Orchestrator - Architecture Decisions

> Documenting key decisions made during the design of the CityHub L-Thread Orchestrator
> Session: 2026-01-29

---

## Table of Contents

1. [Thread Pattern Selection](#1-thread-pattern-selection)
2. [Agent Spawning Strategy](#2-agent-spawning-strategy)
3. [Review & Merge Workflow](#3-review--merge-workflow)
4. [Context Management](#4-context-management)
5. [Automation & Permissions](#5-automation--permissions)
6. [Technical Discoveries](#6-technical-discoveries)

---

## 1. Thread Pattern Selection

### Decision: L-Thread (Long-running) Pattern

**Chosen over**: B-Thread (Base), P-Thread (Parallel), C-Thread (Chained)

**Rationale**:
- The orchestrator needs to run as a continuous loop, processing stories sequentially
- High autonomy between checkpoints (user only involved at PR review)
- Scales compute (agent work time) without scaling user presence
- Simple mental model: one loop, one agent at a time

**Thread Taxonomy (from IndyDevDan)**:
| Thread Type | Description | Our Usage |
|-------------|-------------|-----------|
| **B-Thread** (Base) | Single prompt → work → review | Dev Agent per story |
| **P-Thread** (Parallel) | Multiple agents simultaneously | Not used (too complex) |
| **C-Thread** (Chained) | Sequential handoffs | Story phases if needed |
| **F-Thread** (Fusion) | Multiple models combined | Not used |
| **L-Thread** (Long) | Continuous orchestration loop | **Our orchestrator** |
| **Z-Thread** (Zero-touch) | Fully autonomous | Future goal |

**Key Insight**: The orchestrator is L-Thread, but each spawned Dev Agent is B-Thread (simple: prompt → implement → PR).

---

## 2. Agent Spawning Strategy

### Decision: Real Claude Sessions via Conduit CLI (Not Subagents)

**Chosen over**: Task tool subagents, parallel agents, direct prompting

**Rationale**:
1. **Visibility**: Real terminal panes are visible - you can watch the agent work
2. **Isolation**: Each agent has its own full context, no pollution between stories
3. **Debuggability**: If something goes wrong, you can read the terminal output
4. **True CRUD**: Conduit CLI provides Create/Read/Delete for agent sessions
5. **Resource management**: One agent at a time prevents context explosion

**Implementation via Conduit CLI**:
```bash
# CREATE (Spawn Agent)
conduit pane-split right -t terminal
pane_id=$(conduit pane-list | jq -r '.[-1].id')
conduit terminal-write -p $pane_id -e "cd $PWD && claude"
conduit terminal-write -p $pane_id -e "/bmad_bmm_agent_dev"
conduit terminal-write -p $pane_id -e "<story_id>"

# READ (Monitor Agent)
conduit terminal-read -p $pane_id

# DELETE (Close Agent)
conduit pane-close -p $pane_id
```

**Why not subagents (Task tool)?**
- Subagents run "hidden" - no visibility into their work
- Context sharing between subagents is problematic
- No true lifecycle management (can't cleanly terminate)
- Harder to debug when things go wrong

---

## 3. Review & Merge Workflow

### Decision: CodeRabbit as First Gate, TDD as Second Gate

**The Two-Gate System**:

```
PR Created
    │
    ▼
┌─────────────────┐
│ GATE 1:         │
│ CodeRabbit      │ ◄── AI Review (quality, security, patterns)
│ Review          │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 Clean    Has Issues
    │         │
    │         ▼
    │    Fix Agent
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │ GATE 2:         │
    │    │ Tests Pass      │ ◄── TDD Verification
    │    │ (pnpm test)     │
    │    └────────┬────────┘
    │             │
    └──────┬──────┘
           │
           ▼
      AUTO-MERGE
```

### Decision: Auto-Merge After Fix WITHOUT Second CodeRabbit Review

**Rationale**:
1. **Time efficiency**: Waiting for CodeRabbit again adds 2-5 minutes per fix cycle
2. **TDD is sufficient**: If tests pass, the fix is verified
3. **Diminishing returns**: CodeRabbit already identified the issues; fix agent addressed them
4. **Trust the process**: The fix agent specifically targets CodeRabbit's feedback

**The Logic**:
```
IF tests pass after fix commit:
  → Merge immediately
  → Do NOT wait for CodeRabbit re-review

IF tests fail after fix commit:
  → Notify user
  → Manual intervention required
```

### Decision: Issue Categorization for Merge Decisions

**Categories**:
- **Critical**: Security vulnerabilities, breaking changes, bugs → Must fix
- **Major**: Deprecated APIs, performance issues, architecture → Must fix
- **Minor**: Style, documentation, nitpicks → Can merge anyway

**Merge Decision Matrix**:
| Review Result | Action |
|---------------|--------|
| No comments | Auto-merge |
| Only minor | Auto-merge |
| Has critical/major | Spawn fix agent |

---

## 4. Context Management

### Decision: Fresh Context Per Story (Close Pane After Each Cycle)

**Rationale**:
1. **Context pollution**: Long-running agents accumulate stale context
2. **Memory efficiency**: Each story starts with clean slate
3. **Debugging clarity**: Issues isolated to specific story
4. **Predictability**: Every story gets same starting conditions

**Implementation**:
```bash
# After merge OR before spawning fix agent
conduit pane-close -p $current_pane_id

# Then spawn fresh agent
conduit pane-split right -t terminal
# ... start new Claude session
```

**When to close pane**:
- After successful merge (story complete)
- Before spawning fix agent (fresh context for fixes)
- On explicit `stop` command from user

---

## 5. Automation & Permissions

### Decision: Wildcard Permissions for Orchestrator Commands

**Problem**: Every `conduit`, `gh`, `git` command prompted for permission, breaking automation flow.

**Solution**: Added to `.claude/settings.local.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(conduit:*)",
      "Bash(gh:*)",
      "Bash(git:*)",
      "Bash(pnpm:*)",
      "Bash(npx:*)",
      "Bash(sleep:*)",
      "Bash(cat:*)",
      "Bash(tail:*)",
      "Bash(head:*)",
      "Bash(node -e:*)"
    ]
  }
}
```

**Rationale**:
- Orchestrator needs to run unattended between checkpoints
- These commands are safe (read-only or project-scoped)
- User intervention only needed at PR review decision points

---

## 6. Technical Discoveries

### Discovery: Conduit CLI Outputs JSON by Default

**Error encountered**:
```bash
conduit pane-list --json
# Error: unknown option '--json'
```

**Resolution**: Conduit CLI outputs JSON by default. No flag needed.
```bash
# Correct usage
conduit pane-list | jq -r '.[-1].id'
```

**Impact**: Updated all Conduit commands in `orchestrator.md` and `justfile`.

### Discovery: Claude Sessions in Conduit Are Detectable

**Initial concern**: Would Claude running inside Conduit be able to detect the Conduit environment?

**Resolution**: Yes, Conduit CLI commands work from within Claude sessions running in Conduit terminals. The `--json` flag was causing silent failures, not sandbox isolation.

---

## Key Video Insights (IndyDevDan)

### From "AI Agent Orchestrator" Video:
- **CRUD for agents**: Treat agents like resources you create/delete
- **Observability is key**: If you can't see it, you can't debug it
- **One agent at a time**: Start simple, add parallelism later
- **Fresh context**: Stale context causes hallucinations

### From "Thread-Based Engineering" Video:
- **Thread taxonomy**: Different patterns for different workloads
- **L-Thread for orchestration**: Long-running, checkpoint-based
- **B-Thread for work**: Simple prompt → work → result
- **Scale compute, not presence**: User shows up at decision points only

---

## 7. Context Self-Management

### Decision: Orchestrator Recommends `/compact` at Strategic Points

**Problem**: L-Thread orchestrator accumulates context over multiple stories, eventually hitting limits.

**Constraint**: Claude cannot programmatically trigger `/compact` - it's user-invoked only.

**Solution**: Orchestrator tracks session metrics and recommends compact at strategic moments:

| Trigger | Threshold |
|---------|-----------|
| Stories completed | >= 5 |
| Fix cycles | >= 3 |
| Large story upcoming | 8+ SP with 3+ stories already done |

**Recovery After Compact**:
1. User runs `/compact`
2. User says "continue"
3. Orchestrator reads `devlog.md` to restore session state
4. Resumes from next story

**Why This Works**:
- Devlog acts as persistent state (survives compact)
- GitHub Issues are source of truth for remaining work
- No session state is lost - just compressed

---

## 8. Context Preservation via PreCompact Hook

### Problem: Context Loss After Compaction

**Discovered**: 2026-01-30

Nach einer Context-Compaction verliert der Orchestrator kritische Informationen:
- Rollen-Trennung (Orchestrator spawnt Agents, führt nicht selbst aus)
- Ob ein Agent gerade noch arbeitet
- Ob ein PR gerade durch GitHub Checks läuft
- Die komplette Orchestrator-Persona

**Symptom**: Nach Compaction hat der Orchestrator selbst Code-Reviews durchgeführt, anstatt einen Review-Agent zu spawnen.

### Solution: PreCompact Hook

Claude Code bietet einen `PreCompact` Hook, der **vor** der Compaction feuert. Der Hook-Output wird Teil des Kontexts, der dann zusammengefasst wird.

**Hook-Konfiguration** (`.claude/settings.local.json`):
```json
{
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat \"$CLAUDE_PROJECT_DIR/_bmad/orchestrator-post-compaction-briefing.md\""
          }
        ]
      }
    ]
  }
}
```

**Briefing-Datei** (`_bmad/orchestrator-post-compaction-briefing.md`):

Die Briefing-Datei enthält NICHT alle Details, sondern **Anweisungen** zum Laden der Details:

1. **Lies die volle Orchestrator-Persona**: `_bmad/extensions/conduit-orchestrator/skill/orchestrator-skill-draft.md`
2. **Lies den aktuellen State**: `_bmad/orchestrator-state.json`
3. **Prüfe GitHub-Status**: `gh pr view <pr_number> --json state,statusCheckRollup`
4. **Prüfe Agent-Panes**: `conduit panes`

### Why This Architecture?

| Ansatz | Problem |
|--------|---------|
| Alles in Briefing | Wird selbst zusammengefasst, Details gehen verloren |
| Nur "lies Datei X" | Agent muss aktiv Datei lesen nach Compaction |

**Gewählter Ansatz**: Briefing enthält klare Schritte + kritische Erinnerungen (z.B. "NIEMALS selbst Code schreiben"). Die Schritte sagen dem Agent, welche Dateien er lesen MUSS.

### Flow

```
Compaction wird getriggert (auto oder manuell)
    ↓
PreCompact Hook feuert
    ↓
cat briefing.md → Output wird in Kontext injiziert
    ↓
Compaction fasst alles zusammen (inkl. Briefing)
    ↓
Summary enthält: "SCHRITT 1: Lies Orchestrator-Persona"
    ↓
Agent führt Schritte aus → Voller Kontext wiederhergestellt
```

### Available Hooks (Reference)

| Hook | Wann | Nutzen für Orchestrator |
|------|------|------------------------|
| `SessionStart` | Neue CLI-Session | Initial context setup |
| `UserPromptSubmit` | Vor Prompt-Verarbeitung | Context enrichment |
| `PreCompact` | **Vor Compaction** | **Kritisch für uns** |
| `PreToolUse` | Vor Tool-Ausführung | Tool-spezifische Regeln |
| `Stop` | Claude will stoppen | Auto-continue enforcement |

### Lessons Learned

1. **Statische Briefing-Datei**: Keine dynamisch generierten Inhalte, sonst wird bei jedem Run überschrieben
2. **Separation of Concerns**: Briefing = "Was tun", State-Datei = "Wo stehen wir"
3. **Explizite Anweisungen**: Der Agent muss TOLD werden, Dateien zu lesen - er tut es nicht automatisch
4. **Kritische Regeln wiederholen**: Die wichtigsten Regeln (keine Code-Arbeit selbst) gehören AUCH ins Briefing

---

## Future Considerations

1. **Z-Thread (Zero-touch)**: Once confident in the system, could move toward fully autonomous operation
2. **P-Thread addition**: Parallel agents for independent epics (Phase 2)
3. **Smarter fix detection**: Use LLM to categorize CodeRabbit issues instead of keyword matching
4. **Learning loop**: Feed successful fixes back to improve Dev Agent prompts

---

## Summary

The L-Thread Orchestrator is designed around these core principles:

| Principle | Implementation |
|-----------|----------------|
| Sequential execution | One agent at a time |
| Real visibility | Conduit CLI spawns visible terminals |
| Two-gate quality | CodeRabbit + TDD |
| Time efficiency | No re-review after fix if tests pass |
| Context hygiene | Fresh pane per story |
| Minimal intervention | User only at PR review checkpoints |

This architecture balances automation with control, allowing rapid development while maintaining quality gates.
