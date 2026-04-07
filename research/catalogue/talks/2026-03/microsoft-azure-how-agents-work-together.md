# How Do Agents Work Together?

> **Microsoft Azure — YouTube, 2026**

| Field | Value |
|-------|-------|
| Source | [youtube.com/watch?v=EXoIFK8viVM](https://www.youtube.com/watch?v=EXoIFK8viVM) |
| Speaker | Microsoft Azure team |
| Event | Microsoft Azure YouTube Channel |
| Duration | Unknown |
| Date | 2026 |
| Topics | multi-agent-collaboration, A2A-protocol, Microsoft-Agent-Framework, agent-orchestration, Azure-Foundry |

---

## Burak's Notes

> *Microsoft's take on multi-agent collaboration — likely covers their Agent Framework (public preview), A2A protocol support, and Azure Foundry integration. Their approach is enterprise-focused: visual designers + code-first API, stateful collaboration with recovery and debugging, agents spanning HR/IT/Marketing silos.*
>
> *Compared to our terminal-native tmux approach, Microsoft's vision is fundamentally different: cloud-hosted, GUI-driven, enterprise-governed. Their A2A protocol support is interesting (we already have the A2A Protocol entry in catalogue at 8/10), but the orchestration model is more Temporal-like than what we're building.*

---

## Key Takeaways

1. **Microsoft Agent Framework converges AutoGen + Semantic Kernel** — Single commercial-grade SDK for multi-agent orchestration, now in public preview
2. **A2A protocol for cross-cloud agent collaboration** — Agents can collaborate across organizational boundaries via Google's A2A standard
3. **Multi-agent workflows with recovery** — Long-running stateful collaboration with built-in debugging; visual designer + code-first API

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 5/10 | Enterprise cloud orchestration is a different paradigm from our terminal-native approach; A2A protocol support is noteworthy but already covered in catalogue; multi-agent patterns are generic |
| **Actionable** | 3/10 | Cloud-hosted approach doesn't map to our tmux+worktree architecture; patterns are too high-level to directly adopt |

---

## Summary

This Microsoft Azure video covers how AI agents collaborate in the Azure ecosystem. Microsoft's approach centers on the Agent Framework (converging AutoGen and Semantic Kernel), which provides an open-source SDK and runtime for orchestrating multi-agent systems. The framework supports A2A (Agent-to-Agent) protocol for cross-cloud and cross-organizational agent collaboration.

Key architectural elements include: hierarchical orchestration (controller agents delegating to specialists), multi-agent workflows with visual designers and code-first APIs, stateful collaboration with recovery and debugging, and integration with Azure Foundry for deployment. The use cases span enterprise scenarios like cross-department onboarding (HR + IT + Marketing agents).

Microsoft's vision is enterprise-cloud-native: hosted runtimes, managed state, governance controls, organizational boundaries. This contrasts sharply with our terminal-native, file-driven, local-first approach.

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| A2A Protocol | Agent-to-agent communication standard | Yes — [agent-protocols/a2a-protocol.md](../../agent-protocols/a2a-protocol.md) |
| Microsoft Agent Framework | Primary orchestration SDK discussed | No |
| Azure Foundry | Deployment platform | No |
| AutoGen | Predecessor, now converged into Agent Framework | No |
| Semantic Kernel | Predecessor, now converged into Agent Framework | No |

---

## Action Items

- [ ] Monitor Microsoft Agent Framework for patterns applicable to headless orchestration
- [ ] Track A2A protocol adoption (already in catalogue) for cross-system interop
