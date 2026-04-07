# 5 Agent Skill Design Patterns Every ADK Developer Should Know

> **@GoogleCloudTech — 2026-03-17**

| Field | Value |
|-------|-------|
| Source | [x.com/GoogleCloudTech/status/2033953579824758855](https://x.com/GoogleCloudTech/status/2033953579824758855) |
| Author | [@GoogleCloudTech / Google Cloud — amplifying @Saboo_Shubham_ (Shubham Saboo, Senior AI Product Manager at Google) & @lavinigam (Lavi Nigam)] |
| Date | 2026-03-17 |
| Topics | Agent Skills, ADK, design patterns, Google Agent Development Kit, SkillToolset, prompt engineering, agent architecture |
| Type | Single post linking X Article |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Five structural patterns for agent skill internals, not just formatting** — The article shifts focus from SKILL.md file format (which is well-documented) to the actual *content design* of what goes inside a skill. This is the gap: everyone knows how to structure the file, few know how to structure the logic. The five patterns (Tool Wrapper, Generator, Reviewer, Inversion, Pipeline) emerged from analyzing skills across Anthropic, Vercel, and Google repositories.

2. **Tool Wrapper: Contextualizing agents on specific libraries** — Package library documentation, API references, and usage examples as reusable context that makes the agent an instant expert. This is the simplest pattern — wrap an existing tool/library with instructions so the agent knows how to use it properly. Directly applicable to our MCP tool skills.

3. **Generator: Structured document production from templates** — Produce consistent documents (code, configs, reports) from reusable templates. The Generator can use Inversion at the beginning to gather variables before filling out its template. This is our "deterministic template + LLM fill" pattern formalized.

4. **Reviewer: Severity-scored checklist evaluation** — Score code or content against a checklist organized by severity level. A Pipeline skill can include a Reviewer step at the end to double-check its own work. This maps directly to our multi-model review quality gate concept.

5. **Inversion: Agent interviews the user before acting** — Instead of the agent guessing requirements and acting, it flips control and asks clarifying questions first. Forces requirements gathering before execution. This is the "don't assume, validate" principle from LLMJunky's deep dive, formalized as a skill pattern.

6. **Pipeline: Sequential workflow with checkpoints** — Enforces a strict multi-step workflow where each step must complete before the next begins. Can compose with other patterns (e.g., Pipeline + Reviewer at the end). This is the most complex pattern and maps to our orchestrator's deterministic phase transitions.

7. **Patterns compose** — The key insight is that these patterns are combinable. A Pipeline can include a Reviewer checkpoint. A Generator can start with Inversion to gather variables. This composability makes them building blocks, not rigid templates.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Highly relevant to our skill authoring across the orchestrator. We already use several of these patterns implicitly (orchestrator loop = Pipeline, agent spawning = Generator-like, E2E test gate = Reviewer). Formalizing them as named patterns improves our vocabulary and skill design. The ADK SkillToolset's progressive disclosure (only loading skill context when triggered) aligns with our context-is-zero-sum principle. The Inversion pattern is particularly relevant for roadblock recovery — instead of guessing fixes, agents should gather context first. The patterns are framework-agnostic despite being presented in ADK context. |

---

## Full Content

> 5 Agent Skill design patterns every ADK developer should know
>
> By @Saboo_Shubham_ and @lavinigam

The article identifies five recurring structural patterns for designing the internal logic of Agent Skills in Google's Agent Development Kit (ADK):

**1. Tool Wrapper** — Makes an agent an instant expert on a specific library by packaging documentation, API references, and usage patterns as reusable context. The simplest pattern.

**2. Generator** — Produces structured, consistent documents (code, configs, reports) from a reusable template. Can combine with Inversion to gather required variables before template filling.

**3. Reviewer** — Scores code or content against a severity-organized checklist. Provides structured feedback rather than free-form critique. Can be embedded as a checkpoint in Pipeline skills.

**4. Inversion** — Requires the agent to interview the user and gather requirements before taking any action. Flips the typical "agent acts immediately" behavior to "agent asks first, then acts."

**5. Pipeline** — Enforces a strict sequential multi-step workflow with checkpoints between steps. The most complex pattern, capable of composing with Reviewer and other patterns.

Key thesis: "The challenge now is content design" — formatting standards (SKILL.md) exist, but developers need guidance on structuring the logic *inside* skills. These patterns fill that gap.

The article includes code examples and a decision tree for pattern selection. It emphasizes that thanks to ADK's SkillToolset and progressive disclosure, agents only spend context tokens on the exact patterns needed at runtime.

The Agent Skills specification is open-source and natively supported across ADK.

**Engagement:** 4,086 likes | 901 retweets | 93 replies | 8,748 bookmarks | 1,610,668 views

---

## Notable Replies

*[Replies could not be fetched due to X/Twitter scraping restrictions. The post has 93 replies and an exceptionally high bookmark count (8,748) relative to likes — indicating strong practitioner reference intent. The 1.6M views suggest algorithmic amplification by Google Cloud's account. Consider checking manually for implementation examples.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/skillmatic-ai/awesome-agent-skills | Skillmatic's curated list linking to the patterns article; potentially different from VoltAgent's awesome-agent-skills already catalogued | Manual review — check overlap with existing `agent-protocols/awesome-agent-skills.md` |
| https://google.github.io/adk-docs/skills/ | Official ADK Skills documentation — 3-level structure (L1 metadata, L2 instructions, L3 resources), SkillToolset API, progressive disclosure | `/ingest-article` |
| https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/ | Google's multi-agent patterns guide for ADK — complementary to the skill patterns | `/ingest-article` |
| https://x.com/Saboo_Shubham_/status/2033958039359992173 | Original author's post with 412 bookmarks — may have different reply thread with implementation details | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Google Agent Development Kit (ADK) | Core framework for the skill patterns | Referenced across catalogue; no dedicated entry |
| SkillToolset | ADK's progressive-disclosure mechanism for loading skills | No — part of ADK |
| Agent Skills specification | Open-source spec for skill format (SKILL.md) | Yes — [agent-protocols/awesome-agent-skills.md](../agent-protocols/awesome-agent-skills.md) covers the ecosystem |
| A2A Protocol | Google's agent-to-agent protocol, related ecosystem | Yes — [agent-protocols/a2a-protocol.md](../agent-protocols/a2a-protocol.md) |
| OpenAI Skills | Competing skills ecosystem referenced for comparison | Yes — [agent-protocols/openai-skills.md](../agent-protocols/openai-skills.md) |
