# Google Agent Development Kit (ADK)

> **An open-source, code-first framework for building, evaluating, and deploying sophisticated AI agents with flexibility and control.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [google/adk-python](https://github.com/google/adk-python) (+ adk-js, adk-go, adk-java) |
| GitHub Stars | 18,500 (as of 2026-03-22) |
| Publisher | Google (bigtech) |
| License | Apache 2.0 |
| Tech Stack | Python (primary), TypeScript, Go, Java; FastAPI; Gemini-optimized but model-agnostic |
| Maturity | 🟢 Production (v1.27.2, 257 contributors) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> Score 7/10 -- Google's protocol-native agent framework. The 3-tier agent taxonomy (LLM / Workflow / Custom) maps cleanly to our 70/30 deterministic/LLM split. SkillToolset's progressive loading (L1 metadata -> L2 instructions -> L3 resources) is the best lazy-context pattern catalogued so far. Multi-language SDKs (Python, TS, Go, Java) show serious commitment. BUT: Gemini-optimized, Python-primary, cloud-first deployment -- all misalign with our CC+tmux+local stack. Study the patterns (especially skills + multi-agent composition), don't adopt the framework. Compare against Claude Agent SDK (our primary) and Pi SDK (Day 60+).

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Protocol-native design validates A2A + MCP integration path; agent taxonomy aligns with our architecture |
| **Novelty** | 6/10 | SkillToolset progressive loading and 3-tier skill structure are novel; multi-agent patterns are well-known |
| **Actionable** | 7/10 | 5 skill design patterns (Tool Wrapper, Generator, Reviewer, Inversion, Pipeline) directly adoptable; AgentTool wrapping pattern useful |

---

## Overview

Google's Agent Development Kit (ADK) is an open-source, modular framework for building AI agents that emphasizes making "agent development feel more like software development." While optimized for Gemini and Google Cloud, it is explicitly model-agnostic and deployment-agnostic. ADK ships SDKs in four languages (Python, TypeScript, Go, Java) with the Python SDK as the most mature (18.5K stars, 257 contributors, v1.27.2).

ADK's core innovation is its **3-tier agent taxonomy**: LLM Agents for dynamic reasoning, Workflow Agents (Sequential, Parallel, Loop) for deterministic orchestration, and Custom Agents for specialized logic. This cleanly separates the non-deterministic (LLM-driven) from the deterministic (workflow-driven), validating the 70/30 split pattern we adopted from Stripe Minions. Agents compose hierarchically with parent-child relationships, shared session state, and both LLM-driven delegation and explicit tool-based invocation.

The framework is protocol-native, integrating **MCP** (Model Context Protocol) for tool access and **A2A** (Agent-to-Agent) for inter-agent federation. Agents can expose themselves as A2A servers or consume remote A2A agents, enabling cross-framework multi-agent systems. The skill system uses a 3-level progressive loading architecture (L1 metadata, L2 instructions, L3 resources) that minimizes context window waste -- only loading full skill content when triggered at runtime.

---

## Technical Architecture

### Agent Hierarchy

```
BaseAgent
├── LlmAgent (Agent)      -- LLM as reasoning engine, dynamic routing
│   └── tools: [FunctionTool, MCPTool, OpenAPITool, AgentTool]
├── SequentialAgent        -- Execute sub-agents in order
├── ParallelAgent          -- Execute sub-agents concurrently
├── LoopAgent              -- Repeat until max_iterations or escalate
└── CustomAgent            -- Extend BaseAgent with arbitrary logic
```

### Core Abstractions

- **Agent**: BaseAgent subclass with `sub_agents`, `tools`, `instruction`, `output_key`
- **Session**: Single ongoing user-agent interaction; chronological event sequence + ephemeral state
- **State**: Key-value store within a session (`context.state['key']`); shared across sub-agents
- **Memory**: Persistent searchable knowledge spanning multiple sessions (MemoryService)
- **Tools**: Function tools, MCP tools, OpenAPI tools, AgentTool (agent-as-tool), 60+ third-party integrations
- **Skills**: Self-contained capability units with L1/L2/L3 progressive loading via SkillToolset
- **Events & Callbacks**: Extensibility hooks for agent lifecycle

### Multi-Agent Communication

1. **Shared Session State**: Agents write to state keys; downstream agents read them. `output_key` auto-saves agent responses.
2. **LLM-Driven Delegation**: Agent generates `transfer_to_agent(agent_name)` call; framework intercepts and switches execution.
3. **AgentTool**: Wrap any agent as a tool invocable by another LLM agent; runs target agent and returns result as tool output.

### Multi-Agent Patterns

| Pattern | Description |
|---------|-------------|
| Coordinator/Dispatcher | Central LlmAgent routes to specialist sub-agents |
| Sequential Pipeline | Data flows through agents via shared state + output_key |
| Parallel Fan-Out/Gather | ParallelAgent runs independent tasks; aggregator reads state keys |
| Hierarchical Decomposition | Parent delegates to children via AgentTool or transfer |
| Generator-Critic | Generator produces output; reviewer critiques in sequence |
| Iterative Refinement | LoopAgent repeats until quality threshold or max iterations |

### Skill System (L1/L2/L3)

```
skill_directory/
├── SKILL.md          # L1 frontmatter (name, description) + L2 body (instructions)
├── references/       # L3: Extended guidance docs
├── assets/           # L3: Schemas, templates, config
└── scripts/          # L3: Executable code (NOT YET SUPPORTED)
```

**SkillToolset API:**
```python
from google.adk.tools import skill_toolset
weather_skill = skill_toolset.load_skill_from_dir("./skills/weather")
my_toolset = skill_toolset.SkillToolset(skills=[weather_skill])
agent = Agent(tools=[my_toolset])
```

**5 Skill Design Patterns** (from GoogleCloudTech):
1. **Tool Wrapper** -- Package library docs as reusable agent context
2. **Generator** -- Produce structured docs from templates
3. **Reviewer** -- Score against severity-organized checklists
4. **Inversion** -- Agent interviews user before acting
5. **Pipeline** -- Strict sequential workflow with checkpoints

### Protocol Integration

| Protocol | Status | Usage |
|----------|--------|-------|
| MCP | Native | `MCPTool` class; 60+ pre-built integrations; Google Cloud API Registry as MCP |
| A2A | Native | Expose agents as A2A servers; consume remote A2A agents; Python + Go quickstarts |
| UCP, AP2, A2UI, AG-UI | Not confirmed | Not referenced in official docs despite ecosystem claims |

### Deployment Options

| Target | Description |
|--------|-------------|
| Local | CLI + Web UI for development |
| Vertex AI Agent Engine | Fully managed, auto-scaling (Google Cloud) |
| Cloud Run | Managed containers with auto-scaling |
| GKE | Kubernetes for open models + full control |
| Docker/Podman | Self-hosted containerized deployment |
| API Server | RESTful endpoints for agent interaction |

---

## Publisher Background

Google DeepMind / Google Cloud. ADK is Google's strategic response to the agent framework wars, positioned alongside Gemini CLI (96K stars) and the A2A Protocol (22K stars). The framework consolidates Google's agent-related efforts under one SDK. With 4 language SDKs, 257 contributors, and v1.27.2 in Python alone, this has significant institutional backing. ADK 2.0 Alpha introduces graph-based workflows, signaling continued investment.

---

## What's Valuable for Us

1. **SkillToolset progressive loading (L1/L2/L3)**: Best lazy-context pattern catalogued. Our agents currently load full skill instructions upfront. Adopt L1-metadata-first loading where agents only spend tokens on skills they actually invoke. Maps directly to context-is-zero-sum principle.

2. **5 Skill Design Patterns**: Tool Wrapper, Generator, Reviewer, Inversion, Pipeline. These are framework-agnostic patterns we can implement in our `.claude/commands/` skills today. Particularly the Inversion pattern (agent asks before acting) for roadblock recovery.

3. **AgentTool wrapping**: Treat any agent as a callable tool. Cleaner abstraction than our current tmux send-keys + capture-pane polling. Study for Phase 3 when we formalize agent-as-service.

4. **3-tier agent taxonomy**: LLM Agents / Workflow Agents / Custom Agents maps to our orchestrator (workflow) + workers (LLM) + specialized tools (custom). Validates our separation.

5. **Session state with output_key**: Auto-saving agent output to named state keys for downstream consumption. We do this manually with state JSON files; the pattern is cleaner.

6. **A2A native integration**: Reference implementation for how to expose/consume agents over A2A. Valuable when we federate agents across projects (Phase 4).

---

## What's NOT Relevant

- **Gemini optimization**: We run Claude exclusively. ADK's model-agnostic claim is secondary to its Gemini-first design.
- **Python-primary SDK**: Our stack is TypeScript + shell. The Python SDK is most mature but wrong language.
- **Google Cloud deployment**: Vertex AI Agent Engine, Cloud Run, GKE are all Google Cloud. We deploy on Vercel + local tmux.
- **Visual Builder / YAML config**: No-code agent definition conflicts with our code-first, prompt-first approach.
- **Session/Memory services**: In-memory for dev, cloud for prod -- we use JSON-in-git, which is simpler and more portable.
- **script/ execution not supported**: The L3 scripts directory doesn't actually work yet, limiting skill automation.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the 5 skill design patterns as formalized templates for our `.claude/commands/` skill library. Implement L1-first progressive loading in orchestrator agent prompts.
- **Phase 3 (Days 60-90)**: Study AgentTool pattern for formalizing agent-as-service when migrating from tmux polling to structured agent invocation. Evaluate A2A for cross-project agent federation.
- **Phase 4 (Days 90+)**: If federating agents across business units (client work + SaaS + lead gen), A2A native support in ADK provides a reference implementation for how our agents expose capabilities to external systems.

---

## Key Takeaway

> **ADK's 3-tier skill system (L1 metadata / L2 instructions / L3 resources) with progressive SkillToolset loading is the best lazy-context pattern in the catalogue -- adopt the pattern (not the framework) to minimize token waste in our agent prompts.**
