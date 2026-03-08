# pi-agent-scip

> **SCIP (Source Code Intelligence Protocol) integration for Pi agent — adds go-to-definition, find-references, and find-implementations tools for language-agnostic codebase navigation.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [qualisero/pi-agent-scip](https://github.com/qualisero/pi-agent-scip) (ARCHIVED) |
| GitHub Stars | 3 (as of 2026-03-08) |
| Publisher | qualisero (community contributor, solo) |
| License | Not clearly specified (NOASSERTION in GitHub API) |
| Tech Stack | TypeScript (97.7%), JavaScript (2.3%), SCIP protocol |
| Maturity | 🔴 Archived (merged with rhubarb-pi, read-only since 2026-01-26) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Code intelligence (go-to-definition, find-references) would improve agent accuracy when navigating large codebases, but it's not core to our orchestration architecture. More relevant for individual coding agents than the orchestrator itself. |
| **Novelty** | 6/10 | SCIP integration gives agents IDE-level code understanding beyond grep/find. Sourcegraph's protocol is the industry standard. The concept of giving agents structured code navigation rather than raw text search is valuable. |
| **Actionable** | 2/10 | Archived and merged into rhubarb-pi. Cannot be installed or used as-is. Would need to evaluate rhubarb-pi instead or extract the SCIP integration pattern. |

---

## Overview

pi-agent-scip added SCIP (Source Code Intelligence Protocol, pronounced "skip") tools to the Pi agent, giving it IDE-level code navigation capabilities: go-to-definition, find-references, and find-implementations. SCIP is Sourcegraph's language-agnostic protocol for indexing source code, supporting rich bindings for Go, Rust, TypeScript, and other languages.

The extension was active for approximately 3 weeks (January 4-26, 2026) before being archived with the note "Merged with rhubarb-pi." This suggests the SCIP integration was absorbed into a larger project rather than abandoned. The extension reached v0.2.2 with 27 commits, indicating meaningful development before the merge.

The core value proposition — giving agents structured code navigation instead of relying on grep and find — remains relevant. Agents with SCIP can answer "where is this function called?" or "what implements this interface?" with precision rather than pattern matching.

---

## Technical Architecture

```
Pi Agent
    │
    └── SCIP Tools (from pi-agent-scip)
            │
            ├── go_to_definition(symbol)
            │   └── Returns: file path, line, column
            │
            ├── find_references(symbol)
            │   └── Returns: list of locations
            │
            └── find_implementations(interface)
                └── Returns: implementing types/functions

SCIP Index Pipeline:
    Source Code → Language-specific SCIP indexer → .scip index file → Pi tools query
```

**SCIP Protocol:** Language-agnostic protobuf-based format for source code indexing. Supports:
- TypeScript/JavaScript (scip-typescript)
- Go (scip-go)
- Rust (rust-analyzer SCIP output)
- Java (scip-java)
- Python (scip-python)
- And others via Sourcegraph's indexer ecosystem

**Prerequisites:** A SCIP index file must be generated for the target codebase using the appropriate language indexer before the tools can be used.

**Current Status:** Archived. Code merged into rhubarb-pi (separate project). The repository is read-only.

---

## Publisher Background

qualisero is a community contributor with minimal public profile. The quick development cycle (27 commits in 3 weeks) and subsequent merge into rhubarb-pi suggest this was an experimental extraction that found a better home in a larger project. The 3-star count and archival indicate very limited community adoption before the merge.

---

## What's Valuable for Us

1. **Concept: Structured Code Navigation for Agents:** The idea of giving agents SCIP-based code intelligence instead of grep is worth studying. For large TypeScript codebases (like ours), `find_references` and `go_to_definition` would significantly improve agent accuracy when making cross-file changes.

2. **SCIP Index as Agent Context:** Pre-generating a SCIP index for our codebase and making it available to agents could reduce the "scan and understand" phase of our Scout agent pattern. Instead of grepping for symbols, agents query the index.

3. **Language-Agnostic Protocol:** SCIP works across our entire stack (TypeScript, shell scripts via tree-sitter, etc.). One protocol covers all our languages.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Archived** | Cannot be installed or used. Must evaluate rhubarb-pi or extract patterns manually. |
| **Index generation overhead** | SCIP indexes must be pre-generated per codebase. For our rapidly changing codebases, keeping indexes fresh adds CI overhead. |
| **Overkill for small codebases** | Our current projects are small enough that grep + Pi's 4 tools work fine. SCIP becomes valuable at scale (10K+ files). |
| **Not orchestration-relevant** | Improves individual agent code navigation, not agent coordination. Orthogonal to our orchestrator architecture. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** No action. Archived extension with no usable package.
- **Phase 3 (Days 60-90):** Evaluate rhubarb-pi (the successor project) for SCIP integration. If our codebases grow large enough, pre-generating SCIP indexes could improve agent accuracy.
- **Phase 4 (Days 90+):** If building a code intelligence layer, SCIP indexing in CI + agent tools for structured navigation could reduce agent errors on large refactoring tasks. Consider as part of a broader "agent toolkit" expansion.

---

## Key Takeaway

> **pi-agent-scip validated the concept of giving agents SCIP-based code intelligence (go-to-definition, find-references) but was archived after merging into rhubarb-pi — the pattern is worth tracking but the extension itself is unusable, and our current codebase size doesn't justify the indexing overhead.**
