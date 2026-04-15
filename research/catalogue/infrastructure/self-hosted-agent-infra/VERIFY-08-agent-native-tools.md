# VERIFY-08: Agent-Native Sandbox Tools

**Date**: 2026-04-04
**Verdict**: 1 real product (manaflow/cmux), 1 spec-not-runtime (GitAgent), 1 does not exist (smol-deploy)

---

## 1. GitAgent (open-gitagent/gitagent)

**URL**: https://github.com/open-gitagent/gitagent
**NOTE**: The URL `Gitagent-app/gitagent` returns 404. The real repo is `open-gitagent/gitagent`.

### What It Actually Is

GitAgent is NOT a container/sandbox tool. It is a **specification standard** for defining AI agents as files in a Git repository. Think of it as "Dockerfile for agent identity" -- it defines the shape, not the runtime.

The core idea: store agent config (agent.yaml), personality (SOUL.md), rules (RULES.md), memory (memory/), tools (tools/), and skills (skills/) as version-controlled files. Then export to any framework.

**Created by**: Lyzr.ai (YC-backed enterprise AI agent company). Launched on Product Hunt 2026-03-20 by Khush Patel, Sri Suhas, Jithin George, Shreyas Kapale, Siva Surendira.

### Repo Stats

| Metric | Value |
|--------|-------|
| Stars | 2,700 |
| Forks | 321 |
| License | MIT |
| Language | TypeScript |
| CLI | `npm i @open-gitagent/gitagent` |
| HN Discussion | 2 upvotes, 3 comments (near-zero engagement) |
| PH Rank | #5 daily, 240 upvotes, 0 reviews |

### Q1: Can you run Claude Code inside GitAgent?

**No. GitAgent does not run anything.** It is a packaging format. You can `gitagent export --format claude-code` to generate a Claude Code-compatible system prompt from your agent definition, but GitAgent itself provides zero execution environment.

The command `gitagent run -r <repo> -a claude` exists, but it delegates to an adapter layer that calls the actual framework (Claude Code, CrewAI, etc.). GitAgent is the envelope, not the engine.

### Q2: REST API -- functional or stubbed?

**There is no REST API.** GitAgent is a CLI tool only. Commands: `init`, `validate`, `info`, `export`, `import`, `run`, `install`, `audit`, `skills`. No server, no HTTP endpoints.

### Q3: "Persistent memory" -- how does it work?

Memory is stored as plain Markdown files in `memory/MEMORY.md` (200-line limit) with archive snapshots in `memory/archive/`. This is committed to Git. It is literally just files in a repo -- not Docker volumes, not a database, just `git commit`. The runtime companion (GitClaw) manages memory via git commits, treating version history as auditable agent state.

### Q4: Actively maintained?

Yes, the repo is active (2,700 stars, recent commits). But the ecosystem is thin:
- **GitClaw** (the actual runtime): 204 stars, 36 forks, 112 commits. TypeScript, runs in-process (no Docker).
- Community: Mostly Lyzr employees contributing. The HN thread had 2 upvotes and a flagged comment.

### Q5: Real users beyond creators?

**Unverified.** The blog claims "companies see 25% productivity boost" and "150+ plugins submitted" but there are zero independent user reviews, zero SourceForge reviews, near-zero HN engagement. The Product Hunt launch got 240 upvotes but 0 actual reviews. The "trusted by" claims are marketing copy with no verifiable case studies.

### Honest Assessment

GitAgent is a well-structured specification with a working CLI, but it is fundamentally a **definition format**, not a sandbox or execution environment. Calling it "Docker for AI Agents" (as MarkTechPost did) is misleading -- Docker provides isolation and execution; GitAgent provides packaging and portability. The runtime story depends entirely on GitClaw (204 stars, early stage) or external frameworks.

**Risk**: Lyzr is an enterprise AI company pushing an open standard that feeds into their commercial platform. The standard may evolve to favor their ecosystem.

---

## 2. Manaflow (manaflow-ai/manaflow)

**URL**: https://github.com/manaflow-ai/manaflow

### What It Actually Is

Manaflow is a **Y Combinator S24** company (founders: Austin Wang + Lawrence Chen, 2-person team in SF) building two products:

1. **cmux** -- A native macOS terminal built on Ghostty/libghostty (the primary product, 13,900 stars)
2. **manaflow** -- An agent orchestration platform that runs coding agents in isolated environments (1,000+ stars)

cmux is the terminal; manaflow is the orchestration layer. They are separate repos but from the same team.

### Repo Stats (manaflow)

| Metric | Value |
|--------|-------|
| Stars | 1,000+ |
| Forks | 51 |
| Commits | 6,398 |
| Releases | 132 (latest v1.0.269, 2026-02-19) |
| License | MIT |
| Languages | TypeScript 70%, Rust 17%, Shell 4.4%, Go 3.1%, Python 3.1% |
| Open Issues | 14 |
| PRs | 320 |
| Code | Real implementation (apps/, crates/, packages/, scripts/) |

### Repo Stats (cmux)

| Metric | Value |
|--------|-------|
| Stars | 13,900 |
| Forks | 1,000 |
| Commits | 2,223 |
| Open Issues | 736 |
| PRs | 490 |
| License | GPL-3.0-or-later (commercial licenses available) |
| Platform | macOS only (Swift/AppKit + libghostty) |

### Q6: Can you self-host on Windows/WSL2?

**No.** cmux is macOS-only (native Swift/AppKit app, requires macOS 13+). Linux is in public beta. Windows is "coming soon" / waitlisted. There is no WSL2 path.

Manaflow (the orchestration platform) runs agents in either:
- **Cloud sandbox mode** (Manaflow's infrastructure)
- **Local Docker containers** (requires Docker Desktop)

The local Docker mode theoretically works on any Docker host, but the management UI (cmux) is macOS-only, so Windows users cannot use the full product.

### Q7: Claude Max subscription support?

**Yes, with caveats.** Manaflow "accepts your own OpenAI and Anthropic subscriptions or raw API keys." It does not proxy through its own billing. You provide your own ANTHROPIC_API_KEY or authenticate via Claude's OAuth flow. However, as of April 2026, Anthropic restricted third-party tool access to Claude subscriptions -- this may affect Manaflow's subscription-based auth path. API keys still work.

### Q8: Multi-agent parallel execution -- working?

**Yes, this is the core product and it works.** 6,398 commits, 132 releases, real TypeScript+Rust implementation. Each agent gets an isolated VS Code workspace (cloud or local Docker). Features include:
- Live diff viewer with heatmap annotations
- Embedded browser preview per agent
- Automatic "best run" selection (crown evaluator)
- One-click PR creation
- Git integration with CI status viewing

### Q9: Web UI -- does it work?

**Yes, but it is a native app, not a web UI.** cmux is a native macOS terminal with vertical tabs, notifications, and an integrated browser panel. It is not a browser-based dashboard. The manaflow orchestration platform provides workspace monitoring through cmux's interface.

No independent screenshots or demos were found beyond marketing materials and the GitHub repo. SourceForge shows zero reviews. But the 13,900 stars on cmux, 736 open issues, and Mitchell Hashimoto (Ghostty creator) endorsement suggest real usage.

### Q10: Real user reports?

**Mixed signal.** cmux claims "trusted by thousands of builders from Nvidia, Google, OpenAI." It hit #2 on Hacker News and gained 9,500 stars in two weeks. The issue tracker (736 open issues, 490 PRs) indicates real users filing real bugs. But SourceForge has zero reviews, and independent production case studies are absent. The user base appears to be primarily early-adopter developers, not enterprise production deployments.

### Honest Assessment

Manaflow/cmux is the most real product of the three. It has substantial code (TypeScript + Rust), a YC pedigree, genuine community traction (13.9k stars), and an active issue tracker. The parallel agent orchestration works. The main limitations are:

1. **macOS only** -- no Windows, Linux in beta only
2. **2-person company** -- sustainability risk
3. **cmux GPL-3.0** -- commercial use requires a separate license
4. **No independent reviews** -- lots of stars, no deep production case studies

---

## 3. smol-deploy (maboroshi-inc/smol-deploy)

**URL**: https://github.com/maboroshi-inc/smol-deploy

### What It Actually Is

**This project does not exist.**

### Verification

1. The URL `github.com/maboroshi-inc/smol-deploy` returns **404**.
2. The maboroshi-inc GitHub organization (https://github.com/maboroshi-inc) is a Japanese web development tools company with **8 repositories**, all of which are utility libraries (prettier-config, eslint-config, type-assertions, etc.). Most are archived.
3. There is no "smol-deploy" in their org. There is no AI agent tooling of any kind.
4. Searching for "smol-deploy maboroshi" across GitHub, Google, and Hacker News returns zero results.
5. The "smol" ecosystem (smol-ai/developer, HuggingFace smolagents) is unrelated to maboroshi-inc.

### Q11-Q15: All N/A

All questions about AGPL-3.0 license, self-hosted mode, "20+ agents" claims, Claude Max authentication, and resource requirements are unanswerable because the project does not exist. This appears to be either:
- A hallucinated reference from an AI-generated list
- A confusion between maboroshi-inc and another org
- A project that was deleted or never published

---

## Comparative Verdict

| Dimension | GitAgent | Manaflow | smol-deploy |
|-----------|----------|----------|-------------|
| **Exists** | Yes | Yes | NO |
| **What it is** | Spec/standard + CLI | Native terminal + orchestrator | Does not exist |
| **Runs agents** | No (delegates to frameworks) | Yes (Docker/cloud sandboxes) | N/A |
| **Has real code** | Yes (TypeScript CLI) | Yes (TypeScript + Rust, 6.4k commits) | N/A |
| **Stars** | 2,700 | 1,000 (manaflow) + 13,900 (cmux) | N/A |
| **Real users** | Unverified | Likely (active issue tracker) | N/A |
| **Self-hostable** | N/A (it's a CLI) | Partial (Docker mode, macOS-only UI) | N/A |
| **Windows support** | Yes (Node.js CLI) | No | N/A |
| **Claude Code support** | Export format only | Direct execution in sandboxes | N/A |
| **License** | MIT | MIT (manaflow), GPL-3.0 (cmux) | N/A |
| **Backed by** | Lyzr.ai (enterprise) | YC S24 | N/A |

### Which One Actually Works TODAY?

**Manaflow is the only product that actually runs agents in isolated environments today.** It has real code, real releases (132 versions), and real community engagement. The limitation is macOS-only.

**GitAgent is a useful specification** but it does not execute agents. It is a packaging format. Comparing it to Docker (which provides runtime isolation) is misleading -- it is more like a Dockerfile specification without the Docker engine. GitClaw (the companion runtime) exists but is early-stage (204 stars).

**smol-deploy does not exist.** Full stop.

### Are Any of These "Awesome-List" Projects with Nice READMEs but Broken Code?

- **GitAgent**: Not broken, but not what it claims to be. The CLI works for exporting agent definitions. But the marketing ("Docker for AI Agents") dramatically overstates what it does. It is a spec, not a runtime.
- **Manaflow**: Appears to be real software with real users. 6,398 commits and 132 releases are hard to fake. The risk is the 2-person team and macOS lock-in.
- **smol-deploy**: Does not exist at all. Classic phantom reference.

---

## Sources

- [open-gitagent/gitagent (GitHub)](https://github.com/open-gitagent/gitagent)
- [open-gitagent/gitclaw (GitHub)](https://github.com/open-gitagent/gitclaw)
- [GitAgent specification](https://github.com/open-gitagent/gitagent/blob/main/spec/SPECIFICATION.md)
- [GitAgent on Product Hunt](https://www.producthunt.com/products/gitagent-2)
- [GitAgent HN discussion](https://news.ycombinator.com/item?id=47216582)
- [GitAgent (gitagent.sh)](https://www.gitagent.sh/)
- [MarkTechPost GitAgent article](https://www.marktechpost.com/2026/03/22/meet-gitagent-the-docker-for-ai-agents-that-is-finally-solving-the-fragmentation-between-langchain-autogen-and-claude-code/)
- [manaflow-ai/manaflow (GitHub)](https://github.com/manaflow-ai/manaflow)
- [manaflow-ai/cmux (GitHub)](https://github.com/manaflow-ai/cmux)
- [Manaflow on YC](https://www.ycombinator.com/companies/manaflow)
- [Manaflow parallel agents guide](https://www.scriptbyai.com/coding-agents-parallel-manaflow/)
- [Manaflow SourceForge (0 reviews)](https://sourceforge.net/software/product/Manaflow/)
- [maboroshi-inc (GitHub)](https://github.com/maboroshi-inc)
- [Lyzr.ai (GitAgent parent company)](https://www.lyzr.ai/)
