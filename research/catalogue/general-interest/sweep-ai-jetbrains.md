# Sweep AI

> **AI coding assistant and agent optimized for JetBrains IDEs -- autocomplete, code review, and agentic coding with proprietary LLMs and SOC 2 compliance.**

| Field | Value |
|-------|-------|
| Category | General Interest / IDE Agents |
| Website | [sweep.dev](https://sweep.dev/) |
| Marketplace | [JetBrains Plugin #26860](https://plugins.jetbrains.com/plugin/26860-sweep-ai-autocomplete--coding-agent) |
| Publisher | Sweep AI |
| Installs | 40,000+ |
| Rating | 4.9 stars (JetBrains Marketplace) |
| Supported IDEs | IntelliJ IDEA, PyCharm, Android Studio, WebStorm, PhpStorm, Rider |
| Maturity | Growth |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | IDE plugin, not a headless orchestrator. We don't use JetBrains IDEs and our agents operate in terminal, not IDE contexts. Competitive landscape awareness only. |
| **Novelty** | 5/10 | The "next-edit autocomplete" (predicting your next edit rather than just next token) is a differentiated approach. MCP server support with OAuth 2.0/2.1 is forward-looking. Most other features are table-stakes for AI IDE plugins in 2026. |
| **Actionable** | 2/10 | Almost nothing directly reusable. We're terminal-first and Claude-only. The MCP integration pattern and AI Code Review on branch diffs are the only transferable concepts. |

---

## Overview

Sweep AI is the #1-rated AI plugin for JetBrains IDEs, offering two core capabilities: millisecond-speed autocomplete powered by a custom "Tab" model, and an AI coding agent that can perform multi-step tasks within the IDE.

The autocomplete is described as "next-edit" prediction -- rather than just completing the current line, it predicts what edit you'll make next across your codebase. This is a step beyond traditional token-level completion.

The agent component uses proprietary LLMs (not third-party models) and includes AI Code Review that can analyze branch diffs, plus web search/fetch tools for browsing documentation without leaving the IDE. The entire system indexes the user's codebase for context-aware suggestions.

Enterprise adoption is notable: Ramp, Amplitude, Atlassian, and Klook are listed as customers, and SOC 2 compliance with zero data retention addresses enterprise security requirements.

---

## Technical Details

**Autocomplete:**
- Custom "Tab" model for millisecond-latency predictions
- "Next-edit" paradigm: predicts your next edit, not just next token
- Full codebase indexing for context-aware suggestions
- Syntax highlighting across all supported IDEs

**AI Agent:**
- Proprietary LLMs (code not sent to third-party model providers)
- AI Code Review for branch diffs
- Web search and fetch tools built into the agent
- MCP server support with OAuth 2.0/2.1

**Security:**
- SOC 2 compliant
- Zero data retention policy
- Code not retained by third parties

---

## Publisher Background

Sweep AI is a venture-backed company focused on AI coding tools. They previously built an open-source GitHub bot for automated pull requests (the original `sweepai/sweep` repository with 7k+ GitHub stars). They pivoted from the GitHub bot to a JetBrains IDE plugin, likely finding better product-market fit in the IDE-native experience rather than the PR-bot model. This pivot is itself an interesting data point -- the market moved away from standalone PR bots toward IDE-integrated agents.

---

## What's Valuable for Us

1. **Next-edit prediction paradigm**: The concept of predicting the next edit (not just next token) is a higher-level abstraction worth understanding. If we ever add predictive capabilities to our orchestrator's task planning, this "predict the next action" framing could apply.

2. **MCP server with OAuth**: Sweep supporting remote MCP servers with full OAuth 2.0/2.1 is a signal that MCP is becoming the standard integration protocol for AI coding tools. Validates our MCP-first approach.

3. **AI Code Review on diffs**: Automated review of branch diffs is something our orchestrator could do as part of the review-fix loop. Currently we spawn a reviewer agent -- Sweep's approach of reviewing just the diff (not the whole codebase) is more focused.

4. **Pivot signal**: Sweep's pivot from GitHub PR bot to IDE plugin suggests that developers prefer AI assistance in their editor over async PR automation. Relevant to our agent UX decisions.

---

## What's NOT Relevant

- **JetBrains ecosystem**: We don't use JetBrains IDEs. Our agents run in terminal with Claude Code.
- **Autocomplete**: We don't do inline code completion. Our agents write whole files/functions.
- **Proprietary LLMs**: We use Claude exclusively. Sweep's custom models aren't accessible to us.
- **IDE plugin architecture**: Plugin distribution, marketplace ratings -- irrelevant to headless orchestration.

---

## Key Takeaway

> **Sweep is a polished JetBrains AI plugin with next-edit prediction and MCP support -- architecturally irrelevant to our terminal-based orchestrator, but the PR-bot-to-IDE pivot and MCP/OAuth adoption are useful market signals.**
