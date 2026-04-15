# How Auto-Research Built the Best Browser Agent

> **Magnus Muller (CEO, Browser Use) — browser-use.com, 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [browser-use.com/posts/online-mind2web-benchmark](https://browser-use.com/posts/online-mind2web-benchmark) |
| Author | Magnus Muller, Co-Founder & CEO, Browser Use |
| Publication | Browser Use Blog |
| Date | 2026-03-25 |
| Topics | agent browsers, benchmarks, auto-research, browser automation, Mind2Web |
| Read Time | 8 min |

---

## Burak's Notes

> *Browser Use Cloud (paid) hit 97% on Mind2Web Online -- impressive, but this is their cloud product, not the open-source library. The open-source library has no separate score. Our ranking in agent-browsers/INDEX.md stays the same because our criteria (CLI-first, context efficiency, tmux integration) are orthogonal to "can it book flights on 136 websites." The auto-research loop methodology (Claude Code running eval cycles in parallel) is the actually interesting part for us.*

---

## Key Takeaways

1. **Browser Use Cloud achieves 97% on Mind2Web Online** -- the highest reported score on the most widely cited browser agent benchmark (300 tasks, 136 real websites, 3 difficulty tiers). This is the PAID cloud product (`bu-max`), not the open-source library.

2. **Auto-research methodology is the real innovation** -- they give Claude Code a CLI to their eval platform and let it run 20 improvement cycles per session in parallel. This is essentially an agentic self-improvement loop that searches the space of possible agent improvements. "No orchestration code."

3. **Coding agent > click-and-type agent** -- the key breakthrough was Claude Code upgrading their browser harness from simple click/type tools to a coding agent that writes Python to parse HTML and extract data. This aligns with LLM training distributions and handles edge cases better.

4. **TSV over JSON saves 40% of tokens** -- a concrete context engineering finding. Small format choices in data structures significantly impact agentic debugging and evaluation.

5. **Overfitting is the primary failure mode of auto-research** -- "The natural tendency of the auto-research loop is to overfit on single tasks. You need to prompt the research system hard to generalize." They use train/validation splits to mitigate.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Benchmark is for general web task automation (shopping, travel, gov sites) not E2E software testing. The auto-research methodology is interesting for our eval pipelines. Does NOT change browser-use's position in our agent-browsers ranking. |
| **Actionable** | 4/10 | The TSV-over-JSON token savings and Claude-Code-as-auto-researcher patterns are transferable. The actual benchmark result doesn't affect our tool choices. |

---

## Summary

Browser Use published their results on the Online-Mind2Web benchmark, achieving 97% accuracy with their Cloud product (`bu-max`). This is the highest reported score, beating GPT-5.4 Native Computer Use (93%), UI-TARS-2 (88%), and ABP + Claude Opus 4.6 (86%).

The benchmark consists of 300 tasks across 136 real websites spanning shopping, finance, travel, and government. Tasks are split into Easy (83), Medium (143), and Hard (74) difficulty tiers. Example tasks range from "open reviews of a recipe with beef sirloin" (easy) to complex multi-leg travel bookings with specific constraints (hard).

The article details their "auto-research" methodology: Claude Code sessions receive a CLI to the eval platform and a goal, then run 20 improvement cycles autonomously. Multiple sessions run in parallel, creating a search tree over possible agent improvements. The key architectural breakthrough was evolving from a simple click/type browser agent to a coding agent that writes Python for HTML parsing and data extraction.

Critically, the 97% score is for Browser Use Cloud -- their paid, hosted product with stealth browsers, proxies, and custom models. The open-source `pip install browser-use` library is not separately benchmarked. The article also notes that OpenAI's GPT-5.4 score (93%) lacks published judge, harness, or task-level results for independent verification.

The author calls for harder benchmarks, noting that current benchmarks don't test tasks like "extract 1000 products with subpages and compare them across platforms" -- tasks that modern browser agents can actually handle.

---

## Full Leaderboard

| Rank | Agent | Score | Data Public | Source |
|------|-------|-------|-------------|--------|
| 1 | Browser Use Cloud (bu-max) | 97% | Yes | GitHub |
| 2 | GPT-5.4 Native Computer Use | 93% | No | Blog* |
| 3 | UI-TARS-2 | 88% | No | arXiv |
| 4 | ABP + Claude Opus 4.6 | 86% | Yes | GitHub |
| 5 | OpenAGI Lux | 84% | No | Blog |
| 6 | TinyFish | 81% | Yes | Blog |
| 7 | Navigator (Yutori) | 79% | No | Blog |
| 8 | ChatGPT Atlas Agent Mode | 71% | No | Blog |
| 9 | Google Gemini CUA | 69% | Yes | HuggingFace |
| 10 | Stagehand (Gemini 2.5 CU) | 65% | Yes | Stagehand evals |
| 11 | OpenAI Operator | 61% | Yes | HuggingFace |
| 12 | Claude Sonnet 4.0 CU | 61% | No | Blog |
| 13 | Stagehand (Sonnet 4.5) | 55% | Yes | Stagehand evals |

*OpenAI's score lacks published judge, harness, or task-level results for independent verification.

---

## Notable Quotes

> "We give Claude Code a CLI to our eval platform and a prompt to run in a loop... No orchestration code. Each Claude Code session gets a goal and runs 20 cycles on its own."

> "Claude Code updated our browser agent harness into a coding agent. Instead of only tools like click and type, it added Python to parse HTML and extract data."

> "The natural tendency of the auto-research loop is to overfit on single tasks. You need to prompt the research system hard to generalize."

> "Most of my time merging cycles is rejecting task-specific solutions that overfit."

> "We need harder benchmarks... Currently benchmarks ignore tasks like: 'Extract 1000 products with subpages and compare them across platforms' because it was unimaginable that a single browser agent could do this."

> "Small format choices can make or break agentic debugging."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://huggingface.co/spaces/osunlp/Online_Mind2Web_Leaderboard | Official benchmark leaderboard -- track over time | Bookmark |
| https://github.com/browser-use/online-mind2web | Reproducible benchmark harness -- study judge methodology | Bookmark |
| https://arxiv.org/abs/2509.02544 | Mind2Web paper (original academic work) | `/ingest-article` |
| https://stagehand.dev/agent-evals | Stagehand's public eval results -- compare methodology | Bookmark |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Browser Use | Primary subject -- 97% on Mind2Web Online (Cloud version) | [Yes](../agent-browsers/browser-use.md) |
| Browser Use Cloud | Paid cloud product achieving the 97% score | Part of browser-use entry |
| Claude Code | Used as auto-research runner and evolved browser agent into coding agent | Yes (core tool) |
| Claude Agent SDK | Powers the agentic judge | [Yes](../agent-harnesses/claude-agent-sdk.md) |
| GPT-5.4 | Scored 93%, unverified | Not catalogued |
| UI-TARS-2 | Scored 88% | Not catalogued |
| ABP | Scored 86% with Claude Opus 4.6; acronym not expanded in article | Not catalogued |
| Stagehand | Scored 55-65% depending on model | [Yes](../agent-browsers/stagehand.md) |
| OpenAI Operator | Scored 61% | Not catalogued |
| Google Gemini CUA | Scored 69% | Not catalogued |

---

## Action Items

- [ ] Monitor Mind2Web Online leaderboard quarterly for shifts
- [ ] Consider TSV-over-JSON format for our own agent data structures (40% token savings claim)
- [ ] Study auto-research loop pattern (Claude Code as eval runner) for our own E2E testing improvement cycles
- [ ] Check if ABP = Agent Browser Protocol and whether it's related to agent-browser (Vercel Labs)
