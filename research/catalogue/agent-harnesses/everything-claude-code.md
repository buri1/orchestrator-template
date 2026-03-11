# Everything Claude Code (ECC)

> **The agent harness performance optimization system. Skills, instincts, memory, security, and research-first development for Claude Code, Codex, OpenCode, Cursor, and beyond.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) |
| GitHub Stars | 68,841 (as of 2026-03-09) |
| Publisher | Affaan Mustafa (@affaanmustafa / cogsec) — solo dev; Anthropic hackathon winner (Sep 2025, Cerebral Valley x Forum Ventures); built [zenith.chat](https://zenith.chat) in 8 hours |
| License | MIT |
| Tech Stack | JavaScript (primary), TypeScript, Python, Go, Java, Shell, Markdown; Node.js hooks; npm packages (`ecc-universal`, `ecc-agentshield`) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *This is the most-starred Claude Code harness in existence by a massive margin (68.8K vs Superpowers' 73K which is broader). Pure prompt engineering + convention files + hook scripts -- no runtime binary, no SDK dependency. Their cross-harness parity strategy (CC + Cursor + OpenCode + Codex from one repo) is the opposite of our single-harness depth approach but worth studying. The hook runtime gating via ECC_HOOK_PROFILE is immediately adoptable. AgentShield's red-team/blue-team/auditor Opus pipeline is a novel security pattern. The instinct-based continuous learning system (confidence scoring, import/export, evolution into skills) is more sophisticated than our current session hooks. Biggest gap: no tmux/worktree isolation, no multi-agent coordination substrate -- they optimize the single-agent experience, we optimize multi-agent orchestration.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Directly addresses agent harness engineering, quality gates, loop control, and cross-platform agent deployment. The slop guard, eval-driven quality gates, and bounded loop control patterns are core to our runtime safety layer. 68.8K stars validates massive community demand for structured agent governance. |
| **Novelty** | 7/10 | Hook runtime gating (ECC_HOOK_PROFILE), AgentShield's adversarial security pipeline, instinct-based continuous learning, and the Plankton write-time quality enforcement are patterns not seen elsewhere in the catalogue. Cross-harness parity via DRY adapter is a new portability approach. |
| **Actionable** | 8/10 | Hook architecture patterns, runtime profile gating, AgentShield scanning, slop guard, eval harness, and instinct export/import are immediately adoptable. The skill/agent/command taxonomy is a reference implementation for our own command structure. |

---

## Overview

Everything Claude Code (ECC) is the most-starred agent harness system for AI coding tools, providing a comprehensive suite of 16 specialized agents, 65+ skills, 40+ commands, and a full hook lifecycle system. Created by Affaan Mustafa after winning the Anthropic hackathon in September 2025, ECC evolved from a Claude Code configuration pack into a cross-platform agent harness performance system targeting Claude Code, Cursor IDE, OpenCode, and OpenAI Codex simultaneously.

The core philosophy is "research-first development" -- every pattern ships with an eval harness, verification loop, and quality gate rather than relying solely on prompt instructions. v1.8.0 (March 2026) marked the graduation from "setup repo" to "agent harness system" with the addition of slop guard (write-time quality enforcement), eval-driven quality gates (configurable graders with pass@k metrics), and bounded loop control (runtime limits on autonomous agent loops). The system is entirely prompt-engineering based -- no custom runtime or binary -- using CLAUDE.md, AGENTS.md, hooks.json, and SKILL.md files as the control surface.

ECC also ships two companion npm packages: `ecc-universal` (OpenCode plugin) and `ecc-agentshield` (security scanner with 1,282 tests, 102 static analysis rules, and an optional 3-agent Opus adversarial audit mode). A GitHub App ([ecc.tools](https://ecc.tools)) provides advanced skill creation from repository history.

---

## Technical Architecture

```
everything-claude-code/
├── agents/              # 16 specialized subagents (markdown-based)
│   ├── planner.md           # Feature planning
│   ├── architect.md         # System design
│   ├── tdd-guide.md         # TDD enforcement
│   ├── code-reviewer.md     # Quality review
│   ├── security-reviewer.md # Vulnerability analysis
│   ├── e2e-runner.md        # Playwright E2E testing
│   ├── chief-of-staff.md    # Coordination
│   ├── harness-optimizer.md # Self-optimization
│   ├── loop-operator.md     # Autonomous loop management
│   └── ... (7 more: build-error-resolver, refactor-cleaner,
│           doc-updater, go-reviewer, go-build-resolver,
│           python-reviewer, database-reviewer)
│
├── skills/              # 65+ workflow definitions (SKILL.md + YAML frontmatter)
│   ├── eval-harness/            # Eval-driven development
│   ├── verification-loop/       # Continuous verification
│   ├── continuous-learning-v2/  # Instinct-based learning with confidence scoring
│   ├── autonomous-loops/        # Sequential pipelines, PR loops, DAG orchestration
│   ├── plankton-code-quality/   # Write-time code quality (Plankton integration)
│   ├── strategic-compact/       # Context management
│   ├── agent-harness-construction/ # Meta-skill: building harnesses
│   ├── agentic-engineering/     # Meta-skill: agentic patterns
│   └── ... (57+ language/framework/domain skills)
│
├── commands/            # 40+ slash commands
│   ├── plan.md, tdd.md, e2e.md, code-review.md, build-fix.md
│   ├── eval.md, verify.md, checkpoint.md, learn.md, learn-eval.md
│   ├── orchestrate.md, multi-plan.md, multi-execute.md
│   ├── harness-audit.md, loop-start.md, loop-status.md
│   ├── quality-gate.md, model-route.md, security.md
│   └── instinct-status.md, instinct-import.md, instinct-export.md, evolve.md
│
├── hooks/               # Hook lifecycle system
│   └── hooks.json           # All hooks config (PreToolUse, PostToolUse, Stop, etc.)
│
├── scripts/             # Cross-platform Node.js hook implementations
│   ├── hooks/               # 20+ hook scripts
│   │   ├── session-start.js     # Context loading
│   │   ├── session-end.js       # State persistence
│   │   ├── pre-compact.js       # Pre-compaction saving
│   │   ├── quality-gate.js      # Quality enforcement
│   │   ├── suggest-compact.js   # Strategic compaction
│   │   └── evaluate-session.js  # Pattern extraction
│   └── lib/                 # Shared utilities (utils.js, package-manager.js, etc.)
│
├── rules/               # Always-follow guidelines
│   ├── common/              # 9 language-agnostic rules
│   ├── typescript/          # 5 TS-specific rules
│   ├── python/              # 5 Python-specific rules
│   ├── golang/              # 5 Go-specific rules
│   └── swift/               # 5 Swift-specific rules
│
├── contexts/            # Dynamic system prompt injection
│   ├── dev.md, review.md, research.md
│
├── .cursor/             # Full Cursor IDE support (DRY adapter pattern)
│   ├── hooks/adapter.js     # Transforms Cursor stdin JSON to CC format
│   ├── hooks/*.js           # 16 hook scripts (15 event types)
│   ├── rules/               # 29 rules with YAML frontmatter
│   └── skills/              # Cursor-specific skill translations
│
├── .codex/              # OpenAI Codex support
│   ├── AGENTS.md            # Codex-specific supplement
│   └── config.toml          # Model, permissions, MCP servers
│
├── .opencode/           # OpenCode support
│   ├── opencode.json        # Plugin configuration
│   ├── plugins/ecc-hooks.ts # Hook implementations
│   ├── commands/            # 31+ commands
│   ├── prompts/agents/      # 12 agents (OpenCode format)
│   └── tools/               # 6 native custom tools
│
├── .agents/skills/      # Codex-compatible skills (SKILL.md + openai.yaml)
├── .claude-plugin/      # Claude Code plugin manifest
├── AGENTS.md            # Universal cross-tool agent definition file
├── CLAUDE.md            # Claude Code project configuration
└── tests/               # 997 tests (CI validation suite)
```

### Key Architectural Decisions

1. **Pure prompt engineering** -- No custom runtime, no binary, no SDK dependency. All control is via markdown files (CLAUDE.md, AGENTS.md, SKILL.md), JSON config (hooks.json), and Node.js scripts. This means zero vendor lock-in and trivial portability.

2. **Cross-harness parity via DRY adapter** -- AGENTS.md at root is the universal cross-tool file (read by all 4 harnesses). Cursor hooks use a `adapter.js` that transforms Cursor's stdin JSON format to Claude Code's format, allowing all `scripts/hooks/*.js` to be shared without duplication.

3. **Hook runtime gating** -- `ECC_HOOK_PROFILE` env var (minimal/standard/strict) and `ECC_DISABLED_HOOKS` for per-hook opt-out. This is deterministic configuration, not LLM-driven -- aligns with our 70/30 principle.

4. **Plugin-first distribution** -- Primary install path is `/plugin marketplace add`, with manual copy as fallback. Claude Code plugin system auto-loads `hooks/hooks.json` by convention (no explicit declaration needed).

5. **Instinct-based learning** -- Continuous Learning v2 auto-extracts patterns from sessions as "instincts" with confidence scoring, then clusters related instincts into new skills via `/evolve`. Import/export enables team sharing.

---

## Publisher Background

**Affaan Mustafa** (@affaanmustafa, also known as "cogsec") is a solo developer who won the Anthropic x Forum Ventures hackathon in September 2025, building zenith.chat with @DRodriguezFX entirely using Claude Code in 8 hours. He released his battle-tested Claude Code configurations as open source in January 2026, and the repo rocketed to 68.8K stars in under 2 months. ECC is his primary project, with 322 of the 400+ contributions being his. The project has 30+ contributors, 8,590 forks, and ~359 subscribers. Homepage: [ecc.tools](https://ecc.tools). Two npm packages published: `ecc-universal` and `ecc-agentshield`. GitHub App available in GitHub Marketplace.

### Star Growth Timeline

| Milestone | Approximate Date | Context |
|-----------|-----------------|---------|
| Repo created | 2026-01-18 | Initial commit |
| v1.0.0 | 2026-01-22 | Official plugin release |
| 35K+ stars | ~2026-03-01 | Referenced in @godofprompt quote tweet |
| 50K+ stars | ~2026-03-05 | Self-reported in README at v1.8.0 |
| 68.8K stars | 2026-03-09 | Current count (analyzed today) |

Growth rate: ~1,300 stars/day average over 50 days. One of the fastest-growing developer tool repos in GitHub history.

---

## What's Valuable for Us

### 1. Hook Runtime Gating (Immediately Adoptable)

The `ECC_HOOK_PROFILE` pattern (minimal/standard/strict) and `ECC_DISABLED_HOOKS` env var provide deterministic runtime control over hook execution without editing hook files. This is directly applicable to our orchestrator hooks:

```bash
# Their pattern:
export ECC_HOOK_PROFILE=strict
export ECC_DISABLED_HOOKS="pre:bash:tmux-reminder,post:edit:typecheck"
```

We should adopt this for `.bmad/scripts/` hooks -- a `BMAD_HOOK_PROFILE` env var controlling orchestrator-session-start.sh and orchestrator-handoff.sh behavior.

### 2. Agent Taxonomy (16 Specialized Agents)

Their agent decomposition is the most comprehensive in the catalogue:
- **Planning tier**: planner, architect
- **Quality tier**: code-reviewer, security-reviewer, database-reviewer, go-reviewer, python-reviewer
- **Execution tier**: tdd-guide, build-error-resolver, go-build-resolver, e2e-runner
- **Maintenance tier**: refactor-cleaner, doc-updater
- **Meta tier**: chief-of-staff, harness-optimizer, loop-operator

The `loop-operator` agent (manages autonomous loop execution with bounded control) and `harness-optimizer` agent (self-optimization of the harness itself) are novel patterns not seen elsewhere.

### 3. AgentShield Security Scanner

Red-team/blue-team/auditor pipeline using 3 Opus agents: attacker finds exploit chains, defender evaluates protections, auditor synthesizes into prioritized risk assessment. Scans CLAUDE.md, hooks, MCP configs, agent definitions, and skills across 5 categories (secrets detection, permission auditing, hook injection analysis, MCP server risk profiling, agent config review). Exit code 2 on critical findings for CI gates.

### 4. Eval Harness & Quality Gates

The `/eval` command and `skills/eval-harness/` skill provide eval-driven development with configurable graders and pass@k metrics. The `/quality-gate` command runs composite checks (build, test, lint, typecheck, security) as a single gate -- similar to our E2E testing gate but more granular.

### 5. Instinct-Based Continuous Learning

The Continuous Learning v2 system auto-extracts patterns from sessions as "instincts" with confidence scoring. Key commands:
- `/instinct-status` -- view learned instincts with confidence levels
- `/instinct-import` / `/instinct-export` -- share instincts between users/projects
- `/evolve` -- cluster related instincts into new skills automatically
- `/learn-eval` -- extract, evaluate, and save patterns before committing

This is more sophisticated than our current session-end hooks and could inform our memory persistence strategy.

### 6. Cross-Harness Feature Parity Matrix

Their systematic tracking of feature parity across 4 harnesses (Claude Code, Cursor, OpenCode, Codex) with specific counts per component type is a useful reference for multi-harness strategy:
- Claude Code: 16 agents, 40 commands, 65 skills, 8 hook events
- Cursor: shared agents via AGENTS.md, 15 hook event types, DRY adapter
- OpenCode: 12 agents, 31 commands, 37 skills, 11 hook events, 6 native tools
- Codex: shared AGENTS.md, 10 native-format skills, no hooks (instruction-based)

### 7. Plankton Write-Time Code Quality

PostToolUse hooks running formatters + 20 linters on every file edit, then spawning Claude subprocesses (routed by violation complexity to Haiku/Sonnet/Opus) to fix issues. Three-phase: auto-format silently (40-50%), collect violations as JSON, delegate fixes. Config protection hooks prevent agents from modifying linter configs.

---

## What's NOT Relevant

1. **No multi-agent orchestration substrate** -- ECC optimizes the single-agent experience (one Claude Code session at a time). There is no tmux session management, no worktree isolation, no inter-agent messaging, no task dependency graphs. Their `/orchestrate` and `/multi-*` commands are prompt-based coordination, not runtime orchestration. This is the fundamental gap vs our L-Thread architecture.

2. **PM2-based multi-service management** -- Their `/pm2` and `/multi-*` commands use PM2 for process management, which conflicts with our tmux-native approach. PM2 adds a daemon layer we don't need.

3. **Language-specific skills we don't use** -- Spring Boot, Django, Swift, Java, C++ skills are not relevant to our TypeScript/Shell stack. However, the skill structure itself (SKILL.md with YAML frontmatter) is a useful template.

4. **Business/content skills** -- article-writing, content-engine, investor-materials, investor-outreach, market-research are outside our orchestrator scope.

5. **Plugin marketplace distribution** -- Their primary distribution mechanism (Claude Code plugin marketplace) is not relevant since we operate on a single-repo basis, not as a distributable plugin.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Adopt hook runtime gating pattern (`BMAD_HOOK_PROFILE` env var). Study agent taxonomy for our own agent definitions. Run `npx ecc-agentshield scan` on our `.claude/` and `.bmad/` configs for a security baseline.

- **Phase 2 (Days 4-60)**: Integrate eval harness patterns into our E2E testing gate. Adopt instinct-based learning concepts for session memory persistence. Study Plankton write-time quality enforcement for agent-generated code quality.

- **Phase 3 (Days 60-90)**: Consider cross-harness parity if we extend beyond Claude Code (e.g., Codex as alternative runtime). The DRY adapter pattern becomes valuable if we need to support multiple AI coding tools.

- **Phase 4 (Days 90+)**: If we build distributable agent configurations, ECC's plugin marketplace model and GitHub App (skill-creator) are the reference implementation to study.

---

## Key Takeaway

> **ECC is the most comprehensive single-agent harness in the ecosystem (68.8K stars, 16 agents, 65 skills, 40 commands, 997 tests) and the gold standard for hook lifecycle management, runtime profile gating, and cross-harness parity -- but it explicitly does NOT solve multi-agent orchestration, which is our core differentiator.**
