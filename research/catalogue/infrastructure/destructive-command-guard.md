# Destructive Command Guard (DCG)

> **A Claude Code hook that blocks destructive commands before they execute — SIMD-accelerated, sub-millisecond, fail-open safety net for AI coding agents.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [Dicklesworthstone/destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard) |
| GitHub Stars | 642 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel + Darin Gordon — solo developers, Agent Flywheel ecosystem |
| License | MIT |
| Tech Stack | Rust (edition 2024, MSRV 1.85), memchr (SIMD), aho-corasick, ast-grep (tree-sitter), fancy-regex, tokio |
| Maturity | 🟢 Production (v0.4.3, 1,192 commits, 0 open issues, actively maintained) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *This is the safety infrastructure missing from our stack. We already have the "DU SCHREIBST NIEMALS CODE" rule for the orchestrator, but individual coding agents can still run `git reset --hard` or `rm -rf` and there's nothing stopping them besides prompt instructions. DCG solves this at the system level with a PreToolUse hook — pure deterministic guard, exactly where our Master Blueprint says safety should live (the 70% deterministic layer). The 49+ security packs covering databases, cloud, K8s, CI/CD are overkill for our current setup but the core git + filesystem guards are immediately useful. The fail-open design is smart — a safety tool that blocks legitimate work is worse than useless. Install with `--easy-mode` and forget about it. This is a 15-minute win.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly implements the Master Blueprint's "Quality Gates (deterministic, non-LLM)" layer. Our agents already run destructive git commands (INC-014 E2E gate exists but doesn't prevent mid-task damage). DCG is the missing guardrail. |
| **Novelty** | 7/10 | We haven't seen SIMD-accelerated command filtering before. The three-tier heredoc scanning (trigger → extract → AST match) is genuinely novel — catches `bash -c "git reset --hard"` which naive regex misses. Aho-Corasick for multi-keyword pack matching in O(n) is a strong pattern. |
| **Actionable** | 9/10 | `curl | bash --easy-mode` installs it, auto-configures Claude Code hooks, done. No code changes needed. Works on macOS. Immediate protection for all spawned agents. This is the highest-ROI safety improvement available today. |

---

## Overview

DCG is a Rust-native command guard that intercepts shell commands via Claude Code's PreToolUse hook mechanism before they execute. When a coding agent attempts `git reset --hard`, `rm -rf /`, or any of 49+ categories of destructive operations, DCG blocks the command and returns a JSON denial with an explanation and safer alternative.

The tool uses a tiered evaluation pipeline designed for zero perceptible latency. Tier 0 (Quick Reject) uses SIMD-accelerated substring matching via the `memchr` crate to reject obviously-safe commands in under 1 microsecond. Commands that survive quick rejection pass through normalization, safe-pattern matching, destructive-pattern matching, and optionally heredoc/inline-script extraction with AST-level analysis via tree-sitter grammars. The full pipeline targets under 5ms with a hard timeout at 200ms.

The critical design decision is **fail-open**: if DCG cannot analyze a command within its timeout or encounters a parse error, it allows the command through rather than blocking the workflow. This is the right trade-off for agent environments where a false-positive block can cascade into confusion, retries, and wasted context window. Even in fail-open mode, a lightweight fallback check catches the most critical destructive patterns.

---

## Technical Architecture

### Processing Pipeline

```
Agent (Claude Code / Gemini CLI / Copilot CLI)
         │ PreToolUse hook (stdin: JSON)
         ▼
    ┌─ Tier 0: Quick Reject ──────── SIMD memchr (<1μs) ──► ALLOW
    │
    ├─ Tier 1: Normalize ─────────── Shell expansion (5μs)
    │
    ├─ Tier 2: Safe Patterns ─────── Known-safe check (50μs) ──► ALLOW
    │
    ├─ Tier 3: Destructive Check ─── Pack evaluation (50μs) ──► BLOCK
    │
    ├─ Tier 4: Heredoc Extract ───── Content extraction (1ms)
    │                                 ├─ timeout/error → ALLOW + fallback
    │                                 └─ success ↓
    └─ Tier 5: AST Match ────────── tree-sitter grammars (2ms) ──► BLOCK
                                     (recursive for nested shells)

    Absolute timeout: 200ms → fail-open ALLOW
```

### Core Components

- **SIMD Quick Reject**: Lazy-compiled `memmem::Finder` instances for common keywords (`git`, `rm`, `kubectl`, etc.) using SSE2/AVX2/NEON vectorization
- **Aho-Corasick Automaton**: Multi-keyword matching for security packs — O(n) regardless of keyword count
- **Dual Regex Engine**: `regex` crate (linear, O(n), 85% of patterns) + `fancy_regex` (backtracking, lookahead/lookbehind, 15% of patterns)
- **Heredoc Scanner**: Three-tier architecture (RegexSet trigger → bounded extraction → tree-sitter AST matching) with recursive shell analysis for `bash -c "git reset --hard"` patterns
- **Pack System**: 49+ modular security packs (TOML-configured) covering git, filesystem, databases, cloud, K8s, CI/CD, messaging, monitoring, DNS, secrets, and more

### Configuration Layers (5 levels)

```
Environment variables → Explicit file path → Project config → User config → System config → Compiled defaults
```

### Claude Code Hook Integration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "dcg"
          }
        ]
      }
    ]
  }
}
```

### Agent Trust Configuration

```toml
[agents.claude-code]
trust_level = "high"
additional_allowlist = ["npm run build"]

[agents.unknown]
trust_level = "low"
extra_packs = ["paranoid"]
```

---

## Publisher Background

**Jeffrey Emanuel** is the creator of the Agent Flywheel ecosystem — a comprehensive suite of 29+ tools for multi-agent AI development environments. His background is in PE/hedge fund consulting, and he claims to ship 20,000+ lines of production Go code in a single day using his agent setup. Other notable tools in his ecosystem include Agent Mail (1,780 stars — inter-agent messaging), CASS (307 stars — session search across 11 agent formats), NTM (175 stars — tmux orchestration), and the main ACFS installer (1,237 stars). The Agent Flywheel entry already exists in our catalogue at `agent-harnesses/agent-flywheel.md`.

**Darin Gordon** ("Dowwie") contributed the initial Rust port with performance optimizations.

DCG has 1,192 commits, 38 forks, and 0 open issues — indicating active maintenance and healthy community adoption. The project uses an AGENTS.md file (which we also catalogue as a pattern) with strict multi-agent coordination rules, suggesting the tool is itself developed using agent-assisted workflows.

---

## What's Valuable for Us

1. **Immediate install, zero code changes**: `curl | bash --easy-mode` on macOS configures Claude Code hooks automatically. Every agent we spawn (conduit or teams mode) inherits the protection. This is the definition of a deterministic guardrail in our 70/30 split.

2. **Git operation guards**: Our orchestrator already has the "NIEMALS `git push --force`" rule in CLAUDE.md, but that's a prompt-level instruction agents can ignore under pressure. DCG enforces it at the system level: `git reset --hard`, `git push --force`, `git clean -f`, `git branch -D`, `git stash drop` — all blocked deterministically.

3. **The `dcg explain` command**: Useful for debugging why an agent's command was blocked. Shows the full evaluation trace with microsecond-level timing. This is observability for the safety layer.

4. **Fail-open design pattern**: Worth adopting conceptually for any guard/gate we build. The principle: "A blocked legitimate command is more disruptive than a missed dangerous one." Our E2E test gate (INC-014) should consider this philosophy.

5. **Heredoc/inline scanning**: Catches `python -c "import os; os.system('rm -rf /')"` and `bash -c "git reset --hard"` — commands that naive regex guards miss entirely. This is the difference between a toy guard and a production one.

6. **Pack system architecture**: Modular, TOML-configured security rules are a clean pattern for any policy engine we might build later.

---

## What's NOT Relevant

1. **49+ security packs beyond git/filesystem**: We don't run databases, Kubernetes, cloud infrastructure, CI/CD pipelines, message queues, or payment systems from our agent environment. The PostgreSQL, AWS, Kafka, Stripe packs are noise for us — but they're opt-in via config, so no cost.

2. **Multi-agent trust levels**: Our orchestrator doesn't differentiate agent trust levels — all coding agents have the same permissions. The per-agent trust configuration is overengineering for our setup.

3. **Linux/VPS-optimized ecosystem**: The broader Agent Flywheel ecosystem assumes Ubuntu VPS deployment. DCG itself works on macOS, but the ecosystem integration points (NTM, Agent Mail, CASS) target a different deployment model than our local macOS setup.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Install immediately. `--easy-mode` takes 2 minutes. Every agent gets git + filesystem protection with zero effort.
- **Phase 2 (Days 4-60)**: Monitor `dcg explain` output to understand what agents are attempting. Use blocked command logs as signal for agent prompt improvements — if an agent keeps hitting guards, its instructions need refinement.
- **Phase 3 (Days 60-90)**: When we move to the shared infrastructure layer (Master Blueprint Layer 3), DCG becomes part of the standard agent bootstrap alongside worktree isolation, health monitors, and budget circuit breakers.
- **Phase 4 (Days 90+)**: If we deploy agents to VPS/cloud environments for client work, enable the cloud/database/K8s packs. The trust level system becomes relevant when different business lines have different risk profiles (gov work vs. SaaS experiments).

---

## Key Takeaway

> **DCG is the highest-ROI safety improvement available today: a 2-minute install that deterministically prevents every destructive git and filesystem command our agents might execute, with sub-millisecond overhead and zero false positives from its fail-open design.**
