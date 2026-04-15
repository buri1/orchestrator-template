# Venture Spine -- Meta-Orchestration Layer

The Venture Spine is a deterministic portfolio management layer for 8 coding projects. It sits above per-project orchestrators (L-Thread v3) and below the human founder. It is NOT an AI agent -- it is shell scripts + state files + Notion sync.

## Key Rule

**Do not write code in project repositories from this directory.** The Venture Spine reads state and spawns processes. It never modifies project code. If a project needs code changes, spawn a per-project orchestrator via `./run-tmux.sh <project-dir>`.

## Running Triage

```bash
# Morning health check across all 8 projects
./triage.sh              # markdown output to daily-temperature.md
./triage.sh --json       # also emit daily-temperature.json
./triage.sh --quiet      # suppress progress messages
```

Output: `daily-temperature.md` -- a traffic-light grid (RED/WARN/OK) with alerts, today's focus project, and recent activity.

## Generating Project DNA

```bash
./generate-dna.sh                  # all projects
./generate-dna.sh omniport-hh      # single project
./generate-dna.sh --output-dir dna # write to dna/ directory
```

DNA files are ~500-token compressed project summaries used for 30-second context loading.

## Checking Budget

```bash
./budget-check.sh              # JSON output, exit code 0/1/2
./budget-check.sh --verbose    # per-project breakdown on stderr
./budget-check.sh --json       # JSON-only (for piping)
```

Exit codes: 0 = GREEN/YELLOW (safe), 1 = ORANGE (throttle), 2 = RED (hard pause non-Tier-1).

## Adding a New Project

1. Edit `projects.json` -- add a new entry with name, path, repo, tier, lifecycle, stack, description, budget_share, day_theme
2. Run `./generate-dna.sh <slug>` to create initial DNA
3. Run `./triage.sh` to verify it shows up
4. Add Notion page ID to `notion-schema.md` if syncing

## Key Files

| File | Role |
|------|------|
| `projects.json` | Project registry -- source of truth for all projects (paths, repos, tiers, budgets) |
| `portfolio-state.yaml` | Portfolio-wide health, phase, budget allocations, Shape Up cycle, learnings |
| `dependencies.yaml` | Auto-generated cross-project dependency graph (20 edges) |
| `triage.sh` | Morning triage script -- polls gh + git, outputs daily-temperature.md |
| `generate-dna.sh` | Project DNA generator -- ~500-token summaries per project |
| `budget-check.sh` | Budget circuit breaker -- reads ccusage, returns health level + actions |
| `detect-deps.sh` | Dependency scanner -- shared npm, infra, knowledge, git history |
| `sync-to-notion.sh` | CQRS bridge -- pushes state to Notion Portfolio Database |
| `lifecycle-states.yaml` | Formal state machine (10 states, Shape Up integration, resource config) |
| `lifecycle-diagram.md` | State diagrams, transition map (22 transitions), decision trees |
| `metrics.md` | 10 effectiveness metrics (M1-M10) with collection scripts and kill criteria |
| `monthly-review-template.md` | Monthly self-assessment with auto-populated metrics and strategic questions |
| `notion-schema.md` | Notion database schema (19 properties, 6 views, page IDs, MCP reference) |
| `dna/` | Directory containing per-project DNA files |

## Project Tiers

- **Tier 1** (Revenue): omniport-hh, cityhub, orchestrator -- daily monitoring, 7-day stale threshold
- **Tier 2** (Strategic): adwo-2, finance-agent -- daily monitoring, 14-day stale threshold
- **Tier 3** (Growth/Paused): vaseo, contentos, hoyo-kingdom -- weekly/monthly monitoring

## Architecture Decisions

- **ADR-1**: File-based state over database (zero infra, git-versioned, human-readable)
- **ADR-2**: Notion is read-optimized projection, not source of truth (CQRS pattern)
- **ADR-3**: Zero inter-project agent communication (1.724 coordination exponent)
- **ADR-4**: tmux over Claude Code Agent Teams (need 3-tier hierarchy nesting)
- **ADR-5**: Shape Up cycles over continuous sprints (anti-zombie-project mechanism)

## Dependencies

Required: `jq`, `gh` (authenticated), `git`
Optional: `python3` (for detect-deps.sh), `npx` (for ccusage in budget-check.sh)
