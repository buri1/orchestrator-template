# Do Software Fundamentals Matter in the AI Age? Yes, More Than Ever

> **Matt Pocock (AI Hero, Engineer and Educator) — AI Engineer Europe 2026, London, 9 April 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=30572s |
| Speaker | Matt Pocock — Engineer and Educator at AI Hero (aihero.dev); creator of "Claude Code for Real Engineers" course; TypeScript content creator |
| Event | AI Engineer Europe 2026, London (hosted by swyx / smol.ai) |
| Duration | ~18 min (conference talk) |
| Date | 2026-04-09 |
| Skills Repo | https://github.com/mattpocock/skills |
| Topics | software fundamentals, deep vs shallow modules, John Ousterhout, design concept, ubiquitous language, domain-driven design, TDD, feedback loops, PRD authoring, skills, anti-specs-to-code, codebase legibility, cognitive load, Kent Beck, gray-box delegation |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Matt Pocock is an engineer and educator running the AI Hero platform (aihero.dev). He teaches "Claude Code for Real Engineers" and is best known in the TypeScript community for his free video courses on type-level programming, generics, and advanced TS patterns. AI Hero is his current vehicle: a newsletter and course platform focused on real-world AI engineering craft rather than hype. His skills repository at [github.com/mattpocock/skills](https://github.com/mattpocock/skills) publishes the agent skills he uses and teaches.

This AIE Europe 2026 talk is his direct rebuttal to the "specs-to-code" discourse that has dominated the AI coding conversation in Q1 2026. He argues the opposite thesis: software fundamentals matter MORE than ever, because good codebases reward AI collaboration massively while bad ones become more expensive than ever.

---

## Main Thesis

**Software fundamentals matter MORE than ever in the AI age.** The specs-to-code movement is wrong -- code entropy increases without architectural thinking, and bad code is now the most expensive it has ever been. In good codebases, AI does really well; in bad codebases, AI compounds the mess. Therefore, the highest-leverage engineering activity in 2026 is investing in the design of the system every day, not divesting from it.

Four failure modes kept biting Matt while working with AI agents. Each has a concrete skill that addresses it, and each is a direct application of a classical software-engineering principle from Ousterhout, the Pragmatic Programmer, Brooks, or Evans. All five skills are published at [github.com/mattpocock/skills](https://github.com/mattpocock/skills) and are directly adoptable.

---

## Talking Points (All 12)

### 1. The Specs-to-Code Movement Is Wrong

- The pitch: "write a spec, have AI compile it to code, fix the spec not the code."
- Matt tried it. Each iteration produced WORSE code.
- This is **software entropy** (Pragmatic Programmer): things tend toward disaster without care.
- Specs-to-code is "just vibe coding by another name." It divests from design instead of investing in it.

### 2. Bad Code = Hard to Change (Ousterhout)

- From John Ousterhout's *A Philosophy of Software Design*: "Complexity is anything related to structure that makes it hard to understand and modify."
- Bad code = hard to change code. Good code = easy to change.
- The definition matters now more than ever because "change" is what AI does at scale.

### 3. Code Is NOT Cheap -- Bad Code Is the Most Expensive It Has Ever Been

- Counter to the popular "code is free" narrative (Lopopolo, Ubl, etc.).
- AI can 10x your output in a good codebase. It cannot in a bad one.
- **Bad code is the most expensive ever** because if your codebase is hard to change, you cannot take the AI bounty. You are locked out of the acceleration.
- Therefore: good codebases matter more than ever = software fundamentals matter more than ever.

### 4. Failure Mode #1: "AI Didn't Do What I Wanted"

- Root cause: no one knows exactly what they want (Pragmatic Programmer).
- The **design concept** (Frederick P. Brooks, *The Design of Design*) is an ephemeral idea floating between you and the AI. Not an asset. Not a markdown file. An invisible theory of what you're building.
- **Fix: the Grill Me skill.** Tell the AI to interview you relentlessly until it has a shared understanding. 40-100+ questions before the AI is satisfied.
- Turns AI from compliant assistant into adversary in service of alignment.
- Output of Grill Me: a PRD, issues, or a concrete plan -- *after* the design concept is externalized.
- Better than default plan mode, which is too eager to create an asset before understanding.

### 5. Failure Mode #2: "AI Is Too Verbose, Talking Across Purposes"

- Language gap: like a developer and a domain expert who speak past each other.
- The fix, from Eric Evans' *Domain-Driven Design*: **ubiquitous language** -- a shared vocabulary where conversations between developers, code, and domain experts are all derived from the same model.
- **Fix: the Ubiquitous Language skill.** Scans the codebase, extracts domain terminology, creates markdown tables of terms and definitions.
- Matt keeps the output file open while planning. It improves planning quality AND makes AI output less verbose and better aligned with the implementation.

### 6. Failure Mode #3: "AI Built the Right Thing But It Doesn't Work"

- Obvious remedies: static types, browser access for frontend, automated tests.
- Deeper cause: LLMs don't use feedback loops well. They try to do too much at once.
- Pragmatic Programmer: "outrunning your headlights."
- **"The rate of feedback is your speed limit."**
- **Fix: TDD forces small steps.** Red/green/refactor constrains the AI to one cycle at a time and gives it the fast feedback it cannot provide itself.

### 7. Testing Is Hard (It Always Has Been)

- Testing decisions are interdependent:
  - How big is a unit?
  - What to mock, what to use real?
  - What behaviors to test?
- Big unit = fewer behaviors = more mocks. Small unit = more behaviors = less mocking.
- Good codebases are easy to test. Easy tests = better feedback loops = better AI output.
- Loops back to the core thesis: good codebases matter more.

### 8. Deep vs Shallow Modules (Ousterhout)

- **Deep module:** lots of functionality behind a simple interface, complexity hidden.
- **Shallow module:** not much functionality, complex interface leaking into callers.
- **Shallow codebase pattern:** lots of tiny blobs with leaky interfaces. AI walks and navigates poorly, doesn't understand the code, fails to find the right module.
- **Deep codebase pattern:** same code, but structured inside boundaries with simple interfaces on top. AI follows the interfaces.
- **Division of labor:** you (the human) control the interfaces and design them. The AI handles the implementation.

### 9. The Improve-Codebase-Architecture Skill

- **Fix: the Improve Codebase Architecture skill.** Explores the codebase, finds related code, wraps it in deep modules with simple interfaces.
- The resulting codebase is testable *at the interface level* and verifiable *through the interface*.
- Rewards TDD because the interface is the test surface.
- Shallow -> deep refactors are exactly the kind of "large refactoring" that is now cheap to do with agents.

### 10. Failure Mode #4: "Your Brain Can't Keep Up"

- Feedback loops now work. You ship more code than ever. You are tired.
- Shallow codebases make this worse: you AND the AI must keep all the context in your head.
- Deep modules let you treat modules as **gray boxes**: design the interface, delegate the implementation, don't review the body too closely.
- Don't do this for critical code (finance, auth, security). Do it for most modules where correctness at the interface is sufficient.
- Matt: "This has saved my brain significantly."

### 11. The Writer-PRD (Module-Aware) Skill

- **Fix: the Writer PRD skill.** Generates PRDs that are specific about which modules change and which interfaces get modified.
- Always thinks in terms of the module map.
- PRDs are no longer free-floating requirements documents -- they are architectural diffs.

### 12. Kent Beck: "Invest in the Design of the System Every Day"

- The core of the talk. Specs-to-code = divesting from design (you ship prompts and hope).
- Fundamentals + deep modules + skills = investing in design daily.
- This is the bet: in an era where code is cheap, the durable edge is design discipline applied every day.

---

## The Five Matt Pocock Skills

All published at [github.com/mattpocock/skills](https://github.com/mattpocock/skills) and directly adoptable for our orchestrator.

| Skill | Purpose | Based On | Orchestrator Application |
|-------|---------|----------|--------------------------|
| **Grill Me** | Interview the user 40-100+ times until the design concept is externalized; outputs PRD/issues | Brooks (design concept), Pragmatic Programmer (you don't know what you want) | Front-load before `GET_NEXT_TASK`; forces workers to resolve ambiguity before coding |
| **Ubiquitous Language** | Scan codebase, extract domain terminology, build markdown table of terms | Eric Evans (DDD) | Generate `_bmad/ubiquitous-language.md` per project; inject into worker prompts to reduce verbosity and align with existing code |
| **Improve Codebase Architecture** | Find related code, wrap in deep modules with simple interfaces | Ousterhout (deep modules) | Spawn as a "harness improvement" worker when reviewer agent detects shallow/leaky modules across 3+ PRs |
| **Writer PRD (Module-Aware)** | PRD specific about module changes and interface modifications | Ousterhout + Beck (design investment) | Replace current issue-to-prompt flow with module-aware PRD generation before worker spawn |
| **TDD-Aware** | Force small red/green/refactor cycles; constrain AI to one feedback loop at a time | Pragmatic Programmer (rate of feedback) + Kent Beck | Wrap worker prompts with TDD constraint: "write the failing test first, run it, then implement" |

---

## Key Quotes

> "Code is not cheap. Bad code is the most expensive it has ever been."

> "The rate of feedback is your speed limit."

> "Design the interface. Delegate the implementation."

> "Invest in the design of the system every day." — Kent Beck

> "If you think of AI as a really great on-the-ground programmer, a tactical programmer, you need someone strategic -- that's you."

> "Complexity is anything related to structure that makes it hard to understand and modify." — John Ousterhout

> "In good codebases, AI does really well. In bad codebases, it compounds the mess."

> "Specs-to-code is just vibe coding by another name."

---

## Books Referenced

| Book | Author | Core Concept Used in Talk |
|------|--------|---------------------------|
| *A Philosophy of Software Design* | John Ousterhout | Complexity definition; deep vs shallow modules; interface design |
| *The Pragmatic Programmer* | Andy Hunt, Dave Thomas | Software entropy; "you don't know what you want"; "outrunning your headlights"; rate of feedback |
| *The Design of Design* | Frederick P. Brooks | Design concept as ephemeral idea; externalization of intent |
| *Domain-Driven Design* | Eric Evans | Ubiquitous language; shared vocabulary between devs and domain experts |

Kent Beck is quoted ("invest in the design of the system every day") but no specific book is cited on stage.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Foundational for our orchestrator thesis. We spawn Claude Code workers against target codebases -- the quality of those codebases directly determines worker success. Matt's "good codebase → better AI output" loop is the exact economics our orchestrator depends on. His deep vs shallow module framing applies 1:1 to how we should structure the target projects we orchestrate. The five skills are all directly adoptable as worker skills in our tmux harness. |
| **Novelty** | 9/10 | This is the strongest counter-thesis to the "code is free / specs-to-code" narrative circulating at AIE Europe. Lopopolo and Ubl both argue code is free; Matt argues *bad* code is more expensive than ever. Both can be true simultaneously: the cost of a marginal line is near zero, but the cost of a line in a shallow/leaky module is higher because it blocks AI acceleration. Matt's synthesis (Ousterhout + Brooks + Evans + Beck applied to AI) is novel and directly contradicts the specs-to-code crowd. |
| **Actionable** | 10/10 | Every talking point has a corresponding skill, and all five skills are published on GitHub under a permissive-looking license (mattpocock/skills). We can fork them, adapt them to our orchestrator worker prompts, and ship them into the `_bmad/skills/` directory immediately. |

---

## Adoptable Patterns for Orchestrator Research

### 1. Adopt the "Grill Me" Skill as Pre-Spawn Intake

- **Today:** the orchestrator reads a GitHub issue and spawns a worker directly with the issue body as context.
- **Adopt:** before `SPAWN_WORKER`, run a Grill Me pass on the issue. The orchestrator interviews itself (or the issue author) to externalize the design concept. Output is a module-aware PRD.
- **Orchestrator hook:** add `GRILL_ME` phase between `GET_NEXT_TASK` and `SPAWN_WORKER`. Skip only when the issue is already a well-formed PRD.

### 2. Generate and Persist Ubiquitous Language Per Project

- **Today:** each worker re-derives domain vocabulary from the codebase at spawn time, wasting context.
- **Adopt:** generate `_bmad/ubiquitous-language.md` once per project (or on significant changes). Inject into every worker spawn as a reference.
- **Orchestrator hook:** add a background "lexicon update" worker that re-runs on PR merge if the domain surface area changed.

### 3. Deep-Module Refactor Agent on Shallow-Module Detection

- **Today:** review-fix loop handles one PR at a time; there is no structural refactor pass.
- **Adopt:** when the reviewer agent flags "hard to navigate" or "AI got confused" across 3+ consecutive worker sessions in the same area, spawn an Improve Codebase Architecture agent to wrap that area in deep modules.
- **Orchestrator hook:** pattern-match on reviewer comments in `devlog.md`; trigger architecture agent as harness improvement task.

### 4. Module-Aware PRD as Worker Input Format

- **Today:** worker prompts are GitHub issue bodies.
- **Adopt:** convert issues to Writer-PRD format (module-aware) before spawning. Every PRD lists: target modules, interfaces changing, interfaces preserved, test surface.
- **Orchestrator hook:** replace the raw-issue injection in `.claude/commands/orchestrator.md` with a PRD generator step.

### 5. TDD Constraint in Worker System Prompt

- **Today:** workers may skip to implementation directly.
- **Adopt:** add "write the failing test first, run it, then implement" to the worker system prompt. Enforce via reviewer agent that checks commit order: test commit must precede implementation commit.
- **Orchestrator hook:** extend reviewer agent prompt with TDD check.

### 6. Gray-Box Trust Calibration

- **Today:** orchestrator reviews every worker PR with the same scrutiny regardless of module type.
- **Adopt:** classify modules as "critical" (finance, auth, security) vs "gray-box-eligible" (UI, utils, scaffolding). Gray-box modules get lighter review (interface-level only); critical modules get deep review.
- **Orchestrator hook:** add module classification to `_bmad/module-classification.yaml`; reviewer agent reads it and adjusts depth.

### 7. "Invest in Design Every Day" as Continuous Orchestrator Goal

- **Today:** orchestrator loop is feature-driven; architecture work is ad hoc.
- **Adopt:** add a continuous "design investment" lane that consumes idle orchestrator capacity for deep-module refactors, interface simplification, and ubiquitous language maintenance.
- **Orchestrator hook:** when `GET_NEXT_TASK` returns nothing, default to the design-investment lane instead of idling.

### 8. Anti-Specs-to-Code Position for Our Methodology Documentation

- **Today:** our `CLAUDE.md` is neutral on the specs-to-code question.
- **Adopt:** explicitly position the orchestrator as "design-first, skills-driven, not specs-to-code." Matt's critique gives us the language to articulate why.
- **Orchestrator hook:** add a one-paragraph positioning statement to `CLAUDE.md` citing Matt's framing and linking to this catalogue entry.

---

## Connection to Other Catalogue Entries

- **Contrasts with [Lopopolo Harness Engineering](./aie-europe-2026-ryan-lopopolo-harness-engineering.md):** Lopopolo says "code is free." Matt says "bad code is the most expensive it has ever been." Both are right: marginal code is cheap, but structurally bad code blocks acceleration. Read together for a complete picture.
- **Reinforces [Vincent Kottsch Dark Factories](./aie-europe-2026-vincent-dark-factories.md):** Vincent's "overfit AI unit tests saved the Great Refactor" anecdote is a direct application of Matt's "tests are the interface through which deep modules are verified."
- **Complements [Malte Ubl AI Engineering Successor](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md):** Ubl's "what's the CLI?" product heuristic and Matt's "design the interface, delegate the implementation" are the same pattern applied at different layers (product API vs module API).
- **Validates [Peter Steinberger Swyx AMA](./aie-europe-2026-peter-steinberger-swyx-ama.md):** Peter ranks future engineer skills as "taste → system design → saying NO → big picture thinking." Matt's talk is the how-to guide for building those skills with AI in the loop.
- **Aligns with [Pawel Huryn Orchestration Over Autonomy](../../posts/2026-04/pawelhuryn-orchestration-over-autonomy.md):** both argue the strategic layer (human) matters more when tactical execution (AI) is cheap.

---

## Referenced Tools / Projects

| Tool / Project | Mentioned Context | In Our Catalogue? |
|----------------|-------------------|-------------------|
| [mattpocock/skills](https://github.com/mattpocock/skills) | Matt's public repository of the five skills discussed | **Not yet -- high priority to catalogue** |
| [AI Hero](https://aihero.dev/) | Matt's newsletter and course platform (Claude Code for Real Engineers) | Not yet -- worth tracking as practitioner resource |
| Claude Code plan mode | Criticized as "too eager to create an asset before understanding" | Referenced in multiple entries |
| TDD / red-green-refactor | Core feedback-loop mechanic Matt endorses | Standard practice; no catalogue entry needed |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/mattpocock/skills | All five skills (Grill Me, Ubiquitous Language, Improve Codebase Architecture, Writer PRD, TDD-aware) as adoptable Claude Code skills | Clone, review, adapt to our `_bmad/skills/` directory |
| https://aihero.dev/ | Matt's newsletter and Claude Code for Real Engineers course | Subscribe; track for new skill publications |
| https://web.stanford.edu/~ouster/cgi-bin/book.php | John Ousterhout, *A Philosophy of Software Design* (official book page) | Reference material; cite in orchestrator docs |
| https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/ | *The Pragmatic Programmer* 20th anniversary edition | Reference material |
| https://www.cs.unc.edu/~brooks/DesignofDesign.html | Frederick P. Brooks, *The Design of Design* | Reference material; design-concept chapter is the key one |
| https://www.domainlanguage.com/ddd/ | Eric Evans' DDD reference site | Reference material for ubiquitous language pattern |

---

## Action Items

- [ ] Clone and audit [github.com/mattpocock/skills](https://github.com/mattpocock/skills); adapt the five skills to `_bmad/skills/`.
- [ ] Add `GRILL_ME` phase to orchestrator loop before `SPAWN_WORKER`.
- [ ] Generate initial `_bmad/ubiquitous-language.md` for the orchestrator repo itself as a dogfooding exercise.
- [ ] Add module-aware PRD generator step to `.claude/commands/orchestrator.md`.
- [ ] Add TDD constraint to worker system prompt; extend reviewer agent with test-commit-before-impl check.
- [ ] Classify orchestrator modules as critical vs gray-box-eligible in `_bmad/module-classification.yaml`.
- [ ] Add a one-paragraph "design-first, not specs-to-code" positioning statement to `CLAUDE.md`.
- [ ] Subscribe to the AI Hero newsletter and track Matt's future skill publications.
- [ ] Cross-link this entry from the Lopopolo keynote entry to contrast "code is free" vs "bad code is expensive."
