# VERIFY-05: Claude Code in Docker/Containers -- Official & Community Status

**Date**: 2026-04-04
**Verified by**: Deep research across official docs, GitHub issues, community sources
**Confidence**: HIGH (primary sources verified)

---

## 1. Official Docker/Devcontainer Setup

### What Anthropic Provides

Anthropic maintains a **reference devcontainer** setup in the official repo:

- **Repo**: `github.com/anthropics/claude-code/tree/main/.devcontainer`
- **Files**: `Dockerfile`, `devcontainer.json`, `init-firewall.sh`
- **Docs**: `code.claude.com/docs/en/devcontainer` (redirected from `docs.anthropic.com`)

### Official Dockerfile (Verbatim)

```dockerfile
FROM node:20

ARG TZ
ENV TZ="$TZ"
ARG CLAUDE_CODE_VERSION=latest

RUN apt-get update && apt-get install -y --no-install-recommends \
  less git procps sudo fzf zsh man-db unzip gnupg2 gh \
  iptables ipset iproute2 dnsutils aggregate jq nano vim \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/npm-global && chown -R node:node /usr/local/share

ARG USERNAME=node

# Persist bash history
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

ENV DEVCONTAINER=true

RUN mkdir -p /workspace /home/node/.claude && \
  chown -R node:node /workspace /home/node/.claude

WORKDIR /workspace

# git-delta for diffs
ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  sudo dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

USER node

ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano

# ZSH with powerlevel10k
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

# Firewall script
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "node ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/node-firewall && \
  chmod 0440 /etc/sudoers.d/node-firewall
USER node
```

### Official devcontainer.json

```json
{
  "name": "Claude Code Sandbox",
  "build": {
    "dockerfile": "Dockerfile",
    "args": {
      "TZ": "${localEnv:TZ:America/Los_Angeles}",
      "CLAUDE_CODE_VERSION": "latest",
      "GIT_DELTA_VERSION": "0.18.2",
      "ZSH_IN_DOCKER_VERSION": "1.2.0"
    }
  },
  "runArgs": ["--cap-add=NET_ADMIN", "--cap-add=NET_RAW"],
  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "eamodio.gitlens"
      ]
    }
  },
  "remoteUser": "node",
  "mounts": [
    "source=claude-code-bashhistory-${devcontainerId},target=/commandhistory,type=volume",
    "source=claude-code-config-${devcontainerId},target=/home/node/.claude,type=volume"
  ],
  "containerEnv": {
    "NODE_OPTIONS": "--max-old-space-size=4096",
    "CLAUDE_CONFIG_DIR": "/home/node/.claude",
    "POWERLEVEL9K_DISABLE_GITSTATUS": "true"
  },
  "workspaceMount": "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=delegated",
  "workspaceFolder": "/workspace",
  "postStartCommand": "sudo /usr/local/bin/init-firewall.sh",
  "waitFor": "postStartCommand"
}
```

### Firewall Allowlist (init-firewall.sh)

The firewall script uses iptables + ipset with a **default-deny** policy. Allowed outbound domains:

| Domain | Purpose |
|--------|---------|
| GitHub API (web, api, git IPs) | Git operations, gh CLI |
| registry.npmjs.org | npm packages |
| api.anthropic.com | Claude API |
| sentry.io | Error reporting |
| statsig.anthropic.com / statsig.com | Feature flags |
| marketplace.visualstudio.com | VS Code extensions |
| vscode.blob.core.windows.net | VS Code assets |
| update.code.visualstudio.com | VS Code updates |

Also allows: DNS (port 53), SSH (port 22), localhost, host network, Docker DNS.
Verification: script tests that `example.com` is blocked and `api.github.com` is reachable.

Key security details:
- Requires `--cap-add=NET_ADMIN --cap-add=NET_RAW` for iptables
- Runs as `node` user (non-root), with sudoers for firewall init only
- `DEVCONTAINER=true` env var set for detection

### Devcontainer Feature (Simpler Alternative)

Anthropic also publishes a **devcontainer feature** for adding Claude Code to any devcontainer:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/anthropics/devcontainer-features/claude-code:1": {}
  }
}
```

Source: `github.com/anthropics/devcontainer-features`

---

## 2. Authentication: `claude setup-token` (OAuth) vs `ANTHROPIC_API_KEY`

### Token Generation

```bash
claude setup-token
```

- Opens browser for OAuth authorization
- Prints a one-year token to stdout (does NOT save it)
- Format: `sk-ant-oat01-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Requires Pro, Max, Team, or Enterprise subscription
- Scoped to inference only (no Remote Control sessions)

### Usage in Containers

```bash
export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-your-token-here
```

### Authentication Precedence (Exact Order)

1. Cloud provider credentials (Bedrock/Vertex/Foundry)
2. `ANTHROPIC_AUTH_TOKEN` (Bearer header -- for LLM gateways)
3. `ANTHROPIC_API_KEY` (X-Api-Key header -- direct API, pay-per-token)
4. `apiKeyHelper` script output (dynamic/rotating credentials)
5. `CLAUDE_CODE_OAUTH_TOKEN` (long-lived OAuth from `setup-token`)
6. Subscription OAuth from `/login` (interactive browser flow)

### Critical: API Key vs Subscription Billing

| Method | Billing | Works in Container |
|--------|---------|-------------------|
| `ANTHROPIC_API_KEY` | API (pay-per-token) | YES -- most reliable |
| `CLAUDE_CODE_OAUTH_TOKEN` | Subscription (flat rate) | YES -- 1 year lifetime |
| Interactive `/login` | Subscription | NO -- needs browser |

**WARNING**: The `-p` flag (headless mode) with `ANTHROPIC_API_KEY` set ALWAYS bills to API, never subscription. A Max subscriber was billed $1,800 in 2 days because `ANTHROPIC_API_KEY` was set in their environment and took precedence (GitHub issue #37686). If you are a Max subscriber, ensure `ANTHROPIC_API_KEY` is NOT set; use `CLAUDE_CODE_OAUTH_TOKEN` instead.

### Bare Mode Caveat

`--bare` mode skips OAuth and keychain reads entirely. Authentication MUST come from `ANTHROPIC_API_KEY` or `apiKeyHelper`. `CLAUDE_CODE_OAUTH_TOKEN` is NOT read in bare mode.

---

## 3. Container-Specific Environment Variables

### Documented (Official)

| Variable | Purpose | Source |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | API key for direct billing | Official docs |
| `CLAUDE_CODE_OAUTH_TOKEN` | Long-lived subscription token | Official docs |
| `CLAUDE_CONFIG_DIR` | Config directory override (default `~/.claude`) | Official docs |
| `CLAUDE_CODE_TMPDIR` | Temp directory | Official docs |
| `DEVCONTAINER=true` | Set in official Dockerfile | Official Dockerfile |
| `DISABLE_TELEMETRY` | Opt out of telemetry | Official docs |
| `DISABLE_AUTOUPDATER` | Disable auto-updates | Official docs |
| `DISABLE_ERROR_REPORTING` | Disable Sentry | Official docs |
| `DISABLE_INTERACTIVITY` | Non-interactive mode | Official docs (listed, minimal detail) |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Kill autoupdater + telemetry + feedback + error reporting | Official docs |
| `NODE_OPTIONS=--max-old-space-size=4096` | Prevent OOM in containers | Official devcontainer.json |

### Undocumented but Community-Verified

| Variable | Purpose | Source |
|----------|---------|--------|
| `IS_SANDBOX=1` | Allows `--dangerously-skip-permissions` as root | GitHub issue #3490 (10+ thumbs up) |
| `CI=true` | Signals CI environment | Community usage |
| `CLAUDE_CODE_DISABLE_NONINTERACTIVE_CHECK=1` | Bypass nested session check | Community usage |

**The `IS_SANDBOX=1` workaround** is the most important undocumented variable. It allows `--dangerously-skip-permissions` to work when running as root in Docker (which is common in container environments). Without it, Claude Code refuses to run with the flag as root user.

---

## 4. Official Container Image

### GHCR Image

Anthropic publishes images at:

```
ghcr.io/anthropics/claude-code
```

- Tags follow CLI versions (e.g., `:1.0.20`, `:2.1.78`)
- `:latest` tracks most recent stable release
- **NOT on Docker Hub** -- only on GitHub Container Registry

### No Official Docker Hub Image

There is no `anthropic/claude-code` on Docker Hub. The `burakince/claude-code` image on Docker Hub returned 404 -- it appears to have been removed or never existed.

### Community Docker Hub Images

| Image | Notes |
|-------|-------|
| `gendosu/claude-code-docker` | Third-party |
| `jbkirkland/claude-code` | Third-party |
| `rogerdz/claude-code` | Third-party |
| `nodecloud/claude-code-devcontainer` | With Go, various languages |
| `docker/sandbox-templates:claude-code` | Docker's own sandbox template |

---

## 5. GitHub Issues: Key Docker-Related Issues

### Issue #1665 -- "Invalid API key / Please run /login"
- **Status**: CLOSED
- **Relevance**: Not Docker-specific. Was about macOS Keychain failure. Auto-locked.

### Issue #2095 -- "User Cloud Settings Persistently Resetting"
- **Status**: CLOSED
- **Relevance**: Not Docker-specific. Was about settings resetting on Linux. Fixed per Anthropic engineer.

### Issue #3490 -- "--dangerously-skip-permissions with root" (IMPORTANT)
- **Status**: CLOSED (auto-closed for inactivity)
- **Key finding**: `export IS_SANDBOX=1` allows `--dangerously-skip-permissions` as root
- **Community consensus**: This works. 10+ thumbs up on the comment revealing it.

### Issue #5172 -- "--dangerously-skip-permissions in Docker root container"
- **Status**: CLOSED (duplicate of #3490)

### Issue #37686 -- "claude -p caused $1,800+ API billing for Max subscriber" (CRITICAL)
- **Status**: OPEN
- **Root cause**: `-p` flag with `ANTHROPIC_API_KEY` in env bills to API, not subscription
- **Impact**: Max subscriber charged $1,800 in 2 days for scheduled headless runs

### Issue #22536 -- "Claude Code installer OOM when run as root during Docker build"
- **Status**: Known issue -- npm install as root can trigger OOM killer

### Issue #16135 -- "Background process termination crashes Claude Code in Docker"
- **Status**: Known issue -- killing background processes causes exit code 137

### Issue #15230 -- "CPU spins at 100% in Docker on Colima/virtiofs"
- **Status**: Known issue -- Colima ARM64 not supported (use Docker Desktop or OrbStack)

### Issue #22066 -- "OAuth authentication not persisting in Docker"
- **Status**: Known issue -- OAuth from `/login` does not persist between container restarts

### Issue #29515 -- "Docker support in Claude Code web environment"
- **Status**: Feature request for web IDE Docker access

### Issue #41357 -- "Claude Code destroyed Docker images and volumes"
- **Status**: Bug report -- Claude autonomously pruned Docker on host machine

---

## 6. Claude Max ($200/mo) in Docker

### Does it work?

**YES**, but with critical caveats:

1. **`CLAUDE_CODE_OAUTH_TOKEN`** (from `claude setup-token`): Generates a 1-year token tied to your Max subscription. This bills against your subscription quota, NOT per-token API billing. Works in containers.

2. **`ANTHROPIC_API_KEY`**: This is a SEPARATE billing path. If set, it takes precedence over subscription OAuth. Always bills pay-per-token to your API account, regardless of Max subscription.

3. **As of April 4, 2026**: Subscription OAuth tokens can only be used with OFFICIAL Anthropic tools (Claude Code CLI, claude.ai, Claude Desktop). Third-party tools (OpenClaw, Cline, Cursor) are blocked.

4. **Claude Code CLI in Docker IS an official tool** -- so subscription billing via `CLAUDE_CODE_OAUTH_TOKEN` works.

### Recommended Config for Max Subscribers in Docker

```bash
# Generate token on host (once per year)
claude setup-token
# Copy the printed token

# In Docker
export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
# Do NOT set ANTHROPIC_API_KEY -- it would override subscription billing
# Do NOT use --bare (it skips OAuth token reading)

claude -p "your prompt" --allowedTools "Bash,Read,Edit"
```

### What Does NOT Work for Max in Docker

- `--bare` mode does not read `CLAUDE_CODE_OAUTH_TOKEN`
- Interactive `/login` (needs browser)
- Third-party tools using extracted tokens

---

## 7. `--dangerously-skip-permissions` in Docker

### Known Issues

1. **Root user blocked**: Claude Code refuses `--dangerously-skip-permissions` when running as root (which is the default in many Docker images).
   - **Workaround**: `export IS_SANDBOX=1` (undocumented but widely used)
   - **Better**: Run as non-root user (like the official Dockerfile does with `USER node`)

2. **TTY handling**: Claude Code expects a pseudo-TTY for interactive mode. In containers:
   - Use `-p` flag for headless/non-interactive mode
   - Or use `docker run -it` to attach a TTY

3. **Background process crashes**: Killing background processes (manually or via Claude) causes exit code 137 in containers.

4. **OOM on npm install as root**: The npm installer can consume excessive memory when run as root during `docker build`.
   - **Workaround**: Use multi-stage build or set memory limits

### Recommended Docker Run Command

```bash
docker run -it \
  -e CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-... \
  -e DISABLE_AUTOUPDATER=1 \
  -e CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
  -v $(pwd):/workspace \
  ghcr.io/anthropics/claude-code:latest \
  claude --dangerously-skip-permissions -p "your prompt"
```

For root containers:

```bash
docker run -it \
  -e IS_SANDBOX=1 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  your-image \
  claude --dangerously-skip-permissions -p "your prompt"
```

---

## 8. Multi-Agent in Docker

### Official Guidance: Agent Teams

Anthropic's official multi-agent feature is **Agent Teams** (experimental):

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

- One lead session coordinates teammates
- Each teammate is a separate Claude Code instance
- Shared task list with dependency tracking
- Peer-to-peer messaging between teammates
- Recommended team size: 3-5 agents, 5-6 tasks each
- Display modes: in-process (default) or split-pane (tmux/iTerm2)

### Agent Teams in Containers

Agent Teams are NOT specifically designed for Docker. They assume all instances share a filesystem (for the shared task list at `~/.claude/teams/` and `~/.claude/tasks/`). In Docker, you would need:

- Shared volumes for `~/.claude/teams/` and `~/.claude/tasks/`
- All containers using the same `CLAUDE_CONFIG_DIR`
- tmux split-pane mode does not work across containers

### Alternative: One Container Per Agent

Community pattern (multiple independent Claude instances):

```bash
# Create bare git repo as shared upstream
git init --bare /path/to/upstream.git

# Each agent container
docker run -d \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -v /path/to/upstream.git:/upstream \
  ghcr.io/anthropics/claude-code:latest \
  bash -c "git clone /upstream /workspace && cd /workspace && \
    claude --dangerously-skip-permissions -p 'implement feature X'"
```

### Worktree Isolation (Recommended for tmux, not Docker)

Claude Code has built-in worktree support (`--worktree` flag) designed for local parallel sessions, not containers. Each worktree gets its own branch at `<repo>/.claude/worktrees/<name>`.

---

## 9. Real User Dockerfiles (Community)

### cabinlab/claude-code-sdk-docker

```
github.com/cabinlab/claude-code-sdk-docker
```

- 4 variants: Debian/Alpine x TypeScript/Python
- Pre-configures non-interactive operation (solves first-run wizard problem)
- Auth: `CLAUDE_CODE_OAUTH_TOKEN` for Pro/Max, `ANTHROPIC_API_KEY` for API
- Non-root `claude` user
- Sizes: 383MB (Alpine TS) to 693MB (Debian Python)

### RchGrav/claudebox

```
github.com/RchGrav/claudebox
```

- Full development environment with profiles
- Pre-configured development tools
- Reproducible environment setup

### nezhar/claude-container

```
github.com/nezhar/claude-container
```

- Complete isolation from host system
- Persistent credentials and workspace access

### deepworks-net/docker.claude-code

```
github.com/deepworks-net/docker.claude-code
```

- Windows support without WSL
- Automated container creation scripts

### tintinweb/claude-code-container

```
github.com/tintinweb/claude-code-container
```

- Specifically designed for `--dangerously-skip-permissions` mode

---

## 10. Docker Sandboxes (Docker, Inc. Product)

Docker has released **Docker Sandboxes** as a product for running coding agents safely:

- Uses MicroVM-based isolation
- Supports Claude Code, Gemini, Codex, Kiro
- Agents can modify files and run containers while host stays untouched
- Blog post: `docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/` (Jan 30, 2026)

Separate from the devcontainer setup. This is Docker's commercial product for agent sandboxing.

---

## 11. npm Install Deprecation Notice

As of February 2026, Anthropic has deprecated `npm install -g @anthropic-ai/claude-code` in favor of a native installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

However, npm install still works (the official Dockerfile still uses it). The native installer supports auto-updates and release channels (latest vs stable). For Docker, npm install with version pinning is still the recommended approach since you want reproducible builds.

---

## Summary: What Works, What Doesn't

### WORKS RELIABLY

- Official devcontainer with firewall (`code.claude.com/docs/en/devcontainer`)
- `ANTHROPIC_API_KEY` in containers (API billing)
- `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` (subscription billing, 1 year)
- `--dangerously-skip-permissions` as non-root user
- `IS_SANDBOX=1` for root containers (undocumented workaround)
- `-p` flag for headless/non-interactive execution
- `ghcr.io/anthropics/claude-code:latest` as base image

### WORKS WITH CAVEATS

- Claude Max in Docker (works via `CLAUDE_CODE_OAUTH_TOKEN`, but do NOT set `ANTHROPIC_API_KEY`)
- `--bare` mode (faster startup, but skips OAuth -- must use API key)
- Agent Teams across containers (needs shared volumes for task coordination)
- npm install in Docker (deprecated but still functional)

### DOES NOT WORK

- Interactive `/login` in headless containers (needs browser)
- `--dangerously-skip-permissions` as root without `IS_SANDBOX=1`
- OAuth persistence between container restarts (tokens from `/login` don't persist)
- Third-party tools with subscription tokens (blocked since April 2026)
- Colima/virtiofs on ARM64 (CPU spin at 100%)
- `CLAUDE_CODE_OAUTH_TOKEN` in `--bare` mode

---

## Recommended Docker Setup for Orchestrator

For the orchestrator's use case (tmux-based multi-agent with Claude Max subscription):

```bash
# On host machine (once per year):
claude setup-token
# Save the sk-ant-oat01-... token securely

# Container environment:
export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
export DISABLE_AUTOUPDATER=1
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export NODE_OPTIONS="--max-old-space-size=4096"

# If running as root (common in Docker):
export IS_SANDBOX=1

# Run:
claude --dangerously-skip-permissions -p "your task"
```

For multi-agent, tmux-inside-Docker is simpler than multi-container:

```dockerfile
FROM ghcr.io/anthropics/claude-code:latest
USER root
RUN apt-get update && apt-get install -y tmux
USER node
```

This keeps the current tmux-based orchestration model intact while gaining container isolation.

---

*Sources: code.claude.com/docs, github.com/anthropics/claude-code, GitHub issues #3490 #5172 #37686 #16135 #22536 #22066, docker.com/blog, cabinlab/claude-code-sdk-docker, community Docker Hub images*
