# Human Archive AI

> **Archiving the world for embodied intelligence.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Website | https://www.humanarchive.ai/ |
| GitHub Stars | N/A (closed-source, data-as-a-service) |
| Publisher | Human Archive AI — startup (YC-backed) |
| License | Proprietary / Data-as-a-Service |
| Tech Stack | Multimodal capture rigs (stereo depth, IMU, tactile gloves, hand tracking), custom annotation pipeline |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *Embodied AI data collection at scale — 50K+ contributors, 1K+ custom rigs, 125+ national partnerships. YC + Berkeley + Stanford backed. Entirely outside our software orchestration domain but could become relevant if we ever build physical-world agent systems or need training data for manipulation/navigation tasks. The "data moat" business model (collect hard-to-get real-world data, sell to robotics labs) is a proven pattern. Contact is via form only — no public API, no self-serve, no pricing.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Embodied AI training data has zero overlap with software agent orchestration |
| **Novelty** | 6/10 | Interesting scale of physical-world data capture (50K contributors, 7 modalities, 8 industries) |
| **Actionable** | 1/10 | Nothing we can use — proprietary, closed, different domain entirely |

---

## Overview

Human Archive AI is a Y Combinator-backed startup focused on collecting multimodal egocentric data for embodied AI and robotics training. Their mission is to "archive the world for embodied intelligence" — essentially building the training datasets that robotics and embodied AI companies need to teach machines how to interact with physical environments.

The platform operates a contributor network of 50,000+ people equipped with 1,000+ custom capture rigs that record synchronized multimodal data across homes, hotels, industrial facilities, restaurants, retail spaces, horticulture operations, transportation systems, and construction sites. The data capture includes seven modalities: synchronized egocentric video, 3D pose estimation, real-time hand tracking, stereo depth mapping, action annotation/labeling, glove-based tactile sensing, and object/scene segmentation.

The business model appears to be data-as-a-service: organizations submit requirements via a contact form, and Human Archive collects and delivers custom datasets. No pricing, API, or self-serve access is publicly available.

---

## Technical Architecture

Seven capture modalities delivered through custom rigs:

1. **Multimodal Egocentric Capture** — Synchronized first-person video from contributor-worn devices
2. **3D Pose Estimation** — Full-body skeletal tracking and visualization
3. **Hand Tracking** — Real-time finger and hand motion capture
4. **Stereo Depth** — Dense depth maps from stereo camera pairs
5. **Annotation** — Human-labeled action annotations for video segments
6. **Tactile Sensing** — Glove-based pressure/texture data during manipulation tasks
7. **Segmentation** — Object and scene segmentation masks

Target industries: homes/hotels, industrial, restaurants/retail, horticulture, transportation, construction.

Scale: 50,000+ contributors, 125+ national partnerships, 1,000+ custom rigs.

---

## Publisher Background

Backed by Y Combinator, UC Berkeley, and Stanford University. No founding team names, funding amounts, or specific cohort information are publicly disclosed on the website. Contact is via form (team@humanarchive.ai) or Cal.com scheduling link. Social presence on LinkedIn and X (Twitter).

---

## What's Valuable for Us

Nothing directly applicable. Our system is a software agent orchestrator for coding, business automation, and SaaS delivery. Human Archive operates in the physical-world data collection space for robotics/embodied AI.

The only conceptual parallel is the **contributor network model** — coordinating 50K+ distributed workers to collect structured data is itself an orchestration problem, though they solve it with hardware rigs and field logistics rather than software agents.

---

## What's NOT Relevant

- **Embodied AI focus** — We build software agents, not robots
- **Physical data collection** — No overlap with code generation, business automation, or SaaS delivery
- **Closed platform** — No API, no SDK, no open-source components to study or adapt
- **Custom hardware** — Capture rigs are proprietary, not software-composable

---

## Future Use Cases

- **Phase 4+ (hypothetical)**: If we ever expand into physical-world agent systems (IoT automation, warehouse robotics, smart home agents), embodied AI training data becomes relevant. Human Archive would be a potential data vendor.
- **Cross-domain signal**: The WiFi CSI sensing entry (ESP-CSI) in our catalogue is the closest physical-world pattern. If physical-world awareness becomes an agent capability, datasets like these become training infrastructure.

---

## Key Takeaway

> **Human Archive AI is a YC-backed embodied AI data company collecting multimodal physical-world data at scale (50K contributors, 7 modalities, 8 industries) — interesting as a market signal for the embodied AI data economy, but entirely outside our software orchestration domain.**
