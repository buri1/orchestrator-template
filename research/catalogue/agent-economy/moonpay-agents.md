# MoonPay Agents

> **The onramp for the agent economy — non-custodial infrastructure enabling AI agents to autonomously manage wallets, trade crypto, and handle fiat on/off-ramps across 10 chains**

| Field | Value |
|-------|-------|
| Category | 💰 Agent Economy |
| Repository | No public GitHub repo (closed-source CLI: `@moonpay/cli` on npm) |
| GitHub Stars | N/A — closed source (as of 2026-03-08) |
| Publisher | MoonPay — startup (Series A, $3.4B valuation at peak, 500+ enterprise clients) |
| License | Proprietary |
| Tech Stack | Node.js CLI (`mp` command), MCP server (`mp mcp`), Web chat interface. Supports Solana, Ethereum, Base, Polygon, Arbitrum, Optimism, BNB, Avalanche, TRON, Bitcoin |
| Maturity | 🟡 Early (launched 2026-02-24) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Agent payments are Phase 4+ and we'd likely choose Coinbase over MoonPay for regulatory credibility. MoonPay's strength is fiat on/off-ramps, which is niche even within the agent economy space. |
| **Novelty** | 5/10 | The full financial lifecycle (fiat→crypto→trade→offramp→fiat) in a single CLI is more complete than Coinbase's offering. The 17 skills / 54 tools approach via MCP is a solid architecture. |
| **Actionable** | 2/10 | Nothing actionable today. Closed-source, proprietary, and requires KYC. If we needed fiat on/off-ramps for agents specifically, this is the only option — but we don't. |

---

## Overview

MoonPay Agents, launched February 24, 2026, is a non-custodial software layer that gives AI agents the ability to hold crypto wallets, trade tokens, and — crucially — bridge between fiat and crypto autonomously. Built on MoonPay's existing payment infrastructure (serving 500+ enterprises and 30M+ customers across 180 countries), it extends their fiat-to-crypto on-ramp expertise into the agent economy.

The product is delivered as a CLI tool (`npm install -g @moonpay/cli`) that exposes 17 skills with 54 tools across wallet management, trading, fiat on/off-ramps, virtual accounts, and x402 machine-to-machine payments. It also runs as an MCP server (`mp mcp`), making it compatible with Claude, ChatGPT, Gemini, and Grok. Wallets are non-custodial with OS keychain encryption — private keys never leave the user's machine.

What differentiates MoonPay from Coinbase's Agentic Wallets is the fiat lifecycle: MoonPay can create virtual bank accounts (US, EU, GBP), accept Apple Pay/Venmo/PayPal deposits, convert to crypto, let agents trade, and then off-ramp back to fiat. It's the complete financial lifecycle in a single tool, whereas Coinbase focuses on the crypto-native side.

---

## Technical Architecture

```
MoonPay Agents
├── CLI Interface (mp command)
│   ├── npm install -g @moonpay/cli
│   ├── mp mcp (MCP server mode)
│   └── Web chat interface (alternative)
│
├── 17 Skills / 54 Tools
│   ├── moonpay-auth — wallet creation, import/export, HD wallet support
│   ├── moonpay-swap-tokens — swaps, bridges, transfers, signing
│   ├── moonpay-virtual-account — KYC, fiat onramps, banking
│   ├── moonpay-deposit — multi-chain deposits, auto stablecoin conversion
│   ├── moonpay-trading-automation — automated swaps with market data
│   ├── moonpay-x402 — machine-to-machine payments
│   └── 11 additional skills (portfolio tracking, risk analysis, etc.)
│
├── Security Model
│   ├── Non-custodial (keys on user device)
│   ├── OS keychain encryption
│   ├── KYC required for fiat operations
│   └── One-time identity verification
│
├── Supported Chains (10)
│   ├── Solana, Ethereum, Base, Polygon
│   ├── Arbitrum, Optimism, BNB
│   ├── Avalanche, TRON, Bitcoin
│   └── Cross-chain swap support
│
└── Fiat Lifecycle
    ├── Virtual accounts (US, EU, GBP banks)
    ├── Apple Pay, Venmo, PayPal funding
    ├── Fiat → Crypto onramp
    ├── Crypto → Crypto swaps/trades
    ├── Recurring automated purchases
    └── Crypto → Fiat offramp
```

Key differentiators from Coinbase:
- **Full fiat lifecycle**: On-ramp AND off-ramp (Coinbase focuses on crypto-native)
- **10 chains vs. Base-only**: Much broader chain support for trading/swapping
- **Non-custodial local storage**: Keys on device vs. Coinbase's custodial key isolation
- **MCP-native**: `mp mcp` runs as a local MCP server, no framework coupling required
- **Closed source**: No public repo, proprietary CLI

---

## Publisher Background

MoonPay is a crypto payments infrastructure company founded in 2019. They hit a $3.4B valuation at peak and serve 500+ enterprises (including crypto exchanges, wallets, and DeFi protocols) with fiat on/off-ramp services across 180 countries. Their core business is being the "Stripe of crypto" — handling KYC, fiat conversion, and compliance so developers don't have to.

MoonPay Agents is their bet that fiat-to-crypto conversion becomes a critical primitive for autonomous agents. The competitive moat is their existing banking relationships, payment processing licenses, and compliance infrastructure. No other agent wallet provider can offer virtual bank accounts with Apple Pay/Venmo funding.

The GitHub org (`github.com/moonpay`) has only 3 repos — all demo/utility code, no agent SDK. The `@moonpay/cli` is distributed via npm as a closed-source package.

---

## What's Valuable for Us

1. **MCP server pattern**: The `mp mcp` approach — exposing a CLI tool as an MCP server — is a clean pattern we could use for any internal tool integration. It's exactly how tool exposure should work in an MCP-first architecture.

2. **Skill/tool taxonomy**: The 17 skills / 54 tools organization with clear domain boundaries (auth, swap, deposit, trading, x402) is a useful reference for structuring our own tool catalogs for agents.

3. **Fiat off-ramp capability**: If we ever need to convert crypto agent earnings to fiat (e.g., agent completes work, gets paid in crypto, converts to EUR for Burak's business), MoonPay is the only tool that handles the complete cycle including fiat off-ramp.

4. **x402 machine-to-machine payments**: Native x402 support without human input is the same pattern Coinbase supports — this is becoming the standard for agent-to-agent payments.

---

## What's NOT Relevant

- **Consumer features**: Apple Pay, Venmo, PayPal funding are consumer payment methods. Our agents operate in a B2B context.
- **10-chain support**: Unnecessary complexity. If we used agent wallets, a single chain (Base or Ethereum) would suffice.
- **Closed-source concerns**: No ability to audit, fork, or self-host. For production financial infrastructure, this is a significant risk. We'd prefer Coinbase's open-source AgentKit.
- **KYC requirements**: Requiring identity verification ties agents to specific human identities. This constrains autonomy and creates DSGVO complications for our gov contracts.
- **Trading automation**: Our agents don't trade crypto. This is for crypto-native use cases (trading bots, DeFi agents).

---

## Future Use Cases

- **Phase 4+ (Agent payments)**: If we need fiat on/off-ramps specifically (not just crypto-to-crypto), MoonPay is the only option that handles the full fiat lifecycle. But Coinbase would likely be our first choice for the crypto side.
- **Phase 4+ (Cross-chain operations)**: If agents need to interact with protocols on multiple chains (Solana, Polygon, Arbitrum), MoonPay's 10-chain support is broader than Coinbase's Base-focused approach.

---

## Key Takeaway

> **MoonPay Agents is the most complete fiat-to-crypto-to-fiat lifecycle tool for agents, but it's closed-source, KYC-gated, and solves a problem (autonomous fiat on/off-ramps) we won't face until Phase 4+ at earliest — Coinbase is the stronger choice for the crypto-native side.**
