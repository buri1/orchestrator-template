# Telegram Bot Course: AI Second Brain with Claude Code

> **autonomee.ai — 2026**

| Field | Value |
|-------|-------|
| Source | [autonomee.ai/telegram-bot-course](https://autonomee.ai/telegram-bot-course/) |
| Author | autonomee.ai |
| Date | 2026 (exact date unknown) |
| Topics | claude-code, multi-agent, telegram, VPS deployment, mobile access |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Claude Code as always-on Telegram bot** — Deploy Claude Code on a VPS ($5/mo) with Telegram as the mobile interface. 24/7 operation independent of laptop. Voice call interaction + real-time progress monitoring with approve/reject mid-task.
2. **6-agent multi-agent architecture** — Specialized agents for different task types, with persistent memory via Supabase and proactive outreach (morning briefings, reminders, check-ins).
3. **Minimal infrastructure stack** — Bun runtime + Telegram API + Supabase + VPS. Total cost ~$25/mo (Claude Pro $20 + VPS $5). Free tier available for Telegram and Supabase.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Direct validation of Claude Code as always-on agent via messaging interface. The 6-agent architecture and VPS deployment pattern are relevant to our autonomous agent vision. Telegram as control plane for agents is a pattern worth studying. |
| **Novelty** | 5/10 | VPS + Claude Code is known pattern (Emanuel's flywheel). Telegram as interface is the novel element. |
| **Actionable** | 6/10 | Could adapt the Telegram interface pattern for our agent monitoring. The approve/reject mid-task flow is interesting for human-in-the-loop orchestration. |

---

## Summary

A step-by-step course teaching how to build an "AI Second Brain" — a Claude Code-powered Telegram bot that runs 24/7 on a VPS. The system features:

- **Voice interaction** via phone calls to the bot
- **Real-time progress monitoring** with ability to approve/reject actions mid-task
- **Persistent memory** across conversations (Supabase)
- **Proactive outreach** — morning briefings, reminders, check-ins
- **Multi-agent system** with 6 specialized agents
- **Tool integrations** — email, calendar, photo storage

### Tech Stack
- Claude Code (AI engine)
- Bun (runtime)
- Telegram API (interface)
- Supabase (persistent memory/database)
- VPS hosting (~$5/mo for production)

### Cost Structure
- Claude Pro: $20/mo (or Max $100-200/mo)
- VPS: ~$5/mo
- Telegram + Supabase: Free

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Core AI engine | Yes (extensively) |
| Supabase | Persistent memory layer | No — consider for infrastructure/ |
| Telegram API | Mobile interface | No — messaging platform, not agent tool |
| Bun | Runtime | No — JS runtime, not agent-specific |
