# x-tweet-fetcher — Python CLI for Login-Free X/Twitter Data Extraction

> **ythx-101 — GitHub (open source, Python 3.7+), accessed 2026-04-11**

| Field | Value |
|-------|-------|
| Source | https://github.com/ythx-101/x-tweet-fetcher/blob/main/scripts/fetch_tweet.py |
| Repo Root | https://github.com/ythx-101/x-tweet-fetcher |
| Author | ythx-101 (GitHub) |
| Publication | GitHub (repo + SKILL.md) |
| Date | 2026 (latest commits) |
| Topics | x-scraping, twitter-api-alternatives, nitter, fxtwitter, camofox, playwright, agent-ingest, bookmarks-workflow |
| Read Time | 8 min (script overview) / 20 min (full repo) |

---

## Burak's Notes

> We are currently blocked on X bookmark / x-activity ingestion by the virtualized DOM on x.com (rows unload on scroll, manual scraping is fragile). This tool is extremely directly relevant: it is a zero-login, multi-backend Python script that has already solved the "get structured JSON out of X without API keys" problem for single tweets (FxTwitter), timelines/search/replies (Nitter or Camofox), lists and long-form Articles (browser), and @mention monitoring (incremental cache, cron-friendly exit codes). The architecture is also the correct one: **auto-routing across three backends with graceful fallback**, rather than betting on any single fragile path. Biggest immediate win for us is the `--user`/`--monitor` path: we could run it against our 8 tracked handles (doodlestein, ctatedev, jennyzhangzt, mitchellh, noahzweben, omarsar0, scobleizer, trq212) on a cron and diff results into our existing x-activity JSON sidecars, which would replace the manual Chrome-based ingest we do today. Second immediate win is **--monitor for @buri mentions** as a free lead-gen signal, since the script already persists state at `~/.x-tweet-fetcher/` and returns cron-standard exit codes (0=no new, 1=new, 2=error). Open questions: (a) does our Claude Code environment support the Nitter-only zero-dep mode? SKILL.md says yes, (b) can we host a private Nitter instance on the same VPS that runs the OmniPort demos? The README warns that public Nitter instances are unreliable in 2026. Treat this as a **reference implementation to port into our orchestrator**, not necessarily as a dependency to vendor.

---

## Key Takeaways

1. **Three-backend fallback architecture beats any single path** — FxTwitter (stdlib-only, single tweets), Nitter (stdlib-only, timelines/search/replies if a local instance is reachable), Camofox/Playwright (full coverage including X Lists and Articles). The `--backend auto` flag attempts Nitter first and degrades to browser automation only when needed. This is the correct pattern because X has no free API, raw scraping gets blocked, and browser automation alone is fragile in headless environments.
2. **Zero-login, zero-API-key single tweet fetch works today with only Python stdlib** — `fetch_tweet(url, timeout)` hits `api.fxtwitter.com` and returns author, text, media, engagement, quoted tweets, and view counts. `python3 scripts/fetch_tweet.py --url <tweet_url>` is the entire setup. This is the 80% path for our bookmark ingest workflow.
3. **Incremental @mention monitoring is the missing primitive for autonomous lead gen** — `--monitor <username>` baselines once, then on subsequent runs diffs against a persistent cache at `~/.x-tweet-fetcher/`, emitting only new mentions. Exit codes are cron-standard (`0`=no new, `1`=new, `2`=error), which makes it drop-in for `cron`/`launchd`/GitHub Actions and for LLM loops that trigger on non-zero.
4. **Custom snapshot parsers handle Nitter's aria accessibility tree** — `parse_timeline_snapshot()` and `parse_replies_snapshot()` extract author, text, media URLs, engagement metrics, and nested replies from Nitter's DOM output. A `supplement_views()` function then enriches Nitter results with FxTwitter view counts in batch. This is a clean split: Nitter for list-like data, FxTwitter for deep-tweet fields.
5. **Agent-ready JSON + bilingual (zh/en) surface** — All output is structured JSON (optional pretty print or text-only), explicit `--lang en|zh` flag, comprehensive error handling. Ships with a SKILL.md that documents it as a Claude skill, so the repo is already designed to be dropped into an agent harness rather than driven from a human terminal.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | We are actively blocked on X ingest (virtualized DOM); this tool is the direct answer. Our x-activity sidecars, bookmarks ingest, and future lead-gen loops all benefit. Only not a 10/10 because we may port the patterns rather than vendor the repo. |
| **Actionable** | 9/10 | `python3 scripts/fetch_tweet.py --url <tweet>` works today with zero dependencies. `--monitor` + cron + our existing ledger gives us autonomous x-activity refresh in a weekend. Nitter self-host is a one-day infra task on our Vercel/VPS footprint. |

---

## Summary

`x-tweet-fetcher` is a Python 3.7+ CLI by GitHub user `ythx-101` that retrieves tweets, timelines, replies, lists, X Articles, and @mention streams without login or an X Developer API key. It explicitly addresses the three reasons scraping X has been hard in 2026: (1) X has no free API, (2) raw scraping gets blocked, (3) pure browser automation is fragile and fails in headless environments. Its answer is a three-backend auto-routing architecture: `FxTwitter` (a public redirect-aware tweet API, stdlib-only) for individual tweets, `Nitter` (self-hosted frontend) for timeline/search/replies/mentions with only stdlib, and `Camofox` (a Firefox-based anti-detection browser running on local port 9377) or Playwright for features that require full page rendering like X Lists and long-form Articles. The `--backend auto` flag attempts Nitter first and only escalates to browser automation when needed, which minimizes cost and fragility.

The single-file script `scripts/fetch_tweet.py` exposes a rich argparse surface — `--url`, `--user`, `--search`, `--user-info`, `--article`, `--monitor`, `--list`, plus orthogonal flags like `--replies`, `--limit`, `--pretty`, `--text-only`, `--timeout`, `--port`, `--nitter`, `--backend`, and `--lang zh|en`. Internally it has clean backend routers (`check_camofox`, `camofox_fetch_page`, `_nitter_available`, `fetch_user_timeline_nitter`, `fetch_tweet_replies`, `fetch_list_tweets`, `fetch_article`) plus snapshot parsers that convert Nitter's aria accessibility tree into structured tweet objects and a `supplement_views()` batch helper that enriches Nitter data with missing view counts from FxTwitter.

The most interesting feature for our orchestrator is `--monitor`: it is an incremental, cron-friendly @mention tracker that baselines a user on first run, persists seen IDs under `~/.x-tweet-fetcher/`, and on subsequent runs returns exit code `0` (no new mentions), `1` (new mentions), or `2` (error). This is exactly the primitive we need to wire X into autonomous loops — an LLM-driven launchd job can simply rerun it on a schedule and act only on non-zero exits. The companion `SKILL.md` documents the tool explicitly as a Claude skill, including the deployment matrix across Claude Code (Nitter-only), OpenClaw, VPS, Docker, and local environments.

The project ships with a wider repo (`fetch_china.py`, `nitter_client.py`, `sogou_wechat.py`, `x-profile-analyzer.py`) that extends the same backend pattern to Weibo, Bilibili, WeChat, and LLM-driven profile analysis, but for our purposes `fetch_tweet.py` alone covers the two live pain points: (a) extracting bookmarks and timeline state from our 8 tracked practitioners without manual Chrome scraping, and (b) monitoring @buri mentions as a free inbound-lead signal. It is also a useful reference architecture even if we never vendor the code: the "Nitter for lists, FxTwitter for enrichment, browser only as last resort" split is a pattern we can port directly into a Node/TypeScript worker inside our orchestrator.

---

## Notable Quotes

> "X has no free API. Scraping gets you blocked. Browser automation is fragile and won't work in headless environments." — README framing (x-tweet-fetcher)

> "Nitter mode: Python 3.7+ only (stdlib). Browser mode: Playwright + Chromium installation required. Auto mode: uses available resources." — README setup matrix

> "Exit codes: 0 = no new content, 1 = new content, 2 = error." — mention-monitor contract (cron-friendly)

> "Claude Code specifically supports only zero-dependency Nitter mode due to browser runtime limitations." — SKILL.md deployment matrix

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://api.fxtwitter.com | The actual zero-auth tweet API this script depends on — worth catalogueing as infrastructure | `/tool-catalogue` |
| https://github.com/zedeus/nitter | Nitter upstream — we'd need this if we self-host | `/tool-catalogue` |
| https://github.com/daijro/camoufox | Camofox (anti-detection Firefox fork, port 9377) — browser backend | `/tool-catalogue` |
| https://github.com/ythx-101/x-tweet-fetcher/blob/main/scripts/nitter_client.py | Raw Nitter client used by fetch_tweet.py — pattern we'd port | `/ingest-article` |
| https://github.com/ythx-101/x-tweet-fetcher/blob/main/scripts/x-profile-analyzer.py | LLM-driven profile analyzer built on top of fetch_tweet.py — directly maps to our practitioner profiles | `/ingest-article` |
| https://github.com/ythx-101/x-tweet-fetcher/blob/main/SKILL.md | Full SKILL.md — documents install path as Claude skill | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| FxTwitter | Zero-auth public API for single tweets and user profile info | No — bookmark as infrastructure |
| Nitter | Stdlib-only timeline/search/replies via self-hosted frontend on port 8788 | No — bookmark as infrastructure |
| Camofox | Anti-detection Firefox-based browser on local port 9377 for Lists/Articles/replies | No — bookmark as infrastructure |
| Playwright + Chromium | Alternative full browser backend for the same feature set as Camofox | No — widely known, optional cross-ref |
| Claude Code | Listed as a supported deployment target (Nitter-only mode) | Yes (primary harness) |
| OpenClaw | Listed as a supported deployment target with full feature set | Yes (observed in multiple entries) |
| WeChat / Weibo / Bilibili | Extended via sibling scripts (`fetch_china.py`, `sogou_wechat.py`) using same backend-routing pattern | No — out of scope for now |

---

## Action Items

- [ ] Clone `ythx-101/x-tweet-fetcher` into a scratch dir and run `python3 scripts/fetch_tweet.py --url <a bookmark>` end-to-end to validate the stdlib-only path works inside our environment.
- [ ] Decide: vendor the repo directly vs port its backend-routing pattern into a TypeScript worker inside `pi-orchestrator/`.
- [ ] Run `--user` against all 8 tracked handles (doodlestein, ctatedev, jennyzhangzt, mitchellh, noahzweben, omarsar0, scobleizer, trq212) and diff against existing `_bmad/x-activity/*.json` sidecars.
- [ ] Stand up a private Nitter instance on our VPS (Redis + Nim build + X cookies, bound to localhost:8788) so we can run the zero-browser path for timelines/search/mentions.
- [ ] Wire `--monitor buri` (and variants of Burak's handles) into a launchd job with exit-code-driven triggers into our devlog / lead funnel.
- [ ] Read `nitter_client.py` and the Nitter snapshot parsers before designing our own — likely highest-ROI part of the repo.
- [ ] Cross-link from ADOPTABLE-PATTERNS.md under the "x-activity ingest" pattern once we've validated the end-to-end flow.
