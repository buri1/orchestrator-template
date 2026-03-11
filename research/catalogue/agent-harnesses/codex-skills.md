# Codex Skills

> A collection of Codex/agent skills for planning, documentation access, frontend development, and browser automation.

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/am-will/codex-skills](https://github.com/am-will/codex-skills) |
| GitHub Stars | 483 (as of 2026-03-08) |
| Publisher | am.will — solo developer ("Context Engineer, Developer, Husband, Father") |
| License | MIT |
| Tech Stack | Python (58.9%), JavaScript (17.3%), Shell (10.2%), HTML/CSS; TOML agent configs; Node.js CLI (`npx skills`); Bun lockfile |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Codex-native skill library with 26 TOML-based agent role definitions and 18 installable skills. The parallel-task orchestrator and llm-council multi-model planning patterns are the interesting parts. The role-creator meta-skill (shell scripts that generate and validate TOML configs) is a nice workflow tool. Most of the value is Codex-specific and doesn't transfer to our Claude Code stack, but the role taxonomy and super-swarm-spark rolling pool orchestrator are worth studying as reference patterns.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Codex-native; agent role taxonomy and swarm patterns are transferable concepts, but none of the tooling works with Claude Code directly |
| **Novelty** | 5/10 | Rolling pool orchestrator (super-swarm-spark) with 12-agent cap and canonical path enforcement is a nice implementation of patterns we've seen elsewhere; llm-council multi-model planning with anonymized judging is moderately novel |
| **Actionable** | 4/10 | TOML configs and skills.sh CLI are Codex-only; patterns require significant adaptation to work in our .claude/commands system |

---

## Overview

Codex Skills is a curated collection of agent skills and multi-agent role definitions designed for OpenAI's Codex CLI. It provides two main value propositions: (1) a library of 18 installable "skills" that extend Codex agents with capabilities like planning, documentation fetching, browser automation, and multi-agent orchestration, and (2) a set of 26 TOML-based agent role definitions that specialize Codex subagents for specific tasks (architect, frontend, backend, debugger, tester, security, etc.).

The project is built around the `skills.sh` CLI (`npx skills add`), which installs SKILL.md files into user or project scope. Each skill is a self-contained markdown file with structured frontmatter that teaches the agent how to perform a specific capability. Agent roles are TOML configuration files that set model selection (`gpt-5.3-codex`, `gpt-5.1-codex-mini`, `gpt-5.3-codex-spark`), reasoning effort levels (`low`/`medium`/`high`/`xhigh`), and detailed `developer_instructions` prompts.

The most architecturally interesting components are: **parallel-task** (dependency-aware wave-based parallel execution), **super-swarm-spark** (rolling 12-agent pool that ignores dependencies for maximum throughput), **llm-council** (multi-model planning with anonymized judging across Claude/Codex/Gemini), and **role-creator** (meta-skill that generates validated TOML agent configs via shell scripts).

---

## Technical Architecture

### Skill System
- Each skill is a directory under `skills/` containing a `SKILL.md` with YAML frontmatter (`name`, `description`) and structured instructions
- Installation via `npx skills add am-will/codex-skills --skill <name>` to user (`-g`) or project scope
- Skills install as markdown instruction files, not code libraries -- pure prompt engineering

### Agent Role System (26 Roles)
```
agents/
  agents_config_block.toml    # Master config: paste into ~/.codex/config.toml
  architect.toml              # System design, ADRs, Mermaid diagrams
  frontend.toml               # UI/UX development
  backend.toml                # APIs, DB, business logic
  debugger.toml               # Root cause analysis
  tester.toml                 # Test coverage
  security.toml               # Vulnerability scanning
  refactorer.toml             # Behavior-preserving cleanup
  documenter.toml             # Documentation
  reviewer.toml               # Pre-merge code review
  devops.toml                 # CI/CD, infrastructure
  migrator.toml               # Database migrations
  performance.toml            # Profiling, optimization
  api_designer.toml           # API contracts and schemas
  content_writer.toml         # Marketing copy
  smart_contract.toml         # Solidity/Plutus
  data_pipeline.toml          # ETL, analytics
  mobile.toml                 # React Native
  scout.toml                  # Read-only codebase exploration (uses codex-mini, low reasoning)
  sparky.toml                 # Fast task implementation worker
  git_ops.toml                # Complex git operations
  worker_xhigh.toml           # Generic worker (codex, xhigh reasoning)
  worker_high.toml            # Generic worker (codex, high reasoning)
  worker_medium.toml          # Generic worker (codex, medium reasoning)
  worker_mini.toml            # Generic worker (codex-mini, medium reasoning)
  worker_spark_high.toml      # Generic worker (codex-spark, high reasoning)
  worker_spark_xhigh.toml     # Generic worker (codex-spark, xhigh reasoning)
```

### Model Tiering Strategy
- **Architect/specialists**: `gpt-5.3-codex` with `high` reasoning
- **Scout (read-only)**: `gpt-5.1-codex-mini` with `low` reasoning -- cheapest for exploration
- **Workers**: Tiered across `codex`/`codex-mini`/`codex-spark` with `medium`/`high`/`xhigh` reasoning
- **Sparky (task worker)**: Separate fast-execution role for parallel swarm work

### Orchestration Patterns

**Wave-based (parallel-task)**:
- Parse plan file for task subsections with `depends_on` metadata
- Build dependency graph, launch unblocked tasks in parallel
- Wait for wave completion, validate, then launch next wave
- Each subagent commits only its own files, never pushes

**Rolling pool (super-swarm-spark)**:
- Ignores dependency maps entirely for maximum throughput
- Maintains rolling pool of up to 12 concurrent Sparky subagents
- Canonical path enforcement: subagents cannot invent filenames
- Context pack per task: exact file paths, naming constraints, neighboring tasks
- Final integration pass by orchestrator to reconcile conflicts

**LLM Council (multi-model)**:
- Spawns planners across multiple providers (Claude, Codex, Gemini, OpenCode)
- Plans are anonymized and randomized before judging to reduce bias
- Judge synthesizes best approach into `final-plan.md`
- 30-minute session timeout; real-time web UI for monitoring
- Configuration via JSON spec with per-agent model/reasoning settings

### Role Creator Meta-Skill
- Shell scripts (`write_role_config.sh`, `install_role.sh`, `validate_role.sh`)
- Validates against `codex-rs/core/config.schema.json`
- Creates timestamped backups before mutations
- Additive-only: never overwrites existing roles unless `--update-existing`
- Templates: minimal, restricted, full, frontend-architecture

---

## Publisher Background

**am.will** is a solo developer with 23 public repos, 62 followers on GitHub. Self-described "Context Engineer, Developer, Husband, Father." Account created August 2018. The codex-skills repo is the primary project (483 stars, 27 forks) -- relatively high traction for a Codex-specific tool library. No known corporate backing, VC funding, or team. The repo shows consistent activity from January through March 2026 with 109 commits. The naming convention and deep Codex integration suggest the author is a power user of OpenAI's Codex platform, likely building this for their own workflow and sharing publicly.

---

## What's Valuable for Us

1. **Role Taxonomy as Reference**: The 26-role breakdown (architect, scout, sparky, workers at different tiers) is a well-thought-out specialization hierarchy. Our `.claude/agents/` directory could benefit from studying this taxonomy, particularly:
   - **Scout pattern**: Read-only agent with cheapest model and lowest reasoning -- we could implement this as a context-gathering pre-step
   - **Worker tiering**: Multiple cost/quality tiers for the same generic "worker" role is something we don't currently do

2. **Canonical Path Enforcement (super-swarm-spark)**: The "context pack" pattern where each subagent receives exact file paths and naming constraints, with a rule that agents cannot invent filenames, directly addresses the filename drift problem we've seen in parallel agent work. This maps to Master Blueprint Principle 2 (deterministic orchestration).

3. **Anonymized Multi-Model Judging (llm-council)**: The pattern of spawning planners across different providers, anonymizing outputs, randomizing order, then using a judge to synthesize -- this is a solid bias-reduction technique for planning quality. Could be adapted as a planning skill in our orchestrator.

4. **architect.toml Developer Instructions**: The 4-phase architect prompt (ORIENT > CLARIFY > DESIGN > DEFINE CONTRACTS) with mandatory ADR format and "complexity thinking" guardrails is a high-quality system prompt worth studying for our own architect agent definitions.

5. **Model Tiering by Role**: The explicit assignment of different models and reasoning effort levels per role (cheap for scout, expensive for architect) validates our model routing research. Maps to our catalogue entries for LiteLLM and the model agnosticism strategy.

---

## What's NOT Relevant

1. **Codex Platform Lock-in**: Everything -- TOML configs, `npx skills` CLI, `spawn_agent` with `agent_type`, multi-agent threading via `[features] multi_agent = true` -- is specific to OpenAI Codex. None of this runs on Claude Code. Violates Master Blueprint Principle 7 (build what you need) since we'd need to rebuild everything.

2. **skills.sh Distribution Model**: Installing skills as markdown files via npm is an interesting packaging idea, but we already have `.claude/commands/` which serves the same purpose with native Claude Code integration.

3. **Documentation Access Skills**: context7, openai-docs-skill, markdown-url, read-github are utility skills we either already have (Context7 is in our catalogue) or can trivially replicate as MCP servers.

4. **Frontend/Design Skills**: Imported from Anthropic and Vercel -- these are generic prompt templates, not custom innovations.

5. **OpenAI Model Ecosystem**: The entire worker tier system (codex, codex-mini, codex-spark) is OpenAI-specific model routing. Our equivalent would use Opus/Sonnet/Haiku tiers.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the architect.toml prompt and adapt its 4-phase structure for our own architect agent command. Study the canonical path enforcement pattern from super-swarm-spark for our parallel agent work.
- **Phase 3 (Days 60-90)**: If we implement multi-model planning (using Claude + Gemini + GPT for cross-validation), the llm-council anonymization and judging pattern is a strong reference implementation.
- **Phase 4 (Days 90+)**: If the agent ecosystem converges on cross-platform skill standards (SKILL.md / OpenSkills), this project's skill packaging approach could become relevant for skill portability.

---

## Key Takeaway

> **A well-organized Codex-specific skill and agent role library whose most transferable contributions are the 26-role taxonomy with model tiering, the canonical path enforcement pattern for parallel swarms, and the anonymized multi-model judging workflow -- all worth studying as reference patterns even though none of the tooling works outside the Codex ecosystem.**
