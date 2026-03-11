# Hermes Function Calling

> **Reference implementation for the Hermes tool-use protocol — the function calling format used across NousResearch's Hermes model family, enabling structured tool invocation via XML-tagged JSON within ChatML.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [NousResearch/hermes-function-calling](https://github.com/NousResearch/hermes-function-calling) |
| GitHub Stars | 1,207 (as of 2026-03-09) |
| Publisher | Nous Research (research org / open-source AI lab) |
| License | MIT |
| Tech Stack | Python, Jinja2, PyTorch, HuggingFace Transformers, Pydantic |
| Maturity | 🟢 Production (shipped as the native tool-use protocol for Hermes-2-Pro and Hermes-3 model families) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *Referenced by the Manus AI context engineering article as THE example format for implementing constrained action spaces via response prefilling. Manus uses Hermes format to demonstrate three modes: Auto (model may call), Required (model must call), Specified (model must call a specific tool subset) — all via KV-cache-friendly token-level prefilling. The key insight is not the format itself but the **prefillability** — the `<tool_call>` XML boundary creates a clean point where you can force the model into tool-calling mode by prefilling up to that token, without modifying tool definitions or system prompts at runtime.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | We use Claude Code / Claude API which has its own native tool-use protocol. Hermes format is for open-weight models (Llama-based). Not directly applicable to our stack. |
| **Novelty** | 6/10 | The protocol design itself (XML tags + JSON payload) is well-known. The Manus prefilling insight is genuinely novel — using format structure to constrain agent behavior without prompt changes. |
| **Actionable** | 3/10 | No immediate adoption path. The prefilling technique is interesting but requires model-level control we don't have with Claude API. Patterns are more relevant if/when we add open-weight models. |

---

## Overview

Hermes Function Calling is the reference implementation for the tool-use protocol baked into NousResearch's Hermes model family (Hermes-2-Pro, Hermes-3). It defines how open-weight LLMs should receive tool definitions, produce tool calls, and process tool responses — all within the ChatML conversation format (`<|im_start|>role`).

The protocol uses a layered structure: tool definitions are injected into the system prompt wrapped in `<tools></tools>` XML tags as JSON arrays following OpenAI's function schema format. When the model decides to invoke a tool, it emits a `<tool_call></tool_call>` XML block containing a JSON object with `name` and `arguments` fields validated against a Pydantic schema (`FunctionCall`). Tool responses come back in the `tool` role wrapped in `<tool_response></tool_response>` XML tags.

What makes this repo notable beyond its protocol spec is the **recursive agentic loop** in `functioncall.py` — it implements a self-correcting cycle where the model calls tools, receives results, analyzes them, and calls more tools until the task is complete or a max depth is reached. Error handling feeds validation failures back to the model as tool responses, letting it self-correct malformed calls. The Hermes-3 variant adds a `<scratch_pad>` with Goal-Oriented Action Planning (GOAP): Goal, Actions, Observation, Reflection — a structured reasoning framework before each tool call.

---

## Technical Architecture

### Protocol Format

```
System Prompt Structure:
├── Role (agent identity + self-recursion declaration)
├── Objective (agentic reasoning framework guidance)
├── Tools (<tools>[...JSON function signatures...]</tools>)
├── Examples (optional few-shot from prompt_assets/few_shot.json)
├── Schema (Pydantic FunctionCall model as JSON schema)
└── Instructions (calling conventions, XML tag format, iteration rules)
```

### Core Data Models (schema.py)

```python
class FunctionCall(BaseModel):
    arguments: dict    # Validated but flexible — model may hallucinate params
    name: str          # Must match a registered function name

class FunctionDefinition(BaseModel):
    name: str
    description: Optional[str]
    parameters: Optional[Dict[str, object]]  # JSON Schema format

class FunctionSignature(BaseModel):
    function: FunctionDefinition
    type: Literal["function"]  # OpenAI-compatible wrapper
```

### Inference Loop (functioncall.py)

```
User Query → Prompt Assembly → Model Inference → Parse <tool_call> XML
    ↓                                                    ↓
    ↓                                          Validate against schema
    ↓                                                    ↓
    ↓                                    ┌───── Valid? ──────┐
    ↓                                    ↓                   ↓
    ↓                              Execute function    Feed error back
    ↓                                    ↓              as <tool_response>
    ↓                              Inject <tool_response>    ↓
    ↓                              into conversation    Re-infer
    ↓                                    ↓                   │
    ↓                              depth < max_depth? ───────┘
    ↓                                    ↓ no
    └──────────── Final natural language response
```

### Chat Templates

- `chatml.j2` — Standard ChatML (`<|im_start|>role\ncontent<|im_end|>`)
- `vicuna.j2` — Vicuna format adapter
- `zephyr.j2` — Zephyr format adapter

### Prompt Management (prompter.py)

System prompts are YAML-structured (`prompt_assets/sys_prompt.yml`) with 6 sections (Role, Objective, Tools, Examples, Schema, Instructions) that get formatted with runtime variables (tools, date, schema, examples). This separation of prompt structure from content is a clean design choice.

### Validation Pipeline (validator.py)

Multi-layer validation: Pydantic model validation -> argument type checking -> enum value validation -> required argument checking -> JSON schema validation (with fallbacks through `json.loads` -> `ast.literal_eval` -> markdown JSON extraction).

---

## Publisher Background

**Nous Research** is one of the most prominent open-source AI research organizations, known for:

- **Hermes model family**: Among the most capable open-weight instruction-tuned models, consistently ranking high on benchmarks
- **Teknium** (co-founder): Prolific in the open-source LLM fine-tuning community, 91 contributions to this repo
- **InterstellarNinja**: Primary contributor (91 commits), designed the function calling training data and inference pipeline
- **Organization**: 61 public repos, 1,322 GitHub followers, nousresearch.com
- **Track record**: Hermes-2-Pro was one of the first open-weight models with reliable native function calling, later refined in Hermes-3
- **Credibility**: High — their models are widely adopted via Ollama, llama.cpp, vLLM, and HuggingFace

---

## What's Valuable for Us

### 1. Manus Prefilling Technique (Pattern to Study)

The most valuable insight comes not from this repo directly but from how Manus uses the Hermes format. By prefilling the assistant response to different depths, you get three constraint modes without changing tools:

- **Auto**: Prefill `<|im_start|>assistant` — model chooses freely
- **Required**: Prefill `<|im_start|>assistant\n<tool_call>` — forces a tool call
- **Specified**: Prefill `<|im_start|>assistant\n<tool_call>\n{"name": "browser_` — forces a specific tool subset

This is a powerful pattern for constraining agent behavior at the token level. If we ever work with open-weight models (e.g., via Ollama or vLLM), this is the technique to use.

### 2. YAML-Based Prompt Templating (prompter.py)

The separation of system prompt into YAML sections (Role, Objective, Tools, Examples, Schema, Instructions) that get composed at runtime is a clean pattern. Our `.claude/agents/` prompts are monolithic Markdown files. The YAML structure enables programmatic manipulation — e.g., swapping instruction sections without touching role definitions.

### 3. Self-Correcting Recursive Loop

The error-as-tool-response pattern in `functioncall.py` is elegant: when a tool call fails validation, the error traceback is sent back as a `<tool_response>` asking the model to retry. This is directly applicable to any agent loop — treat tool failures as context, not exceptions.

### 4. GOAP Scratch Pad (Hermes-3)

The `<scratch_pad>` framework (Goal -> Actions -> Observation -> Reflection) before tool calls is a structured chain-of-thought approach. Similar to ReAct but more formalized. Could inform how we structure reasoning prompts for complex multi-step tasks.

---

## What's NOT Relevant

- **The protocol format itself** — We use Claude's native tool use which has its own format. Adopting ChatML/Hermes format would be pointless friction. (Governing Principle #7: build what you need)
- **HuggingFace/PyTorch inference stack** — We run on Claude API/Claude Max, not self-hosted models. The inference code is irrelevant to our infrastructure.
- **The financial demo functions** — The yfinance examples are just demo scaffolding, not the point of the repo.
- **Chat template Jinja2 files** — Only relevant if hosting Hermes models locally, which we are not.
- **Few-shot examples** — Our prompt engineering is Claude-specific; Hermes few-shot patterns don't transfer.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: No direct use. Claude API handles tool use natively.
- **Phase 3 (Days 60-90)**: If we explore open-weight models for cost optimization on high-volume, low-complexity tasks (e.g., lead gen classification), the Hermes function calling format + prefilling technique becomes the go-to reference.
- **Phase 4 (Days 90+)**: Multi-model routing (Claude for complex tasks, Hermes/Llama for commodity tasks) would make this protocol a first-class concern. The prefilling constraint technique from Manus would be essential for controlling open-weight agent behavior without per-call prompt engineering.

---

## Key Takeaway

> **The Hermes function calling protocol is less interesting as a format spec and more interesting as the substrate that enables the Manus prefilling technique — using XML tag boundaries as clean intervention points for token-level agent behavior control, a pattern that becomes critical if we ever add open-weight models to our multi-model routing stack.**
