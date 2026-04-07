# E2E Screenshot Gate

Mandatory visual verification after merging a PR. Do NOT mark a story as done until this passes.

## Input

$ARGUMENTS — Story ID and project directory (e.g., `1.3 /Users/buraksmac/Desktop/code2/omniport-hh`)

Parse the first argument as the story ID, second as the project directory. If missing, check `_bmad/orchestrator-state.json` or `_bmad/orchestrator-teams-state.json` for the active story and project.

## 1. Start Dev Server

```bash
tmux has-session -t "devserver" 2>/dev/null || {
  tmux new-session -d -s "devserver" -c "<project-dir>"
  tmux send-keys -t "devserver" "pnpm dev" Enter
  sleep 10
}
# Verify server is up
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

If the server does not respond with 200 after startup, wait another 10s and retry once.

## 2. Determine Affected Pages

1. Read the most recent merged PR diff (`gh pr view --json files` or `git diff main~1..main --name-only`)
2. Filter for route files: `src/app/**/page.tsx`, `src/app/**/layout.tsx`
3. Map file paths to routes:
   - `src/app/(public)/karte/page.tsx` becomes `/karte`
   - `src/app/(public)/page.tsx` becomes `/`
   - `src/app/(admin)/dashboard/page.tsx` becomes `/dashboard`
4. Also include the root `/` route as a baseline check

## 3. Take Screenshots

Use Chrome DevTools MCP tools. For each affected route:

### Desktop (1440x900)

1. `mcp__chrome-devtools__navigate_page` to `http://localhost:3000<route>`
2. `mcp__chrome-devtools__wait_for` page load (network idle)
3. `mcp__chrome-devtools__take_screenshot`
4. `mcp__chrome-devtools__list_console_messages` — check for errors

### Mobile (390x844 — iPhone 14 Pro)

1. `mcp__chrome-devtools__emulate` with device preset or width=390, height=844
2. `mcp__chrome-devtools__navigate_page` to same route
3. `mcp__chrome-devtools__take_screenshot`
4. Check for layout overflow or broken elements

## 4. Validation Checklist

For each screenshot, verify:
- Page renders (not blank, no error boundary, no 404)
- No console errors (warnings are acceptable)
- Navigation/header visible and correct
- Content matches the story requirements
- Accessibility: focus indicators present, images have alt text
- Mobile: no horizontal scroll, text readable, touch targets adequate

## 5. Report

Output this exact format:

```
## E2E Screenshot Report — Story <ID>

### Desktop (1440x900)
| Page | Status | Notes |
|------|--------|-------|
| / | PASS/FAIL | ... |

### Mobile (390x844)
| Page | Status | Notes |
|------|--------|-------|
| / | PASS/FAIL | ... |

### Console Errors
<list or "None detected.">

### Verdict: PASS / FAIL
```

## 6. On Failure

- Document exactly what failed and include the screenshot
- Set verdict to FAIL
- Return to the orchestrator — it will spawn a fix worker
- Do NOT mark the story as done

## 7. Cleanup

Only kill the dev server when the orchestrator signals that this batch of stories is complete:

```bash
tmux kill-session -t "devserver" 2>/dev/null
```

## Fallback (No Chrome DevTools MCP)

If Chrome DevTools MCP tools are unavailable, fall back to HTTP status checks:

```bash
for route in "/" "/karte" "/about"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${route}")
  echo "${route}: ${status}"
done
```

200 = PASS, anything else = FAIL. Note in the report that visual verification was skipped.
