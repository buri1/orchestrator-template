# The Economics of Agent Harnesses: Build from Scratch vs. OSS Foundation vs. Closed-Source

**Date**: 2026-03-05
**Type**: Strategic Analysis
**Status**: Final

---

## Executive Summary

Three competing strategies have emerged for building AI coding agent tooling in 2026: (A) build your own from scratch (Gas Town / Yegge), (B) custom harness on an open-source foundation (Pi Agent / Dan's approach), and (C) use the closed-source market leader (Claude Code). This analysis examines the economics, risks, and strategic positioning of each approach across nine dimensions.

**Bottom line**: The hybrid strategy---bet 80% on the closed-source leader, hedge 20% with an OSS harness---is the most durable position for mid-to-senior engineers. Building from scratch only makes sense if you are a frontier developer with deep pockets and the explicit goal of pushing the boundary of what agents can do. The "engineering your own advantage" thesis holds: the tools you use shape what you believe is possible, and specialization on OSS harnesses creates compounding returns that pure consumers of closed-source tools will never access.

---

## The Three Approaches

### Approach A: Build Your Own from Scratch

**Exemplar**: Steve Yegge's Gas Town
**Stack**: Go, MEOW stack, Dolt database, Beads coordination layer
**Codebase**: ~189K LOC (75K initial in 17 days + 44K from 100+ community PRs in 12 days, continuing to grow)
**Development method**: 100% vibecoded---Yegge has never read the code
**Agent capacity**: 20-50+ parallel coding agents (Mayor, Polecats, Witness, Refinery, Dogs, Deacon)

### Approach B: Custom Harness on OSS Foundation

**Exemplar**: Pi Agent (by Mario Zechner / badlogic)
**Stack**: TypeScript, MIT license, npm-distributable
**Base**: 4 tools (read, write, edit, bash), system prompt under 1,000 tokens
**Extension model**: ~700 LOC per complex extension (tilldone task discipline, agent-team orchestration)
**Modes**: Interactive, print/JSON, RPC (process integration), SDK (embedding)

### Approach C: Use Closed-Source Leader

**Exemplar**: Claude Code by Anthropic
**Stack**: Proprietary, terminal-first, IDE-integrated
**Capabilities**: 10+ built-in tools, 10K-token system prompt, sub-agents (7 parallel), Agent Teams, MCP integration
**Subscription**: $20-$200/month
**Enterprise**: SSO, audit logs, admin dashboard, organizational policies

---

## Dimension 1: Total Cost of Ownership

### Year-1 Cost Model (Solo Developer)

| Cost Category | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| **Tool/platform cost** | $0 (OSS tools) | $0 (MIT license) | $1,200-$2,400/yr ($100-200/mo) |
| **API/model costs** | $24,000-$60,000/yr | $1,200-$6,000/yr | $0 (included in sub) |
| **Developer time (setup)** | 200-500 hours | 20-40 hours | 2-4 hours |
| **Developer time (maintenance)** | 40-80 hrs/month | 4-8 hrs/month | 0-2 hrs/month |
| **Opportunity cost of building** | Very high | Moderate | Near zero |
| **Total Year 1 (loaded)** | **$50K-$120K+** | **$3K-$12K** | **$1.2K-$2.4K** |

### Explanatory Notes

- **Approach A (Gas Town)**: Yegge reports spending $2K-$5K/month on API costs alone, funded by $75K in $GAS crypto transaction fees. A 60-minute Gas Town session costs ~$100 in Claude tokens---roughly 10x normal Claude Code session costs. The 189K LOC Go codebase demands constant vibecoding maintenance, and Yegge is on his second Anthropic account due to spending limits. This is a research project, not a production-ready platform.

- **Approach B (Pi/OSS Harness)**: $0 tool cost. You bring your own API keys and choose your models. A complex extension like agent-team orchestration is ~700 LOC of TypeScript. At current API rates (Sonnet 4.6 at $3/$15 per MTok; Opus 4.6 at $5/$25 per MTok), a heavy daily user might spend $100-$500/month on tokens. Model routing (cheaper models for simple tasks, expensive ones for complex) can dramatically reduce this.

- **Approach C (Claude Code)**: One developer's real-world data: 8 months of daily use across ~10 billion tokens would have cost $15,000+ at API rates but cost only ~$800 on the Max plan ($100/month). Another user reported 201 sessions across 45+ projects with an API-equivalent cost of $5,623 in a single month, paid as $100-$200 flat. The subscription model is an extraordinary value for high-volume users.

### 3-Year TCO Projection

| | A: Build | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| Year 1 | $80K | $6K | $2K |
| Year 2 | $45K | $4K | $2K |
| Year 3 | $35K | $3K | $2K |
| **3-Year Total** | **~$160K** | **~$13K** | **~$6K** |

*Approach A costs decline as the codebase stabilizes; Approach B costs decline as extensions mature; Approach C stays flat.*

---

## Dimension 2: Time to Value

| Milestone | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| First productive session | Weeks to months | Hours to days | Minutes |
| Custom workflow running | Months | Days to weeks | N/A (limited customization) |
| Multi-agent orchestration | Months | Weeks | Available immediately (Agent Teams) |
| Production-grade stability | 6-12 months | 1-3 months | Day 1 |
| Unique competitive advantage | Immediate (if successful) | 1-3 months | Never (commodity tool) |

**Key insight**: Approach C has the fastest time-to-value for standard workflows, but you hit a ceiling quickly. Approach B has moderate startup cost but the fastest path to *differentiated* value. Approach A is a research expedition, not an engineering project.

---

## Dimension 3: Maintenance Burden

### Quantified Maintenance Load

| Metric | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| Lines of code owned | ~189,000 (Go) | ~700 per extension | 0 |
| Breaking change exposure | Every upstream model change | Upstream Pi changes (MIT, pin-able) | Every Anthropic update |
| Update cadence required | Continuous | Monthly at most | Automatic (forced) |
| Debugging complexity | Extreme (100% vibecoded, never read) | Low (small, self-authored TS modules) | Zero (black box) |
| Bus factor | 1 (Yegge) | 1+ (your code, but simple) | 0 (vendor-managed) |

### The Vibecoding Maintenance Problem

Gas Town's 189K LOC was written by AI and never read by its creator. This creates an unprecedented maintenance dynamic:

- **Debugging**: When something breaks, you must describe the problem to the AI and hope it can fix code neither of you fully understand.
- **Architectural drift**: Without human code review, the codebase accumulates structural debt invisibly.
- **Dependency management**: 189K lines of Go with external dependencies (Dolt, Beads, Claude API) create a large and fragile surface area.

By contrast, Pi extensions at ~700 LOC per module are small enough to read, understand, and maintain by hand. You can inspect every line. When something breaks, the blast radius is a single module.

---

## Dimension 4: Lock-in Risk

### Lock-in Matrix

| Lock-in Type | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| **Model lock-in** | Medium (Gas Town wraps Claude Code) | None (any model, any provider) | High (Anthropic models) |
| **Platform lock-in** | None (self-hosted) | None (runs anywhere Node runs) | High (Anthropic infrastructure) |
| **Data format lock-in** | Medium (Dolt/Beads proprietary schemas) | Low (standard files, JSON) | Medium (conversation history in Anthropic) |
| **Workflow lock-in** | High (MEOW stack is custom) | Low (TS modules are portable logic) | Medium (CLAUDE.md, MCP conventions) |
| **Cost lock-in** | Low (can move to cheaper models) | Low (switch providers freely) | High (subscription or nothing) |

### Claude Code Lock-in Mitigations (2026)

The lock-in risk for Approach C has decreased significantly:

- **Claude Code Router**: A proxy that intercepts Claude Code requests and routes them to alternative providers (OpenRouter, DeepSeek, Ollama, Gemini, and 8+ others).
- **OpenRouter integration**: Official integration allows Claude Code to access 320+ LLMs, with "Anthropic Skin" preserving tool use and structured output.
- **Cost savings**: Third-party alternatives can save up to 98% compared to Opus 4.6 (DeepSeek V3.2 at ~$0.28/$0.28/$0.42 per MTok vs Opus at $5/$25).

However, these workarounds have limitations: tool quality degrades with non-Anthropic models, Agent Teams may not function correctly, and you lose the subscription cost advantage.

### What Happens When the Vendor Changes Direction?

| Scenario | Impact on A | Impact on B | Impact on C |
|---|---|---|---|
| Anthropic doubles prices | API costs rise | Switch to cheaper models | Sub price rises or you leave |
| Anthropic kills Claude Code | Gas Town still works (wraps CLI) | No impact (model-agnostic) | Total loss of tooling |
| Pi project abandoned | No impact | Fork and maintain (MIT, ~700 LOC) | No impact |
| New model provider dominates | Rewire Gas Town (hard) | Change config file | Locked out unless workaround works |

---

## Dimension 5: Customization Ceiling

### Capability Range by Approach

```
Approach A (Build):    [====================================================] 100%
Approach B (OSS):      [==========================================]            ~80%
Approach C (Closed):   [=======================]                               ~45%

                       Basic      Custom       Multi-Agent    Novel
                       Coding     Workflows    Orchestration  Paradigms
```

### What Each Approach Can and Cannot Do

**Approach A can uniquely do**:
- Run 50+ parallel agents with custom role hierarchies (Mayor, Polecats, Refinery, Dogs)
- Implement novel coordination patterns (MEOW molecules, wisps, patrols, convoys)
- Use Turing-complete workflow definitions
- Integrate a versioned database (Dolt) for agent state management
- Push the frontier of what multi-agent systems can achieve

**Approach B can do**:
- Custom tool definitions with full lifecycle hooks
- Agent-team orchestration via YAML configuration
- Task discipline systems (tilldone) for deterministic workflows
- Custom TUI elements (keyboard shortcuts, commands, footer displays)
- Distribution as npm packages (share with team, install with `npm install`)
- Embed in other applications via SDK mode
- Any model, any provider, dynamic routing per task

**Approach C cannot do**:
- Modify the harness itself (the 10K-token system prompt is fixed)
- Change how tools work internally
- Add novel coordination patterns beyond Agent Teams
- Route different tasks to different models within one session (without workarounds)
- Deeply customize the agent loop or lifecycle

---

## Dimension 6: Model Flexibility

| Capability | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| Default model | Claude (via Claude Code) | Any (config-driven) | Claude Sonnet 4.6 / Opus 4.6 |
| Model switching | Difficult | Per-task routing | Workarounds only |
| Local model support | Unlikely | Yes (Ollama, llama.cpp) | Via Claude Code Router |
| Cost optimization via routing | Limited | Full (cheap model for simple, expensive for complex) | Not natively supported |
| Frontier model access | Day-1 Claude access | Any provider's day-1 models | Day-1 Claude only |

**Strategic implication**: Model flexibility is the single strongest argument for Approach B. In a world where model capabilities converge and prices drop, the ability to route tasks to the cheapest adequate model creates compounding cost advantages. Anthropic's Sonnet 4.6 already matches Opus-level coding at one-fifth the cost; the OSS approach lets you exploit these price-performance shifts immediately.

---

## Dimension 7: Team Scalability

| Dimension | A: Build from Scratch | B: OSS Harness | C: Closed-Source |
|---|---|---|---|
| **Onboarding time** | Days-weeks (complex mental model) | Hours (familiar TS/npm tooling) | Minutes (batteries included) |
| **Sharing config** | Git repo + Dolt setup + Go build | `npm install @team/pi-extensions` | CLAUDE.md + MCP config in repo |
| **Consistency across team** | Hard to enforce | Package.json pins versions | Automatic (vendor-managed) |
| **Enterprise features** | None | Build your own | SSO, audit logs, admin dashboard |
| **Cost per seat** | API costs * N | API costs * N | $100-200 * N |
| **10-person team annual cost** | $240K-$600K+ | $12K-$60K (API) | $12K-$24K (subscription) |

**Key finding**: For teams, Approach C wins on simplicity and governance. Approach B wins on flexibility and API cost optimization. Approach A is impractical for teams---the mental model is too complex and the bus factor of 1 is unacceptable.

For a 10-person engineering team:
- **Approach C**: $12K-$24K/year flat. Everyone productive on day 1. Enterprise governance included. No engineering overhead.
- **Approach B**: $12K-$60K/year in API costs (but model routing can reduce this). Requires 1-2 engineers to maintain extensions. Custom workflows give competitive edge.
- **Approach A**: $240K-$600K/year minimum. Requires dedicated infrastructure engineer. Team members must understand MEOW stack, Beads, Dolt. Practical only for well-funded research labs.

---

## Dimension 8: The "Engineering Your Own Advantage" Thesis

### The Core Argument

> "You can't get ahead of the curve by doing what everyone else is doing."
> "The tools you use shape what you believe is possible."

This is the most important strategic dimension and the strongest case for Approach B. The argument proceeds in three steps:

**Step 1: Commodity tools produce commodity outcomes.**
When 100,000 developers use identical Claude Code configurations, their output converges. The tool's defaults become the ceiling of imagination. You cannot discover novel agent patterns if you cannot modify the agent loop.

**Step 2: Custom tooling creates compounding advantages.**
Each extension you build teaches you something about agent behavior that users of closed-source tools never learn. The tilldone extension teaches you about task discipline. The agent-team extension teaches you about coordination patterns. These insights compound---each one informs the next.

**Step 3: The knowledge gap becomes the competitive moat.**
Retool's 2026 report found that 35% of enterprises have already replaced SaaS tools with custom builds, and 78% expect to build more. The engineers who understand how to build and customize agent tooling will be in extraordinary demand. Those who can only *use* Claude Code are fungible; those who can *extend* it or *build alternatives* are not.

### Quantifying the Advantage

Consider two engineers over 12 months:

**Engineer A** (Claude Code only):
- Ships features 20% faster than pre-AI baseline
- Limited to patterns Anthropic ships
- Zero portability if Anthropic changes direction
- Skills: prompt writing, CLAUDE.md configuration

**Engineer B** (80% Claude Code, 20% Pi extensions):
- Ships features 20% faster via Claude Code (same as A)
- Additionally discovers novel patterns via custom extensions
- Portable skills: TypeScript, agent lifecycle hooks, model routing, tool design
- Can switch foundations overnight if needed
- Builds a library of reusable extensions that compound over time

After 12 months, Engineer B has: the same productivity as A on standard work, plus a portfolio of custom agent tooling, plus deep understanding of agent internals, plus model-agnostic skills. The delta grows every month.

### The Retool Data Point

From Retool's 2026 Build vs. Buy Report (817 respondents):
- 35% have replaced at least one SaaS tool with custom build
- 78% plan to build more custom tools in 2026
- 51% have built production software with AI assistance
- 72% use AI to write discrete code pieces integrated into larger projects (not whole apps)
- 60% have built something outside IT oversight in the past year

The trend is unmistakable: the best engineers are building custom tools, and AI is making this dramatically cheaper. The question is not whether to customize but how much.

---

## Dimension 9: Risk Matrix

### Approach A: Build from Scratch

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Codebase becomes unmaintainable | High | Critical | None (vibecoded, never read) |
| API costs spiral out of control | High | High | Set hard spending caps |
| Yegge burns out / moves on | Medium | Critical | Community fork (but 189K LOC is daunting) |
| Anthropic rate-limits or bans heavy usage | Medium | High | Multi-provider support (not yet built) |
| Model quality regression breaks workflows | Medium | High | Pin model versions |
| Go ecosystem shifts break dependencies | Low | Medium | Vibecode the fix |

**Overall risk profile**: HIGH. This is a high-wire act suitable only for funded researchers or developers who view the project itself as the product.

### Approach B: Custom Harness on OSS

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Pi project abandoned by maintainer | Medium | Low | Fork (MIT, small codebase) |
| Extension breaks on Pi update | Medium | Low | Pin Pi version, test before upgrading |
| API provider price increases | Medium | Medium | Switch providers (model-agnostic) |
| Extension complexity grows beyond control | Low | Medium | Keep extensions small (~700 LOC) |
| Team member can't understand custom tooling | Low | Low | Standard TypeScript, npm packaging |
| Model quality insufficient for custom workflows | Low | Medium | Switch to better model |

**Overall risk profile**: LOW. Every risk has a concrete mitigation. The worst case (Pi abandoned) is handled by the MIT license and the small codebase size.

### Approach C: Closed-Source Leader

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Anthropic raises prices significantly | Medium | Medium | Claude Code Router / switch tools |
| Anthropic kills or pivots Claude Code | Low | Critical | No mitigation (total dependency) |
| Rate limits block heavy usage | Medium | High | Upgrade to Max 20x ($200/mo) |
| Feature you need isn't supported | Medium | Medium | MCP extensions (limited) |
| Competitor ships better tool | Medium | Medium | Low switching cost (just change tool) |
| Model lock-in prevents using superior model | Medium | Medium | Claude Code Router workaround |

**Overall risk profile**: MEDIUM. The low-probability/critical-impact risk (Anthropic kills Claude Code) is the one to watch. Everything else is manageable.

---

## Decision Framework

### Choose Approach A (Build from Scratch) if:

- You have $50K+/year to burn on a research project
- You are Stage 7-8 on the agentic engineering maturity curve
- You want to push the frontier of multi-agent coordination
- You view the project itself as a product or research contribution
- You are comfortable with code you've never read
- You have funding from another source (crypto, grants, employer)

**Audience**: <1% of developers. Researchers, funded independents, developer-influencers.

### Choose Approach B (OSS Harness) if:

- You are a mid-to-senior engineer who values control
- You want to build compounding advantages over time
- You need model flexibility (cost optimization, privacy, or capability routing)
- You plan to share custom workflows with a team
- You're willing to invest 20-40 hours upfront for long-term returns
- You believe the tools you use shape what you can imagine

**Audience**: ~10-20% of developers. The ones who read this document to the end.

### Choose Approach C (Closed-Source Leader) if:

- You want maximum productivity with minimum setup
- Your employer pays for the subscription
- You don't need custom agent patterns
- You're comfortable with Anthropic's model ecosystem
- You need enterprise governance features
- You value your time over your optionality

**Audience**: ~80% of developers. The default, and a very good default.

### Choose the Hybrid (Recommended) if:

- You want the best of both worlds
- You use Claude Code as your daily driver (80% of work)
- You invest in Pi or equivalent OSS for experimental/next-gen work (20% of work)
- You treat the OSS work as a learning investment, not a productivity tool
- You want to be prepared for any vendor disruption

**Audience**: The strategic engineer. This is the recommended approach.

---

## The Recommended Strategy: Structured Hedging

### Allocation

```
Daily work:           Claude Code Max ($100-200/mo)     80%
Experimental work:    Pi Agent + BYO API keys           20%
Infrastructure:       Shared .pi/ config + npm packages  As needed
```

### Implementation Roadmap

**Month 1: Establish the baseline**
- Subscribe to Claude Code Max ($100/mo)
- Install Pi Agent (`npm install -g @mariozechner/pi-coding-agent`)
- Complete one real task with each tool
- Time: 4-8 hours setup, then normal work

**Month 2-3: Build your first extension**
- Identify a workflow Claude Code handles poorly or cannot customize
- Build a Pi extension (~700 LOC TypeScript)
- Package it for reuse (`npm publish` or git)
- Time: 20-40 hours total

**Month 4-6: Develop model routing intuition**
- Experiment with different models for different task types
- Measure cost and quality tradeoffs
- Build a routing configuration that reflects your workload
- Time: 2-4 hours/week of experimentation

**Month 7-12: Compound the advantage**
- Build 2-3 more extensions based on what you've learned
- Share extensions with team via npm packages
- Evaluate whether Claude Code or Pi is better for each workflow class
- Adjust the 80/20 ratio based on evidence

### Expected Outcomes at 12 Months

| Metric | Claude Code Only | Hybrid Strategy |
|---|---|---|
| Monthly cost | $100-200 | $150-400 |
| Productivity (standard work) | High | High (same) |
| Custom workflow capability | None | 3-5 extensions |
| Model flexibility | Low | Full |
| Vendor disruption readiness | Zero | High |
| Portable skills acquired | Prompt writing | Agent architecture, tooling, model routing |
| Knowledge compounding | Linear | Exponential |

---

## Conclusion

The economics are clear:

1. **Claude Code is the best default**. At $100-200/month with $5K-$15K+ of API-equivalent value, the subscription model is an extraordinary deal. Most developers should use it as their primary tool.

2. **Building from scratch is a research project, not a strategy**. Gas Town is fascinating and boundary-pushing, but $50K+/year with a bus factor of 1 and 189K lines of unread code is not a viable model for anyone except well-funded frontier explorers.

3. **The OSS harness is the strategic hedge**. At $0 tool cost, ~700 LOC per extension, MIT license, and full model flexibility, building on Pi creates optionality, skill development, and compounding advantages that pure Claude Code usage cannot match.

4. **The hybrid approach is the sweet spot**. Use Claude Code for 80% of work (high productivity, low maintenance). Use Pi for 20% (learning, experimentation, competitive edge). Adjust the ratio as the landscape evolves.

The question is not "which tool is best?" The question is "what kind of engineer do you want to be in 12 months?" If the answer involves understanding agent internals, building custom workflows, and being prepared for vendor disruption, the hybrid strategy is the only approach that gets you there.

> "You can't get ahead of the curve by doing what everyone else is doing."

The 80% keeps you productive. The 20% keeps you ahead.

---

## Sources

- [Claude Code Pricing Guide](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)
- [Claude AI Pricing 2026](https://screenapp.io/blog/claude-ai-pricing)
- [Claude API Pricing (March 2026)](https://www.tldl.io/resources/anthropic-api-pricing)
- [Pi Agent Revolution](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Pi Coding Agent README](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [Pi Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [How to Build a Custom Agent Framework with Pi](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Pi: The Minimal Agent Within OpenClaw](https://lucumr.pocoo.org/2026/1/31/pi/)
- [Welcome to Gas Town (Yegge)](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Gas Town's Agent Patterns, Design Bottlenecks, and Vibecoding at Scale](https://maggieappleton.com/gastown)
- [A Day in Gas Town (DoltHub)](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)
- [Welcome to the Wasteland: A Thousand Gas Towns](https://steve-yegge.medium.com/welcome-to-the-wasteland-a-thousand-gas-towns-a5eb9bc8dc1f)
- [The Future of Coding Agents (Yegge)](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c)
- [Retool 2026 Build vs. Buy Report](https://retool.com/blog/ai-build-vs-buy-report-2026)
- [Claude Code Agent Teams Guide](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Agent Teams (Addy Osmani)](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Claude Code Router (GitHub)](https://github.com/musistudio/claude-code-router)
- [OpenRouter Claude Code Integration](https://openrouter.ai/docs/guides/guides/claude-code-integration)
- [Pi vs Claude Code Comparison](https://github.com/disler/pi-vs-claude-code)
- [Build vs. Buy AI Agent Integrations (Composio)](https://composio.dev/blog/build-vs-buy-ai-agent-integrations)
- [AI Tooling for Software Engineers in 2026 (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/ai-tooling-2026)
- [Context Engineering as Your Competitive Edge](https://towardsdatascience.com/context-engineering-as-your-competitive-edge/)
