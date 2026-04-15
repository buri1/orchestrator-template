# VERIFY-03: microsandbox -- Real WSL2 Status and Claude Code Feasibility

**Date**: 2026-04-04
**Verdict**: PROMISING BUT NOT WSL2-READY TODAY
**Confidence**: HIGH (primary sources verified)

---

## Executive Summary

microsandbox (superradcompany/microsandbox) is a legitimate, actively-developed open-source microVM sandbox platform with 5,316 GitHub stars, 21 contributors, 543+ issues, and daily releases (v0.3.12 as of 2026-04-05). It uses libkrun for hardware-isolated microVMs and supports OCI container images. However, **WSL2 support does not exist today**, the "50ms boot" claim is marketing fiction (real figure: under 200ms warm), and running Claude Code as a full agent inside a microsandbox VM is theoretically possible but untested and non-trivial.

---

## 1. WSL2 Issue #10 -- WRONG ISSUE

GitHub issue #10 (`superradcompany/microsandbox/issues/10`) is titled "feat: basic filesystem impl and other deps" -- a closed internal task from October 2024 about content-addressable filesystem implementation. **It has nothing to do with WSL2.**

The actual WSL2/Windows issue is **#47**: "Windows Support (without WSL)".

### Issue #47 Status (OPEN, April 2026)

- **Original plan** (Nov 2024): Native Windows port via Windows Hypervisor Platform
- **Revised approach** (Apr 2025): Maintainer pivoted to "leveraging WSL2" -- proposing a Windows wrapper CLI that delegates to the Linux version running inside WSL
- **January 2026**: A contributor demonstrated feasibility by creating a custom WSL2 Linux distro to run microsandbox via Docker export/import
- **Blocker**: Maintainer lacks a Windows machine for testing
- **No timeline committed**

**Verdict**: WSL2 is the planned path forward, but it is not implemented, not tested by maintainers, and not documented.

---

## 2. KVM in WSL2 -- Real User Reports

### What Works

- **AMD on Windows 11**: Confirmed working. A user on Level1Techs with a Ryzen 5800X got KVM running in WSL2 after upgrading to Windows 11. Required custom `.wslconfig` with `nestedVirtualization=true` and kernel parameters: `amd_iommu=on iommu=pt kvm.ignore_msrs=1 kvm-amd.nested=1`
- **General**: Since Windows Insider build 19619 (now in stable), WSL2 supports nested virtualization. Enabled by default on amd64 since late 2024.

### What Breaks

- **Windows 10**: KVM in WSL2 "cripples performance" on Win10 per user reports. Upgrade to Win11 required.
- **/dev/kvm missing**: WSL issue #13262 reports `/dev/kvm` absent even with `nestedVirtualization=true` on WSL 2.5.9.0 / kernel 6.6.87.2. Issue closed as "completed" but problem persists for some users.
- **Intel**: Better documented historically, but AMD now has parity since Win11.

### Reliability Assessment

KVM in WSL2 is **not reliable out of the box**. It works for some users on Win11 with AMD, fails for others with identical configs. Microsoft has not officially committed to stable KVM support -- it is a side-effect of exposing Hyper-V nested virtualization to the WSL2 utility VM.

---

## 3. Intel vs AMD -- Your Hardware

**Your laptop has a Ryzen 7 3rd gen (AMD)**. This is GOOD for microsandbox:

- AMD Ryzen 3000 series supports SVM (AMD's hardware virtualization) and AMD-V
- Nested virtualization on AMD in WSL2 requires Windows 11 (confirmed)
- A Ryzen 5800X (also 3rd gen Zen 2 / Zen 3 architecture family) was verified working
- Your Ryzen 7 3700X/3750H/3780U should work identically -- same AMD SVM capabilities

**Critical requirement**: Must be running **Windows 11** (not Windows 10).

**However**: Even if KVM works in WSL2 on your laptop, you then need microsandbox to work inside WSL2, which is the untested part (see section 1).

---

## 4. Installing Claude Code Inside a microsandbox VM

### Theoretically Possible

microsandbox runs **standard OCI container images** from Docker Hub, GHCR, or any OCI registry. The compatibility layer translates container images into microVM root filesystems automatically. You can:

1. Use a Node.js base image (e.g., `node:20-slim`)
2. Install Claude Code via `npm install -g @anthropic-ai/claude-code`
3. Run Claude Code as the sandbox entry point

### Practical Blockers

| Factor | Status |
|--------|--------|
| Node.js runtime | Available via OCI images |
| npm install | Works -- standard OCI images include package managers |
| Claude Code CLI | Installable, but needs API key or OAuth token |
| Interactive terminal | `msb shell` provides interactive shell access |
| File system access | Read-write overlay on top of read-only base layers |
| Network access | Configurable: none/group/public/any scopes |
| Credential mounting | Must be explicitly configured via volume mounts in Sandboxfile |
| MCP servers | Claude Code's MCP servers need network/socket access -- may need custom config |
| Memory | Configurable per sandbox, but Claude Code + Node.js needs meaningful RAM |
| Persistent state | Detached mode sandboxes survive the host process |

### The Real Problem

Claude Code is not just a CLI -- it spawns subprocesses (git, bash, ripgrep, etc.), reads/writes files across the project tree, and may invoke MCP tools over network. Running it inside a microsandbox VM means:

- The entire project must be volume-mounted or cloned inside the VM
- Git operations must work inside the VM (git must be installed in the image)
- MCP connections from inside the VM to outside services need network routing
- The `--dangerously-skip-permissions` flag behavior inside a VM is unknown

**Nobody has tested this**. The Infralovers blog (Feb 2026) tested Claude Code in Docker-based sandboxes and Lima VMs but NOT microsandbox specifically. Their finding: filesystem performance across hypervisor boundaries is "roughly 3x slower" for metadata-heavy operations like `pnpm install`.

---

## 5. File Operations

microsandbox provides file I/O through:

- **virtio-fs mounts**: Host directory mapped to `./menv` folder inside VM with automatic state preservation
- **Volume mounts**: Explicitly configured in Sandboxfile
- **Content-addressable OCI layer storage**: Shared across images in `~/.microsandbox/layers/`
- **Read-write overlay**: Each sandbox gets a unique RW layer on top of read-only base

You could mount Claude credentials (API key file, OAuth tokens) via volume mounts. However, this must be explicitly configured -- there is no "auto-discover host credentials" feature.

---

## 6. Shell Access

**Yes, full interactive shell is available.**

- `msb shell <sandbox-name>` -- opens whatever shell is configured for the sandbox image
- `msb exec <sandbox-name> -- <command>` -- execute discrete commands
- Interactive terminal support with TTY attachment
- SDK provides `.shell()` method for programmatic access
- Issue #540 (open) proposes making the command optional for `msb exec` in interactive mode

This is NOT code-execution-only like E2B. You get a real shell.

---

## 7. 50ms Cold Start -- FICTION

### What microsandbox Actually Claims (varies by source)

| Source | Claim |
|--------|-------|
| Marketing page / npm | "under 100ms" |
| README | "boot times under 100 milliseconds" |
| DeepWiki / technical docs | "boot times under 200ms" |
| Daytona comparison (pixeljets) | "under 200ms startup" |
| Firecracker (for reference) | 125ms (verified by AWS) |

### Reality

- The "under 100ms" figure appears only in marketing materials and npm package description
- Technical documentation consistently says "under 200ms"
- These are **warm start** times (after initial image pull and setup)
- **Cold start** (first run, image download) adds significant delay
- No independent, reproducible benchmark has been published by anyone
- The HN thread produced zero benchmark data from real users
- **50ms is nowhere in any microsandbox documentation** -- this appears to be a misattribution or confusion with container cold start times

### Comparative Reference

- E2B Firecracker: 150ms (pre-warmed pools, aggressive engineering)
- Daytona: 197ms total (71ms creation + 67ms exec + 59ms cleanup)
- microsandbox: ~200ms warm, unverified

---

## 8. Persistence

**Yes, sandboxes persist.**

- Detached mode: Sandboxes survive the host Node.js/Python process. You can create and reconnect to background sandboxes.
- Dual-database architecture:
  - `oci.db` (global, persistent): image metadata, manifests, layers
  - `sandboxes.db` (project-scoped): runtime state, PIDs, metrics
- Files written to the RW overlay persist across sandbox restarts
- Volume-mounted host directories persist natively
- OCI layers cached in `~/.microsandbox/layers/` after initial pull

**Not ephemeral by default** -- unlike E2B's cloud sandboxes.

---

## 9. Community Size

| Metric | Value |
|--------|-------|
| GitHub stars | 5,316 |
| Forks | 249 |
| Contributors | 21 |
| Total issues (all time) | 543+ |
| Open issues | 38 |
| npm weekly downloads | 3,818 (last 30 days) |
| PyPI version | 0.1.8 (May 2025, stale) |
| Latest release | v0.3.12 (2026-04-05) |
| Release cadence | Daily (5 releases in 5 days) |
| License | Apache 2.0 |
| HN front page | Yes (item #44135977) |

### Assessment

- **Active development**: Very high cadence, daily releases
- **Small but real community**: 21 contributors, 5K stars is legit for infrastructure tooling
- **Python SDK lagging**: PyPI package stuck at 0.1.8 from May 2025, while Rust/npm are current
- **npm downloads modest**: ~4K/month suggests early-adopter phase, not widespread production use
- **Ranked 4th** in roborhythms sandbox comparison (behind SmolVM, OpenSandbox, E2B)
- **Missing features vs competitors**: No fork/clone, no pause/resume, no computer-use support

---

## 10. Self-Hosted / Offline

### Fully Self-Hosted: YES

- "All embedded and rootless" -- no daemon, no server to set up
- Runtime spawns directly as child process of your application
- No cloud dependency after installation
- Installation downloads binary from GitHub releases

### Phone Home: NO EVIDENCE

- No telemetry documented or found in code analysis
- No analytics endpoints in architecture documentation
- OCI registry pulls are the only external network calls (for image download)
- Once images are cached locally (`~/.microsandbox/layers/`), operates fully offline

### Internet Needed For

- Initial binary download (GitHub releases)
- OCI image pulls (first time only, then cached)
- That's it

---

## Feasibility Matrix for Your Setup

| Requirement | Status | Notes |
|-------------|--------|-------|
| Run on macOS (your Mac) | YES | Apple Silicon required -- verify your Mac is M-series |
| Run in WSL2 on Windows laptop | BLOCKED | Not implemented, not tested by maintainers |
| AMD Ryzen 7 3rd gen KVM in WSL2 | MAYBE | KVM works on AMD Win11 WSL2 for some users, but unreliable |
| Claude Code inside microsandbox | UNTESTED | Theoretically possible with OCI Node.js image, nobody has tried |
| Full offline operation | YES | After initial image pull |
| Interactive shell access | YES | `msb shell` provides real shell |
| Persistent sandboxes | YES | Detached mode + overlay FS |
| Self-hosted, no phone home | YES | Apache 2.0, no telemetry |

---

## Recommended Path Forward

### If You Want to Try This

1. **On macOS (Apple Silicon)**: Install microsandbox, create a Sandboxfile with `node:20` image, install Claude Code inside, test if the full agent works. This is the lowest-friction path.

2. **On Windows (your Ryzen 7 laptop)**:
   - Ensure Windows 11 is installed
   - Enable `nestedVirtualization=true` in `.wslconfig`
   - Verify `/dev/kvm` exists in WSL2
   - Install microsandbox inside WSL2 (manual, undocumented)
   - This is experimental and may not work

3. **For production orchestration**: microsandbox is not mature enough. Missing pause/resume, fork/clone, and the Python SDK is stale. Consider Docker-based sandboxing (proven) or E2B (if cloud is acceptable) for production workloads.

### What to Watch

- Issue #47 (Windows/WSL2 support) -- subscribe for updates
- Issue #349 (Docker support) -- would simplify WSL2 deployment
- Python SDK development -- currently lagging behind Rust/TypeScript
- v0.4.0 milestone -- may include significant platform expansion

---

## Sources

- [superradcompany/microsandbox GitHub](https://github.com/superradcompany/microsandbox) -- 5,316 stars, Apache 2.0
- [Issue #47: Windows Support](https://github.com/superradcompany/microsandbox/issues/47) -- WSL2 as planned path
- [Issue #349: Docker Support](https://github.com/superradcompany/microsandbox/issues/349) -- PR open, not merged
- [Issue #13262: /dev/kvm missing in WSL2](https://github.com/microsoft/WSL/issues/13262) -- unresolved for some users
- [Issue #4193: Nested Virtualization for WSL2](https://github.com/microsoft/WSL/issues/4193) -- 138 comments, no official resolution
- [Level1Techs: AMD KVM in WSL2](https://forum.level1techs.com/t/windows-10-wsl2-enable-kvm-nested-virtualisation-on-amd/179072) -- Ryzen 5800X confirmed on Win11
- [Box of Cables: KVM Guests on WSL2](https://boxofcables.dev/accelerated-kvm-guests-on-wsl-2/) -- Intel-focused guide
- [KVM on WSL2 Gist](https://gist.github.com/startergo/4428c78ace77d229357b4a205f38a57a) -- Win11 setup steps
- [HN Discussion](https://news.ycombinator.com/item?id=44135977) -- limited real user feedback
- [DeepWiki Architecture](https://deepwiki.com/microsandbox/microsandbox/3.1-system-overview) -- technical internals
- [Infralovers: Sandboxing Claude Code on macOS](https://www.infralovers.com/blog/2026-02-15-sandboxing-claude-code-macos/) -- Docker/Lima recommended over microVMs
- [Pixeljets: Daytona vs microsandbox](https://pixeljets.com/blog/ai-sandboxes-daytona-vs-microsandbox/) -- 200ms warm start
- [Roborhythms: Sandbox Ranking](https://www.roborhythms.com/best-ai-agent-sandbox-2026/) -- microsandbox ranked 4th
- [npm: microsandbox](https://www.npmjs.com/package/microsandbox) -- 3,818 downloads/month
- [PyPI: microsandbox](https://pypi.org/project/microsandbox/) -- v0.1.8, May 2025
- [Better Stack: Sandbox Runners](https://betterstack.com/community/comparisons/best-sandbox-runners/) -- 2026 comparison
