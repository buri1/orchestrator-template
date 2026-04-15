# Code Mode — A New Software Architecture for AI Agents

> **Sunil Pai (Cloudflare Agents SDK; creator of PartyKit) — AI Engineer Europe 2026, London, 9 April 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=31697s |
| Speaker | Sunil Pai — AI Agents team at Cloudflare (Agents SDK); previously creator of PartyKit (open-source real-time multiplayer); former React core team |
| Event | AI Engineer Europe 2026, London (hosted by swyx / smol.ai) |
| Duration | ~20 min (closing keynote Day 1) |
| Date | 2026-04-09 |
| Topics | code-mode, tool-calling, sandboxing, v8-isolates, capability-based-security, cloudflare-workers, harness-architecture, generative-ui, state-machines, inhabiting-state, mcp, agent-dx, ghost-in-the-shell |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Sunil Pai works on the AI Agents team at Cloudflare, where he builds the Cloudflare Agents SDK -- the company's toolkit for running long-running AI agents on Workers, Durable Objects, and V8 isolates. Prior to Cloudflare he was the creator of **PartyKit**, an open-source real-time multiplayer framework built on Cloudflare Durable Objects that popularized the "one Durable Object per user/room" pattern for collaborative state. Before that he spent years on the React core team and was a prolific voice in the JavaScript ecosystem.

This is his closing keynote for Day 1 of AI Engineer Europe 2026 in London. The talk introduces "Code Mode," an emergent pattern Pai and his colleagues have been observing across Cloudflare's agent deployments, and argues it represents a fundamental architectural shift for AI agent software.

---

## Main Thesis

**Stop having models emit JSON tool calls. Have them generate code that runs against a controlled environment.** This "Code Mode" pattern collapses the back-and-forth latency of MCP-style tool calling, leverages the trillions of tokens of code models were already trained on, and lets agents express looping, state, sequencing, and parallelization naturally -- as an engineer would. At scale, Code Mode is not just a speedup; it is a new software architecture where the agent **inhabits a state machine** instead of orchestrating one via messages. The harness becomes the product: a sandboxed execution environment with capability-based security where the model has no ambient power, only the specific APIs you expose into the sandbox.

---

## All 12 Talking Points

### 1. Tool Calling Breaks at Scale

The JSON-tool-calling pattern that dominates today's MCP ecosystem works fine for small surfaces: a handful of tools, short runs, a few round trips. It falls apart the moment you try to stuff Google services + Jira + an internal wiki + hundreds of SaaS APIs into one agent's context.

- **Context blows up** long before the tool even gets called. Large tool catalogues are the single biggest context pressure in production agent systems today.
- **Composition is weird.** Chaining five tools with intermediate data transformation gets modeled as a verbose sequence of JSON messages instead of a natural expression.
- **Back-and-forth is slow.** Every hop is a full model round trip. Real workflows need 5-15 hops minimum; user-facing latency compounds.

### 2. Code Mode Benefits

Instead of a tool call per step, the model writes a **single string of JavaScript** that the harness executes against a prepared environment.

- **Typed APIs** -- the sandbox exposes real functions, so syntax errors and type errors are detectable before execution.
- **Training data alignment** -- models have seen terabytes of code. JSON tool-calling schemas are a tiny slice by comparison; JavaScript is the model's native tongue.
- **One execution replaces N round trips.** The entire workflow collapses to a single call + run.
- **Natural looping, state, sequencing, parallelization** -- everything a working engineer uses routinely (for loops, Promise.all, try/catch, variable bindings) becomes available as first-class expression.

### 3. Matt Kerry's Cloudflare API Example (1.2M -> 1K tokens)

This is the talk's most concrete data point. Matt Kerry at Cloudflare wanted an agent that could operate the full Cloudflare API surface: **2,600 endpoints**.

- **Naive MCP approach:** expose all 2,600 endpoints as tools. First call cost: **~1.2 million tokens**. Context is blown before the model sees the user's prompt.
- **Code Mode approach:** expose exactly **two tools**:
  - `search(query)` -- accepts code as a string; receives the entire OpenAPI JSON spec and returns matching endpoints.
  - `execute(code)` -- accepts code as a string; gives back a function environment to call against the real API surface.
- **Result:** **~1,000 tokens** for the same capability. **99.9% reduction.** No context pressure. Same functional coverage.

Both tools take code as string input. The model writes JavaScript, the harness runs it next to the API surface.

### 4. The "Dodoo Attack" Live Demo

Pai demonstrated live on stage with a prompt:

> "We're getting DDoSed. Find every offending IP and block them."

- **Normal MCP trajectory:** ~8 round trips just to make the required API calls, before even accounting for the 1.2M token catalogue problem.
- **Code Mode trajectory:** the model generated a single string of JavaScript, the harness executed it next to the API surface, one shot.
- **The demo had a pagination bug on stage** -- Pai used it to show that Code Mode makes infrastructure testing honest, because you can see exactly what code ran and where it failed, not an opaque sequence of "the model decided not to call tool X".

### 5. Emergent Behavior: Inhabiting State Machines (the Tic-Tac-Toe Story)

This is the talk's conceptual pivot and the bit that makes it more than a latency optimization pitch. Kenton Varda (the Cloudflare Workers creator) built a "wipe coding" canvas environment for experimentation, then asked the AI to generate a TLDraw-style canvas app with brushes and colors. Kenton then drew a tic-tac-toe grid on the canvas by hand and said:

> "Play tic-tac-toe with me."

- The model's first instinct was to **generate a tic-tac-toe app** -- i.e., write code to implement a tic-tac-toe game. Kenton stopped it: *"No. You have access to the state of the system. Inspect it and play."*
- The state was just an array of brush strokes: grid lines and one X.
- **The model immediately recognized tic-tac-toe from the stroke array and drew a perfect circle.**
- **There was no tic-tac-toe code anywhere in the system.** No game logic, no move validation, no AI opponent implementation. The model became the opponent by reading state and mutating state.
- Pai's framing: *"It stopped generating a program and started inhabiting the state machine."*
- Reference: **Ghost in the Shell** -- the model as a ghost that moves into the shell of any state machine you hand it.
- Postscript: Kenton won the game. The model let him. Alignment implications left as an exercise.

**This is the most important idea in the talk.** Code Mode isn't just about replacing JSON with JS; it's about the agent becoming a resident of the state it operates on, not a dispatcher of messages about that state.

### 6. New Software Architecture: The Harness

Everyone building production agents is converging on the same realization: **coding agents are great general-purpose computing machines**, not because they generate code but because they have a safe space to execute code.

- The harness is the actual product. The model is interchangeable; the sandbox is the moat.
- Capabilities are exposed **into** the sandbox as APIs, not granted to the model ambiently.
- This is the architectural inversion: instead of "the model has access to the internet and picks tools," the model has access to **nothing** until the harness decides to pass specific functions in.

### 7. Sandbox Attributes

Pai enumerates the properties a Code Mode sandbox should have. These are the specs Cloudflare is building to:

- **No capabilities by default.** The sandbox starts with zero authority -- it can only execute code.
- **Explicitly granted capabilities.** You pass in APIs as bindings. The model can only call what you gave it.
- **All outgoing network controlled.** The sandbox intercepts every fetch / socket / DNS lookup.
- **Default: no outgoing fetches.** Only the APIs you exposed. This is fast (no network latency for permitted calls) and deterministic (no race conditions with unrelated services).
- **Full observability.** You need to know why last Tuesday the agent traded $2.3M for llama poop. Every execution is logged, replayable, auditable.
- **Cloudflare uses V8 isolates.** Start in <5ms, 10 years of security hardening from Chrome, no OS-level overhead, cheap enough to spin up per task.

### 8. Beyond One-Off: Ambitious Use Cases

Code Mode unlocks workflows that were impossible or absurd under the JSON-tool-calling regime.

- **Long-running workflows: days, months, years.** Instance-level state carried through the entire lifetime of the task. The sandbox is durable.
- **Generative UI: custom UI per user, forever.**
  - The e-commerce problem today: the more popular a product gets, the blander the UI becomes, because ML teams A/B test their way to lowest-common-denominator button colors.
  - With Code Mode: **every user gets an absolutely custom interface** rendered from session state, generated on demand.
  - Example prompt: *"I need to return these shoes and find similar under $100."*
  - The sandbox has access to the user's order history, return policy, product catalogue, price filter, and rendering primitives. It generates a purpose-built screen for exactly this task -- buttons labeled "Return blue size 9", a filter slider already constrained to $100, a grid of visually-similar alternatives -- then discards the UI when the task is done.
- **Context-aware actions from session state** replace static forms and menus entirely.

### 9. Running the Harness Closer to the User

Pai notes people are finding increasing power by running the harness **on the user's device**, not on a server.

- **Mashing up different services** in the safe environment on the client side.
- **Task-by-task basis** -- the harness spins up per task, pulls the user's local context, runs the code, discards.
- **iPhone over server** -- explicitly an anti-Cloudflare note. Pai acknowledges the architectural pull is toward the edge the user already holds in their hand.

### 10. Agent DX Matters: Your Next Billion Users Are Little Robots

Pai's most quoted line from the talk:

> "Your next billion users are little robots that are generating code for you."

The developer experience you build for agents matters more than the one you build for humans, because the agents are the scaling surface.

- **Customers are still humans.** But the consumers of your API surface are now agents.
- **Agents don't hang out in pubs.** They hang out in registries (npm, PyPI, MCP registries, OpenAPI catalogues).
- **"They dream in types and syntax errors."**
- The DX checklist for agents:
  - **Markdown docs** -- agents parse markdown natively; it is the lingua franca of AI documentation.
  - **Errors with remediation steps** -- an error message should tell the agent exactly how to fix it, not just what went wrong (cf. Ryan Lopopolo's "prompts-as-lint" pattern from the same event).
  - **Discoverability via search** -- agents find things via search, not via hand-written README tours.
  - **Capability-based security** -- the key primitive; see next section.

### 11. Capability-Based Security Primer

Pai gives a brief history and pitch for capability-based security as the right model for agent sandboxing.

- **From the Lisp tradition.** Peter (Steinberger? Wegner?) once said "it kind of breaks your brain" -- you don't get ambient authority, you only get what someone explicitly hands you.
- **Not JavaScript-specific.** Python, WebAssembly, Lisp, and other ecosystems all have capability-based implementations.
- **Attributes Pai values in a runtime:**
  - Events (message-passing as first-class)
  - Sandboxing (enforceable isolation)
  - Capability-based security (no ambient authority)
  - Embeddable (you can host it inside your own process)
  - Fast startup (spin up per task)
  - Ephemeral (no persistent state by default)
- **UI programmers will do particularly well** in this world because they are closest to the user and the most familiar with the event/state/render loop Code Mode models naturally use.

### 12. Closing Provocation: Let the Code Do the Talking

Pai closes with a historical observation that functions as a manifesto.

- **Programmers got code, got infinite power** -- and, Pai jokes, got Twitter to complain on.
- **Everyone else got buttons and forms** -- the consumer UX reduction of that infinite power.
- **That distinction is breaking.** With Code Mode, the generative UI example (see point 8), and the agent-as-resident-of-state-machine thesis, every user gets code-level power rendered into a bespoke interface.
- **"In this world, you need to let the code do the talking."**

The closing line reframes the whole talk: you are not building an agent product, you are building a Code Mode harness, and the harness is the thing that talks.

---

## Key Quotes

> "It stopped generating a program and started inhabiting the state machine."

> "Your next billion users are little robots that are generating code for you."

> "They dream in types and syntax errors."

> "Code is the thing that interacts with all your systems."

> "In this world, you need to let the code do the talking."

> "We started with no capabilities. You grant them explicitly."

> "You need to know why last Tuesday it traded $2.3M for llama poop."

---

## Code Mode: The Pattern in One Page

**Problem.** JSON tool calling breaks at scale. Large tool catalogues blow context. Composition is unnatural. Back-and-forth is slow.

**Solution.** Replace N JSON tool calls with **one code execution**. The model writes JavaScript (or Python, Wasm, Lisp); the harness executes it inside a sandbox; the sandbox exposes only the APIs you granted.

**Architecture.**

```
┌────────────────────────────────────────────────────────────┐
│                        Agent (LLM)                          │
│     "Find every offending IP and block them."               │
└─────────────────┬──────────────────────────────────────────┘
                  │ single code-string call
                  ▼
┌────────────────────────────────────────────────────────────┐
│                    Sandbox (V8 isolate)                     │
│  - Starts with ZERO capabilities                            │
│  - Explicitly granted APIs (bindings)                       │
│  - All network intercepted; fetches blocked by default      │
│  - Full observability + replay                              │
│  - Fast startup (<5ms)                                      │
│  - Ephemeral                                                │
└─────────────────┬──────────────────────────────────────────┘
                  │ function calls to granted APIs only
                  ▼
┌────────────────────────────────────────────────────────────┐
│          Capability APIs (search, execute, ...)             │
│     Cloudflare API (2600 endpoints reduced to 2 tools)      │
└────────────────────────────────────────────────────────────┘
```

**The two-tool reduction.** For enormous API surfaces (Cloudflare API: 2,600 endpoints, 1.2M tokens as MCP tools), expose just two:

```js
// Tool 1: search — takes a query string, returns matching OpenAPI endpoints
search(query: string) -> Endpoint[]

// Tool 2: execute — takes a code string, runs it against the API surface
execute(code: string) -> Result
```

Both accept **code as string input**. The model composes queries and executions in one language (JavaScript) and one round trip. The 1.2M -> 1K token reduction is the headline, but the real win is that the model gets to think in code instead of in JSON.

**Inhabiting state machines (the tic-tac-toe principle).** When the sandbox exposes both read and write access to a shared state, the model can **become a participant in the state machine** rather than generate a program that implements the state machine. Kenton's tic-tac-toe demo is the canonical example: no game code, no move logic, no AI opponent -- just the model reading a stroke array, recognizing the game, and mutating the state to play.

This is the bit that rewards re-reading. Code Mode is a latency win. Inhabiting state machines is a **paradigm**: your harness becomes the universe the agent lives inside, and every task becomes "move into this specific state machine and do the job."

---

## Sandbox Architecture Attributes (Checklist)

| Attribute | Default | Why |
|-----------|---------|-----|
| **Capabilities** | None | Starts with zero authority -- only executes code. |
| **API exposure** | Explicit bindings | You pass APIs into the sandbox by name. No ambient globals. |
| **Outgoing fetches** | Blocked | Default: the sandbox cannot fetch anywhere. Only granted APIs work. |
| **Network control** | Full interception | Every fetch/socket/DNS lookup goes through the harness. |
| **Observability** | Full | Every execution logged, replayable, auditable. You need to know why $2.3M moved. |
| **Startup time** | <5ms | V8 isolates are cheap enough to spin up per task. |
| **Lifetime** | Ephemeral | No persistent state by default. Instance-level state for long-running tasks as opt-in. |
| **Embeddability** | Hostable inside your process | You can run the sandbox on the user's device, not just a server. |
| **Runtime** | V8 isolates (Cloudflare's choice) | 10 years of Chrome hardening. Python, Wasm, Lisp are alternatives. |

The key inversion: **default-deny** everything and grant capabilities explicitly. This is the opposite of giving an agent a shell with `sudo` and hoping it behaves.

---

## Capability-Based Security Explanation

Capability-based security is an old idea from the Lisp / operating-systems research tradition. The core principle: **no ambient authority**. A program has no power except the capabilities (tokens of authority) that have been explicitly handed to it. There is no global filesystem access, no default network, no ambient `os.environ`. If you want to open a file, someone must give you a file handle. If you want to fetch a URL, someone must give you a fetch function bound to the allowed origins.

**Why this matters for agents:**

1. **Prompt injection becomes bounded.** An attacker can trick the model into doing bad things, but only with the capabilities the harness granted. If the sandbox can't fetch external URLs, no exfiltration. If it can't invoke `delete_customer`, no data loss.
2. **Auditability is automatic.** Every capability call is a function invocation in the sandbox; every call is logged. You can reconstruct exactly what happened.
3. **Composition is safe.** Two sandboxes with different capability sets can't interfere with each other. You can run multiple agents in parallel without worrying about ambient side effects.
4. **Recovery is cheap.** Because the sandbox is ephemeral and capabilities are explicit, killing and respawning the sandbox is a safe recovery primitive. Compare this to killing a process that may have already mutated a shared filesystem.

**Contrast with today's norm.** Most agents today run with `--dangerously-skip-permissions` or its equivalent: ambient filesystem access, ambient network, ambient shell. Capability-based security says: **start with nothing, grant deliberately**. Pai is arguing this is the only sustainable model as agents scale.

**Runtimes with capability-based security built in:**
- **V8 isolates** (what Cloudflare uses; what Chrome uses)
- **WebAssembly** (especially WASI + the component model)
- **Python** via restricted execution contexts
- **Lisp** (where the idea originated in Peter Wegner / E-language traditions)
- **Deno** (JavaScript with explicit `--allow-net`, `--allow-read`, etc.)

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Direct architectural input for our tmux orchestrator. We currently run workers with ambient shell access (`--dangerously-skip-permissions`) and communicate via tmux capture-pane plus gh CLI. Code Mode is the next step: wrap each worker in a sandboxed execution environment that exposes only the specific APIs the role needs. The two-tool reduction pattern (`search` + `execute`) maps perfectly to our gh + chrome-devtools MCP surface -- instead of 40 MCP tools in context, we could expose two code-mode tools and let the worker compose. The "inhabiting state machines" framing is the most important conceptual input for how we think about agent identity in a multi-agent orchestrator. |
| **Novelty** | 10/10 | The Code Mode pattern has been discussed in blog posts, but this is the first conference keynote that makes it fully explicit as an architectural thesis. The tic-tac-toe anecdote is new and load-bearing. The "Your next billion users are little robots" framing is new. The capability-based security pitch is a distinct angle from the usual sandboxing-for-safety discussion -- Pai is framing it as a **developer experience** play, not a safety play. The 1.2M -> 1K token reduction example is the most concrete anti-MCP data point we have in the catalogue. |
| **Actionable** | 9/10 | Every point maps to a concrete change. The highest-leverage adoptions: (1) wrap worker agents in a capability-restricted sandbox with explicit bindings instead of ambient shell access, (2) replace large MCP tool catalogues with `search`/`execute` code-mode tools, (3) add a "state inspection" tool so our workers can read git/test state directly instead of calling a chain of specialized tools, (4) add full observability/replay to every worker execution, (5) refactor worker prompts to encourage the "inhabit the state machine" mental model rather than the "dispatch tool calls" one. The main blocker is that tmux+bash is ambient-authority by construction; moving to Code Mode in our arch means introducing a V8/Deno/Wasm layer between the orchestrator and the shell. |

---

## Relevance for Orchestrator Research

**EXTREMELY HIGH.** Code Mode is a fundamental paradigm shift that directly challenges one of our core assumptions: that agents should orchestrate systems via tool calls. Pai is arguing instead that agents should **live inside** the systems they operate, as residents of a capability-bounded state machine. This has three direct implications for our orchestrator:

1. **Our tool surface is already too big.** We give workers access to tmux, git, gh, chrome-devtools MCP, file system, and shell. That's thousands of potential commands. Code Mode says: wrap them in a sandbox with explicit bindings and let the worker compose in JavaScript.

2. **"Inhabiting state machines" is the right mental model for multi-agent coordination.** Instead of workers messaging each other via a message bus (the Stripe Minions / A2A protocol model), workers share a state machine (git worktree + JSON state files + devlog) and each worker is a resident of a specific slice of that state. This is exactly what our `_bmad/orchestrator-tmux-state.json` is doing, but we haven't been thinking about it as "the state the worker inhabits."

3. **The harness is the product, not the model.** This aligns perfectly with the Lopopolo thesis from the same conference (harness engineering). Code Mode is the architectural layer **underneath** harness engineering: the safe place the harness puts the model so the harness can do its job.

For our specific orchestrator, the most actionable takeaway is that **we should stop thinking of ourselves as building an agent orchestrator and start thinking of ourselves as building a multi-state-machine harness** where each worker is a resident of one state machine (one git worktree, one issue, one set of files) and the orchestrator's job is to instantiate state machines and let agents inhabit them.

---

## Adoptable Patterns for Orchestrator Research

### 1. Capability-Bounded Worker Sandboxes

- **Today:** workers run in tmux with `claude --dangerously-skip-permissions`. Ambient shell, ambient git, ambient network.
- **Adopt:** wrap each worker in a Deno or Wasm sandbox that exposes only: `git(worktree_id)`, `fs(worktree_id, allowlist)`, `gh(repo, allowlist)`, `mcp_chrome_devtools(session_id)`, `log(message)`. No ambient shell. No ambient network.
- **Orchestrator hook:** new worker spawn script wraps the Claude process in a Deno host with explicit `--allow-*` flags scoped per worker role.

### 2. Two-Tool Reduction for Large MCP Surfaces

- **Today:** our Chrome DevTools MCP exposes 40+ tools into every worker context. That's significant context pressure.
- **Adopt:** replace with `search(query) -> tool[]` and `execute(code)` where the sandbox lets the worker run JavaScript that calls the real MCP methods. First search call populates context with relevant tools; execute call runs the composition.
- **Orchestrator hook:** build a `code-mode-mcp` shim that sits between the worker and Chrome DevTools MCP. Pai's Matt Kerry example gives us the pattern.

### 3. Worker as State-Machine Resident

- **Today:** workers receive a prompt + tools and respond with tool calls.
- **Adopt:** workers receive a prompt + a **state handle** (git worktree path + state JSON). Their job is to inspect state, mutate state, commit when done. No separate "create PR" tool -- the state is the PR.
- **Orchestrator hook:** rewrite worker spawn prompts to emphasize state inspection first, code generation second. Explicit instruction: *"You are a resident of this git worktree. Inspect the state. Make the changes. The harness will detect your mutations."*

### 4. Observability + Replay for Every Worker Execution

- **Today:** `_bmad/devlog.md` captures phase transitions; tmux capture-pane gives us console output.
- **Adopt:** structured per-worker execution log with every capability call logged as a JSON record (timestamp, worker_id, capability, args, result). Full replayability for debugging sessions from last Tuesday when the worker did something inexplicable.
- **Orchestrator hook:** add `_bmad/worker-executions/{worker_id}.jsonl` per worker with one record per capability call.

### 5. Default-Deny Network for Workers

- **Today:** workers can `curl` anywhere, which is a prompt injection attack surface.
- **Adopt:** default-deny all network from workers. Allowlist only: github.com (for gh CLI), localhost (for chrome-devtools), registry.npmjs.org (for installs). Every other fetch is blocked.
- **Orchestrator hook:** wrap worker process in a network namespace (Linux) or `pfctl` ruleset (macOS). On BSD/macOS we can use `scutil` or Endpoint Security framework. This is nontrivial but matches the capability-based security pitch.

### 6. Generative UI for the Orchestrator Dashboard

- **Today:** `pi-orchestrator/dashboard.mjs` (per MEMORY.md) is a static dashboard.
- **Adopt:** have the orchestrator generate a custom dashboard per state. User asks "what's wrong?" -> the orchestrator generates a purpose-built HTML page showing the relevant state, the stuck worker's last output, the failing test, the relevant git diff. Discarded when the user is done.
- **Orchestrator hook:** this is a Phase 3+ idea but directly applies Pai's point 8. The orchestrator's dashboard becomes generative, not static.

### 7. "Inhabit the State Machine" Worker Prompt

- **Today:** worker prompts instruct the agent to follow a process.
- **Adopt:** add a literal instruction to worker prompts: *"You are inhabiting a state machine. The state is this git worktree at {path}. Your job is to inspect the current state, understand it, and mutate it to achieve the goal. You do not dispatch tool calls; you live here."*
- **Orchestrator hook:** add to `.claude/agents/orchestrator.md` worker spawn template. Pai claims this framing change alone produces different, better behavior in his experience.

---

## Comparison to Adjacent Talks in the Catalogue

| Talk | Relation |
|------|----------|
| [Ryan Lopopolo — Harness Engineering Keynote (AIE Europe 2026)](./aie-europe-2026-ryan-lopopolo-harness-engineering.md) | **Direct complement.** Lopopolo argues "the harness is the product." Pai answers "here's what the harness should look like architecturally." Read both together as the definitive 2026 statement on agent infrastructure. Lopopolo is about the software engineering practices; Pai is about the runtime. |
| [Peter Steinberger — State of the Claw (AIE Europe 2026)](./aie-europe-2026-peter-steinberger-state-of-claw.md) | Steinberger warns about sandbox escapes via unnerfed Codex (5 in 30 min). Pai's capability-based sandbox is the architectural response. Code Mode + capability-based security is exactly the sandbox discipline Steinberger's threat model demands. |
| [Malte Ubl — AI Engineering Successor to Web Dev (AIE Europe 2026)](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md) | Ubl flags harness/exec co-location as the 1999-era security anti-pattern. Pai's capability-based sandbox with explicit bindings is the fix. These three talks (Ubl + Pai + Sally Omali on containers) form a coherent 2026 security critique-and-response. |
| [General Purpose Agents — Harness + Tool Runtime](../2026-03/general-purpose-agents-harness-tool-runtime.md) | Harrison Chase & Sam Partee argue harness + tool runtime = general purpose agent. Pai deepens this: the tool runtime should be a capability-bounded code execution sandbox, not a JSON dispatch layer. |
| [Kenton Varda / Cloudflare Workers](../../infrastructure/cloudflare-workers.md) | The tic-tac-toe anecdote features Kenton directly. Workers + Durable Objects are the substrate Code Mode runs on at Cloudflare. Worth cross-referencing if/when we catalogue Cloudflare Workers itself. |

---

## Referenced Tools / Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|--------------|-------------------|-------------------|
| Cloudflare Agents SDK | Pai's current project; the harness where Code Mode is being productized | Not yet — high-priority ingestion candidate |
| PartyKit | Pai's previous open-source project; "one Durable Object per user/room" multiplayer framework | Not yet — medium-priority ingestion candidate |
| V8 isolates | Cloudflare's chosen sandbox runtime; <5ms startup, 10yr Chrome hardening | Referenced in libghostty / ghostty entries but no dedicated page |
| Cloudflare Workers / Durable Objects | The substrate everything runs on at Cloudflare | Not yet in catalogue — recommended add |
| OpenAPI / OpenAPI JSON | Format used by search tool to return matching endpoints | Standard spec, no dedicated entry needed |
| TLDraw | The canvas app style Kenton was asking the model to generate | Related to wattenberger "what comes after IDE" post |
| Ghost in the Shell | Reference for the "inhabiting state machines" framing | N/A (cultural reference) |
| Deno | Alternative capability-based JavaScript runtime (not cited by name but implied) | Not yet |
| WebAssembly / WASI | Alternative sandboxed runtime Pai mentions | Referenced but no dedicated page |

---

## Discovery URLs

See the sidecar file `_bmad/ingest-discoveries/aie-europe-2026-sunil-pai.json` for the full list. Highest-priority discoveries:

1. **Cloudflare Agents SDK** (https://github.com/cloudflare/agents) — Pai's actual project; the reference implementation of Code Mode.
2. **PartyKit** (https://github.com/partykit/partykit) — Pai's previous open-source project; informs how he thinks about state and durable objects.
3. **Matt Kerry's Cloudflare MCP / Code Mode writeup** — the 2,600 endpoints -> 2 tools reduction needs its own article ingestion; search Cloudflare blog for "Matt Kerry Code Mode".
4. **V8 Isolates** (https://v8.dev/docs/isolates) — the sandbox runtime Cloudflare uses; worth a reference doc entry.
5. **Kenton Varda's tic-tac-toe demo** — if Kenton posted a video / writeup, it belongs in the catalogue as the canonical "inhabiting state machines" example.

---

## Action Items

- [ ] Ingest Cloudflare Agents SDK as a top-tier catalogue entry (orchestration-platforms/).
- [ ] Ingest PartyKit as a reference (infrastructure/ or developer-gui/).
- [ ] Write a reference doc on V8 isolates (infrastructure/v8-isolates.md) as the sandbox runtime baseline.
- [ ] Prototype a Deno-based capability-bounded worker sandbox for our tmux orchestrator; publish findings in `_bmad/research/code-mode-prototype.md`.
- [ ] Refactor worker spawn prompts to add the "inhabit the state machine" instruction.
- [ ] Explore a `search` + `execute` two-tool wrapper over Chrome DevTools MCP to measure token reduction.
- [ ] Add full per-capability-call logging to worker executions in `_bmad/worker-executions/`.
- [ ] Cross-link this entry with the Lopopolo harness engineering keynote as the "architectural pair" of AIE Europe 2026.
- [ ] Track down Kenton Varda's wipe coding environment / tic-tac-toe demo and ingest if available.

---

## Source & Timestamps

- **YouTube:** https://www.youtube.com/watch?v=O_IMsEg91g8&t=31697s (talk starts at ~8:48:17 in the Day 1 stream)
- **Event:** AI Engineer Europe 2026, London, 9 April 2026
- **Format:** Closing keynote Day 1, ~20 minutes
- **Related session:** Ryan Lopopolo's Harness Engineering keynote earlier the same day forms the conceptual pair
