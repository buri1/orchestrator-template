# Telegram Bot Course — Build an AI Assistant with Claude Code

> **Goda Go (Autonomee.ai), 2026**

| Field | Value |
|-------|-------|
| Source | https://autonomee.ai/telegram-bot-course/ |
| Author | Goda Go (Autonomee / 100K+ YouTube subscribers) |
| Publication | autonomee.ai |
| Date | 2026 |
| Topics | telegram bot, claude code, AI assistant, supabase, persistent memory, voice messaging, multi-agent, proactive AI, bun runtime |
| Format | Free-to-premium course (5 free lessons + full paid version) |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this course. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Claude Code as Telegram bot backend** -- The course teaches building a personal AI assistant accessible via Telegram messaging, using Claude Code as the reasoning engine. The pitch is "clone one repo, send one message, your AI agent is live in 30 minutes." This is a practical pattern for mobile-accessible agent interfaces outside the terminal.

2. **Supabase for persistent agent memory** -- Memory persistence is handled via Supabase, giving the bot cross-session recall. This is the same stack we use for OmniPort-HH and validates Supabase as a lightweight agent memory backend.

3. **Multi-agent architecture in a messaging context** -- The full course covers building specialized sub-agents (email, calendar, task management) coordinated through a single Telegram interface. This is orchestration through a chat UI rather than a terminal.

4. **Proactive AI patterns** -- The course covers agents that initiate contact (briefings, reminders, check-ins) rather than only responding to user messages. This is a qualitatively different interaction model from request-response agents.

5. **Voice-first interaction** -- Voice messaging and phone call functionality are covered, extending the agent interface beyond text. Voice-to-agent pipelines are an underexplored area in our research.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Tangential to core orchestrator research -- this is a consumer-facing bot tutorial, not an orchestration pattern. However, the Telegram-as-agent-interface pattern and Supabase memory backend are reusable ideas. |
| **Actionable** | 3/10 | No direct patterns to adopt for our tmux orchestrator. Potential value if we ever need a mobile/messaging interface to the orchestrator or want to expose agent capabilities through Telegram. |

---

## Summary

Autonomee.ai offers a structured course on building an AI-powered Telegram bot using Claude Code as the reasoning backbone and Supabase for persistent memory. The free tier covers basic setup (BotFather config, Bun runtime, Supabase integration, background service), while the full version extends into voice messaging, phone calls, proactive AI behaviors (scheduled briefings, reminders), tool integrations (email, calendar, task managers), and multi-agent coordination.

The target audience is Claude Code users who want mobile access to their AI assistant and prefer customization over no-code solutions. The infrastructure cost is modest: Claude Pro ($20/mo) or Claude Max ($100-200/mo) plus ~$5/mo VPS hosting for 24/7 operation.

The course creator, Goda Go, runs a 100K+ subscriber YouTube channel focused on AI productivity and is already catalogued in our general-interest section. The course represents a practical, tutorial-grade implementation of several patterns (persistent memory, multi-agent messaging, proactive AI) that are discussed more theoretically elsewhere in the research literature.

---

## Notable Quotes

> "Clone one repo. Send one message. Your AI agent is live in 30 minutes."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.youtube.com/@godago | Goda Go's YouTube channel with AI productivity tutorials -- already catalogued | Already in catalogue |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Core reasoning engine for the Telegram bot | Not explicitly catalogued as standalone tool |
| Supabase | Persistent memory backend for cross-session recall | Known from OmniPort-HH stack |
| Bun | JavaScript runtime used for the bot service | No |
| Telegram Bot API | Messaging interface for the AI assistant | No |

---

## Action Items

- [ ] Consider Telegram as a lightweight mobile interface for orchestrator status/control if mobile access is ever needed
- [ ] Note the Supabase persistent memory pattern as a validated approach for agent state across sessions
