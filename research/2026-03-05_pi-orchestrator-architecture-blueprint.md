# Pi Orchestrator Architecture Blueprint

**Date:** 2026-03-05
**Status:** Architecture Specification
**Migration Path:** L-Thread Orchestrator -> Pi Agent Custom Harness
**Target:** Production-ready orchestrator on Pi Agent with full L-Thread discipline preservation

---

## 1. Architecture Overview

The target architecture places Pi Agent at the core, wrapping it with a disciplined extension stack that preserves every L-Thread orchestrator guarantee while gaining model agnosticism, a composable extension system, and native sub-agent support.

```
+===========================================================================+
|                        PI ORCHESTRATOR HARNESS                            |
|                                                                           |
|  +---------------------------+    +-----------------------------------+   |
|  |   orchestrator-discipline |    |      orchestrator-dashboard       |   |
|  |   (4 Absolute Rules)     |    |      (TUI Status Widget)          |   |
|  |   - never-write-code     |    |      - agent grid                 |   |
|  |   - e2e-gate             |    |      - cost tracker               |   |
|  |   - mode-aware           |    |      - context budget             |   |
|  |   - auto-mode            |    |      - decision log tail          |   |
|  +---------------------------+    +-----------------------------------+   |
|                                                                           |
|  +---------------------------+    +-----------------------------------+   |
|  |   orchestrator-state      |    |      orchestrator-agents          |   |
|  |   (Persistence Layer)     |    |      (Lifecycle Manager)          |   |
|  |   - JSONL decision log    |    |      - spawn via pi subagent     |   |
|  |   - JSON snapshots        |    |      - health heartbeat          |   |
|  |   - tiered context        |    |      - timeout / kill            |   |
|  |   - handoff payloads      |    |      - pool limits               |   |
|  +---------------------------+    +-----------------------------------+   |
|                                                                           |
|  +---------------------------+    +-----------------------------------+   |
|  |   orchestrator-comms      |    |      orchestrator-e2e-gate       |   |
|  |   (Agent Messaging)       |    |      (Testing Enforcement)       |   |
|  |   - file-based inbox      |    |      - Chrome DevTools MCP       |   |
|  |   - structured envelopes  |    |      - screenshot diffing        |   |
|  |   - broadcast / unicast   |    |      - assertion library         |   |
|  |   - tmux fallback         |    |      - gate verdict log          |   |
|  +---------------------------+    +-----------------------------------+   |
|                                                                           |
|  +--------------------------------------------------------------------+  |
|  |                    orchestrator-mcp-bridge                          |  |
|  |   (Selective MCP Exposure via pi-mcp-adapter pattern)              |  |
|  |   - allowlist per agent role                                       |  |
|  |   - Chrome DevTools MCP    -> e2e agents only                      |  |
|  |   - Notion MCP             -> doc agents only                      |  |
|  |   - shadcn MCP             -> UI agents only                       |  |
|  +--------------------------------------------------------------------+  |
|                                                                           |
|  +--------------------------------------------------------------------+  |
|  |                    PI AGENT CORE (v0.5+)                           |  |
|  |   4 Native Tools: read | write | edit | bash                      |  |
|  |   Extension API: beforeToolCall / afterToolCall hooks              |  |
|  |   Model Router: 300+ models via OpenRouter / local / direct API   |  |
|  |   Sub-Agent: pi --sub-agent / SDK programmatic spawn              |  |
|  |   Session: .pi/sessions/ conversation persistence                 |  |
|  +--------------------------------------------------------------------+  |
|                                                                           |
|  +--------------------------------------------------------------------+  |
|  |                    MODEL ROUTING LAYER                              |  |
|  |                                                                    |  |
|  |   Tier 0 (Frontier)    : Claude Opus 4 / Gemini 2.5 Pro           |  |
|  |   Tier 1 (Workhorse)   : Claude Sonnet 4 / GPT-4.1               |  |
|  |   Tier 2 (Fast/Cheap)  : Claude Haiku / Gemini Flash / MorphLLM   |  |
|  |   Tier 3 (Specialized) : Codestral / DeepSeek-V3 for code-only    |  |
|  +--------------------------------------------------------------------+  |
+===========================================================================+
         |                    |                    |
         v                    v                    v
   +-----------+      +-------------+      +-------------+
   | Agent 1   |      | Agent 2     |      | Agent N     |
   | (coder)   |      | (reviewer)  |      | (e2e-test)  |
   | Sonnet 4  |      | Opus 4      |      | Haiku       |
   | sandboxed |      | read-only   |      | MCP access  |
   +-----------+      +-------------+      +-------------+
         |                    |                    |
         v                    v                    v
   +-----------------------------------------------------+
   |              SHARED FILESYSTEM STATE                  |
   |  _bmad/orchestrator-state.json                       |
   |  _bmad/decisions.jsonl                               |
   |  _bmad/agent-inboxes/<agent-id>/                     |
   |  _bmad/handoffs/<from>-<to>.json                     |
   |  _bmad/e2e-verdicts/                                 |
   +-----------------------------------------------------+
```

### Component Roles

- **Pi Agent Core**: The runtime. Provides 4 tools (read, write, edit, bash), extension hooks, model routing, and sub-agent spawning. We never fork Pi -- we extend it.
- **Extension Stack**: 7 TypeScript extensions that register via Pi's `defineExtension()` API. Each intercepts tool calls through `beforeToolCall`/`afterToolCall` hooks.
- **Model Routing Layer**: Leverages Pi's native multi-model support. The orchestrator selects models per agent role, not globally.
- **Shared Filesystem State**: All coordination happens through the filesystem. No databases, no message brokers. Files are the protocol.

---

## 2. Extension Stack

Every extension follows Pi's extension contract: a default-exported function receiving the Pi context object, returning tool definitions and/or hook registrations.

### 2.1 `orchestrator-discipline.ts` -- Core Rules Enforcement

This is the non-negotiable guard. It intercepts every tool call and enforces the 4 Absolute Rules.

```typescript
// extensions/orchestrator-discipline.ts
import { defineExtension, PiContext, ToolCall, ToolResult } from "@anthropic/pi-sdk";

interface DisciplineConfig {
  codeExtensions: string[];     // [".ts", ".tsx", ".js", ".jsx", ".py", ...]
  stateFilePatterns: string[];  // ["_bmad/**", ".pi/sessions/**"]
  autoModeFile: string;         // ".bmad/AUTO_MODE"
}

export default defineExtension({
  name: "orchestrator-discipline",
  version: "1.0.0",

  hooks: {
    beforeToolCall(ctx: PiContext, call: ToolCall): ToolCall | null {
      // RULE 1: DU BIST KEIN ENTWICKLER
      if (ctx.role === "orchestrator") {
        if (call.tool === "edit" || call.tool === "write") {
          const target = call.params.file_path as string;
          const isCodeFile = DISCIPLINE_CONFIG.codeExtensions
            .some(ext => target.endsWith(ext));
          const isStateFile = DISCIPLINE_CONFIG.stateFilePatterns
            .some(pat => minimatch(target, pat));

          if (isCodeFile && !isStateFile) {
            ctx.log.warn(`BLOCKED: Orchestrator attempted to write code: ${target}`);
            ctx.log.warn(`ACTION: Spawn an agent for this task instead.`);
            return null; // null = cancel the tool call
          }
        }
      }

      // RULE 4: AUTO-MODE -- suppress any user-input waits
      if (ctx.autoMode && call.tool === "bash") {
        const cmd = call.params.command as string;
        if (cmd.includes("read -p") || cmd.includes("select ")) {
          ctx.log.warn(`BLOCKED: Interactive command in auto-mode: ${cmd}`);
          return null;
        }
      }

      return call; // pass through
    },

    afterToolCall(ctx: PiContext, call: ToolCall, result: ToolResult): ToolResult {
      // Log every tool call to decision log for audit trail
      ctx.extensions.state?.logDecision({
        timestamp: Date.now(),
        tool: call.tool,
        target: call.params.file_path || call.params.command,
        role: ctx.role,
        result: result.success ? "ok" : "blocked",
      });
      return result;
    },
  },

  setup(ctx: PiContext) {
    // Check auto-mode on startup
    try {
      const autoMode = ctx.fs.read(".bmad/AUTO_MODE").trim();
      ctx.autoMode = autoMode === "ENABLED";
    } catch {
      ctx.autoMode = false;
    }
  },
});
```

**Key design decision:** The discipline extension loads first (priority 0) so it intercepts before any other extension sees the call.

### 2.2 `orchestrator-state.ts` -- Persistence Layer

Manages three state artifacts: the snapshot JSON, the decision JSONL log, and tiered context windows.

```typescript
// extensions/orchestrator-state.ts
export default defineExtension({
  name: "orchestrator-state",
  version: "1.0.0",

  tools: {
    "state-snapshot": {
      description: "Read or write the orchestrator state snapshot",
      params: {
        action: { type: "string", enum: ["read", "write"] },
        data: { type: "object", optional: true },
      },
      execute(ctx, params) {
        const STATE_PATH = "_bmad/orchestrator-state.json";
        if (params.action === "read") {
          return JSON.parse(ctx.fs.read(STATE_PATH));
        }
        ctx.fs.write(STATE_PATH, JSON.stringify(params.data, null, 2));
        return { written: true };
      },
    },

    "decision-log": {
      description: "Append a decision entry to the JSONL log",
      params: {
        entry: { type: "object" },
      },
      execute(ctx, params) {
        const LOG_PATH = "_bmad/decisions.jsonl";
        ctx.fs.append(LOG_PATH, JSON.stringify(params.entry) + "\n");
        return { logged: true };
      },
    },

    "context-window": {
      description: "Get tiered context for current task",
      params: {
        tier: { type: "number", enum: [0, 1, 2] },
        taskId: { type: "string" },
      },
      execute(ctx, params) {
        // Tier 0: Active task only (< 2K tokens)
        // Tier 1: Active task + related tasks (< 8K tokens)
        // Tier 2: Full project context (< 32K tokens)
        return buildTieredContext(ctx, params.tier, params.taskId);
      },
    },
  },
});
```

### 2.3 `orchestrator-agents.ts` -- Agent Lifecycle Manager

Spawns, monitors, and kills sub-agents. Maps directly to Pi's sub-agent API.

```typescript
// extensions/orchestrator-agents.ts
export default defineExtension({
  name: "orchestrator-agents",
  version: "1.0.0",

  tools: {
    "agent-spawn": {
      description: "Spawn a new sub-agent with role-specific config",
      params: {
        role: { type: "string" },          // "coder" | "reviewer" | "e2e-tester" | "researcher"
        taskId: { type: "string" },
        model: { type: "string", optional: true },  // override model selection
        systemPrompt: { type: "string", optional: true },
        mcpAllowlist: { type: "array", items: { type: "string" }, optional: true },
        timeout: { type: "number", optional: true }, // ms, default 300000
      },
      async execute(ctx, params) {
        // Check pool limits (max 5 concurrent agents)
        const state = ctx.extensions.state?.snapshot();
        const activeCount = Object.values(state.agents)
          .filter((a: any) => a.status === "running").length;
        if (activeCount >= 5) {
          return { error: "POOL_LIMIT", message: "Max 5 concurrent agents" };
        }

        const agentId = `${params.role}-${params.taskId}-${Date.now()}`;
        const model = params.model || MODEL_MAP[params.role];

        // Create agent inbox
        ctx.fs.mkdir(`_bmad/agent-inboxes/${agentId}`);

        // Spawn via Pi sub-agent API
        const agent = await ctx.subAgent.spawn({
          id: agentId,
          model: model,
          systemPrompt: buildAgentPrompt(params.role, params.taskId, params.systemPrompt),
          extensions: getExtensionsForRole(params.role, params.mcpAllowlist),
          timeout: params.timeout || 300000,
          onComplete: (result) => handleAgentComplete(ctx, agentId, result),
          onError: (err) => handleAgentError(ctx, agentId, err),
        });

        // Register in state
        ctx.extensions.state?.updateAgent(agentId, {
          status: "running",
          role: params.role,
          taskId: params.taskId,
          model: model,
          spawnedAt: Date.now(),
        });

        return { agentId, model, status: "spawned" };
      },
    },

    "agent-kill": {
      description: "Terminate a running agent",
      params: { agentId: { type: "string" } },
      async execute(ctx, params) {
        await ctx.subAgent.terminate(params.agentId);
        ctx.extensions.state?.updateAgent(params.agentId, { status: "killed" });
        return { killed: true };
      },
    },

    "agent-list": {
      description: "List all agents with status",
      params: {},
      execute(ctx) {
        const state = ctx.extensions.state?.snapshot();
        return state.agents;
      },
    },

    "agent-health": {
      description: "Check heartbeat of a specific agent",
      params: { agentId: { type: "string" } },
      execute(ctx, params) {
        const heartbeatFile = `_bmad/agent-inboxes/${params.agentId}/.heartbeat`;
        try {
          const ts = parseInt(ctx.fs.read(heartbeatFile).trim());
          const age = Date.now() - ts;
          return { alive: age < 30000, lastHeartbeat: ts, ageMs: age };
        } catch {
          return { alive: false, lastHeartbeat: null };
        }
      },
    },
  },
});

// Model assignment per role
const MODEL_MAP: Record<string, string> = {
  "coder":      "anthropic/claude-sonnet-4",
  "reviewer":   "anthropic/claude-opus-4",
  "e2e-tester": "anthropic/claude-haiku",
  "researcher": "google/gemini-2.5-pro",
  "refactor":   "deepseek/deepseek-v3",
  "docs":       "anthropic/claude-haiku",
};
```

### 2.4 `orchestrator-comms.ts` -- Inter-Agent Messaging

File-based messaging following the pi-messenger pattern. Every agent has an inbox directory.

```typescript
// extensions/orchestrator-comms.ts
export default defineExtension({
  name: "orchestrator-comms",
  version: "1.0.0",

  tools: {
    "msg-send": {
      description: "Send a message to an agent's inbox",
      params: {
        to: { type: "string" },       // agentId or "broadcast"
        type: { type: "string" },      // "task" | "result" | "query" | "shutdown"
        payload: { type: "object" },
        priority: { type: "string", enum: ["normal", "urgent"], optional: true },
      },
      execute(ctx, params) {
        const envelope: MessageEnvelope = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          from: ctx.agentId || "orchestrator",
          to: params.to,
          type: params.type,
          payload: params.payload,
          priority: params.priority || "normal",
          timestamp: Date.now(),
        };

        if (params.to === "broadcast") {
          // Write to all agent inboxes
          const state = ctx.extensions.state?.snapshot();
          for (const [id, agent] of Object.entries(state.agents)) {
            if ((agent as any).status === "running") {
              ctx.fs.write(
                `_bmad/agent-inboxes/${id}/${envelope.id}.json`,
                JSON.stringify(envelope, null, 2)
              );
            }
          }
        } else {
          ctx.fs.write(
            `_bmad/agent-inboxes/${params.to}/${envelope.id}.json`,
            JSON.stringify(envelope, null, 2)
          );
        }

        return { sent: true, messageId: envelope.id };
      },
    },

    "msg-read": {
      description: "Read messages from the current agent's inbox",
      params: {
        limit: { type: "number", optional: true },
        type: { type: "string", optional: true },
      },
      execute(ctx, params) {
        const inboxPath = `_bmad/agent-inboxes/${ctx.agentId}/`;
        const files = ctx.fs.list(inboxPath)
          .filter(f => f.endsWith(".json"))
          .sort(); // chronological by message ID

        const messages = files
          .slice(0, params.limit || 10)
          .map(f => JSON.parse(ctx.fs.read(`${inboxPath}${f}`)))
          .filter(m => !params.type || m.type === params.type);

        return messages;
      },
    },

    "msg-ack": {
      description: "Acknowledge a message (moves to processed/)",
      params: { messageId: { type: "string" } },
      execute(ctx, params) {
        const src = `_bmad/agent-inboxes/${ctx.agentId}/${params.messageId}.json`;
        const dst = `_bmad/agent-inboxes/${ctx.agentId}/processed/${params.messageId}.json`;
        ctx.fs.move(src, dst);
        return { acked: true };
      },
    },
  },
});
```

### 2.5 `orchestrator-mcp-bridge.ts` -- Selective MCP Exposure

Wraps MCP servers and exposes them only to agents whose roles permit access. Based on the pi-mcp-adapter pattern.

```typescript
// extensions/orchestrator-mcp-bridge.ts
export default defineExtension({
  name: "orchestrator-mcp-bridge",
  version: "1.0.0",

  // Role-based MCP allowlists
  config: {
    allowlists: {
      "e2e-tester": [
        "chrome-devtools:*",           // full Chrome DevTools access
      ],
      "coder": [],                      // no MCP access -- pure code
      "reviewer": [],                   // no MCP access -- pure review
      "ui-agent": [
        "shadcn:*",                     // UI component registry
        "chrome-devtools:take_screenshot",  // screenshots only
      ],
      "docs": [
        "notion:*",                     // full Notion access
      ],
      "orchestrator": [
        "chrome-devtools:*",           // for E2E gate verification
        "notion:notion-search",        // for task lookup
      ],
    } as Record<string, string[]>,
  },

  hooks: {
    beforeToolCall(ctx: PiContext, call: ToolCall): ToolCall | null {
      // Intercept MCP tool calls and check allowlist
      if (call.tool.startsWith("mcp__")) {
        const role = ctx.role || "unknown";
        const allowlist = this.config.allowlists[role] || [];
        const mcpTool = call.tool.replace("mcp__", "");

        const allowed = allowlist.some(pattern => {
          if (pattern.endsWith(":*")) {
            const prefix = pattern.slice(0, -2);
            return mcpTool.startsWith(prefix);
          }
          return mcpTool === pattern.replace(":", "__");
        });

        if (!allowed) {
          ctx.log.warn(`MCP BLOCKED: Role "${role}" cannot use ${call.tool}`);
          return null;
        }
      }
      return call;
    },
  },
});
```

### 2.6 `orchestrator-e2e-gate.ts` -- Testing Enforcement

Enforces Rule 2: no issue is marked Done without passing E2E verification.

```typescript
// extensions/orchestrator-e2e-gate.ts
export default defineExtension({
  name: "orchestrator-e2e-gate",
  version: "1.0.0",

  tools: {
    "e2e-verify": {
      description: "Run E2E verification for a task before marking it done",
      params: {
        taskId: { type: "string" },
        checks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              assertion: { type: "string" },   // CSS selector, text content, etc.
              type: { type: "string", enum: ["element-exists", "text-contains",
                "screenshot-diff", "console-no-errors", "network-no-failures"] },
            },
          },
        },
      },
      async execute(ctx, params) {
        const verdicts: any[] = [];

        for (const check of params.checks) {
          // Delegate to Chrome DevTools MCP through the bridge
          const result = await runCheck(ctx, check);
          verdicts.push({
            check: check.assertion,
            type: check.type,
            passed: result.passed,
            detail: result.detail,
          });
        }

        const allPassed = verdicts.every(v => v.passed);

        // Write verdict file
        const verdictFile = `_bmad/e2e-verdicts/${params.taskId}.json`;
        ctx.fs.write(verdictFile, JSON.stringify({
          taskId: params.taskId,
          timestamp: Date.now(),
          passed: allPassed,
          verdicts,
        }, null, 2));

        return { taskId: params.taskId, passed: allPassed, verdicts };
      },
    },

    "e2e-gate-check": {
      description: "Check if a task has a passing E2E verdict (call before marking done)",
      params: { taskId: { type: "string" } },
      execute(ctx, params) {
        const verdictFile = `_bmad/e2e-verdicts/${params.taskId}.json`;
        try {
          const verdict = JSON.parse(ctx.fs.read(verdictFile));
          const age = Date.now() - verdict.timestamp;
          const fresh = age < 600000; // verdict less than 10 minutes old
          return {
            hasVerdict: true,
            passed: verdict.passed && fresh,
            ageMs: age,
            stale: !fresh,
          };
        } catch {
          return { hasVerdict: false, passed: false };
        }
      },
    },
  },

  hooks: {
    beforeToolCall(ctx: PiContext, call: ToolCall): ToolCall | null {
      // Intercept state writes that mark tasks as "done"
      if (call.tool === "write" && call.params.file_path?.includes("orchestrator-state")) {
        const content = call.params.content;
        if (content && typeof content === "string" && content.includes('"done"')) {
          // Check for E2E verdict
          const state = JSON.parse(content);
          for (const [taskId, task] of Object.entries(state.tasks || {})) {
            if ((task as any).status === "done") {
              const verdict = this.tools["e2e-gate-check"].execute(ctx, { taskId });
              if (!verdict.passed) {
                ctx.log.error(`E2E GATE BLOCKED: Task ${taskId} has no passing E2E verdict`);
                return null; // Block the state write
              }
            }
          }
        }
      }
      return call;
    },
  },
});
```

### 2.7 `orchestrator-dashboard.ts` -- TUI Status Widget

Provides a terminal dashboard for observing orchestrator state in real-time.

```typescript
// extensions/orchestrator-dashboard.ts
export default defineExtension({
  name: "orchestrator-dashboard",
  version: "1.0.0",

  tools: {
    "dashboard-render": {
      description: "Render current orchestrator status as formatted text",
      params: {},
      execute(ctx) {
        const state = ctx.extensions.state?.snapshot();
        const agents = state?.agents || {};
        const tasks = state?.tasks || {};

        let output = "=== PI ORCHESTRATOR DASHBOARD ===\n\n";

        // Agent status grid
        output += "AGENTS:\n";
        output += "+--------------+----------+------------------+---------+\n";
        output += "| ID           | Role     | Model            | Status  |\n";
        output += "+--------------+----------+------------------+---------+\n";
        for (const [id, agent] of Object.entries(agents)) {
          const a = agent as any;
          output += `| ${id.slice(0, 12).padEnd(12)} | ${(a.role || "").padEnd(8)} | ${(a.model || "").slice(0, 16).padEnd(16)} | ${(a.status || "").padEnd(7)} |\n`;
        }
        output += "+--------------+----------+------------------+---------+\n\n";

        // Task summary
        const taskStatuses = Object.values(tasks).reduce((acc: any, t: any) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});
        output += `TASKS: ${JSON.stringify(taskStatuses)}\n\n`;

        // Recent decisions (last 5)
        const logPath = "_bmad/decisions.jsonl";
        try {
          const lines = ctx.fs.read(logPath).trim().split("\n").slice(-5);
          output += "RECENT DECISIONS:\n";
          for (const line of lines) {
            const d = JSON.parse(line);
            const time = new Date(d.timestamp).toLocaleTimeString();
            output += `  [${time}] ${d.tool} -> ${d.target?.slice(0, 40)} (${d.result})\n`;
          }
        } catch { /* no log yet */ }

        return output;
      },
    },
  },
});
```

---

## 3. State Architecture

### 3.1 File Layout

```
_bmad/
  orchestrator-state.json          # Primary state snapshot
  decisions.jsonl                   # Append-only decision audit log
  agent-inboxes/
    coder-TASK001-1709654400000/
      msg-1709654401000-a3f2b1.json
      .heartbeat
      processed/
        msg-1709654399000-c1d2e3.json
  handoffs/
    coder-TASK001-reviewer-TASK001.json
  e2e-verdicts/
    TASK001.json
    TASK002.json
  context-tiers/
    tier0-TASK001.md               # Active task only
    tier1-TASK001.md               # Task + related
    tier2-global.md                # Full project context
```

### 3.2 State Snapshot Schema (`orchestrator-state.json`)

```json
{
  "version": "2.0.0",
  "mode": "pi-orchestrator",
  "startedAt": 1709654400000,
  "autoMode": true,
  "currentPhase": "execution",

  "tasks": {
    "TASK001": {
      "title": "Implement user auth flow",
      "status": "in-progress",
      "assignedAgent": "coder-TASK001-1709654400000",
      "model": "anthropic/claude-sonnet-4",
      "priority": "high",
      "dependencies": [],
      "e2eVerdict": null,
      "createdAt": 1709654400000,
      "updatedAt": 1709654500000
    },
    "TASK002": {
      "title": "Review auth flow implementation",
      "status": "blocked",
      "assignedAgent": null,
      "model": null,
      "priority": "high",
      "dependencies": ["TASK001"],
      "e2eVerdict": null,
      "createdAt": 1709654400000,
      "updatedAt": 1709654400000
    }
  },

  "agents": {
    "coder-TASK001-1709654400000": {
      "role": "coder",
      "taskId": "TASK001",
      "model": "anthropic/claude-sonnet-4",
      "status": "running",
      "spawnedAt": 1709654400000,
      "lastHeartbeat": 1709654550000,
      "tokenUsage": { "input": 12400, "output": 3200 },
      "costEstimate": 0.023
    }
  },

  "roadblocks": [],

  "metrics": {
    "totalTokens": { "input": 45000, "output": 12000 },
    "totalCost": 0.089,
    "agentsSpawned": 3,
    "agentsCompleted": 1,
    "agentsFailed": 0,
    "e2eRuns": 0,
    "e2ePasses": 0
  }
}
```

### 3.3 Decision Log Schema (`decisions.jsonl`)

Each line is a self-contained JSON object. This log is append-only and never truncated during a session.

```json
{"timestamp":1709654400123,"tool":"agent-spawn","target":"coder-TASK001","role":"orchestrator","result":"ok","meta":{"model":"anthropic/claude-sonnet-4"}}
{"timestamp":1709654410456,"tool":"write","target":"src/auth/login.ts","role":"coder-TASK001","result":"ok","meta":{"linesChanged":42}}
{"timestamp":1709654420789,"tool":"edit","target":"src/auth/login.ts","role":"orchestrator","result":"blocked","meta":{"reason":"RULE1_NO_CODE"}}
{"timestamp":1709654500000,"tool":"e2e-verify","target":"TASK001","role":"orchestrator","result":"ok","meta":{"checks":3,"passed":3}}
```

### 3.4 Tiered Context System

Context is pre-built at three tiers to control token budgets when agents are spawned or when the orchestrator compacts:

| Tier | Max Tokens | Contents | Use Case |
|------|-----------|----------|----------|
| Tier 0 | ~2,000 | Current task description, acceptance criteria, file paths | Agent spawn prompt |
| Tier 1 | ~8,000 | Tier 0 + related tasks, dependency chain, recent decisions | Mid-task re-orientation |
| Tier 2 | ~32,000 | Tier 1 + full project context, architecture notes, all active tasks | Orchestrator compaction handoff |

Tiered context files are regenerated on every state transition (task status change, agent spawn/complete). The orchestrator's `preCompact` hook writes a Tier 2 context file so the next session starts with full awareness.

### 3.5 Handoff Payload Schema

When an agent completes and its output needs to flow to the next agent:

```json
{
  "from": "coder-TASK001-1709654400000",
  "to": "reviewer-TASK001-1709654600000",
  "taskId": "TASK001",
  "timestamp": 1709654590000,
  "summary": "Implemented auth flow in src/auth/. 3 files changed, 142 lines added.",
  "filesChanged": [
    "src/auth/login.ts",
    "src/auth/middleware.ts",
    "src/auth/types.ts"
  ],
  "decisions": [
    "Used JWT over session cookies for stateless auth",
    "Added rate limiting middleware per security requirements"
  ],
  "openQuestions": [
    "Token expiry set to 1h -- confirm with product"
  ],
  "testResults": {
    "unitTests": { "passed": 12, "failed": 0 },
    "lintClean": true
  }
}
```

---

## 4. Agent Communication Design

### 4.1 Message Envelope Format

All inter-agent communication uses a standardized envelope written as JSON files to agent inbox directories.

```json
{
  "id": "msg-1709654401000-a3f2b1",
  "from": "orchestrator",
  "to": "coder-TASK001-1709654400000",
  "type": "task",
  "priority": "normal",
  "timestamp": 1709654401000,
  "payload": {
    "taskId": "TASK001",
    "instruction": "Implement the login endpoint per spec in docs/auth-spec.md",
    "files": ["src/auth/login.ts"],
    "constraints": ["Do not modify package.json", "Use existing bcrypt dependency"],
    "contextTier": 0,
    "contextPath": "_bmad/context-tiers/tier0-TASK001.md"
  },
  "replyTo": null,
  "ttl": 300000
}
```

### 4.2 Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `task` | orchestrator -> agent | Assign work with instructions and context |
| `result` | agent -> orchestrator | Report completion with summary and artifacts |
| `query` | agent -> orchestrator | Ask for clarification or additional context |
| `feedback` | orchestrator -> agent | Provide corrections or additional instructions |
| `shutdown` | orchestrator -> agent | Graceful shutdown request |
| `heartbeat` | agent -> orchestrator | Periodic alive signal (written to `.heartbeat` file) |
| `broadcast` | orchestrator -> all | System-wide announcement (e.g., priority change) |

### 4.3 Communication Flow

```
Orchestrator                    Agent (coder)                Agent (reviewer)
    |                               |                             |
    |--- task (TASK001) ----------->|                             |
    |                               |                             |
    |                               |... works on code ...        |
    |                               |                             |
    |<-- heartbeat (every 15s) -----|                             |
    |                               |                             |
    |<-- result (TASK001 done) -----|                             |
    |                               |                             |
    |--- shutdown ----------------->|                             |
    |                                                             |
    |   [writes handoff payload to _bmad/handoffs/]               |
    |                                                             |
    |--- task (review TASK001) ---------------------------------->|
    |                                                             |
    |<-- heartbeat (every 15s) -----------------------------------|
    |                                                             |
    |<-- result (review passed) ----------------------------------|
    |                                                             |
    |   [runs e2e-verify]                                         |
    |   [marks TASK001 as done]                                   |
```

### 4.4 Tmux Fallback

When Pi's sub-agent spawning is unavailable or when debugging requires visible terminals, the orchestrator falls back to tmux-based communication. The tmux path reuses the existing L-Thread tmux patterns:

```
tmux session: "orch-coder-TASK001"
  - Agent reads tasks from inbox directory (same as Pi sub-agent mode)
  - Orchestrator writes messages via filesystem (same protocol)
  - Orchestrator monitors via `tmux capture-pane` for crash detection
  - State file: _bmad/orchestrator-tmux-state.json (existing format preserved)
```

The communication protocol is identical in both modes. Only the agent runtime changes. This means the extensions work without modification regardless of spawn mechanism.

---

## 5. Model Routing Strategy

Pi Agent's access to 300+ models through OpenRouter and direct API connections enables cost-optimized routing. The orchestrator assigns models based on agent role and task complexity.

### 5.1 Routing Table

| Agent Role | Default Model | Rationale | Est. Cost/Task |
|-----------|---------------|-----------|----------------|
| **orchestrator** | `anthropic/claude-opus-4` | Needs best reasoning for planning, dependency resolution, and judgment calls | $0.05-0.15 |
| **coder** | `anthropic/claude-sonnet-4` | Best code generation quality-to-cost ratio. Handles 95% of implementation tasks. | $0.02-0.08 |
| **reviewer** | `anthropic/claude-opus-4` | Code review requires deep reasoning about correctness, security, architecture | $0.03-0.10 |
| **e2e-tester** | `anthropic/claude-haiku` | Test scripts are formulaic; fast model reduces E2E gate latency | $0.002-0.01 |
| **researcher** | `google/gemini-2.5-pro` | 1M token context window for reading large codebases and documentation | $0.01-0.04 |
| **refactor** | `deepseek/deepseek-v3` | Strong at mechanical code transforms; extremely cost-effective | $0.005-0.02 |
| **docs** | `anthropic/claude-haiku` | Documentation writing is well-handled by fast models | $0.002-0.01 |
| **lint-fix** | `morphllm/morph-v2` | Repetitive fixes (import ordering, formatting) at near-zero cost | $0.001-0.005 |

### 5.2 Dynamic Escalation

When a cheap model fails (error, timeout, or low-quality output detected by the orchestrator), the routing escalates:

```
Tier 2 (fast/cheap) --[failure]--> Tier 1 (workhorse) --[failure]--> Tier 0 (frontier)
```

The escalation is logged in the decision log with cost delta tracking:

```json
{"timestamp":1709655000000,"tool":"model-escalate","target":"coder-TASK003","role":"orchestrator","result":"escalated","meta":{"from":"deepseek/deepseek-v3","to":"anthropic/claude-sonnet-4","reason":"lint errors after 2 attempts","costDelta":0.04}}
```

### 5.3 Cost Tracking

Every agent spawn records token usage. The orchestrator maintains running totals in `metrics` and can enforce budget caps:

```typescript
// In orchestrator-agents.ts, within onComplete callback
const usage = result.tokenUsage;
const cost = calculateCost(agent.model, usage.input, usage.output);
state.metrics.totalCost += cost;

if (state.metrics.totalCost > BUDGET_CAP) {
  ctx.log.error(`BUDGET CAP REACHED: $${state.metrics.totalCost.toFixed(2)} > $${BUDGET_CAP}`);
  // Switch all future agents to cheapest viable model
  ctx.extensions.agents.setDefaultModel("morphllm/morph-v2");
}
```

---

## 6. Migration Path from L-Thread

### Phase 1: Core Discipline + State (Weeks 1-2)

**Goal:** Pi Agent running with orchestrator discipline rules and state persistence. No multi-agent yet.

**Tasks:**
1. Install Pi Agent globally (`npm i -g @anthropic/pi-agent`)
2. Create `extensions/orchestrator-discipline.ts` -- port the 4 Absolute Rules
3. Create `extensions/orchestrator-state.ts` -- port JSON state management from `_bmad/orchestrator-state.json`
4. Create `.pi/config.yaml` with extension loading order
5. Verify: Run Pi with discipline extension, attempt to write a code file as orchestrator, confirm it is blocked
6. Migrate `_bmad/orchestrator-state.json` schema to v2.0.0 (add `mode: "pi-orchestrator"`)

**Deliverable:** Single-agent Pi orchestrator that refuses to write code and persists state.

**Risk:** Pi's extension API may change (it is pre-1.0). Pin to exact version.

### Phase 2: Agent Spawning + Communication (Weeks 3-4)

**Goal:** Multi-agent orchestration via Pi sub-agents with file-based messaging.

**Tasks:**
1. Create `extensions/orchestrator-agents.ts` -- implement spawn, kill, list, health
2. Create `extensions/orchestrator-comms.ts` -- implement inbox messaging
3. Create `_bmad/agent-inboxes/` directory structure
4. Test: Orchestrator spawns a coder agent, sends a task, receives a result
5. Test: Agent heartbeat monitoring, timeout detection, kill
6. Implement handoff payloads for agent-to-agent task chains

**Deliverable:** Orchestrator can spawn and coordinate multiple agents. Equivalent to L-Thread conduit mode.

**Risk:** Pi sub-agent API may not support all needed lifecycle hooks. Fallback: tmux spawn with filesystem polling.

### Phase 3: MCP Bridge + E2E Gate (Weeks 5-6)

**Goal:** Chrome DevTools testing gate operational. MCP access controlled per role.

**Tasks:**
1. Create `extensions/orchestrator-mcp-bridge.ts` -- role-based MCP allowlists
2. Create `extensions/orchestrator-e2e-gate.ts` -- testing enforcement
3. Port Chrome DevTools MCP configuration from current Claude Code setup
4. Test: E2E agent can navigate pages, take screenshots, assert elements
5. Test: Coder agent is blocked from MCP access
6. Test: State write with `"done"` status is blocked without passing E2E verdict

**Deliverable:** Full E2E testing gate. No task completes without verification. Equivalent to L-Thread INC-014/INC-015 compliance.

**Risk:** Chrome DevTools MCP may need adapter work for Pi. The pi-mcp-adapter community extension is the starting point.

### Phase 4: Dashboard + Optimization (Weeks 7-8)

**Goal:** Production polish. TUI dashboard, cost optimization, incident database integration.

**Tasks:**
1. Create `extensions/orchestrator-dashboard.ts` -- TUI status rendering
2. Integrate FutureLearnings incident database as read-only context for agents
3. Implement model escalation logic (cheap -> frontier fallback)
4. Add cost tracking and budget cap enforcement
5. Performance testing: 5 concurrent agents, measure latency and cost
6. Write migration complete report with cost comparison (L-Thread vs Pi)

**Deliverable:** Production-ready Pi Orchestrator with full feature parity to L-Thread plus model routing, cost optimization, and dashboard visibility.

### Parallel Track: Tmux Compatibility Layer

Throughout all phases, maintain tmux as a fallback. The `_bmad/orchestrator-tmux-state.json` file format is preserved. If Pi sub-agents are unstable, the orchestrator can fall back to `tmux new-session` + filesystem polling with zero protocol changes.

---

## 7. What NOT to Build

These are anti-patterns and over-engineering traps identified across the research. Avoid them.

### 7.1 Do NOT Build a Custom Message Broker

File-based messaging is sufficient. The temptation to add Redis, NATS, or a WebSocket layer for "real-time" inter-agent communication is strong but wrong. Agents operate on 10-30 second cycles. Filesystem polling at 2-second intervals adds negligible latency. The complexity of a message broker adds failure modes without meaningful performance gain.

### 7.2 Do NOT Build a Custom Model Router Service

Pi already routes to 300+ models. Do not build a separate service that sits between Pi and the model APIs. Use Pi's native `--model` flag and OpenRouter's routing. The orchestrator's job is to **select** the model at spawn time, not to **proxy** model calls.

### 7.3 Do NOT Fork Pi Agent

Every community fork (ClaudeForked, AmplifiedClaude, etc.) discovered in the research has fallen behind upstream within weeks. Extensions are the composability layer. If Pi lacks a feature, contribute upstream or work around it via extensions. Forking creates a maintenance burden that kills projects.

### 7.4 Do NOT Build Cross-Machine Orchestration Yet

The A2A (Agent-to-Agent) protocol from Google and the various distributed agent frameworks are interesting but premature. The current architecture runs on a single machine with shared filesystem. Adding network partitions, distributed state, and cross-machine coordination 10x-es the complexity for a capability not yet needed. Build local-first, add network later.

### 7.5 Do NOT Over-Invest in Agent Memory Systems

Long-term agent memory (vector stores, RAG pipelines for conversation history) is a trap at this stage. The JSONL decision log and tiered context system provide sufficient memory. The FutureLearnings incident database handles lessons learned. Adding a vector database for agent memory adds infrastructure without solving a real problem today.

### 7.6 Do NOT Build Agents That Monitor Agents That Monitor Agents

The "Ralph Loop" anti-pattern from Geoffrey Huntley's research: recursive monitoring creates exponential cost with diminishing returns. One orchestrator monitors all agents. Agents do not monitor each other. If the orchestrator itself fails, tmux session persistence handles recovery -- not another monitoring agent.

### 7.7 Do NOT Implement Consensus Protocols Between Agents

Some multi-agent frameworks implement voting or consensus for decisions. This is unnecessary when you have a single orchestrator with clear authority. The orchestrator decides. Agents execute. Reviewers advise. There is no democracy in the agent pool.

### 7.8 Do NOT Build a Custom IDE Integration

Pi Agent already integrates with terminals. The dashboard extension renders to stdout. Do not build a VS Code extension, Electron app, or web UI for the orchestrator. The terminal is the interface. If visual monitoring is needed, the `dashboard-render` tool output can be piped to a tmux pane.

---

## Appendix A: Pi Agent Extension Loading Configuration

```yaml
# .pi/config.yaml
extensions:
  - path: ./extensions/orchestrator-discipline.ts
    priority: 0    # Loads first, intercepts everything
    enabled: true

  - path: ./extensions/orchestrator-state.ts
    priority: 1
    enabled: true

  - path: ./extensions/orchestrator-agents.ts
    priority: 2
    enabled: true

  - path: ./extensions/orchestrator-comms.ts
    priority: 3
    enabled: true

  - path: ./extensions/orchestrator-mcp-bridge.ts
    priority: 4
    enabled: true

  - path: ./extensions/orchestrator-e2e-gate.ts
    priority: 5
    enabled: true

  - path: ./extensions/orchestrator-dashboard.ts
    priority: 10   # Low priority, purely observational
    enabled: true

model:
  default: "anthropic/claude-opus-4"
  fallback: "anthropic/claude-sonnet-4"

agent:
  maxConcurrent: 5
  defaultTimeout: 300000    # 5 minutes
  heartbeatInterval: 15000  # 15 seconds

state:
  dir: "_bmad"
  snapshotFile: "orchestrator-state.json"
  decisionLog: "decisions.jsonl"
```

## Appendix B: Quick Command Reference

| Action | L-Thread (Current) | Pi Orchestrator (Target) |
|--------|-------------------|-------------------------|
| Start orchestrator | `claude --dangerously-skip-permissions` + load agent | `pi --config .pi/config.yaml` |
| Spawn agent | `conduit pane-split` / `Task` tool | `agent-spawn` tool (extension) |
| Send message | `terminal-write` / `SendMessage` | `msg-send` tool (extension) |
| Check agent | `terminal-read` / `TaskList` | `agent-health` + `msg-read` |
| Kill agent | `conduit pane-close` / `shutdown_request` | `agent-kill` tool (extension) |
| E2E test | Chrome DevTools MCP directly | `e2e-verify` tool (gated) |
| View status | Manual state file read | `dashboard-render` tool |
| Switch model | Not possible (Claude only) | `agent-spawn` with `model` param |
| Cost tracking | None | `state.metrics` in snapshot |
| Decision audit | None | `decisions.jsonl` |

---

*This document is the concrete migration blueprint. Each extension has defined interfaces, each schema has defined fields, and the migration has defined phases. Implementation begins with Phase 1: `orchestrator-discipline.ts` and `orchestrator-state.ts`.*
