# Ex-Google PM Builds God's Eye to Monitor Iran in 4D

> **Bilawal Sidhu — YouTube, 2026-03-04**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=0p8o7AeHDzg |
| Speaker | Bilawal Sidhu — ex-Google Senior PM (XR & 3D Maps / ARCore / Immersive View), TED Tech Curator, 1.6M+ subscribers |
| Event | YouTube (Bilawal Sidhu channel) |
| Duration | ~25 min |
| Date | 2026-03-04 |
| Topics | OSINT, geospatial intelligence, 4D visualization, satellite tracking, ADS-B, AIS, GPS jamming, GEOINT, open-source intelligence, CesiumJS, LLM agents, agent swarm |

---

## Burak's Notes

> *This is a fascinating demonstration of what happens when an ex-Google Maps PM applies spatial computing expertise to open-source intelligence. The "agent swarm" he deployed to collect OSINT signals in real-time during Operation Epic Fury is directly relevant to our agent orchestration thesis — agents autonomously collecting, correlating, and synthesizing heterogeneous data streams. The core insight — "the intelligence monopoly is over" — mirrors our thesis about AI democratizing professional capabilities. WorldView is proof that a single builder with the right tools can replicate what used to require nation-state infrastructure. Low relevance to our code orchestration directly, but high signal for the broader agent-driven intelligence pattern and potential cross-domain applications.*

---

## Key Takeaways

1. **"The intelligence monopoly is over"** — Commercial satellite constellations (Maxar, Capella, ICEYE, Planet) now provide imagery that rivals classified reconnaissance capabilities. A single developer can fuse publicly available data into intelligence products that were previously exclusive to nation-state agencies.

2. **Agent swarms for real-time OSINT collection** — Sidhu deployed an "AI agent swarm" to capture open-source signals during Operation Epic Fury in real-time, producing a 4D reconstruction that correlated satellite passes, flight tracks, maritime AIS, and GPS jamming data across time and space. The agents collected and structured data autonomously.

3. **Temporal correlation reveals operational intent** — The real intelligence value is not in any single data source but in sequencing and correlating multiple feeds on a unified timeline. Pre-strike satellite positioning, mid-strike airspace closures, and post-strike damage assessment imagery become readable as an operational narrative when properly time-aligned.

4. **Browser-based geospatial visualization at scale** — WorldView runs entirely in a browser, integrating CesiumJS-style 3D globe rendering with multiple real-time data layers (satellite orbits, ADS-B flight tracks, AIS maritime data, GPS interference heatmaps, CCTV feeds, night vision/FLIR modes). This was built as a weekend prototype by a solo developer.

5. **Six years of domain expertise compressed into three days of building** — Sidhu credits his time at Google Maps (ARCore Geospatial API, Immersive View, 3D mapping at global scale) as the foundation that let him build WorldView in three days. Domain expertise + modern tooling = exponential leverage.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Not directly related to code orchestration, but the agent swarm pattern for autonomous data collection and the solo-builder-replaces-institution thesis align with our broader vision. Cross-domain reference for agent applications beyond software development. |
| **Actionable** | 3/10 | No directly transferable patterns for our code orchestrator. The multi-source data fusion concept is interesting for future intelligence/research agent modules. The "temporal correlation" pattern could apply to our observability and devlog systems. |

---

## Summary

Bilawal Sidhu, an ex-Google Senior Product Manager who spent six years on Google Maps (ARCore Geospatial API, Immersive View, 3D mapping at global scale), demonstrates WorldView — a browser-based "personal geospatial command center" he built as a weekend prototype. The system fuses publicly available open-source intelligence feeds onto a navigable 3D globe with temporal replay capabilities.

The video's centerpiece is a minute-by-minute 4D reconstruction of Operation Epic Fury — the US and Israeli military strikes on Iran. WorldView ingests four primary data layers: (1) satellite imagery from commercial and military constellations (Maxar, Capella, ICEYE, Gaofen, USA-234 Topaz, KH-11, BARS-M, Persona), tracking orbital passes over target zones; (2) ADS-B flight tracking showing commercial and military aviation, route diversions, and holding patterns; (3) maritime AIS data revealing tanker movements and course adjustments in the Strait of Hormuz; and (4) real-time GPS interference detection displayed as "red tiles" correlated with airspace closures.

Sidhu reveals that he deployed an "AI agent swarm" to capture these open-source signals in real-time during the operation. The reconstruction showed pre-strike satellite positioning by multiple nations (US, Russia, China), immediate post-strike damage assessment imagery, cascading airspace closures across Gulf nations, and maritime traffic halts. His key insight: "It's kind of insane how complete of a picture you can put together without proprietary data fusion just by taking advantage of the open-source intelligence that we all have access to."

The video sparked significant online discussion, reaching the Hacker News front page and generating concern about Sidhu's safety. Some viewers worried he was sharing "secrets of war," though everything shown uses publicly available data. Critics on Hacker News also noted the ethical tension of treating military strikes with "laughing enthusiasm." WorldView was announced as launching publicly in April 2026, positioning itself as a consumer-grade intelligence platform built on the same data streams used by government analysts.

---

## Notable Quotes

> "It's kind of insane how complete of a picture you can put together without proprietary data fusion just by taking advantage of the open-source intelligence that we all have access to."

> "Textbook behavior — you collect right before for targeting, you strike, then you collect again for battle damage assessment."

> "When open feeds are correlated across time and space and presented as an interactive timeline, the sequence of actions becomes plain enough to interpret operational intent."

> "The intelligence monopoly is over."

> "I built WorldView in three days. But I also spent six years at Google Maps."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.spatialintelligence.ai/p/the-intelligence-monopoly-is-over | Sidhu's Substack post with full technical breakdown of WorldView and the OSINT thesis | `/ingest-article` |
| https://www.spatialintelligence.ai/p/i-built-a-spy-satellite-simulator | Technical deep dive on building the satellite tracking simulator in browser | `/ingest-article` |
| https://bilawal.ai | Personal site with portfolio of spatial computing projects | Bookmark |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| WorldView | The 4D geospatial command center; browser-based OSINT platform | No — novel project, not a dev tool |
| Maxar WorldView Legion | Commercial satellite constellation providing high-res imagery | No — domain-specific |
| Capella Space | SAR (synthetic aperture radar) satellite constellation for cloud-penetrating imagery | No — domain-specific |
| ICEYE | Finnish SAR satellite company | No — domain-specific |
| CesiumJS | Likely underlying 3D globe rendering engine (industry standard) | No — consider if geospatial work needed |
| Google ARCore Geospatial API | Sidhu's previous work at Google; spatial anchor system | No — domain-specific |
| AI Agent Swarm | Used to collect OSINT signals in real-time; unspecified implementation | N/A — pattern, not named tool |

---

## Action Items

- [ ] Monitor WorldView public launch (April 2026) for potential integration patterns
- [ ] Study the "agent swarm for data collection" pattern as a reference for non-coding agent orchestration use cases
- [ ] Consider Sidhu's Substack "Map the World / Spatial Intelligence" as a recurring research source for geospatial + AI convergence
