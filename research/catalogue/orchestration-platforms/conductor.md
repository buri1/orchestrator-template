# Conductor

> **Conductor is an event driven agentic orchestration platform providing durable and highly resilient execution engine for applications and AI Agents**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [conductor-oss/conductor](https://github.com/conductor-oss/conductor) |
| GitHub Stars | 31,496 (as of 2026-03-08) |
| Publisher | Orkes / Netflix OSS Foundation (bigtech origin, startup-maintained) |
| License | Apache-2.0 |
| Tech Stack | Java (Spring Boot), React UI, Redis/Postgres/MySQL backends, gRPC, SDKs in Java/Python/JS/Go/C#/Rust |
| Maturity | 🟢 Production (Netflix-born, 31K+ stars, actively maintained, commercial backing via Orkes) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Conductor solves durable workflow orchestration at massive scale — a problem we'll face eventually but don't have today. The agentic workflow features are interesting but the Java/Spring Boot stack is alien to our TypeScript/shell world. |
| **Novelty** | 4/10 | Workflow engines are well-understood technology. Conductor's addition of dynamic/agentic workflows where LLMs can design and execute workflows at runtime is the novel piece, but the concept (LLM plans, deterministic engine executes) is exactly our 70/30 split. |
| **Actionable** | 3/10 | We can't adopt Conductor directly — wrong language, wrong scale, wrong complexity level. The workflow-as-JSON pattern and durable execution semantics are reference material for when we need to formalize our orchestrator state machine. |

---

## Overview

Conductor is a durable workflow orchestration engine originally built at Netflix for microservices coordination and later open-sourced. After Netflix contributed the codebase to the OSS foundation, it's now maintained by Orkes (a startup founded by the original Netflix Conductor team) along with a growing open-source community. With 31K+ GitHub stars and adoption at companies processing massive transaction volumes, it's one of the most battle-tested workflow engines available.

The system defines workflows as JSON specifications that describe interactions between services, agents, databases, and external systems. Key properties include durable execution (workflows complete even with infrastructure failures), automatic retries and fallback mechanisms, built-in observability UI, and flexible persistence (Redis, MySQL, Postgres). Conductor supports multiple SDKs (Java, Python, JavaScript, Go, C#, Rust) for implementing "workers" that execute individual tasks.

Recently, Conductor has added agentic workflow capabilities: LLMs can dynamically plan and design workflows that the Conductor server executes at runtime — no compile/deploy cycle needed. This positions Conductor as both a traditional workflow engine and an emerging agentic orchestration platform. The agentic RAG features allow building retrieval pipelines with LLM and Vector DB integrations.

---

## Technical Architecture

### Core Model: Workflow as JSON

```json
{
  "name": "process_payment",
  "version": 1,
  "tasks": [
    {"name": "validate_input", "type": "SIMPLE", "taskReferenceName": "validate"},
    {"name": "charge_card", "type": "SIMPLE", "taskReferenceName": "charge"},
    {"name": "send_confirmation", "type": "SIMPLE", "taskReferenceName": "confirm"}
  ],
  "failureWorkflow": "handle_payment_failure"
}
```

### Architecture Components

| Component | Function |
|-----------|----------|
| **Conductor Server** | Central orchestration engine (Java/Spring Boot). Manages workflow state, task queues, scheduling. |
| **Workers** | Distributed task executors. Implement business logic. Can be in any language via SDKs. |
| **Task Queues** | Durable message queues for task distribution. At-least-once delivery semantics. |
| **Workflow Definition** | JSON-based workflow specs with sub-workflows, branches, loops, parallel execution. |
| **Built-in UI** | React-based monitoring dashboard for workflow visibility, debugging, and management. |
| **Persistence Layer** | Pluggable: Redis + Elasticsearch (default), Postgres, MySQL, OpenSearch. |

### Execution Model

```
Workflow Definition (JSON)
  → Conductor Server parses and schedules tasks
     → Tasks pushed to queues
        → Workers poll queues and execute
           → Workers report results back
              → Server advances workflow state
                 → Next task scheduled (or branch/loop)
                    → Workflow completes or retries on failure
```

### Agentic Extensions

- **Dynamic Workflows:** LLMs can generate workflow JSON at runtime. No compile/deploy needed.
- **Agentic RAG:** Built-in patterns for retrieval pipelines with LLM + Vector DB.
- **Human-in-the-loop:** Tasks can pause for human approval before proceeding.

### Backend Configurations

| Backend | Use Case |
|---------|----------|
| Redis + Elasticsearch 7 | Default, high-performance |
| Redis + OpenSearch | AWS-native alternative |
| Postgres | Simple single-database setup |
| Postgres + ES7 | Production with search |
| MySQL + ES7 | MySQL shops |

---

## Publisher Background

**Conductor OSS** is the continuation of the Netflix Conductor project. Originally built at Netflix to orchestrate microservices processing billions of workflows, it was contributed to the OSS foundation when Netflix decided not to maintain the open-source version internally. **Orkes**, founded by the original Netflix Conductor creators, now provides commercial support and actively maintains the open-source project.

Orkes offers a managed Conductor service with enterprise features (RBAC, audit logging, SLAs, dedicated infrastructure). The company has raised venture funding and employs the core team that built Conductor at Netflix. The open-source project has 823 forks and an active Slack community. SDKs are maintained across 6 languages. The project is actively developed — pushed to as recently as today (2026-03-08).

---

## What's Valuable for Us

### 1. Durable Execution Semantics as Reference

Conductor's core value proposition — workflows survive infrastructure failures — is something we'll need as we scale. Our current orchestrator state is file-based JSON. Conductor's approach of persisting every state transition to a database with at-least-once delivery guarantees is the production-grade version of what we're doing manually.

### 2. Workflow-as-JSON Pattern

Defining workflows as JSON rather than code is a powerful pattern. Our orchestrator state JSON already approximates this — task definitions, agent assignments, status tracking. If we ever formalize our orchestrator into a proper state machine, Conductor's workflow definition format is a well-validated reference.

### 3. LLM-Generated Dynamic Workflows

Conductor's agentic feature — LLMs plan workflows that the engine executes — is exactly our 70/30 split in a different form. The LLM decides what to do (30%), the engine executes deterministically (70%). Worth studying how they implement the boundary between LLM planning and deterministic execution.

### 4. Multi-SDK Worker Pattern

The concept of workers in any language polling a central task queue is clean distributed systems design. If we ever need to distribute agent work across machines, this queue-based pattern is proven at Netflix scale.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **Java/Spring Boot stack** | We run TypeScript/shell. Conductor's server is a heavy Java application requiring JDK 21+. Wrong ecosystem entirely. |
| **Enterprise scale** | Conductor is built for billions of workflow executions. We run dozens of agent tasks per day. Massive overengineering for our needs. |
| **Microservices orchestration focus** | Conductor's primary use case is service-to-service orchestration. We orchestrate LLM agents, not HTTP services. |
| **Infrastructure requirements** | Redis + Elasticsearch + Java runtime is heavy infrastructure. We run on a single machine with tmux. |
| **React UI** | Built-in monitoring dashboard. We monitor via tmux pane capture and state JSON files. |
| **Commercial Orkes offering** | Managed platform with enterprise features. We don't need managed infrastructure for our scale. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None. Far too heavy for current needs.
- **Phase 2 (Days 4-60):** Study Conductor's workflow JSON schema as a reference when formalizing our orchestrator state machine. Look at how they handle task retries, failure workflows, and timeout configurations.
- **Phase 3 (Days 60-90):** If building a multi-machine orchestrator, evaluate Conductor's JavaScript SDK for implementing workers. The queue-based worker pattern could replace tmux pane monitoring.
- **Phase 4 (Days 90+):** If scaling to enterprise clients who need durable execution guarantees, Conductor becomes a serious candidate for the execution layer underneath our orchestrator. Use our L-Thread as the planning layer, Conductor as the execution layer.

---

## Key Takeaway

> **Conductor is the gold standard for durable workflow orchestration (Netflix-born, 31K stars, production-proven at billion-scale), but it's a heavyweight Java enterprise engine solving a scale problem we don't have yet — file it as a reference for when we need to formalize our orchestrator state machine or distribute work across machines.**
