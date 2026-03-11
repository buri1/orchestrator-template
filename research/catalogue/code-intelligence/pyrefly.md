# Pyrefly

> **A fast type checker and language server for Python**

| Field | Value |
|-------|-------|
| Category | 🧬 Code Intelligence |
| Repository | [github.com/facebook/pyrefly](https://github.com/facebook/pyrefly) |
| Website | [pyrefly.org](https://pyrefly.org/) |
| GitHub Stars | 5,445 (as of 2026-03-09) |
| Publisher | Meta (bigtech) |
| License | MIT |
| Tech Stack | Rust (core), Python (pip package), TypeScript (VSCode extension), WASM (browser sandbox); reuses Ruff's Python parser (`ruff_python_parser`, `ruff_python_ast`) |
| Maturity | 🟡 Early (v0.55.0, active development, known issues acknowledged) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly maps to the Master Blueprint's Quality Gates layer (Layer 3: "Lint -> SAST/DAST -> Unit Tests -> E2E -> Multi-Model Review -> Confidence Score -> Human Review"). Pyrefly fills the type-checking slot in this deterministic quality pipeline for any Python-based agent work. Geoffrey Huntley explicitly recommends it as back-pressure infrastructure for dynamically typed agent codebases. Not higher because our primary stack is TypeScript/shell, not Python. |
| **Novelty** | 6/10 | Rust-based type checker for Python is not entirely new (Ruff pioneered the "rewrite Python tooling in Rust" movement), but Pyrefly's binding-based architecture and module-level parallelism approach is distinct from mypy/pyright. The integrated LSP is expected. The real novelty is the speed enabling tight agent feedback loops -- sub-second type checking on million-line codebases. |
| **Actionable** | 7/10 | `pip install pyrefly && pyrefly init` -- zero-config install. Can be wired into agent quality gates immediately for any Python project. The actionability depends on how much Python we write: for the Finance Agent (Python) and any future Python-based agent work, this is a same-day integration. For our TypeScript-heavy orchestrator, it's irrelevant until we have Python workloads. |

---

## Overview

Pyrefly is Meta's next-generation Python type checker, built from the ground up in Rust for speed. It is the successor to Pyre (Meta's original Python type checker) and represents a complete architectural rewrite rather than an incremental improvement. The project aims to provide lightning-fast type checking along with full IDE features -- autocomplete, code navigation, semantic highlighting, and code completion -- via an integrated Language Server Protocol (LSP) implementation.

The system processes Python code in three sequential phases per module: (1) determine module exports by resolving all import statements, (2) convert modules to bindings that capture scope and control flow information, and (3) solve those bindings, potentially requiring bindings from other modules. This binding-based approach trades fine-grained incrementality for raw module-level parallelism, betting that Rust's speed makes whole-module rechecking fast enough that file-level granularity is sufficient.

Pyrefly's significance for agent workflows is not as a direct tool in the orchestration stack but as **back-pressure infrastructure** -- a concept articulated by Geoffrey Huntley in his Ralph Wiggum article. When coding agents generate Python code in autonomous loops, a fast type checker creates a tight feedback cycle: generate code -> type check -> fix errors -> repeat. The faster the type checker, the more iterations per unit time, and the higher the code quality at convergence. Mypy is too slow for this role; Pyright is faster but single-threaded for most operations. Pyrefly's Rust core and parallel module processing make it the fastest option for this feedback loop.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Pyrefly Architecture                │
│                                                      │
│  Phase 1: EXPORTS                                    │
│  ┌──────────────────────────────────────────┐       │
│  │ Import resolution → Module export tables  │       │
│  │ (pyrefly/lib/export, pyrefly/lib/module)  │       │
│  └──────────────┬───────────────────────────┘       │
│                 ▼                                     │
│  Phase 2: BINDINGS                                   │
│  ┌──────────────────────────────────────────┐       │
│  │ Scope analysis + control flow → Bindings  │       │
│  │ (pyrefly/lib/binding)                     │       │
│  │ Flow types refine static types at each    │       │
│  │ control flow point (e.g., Literal[4])     │       │
│  └──────────────┬───────────────────────────┘       │
│                 ▼                                     │
│  Phase 3: SOLVING                                    │
│  ┌──────────────────────────────────────────┐       │
│  │ Type inference + constraint solving       │       │
│  │ (pyrefly/lib/alt, pyrefly/lib/solver)     │       │
│  │ Cross-module binding resolution           │       │
│  │ Parallel via Rayon thread pool            │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ LSP Server (lsp-server + lsp-types)       │       │
│  │ IDE: VSCode, Neovim, Zed                  │       │
│  │ State mgmt: pyrefly/lib/state             │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐       │
│  │ WASM Build (pyrefly_wasm)                 │       │
│  │ Browser sandbox at pyrefly.org/sandbox    │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Key Crates

| Crate | Purpose |
|-------|---------|
| `pyrefly` | Main binary + library; CLI commands, LSP, tests |
| `pyrefly_types` | Internal representation for Python types |
| `pyrefly_graph` | Module dependency graph |
| `pyrefly_config` | Configuration file format and options |
| `pyrefly_python` | Python-specific AST handling |
| `pyrefly_build` | Build system integration |
| `pyrefly_bundled` | Bundled type stubs |
| `pyrefly_util` | Shared utilities |
| `tsp_types` | TypeScript Protocol types |

### Key Dependencies

- **Ruff parser** (`ruff_python_parser`, `ruff_python_ast`, `ruff_source_file`): Reuses Astral's Rust Python parser rather than building from scratch -- smart engineering decision
- **Rayon**: Thread pool for parallel module processing
- **lsp-server / lsp-types**: Standard LSP implementation (uses Astral's fork of `lsp-types`)
- **DashMap**: Concurrent hash map for shared state during parallel solving
- **Blake3**: Content hashing for incremental invalidation
- **tikv-jemallocator**: Memory allocator on Linux/macOS for performance

### Design Principles (from AGENTS.md)

- **KISS over DRY**: Fewer functions, inline single-use helpers
- **Unreachable states must panic, not silently degrade**: No defensive `unwrap_or_default()` -- a type checker that silently produces wrong results is worse than one that crashes
- **Extract semantic information early**: Minimize `Expr` node passing
- **Test-first development**: First commit for a feature should be a failing test

---

## Publisher Background

Meta (formerly Facebook). One of the largest technology companies in the world. Pyrefly is the successor to Pyre, Meta's original Python type checker that has been used internally at scale for years. The project has Meta's engineering resources behind it, with active development (pushed 2026-03-08), 282 forks, and 487 open issues indicating healthy community engagement. Meta also maintains the internal Buck build system integration alongside the open-source Cargo build, suggesting this is a production tool at Meta scale, not a side project.

The team uses both Git (external) and Sapling/Mercurial (internal at Meta) for source control, confirming dual internal/external development. The AGENTS.md file demonstrates that Meta is using AI coding agents on this codebase itself -- a meta-validation of the tool's role in agent workflows.

---

## What's Valuable for Us

### 1. Back Pressure for Python Agent Codebases (Huntley Pattern)

Geoffrey Huntley's Ralph Wiggum article explicitly names Pyrefly as the recommended back-pressure tool for dynamically typed Python codebases. The thesis: in an autonomous agent loop (`while true; do claude-code; done`), the type checker is what prevents the agent from producing garbage. The faster the type checker, the tighter the feedback loop, the fewer wasted iterations.

**Concrete application**: For our Finance Agent (Python-based) or any future Python SaaS products from the SaaS Factory, wire Pyrefly into the agent's quality gate chain:

```
Agent generates Python code
  → pyrefly check (sub-second, deterministic)
  → Semgrep scan (security, deterministic)
  → pytest (unit tests)
  → Human review (if passes all gates)
```

This maps directly to Master Blueprint Layer 3 Quality Gates: "Lint -> SAST/DAST -> Unit Tests -> E2E -> Multi-Model Review -> Confidence Score -> Human Review."

### 2. Speed as Architecture Decision

Pyrefly's choice to use module-level parallelism over fine-grained incrementality is an opinionated bet: Rust is fast enough that re-checking an entire module is cheaper than maintaining incremental state. This validates our own architectural preference for simplicity over cleverness (Blueprint Principle 7: "Build only what you have needed in the last 30 days").

### 3. AGENTS.md as Living Example

Pyrefly maintains one of the most detailed `AGENTS.md` files we've seen -- covering architecture overview, directory structure, coding style guidelines, development environment detection (Buck vs Cargo), test patterns, and the `bug` marker convention. This is a reference implementation of the AGENTS.md protocol we already catalogue.

### 4. Ruff Parser Reuse Pattern

Pyrefly reuses Astral's Ruff Python parser rather than building their own. This is the "thin shared layer" pattern from our Build Strategy -- use the best available component rather than reinventing. Worth noting as evidence that even Meta follows this pattern.

---

## What's NOT Relevant

- **IDE features (autocomplete, navigation, highlighting)**: Our agents don't use IDEs. They operate via CLI. Only the `pyrefly check` command matters for our use case.
- **WASM build / browser sandbox**: Interesting for pyrefly.org but irrelevant to our CLI-first agent architecture.
- **VSCode extension**: Same reason -- our agents don't run in VSCode.
- **Internal Meta tooling (Buck, Sapling, arc autocargo)**: Meta-specific; we use Cargo/npm/git.
- **Python type checker as primary tool**: We are TypeScript-first for orchestration. Pyrefly only becomes relevant when we have Python workloads. It does NOT replace TypeScript type checking (which `tsc` already handles well).

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: If any Python-based SaaS products emerge from the SaaS Factory, integrate Pyrefly into the agent quality gate pipeline immediately. Also applicable if the Finance Agent gets expanded with new Python modules.
- **Phase 3 (Days 60-90)**: As agent teams scale, establish Pyrefly as the standard Python quality gate alongside Semgrep (SAST) and pytest (unit tests). Wire into the deterministic harness layer so all Python PRs pass `pyrefly check` before human review.
- **Phase 4 (Days 90+)**: If the system grows to handle client Python codebases (gov contracts), Pyrefly becomes a mandatory quality gate for all agent-generated Python code. The speed advantage over mypy becomes critical at scale.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/ralph | Geoffrey Huntley's full Ralph Wiggum article; Pyrefly referenced as back-pressure tool; core methodology document | Already catalogued: `articles/2025-07/ralph-wiggum-agent-loop.md` |
| https://github.com/facebook/pyrefly/blob/main/AGENTS.md | Reference AGENTS.md implementation; detailed coding guidelines for AI agents | Already analyzed above |

---

## Key Takeaway

> **Pyrefly is the fastest Python type checker available, purpose-built as back-pressure infrastructure for autonomous coding loops -- install it the moment you have Python in any agent-generated codebase.**
