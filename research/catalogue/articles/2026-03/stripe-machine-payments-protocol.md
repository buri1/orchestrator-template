# Introducing the Machine Payments Protocol

> **Jeff Weinstein (Product Lead, Agentic Commerce) & Steve Kaliski (Engineering Lead, Agentic Commerce) -- Stripe Blog, 2026-03-18**

| Field | Value |
|-------|-------|
| Source | [stripe.com/blog/machine-payments-protocol](https://stripe.com/blog/machine-payments-protocol) |
| Author | Jeff Weinstein & Steve Kaliski (Stripe, Agentic Commerce) |
| Publication | Stripe Blog |
| Date | 2026-03-18 |
| Topics | agent payments, machine-to-machine commerce, HTTP 402, MCP, stablecoins, agentic commerce |
| Read Time | 4 min |
| Spec | [mpp.dev](https://mpp.dev/) |
| Docs | [docs.stripe.com/payments/machine/mpp](https://docs.stripe.com/payments/machine/mpp) |

---

## Burak's Notes

> *This is the financial backbone of the agent economy. MPP standardizes HTTP 402 with a challenge-credential-receipt flow -- exactly what autonomous agents need to pay for APIs, compute, and tools without human intervention. Co-authored with Tempo (stablecoins), so it bridges fiat and crypto. The MCP/JSON-RPC transport binding means any MCP tool server can become a paid service with a few lines of code. For our SaaS factory: every service we launch could monetize via MPP out of the box. Combined with x402/EIP-8004 and Google's AP2 IntentMandate pattern, the agent payment layer is crystallizing fast. Track mpp.dev spec evolution closely.*

---

## Key Takeaways

1. **HTTP 402 finally has a standard** -- MPP repurposes the long-dormant HTTP 402 (Payment Required) status code with an extensible challenge-credential-receipt flow that works with any payment network. This is the missing piece between "agent requests resource" and "agent gets resource."

2. **Dual transport: HTTP and MCP/JSON-RPC** -- The protocol defines both HTTP transport (WWW-Authenticate/Authorization/Payment-Receipt headers) and an MCP/JSON-RPC transport for AI tool calls. This means MCP tool servers can natively require payment.

3. **Fiat + crypto convergence** -- Stripe cards/wallets via Shared Payment Tokens (SPTs) and Tempo stablecoins (USDC on-chain) are first-class payment methods. Lightning Network Bitcoin (BOLT11) also supported. Agents can pay however the service requires.

4. **Three billing models** -- One-time charges (charge intent), pay-as-you-go sessions (mppx channels), and streamed payments (real-time per-token billing over Server-Sent Events). The streamed model is particularly interesting for LLM API usage.

5. **"Few lines of code" integration** -- Stripe's PaymentIntents API + `mppx` SDK (TypeScript, Python, Rust) with middleware for Express/Next.js/Hono/Elysia. Settlement goes through standard Stripe rails -- businesses see MPP transactions in their existing Dashboard.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct infrastructure for agent economy monetization; every SaaS factory service could accept MPP payments; MCP transport binding means our MCP tools could become paid services |
| **Actionable** | 8/10 | `mppx` SDK available today; integrate into any HTTP or MCP service; Stripe Dashboard for ops; crypto + fiat covers all agent payment scenarios |

---

## Summary

Stripe introduces the Machine Payments Protocol (MPP), an open standard co-authored with Tempo that enables machine-to-machine payments over HTTP. The protocol repurposes HTTP 402 (Payment Required) with a structured challenge-credential-receipt flow: when an agent requests a paid resource, the server responds with a 402 and a payment challenge; the agent submits a credential (crypto transaction or Shared Payment Token); and upon verification, the server delivers the resource with a receipt.

The protocol defines two transport bindings. The HTTP transport maps payment flows to standard headers (WWW-Authenticate for challenges, Authorization for credentials, Payment-Receipt for confirmations). The MCP/JSON-RPC transport extends this to AI tool calls, meaning any MCP server can require payment for tool invocations. This is architecturally significant -- it turns the entire MCP ecosystem into a potential marketplace.

Three billing models are supported: one-time charges, session-based pay-as-you-go via mppx channels, and real-time streamed payments over Server-Sent Events (designed for per-token LLM billing). Payment methods span Stripe cards/wallets (via SPTs), Tempo stablecoins, and Lightning Network Bitcoin.

The integration surface is deliberately minimal. The `mppx` SDK (TypeScript, Python, Rust) provides middleware for Express, Next.js, Hono, and Elysia. A service can add MPP payment gating in roughly 10-15 lines of code. Transactions settle through standard Stripe rails and appear in the existing Stripe Dashboard, meaning businesses don't need separate infrastructure for machine payments.

Early adopters include Browserbase (pay-per-session headless browsers), PostalForm (physical mail), Parallel Web Systems (web access infrastructure), and even Prospect Butcher Co. (sandwich ordering). Stripe Climate integration lets agents contribute to carbon removal -- a small but telling signal about the breadth of the vision.

---

## Notable Quotes

> "Agents represent an entirely new category of users to build for -- and increasingly, sell to."

> "An agent can request a resource from a service, API, Model Context Protocol (MCP), or any HTTP addressable endpoint, and the service responds with a payment request."

> "Parallel is built for a world where agents are the primary users of the web. We integrated machine payments with Stripe in just a few lines of code, and now agents can autonomously pay per API call for web access." -- Parag Agrawal, Parallel Web Systems

---

## Protocol Architecture (from mpp.dev spec)

### Challenge-Credential-Receipt Flow

```
Agent                          Service
  |                               |
  |--- GET /resource ------------>|
  |                               |
  |<-- 402 + Challenge -----------|  (WWW-Authenticate header)
  |                               |
  |--- GET /resource + Credential>|  (Authorization header)
  |                               |
  |<-- 200 + Receipt + Resource --|  (Payment-Receipt header)
```

### Code Example: Adding MPP to an HTTP Endpoint

```javascript
import { Mppx, stripe } from 'mppx/server'

const mppx = Mppx.create({
  methods: [stripe.charge({
    networkId: 'internal',
    paymentMethodTypes: ['card', 'link'],
    secretKey: process.env.STRIPE_SECRET_KEY,
  })],
  secretKey: mppSecretKey
});

export async function handler(request) {
  const result = await mppx.charge({
    amount: '1',
    currency: 'usd',
    decimals: 2,
    description: 'Premium API access',
  })(request);

  if (result.status === 402) return result.challenge;
  return result.withReceipt(Response.json({ data: '...' }));
}
```

### Supported Payment Methods

| Method | Mechanism | Use Case |
|--------|-----------|----------|
| Stripe cards/wallets | Shared Payment Tokens (SPTs) | Fiat payments, traditional methods |
| Tempo stablecoins | On-chain USDC (TIP-20) | Low-value, crypto-native agents |
| Lightning Network | BOLT11 invoices | Bitcoin micropayments |
| Custom | Extensible protocol | Future payment networks |

### Required API Version

`2026-03-04.preview` (set via `Stripe-Version` header). Machine payments must be enabled on the Stripe account.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| [mpp.dev](https://mpp.dev/) | Full protocol specification -- challenge/credential/receipt schemas, transport bindings, extension points | `/ingest-article` |
| [agenticcommerce.dev](https://www.agenticcommerce.dev/) | Agentic Commerce Protocol (ACP) -- Stripe's broader agent commerce framework | `/ingest-article` |
| [docs.stripe.com/payments/machine](https://docs.stripe.com/payments/machine) | Integration guides and API reference | Reference |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Tempo | Co-author of MPP spec; stablecoin payment network | No |
| Browserbase | Early adopter -- pay-per-session headless browsers | No |
| Parallel Web Systems | Early adopter -- web access for agents (Parag Agrawal) | No |
| PostalForm | Early adopter -- physical mail printing/sending | No |
| Model Context Protocol (MCP) | MPP has native MCP/JSON-RPC transport binding | Yes -- extensively catalogued |
| x402 / EIP-8004 | Complementary agent payment protocol (Coinbase) | Yes -- referenced in infrastructure |
| Stripe Climate | Agent-accessible carbon removal contributions | No |
| Agentic Commerce Protocol (ACP) | Stripe's broader commerce framework for agents | No |
| AP2 (Agent Payment Protocol) | Google's typed mandate payment model -- complementary | Yes -- [google-developers-guide-ai-agent-protocols](../2026-03/google-developers-guide-ai-agent-protocols.md) |

---

## Action Items

- [ ] Monitor mpp.dev spec evolution -- particularly the MCP/JSON-RPC transport binding
- [ ] Evaluate adding MPP payment gating to SaaS factory services as monetization layer
- [ ] Cross-reference with AP2 IntentMandate pattern from Google's agent protocol guide
- [ ] Track `mppx` SDK releases (TypeScript/Python/Rust) for production readiness
- [ ] Investigate streamed payments model for per-token LLM billing scenarios
- [ ] Consider Tempo stablecoin integration for crypto-native agent payment flows
