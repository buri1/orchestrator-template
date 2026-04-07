# Lightning Talk: Choosing the Right Model for Coding Agents

> **Ash (Fino Labs / Pioneer) — Coding Agents: AI Driven Dev Conference, 2026**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (05:07:22 - 05:12:21) |
| Speaker | Ash — Founder & CEO, Fino Labs (ex-Stanford, Google DeepMind, Apple) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~5 min (lightning talk) |
| Date | 2026-03 |
| Topics | model selection, fine-tuning, inference monitoring, model drift, open-source LLMs, cost optimization |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Deploy first, fine-tune later** — Pioneer inverts the traditional workflow: instead of fine-tuning a model before deployment, you deploy an open-source model first (Llama, Qwen, DeepSeek, Kimi K2), then use real inference logs to continuously improve it. Deployment is step one, not the final step.

2. **Partition usage across specialized model instances** — Instead of using one large model (e.g. Claude 4.6) for everything, break tasks into separate concerns (routing, code generation, structured extraction) and deploy independent model instances per task. Each can then be improved and evaluated independently.

3. **Inference logs are your training data** — The data needed for fine-tuning already exists in your inference logs, but LLM API providers don't give you access to it. Running your own open-source models lets you capture this data and use it for continuous improvement via synthetic labeling.

4. **Model drift is the real production problem** — Without continuous monitoring and re-training, deployed models get less accurate over time. Pioneer's loop (deploy → monitor → collect → label → fine-tune → re-evaluate → redeploy) addresses this by making accuracy improve over time instead of degrading.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 5/10 | Interesting for model routing strategy, but we use Claude Max (API, not self-hosted). Applicable if/when we move to open-source models for specialized sub-tasks. |
| **Actionable** | 3/10 | Low immediate actionability — we don't self-host models. The "partition usage" principle is already in our architecture (70/30 split, task-specific agents). Pioneer itself is in private alpha. |

---

## Summary

Ash, founder and CEO of Fino Labs (previously DevGPT, which famously spent $2M on OpenAI API costs after going viral), presents Pioneer — a platform for automated model selection and continuous fine-tuning of open-source LLMs for agent use cases.

The core thesis is that choosing the right model is hard because (a) new models release constantly, (b) benchmarks don't reflect your specific task performance, (c) fine-tuning is time-consuming due to data collection difficulty, and (d) evaluating model quality on your workload requires custom benchmarks you don't have.

Pioneer's approach flips the workflow: deploy an open-source model (Llama, Qwen, DeepSeek, Kimi K2) immediately, then run an autonomous agent in the background that monitors inference logs, synthetically labels the data, fine-tunes the model, and re-evaluates before redeploying. This creates a flywheel where accuracy improves over time and costs/latency decrease as smaller models become viable for the same tasks.

A brief demo showed Pioneer comparing accuracy across Llama, Gliner, and DeepSeek for a weather-to-JSON extraction task, with the platform automatically determining which model performs best. The product was in private alpha at time of talk.

---

## Notable Quotes

> "We were using GPT-3 for that dev agent. It went viral which was great, but then we spent $2 million on OpenAI's system which wasn't so great." — 05:07:49

> "Deploying an open-source language model is actually the first step, as opposed to that being the final thing you do after fine-tuning." — 05:09:11

> "No longer do we actually necessarily mind which model we're selecting. It could be Kimi K2, it can be Llama, it can be Qwen. It's just a description of the task and then our agent will figure out what's best." — 05:10:28

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Pioneer by Fino Labs (no public URL yet — private alpha) | Automated model selection + fine-tuning platform for agents | `/tool-catalogue` when publicly available |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Pioneer (Fino Labs) | The product being presented — automated model selection + continuous fine-tuning | No — private alpha, not yet catalogued |
| DevGPT | Ash's previous company; GPT-3 agent that went viral and cost $2M in API fees | No |
| Llama | One of the open-source models supported by Pioneer | No |
| Qwen | One of the open-source models supported by Pioneer | Yes — [qwen-agent](../../agent-harnesses/qwen-agent.md) |
| DeepSeek | One of the open-source models supported by Pioneer | No |
| Kimi K2 | One of the open-source models supported by Pioneer | No |
| Gliner | Used in demo for NER/extraction comparison | No |

---

## Action Items

- [ ] Monitor Pioneer launch — could be useful if we ever deploy open-source models for specialized sub-tasks (routing, extraction, classification)
- [ ] The "partition usage" insight reinforces our existing architecture — document as external validation of the 70/30 split with task-specific model instances
