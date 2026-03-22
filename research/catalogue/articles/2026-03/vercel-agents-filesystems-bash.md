# How to Build Agents with Filesystems and Bash

> **Ashka Stephen — Vercel Engineering Blog, January 9, 2026**

| Field | Value |
|-------|-------|
| Source | https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash |
| Author | Ashka Stephen (Vercel) |
| Publication | Vercel Engineering Blog |
| Date | 2026-01-09 |
| Topics | filesystem-agents, bash-tools, agent-architecture, cost-reduction, sandbox-isolation, grep, find, cat, context-management |
| Read Time | 6 min |

---

## Burak's Notes

> *This is the companion deep-dive to the embeddings article we already ingested. Where that one argued "filesystem beats embeddings," this one is the HOW — concrete directory structures, bash command patterns, sandbox trust models. The 75% cost reduction number appears in both articles because this is the original source (sales call agent on Opus 4.5). The thesis "LLMs have seen these tools billions of times during training — they're native operations" is the empirical validation for why our orchestrator's grep/find/cat approach works. The "no custom retrieval logic — the agent decides what context it needs" principle is exactly our agent spawning model. Most actionable insight: structure domain data AS a filesystem hierarchy rather than building retrieval pipelines. We already do this with the knowledge catalogue.*

---

## Key Takeaways

1. **The best agent architecture is already in your terminal** — Rather than building custom agent tooling, replace it with filesystem operations and bash commands. LLMs have seen these tools billions of times during training — they are native operations, not learned abstractions.

2. **Filesystem structure IS the retrieval system** — Structure domain data as directory hierarchies that mirror the domain (customers/tickets/conversations). The agent explores with `ls`, searches with `grep`, reads with `cat`. No vector DB, no chunking pipeline, no embedding model. Instead of building retrieval pipelines for each data type, you write files to a directory structure.

3. **75% cost reduction with better output** — Sales call summarization agent on Claude Opus 4.5 went from ~$1.00 to ~$0.25 per call. Context stays minimal because agents load files on demand — large transcripts never enter the prompt upfront. The same approach removed 80% of tools from Vercel's d0 text-to-SQL agent.

4. **Sandbox isolation is the trust model** — Agent reasoning is trusted, but execution is isolated. The sandbox permits filesystem exploration without production system access. When agents fail, the execution path is visible — showing exact files read and commands executed. Debuggability is a first-class property.

5. **Every improvement in code understanding transfers directly** — Because LLMs are continuously improving at code tasks, filesystem-based agents automatically get better over time. You're leveraging the training distribution, not fighting it.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates our orchestrator's core architecture: agents navigate codebases via grep/find/cat, state lives in files (JSON, JSONL, markdown), no vector stores anywhere. The directory-as-domain-model pattern is exactly how our knowledge catalogue, ingest pipeline, and orchestrator state work. |
| **Actionable** | 8/10 | Three immediate patterns: (1) structure MORE domain data as filesystem hierarchies (client project data, meeting notes, research); (2) explicitly document directory conventions so agents explore more efficiently; (3) adopt the sandbox isolation principle for untrusted agent execution. |

---

## Summary

Ashka Stephen from Vercel argues that the most effective agent architecture leverages what LLMs already know — filesystem navigation and bash commands — rather than building custom retrieval mechanisms. The core insight is that LLMs have been trained on massive codebases and inherently understand how to explore directories, search content, and compose Unix tools. This makes filesystem operations "native" to the model in a way that custom tools are not.

The article presents three concrete architecture patterns. First, a customer support system where customer data lives in a natural hierarchy (`/customers/cust_12345/tickets/`, `/conversations/`, `preferences.json`) — agents explore with `ls`, search with `grep -i "concern|worried|issue"`, and read relevant files with `cat`. Second, a document analysis system separating raw inputs from processed outputs (`/uploaded/`, `/extracted/`, `/analysis/`) where agents reference previous analysis without reprocessing. Third, a production sales call summary agent that combines Gong transcripts, Salesforce CRM data, Slack history, and competitive intel — all as files in a structured directory.

The operational flow is: agent receives task, explores filesystem (ls, find), searches content (grep, cat), sends minimal context + request to LLM, returns structured output. This contrasts with prompt stuffing (hits token limits) and vector search (imprecise for structured data). Key advantages: structure matches domain naturally (hierarchies map to directories), retrieval is precise (grep returns exact matches, not similarity scores), and context remains minimal (files loaded on demand).

The cost impact is significant: their sales call summarization agent on Claude Opus 4.5 dropped from $1.00 to $0.25 per call (75% reduction) with improved output quality. The same approach removed 80% of custom tools from Vercel's d0 text-to-SQL agent. The security model is sandbox-based: trust the agent's reasoning, but isolate execution. When agents fail, you see exactly what files were read and what commands ran — full auditability.

The article concludes with what may be its most provocative claim: "The future of agents might be surprisingly simple. Maybe the best architecture is almost no architecture."

---

## Notable Quotes

> "The best agent architecture is already sitting in your terminal."

> "We replaced most of the custom tooling in our internal agents with a filesystem tool and a bash tool."

> "If agents excel at filesystem operations for code, they'll excel at filesystem operations for anything."

> "LLMs have seen these tools billions of times during training. They're native operations."

> "Every improvement in code understanding translates directly. You're leveraging the training distribution."

> "No custom retrieval logic. The agent decides what context it needs using tools it already knows."

> "grep -r 'pricing objection' transcripts/ returns exact matches. When you need one specific value, you get that value."

> "When the agent fails, you see exactly what files it read and what commands it ran."

> "Instead of building retrieval pipelines for each data type, you write files to a directory structure."

> "The future of agents might be surprisingly simple. Maybe the best architecture is almost no architecture."

---

## Architecture Patterns

### Pattern 1: Customer Support Filesystem

```
/customers/
  /cust_12345/
    profile.json
    tickets/
      ticket_001.md
      ticket_002.md
    conversations/
      2024-01-15.txt
    preferences.json
```

Agent flow: `ls tickets/` → `grep "resolved" tickets/*.md` → `cat ticket_002.md`

### Pattern 2: Document Analysis Pipeline

```
/documents/
  /uploaded/       # Raw inputs
  /extracted/      # Processed text
  /analysis/       # Structured output (summary.md, key_terms.json, risk_assessment.md)
/templates/
  contract_analysis_prompt.md
  invoice_validation_rules.md
```

Separation of raw inputs from processed outputs. Agents reference previous analysis without reprocessing.

### Pattern 3: Sales Call Summary Agent (Production)

```
gong-calls/
  demo-call-001-companyname-product-demo.md
  metadata.json
  previous-calls/
salesforce/
  account.md
  opportunity.md
  contacts.md
slack/
  slack-channel.md
research/
  company-research.md
  competitive-intel.md
playbooks/
  sales-playbook.md
```

Agent exploration: `ls sales-calls/` → `cat metadata.json` → `grep -i "concern|worried|issue|problem" sales-calls/*.md`

### Bash Command Patterns

| Command | Purpose |
|---------|---------|
| `ls` | Directory exploration, discover available data |
| `find` | Locate files across the hierarchy |
| `grep` | Pattern search (exact match, not similarity) |
| `grep -r` | Recursive search across directories |
| `grep -i` | Case-insensitive search |
| `cat` | Read file contents on demand |
| `awk` | Text processing and transformation |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://vercel.com/templates/ai/call-summary-agent | Production template implementing the sales call agent pattern | Bookmark |
| https://www.npmjs.com/package/bash-tool | Vercel's bash-tool npm package for filesystem-based agent context | Bookmark |
| https://ai-sdk.dev/docs/introduction | AI SDK powering the tool execution layer | Bookmark |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Opus 4.5 | Model used in cost analysis ($1.00 → $0.25/call) | N/A (model) |
| AI SDK | Tool execution and model call framework | No |
| bash-tool (npm) | Dedicated npm package for filesystem-based context retrieval | No |
| d0 | Vercel's internal text-to-SQL agent (80% tool reduction) | No |
| Gong | Source of sales call transcripts in production case study | No |
| Sales Call Summary Template | Production Vercel template demonstrating the pattern | No |

---

## Companion Article

This article is the technical deep-dive companion to [Build Knowledge Agents Without Embeddings](./vercel-knowledge-agents-without-embeddings.md) (already in catalogue). That article focuses on the WHY (filesystem vs embeddings argument + multi-platform deployment via Chat SDK). This one focuses on the HOW (concrete directory structures, bash patterns, sandbox design, cost data).

---

## Action Items

- [ ] Document our directory conventions explicitly so agents explore more efficiently (CLAUDE.md additions)
- [ ] Structure client project data as filesystem hierarchies (meeting notes, deliverables, research — not flat folders)
- [ ] Evaluate sandbox isolation patterns for untrusted agent execution in tmux workers
- [ ] Reference this article in our architecture docs as external validation of the grep/find/cat approach
