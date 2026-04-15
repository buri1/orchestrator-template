# Open Agent Ecosystem — Having an AI Engineer at Your Fingertips

> **Merve Noyan (MVA, Machine Learning Engineer, HuggingFace Open Source Team) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=21720s |
| Speaker | Merve Noyan (MVA) — ML Engineer on the HuggingFace open-source team; works on models + tooling for the Hub; colleague of Niels (also at AIE Europe 2026) |
| Event | AI Engineer Europe 2026, London |
| Date | 2026-04-09 |
| Duration | ~20 min |
| Topics | open-source-models, huggingface-hub, agent-ecosystem, glm-5.1, hermes-agent, pi-agent, llama-agent, huggingface-skills, mcp, inference-providers, benchmark-datasets, traces-datasets, local-agents, vlm-computer-use, quantization, privacy, edge-deployment, spaces-mcp, chandra-ocr, buckets, hf-cli |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Open source > open weight, and "fully open" (code + weights + harness) is the new bar.** Open weight is non-commercial; open source (MIT, Apache 2.0, DeepSeek's MIT) is commercially usable; everything-open (code, weights, harness, eval) is what protects users from silent degradation. The recent closed-model "cloud performance degradation" episode revealed that with closed models, your behavior can change under you without notice — with open, nothing changes unless you change it.

2. **Open models have caught up to closed.** The "open models aren't as good" argument is wrong in April 2026. GLM 5.1 is "crashing it" on Merve's own coding setup. On the Artificial Analysis intelligence index, open (green) now tracks black (closed) — and upcoming models will widen the lead. Strategic implication: open is a viable default, not just a fallback.

3. **HuggingFace Hub is now the infra layer for open agents.** ~3M models, datasets, and spaces hosted; an "agentic models" filter surfaces agent-capable models directly. Two categories matter: Vision LMs (which can do computer-use via screenshots) and LLMs (tool-callers / coding agents). Trend: VLMs are now released at day zero (Gemma 4 Omni, Qwen 3.5 VL, Kimi 2.5).

4. **Running open agent models is no longer frictiony.** vLLM, llama.cpp, and llama-server let you spin up a tool-calling open model in a few lines of code. The "setup complexity" objection to open is outdated.

5. **Benchmark-datasets feature makes model selection empirical.** Filter datasets → benchmark → popular benchmarks (SWE-bench Pro, HLE, AIME) → see open models ranked by score. GLM 5.1 currently leads SWE-bench Pro. You pick models based on the benchmark you care about, not on vibes.

6. **Inference Providers service routes best-model → best-provider.** Compare Groq, Cerebras, Novita, etc. on cheapest vs fastest; a dedicated "tool use" column makes the comparison agent-first (not chatbot-first). This is effectively a LiteLLM-class router but with a HF-native UX.

7. **HF Hub now ships three native agent surfaces: MCP server, Skills, and local agent.** (a) MCP server plugs the entire Hub into any LLM. (b) Skills let you "vibe-train" models — e.g. "train Qwen 3.5 on this dataset" actually trains it via a HF skill. (c) A local agent mode runs full coding agents against open models with Hub integration. Merve's reaction: "training models just by chatting is still sci-fi to me."

8. **Pi and llama-agent are the low-friction local coding agents.** Pi has "super simple setup, inference providers + llama.cpp for local." llama-agent is baked into llama.cpp as a binary — just pass a HF hub ID and it runs. Both let you replace Claude Code with an open-weights coding loop in minutes.

9. **Hermes agent is Merve's "die on this hill" favorite.** Positioned as "a step even further from OpenClaw by means of memory management." Features setup wizard, Slack / WhatsApp integration, one-command install. Merve autonomously fixed a Slack-integration issue using GLM 5.1 + Hermes agent — real end-user dogfooding, not a demo.

10. **Traces datasets — new HF Hub repo type for agent sessions.** The Hub added a "traces" dataset type. Hosts Codex / Claude Code / Pi traces, parsed into a traces column in the dataset viewer. You can train models on your own sessions (RLHF / skill distillation loop). Hermes-agent integration is coming.

11. **HF CLI skill turns any coding agent into a HF power user.** Plug the Hub into Claude, Gemini, or any skill-capable harness. The skill can manage repositories, run jobs, and launch demos. A dedicated "LLM trainer" skill takes an instruction like "train Qwen2VL on lava instruct mix" and the agent calculates required VRAM, picks an instance, and launches the job. Vision-training skills (object detection, segmentation) shipped too.

12. **Spaces MCP turns every HF space into an agent tool.** A dynamic spaces MCP exposes any HF space as a callable tool. Demo: "generate image of baklava made of yarn" → the agent routes to the Qwen Image space and runs it. Jobs feature supports one-off jobs (pay for uptime only, not a running instance).

13. **Niels's 30K-paper OCR case study validates the stack end-to-end.** Ask Claude Code to OCR 30K arxiv papers → it picks an OCR model (Chandra, currently top of ALM OCR bench) → writes the processing job → computes cost → launches on HF infra → drops result on the Hub. A new "OCR model recommendations" skill shipped today. The Hub's new "Buckets" product (S3-like, cheaper/faster, mountable) absorbs the intermediate storage. One prompt, real infra, zero glue code.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | We care about (a) open-model fallback for cost/privacy, (b) agent frameworks beyond Claude Code / Pi, and (c) HF Hub as integration layer for datasets/models/traces. Merve's talk is the single densest source for "what does the open agent stack look like in April 2026." Hermes agent as an OpenClaw alternative is directly relevant to our L-Thread v3 roadmap. HF Inference Providers is a live LiteLLM competitor we should evaluate. Traces-dataset repo type is directly relevant to our session-logging strategy. |
| **Novelty** | 8/10 | Multiple new-to-us data points: (1) GLM 5.1 top of SWE-bench Pro, (2) Hermes agent as "step beyond OpenClaw in memory management," (3) HF traces dataset repo type, (4) HF CLI / LLM-trainer skill ("train Qwen2VL on lava instruct mix"), (5) dynamic Spaces MCP, (6) Buckets product, (7) llama-agent baked into llama.cpp binary. Fully-open (code+weights+harness) vs open-source framing is crisper than what we've seen elsewhere. |
| **Actionable** | 7/10 | (1) Evaluate GLM 5.1 via HF Inference Providers as a non-Anthropic fallback; (2) test Hermes agent against our current tmux orchestrator on a real task; (3) set up llama-agent as local-model worker for privacy-sensitive client work (DSGVO-aligned); (4) prototype a traces dataset repo for our own orchestrator sessions; (5) add HF CLI skill to Claude Code for dataset/job management in our research pipeline; (6) integrate Spaces MCP for on-demand image/audio tools during demo prep. |

---

## Relevance for Orchestrator Research

**HIGH.** Our L-Thread Orchestrator currently depends on Claude Max ($200/mo) as the sole model source. Merve's talk is the strongest single-talk evidence that the open-agent stack is now production-usable, not aspirational: GLM 5.1 leads SWE-bench Pro, Hermes agent claims memory-management improvements over OpenClaw, HF Inference Providers offers model routing with a tool-use column, and llama-agent collapses local-model setup to one binary. For our specific concerns — (a) model fallback during Anthropic outages, (b) privacy-sensitive client work under DSGVO, (c) cost arbitrage beyond the $200 subscription — every capability Merve demos is a direct answer. The traces-dataset type is especially important: it reframes "orchestrator logs" as "training data you can push to the Hub," which aligns with the skill-distillation pattern Lopopolo described in the same event.

---

## Summary

Merve Noyan, ML engineer on HuggingFace's open-source team, delivered a 20-minute tour of the open agent ecosystem at AI Engineer Europe 2026 in London. Her thesis: the "open models aren't as good" argument is dead, and HuggingFace Hub has evolved into the infrastructure layer for open agents — MCP server, skills, local coding agents, traces datasets, inference providers, and Spaces-as-tools all in one.

**Open source vs open weight.** Open weight = non-commercial licensing. Open source = commercial (MIT, Apache 2.0, DeepSeek's MIT). "Fully open" adds the harness and code. This distinction matters because closed models recently suffered performance degradation without user notice — with open stacks, nothing silently changes under you. Bonus: you can shrink, quantize, and fine-tune; guaranteed privacy for end users; edge/browser deployment without data leaving the device; this is critical in a security-breach era.

**Open models have caught up.** GLM 5.1 is "crashing it" and is currently top of SWE-bench Pro. On the Artificial Analysis intelligence index, open (green) now matches closed (black). Upcoming models will widen the gap further.

**HF Hub as agent infra layer.** ~3M models hosted, with an agentic-models filter. Two families matter: VLMs (computer-use via screenshots) and LLMs (coding / tool-calling). Modern VLMs ship day zero now — Gemma 4 Omni, Qwen 3.5 VL, Kimi 2.5. Running them is no longer painful: vLLM, llama.cpp, llama-server, a few lines of code.

**Benchmark datasets feature.** Filter datasets by the "benchmark" flag, pick popular ones (SWE-bench Pro, HLE, AIME), and see open models ranked by score. Empirical model selection replaces vibes.

**Inference Providers.** HF routes requests across Groq, Cerebras, Novita, and others. Compare by cheapest, fastest, or tool-use quality. Effectively LiteLLM with a HF-native UX and an agent-first comparison table.

**Three native Hub agent surfaces.** (1) **MCP server** plugs the Hub into any LLM. (2) **Skills** let you "vibe-train" models — saying "train Qwen 3.5 on this dataset" actually kicks off training through a skill. (3) **Local agent** runs full coding loops on open models with Hub integration. Merve's reaction to training-by-chat: "still sci-fi to me."

**Pi, llama-agent, Hermes agent.** Pi = simple setup, inference providers + llama.cpp. llama-agent = binary inside llama.cpp itself, just pass a HF hub ID. Hermes agent is Merve's favorite — "a step beyond OpenClaw in memory management," with setup wizard and Slack/WhatsApp integration. She autonomously fixed a Slack integration issue using GLM 5.1 + Hermes agent.

**Traces dataset repo type.** HF Hub now hosts a new dataset repo type specifically for agent traces. Codex / Claude Code / Pi traces are parsed into a dedicated traces column. You can train models on your own sessions. Hermes integration is imminent.

**HF CLI skill.** Plug the Hub into Claude / Gemini / any skill-capable harness. The CLI skill manages repositories, runs jobs, and launches demos. A dedicated "LLM trainer" skill converts "train Qwen2VL on lava instruct mix" into a real job — the agent calculates VRAM, picks an instance, launches. Vision-training skills for object detection and segmentation are already available.

**Spaces MCP.** A dynamic Spaces MCP exposes every HF space as a callable tool. Demo: "generate image of baklava made of yarn" → routes to the Qwen Image space → runs it. The Jobs feature supports one-off workloads — pay for uptime only, not a persistent instance.

**30K-paper OCR case study.** Niels asked Claude Code to OCR 30K arxiv papers. The agent picked an OCR model (Chandra, currently top of the ALM OCR bench), wrote the processing job, computed cost, launched on HF infra, and dropped the result on the Hub. A new "OCR model recommendations" skill shipped today. The Hub's new **Buckets** product (S3-like, cheaper/faster, mountable) handled the intermediate storage.

**Why it matters for us.** Every mechanism Merve demonstrated is a direct answer to a cost, privacy, or fallback concern in our current orchestrator. Open models + HF Inference Providers = a non-Anthropic fallback for client work. Hermes agent = a potential OpenClaw/Claude Code alternative with memory management. Traces datasets = our orchestrator logs become training data. HF CLI skill = our research librarian can drive the Hub directly.

---

## Notable Quotes

> "It's absolute guaranteed privacy for your end user." — on open-weights + edge deployment

> "[Hermes agent] is a step even further from OpenClaw by means of memory management." — on why Hermes is her "die on this hill" pick

> "That's still sci-fi to me at this point — training models just by chatting." — on HF skills auto-launching training runs

> "GLM 5.1 is just crashing it." — on the current state of open coding models

> "With open, nothing changes without you knowing." — on the silent cloud-model degradation episode

---

## Key Features & Tools Mentioned

| Tool / Feature | What It Is | Why It Matters |
|----------------|------------|----------------|
| **GLM 5.1** | Open coding model; currently top of SWE-bench Pro | Non-Anthropic fallback for coding agents |
| **Hermes agent** | Open local coding agent with memory management, Slack / WhatsApp integration, setup wizard | Claimed "step beyond OpenClaw"; Merve's "die on this hill" pick |
| **Pi agent** | Simple local coding agent with inference providers + llama.cpp backend | Low-friction open coding loop |
| **llama-agent** | Coding agent baked into llama.cpp as a binary; just pass a HF hub ID | Zero-setup local agent |
| **HF MCP server** | MCP endpoint exposing the entire Hub to any LLM | Native Hub integration in any harness |
| **HF Skills** | Vibe-train / vibe-manage via skills; "train X on Y dataset" becomes a real job | Turns coding agents into ML operators |
| **HF CLI skill** | Claude/Gemini skill for Hub repo mgmt, jobs, demos | Research-librarian grade Hub driver |
| **Benchmark datasets filter** | Filter datasets → benchmarks → open-model leaderboard | Empirical model selection |
| **Inference Providers** | Routes best-model → best-provider across Groq, Cerebras, Novita, etc. | LiteLLM-class router with tool-use column |
| **Traces dataset repo type** | New HF repo type for Codex/Claude Code/Pi traces | Session logs as training data |
| **Dynamic Spaces MCP** | Every HF space callable as an agent tool | On-demand image/audio/video tools |
| **HF Jobs** | One-off jobs, pay-for-uptime only | Replaces long-running training instances |
| **HF Buckets** | S3-like object storage, cheaper/faster, mountable | Storage layer for large agent workloads |
| **Chandra OCR** | Currently top of ALM OCR bench | Default recommendation from new OCR skill |
| **Gemma 4 Omni / Qwen 3.5 VL / Kimi 2.5** | Day-zero VLMs for computer-use | Vision-LM substrate for browser agents |

---

## Relevance / Novelty / Actionable

| Dimension | Score |
|-----------|-------|
| Relevance | 8/10 |
| Novelty | 8/10 |
| Actionable | 7/10 |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/NousResearch/hermes-agent | Hermes agent repo — "die on this hill" pick with memory management beyond OpenClaw; Slack/WhatsApp integration | `/tool-catalogue` (agent-harnesses/hermes-agent.md) |
| https://github.com/huggingface/pi (or local-agent equivalent) | Pi local coding agent with HF inference providers + llama.cpp | `/tool-catalogue` |
| https://github.com/ggml-org/llama.cpp (llama-agent binary) | Coding agent baked directly into llama.cpp | `/tool-catalogue` note |
| https://huggingface.co/docs/hub/skills | HF Skills documentation — vibe-train pattern, LLM trainer skill, HF CLI skill | `/ingest-article` |
| https://huggingface.co/docs/hub/datasets-traces | HF traces dataset repo type — new session-logging primitive | `/ingest-article` |
| https://huggingface.co/zai-org/GLM-5.1 | GLM 5.1 model card — currently SWE-bench Pro leader | Model catalogue entry |
| https://huggingface.co/docs/inference-providers | HF Inference Providers service — LiteLLM-class router with tool-use column | `/ingest-article` |
| https://huggingface.co/docs/hub/mcp | HF MCP server — plug the Hub into any LLM | `/ingest-article` |
| https://huggingface.co/spaces | Dynamic Spaces MCP — every HF space as agent tool | Tool catalogue note |
| https://huggingface.co/datasets?other=benchmark | Benchmark datasets filter — SWE-bench Pro, HLE, AIME rankings | `/ingest-article` |
| https://huggingface.co/datalab-to/chandra | Chandra OCR — currently top of ALM OCR bench | Model note |
| https://huggingface.co/docs/hub/buckets | HF Buckets — S3-class storage, mountable | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| GLM 5.1 | Top of SWE-bench Pro; Merve's own coding setup | No — should add as open-model candidate |
| Hermes agent | "Die on this hill" pick; OpenClaw alternative with memory mgmt | No — high priority for agent-harnesses/ |
| Pi agent | Simple local agent + inference providers + llama.cpp | Partial — pi-agent already catalogued; this refers to a different HF-specific variant |
| llama-agent | Baked into llama.cpp binary, HF hub ID input | No — should add |
| HuggingFace Hub | Agent infra layer — 3M models, datasets, spaces | Partial — should get a dedicated entry |
| HF Inference Providers | LiteLLM-class router with tool-use column | No — should add (competitor to LiteLLM entry) |
| HF MCP Server | Plug Hub into any LLM | No — should add |
| HF Skills | Vibe-train via skills | No — should add |
| HF CLI skill | Repo / jobs / demos management from Claude | No — should add |
| HF Traces Dataset | New repo type for agent session data | No — should add |
| HF Spaces MCP | Dynamic spaces as callable tools | No — should add |
| HF Buckets | S3-class mountable storage | No — should add |
| Chandra OCR | Top of ALM OCR bench | No — should add |
| Gemma 4 Omni | Day-zero VLM | No — should add |
| Qwen 3.5 VL | Day-zero VLM | No — should add |
| Kimi 2.5 | Day-zero VLM | No — should add |
| Artificial Analysis Intelligence Index | Open vs closed benchmarking | Partial |
| SWE-bench Pro | Benchmark currently led by GLM 5.1 | Yes — catalogued |
| OpenClaw | Reference baseline that Hermes agent claims to surpass | Yes — orchestration-platforms/openclaw.md |

---

## Action Items

- [ ] Add `agent-harnesses/hermes-agent.md` entry — this is a high-priority OpenClaw/Claude Code alternative with claimed memory-management superiority
- [ ] Add `agent-harnesses/llama-agent.md` entry — llama.cpp binary with HF Hub ID input, zero-friction local agent
- [ ] Add GLM 5.1 as a first-class open-model candidate; evaluate via HF Inference Providers for a non-Anthropic fallback
- [ ] Add `infrastructure/hf-inference-providers.md` — compare to existing LiteLLM entry
- [ ] Add `infrastructure/hf-hub-mcp.md` — native Hub MCP server
- [ ] Add `agent-protocols/hf-skills.md` — HF Skills pattern + HF CLI skill + LLM trainer skill
- [ ] Add `observability/hf-traces-datasets.md` — new dataset repo type; possible host for our own orchestrator traces
- [ ] Add `infrastructure/hf-buckets.md` — S3-class mountable storage
- [ ] Prototype: run a non-sensitive client task through Hermes agent + GLM 5.1 end-to-end; compare cost and completion quality to Claude Max
- [ ] Prototype: push a week of L-Thread traces to a HF traces dataset repo and fine-tune a small open model on the corpus (skill distillation)
- [ ] Cross-reference with Niels's 30K-paper OCR workflow — use that as template for our research-librarian's large-dataset ingestions
- [ ] Watch for Hermes agent ↔ HF traces dataset integration (Merve said "coming soon")
