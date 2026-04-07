/**
 * Orchestrator Dashboard — TUI footer with phase, workers, context
 *
 * Shows: model | phase | worker count | auto mode | context bar
 *
 * Usage: pi -e extensions/orchestrator-dashboard.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.setFooter((_tui, theme, _footerData) => ({
			dispose: () => {},
			invalidate() {},
			render(width: number): string[] {
				const model = ctx.model?.id || "no-model";
				const usage = ctx.getContextUsage();
				const pct = usage ? (usage.percent ?? 0) : 0;
				const filled = Math.round(pct / 10);
				const bar = "#".repeat(filled) + "-".repeat(10 - filled);

				// Read phase from state
				let phase = "idle";
				let autoMode = false;
				let workerCount = 0;

				const statePath = join(ctx.cwd, "_bmad", "orchestrator-state.json");
				if (existsSync(statePath)) {
					try {
						const state = JSON.parse(readFileSync(statePath, "utf-8"));
						phase = state.phase || "idle";
						workerCount = Object.keys(state.workers || {}).length;
					} catch {}
				}

				const autoModePath = join(ctx.cwd, ".bmad", "AUTO_MODE");
				if (existsSync(autoModePath)) {
					autoMode = readFileSync(autoModePath, "utf-8").trim() === "ENABLED";
				}

				const phaseColor = phase === "idle" ? "dim"
					: phase === "e2e_testing" ? "warning"
					: "accent";

				const left = theme.fg("dim", ` ${model}`) +
					theme.fg("muted", " | ") +
					theme.fg(phaseColor, phase) +
					theme.fg("muted", " | ") +
					theme.fg("accent", `${workerCount}W`) +
					theme.fg("muted", " | ") +
					theme.fg(autoMode ? "success" : "dim", autoMode ? "AUTO" : "MANUAL");

				const right = theme.fg("dim", `[${bar}] ${Math.round(pct)}% `);
				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));

				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});

	// System prompt injection with orchestrator identity
	pi.on("before_agent_start", async (_event, ctx) => {
		// Read orchestrator agent definition
		const agentPath = join(ctx.cwd, ".pi", "agents", "orchestrator.md");
		let systemPrompt = "";
		if (existsSync(agentPath)) {
			const raw = readFileSync(agentPath, "utf-8");
			const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
			systemPrompt = match ? match[1].trim() : raw;
		}

		if (systemPrompt) {
			return { systemPrompt };
		}
		return {};
	});
}
