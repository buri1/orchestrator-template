# Browser Automation, Security, Testing, and DevOps Tools for Agent Orchestration

**Date:** 2026-03-05
**Focus:** Evaluating tools from the agentic ecosystem that could integrate into an L-Thread Orchestrator's quality pipeline -- browser automation, security testing, property-based testing, sandbox execution, code review, CI/CD agents, and observability.

---

## 1. Browser Automation for Agents

### 1.1 Bowser (github.com/disler/bowser)

**Creator:** IndyDevDan (disler) -- one of the most prolific builders in the agentic engineering space, who has bet his career on agentic software and created numerous complementary tools (indydevtools, agent-sandbox-skill, claude-code-hooks-multi-agent-observability, big-3-super-agent).

**What it is:** An agentic browser automation and UI testing system built on a four-layer composable architecture. Last updated February 22, 2026.

**The Four-Layer Architecture:**

1. **Skills Layer** -- Raw browser capabilities. Bowser ships two skills: `playwright-bowser` (isolated headless automation via Playwright CLI) and `claude-bowser` (drives your actual Chrome with real cookies and login sessions). The Playwright skill wraps `playwright-cli`, which navigates via accessibility tree snapshots instead of vision, keeping context usage low.

2. **Subagent Layer** -- Scales capabilities into parallel, isolated workers. Each subagent gets its own browser instance and can operate independently.

3. **Commands Layer** -- Orchestrates subagents into repeatable workflows. This is where multi-step testing sequences are defined.

4. **Justfile Layer** -- Makes everything callable with a single terminal command by you, your team, or other agents.

**Critical Design Decision:** Bowser deliberately uses CLIs rather than MCP servers for browser control. The rationale: token efficiency, flexibility, transparency, and composability. Each layer is independently testable and they compose upward -- you can enter at any layer.

**Relevance to Orchestrator:** Bowser's layered architecture directly mirrors orchestrator patterns. The subagent layer enabling parallel isolated browser workers maps cleanly to how an L-Thread Orchestrator spawns agents. The Justfile layer provides a clean interface for orchestrator-to-tool communication. The `claude-bowser` skill (using real Chrome sessions) is particularly interesting for authenticated E2E testing scenarios that headless browsers struggle with. Bowser could replace or complement the Chrome DevTools MCP currently used for E2E quality gates.

**Integration Priority: HIGH** -- The architecture is philosophically aligned with orchestrator patterns, and the CLI-over-MCP approach would reduce token consumption in browser testing workflows.

---

### 1.2 Vercel Agent-Browser (github.com/vercel-labs/agent-browser)

**What it is:** A browser automation CLI from Vercel Labs, purpose-built for AI agents. Open-source, available on npm as `agent-browser`.

**Three-Tier Architecture:**

- **Rust CLI** -- Sub-millisecond command parsing and daemon communication. Critical for AI agents executing hundreds of commands per automation task.
- **Node.js Daemon** -- Persistent Playwright browser lifecycle management. Eliminates browser launch overhead (typically 2-5 seconds) on subsequent commands.
- **Fallback** -- Pure Node.js execution when native Rust binaries are unavailable.

**The "Snapshot + Refs" System:** This is the core innovation. Instead of sending complete accessibility trees with thousands of nodes (consuming 15,000+ tokens), agent-browser returns streamlined element references (`@e1`, `@e2`, `@e3`). This achieves a **93% reduction in context usage** compared to traditional Playwright MCP solutions. Refs are resolved via ARIA roles and accessible names rather than CSS selectors, making them stable across DOM changes.

The snapshot command supports: full accessibility tree, interactive-elements-only (`-i`), compact mode (`-c`), depth limiting (`-d`), and CSS selector scoping (`-s`).

**50+ commands** covering navigation, forms, screenshots, network, and storage. All output is compact text rather than JSON -- designed for AI token efficiency.

**Relevance to Orchestrator:** The 93% context reduction is transformative for orchestrators running multiple browser-testing agents simultaneously. In long autonomous sessions where context budget matters, agent-browser's ref-based approach uses significantly fewer tokens per cycle. The persistent daemon architecture means browser sessions survive across individual agent commands, enabling stateful multi-step testing without re-launching browsers.

**Integration Priority: HIGH** -- The context efficiency alone justifies integration. For orchestrators managing multiple parallel agents doing E2E testing, this could be the difference between running 3 agents and running 10 within the same token budget.

---

### 1.3 Hyperbrowser (hyperbrowser.ai)

**What it is:** Cloud browser-as-a-service platform for AI agents, with built-in MCP server support. Achieves 90% task completion rates in browser automation benchmarks.

**Key Capabilities:**

- Sub-second browser instance startup, thousands of concurrent sessions without degradation
- Built-in CAPTCHA solving, proxy rotation, and fingerprint management
- MCP server with tools for scraping, structured data extraction, crawling, and Bing search
- HyperAgent: natural-language browser automation engine
- First-class integration with OpenAI CUA, Anthropic Claude Computer Use, and Browser Use

**Cloud vs Local:** Unlike Bowser and agent-browser (which run locally), Hyperbrowser runs in the cloud. Each browser instance is isolated. This means agents don't consume local compute for browser sessions and can scale horizontally without hardware constraints.

**Relevance to Orchestrator:** Hyperbrowser solves the scaling problem. When an orchestrator needs to run 20 parallel E2E test agents, local browser instances become a bottleneck. Cloud browsers eliminate this. However, the cloud dependency adds latency and cost. The MCP interface is straightforward but less token-efficient than agent-browser's ref system.

**Integration Priority: MEDIUM** -- Best as a scaling layer when local browser capacity is exceeded, or when CAPTCHA/proxy requirements arise. Not the primary browser tool but a valuable escape hatch.

---

### 1.4 Browser Automation Recommendation

For an orchestrator quality pipeline, the recommended stack is:

- **Primary:** Vercel agent-browser for most E2E testing (context efficiency, speed)
- **Authenticated testing:** Bowser's `claude-bowser` skill when real browser sessions are needed
- **Scale-out:** Hyperbrowser when parallel testing exceeds local capacity
- **Current:** Chrome DevTools MCP remains valid but should be considered for replacement given the token overhead

---

## 2. Security Testing

### 2.1 Shannon (github.com/KeygraphHQ/shannon)

**What it is:** A fully autonomous AI pentester for web apps and APIs. Shannon Lite achieved **96.15% (100/104 exploits)** on a hint-free, source-aware variant of the XBOW security benchmark.

**Architecture:** Shannon leverages Anthropic's Claude Agent SDK as its core reasoning engine with a multi-agent architecture combining white-box source code analysis with black-box dynamic exploitation, managed by an orchestrator through four distinct phases:

1. Static analysis of the codebase (SAST, SCA, secrets scanning)
2. Dynamic exploitation testing
3. Authentication handling (including 2FA/TOTP, "Sign in with Google")
4. Report generation with zero intervention

**Shannon Pro** extends this into a full application security platform replacing separate SAST, SCA, secrets scanning, and pentesting tools. It operates as a two-stage pipeline: agentic static analysis followed by autonomous penetration testing.

**Built on the same SDK:** Shannon uses the Claude Agent SDK -- the same foundation available to L-Thread orchestrators. This means architectural patterns and integration approaches are directly transferable.

**Relevance to Orchestrator:** Shannon could serve as a dedicated security quality gate in the orchestrator pipeline. After agents write code and E2E tests pass, Shannon runs autonomous pentesting against the deployed application. Its multi-agent architecture means it can be orchestrated as a single "security agent" that internally manages its own sub-agents. The 96.15% exploit detection rate makes it credible as an automated security gate.

**Integration Pattern:** Spawn Shannon as a post-deployment quality gate. It accepts a target URL and codebase path, runs autonomously, and produces structured findings. An orchestrator agent evaluates the findings and decides whether to block the deployment or assign fix agents.

**Integration Priority: HIGH** -- Security testing is an underserved area in most orchestrator pipelines. Shannon's autonomous nature and Claude Agent SDK foundation make it a natural fit. This directly strengthens the E2E testing gate (INC-014/015 rules).

---

## 3. Testing Frameworks

### 3.1 fast-check (github.com/dubzzz/fast-check)

**What it is:** A property-based testing framework for JavaScript/TypeScript (equivalent to Haskell's QuickCheck). Current version 4.5.3, used by 145+ projects in the npm registry. Has found real bugs in js-yaml, query-string, and left-pad.

**How Property-Based Testing Works:** Instead of writing specific input/output test cases, you define *properties* (invariants) that must always hold true, and the framework generates random inputs to try to violate them. When a violation is found, fast-check performs *shrinking* -- reducing the failing input to the minimal reproducing case.

**Why This Matters for Agent-Generated Code:**

Research from 2025-2026 demonstrates that property-based testing breaks the "cycle of self-deception" in AI code generation. When an agent writes both code and its unit tests, the tests may share the same flawed assumptions as the code. Property-based testing sidesteps this because:

- Properties describe fundamental invariants (e.g., "sorting a list twice yields the same result as sorting once")
- The framework generates adversarial inputs the agent never considered
- Shrinking produces minimal counterexamples that pinpoint the exact failure

A research paper (arxiv 2506.18315) describes the **Property-Generated Solver (PGS)** framework using two agents -- a Generator and a Tester -- that decouple code generation from validation. The Tester validates using properties while the Generator refines based on feedback.

**Agentic Property-Based Testing Pipeline** (from arxiv 2510.09907): Six stages -- code ingestion and AST construction; static/documentation analysis; property inference to synthesize candidate invariants; translation into executable tests; reflection on results and counterexample analysis; emission of structured bug reports.

**Relevance to Orchestrator:** An orchestrator could add a "property testing agent" to its quality pipeline. After a coding agent writes a feature, a second agent uses fast-check to define properties and run them against the output. This catches classes of bugs that traditional unit tests miss -- especially edge cases in data transformations, API contracts, and state management.

**Integration Priority: MEDIUM** -- Valuable for catching edge cases in agent-generated code, but requires a dedicated agent with property-testing expertise. Most impactful for data-heavy features and API contract validation.

---

## 4. Observability and Analytics

### 4.1 PostHog (posthog.com)

**What it is:** An all-in-one developer platform offering product analytics, web analytics, session replay, error tracking, feature flags, experimentation, surveys, data warehouse, CDP, and an AI product assistant. Open-source core.

**LLM/Agent Observability:** PostHog has built dedicated LLM Analytics for monitoring AI products -- tracking model performance, cost, errors, and conversation quality across every interaction. This goes beyond generic APM by providing AI-specific insights like token usage trends, model comparison, and output quality metrics.

**Feature Flags for Agent Behavior:** PostHog's feature flag system enables launching features to specific user segments and measuring impact. For an orchestrator, this translates to: rolling out new agent behaviors to a subset of workflows, A/B testing different agent strategies, and gradually ramping up autonomous capabilities with kill switches.

**PostHog AI:** An AI assistant deeply connected to product data that can query usage patterns, create dashboards, and manage feature flags via natural language.

**Relevance to Orchestrator:** PostHog could serve as the orchestrator's observability backbone:
- Track agent success rates, failure modes, and cost per task
- Feature flags to control which agents are active, which strategies are used
- Session replay to debug agent-user interaction flows in web UIs
- Experiment framework to A/B test orchestration strategies

Notable: Mendral (the CI agent, see below) lists PostHog as a paying customer, suggesting PostHog itself uses agentic tools in their pipeline.

**Integration Priority: MEDIUM-HIGH** -- Strong fit for orchestrator observability, especially the feature flag system for controlling agent behavior. The LLM analytics provide agent-specific monitoring that generic tools lack.

---

### 4.2 Sentry (sentry.io)

**What it is:** Application monitoring and error tracking platform. Has launched dedicated **AI Agent Monitoring** capabilities.

**Agent Monitoring Features:**

- Complete interactive traces of every agent run: system prompts, user input, model generation, tool usage, and final output
- Full execution breakdowns showing what happened at each step
- Real-time alerts for LLM app errors, latency spikes, and budget overruns
- Integration with OpenAI, Vercel AI SDK, and OpenTelemetry-based setups

**Seer:** Sentry's AI-powered debugging agent that analyzes error data to surface root causes with 94.5% accuracy.

**Relevance to Orchestrator:** Sentry's agent monitoring provides production-grade error tracking specifically designed for AI agent workflows. An orchestrator could instrument each spawned agent with Sentry, getting automatic trace collection across the entire pipeline. When an agent fails, Sentry's trace shows exactly which tool call, which model interaction, and which step caused the failure.

The OpenTelemetry integration is key -- it means Sentry can monitor agents regardless of which LLM provider or SDK they use.

**Integration Priority: MEDIUM** -- Valuable for production deployments where agent failures need rapid diagnosis. Less critical during development when orchestrator logs suffice, but essential as the system scales.

---

## 5. Sandbox Runners

### 5.1 The Sandbox Landscape: E2B vs Daytona vs Modal

**E2B (e2b.dev):**
- Open-source, purpose-built for AI agents and LLM workflows
- Uses Firecracker microVMs (same tech as AWS Lambda) -- dedicated kernel per session, hardware-level isolation
- Startup: ~90-150ms, no cold starts
- Pricing: Free Hobby tier with $100 usage credit, Pro at $150/month
- Active open-source community, proven in production
- **Recommendation from multiple sources as the default choice for AI agent sandboxes**

**Daytona:**
- Development environment platform for developers and AI agents
- Uses Docker containers (faster startup, shared kernel) with optional enhanced isolation via Kata Containers/Sysbox
- Persistent environments -- code, dependencies, and files survive across sessions
- Startup: sub-90ms
- Pricing: Usage-based, $200 free compute, ~$0.067/hour for small sandboxes
- Better for persistent workspaces where state needs to survive

**Modal:**
- AI infrastructure platform for data/ML workloads
- Containerized execution scaling from zero to thousands of parallel instances
- Per-second billing, $30/month free compute on Starter plan
- Optimized for compute-heavy tasks (ML inference, data processing)
- Less focused on interactive agent use cases

**Blaxel:**
- Newest entrant, 25ms cold starts (fastest in class)
- Used by Mendral for their AI DevOps agent
- Perpetual sandboxes with Firecracker-forked micro-VMs

**Relevance to Orchestrator:** Sandbox runners solve the isolation problem for agent-generated code execution. When a coding agent produces code, running it in a sandbox prevents accidental damage to the host system. For an orchestrator managing multiple agents:

- **E2B** is the best default -- purpose-built for the use case, strong isolation, reasonable cost
- **Daytona** is better when agents need persistent environments (e.g., a long-running development session)
- **Modal** is overkill for code execution but useful if agents need GPU compute
- **Blaxel** is worth watching for its speed advantage

IndyDevDan (Bowser's creator) has also built `agent-sandbox-skill`, a dedicated skill for managing E2B sandbox environments from within agents.

**Integration Priority: MEDIUM-HIGH** -- Essential for safe execution of agent-generated code. E2B is the recommended starting point.

---

## 6. Code Review and Merge Tools

### 6.1 Graphite (graphite.dev)

**What it is:** A developer workflow platform built around stacked PRs, with a stack-aware merge queue. Raised a $52 million Series B.

**The Stacked PR Pattern:** Instead of one massive PR per feature, work is broken into a chain of small, dependent PRs (a "stack"). Each PR in the stack builds on the previous one. Graphite manages the rebasing automatically -- when an earlier PR merges, subsequent stacked changes are rebased automatically, eliminating merge conflicts from GitHub's lack of native stack support.

**Stack-Aware Merge Queue:** Automates rebasing, re-running CI, and merging PRs or entire stacks with a single action. For stacked PRs, the merge queue validates entire stacks concurrently.

**Relevance to Orchestrator (Multi-Agent Merge Conflict Problem):** When multiple agents work on different parts of a codebase simultaneously, merge conflicts are inevitable. Graphite's stacked PR pattern provides a natural solution:

- Each agent creates a stack of small PRs rather than one large PR
- Graphite automatically rebases when conflicts arise
- The merge queue validates everything before merging to main
- The orchestrator assigns each agent a feature branch and uses Graphite to manage the merge sequence

This directly addresses the "merging wall" problem where parallel agent work creates integration nightmares.

**Integration Priority: HIGH** -- The stacked PR pattern is arguably the most important missing piece for multi-agent development workflows. Without automated merge management, parallel agents inevitably create conflict resolution overhead that negates their productivity gains.

---

### 6.2 CodeRabbit (coderabbit.ai)

**What it is:** The most widely installed AI code review app on GitHub and GitLab. Over 2 million repositories connected, 13 million+ PRs processed. Raised $60M at a $550M valuation.

**Capabilities:**
- Automated review of PRs using codegraph and custom guidelines
- 40+ integrated linters and security scanners
- Auto-generated summaries and walkthroughs for human reviewers
- 46% accuracy in detecting real-world runtime bugs (multi-layered: AST evaluation + SAST + generative AI)
- During peak: 10 requests/second served by 200+ Cloud Run instances

**CodeRabbit Skills:** A recent feature that lets AI coding agents initiate CodeRabbit-powered reviews from local environments, CLI, or IDE. Agents can review code, check for security issues, and return structured findings automatically.

**Relevance to Orchestrator:** CodeRabbit can serve as an automated review agent in the orchestrator pipeline. After a coding agent creates a PR, CodeRabbit automatically reviews it. The orchestrator reads CodeRabbit's findings and decides whether to:
- Auto-merge (no issues found)
- Spawn a fix agent (issues identified)
- Escalate to human review (critical issues or low confidence)

The CodeRabbit Skills feature is particularly relevant -- it enables programmatic review initiation rather than waiting for GitHub webhook-triggered reviews.

**Integration Priority: HIGH** -- Automated code review is a natural quality gate. CodeRabbit's scale and maturity make it the safest choice. The Skills API enables tight orchestrator integration.

---

### 6.3 Mendral (mendral.com) -- YC W26

**What it is:** An always-on AI DevOps engineer that diagnoses CI failures, catches flaky tests, and opens PRs with fixes. Built by the team behind Docker and Dagger. YC W26 batch.

**Architecture:**
- Installs as a GitHub App -- no infrastructure or config files needed
- Log ingestion pipeline processing billions of CI log lines per week into ClickHouse, compressed at 35:1, queryable in milliseconds
- The agent writes its own SQL queries to investigate failures, typically scanning 335K rows across 3+ queries per investigation
- Runs in Blaxel's perpetual sandboxes (Firecracker micro-VMs) for isolated execution

**How It Works:**
- When a build fails, Mendral reads full log output, identifies root cause, and provides explanation with confidence score
- Correlates failures across hundreds of CI runs to find real causes: timing dependencies, shared state, order-dependent execution
- Can trace a flaky test back to a dependency bump three weeks ago by correlating across hundreds of CI runs
- Autonomous PRs with fixes have a **75% acceptance rate**

**Relevance to Orchestrator:** Mendral fills a critical gap -- CI pipeline reliability. When an orchestrator's agents produce code that passes local tests but fails CI, Mendral can:
- Automatically diagnose the CI failure
- Determine if it's a real issue or a flaky test
- Open a fix PR or flag the flaky test for quarantine
- Report back to the orchestrator with structured findings

This creates a feedback loop: Agent writes code -> CI runs -> Mendral diagnoses any failures -> Orchestrator decides whether to re-assign or accept.

**Integration Priority: HIGH** -- CI failures are one of the biggest time sinks in agent-driven development. Mendral's 75% fix acceptance rate means most CI issues resolve without human intervention.

---

### 6.4 RunCanary (runcanary.ai)

**Research Status:** Limited public information available as of March 2026. Described in the user's notes as a Greptile competitor from YC W2026. No substantive technical details were discoverable through web search, suggesting the company may be in stealth or very early stage.

**What's Known:** Positioned in the AI code review space alongside Greptile ($180M valuation, Benchmark-led Series A), CodeRabbit ($550M valuation), and Qodo. The AI code review market is crowded with 2 new startups launched in 2025 alone, and the competitive pressure is intensifying.

**Integration Priority: WATCH** -- Insufficient information to evaluate. Monitor for public launch and differentiation claims.

---

## 7. Synthesis: The Orchestrator Quality Pipeline

Based on this research, here is the recommended quality pipeline for an L-Thread Orchestrator, organized by stage:

### Stage 1: Code Generation
- **Sandbox:** E2B for isolated code execution during development
- **Testing:** fast-check for property-based validation of agent output

### Stage 2: Code Review (Pre-Merge)
- **Automated Review:** CodeRabbit (via Skills API for programmatic invocation)
- **Merge Management:** Graphite for stacked PRs and conflict-free multi-agent merging
- **Security Scan:** Shannon for autonomous penetration testing

### Stage 3: CI/CD
- **CI Monitoring:** Mendral for autonomous CI failure diagnosis and fix generation
- **E2E Testing:** Vercel agent-browser (primary) + Bowser (authenticated sessions)
- **Scale Testing:** Hyperbrowser when parallel browser capacity is exceeded

### Stage 4: Production Monitoring
- **Error Tracking:** Sentry with AI Agent Monitoring for production error detection
- **Analytics:** PostHog for agent performance metrics, feature flags, and LLM observability

### Priority Integration Order

| Priority | Tool | Rationale |
|----------|------|-----------|
| 1 | agent-browser | 93% context reduction transforms E2E testing economics |
| 2 | Graphite | Solves the multi-agent merge conflict problem |
| 3 | CodeRabbit | Automated code review quality gate |
| 4 | Shannon | Security testing quality gate (currently missing) |
| 5 | Mendral | Autonomous CI failure resolution |
| 6 | E2B | Sandbox isolation for code execution |
| 7 | PostHog | Agent observability and feature flags |
| 8 | Bowser | Authenticated browser testing |
| 9 | Sentry | Production error monitoring |
| 10 | fast-check | Property-based testing for edge cases |
| 11 | Hyperbrowser | Scale-out browser capacity |

### Key Insight: The IndyDevDan Ecosystem

IndyDevDan (disler) is building a coherent ecosystem of agent tools: Bowser (browser automation), agent-sandbox-skill (E2B integration), claude-code-hooks-multi-agent-observability (monitoring), and big-3-super-agent (multi-model orchestration). These tools share architectural philosophy and are designed to compose. An orchestrator that adopts one IndyDevDan tool will find the others integrate naturally.

### Key Insight: CLI Over MCP for Token Efficiency

Both Bowser and agent-browser make a deliberate choice to use CLI interfaces rather than MCP servers. The reasoning is consistent: MCP adds protocol overhead and verbose JSON that inflates token usage. CLIs produce compact text output optimized for LLM consumption. For orchestrators managing multiple agents, this token efficiency compounds -- what saves 50% per agent interaction saves 90% across a 10-agent pipeline.

### Key Insight: The Security Gap

Most orchestrator pipelines focus on functional testing (does the code work?) and code quality (is it well-written?). Shannon addresses the third dimension -- security. With a 96.15% exploit detection rate and autonomous operation, it can serve as an automated security gate that runs after functional tests pass. No other tool in this research fills this specific role.

---

## Sources

- [Bowser - GitHub](https://github.com/disler/bowser)
- [Vercel agent-browser - GitHub](https://github.com/vercel-labs/agent-browser)
- [agent-browser Context Efficiency Analysis](https://paddo.dev/blog/agent-browser-context-efficiency/)
- [Hyperbrowser](https://www.hyperbrowser.ai/)
- [Shannon - GitHub](https://github.com/KeygraphHQ/shannon)
- [fast-check - GitHub](https://github.com/dubzzz/fast-check)
- [Property-Based Testing for LLM Code Validation (arxiv)](https://arxiv.org/abs/2506.18315)
- [Agentic Property-Based Testing (arxiv)](https://arxiv.org/html/2510.09907v1)
- [PostHog LLM Analytics](https://posthog.com/docs/llm-analytics)
- [PostHog AI Engineering](https://posthog.com/docs/ai-engineering)
- [Sentry AI Agent Monitoring](https://docs.sentry.io/product/insights/ai/agents/)
- [Sentry Updated Agent Monitoring Blog](https://blog.sentry.io/sentrys-updated-agent-monitoring/)
- [E2B vs Daytona Comparison](https://northflank.com/blog/daytona-vs-e2b-ai-code-execution-sandboxes)
- [Best Sandbox Runners - Better Stack](https://betterstack.com/community/comparisons/best-sandbox-runners/)
- [AI Code Sandbox Benchmark 2026](https://www.superagent.sh/blog/ai-code-sandbox-benchmark-2026)
- [Graphite Stacked PRs](https://graphite.com/blog/stacked-prs)
- [Graphite Stack-Aware Merge Queue](https://graphite.dev/blog/the-first-stack-aware-merge-queue)
- [CodeRabbit](https://www.coderabbit.ai/)
- [CodeRabbit Skills](https://www.coderabbit.ai/blog/coderabbit-skills-give-your-ai-agent-code-review-instincts)
- [Mendral](https://www.mendral.com/)
- [Mendral - YC](https://www.ycombinator.com/companies/mendral)
- [Mendral Architecture Blog](https://www.mendral.com/blog/anatomy-of-a-production-ai-agent)
- [Mendral on Blaxel](https://blaxel.ai/blog/mendral-builds-the-first-24-7-ai-dev-ops-engineer-using-blaxel)
- [Greptile](https://www.greptile.com/)
- [IndyDevDan GitHub](https://github.com/disler)
