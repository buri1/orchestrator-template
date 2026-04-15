# Anthropic Computer Use

> **Anthropic — [platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool)**

| Field | Value |
|-------|-------|
| Source | [Anthropic Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) |
| Type | Agent Browser / Desktop Automation / API Tool |
| Stars | N/A (built into Claude) |
| License | Proprietary (Claude API) |
| Tech Stack | Screenshot capture + mouse/keyboard control, beta API |
| Maturity | Beta (research preview) |

---

## Summary

Anthropic's Computer Use tool enables Claude to interact with desktop environments through screenshot capture and mouse/keyboard control. It can open applications, navigate browsers, fill forms, click buttons, and complete multi-step workflows autonomously. Available via the API (beta header required) and on macOS for Claude Pro/Max subscribers via "Dispatch" (assign tasks from phone, Claude executes on your Mac).

This is fundamentally different from browser-specific tools -- it controls the entire desktop, not just a browser. Claude achieves state-of-the-art results on WebArena (autonomous web navigation benchmark). The tool uses a permission-first approach: Claude requests access before touching new applications.

## Pros
- Native Claude integration -- no external tools needed
- Controls entire desktop, not just browsers
- State-of-the-art WebArena benchmark performance
- Permission-first safety model
- Available on macOS for Pro/Max subscribers
- Dispatch: assign tasks from mobile, Claude executes on desktop
- No infrastructure to manage
- Works with any application (not browser-limited)

## Cons
- Beta status -- "still early compared to Claude's ability to code or interact with text"
- Screenshot-based: high token consumption (vision model required)
- Slow: screenshot capture + reasoning per action adds latency
- Proprietary: API-only, requires beta header
- Not eligible for Zero Data Retention (ZDR)
- No headless mode -- needs a visible desktop
- macOS only (for now)
- Not designed for CI/E2E testing pipelines
- No deterministic replay or caching

## Best Use Case
One-off desktop automation tasks assigned via Dispatch where Claude needs to interact with applications beyond the browser (spreadsheets, IDEs, native apps). Not suitable for CI/E2E testing or high-throughput automation.

## Claude Code Integration
Not applicable in the traditional sense. Computer Use is an API-level tool, not an MCP server. Claude Code agents could theoretically use it via the API, but the screenshot-based approach is extremely token-heavy and slow compared to CLI or MCP browser tools. Not recommended for our orchestrator's E2E testing gate.
