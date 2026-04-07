# Hyprflow

> **A better Hyprland workflow for developers — workspace groups with isolated Linux network namespaces for zero-conflict parallel development.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [github.com/Dillpickleschmidt/hyprflow](https://github.com/Dillpickleschmidt/hyprflow) |
| GitHub Stars | 26 (as of 2026-03-08) |
| Publisher | Dillpickleschmidt — solo developer, inspired by Theo's ideal dev environment discussion |
| License | Apache-2.0 |
| Tech Stack | Shell (68%), Python (30%), Hyprland IPC, `jq`, `socat`, `iproute2`, `iptables`, Firejail |
| Maturity | 🟡 Early (29 commits, created 2026-02-13, Arch Linux only) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Theo's fan project from Airtable research list. Interesting namespace isolation concept for parallel dev, but Linux/Hyprland-only — we're on macOS. The network namespace pattern (per-workspace-group `localhost` isolation) is a clever alternative to worktree+port-offset approaches, but not portable. Filed under infrastructure for reference.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | macOS-based workflow; Hyprland/Linux-exclusive; doesn't solve any current roadmap problem |
| **Novelty** | 5/10 | Network namespace per workspace group is a fresh isolation primitive — different from worktree/container approaches |
| **Actionable** | 1/10 | Zero portability to our macOS + tmux + Claude Code stack; purely conceptual reference |

---

## Overview

Hyprflow introduces "workspace groups" for the Hyprland compositor (Wayland, Linux-only), where each group of 10 workspaces gets its own isolated Linux network namespace. This means each workspace group has an independent `localhost`, eliminating port collisions and cookie/session conflicts when running multiple development projects simultaneously. You can run three Next.js apps all on `:3000` in different workspace groups without any port remapping.

The tool follows a lazy initialization pattern: a daemon (`hypr-devns-daemon`) monitors Hyprland IPC socket events and creates network namespaces on-demand when a workspace group is first accessed. Each namespace gets a virtual ethernet pair (`10.200.<group>.2/24`), NAT rules for outbound internet, and DNS configuration. Browsers are sandboxed via Firejail into the correct namespace with profile cloning (preserving login sessions across groups). Docker containers are transparently injected into the active namespace via an OCI runtime wrapper (`hypr-devns-runc`) that patches `config.json` at container creation time.

The project is built for Theo's vision of an "ideal dev environment" for agentic coding — the idea being that multiple coding agents could work on completely isolated projects simultaneously on the same machine without any port or state conflicts.

---

## Technical Architecture

```
Hyprland IPC (socket2)
    │
    ▼
hypr-devns-daemon ──── monitors workspace/window events
    │                   lazy namespace creation
    │
    ▼
hypr-devns-helper ──── creates/destroys network namespaces (runs as root via sudoers)
    │                   sets up veth pairs, NAT, DNS
    │
    ├── Namespace: ns_2 (10.200.2.2/24)  ─── Workspace Group 2
    ├── Namespace: ns_3 (10.200.3.2/24)  ─── Workspace Group 3
    └── ...

hypr-devns-browser ─── Firejail sandboxing, per-group browser profiles
hypr-devns-runc ────── OCI runtime wrapper, patches container config.json
hypr-devns-exec ────── runs arbitrary commands in namespace context
```

**Key implementation details:**

- **Daemon loop**: `socat` connection to Hyprland's `.socket2.sock`, parsing `workspace>>`, `createworkspace>>`, `openwindow>>` events. Auto-reconnects on socket close.
- **Namespace lifecycle**: `ensure_namespace()` → checks state file `${DEVNS_STATE_DIR}/ns_${ns_id}` → calls `sudo hypr-devns-helper create <ns_id>` → marks done.
- **Docker integration**: `hypr-devns-runc` intercepts `runc create` calls, uses `jq` to inject network namespace path into container's `config.json` Linux namespaces array, serializes container startup via lockfiles to prevent eth0 naming races.
- **Browser isolation**: `rsync` clones Group 1 profile (excluding cache, localStorage, IndexedDB) to new groups. Group 1 is always non-isolated and serves as the template.
- **Cleanup**: `trap cleanup EXIT TERM INT` → `hypr-devns-helper destroy-all` → purge state directory.
- **Config**: `/etc/hypr-devns.conf` (defaults) + `~/.config/hypr-devns.conf` (user overrides). Key params: `DEVNS_EXCLUDE_GROUPS`, `DEVNS_DNS`, `DEVNS_WAN_IFACE`, `DEVNS_BROWSERS`.

---

## Publisher Background

Dillpickleschmidt is a solo developer with 23 public repos, 2 followers on GitHub (account since 2018). No notable previous projects, no social media presence found. The project was built in response to Theo's (t3.gg) discussion about ideal development environments for agentic coding. The repo is very young (created 2026-02-13, ~3 weeks old at time of analysis) with 29 commits. No contributors beyond the author. Arch Linux PKGBUILD only — no distribution packaging for other distros.

---

## What's Valuable for Us

**The isolation mental model is interesting but not actionable:**

1. **Per-agent localhost isolation concept**: The idea that each coding agent gets its own `localhost` with zero port conflicts is elegant. In our architecture, we achieve similar isolation via git worktrees (file-level) and tmux sessions (process-level), but don't have network-level isolation. On macOS, the closest equivalent would be running each agent's dev server on different ports or in separate Docker networks — but we haven't needed this.

2. **OCI runtime wrapper pattern**: The `hypr-devns-runc` approach of intercepting Docker's runtime layer to transparently modify container network namespaces is a pattern worth knowing. If we ever need to inject context into containers (e.g., agent identity, tracing headers), the "runtime wrapper that patches config.json" approach is proven by both this project and NVIDIA's GPU runtime.

3. **Lazy initialization with state files**: The daemon's pattern of checking state files before creating namespaces (idempotent creation) maps loosely to our orchestrator's agent deduplication via state JSON files.

---

## What's NOT Relevant

- **Linux/Hyprland exclusivity**: We run macOS. Linux network namespaces don't exist on macOS. Hyprland is a Wayland compositor with no macOS equivalent. The entire tool is non-portable. (Governing Principle 7: "Build only what you have needed in the last 30 days.")

- **Desktop environment coupling**: Hyprflow is deeply coupled to a specific window manager's IPC protocol. Our architecture is terminal-first (tmux + CLI), not desktop-compositor-dependent.

- **Browser profile management**: We don't run browser instances per agent. Our E2E testing uses Chrome DevTools MCP, which connects to a single browser instance. The Firejail sandboxing pattern is irrelevant.

- **No agent orchestration**: Despite being inspired by "agentic coding," Hyprflow doesn't orchestrate agents — it provides workspace isolation that agents could theoretically use. It's infrastructure plumbing, not agent coordination. (Governing Principle 1: "The orchestration layer is the compounding asset.")

---

## Future Use Cases

- **Phase 1-3 (Days 1-90)**: No use case. macOS-exclusive workflow.
- **Phase 4 (Days 90+)**: If we ever migrate to Linux workstations or cloud VMs for agent execution, network namespace isolation could replace port-offset hacks. The pattern (not the tool) would be relevant.
- **Theoretical**: If Claude Code agents ever run on Linux CI runners, per-agent network namespaces could provide hermetic test isolation. But Docker networks already solve this more portably.

---

## Key Takeaway

> **Hyprflow demonstrates that network namespace isolation can eliminate port conflicts for parallel development, but it's Linux/Hyprland-exclusive and solves a problem we don't currently have on our macOS+tmux stack — file as a reference pattern, not an adoption candidate.**
