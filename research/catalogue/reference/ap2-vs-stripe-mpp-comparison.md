# AP2 vs Stripe Machine Payments Protocol — Agent Payment Infrastructure Comparison

> Comparison created 2026-03-22

## Executive Summary

Google's AP2 and Stripe's MPP solve **different layers** of the agent payment stack and are complementary rather than competing. AP2 is an **authorization and trust protocol** -- it defines how users delegate spending authority to agents via cryptographically signed mandates, creating non-repudiable audit trails. MPP is a **payment execution protocol** -- it defines how agents actually pay for resources over HTTP using the 402 challenge-credential-receipt flow.

**The short version:** AP2 answers "is this agent allowed to spend this money?" while MPP answers "how does this agent actually pay?"

For our orchestrator and SaaS factory:
- **MPP is immediately actionable** -- any HTTP or MCP service we build can accept machine payments with ~15 lines of code via `mppx`. Revenue starts flowing today.
- **AP2 matters for high-trust commerce** -- when our agents need to buy from third-party merchants, manage subscriptions, or handle transactions where accountability and dispute resolution matter. AP2 is the authorization layer that sits *above* the payment rails.
- **The winning architecture uses both**: AP2 mandates authorize intent, MPP (or ACP) executes the actual payment.

---

## Detailed Comparison Table

| Dimension | AP2 (Google) | MPP (Stripe + Tempo) |
|-----------|-------------|----------------------|
| **Core function** | Authorization & trust layer | Payment execution layer |
| **Protocol design** | Typed mandates: IntentMandate -> CartMandate -> PaymentMandate -> PaymentReceipt | HTTP 402 challenge-credential-receipt flow |
| **Transport** | A2A Protocol (primary), MCP (planned), OAuth2 redirects for challenges | HTTP headers (WWW-Authenticate/Authorization/Payment-Receipt) + MCP/JSON-RPC transport binding |
| **Payment rails** | Rail-agnostic authorization; v0.1 supports pull payments (cards); v1.x adds push (bank transfers, e-wallets, crypto) | Fiat (Stripe cards/wallets via SPTs) + Crypto (Tempo USDC/TIP-20, Lightning BOLT11) + Custom extensible |
| **Billing models** | Transaction-level (single purchase, subscription planned for v1.x) | One-time charges, session-based pay-as-you-go (mppx channels), streamed per-token (SSE) |
| **Agent authorization** | Typed mandates with merchant allowlists, spending limits, TTL expiry, refundability requirements; device-backed user signatures | Session primitives ("OAuth for money"); agent authorizes once, spends within defined limits |
| **Security model** | Cryptographic audit trails; device-backed hardware key signatures; merchant-signed cart guarantees; non-repudiable VDCs; PCI data segregation (agents never see card numbers) | Challenge HMAC verification; body digest hashing; encrypted network tokens; Shared Payment Tokens; receipt verification |
| **Human oversight** | Explicit dual-mode: human-present (CartMandate with real-time approval) and human-not-present (IntentMandate with delegated authority + challenge re-entry) | Agent-autonomous by design; authorization delegated via session/wallet setup |
| **MCP integration** | Planned (not yet specified in v0.1); agent cards declare payment extensions via A2A | Native MCP/JSON-RPC transport binding; any MCP tool server can require payment |
| **SDK availability** | Python only (install from GitHub); Android samples; no PyPI package yet | `mppx` SDK in TypeScript, Python, Rust; middleware for Express, Next.js, Hono, Elysia; CLI tools |
| **Discovery** | Agent cards at `/.well-known/agent-card.json` with payment extension URIs | Payments directory (100+ services at launch); HTTP 402 response is self-describing |
| **Ecosystem backing** | Google + 60+ partners (Mastercard, PayPal, Adyen, Coinbase, Salesforce, American Express) | Stripe + Tempo; extended by Visa, Lightspark; early adopters (Browserbase, Parallel, PostalForm) |
| **Open standard?** | Yes, Apache 2.0, community-driven | Yes, open spec at mpp.dev |
| **Version** | v0.1.0 (released 2025-09-16) | Preview (2026-03-04, API version `2026-03-04.preview`) |
| **Maturity** | Early spec; no production volume reported; 48 commits; spec deliberately leaves trust establishment, key distribution, and risk signals open for ecosystem innovation | Preview with working SDK; early adopters in production; settlement through existing Stripe Dashboard; 100+ services in payments directory |
| **Dispute resolution** | Built-in: mandate chain provides cryptographic evidence; accountability allocated to user/merchant/issuer based on signed artifacts | Defers to underlying payment network rules (Stripe chargebacks, on-chain finality) |
| **Privacy model** | Role-based data segregation: cart details to merchant, payment signals to network, agents never access PCI/PII | Standard Stripe tokenization; SPTs abstract credentials |

---

## Architecture Differences

### AP2: The Trust Chain

AP2 models a "contractual conversation" between roles. Each step produces a signed artifact that becomes evidence in case of disputes.

```
User                Shopping Agent         Merchant Agent       Credential Provider
  |                      |                      |                      |
  |-- "Buy X within     |                      |                      |
  |   $50, expires 1hr" |                      |                      |
  |   [IntentMandate    |                      |                      |
  |    + device sig]    |                      |                      |
  |--------------------->                      |                      |
  |                      |-- IntentMandate ---->|                      |
  |                      |                      |                      |
  |                      |<-- CartMandate ------| (merchant signs:     |
  |                      |    (items, price,    |  price guarantee)    |
  |                      |     shipping)        |                      |
  |                      |                      |                      |
  |<-- "Approve this    |                      |                      |
  |     cart?" ---------|                      |                      |
  |                      |                      |                      |
  |-- [User device      |                      |                      |
  |    attestation] --->|                      |                      |
  |                      |                      |                      |
  |                      |-- PaymentMandate --->|--------------------->|
  |                      |   (token, AI signal) |  (tokenize + auth)  |
  |                      |                      |                      |
  |                      |<-- PaymentReceipt ---|<--------------------|
  |                      |                      |                      |
  |<-- "Done, receipt   |                      |                      |
  |     attached" ------|                      |                      |
```

**Key architectural choice:** AP2 separates authorization (mandates) from execution (payment processing). The PaymentMandate signals to the payment network that an AI agent was involved, enabling risk-adjusted fraud scoring. The protocol explicitly supports both "human-present" (user approves final cart) and "human-not-present" (user delegates via IntentMandate with guardrails).

### MPP: The Payment Pipe

MPP is simpler and more immediately practical. It repurposes HTTP 402 as a universal "pay here" signal.

```
Agent                              Service (API/MCP Tool)
  |                                      |
  |--- GET /resource ------------------>|
  |                                      |
  |<-- 402 + WWW-Authenticate ----------| (challenge: price, methods, expiry)
  |    "Pay $0.01 via stripe or tempo"   |
  |                                      |
  |--- GET /resource + Authorization -->| (credential: SPT, USDC tx, or BOLT11)
  |                                      |
  |<-- 200 + Payment-Receipt + Data ----| (receipt: proof of payment)
  |                                      |
```

**For MCP tools, the same flow maps to JSON-RPC:**
```
Agent                              MCP Tool Server
  |                                      |
  |--- tools/call { name: "search" } -->|
  |                                      |
  |<-- error { code: -32602,            | (challenge in error.data)
  |    data: { challenge: ... } } ------|
  |                                      |
  |--- tools/call { name: "search",    |
  |    _meta: { credential: ... } } --->| (credential in _meta)
  |                                      |
  |<-- result { content: [...],         |
  |    _meta: { receipt: ... } } -------|
  |                                      |
```

**Key architectural choice:** MPP is stateless at the protocol level. Each request is independently payable. For ongoing sessions, `mppx channels` layer statefulness on top. The session primitive -- "authorize once, spend within limits" -- is analogous to AP2's IntentMandate but operates at the HTTP/transport level rather than the business/trust level.

### The Fundamental Difference

| Aspect | AP2 | MPP |
|--------|-----|-----|
| **Analogy** | A notarized power of attorney | A vending machine coin slot |
| **Trust model** | Build a signed evidence chain BEFORE payment | Verify payment credential DURING request |
| **Best for** | High-value commerce, subscriptions, delegated purchasing with accountability | API monetization, micropayments, pay-per-use tools, streaming billing |
| **Complexity** | High (6+ roles, 3 mandate types, device attestation, challenge flows) | Low (3-step HTTP flow, SDK middleware, existing Stripe Dashboard) |
| **Time to integrate** | Weeks (role setup, credential provider integration, mandate schemas) | Hours (~15 LOC with `mppx` middleware) |

---

## Relevance to Our System

### Immediate (Now - Q2 2026): MPP

MPP is the actionable protocol. Our SaaS factory services can monetize via MPP today:

1. **MCP Tool Monetization** -- Any MCP tool server we build (search, data processing, code analysis) can require payment via MPP's native JSON-RPC transport binding. This turns our agent tools into paid services with minimal code.

2. **Streamed Billing** -- The SSE-based streamed payment model is designed for per-token LLM billing. If we wrap LLM access as a service, MPP handles metered billing natively.

3. **Crypto + Fiat Flexibility** -- SPTs for enterprise clients (card payments), Tempo USDC for crypto-native agents. No need to choose -- MPP supports both.

4. **Stripe Dashboard** -- Settlements flow through existing Stripe infrastructure. No new ops tooling needed.

### Medium-Term (Q3-Q4 2026): AP2

AP2 becomes relevant when our agents operate as autonomous buyers:

1. **Finance Agent Authorization** -- The IntentMandate model maps directly to our Finance Agent's spending authorization needs. "Buy hosting under $50/mo from these 3 providers, expire in 24 hours" is exactly what IntentMandate encodes.

2. **Client Trust Artifacts** -- For enterprise/gov contracts, AP2's cryptographic audit trail provides the non-repudiation evidence that compliance teams require. Every agent purchase has a signed mandate chain.

3. **Merchant Integration** -- When our agents buy from third-party services (not just pay for API calls), AP2's cart-signing flow prevents price manipulation and creates accountability.

4. **Human Oversight Modes** -- AP2's explicit human-present/human-not-present distinction aligns with our AUTO_MODE toggle. When AUTO_MODE is ENABLED, agents use IntentMandate with pre-authorized guardrails. When disabled, human confirms each CartMandate.

### The Stack We Should Build Toward

```
┌─────────────────────────────────────────────┐
│  User / Orchestrator                         │
│  (defines spending policy)                   │
├─────────────────────────────────────────────┤
│  AP2 Layer — Authorization                   │
│  IntentMandate: what agents CAN spend on     │
│  CartMandate: specific purchase approval     │
│  PaymentMandate: signals AI involvement      │
├─────────────────────────────────────────────┤
│  MPP Layer — Execution                       │
│  HTTP 402 flow for API/tool payments         │
│  MCP JSON-RPC flow for tool monetization     │
│  Session channels for ongoing spending       │
├─────────────────────────────────────────────┤
│  Payment Rails                               │
│  Stripe (cards/wallets) | Tempo (USDC)       │
│  Lightning (BTC) | Future rails              │
└─────────────────────────────────────────────┘
```

---

## Also in the Landscape: ACP and x402

Two adjacent protocols complete the picture:

| Protocol | Owner | Role | Status |
|----------|-------|------|--------|
| **ACP** (Agentic Commerce Protocol) | Stripe + OpenAI | E-commerce checkout flow for agents (product discovery, cart, checkout) | Production (ChatGPT Instant Checkout) |
| **x402** | Coinbase | HTTP 402 micropayments via on-chain stablecoins | 500K weekly transactions (most volume of any protocol) |

**ACP vs MPP:** ACP is the commerce layer (shopping lifecycle: browse, cart, checkout). MPP is the payment layer (how money actually moves). They compose: ACP orchestrates the shopping flow, MPP handles the payment step.

**x402 vs MPP:** Both use HTTP 402, but x402 is crypto-only (USDC on Base/Solana/BNB). MPP is rail-agnostic (crypto + fiat). x402 has more transaction volume today; MPP has broader payment method support and Stripe's distribution.

**AP2 vs ACP:** AP2 provides the authorization layer that ACP lacks. ACP trusts the agent to act correctly; AP2 proves the agent was authorized to act. For high-value transactions, AP2's mandate chain provides the accountability that ACP's checkout flow doesn't.

---

## Recommendation

### Phase 1 (Now): Adopt MPP for SaaS Factory Monetization
- Add `mppx` middleware to any new HTTP/MCP service
- Use Stripe payment method for enterprise clients, Tempo for crypto-native agents
- Track the payments directory for services our agents should consume

### Phase 2 (Q3 2026): Integrate AP2 for Finance Agent
- Implement IntentMandate generation in the orchestrator's spending policy
- Use AP2's human-present/human-not-present modes mapped to AUTO_MODE
- Build mandate verification into the Finance Agent's transaction audit log

### Phase 3 (Q4 2026): Full Stack
- AP2 authorization -> MPP/ACP execution -> Stripe/Tempo settlement
- Every agent transaction has a signed mandate chain (AP2) and a payment receipt (MPP)
- Compliance-ready audit trail for enterprise/gov clients

### What NOT to Do
- Do not wait for AP2 to mature before monetizing with MPP -- MPP is usable today
- Do not build custom payment flows -- the protocol stack is crystallizing around these standards
- Do not pick crypto-only (x402) or fiat-only (Stripe cards) -- MPP's rail-agnostic approach is the right bet

---

## Sources

- [Stripe MPP Blog Post](https://stripe.com/blog/machine-payments-protocol) (2026-03-18)
- [MPP Specification](https://mpp.dev/)
- [Google AP2 Announcement](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)
- [AP2 Protocol Specification](https://ap2-protocol.org/specification/)
- [AP2 GitHub Repository](https://github.com/google-agentic-commerce/AP2) (v0.1.0)
- [Google Developer's Guide to AI Agent Protocols](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/) (2026-03-18)
- [Orium: Agentic Payments Explained](https://orium.com/blog/agentic-payments-acp-ap2-x402)
- [Vellum: Google's AP2](https://vellum.ai/blog/googles-ap2-a-new-protocol-for-ai-agent-payments)
- [Chainstack: The Agentic Payments Landscape](https://chainstack.com/the-agentic-payments-landscape/)
- [Eco.com: MPP Technical Overview](https://eco.com/support/en/articles/14112145-machine-payments-protocol-mpp-how-ai-agents-pay-for-services)
