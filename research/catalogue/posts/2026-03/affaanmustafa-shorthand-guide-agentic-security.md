# The Shorthand Guide to Everything Agentic Security

> **@affaanmustafa (cogsec) — 2026-03-15**

| Field | Value |
|-------|-------|
| Source | [X Article](https://x.com/affaanmustafa/status/2033263813387223421) |
| Author | @affaanmustafa (Affaan Mustafa, aka cogsec) — Anthropic hackathon winner, creator of Everything Claude Code (68.8K stars) and AgentShield |
| Date | 2026-03-15 |
| Topics | agentic-security, agent-vulnerabilities, prompt-injection, MCP-security, sandboxing, CVE, AgentShield, defense-in-depth |
| Type | X Article (long-form) |

---

## Burak's Notes

> *This is essential reading for anyone running autonomous agents in production. Affaan documents real CVEs in Claude Code (CVE-2025-59536 for code execution before trust confirmation, CVE-2026-21852 for API key leakage) — these are the exact attack surfaces our orchestrator faces when spawning `--dangerously-skip-permissions` workers. The defense strategies (sandboxing, identity separation, tool restrictions, approval boundaries, kill switches) map directly to our tmux isolation model. AgentShield (180 stars, 102 rules) is his answer — we already noted it in the ECC entry but now it has a standalone repo and GitHub Action. The attack vectors via MCP servers, WhatsApp integrations, and GitHub PRs are particularly relevant since our agents interact with all of these. Priority: review our hook permissions and MCP server configs against AgentShield's 102 rules.*

---

## Key Takeaways

1. **Autonomous AI agents are now documented attack targets with real CVEs** — Claude Code specifically had CVE-2025-59536 (code execution before trust confirmation) and CVE-2026-21852 (API key leakage). These aren't theoretical; they're catalogued vulnerabilities with proof-of-concept exploits.
2. **Attack surfaces span the entire agent interaction chain** — WhatsApp integrations, email attachments, GitHub PRs, and MCP servers are all vectors. Any input channel an agent consumes is a prompt injection surface. Check Point Research (Feb 2026), Unit 42, and Microsoft AI all published independent findings.
3. **Defense must be infrastructure, not an afterthought** — The guide advocates treating agent security as a first-class infrastructure concern: sandboxing untrusted work in containers, requiring human approval for sensitive operations, maintaining strict identity separation, input sanitization, logging, kill switches, and memory management.
4. **AgentShield provides automated scanning** — 102 static analysis rules across 5 categories (secrets detection, permission auditing, hook analysis, MCP server security, agent config review), plus an optional 3-agent Opus adversarial audit mode. Ships as npm package (`ecc-agentshield`), GitHub Action, and standalone CLI.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses the security posture of autonomous agent systems like our orchestrator. The CVEs in Claude Code are relevant since we run `--dangerously-skip-permissions` workers. MCP server attack vectors apply to our tool infrastructure. Defense patterns (sandboxing, identity separation, kill switches) validate and extend our tmux isolation model. AgentShield's 102-rule scanner is immediately deployable as a CI gate. |

---

## Full Content

**@affaanmustafa (cogsec) — 2026-03-15 19:27 UTC:**

*[X Article: "The Shorthand Guide to Everything Agentic Security"]*

The article covers how autonomous AI agents have become attack targets, with specific real-world vulnerabilities documented:

**CVEs Documented:**
- CVE-2025-59536 — Claude Code allowed code execution before trust confirmation
- CVE-2026-21852 — Claude Code API key leakage vulnerability

**Attack Surfaces Identified:**
- WhatsApp integration vectors
- Email attachment processing
- GitHub PR-based prompt injection
- MCP server supply chain attacks

**Security Research Referenced:**
- Check Point Research disclosure (February 2026)
- Unit 42 indirect prompt injection findings
- Microsoft AI recommendation poisoning research

**Defense Strategies Recommended:**
- Sandboxing: run untrusted work in containers
- Identity separation: per-agent credentials, principle of least privilege
- Tool restrictions: whitelist over blacklist, scope per task
- Input sanitization: filter all agent-consumed inputs
- Approval boundaries: human-in-loop for sensitive operations
- Logging: comprehensive audit trail for all agent actions
- Kill switches: hard stops for runaway agents
- Memory management: prevent context poisoning across sessions

**Tool: AgentShield** (github.com/affaan-m/agentshield) — open-source scanner for detecting suspicious hooks, prompt injection patterns, risky MCP configurations, hardcoded secrets, and permission misconfigurations.

**Engagement:** 10 replies, 23 retweets, 151 likes, 322 bookmarks, 35,616 views

*322 bookmarks on 151 likes = 2.13:1 bookmark-to-like ratio — extremely high practitioner reference signal, indicating save-for-later behavior typical of security-critical content.*

---

## Notable Replies

[Replies not fully accessible via API — 10 replies noted but individual content not available.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/affaan-m/agentshield | Standalone security scanner (180 stars, 102 rules, 912 tests, GitHub Action, MiniClaw sandbox runtime); deserves full tool catalogue entry | `/tool-catalogue` |
| CVE-2025-59536 | Claude Code code execution before trust confirmation — need full CVE details | Manual research |
| CVE-2026-21852 | Claude Code API key leakage — need full CVE details | Manual research |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| AgentShield | Primary defense tool recommended; 102 rules, Opus adversarial audit mode | Mentioned in [ECC entry](../../agent-harnesses/everything-claude-code.md); standalone repo not yet catalogued |
| Everything Claude Code (ECC) | Parent project; AgentShield ships as `ecc-agentshield` npm package | Yes — [everything-claude-code.md](../../agent-harnesses/everything-claude-code.md) |
| Claude Code | Subject of two CVEs (CVE-2025-59536, CVE-2026-21852) | Yes — referenced throughout catalogue |
| MCP | Attack surface via server supply chain | Yes — referenced in multiple entries |
| MiniClaw | Sandboxed agent runtime within AgentShield | Not yet catalogued (component of AgentShield) |
