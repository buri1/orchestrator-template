/**
 * Orchestrator Agents — pane-based worker lifecycle management
 *
 * For Pi ORCHESTRATOR mode (when Pi IS the orchestrator).
 * Workers are tmux panes in the right half of the lthread session.
 *
 * Layout:
 *   Left:  Pi Orchestrator (top) + empty (bottom)
 *   Right: Workers stacked (newest on top, first at bottom)
 *
 * Registered tools:
 *   tmux_spawn       — create new worker pane
 *   tmux_dispatch    — send work to a worker
 *   tmux_wait        — event-driven wait for completion
 *   tmux_wait_any    — wait for ANY of N workers
 *   tmux_capture     — read worker output
 *   tmux_status      — check all workers
 *   tmux_close       — close worker pane + cleanup
 *
 * Usage: pi -e extensions/orchestrator-agents.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { Text } from "@mariozechner/pi-tui";
import { execSync, spawn as cpSpawn } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── Types ────────────────────────────────────────

interface PaneLayout {
	session: string;
	supervisorPaneId: string;
	orchestratorPaneId: string;
	workersPaneId: string;
	orchestratorDir: string;
	workerPanes: Array<{ name: string; paneId: string; directory: string }>;
}

interface WorkerState {
	name: string;
	paneId: string;
	directory: string;
	status: "idle" | "running" | "done" | "error" | "dead";
	currentTask: string;
	startedAt: string | null;
	elapsed: number;
	timer?: ReturnType<typeof setInterval>;
}

// ── Helpers ──────────────────────────────────────

function exec(cmd: string, timeout = 10000): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout, stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return "";
	}
}

function paneExists(paneId: string): boolean {
	if (!paneId) return false;
	return exec(`tmux display-message -t "${paneId}" -p '#{pane_id}' 2>/dev/null`) === paneId;
}

function paneClaudeRunning(paneId: string): boolean {
	const cmd = exec(`tmux display-message -t "${paneId}" -p '#{pane_current_command}' 2>/dev/null`);
	return cmd.includes("claude") || cmd.includes("node");
}

function latchPath(name: string): string {
	return `/tmp/orchy-${name}.latch`;
}

function clearLatch(name: string): void {
	try {
		const p = latchPath(name);
		if (existsSync(p)) execSync(`rm -f "${p}"`);
	} catch {}
}

function latchExists(name: string): boolean {
	return existsSync(latchPath(name));
}

function readLatch(name: string): any {
	try {
		return JSON.parse(readFileSync(latchPath(name), "utf-8"));
	} catch {
		return null;
	}
}

// ── Extension ────────────────────────────────────

export default function (pi: ExtensionAPI) {
	const workers: Map<string, WorkerState> = new Map();
	let layout: PaneLayout = {
		session: "lthread", supervisorPaneId: "", orchestratorPaneId: "",
		workersPaneId: "", orchestratorDir: "", workerPanes: [],
	};
	let widgetCtx: any = null;

	// ── Layout I/O ──────────────────────────────

	function loadLayout(cwd: string): void {
		const p = join(cwd, "_bmad", "pane-layout.json");
		if (existsSync(p)) {
			try { layout = JSON.parse(readFileSync(p, "utf-8")); } catch {}
		}
	}

	function persistLayout(cwd: string): void {
		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		writeFileSync(join(cwd, "_bmad", "pane-layout.json"), JSON.stringify(layout, null, 2));
	}

	// ── State Persistence ───────────────────────

	function saveWorkerState(cwd: string): void {
		const statePath = join(cwd, "_bmad", "orchestrator-tmux-state.json");
		const data: any = { panes: {}, recovery: { last_crash_detected: null, recovery_log: [] } };
		for (const [name, w] of workers) {
			data.panes[name] = {
				pane_id: w.paneId,
				directory: w.directory,
				claude_running: w.status === "running" || w.status === "idle",
				status: w.status,
				current_task: w.currentTask,
				last_seen_alive: new Date().toISOString(),
			};
		}
		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		writeFileSync(statePath, JSON.stringify(data, null, 2));
	}

	// ── Widget ──────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;
		widgetCtx.ui.setWidget("workers", (_tui: any, theme: any) => ({
			render(_width: number): string[] {
				if (workers.size === 0) return [theme.fg("dim", " No workers spawned")];
				const lines: string[] = [theme.fg("accent", theme.bold(" Workers"))];
				for (const [name, w] of workers) {
					const icon = w.status === "idle" ? "o" : w.status === "running" ? "*"
						: w.status === "done" ? "+" : w.status === "error" ? "x" : "!";
					const color = w.status === "idle" ? "dim" : w.status === "running" ? "accent"
						: w.status === "done" ? "success" : "error";
					const elapsed = w.status === "running" ? ` ${Math.round(w.elapsed / 1000)}s` : "";
					const task = w.currentTask ? ` -- ${w.currentTask.slice(0, 40)}` : "";
					lines.push(` ${theme.fg(color, icon)} ${theme.fg("accent", name)}${theme.fg("dim", elapsed)}${theme.fg("muted", task)}`);
				}
				return lines;
			},
			invalidate() {},
		}));
	}

	// ── Pane Spawning ───────────────────────────

	function spawnWorkerPane(cwd: string, name: string, directory: string, flags: string): string | null {
		if (layout.workerPanes.length === 0) {
			const paneId = layout.workersPaneId;
			if (!paneExists(paneId)) return null;

			const escaped = `cd "${directory}" && export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
			exec(`tmux send-keys -t "${paneId}" '${escaped.replace(/'/g, "'\\''")}' Enter`, 5000);
			exec(`tmux select-pane -t "${paneId}" -T "${name}"`);

			layout.workerPanes.push({ name, paneId, directory });
			persistLayout(cwd);
			return paneId;
		}

		const topPaneId = layout.workerPanes[layout.workerPanes.length - 1].paneId;
		const totalWorkers = layout.workerPanes.length + 1;
		const splitPercent = Math.floor(100 / totalWorkers);

		const newPaneId = exec(
			`tmux split-window -v -b -t "${topPaneId}" -c "${directory}" -l ${splitPercent}% -P -F '#{pane_id}'`
		);
		if (!newPaneId) return null;

		const escaped = `export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
		exec(`tmux send-keys -t "${newPaneId}" '${escaped.replace(/'/g, "'\\''")}' Enter`, 5000);
		exec(`tmux select-pane -t "${newPaneId}" -T "${name}"`);

		layout.workerPanes.push({ name, paneId: newPaneId, directory });
		persistLayout(cwd);
		return newPaneId;
	}

	// ── Tools ───────────────────────────────────

	pi.registerTool({
		name: "tmux_spawn",
		label: "Spawn Worker",
		description: "Create a new worker pane on the right side with Claude Code. First worker fills right side, subsequent stack above.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name (used as pane title)" }),
			directory: Type.String({ description: "Working directory" }),
			flags: Type.Optional(Type.String({ description: "Claude Code flags" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { name, directory, flags } = params as { name: string; directory: string; flags?: string };
			const claudeFlags = flags || "--dangerously-skip-permissions";

			const existing = layout.workerPanes.find(w => w.name === name);
			if (existing) {
				const alive = paneExists(existing.paneId);
				return {
					content: [{ type: "text", text: `Worker "${name}" already exists (${alive ? "alive" : "DEAD"}).` }],
					details: { name, exists: true },
				};
			}

			const paneId = spawnWorkerPane(ctx.cwd, name, directory, claudeFlags);
			if (!paneId) {
				return {
					content: [{ type: "text", text: `Failed to spawn "${name}".` }],
					details: { error: true },
				};
			}

			workers.set(name, {
				name, paneId, directory, status: "idle", currentTask: "",
				startedAt: null, elapsed: 0,
			});
			updateWidget();
			saveWorkerState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Worker "${name}" spawned in pane ${paneId}. Wait ~10s before dispatching.` }],
				details: { name, paneId, directory },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(theme.fg("toolTitle", theme.bold("tmux_spawn ")) + theme.fg("accent", a.name || "?"), 0, 0);
		},
	});

	pi.registerTool({
		name: "tmux_dispatch",
		label: "Dispatch Work",
		description: "Send a task/prompt to a worker pane. Clears latch so you can tmux_wait afterward.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name" }),
			prompt: Type.String({ description: "Task/prompt to send" }),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { name, prompt } = params as { name: string; prompt: string };

			const worker = workers.get(name) || (() => {
				const w = layout.workerPanes.find(wp => wp.name === name);
				return w ? { name, paneId: w.paneId, directory: w.directory, status: "idle" as const, currentTask: "", startedAt: null, elapsed: 0 } : null;
			})();

			if (!worker) {
				return { content: [{ type: "text", text: `Worker "${name}" not found.` }], details: { error: true } };
			}

			clearLatch(name);
			const escaped = prompt.replace(/'/g, "'\\''");
			exec(`tmux send-keys -t "${worker.paneId}" '${escaped}' Enter`, 5000);

			worker.status = "running";
			worker.currentTask = prompt.slice(0, 100);
			worker.startedAt = new Date().toISOString();
			worker.elapsed = 0;
			const startTime = Date.now();
			(worker as any).timer = setInterval(() => {
				worker.elapsed = Date.now() - startTime;
				updateWidget();
			}, 2000);
			workers.set(name, worker);

			updateWidget();
			saveWorkerState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Dispatched to "${name}". Use tmux_wait to wait for completion.` }],
				details: { name, prompt: prompt.slice(0, 200) },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(theme.fg("toolTitle", theme.bold("tmux_dispatch ")) + theme.fg("accent", a.name || "?"), 0, 0);
		},
	});

	pi.registerTool({
		name: "tmux_wait",
		label: "Wait for Worker",
		description: "Block until a worker signals completion via tmux wait-for. Zero CPU.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name" }),
			timeout: Type.Optional(Type.Number({ description: "Timeout seconds (default: 1800)" })),
		}),
		async execute(_id, params, _signal, onUpdate, ctx) {
			const { name, timeout } = params as { name: string; timeout?: number };
			const timeoutSec = timeout || 1800;
			const channel = `orchy-${name}-done`;

			if (latchExists(name)) {
				const worker = workers.get(name);
				if (worker) { clearInterval(worker.timer); worker.status = "done"; updateWidget(); saveWorkerState(ctx.cwd); }
				return { content: [{ type: "text", text: `"${name}" already completed (latch).` }], details: { name, waitType: "latch_hit" } };
			}

			if (onUpdate) onUpdate({ content: [{ type: "text", text: `Waiting for "${name}" (${timeoutSec}s)...` }], details: { status: "waiting" } });

			return new Promise((resolve) => {
				const timeoutHandle = setTimeout(() => {
					proc.kill();
					const worker = workers.get(name);
					if (worker) {
						clearInterval(worker.timer);
						if (latchExists(name)) {
							worker.status = "done"; updateWidget(); saveWorkerState(ctx.cwd);
							resolve({ content: [{ type: "text", text: `"${name}" completed (latch after timeout race).` }], details: { waitType: "latch_after_timeout" } });
							return;
						}
						worker.status = "error"; updateWidget(); saveWorkerState(ctx.cwd);
					}
					resolve({ content: [{ type: "text", text: `TIMEOUT: "${name}" did not complete in ${timeoutSec}s.` }], details: { error: "timeout" } });
				}, timeoutSec * 1000);

				const proc = cpSpawn("tmux", ["wait-for", channel], { stdio: ["ignore", "pipe", "pipe"] });
				proc.on("close", () => {
					clearTimeout(timeoutHandle);
					const worker = workers.get(name);
					if (worker) { clearInterval(worker.timer); worker.status = "done"; updateWidget(); saveWorkerState(ctx.cwd); }
					resolve({ content: [{ type: "text", text: `"${name}" completed!` }], details: { waitType: "signal" } });
				});
				proc.on("error", (err) => {
					clearTimeout(timeoutHandle);
					resolve({ content: [{ type: "text", text: `ERROR: ${err.message}` }], details: { error: err.message } });
				});
			});
		},
	});

	pi.registerTool({
		name: "tmux_wait_any",
		label: "Wait for Any",
		description: "Wait for ANY of the specified workers to complete.",
		parameters: Type.Object({
			names: Type.Array(Type.String(), { description: "Worker names" }),
			timeout: Type.Optional(Type.Number({ description: "Timeout seconds (default: 1800)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { names, timeout } = params as { names: string[]; timeout?: number };
			const timeoutSec = timeout || 1800;

			for (const name of names) {
				if (latchExists(name)) {
					const worker = workers.get(name);
					if (worker) { clearInterval(worker.timer); worker.status = "done"; updateWidget(); saveWorkerState(ctx.cwd); }
					return { content: [{ type: "text", text: `"${name}" already completed.` }], details: { winner: name } };
				}
			}

			const channel = "orchy-any-done";
			return new Promise((resolve) => {
				const timeoutHandle = setTimeout(() => {
					proc.kill();
					for (const name of names) {
						if (latchExists(name)) {
							resolve({ content: [{ type: "text", text: `"${name}" completed.` }], details: { winner: name } });
							return;
						}
					}
					resolve({ content: [{ type: "text", text: `TIMEOUT: None completed in ${timeoutSec}s.` }], details: { error: "timeout" } });
				}, timeoutSec * 1000);

				const proc = cpSpawn("tmux", ["wait-for", channel], { stdio: ["ignore", "pipe", "pipe"] });
				proc.on("close", () => {
					clearTimeout(timeoutHandle);
					for (const name of names) {
						if (latchExists(name)) {
							resolve({ content: [{ type: "text", text: `"${name}" completed first!` }], details: { winner: name } });
							return;
						}
					}
					resolve({ content: [{ type: "text", text: `Signal received but no matching latch.` }], details: { error: "no_match" } });
				});
			});
		},
	});

	pi.registerTool({
		name: "tmux_capture",
		label: "Capture Output",
		description: "Read the last N lines from a worker pane.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name" }),
			lines: Type.Optional(Type.Number({ description: "Lines (default: 50)" })),
		}),
		async execute(_id, params) {
			const { name, lines } = params as { name: string; lines?: number };
			const worker = layout.workerPanes.find(w => w.name === name);
			if (!worker) return { content: [{ type: "text", text: `Worker "${name}" not found.` }], details: { error: true } };
			const output = exec(`tmux capture-pane -t "${worker.paneId}" -p -S -${lines || 50}`, 5000);
			return { content: [{ type: "text", text: output || "(no output)" }], details: { name, lines: lines || 50 } };
		},
	});

	pi.registerTool({
		name: "tmux_status",
		label: "Worker Status",
		description: "Check all worker panes.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _onUpdate, ctx) {
			const statuses = layout.workerPanes.map(w => {
				const alive = paneExists(w.paneId);
				const running = alive ? paneClaudeRunning(w.paneId) : false;
				const hasLatch = latchExists(w.name);
				const tracked = workers.get(w.name);
				return `${w.name}: ${alive ? (running ? "running" : "idle") : "DEAD"} | latch=${hasLatch} | task=${tracked?.currentTask?.slice(0, 40) || "-"}`;
			});
			return { content: [{ type: "text", text: statuses.join("\n") || "No workers." }], details: { count: layout.workerPanes.length } };
		},
	});

	pi.registerTool({
		name: "tmux_close",
		label: "Close Worker",
		description: "Close a worker pane. Graceful exit, then kill.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name" }),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { name } = params as { name: string };
			const idx = layout.workerPanes.findIndex(w => w.name === name);
			if (idx === -1) return { content: [{ type: "text", text: `Worker "${name}" not found.` }], details: { error: true } };

			const worker = layout.workerPanes[idx];
			if (paneExists(worker.paneId)) {
				exec(`tmux send-keys -t "${worker.paneId}" Escape`);
				exec(`tmux send-keys -t "${worker.paneId}" C-c C-c C-c`);
				setTimeout(() => exec(`tmux kill-pane -t "${worker.paneId}" 2>/dev/null`), 2000);
			}

			clearLatch(name);
			layout.workerPanes.splice(idx, 1);
			persistLayout(ctx.cwd);

			const tracked = workers.get(name);
			if (tracked) { clearInterval(tracked.timer); workers.delete(name); }
			updateWidget();
			saveWorkerState(ctx.cwd);

			return { content: [{ type: "text", text: `Worker "${name}" closed.` }], details: { remaining: layout.workerPanes.length } };
		},
	});

	// ── Session Lifecycle ───────────────────────

	pi.on("session_start", async (_event, ctx) => {
		widgetCtx = ctx;
		loadLayout(ctx.cwd);

		// Restore workers from layout
		for (const w of layout.workerPanes) {
			const alive = paneExists(w.paneId);
			const running = alive ? paneClaudeRunning(w.paneId) : false;
			workers.set(w.name, {
				name: w.name, paneId: w.paneId, directory: w.directory,
				status: !alive ? "dead" : (running ? "idle" : "dead"),
				currentTask: "", startedAt: null, elapsed: 0,
			});
		}

		updateWidget();
		ctx.ui.notify(`Workers: ${workers.size} tracked`, "info");
	});

	pi.on("session_before_compact" as any, async (_event: any, ctx: any) => {
		saveWorkerState(ctx.cwd);
		persistLayout(ctx.cwd);
	});
}
