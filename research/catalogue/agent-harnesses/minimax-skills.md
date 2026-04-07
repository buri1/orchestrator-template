# MiniMax Skills

> **Development skills for AI coding agents. Plug into your favorite AI coding tool and get structured, production-quality guidance for frontend, fullstack, Android, iOS, and shader development.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills) |
| GitHub Stars | 747 (as of 2026-03-22) |
| Publisher | MiniMax-AI (organization) — Chinese AI company; MiniMax API for image/video/audio/music/TTS |
| License | MIT |
| Tech Stack | Python (84.8%), HTML, Shell, JavaScript; React, Next.js, Tailwind CSS, Jetpack Compose, SwiftUI |
| Maturity | 🟡 Beta (active development; 30 forks; MIT licensed) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *MiniMax's skills repo is interesting as a cross-platform skills marketplace — same skills work in Claude Code, Cursor, Codex, and OpenCode. The skill variety is broader than most: frontend, fullstack, Android, iOS, shader dev, plus media generation (GIF, PDF, PPTX, XLSX, DOCX). The MiniMax API integration for media generation is the unique differentiator — most skill repos are code-only.*
>
> *At 747 stars, this is mid-tier. Compare to OpenAI Skills (13.5K stars) and VoltAgent/awesome-agent-skills. The 10-skill count is modest but well-structured. The shader-dev skill (GLSL ray marching, particle systems, procedural generation) is unusual and niche.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Skills architecture is interesting but we already have our own skill system; MiniMax API integrations not needed for our stack; cross-platform compatibility pattern is worth noting |
| **Novelty** | 5/10 | Multi-platform skill distribution (CC+Cursor+Codex+OpenCode) seen in ECC and phuryn/pm-skills; media generation skills via MiniMax API is novel |
| **Actionable** | 4/10 | Could study skill packaging format for cross-harness compatibility; shader-dev and media generation skills not relevant to our work |

---

## Overview

MiniMax Skills is a collection of 10 development skills designed for AI coding agents, published by MiniMax-AI. The skills span frontend development (React/Next.js with Framer Motion/GSAP), fullstack (REST APIs, auth, real-time), native mobile (Android Kotlin/Jetpack Compose, iOS UIKit/SwiftUI), shader programming (GLSL), and document/media generation (GIF, PDF, PPTX, XLSX, DOCX via MiniMax APIs).

The skills install as plugins across Claude Code, Cursor, Codex, and OpenCode — making this one of the few truly cross-platform skill repositories. Each skill provides structured workflows and best practices rather than code templates.

---

## What's Valuable for Us

- Cross-platform skill distribution pattern (same skill works across 4+ agent harnesses)
- MiniMax API integration pattern for media generation (if we ever need automated content creation)

---

## What's NOT Relevant

- Specific skill content (frontend, mobile, shader) doesn't align with our orchestration focus
- MiniMax API dependency adds external service requirement
- At 747 stars, community traction is moderate

---

## Key Takeaway

> **MiniMax Skills demonstrates cross-platform skill distribution across 4 agent harnesses with media generation via MiniMax APIs, but the content focus (frontend/mobile/shader/documents) is tangential to our orchestration needs.**
