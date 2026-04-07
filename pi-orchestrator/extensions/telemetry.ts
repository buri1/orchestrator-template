/**
 * Telemetry — Structured Event Logging for Everything
 *
 * Logs ALL observable events to JSONL files for:
 *   1. Building a custom UI / dashboard later
 *   2. Replay and post-mortem debugging
 *   3. Pattern detection (which tools get called most, where do stalls happen)
 *   4. Pre-fetch optimization (which data do agents request first?)
 *   5. Compound learning — the longer it runs, the more valuable the data
 *
 * Output: _bmad/telemetry/YYYY-MM-DD.jsonl (one file per day, append-only)
 *
 * Every line is a JSON object with:
 *   { ts, session, type, subtype, data }
 *
 * Usage: pi -e extensions/telemetry.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { existsSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

interface TelemetryEntry {
	ts: string;        // ISO timestamp
	epoch: number;     // Unix ms (for sorting/diffing)
	session: string;   // Session identifier
	type: string;      // Category: "hook", "tool", "reducer", "heartbeat", "user", "system"
	subtype: string;   // Specific event: "session_start", "tool_call", "heartbeat_probe", etc.
	data: any;         // Event-specific payload (always serializable)
}

// ════════════════════════════════════════════════════════════════════
// EXTENSION
// ════════════════════════════════════════════════════════════════════

export default function (pi: ExtensionAPI) {
	let cwd = "";
	let sessionId = "";
	let entryCount = 0;

	// ── Core Logger ─────────────────────────────────

	function log(type: string, subtype: string, data: any = {}): void {
		const now = new Date();
		const entry: TelemetryEntry = {
			ts: now.toISOString(),
			epoch: now.getTime(),
			session: sessionId,
			type,
			subtype,
			data,
		};

		const dir = join(cwd, "_bmad", "telemetry");
		mkdirSync(dir, { recursive: true });

		const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
		const filePath = join(dir, `${dateStr}.jsonl`);

		try {
			appendFileSync(filePath, JSON.stringify(entry) + "\n");
			entryCount++;
		} catch {
			// Telemetry should never crash the system
		}
	}

	// Public log function exposed via globalThis for other extensions
	function exposeLogger(): void {
		(globalThis as any).__telemetry_log = log;
	}

	// ── Session Lifecycle Hooks ─────────────────────

	pi.on("session_start", async (_event, ctx) => {
		cwd = ctx.cwd;
		sessionId = `pi-${Date.now().toString(36)}`;
		entryCount = 0;
		exposeLogger();

		log("hook", "session_start", {
			cwd: ctx.cwd,
			model: ctx.model?.id,
			contextUsage: ctx.getContextUsage(),
		});

		ctx.ui.notify(`Telemetry: logging to _bmad/telemetry/`, "info");
	});

	pi.on("session_before_compact" as any, async (_event: any, ctx: any) => {
		log("hook", "session_before_compact", {
			contextUsage: ctx.getContextUsage?.(),
			entriesLogged: entryCount,
		});
	});

	// ── Tool Call Hook (logs ALL tool calls) ────────

	pi.on("tool_call", async (event, ctx) => {
		// Extract tool info safely
		let toolName = "unknown";
		let toolInput: any = {};

		// Check each known tool type
		const toolTypes = ["read", "write", "edit", "bash", "grep", "find", "ls"] as const;
		for (const t of toolTypes) {
			if (isToolCallEventType(t, event)) {
				toolName = t;
				toolInput = event.input;
				break;
			}
		}

		// For custom/registered tools, try to extract name
		if (toolName === "unknown" && (event as any).toolName) {
			toolName = (event as any).toolName;
			toolInput = (event as any).input;
		}

		log("tool", "tool_call", {
			tool: toolName,
			input: sanitizeInput(toolInput),
		});

		return { block: false };
	});

	// ── Before Agent Start Hook ─────────────────────

	pi.on("before_agent_start", async () => {
		log("hook", "before_agent_start", {
			sessionId,
			entriesLogged: entryCount,
		});
		return {};
	});

	// ── Context Hook ────────────────────────────────

	pi.on("context" as any, async (_event: any, ctx: any) => {
		log("hook", "context_injected", {
			contextUsage: ctx.getContextUsage?.(),
		});
		return {};
	});
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function sanitizeInput(input: any): any {
	if (!input) return input;

	// Truncate long strings (prompts, file contents) to keep logs manageable
	const sanitized: any = {};
	for (const [key, value] of Object.entries(input)) {
		if (typeof value === "string" && value.length > 500) {
			sanitized[key] = value.slice(0, 500) + `... (${value.length} chars)`;
		} else {
			sanitized[key] = value;
		}
	}
	return sanitized;
}
