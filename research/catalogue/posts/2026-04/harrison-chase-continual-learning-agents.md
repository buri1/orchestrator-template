# Continual Learning for AI Agents — 3 Layers: Model, Harness, Context

> **@hwchase17 — 2026-04-04**

| Field | Value |
|-------|-------|
| Source | https://x.com/hwchase17/status/2040467997022884194 |
| Author | @hwchase17 — Harrison Chase, CEO & Co-Founder LangChain |
| Date | 2026-04-04 |
| Topics | continual-learning, agent-architecture, langchain, context-layer |
| Type | X Article (Long-Form) |

---

## Burak's Notes

> *Harrison's 3-layer model (Model / Harness / Context) maps almost 1:1 to what we're already building: our CLAUDE.md + /skills + memory = Context Layer. The insight that Context is the most accessible lever (no GPU, no training) validates our entire orchestrator approach. Worth exploring: can we systematically feed traces back into our context layer the way OpenClaw does with "Dreaming"?*

---

## Key Takeaways

1. **Three-Layer Learning Model** — Continual learning in AI agents happens at three layers: Model (weight updates via SFT/RL), Harness (code/scaffolding optimization), and Context (CLAUDE.md, skills, memory). Most discussion focuses on weights, but most practical learning happens at Harness and Context layers.
2. **Context is the most accessible lever** — No GPU or training pipeline needed. Structured memory management (persistent markdown, skills, tool configs) is the cheapest and most immediate way to make agents learn.
3. **Traces are the currency** — All three learning forms depend on good execution logs. LangSmith positions itself as the shared data layer feeding Model, Harness, and Context updates.
4. **Karpathy's Wiki = Context Layer Learning** — Karpathy's viral "LLM Knowledge Bases" post (2026-04-03) is a concrete instance of Harrison's Context Layer: the LLM builds a persistent markdown wiki as a living knowledge artifact, updated in the hot path.
5. **Harness optimization is a new field** — The Meta-Harness paper (arXiv:2603.28052) shows that a coding agent can automatically optimize the agent's own scaffolding code using traces.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly frames what we're doing with CLAUDE.md, /skills, memory as "Context Layer Learning" — gives us the theoretical vocabulary and validates the architecture |
| **Actionable** | 8/10 | OpenClaw's "Dreaming" pattern (offline trace consolidation into persistent context) is immediately applicable to our orchestrator. LangSmith Skills concept maps to our /skills directory. |

---

## Full Content

Harrison Chase argues that "Continual Learning" for AI agents is not just about model weight updates, but happens at **three layers**:

**1. Model Layer** — The model weights themselves (e.g., Claude Sonnet, GPT-5.4). Updated via SFT, RL (e.g., GRPO). Central problem: catastrophic forgetting. Usually trained at agent-level, not per-user. LoRA per user is theoretically possible but rarely done.

**2. Harness Layer** — The code that drives the agent + permanent instructions and tools. Reference paper: "Meta-Harness: End-to-End Optimization of Model Harnesses" (Yoonho Lee et al., arXiv:2603.28052). Core idea: agent runs in a loop, results are evaluated, logs stored, then a coding agent optimizes the harness code based on traces. Usually optimized at agent-level.

**3. Context Layer** — Additional context (instructions, skills, tools) that lives **outside** the harness. Also called "memory". Exists at multiple granularity levels:
- **Agent-level:** Persistent memory that updates over time (e.g., OpenClaw's SOUL.md)
- **Tenant-level:** Per user/org/team (e.g., Hex Context Studio, Decagon Duet, Sierra Explorer)
- **Mix:** Combinations of agent-, user-, and org-level updates

**Context Updates happen two ways:**
1. **Offline (Batch):** Collect traces, analyze in offline job, update context. OpenClaw calls this "Dreaming".
2. **Hot Path (Live):** Agent updates its memory while working on the main task.

Additional dimension: **Explicitness** — Does the user tell the agent to remember, or does the agent decide autonomously based on harness instructions?

**Traces as Foundation:** All three learning forms are driven by traces — the complete execution history. LangSmith collects these. For model updates: pass traces to training partners like Prime Intellect. For harness updates: LangSmith CLI + Skills give a coding agent access to traces. For context updates: Deep Agents supports user-level memory and background learning out-of-the-box.

**Concrete mappings:**
- Claude Code: Model = claude-sonnet / Harness = Claude Code / User Context = CLAUDE.md, /skills, mcp.json
- OpenClaw: Model = various / Harness = Pi + Scaffolding / Agent Context = SOUL.md, Skills from ClawHub

---

## Notable Replies

> **Reviewers:** @sydneyrunkle, @Vtrivedy10, @nfcampos
> *Harrison credits these as reviewers of the article — signals internal LangChain alignment on this framework.*

> Harrison explicitly links the **LangChain Blog "Anatomy of an Agent Harness"** as a predecessor piece.
> *Establishes the intellectual lineage: Harness anatomy -> Continual Learning framework.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://yoonholee.com/meta-harness/ | Meta-Harness paper — how a coding agent optimizes harness code automatically | `/ingest-article` |
| https://docs.openclaw.ai/concepts/soul | OpenClaw's SOUL.md and "Dreaming" pattern for offline context consolidation | `/ingest-article` |
| https://docs.langchain.com/oss/python/deepagents/memory | Deep Agents memory docs — user-level memory and background learning | `/ingest-article` |
| https://github.com/langchain-ai/langsmith-skills | LangSmith Skills — giving coding agents trace access for harness engineering | `/ingest-article` |
| https://hex.tech/product/context-studio/ | Hex Context Studio — enterprise tenant-level context management | `/ingest-article` |
| https://decagon.ai/blog/introducing-duet | Decagon Duet — agent learning platform | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LangSmith | Observability & trace platform, foundation for all 3 learning layers | No |
| LangSmith CLI | CLI for trace access, used for harness optimization | No |
| LangSmith Skills | Skill integration giving coding agents trace access | No |
| Deep Agents | Open-source, model-agnostic base harness by LangChain | No |
| Meta-Harness (Paper) | Stanford/MIT paper on end-to-end harness optimization (arXiv:2603.28052) | Yes — omarsar0-meta-harness-stanford-mit.md |
| OpenClaw | Agent platform with SOUL.md and "Dreaming" offline learning | No |
| ClawHub | Skill registry for OpenClaw | No |
| Hex Context Studio | Enterprise context management tool | No |
| Decagon Duet | Agent learning platform | No |
| Sierra Explorer | Agent context learning | No |
| Prime Intellect | Model training partner | No |
