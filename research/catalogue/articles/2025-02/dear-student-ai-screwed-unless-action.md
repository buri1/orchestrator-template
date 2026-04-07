# Dear Student: Yes, AI is here, you're screwed unless you take action

> **Geoffrey Huntley -- ghuntley.com, 2025-02-27**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/screwed |
| Author | Geoffrey Huntley (Engineer at Sourcegraph/Amp, independent researcher) |
| Publication | ghuntley.com (personal blog) |
| Date | 2025-02-27 (modified 2025-08-22) |
| Topics | AI career impact, student career advice, developer commoditization, Cursor Composer, industry cycles, high-autonomy mindset |
| Read Time | ~5 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **AI coding tools are replacing the "ticket monkey" entry point for junior developers** -- A student describes using Cursor Composer to complete a complex Rust/JNI/C++/Gradle/CMake integration that would have taken significant manual effort. The traditional junior dev career ladder (get hired, do grunt work, learn on the job) is collapsing because AI handles the grunt work faster and cheaper.

2. **Industry cycles are survivable for high-autonomy people** -- Huntley frames this as the third bust-after-boom he has weathered. The pattern is consistent: disruption wipes out those who cling to the old model, while adaptable builders find new footholds. The key differentiator is agency and willingness to take action rather than waiting for rescue.

3. **The "idea guy" role is democratizing** -- Fresh graduates have historically been told they cannot be "idea guys" -- they must pay dues first. AI inverts this: the ability to conceive, prototype, and ship ideas is now accessible to anyone with high agency and AI fluency, regardless of years of experience.

4. **Career identity crisis is real but solvable** -- The student's existential anxiety about career relevance is representative of a generation entering the workforce during a paradigm shift. Huntley's advice centers on action over despair: adapt, learn the new tools, and position yourself as someone who multiplies output with AI rather than competing against it.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Tangential to our core agent orchestration work but relevant to the broader AI economics thesis. Validates the demand signal for AI-augmented solo builders (Burak's model). The student's Cursor Composer experience is a data point for developer commoditization. Connects to Huntley's other articles already catalogued (the $10.42/hr piece, practitioner profile). |
| **Actionable** | 3/10 | Primarily a career advice/opinion piece. No concrete tools, patterns, or architectures to extract. Value is in the narrative framing (useful for client conversations about AI transformation) and as a companion piece to Huntley's more technical articles. |

---

## Summary

The article is structured as a response to an anonymous student's email. The student describes using Cursor Composer to complete a Rust/JNI integration project -- bridging C++ libraries through JNI into a Gradle build system. The work that would have required deep expertise across multiple toolchains was accomplished with AI assistance, leading the student to question whether their career path as a developer has any future.

Huntley's response (partially paywalled) frames the situation through the lens of historical industry cycles. This is his third bust-after-boom: the pattern of disruption eliminating certain roles while creating others is not new. The difference this time is the speed and breadth of impact -- AI coding tools are commoditizing the exact entry-level tasks that traditionally served as the on-ramp for junior developers.

His core thesis: "If you are a high autonomy person then you're not fucked, as long as you take action." The advice is to stop identifying as a "developer" in the traditional sense and start identifying as a builder who uses every available tool -- including AI -- to create value. The student's ability to complete a complex cross-language integration with Cursor Composer is itself evidence that the new model works; the question is whether they can shift their identity from "person who writes code" to "person who ships products."

The piece connects to Huntley's broader body of work on AI economics, particularly his "$10.42/hr" thesis and the K-shaped economy divergence documented in his other articles.

---

## Notable Quotes

> "I'm a student. Fresh grads aren't seen as idea guys...now Cursor Composer is the ticket monkey."

> "This is the third bust after a boom that I've weathered through."

> "If you are a high autonomy person then you're not fucked, as long as you take action."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/dothings/ | "The future belongs to idea guys that can just do things" -- companion piece on the builder mindset | `/ingest-article` |
| https://ghuntley.com/oh-fuck/ | "An oh f*** moment in time" -- likely covers the initial AI disruption realization | `/ingest-article` |
| https://ghuntley.com/im-a-student/ | Student career advice in AI era -- directly related to this article | `/ingest-article` |
| https://ghuntley.com/ngmi/ | "NGMI" -- likely covers who will not make it in the AI transition | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cursor Composer | Student used it to complete Rust/JNI integration; central to the career disruption argument | Yes -- [Cursor](../../developer-gui/cursor.md) |
| GitHub Copilot | Mentioned as AI coding assistant in the broader landscape | Not catalogued separately (feature of GitHub) |
| Claude AI | Mentioned as AI coding tool | Referenced across catalogue |
| Aider | Mentioned as AI coding tool | Yes -- [Aider](../../agent-harnesses/aider.md) |
| Rust | Language used in student's project | Not catalogued (language, not tool) |
| JNI | Java Native Interface used in student's cross-language project | Not catalogued (API, not tool) |

---

## Action Items

- [ ] Consider ingesting the deep dive candidates (especially /dothings and /ngmi) to complete the Huntley thesis arc
- [ ] Cross-reference with the existing [Geoffrey Huntley practitioner profile](../../practitioners/geoffrey-huntley.md) -- this article adds the "high autonomy" framing to his philosophy
- [ ] Use the student's Cursor Composer story as a case study data point for developer commoditization narrative
