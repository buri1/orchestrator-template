# json-render

> **The Generative UI framework — generate dynamic, personalized UIs from prompts without sacrificing reliability using predefined components and actions for safe, predictable output.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [vercel-labs/json-render](https://github.com/vercel-labs/json-render) |
| GitHub Stars | 12,129 (as of 2026-03-08) |
| Publisher | Vercel Labs (bigtech — Vercel's experimental division) |
| License | Apache-2.0 |
| Tech Stack | TypeScript, React, Vue 3, Svelte 5, React Native, Zod, shadcn/ui, Remotion, Satori |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The guardrailed generative UI pattern directly embodies our 70/30 deterministic/LLM split applied to frontend rendering. Relevant for SaaS factory (rapid UI generation), client delivery dashboards, and agent reporting UIs. MCP integration means agents could render rich UIs inside Claude/VS Code. Not immediately needed for orchestrator core, but a strong candidate for Phase 2-3 when building client-facing surfaces. |
| **Novelty** | 7/10 | The catalog-registry-renderer three-layer architecture with Zod schema validation as AI guardrails is a clean, well-executed pattern we haven't seen at this level of polish. The MCP-as-UI-transport idea (not just tool access, but rich rendering) is genuinely novel. Cross-platform from single spec is elegant. |
| **Actionable** | 6/10 | Could adopt for SaaS factory product UIs or agent dashboard rendering within 1-2 days. The catalog pattern is directly transferable as a design principle. However, no immediate orchestrator use case — would need a concrete frontend project to justify integration. |

---

## Overview

json-render is a framework that lets AI models generate structured UIs by constraining output to a predefined component catalog. Instead of allowing free-form HTML/JSX generation (which produces unreliable, unstyled, potentially dangerous output), json-render forces the AI to emit a flat JSON spec that references only components and actions registered in the catalog. The renderer then validates and executes this spec against platform-specific component implementations.

The core insight is "guardrailed generative UI" — the AI has creative freedom in *composing* and *parameterizing* components, but zero freedom in *inventing* them. This mirrors our 70/30 deterministic/LLM split: the catalog, validation, rendering pipeline, and state management are all deterministic; the LLM's only job is to select and arrange components from the menu.

The framework ships with 16 packages covering core logic, 4 rendering targets (React, Vue, Svelte, React Native), 4 output formats (PDF, email, video, images), 4 state management adapters (Redux, Zustand, Jotai, XState), a shadcn/ui component library (36 pre-built components), a codegen tool, and an MCP integration package. Created January 2026 by Vercel Labs, it reached 12K+ stars within two months — indicating strong market signal for this pattern.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CATALOG (Zod schemas)                  │
│                                                          │
│  components: { Card: z.object({...}), Button: ... }      │
│  actions: { export_report: {...}, refresh_data: {...} }   │
│  → catalog.prompt() generates system prompt for AI        │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  AI MODEL (LLM)                           │
│                                                          │
│  Input: catalog.prompt() + user request                   │
│  Output: JSON Spec (flat element map)                     │
│  Constraint: can ONLY reference catalog components/actions│
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    SPEC (JSON)                            │
│                                                          │
│  { root: "card-1",                                       │
│    elements: {                                           │
│      "card-1": { type: "Card", props: {...},             │
│                  children: ["btn-1"] },                   │
│      "btn-1":  { type: "Button", props: {...},           │
│                  children: [] }                           │
│    }                                                     │
│  }                                                       │
└──────────┬──────────────────────────────────┬────────────┘
           │                                  │
           ▼                                  ▼
┌────────────────────┐         ┌──────────────────────────┐
│  REGISTRY (React)  │         │  REGISTRY (React Native) │
│                    │         │                          │
│  Card → <div>      │         │  Card → <View>           │
│  Button → <button> │         │  Button → <Pressable>    │
└────────┬───────────┘         └──────────┬───────────────┘
         │                                │
         ▼                                ▼
┌────────────────────┐         ┌──────────────────────────┐
│  <Renderer>        │         │  <Renderer>              │
│  spec + registry   │         │  spec + registry         │
│  → validated UI    │         │  → native mobile UI      │
└────────────────────┘         └──────────────────────────┘
```

### Core Abstractions

1. **Catalog** (`defineCatalog`) — Declares available components with Zod prop schemas + available actions. The `catalog.prompt()` method auto-generates a system prompt that constrains AI output to the catalog.

2. **Registry** (`defineRegistry`) — Maps catalog schemas to platform-specific component implementations. Each platform (React, Vue, Svelte, React Native) gets its own registry binding the same catalog.

3. **Spec** — Flat JSON document with `root` (string ID) and `elements` (map of ID to `{ type, props, children, visible?, watch? }`). Flat structure (not nested tree) enables streaming and partial rendering.

4. **Renderer** — Takes spec + registry, validates each element against the catalog schema, renders the component tree. Platform-specific (`@json-render/react`, `@json-render/vue`, etc.).

5. **SpecStreamCompiler** — Processes streaming AI output incrementally, emitting patches for progressive rendering as chunks arrive.

6. **Expressions** — Declarative state bindings within specs: `$state` (read), `$bindState` (two-way bind), `$cond/$then/$else` (conditional), `$template` (interpolation), `$computed` (function call).

7. **Actions** — Named operations components can trigger. Catalog-defined (e.g., `export_report`) or built-in (`setState`). Components emit actions via `emit("press")` callback.

8. **Watchers** — React to state changes: `watch: { "/form/country": { action: "loadCities" } }`.

### Package Architecture (16 packages)

| Layer | Package | Purpose |
|-------|---------|---------|
| Core | `@json-render/core` | Schemas, catalogs, AI prompts, streaming, expressions |
| Renderers | `@json-render/react`, `/vue`, `/svelte`, `/react-native` | Platform-specific rendering |
| Components | `@json-render/shadcn` | 36 pre-built shadcn/ui components (Radix + Tailwind) |
| Output | `@json-render/remotion`, `/react-pdf`, `/react-email`, `/image` | Video, PDF, email, PNG/SVG |
| State | `@json-render/redux`, `/zustand`, `/jotai`, `/xstate` | State management adapters |
| Tooling | `@json-render/codegen` | Code generation from UI trees |
| Integration | `@json-render/mcp` | MCP Apps for Claude, ChatGPT, VS Code, Cursor |

---

## Publisher Background

**Vercel Labs** is the experimental/research arm of Vercel (formerly ZEIT), the company behind Next.js (134K stars), Turborepo (27K stars), and the Vercel hosting platform. Vercel raised $250M+ and is valued at $2.5B+. The `vercel-labs` GitHub org is where Vercel incubates new ideas before potential promotion to first-party Vercel products (previous graduates include `ai` SDK, now `@vercel/ai`).

**Chris Tate** (@ctatedev) appears to be the primary author — also created agent-browser (20K stars, already in our catalogue) and portless. The Vercel connection provides strong credibility: this team understands production React/Next.js infrastructure deeply, and the framework's design reflects that (streaming-first, component-model alignment with React patterns, shadcn/ui as default component library).

The 12K+ stars in under two months and 641 forks signal strong adoption momentum in the AI frontend community.

---

## What's Valuable for Us

1. **The Guardrailed Generative Pattern** — The catalog-as-schema-as-guardrail approach is a direct instantiation of our Master Blueprint Principle #2 ("Deterministic orchestration, LLM execution"). The AI generates *within* a deterministic schema, never outside it. This pattern is transferable to any domain where we want AI to compose from predetermined building blocks — not just UI but also workflow composition, report generation, notification templates.

2. **`catalog.prompt()` Auto-Generation** — The catalog automatically generates the system prompt that constrains AI output. This is a concrete implementation of context engineering: the schema IS the prompt. We could adopt this pattern for generating agent task schemas where the available actions are auto-documented from the action definitions.

3. **Flat Spec Format for Streaming** — The `{ root, elements }` flat map (rather than nested tree) is specifically designed for streaming. Elements can arrive in any order and the renderer incrementally builds the tree. This is relevant for any agent output we want to render progressively.

4. **Cross-Platform from Single Definition** — One catalog → N registries → N platforms. For our SaaS factory, this means defining product UI once and rendering to web, mobile, PDF reports, and email notifications from the same spec.

5. **MCP as UI Transport** — The `@json-render/mcp` package is a novel MCP use case. Instead of MCP for tool access, it's MCP for rich UI rendering inside Claude, ChatGPT, VS Code. This could enable our orchestrator to render rich status dashboards directly inside Claude Code sessions.

6. **Expression System** — The `$state`, `$cond`, `$template`, `$computed` expression DSL for dynamic props is a well-designed declarative state binding system. Portable concept for any JSON-based configuration where we need dynamic resolution.

---

## What's NOT Relevant

1. **Frontend Framework Lock-in** — We don't currently have a React/Vue/Svelte frontend to render into. Our orchestrator is CLI-first (Master Blueprint: tmux + terminal). Adopting json-render requires having a web or mobile UI surface to render to — we don't have one yet.

2. **Remotion/Video/PDF/Email Rendering** — Specialized output formats that are nice-to-have but not on our 60-day roadmap. Only relevant if SaaS factory products need automated report generation.

3. **State Management Adapters** — Redux/Zustand/Jotai/XState adapters assume a persistent frontend application with client-side state. Our agents are ephemeral and stateless at the UI level.

4. **shadcn/ui Component Library** — Opinionated component choice. If we adopt json-render, we'd use our own component catalog, not shadcn defaults.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the catalog-as-guardrail pattern for constraining agent output in non-UI domains (workflow composition, task decomposition schemas). The `catalog.prompt()` auto-generation pattern is immediately transferable to agent system prompts.

- **Phase 3 (Days 60-90):** If building any client-facing dashboard or SaaS product frontend, json-render becomes the primary UI framework candidate. The cross-platform single-catalog approach aligns with rapid SaaS factory launches. MCP integration would enable rich agent dashboards inside Claude Code.

- **Phase 4 (Days 90+):** For federated multi-business system, json-render could serve as the unified reporting/dashboard layer. Each business line defines its own catalog (respecting context separation — Master Blueprint Principle #3), but the rendering infrastructure is shared.

---

## Key Takeaway

> **json-render is the 70/30 deterministic/LLM split applied to UI: AI composes from a deterministic component catalog, never invents — and the catalog-as-schema-as-system-prompt pattern is transferable far beyond frontend rendering.**
