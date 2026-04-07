# Agentic Finance Patterns

> **How AI agents hold wallets, execute trades, run businesses, and pay each other -- x402 payments, agentic wallets, autonomous trading, and orchestration patterns transferable to coding systems.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_agentic-finance-orchestration.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The agentic finance movement reached an inflection point in early 2026. AI agents now hold non-custodial wallets (Privy, Coinbase, MoonPay) secured by TEEs, execute trades via DEX aggregators, and pay each other through the x402 HTTP payment protocol -- a Coinbase/Cloudflare/Google standard that embeds stablecoin micropayments into HTTP using the long-dormant 402 status code. Fifteen million x402 transactions have been processed, with projections of $30 trillion in autonomous agent transactions by 2030.

Concrete implementations demonstrate feasibility at multiple scales. Bankrbot (30K+ wallets, 100K+ transactions) created a self-funding agent loop where trading fees fund compute costs. VoxYZ runs 6 AI agents as a complete company on an $8/month VPS using OpenClaw, producing $75K consulting packages in 3 hours. Multi-agent trading systems (TradingAgents, Senpi, Polytrader) use coordinator-specialist hierarchies with roles mirroring human trading desks: fundamental analyst, technical analyst, sentiment analyst, risk manager, and execution trader.

The orchestration patterns emerging from financial agents transfer directly to coding orchestrators: policy-based guardrails map to permission scoping, supervisor agents map to code review agents, Temporal-style crash recovery maps to tmux session persistence, and shared-state databases map to orchestrator state JSON files. The single most transferable insight is from Fintool (YC-backed, 90% accuracy on finance benchmarks, 35% above raw Claude): the model is not the product -- the orchestration around the model is the product.

---

## Key Findings

### x402: The HTTP Payment Standard for Agents

x402 uses the HTTP 402 "Payment Required" status code to embed stablecoin payments directly into HTTP requests. An agent sends a request, receives a 402 with payment details (amount, token, recipient, network), constructs a signed USDC payment, and retries with an X-PAYMENT header. Transaction fees are below $0.0001, enabling true micropayments. Coinbase provides a free-tier facilitator (1,000 tx/month). The key shift: x402 replaces API keys with money -- any agent can access any x402-enabled service without pre-registration.

### Agentic Wallet Infrastructure

Three infrastructure layers solve how agents "have" money:
- **Agentic wallets** (Privy/Coinbase): Server-side, TEE-secured, non-custodial wallets with policy engines enforcing transfer limits, contract allowlists, recipient restrictions, and chain restrictions
- **MPC wallets**: Private key split across parties, collective signing without key reconstruction ($70.8M market in 2025, projected $137M by 2031)
- **Session keys** (EIP-7702): Temporary, restricted permissions that expire after a specific trade -- minimizing exposure windows

### Self-Funding Agent Loop (Bankrbot)

Bankrbot's key innovation: user interaction generates trading fees, fees accumulate in the agent's wallet, revenue funds compute costs, and the agent sustains itself. The $DRB case study hit 96K unique traders in two weeks. Architecture: single agent (Grok-powered) dispatching to infrastructure APIs (0x for swaps, Privy for wallets, Clanker for token deployment).

### Multi-Agent Trading Architectures

Trading systems converge on a **manager-analyst pattern**: a coordinator receives market signals, dispatches to specialist agents (fundamental, technical, sentiment, risk, execution), synthesizes outputs into trading decisions. The TradingAgents framework (open-source, multi-model) implements this with GPT-5.x, Gemini 3.x, Claude 4.x, and Grok 4.x support. The Nemotron-Nano system adds supervisor agents that audit trade commands with mandatory hedging rules and safety-halt protocols.

### Single-Agent-with-Tools vs. Multi-Agent

Bankrbot, Senpi, and Polytrader all use a **single-agent-with-rich-tooling** pattern rather than multi-agent coordination. Senpi achieves $100M+ trading volume with one agent per user backed by 31 tools across 8 categories. Prediction market agents are predominantly single-agent because each bet is a standalone probability assessment -- multi-agent coordination adds latency without proportional benefit.

### Safety Patterns

Financial agents have converged on: kill switches with human override, policy-based guardrails (transfer limits, time-windowed spending, contract allowlists), safety-halt protocols (halt on missing data, never speculate), supervisor agents that audit before execution, immutable audit trails, stress testing, and Temporal-style crash recovery for long-running agents.

### Fintool: Architecture Over Model

Fintool achieves 90% accuracy on finance benchmarks (35% above raw Claude, 43% above o3) through architecture, not better models. Key lessons: sandboxed execution is non-optional, Temporal workflows for crash recovery, S3-first storage, adversarial document parsing, Markdown skills + filesystem tools, and domain-specific evaluation over generic benchmarks.

---

## Actionable Insights

1. **Policy engines are the new permissions.** Financial agents enforce granular policies (transfer limits, contract allowlists, time windows). Coding orchestrators should implement analogous file access policies, tool usage limits, and time-boxed permissions per agent.

2. **Event-driven beats polling.** Trading agents use event streams and webhooks, never sleep-loops. Coding orchestrators should use `terminal-wait` and event-driven patterns exclusively.

3. **Crash recovery is existential.** Fintool uses Temporal; L-Thread uses tmux persistence. Both solve the same problem: long-running agents must survive infrastructure failures. This is non-negotiable for production.

4. **Single-agent-with-tools often beats multi-agent.** Bankrbot and Senpi prove that one well-tooled agent frequently outperforms a multi-agent team. Use multi-agent only when tasks genuinely require parallel, independent work.

5. **The model is not the product.** Fintool's 35% accuracy advantage over raw Claude comes entirely from architecture -- tool design, state management, and workflow orchestration. This is the core thesis for investing in orchestration infrastructure.

6. **Observability enables trust.** VoxYZ's pixel-art office is fundamentally an observability dashboard. Users trust agents they can watch. Orchestrators that expose reasoning, tool calls, and state transitions build the same trust.

7. **Self-funding as endgame.** Bankrbot demonstrates agents that pay for their own existence through value generation. For coding orchestrators, the parallel is agents that measurably accelerate development velocity enough to justify their token costs.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [orchestration-platforms/openclaw](../orchestration-platforms/openclaw.md) | VoxYZ runs on OpenClaw; Senpi uses OpenClaw for agent framework |
| [orchestration-platforms/paperclip](../orchestration-platforms/paperclip.md) | Paperclip's budget enforcement and task checkout mirror financial policy engines |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town's coordinator-specialist hierarchy parallels the manager-analyst trading pattern |
| [reference/scaling-economics](scaling-economics.md) | DeepMind coordination overhead (1.724 exponent) explains why single-agent-with-tools dominates in trading |
| [reference/harness-comparison-matrix](harness-comparison-matrix.md) | Fintool's Temporal-based crash recovery validates harness durability requirements |

---

*Source: research/2026-03-05_agentic-finance-orchestration.md*
