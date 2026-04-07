# Lessons from Building Claude Code: Prompt Caching Is Everything

> **@trq212 — 2026-02-19**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/trq212/status/2024574133011673516) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-02-19 |
| Topics | prompt caching, context engineering, cache optimization, Claude Code internals, tool design, compaction, plan mode, defer_loading |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Prompt caching is a prefix match — design your entire system around this constraint** — The API caches everything from the start of the request up to each cache_control breakpoint. Order matters: static content first (system prompt, tools), then project-level (CLAUDE.md), then session-level, then messages. Any change anywhere in the prefix invalidates everything after it. Claude Code runs alerts on cache hit rate and declares SEVs if they're too low.

2. **Model state transitions via tools, not tool set changes** — Plan mode is implemented by keeping all tools present at all times and using EnterPlanMode/ExitPlanMode as tools themselves (not by swapping the tool set). Similarly, MCP tool proliferation is handled via `defer_loading` stubs rather than removing tools. This preserves the cached prefix while still controlling agent behavior.

3. **Cache-safe forking for compaction** — When compacting a conversation, Claude Code reuses the exact same system prompt, user context, and tool definitions as the parent conversation, appending only the compaction prompt as a new user message. This preserves cache hits on the parent's prefix. A "compaction buffer" is reserved in the context window for this purpose.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Direct from a Claude Code engineer. Covers the internal architecture of prompt caching that makes Claude Max subscription economics work. The 4-tier cache layout (system prompt > tools > CLAUDE.md > session > messages), plan mode as tools-not-tool-swap, defer_loading pattern, and cache-safe compaction forking are all directly applicable to our orchestrator harness design. The "don't switch models mid-session, use subagents instead" pattern validates our agent spawning approach. |

---

## Full Content

**Title:** Lessons from Building Claude Code: Prompt Caching Is Everything

**Engagement:** 159 replies, 604 reposts, 4.9K likes, 12K bookmarks, 1.9M views

The article covers six major sections on prompt caching lessons from building Claude Code:

### 1. Lay Out Your Prompt for Caching
Prompt caching works by prefix matching. The API caches everything from the start of the request up to each cache_control breakpoint. Order matters enormously — static content first, dynamic content last. Claude Code's layout:
1. **Static system prompt & Tools** (globally cached)
2. **CLAUDE.md** (cached within a project)
3. **Session context** (cached within a session)
4. **Conversation messages** (grows each turn)

This ordering is surprisingly fragile. Past cache-breaking incidents include: timestamps in the static system prompt, non-deterministic tool order shuffling, updating tool parameters (e.g., what agents the AgentTool can call).

### 2. Use Messages for Updates
When information becomes stale (e.g., time changes, user edits a file), don't update the system prompt — that breaks the cache. Instead, pass updated information via a `<system-reminder>` tag in the next user message or tool result.

### 3. Don't Change Models Mid-Session
Prompt caches are per-model. At 100K tokens into an Opus conversation, switching to Haiku for a simple question is actually more expensive because the entire cache must be rebuilt for Haiku. Solution: use subagents — Opus prepares a "handoff" message to another model. Claude Code does this with Explore agents that use Haiku.

### 4. Never Add or Remove Tools Mid-Session
Changing the tool set invalidates the cache for the entire conversation. Two design patterns address this:

**Plan Mode — Design Around the Cache:** Instead of swapping to read-only tools when entering plan mode, keep all tools present and use EnterPlanMode/ExitPlanMode as tools themselves. The model receives a system message explaining plan mode constraints. Bonus: the model can autonomously enter plan mode when it detects a hard problem.

**Tool Search — Defer Instead of Remove:** Instead of removing MCP tools, send lightweight stubs with `defer_loading: true`. The model discovers full tool schemas via a ToolSearch tool when needed. The cached prefix stays stable.

### 5. Forking Context — Compaction
Compaction (context window overflow handling) has unintuitive cache interactions. Naive implementation — separate API call with different system prompt and no tools — loses the entire cached prefix.

**Cache-Safe Forking:** Use the exact same system prompt, user context, system context, and tool definitions as the parent conversation. Prepend the parent's messages, then append the compaction prompt as a new user message. The API sees a nearly identical prefix and reuses the cache. A "compaction buffer" must be reserved for the summary output tokens.

### 6. Lessons Learned (Summary)
- Prompt caching is a prefix match. Design your entire system around this constraint.
- Use messages instead of system prompt changes for updates.
- Don't change tools or models mid-conversation. Use tools to model state transitions.
- Monitor cache hit rate like uptime. Alert on cache breaks and treat them as incidents.
- Fork operations must share the parent's prefix for cache hits.

---

## Notable Replies

> **@0xCaptainLevi (Levi)**: "The hidden lesson here is that agentic systems are fundamentally constrained by their economic structure, not just their capabilities. Cache optimization forces architectural decisions that sacrifice flexibility for cost efficiency. The defer_loading pattern is elegant but it..."
> *Key insight — frames prompt caching as an economic constraint that shapes architecture, not just an optimization. Validates our cost-aware design approach.*

> **@JiquanNgiam (Jiquan Ngiam)**: "I think this is why using the OAuth token with other agent harnesses isn't great - they do not do the same optimizations that Anthropic is doing (like figuring out all the compaction edge cases). My hunch is that those unoptimized harnesses cause cache misses, which end up..."
> *Important signal — third-party harnesses using Claude's API may not get the same cache efficiency as Claude Code itself. Relevant to our harness decision.*

> **@AccBalanced (b/acc, context platform engineer)**: "Echoes of the cool @ManusAI engineering blog about KV Cache vitality in context engineering. We've also focused on delivering abundance for KV Cache at scale, via 1000x more shared DRAM capacity, via a Context Platform."
> *Links to Manus AI's context engineering post and WEKA's Context Platform Engineering — infrastructure-level cache optimization.*

> **@umang (Umang Jaipuria)**: "Is the system-reminder message supported in the regular messages api too? Or is it only for CC / agents sdk?"
> *Practical question about whether the system-reminder pattern is available in the raw API — useful for our custom harness work.*

> **@herbiebradley (Herbie Bradley)**: "why do you describe Memory as per-project? shouldn't it be cross-Project or global?"
> *Good question about CLAUDE.md scoping — challenges the cache layout hierarchy.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/RLanceMartin/status/2024573404888911886 | Lance Martin's (LangChain) piece on prompt caching and Anthropic's auto-caching launch — directly referenced in the post | `/ingest-post` or `/ingest-article` |
| https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool | Official docs on Tool Search API — the defer_loading pattern described | Bookmark |
| https://platform.claude.com/docs/en/build-with-claude/compaction#prompt-caching | Official docs on API-level compaction — built from Claude Code learnings | Bookmark |
| https://manus.im | Manus AI context engineering blog referenced by @AccBalanced — KV Cache vitality | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The agent harness whose prompt caching architecture is discussed | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| EnterPlanMode / ExitPlanMode | Tools used to implement plan mode without cache-breaking tool swaps | No — internal Claude Code feature |
| defer_loading / ToolSearch | Pattern for MCP tool management without cache invalidation | No — internal Claude Code / API feature |
| Compaction API | API-level compaction built from Claude Code learnings | No — Anthropic API feature |
| Explore agents (Haiku) | Subagents using cheaper model for exploration tasks | No — internal Claude Code feature |
| Manus AI | Referenced in replies — context engineering / KV Cache blog | Yes — [Manus AI](../../agent-harnesses/manus-ai.md) |
