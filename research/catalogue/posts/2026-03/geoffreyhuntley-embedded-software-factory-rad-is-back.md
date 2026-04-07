# A sneak preview behind an embedded software factory. I suspect rapid application dev is back.

> **@GeoffreyHuntley — 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [x.com/GeoffreyHuntley/status/2030683143360119292](https://x.com/GeoffreyHuntley/status/2030683143360119292) |
| Author | [@GeoffreyHuntley / Geoffrey Huntley — Creator of the Ralph Wiggum Loop, building @latentpatterns and The Weaving Loom] |
| Date | 2026-03-08 |
| Topics | embedded software factory, rapid application development, product-as-IDE, live editing, Cursor Cloud Agents, first-party analytics, hyper-personalised software, model-first company, Latent Patterns |
| Type | X Article (long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **The product IS the IDE — recursive development from within the product itself** — Huntley has built a "designer mode" inside @latentpatterns that lets him modify copy, functionality, and application logic directly from within the running product, then ship via a "Launch Agent" button. The product develops itself. He frames this as the logical destination when inferencing speed approaches near-instantaneous: "it just makes sense that anyone should be able to develop the product from within the product."

2. **Hyper-personalised software is coming back (the Microsoft Access / Delphi / VB circle)** — Our industry works in circles. In 2000, every business had hyper-personalised software via RAD tools (Microsoft Access, Delphi, Visual Basic). Then SaaS homogenised everything, forcing businesses to conform to someone else's product vision and stitch together workflows via Zapier. AI coding agents now make it economically viable to build custom everything again — CRM, support desk, analytics, scheduling, newsletters — all first-party, all integrated, all built by "ripping a fart into my coding harness."

3. **"On the loop, not in the loop" — risk-based shipping with agent supervision** — Instead of manual code review for everything, Huntley ships directly to production using Cursor Cloud Agents + workflow automations with a risk matrix. High-risk changes (e.g., database schema migrations) halt for manual review. Everything else ships automatically. He supervises from his phone, watching the inferencing output. The learning is in watching the loops, not reviewing the diffs.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps to multiple interest areas: AI-powered software factories, solo founder scaling with AI, SaaS business models, agent engineering patterns, and the economics of building custom software with coding agents. Huntley's "product-as-IDE" pattern is a concrete implementation of what our SaaS factory aspires to. His first-party analytics/CRM/support integration built via agent delegation is exactly the "hyper-personalised software" vision. The risk-based shipping pipeline (Cursor Cloud Agents + risk matrix) is a production-grade pattern we could adopt. His use of People Data Labs for automatic customer enrichment + LLM-powered sales analysis is directly relevant to our lead gen experiments. |

---

## Full Content

**Opening:**
> A sneak preview behind an embedded software factory. I suspect rapid application dev is back.

**On CI/CD and live editing:**
> Every second counts; even sixty seconds for CI/CD is too long. The natural destination from here for @latentpatterns is live editing programming memory. Sure, I could move content from the file system to the database. But the more interesting thing is the application code. How can we kill CI/CD as it is today and instead safely live-edit the program's memory?

**On inferencing speed and product-as-IDE:**
> If you build with the mindset and awareness that inferencing speed will be near-instantaneous in the future, then it just makes sense that the logical destination is for anyone to be able to develop the product from within the product, and for the product to become the IDE itself.

**On the hidden designer mode:**
> For the last couple of weeks, I've been cryptically tweeting about a hidden mode within @latentpatterns that I use to build @latentpatterns, and how the product is now the IDE. Over the last couple of days, I've opened up and started showing people in SF.

> Microsoft Access is back, baby.

> If I want to make a change to something, I pop on designer mode, and this allows me to develop LP in LP. I can make changes to the copy or completely change the application's functionality using the designer substrate directly from within the product, then click the launch agent to ship.

**On Cursor Cloud Agents integration:**
> If I click Launch Agent, then it utilises @cursor_ai's new Cloud Agents and Workflow Automations to ship it straight into production using a risk-based approach.

> I guess you're wondering right now why I would not have my own agents for code editing? Well, that's because they're commodities now. Last month, Cursor hooked me up with a preview of their new stuff, and now that it's out, this is how I've been using it. You could do this with any background execution utility service.

**On risk-based shipping and supervision:**
> Instead of having a manual code review for everything, I just ship it. If something is high enough on the risk matrix, for example, a database schema migration, then it halts the shipping, and I have to do a manual review. Having said that, I'll repeat something I've said again and again over the years. You need to watch the loops. Watch the inferencing because that's where your learning is at. When I want something built, I just open up my phone and watch the output get made. I'm supervising it. I'm on the loop, not in the loop.

**On hyper-personalised software (the historical circle):**
> I think we're entering into an era of hyper-personalised software, and our industry actually works in circles. The last time we had hyper-personalised software for business was Microsoft Access, Delphi and Visual Basic. You see, back in the year 2000, every business had hyper-personalised software. They didn't have to bend or conform to someone else's product vision on how they should operate their business. They didn't need Zapier or all these workflow automation systems stitching together SaaS. No, they had rapid application development, and these businesses had hyper-personalised software.

**On building core business widgets:**
> All businesses need the following "widgets" / components: Analytics, CRM, Support Desk, Newsletters, Meeting Scheduling. So, for the last couple of weeks, I've been doing some window shopping...

**On customer management and first-party analytics:**
> So the first thing I did was model the notion of a user and have a customer management functionality. Consider how long it would take in traditional software developer to build such functionality. A very simple user management database with a front end. Before AI, this would have taken weeks at most corporations. Before our industry went backwards, this used to take seconds. Back in the year 2000, it used to be seconds. This used to be just Microsoft Access tables.

> @latentpatterns has first-party analytics built in and is horizontally and vertically integrated throughout the platform. To do this, I literally just ripped a fart into my coding harness and said, "Hey, I want @posthog. Make it happen".

**On customer enrichment via People Data Labs:**
> Through the usage of @peopledatalabs I can automatically step up who they are, where they work, any achievements they've had in life, and insights such as their likely salary or whether they have decision-making power to purchase. When you take this information and you throw it into a perplexity search, you get this...

> This is baseline functionality that every business needs, and it needs to be first-party within their application. By having all this first-party data in my data tables, I can then layer agents on top of it to automatically prioritise my day via an agentic personal assistant.

**On CRM + support desk as first-party:**
> The next thing every business needs is a support desk and a customer relationship management tool. Classically, in most companies today, these are two separate things, and you have to build workflow automations to keep them in sync. No. In LP, they are a first-party thing, and they were built by ripping a fart into my coding agent of "Hey, I want @pipedrive, Trello, and @Zendesk"

**On meeting transcription and sales automation:**
> I also ripped a fart into my coding harness and said that I want my own meeting transcription bot that automatically joins these meetings and asks for consent to take notes and record the meeting.

> At the end of the meeting, I rip an agent over the transcription and apply sales automation using a mixture of Challenger-based sales and SPIN Selling as a series of LLM prompts. You see, in a previous life, I was also a sales engineer.

Items captured include: Competitive Landscape, Budget & Approval Process, Seat Sizing & Expansion Potential, Reseller & Training Partner Potential, Signals & Sentiment, Buying signals, Champion indicators, Rapport notes, Information Gaps, Decisions Made, Follow-Up Items, Product Demo (What was shown, Questions They Asked), Content Interest & Feature Requests, Perception of the product demo, Pain Points & Needs.

**On sales methodology:**
> From there, it's just not so easy, but it's a skill that you can learn. Shut up and become curious. When someone says something, just ask why they said it. All you need to do is get folks talking, and the more they share about their needs and pain points, the more information the LLM prompts can process. The more data you can gather, the more effective the follow-up meetings, especially if it's an initial meeting. And with that data, you can then rip an agent over the top of it to do more business automation.

**On identity and LP's mission:**
> If you're new here, I'm Geoff. Some folks might know me as the person who created the "Ralph Wiggin loop". I've taken some of the ideas behind "The Weaving Loom" and inverted them, put them into the product itself and have perhaps accidentally created a better @Lovable.

> Having said that, the focus for @latentpatterns is about teaching people. I'm living, breathing, and teaching what it means to be a model-first company. I'm building with a recursive latent space, teaching it from my experiences as a one-man company.

**Closing (travel schedule):**
> I'll be in SF for @daytonaio's event tomorrow and hanging around until Wednesday night, and then heading to New York. I'll be in New York for a week, then I'm heading to Auckland, Lithuania, Estonia, Sydney, Australia, Miami, Washington DC and then back to San Fran. It's about 90 days of travel.

**Engagement:** 192 likes | 26 reposts | 15 replies | 357 bookmarks | 19,625 views

---

## Notable Replies

> **@GeoffreyHuntley (self-reply)**: "Of course it is, which is why I cloned @LaunchDarkly. This type of risk is continually on my mind, and this is our job now as engineers: to control it, reduce it and engineer it away. We are locomotive engineers now."
> *Huntley addresses the risk of live-shipping by revealing he also cloned LaunchDarkly (feature flags) into LP. The "locomotive engineer" framing is powerful — our role is risk engineering, not code writing. Links to ghuntley.com "everything is a ralph loop".*

> **@H3xanK (nate bennett)**: "It was really interesting and powerful when I was experimenting with SaaS porting and realized you can meta-improve the product from dev/vpn access within the product. Recursive product development."
> *Independent validation of the product-as-IDE pattern from someone who arrived at the same insight via SaaS porting experiments.*

> **@AidanPak**: "'I'm on the loop, not in the loop.' Great post"
> *Highlights the key supervision principle — a quotable formulation of the human-agent relationship.*

> **@mickeybighouse (Michael)**: "Very cool stuff. I have to say that those who really wanted to move away from vibe coding to agentic engineering are going to have an even harder time trying to convert 'ripping farts' into something more noble"
> *Amusing observation on Huntley's colourful language vs. the industry's attempt to professionalise agent-assisted development.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://latentpatterns.com/ | Huntley's new educational AI platform — the product described in this article. Pre-launch, building in public. | `/ingest-article` (when launched) |
| https://latentpatterns.com/discord | LP Discord community — source of customer activity data referenced in the article | Manual review |
| https://ghuntley.com/everything-is-a-ralph-loop | Linked in Huntley's self-reply about risk engineering and LaunchDarkly cloning | `/ingest-article` |
| https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now | VentureBeat article on the Ralph Wiggum loop origins | `/ingest-article` |
| https://www.youtube.com/watch?v=zX_Wq9wAyxI | "The Weaving Loom" — Huntley's talk on the ideas he inverted for LP | `/ingest-talk` |
| https://compute.daytona.io/ | Daytona.io event in SF — Huntley attending, may produce content | Manual review |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Latent Patterns (@latentpatterns) | The product being built — educational AI platform with embedded software factory, designer mode, first-party analytics/CRM/support | Not yet catalogued |
| Cursor Cloud Agents (@cursor_ai) | Used as background code execution service for the "Launch Agent" shipping pipeline | Not yet catalogued — consider `/tool-catalogue` |
| PostHog (@posthog) | First-party analytics cloned into LP ("I want @posthog. Make it happen") | Not yet catalogued |
| People Data Labs (@peopledatalabs) | Customer enrichment — automatic step-up of customer identity, salary, decision-making power | Not yet catalogued |
| Pipedrive (@pipedrive) | CRM functionality cloned into LP | Not yet catalogued |
| Zendesk (@Zendesk) | Support desk functionality cloned into LP | Not yet catalogued |
| Calendly (@Calendly) | Meeting scheduling cloned into LP | Not yet catalogued |
| Trello | Task/project management cloned into LP | Not yet catalogued |
| LaunchDarkly (@LaunchDarkly) | Feature flag service cloned into LP for risk-based shipping | Not yet catalogued |
| Lovable (@Lovable) | Huntley says he may have "accidentally created a better Lovable" | Not yet catalogued |
| The Weaving Loom | Huntley's prior project — ideas inverted and embedded into LP | [Referenced in practitioner profile](../practitioners/geoffrey-huntley.md) |
| Loom | Huntley's experimental self-evolutionary software infrastructure | [Yes](../agent-harnesses/loom.md) |
| Ralph Wiggum Loop | The autonomous bash-loop coding pattern Huntley created | [Referenced in practitioner profile](../practitioners/geoffrey-huntley.md) |
