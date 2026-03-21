# Spec-Driven Development Is Eating Software Engineering: A Map of 30+ Agentic Coding Frameworks

> **Vishal Mysore — Medium, 2026-03-10**

| Field | Value |
|-------|-------|
| Source | [Medium](https://medium.com/@visrow/spec-driven-development-is-eating-software-engineering-a-map-of-30-agentic-coding-frameworks-6ac0b5e2b484) |
| Author | Vishal Mysore |
| Publication | Medium |
| Date | 2026-03-10 |
| Topics | spec-driven development, agentic coding, framework taxonomy, AI IDE, autonomous coding agents, specification-as-source |
| Read Time | ~3 min |

---

## Burak's Notes

> *Lightweight taxonomy article — useful as a landscape overview but shallow on each framework. The 4-layer stack (Spec Frameworks -> Planning/Task Systems -> Execution Agents -> AI IDEs) is a clean mental model that maps to our own architecture. We already catalogue most of these tools individually with far more depth. The "spec as source code" framing validates our BMAD spec-driven approach. The article notably includes BMAD in the Spec Frameworks layer — external validation of our tooling appearing in landscape surveys. Not much new here for us, but good to have as a reference for how the industry is categorizing the space.*

---

## Key Takeaways

1. **Spec-Driven Development is the industry convergence** — The shift from "Prompt -> Code" to "Spec -> Plan -> Tasks -> Code" is now recognized as a named paradigm (SDD). The article frames this as the dominant trajectory for agentic coding, moving specifications from documentation to source of truth.

2. **Four-layer agentic coding stack** — The taxonomy organizes 30+ tools into: (1) Spec Frameworks (requirements/architecture artifacts), (2) Planning & Task Systems (task graph generation), (3) Execution Agents (code writing/modification), (4) AI IDEs (developer interaction layer). This layering maps cleanly to our own orchestrator architecture.

3. **Spec-as-source is the radical endpoint** — Platforms like Tessl treat specifications as the primary artifact with code as a compiled output, analogous to SQL generating query plans or Terraform generating infrastructure. This is the logical conclusion of SDD taken to its extreme.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | The 4-layer taxonomy is a useful reference frame. BMAD is explicitly named as a Spec Framework, which is external validation. The "spec as source of truth" philosophy aligns directly with our architecture. However, the article is extremely shallow — 3 min read covering 30+ tools means no depth on any of them. We already catalogue most of these tools individually with far more analysis. |
| **Actionable** | 3/10 | No new tools or patterns we haven't already catalogued. The taxonomy itself is useful for communication/framing but not for implementation. The main value is as a citation — external validation that the SDD approach we use (via BMAD) is becoming an industry-recognized paradigm. |

---

## Summary

Vishal Mysore maps the emerging ecosystem of spec-driven development tools, arguing that the industry is converging away from direct prompt-to-code workflows toward a structured pipeline where specifications serve as the authoritative source. The core problem statement is that prompts lose context, architecture decisions disappear, and changes become inconsistent at scale.

The article proposes a four-layer stack: Spec Frameworks (Spec Kit, OpenSpec, BMAD, Intent, cc-sdd) that generate requirement artifacts; Planning & Task Systems (Taskmaster, Agent OS, Beads, Feature-Driven-Flow) that convert specs into executable task graphs; Execution Agents (GSD, Devika, OpenDevin, CrewAI, LangGraph, AutoGen) that write and modify code; and AI IDEs (Cursor, Windsurf, Kiro, Claude Code, Sweep AI) where developers interact with the system.

The most provocative claim is the "spec-as-source" movement where platforms like Tessl treat specifications as source code and generated code as compiled artifacts — analogous to SQL or Terraform. The article positions this as the early stage of a paradigm shift where specifications become the primary interface between humans and software systems.

---

## Notable Quotes

> "AI performs much better when it executes structured tasks rather than open-ended prompts."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| — | All mentioned tools already catalogued or too shallow to warrant follow-up | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Spec Kit | Spec Framework layer | Yes — [spec-kit.md](../agent-harnesses/spec-kit.md) |
| OpenSpec | Spec Framework layer | Yes — [openspec.md](../agent-harnesses/openspec.md) |
| BMAD | Spec Framework layer | Yes — our own tooling |
| Intent | Spec Framework layer | No — mentioned only by name |
| cc-sdd | Spec Framework layer | No — mentioned only by name |
| Taskmaster | Planning & Task Systems layer | No — mentioned only by name |
| Agent OS | Planning & Task Systems layer | No — mentioned only by name |
| Beads | Planning & Task Systems layer | Yes — [beads.md](../agent-memory/beads.md) |
| Feature-Driven-Flow | Planning & Task Systems layer | No — mentioned only by name |
| GSD | Execution Agents layer | No — mentioned only by name |
| Devika | Execution Agents layer | No — mentioned only by name |
| OpenDevin | Execution Agents layer | No — mentioned only by name |
| CrewAI | Execution Agents layer | Yes — [crew-ai.md](../orchestration-platforms/crew-ai.md) |
| LangGraph | Execution Agents layer | Yes — [langgraph.md](../orchestration-platforms/langgraph.md) |
| AutoGen | Execution Agents layer | Yes — [autogen.md](../orchestration-platforms/autogen.md) |
| Cursor | AI IDE layer | N/A (commercial product) |
| Windsurf | AI IDE layer | N/A (commercial product) |
| Kiro | AI IDE layer | N/A (commercial product) |
| Claude Code | AI IDE layer | Yes — primary harness |
| Sweep AI | AI IDE layer | No — mentioned only by name |
| Tessl | Spec-as-Source movement | No — mentioned only by name |

---

## Action Items

- [ ] None — article is a lightweight landscape survey; all tools with sufficient depth are already catalogued
