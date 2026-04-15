# Human-in-the-Loop: Best Practices for AI-Assisted Software Development

**Prepared for: Stakeholder Communication (German Public Sector)**
**Date: 2026-03-30**
**Core Message: "KI ist unser Beschleuniger, nicht unser Entscheider. Jede Zeile Code wird von unserem Team geprüft, getestet und deployed. KI hilft uns, schneller zu arbeiten -- bei gleichbleibenden Qualitätsstandards."**

---

## Table of Contents

1. [The Framing: "Human-Reviewed, AI-Accelerated"](#1-the-framing)
2. [Code Review Processes When Using AI Tools](#2-code-review)
3. [Testing Strategies for AI-Generated Code](#3-testing-strategies)
4. [The Role of the Human Developer](#4-role-of-human)
5. [CI/CD Pipelines That Catch AI Errors](#5-cicd-pipelines)
6. [AI Tools vs. Tools Developers Already Use](#6-ai-vs-existing-tools)
7. [The "AI as Junior Developer" Analogy](#7-junior-developer-analogy)
8. [Quality Metrics: Does AI Code Have More Bugs?](#8-quality-metrics)
9. [Explaining AI to Non-Technical Stakeholders](#9-non-technical-explanation)
10. [AI-Augmented vs. AI-Autonomous Development](#10-augmented-vs-autonomous)
11. [Frameworks for Responsible AI-Assisted Development](#11-frameworks)
12. [German Public Sector & EU AI Act Considerations](#12-german-public-sector)
13. [Key Talking Points (Deutsch)](#13-talking-points-de)

---

## 1. The Framing: "Human-Reviewed, AI-Accelerated" {#1-the-framing}

### The Right Mental Model

The correct way to present AI-assisted development is NOT "AI writes our code." It is:

> **"AI drafts. Engineers decide."**
> Speed does not replace judgment.

This framing is critical because it positions AI exactly where it belongs: as a productivity tool under human control, not as an autonomous agent making decisions.

### Three Levels of Human-AI Interaction (Kief Morris / Martin Fowler)

According to Martin Fowler's ThoughtWorks team, there are three models for human involvement:

| Model | Description | When to Use |
|-------|-------------|-------------|
| **In the Loop** | Developer reviews each AI output directly | Security-critical code, architecture decisions |
| **On the Loop** | Developer designs tests, constraints, and evaluation pipelines that govern AI behavior | Routine implementation, boilerplate |
| **Out of the Loop** | System operates autonomously | NOT recommended for production code |

The industry consensus in 2026 is moving toward "on the loop" -- developers architect the verification systems rather than reviewing every single line, while maintaining full control over what ships to production.

### What This Looks Like in Practice

- AI generates a first draft of code (like a fast typist taking dictation)
- The developer reviews, refines, and approves every change
- Automated tests validate correctness before any merge
- Code review by a second human catches what the first missed
- CI/CD pipelines enforce quality gates before deployment

**Key quote for stakeholders:** "We use AI the same way architects use CAD software -- it accelerates the drawing, but the architect designs the building."

---

## 2. Code Review Processes When Using AI Tools {#2-code-review}

### Enhanced Review Requirements

When AI generates code, review standards should be HIGHER, not lower. Best practices from enterprise teams:

**Pre-Review Automated Checks:**
- Linting (ESLint, Pylint) catches style and pattern violations
- Static analysis (SonarQube, CodeQL) identifies code smells and vulnerabilities
- Type checking (TypeScript strict mode) catches type errors
- Dependency audits flag packages with known CVEs

**Human Review Checklist for AI-Generated Code:**
1. Does the code match the INTENT of the requirement, not just the literal description?
2. Are edge cases handled (null values, empty arrays, boundary conditions)?
3. Is error handling comprehensive (not just happy-path)?
4. Are security considerations addressed (authentication, authorization, input validation)?
5. Is the code maintainable -- would a new developer understand it in 6 months?
6. Does it follow the project's architectural patterns and conventions?
7. Are there unnecessary abstractions or over-engineering?

**AI-Specific Review Focus Areas (from CodeRabbit research):**
- Logic and correctness errors (75% more common in AI code)
- Error handling gaps (nearly 2x more frequent)
- Security vulnerabilities (up to 2.74x higher rates)
- Performance regressions (approximately 8x more excessive I/O operations)
- Naming inconsistencies (nearly 2x more common)

### GitHub's Recommended Workflow

GitHub's official documentation for reviewing AI-generated code recommends:

1. Run automated tests and static analysis FIRST
2. Verify the code compiles and all tests pass
3. Check for new warnings or errors
4. Review with AI-aware checklists (targeting known AI weaknesses)
5. Document AI review practices in team onboarding guides
6. Designate "AI champions" to share tips and workflows

---

## 3. Testing Strategies for AI-Generated Code {#3-testing-strategies}

### The Testing Pyramid for AI-Assisted Development

```
         /\
        /  \        E2E Tests (human-designed scenarios)
       /    \       -- Browser automation, user journeys
      /------\
     /        \     Integration Tests (API contracts, DB queries)
    /          \    -- Verify components work together
   /------------\
  /              \  Unit Tests (AI can help generate these)
 /________________\ -- But humans define WHAT to test
```

### Key Principles

**1. Test-First, Not Test-After**
Define test cases BEFORE asking AI to generate code. This ensures:
- The AI has clear success criteria
- Tests catch regressions immediately
- Business requirements are encoded in tests, not just in code

**2. AI Generates Tests, Humans Validate Test Quality**
AI is excellent at generating test boilerplate but often:
- Tests the happy path only
- Misses boundary conditions
- Creates tests that pass trivially (testing the mock, not the code)
- Overlooks security-relevant test scenarios

**3. Mandatory E2E Testing**
Every feature must pass end-to-end testing before being marked complete. This is non-negotiable because:
- Unit tests can pass while the feature is broken in production
- Integration issues only surface in real browser environments
- User experience can only be validated end-to-end

**4. Coverage Thresholds as Quality Gates**
- Minimum 75% code coverage for new code
- 100% coverage on security-critical paths
- No critical or high-severity vulnerabilities allowed through

### What AI Cannot Test

- Whether the feature solves the user's actual problem
- Whether the UX is intuitive
- Whether the system behaves correctly under real-world load
- Whether data handling complies with DSGVO requirements
- Whether accessibility standards (WCAG) are met

These require human judgment and specialized testing.

---

## 4. The Role of the Human Developer {#4-role-of-human}

### The Developer as Architect, Reviewer, and Decision-Maker

The role of the developer is ELEVATED, not diminished, by AI tools. The shift:

| Before AI | With AI |
|-----------|---------|
| Writing code as primary value | System design and architecture as primary value |
| Syntax knowledge | Code review competency |
| Speed from typing | Speed from decision quality |
| Deep knowledge of one language | Deep understanding of systems, data flow, failure modes |
| Individual contributor | Orchestrator of AI + human capabilities |

### Three Core Responsibilities That Cannot Be Delegated to AI

**1. Architecture & Design**
AI generates structure but not sustainable design. It cannot reason about:
- Long-term maintainability
- Team knowledge and onboarding needs
- Business domain evolution
- System-level failure modes and recovery strategies
- Non-functional requirements (performance, security, accessibility, observability)

**2. Judgment & Risk Assessment**
AI lacks the business context to decide:
- Which trade-offs are acceptable
- What the real requirements are (vs. what was literally specified)
- When to deviate from a pattern for good reasons
- How to handle ambiguity in specifications

**3. Accountability & Quality Assurance**
The human developer is accountable for every line that ships. This means:
- Understanding every change before approving it
- Being able to explain and defend technical decisions
- Taking responsibility for bugs, security issues, and outages
- Ensuring compliance with regulations (DSGVO, EU AI Act, etc.)

### The "Rising Water Effect" (Addy Osmani)

More people can now produce code, but fewer can architect robust systems. AI widens the gap between competent and exceptional engineers. The developers who thrive are those with deep mental models of data flow, state management, and failure cascades -- not those who type the fastest.

---

## 5. CI/CD Pipelines That Catch AI Coding Errors {#5-cicd-pipelines}

### Multi-Layer Quality Gate Architecture

```
Developer writes/reviews code
        |
        v
[Gate 1: Pre-Commit]
  - Linting (ESLint, Prettier)
  - Type checking (tsc --noEmit)
  - Pre-commit hooks (Husky)
        |
        v
[Gate 2: Pull Request]
  - Automated test suite (unit + integration)
  - Static analysis (SonarQube, CodeQL)
  - Security scanning (Semgrep, Trivy)
  - Code coverage check (>= 75%)
  - AI-assisted code review (CodeRabbit, Copilot)
  - MANDATORY human code review
        |
        v
[Gate 3: Staging]
  - E2E tests (Playwright, Cypress)
  - Performance benchmarks
  - Accessibility audit (axe-core)
  - DSGVO compliance check
        |
        v
[Gate 4: Production]
  - Canary deployment (gradual rollout)
  - Runtime monitoring and alerting
  - Automated rollback on error spike
```

### Specific Gates for AI-Generated Code

Based on the CodeRabbit research showing AI code has 1.7x more issues:

1. **Logic Verification Gate**: Automated property-based testing catches logic errors that look syntactically correct
2. **Security Scan Gate**: SAST + DAST scanning with zero tolerance for critical findings
3. **Dependency Audit Gate**: Block PRs introducing packages with known CVEs
4. **Performance Gate**: Benchmark comparison against baseline (catches the 8x I/O regression pattern)
5. **Human Approval Gate**: No merge without explicit human sign-off

### Key Metric: Nothing Ships Without Passing All Gates

The pipeline is the ultimate safety net. Even if a developer approves AI-generated code with a subtle bug, the CI/CD pipeline catches it. This is the same principle used in aviation: multiple independent verification layers.

---

## 6. AI Tools vs. Tools Developers Already Use {#6-ai-vs-existing-tools}

### AI Is Just the Latest Tool in a Long History

Stakeholders who are skeptical of AI should understand that developers have ALWAYS used tools that generate or transform code:

| Tool | What It Does | Does It "Write Code"? | Human Still Needed? |
|------|-------------|----------------------|-------------------|
| **Compiler** | Translates human code to machine code | Yes -- generates millions of instructions | Yes -- for design, debugging, optimization |
| **IDE Auto-Complete** | Suggests variable names, method calls | Yes -- completes partial statements | Yes -- for choosing the right completion |
| **Linter** | Automatically fixes code style | Yes -- reformats and corrects patterns | Yes -- for configuring rules, exceptions |
| **Code Generator** | Generates boilerplate from schemas | Yes -- creates entire files | Yes -- for defining schemas, customizing output |
| **Framework CLI** | Scaffolds project structure | Yes -- creates dozens of files | Yes -- for architecture, business logic |
| **Database ORM** | Generates SQL from code | Yes -- writes all database queries | Yes -- for data modeling, optimization |
| **AI Coding Tool** | Generates code from natural language | Yes -- writes implementation code | Yes -- for design, review, testing, deployment |

**The key insight:** AI coding tools are an evolution, not a revolution. They are more powerful than previous tools, which is precisely why they require more oversight -- but the principle is identical.

**Analogy for stakeholders:**
- A calculator doesn't replace the accountant -- it makes them faster and more accurate
- A spell checker doesn't replace the author -- it catches mechanical errors
- An AI coding tool doesn't replace the developer -- it handles mechanical implementation while the developer focuses on architecture, quality, and correctness

---

## 7. The "AI as Junior Developer" Analogy {#7-junior-developer-analogy}

### The Most Useful Mental Model

The industry consensus (Addy Osmani, Pragmatic Engineer, Stack Overflow) frames AI coding tools as:

> **"A junior developer who has memorized every StackOverflow post and API doc -- fast and eager, but worryingly overconfident, especially when making massive mistakes."**

### Why This Analogy Works

| Junior Developer | AI Coding Tool |
|-----------------|----------------|
| Writes code quickly | Generates code very quickly |
| Needs constant supervision | Needs review of every output |
| Confident even when wrong | Confidently generates incorrect code |
| Good at following patterns | Excellent at pattern matching |
| Misses edge cases | Systematically misses edge cases |
| Doesn't understand the business | Has no business context |
| Learns from feedback | Improves with better prompts |
| Can't make architecture decisions | Cannot reason about system design |
| Needs a senior to review their PRs | Every PR must be human-reviewed |

### What This Means for Stakeholders

Just as no responsible company would let a junior developer deploy to production without senior review, no responsible team lets AI-generated code ship without human verification. The process is identical:

1. Junior/AI generates code
2. Senior developer reviews it
3. Automated tests validate it
4. Another team member approves the PR
5. CI/CD pipeline enforces quality gates
6. Only then does it reach production

**For skeptical stakeholders:** "Would you be concerned if we hired a very fast junior developer? No -- because you trust our review process. AI is exactly that: a fast junior developer under expert supervision."

---

## 8. Quality Metrics: Does AI Code Have More Bugs? {#8-quality-metrics}

### The Research Data (2025-2026)

#### CodeRabbit Study (2025): 470 Repositories, 320 AI PRs vs. 150 Human PRs

| Metric | AI-Generated | Human-Written | Ratio |
|--------|-------------|---------------|-------|
| Issues per PR | 10.83 | 6.45 | 1.7x more |
| Logic & correctness errors | +75% | baseline | 1.75x |
| Security vulnerabilities | +57% to +174% | baseline | 1.57-2.74x |
| Performance issues | +42% to +700% | baseline | 1.42-8x |
| Error handling gaps | ~2x | baseline | ~2x |
| Readability issues | +200% | baseline | 3x |
| Critical/major severity | +40-70% | baseline | 1.4-1.7x |

#### DORA Report 2025 (Google): Industry-Wide Survey

- 90% of developers now use AI assistance
- AI adoption positively correlates with delivery throughput
- AI adoption NEGATIVELY correlates with delivery stability
- AI amplifies existing conditions: good teams get better, fragile teams get worse
- Organizations with mature DevOps practices successfully convert AI productivity gains into measurable improvements

#### Anthropic 2026 Agentic Coding Trends Report

- Developers integrate AI into 60% of their work
- Maintain active oversight on 80-100% of delegated tasks
- Agents complete ~20 autonomous actions before requiring human input
- Enterprise teams use AI primarily for verifiable, low-stakes tasks

### What This Means

**The honest answer:** Yes, AI-generated code has more bugs per PR than human-written code -- roughly 1.7x more. But this is a misleading statistic without context:

1. **AI also dramatically increases output volume** -- more code produced means more bugs in absolute terms, but often fewer bugs per feature delivered
2. **The bugs are predictable and catchable** -- logic errors, missing error handling, security patterns -- exactly what code review and testing catch
3. **With proper review processes, the final shipped code quality is comparable** -- because the bugs are caught before deployment
4. **The net effect is positive** -- faster delivery with similar final quality, because the review + testing pipeline catches the AI's mistakes

**For stakeholders:** "AI generates more raw bugs, which is exactly why we have a rigorous review pipeline. The code that reaches production has been through the same quality gauntlet as any code -- the AI just got us to the review stage faster."

---

## 9. Explaining AI to Non-Technical Stakeholders {#9-non-technical-explanation}

### What AI Does NOT Do

- It does NOT "write autonomous code" that bypasses human review
- It does NOT make architectural decisions
- It does NOT deploy to production on its own
- It does NOT have access to production systems or user data
- It does NOT replace the development team
- It does NOT understand business requirements -- it only follows instructions

### What AI Actually Does

Think of AI as a very fast research assistant and first-draft writer:

1. **The developer describes what they need** (in natural language or by providing examples)
2. **AI generates a first draft** (like a research assistant writing a first version of a report)
3. **The developer reviews, corrects, and refines** (like an editor reviewing the assistant's draft)
4. **Automated tests verify correctness** (like a fact-checker reviewing the final version)
5. **A second developer approves** (like a peer review in academic publishing)
6. **Only then does the code enter the product**

### Analogies That Resonate with Non-Technical Stakeholders

**For executives:** "AI is like having a 10x typing speed. We can write more proposals, but every proposal still needs your review and approval."

**For legal/compliance:** "AI is a tool, like a word processor. The developer is the author. The developer is legally and professionally responsible for every line of code."

**For procurement:** "You're not buying an AI system. You're buying software developed by human engineers who use modern tools -- including AI -- to work more efficiently."

**For privacy officers (Datenschutzbeauftragte):** "The AI tool processes code patterns, not personal data. No Benutzerdaten, no Kundendaten, no personenbezogene Daten flow through the AI. The code itself is reviewed for DSGVO compliance by our team."

---

## 10. AI-Augmented vs. AI-Autonomous Development {#10-augmented-vs-autonomous}

### The Critical Distinction

| Aspect | AI-Augmented (What We Do) | AI-Autonomous (What We Don't Do) |
|--------|--------------------------|----------------------------------|
| Who decides? | Human developer | AI system |
| Who reviews? | Human + automated tests | Automated only |
| Who deploys? | Human via CI/CD | AI directly |
| Who is accountable? | Named developer | Unclear |
| Architecture | Human-designed | AI-generated |
| Requirements | Human-interpreted | AI-interpreted |
| Risk assessment | Human judgment | Algorithmic |
| DSGVO compliance | Human-verified | Unverifiable |

### Why AI-Augmented Is the Only Responsible Approach

1. **Accountability**: Under German law and EU regulations, someone must be accountable for software quality. With AI-augmented development, that person is the developer. With autonomous development, accountability is unclear.

2. **Compliance**: The EU AI Act requires human oversight for high-risk AI systems. While coding tools themselves are not high-risk, the SOFTWARE THEY PRODUCE may be -- especially in public sector applications handling citizen data.

3. **Quality**: The DORA report shows that AI amplifies existing conditions. Without human oversight, AI accelerates technical debt creation, increases code review complexity, and introduces instability.

4. **Trust**: Stakeholders can audit the process. Every change has a human author, a human reviewer, a test suite, and a deployment log.

### The Spectrum

```
Fully Manual -------- AI-Augmented -------- AI-Autonomous
                          ^
                     [We are here]

Human writes         Human designs,        AI writes and
all code             AI drafts,            deploys with
                     Human reviews         minimal oversight
                     and deploys
```

---

## 11. Frameworks for Responsible AI-Assisted Development {#11-frameworks}

### Anthropic's Framework for Safe and Trustworthy Agents (2025)

Anthropic (the company behind Claude) published five principles:

1. **Human Control with Agent Autonomy**: Agents need independence to be valuable, but humans must "retain control over how their goals are pursued, particularly before high-stakes decisions"
2. **Transparency in Agent Behavior**: Systems must provide visibility into decision-making processes
3. **Value Alignment**: Agents must act according to human intentions, not literal interpretations
4. **Privacy Protection**: Information must not transfer inappropriately between contexts; granular access controls required
5. **Security**: Defenses against prompt injection and tool vulnerabilities

**Practical implementation in Claude Code:**
- Read-only permissions by default
- Human approval required before file modifications
- Real-time visibility via to-do checklist that users can monitor and interrupt
- Flexible permissions based on task sensitivity

### LLVM Project's Human-in-the-Loop Policy (2025)

The LLVM compiler project (one of the most important open-source projects in computing) adopted a formal policy:

- Contributors may use AI tools to help craft contributions
- **A human MUST review all AI-generated code before submitting it for review**
- Contributors must be able to answer questions about their work during review
- AI-generated content must be transparently labeled
- Autonomous agents that take action without human approval are banned
- Using AI to fix "good first issues" (reserved for human learning) is forbidden

**Why this matters for stakeholders:** If the LLVM project -- used by Apple, Google, and most tech companies -- requires human review of AI code, this is the industry standard, not an extra precaution.

### Google's AI Principles Applied to Development (DORA 2025)

Google's DORA research identifies seven capabilities that make AI adoption successful:

1. **Platform Engineering**: Standardized development platforms reduce AI-introduced variance
2. **User-Centric Development**: Focus on outcomes, not output volume
3. **Value Stream Management**: Ensure productivity gains translate to business value
4. **Continuous Testing**: Automated verification at every stage
5. **Security Integration**: Security scanning built into the pipeline, not bolted on
6. **Documentation**: AI-generated code needs MORE documentation, not less
7. **Feedback Loops**: Continuous improvement based on defect data

### IBM's AI-Augmented Development Pattern

IBM's enterprise architecture recommends:

- AI for code generation within human-defined specifications
- Automated validation against specification schemas
- Human review for all business logic and security-critical paths
- Continuous monitoring of AI-generated code quality metrics

---

## 12. German Public Sector & EU AI Act Considerations {#12-german-public-sector}

### EU AI Act Timeline (Critical Dates)

| Date | What Happens |
|------|-------------|
| Feb 2, 2025 | Prohibited AI practices + AI literacy obligations in effect |
| Aug 2, 2025 | GPAI model rules in effect |
| **Aug 2, 2026** | **High-risk AI system rules + transparency rules in effect** |
| Aug 2, 2027 | Full enforcement for all AI systems |

### What the EU AI Act Requires for AI in Public Sector

**For public bodies deploying AI systems:**
- Fundamental Rights Impact Assessments (FRIA) required
- Transparency about AI usage in public services
- Human oversight mechanisms must be in place
- Documentation of AI system decisions

**For software developed WITH AI tools (our case):**
- The AI coding tool itself is NOT the product -- the software is
- The software must comply with all existing regulations (DSGVO, accessibility, etc.)
- If the software is a high-risk AI system, additional obligations apply
- Using AI tools in development is a process decision, not a product classification

### German Data Protection Authority (DSK) Guidance (June 2025)

The German DPAs issued guidance on AI systems structured around four phases:
1. **Design** -- Data minimization, privacy by design
2. **Development** -- Confidentiality, integrity, transparency
3. **Implementation** -- Intervenability, human oversight
4. **Operation** -- Availability, continuous monitoring

Seven data protection goals must be addressed:
- Datenminimierung (Data minimization)
- Verfügbarkeit (Availability)
- Vertraulichkeit (Confidentiality)
- Integrität (Integrity)
- Intervenierbarkeit (Intervenability / Human override capability)
- Transparenz (Transparency)
- Nichtverkettbarkeit (Unlinkability)

### DSGVO Compliance in AI-Assisted Development

**Key message for Datenschutzbeauftragte:**

- Code is NOT personal data -- no DSGVO issue with AI processing code
- The RESULTING software must be DSGVO-compliant -- this is verified by human developers
- AI tools do not have access to production databases or user data
- All data handling logic is human-reviewed and tested
- DSGVO compliance is a quality gate in our CI/CD pipeline

### German Coalition Agreement 2025

The new German government explicitly supports AI adoption:
- Goal: Make Germany an "AI nation"
- EUR 5 billion committed to AI development
- Active support for AI in public sector modernization
- Digital-first strategy for government services

**For stakeholders:** "Using AI tools in development is aligned with the federal government's digital strategy. Not using modern tools would put us at a competitive disadvantage."

---

## 13. Key Talking Points (Deutsch) {#13-talking-points-de}

### Kernbotschaft

> "KI ist unser Beschleuniger, nicht unser Entscheider. Jede Zeile Code wird von unserem Team geprüft, getestet und deployed. KI hilft uns, schneller zu arbeiten -- bei gleichbleibenden Qualitätsstandards."

### Für Entscheider / Auftraggeber

- "Wir nutzen KI wie ein Architekt CAD-Software nutzt: Das Tool beschleunigt die Zeichnung, aber der Architekt entwirft das Gebäude."
- "Unser Entwicklungsprozess hat mehr Qualitätsprüfungen als die meisten Teams OHNE KI."
- "90% der Entwickler weltweit nutzen bereits KI-Tools (DORA Report 2025, Google). Wir folgen dem Industriestandard."
- "Die Bundesregierung investiert 5 Milliarden Euro in KI-Entwicklung. Moderne Tools einzusetzen ist kein Risiko -- sie NICHT einzusetzen wäre ein Wettbewerbsnachteil."

### Für Datenschutzbeauftragte

- "Die KI verarbeitet Code-Muster, keine personenbezogenen Daten."
- "Kein Zugriff auf Produktionsdatenbanken oder Nutzerdaten."
- "DSGVO-Konformität wird von unseren Entwicklern geprüft und ist ein Pflicht-Gate in unserer CI/CD-Pipeline."
- "Die DSK-Leitlinien von Juni 2025 werden vollständig beachtet."

### Für technische Prüfer / IT-Sicherheit

- "Jeder Pull Request durchläuft: Linting, statische Analyse, Security-Scanning (SAST), automatisierte Tests, menschliches Code Review, und E2E-Tests."
- "KI-generierter Code hat nachweislich 1.7x mehr Fehler als menschlicher Code (CodeRabbit-Studie). Deshalb haben wir STRENGERE Review-Prozesse, nicht schwächere."
- "Das LLVM-Projekt (genutzt von Apple, Google, etc.) hat dieselbe Policy: KI-Code ist nur mit menschlicher Prüfung erlaubt."

### Für Vergabe / Beschaffung

- "Sie beschaffen keine KI-Lösung. Sie beschaffen Software, entwickelt von menschlichen Ingenieuren, die moderne Tools nutzen."
- "Der EU AI Act klassifiziert Coding-Tools nicht als Hochrisiko-KI. Die entwickelte Software muss natürlich alle bestehenden Anforderungen erfüllen -- das stellen wir durch unseren QA-Prozess sicher."
- "Die Model Contractual Clauses for AI Procurement (MCC-AI) der EU sind uns bekannt und werden beachtet."

### Bei direkter Konfrontation: "Aber die KI schreibt doch den Code!"

Antwort:
> "Nein. Die KI erstellt einen Entwurf, genau wie ein Taschenrechner eine Berechnung durchführt. Der Buchhalter ist trotzdem verantwortlich für die Bilanz. Unser Entwickler ist verantwortlich für jeden Code, der in Produktion geht. Der Unterschied: Mit KI-Unterstützung können wir in derselben Zeit mehr Features liefern -- bei gleicher oder besserer Qualität, weil wir die gewonnene Zeit in zusätzliche Tests und Reviews investieren."

---

## Sources

### Research & Data
- [CodeRabbit: State of AI vs Human Code Generation Report](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- [DORA: State of AI-Assisted Software Development 2025](https://dora.dev/research/2025/dora-report/)
- [DORA Report 2025 -- InfoQ Summary](https://www.infoq.com/news/2026/03/ai-dora-report/)
- [Anthropic: 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Arxiv: Human-In-the-Loop Software Development Agents](https://arxiv.org/abs/2411.12924)
- [Arxiv: Human-Written vs. AI-Generated Code: A Large-Scale Study](https://arxiv.org/pdf/2508.21634)

### Frameworks & Policies
- [Anthropic: Framework for Safe and Trustworthy Agents](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents)
- [Anthropic: Responsible Scaling Policy v3](https://www.anthropic.com/news/responsible-scaling-policy-v3)
- [LLVM: AI Tool Use Policy (Human-in-the-Loop)](https://llvm.org/docs/AIToolPolicy.html)
- [Google: Responsible AI Principles](https://publicpolicy.google/responsible-ai/)

### Best Practices & Analysis
- [DEV.to: AI-Assisted Development in 2026 -- Best Practices](https://dev.to/austinwdigital/ai-assisted-development-in-2026-best-practices-real-risks-and-the-new-bar-for-engineers-3fom)
- [InfoQ: Where Do Humans Fit in AI-Assisted Development? (Fowler/Morris)](https://www.infoq.com/news/2026/03/mf-aiassisted-dev/)
- [Addy Osmani: The 70% Problem -- Hard Truths About AI-Assisted Coding](https://addyo.substack.com/p/the-70-problem-hard-truths-about)
- [Intelligenic: Human-in-the-Loop Best Practice for AI-Enhanced Development](https://intelligenic.ai/human-in-the-loop-the-new-best-practice-for-ai-enhanced-development/)
- [Stack Overflow: Are Bugs Inevitable with AI Coding Agents?](https://stackoverflow.blog/2026/01/28/are-bugs-and-incidents-inevitable-with-ai-coding-agents/)
- [Towards Data Science: Vibe Coding -- Best Practices for Human-AI Collaboration](https://towardsdatascience.com/vibe-coding-with-ai-best-practices-for-human-ai-collaboration-in-software-development/)

### German Public Sector & EU Regulation
- [EU AI Act: Regulatory Framework](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [SIG: Comprehensive EU AI Act Summary (January 2026)](https://www.softwareimprovementgroup.com/blog/eu-ai-act-summary/)
- [EU Model Contractual Clauses for AI Procurement](https://cdp.cooley.com/model-contractual-clauses-for-ai-procurement-in-the-eu-key-takeaways-for-ai-companies/)
- [German DPAs: AI Systems -- Technical and Organizational Measures](https://www.hoganlovells.com/en/publications/ai-systems-german-dpas-issue-guidance-on-technical-and-organizational-measures)
- [German Coalition Agreement 2025: Digital Policy](https://www.gtlaw.com/en/insights/2025/4/digital-policy-highlights-of-the-german-coalition-agreement-2025)
- [Germany AI Strategy -- European Commission AI Watch](https://ai-watch.ec.europa.eu/countries/germany/germany-ai-strategy-report_en)

### CI/CD & Code Review
- [GitHub Docs: Review AI-Generated Code](https://docs.github.com/en/copilot/tutorials/review-ai-generated-code)
- [GitHub Docs: Best Practices for Using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices)
- [SonarSource: Integrating Quality Gates into CI/CD Pipeline](https://www.sonarsource.com/resources/library/integrating-quality-gates-ci-cd-pipeline/)

### Industry Context
- [Phoronix: LLVM Adopts Human-in-the-Loop Policy](https://www.phoronix.com/news/LLVM-Human-In-The-Loop)
- [IBM: AI-Augmented Software Development Pattern](https://www.ibm.com/think/architectures/patterns/genai-augmented-software-development)
- [CodeRabbit: 2025 Was Speed, 2026 Will Be Quality](https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality)
