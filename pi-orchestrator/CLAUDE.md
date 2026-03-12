# Pi Orchestrator — Worker Instructions

If a Claude Code worker reads this file, these are YOUR rules:

## You Are a Worker

You are a dev agent spawned by the L-Thread Orchestrator.
The orchestrator manages your lifecycle — you write code, it coordinates.

## Rules

1. **Create a branch** before starting work: `git checkout -b feature/<story-id>`
2. **Create a PR** when done: `gh pr create --title "..." --body "..."`
3. **Run tests** before creating the PR: `pnpm test` or `npm test`
4. **Do NOT merge** — the orchestrator handles merging after review
5. **Signal completion** — your Claude Code Stop hook will automatically signal the orchestrator via tmux wait-for channels

## On Errors

If you hit a roadblock:
- Try 3 times maximum
- If still stuck, create the PR with what you have and note the blocker in the PR body
- The orchestrator will handle roadblock recovery
