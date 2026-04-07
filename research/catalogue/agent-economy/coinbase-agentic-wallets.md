# Coinbase Agentic Wallets

> **Every AI Agent deserves a wallet — wallet infrastructure for autonomous agent transactions with programmable guardrails, x402 support, and MCP integration**

| Field | Value |
|-------|-------|
| Category | 💰 Agent Economy |
| Repository | [github.com/coinbase/agentkit](https://github.com/coinbase/agentkit) (full SDK) / [github.com/coinbase/agentic-wallet-skills](https://github.com/coinbase/agentic-wallet-skills) (wallet CLI skills) |
| GitHub Stars | AgentKit: 1,136 / agentic-wallet-skills: 76 (as of 2026-03-08) |
| Publisher | Coinbase — bigtech (public company, $COIN) |
| License | Apache-2.0 (AgentKit), MIT (agentic-wallet-skills) |
| Tech Stack | TypeScript (50+ actions), Python (30+ actions), Solidity. Integrates with: LangChain, Vercel AI SDK, MCP, OpenAI Agents SDK, AutoGen, Pydantic AI, Strands Agents |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Agent payments are Phase 4+ for us. We don't need agents spending crypto today. But if the vision includes autonomous agents paying for API calls (x402) or receiving payments for services, Coinbase is the most production-ready option. |
| **Novelty** | 5/10 | Agent wallets are a known concept. The interesting parts are the `awal` CLI tool, the MCP integration, and the x402 protocol support. The Action Provider pattern is a clean abstraction. |
| **Actionable** | 3/10 | Not actionable today. Our agents don't transact financially. The MCP server integration is interesting as a reference for how to expose financial tools to agents, but we wouldn't use it until Phase 4+. |

---

## Overview

Coinbase launched Agentic Wallets on February 11, 2026, as the first wallet infrastructure designed specifically for AI agents. The product has two components: **AgentKit** (full SDK for building crypto-capable agents with 50+ TypeScript and 30+ Python action providers) and **Agentic Wallet** (a narrower, standalone wallet solution using the `awal` CLI for direct agent wallet operations).

AgentKit is framework-agnostic and wallet-agnostic by design. It integrates with every major AI agent framework (LangChain, OpenAI Agents SDK, AutoGen, Vercel AI SDK, MCP, Pydantic AI, Strands Agents) and supports multiple wallet providers (Coinbase Smart Wallet, Privy, Viem). The Agentic Wallet product is more focused — Base-only, using email OTP authentication, with configurable spending limits per session and per transaction.

The x402 protocol support is noteworthy: it enables machine-to-machine API payments without human intervention, meaning agents can pay for services they consume and charge for services they provide. This is the "agent economy" primitive — agents with wallets can participate in commercial transactions autonomously.

---

## Technical Architecture

```
Coinbase Agent Infrastructure
├── AgentKit (Full SDK)
│   ├── Action Providers (modular blockchain capabilities)
│   │   ├── Transfers, Swaps, Queries
│   │   ├── 50+ TypeScript / 30+ Python actions
│   │   └── Generators for creating new actions
│   ├── Wallet Providers (abstraction layer)
│   │   ├── Coinbase Smart Wallet
│   │   ├── Privy
│   │   └── Viem (any EVM wallet)
│   ├── Framework Extensions
│   │   ├── LangChain, Vercel AI SDK, MCP
│   │   ├── OpenAI Agents SDK, AutoGen
│   │   └── Pydantic AI, Strands Agents
│   └── Networks: Base, Ethereum, Solana + all EVM/SVM
│
├── Agentic Wallet (Standalone)
│   ├── awal CLI (wallet operations tool)
│   ├── Agent Skills (npm installable)
│   │   └── npx skills add coinbase/agentic-wallet-skills
│   ├── x402 Protocol (machine-to-machine payments)
│   ├── Security: key isolation in Coinbase infrastructure
│   ├── Guardrails: per-session + per-transaction spending limits
│   ├── KYT screening + OFAC sanctions checking
│   └── Network: Base only
│
└── Integrated Protocols
    ├── Alchemy, Compound, DefiLlama, Farcaster
    ├── Jupiter, Moonwell, Morpho, Pyth
    ├── OpenSea, Superfluid, Zora, Allora
    └── 14+ DeFi/NFT protocol integrations
```

Key design decisions:
- **Action Provider pattern**: Each blockchain capability is a modular, self-contained action provider. This is similar to our tool abstraction — agents receive capabilities as tools and invoke them via natural language.
- **Wallet Provider abstraction**: Decouples wallet management from action execution. Smart pattern for supporting multiple key management solutions.
- **x402 integration**: HTTP 402 Payment Required responses trigger agent wallet payments automatically. No human approval needed within configured limits.

---

## Publisher Background

Coinbase is a publicly traded company ($COIN, ~$50B market cap) and the largest US-based crypto exchange. Their Developer Platform (CDP) division has been aggressively building agent infrastructure since late 2024. AgentKit launched initially as a simpler concept and has grown to 1,100+ stars with 657 forks. The `agentic-wallet-skills` repo is newer (Feb 2026) with 76 stars, indicating early but active adoption.

Coinbase's institutional credibility is significant: they're regulated, publicly audited, and have custody of hundreds of billions in crypto assets. If any company can make "agents with wallets" production-safe, it's them. Erik Reppel from Coinbase is also a co-author of ERC-8004, showing Coinbase's involvement across the agent economy stack.

---

## What's Valuable for Us

1. **Action Provider pattern**: The modular action provider architecture is a clean abstraction we could study for how to structure our own tool integrations. Each action is self-contained with clear inputs/outputs.

2. **x402 protocol reference**: If we ever need agents to pay for API access (e.g., premium data sources, third-party agent services), x402 via Coinbase is the most production-ready path. The `moonpay-x402` skill shows this is becoming a standard.

3. **MCP server integration**: Coinbase exposes wallet capabilities via MCP, meaning Claude agents can natively interact with wallets. This is directly compatible with our MCP-first architecture.

4. **Spending guardrails pattern**: The per-session and per-transaction spending limits with KYT screening is a good pattern for any autonomous system — not just financial. We could adapt this for rate-limiting agent actions (API calls, file operations, etc.).

5. **`awal` CLI tool**: Terminal-first wallet management aligns with our terminal-first orchestration philosophy. If we ever integrate financial capabilities, this is the most natural fit.

---

## What's NOT Relevant

- **DeFi protocol integrations**: We don't need Compound, Morpho, or OpenSea integrations. Our agents do software development, not DeFi trading.
- **NFT/token operations**: Minting, trading, and managing digital collectibles is outside our scope entirely.
- **Solana/multi-chain complexity**: If we ever use agent wallets, Base-only (Agentic Wallet) would be sufficient. We don't need cross-chain swaps or SVM support.
- **LangChain/AutoGen framework extensions**: We use Claude Code directly, not framework SDKs. The MCP integration is the only relevant bridge.
- **Smart Wallet authentication**: Email OTP and social login are consumer features. Our agents authenticate via API keys and session tokens.

---

## Future Use Cases

- **Phase 4 (Days 90+)**: If we build agent-as-a-service offerings, agents could receive payments via Agentic Wallet for completed work. x402 integration would enable per-API-call billing.
- **Phase 4+ (Autonomous operations)**: As agents become more autonomous, they may need to pay for compute resources, data access, or third-party services. The spending guardrails make this safe — hard limits per session prevent runaway costs.
- **Agent marketplace**: If the federated multi-business system ever includes an internal marketplace where business-line agents can purchase capabilities from other business-line agents, Coinbase's infrastructure is the production-ready choice.

---

## Key Takeaway

> **Coinbase Agentic Wallets is the most production-ready agent payment infrastructure available — backed by a regulated public company, with clean MCP integration and x402 support — but agent payments are Phase 4+ for us; file this under "when we need it, it'll be ready."**
