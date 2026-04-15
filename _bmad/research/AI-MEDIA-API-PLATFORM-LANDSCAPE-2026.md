# AI Media Generation API Platform Landscape (April 2026)

Research compiled 2026-04-05. Prices and model availability change frequently -- verify before committing to a provider.

---

## Executive Summary

**Fal.ai is the current market leader** for aggregated media generation APIs, holding ~50% market share for image APIs and ~44% for video APIs. It offers the widest model catalogue (985+ endpoints), the most competitive pricing (9-40% cheaper than Replicate for images, 44-80% cheaper for video), and a mature queue-based architecture with a strong JS/TS SDK.

**For a unified single-API approach**, fal.ai or Together AI (via Runware partnership) are the strongest options. OpenRouter is expanding into image generation but does NOT cover video/audio. True "OpenRouter for media" equivalents are emerging: **Pixazo** (600+ models), **WaveSpeedAI** (600+ models), and **Renderful** are all aggregators worth watching.

---

## Platform-by-Platform Comparison

### 1. Fal AI (fal.ai)

| Attribute | Details |
|-----------|---------|
| **Image models** | 406+ endpoints: Flux 2 Pro ($0.05), Flux 2 Dev ($0.025), Flux 2 Schnell ($0.003), Seedream V4 ($0.03), Flux Kontext Pro ($0.04), Ideogram 3.0 ($0.03), Recraft V3 ($0.04), SDXL ($0.003), Qwen ($0.02/MP) |
| **Video models** | 450+ endpoints: Wan 2.5 ($0.05/s), Kling 2.5 Turbo Pro ($0.07/s), Kling 3.0 (~$0.10/s), Veo 3 ($0.40/s), Sora 2 ($0.30/s), Pika 2.2, Seedance 1.5 Pro (~$0.05/s), LTX 2.0 ($0.04/s), Hailuo/Minimax |
| **Audio models** | 59+ endpoints (speech, music) |
| **3D models** | 35+ endpoints |
| **Pricing model** | Per-output (per image, per second of video, per MP). Some models GPU-time based. |
| **Cold starts** | Minimal for popular models (kept warm). Queue system handles bursts. |
| **Queue system** | Built-in queue with `fal.subscribe()` -- polls automatically, reports queue position. |
| **Concurrency** | Configurable per-deployment (min/max concurrency). No hard published limit for serverless. |
| **Output persistence** | CDN URLs with configurable expiration via `X-Fal-Object-Lifecycle-Preference` header. JSON metadata stored 30 days. Must download before expiry. |
| **JS/TS SDK** | `@fal-ai/client` on npm (~94K weekly downloads). First-class TypeScript support. Works in Node, browser, React Native. |
| **GPU pricing** | H100: $1.89/hr, H200: $2.10/hr, A100 40GB: $0.99/hr (for custom deployments) |
| **Advantages** | Largest model catalogue. Cheapest pricing. Queue system. Pika 2.2 exclusively via fal. Fast inference (claims 4x). Strong SDK. |
| **Disadvantages** | Docs less polished than Replicate. Some niche models may have longer cold starts. |

### 2. Replicate (replicate.com)

| Attribute | Details |
|-----------|---------|
| **Image models** | Flux Pro ($0.055), Flux Dev ($0.03), Flux Schnell ($0.003), SDXL ($0.005), Ideogram V2 ($0.08), community models (thousands) |
| **Video models** | Wan 2.1/2.2 ($0.09-0.25/s), Kling v1.6 Pro ($0.098/s), Veo 2 ($0.50/s), community video models |
| **Pricing model** | Per-output for official models (per image, per second). Community models billed by GPU time. |
| **Cold starts** | 3-10 seconds typical. Fine-tuned models <1 second. Cold boots on demand spikes. |
| **Concurrency** | Auto-scales with multiple machine copies. Deployments give dedicated capacity. |
| **Output persistence** | **1 hour for API predictions** (all inputs, outputs, files auto-deleted). Web UI predictions kept indefinitely. Must save copies immediately. |
| **JS/TS SDK** | `replicate` on npm (v1.4.0). Node.js client. |
| **Advantages** | Best documentation. Huge community model library. Easy to deploy custom models (Cog containers). Mature ecosystem. |
| **Disadvantages** | 10-40% more expensive than fal for most models. 1-hour file expiry is aggressive. Cold starts on less-popular models. |

### 3. Together AI (together.ai)

| Attribute | Details |
|-----------|---------|
| **Image models** | 15+ via Runware partnership: Gemini Flash Image ($0.039), Imagen 4.0 Ultra ($0.06), Qwen Image ($0.0058), models from $0.0006/image |
| **Video models** | 20+ via Runware: Sora 2 Pro ($2.40/video for 720p/8s), Veo 3.0 ($1.60/video for 720p/8s), PixVerse V5 ($0.30/video for 1080p/5s), Seedance 1.0 Pro ($0.57/video), Kling v2.1 (up to 30s), Minimax Hailuo, Vidu 2.0 ($0.28/1M tokens) |
| **Pricing model** | Per-model pricing, serverless pay-per-use. Unified billing. |
| **Cold starts** | Not well documented for media models (likely Runware-dependent). |
| **Concurrency** | Not published for media endpoints. |
| **Output persistence** | Not documented separately from Runware. |
| **JS/TS SDK** | OpenAI-compatible SDK -- use standard OpenAI JS client. |
| **Advantages** | OpenAI-compatible API for everything (text + image + video). Single billing dashboard. Strong LLM lineup alongside media. 200+ total models. |
| **Disadvantages** | Media models are a Runware proxy (extra layer). Video pricing higher than fal for equivalent models. Relatively new media offering. |

### 4. Fireworks AI (fireworks.ai)

| Attribute | Details |
|-----------|---------|
| **Image models** | ~5 total: Flux Schnell ($0.0014/image), Flux Kontext Pro ($0.04/image), SSD-1B ($0.00013/step), SDXL |
| **Video models** | **None** |
| **Pricing model** | Per inference step (most models) or flat per image (Flux Kontext). |
| **JS/TS SDK** | OpenAI-compatible. |
| **Advantages** | Extremely fast LLM inference. Cheap Flux Schnell. |
| **Disadvantages** | Minimal image selection. Zero video. Not a media platform -- it's an LLM platform with a few image models bolted on. **Not recommended for media generation.** |

### 5. Modal (modal.com)

| Attribute | Details |
|-----------|---------|
| **What it is** | Serverless GPU infrastructure -- you bring your own model code. NOT a model marketplace. |
| **Image/Video models** | Any model you deploy yourself (Flux, SD3.5, Wan, custom fine-tunes). Pre-built examples for Flux.1-dev, SD3.5 Large Turbo, Flux Kontext. |
| **Pricing model** | Per-second GPU billing: H100 $0.001097/s ($3.95/hr), A100 80GB $0.000694/s ($2.50/hr), A100 40GB $0.000583/s ($2.10/hr), L4 $0.000222/s. Regional multipliers apply (up to 3.75x for non-preemptible US). |
| **Cold starts** | Container cold start applies. Mitigated with keep-warm settings. |
| **Concurrency** | Starter: 10 GPUs. Team: 50 GPUs. Enterprise: custom. |
| **Free tier** | $30/month free credits. Startup program up to $25K. |
| **JS/TS SDK** | Python-first. Web endpoints can be called from any language via HTTP. No official JS SDK. |
| **Advantages** | Full control. Run any model. Fine-tune anything. Cheapest at scale if you manage infra. |
| **Disadvantages** | You build everything yourself. No pre-built API for "just generate an image". Python-only SDK. Infrastructure management overhead. |

### 6. BFL / Black Forest Labs API (bfl.ai)

| Attribute | Details |
|-----------|---------|
| **Image models** | FLUX family only: FLUX.2 Pro ($0.07/image at 1MP, +$0.03/additional MP), FLUX.2 [klein] 4B (from $0.014), FLUX.2 [klein] 9B, FLUX.2 [flex], FLUX.2 [max], FLUX Kontext |
| **Video models** | None |
| **Pricing model** | Credit-based (1 credit = $0.01). Megapixel-based scaling for resolution. Same price for API and Playground. |
| **Cold starts** | Not documented (likely minimal -- dedicated infrastructure). |
| **Output persistence** | Not documented. |
| **JS/TS SDK** | REST API. No official JS SDK (community wrappers exist). |
| **Advantages** | Direct from the model creator. Best place for latest Flux models first. Simple pricing. |
| **Disadvantages** | Flux models only -- no other image models, no video, no audio. Often cheaper through fal.ai ($0.05 vs $0.07 for Flux 2 Pro). No JS SDK. |

### 7. Stability AI API (platform.stability.ai)

| Attribute | Details |
|-----------|---------|
| **Image models** | Stable Image Ultra (SD3.5 Large) at $0.08/image, Stable Image Core at $0.03/image, SDXL at $0.002-0.006/image, SD3 at ~$0.035/image |
| **Video models** | Stable Video Diffusion API **deprecated** as of July 2025. No current video API. |
| **Pricing model** | Credit-based. $10 for 1,000 credits. Free tier: 25-200 credits for new accounts. |
| **Cold starts** | Not documented. |
| **Output persistence** | Not documented. |
| **JS/TS SDK** | Community Node SDK (`stability-ai-node-sdk`). Methods for `.generate.ultra()` and `.generate.core()`. |
| **Advantages** | Cheap SDXL. Stable Image Ultra is high quality. Available on AWS Bedrock. |
| **Disadvantages** | Limited to their own models. Video API deprecated. Company has had financial instability. Smaller model selection than fal/Replicate. |

### 8. Runway API (runwayml.com/api)

| Attribute | Details |
|-----------|---------|
| **Video models** | Gen-4.5 ($0.15/s, ~25s per 625 credits), Gen-4 ($0.10/s, ~52s per 625 credits), Gen-4 Turbo ($0.05/s, ~125s per 625 credits), Gen-3 Alpha (~$0.10/s), Gen-3 Alpha Turbo |
| **Image models** | Gen-4 Images (78 images per 625 credits) |
| **Pricing model** | Credit-based ($0.01/credit). API credits purchased separately from subscription. |
| **Cold starts** | Not documented. Queuing system handles bursts. |
| **Concurrency** | Standard: 5 concurrent requests. Higher tiers available on request. No per-minute rate limit. Excess tasks get "THROTTLED" status and queued. |
| **Output persistence** | Not documented for API specifically. |
| **JS/TS SDK** | `@runwayml/sdk` on npm. Official Node.js SDK. TypeScript bindings. Node 18+. |
| **Subscription plans** | Standard $12/mo, Pro $28/mo, Unlimited $76/mo (relaxed-rate unlimited generations of multiple models). |
| **Advantages** | Industry-leading video quality (Gen-4/4.5). Professional-grade output. Official SDK. Fine-grained motion control. 4K support. |
| **Disadvantages** | Expensive compared to open-source alternatives via fal. Only Runway's own models. 5 concurrent request limit. Credits separate from subscription. |

### 9. Kling API (klingai.com)

| Attribute | Details |
|-----------|---------|
| **Video models** | Kling 3.0, Kling 2.5, Kling 2.1 (up to 120s video). Industry-leading duration. |
| **Pricing model** | Enterprise API: Entry package ~$4,200 for 30,000 units (90-day validity). ~$0.90-1.00 per 10-second professional video. Consumer plans: $6.99-$180/month. |
| **JS/TS SDK** | No official JS SDK. REST API. |
| **Advantages** | Best-in-class long-form video (up to 120 seconds). Good temporal consistency. |
| **Disadvantages** | **Prohibitive API pricing** ($4,200 minimum buy-in). Much cheaper through fal.ai ($0.07-0.10/s vs ~$0.90/10s direct). No JS SDK. |

### 10. Minimax / Hailuo API (minimax.io)

| Attribute | Details |
|-----------|---------|
| **Video models** | Hailuo 02: $0.25/6s video (768p), $0.52/10s video. $0.28 via fal.ai. Physics simulation, camera movement, up to 10s at 768p. Native 1080p coming. |
| **Other models** | MiniMax 2.5 (LLM with integrated Hailuo): $0.10/1M tokens |
| **Pricing model** | Per-video generation. |
| **JS/TS SDK** | No official JS SDK. REST API. |
| **Advantages** | Fastest generation (30-90 seconds). Very affordable ($0.01-0.03/s through some providers). Good physics simulation. |
| **Disadvantages** | 768p max currently. Developer account requires 2-3 business day approval for international. Cheaper and easier through fal.ai. |

### 11. Luma / Dream Machine API (lumalabs.ai)

| Attribute | Details |
|-----------|---------|
| **Video models** | Dream Machine: ~$0.20 per video task. Strong 3D scene understanding, realistic camera movements. |
| **Pricing model** | $0.20 per video task (API). Build tier: 10 concurrent generations, 20 req/min. Managed providers: Creator $15/mo, Pro $60/mo, Enterprise $100/mo. |
| **JS/TS SDK** | Not documented (REST API). Third-party wrappers via PiAPI. |
| **Advantages** | Excellent 3D/spatial understanding. Good camera movements. Reasonable per-generation pricing. |
| **Disadvantages** | API billing completely separate from subscription. Limited documentation. Also available through fal.ai/Replicate at similar prices. |

### 12. Pika API (pika.art)

| Attribute | Details |
|-----------|---------|
| **Video models** | Pika 2.2: text-to-video, image-to-video, Pikaframes (keyframe interpolation), Pikascenes (multi-image composition). |
| **Pricing model** | **No official public API.** Available via fal.ai (recommended self-serve route). Legacy partner API exists but requires B2B partnership. |
| **JS/TS SDK** | Via fal.ai SDK (`@fal-ai/client`). |
| **Advantages** | Good quality, fast (1-3 min generation). Unique features (Pikaframes, Pikascenes). |
| **Disadvantages** | **No self-serve API.** Must use fal.ai or negotiate B2B partnership. Vendor risk if third-party loses access. |

### 13. Suno API (suno.com) -- Music/Audio

| Attribute | Details |
|-----------|---------|
| **Models** | Suno V5.5, V5, V4.5 Plus, V4.5, V4. Vocal and instrumental tracks. Music extension. Multi-format downloads. |
| **Pricing model** | **No official public API.** Third-party wrappers only: Apiframe ($19/mo for 3,000 credits, ~50 songs), Suno Premier consumer plan ($30/mo, 10,000 credits, ~$0.03-0.04/song). |
| **JS/TS SDK** | Via third-party wrappers only (sunoapi.org, apiframe.ai, piapi.ai). |
| **Advantages** | Best-in-class music generation. V5.5 quality is impressive. |
| **Disadvantages** | **Serious vendor risk.** No official API -- all third-party wrappers could break overnight. No guaranteed stability. |

### 14. ElevenLabs API (elevenlabs.io) -- Voice/TTS

| Attribute | Details |
|-----------|---------|
| **Models** | Multilingual v2/v3 (29+ languages), Flash v2.5 (75ms latency), Turbo models, Scribe v2 (STT, 90+ languages). Voice cloning. Sound effects. Music generation. |
| **Pricing model** | Per-character: Flash/Turbo $0.06/1K chars, Multilingual v2/v3 $0.12/1K chars. STT: $0.22-0.39/hour. API plans: Free (10 credits), Pro ($99/mo, 100 credits), Scale ($330/mo, 660 credits). |
| **Concurrency** | Plan-dependent. Scale tier optimized for real-time. |
| **Output persistence** | Not documented. |
| **JS/TS SDK** | `@elevenlabs/elevenlabs-js` on npm. Official. Full TypeScript support. TTS, voice management, real-time transcription, conversational AI. |
| **Advantages** | Industry-leading voice quality. Official JS SDK. Real-time streaming. 29+ languages. SOC 2 compliance. Conversational AI support. |
| **Disadvantages** | Expensive at scale. $99/mo minimum for API access. Character-based billing can add up fast. |

---

## Unified API / Aggregator Options

### Can you use ONE API to access models across multiple platforms?

**Yes.** Several aggregators exist in 2026:

| Aggregator | Models | Covers | Pricing | Notes |
|------------|--------|--------|---------|-------|
| **Fal.ai** | 985+ endpoints | Image, Video, Audio, 3D, Speech | Per-output, cheapest | Market leader. Pika exclusive. |
| **Together AI** | 200+ (40+ media via Runware) | Text, Image, Video, Code, Audio | Per-model | OpenAI-compatible API. Best for teams already using Together for LLMs. |
| **Pixazo** | 600+ | Image, Video, Audio, Avatars, Lip-sync, Virtual try-on | Single API key | Production-ready. No vendor lock-in claim. |
| **WaveSpeedAI** | 600+ | Image, Video | Sub-second inference on many | Exclusive access to Kling 2.0, Seedance in some regions. |
| **Renderful** | Multiple | Video | From $0.05/generation | Single REST API. Pay-as-you-go. |
| **NagaAI** | Multiple | Text, Image, Embeddings | OpenAI-compatible | 50-80% below official pricing claim. |
| **OpenRouter** | Limited image | Image only (Flux.2, Gemini image) | Per-token/MP | **NOT a media aggregator.** LLM-focused. Image gen is new and limited. No video. No audio. |

### Is there an "OpenRouter for media"?

**Not exactly, but fal.ai comes closest.** OpenRouter itself has begun offering image generation (Flux.2, Gemini Flash Image) but has no video or audio models. The true "OpenRouter for media" role is being filled by:

1. **Fal.ai** -- widest catalogue, best pricing, mature SDK
2. **Together AI** -- unified with LLMs, OpenAI-compatible
3. **Pixazo** -- broadest multimodal coverage (lip-sync, virtual try-on, avatars)
4. **WaveSpeedAI** -- speed-focused, some exclusive models

---

## Pricing Comparison Matrix (Normalized)

### Image Generation (per image at ~1MP/1024x1024)

| Model | Fal.ai | Replicate | BFL Direct | Stability | Fireworks | Together |
|-------|--------|-----------|------------|-----------|-----------|----------|
| Flux 2 Pro | $0.05 | $0.055 | $0.07 | -- | -- | -- |
| Flux 2 Dev | $0.025 | $0.03 | -- | -- | -- | -- |
| Flux 2 Schnell | $0.003 | $0.003 | -- | -- | $0.0014 | -- |
| SDXL | $0.003 | $0.005 | -- | $0.002-0.006 | -- | -- |
| Ideogram 3.0 | $0.03 | $0.035 | -- | -- | -- | -- |
| SD3 / Ultra | -- | -- | -- | $0.035-0.08 | -- | -- |
| Imagen 4.0 Ultra | -- | -- | -- | -- | -- | $0.06 |

### Video Generation (per second at 720-1080p)

| Model | Fal.ai | Replicate | Runway | Direct API |
|-------|--------|-----------|--------|------------|
| Wan 2.5 | $0.05 | $0.09-0.25 | -- | -- |
| Kling 2.5 Turbo | $0.07 | $0.12 | -- | ~$0.09* |
| Kling 3.0 | ~$0.10 | -- | -- | ~$0.90/10s* |
| Veo 3 | $0.40 | $0.20-0.50 | -- | -- |
| Sora 2 | $0.30 | -- | -- | -- |
| LTX 2.0 | $0.04 | $0.05 | -- | -- |
| Gen-4 Turbo | -- | -- | $0.05 | -- |
| Gen-4 | -- | -- | $0.10 | -- |
| Gen-4.5 | -- | -- | $0.15 | -- |
| Hailuo 02 | $0.028/s | -- | -- | $0.025-0.05 |

*Direct Kling API requires $4,200 minimum purchase.

---

## Recommendation Summary

### Best overall platform: **Fal.ai**
- Widest catalogue (985+ endpoints)
- Cheapest pricing across the board
- Queue system with JS/TS SDK
- Exclusive access to Pika 2.2

### Best for quality-critical video: **Runway API**
- Gen-4/4.5 quality is unmatched for certain use cases
- Official JS SDK
- Professional tooling

### Best unified experience (LLM + Media): **Together AI**
- OpenAI-compatible API for everything
- Single billing, single SDK
- Good if you're already using Together for text models

### Best for custom models / fine-tunes: **Modal**
- Full control, bring your own model
- Cheapest at scale
- Requires engineering investment

### Best for voice/TTS: **ElevenLabs**
- Industry leader, no real competition at quality level
- Official JS SDK, real-time streaming

### Best for music: **Suno (via third-party API)**
- Best quality, but vendor risk is real
- No official API -- plan for fallback

### Avoid for media generation:
- **Fireworks AI** (LLM platform, minimal image, no video)
- **Kling direct API** ($4,200 minimum -- use via fal.ai instead)
- **BFL direct** (Flux only, more expensive than fal.ai)
- **Stability AI** (video deprecated, limited model selection, company instability)

---

## Sources

- [Fal.ai Pricing](https://fal.ai/pricing)
- [Fal.ai Models Documentation](https://fal.ai/docs/platform-apis/v1/models/pricing)
- [Replicate Pricing](https://replicate.com/pricing)
- [Replicate Output Files](https://replicate.com/docs/topics/predictions/output-files)
- [Together AI 40+ Media Models](https://www.together.ai/blog/40-new-image-and-video-models)
- [Together AI Pricing](https://www.together.ai/pricing)
- [Fireworks AI Pricing](https://fireworks.ai/pricing)
- [Modal Pricing](https://modal.com/pricing)
- [BFL/Flux Pricing](https://bfl.ai/pricing)
- [Stability AI Pricing](https://platform.stability.ai/pricing)
- [Runway API Pricing](https://docs.dev.runwayml.com/guides/pricing/)
- [Runway SDK](https://github.com/runwayml/sdk-node)
- [Kling AI Pricing](https://klingai.com/global/dev/pricing)
- [MiniMax API Pricing](https://platform.minimax.io/docs/guides/pricing)
- [Luma Dream Machine Pricing](https://lumalabs.ai/learning-hub/dream-machine-support-pricing-information)
- [Pika API on Fal](https://blog.fal.ai/pika-api-is-now-powered-by-fal/)
- [ElevenLabs API Pricing](https://elevenlabs.io/pricing/api)
- [ElevenLabs JS SDK](https://github.com/elevenlabs/elevenlabs-js)
- [OpenRouter Image Models](https://openrouter.ai/collections/image-models)
- [AI API Pricing Comparison 2026 (TeamDay)](https://www.teamday.ai/blog/ai-api-pricing-comparison-2026)
- [Complete Guide to AI Video APIs 2026 (WaveSpeedAI)](https://wavespeed.ai/blog/posts/complete-guide-ai-video-apis-2026/)
- [AI Image/Video API Providers Comparison 2026 (TeamDay)](https://www.teamday.ai/blog/ai-image-video-api-providers-comparison-2026)
- [Fal.ai JS Client](https://www.npmjs.com/package/@fal-ai/client)
- [Replicate JS Client](https://www.npmjs.com/package/replicate)
- [Fal.ai Media Expiration](https://fal.ai/docs/documentation/model-apis/media-expiration)
