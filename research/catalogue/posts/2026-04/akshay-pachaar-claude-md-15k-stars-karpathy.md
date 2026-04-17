# A Single CLAUDE.md File Just Hit 15K GitHub Stars (Derived from Karpathy's Coding Rules)

> **@akshay_pachaar — 2026-04-12**

| Field | Value |
|-------|-------|
| Source | https://x.com/akshay_pachaar/status/2043374229199151351 |
| Author | @akshay_pachaar — Akshay Pachaar (Co-founder @dailydoseofds_, ex-LightningAI AI Engineer, BITS Pilani, 3 patents) |
| Date | 2026-04-12 |
| Topics | claude-md, karpathy-rules, prompt-engineering, open-source, behavioral-guidelines |
| Type | Single post (thread teaser — "link to repo in next tweet") |
| Engagement | 715K views, 7.7K likes, 16.5K bookmarks (2.14:1 — extreme practitioner-save ratio), 745 retweets, 20 quotes, 93 replies |

---

## Burak's Notes

> Bookmark-to-like ratio of **2.14:1 on 715K views** = this is the kind of post where the audience is SAVING it to act on, not just laughing at it. Akshay is re-amplifying what is now a 30+-entry pattern in our catalogue (YC CEO Garry Tan's CLAUDE.md, Karpathy's Idea Files, Omar Sar's CLAUDE.md-scaling paper, etc.). The actual value of this post is the **verification prompt**: which 15K-star repo is this? Akshay says "link in next tweet" but fxtwitter only returns the root tweet. **Candidate repos** (need verification): `cpjet64/claude-md-toolkit`, `disler/claude-code-hooks-mastery`, `davila7/claude-code-templates` — the 15K-star filter is the distinguisher. Whichever repo this is must be ingested as a `/tool-catalogue` entry immediately. **The claim "15K stars on a single markdown file" is the most important standalone datapoint** — it validates Master Blueprint Principle #1 (orchestration layer is the compounding asset — and CLAUDE.md is part of that layer, not code).

---

## Key Takeaways

1. **A single CLAUDE.md file hit 15K GitHub stars** — arguably the most upvoted instance of "instructions as infrastructure" to date. Validates that well-crafted prompts now command tool-tier attention.
2. **Derived from Karpathy's coding rules** — Karpathy's observation: LLMs make **predictable mistakes** (over-engineering, ignoring existing patterns, adding unrequested dependencies). Predictability is the foothold for prevention.
3. **"Engineer the AI's behavior so the code is actually good"** — Akshay frames this as a category shift: from "use AI to write code" to behavior engineering. Matches Elvis Saravia's "context engineering" and Lopopolo's "prompts-as-lint" terminology.
4. **"The best tools in the Claude Code ecosystem aren't always software. Sometimes they're just well-crafted instructions."** — strongest one-liner formulation of the harness-over-model thesis from the popularizer layer. Reusable for client pitches.
5. **Pattern**: one markdown file, no framework, no tooling — drop into any repo, gives Claude Code structured behavioral guidelines. **Minimum viable harness increment**.
6. **Thread continuation flag** — "I've shared a link to the GitHub repo in the next tweet" — the repo URL is NOT in this root tweet. **Requires thread-crawl follow-up** to identify which CLAUDE.md repo is claimed at 15K stars.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | CLAUDE.md is the central artifact we've been cataloguing since Garry Tan's prompt (Feb 2026). A canonical 15K-star reference implementation would become a must-study benchmark for our own CLAUDE.md design across orchestrator, OmniPort-HH, MAYTT, MC. |
| **Novelty** | 6/10 | The Karpathy-rules framing is not new (in our catalogue since 2026-04-04 `karpathy-idea-files-concept`). What's novel: **the aggregation claim** — if 15K stars is true, this is the **most-starred single-file prompt artifact in the Claude Code ecosystem**, which is a milestone-worthy social proof datapoint. |
| **Actionable** | 8/10 | Immediate action: identify the repo, ingest via `/tool-catalogue`, compare their CLAUDE.md against our orchestrator CLAUDE.md and the Garry Tan prompt. Should produce concrete diffs/additions within 1-2 hours of repo identification. |

---

## Full Content

> A single **𝗖𝗟𝗔𝗨𝗗𝗘.𝗺𝗱** file just hit 15K GitHub stars.
>
> (derived from Karpathy's coding rules)
>
> Andrej Karpathy observed that LLMs make the same predictable mistakes when writing code: over-engineering, ignoring existing patterns, and adding dependencies you never asked for.
>
> If you've used AI coding assistants, you've hit all of these.
>
> But here's the thing:
>
> If the mistakes are predictable, you can prevent them with the right instructions.
>
> That's exactly what this **𝗖𝗟𝗔𝗨𝗗𝗘.𝗺𝗱** does. You drop one markdown file into your repo, and it gives Claude Code a structured set of behavioral guidelines for your entire project.
>
> This is a big deal.
>
> - Built entirely around prompt engineering for AI coding assistants
> - No framework, no complex tooling, just one .md file that shapes behavior
>
> Developers are moving past "use AI to write code" and into "engineer the AI's behavior so the code is actually good."
>
> The Claude Code ecosystem is growing fast, and the best tools in it aren't always software. Sometimes they're just well-crafted instructions.
>
> 100% open-source.
>
> I've shared a link to the GitHub repo in the next tweet!

*Post includes a single image (1456x1348) — presumably a visual summary of the CLAUDE.md structure or the Karpathy rules. Thread continuation tweet contains the repo URL (not fetched in this ingest).*

---

## Notable Replies

Not captured in fxtwitter root-tweet payload. 93 replies total. The most valuable reply will be Akshay's own follow-up tweet with the actual repo URL.

**ACTION REQUIRED**: Fetch thread continuation via:
```
curl -sL "https://api.fxtwitter.com/akshay_pachaar/status/2043374229199151351/thread" | jq
```
or scrape the Akshay_pachaar profile for the reply chain on 2026-04-12.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|------------------|
| **(UNKNOWN) — the 15K-star CLAUDE.md repo** | Claimed to be the most-starred prompt artifact in the Claude Code ecosystem; needs immediate identification + tool-catalogue ingest | `/tool-catalogue <repo-url>` once URL resolved |
| Karpathy's "coding rules" original source | The post claims derivation — our Karpathy entries (`karpathy-llm-wiki-knowledge-bases`, `2026-04-04_karpathy-idea-files-concept`) cover adjacent terrain but not "coding rules" specifically | `/ingest-article` or `/ingest-post` depending on source |

**Flag for follow-up X activity pass**: Akshay Pachaar is already in our practitioner tracking. Re-run `/ingest-x-activity akshay_pachaar` within 24-48 hours to capture the thread continuation tweet with the repo URL.

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Target harness the CLAUDE.md configures | Yes — deeply catalogued (40+ entries) |
| CLAUDE.md pattern | The file format itself | Yes — see `amank1412-yc-ceo-claude-md-prompt.md`, `akshay-claude-folder-anatomy.md`, `2026-04-04_karpathy-idea-files-concept.md` |
| Unnamed 15K-star repo | The concrete artifact under discussion | **NO — requires ingest** |

---

## Cross-References

- **@Amank1412 — YC CEO Garry Tan's CLAUDE.md Prompt** (`posts/2026-04/amank1412-yc-ceo-claude-md-prompt.md`): Garry Tan's structured-review CLAUDE.md; the direct precursor pattern. 2.17:1 bookmark-to-like on Garry Tan's post, 2.14:1 on this post — pattern confirmed.
- **@akshay_pachaar — Anatomy of the .claude/ Folder** (`posts/2026-03/akshay-claude-folder-anatomy.md`): Akshay's own 9.3M-view field guide to the `.claude/` directory structure. This tweet is a follow-up amplification.
- **@karpathy — Idea Files: Share the Idea, Not the Code** (`posts/2026-04/2026-04-04_karpathy-idea-files-concept.md`): Karpathy's own sharing-pattern post. The "coding rules" cited here are likely related to Karpathy's recurring instructional threads.
- **Harness Convergence Wave Synthesis** (`reference/synthesis-2026-04-11-harness-convergence-wave.md`): frames the 2026-04 moment where "prompt as infrastructure" became industry consensus. This 15K-star data point is evidence for that synthesis.
- **Master Blueprint Principle #1** (orchestration layer is the compounding asset): a 15K-star markdown file is a concrete instance of "the wiring endures" — agents (models) commoditize, the instruction layer accumulates value.

---

## Open Questions for Thread Follow-Up

1. Which repo is the 15K-star CLAUDE.md? Candidate checklist:
   - `disler/claude-code-hooks-mastery`
   - `davila7/claude-code-templates`
   - `cpjet64/claude-md-toolkit`
   - `snarktank/ai-dev-tasks`
   - (possibly new — April 2026 vintage)
2. Is the star count verifiable on GitHub today (2026-04-17)?
3. Does the CLAUDE.md structure differ from the Garry Tan / Akshay `.claude/` pattern we've already catalogued? (If yes — ingest priority HIGH. If no — it's a popularity artifact, not a new pattern.)
