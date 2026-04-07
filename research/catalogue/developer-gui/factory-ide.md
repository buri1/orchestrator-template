# Factory IDE

> **AI-native software development platform with specialized "Droids" — AI coding agents that automate development tasks across IDEs, CLIs, and communication tools.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | Proprietary — [factory.ai](https://factory.ai) |
| Publisher | Factory (startup — well-funded, enterprise-focused) |
| License | Proprietary / Commercial |
| Tech Stack | Proprietary platform, model-agnostic (Claude, GPT, Gemini, open-source models) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Factory validates the autonomous agent orchestration thesis but is a proprietary platform solving enterprise problems. Not applicable to our solo-operator, open-source stack. |
| **Novelty** | 5/10 | The "Droid" specialization pattern (Code Droid, Knowledge Droid, Reliability Droid) and model-agnostic routing are interesting architectural choices. Terminal-Bench performance data is useful competitive context. |
| **Actionable** | 2/10 | Proprietary — no code to study, no patterns to fork. Value is purely as a competitive reference point. |

---

## Overview

Factory is a commercial AI-native development platform that positions itself as going beyond code completion into full task automation. Unlike tools like Copilot (code suggestions) or Claude Code (terminal agent), Factory provides specialized AI agents called "Droids" that handle distinct aspects of the development lifecycle: coding, knowledge management, and incident reliability.

Factory integrates deeply with existing developer workflows — VS Code, JetBrains, Vim, terminals, Slack, Jira — rather than requiring a new interface. The platform is model-agnostic, supporting Claude, GPT, Gemini, and open-source/local models. Users can fine-tune autonomy levels from fully supervised to fully autonomous.

The platform has demonstrated strong performance on Terminal-Bench (a benchmark measuring AI agents' ability to complete complex terminal tasks), often outperforming other single and multi-model agents.

---

## Technical Architecture

Factory's architecture is proprietary, so details are inferred from public documentation and demos:

**Key components:**
- **Droids:** Specialized AI agents with distinct roles:
  - **Code Droid:** Coding tasks, refactoring, debugging, testing, deployment
  - **Knowledge Droid:** Research, documentation, codebase understanding
  - **Reliability Droid:** Incident investigation, root cause analysis, debugging
- **Context Engine:** Understands millions of lines of code, maintains context across tools/platforms
- **Integration Layer:** VS Code, JetBrains, Vim, CLI, Slack, Jira
- **Autonomy Controls:** Configurable from supervised to fully autonomous
- **Model Agnosticism:** Choose between Claude, GPT, Gemini, or local models per task

**Enterprise features:**
- Secure data handling and compliance
- Large codebase support (millions of LoC)
- Team management and access controls
- PR creation from issue assignments

---

## Publisher Background

Factory is a well-funded startup focused on enterprise AI development tooling. The company has significant backing (details undisclosed) and has positioned itself in the enterprise market with security and compliance features. Their Terminal-Bench performance suggests a technically strong engineering team. The company operates at factory.ai and has been featured in various tech publications.

Factory represents the "platform play" approach — building a comprehensive, proprietary solution rather than open-source components. This is the inverse of our architecture philosophy (composable open-source tools).

---

## What's Valuable for Us

1. **Droid Specialization Pattern:** Factory's approach of having specialized agents (Code Droid, Knowledge Droid, Reliability Droid) maps loosely to our two-brain separation (Business Brain vs. Code Brain). Their evidence that specialization improves outcomes validates our architectural direction.

2. **Autonomy Level Controls:** Factory's configurable autonomy (supervised → autonomous) maps to Jean's Plan/Build/Yolo modes and validates adding `execution_mode` to our task state schema.

3. **Competitive Reference:** Factory's enterprise positioning and Terminal-Bench performance provide useful benchmarking context. If a client asks "why not just use Factory?", we need to articulate our differentiation (open-source, deterministic orchestration, context engineering depth, zero vendor lock-in).

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Proprietary platform** | No code to study or fork. Cannot integrate with our open-source stack. |
| **Enterprise focus** | We're building for a solo operator, not enterprise teams. |
| **IDE integrations** | Our interface is the terminal (Master Blueprint §8.9). |
| **Slack/Jira integrations** | We use Notion + Telegram, not enterprise collaboration tools. |
| **Commercial licensing** | Adds cost and vendor lock-in. Our stack is $0 for tooling. |
| **Model-agnostic routing** | Not needed until Phase 3+ per Master Blueprint §7. |

---

## Future Use Cases

- **Phase 1–3:** Not relevant. Proprietary platform, different target market.
- **Phase 4 (Days 90+):** Factory's Droid specialization patterns could inform how we structure specialized agent roles as we scale beyond 3–4 agents. Their model routing approach becomes relevant if we implement multi-model routing.
- **Competitive:** Useful as a reference when positioning our approach against commercial alternatives.

---

## Key Takeaway

> **Factory validates the autonomous agent orchestration thesis at enterprise scale with strong benchmark results, but its proprietary nature makes it purely a competitive reference — no code to steal, useful only for architectural inspiration and competitive positioning.**
