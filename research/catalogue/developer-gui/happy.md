# Happy

> **Mobile and Web client for Codex and Claude Code, with realtime voice, encryption and fully featured.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI |
| Repository | [slopus/happy](https://github.com/slopus/happy) |
| GitHub Stars | 15,929 (as of 2026-03-22) |
| Publisher | slopus (solo/startup) |
| License | MIT |
| Tech Stack | TypeScript |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *Mobile client for Claude Code and Codex with 16K stars. Interesting for the mobile-first agent interaction pattern — voice input, encryption, and full-featured control from a phone. Could be useful for monitoring orchestrator agents on the go, but we primarily work from the desktop.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Mobile agent control is nice-to-have, not critical path |
| **Novelty** | 6/10 | Mobile-first agent client with voice is a unique angle |
| **Actionable** | 3/10 | No immediate adoption path — we use terminal-based workflows |

---

## Overview

Happy is a mobile and web client that provides a rich interface for interacting with Codex and Claude Code. It features realtime voice input, end-to-end encryption, and full access to agent capabilities from mobile devices. The TypeScript-based application supports both iOS and Android through a web-based approach.

The project has gained significant traction (16K stars) by addressing a gap in the agent tooling ecosystem — most coding agents are terminal-only, making it impossible to monitor or interact with them from mobile devices.

---

## What's Valuable for Us

- **Mobile monitoring pattern**: Could inform how we expose orchestrator status to mobile
- **Voice interaction model**: Interesting for hands-free agent supervision
- **Encryption approach**: Relevant for DSGVO-compliant remote agent access

---

## What's NOT Relevant

- **Mobile-first paradigm**: Our workflow is desktop terminal-based
- **Web client overhead**: We prefer native terminal (cmux) over web interfaces

---

## Key Takeaway

> **Mobile-first Claude Code/Codex client (16K stars) with voice and encryption — monitor for the mobile agent supervision pattern, but no immediate adoption needed.**
