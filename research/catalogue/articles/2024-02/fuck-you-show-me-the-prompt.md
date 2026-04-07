# Fuck You, Show Me The Prompt

> **Hamel Husain -- Hamel's Blog, 2024-02-14**

| Field | Value |
|-------|-------|
| Source | [hamel.dev/blog/posts/prompt/](https://hamel.dev/blog/posts/prompt/) |
| Author | Hamel Husain, ML/LLM consultant (Parlance Labs) |
| Publication | Hamel's Blog |
| Date | 2024-02-14 |
| Topics | prompt engineering, LLM frameworks, accidental complexity, prompt transparency, mitmproxy, framework evaluation |
| Read Time | ~15 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **LLM frameworks introduce "accidental complexity" by hiding prompts** -- Traditional programming abstractions translate human-readable code into machine code. LLM frameworks do the reverse: they translate human-readable natural language into unintelligible framework code. This inversion is the core problem -- you're adding abstraction layers to something that was already human-readable.

2. **Always inspect the actual prompts your tools send to the LLM** -- Using mitmproxy (an HTTPS interception proxy), you can see exactly what any framework sends to the LLM API. This reveals hidden multi-step calls, redundant API usage, XML schema bloat, and suboptimal prompt construction that frameworks hide from you.

3. **Most frameworks make more API calls than necessary** -- Guardrails uses multi-step correction loops, Guidance made 7 API calls where fewer would suffice, LangChain's SmartLLMChain uses 4 calls with questionable critique framing (and even has a spelling error in its prompt). The overhead is real and measurable.

4. **"Own your prompts" is a first principle of LLM engineering** -- Before adopting any framework, ask: Is it necessary? Should I extract the prompt and drop the framework? Can I write a better prompt? Are the API call counts reasonable? This aligns directly with 12 Factor Agents' Factor 2 ("Own your prompts").

5. **The "zero-cost abstraction" is the gold standard** -- Instructor (jxnl/instructor) gets praise for using OpenAI's function calling API without rewriting prompts -- a genuine zero-cost abstraction. The test: does the framework add value without adding prompt complexity?

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Core prompt engineering philosophy; directly cited by 12 Factor Agents (our 10/10 reference); validates "own your prompts" principle that underpins our 70/30 split |
| **Actionable** | 6/10 | mitmproxy technique is immediately usable; framework evaluation heuristic applicable when evaluating any new tool; less directly actionable for our current CC-based architecture since we already own our prompts |

---

## Summary

Hamel Husain's provocatively titled article makes a sharp argument against the trend of LLM abstraction frameworks that hide the actual prompts being sent to language models. His core thesis: traditional programming abstractions translate human-readable code into machine code, but LLM frameworks do the inverse -- they translate human-readable natural language (prompts) into unintelligible framework code. This inversion is fundamentally counterproductive.

To prove his point, Husain demonstrates a practical technique using mitmproxy to intercept and inspect the actual API calls made by five popular LLM frameworks: Guardrails, Guidance, LangChain, Instructor, and DSPy. The results are revealing. Guardrails generates bloated XML schemas and uses multi-step correction loops. Guidance made 7 API calls for a task where redundant ideas were generated. LangChain's SmartLLMChain used 4 API calls with a critique prompt that contained a spelling error ("Let'w"). DSPy's "minimal" example took 30+ minutes and made hundreds of API calls with no upfront warning about cost.

The one framework that earns praise is Instructor (jxnl/instructor), which uses OpenAI's function calling API without rewriting prompts -- achieving what Husain calls a "zero-cost abstraction." The framework adds genuine convenience (Pydantic schema mapping) without introducing prompt overhead.

The article's lasting contribution is a simple evaluation framework for any LLM tool: Can you see the prompt? Is the framework necessary? Could you write a better prompt yourself? Are the API call counts reasonable? This philosophy was later cited by Dex Horthy in "12 Factor Agents" as foundational to the "own your prompts" principle (Factor 2), making it an intellectual ancestor of the context engineering movement.

---

## Notable Quotes

> "Programming abstraction: human-like language for machine code. LLM abstraction: unintelligible framework for human language."

> "The prompts sent by these tools to the LLM is a natural language description... taking on accidental complexity."

> "Make the user regress towards writing code instead of conversing."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://parlance-labs.com/ | Hamel Husain's consulting firm -- may have more LLM engineering insights | `/ingest-article` (if blog exists) |
| https://github.com/jxnl/instructor | Zero-cost abstraction framework praised in article; structured outputs via function calling | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| mitmproxy | Core technique -- HTTPS proxy for inspecting LLM API calls | No -- general-purpose tool, not agent-specific |
| Guardrails (guardrails-ai) | Analyzed: XML schema bloat, multi-step correction loops | No -- low relevance (validation library) |
| Guidance (guidance-ai) | Analyzed: 7 API calls, redundant idea generation | No -- low relevance (constrained generation) |
| LangChain | Analyzed: SmartLLMChain, 4 API calls, spelling error in prompt | Yes -- [LangGraph](../../orchestration-platforms/langgraph.md) |
| Instructor (jxnl/instructor) | Praised as "zero-cost abstraction" for structured outputs | No -- not yet catalogued, consider `/tool-catalogue` |
| DSPy | Analyzed: 30+ min runtime, hundreds of API calls for "minimal" example | Yes -- [DSPy](../../agent-harnesses/dspy.md) |
| OpenAI API | Backend LLM provider used in all examples | No -- foundational service, not catalogued |
| Pydantic | Used by Guardrails and Instructor for schema definitions | No -- general-purpose library |

---

## Action Items

- [ ] Try mitmproxy technique to audit any new LLM framework before adoption
- [ ] Cross-reference with 12 Factor Agents article (Factor 2: "Own your prompts") -- already catalogued
- [ ] Evaluate Instructor (jxnl/instructor) for structured output extraction in our pipelines
