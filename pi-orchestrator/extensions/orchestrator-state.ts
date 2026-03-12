/**
 * Orchestrator State — Persistence + devlog tools
 *
 * Provides tools for the orchestrator agent to read/write its state file
 * and append to the devlog. These are the ONLY writes the orchestrator
 * is allowed to make (enforced by orchestrator-discipline.ts).
 *
 * Registered tools:
 *   update_state   — update orchestrator state (phase, story, agent info)
 *   read_state     — read current orchestrator state
 *   log_devlog     — append entry to devlog
 *   read_auto_mode — check if AUTO_MODE is enabled
 *
 * Usage: pi -e extensions/orchestrator-state.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { Text } from "@mariozechner/pi-tui";
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";

export default function (pi: ExtensionAPI) {
	let autoMode = false;

	// UPDATE STATE
	pi.registerTool({
		name: "update_state",
		label: "Update State",
		description: "Update the orchestrator state file (_bmad/orchestrator-state.json). Call after every phase transition.",
		parameters: Type.Object({
			phase: Type.Optional(Type.String({ description: "Current phase: idle|waiting_for_pr|reviewing|fixing|ready_to_merge|e2e_testing" })),
			current_story: Type.Optional(Type.Any({ description: "Current story object: {id, issue_number, title, branch, pr_number}" })),
			current_agent: Type.Optional(Type.Any({ description: "Current agent object: {session, type, spawned_at}" })),
			review_cycle: Type.Optional(Type.Number({ description: "Current review cycle number" })),
			stories_completed: Type.Optional(Type.Number({ description: "Total stories completed" })),
			extra: Type.Optional(Type.Any({ description: "Additional state fields to merge" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const statePath = join(ctx.cwd, "_bmad", "orchestrator-state.json");
			mkdirSync(join(ctx.cwd, "_bmad"), { recursive: true });

			// Read existing state
			let state: any = {};
			if (existsSync(statePath)) {
				try { state = JSON.parse(readFileSync(statePath, "utf-8")); } catch {}
			}

			// Merge updates
			const updates = params as any;
			if (updates.phase !== undefined) state.phase = updates.phase;
			if (updates.current_story !== undefined) state.current_story = updates.current_story;
			if (updates.current_agent !== undefined) state.current_agent = updates.current_agent;
			if (updates.review_cycle !== undefined) state.review_cycle = updates.review_cycle;
			if (updates.stories_completed !== undefined) state.stories_completed = updates.stories_completed;
			if (updates.extra) Object.assign(state, updates.extra);
			state.last_updated = new Date().toISOString();

			writeFileSync(statePath, JSON.stringify(state, null, 2));

			// Also persist in Pi's appendEntry for compaction survival
			pi.appendEntry("orchestrator-state", state);

			return {
				content: [{ type: "text", text: `State updated: phase=${state.phase}, story=${state.current_story?.id || "none"}` }],
				details: state,
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("update_state ")) +
				theme.fg("accent", a.phase || "?")
			, 0, 0);
		},
	});

	// READ STATE
	pi.registerTool({
		name: "read_state",
		label: "Read State",
		description: "Read the current orchestrator state.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _onUpdate, ctx) {
			const statePath = join(ctx.cwd, "_bmad", "orchestrator-state.json");
			if (!existsSync(statePath)) {
				return {
					content: [{ type: "text", text: "No state file found. Starting fresh." }],
					details: { phase: "idle" },
				};
			}

			const state = JSON.parse(readFileSync(statePath, "utf-8"));
			return {
				content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
				details: state,
			};
		},
	});

	// LOG TO DEVLOG
	pi.registerTool({
		name: "log_devlog",
		label: "Log to Devlog",
		description: "Append an entry to the orchestrator devlog (.bmad/devlog.md).",
		parameters: Type.Object({
			entry: Type.String({ description: "Markdown entry to append (include timestamp header)" }),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { entry } = params as { entry: string };
			const devlogPath = join(ctx.cwd, ".bmad", "devlog.md");
			mkdirSync(join(ctx.cwd, ".bmad"), { recursive: true });

			if (!existsSync(devlogPath)) {
				writeFileSync(devlogPath, "# Orchestrator Devlog\n\n");
			}

			appendFileSync(devlogPath, `\n${entry}\n`);

			// Also persist in Pi's appendEntry
			pi.appendEntry("devlog", { entry, timestamp: new Date().toISOString() });

			return {
				content: [{ type: "text", text: `Logged to devlog: ${entry.split("\n")[0].slice(0, 60)}` }],
				details: { entry },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			const preview = (a.entry || "").split("\n")[0].slice(0, 50);
			return new Text(
				theme.fg("toolTitle", theme.bold("log_devlog ")) +
				theme.fg("muted", preview)
			, 0, 0);
		},
	});

	// READ AUTO_MODE
	pi.registerTool({
		name: "read_auto_mode",
		label: "Check Auto Mode",
		description: "Check if AUTO_MODE is enabled. Returns 'ENABLED' or 'DISABLED'.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _onUpdate, ctx) {
			const autoModePath = join(ctx.cwd, ".bmad", "AUTO_MODE");
			let mode = "DISABLED";
			if (existsSync(autoModePath)) {
				mode = readFileSync(autoModePath, "utf-8").trim();
			}
			autoMode = mode === "ENABLED";

			return {
				content: [{ type: "text", text: `AUTO_MODE: ${mode}` }],
				details: { autoMode: mode === "ENABLED", raw: mode },
			};
		},
	});

	// ── Session Start ────────────────────────────

	pi.on("session_start", async (_event, ctx) => {
		// Check auto mode on startup
		const autoModePath = join(ctx.cwd, ".bmad", "AUTO_MODE");
		if (existsSync(autoModePath)) {
			autoMode = readFileSync(autoModePath, "utf-8").trim() === "ENABLED";
		}

		ctx.ui.setStatus("state", `Auto: ${autoMode ? "ON" : "OFF"}`);
		ctx.ui.notify(`State manager active | AUTO_MODE: ${autoMode ? "ENABLED" : "DISABLED"}`, "info");
	});

	// Inject state context before every LLM call
	pi.on("context" as any, async (_event: any, ctx: any) => {
		const statePath = join(ctx.cwd, "_bmad", "orchestrator-state.json");
		if (!existsSync(statePath)) return {};

		try {
			const state = JSON.parse(readFileSync(statePath, "utf-8"));
			return {
				additionalContext: `\n\n[ORCHESTRATOR STATE]\nPhase: ${state.phase}\nStory: ${state.current_story?.id || "none"}\nAgent: ${state.current_agent?.session || "none"}\nReview Cycle: ${state.review_cycle || 0}\nCompleted: ${state.stories_completed || 0}\nAuto-Mode: ${autoMode ? "ENABLED" : "DISABLED"}\nLast Updated: ${state.last_updated || "never"}\n`,
			};
		} catch {
			return {};
		}
	});
}
