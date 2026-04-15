# Venture Spine v0 -- Friction Log

> Date: 2026-03-25
> Author: Implementation spike (Task 3 from Wave 3 agenda)

## Friction Points Encountered

### F1: macOS bash version lacks associative arrays

**Severity**: Blocking (script crashed)
**What happened**: First version of `triage.sh` used `declare -A` (bash 4+ associative arrays). macOS ships bash 3.2 which does not support them. The `#!/bin/bash` shebang invokes the system bash.
**Resolution**: Rewrote to use temp files in `$TMPDIR` as key-value storage. Each project gets a subdirectory with one file per field (e.g., `$TMPDIR/omniport-hh/health`). More verbose but universally portable.
**Recommendation**: Always use `#!/usr/bin/env bash` and avoid bash 4+ features, OR require `brew install bash` as a prerequisite.

### F2: German locale breaks day-of-week matching

**Severity**: Medium (day theme matching silently failed)
**What happened**: `date +"%A"` returns "Mittwoch" instead of "Wednesday" on a German-locale Mac. Since `projects.json` uses English day names, the theme-matching logic found no match.
**Resolution**: Use `LC_ALL=C date +"%A"` for matching, keep the locale-native name for display.
**Recommendation**: Always force `LC_ALL=C` when comparing dates/strings against English constants.

### F3: Inconsistent directory names vs. project slugs

**Severity**: Low (cosmetic / requires mental mapping)
**What happened**: Several projects have directory names that don't match their natural slug:
- `hackathon/` is actually VASEO
- `Finance-agent/` has a capital F and hyphen
- `Hoyo Kingdom/` has a space in the name
- `CityHub/` has mixed case

**Resolution**: The `projects.json` registry maps slugs to paths, so scripts work. But human navigation requires knowing the mapping.
**Recommendation**: Consider symlinking canonical names, e.g., `ln -s "Hoyo Kingdom" hoyo-kingdom`.

### F4: `git log | head` causes SIGPIPE errors

**Severity**: Low (visual noise in output)
**What happened**: Piping `git log --oneline --since="7 days ago"` through `head -5` caused SIGPIPE when git produced more output. The `|| echo "(no recent commits)"` fallback fired, appending ghost messages after real data.
**Resolution**: Use `git log -5` (limit flag) instead of piping through `head`. Avoids SIGPIPE entirely.

### F5: gh CLI has no bulk multi-repo query

**Severity**: Medium (performance bottleneck)
**What happened**: Querying 8 projects means 8 * 3 = 24 GitHub API calls (issues, PRs, CI per project). Sequential execution takes ~15-20 seconds total.
**Resolution**: Accepted for now. Could parallelize with `&` + `wait`, but adds complexity.
**Recommendation**: For >10 projects, use `gh api graphql` with a single batched query to fetch all repos' issue/PR counts in one call.

### F6: CI status endpoint returns sparse data

**Severity**: Low (most projects show "-" for CI)
**What happened**: `gh api repos/ORG/REPO/commits/HEAD/check-runs` returns empty check_runs for most projects because they don't have GitHub Actions configured. Only CityHub has a failing CI.
**Resolution**: Show "-" for no CI data. This is actually correct — the absence of CI is itself useful information.
**Recommendation**: Flag "no CI configured" as a yellow indicator for Tier 1 projects.

### F7: CLAUDE.md presence is inconsistent

**Severity**: Medium (impacts DNA quality)
**What happened**: Only 3 of 8 projects have a CLAUDE.md file (CityHub, Finance-agent, orchestrator). The DNA generator shows "(no CLAUDE.md found)" for the rest.
**Resolution**: DNA still generates useful content from git/GitHub data. CLAUDE.md excerpt is a bonus, not a requirement.
**Recommendation**: Create minimal CLAUDE.md files for all Tier 1/2 projects as a follow-up task.

### F8: ContentOS has no git repo structure

**Severity**: Low (Tier 3 project)
**What happened**: ContentOS directory only contains a `docs/` folder. The DNA generator works but produces thin output.
**Resolution**: Acceptable for ideation-phase Tier 3 projects. The DNA accurately reflects the project's state.

### F9: projects.json requires manual maintenance

**Severity**: Medium (will drift over time)
**What happened**: Adding a new project requires: (1) creating the repo, (2) manually editing `projects.json`, (3) running triage/DNA. There's no auto-discovery.
**Resolution**: Accepted for v0 at 8 projects. The manual step takes <2 minutes.
**Recommendation**: Build `detect-projects.sh` that scans `~/Desktop/code2/` for git repos and proposes additions to projects.json.

### F10: YAML generation in bash is fragile

**Severity**: Low (works but not pretty)
**What happened**: The `generate-dna.sh` script builds YAML via heredoc + `sed`. Special characters in commit messages (quotes, backticks, dollar signs) could break the YAML syntax.
**Resolution**: The output is valid YAML for current data. Used double-quoted strings for fields that could contain special chars.
**Recommendation**: For production use, consider generating YAML via `yq` or a Python one-liner instead of raw heredocs.

## Timing

| Step | Estimated | Actual | Notes |
|------|-----------|--------|-------|
| Survey projects | 15 min | 10 min | gh CLI fast, parallel calls help |
| Create projects.json | 30 min | 15 min | Data was already collected |
| Build triage.sh | 2 hours | 45 min | First version crashed (F1), rewrite took 20 min |
| Build generate-dna.sh | 1 hour | 30 min | Straightforward after triage.sh patterns established |
| Create portfolio-state.yaml | 15 min | 10 min | Mostly copy from triage output |
| Testing + debugging | 30 min | 20 min | Locale fix (F2), SIGPIPE fix (F4) |
| **Total** | **~4.5 hours** | **~2 hours** | Grand Synthesis estimate was accurate |

## What Worked Well

1. **jq for JSON parsing**: Rock-solid, fast, available everywhere. The right choice for projects.json.
2. **gh CLI**: Excellent for GitHub data. JSON output mode (`--json`) is reliable.
3. **Temp directory pattern**: Using `mktemp -d` + file-per-field instead of associative arrays was actually cleaner for debugging (can `ls` the temp dir to inspect state).
4. **Traffic-light health model**: Simple red/yellow/green with per-tier thresholds produces immediately actionable output.
5. **Centralized projects.json**: Single source of truth for all scripts. Adding a project is one JSON edit.

## What to Build Next

1. **Parallel GitHub queries**: Background all gh calls, collect results after.
2. **CLAUDE.md generation**: Ensure all Tier 1/2 projects have CLAUDE.md files.
3. **Cron integration**: `launchd` plist to run triage.sh at 06:00 daily.
4. **DNA staleness tracking**: Warn if a project's DNA is >7 days old.
5. **Portfolio diff**: Compare today's temperature to yesterday's — surface changes only.
