# Voice Agents — Add Voice to Your Agent (Cloudflare Agents SDK)

> **Sunil Pai & Korinne Alpers (Cloudflare) — Cloudflare Blog, 2026-04-15**

| Field | Value |
|-------|-------|
| Source | https://blog.cloudflare.com/voice-agents/ |
| Authors | Sunil Pai (creator of PartyKit, Cloudflare Agents SDK) & Korinne Alpers (Cloudflare) |
| Publication | Cloudflare Blog |
| Date | 2026-04-15 |
| Topics | voice AI, agents, Durable Objects, Workers AI, WebSockets, WebRTC, Twilio, STT, TTS, Deepgram, real-time, Cloudflare |
| Read Time | ~10 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Voice = another input to the same Durable Object, not a separate stack.** The design principle: "voice becomes another way you can talk to the same Durable Object, with the same tools, persistence, and WebSocket connection model that the Agents SDK already provides." A user can start typing, switch to voice, and switch back — all hitting the same agent with the same memory. This is architecturally cleaner than the typical voice-AI stack (separate voice pipeline + separate agent backend + sync protocol between them).
2. **Explicitly labeled experimental — ~30 lines of server code for a working voice agent.** The minimal implementation: `withVoice(Agent)` wrapper + `WorkersAIFluxSTT` (Deepgram Flux) + `WorkersAITTS` (Deepgram Aura) + an `onTurn(transcript, context)` handler. Real-time STT/TTS runs on Workers AI (no external API keys required). The framework is `@cloudflare/voice` with React hooks (`useVoiceAgent`, `useVoiceInput`) and a framework-agnostic `VoiceClient`.
3. **STT/TTS stack = Deepgram on Workers AI.** Built-in providers: Deepgram Flux (conversational STT), Deepgram Nova 3 (dictation STT), Deepgram Aura (TTS). Custom providers plug in via `Transcriber` / `TTSProvider` interfaces. Listed external partners: AssemblyAI, Rev.ai, Speechmatics, PlayHT, LMNT, Cartesia, Coqui, Amazon Polly, Google Cloud TTS.
4. **Transport = WebSocket native; Twilio/SIP via adapters; WebRTC planned.** Default is WebSocket. Twilio integration ships as `@cloudflare/voice-twilio` (phone-number → agent). WebRTC with a "global SFU" is explicitly listed as planned, not shipped. This is a concrete limitation for telephony-first deployments today.
5. **Sunil Pai's Code Mode → Voice Agents architectural continuity.** Same author shipped Code Mode at AIE Europe 2026 one week earlier (our [top-scored 10/10 talk](../../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md)). The unifying thesis is visible: "Durable Objects as the agent runtime" for both code-execution agents and voice agents. Both lean on the same Cloudflare primitives (Workers, Durable Objects, SQLite, V8 isolates).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Voice AI is Burak's locked pivot for the 50-Tage-Sprint (ColdyAI → Kälte-Vertical). This is the first major-platform ship of "voice as a first-class agent input" from a credible source (Sunil Pai). The Durable-Objects-as-runtime architecture is a real alternative to the LiveKit/Pipecat/Retell stacks we're already evaluating. For orchestrator-level concerns: lower relevance (voice is not in the tmux-worker path), but for the Voice AI Portfolio workstream, this is high-signal. |
| **Actionable** | 6/10 | Concrete code examples make this directly evaluable — ~30 lines gets a working voice agent. But adoption requires (a) committing to Cloudflare Workers as runtime (incompatible with our current tmux/local-first model), (b) accepting Deepgram as STT/TTS vendor (reasonable — they're one of the best), (c) tolerating "experimental" status. Best fit: prototype in a separate repo for the Kälte-Vertical voice pivot, NOT in the core orchestrator. Adoption would be ~1-2 days of work for a PoC. |

---

## Summary

Sunil Pai and Korinne Alpers announce an **experimental voice pipeline** for Cloudflare's Agents SDK. The core claim: you can add continuous speech-to-text + text-to-speech to an existing Cloudflare Agent with about 30 lines of server code, preserving the same Durable Object instance, the same conversation history, and the same tool access that the text-mode agent already uses. Voice is "just another input" — the user can alternate between typing and speaking without spawning a new session or losing context.

The stack is tightly integrated with Cloudflare's existing primitives. **Durable Objects** serve as the stateful agent runtime. **Workers AI** powers built-in STT/TTS providers with no external API keys required: Deepgram Flux for conversational speech recognition, Deepgram Nova 3 for dictation, Deepgram Aura for synthesis. **SQLite inside Durable Objects** persists conversation history. **WebSockets** carry the audio and text transport by default, with a **Twilio adapter** (`@cloudflare/voice-twilio`) for phone integration and a "global SFU" WebRTC layer flagged as planned but not yet shipped. Developers can swap in third-party providers (AssemblyAI, Rev.ai, Speechmatics, PlayHT, LMNT, Cartesia, Coqui, Amazon Polly, Google Cloud TTS) via clean `Transcriber` and `TTSProvider` interfaces.

The developer-facing API is deliberately thin. On the server, `withVoice(Agent)` or `withVoiceInput(Agent)` wraps an existing agent class; an `onTurn(transcript, context)` method receives each turn and returns either a string or a streaming `textStream` that the framework pipes to TTS. Pipeline hooks (`afterTranscribe()`, `beforeSynthesize()`, `afterSynthesize()`) allow low-level intervention. On the client, React hooks (`useVoiceAgent`, `useVoiceInput`) or a framework-agnostic `VoiceClient` manage the WebSocket lifecycle. Scheduling integrates with Durable Objects' `this.schedule(delay, "method", args)` for delayed spoken reminders. Runtime model switching per-connection (e.g., Flux vs Nova 3 via query param) is idiomatic.

The article is unusually honest about scope: it's labeled experimental, pricing is not disclosed, and WebRTC/SIP support is explicitly flagged as future work. That honesty is notable — this is a credible engineering announcement rather than a "we've shipped the future" marketing post. The **unifying thesis** with Pai's Code Mode keynote (our top-scored 10/10 talk from AIE Europe 2026 one week earlier) is "Durable Objects as the agent runtime" — for code execution sandboxes *and* for voice pipelines. That consistency signals real architectural investment, not opportunistic launches.

For our project, this lands squarely in the Voice AI Portfolio workstream (Burak's 50-Tage-Sprint pivot to the Kälte vertical), not the core Orchestrator. It's the first credible "voice + agents + durable state" stack from a hyperscaler-class platform, and the code is minimal enough to evaluate in a 1-2 day spike.

---

## Notable Quotes

> "Voice just becomes another way you can talk to the same Durable Object, with the same tools, persistence, and WebSocket connection model that the Agents SDK already provides."

> "A user might start by typing, switch to voice, and go back to text. With Agents SDK, these are all just different inputs to the same agent."

> "Voice should not require a separate stack, and we think the best voice agents will be the ones built on the same durable application model as everything else."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://developers.cloudflare.com/agents/api-reference/voice/ | Full API reference — endpoint list, provider interfaces, Twilio adapter docs | `/ingest-article` |
| https://github.com/cloudflare/agents | Source repo for Agents SDK (and voice extension) | `/tool-catalogue` |
| https://deepgram.com/product/flux | Deepgram Flux (conversational STT) — the default voice-in provider | `/tool-catalogue` |
| https://deepgram.com/product/aura | Deepgram Aura TTS — default voice-out provider | `/tool-catalogue` |
| Cloudflare AI Gateway | Mentioned as related service; could matter for observability of voice-agent LLM calls | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cloudflare Agents SDK | The parent framework being extended with voice | Partial — referenced in Sunil Pai Code Mode talk |
| Durable Objects | Stateful agent runtime | Partial — referenced in Code Mode talk |
| Workers AI | Runs built-in STT/TTS providers | No |
| Deepgram (Flux, Nova 3, Aura) | STT + TTS providers bundled | No |
| Twilio | Phone integration via `@cloudflare/voice-twilio` adapter | No |
| Vonage, Telnyx, Bandwidth | Additional telephony partners listed | No |
| AssemblyAI, Rev.ai, Speechmatics | Alternative STT providers | No |
| PlayHT, LMNT, Cartesia, Coqui | Alternative TTS providers | No |
| Amazon Polly, Google Cloud TTS | Additional TTS provider options | No |
| Code Mode (Sunil Pai) | Architectural sibling announced 1 week earlier at AIE Europe | Yes — [talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md](../../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md) (10/10) |

---

## Action Items

- [ ] Burak: evaluate `@cloudflare/voice` for a Kälte-Vertical voice prototype (1-2 day spike); compare latency/cost against ColdyAI's current LiveKit + Deepgram stack.
- [ ] Check whether the WebRTC + SFU story matures in time for the 50-Tage-Sprint deadline (2026-05-31) — if still "planned" by mid-May, stick with Twilio adapter for any phone-facing demo.
- [ ] Cross-check Deepgram pricing against existing ColdyAI infrastructure spend — if Workers AI bundles Deepgram calls, that changes the per-minute economics materially.
- [ ] If the Kälte-Vertical prototype lands, file a `Referenced Tools/Projects` update so Cloudflare Agents SDK and Durable Objects graduate from "Partial — referenced in Code Mode talk" to dedicated catalogue entries.
