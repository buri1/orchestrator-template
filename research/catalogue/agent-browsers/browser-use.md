# browser-use

> **browser-use.com — [github.com/browser-use/browser-use](https://github.com/browser-use/browser-use)**

| Field | Value |
|-------|-------|
| Source | [browser-use.com](https://browser-use.com/) |
| Type | Agent Browser / Python SDK |
| Stars | 84,300 (as of 2026-03-25) |
| License | MIT |
| Tech Stack | Python 3.11+, Playwright, multi-LLM (OpenAI/Claude/Gemini/Ollama) |
| Maturity | Production |

---

## Summary

browser-use is the most popular open-source Python library for AI browser automation, enabling LLMs to control a real Playwright-driven browser through natural language commands. It scores 89% on WebVoyager benchmark, supports custom tools to extend agent capabilities, and offers both local and cloud (stealth) browser modes with proxy rotation and CAPTCHA solving.

The library wraps Playwright with an LLM-native API -- agents can navigate pages, fill forms, click elements, extract data, and complete multi-step workflows without writing CSS selectors or XPaths. A CLI mode enables persistent browser sessions, and an MCP wrapper (mcp-browser-use) exists for Claude Code integration.

## Benchmarks

| Benchmark | Score | Version | Notes |
|-----------|-------|---------|-------|
| Mind2Web Online (2026-03) | **97%** | Cloud (`bu-max`) | Highest reported score; paid cloud product, NOT open-source library |
| WebVoyager | 89% | Open-source | Community benchmark |
| Stealth (bot detection) | 81% | Cloud | Cloudflare/Akamai/etc. |

**Important distinction**: The 97% Mind2Web Online score is for Browser Use Cloud, their paid hosted product with stealth browsers, custom models, and proxy infrastructure. The open-source `pip install browser-use` library has no separate benchmark score published. See [full article analysis](../articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md).

For context, other Mind2Web Online scores: GPT-5.4 Native (93%), UI-TARS-2 (88%), ABP+Opus 4.6 (86%), Stagehand (55-65%).

## Pros
- Largest community (84K stars) -- most edge cases documented
- MIT license, fully open source
- Multi-LLM support (Claude, GPT, Gemini, Ollama local models)
- 97% Mind2Web Online (Cloud) / 89% WebVoyager (OSS) benchmark scores
- Cloud browser option with stealth/anti-detection (81% on stealth benchmark)
- MCP wrapper available (mcp-browser-use)
- CLI mode for persistent sessions
- Custom tool extensibility
- Vision capabilities for image understanding
- Active development (8,900+ commits)

## Cons
- Python-only -- does not fit our TypeScript/shell stack
- Heavy dependency chain (Playwright + LLM SDKs)
- Cloud stealth features are paid (Browser Use Cloud)
- Token-heavy: full accessibility trees consume significant context
- No CLI-first design -- SDK/library approach, not command-line
- Requires Python 3.11+

## Best Use Case
Python-based agent systems that need reliable, LLM-driven browser automation with the broadest community support and documentation.

## Claude Code Integration
Not native. An MCP wrapper (`mcp-browser-use` by Saik0s, 57 stars) exists but is community-maintained. Python dependency makes it a poor fit for our shell-first tmux architecture. browser-use's own CLI mode can be invoked from bash but is not optimized for agent token efficiency.
