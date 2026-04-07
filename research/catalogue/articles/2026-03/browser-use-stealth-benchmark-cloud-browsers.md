# We Stealth Benchmarked Every Major Cloud Browser Provider

> **Aitor Mato (Browser Use) — browser-use.com, 2026-03-21**

| Field | Value |
|-------|-------|
| Source | [browser-use.com](https://browser-use.com/posts/stealth-benchmark) |
| Author | Aitor Mato (Browsers team at Browser Use) |
| Publication | Browser Use Blog |
| Date | 2026-03-21 |
| Topics | cloud browsers, antibot, stealth, benchmark, web automation |
| Read Time | ~10 min |

---

## Burak's Notes

> *Comprehensive benchmark of cloud browser providers for stealth (antibot bypass). Tests 71 websites across Cloudflare, Akamai, PerimeterX. Browser Use Cloud wins at 81% but the methodology is their own — take with a grain of salt. The key insight is that "agent intelligence and browser stealth are orthogonal" — you need both separately. Relevant for our E2E testing and any future scraping needs.*

---

## Key Takeaways

1. **Agent intelligence and browser stealth are orthogonal** — Being smart about what to do on a page is separate from being undetected; both are needed for reliable web automation.
2. **Most providers use stock Chromium + residential proxies** — Browser Use claims differentiation through a maintained Chromium fork, diverse OS fingerprints, and in-house CAPTCHA solvers.
3. **Wide variance in stealth success** — From 42% (Browserbase) to 81% (Browser Use Cloud) across the same 71 test websites.
4. **Cloudflare is the easiest** — 93% success rate even for the best provider; PerimeterX and Akamai are harder.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Cloud browsers could help E2E testing but we currently use local Chrome DevTools MCP |
| **Actionable** | 3/10 | No immediate need for cloud browsers; useful reference if we hit antibot issues |

---

## Summary

Browser Use published a stealth benchmark testing 71 websites across major antibot vendors (Cloudflare, Akamai, PerimeterX, DataDome, Imperva, hCaptcha, reCAPTCHA). The test used 300,000 security check events across 6 cloud browser providers: Browser Use Cloud (81%), Anchor (77%), Onkernel (67%), Steel (47%), Browserbase (42%), and Hyperbrowser (40%).

The key argument is that most competitors use "stock Chromium" with residential proxies, while Browser Use differentiates through a proprietary Chromium fork, diverse OS fingerprints, in-house CAPTCHA solvers, and fully headless operation. Third-party BrowserBench results show a tighter spread: Browser Use Cloud (84.8%), Hyperbrowser (76.4%), Anchor (76.0%), Steel (73.3%), Browserbase (70.3%).

The article acknowledges the competitive landscape is constantly evolving and that benchmark methodology can be debated.

---

## Notable Quotes

> "Agent intelligence and browser stealth are orthogonal — you need both, separately."

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Browser Use Cloud | Their own product, top performer | No |
| Browserbase | Competitor, 42% success | No |
| Hyperbrowser | Competitor, 40% success | Yes — [Hyperbrowser](../../infrastructure/hyperbrowser.md) |
| Steel | Competitor, 47% success | No |
| Anchor | Competitor, 77% success | No |

---

## Key Takeaway

> **Cloud browser stealth benchmark showing 42-81% success rates across providers — useful reference for when we need antibot-resilient web automation, but local Chrome DevTools MCP works fine for our E2E testing.**
