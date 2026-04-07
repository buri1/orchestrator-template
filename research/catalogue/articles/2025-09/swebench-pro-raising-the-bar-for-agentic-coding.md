# SWE-Bench Pro: Raising the Bar for Agentic Coding

> **Scale AI Research Team — Scale AI Blog, 2025-09-19**

| Field | Value |
|-------|-------|
| Source | [Scale AI Blog](https://scale.com/blog/swe-bench-pro) / [arXiv 2509.16941](https://arxiv.org/abs/2509.16941) |
| Author | Xiang Deng, Jeff Da, Edwin Pan, Yannis Yiming He, Charles Ide, Kanak Garg, Niklas Lauffer, Andrew Park, Nitin Pasari, Chetan Rane, Karmini Sampath, Maya Krishnan, Srivatsa Kundurthy, Sean Hendryx, Zifan Wang, Vijay Bharadwaj, Jeff Holm, Raja Aluri, Chen Bo Calvin Zhang, Noah Jacobson, Bing Liu, Brad Kenstler (Scale AI) |
| Publication | Scale AI Blog + arXiv (cs.SE) |
| Date | 2025-09-19 (blog) / 2025-09-21 (arXiv v1) / 2025-11-14 (arXiv v2) |
| Topics | benchmarks, coding agents, data contamination, long-horizon tasks, proprietary codebases, SWE-bench, evaluation, agent scaffolding |
| Read Time | ~15 min (blog + paper abstract) |

---

## Burak's Notes

> *Companion piece to the [Jiannis Hood conference talk](../../talks/2026-03/swebench-pro-evolving-coding-agent-benchmarks.md) from the AI Driven Dev Conference. The talk covered the vision and roadmap (TerminalBench, human-agent escalation, domain expansion); this paper covers the methodology and hard numbers. Key insight for us: the private codebase performance drop (Claude Opus 4.1 from 22.7% to 17.8%, GPT-5 from 23.1% to 14.9%) proves contamination is real and benchmarks on public code are inflated. When evaluating agents for our system, only SWE-bench Pro private scores matter. Also: by March 2026, top scores hit ~46% on public with better scaffolding -- scaffolding matters as much as the model. That validates our orchestrator approach.*

---

## Key Takeaways

1. **Data contamination is a solved problem in SWE-bench Pro** -- The benchmark uses three contamination-resistant strategies: (a) GPL copyleft-licensed public repos unlikely to appear in training data, (b) a held-out set of 12 repos with restricted access, and (c) 18 proprietary commercial codebases acquired through partnerships with startups. Models cannot have memorized what they have never seen.

2. **Long-horizon tasks expose the real capability gap** -- Every task requires at least 10 lines of code change, with 100+ tasks requiring 100+ lines. Average task touches 4.1 files and changes 107.4 lines. These are not quick patches -- they represent hours to days of professional engineering work. Frontier models score ~23% on the public set vs. 70%+ on SWE-bench Verified.

3. **Proprietary codebases reveal generalization failure** -- The most important finding: performance drops significantly on private code. Claude Opus 4.1 fell from 22.7% (public) to 17.8% (private). GPT-5 dropped from 23.1% to 14.9%. This is the cleanest measurement of true generalization vs. memorization in coding agents.

4. **Scaffolding matters as much as the model** -- By early 2026, the same model (Claude Opus 4.5) scored between 45.9% (standardized) and 51.8% (optimized context management) depending on the agent framework wrapping it. Search tools like WarpGrep v2 yielded consistent 2+ point improvements across all models. The harness is half the story.

5. **1,865 tasks across 41 repos spanning real enterprise diversity** -- Not just open-source libraries but business applications, B2B services, and developer tools. Three subsets: Public (731 tasks, 11 repos), Held-out (858 tasks, 12 repos), Commercial (276 tasks, 18 proprietary repos).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly relevant for evaluating coding agents and understanding capability claims. The contamination finding validates skepticism toward benchmark-inflated scores. The "scaffolding matters" finding validates our orchestrator-as-harness approach -- our deterministic routing + context management IS the scaffolding layer. The multi-file, long-horizon framing matches our agent task profiles. |
| **Actionable** | 6/10 | Use SWE-bench Pro private scores (not Verified, not public) as the ground truth when comparing models for worker agents. The search bottleneck finding suggests investing in code retrieval tools for our agents. The scaffolding insight means our orchestrator improvements directly improve agent resolve rates. No tools to adopt directly, but the evaluation framework is immediately useful. |

---

## Summary

SWE-Bench Pro, published by Scale AI in September 2025, represents the most rigorous benchmark for evaluating AI coding agents. It was created to solve the critical problem of data contamination that plagued the original SWE-Bench (Princeton) and SWE-Bench Verified -- as models trained on ever-larger code corpora, they memorized benchmark problems and produced inflated scores that did not reflect real capability.

The benchmark contains 1,865 problems sourced from 41 actively maintained repositories spanning business applications, B2B services, and developer tools. It is partitioned into three subsets: a Public set (731 instances from 11 GPL-licensed open-source repos), a Held-out set (858 instances from 12 restricted-access repos), and a Commercial set (276 instances from 18 proprietary codebases acquired through partnerships with early-stage startups). The GPL licensing strategy acts as a legal deterrent against code inclusion in training data, while the proprietary codebases are impossible to have been included.

The difficulty increase is stark. Where frontier models achieve 70-80% on SWE-Bench Verified, the same models score only ~23% on SWE-Bench Pro's public set. Tasks require substantial engineering effort: every task needs at least 10 lines of code change, with over 100 tasks requiring 100+ lines. The average task touches 4.1 files and modifies 107.4 lines -- work that would take a professional engineer hours to days.

The most revealing finding is the performance drop on proprietary code. Claude Opus 4.1 fell from 22.7% on public to 17.8% on private. GPT-5 dropped from 23.1% to 14.9%. This gap quantifies the degree to which public benchmark scores are inflated by training data contamination, and provides the cleanest available measure of true generalization.

By early 2026, with improved scaffolding and no cost caps, top scores on the public set broke 40%. Claude models (Opus 4.5 at 45.9%, Sonnet 4.5 at 43.6%) swept the top positions, with Gemini 3 Pro (43.3%) and GPT-5 High (41.8%) close behind. Critically, the same model achieved dramatically different results depending on scaffolding -- Opus 4.5 ranged from 45.9% to 51.8% based on context management strategy. Code search tools (WarpGrep v2) provided consistent 2+ point improvements, identifying search/retrieval as a key bottleneck in agent performance.

Human experts played a key role in curation: three human-in-the-loop checkpoints cover environment construction, issue description augmentation, and test verification (relevance and flakiness). Problem statements preserve real-world ambiguity while clarifying requirements without dictating implementation approaches.

---

## Notable Quotes

> "Top models score around 23% on the SWE-Bench Pro public set, compared to 70%+ on SWE-Bench Verified."

> "The framework wrapping the model, including tool access and context management, matters as much as raw model capability."

> "Evaluation on private, previously unseen codebases provides a more realistic measure of generalization."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://scale.com/leaderboard/swe_bench_pro_public | Live leaderboard -- track model progression over time | Bookmark |
| https://scale.com/leaderboard/swe_bench_pro_private | Private leaderboard -- the ground truth scores | Bookmark |
| https://github.com/scaleapi/SWE-bench_Pro-os | Open-source evaluation harness -- study scaffolding approach | `/tool-catalogue` |
| https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro | Dataset on HuggingFace | Bookmark |
| https://arxiv.org/pdf/2509.16941 | Full paper PDF with detailed methodology and results tables | Reference |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| SWE-Bench (original) | Princeton benchmark; contamination baseline | No |
| SWE-Bench Verified | OpenAI-curated subset; 70%+ scores are inflated | No |
| SWE-Agent | Standard scaffold used for initial evaluations | No |
| WarpGrep v2 | Search optimization yielding 2+ point improvements | No |
| Claude Opus 4.5 | Top scoring model (45.9% standardized, 51.8% optimized) | No |
| TerminalBench | Stanford benchmark for CLI exploration (from talk roadmap) | No -- see [talk entry](../../talks/2026-03/swebench-pro-evolving-coding-agent-benchmarks.md) |
| SEAL Leaderboard | Scale AI's expert-driven LLM benchmark platform | No |

---

## Action Items

- [ ] Use SWE-bench Pro private scores as primary benchmark when evaluating models for worker agents (not Verified, not public)
- [ ] Track the SEAL leaderboard monthly for model capability trends
- [ ] Investigate WarpGrep v2 or similar code search tools to improve our agent scaffolding
- [ ] Cross-reference with [Jiannis Hood talk](../../talks/2026-03/swebench-pro-evolving-coding-agent-benchmarks.md) -- the talk covers roadmap (TerminalBench, human-agent escalation, domain expansion) that the paper does not
- [ ] Consider the "scaffolding = half the story" insight when optimizing our orchestrator's context management for worker agents
