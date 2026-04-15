# Running OpenClaw in Containers — Kubernetes for Personal AI Agents

> **Sally Omali (Principal Software Engineer, Red Hat) — AI Engineer Europe 2026, London, 9 April 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=12834s |
| Speaker | Sally Omali — Principal Software Engineer, Red Hat (Emerging Tech org, AI focus) |
| Event | AI Engineer Europe 2026, London (hosted by swyx / smol.ai) |
| Duration | ~22 min (conference talk + demo) |
| Date | 2026-04-09 |
| Related Talks | [Malte Ubl — AI Engineering as the Successor to Web Dev](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md), [Ryan Lopopolo — Harness Engineering](./aie-europe-2026-ryan-lopopolo-harness-engineering.md), [Theo Browne — Crashing Out at Anthropic and Getting Pi Pilled](./theo-browne-crashing-out-anthropic-pi-pilled.md) |
| Related Tool | [OpenClaw](../../orchestration-platforms/openclaw.md) |
| Topics | containers, podman, kubernetes, openclaw, secrets management, volumes, backup-recovery, enterprise deployment, openshift, sandboxing, agent operations, podman secrets, pvcs, skills, mcp servers, sub-agents, observability, otel, jaeger |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Sally Omali is a Principal Software Engineer at Red Hat with a decade of tenure at the company. Her first seven years were spent in Red Hat's container, Linux security, Kubernetes, and OpenShift divisions — the core of Red Hat's enterprise container platform lineage. For the past three years, she has been part of Red Hat's Emerging Tech organization with an AI focus, applying her containers-and-security background to the new wave of agent runtimes.

She self-describes as someone who "runs everything in containers" and has built and maintained her own installer tool for spinning up OpenClaw instances inside Podman. Her London talk is a practitioner-grade walkthrough of how to deploy a personal AI agent the way Red Hat deploys every other application: reproducible, isolated, portable, and explicitly sandboxed. The talk lands at a moment when OpenClaw's security model is under scrutiny (following Anthropic's OpenClaw ban and general community concern over `--dangerously-skip-permissions` style harnesses), and Omali's thesis is that the security-nightmare narrative is a deployment story, not an OpenClaw story.

---

## Main Thesis

**OpenClaw is not a security nightmare if you run it properly. Containers give you everything you need: reproducibility, isolation, portability, and an explicit security boundary.** What Red Hat has done for every other application — package it, isolate it, sandbox it, and make it portable across infrastructure from a laptop to Kubernetes — can and should be done for personal AI agents. The eventual evolution is from a single personal container on a Mac to a curated team baseline running on Kubernetes or OpenShift, with the same install tool working across both environments.

The talk is half manifesto, half live demo. The manifesto: treat agent runtimes like you treat any production workload. The demo: `podman run` your way to a sandboxed OpenClaw with encrypted API keys, persistent state volumes, SSH-boxed execution, and optional OpenTelemetry observability — in about two seconds.

---

## Talking Points (All 10)

### 1. Why Containers for OpenClaw

Omali's opening case for containers as the correct substrate for personal AI agents:

- **Reproducibility** — the image captures the entire agent environment; no "it works on my laptop" drift.
- **Isolated secrets** — API keys live in Podman secrets or Docker envvars, never in the host filesystem or shell history.
- **Portability across infrastructure** — the same image runs on a Mac laptop, x86 server, ARM, Kubernetes, or OpenShift. No rewrite between local dev and production.
- **Clean backup and recovery story** — all runtime state lives in a named volume; snapshot the volume, restore the volume, done.
- **Natural sandbox with explicit host access** — by default the container sees nothing on the host. You grant access deliberately: one mount here, one socket there. This inverts the `--dangerously-skip-permissions` problem — the container is already sandboxed, so you can give the agent full permission *inside the container* and still sleep at night.
- **Clean predictable environment** — no OS quirks, no stale Homebrew dependencies, no "why does my Python work on Monday and not Tuesday?"

Her framing: "I'd just rather have it in a container — I don't like putting stuff on my computer."

### 2. Forever Claw: The Home Setup

Omali's personal reference deployment:

- **Mclaw** is her main OpenClaw instance, running on a desk in Montreal as a long-lived "forever" agent.
- **Joy** is a Jyotish astrology sub-agent — does weekly readings and maintains her birth chart. A personal life-management agent.
- **Bruno** is a Boston Bruins briefing sub-agent that produces daily NHL playoff digests.
- The entire stack is **backed up nightly via a systemd-like service on Mac** (launchd). The volume gets snapshotted on a schedule; restoring is a single command.

The takeaway is that this is a *personal infrastructure* story, not a corporate one. If you can run your personal astrology and hockey agents this way, the enterprise version is a straight line from there.

### 3. Podman Over Docker (But Docker Still Works)

Omali strongly prefers Podman for two reasons:

- **Podman Secrets** — a first-class secrets feature where API keys are registered as secrets (`podman secret create`) and mounted into the container as files or environment variables without ever touching the image or the command line. Docker's equivalent is weaker; she uses environment variables as a fallback when working with Docker.
- **Rootless by default** — Podman's daemonless, rootless model fits the "personal agent on my laptop" story better than Docker's root daemon.

She built her **own installer tool** for OpenClaw-in-a-container specifically optimized for Podman, but notes that the same tool targets Docker as an alternative runtime. This portability point matters: teams are not forced into a Red Hat stack to adopt the pattern.

### 4. The Double Secrets Pattern

The single most directly adoptable pattern in the talk. The flow:

1. **Layer 1 (Host):** A Podman secret (or a Docker envvar in the Docker variant) holds the raw API key on the host. The container does not know about the raw value directly.
2. **Layer 2 (OpenClaw):** OpenClaw's built-in `secret_ref` feature creates a *pointer* inside OpenClaw's config that resolves to the host secret at runtime. The agent config references `secret_ref: anthropic-key`, not the raw `sk-ant-...` string.

**Why this matters:**
- **Separation of concerns** — the host rotates keys, OpenClaw config is unchanged.
- **Logs stay clean** — no raw keys in OpenClaw logs, config files, git history, or backup archives.
- **Portability** — the same OpenClaw config ships across machines; only the host secret store changes.
- **Rotation is cheap** — `podman secret rm && podman secret create` swaps keys with no config edits.

This is the kind of pattern that is immediately useful even if you never move to Kubernetes.

### 5. Enterprise Workspace Pattern (The Big Vision)

Omali's stretch vision for how teams will adopt OpenClaw at enterprise scale:

- **Curated baseline OpenClaw image for the team.** A platform engineer (or Red Hat) packages a base image with company-approved MCP servers, authentication providers, skills, and policy.
- **New hires inherit the base and personalize.** On day one, a new engineer runs `podman run` (or `oc apply`) and gets the team's standard agent — already connected to Jira, GitHub, Slack, internal docs, and the company's SSO.
- **Fan out to whole team.** Updates to the baseline propagate through image tags. When the platform team adds a new MCP server, everyone gets it on next pull.
- **Alternative ("sit next to someone and copy their repo") is the anti-pattern.** Without a curated baseline, onboarding devolves into tribal knowledge and ad-hoc clones of someone else's working directory.
- **Team standards, portable environments, reproducible onboarding** — the same three properties that made containerized app development win over "install Node the right way" documentation.

This is the practitioner-grade version of the Vercel/Ubl keynote's "Europe is leading the application layer" observation: the application layer for agents is the *team workspace image*.

### 6. Backup and Recovery via Volumes

- **All runtime state lives in a named Podman volume.** Conversation history, memory, skills, MCP server state, SSH known_hosts — everything the agent accumulates across sessions.
- **Kubernetes equivalent: PVCs** (PersistentVolumeClaims). The same mental model survives the move from `podman volume` to Kubernetes storage classes.
- **Clean story for backup.** Snapshot the volume, archive the snapshot, restore to a new container. No agent-specific backup tool required.
- **Nightly job.** Omali's Mac runs a launchd-scheduled backup of the volume every night; recovery is a command.

This directly validates the "state in volumes, compute in containers" architecture for any long-running agent.

### 7. Live Demo: The Local Installer Tool

The demo walks through the installer tool she built:

- **Named container per instance.** You give each instance a human name ("Joe", "Larry", etc.); the installer creates a container with that name and a dedicated volume.
- **Per-instance configuration.** Different ports, different model routing, different MCP servers, different skills per named instance. You can run Mclaw, Joy, and Bruno side by side on the same host without conflict.
- **Podman secret mappings for API keys.** The installer registers the API keys as Podman secrets and wires them into the container's `secret_ref` entries.
- **Works with Docker as fallback.** Same installer, same config, different runtime flag.
- **SSH sandbox feature.** You give the container an SSH key pair, and the agent executes commands inside a *further* sandboxed environment reachable only by that key. This is a double-isolation layer: the container sandboxes the agent from the host, and the SSH box sandboxes risky command execution from the container.
- **OpenRouter + Anthropic fallback.** The default model routing uses OpenRouter for model diversity with Anthropic as a fallback for reliability.
- **Optional OTel collector + Jaeger.** If you enable observability, the installer adds an OpenTelemetry collector sidecar and a Jaeger service for trace inspection. You get full agent traces without writing any instrumentation code.

The demo reportedly ran end-to-end in under a minute, grounding her claim that "people say it's hard to spin up OpenClaw. That took two seconds."

### 8. Kubernetes Deployment: Same Tool, Bigger Substrate

- **The installer works with Kubernetes unchanged.** Targets include `kind` for local dev and OpenShift for enterprise. The Podman/Docker local path and the Kubernetes path share the same config surface.
- **NVIDIA case study.** NVIDIA is running **model evaluations with OpenClaw** in a Kubernetes cluster: 10 engineers run 10 Kubernetes-hosted OpenClaw instances that periodically check model evals and report back. Omali cites this as an example of one person "doing the job of six engineers with one himself" — a small team scaling through parallel agent instances rather than headcount.
- **Implications for multi-tenant deployment.** Secrets (per-tenant), volumes (per-tenant PVCs), and networking (per-tenant namespaces) all fall out naturally from Kubernetes primitives. This is the operationally serious version of the "spawn 6 parallel workers on a laptop" story.

### 9. "Not Losing Jobs — Doing Fun Stuff"

Omali addresses the engineer-replacement anxiety head-on with a personal anecdote:

- **The shift is toward creative, outside-the-box work.** She does not have to write tedious code anymore; she spends her time on the interesting problems.
- **Public stance at Red Hat.** She announced in a Red Hat org meeting, in front of peers, that "guys, AI is 1000x better than me at writing code." Her framing: this is liberation, not replacement.
- **Some top Red Hat engineers raised eyebrows.** She holds the line. The narrative that agents are coming for your job is, in her experience, the wrong lens — the right lens is that agents remove the parts of the job you did not want to do anyway.
- **The implicit challenge to Red Hat culture.** Red Hat's engineering reputation is built on hand-crafted systems engineering. Omali is publicly arguing that the craft is evolving, not dying.

### 10. Model Switching Is Easy (And Gemma Is Great)

A short practitioner point that landed with the audience:

- **OpenRouter integration makes model swapping a config change.** GPT, Gemma, Claude, and local models all slot into the same OpenClaw instance via OpenRouter.
- **Gemma gets a specific endorsement.** Omali says Gemma is "great" for her day-to-day agent workloads, which is notable because the rest of the conference is heavily Claude- and GPT-centric.
- **Implication:** the harness and the container are the durable investment; the model is a replaceable dependency. This aligns with Ubl's model-commoditization thesis from the opening keynote of the same event.

---

## Key Quotes

> "I'd just rather have it in a container — I don't like putting stuff on my computer."

> "That's what Red Hat does — if we can't take an application and run it securely, come on, this is our golden opportunity."

> "People say it's hard to spin up OpenClaw. That took two seconds."

> "Yes, we're going to AI workloads running everywhere."

> "Guys, AI is 1000x better than me at writing code." *(to Red Hat org meeting)*

> "I don't need to write tedious code anymore — I get to do fun stuff."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly relevant if we want enterprise/Kubernetes deployment of our orchestrator. Medium relevance for our current tmux-based architecture on a single Mac — we are not the Kubernetes team. HOWEVER: the secrets and volumes patterns are immediately applicable regardless of substrate, the sandbox framing addresses our `--dangerously-skip-permissions` exposure, and the "curated team baseline" vision maps almost 1:1 to our Enterprise Workspace roadmap for SaaS clients. If our clients ever need multi-tenant agent hosting, this is the reference architecture. |
| **Novelty** | 6/10 | Containers are not new and neither is Podman secrets. What *is* novel: (1) the `secret_ref`-to-Podman-secret double layer as a concrete pattern for agent credentials; (2) the SSH-sandbox-inside-the-container double isolation for command execution; (3) the "installer tool" packaging of OpenClaw as a turnkey `podman run` experience with observability pre-wired; (4) the NVIDIA model-eval Kubernetes case study as a data point on production agent multi-instance deployment. The talk's novelty is in the operationalization, not the primitives. |
| **Actionable** | 8/10 | Three patterns are directly adoptable this week even without moving to containers: the double-secrets layering, the volume-based backup story, and the curated team baseline concept. Full container adoption is a Phase 2+ decision tied to our enterprise roadmap. |

---

## Adoptable Patterns for Orchestrator Research

### 1. Podman Secrets + OpenClaw `secret_ref` Pattern

- **Today:** Our workers run with API keys exported as environment variables by `run-tmux.sh` and inherited by the Claude Code process. Raw keys live in shell history and launchd plists.
- **Adopt:** Introduce a two-layer secrets pattern even in our tmux setup. Store API keys in macOS Keychain (or a local secret store), and have `run-tmux.sh` fetch them by reference name (`keychain-fetch anthropic-key`) before exporting. When we eventually containerize, this maps 1:1 to Podman secrets + `secret_ref`.
- **Orchestrator hook:** Replace direct envvar exports in `run-tmux.sh` with a `fetch_secret` helper that reads from Keychain. Audit every `.bmad/scripts/*.sh` for raw key usage. Document the pattern in `CLAUDE.md`.

### 2. Workspace Base Template for Teams

- **Today:** Every new project starts with `./run-tmux.sh <target-project-dir>` and inherits whatever is in the user's `~/.claude/` directory plus the project's `CLAUDE.md`. Onboarding is implicit.
- **Adopt:** Create a "curated baseline" workspace template that captures our MCP servers (Chrome DevTools, playwright-mcp, etc.), our skills, our `.claude/commands/*`, and our reviewer/fixer agent personas as a single pullable artifact. New contractor or SaaS client gets the baseline and personalizes from there. This is the pattern Omali is describing, just without the container yet — for now it can be a git submodule or a starter template repo.
- **Orchestrator hook:** Create `~/Desktop/code2/orchestrator-baseline/` as a reference template repo. Add a `bootstrap` command to our CLI that clones the baseline into a new project and runs `run-tmux.sh`.

### 3. Volume-Based Backup Story

- **Today:** State lives in `_bmad/orchestrator-tmux-state.json`, `.bmad/devlog.md`, `_bmad/agent-activity.jsonl`, and scattered worker session logs under `~/.claude/projects/`. There is no nightly backup. If a worker trashes the filesystem, we lose everything back to the last git commit.
- **Adopt:** Treat `_bmad/` and `~/.claude/projects/<project>/` as the orchestrator's "volume" and add a nightly launchd job that tarballs them to a backup location (external disk, iCloud, S3). Recovery becomes `tar xf <snapshot>` + restart tmux. This is the pre-container version of Omali's PVC story and costs an hour to set up.
- **Orchestrator hook:** Add `.bmad/scripts/nightly-backup.sh` and a launchd plist. Document restore procedure in `/tmux-recovery`.

### 4. Kubernetes Deployment Pattern for Enterprise Clients

- **Today:** Aspirational. Our orchestrator runs on a single Mac with tmux; there is no multi-tenant story.
- **Adopt (Phase 3+):** When a SaaS client needs multi-tenant agent hosting, follow Omali's path: package the orchestrator as a container image, run it on OpenShift or a kind cluster, use PVCs for per-tenant state, use Kubernetes secrets + `secret_ref` for per-tenant API keys, use namespaces for isolation. The same `run-tmux.sh` logic moves into an init container or a Kubernetes Job. NVIDIA's 10-engineer / 10-instance model eval deployment is the reference case study.
- **Orchestrator hook:** Add a "Kubernetes deployment" section to `research/catalogue/reference/deterministic-harness-blueprint.md` or create `research/catalogue/reference/kubernetes-deployment-reference.md` with this talk as source.

### 5. SSH-Box Inside the Container (Double Isolation)

- **Today:** Workers run arbitrary bash commands directly against the host filesystem and network under `--dangerously-skip-permissions`. Worst case blast radius is the entire laptop.
- **Adopt:** Even without containers, we can introduce an SSH-sandbox pattern for risky command execution. Spin up a local lightweight VM (OrbStack, Lima, or UTM) with SSH, give the worker a dedicated keypair, and route "destructive" commands (anything matching DCG patterns) through SSH into the VM. The VM snapshot becomes the recovery surface.
- **Orchestrator hook:** Experiment with Lima or OrbStack as an SSH sandbox target. Wire DCG (Destructive Command Guard) to divert matched commands into the SSH box instead of blocking them outright. This gives us "agent can do destructive things, but only in a disposable VM" as a first-class pattern.

### 6. OTel + Jaeger Observability Sidecar (Optional)

- **Today:** Observability = `tmux capture-pane` + `devlog.md` + manual grep.
- **Adopt (lower priority):** When we start running 3+ concurrent workers for extended periods, wire up an OpenTelemetry collector and Jaeger for trace inspection. Claude Code's OTel support is mature; this is a config change, not a rewrite. Helps diagnose "why is worker 4 stuck" without capture-pane gymnastics.
- **Orchestrator hook:** Add an optional `OTEL=1` flag to `run-tmux.sh` that spawns a Jaeger container alongside the tmux session. Document in `/debug`.

### 7. Anti-Pattern to Avoid: Running Agent and Host in the Same Trust Boundary

This is the same point Ubl made in his opening keynote about harness/exec co-location as a "1999-era security hole." Omali's talk is the operational answer to Ubl's critique: **the fix is containers**. Our current tmux setup shares a trust boundary with the agent (the Mac user account). Every adoptable pattern above is a step toward narrowing that boundary.

---

## Comparison to Related AIE Europe 2026 Talks

| Talk | Shared Themes | Divergent Angle |
|------|---------------|-----------------|
| [Malte Ubl — AI Engineering as the Successor to Web Dev](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md) | Harness security as a 1999-style security hole; Europe as the AI engineering leader (OpenClaw/Vienna is specifically cited) | Ubl frames the problem; Omali ships the solution (containers). Omali's talk is the operational answer to Ubl's critique. |
| [Ryan Lopopolo — Harness Engineering](./aie-europe-2026-ryan-lopopolo-harness-engineering.md) | Treating the harness as the product; reproducibility and legibility as first-class concerns | Lopopolo focuses on *what the agent sees* (codebase legibility, prompts-as-lint); Omali focuses on *what the agent runs inside* (container, secrets, volumes). They are complementary — harness content + harness substrate. |
| [Theo Browne — Crashing Out at Anthropic and Getting Pi Pilled](./theo-browne-crashing-out-anthropic-pi-pilled.md) | OpenClaw's community reputation and Anthropic's OpenClaw ban form the backdrop | Theo treats OpenClaw as having a governance/security problem that Anthropic reacted to; Omali treats that same reputation as a deployment problem solvable with containers. Opposite conclusions about OpenClaw's viability. |
| [OpenClaw catalogue entry](../../orchestration-platforms/openclaw.md) | OpenClaw's core architecture (lane queuing, context checkpoints, skills) | This talk adds the missing "how do we actually run it safely" layer that the OpenClaw docs do not emphasize. |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenClaw | The entire talk — packaged inside a container with Podman secrets, volumes, and SSH sandbox | [Yes — orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) |
| Podman | Preferred container runtime; Podman Secrets feature is the hook for the double-secrets pattern | No — standard Red Hat tooling |
| Podman Secrets | First-class secrets API; raw keys registered on host, mounted into container by reference | No — consider reference note |
| Docker | Fallback runtime; same installer works, secrets via envvars instead of Podman Secrets | No — standard tooling |
| OpenShift | Red Hat's enterprise Kubernetes; target for the enterprise deployment pattern | No |
| Kubernetes (kind) | Local dev Kubernetes target for the same install tool | No — standard tooling |
| PVCs (PersistentVolumeClaims) | Kubernetes equivalent of Podman volumes for agent state | No — standard Kubernetes primitive |
| OpenRouter | Model routing; Gemma + Claude + GPT swap via config | No — worth cataloguing |
| Anthropic Claude (fallback) | Model fallback in Omali's default setup | Referenced throughout catalogue |
| Gemma | "Great" per Omali's use; routed via OpenRouter | No — worth noting as local-friendly model |
| OpenTelemetry (OTel) collector | Optional observability sidecar for agent traces | Referenced in observability section |
| Jaeger | Trace visualization service paired with OTel collector | No — worth adding to observability category |
| launchd (systemd-equivalent on Mac) | Nightly volume backup scheduler | No — standard macOS tooling |
| `secret_ref` (OpenClaw feature) | OpenClaw's pointer-to-host-secret indirection | Referenced via OpenClaw entry |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://docs.podman.io/en/latest/markdown/podman-secret.1.html | Podman Secrets reference — the foundation for the double-secrets pattern | `/ingest-article` |
| https://github.com/openclaw/openclaw | OpenClaw repo — specifically the `secret_ref` feature and any published container image | Already catalogued |
| https://www.redhat.com/en/topics/containers | Red Hat's containers narrative — provides the cultural/strategic backdrop for why Omali's talk lands the way it does at Red Hat | `/ingest-article` (low priority) |
| https://kubernetes.io/docs/concepts/storage/persistent-volumes/ | PVC reference for the Kubernetes port of the volume-backup pattern | Standard reference |
| https://www.openshift.com/ | OpenShift as the enterprise target for the Kubernetes deployment pattern | `/ingest-article` (Phase 3+) |
| https://openrouter.ai/ | OpenRouter model routing used in the demo for Gemma/Claude/GPT swapping | `/ingest-article` |
| https://www.jaegertracing.io/ | Jaeger for the OTel observability sidecar | `/ingest-article` (low priority) |

---

## Action Items

- [ ] Implement the double-secrets pattern for `run-tmux.sh`: API keys in macOS Keychain, fetched by reference at worker spawn time. Audit all `.bmad/scripts/*.sh` for raw envvar key usage.
- [ ] Set up nightly backup of `_bmad/` and `~/.claude/projects/<project>/` via launchd; document restore in `/tmux-recovery`.
- [ ] Evaluate Lima or OrbStack as an SSH-sandbox target for DCG-matched destructive commands.
- [ ] Create an `orchestrator-baseline` reference template repo that captures our standard MCP servers, skills, agent personas, and `.claude/commands/*` for new projects and future SaaS clients.
- [ ] Add a Phase 3+ Kubernetes deployment reference document that uses this talk plus the NVIDIA case study as the architectural source of truth.
- [ ] Research OpenClaw's `secret_ref` feature specifically — is there an equivalent in Claude Code or Pi that we should use in the interim?
- [ ] Evaluate Gemma via OpenRouter for cost-sensitive worker lanes (e.g., linting, formatting, doc generation) where Claude Opus is overkill.
- [ ] Watch for the public release of Omali's installer tool (she references it but did not name-drop a repo in the transcript); if it ships as open source, catalogue it under `infrastructure/`.
