/**
 * Orchestrator Agents — tmux-based worker lifecycle management
 *
 * Replaces Conduit CLI's pane-split/terminal-write/terminal-wait/pane-close
 * with tmux sessions + event-driven wait-for channels.
 *
 * This is the core of the L-Thread Orchestrator on Pi.
 *
 * Registered tools:
 *   tmux_dispatch    — send work to a Claude Code worker
 *   tmux_wait        — event-driven wait for completion
 *   tmux_wait_any    — wait for ANY of N workers
 *   tmux_capture     — read worker output
 *   tmux_status      — check all worker sessions
 *   tmux_spawn       — create new worker session
 *   tmux_close       — close worker session + cleanup
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

interface WorkerState {
	session: string;
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

function tmuxSessionExists(session: string): boolean {
	return exec(`tmux has-session -t "${session}" 2>/dev/null && echo yes`) === "yes";
}

function tmuxClaudeRunning(session: string): boolean {
	const cmd = exec(`tmux list-panes -t "${session}" -F '#{pane_current_command}' 2>/dev/null`);
	return cmd.includes("claude") || cmd.includes("node");
}

function latchPath(session: string): string {
	return `/tmp/orchy-${session}.latch`;
}

function clearLatch(session: string): void {
	try {
		const p = latchPath(session);
		if (existsSync(p)) {
			execSync(`rm -f "${p}"`);
		}
	} catch {}
}

function latchExists(session: string): boolean {
	return existsSync(latchPath(session));
}

function readLatch(session: string): any {
	try {
		return JSON.parse(readFileSync(latchPath(session), "utf-8"));
	} catch {
		return null;
	}
}

// ── Extension ────────────────────────────────────

export default function (pi: ExtensionAPI) {
	const workers: Map<string, WorkerState> = new Map();
	let widgetCtx: any = null;

	// ── State Persistence ────────────────────────

	function saveWorkerState(cwd: string): void {
		const statePath = join(cwd, "_bmad", "orchestrator-tmux-state.json");
		const data: any = { sessions: {}, recovery: { last_crash_detected: null, recovery_log: [] } };

		for (const [name, w] of workers) {
			data.sessions[name] = {
				tmux_session: w.session,
				working_directory: w.directory,
				claude_running: w.status === "running",
				status: w.status,
				current_task: w.currentTask,
				last_seen_alive: new Date().toISOString(),
			};
		}

		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		writeFileSync(statePath, JSON.stringify(data, null, 2));
	}

	// ── Widget ───────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;

		widgetCtx.ui.setWidget("workers", (_tui: any, theme: any) => ({
			render(width: number): string[] {
				if (workers.size === 0) {
					return [theme.fg("dim", " No workers spawned")];
				}

				const lines: string[] = [theme.fg("accent", theme.bold(" Workers"))];

				for (const [name, w] of workers) {
					const icon = w.status === "idle" ? "○"
						: w.status === "running" ? "●"
						: w.status === "done" ? "✓"
						: w.status === "error" ? "✗" : "☠";
					const color = w.status === "idle" ? "dim"
						: w.status === "running" ? "accent"
						: w.status === "done" ? "success" : "error";
					const elapsed = w.status === "running" ? ` ${Math.round(w.elapsed / 1000)}s` : "";
					const task = w.currentTask ? ` — ${w.currentTask.slice(0, 40)}` : "";

					lines.push(
						` ${theme.fg(color, icon)} ${theme.fg("accent", name)}${theme.fg("dim", elapsed)}${theme.fg("muted", task)}`,
					);
				}

				return lines;
			},
			invalidate() {},
		}));
	}

	// ── Tools ────────────────────────────────────

	// SPAWN: Create a new tmux worker session with Claude Code
	pi.registerTool({
		name: "tmux_spawn",
		label: "Spawn Worker",
		description: "Create a new tmux session and start Claude Code in it. Use this to create worker sessions before dispatching work.",
		parameters: Type.Object({
			session: Type.String({ description: "tmux session name (e.g., 'autarkis1', 'cityhub')" }),
			directory: Type.String({ description: "Working directory for the session" }),
			flags: Type.Optional(Type.String({ description: "Claude Code flags (default: --dangerously-skip-permissions)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { session, directory, flags } = params as { session: string; directory: string; flags?: string };
			const claudeFlags = flags || "--dangerously-skip-permissions";

			if (tmuxSessionExists(session)) {
				// Session exists — check if Claude is running
				const running = tmuxClaudeRunning(session);
				workers.set(session, {
					session,
					directory,
					status: running ? "idle" : "dead",
					currentTask: "",
					startedAt: null,
					elapsed: 0,
				});
				updateWidget();
				saveWorkerState(ctx.cwd);

				return {
					content: [{ type: "text", text: `Session "${session}" already exists. Claude ${running ? "is running" : "NOT running — restart needed"}.` }],
					details: { session, exists: true, claudeRunning: running },
				};
			}

			// Create session
			exec(`tmux new-session -d -s "${session}" -c "${directory}"`);

			// Start Claude Code with ORCHY_SESSION_NAME for hook signaling
			exec(`tmux send-keys -t "${session}" "export ORCHY_SESSION_NAME=${session} && unset CLAUDECODE && claude ${claudeFlags}" Enter`);

			workers.set(session, {
				session,
				directory,
				status: "idle",
				currentTask: "",
				startedAt: null,
				elapsed: 0,
			});

			updateWidget();
			saveWorkerState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Spawned worker "${session}" in ${directory}. Claude Code starting (wait ~10s before dispatching).` }],
				details: { session, directory, flags: claudeFlags },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("tmux_spawn ")) +
				theme.fg("accent", a.session || "?") +
				theme.fg("dim", ` in ${a.directory || "?"}`)
			, 0, 0);
		},
	});

	// DISPATCH: Send work to a worker session
	pi.registerTool({
		name: "tmux_dispatch",
		label: "Dispatch Work",
		description: "Send a task/prompt to a Claude Code worker running in a tmux session. Clears the latch first so you can tmux_wait for completion afterward.",
		parameters: Type.Object({
			session: Type.String({ description: "tmux session name" }),
			prompt: Type.String({ description: "The task/prompt to send to the worker" }),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { session, prompt } = params as { session: string; prompt: string };

			if (!tmuxSessionExists(session)) {
				return {
					content: [{ type: "text", text: `ERROR: Session "${session}" does not exist. Use tmux_spawn first.` }],
					details: { session, error: "no_session" },
				};
			}

			// Clear latch before dispatching
			clearLatch(session);

			// Send the prompt (escape single quotes for tmux)
			const escaped = prompt.replace(/'/g, "'\\''");
			exec(`tmux send-keys -t "${session}" '${escaped}' Enter`, 5000);

			// Update worker state
			const worker = workers.get(session);
			if (worker) {
				worker.status = "running";
				worker.currentTask = prompt.slice(0, 100);
				worker.startedAt = new Date().toISOString();
				worker.elapsed = 0;
				const startTime = Date.now();
				worker.timer = setInterval(() => {
					worker.elapsed = Date.now() - startTime;
					updateWidget();
				}, 2000);
			} else {
				workers.set(session, {
					session,
					directory: "",
					status: "running",
					currentTask: prompt.slice(0, 100),
					startedAt: new Date().toISOString(),
					elapsed: 0,
				});
			}

			updateWidget();
			saveWorkerState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Dispatched to "${session}". Use tmux_wait to wait for completion.` }],
				details: { session, prompt: prompt.slice(0, 200), latchCleared: true },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			const preview = (a.prompt || "").slice(0, 50);
			return new Text(
				theme.fg("toolTitle", theme.bold("tmux_dispatch ")) +
				theme.fg("accent", a.session || "?") +
				theme.fg("dim", ` — ${preview}`)
			, 0, 0);
		},
	});

	// WAIT: Event-driven wait for worker completion
	pi.registerTool({
		name: "tmux_wait",
		label: "Wait for Worker",
		description: "Block until a worker signals completion via tmux wait-for channel. Zero CPU usage while waiting. Uses latch files to handle signal-before-waiter race condition.",
		parameters: Type.Object({
			session: Type.String({ description: "tmux session name to wait for" }),
			timeout: Type.Optional(Type.Number({ description: "Timeout in seconds (default: 1800 = 30 min)" })),
		}),
		async execute(_id, params, _signal, onUpdate, ctx) {
			const { session, timeout } = params as { session: string; timeout?: number };
			const timeoutSec = timeout || 1800;
			const channel = `orchy-${session}-done`;

			// Fast path: latch already exists
			if (latchExists(session)) {
				const latch = readLatch(session);
				const worker = workers.get(session);
				if (worker) {
					clearInterval(worker.timer);
					worker.status = "done";
					updateWidget();
					saveWorkerState(ctx.cwd);
				}
				return {
					content: [{ type: "text", text: `Worker "${session}" already completed (latch found).` }],
					details: { session, latch, waitType: "latch_hit" },
				};
			}

			// Check session exists
			if (!tmuxSessionExists(session)) {
				return {
					content: [{ type: "text", text: `ERROR: Session "${session}" does not exist.` }],
					details: { session, error: "no_session" },
				};
			}

			if (onUpdate) {
				onUpdate({
					content: [{ type: "text", text: `Waiting for "${session}" (timeout: ${timeoutSec}s)...` }],
					details: { session, status: "waiting" },
				});
			}

			// Event-driven wait using tmux wait-for
			return new Promise((resolve) => {
				const timeoutHandle = setTimeout(() => {
					proc.kill();
					const worker = workers.get(session);
					if (worker) {
						clearInterval(worker.timer);
						// Check latch one more time (signal may have fired during wait)
						if (latchExists(session)) {
							worker.status = "done";
							updateWidget();
							saveWorkerState(ctx.cwd);
							resolve({
								content: [{ type: "text", text: `Worker "${session}" completed (latch found after timeout race).` }],
								details: { session, waitType: "latch_after_timeout" },
							});
							return;
						}
						worker.status = "error";
						updateWidget();
						saveWorkerState(ctx.cwd);
					}
					resolve({
						content: [{ type: "text", text: `TIMEOUT: Worker "${session}" did not complete within ${timeoutSec}s.` }],
						details: { session, error: "timeout", timeoutSec },
					});
				}, timeoutSec * 1000);

				const proc = cpSpawn("tmux", ["wait-for", channel], {
					stdio: ["ignore", "pipe", "pipe"],
				});

				proc.on("close", () => {
					clearTimeout(timeoutHandle);
					const latch = readLatch(session);
					const worker = workers.get(session);
					if (worker) {
						clearInterval(worker.timer);
						worker.status = "done";
						updateWidget();
						saveWorkerState(ctx.cwd);
					}
					resolve({
						content: [{ type: "text", text: `Worker "${session}" completed!` }],
						details: { session, latch, waitType: "signal" },
					});
				});

				proc.on("error", (err) => {
					clearTimeout(timeoutHandle);
					resolve({
						content: [{ type: "text", text: `ERROR waiting for "${session}": ${err.message}` }],
						details: { session, error: err.message },
					});
				});
			});
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("tmux_wait ")) +
				theme.fg("accent", a.session || "?") +
				theme.fg("dim", ` (${a.timeout || 1800}s)`)
			, 0, 0);
		},
		renderResult(result, options, theme) {
			const d = result.details as any;
			if (!d) return new Text(result.content[0]?.type === "text" ? result.content[0].text : "", 0, 0);
			if (options.isPartial) {
				return new Text(theme.fg("accent", `● Waiting for ${d.session}...`), 0, 0);
			}
			const icon = d.error ? "✗" : "✓";
			const color = d.error ? "error" : "success";
			return new Text(theme.fg(color, `${icon} ${d.session} ${d.waitType || d.error}`), 0, 0);
		},
	});

	// WAIT_ANY: Wait for any of N workers
	pi.registerTool({
		name: "tmux_wait_any",
		label: "Wait for Any Worker",
		description: "Block until ANY of the specified workers completes. Returns the name of the first worker to finish.",
		parameters: Type.Object({
			sessions: Type.Array(Type.String(), { description: "Array of tmux session names to wait for" }),
			timeout: Type.Optional(Type.Number({ description: "Timeout in seconds (default: 1800)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { sessions, timeout } = params as { sessions: string[]; timeout?: number };
			const timeoutSec = timeout || 1800;

			// Fast path: check latches
			for (const session of sessions) {
				if (latchExists(session)) {
					const worker = workers.get(session);
					if (worker) {
						clearInterval(worker.timer);
						worker.status = "done";
						updateWidget();
						saveWorkerState(ctx.cwd);
					}
					return {
						content: [{ type: "text", text: `Worker "${session}" already completed (latch found).` }],
						details: { winner: session, waitType: "latch_hit" },
					};
				}
			}

			// Wait on the global "any done" channel
			const channel = "orchy-any-done";

			return new Promise((resolve) => {
				const timeoutHandle = setTimeout(() => {
					proc.kill();
					// Final latch check
					for (const session of sessions) {
						if (latchExists(session)) {
							resolve({
								content: [{ type: "text", text: `Worker "${session}" completed.` }],
								details: { winner: session, waitType: "latch_after_timeout" },
							});
							return;
						}
					}
					resolve({
						content: [{ type: "text", text: `TIMEOUT: None of [${sessions.join(", ")}] completed within ${timeoutSec}s.` }],
						details: { error: "timeout", sessions },
					});
				}, timeoutSec * 1000);

				const proc = cpSpawn("tmux", ["wait-for", channel], {
					stdio: ["ignore", "pipe", "pipe"],
				});

				proc.on("close", () => {
					clearTimeout(timeoutHandle);
					for (const session of sessions) {
						if (latchExists(session)) {
							const worker = workers.get(session);
							if (worker) {
								clearInterval(worker.timer);
								worker.status = "done";
								updateWidget();
								saveWorkerState(ctx.cwd);
							}
							resolve({
								content: [{ type: "text", text: `Worker "${session}" completed first!` }],
								details: { winner: session, waitType: "signal" },
							});
							return;
						}
					}
					// Signal was for a session not in our list — shouldn't normally happen
					resolve({
						content: [{ type: "text", text: `Signal received but no matching latch found. Re-check workers.` }],
						details: { error: "no_match", sessions },
					});
				});
			});
		},
	});

	// CAPTURE: Read worker output
	pi.registerTool({
		name: "tmux_capture",
		label: "Capture Output",
		description: "Read the last N lines of output from a tmux worker session.",
		parameters: Type.Object({
			session: Type.String({ description: "tmux session name" }),
			lines: Type.Optional(Type.Number({ description: "Number of lines to capture (default: 50)" })),
		}),
		async execute(_id, params) {
			const { session, lines } = params as { session: string; lines?: number };
			const n = lines || 50;

			if (!tmuxSessionExists(session)) {
				return {
					content: [{ type: "text", text: `ERROR: Session "${session}" does not exist.` }],
					details: { session, error: "no_session" },
				};
			}

			const output = exec(`tmux capture-pane -t "${session}" -p -S -${n}`, 5000);

			return {
				content: [{ type: "text", text: output || "(no output)" }],
				details: { session, lines: n, length: output.length },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("tmux_capture ")) +
				theme.fg("accent", a.session || "?") +
				theme.fg("dim", ` (${a.lines || 50} lines)`)
			, 0, 0);
		},
	});

	// STATUS: Check all worker sessions
	pi.registerTool({
		name: "tmux_status",
		label: "Worker Status",
		description: "Check the status of all known worker sessions. Probes tmux for live state.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _onUpdate, ctx) {
			const status: any[] = [];

			// Also discover tmux sessions not in our map
			const tmuxSessions = exec("tmux list-sessions -F '#{session_name}' 2>/dev/null").split("\n").filter(Boolean);

			for (const session of tmuxSessions) {
				const exists = tmuxSessionExists(session);
				const claudeRunning = exists ? tmuxClaudeRunning(session) : false;
				const hasLatch = latchExists(session);
				const worker = workers.get(session);

				status.push({
					session,
					exists,
					claudeRunning,
					hasLatch,
					tracked: !!worker,
					status: worker?.status || (claudeRunning ? "unknown_running" : "unknown_idle"),
					currentTask: worker?.currentTask || "",
				});

				// Update our tracking if we discover new info
				if (worker) {
					if (!exists) worker.status = "dead";
					else if (hasLatch && worker.status === "running") {
						clearInterval(worker.timer);
						worker.status = "done";
					}
				}
			}

			updateWidget();
			saveWorkerState(ctx.cwd);

			const summary = status.map(s =>
				`${s.session}: ${s.status} | claude=${s.claudeRunning} | latch=${s.hasLatch} | task=${s.currentTask.slice(0, 40) || "-"}`
			).join("\n");

			return {
				content: [{ type: "text", text: summary || "No tmux sessions found." }],
				details: { workers: status },
			};
		},
	});

	// CLOSE: Close a worker session
	pi.registerTool({
		name: "tmux_close",
		label: "Close Worker",
		description: "Close a tmux worker session. Sends Ctrl-C to exit Claude, then kills the session. Also cleans up orphaned processes.",
		parameters: Type.Object({
			session: Type.String({ description: "tmux session name to close" }),
			cleanup: Type.Optional(Type.Boolean({ description: "Kill orphaned vitest/node/next processes (default: true)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { session, cleanup } = params as { session: string; cleanup?: boolean };
			const doCleanup = cleanup !== false;

			if (tmuxSessionExists(session)) {
				// Try graceful exit first
				exec(`tmux send-keys -t "${session}" Escape`);
				exec(`tmux send-keys -t "${session}" C-c C-c C-c`);
				// Wait briefly then kill
				exec("sleep 2 && true");
				exec(`tmux kill-session -t "${session}" 2>/dev/null`);
			}

			// Clean up latch
			clearLatch(session);

			// Clean up orphaned processes
			if (doCleanup) {
				exec('pkill -f "vitest" 2>/dev/null');
				exec('pkill -f "node.*test" 2>/dev/null');
				exec('pkill -f "next dev" 2>/dev/null');
			}

			// Update tracking
			const worker = workers.get(session);
			if (worker) {
				clearInterval(worker.timer);
				workers.delete(session);
			}

			updateWidget();
			saveWorkerState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Closed worker "${session}". ${doCleanup ? "Orphaned processes cleaned." : ""}` }],
				details: { session, cleanup: doCleanup },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("tmux_close ")) +
				theme.fg("error", a.session || "?")
			, 0, 0);
		},
	});

	// ── Session Lifecycle ────────────────────────

	pi.on("session_start", async (_event, ctx) => {
		widgetCtx = ctx;

		// Load existing worker state
		const statePath = join(ctx.cwd, "_bmad", "orchestrator-tmux-state.json");
		if (existsSync(statePath)) {
			try {
				const data = JSON.parse(readFileSync(statePath, "utf-8"));
				if (data.sessions) {
					for (const [name, info] of Object.entries(data.sessions as Record<string, any>)) {
						const exists = tmuxSessionExists(name);
						const running = exists ? tmuxClaudeRunning(name) : false;
						workers.set(name, {
							session: name,
							directory: info.working_directory || "",
							status: !exists ? "dead" : (running ? "idle" : "dead"),
							currentTask: info.current_task || "",
							startedAt: null,
							elapsed: 0,
						});
					}
				}
			} catch {}
		}

		updateWidget();

		ctx.ui.notify(
			`Workers: ${workers.size} tracked | tmux sessions: ${exec("tmux list-sessions 2>/dev/null | wc -l").trim() || "0"}`,
			"info",
		);
	});

	// Persist state before compaction
	pi.on("session_before_compact" as any, async (_event: any, ctx: any) => {
		saveWorkerState(ctx.cwd);
	});
}
