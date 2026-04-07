# JetBrains Air

> **Agentic development environment built on 26 years of JetBrains IDE experience — multi-agent task orchestration with Codex, Claude Agent, Gemini CLI, and Junie running concurrently.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Homepage | [air.dev](https://air.dev/) |
| Blog | [JetBrains Air Blog](https://blog.jetbrains.com/air/) |
| Publisher | JetBrains s.r.o. — Czech Republic HQ, 2,300+ employees, creators of IntelliJ IDEA, PyCharm, GoLand, Fleet (abandoned), Kotlin, Compose Multiplatform; publicly traded (NASDAQ-listed parent); 26 years of IDE development |
| License | Proprietary (free during public preview) |
| Tech Stack | Built on abandoned Fleet IDE codebase; macOS native; Agent Client Protocol (ACP) for extensibility; Docker containers + Git worktrees for sandboxing |
| Maturity | 🟡 Public Preview (macOS only; free; Windows/Linux in development) |
| Last Analyzed | 2026-03-21 |

---

## Burak's Notes

> JetBrains Air is a direct GUI competitor to our tmux-based L-Thread Orchestrator. It solves the same problem we solve with tmux+worktree+Claude Code: running multiple AI agents concurrently on the same codebase. The key difference is JetBrains builds tools AROUND the agent (agent-first) rather than adding AI TO an IDE (IDE-first). This is philosophically aligned with our "orchestration layer is the compounding asset" principle.
>
> However, the Hacker News reception was lukewarm (74 points, 64 comments). The dominant community feedback matches our own experience: the bottleneck is HUMAN REVIEW, not agent parallelism. Multiple developers said a single agent already saturates their review bandwidth. This validates our Master Blueprint principle #5 ("Human review is the binding constraint") and principle #4 ("Coordination overhead scales at exponent 1.724").
>
> The Agent Client Protocol (ACP) for extensibility is interesting — it means any agent from the ACP Agent Registry can plug in, not just the four built-in ones. But this protocol competes with A2A (Google's standard, 22K stars, already in our catalogue) and MCP. Protocol fragmentation risk.
>
> For us: this is a WATCH item. Our tmux+Claude Code stack is more flexible (Linux, SSH, headless, scriptable), and cmux (10/10 in our catalogue) is a strictly better terminal substrate. JetBrains Air is relevant as market validation that the multi-agent IDE paradigm is going mainstream, and as a competitor analysis reference for cmux and our orchestrator. It is NOT an adoption candidate — we don't want to be locked into a proprietary IDE when our competitive advantage is the orchestration layer itself.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Validates the multi-agent concurrent development paradigm we've been building. Agent Client Protocol (ACP) extensibility is conceptually interesting. But proprietary, macOS-only, GUI-first — opposite of our headless/scriptable/Linux-ready architecture. |
| **Novelty** | 5/10 | The "build tools around the agent, not add AI to IDE" framing is a useful conceptual reframe. ACP registry for pluggable agents is novel. But the actual capabilities (concurrent agents, sandboxing, code context) are things we and 10+ other tools already do. |
| **Actionable** | 3/10 | No patterns directly portable to our stack. The ACP protocol is worth monitoring for interop. The precise code context referencing (mention specific lines, commits, classes, methods instead of pasting text blobs) is a UX pattern we should steal for our agent prompts. |

---

## Overview

JetBrains Air is a new agentic development environment (ADE) that represents JetBrains' pivot from traditional IDE-first AI (Junie plugin in IntelliJ) to agent-first development tooling. It was built on the codebase of Fleet, JetBrains' lightweight editor that was abandoned in favor of this new direction.

The core thesis: complex codebases are not yet ready for pure agentic coding, so Air combines agent orchestration with traditional IDE functionality. As the team puts it: "This is where our 26 years of experience building IDEs come into play."

### Key Capabilities

1. **Multi-Agent Support**: Four agents natively supported — Codex, Claude Agent, Gemini CLI, and Junie. The Agent Client Protocol (ACP) enables additional agents from the ACP Agent Registry.

2. **Concurrent Task Execution**: Run multiple agents on different tasks simultaneously. Single-task-at-a-time interface with notifications for tasks needing attention.

3. **Sandboxing Options**:
   - **Local execution**: Agents run on developer machines by default
   - **Containerized isolation**: Docker containers + Git worktrees for concurrent work (same pattern we use)

4. **Precise Code Context**: Developers can mention specific lines, commits, classes, or methods rather than pasting text blobs. Symbol-level references for accurate context provision.

5. **Agent Switching**: Switch agents across projects as a natural workflow, not a migration. Use Codex for one task, Claude for another, Gemini for a third.

### Pricing Model

- **Free** during public preview (macOS only)
- **JetBrains AI subscription** (included in All Products Pack and dotUltimate)
- **Bring Your Own Key (BYOK)**: Anthropic, OpenAI, or Google API keys
- **Enterprise offering**: Coming soon

### Platform Support

- **Available now**: macOS
- **Planned**: Windows, Linux (notably NOT Kotlin Multiplatform despite JetBrains creating it — called out by HN community)

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    JetBrains Air                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Agent Orchestration Layer              │  │
│  │                                                     │  │
│  │  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌───────┐ │  │
│  │  │Codex │  │Claude    │  │Gemini CLI│  │Junie  │  │  │
│  │  │      │  │Agent     │  │          │  │       │  │  │
│  │  └──────┘  └──────────┘  └──────────┘  └───────┘  │  │
│  │                                                     │  │
│  │  Agent Client Protocol (ACP) ← ACP Agent Registry  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Task Management                       │  │
│  │  - Single-task-at-a-time interface                 │  │
│  │  - Notifications for attention-needed tasks        │  │
│  │  - Precise code context (symbol refs, commits)     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Sandboxing                            │  │
│  │  - Local execution (default)                       │  │
│  │  - Docker containers (isolation)                   │  │
│  │  - Git worktrees (concurrent work)                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              IDE Features (Fleet heritage)         │  │
│  │  - Code intelligence (26 years of JB experience)   │  │
│  │  - Refactoring, navigation, debugging              │  │
│  │  - Language support via JetBrains platform          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Publisher Background

JetBrains is the 800-pound gorilla of developer tools. Founded in Prague in 2000, they created IntelliJ IDEA (the foundation of Android Studio), PyCharm, GoLand, WebStorm, the Kotlin language, Compose Multiplatform, and dozens of other tools used by millions of developers.

**Fleet history**: JetBrains launched Fleet as a lightweight alternative to their heavyweight IDEs. It was abandoned in favor of Air, which repurposes the Fleet codebase for the agentic development paradigm. This is a significant strategic pivot — JetBrains is betting that the future of development is agent-orchestrated, not human-typed.

**Market position**: JetBrains faces existential pressure from AI-native IDEs (Cursor at $29.3B valuation, Windsurf, VS Code + Copilot). Air is their response — leapfrog from "IDE with AI assistant" to "agent-first development environment."

---

## What's Valuable for Us

### 1. MARKET VALIDATION (Strategic)
A company with 26 years of IDE experience and 2,300+ employees is building essentially the same thing we build with tmux+Claude Code. This validates that multi-agent concurrent development is the future, not a niche.

### 2. PRECISE CODE CONTEXT PATTERN (Adoptable)
Air lets users mention specific lines, commits, classes, and methods as code context for agents. We currently paste text blobs or rely on agents to find context themselves. We should implement a similar symbol-reference system in our agent prompts — e.g., `@file:line` or `@class.method` notation that resolves to actual code context before the prompt reaches the agent.

### 3. AGENT CLIENT PROTOCOL (ACP) (Monitor)
The ACP + Agent Registry pattern for pluggable agents is worth monitoring. If this becomes a standard (alongside A2A and MCP), our orchestrator should support it for agent interop. Currently, ACP is JetBrains-specific and does not have the community adoption of A2A (22K stars) or MCP.

### 4. COMMUNITY FEEDBACK ON REVIEW BOTTLENECK (Validates our thesis)
The HN discussion overwhelmingly confirmed that human review throughput is the real bottleneck, not agent parallelism. Key quotes:
- "my reviewing throughput is usually saturated by a single agent already" (cube2222)
- "how anyone could work on several tasks at once at a speed where they can read, review and iterate the output of one LLM" (kace91)

This validates Master Blueprint principle #5 and suggests that our focus on quality gates and deterministic review (70/30 split) is more valuable than raw agent parallelism.

---

## What's NOT Relevant

1. **Proprietary and closed-source** — Our competitive advantage is the orchestration layer we control. Locking into JetBrains' proprietary ADE would make us dependent on their roadmap.

2. **macOS only** — No Linux support eliminates cloud deployment scenarios. Our tmux stack runs everywhere.

3. **GUI-first** — Air requires human interaction through a GUI. Our orchestrator is headless and fully automated (AUTO_MODE). Air is designed for the "pair programming with agents" use case; we're building autonomous agent swarms.

4. **No API/CLI for external automation** — Unlike cmux (socket API, 80+ CLI commands), Air appears to have no programmatic interface for orchestrator control. It's an interactive tool, not an automation substrate.

5. **ACP protocol fragmentation** — Yet another agent protocol competing with A2A (Google, 22K stars) and MCP. Betting on ACP is risky.

---

## Comparison with Catalogue Tools

### vs. cmux (10/10)
cmux is strictly superior for our use case. cmux provides a scriptable socket API (JSON-RPC), CLI with 80+ commands, tmux compatibility shim for zero-migration Claude Code agent teams, embedded scriptable browser, and notification rings — all as a native macOS terminal. Air provides a GUI IDE experience. cmux is an automation substrate; Air is an interactive tool. We chose terminal-as-substrate over IDE-as-substrate.

### vs. Our L-Thread Orchestrator (tmux-based)
Air solves the same problem but in a fundamentally different way. Our orchestrator is headless, scriptable, Linux-compatible, and fully automated. Air requires human GUI interaction. Our tmux+worktree+Claude Code stack is more flexible and composable. Air's advantage is polish and the JetBrains code intelligence engine — but we don't need that if our agents (Claude Code, Codex) bring their own code understanding.

### vs. Emdash (6/10)
Emdash supports 22 CLI agent adapters in an Electron GUI. Air supports 4 agents natively plus ACP extensibility. Emdash is open-source (MIT); Air is proprietary. Both are GUI-first interactive tools, neither is an automation substrate.

### vs. Conductor Build (5/10)
Conductor Build is also a Mac GUI for parallel Claude Code agents with git worktree isolation. Air is more ambitious (multi-agent, not just Claude) and has deeper IDE features. Both are proprietary and GUI-first.

### vs. Factory IDE (4/10)
Factory validates autonomous agents at enterprise scale with specialized "Droids." Air is more general (multi-agent, BYOK) but less autonomous. Different philosophies: Factory automates, Air assists.

---

## Future Monitoring

- **WATCH**: ACP protocol adoption — if it gains traction beyond JetBrains, consider supporting it
- **WATCH**: Windows/Linux release — could become relevant if they add API/CLI access
- **WATCH**: Team collaboration features — the blog mentions "task definition precedes agent involvement" as a future direction for teams
- **IGNORE**: Enterprise offering pricing — not relevant to our indie/Max subscription model
- **COMPARE**: Track how Air's multi-agent paradigm evolves vs. cmux's terminal-substrate approach — these represent two competing visions for the same problem

---

## Cross-References

- **[cmux](./cmux.md)** — Our preferred terminal substrate (10/10); strictly superior for automation use cases
- **[Emdash](./emdash.md)** — Closest OSS competitor to Air; 22 agent adapters vs Air's 4+ACP
- **[Conductor Build](./conductor-build.md)** — Another Mac GUI for parallel agents; narrower scope
- **[Factory IDE](./factory-ide.md)** — Enterprise autonomous agent IDE; different philosophy
- **[Agent of Empires](../orchestration-platforms/agent-of-empires.md)** — Rust tmux+worktree session manager supporting 8 agent CLIs; our architectural peer
- **[dmux](../orchestration-platforms/dmux.md)** — TypeScript tmux+worktree multiplexer; automation-first approach vs Air's GUI-first
- **[A2A Protocol](../agent-protocols/a2a-protocol.md)** — Google's agent-to-agent standard; competing with Air's ACP

---

## Key Takeaway

> **JetBrains Air validates that multi-agent concurrent development is going mainstream, but its proprietary GUI-first approach is the opposite of our headless automation architecture. The community reception confirms our thesis that human review is the bottleneck, not agent parallelism. Watch the ACP protocol; steal the precise code context referencing pattern; keep building on tmux+cmux.**
