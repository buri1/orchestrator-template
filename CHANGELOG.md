# Changelog

All notable changes to the L-Thread Orchestrator Template are documented here.

## [2.0.0] - 2026-02-07

### Breaking Changes
- Orchestrator is now a **Custom Agent** (`.claude/agents/orchestrator.md`) instead of only a Command
- `setup.sh` is now the primary installation method for global availability
- Hook scripts updated to v3 with different state file paths and mode detection
- Old `setup/quick-setup.sh` replaced by root-level `setup.sh`

### Added
- **Custom Agent** `.claude/agents/orchestrator.md` with Tiered Context System
  - Tier 0: Absolute Rules + Mode Detection (always loaded)
  - Tier 1: Session Context (injected by SessionStart hook)
  - Tier 2: On-Demand Context (FutureLearnings, Sprint Briefings)
- **Claude Code Teams Support** via `orchestrator-teams.md` command
  - Parallel agent execution (2-3 dev agents + reviewer)
  - Peer-to-peer communication (agents message each other directly)
  - Native TaskList/TaskCreate/TaskUpdate as primary state
  - Custom state only for PR-tracking and sprint metrics
- **Roadblock Recovery Pattern** via `roadblock-recovery.md` command
  - Structured incident lookup from `memory/FutureLearnings.md`
  - Pattern matching: error symptoms -> INC-XXX entries -> fix instructions
  - Recovery agent spawning for stuck agents
  - New incident documentation template
- **Mode Detection** -- Orchestrator auto-detects Conduit vs Teams mode
  - Conduit: `conduit pane-list` succeeds
  - Teams: `SendMessage` tool available
- **Global Installation** via `setup.sh`
  - Symlinks (default) for auto-updates when repo is pulled
  - Copy mode for static installations
  - Backup of existing files before overwrite
  - Uninstall support (`--remove`)
  - Idempotent (safe to run multiple times)
- **E2E Testing as Mandatory Gate** (INC-014, INC-015)
  - Chrome DevTools MCP required (not just curl)
  - Desktop AND Mobile testing (emulate iPhone 14 Pro)
  - Issues cannot be marked Done without E2E pass

### Changed
- **SessionStart Hook** (v2 -> v3): Mode-agnostic, supports both Conduit and Teams state files
- **PreCompact Hook** (v2 -> v3): Updates all existing state files, not just one
- **Conduit Command** now references Custom Agent for core rules instead of duplicating them
- **State file path** standardized to `_bmad/orchestrator-state.json` (Conduit) and `_bmad/orchestrator-teams-state.json` (Teams)
- Orchestrator loop now includes mandatory E2E step between merge and Done

### Fixed
- INC-014: E2E Testing is now a GATE before marking issues as Done
- INC-015: Chrome DevTools MCP usage is mandatory and documented

## [1.0.0] - 2026-02-01

### Added
- Initial L-Thread Orchestrator Template
- Conduit CLI integration for agent management
- BMAD Code Review integration
- Auto-Mode for fully autonomous operation
- Persistent state management via `_bmad/orchestrator-state.json`
- PreCompact handoff mechanism for context preservation
- SessionStart hook for state injection after compaction
- Process cleanup (orphaned vitest/node/next processes)
- Devlog for session logging
- Quick setup script
- GitHub issue-based task tracking with label filters
