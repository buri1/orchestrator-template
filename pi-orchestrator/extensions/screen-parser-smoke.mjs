#!/usr/bin/env node
/**
 * Smoke test for parseScreen activity detection regexes.
 * Mirrors the logic from supervisor.ts parseScreen() lines 595-652.
 * Run: node pi-orchestrator/extensions/screen-parser-smoke.mjs
 */

// ── Extracted regex logic (matches supervisor.ts exactly) ───────

function parseScreen(raw) {
  const result = {
    activity: "unknown",
    claudeRunning: false,
    promptVisible: false,
    errorDetected: null,
    milestone: null,
    lastToolCall: null,
    tokenCount: null,
  };

  if (!raw) return result;

  // Claude running detection
  result.claudeRunning = /[✓◆❯○]|claude>|╭─|│ >|Thinking|Tool |⏺|waiting for|permission|Working/i.test(raw);

  // Prompt visible = Claude idle
  result.promptVisible = /^\s*[❯○]\s*$/m.test(raw) || /^\s*[❯○]\s*▊?\s*$/m.test(raw);

  // Token count
  const tokenMatch = raw.match(/(\d[\d,]+)\s*tokens?/i);
  if (tokenMatch) result.tokenCount = parseInt(tokenMatch[1].replace(/,/g, ""), 10);

  // Activity detection (priority order)
  if (/Error:|FAIL|panic|Traceback|ERR!|FATAL|Unhandled|exception/i.test(raw)) {
    result.activity = "error";
    const errMatch = raw.match(/(Error:.*|FAIL.*|panic:.*|Traceback.*)/i);
    result.errorDetected = errMatch ? errMatch[1].slice(0, 120) : "unknown error";
  } else if (/⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏|Working|Thinking/i.test(raw)) {
    result.activity = "thinking";
  } else if (/Tool:\s*(Edit|Write|Read|Bash|Grep|Glob|Agent)/i.test(raw)) {
    result.activity = "tool_calling";
    const toolMatch = raw.match(/Tool:\s*(\w+)/i);
    result.lastToolCall = toolMatch ? toolMatch[1] : null;
  } else if (/⏺.*\.(ts|js|tsx|jsx|py|sh|md|json|yaml|yml)/i.test(raw)) {
    result.activity = "working";
  } else if (result.promptVisible) {
    result.activity = "idle";
  } else if (result.claudeRunning) {
    result.activity = "working";
  }

  // Milestone detection
  if (/gh pr create|Pull request created|pr create/i.test(raw)) {
    result.milestone = "pr_created";
  } else if (/All tests passed|✓.*tests?|Tests.*passed|npm test.*ok/i.test(raw)) {
    result.milestone = "tests_passed";
  } else if (/git checkout -b|git switch -c|branch.*created/i.test(raw)) {
    result.milestone = "branch_created";
  } else if (/git commit|committed|\[\w+ [a-f0-9]+\]/i.test(raw)) {
    result.milestone = "committed";
  } else if (/latch|DONE|completed.*story|story.*done/i.test(raw)) {
    result.milestone = "task_completed";
  }

  return result;
}

// ── Test cases ──────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, result, expected) {
  const mismatches = [];
  for (const [key, val] of Object.entries(expected)) {
    if (result[key] !== val) {
      mismatches.push(`  ${key}: got ${JSON.stringify(result[key])}, expected ${JSON.stringify(val)}`);
    }
  }
  if (mismatches.length === 0) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.log(`  FAIL  ${label}`);
    mismatches.forEach(m => console.log(m));
    failed++;
  }
}

console.log("\n=== Screen Parser Smoke Test ===\n");

// ── 1. Empty / null input ───────────────────────────────────────
console.log("--- Empty input ---");
assert("empty string", parseScreen(""), { activity: "unknown", claudeRunning: false });
assert("null-ish", parseScreen(null), { activity: "unknown", claudeRunning: false });
assert("undefined", parseScreen(undefined), { activity: "unknown", claudeRunning: false });

// ── 2. Idle / prompt visible ────────────────────────────────────
console.log("\n--- Idle detection ---");
assert("bare prompt ❯", parseScreen("some output above\n❯ \n"), {
  activity: "idle", promptVisible: true, claudeRunning: true,
});
assert("prompt with cursor ❯▊", parseScreen("line1\n❯ ▊\n"), {
  activity: "idle", promptVisible: true,
});
assert("prompt ○", parseScreen("finished\n  ○  \n"), {
  activity: "idle", promptVisible: true,
});

// ── 3. Thinking / spinner ───────────────────────────────────────
console.log("\n--- Thinking detection ---");
assert("braille spinner ⠋", parseScreen("⠋ Thinking..."), {
  activity: "thinking", claudeRunning: true,
});
assert("braille spinner ⠸", parseScreen("⠸ Processing query"), {
  activity: "thinking",
});
assert("Working text", parseScreen("Working on your request..."), {
  activity: "thinking", claudeRunning: true,
});
assert("Thinking text", parseScreen("Thinking about the problem"), {
  activity: "thinking", claudeRunning: true,
});

// ── 4. Tool calling ─────────────────────────────────────────────
console.log("\n--- Tool calling detection ---");
assert("Tool: Edit", parseScreen("╭─ Tool: Edit src/foo.ts ─╮"), {
  activity: "tool_calling", lastToolCall: "Edit",
});
assert("Tool: Bash", parseScreen("Tool: Bash\n$ npm test"), {
  activity: "tool_calling", lastToolCall: "Bash",
});
assert("Tool: Read", parseScreen("  Tool: Read /some/path.ts"), {
  activity: "tool_calling", lastToolCall: "Read",
});
assert("Tool: Agent", parseScreen("Tool: Agent\nSpawning subagent..."), {
  activity: "tool_calling", lastToolCall: "Agent",
});

// ── 5. Error detection (highest priority) ───────────────────────
console.log("\n--- Error detection ---");
assert("Error: message", parseScreen("Error: Cannot find module 'foo'"), {
  activity: "error", errorDetected: "Error: Cannot find module 'foo'",
});
assert("FAIL in test", parseScreen("FAIL src/auth.test.ts\n  ✗ should login"), {
  activity: "error",
});
assert("Python traceback", parseScreen("Traceback (most recent call last):"), {
  activity: "error",
});
assert("FATAL crash", parseScreen("FATAL: out of memory"), {
  activity: "error",
});
assert("ERR! npm", parseScreen("npm ERR! code ENOENT"), {
  activity: "error",
});
// Error trumps thinking
assert("error beats spinner", parseScreen("⠋ Working...\nError: something broke"), {
  activity: "error",
});

// ── 6. Working (file edit indicator) ────────────────────────────
console.log("\n--- Working detection ---");
assert("⏺ editing .ts", parseScreen("⏺ src/components/Button.tsx"), {
  activity: "working",
});
assert("⏺ editing .py", parseScreen("⏺ scripts/deploy.py"), {
  activity: "working",
});
assert("⏺ editing .json", parseScreen("⏺ package.json"), {
  activity: "working",
});

// ── 7. Fallback working (claudeRunning but no specific signal) ──
console.log("\n--- Fallback working ---");
assert("claude running ╭─", parseScreen("╭─ some output\n│ doing stuff"), {
  activity: "working", claudeRunning: true,
});
assert("claude running ✓", parseScreen("✓ Something completed\nstill going"), {
  activity: "working", claudeRunning: true,
});

// ── 8. Token count extraction ───────────────────────────────────
console.log("\n--- Token count ---");
assert("simple token count", parseScreen("1234 tokens used"), {
  tokenCount: 1234,
});
assert("comma-formatted", parseScreen("12,345 tokens"), {
  tokenCount: 12345,
});
assert("large count", parseScreen("956,231 Tokens remaining"), {
  tokenCount: 956231,
});
assert("no token info", parseScreen("just some output"), {
  tokenCount: null,
});

// ── 9. Milestone detection ──────────────────────────────────────
console.log("\n--- Milestone detection ---");
assert("PR created", parseScreen("❯ gh pr create --title 'fix auth'"), {
  milestone: "pr_created",
});
assert("Pull request created", parseScreen("Pull request created: #42"), {
  milestone: "pr_created",
});
assert("tests passed", parseScreen("All tests passed (42 specs)"), {
  milestone: "tests_passed",
});
assert("tests passed ✓", parseScreen("✓ 15 tests passed, 0 failed"), {
  milestone: "tests_passed",
});
assert("branch created", parseScreen("git checkout -b feature/auth-fix"), {
  milestone: "branch_created",
});
assert("committed", parseScreen("[main abc1234] fix: auth token refresh"), {
  milestone: "committed",
});
assert("git commit", parseScreen("git commit -m 'fix stuff'"), {
  milestone: "committed",
});
assert("latch done", parseScreen("Writing latch file... DONE"), {
  milestone: "task_completed",
});
assert("story done", parseScreen("completed story 1.3"), {
  milestone: "task_completed",
});

// ── 10. Edge cases ──────────────────────────────────────────────
console.log("\n--- Edge cases ---");
assert("exception keyword in code (error priority)", parseScreen("catch (exception) { handle(exception) }"), {
  activity: "error",  // false positive — known limitation
});
assert("multiline realistic screen", parseScreen(
  "╭─ Tool: Bash\n│ $ npm test\n│\n│ PASS src/auth.test.ts\n│ ✓ should handle login (42ms)\n│ ✓ 3 tests passed\n│\n│ 1,234 tokens"
), {
  activity: "tool_calling", lastToolCall: "Bash",
  milestone: "tests_passed", tokenCount: 1234,
});

// ── Summary ─────────────────────────────────────────────────────
// NOTE: Avoid words like "failed"/"FAIL"/"Error" in success output —
// the supervisor's own parseScreen() reads this terminal and would
// false-positive trigger error detection on its own test results.
if (failed > 0) {
  console.log(`\n=== SMOKE FAIL: ${passed} ok, ${failed} not ok ===\n`);
} else {
  console.log(`\n=== ALL ${passed} CHECKS OK ===\n`);
}
process.exit(failed > 0 ? 1 : 0);
