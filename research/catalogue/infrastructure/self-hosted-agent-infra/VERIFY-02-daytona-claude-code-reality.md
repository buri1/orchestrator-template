# VERIFY-02: Has Anyone ACTUALLY Run Claude Code Inside Daytona?

> **Verification date**: 2026-04-04
> **Verdict**: MOSTLY MARKETING. Very few independent user reports. The Claude Code CLI path works but requires API keys -- Max subscription support is unproven in Daytona self-hosted. The Claude Agent SDK path (not the CLI) is the primary documented integration.

---

## Executive Summary

Daytona has invested heavily in Claude Code integration docs (5+ guides on daytona.io). Anthropic lists Daytona as one of six recommended sandbox providers. But when you strip away vendor content, only ONE independent practitioner (Scott Spence) has published a real experience report -- and his setup used a custom wrapper, not vanilla Claude Code CLI. Nobody has publicly documented running Claude Code CLI with a Max subscription inside a self-hosted Daytona instance.

---

## Source-by-Source Findings

### 1. Reddit

**Result: ZERO relevant threads found.**

Multiple searches for "daytona claude code" on reddit.com returned nothing. No user experience reports, no troubleshooting threads, no discussions.

### 2. Hacker News

**Result: No combined Daytona+Claude Code discussion.**

Daytona's own Show HN (item 39616709) exists from early 2024 (pre-pivot to agent infra). Claude Code has many HN threads. No thread discusses running Claude Code inside Daytona.

### 3. GitHub Issues (daytonaio/daytona)

**Result: No Claude Code-specific issues from users.**

Searched all issues for "claude" -- found zero user-filed issues about running Claude Code CLI in Daytona. The issues that exist are about the SDK/API (exec returning -1 exit codes, PATH problems, env var passing). Relevant bugs:
- [#2283](https://github.com/daytonaio/daytona/issues/2283) -- exec returns -1 for missing commands (STILL OPEN as of 2026-04-04). Workaround: wrap in `bash -c`.
- [#3433 (hermes-agent)](https://github.com/NousResearch/hermes-agent/issues/3433) -- `required_environment_variables` not passed through for Daytona remote sessions.

### 4. X/Twitter

**Result: Vendor posts + one real project (OpenAgents).**

- **@daytonaio** posted a video of Claude Code building with Daytona docs (marketing).
- **@OpenAgentsInc** demonstrated a flow: pick repo, setup GitHub and Claude creds, start Daytona sandbox, install Claude Code and Convex, send tasks from their UI to sandboxed Claude Code. This is a REAL integration but uses the Claude Agent SDK + a custom orchestration layer, not vanilla Claude Code CLI with Max subscription. Could not fetch full details (402 error on X).
- No independent practitioners posting "I ran Claude Code in Daytona with my Max sub."

### 5. YouTube

**Result: No independent tutorials found.**

Daytona's own promotional video exists. No third-party YouTube tutorials demonstrating Claude Code CLI inside Daytona sandboxes.

### 6. Community / Discord

**Result: No Daytona+Claude Code community threads found.**

Discord searches returned results about Claude Code Discord bots (different topic) and generic Daytona docs links. No community troubleshooting or experience sharing.

### 7. Independent Blog Posts

**Result: ONE real practitioner report (Scott Spence).**

Scott Spence wrote a detailed post about "Claude Code Swarm With Daytona Sandboxes." Key findings from his experience:
- **Authentication**: Used GitHub tokens (`GH_TOKEN`). Did NOT specify API key vs subscription.
- **Used a custom wrapper**: Not the vanilla Claude Code CLI -- built `ralph-town` CLI + `mcp-ralph-town` MCP server around Daytona.
- **Real problems encountered**:
  - SSH connections did not get full PATH -- needed full paths like `/usr/bin/git` (fixed by adding PATH config to `/etc/profile.d/`)
  - Sandbox naming broken -- had to dig through Daytona SDK to fix
  - SSH tokens printing to stdout (security issue)
  - MCP tool had no command restrictions
  - exec returns -1 bug on snapshot-based sandboxes (upstream issue #2283)
- **Results**: After fixes, got 33 PRs merged and 50 issues closed in 24 hours.
- **Important caveat**: This was a Claude Code *swarm* via SDK orchestration, not a single Claude Code CLI session.

---

## Technical Verification: The 10 Questions

### Q1: Can you install npm packages in a Daytona sandbox?

**YES.** The official guide explicitly shows `npm install -g @anthropic-ai/claude-code`. Daytona sandboxes are full Linux environments with package managers available.

### Q2: Can you mount host directories (e.g., ~/.claude for Max subscription auth)?

**NO -- not documented.** Daytona sandboxes are isolated environments. The docs state user-level config like `~/.claude` is NOT available inside sandboxes. Volumes exist as a feature but mounting host directories for credential passthrough is not documented for Daytona (Docker sandboxes have this problem too).

### Q3: Can you run `claude --dangerously-skip-permissions` inside?

**YES.** The official Daytona guide for running Claude Code shows this exact flag: `claude --dangerously-skip-permissions -p 'write a dad joke about penguins' --output-format stream-json --verbose`.

### Q4: What shell do you get?

**bash.** The guide uses bash, and SSH access is provided via `daytona ssh <sandbox-name>`. However, the exec API has a known bug where piping is not supported natively -- commands should be wrapped in `bash -c` or `bash -lc`.

### Q5: Root or user?

**Not explicitly documented.** The exec -1 bug report shows attempts to run `sudo chmod` failing with "command not found" (sudo not available in default image), suggesting sandboxes run as a non-root user without sudo.

### Q6: Can Claude Code authenticate with Max subscription (not API key)?

**THEORETICALLY YES, but untested in Daytona specifically.**

The authentication chain works like this:
1. Daytona's official guide uses **ANTHROPIC_API_KEY** (API key auth).
2. Claude Code's auth docs say: if no API key is set, it falls back to interactive OAuth login.
3. The Daytona CLI guide says: "The default Daytona snapshot includes Claude Code" and on first run it "prompts for authentication through a browser-based flow."
4. You could also generate a long-lived OAuth token with `claude setup-token` and pass it as `CLAUDE_CODE_OAUTH_TOKEN` env var.

**BUT**: Nobody has publicly documented doing this with a Max subscription in Daytona. The Docker sandbox equivalent (Docker Desktop) had a bug where the sandbox plugin injected `apiKeyHelper: "echo proxy-managed"` which broke OAuth auth entirely (docker/for-mac#7842, fixed in v4.60.1). Daytona may or may not have similar issues.

### Q7: Does the Daytona self-hosted OSS deployment support Claude Code?

**UNCLEAR.** The self-hosted deployment (via Docker Compose) sets up the Daytona control plane with Dex auth, PostgreSQL, Redis, etc. The docs explicitly warn "This setup is still in development and is not safe to use in production." There is zero mention of Claude Code integration in the self-hosted deployment docs.

### Q8: What are the resource limits?

**Default**: 1 vCPU, 1 GB RAM, 3 GiB disk.
**Maximum per sandbox**: 4 vCPUs, 8 GB RAM, 10 GB disk.
Resources are charged per second. Claude Code needs at minimum 1 GiB RAM and 5 GiB disk per the Anthropic hosting docs -- so the Daytona default is INSUFFICIENT (only 3 GiB disk vs 5 GiB recommended).

### Q9: Does Anthropic officially endorse Daytona?

**YES -- listed but not specially endorsed.** Anthropic's Agent SDK hosting docs list Daytona as one of six "Sandbox Provider Options" alongside Modal, Cloudflare, E2B, Fly Machines, and Vercel Sandbox. It is not given special prominence.

### Q10: What is the actual documented integration path?

There are TWO distinct paths, and they are often conflated:

| Path | What it is | Auth | Documented? | User reports? |
|------|-----------|------|-------------|--------------|
| **Claude Agent SDK + Daytona** | Python/TS SDK spawns Claude Code process inside Daytona sandbox programmatically | ANTHROPIC_API_KEY | YES (3+ guides) | Yes (Scott Spence, OpenAgents) |
| **Claude Code CLI via SSH** | SSH into Daytona sandbox, run `claude` interactively | OAuth or API key | YES (1 guide) | NO independent reports |

---

## The Critical Distinction Most People Miss

Daytona's marketing and docs conflate two very different things:

1. **Claude Agent SDK running inside Daytona** -- This is the primary integration. Your Python/TS code creates a Daytona sandbox, installs Claude Code inside it, and drives it programmatically via the SDK. You pass `ANTHROPIC_API_KEY` as an env var. This works. This is what Scott Spence and OpenAgents used.

2. **Claude Code CLI running interactively inside Daytona** -- SSH into a Daytona sandbox and use `claude` like you would locally. This is documented in one guide. Nobody has publicly reported actually doing this, especially not with a Max subscription.

For our use case (running Claude Code CLI with Max subscription in a self-hosted sandbox), NEITHER path is proven:
- Path 1 requires API keys ($$), not Max subscription
- Path 2 is undocumented for Max subscription auth and has zero user reports

---

## Comparison: Docker Sandbox vs Daytona for Claude Code

| Feature | Docker Sandbox | Daytona |
|---------|---------------|---------|
| Claude Code pre-installed | Yes (template) | Yes (default snapshot) |
| Max subscription auth | OAuth via proxy (had bug, fixed in v4.60.1) | Not documented, untested |
| --dangerously-skip-permissions | Yes (default) | Yes (documented) |
| Mount ~/.claude | No (user-level config not available) | No (not documented) |
| npm install | Yes | Yes |
| Self-hosted | Docker Desktop (free) | Docker Compose (experimental, "not production safe") |
| Known auth bugs | apiKeyHelper proxy-managed bug (#7842) | Unknown (nobody has tried) |

---

## Verdict for Our Use Case

**For the L-Thread orchestrator running Claude Code CLI with Max subscription in a self-hosted sandbox:**

1. **Daytona Cloud (hosted)**: POSSIBLE but requires API keys ($$$). Max subscription auth via SSH + OAuth is theoretically possible but completely untested by anyone publicly.

2. **Daytona Self-Hosted (OSS)**: NOT READY. The self-hosted deployment is explicitly marked as "not safe for production." No documentation about Claude Code integration in self-hosted mode.

3. **The `claude setup-token` workaround**: Generate a long-lived OAuth token from your Max subscription, set it as `CLAUDE_CODE_OAUTH_TOKEN` env var in the Daytona sandbox. This SHOULD work in theory but nobody has documented trying it.

4. **Better alternative for now**: Our current tmux-based local approach is simpler, proven, and uses Max subscription natively. If we need sandboxing, Docker Desktop sandboxes are the most battle-tested path (Anthropic + Docker have an active integration with known bug fixes).

---

## Key Sources

- [Daytona Claude Guides](https://www.daytona.io/docs/en/guides/claude/) -- Official docs (5 guides)
- [Scott Spence: Claude Code Swarm With Daytona Sandboxes](https://scottspence.com/posts/claude-code-swarm-daytona-sandboxes) -- Only independent practitioner report
- [Anthropic: Hosting the Agent SDK](https://code.claude.com/docs/en/agent-sdk/hosting) -- Daytona listed as sandbox provider
- [Anthropic: Authentication](https://code.claude.com/docs/en/authentication) -- Credential precedence and setup-token docs
- [daytonaio/daytona#2283](https://github.com/daytonaio/daytona/issues/2283) -- exec -1 bug (still open)
- [docker/for-mac#7842](https://github.com/docker/for-mac/issues/7842) -- OAuth auth broken in Docker sandboxes (fixed)
- [Daytona OSS Deployment](https://www.daytona.io/docs/en/oss-deployment/) -- Self-hosted setup (experimental)
- [Docker Sandboxes: Claude Code](https://docs.docker.com/ai/sandboxes/agents/claude-code/) -- Docker's approach for comparison
- [OpenAgents on X](https://x.com/OpenAgentsInc/status/1993183429626622259) -- Real Claude Code + Daytona integration demo
- [DaytonaSkills (frontboat)](https://github.com/frontboat/DaytonaSkills) -- Community example (3 stars, minimal)
