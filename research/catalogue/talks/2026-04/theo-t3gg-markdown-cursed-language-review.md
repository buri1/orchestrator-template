# Why Are We Still Using Markdown? — Theo Reads Barack's "Cursed Language" Review

> **Theo Browne — t3.gg livestream, 2026-04-16**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/live/PzROd-AAogY#markdown-cursed (segment ~03:55 → ~04:29) |
| Speaker | Theo Browne — CEO ping.gg, creator of T3 stack |
| Event | YouTube Live (long-form reaction stream on Theo's main channel, 527K subscribers) |
| Duration | ~34 min segment within the 6h stream |
| Date | 2026-04-16 |
| Topics | markdown, parsing, context-sensitive grammar, ReDoS, XSS, CommonMark, Obsidian, John Gruber, agent memory format |

---

## Burak's Notes

> *Mostly educational but not irrelevant. We lean heavily on markdown for agent-readable state: Karpathy LLM Wiki Pattern (we catalogued this), MC docs, CLAUDE.md files, agent memory, ADOPTABLE-PATTERNS.md, every catalogue entry. Barack's article (which Theo reads on stream) catalogues the ways markdown is actually broken: context-sensitive grammar, ReDoS CVEs in the marked parser, XSS via inline HTML, CommonMark non-agreement across implementations, and Obsidian's cursed async-dataview extensions. None of these are showstoppers for us today — our agents are reading markdown we generated ourselves, not untrusted user input. But the footnote-dependent context-sensitivity is real and has bitten me before in MC docs where I moved sections around and the rendered output changed silently. Realistic action: keep using markdown (cost of switching is huge, benefits real), but (1) audit our templates for the specific ambiguous-syntax cases Barack names, (2) consider JSON Lines for agent memory where the parsing matters more than human readability, (3) don't allow agents to consume untrusted markdown via MCP/web without sanitizing.*

---

## Key Takeaways

1. **Markdown is a context-sensitive grammar, not context-free.** The core technical claim in Barack's article: footnote references, link-reference-definition syntax (`[foo][ref]` followed by `[ref]: url` elsewhere), and image references all require resolution against declarations elsewhere in the document. This makes markdown impossible to parse in a single pass without state, and impossible to validate locally — moving a block can silently change the meaning of another block. The "C++ of markup languages" framing follows: multiple syntaxes for the same output, edge cases everywhere, a specification that is permissive by design.

2. **ReDoS vulnerabilities in popular parsers.** Barack cites specific CVEs — the `marked` library (JS, the most popular markdown parser on npm) had a 6.9-severity ReDoS vulnerability where crafted markdown input produces exponential regex backtracking, DOS-ing the server. This is especially relevant for any system where user-submitted markdown gets rendered — which includes any agent that consumes external markdown content (web-scraping subagents, MCP tool responses, etc.).

3. **Inline HTML allowance is the XSS surface.** Most markdown flavors permit raw HTML, which means `<script>` tags in markdown can become live scripts in rendered output. Parsers need explicit allowlist/sanitization (DOMPurify or equivalent). Worse, the ambiguity of "where does markdown stop and HTML start?" makes parsing implementation-specific — different renderers disagree on whether a given input is markdown, HTML, or both.

4. **CommonMark is the failed standardization attempt.** Jeff Atwood (Stack Overflow co-founder) wrote in 2012 advocating for a single standardized Markdown; John Gruber (markdown's creator) refused to participate. CommonMark launched anyway in 2014 as a community-driven spec, but GitHub Flavored Markdown (GFM), CommonMark, Pandoc, MultiMarkdown, and the original Markdown.pl all diverge on edge cases. There is no single "correct" markdown — only dialects.

5. **Gruber's original Markdown.pl is genuinely bad code.** Barack quotes a reviewer calling it "one of the worst small programs I've ever read." This is cited as the root cause of the specification chaos: Markdown was defined by its reference implementation (Perl regex soup), not by a grammar, so every subsequent parser had to reverse-engineer what the original script actually did, leading to divergence.

6. **Obsidian's async-dataview syntax is called out as uniquely cursed.** Obsidian allows embedded `dataview.js` blocks that execute arbitrary JS inside markdown, including `await` expressions that block rendering. Barack's argument: markdown should be declarative and static; async execution blocks inside markdown break every assumption about what "rendering" means. Theo agrees on stream: "this is the worst of all worlds — it's not markdown, it's not JS, it's a cursed hybrid".

7. **Image-as-link syntax forces inline HTML.** To create an image that is also a link in standard markdown, you have to nest the image inside the link syntax (`[![alt](img)](link)`), which the spec technically allows but every parser handles differently. Some flavors require dropping to inline HTML (`<a href><img /></a>`) to be safe. Small example of the broader problem.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | We use markdown heavily for agent-readable state, agent memory, CLAUDE.md files, catalogue entries, and adoptable-patterns tracking. The context-sensitive grammar issue (footnote/reference-definition dependencies) is real and has bitten us silently before in MC docs. But we're mostly reading markdown we generated ourselves, not untrusted input, so ReDoS/XSS exposure is low. |
| **Actionable** | 5/10 | Low-urgency audit items only. Concrete: (1) audit our templates for reference-style link use (prefer inline links to avoid silent breakage on reorg); (2) avoid Obsidian dataview.js blocks in any files intended for agent consumption; (3) if we ever accept user-submitted markdown (MC, MAYTT, OmniPort feedback forms), use a modern sanitizing parser (not `marked`) with allowlist. None of this is pressing. Educational more than directly adoptable. |

---

## Summary

In this ~34-minute segment of the April 16 stream, Theo reads through Barack's article "Why the heck are we still using Markdown?" (source URL not captured on stream; flagged as deep-dive candidate for direct ingest). The article's thesis is that markdown, despite universal adoption, is genuinely broken as a format: it has context-sensitive grammar, ReDoS-vulnerable reference implementations, an XSS-wide inline HTML surface, and a specification situation (CommonMark vs GFM vs Pandoc vs Markdown.pl) that never converged.

The context-sensitive grammar point is the most substantive. Markdown's reference-style links (`[text][ref]` with `[ref]: url` declared elsewhere) and footnote syntax require the parser to maintain a table of declarations across the whole document — meaning you cannot parse a single block in isolation, and you cannot validate the meaning of a block without the rest of the document. Moving a section can silently change how another section renders. Barack describes this as "the C++ of markup languages": multiple syntaxes for the same output, edge cases everywhere, and a permissive specification that invites divergent implementations.

On security: Barack cites specific CVEs in the `marked` JS parser (6.9 severity ReDoS — crafted input causes exponential regex backtracking, denying service). Theo adds context on stream: any web app that renders user-submitted markdown needs to either use a sanitizing parser or strip HTML first, because markdown's inline-HTML allowance is a direct XSS vector. The ambiguity about where markdown ends and HTML begins makes this implementation-dependent — different renderers produce different output for the same input when HTML is involved.

The standardization story is the part Theo spends most time on. Jeff Atwood wrote in 2012 about the need for a single standardized markdown; John Gruber (the creator) declined to participate in any standardization effort and refused to let his name be associated with the effort. CommonMark launched in 2014 as a community-driven spec; GitHub Flavored Markdown, Pandoc, MultiMarkdown, and the original Markdown.pl each continue to diverge on edge cases. There is no one-true markdown — only a family of related dialects, each parsing the same input slightly differently. Barack anchors this in a harsh quote about Gruber's original Markdown.pl: "one of the worst small programs I've ever read." Because the reference was bad code, every clean-room implementation had to reverse-engineer behavior rather than follow a spec, which is how the dialects diverged.

The Obsidian callout gets its own passage. Obsidian supports `dataview.js` blocks that execute JavaScript inline in markdown, including async expressions (`await`) that block rendering. Barack's position (seconded by Theo): this breaks every reasonable assumption about what markdown does. Markdown is supposed to be declarative and static; mixing in async JS execution produces a hybrid that is neither markdown nor a programming language, and cannot be rendered deterministically. Obsidian's plugin ecosystem has similar cursed extensions (custom frontmatter schemas, templated includes) that make "markdown files" in an Obsidian vault non-portable to any other renderer.

Implications for us: we use markdown extensively, but we're mostly in the "markdown we generate ourselves, consumed by our own agents" regime, which sidesteps most of the XSS/ReDoS surface. The context-sensitive grammar issue is real (reference-style links, footnotes, reorganizing sections can silently change rendering) and we should audit our templates to prefer inline links. JSON Lines might be the better choice for agent memory where structure matters more than human readability. Ingesting external markdown (from MCP, from web-scraping subagents, from user input) should always go through a modern sanitizing parser, not `marked`. None of this is pressing — markdown remains the right default — but the specific fragility modes are worth knowing.

---

## Notable Quotes

> "Markdown is the C++ of markup languages. Three syntaxes for the same output, a permissive spec, and 'undefined behavior' if you squint." — Barack (via Theo)

> "You move a footnote and the whole document renders differently. Nobody told you. That's context-sensitive grammar. That's why markdown is broken." — Theo paraphrasing Barack (~04:05)

> "Gruber's original Markdown.pl is one of the worst small programs I've ever read." — Quoted in the article; Theo reads it on stream

> "Obsidian dataview with await is the worst of all worlds. It's not markdown, it's not JS, it's a cursed hybrid, and it blocks rendering." — Theo (~04:20)

> "Jeff Atwood tried in 2012. Gruber said no. CommonMark happened without him. That's how we got here." — Theo (~04:15)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Barack's "Why the heck are we still using Markdown?" article (URL not captured on stream; find via web search) | Primary source Theo is reading; worth a direct catalogue entry with the full argument | `/ingest-article` |
| `marked` library ReDoS CVE (CVE-2023-26136 or similar, verify) | Specific security advisory cited; worth tracking as a cautionary tale for any user-submitted-markdown path | `/ingest-article` |
| Jeff Atwood 2012 "The Future of Markdown" Coding Horror post | Historical standardization attempt Theo references | `/ingest-article` |
| CommonMark specification (commonmark.org) | The one standard that exists, for reference | `/tool-catalogue` or `/ingest-article` |
| Obsidian Dataview plugin docs | Referenced negatively; worth having the counter-position on file | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| `marked` (npm markdown parser) | ReDoS CVE 6.9 severity; cautionary example | No |
| CommonMark | Failed standardization attempt, partial success | No |
| GitHub Flavored Markdown (GFM) | Diverges from CommonMark on edge cases | No |
| Pandoc | Another dialect | No |
| Obsidian | Dataview.js async blocks called out as cursed | Implicitly (Steph Ango CEO notes entry exists); no tool entry |
| John Gruber / Markdown.pl | Origin; "one of the worst small programs ever" | No |
| Jeff Atwood / Coding Horror | 2012 standardization attempt | No |

---

## Action Items

- [ ] **Audit our `_TEMPLATE-*.md` files (catalogue templates) for reference-style link usage.** Prefer inline `[text](url)` over reference-style `[text][ref]` + `[ref]: url` elsewhere. Inline is resilient to section reorganization; reference-style silently breaks when `[ref]` definitions are moved or deleted.
- [ ] **Audit CLAUDE.md and agent-memory files for the same.** These are consumed by agents; silent reference breakage in agent memory could cause real confusion.
- [ ] **Consider JSON Lines for structured agent memory** where parsing precision matters more than human readability (e.g., the ledger, `_bmad/ingest-ledger.json` — already JSON, good; any future "decisions log" or "agent state" file where both human and agent read it — evaluate JSONL over markdown).
- [ ] **Do NOT allow Obsidian dataview.js blocks in any markdown file intended for agent consumption.** Our catalogue, CLAUDE.md files, and MC docs are agent-readable first, human-readable second. Obsidian-specific extensions break portability and parsing determinism.
- [ ] **If we ever accept user-submitted markdown (MC/MAYTT/OmniPort feedback or comment fields), use a modern sanitizing parser — not `marked`** (ReDoS CVE history). Options: `markdown-it` with allowlist plugins, or server-side rendering through a sandboxed process. Low-urgency — no current feature requires user markdown input — but worth noting now so we don't re-learn it under pressure.
- [ ] **Flag Barack's article for full `/ingest-article` ingest once URL is locked.** Theo reads it on stream but we should have the primary source.
