# "Any way to skip this question when I run Claude Code in /root?"

> **@levelsio — 2026-03-20**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/levelsio/status/2035050535133290607) |
| Author | [@levelsio (Pieter Levels) — solo founder, NomadList/RemoteOK/PhotoAI](https://x.com/levelsio) |
| Date | 2026-03-20 |
| Topics | claude-code, developer-experience, trust-prompt, headless-agents, root-execution |
| Type | Single post |

---

## Burak's Notes

> *Levelsio running Claude Code in /root on a server is exactly our use case with tmux orchestration — headless, unattended, fully autonomous. The trust prompt is a friction point for autonomous agent pipelines. We already solve this with `--dangerously-skip-permissions` but the fact that the highest-profile solo founder in the indie hacker space is hitting this tells you the "agents running as root" pattern is mainstream now. 200 likes + 71 replies = the community cares about headless agent DX.*

---

## Key Takeaways

1. **Claude Code's workspace trust prompt blocks autonomous/headless workflows** — When running Claude Code in `/root` or via automated pipelines, the interactive "Quick safety check: Is this a project you created or one you trust?" prompt requires manual confirmation, breaking unattended execution.
2. **Solo founders are running Claude Code on servers as autonomous agents** — Levelsio (arguably the most famous solo founder) running Claude Code in `/root` signals that server-side autonomous agent execution is now a mainstream pattern, not just a power-user niche.
3. **The answer is `--dangerously-skip-permissions`** — This flag skips the trust prompt entirely, which is exactly what our orchestrator uses when spawning tmux workers (`unset CLAUDECODE && claude --dangerously-skip-permissions`).

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 5/10 | Validates our headless agent execution pattern but contains no novel technical insight — we already solved this with `--dangerously-skip-permissions`. Value is social proof: if levelsio hits this friction, many others will too. Low technical depth but high signal for the trajectory of autonomous agent adoption. |

---

## Full Content

> Any way to skip this question when I run Claude Code in / root?

[Attached screenshot shows Claude Code terminal in the "skunkworks" app, displaying:]

```
Accessing workspace:

/root

Quick safety check: Is this a project you created or one you trust? (Like your
 own code, a well-known open source project, or work from your team). If not,
 take a moment to review what's in this folder first.

Claude Code'll be able to read, edit, and execute files here.

Security guide

> 1. Yes, I trust this folder
  2. No, exit

Enter to confirm · Esc to cancel
```

---

## Notable Replies

[71 replies reported but not accessible via API. Likely answers include `--dangerously-skip-permissions` flag, `--yes` flag, and `.claude/settings.json` trust configuration.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| — | No URLs in post | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Running in /root, hitting trust prompt | Yes — referenced across many entries |
