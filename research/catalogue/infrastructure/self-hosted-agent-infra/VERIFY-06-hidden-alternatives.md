# VERIFY-06: Hidden Alternatives -- Self-Hosted Agent Sandbox Deep Search (v2)

**Date**: 2026-04-04 (original) | 2026-04-14 (updated with deep search v2)
**Scope**: Every self-hostable agent sandbox/runtime NOT yet evaluated in our catalogue
**Methodology**: Web deep search across 40+ queries, GitHub repo analysis, README extraction, blog post verification
**Already Evaluated**: E2B (catalogue), Daytona (VERIFY-01/02), microsandbox (VERIFY-03)

---

## Executive Summary

The agent sandbox landscape has exploded since early 2026. We found **34 distinct projects** worth tracking (up from 28 in v1), organized into 6 tiers. The 7 original investigation targets are now fully assessed.

### What Changed in v2

- Added **6 new discoveries**: Hazmat, Agent Safehouse, SandVault, Trail of Bits devcontainer, AIO Sandbox, Moltworker
- Upgraded **Coder** assessment with Coder Tasks details
- Added **Anthropic official devcontainer** as standalone entry with firewall architecture
- Added **Apple Containers** (macOS-native, pre-1.0)
- Verified all 7 original investigation targets (OpenHands, Coder, DevPod, Piston, Sysbox, nsjail/bubblewrap/firejail, Anthropic devcontainer)

### Top 5 Gaps in Our Catalogue

1. **nono** -- Kernel-enforced sandbox, works on macOS+Linux, built-in Claude Code profiles, Apache-2.0
2. **Anthropic sandbox-runtime (srt)** -- Anthropic's own open-source sandbox for Claude Code, 3.7k stars
3. **OpenSandbox (Alibaba)** -- Full-featured, Apache-2.0, Docker+K8s, multi-language SDKs, 10k stars
4. **Hazmat** -- TLA+-verified macOS containment, pf firewall + user isolation + backup/rollback
5. **Docker Sandboxes** -- Official Docker product, microVM isolation, free, supports Claude Code natively

**Paywall Risk Assessment**: Most discoveries are genuinely open-source. Worst offenders: Runloop (fully proprietary), ComputeSDK (proprietary gateway), Ash (closed-source macOS tool), Cloudflare Dynamic Workers (edge-only).

---

## ORIGINAL INVESTIGATION TARGETS (7 Items Fully Assessed)

### 1. OpenHands (formerly OpenDevin)

| Field | Value |
|-------|-------|
| URL | https://github.com/All-Hands-AI/OpenHands |
| Stars | 50,000+ |
| License | MIT |
| Platforms | Any (Docker required) |
| Isolation | Docker containers per session, REST API server inside sandbox |
| Claude Code Inside | NO -- OpenHands IS an agent, not a sandbox for other agents |
| Self-Hosted | YES -- Docker Compose |
| Paywalled | NO (OpenHands Cloud exists as managed option) |

**Architecture**: For each task session, OpenHands spins up a securely isolated Docker container sandbox. All actions from the event stream are executed inside it, connected through a REST API server running inside the container. Default image: `nikolaik/python-nodejs:python3.12-nodejs22`. Customizable via any Debian-based Dockerfile.

**V1 SDK Redesign (2026)**: V0 deprecated April 2026. Moving from mandatory Docker to optional sandboxing with LocalWorkspace by default for lower friction.

**Can Claude Code CLI Run Inside?** Technically yes (you can customize the Docker image to include it), but that's not the intended use. OpenHands has its own agent loop -- you'd be running an agent inside an agent framework.

**Verdict**: NOT an agent sandbox. It IS an agent platform with built-in sandboxing for its own agents. Wrong category for our use case.

---

### 2. Coder

| Field | Value |
|-------|-------|
| URL | https://github.com/coder/coder |
| Stars | 118,000+ |
| License | AGPL-3.0 (open-core, Premium tier available) |
| Platforms | Any (Terraform-based provisioning) |
| Isolation | Full workspace isolation (VM, K8s pod, or Docker container per workspace) |
| Claude Code Inside | YES -- first-class support via Coder Tasks |
| Self-Hosted | YES -- `coder server` for local, PostgreSQL 13+ for production |
| Paywalled | Community Edition free + unlimited. Premium: audit logging, RBAC, HA, multi-org |

**Architecture**: Development environments defined as Terraform templates. Coder provisions workspaces on EC2 VMs, K8s pods, Docker containers -- anything Terraform can manage. Secure Wireguard tunnel for connectivity. Auto-shutdown of idle resources.

**Coder Tasks (2026)**: A chat-based UI inside Coder to run and manage coding agents. Each task runs in its own isolated Coder workspace. Supports Claude Code, Codex CLI, any terminal-based agent. Pre-install agents via Coder Template modules. Community+Premium deployments include 1,000 Agent Workspace Builds for POC.

**Anthropic Partnership**: Blog post "Building for 2026: Why Anthropic Engineers Are Running Claude Code Remotely with Coder" -- Anthropic themselves use Coder for remote agent execution. "Lethal traffic" security model: proprietary data, internet, and untrusted data never coexist in one agent.

**Personal Hardware**: YES. Run `coder server` locally. But it's designed for team/enterprise scale -- overkill for a single developer on a Mac unless you want Terraform-managed environments.

**Verdict**: Production-grade dev environment platform with genuine Claude Code support. AGPL license is a concern. Best for teams, not solo operators. Community Edition is genuinely free.

---

### 3. DevPod

| Field | Value |
|-------|-------|
| URL | https://github.com/loft-sh/devpod |
| Stars | High (established project) |
| License | Apache-2.0 |
| Platforms | macOS, Linux, Windows (client-only) |
| Isolation | devcontainer-based (Docker, K8s, SSH targets, cloud VMs) |
| Claude Code Inside | YES -- via devcontainer customization |
| Self-Hosted | YES -- fully client-side, no server component |
| Paywalled | NO |

**Architecture**: Client-only tool creating reproducible dev environments from `devcontainer.json` on any backend: local Docker, any cloud provider, K8s clusters, or SSH targets. 5-10x cheaper than Codespaces because it uses bare VMs with auto-shutdown. Desktop app abstracts complexity.

**Claude Code Integration**: DevPod's devcontainer support means you can use Anthropic's official devcontainer features (`ghcr.io/anthropics/devcontainer-features/claude-code:1.0`) directly. `--dangerously-skip-permissions` is safe inside the container.

**2026 Status**: Some developers have moved to **crib**, a smaller devcontainer runner that uses `docker exec` instead of SSH. DevPod itself remains actively maintained.

**Verdict**: Good infrastructure for provisioning environments, but NOT purpose-built for agent sandboxing. No agent-specific isolation features, no MCP server, no network firewall by default. Use it as the provisioning layer, add sandbox config yourself.

---

### 4. Piston

| Field | Value |
|-------|-------|
| URL | https://github.com/engineer-man/piston |
| Stars | 2,700 |
| License | MIT |
| Platforms | Linux (Docker) |
| Isolation | Isolate (Linux namespaces + cgroups + chroot + unprivileged users) |
| Claude Code Inside | NO -- stateless code execution engine |
| Self-Hosted | YES -- Docker Compose |
| Paywalled | Public API paywalled Feb 2026; self-hosted remains free |

**Architecture**: POST code snippets to `/api/v2/execute`. 100+ languages. Network disabled by default. 3-second execution timeout. 256 process cap per execution. Battle-tested for competitive programming platforms.

**2026 Change**: Public API no longer freely available (Feb 15, 2026). Authorization only for non-commercial, low-volume, educational use. Self-hosting remains fully open.

**Can Claude Code Run Inside?** NO. Piston executes code snippets, not interactive agent sessions. No persistent filesystem, no shell access, no long-running processes. It's a code execution engine, not an agent sandbox.

**Verdict**: Wrong tool for agent sandboxing. Good for running untrusted code snippets (e.g., eval harness). Not for persistent agent sessions.

---

### 5. Sysbox (Nestybox / Docker)

| Field | Value |
|-------|-------|
| URL | https://github.com/nestybox/sysbox |
| Stars | Moderate |
| License | Open source (Nestybox acquired by Docker 2022) |
| Platforms | Linux only |
| Isolation | Enhanced OCI runtime: user-namespace remapping, Docker-in-Docker without privileged |
| Claude Code Inside | Indirectly -- as infrastructure primitive |
| Self-Hosted | YES |
| Paywalled | NO (community-maintained, not officially Docker-supported) |

**Architecture**: Next-generation `runc` that enables rootless containers to run systemd, Docker, K8s inside containers without privileged mode. Root in container maps to unprivileged user on host. Secure Docker-in-Docker without host socket mounts.

**Agent Sandbox Relevance**: Sysbox is an infrastructure primitive, not an agent sandbox. You COULD build agent sandboxes on top of it, but nobody in the agent ecosystem does. Docker's own Sandboxes product uses microVMs instead of Sysbox. The inner Docker is totally isolated from the host Docker -- useful if your agent needs to build/run containers.

**Verdict**: Useful infrastructure component for Docker-in-Docker scenarios. Not an agent sandbox solution itself. Docker Sandboxes (microVM-based) supersedes this for agent use cases.

---

### 6. nsjail / bubblewrap / firejail (Linux Sandboxing Primitives)

These are sandboxing primitives, not agent tools. Here's who uses them:

| Tool | Mechanism | Used By (Agent Ecosystem) | macOS | Root Required |
|------|-----------|--------------------------|-------|---------------|
| **bubblewrap** | User namespaces, PID/IPC/UTS isolation | Claude Code (Linux), ai-jail, jailed-agents, Flatpak | NO | NO |
| **nsjail** | Namespaces + seccomp-bpf + cgroups | Windmill (production), Google internal | NO | NO |
| **firejail** | setuid root + namespaces | Some community projects | NO | YES (setuid) |

**bubblewrap (bwrap)**: ~50KB binary, ~4000 lines of C, maintained by GNOME team. Claude Code uses it on Linux. AI-jail wraps it in Rust with per-project configs. Agents have bypassed it -- a Claude Code agent at Ona discovered `/proc/self/root/usr/bin/npx` to escape the denylist, then disabled bubblewrap entirely.

**nsjail**: Google's production sandboxer. Windmill uses it with sub-20ms startup for AI sandbox annotations. Zero-daemon design. Best for workflow/batch execution, not interactive sessions.

**firejail**: Requires setuid root -- "trusting setuid to protect against agents already running on your system is contradictory." Not recommended for agent sandboxing.

**Verdict**: bubblewrap is the go-to Linux primitive (used by Claude Code itself). nsjail is better for production workflow engines. firejail is not recommended. None of these work on macOS (macOS uses Seatbelt/sandbox-exec instead).

---

### 7. Anthropic Official DevContainer

| Field | Value |
|-------|-------|
| URL | https://github.com/anthropics/claude-code/tree/main/.devcontainer |
| Feature | `ghcr.io/anthropics/devcontainer-features/claude-code:1.0` |
| License | Anthropic (reference implementation) |
| Platforms | Any OS with Docker + VS Code Dev Containers extension |
| Isolation | Docker container + iptables firewall + domain allowlist |
| Claude Code Inside | YES -- purpose-built |
| Self-Hosted | YES -- local Docker |
| Paywalled | NO |

**Three Components**:
1. **devcontainer.json**: Container settings, extensions, volume mounts, postStartCommand
2. **Dockerfile**: Ubuntu base, Node.js 20, git, ZSH, fzf, essential dev tools
3. **init-firewall.sh**: Multi-layered network security

**Firewall Architecture** (init-firewall.sh):
- Extracts Docker DNS rules before flushing to maintain internal resolution
- Resolves specific domains: `registry.npmjs.org`, `api.anthropic.com`, `statsig.com` via `dig`
- Fetches dynamic GitHub IP ranges via `/meta` API
- Adds all to `allowed-domains` ipset
- Default-deny policy blocks all other outbound
- Permits DNS and SSH outbound
- Validates rules on startup

**Security Warning**: "Devcontainers don't prevent a malicious project from exfiltrating anything accessible in the devcontainer including Claude Code credentials. Only use with trusted repositories."

**Key Feature**: Runs `claude --dangerously-skip-permissions` safely due to container isolation + firewall.

**Verdict**: THE official reference. If you want to sandbox Claude Code in Docker, start here. The firewall is production-quality. But the devcontainer feature silently overwrites custom `init-firewall.sh` (known issue #32113).

---

## Tier 1: HIGH RELEVANCE -- Should Evaluate Immediately

### 8. nono (always-further/nono)

| Field | Value |
|-------|-------|
| URL | https://github.com/always-further/nono |
| Stars | 1,800 |
| License | Apache-2.0 |
| Last Update | 2026-04-12 (v0.33.0) |
| Platforms | macOS, Linux, WSL2 |
| Isolation | Landlock (Linux) + Seatbelt (macOS), kernel-enforced, irreversible |
| Claude Code | YES -- built-in profile at docs.nono.sh/cli/clients/claude-code |
| Self-Hosted | YES -- fully local, `brew install nono` |
| Paywalled | NO |

Zero-infrastructure kernel sandbox. Once restrictions are applied, not even nono itself can lift them. Capability-based whitelist model. Credential injection via proxy keeps API keys outside sandbox. Supports multiplexing (multiple agents in parallel sandboxes). Sigstore-based attestation. Content-addressable snapshots with SHA-256 dedup and rollback.

**Verdict**: STRONG CANDIDATE for our tmux orchestrator. Zero overhead, no Docker dependency, works on macOS natively.

---

### 9. Anthropic sandbox-runtime (srt)

| Field | Value |
|-------|-------|
| URL | https://github.com/anthropic-experimental/sandbox-runtime |
| Stars | 3,700 |
| License | Research preview (check repo) |
| Platforms | macOS (sandbox-exec), Linux (bubblewrap) |
| Isolation | OS-level primitives, no container required |
| Claude Code | YES -- built specifically for Claude Code |
| Self-Hosted | YES -- lightweight CLI/library |
| Paywalled | NO |

Anthropic's own sandbox for Claude Code. Native OS sandboxing (sandbox-exec on macOS, bubblewrap on Linux). Deny-then-allow filesystem model. Network domain allowlisting via proxy (HTTP + SOCKS5). Unix socket access control. Violation monitoring via system logs. Library and CLI interfaces. Integrates with MCP servers.

**Verdict**: ESSENTIAL to evaluate. This is from the Claude Code team itself.

---

### 10. OpenSandbox (Alibaba)

| Field | Value |
|-------|-------|
| URL | https://github.com/alibaba/OpenSandbox |
| Stars | 10,000 |
| License | Apache-2.0 |
| Last Update | Active 2026 |
| Platforms | Docker, Kubernetes |
| Isolation | Docker containers + optional gVisor/Kata/Firecracker |
| Claude Code | YES -- explicitly listed in documentation |
| Self-Hosted | YES -- Docker Compose or K8s, TOML config |
| Paywalled | NO |

Most feature-complete open-source sandbox. FastAPI server for lifecycle management. Multi-language SDKs (Python, Java/Kotlin, JS/TS, C#/.NET, Go). Browser automation via Chrome+Playwright. Desktop environments with VNC. VS Code integration. Network controls with per-sandbox egress filtering. In CNCF Landscape.

**Verdict**: Apache-2.0 is the right license. Production-ready. Best for Docker/K8s deployments.

---

### 11. Hazmat (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/dredozubov/hazmat |
| Stars | New (trending on HN/Lobsters) |
| License | Open source |
| Platforms | macOS |
| Isolation | User isolation + kernel sandbox (Seatbelt) + pf firewall + DNS blocklist |
| Claude Code | YES -- supports Claude Code, OpenCode, Codex |
| Self-Hosted | YES -- fully local |
| Paywalled | NO |

**Unique selling point**: TLA+-verified containment model. Setup/rollback ordering formally verified (26,905 states, 3 real bugs found during verification). Multi-layered: dedicated user identity + kernel-level sandbox + pf firewall rules scoped to agent user + DNS blocklist + backup/rollback.

Formal verification covers: setup ordering, seatbelt policy structure, backup safety, version migration, session-time host permission repairs, harness lifecycle state, Tier 3 launch containment, Tier 2/3 core policy equivalence, native launch fd isolation.

**Verdict**: The only TLA+-verified agent sandbox we've found. For security-conscious macOS users who want mathematical proof of containment properties.

---

### 12. Docker Sandboxes (Official)

| Field | Value |
|-------|-------|
| URL | https://docs.docker.com/ai/sandboxes/ |
| Stars | N/A (Docker product) |
| License | Experimental, currently free |
| Last Update | 2026-03 (Docker Desktop 4.60+) |
| Platforms | macOS, Windows (Docker Desktop required) |
| Isolation | Dedicated microVM per agent -- separate kernel, Docker daemon, filesystem, network |
| Claude Code | YES -- `docker sandbox run claude-code` |
| Self-Hosted | YES -- runs locally via Docker Desktop |
| Paywalled | Currently free (experimental). Future pricing unclear. |

Each agent gets its own microVM. Network proxy with domain allowlists. Agents can build and run Docker containers INSIDE the sandbox (Docker-in-Docker natively). Supports Claude Code, Gemini CLI, Copilot CLI, Codex, Kiro, OpenCode.

**Limitations**: Requires Docker Desktop (not just Engine). macOS/Windows only (no headless Linux server). Experimental.

**Verdict**: Lowest barrier to entry. One-command solution if you have Docker Desktop.

---

### 13. Rivet agent-os

| Field | Value |
|-------|-------|
| URL | https://github.com/rivet-dev/agent-os |
| Stars | 2,700 |
| License | Apache-2.0 |
| Last Update | 2026-04-02 (v0.1.1) |
| Platforms | Any (Rust binary, WASM+V8) |
| Isolation | WebAssembly sandbox + V8 isolates, deny-by-default permissions |
| Claude Code | YES -- supports Pi, Claude Code, Codex |
| Self-Hosted | YES -- single Rust binary |
| Paywalled | NO |

Radically different architecture. No VMs, no containers. WASM+V8 isolates in-process. Cold start p50: 4.8ms (92x faster than E2B). Memory: ~22-131MB vs 1GB+. Pluggable filesystem backends (S3, Google Drive, SQLite).

**Verdict**: Fascinating for high-throughput orchestration. WASM isolation is weaker than VM -- not for truly untrusted code.

---

## Tier 2: STRONG -- Worth Detailed Evaluation

### 14. Agent Safehouse (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/eugene1g/agent-safehouse |
| Stars | Growing (HN front page) |
| License | Open source |
| Platforms | macOS only |
| Isolation | macOS sandbox-exec (Seatbelt), kernel-level enforcement |
| Claude Code | YES -- pre-built profile |
| Self-Hosted | YES -- `brew install eugene1g/safehouse/agent-safehouse` |
| Paywalled | NO |

Single self-contained Bash script (99.8% Bash). Zero dependencies. Deny-first model -- everything blocked, then explicitly allow. Pre-built profiles for 12+ agents: Claude Code, Codex, OpenCode, Amp, Gemini CLI, Aider, Goose, Auggie, Pi, Cursor Agent, Cline, Kilo Code, Droid. Smart HOME handling: agents can list directory metadata but can't read contents unless allowed. Interactive Policy Builder web UI at agent-safehouse.dev.

**Verdict**: 30-second setup. Immediately prevents SSH key, cloud credential, and browser data exfiltration. Best quick-win for macOS.

---

### 15. SandVault (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/webcoyote/sandvault |
| Stars | Modest |
| License | Apache-2.0 |
| Platforms | macOS |
| Isolation | Dedicated macOS user account + sandbox-exec |
| Claude Code | YES -- runs with `--dangerously-skip-permissions` |
| Self-Hosted | YES |
| Paywalled | NO |

Defense-in-depth via limited user account + sandbox-exec. Fast context switching (no VM overhead, instant user switching). Passwordless account switching. Shared workspace at `/Users/Shared/sv-$USER`. Also supports Codex, Gemini, Cursor.

**Related**: Same author created **ClodPod** (full macOS VM via Tart) for maximum isolation.

**Verdict**: Clever Unix approach -- user-level isolation is underrated. Lightweight and effective.

---

### 16. Trail of Bits claude-code-devcontainer (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/trailofbits/claude-code-devcontainer |
| License | Open source |
| Platforms | Any (Docker) |
| Isolation | Docker container + optional iptables firewall |
| Claude Code | YES -- auto-configures bypassPermissions |
| Self-Hosted | YES |
| Paywalled | NO |

Built by Trail of Bits for security audits and untrusted code review. Ubuntu 24.04 base with Node.js 22, Python 3.13, zsh. Persistent volumes for command history, Claude config, GitHub CLI. Host `.gitconfig` mounted read-only. Multiple usage patterns: isolated (per-project containers) or grouped (single container, multiple repos).

**Key tools**: `devc .` (start), `devc rebuild` (preserve volumes), `devc destroy` (cleanup), `devc sync` (copy session logs), `devc mount` (add host dirs).

Trail of Bits uses this in production: "AI-augmented auditors are finding 200 bugs a week on the right engagements."

**Verdict**: Security-auditor-grade devcontainer. If Anthropic's official devcontainer is the reference, this is the hardened variant.

---

### 17. AIO Sandbox (agent-infra/sandbox) (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/agent-infra/sandbox |
| Stars | 4,200 |
| License | Open source |
| Platforms | Any (Docker) |
| Isolation | Docker container with unified service mesh |
| Claude Code | Not explicitly, but generic agent support |
| Self-Hosted | YES -- Docker Compose or K8s |
| Paywalled | NO |

All-in-one: Browser automation (VNC, CDP, MCP), VSCode Server, Shell terminal, File operations, Jupyter Notebook, MCP servers -- all in a single Docker container sharing a filesystem. Files downloaded in browser are instantly available in shell. Quick start: `docker run ghcr.io/agent-infra/sandbox:latest`.

**Verdict**: Good for agents that need browser+shell+IDE in one environment. Not security-focused.

---

### 18. ai-jail (akitaonrails)

| Field | Value |
|-------|-------|
| URL | https://github.com/akitaonrails/ai-jail |
| Stars | 248 |
| License | GPL-3.0 |
| Platforms | Linux (bubblewrap + Landlock), macOS (sandbox-exec) |
| Isolation | Multi-layer: namespaces + Landlock LSM + Seccomp-BPF |
| Claude Code | YES |
| Self-Hosted | YES |
| Paywalled | NO |

880KB Rust binary, 124 tests, 4 dependencies. Per-project `.ai-jail` TOML configs (committable). GPU/Docker/display passthrough. Lockdown mode for untrusted code. Agents cannot disable it (unlike Claude Code's built-in sandbox).

**macOS limitation**: sandbox-exec with SBPL profiles. Metal/GPU and Display restrictions limited.

**Caveat**: GPL-3.0 license is copyleft.

---

### 19. mattolson/agent-sandbox

| Field | Value |
|-------|-------|
| URL | https://github.com/mattolson/agent-sandbox |
| Stars | 163 |
| License | MIT |
| Last Update | 2026-04-11 (v0.13.0) |
| Platforms | Docker (any OS) |
| Isolation | mitmproxy sidecar + iptables firewall |
| Claude Code | YES -- full support |
| Self-Hosted | YES |
| Paywalled | NO |

Dual-layer network enforcement: mitmproxy sidecar for domain allowlisting at HTTP/HTTPS level, iptables firewall blocks all direct outbound. Devcontainer mode for VS Code/JetBrains.

---

### 20. jailed-agents (Nix + jail.nix)

| Field | Value |
|-------|-------|
| URL | https://github.com/andersonjoseph/jailed-agents |
| Stars | 51 |
| License | MIT |
| Platforms | Linux (Nix + bubblewrap) |
| Claude Code | YES -- `makeJailedClaudeCode` builder |
| Self-Hosted | YES |
| Paywalled | NO |

Declarative Nix-native approach. Pre-configured builders for claude-code, crush, gemini-cli, opencode, pi.

---

### 21. Rivet sandbox-agent

| Field | Value |
|-------|-------|
| URL | https://github.com/rivet-dev/sandbox-agent |
| Stars | 1,300 |
| License | Apache-2.0 |
| Platforms | Any (Rust binary) |
| Claude Code | YES |

Universal HTTP API adapter for controlling agents inside any sandbox. One API for Claude Code, Codex, OpenCode, Cursor, Amp, Pi. Standardized event schema. Streams to Postgres/ClickHouse. Built-in inspector UI.

---

### 22. Zeroboot

| Field | Value |
|-------|-------|
| URL | https://github.com/zerobootdev/zeroboot |
| Stars | 2,100 |
| License | Apache-2.0 |
| Platforms | Linux with KVM |
| Isolation | Firecracker microVM snapshots, copy-on-write forking |

Sub-millisecond VM spawns: p50=0.79ms, p99=1.74ms. ~265KB memory per sandbox. 190x faster than E2B. No networking inside sandboxes. Best for batch execution and evals.

---

### 23. Netclode

| Field | Value |
|-------|-------|
| URL | https://github.com/angristan/netclode |
| Stars | 117 |
| Platforms | Linux (k3s + Kata Containers) |
| Claude Code | YES |

Self-hosted cloud coding agent with native iOS/macOS app. JuiceFS for persistent storage. Tailscale networking. Local LLMs via Ollama. Pre-booted Kata VMs eliminate cold starts. Secret isolation. 871 commits.

---

### 24. Lima (CNCF)

| Field | Value |
|-------|-------|
| URL | https://github.com/lima-vm/lima |
| Stars | ~20,000 |
| License | Apache-2.0 |
| Platforms | macOS (primary), Linux |
| Isolation | Full Linux VM via QEMU/Virtualization.framework |

CNCF Incubating project. v2.0 added GPU acceleration via krunkit and MCP server for AI agents. v2.1 added macOS guest support and enhanced AI agent safety. Presented at KubeCon EU 2026. Most mature VM-based option for macOS.

---

## Tier 3: SPECIALIZED -- Useful for Specific Scenarios

### 25. Kubernetes SIG agent-sandbox

| Field | Value |
|-------|-------|
| URL | https://github.com/kubernetes-sigs/agent-sandbox |
| Stars | 1,800 |
| License | Apache-2.0 |
| Isolation | K8s CRD + gVisor/Kata Containers |
| Status | v0.3.10 (April 2026), v1alpha1 API |

Official Kubernetes SIG Apps project. CRD+controller for stateful, singleton AI agent workloads. SandboxTemplate, SandboxClaim, SandboxWarmPool resources. Only relevant if you already run Kubernetes. Not yet production-stable.

---

### 26. ClodPod

| Field | Value |
|-------|-------|
| URL | https://github.com/webcoyote/clodpod |
| Stars | 110 |
| License | Apache-2.0 |
| Platforms | macOS (Apple Silicon) |

Full macOS VM sandbox using Tart. APFS copy-on-write 3-layer caching. Headless mode for CI/CD. CPU = host count, RAM = 5/8 host. Xcode and dev tools included. Supports Claude Code, Codex, Gemini, Cursor.

---

### 27. Cua (Computer-Use Agents)

| Field | Value |
|-------|-------|
| URL | https://github.com/trycua/cua |
| Stars | 13,500 |
| License | MIT |
| Platforms | macOS, Linux, Windows, Android |

Full desktop control infrastructure. Apple Virtualization.Framework + QEMU. H.265 streaming, shared clipboard, audio. More relevant for GUI agents than coding agents.

---

### 28. Moltworker (Cloudflare) (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/ |
| License | Open source (proof of concept) |
| Platforms | Cloudflare Workers (edge) |
| Self-Hosted | PARTIAL -- runs on YOUR Cloudflare account, not their managed service |

Middleware Worker + isolated Sandbox containers on Cloudflare's platform. Entrypoint Worker as API router, Moltbot runtime in Sandbox, R2 for storage, Cloudflare Access for auth. Proof of concept, NOT a product.

**Verdict**: Interesting architecture study. Not truly self-hosted (requires Cloudflare account). Not relevant for personal hardware.

---

### 29. Apple Containers (NEW in v2)

| Field | Value |
|-------|-------|
| URL | https://github.com/apple/containerization (pkg download) |
| License | Apple |
| Platforms | macOS 26+ (Apple Silicon) |
| Status | v0.9.0 (Feb 2026), pre-1.0 |

Apple's native container runtime. Thinnest possible sandbox for macOS. Known networking bug in v0.9.0 (HTTP 403 during builds). For macOS users who want containers without Docker Desktop overhead.

**Verdict**: Promising but pre-1.0. Wait for v1.0 stability.

---

## Tier 4: CODE EXECUTION ENGINES (Not Full Sandboxes)

### 30. Piston

See Investigation Target #4 above. Stateless code execution engine, not an agent sandbox.

### 31. DifySandbox

| Field | Value |
|-------|-------|
| URL | https://github.com/langgenius/dify-sandbox |
| License | Apache-2.0 |
| Isolation | Seccomp + namespace + network proxy |
| Self-Hosted | YES -- Docker |

Code execution environment for the Dify AI platform. Python + Node.js. Whitelist-only syscalls. Not a general-purpose agent sandbox.

### 32. Windmill (nsjail integration)

| Field | Value |
|-------|-------|
| URL | https://github.com/windmill-labs/windmill |
| License | AGPLv3 (Community Edition free) |
| Isolation | nsjail (sub-20ms startup) |
| Self-Hosted | YES -- 3 files (docker-compose.yml, Caddyfile, .env) |

Workflow engine with AI sandbox annotations (`// sandbox` + `// volume`). Can run Claude Code, Codex, OpenCode inside sandboxes. Good for workflow-based agent execution.

### 33. SkyPilot Code Sandbox

| Field | Value |
|-------|-------|
| URL | https://github.com/alex000kim/skypilot-code-sandbox |
| Isolation | Docker on cloud VMs |

Multi-cloud orchestration across 16+ providers. Official Agent Skill for Claude Code. Best for cloud GPU workloads, not personal hardware.

### 34. Beam Cloud (beta9)

| Field | Value |
|-------|-------|
| URL | https://github.com/beam-cloud/beta9 |
| Isolation | runc + gVisor |
| Self-Hosted | YES (beta9 engine) |

Serverless runtime with GPU support. 1-3 second cold boots. Cloud-first design.

---

## Tier 5: NOT SELF-HOSTABLE / PROPRIETARY

### 35. Runloop -- PROPRIETARY
Custom bare-metal hypervisor. 2x faster vCPUs. SOC 2. Not open source.

### 36. Cloudflare Dynamic Workers -- EDGE ONLY
V8 isolates. Millisecond cold starts. Not self-hostable for the Dynamic Workers product.

### 37. ComputeSDK -- PROPRIETARY GATEWAY
Sandbox gateway/abstraction layer. Not open source.

### 38. Ash -- CLOSED SOURCE
macOS sandbox using Endpoint Security + Network Extension frameworks. Fine-grained policy.yml. But closed-source is a trust deficit for a security tool. Broken GitHub login reported.

---

## Sysbox Assessment (Investigation Target #5)

See full write-up in Investigation Target #5 above. Summary: Useful Docker-in-Docker infrastructure primitive. Not an agent sandbox. Docker Sandboxes (microVMs) supersedes it.

---

## DevPod Assessment (Investigation Target #3)

See full write-up in Investigation Target #3 above. Summary: Environment provisioning tool, not agent sandbox. Apache-2.0. Client-only.

---

## Coder Assessment (Investigation Target #2)

See full write-up in Investigation Target #2 above. Summary: Production-grade with Coder Tasks for agent management. AGPL-3.0. Free Community Edition.

---

## Recommendation Matrix

For our tmux orchestrator on personal macOS hardware:

| Solution | Effort | Security | Claude Code | macOS | No Docker | License |
|----------|--------|----------|-------------|-------|-----------|---------|
| **nono** | LOW | HIGH (kernel) | YES | YES | YES | Apache-2.0 |
| **Anthropic srt** | LOW | HIGH (OS-level) | YES | YES | YES | Research |
| **Hazmat** | LOW | VERY HIGH (TLA+) | YES | YES | YES | Open |
| **Agent Safehouse** | TRIVIAL | HIGH (kernel) | YES | YES | YES | Open |
| **Docker Sandboxes** | LOW | VERY HIGH (microVM) | YES | YES | NO | Exp/Free |
| **SandVault** | LOW | MEDIUM (user+seatbelt) | YES | YES | YES | Apache-2.0 |
| **ai-jail** | LOW | HIGH (multi-layer) | YES | YES | YES | GPL-3.0 |
| **Lima** | MEDIUM | VERY HIGH (full VM) | indirect | YES | YES | Apache-2.0 |
| **Trail of Bits devc** | MEDIUM | HIGH (Docker) | YES | YES | NO | Open |
| **OpenSandbox** | HIGH | VERY HIGH | YES | NO* | NO | Apache-2.0 |
| **Coder** | HIGH | HIGH (workspace) | YES | YES | NO | AGPL-3.0 |

*OpenSandbox requires Linux/Docker.

### Top 5 to Evaluate Next (for our specific use case)

1. **nono** -- lowest friction, macOS native, Claude Code profile, Apache-2.0
2. **Anthropic sandbox-runtime** -- from the source, purpose-built for Claude Code
3. **Hazmat** -- only TLA+-verified option, macOS native, multi-layer containment
4. **Agent Safehouse** -- 30-second setup, zero dependencies, 12+ agent profiles
5. **Docker Sandboxes** -- strongest isolation if Docker Desktop is acceptable

---

## Isolation Technology Hierarchy (Security vs. Speed)

| Level | Technology | Startup | Security | Self-Hostable Examples |
|-------|-----------|---------|----------|----------------------|
| 1 (strongest) | Firecracker microVM | ~150ms | VM-level kernel isolation | E2B self-hosted, Docker Sandboxes, Zeroboot |
| 2 | Full VM (QEMU/Vz.framework) | ~1-5s | Complete OS separation | Lima, ClodPod, Cua |
| 3 | gVisor/Kata | ~300ms | User-space kernel / lightweight VM | K8s agent-sandbox, OpenSandbox |
| 4 | Docker + firewall | ~1-2s | Namespace isolation + network control | Anthropic devcontainer, Trail of Bits |
| 5 | OS-level sandbox (Seatbelt/bwrap) | <10ms | Kernel-enforced file/network/process | nono, Hazmat, Agent Safehouse, ai-jail |
| 6 | WASM/V8 isolate | ~5ms | Memory-safe, no kernel separation | Rivet agent-os |
| 7 | User account isolation | instant | Unix permissions only | SandVault |

---

## Sources

- [OpenHands Custom Sandbox Guide](https://docs.openhands.dev/openhands/usage/advanced/custom-sandbox-guide)
- [Coder GitHub Repository](https://github.com/coder/coder)
- [Coder: Building for 2026 with Claude Code](https://coder.com/blog/building-for-2026-why-anthropic-engineers-are-running-claude-code-remotely-with-c)
- [Coder Tasks Documentation](https://coder.com/docs/ai-coder/tasks)
- [Coder Plans & Pricing](https://coder.com/pricing)
- [DevPod Official Site](https://devpod.sh/)
- [Piston GitHub Repository](https://github.com/engineer-man/piston)
- [Sysbox GitHub Repository](https://github.com/nestybox/sysbox)
- [ai-jail: Sandbox for AI Agents](https://akitaonrails.com/en/2026/03/01/ai-jail-sandbox-for-ai-agents-from-shell-script-to-real-tool/)
- [Agent Sandboxes: A Practical Guide](https://www.vietanh.dev/blog/2026-02-02-agent-sandboxes)
- [Anthropic DevContainer Documentation](https://code.claude.com/docs/en/devcontainer)
- [Anthropic devcontainer.json](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json)
- [Anthropic init-firewall.sh](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh)
- [Trail of Bits claude-code-devcontainer](https://github.com/trailofbits/claude-code-devcontainer)
- [Trail of Bits: How We Made AI-Native](https://blog.trailofbits.com/2026/03/31/how-we-made-trail-of-bits-ai-native-so-far/)
- [awesome-sandbox curated list](https://github.com/restyler/awesome-sandbox)
- [Ry Walker AI Agent Sandboxes Compared](https://rywalker.com/research/ai-agent-sandboxes)
- [Northflank: Self-hostable alternatives to E2B](https://northflank.com/blog/self-hostable-alternatives-to-e2b-for-ai-agents)
- [Northflank: Best code execution sandbox for AI agents in 2026](https://northflank.com/blog/best-code-execution-sandbox-for-ai-agents)
- [OpenSandbox (Alibaba) GitHub](https://github.com/alibaba/OpenSandbox)
- [Kubernetes SIG agent-sandbox](https://github.com/kubernetes-sigs/agent-sandbox)
- [Kubernetes Blog: Running Agents with Agent Sandbox](https://kubernetes.io/blog/2026/03/20/running-agents-on-kubernetes-with-agent-sandbox/)
- [microsandbox GitHub](https://github.com/superradcompany/microsandbox)
- [Daytona GitHub](https://github.com/daytonaio/daytona)
- [AIO Sandbox (agent-infra)](https://github.com/agent-infra/sandbox)
- [Agent Safehouse](https://github.com/eugene1g/agent-safehouse)
- [SandVault](https://github.com/webcoyote/sandvault)
- [ClodPod](https://github.com/webcoyote/clodpod)
- [Hazmat](https://github.com/dredozubov/hazmat)
- [Hazmat on HN](https://news.ycombinator.com/item?id=47677488)
- [Moltworker (Cloudflare)](https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/)
- [Windmill AI Sandboxes](https://www.windmill.dev/blog/launch-week-ai-sandboxes)
- [SkyPilot LLM Sandbox](https://blog.skypilot.co/skypilot-llm-sandbox/)
- [DifySandbox](https://github.com/langgenius/dify-sandbox)
- [Lima CNCF](https://github.com/lima-vm/lima)
- [Cua Computer-Use Agents](https://github.com/trycua/cua)
- [Nix sandbox for AI agents](https://www.ranti.dev/blog/securing-ai-agents-with-nix-and-bubblewrap)
- [Cloudflare: Sandboxing AI agents 100x faster](https://blog.cloudflare.com/dynamic-workers/)
- [Docker Sandboxes](https://www.docker.com/blog/docker-sandboxes-run-agents-in-yolo-mode-safely/)
