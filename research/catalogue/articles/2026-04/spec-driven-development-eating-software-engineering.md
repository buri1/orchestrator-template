# Spec-Driven Development Is Eating Software Engineering

> **Vishal Mysore — Medium, 2026-03-09**

| Field | Value |
|-------|-------|
| Source | https://medium.com/@visrow/spec-driven-development-is-eating-software-engineering-a-map-of-30-agentic-coding-frameworks-6ac0b5e2b484 |
| Author | Vishal Mysore |
| Publication | Medium |
| Date | 2026-03-09 |
| Topics | spec-driven development, agentic coding, task DAG, multi-agent frameworks, SPEC.md, ARCHITECTURE.md, AI IDE, prompt-to-code limitations |
| Read Time | ~3 min |

---

## Burak's Notes

> *This is the landscape map we've been missing. Mysore identifies the exact shift we've been living: prompt-to-code breaks down at scale, so you need Spec → Plan → Tasks → Code. His four-layer stack maps cleanly onto our orchestrator: Layer 1 (Spec) = our CLAUDE.md + agent personas, Layer 2 (Planning) = our orchestrator loop's GET_NEXT_TASK, Layer 3 (Execution) = our tmux worker agents, Layer 4 (IDE) = Claude Code itself. BMAD is explicitly mentioned as a Layer 1 spec framework. The "spec-as-source" movement — where specs compile into code like SQL compiles into query plans — is the logical endpoint of what we're building. This article should be required reading for anyone trying to understand where agent-driven development is heading.*

---

## Key Takeaways

1. **Prompt-to-Code Is a Dead End at Scale** — Traditional prompt → code workflows break down with large codebases: contextual information is lost, architectural decisions disappear, modifications become inconsistent, and AI fails to retain earlier design choices. The fix is not better prompts but structured intermediate artifacts.

2. **Spec → Plan → Tasks → Code** — The new workflow treats the specification as the single source of truth. Requirements documents, architecture plans, task breakdowns, and implementation steps are all generated before any code is written. This is the inversion: humans write specs, AI writes code.

3. **Four-Layer Agentic Coding Stack** — Mysore maps 30+ frameworks into four layers: (1) Spec Frameworks (Spec Kit, OpenSpec, BMAD, Intent, cc-sdd) generating SPEC.md/ARCHITECTURE.md/TASKS.md, (2) Planning & Task Systems (Taskmaster, Agent OS, Beads, Feature-Driven-Flow) converting specs into executable task graphs, (3) Execution Agents (GSD, Devika, OpenDevin, CrewAI, LangGraph, AutoGen) writing and modifying code, (4) AI IDEs (Cursor, Windsurf, Kiro, Claude Code, Sweep AI) as developer-facing integration.

4. **BMAD Explicitly Cited as Layer 1 Framework** — Our own BMAD methodology is named alongside Spec Kit, OpenSpec, Intent, and cc-sdd as a spec framework generating structured artifacts. This is external validation of our approach.

5. **Spec-as-Source Movement** — The emerging paradigm treats specifications as the primary artifact, with code generated automatically — mirroring how SQL compiles into query plans and Terraform compiles into infrastructure. Tessl and Intent-driven platforms are early examples. If this plays out, the spec becomes the codebase.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps the landscape our orchestrator operates in; BMAD explicitly cited; four-layer stack validates our architecture; spec-as-source is our long-term direction |
| **Actionable** | 7/10 | Use as reference architecture for explaining our system to clients; evaluate Layer 2 tools (Taskmaster, Beads) as potential upgrades to our task planning; study Layer 3 competitors |

---

## Summary

Vishal Mysore's article maps the emerging landscape of spec-driven development (SDD) — the shift from prompt-to-code to spec-to-code in AI-assisted software engineering. The core argument is that AI performs dramatically better when executing structured tasks from specifications than when responding to open-ended prompts. Large codebases cause prompt-to-code workflows to lose context, forget architectural decisions, and produce inconsistent modifications.

The solution is a four-layer stack. Layer 1 (Spec Frameworks) includes tools like Spec Kit, OpenSpec, BMAD, Intent, and cc-sdd that generate structured artifacts (SPEC.md, ARCHITECTURE.md, TASKS.md). Layer 2 (Planning & Task Systems) includes Taskmaster, Agent OS, Beads, and Feature-Driven-Flow that convert specifications into executable task graphs — functioning as "AI project management." Layer 3 (Execution Agents) includes GSD, Devika, OpenDevin, CrewAI, LangGraph, and AutoGen that actually write and modify code, handle testing, and manage version control. Layer 4 (AI IDEs) includes Cursor, Windsurf, Kiro, Claude Code, and Sweep AI as the developer-facing integration layer.

Mysore identifies an emerging "spec-as-source" movement where specifications become the primary artifact and code is generated automatically — analogous to how SQL compiles into query plans and Terraform compiles into infrastructure. Tessl and Intent-driven platforms are early examples of this paradigm.

The article concludes that if current trends continue, specifications may become the primary interface between humans and software systems, fundamentally reshaping how software is built.

---

## Notable Quotes

> "AI performs much better when it executes structured tasks rather than open-ended prompts."

> "Specifications may become the primary interface between humans and software systems."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/spec-kit/spec-kit | Layer 1 spec framework — compare with BMAD's artifact generation approach | `/tool-catalogue` |
| https://github.com/eyaltoledano/claude-task-master | Taskmaster — Layer 2 task planning system; potential upgrade to our orchestrator's task decomposition | `/tool-catalogue` |
| https://tessl.io | Spec-as-source platform — the logical endpoint of SDD where specs compile directly to running software | `/tool-catalogue` |
| https://github.com/nicepkg/gpt-runner | GSD execution agent — Layer 3 competitor to our tmux worker approach | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| BMAD | Layer 1 spec framework (our methodology, explicitly cited) | Yes — core to our system |
| Spec Kit | Layer 1 spec framework | Not yet catalogued |
| OpenSpec | Layer 1 spec framework | Not yet catalogued |
| Taskmaster | Layer 2 planning/task system | Not yet catalogued |
| Beads | Layer 2 planning/task system | Not yet catalogued |
| CrewAI | Layer 3 execution agent | Referenced in multiple entries |
| LangGraph | Layer 3 execution agent | Not yet catalogued |
| OpenDevin | Layer 3 execution agent | Not yet catalogued |
| Claude Code | Layer 4 AI IDE | Core to our system |
| Cursor | Layer 4 AI IDE | Referenced in multiple entries |
| Kiro | Layer 4 AI IDE | Not yet catalogued |
| Tessl | Spec-as-source platform | Not yet catalogued |

---

## Action Items

- [ ] Use Mysore's four-layer stack as the reference architecture when explaining our orchestrator to clients and in presentations
- [ ] Evaluate Taskmaster and Beads (Layer 2) as potential structured task planning upgrades to our orchestrator's GET_NEXT_TASK phase
- [ ] Track the spec-as-source movement (Tessl, Intent) as the long-term direction for BMAD — could specs eventually compile directly to running applications?
- [ ] Update BMAD documentation to reference this external citation as validation
