# Frontier AI and the Future of Intelligence

> **Raia Hadsell (VP of Research, Google DeepMind) — AI Engineer Europe 2026 (London), 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=2538s |
| Speaker | Raia Hadsell, VP of Research, Google DeepMind |
| Event | AI Engineer Europe 2026 (London) |
| Duration | ~24:00 |
| Date | 2026-04-09 |
| Topics | frontier research, omnimodal embeddings, Matryoshka Representation Learning, weather prediction, graph neural networks, probabilistic forecasting, world models, Genie 3, responsible AI, DeepMind |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Find root nodes, not leaves** — Hadsell's guiding research philosophy: resist the pull of the flashiest leaf problems and hunt for the deepest upstream problems whose solutions unlock many downstream capabilities. Embeddings, weather, and world models are each framed as "root node" bets for DeepMind — not the loudest trends, but the ones with the biggest downstream blast radius.

2. **Gemini Embeddings 2 collapses modalities into one semantic space** — Inspired by the neuroscience "Jennifer Aniston cells" (a small cluster of neurons firing for a concept regardless of input modality), Embeddings 2 is fully omnimodal: one vector represents 8K tokens of text, 128s of video, 80s of audio, or a full PDF. No cross-modal mapping loss; retrieval works SoTA across modalities against a single index.

3. **Matryoshka Representation Learning (MRL) makes embeddings elastic** — Same network serves multiple dimensionalities, starting at 256 dims and expanding. You pick the budget at inference time; nested representations mean small embeddings are prefixes of larger ones. Retrieval systems can trade accuracy for latency/cost without retraining.

4. **"Sometimes generate, sometimes retrieve"** — Hadsell explicitly frames high-quality embeddings as the critical companion to generative AI. Retrieval is not a crutch replaced by bigger context windows; it is the other half of the system. This is a DeepMind endorsement of RAG-plus-generation hybrids at the frontier.

5. **Weather went from physics simulation to neural prediction in three iterations** — GraphCast (spherical GNN, 100 atmospheric variables, 15-day horizon) → GenCast (probabilistic, 97% more accurate than 1300 gold-standard benchmarks, 15-day forecast in 8 minutes on a single chip vs. hours on a supercomputer) → FGN (Functional Generative Network, directly predicts cyclones — trajectory, wind speed, eye formation — rather than post-processing a generic weather field). Used by the US National Hurricane Center. Hurricane Lee (2024) landfall predicted accurately 9 days out vs. 6 days for physics-based models.

6. **Genie 3 is the first photorealistic, real-time, memory-persistent world model** — Text prompt → interactive 3D world you can walk through. Crucially it has **memory**: objects stay where you left them, you can walk away and come back. Can be re-prompted live ("Camden Canal London" → mid-experience world change). Available to Gemini Ultra subscribers. Framed as the substrate for a new form of gaming (adversarial prompting) and immersive education ("go into a world to learn about it").

7. **Humans co-evolve with the technology** — Hadsell's closing frame: "We're all on this journey together — humans change as well as technology." Responsible AI isn't just a safety overlay; it's an acknowledgement that the deployment environment is a moving target because the humans in the loop adapt.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Foundational frontier research, not agent orchestration. No direct overlap with tmux workers, worktree isolation, PR loops, or harness engineering. The tangential relevance is real but modest: (a) omnimodal embeddings + MRL could eventually upgrade our retrieval layer for catalogue search and devlog recall; (b) Genie 3 is a long-shot substrate for agent simulation/training environments; (c) "root node vs leaves" is a useful research-prioritization heuristic for our own catalogue curation. Not a talk to steal patterns from. |
| **Novelty** | 8/10 | Three genuinely new announcements in one talk: Embeddings 2 with MRL + omnimodal unified space, FGN as a direct cyclone predictor (not a post-processor), and Genie 3 with persistent memory. Each is a meaningful step beyond the prior generation. Novelty is high even if direct actionability for us is low. |
| **Actionable** | 2/10 | Almost nothing to port into our orchestrator directly. Possible actions: (1) evaluate Gemini Embeddings 2 as a retrieval backend when it becomes available via API; (2) note MRL as a general pattern for elastic embeddings if we ever build our own; (3) adopt the "root node vs leaves" framing in our research librarian prompt. That's about it. |

---

## Summary

Raia Hadsell — VP of Research at Google DeepMind, 13-year DeepMind veteran (joined when the lab was ~30-40 people), former Yann LeCun PhD student at NYU (Siamese networks, contrastive loss), UK AI Ambassador, and a philosophy-of-religion undergrad turned ML researcher — opened AI Engineer Europe 2026 with a survey of three "root node" research directions at DeepMind that sit outside the language-model spotlight. Her framing throughout: "Build AI responsibly for the benefit of humanity. Find root nodes. Don't waste time on leaves. Find the deepest problems."

**Area 1 — Gemini Embeddings 2.** DeepMind's latest embedding model is fully omnimodal: a single unified semantic space where one vector can represent 8K tokens of text, 128 seconds of video, 80 seconds of audio, or a complete PDF. The neuroscience inspiration is the so-called "Jennifer Aniston cell" — a small cluster of neurons in the human brain that fires for a concept regardless of whether you see a photo, read the name, or hear it spoken. Embeddings 2 aims at the same property in silico. Rather than training separate encoders and then mapping between them (which loses information), everything lives in one space from the start. The training technique is **Matryoshka Representation Learning (MRL)**: the same network produces nested embeddings of varying dimensionality, starting at 256 dims and expanding. Smaller embeddings are prefixes of larger ones, so applications can trade accuracy for latency/cost at inference time without retraining. Hadsell positioned embeddings as the essential companion to generative AI: "Sometimes generate, sometimes retrieve." This is a clear signal that DeepMind sees high-quality retrieval as co-equal with generation at the frontier, not as a transitional hack.

**Area 2 — Weather prediction.** DeepMind's weather work has shipped three systems in rapid succession. **GraphCast** is a spherical graph neural network predicting the full atmospheric state up to 15 days out across 100 variables. In the Hurricane Lee 2024 case, GraphCast called the landfall accurately 9 days in advance versus 6 days for the best physics-based models. **GenCast** made the system probabilistic — weather is chaotic, so a distribution is more honest than a point estimate — and achieved 97% higher accuracy than 1300 gold-standard benchmarks while producing a 15-day forecast in 8 minutes on a single chip versus hours on a traditional supercomputer. **FGN (Functional Generative Network)** goes a step further: rather than forecasting a generic weather field and then post-processing to extract cyclone information, FGN directly predicts cyclones, including categorization, trajectory, wind speed, and eye formation. The US National Hurricane Center is now using FGN in its operational workflow.

**Area 3 — World models (Genie series).** Hadsell walked through the progression. **Genie 1** generated basic 2D platformer environments from a text prompt, lasting a few seconds, loosely responsive to keyboard input. **Genie 2** moved to 3D environments that were interactive but not real-time and visibly lower quality. **Genie 3** is the inflection: real-time, interactive, photorealistic 3D worlds generated from a text prompt, with two properties that make it feel qualitatively different. First, **persistent memory** — you can walk away from an object or a scene, come back, and everything is where you left it. Second, **live re-prompting** — you can inject a new prompt mid-experience ("Camden Canal London") and the world transforms around you without losing coherence. Genie 3 is available to Gemini Ultra subscribers. Hadsell sketched two early application directions: a new form of gaming organized around adversarial prompting rather than scripted content, and immersive education where a student literally walks into a simulated world to learn about it.

**Closing.** Hadsell previewed that her DeepMind colleague Omar would present Gemma 4 the following morning, and closed on the co-evolution theme: "We're all on this journey together — humans change as well as technology."

---

## Notable Quotes

> "Build AI responsibly for the benefit of humanity." — stated as DeepMind's north star throughout the talk

> "Find root nodes. Don't waste time on leaves. Find the deepest problems."

> "Sometimes generate, sometimes retrieve." — on why embeddings are the critical companion to generative AI

> "These environments are not only diverse and interactive, high quality, they also have memory." — on Genie 3

> "We're all on this journey together — humans change as well as technology." — closing

---

## Relevance for Orchestrator Research

This is foundational AI research, not agent orchestration. There is **no direct transfer** to our tmux-based L-Thread orchestrator, worktree isolation, worker lifecycle management, or PR review loops. The talk is ingested here for three tangential reasons:

1. **Retrieval upgrade path.** If/when Gemini Embeddings 2 is available via API, it becomes a candidate backend for our catalogue search, devlog recall, and research librarian memory. The omnimodal property would let us index talk audio, screenshot evidence, and text notes in one space.
2. **World models as future agent substrate.** Genie 3's persistent-memory interactive worlds are a long-shot but interesting simulation environment for training or evaluating agents that have to navigate UIs, 3D spaces, or physical-world proxies. Filed as "watch, don't build."
3. **"Root nodes not leaves" as a curation heuristic.** The research librarian currently catalogues breadth-first. Hadsell's framing is a useful prompt-level addition: when adding new entries, explicitly mark whether a tool/post is a root (many downstream dependencies) or a leaf (single isolated capability).

Not a pattern source. Not a tool to adopt. A signal to track.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://deepmind.google/technologies/gemini/embeddings/ | Official Gemini Embeddings product page; API access, pricing, MRL dimensionality options | `/ingest-article` |
| https://arxiv.org/abs/2205.13147 | Matryoshka Representation Learning paper (Kusupati et al.) — technical foundation for elastic embeddings | `/ingest-article` |
| https://deepmind.google/discover/blog/graphcast-ai-model-for-faster-and-more-accurate-global-weather-forecasting/ | GraphCast announcement + paper links | `/ingest-article` |
| https://deepmind.google/discover/blog/gencast-predicts-weather-and-the-risks-of-extreme-conditions-with-sota-accuracy/ | GenCast probabilistic weather model announcement | `/ingest-article` |
| https://deepmind.google/discover/blog/genie-3-a-new-frontier-for-world-models/ | Genie 3 announcement page and capability demos | `/ingest-article` |
| https://arxiv.org/abs/2402.15391 | Genie paper (foundation world models) — original Genie architecture | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Gemini Embeddings 2 | Omnimodal unified semantic space with MRL | No |
| Matryoshka Representation Learning (MRL) | Elastic-dimension embeddings technique | No |
| GraphCast | Spherical GNN weather model, 15-day horizon | No |
| GenCast | Probabilistic weather successor to GraphCast | No |
| FGN (Functional Generative Network) | Direct cyclone predictor used by US NHC | No |
| Genie 1 / Genie 2 / Genie 3 | World-model progression; Genie 3 real-time photorealistic with memory | No |
| Gemini Ultra | Subscription tier with Genie 3 access | Partial (Gemini referenced elsewhere) |
| Gemma 4 | Previewed for next-day talk by Omar (DeepMind) | No |
| Jennifer Aniston cells | Neuroscience inspiration for unified modality embeddings | No (reference) |

---

## Action Items

- [ ] When Gemini Embeddings 2 ships a public API, evaluate as retrieval backend for the catalogue search and devlog recall paths
- [ ] Add "root node vs leaf" tag to the research-librarian ingest template so new entries self-classify
- [ ] Track Genie 3 API availability — long-shot candidate as an agent simulation substrate
- [ ] Ingest the MRL paper separately if/when we build our own embedding pipeline
