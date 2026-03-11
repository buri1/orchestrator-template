# BAML

> **The AI framework that adds the engineering to prompt engineering — a domain-specific language for building AI applications with type-safe structured outputs.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [BoundaryML/baml](https://github.com/BoundaryML/baml) |
| Website | [boundaryml.com](https://www.boundaryml.com) |
| GitHub Stars | 7,717 (as of 2026-03-08) |
| Publisher | BoundaryML (startup, Seattle WA) |
| License | Apache-2.0 |
| Tech Stack | Rust (compiler/runtime), generates clients for Python, TypeScript, Ruby, Go, Java, C#, Rust. Jinja2 prompt templating. VSCode/Cursor/JetBrains extensions. |
| Maturity | 🟢 Production (weekly releases, used by SAP, Product Hunt, Aer Compliance, Vetrec; 2,889 commits; Dragonfly case study: 250K products, 2000+ concurrent runs) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Flagged via Neils Bentilan's talk (Union/Flyte) — Dragonfly onboarded a local BAML agent prototype to production in ~1 hour. That's a strong signal for developer velocity on structured output pipelines. The "every prompt is a function" paradigm is conceptually clean. Worth evaluating if we ever build custom agent runtimes where we control the LLM call layer directly.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | BAML solves the "structured LLM output" problem with type safety and code generation. Our current stack uses Claude Code as a black box — we don't control the raw LLM call layer where BAML operates. Becomes relevant only if we build a custom agent runtime (Phase 3+) or need standalone structured extraction pipelines outside Claude Code. The Master Blueprint's Principle 2 (deterministic orchestration, LLM execution) means BAML would live entirely in the "LLM execution" slice. |
| **Novelty** | 6/10 | The DSL-as-compiler approach (Rust compiler -> polyglot code gen) is a more rigorous version of what Pydantic/Zod do at runtime. SAP (Schema-Aligned Parsing) that extracts structured data from flexible LLM outputs without requiring native function-calling is genuinely useful. But typed LLM outputs are a solved-enough problem via Anthropic's native tool_use and structured output modes. The novelty is in the developer experience, not the capability. |
| **Actionable** | 4/10 | Low immediate actionability for our orchestrator stack. Claude Code handles its own prompt/output layer. BAML cannot be injected into CC's internals. However, if we build standalone extraction pipelines (e.g., processing research docs, parsing bookmarks, structured data from web scrapes), BAML could replace ad-hoc JSON parsing. The ~1 hour onboarding claim from Dragonfly suggests low adoption friction when the use case fits. |

---

## Overview

BAML (Basically A Made-Up Language) is a domain-specific language created by BoundaryML that treats every LLM prompt as a typed function: you declare inputs with types, declare the output schema, write the prompt in Jinja2-flavored templates, and the Rust-based compiler generates native client code in 7+ languages. The generated `baml_client` handles serialization, deserialization, retries, fallbacks, and streaming — all type-safe at compile time, not runtime.

The core innovation is **SAP (Schema-Aligned Parsing)**, a proprietary algorithm that extracts structured data from LLM outputs regardless of whether the model supports native function-calling. SAP handles markdown-wrapped JSON, chain-of-thought reasoning mixed with structured output, partial responses, and other real-world LLM output messiness. This means BAML works with any model — OpenAI, Anthropic, Google, open-source via Ollama/vLLM — without relying on provider-specific structured output features.

BAML's design philosophy explicitly avoids framework lock-in: no runtime daemon, no external network calls beyond your LLM requests, git-native versioning (`.baml` files are plain text), and the generated code integrates like any library import. The team draws a deliberate analogy to how TypeScript enhanced JavaScript reliability — BAML aims to do the same for prompt engineering by making it "schema engineering." The weekly release cadence and 7.7K stars suggest genuine developer adoption, and the Dragonfly case study (250K products, 2000+ concurrent runs via Flyte) validates production-scale deployment.

---

## Technical Architecture

```
.baml files (DSL)
       |
BAML Compiler (Rust)        Schema definitions, function declarations, client configs
       |
Code Generation              baml_client libraries for Python/TS/Ruby/Go/Java/C#/Rust
       |
SAP Engine                   Schema-Aligned Parsing — extracts typed output from raw LLM text
       |
LLM Client Layer             Provider-agnostic: OpenAI, Anthropic, Google, Bedrock, Ollama, vLLM
       |
Retry/Fallback/Round-Robin   Built-in resilience: retry_policy, fallback chains, load balancing
```

### Core DSL Constructs

| Construct | Purpose | Example |
|-----------|---------|---------|
| `class` | Output schema with typed fields | `class Resume { name string, title string }` |
| `enum` | Constrained categorical outputs | `enum Sentiment { POSITIVE, NEGATIVE, NEUTRAL }` |
| `function` | Typed LLM call with prompt template | `function Extract(text: string) -> Resume` |
| `client<llm>` | Provider configuration | `client<llm> GPT4o { provider openai, model "gpt-4o" }` |
| `test` | Built-in test declarations | `test ExtractResume { ... }` |
| `retry_policy` | Retry configuration | Exponential backoff, max retries |
| `fallback` | Multi-provider fallback chains | Primary -> secondary -> tertiary |

### Type System

- **Primitives:** `string`, `int`, `float`, `bool`
- **Collections:** arrays, maps
- **Complex:** `class`, `enum`, media types (`Image`, `Audio`, `Pdf`, `Video`)
- **Modifiers:** optional (`?`), union (`|`), literal strings (`"happy" | "sad"`)
- **Dynamic:** `TypeBuilder` for runtime type construction, `@@dynamic` attribute
- **Constraints:** `@assert` (hard validation), `@check` (soft validation) on outputs

### Resilience

- `retry_policy` with configurable backoff and max retries
- `fallback` across multiple LLM clients
- `round-robin` load balancing
- `BamlValidationError` for schema mismatches
- `BamlClientFinishReasonError` for LLM-level failures
- `Collector` utility for token tracking

---

## Publisher Background

**BoundaryML** is a venture-backed startup headquartered in Seattle, WA. The team is engineering-heavy with a Rust-first systems programming background — the compiler, runtime, and SAP engine are all Rust. The project started October 2023 (repo creation date) and has maintained a weekly release cadence since.

Notable adopters include **SAP**, **Product Hunt**, **Aer Compliance**, **PMMI**, and **Vetrec**. The Dragonfly case study (via Neils Bentilan's talk at AI Driven Dev 2026) demonstrated 250K product processing with 2000+ concurrent runs in production, using BAML for structured agent outputs within a Flyte orchestration pipeline.

The Apache-2.0 license, 7.7K stars, 386 forks, and active Discord community indicate healthy open-source traction. The company is actively hiring (job listings on website), suggesting continued investment and growth. No public funding announcements found, but the enterprise customer list (SAP) suggests revenue traction.

---

## What's Valuable for Us

1. **Transferable Pattern: "Every prompt is a typed function."** Even without adopting BAML, the mental model is valuable. Our orchestrator spawns agents with free-form markdown instructions. Defining structured I/O contracts (what goes in, what comes out, what types) for every agent interaction would reduce the "agent produced unexpected garbage" failure mode. This maps directly to Master Blueprint Principle 2 (deterministic orchestration).

2. **SAP (Schema-Aligned Parsing) concept.** When we build extraction pipelines (research ingestion, bookmark processing, catalogue generation), BAML's approach of parsing structured data from messy LLM output is more robust than raw JSON mode. The algorithm handles markdown wrapping, chain-of-thought leakage, and partial outputs — all failure modes we've seen in our ingest agents.

3. **Standalone extraction pipelines.** If we need to build data extraction outside Claude Code (e.g., batch processing research docs, parsing web scrapes, structured catalogue generation), BAML provides a production-ready framework with multi-language support. The ~1 hour onboarding claim from Dragonfly suggests low adoption cost.

4. **Resilience patterns.** The `retry_policy` + `fallback` + `round-robin` configuration is a clean declarative approach to LLM call resilience. We could adopt this pattern in our deterministic harness layer even without using BAML itself.

5. **Testing discipline.** BAML's built-in `test` declarations and VSCode playground enforce a test-before-deploy discipline for LLM interactions. `baml-cli test` in CI/CD is a concrete pattern we lack for validating prompt changes.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Wrong abstraction level for current stack** | Like DSPy, BAML operates at the raw LLM call layer. Claude Code is a black box — we cannot inject BAML between our orchestrator prompts and Claude's API. BAML is a tool for building LLM applications from scratch, not for enhancing an existing agent harness. |
| **Overlaps with native Anthropic features** | Claude's native `tool_use` and structured output modes already solve the core structured output problem for our stack. BAML's advantage (model-agnostic structured outputs) matters less when we're Claude-native on Claude Max. |
| **Code generation adds build step** | `baml-cli generate` adds a compilation step to the dev workflow. Our current pure-prompt-engineering approach (`.claude/agents/`, `.claude/commands/`) has zero build steps. Adding compilation contradicts the simplicity principle. |
| **No orchestration capabilities** | BAML has zero concept of multi-agent coordination, session management, tmux, worktrees, state persistence, or crash recovery. It is not an orchestrator — it is a single-LLM-call optimizer. Does not compete with or complement our orchestration layer. |
| **Principle 7 conflict** | Master Blueprint Principle 7: "Build only what you have needed in the last 30 days." We have not needed a typed LLM DSL in the last 30 days. Our current bottleneck is orchestration reliability and E2E testing, not structured output quality. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** No adoption. Extract the transferable pattern: define structured I/O contracts for agent interactions in our orchestrator prompt templates. Use BAML's type system as inspiration for what our agent state schemas should enforce.

- **Phase 3 (Days 60-90):** If building standalone extraction pipelines (research ingestion, catalogue generation, web scraping), evaluate BAML as the structured output layer. The Rust compiler + polyglot code gen is well-suited for batch processing workloads where Claude Code is overkill. Also evaluate if building a custom `AgentRuntime` adapter — BAML could handle the prompt -> structured output transformation inside custom agents.

- **Phase 4 (Days 90+):** If federating across multiple LLM providers (Master Blueprint's model routing vision), BAML's provider-agnostic structured outputs become more valuable. The `fallback` and `round-robin` patterns across OpenAI/Anthropic/Google/local models map to the LiteLLM + model routing architecture. BAML + LiteLLM could form a robust typed extraction layer.

---

## Key Takeaway

> **BAML is the most polished "typed functions for LLM calls" framework available — its Rust compiler, SAP parsing engine, and polyglot code generation solve the structured output problem rigorously — but it operates at the wrong abstraction level for our Claude Code-based stack, making it a Phase 3+ consideration for standalone extraction pipelines rather than an orchestration tool.**
