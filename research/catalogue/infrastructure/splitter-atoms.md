# Splitter (atoms-co)

> **Control-plane service for assigning work to connected clients — UUID-space sharding with Raft-backed lease management, region-aware assignment, and centrally-managed exclusive shard ownership.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure — Distributed systems coordinator (NOT agent-specific) |
| Repository | https://github.com/atoms-co/splitter |
| GitHub Stars | 214 (as of 2026-04-17) |
| Publisher | Atoms (robotics company; techblog at techblog.atoms.co) |
| License | Apache 2.0 |
| Tech Stack | Go + Bazel + Raft (embedded) + Docker; Go client library + `splitterctl` CLI |
| Maturity | 🟡 Early — created 2026-04-01, recent commits; small fork count (15) |
| Last Analyzed | 2026-04-17 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Splitter is a **general-purpose distributed-systems coordinator**, not an AI-agent tool. It solves "assign work (UUID-keyed) to pooled clients with exclusive ownership leases" — a problem adjacent to but distinct from agent orchestration. The Atoms techblog post title ("stateful services at Atoms") and the `robots` example (managing connected robots) reveal the actual design target: robotics / IoT fleets. Possible far-future overlap if we ever run a large pool of **persistent, stateful agent workers** (think: each agent owns a repository slice for a long-running refactor) — but our current tmux-worker model is stateless-per-task, so Raft-backed leases are overkill. |
| **Novelty** | 4/10 | Raft-backed sharding + lease-based exclusive ownership is textbook distributed systems (Google Chubby, Apache Helix, etcd, HashiCorp Serf). What's marginally novel here is (1) the **no-external-dependencies** constraint ("only requires persistent storage") and (2) the **dual-ownership during shard transitions** option, which is an interesting escape hatch for zero-downtime rebalancing. But nothing here is AI-native or speaks to agent coordination specifically. |
| **Actionable** | 2/10 | Nothing to adopt now. If we ever had a multi-node orchestrator (we don't — L-Thread runs single-host tmux), the architectural patterns (central coordinator + Raft + leases + region-aware routing) would be standard references. For now: catalogue for awareness, revisit in Phase 4+ if/when a multi-node agent pool becomes a real requirement. The Go client + Docker-based deployment model is mature enough to actually use, which sets it apart from academic coordinator projects, but adoption would only make sense for a 10+-machine agent fleet. |

---

## Overview

**Splitter** is a Go-based control-plane service from **Atoms** (robotics company) that centrally assigns work to a pool of connected clients. The programming model is: treat work as a **UUID space**, split it into shards, and assign shards to clients via **leases**. In steady state, exactly one client owns each shard ("exclusive ownership") — which is the key property that makes it simpler to reason about than eventual-consistency coordinators like Apache Helix or HashiCorp Serf.

The system uses embedded Raft for shard-metadata storage and coordination, meaning **no external dependencies** other than local persistent storage for the metadata log. Clients come and go dynamically; Splitter automatically propagates routing updates, supports region-aware placement for multi-regional services, and can be used as a leadership-election primitive for connected clients. It also exposes "authoritative shard alignment information" as an external API — other systems can query "which client currently owns shard X" for data co-location decisions.

The example workload (published at `github.com/atoms-co/splitter-examples/robots/`) is managing a fleet of connected robots — a natural fit for the design (robots = long-lived stateful clients, robot IDs = UUID space, exclusive ownership = "only one controller issues commands to robot X").

---

## Technical Architecture

### Core model

```
Work domain (UUID space)
  └─ split into N shards
       └─ assigned via leases to connected clients
              └─ exclusive ownership in steady state
                    (optional dual ownership during transitions)
```

### Key components

| Component | Purpose |
|---|---|
| **Splitter server** | Central coordinator; Raft-backed; receives client registrations, issues leases |
| **Raft log** | Shard-metadata storage and coordination (embedded, no external deps) |
| **Client library (Go)** | Long-running client; claims leases, receives routing updates |
| **`splitterctl`** | CLI for operating Splitter from inside the container |
| **Bazel build** | `bazel run //:load` produces the Docker image |

### Design claims (from README)

- Easier programming model than eventual-consistency coordinators (because leases give exclusivity)
- Region-aware assignments for multi-regional deployments
- Automatic propagation of routing info to clients
- Can be used as leadership-election primitive
- Only external requirement: persistent storage

### Not addressed in README

- No mention of AI, agents, LLMs, or MCP
- No benchmark numbers
- No comparison with Helix / etcd / Chubby / Ray / Temporal

---

## Publisher Background

**Atoms** is a small company (atoms.co) publishing a techblog at `techblog.atoms.co`. The "Easy as Pie: Stateful Services at Atoms" post links to the Splitter engineering writeup. The example repo (`atoms-co/splitter-examples`) shows the robot-fleet use case. Minimal publisher context beyond that — 15 forks and 214 stars suggests an early open-source release of an internal tool.

Not a bigtech org, not a well-known AI lab. If the space is "distributed-systems coordinators open-sourced by a robotics startup," the most useful pattern here is probably "how Atoms ships internal Go infrastructure to the public" rather than the coordinator itself.

---

## What's Valuable for Us

1. **Design reference only**: if we ever design a multi-host L-Thread orchestrator (Phase 4+), Splitter's UUID-shard + lease + Raft approach is a textbook template to compare against. "Exclusive ownership + dual-ownership-during-transition" is a pattern worth remembering for worktree-per-worker reassignment.
2. **Region-aware routing**: marginal relevance if our orchestrator ever runs workers across multiple machines (Pi + Mac + Linux box) and we need to co-locate agents with their target repos.
3. **Apache 2.0 license**: if we ever did adopt, commercial use is fine.

---

## What's NOT Relevant

- **This is not an agent tool**. Every primitive in the catalogue so far (tmux, worktrees, Claude Code, MCP, harnesses, sandboxes) operates on a fundamentally different layer. Splitter is at the "Chubby / etcd / Helix" layer.
- **Single-host assumption violated**: our L-Thread orchestrator explicitly runs on one machine with tmux. No multi-host requirement exists or is planned before Phase 4+.
- **Stateless workers**: our tmux workers are spawned per-task and killed on completion. Splitter's value is in **long-lived stateful clients** owning shards — wrong model for our short-task workers.
- **Bazel + Raft overhead**: adopting Splitter means adopting Bazel + embedded Raft operational burden. Not worth it for any current scenario.
- **No AI angle**: there's nothing LLM-native, MCP-integrated, or agent-aware in the codebase.

---

## Future Use Cases

- **Phase 4 (Day 90+ / multi-host orchestrator)**: IF we ever build a multi-host L-Thread where persistent agent workers own repository slices long-term, Splitter-style lease-based shard assignment becomes the natural coordination primitive. Until then — no action.
- **Never, realistically**: our roadmap doesn't currently include a multi-host orchestrator. This catalogue entry is mostly for breadth — showing what adjacent distributed-systems infrastructure looks like when it comes from a robotics startup, not an AI lab.

---

## Key Takeaway

> **Atoms' Splitter is a textbook Raft-backed shard-assignment coordinator for stateful clients (robots, in their case) — not an agent tool, not relevant to our single-host tmux orchestrator, catalogued for breadth and as a Phase 4+ reference if we ever go multi-host.**
