/**
 * Supervisor — Stateless Reducer Architecture (12 Factor Agents, Factor 12)
 *
 * The core monitoring logic is a PURE FUNCTION:
 *   reduce(state, event, config) -> [newState, effects[]]
 *
 * No I/O in the reducer. All side effects are returned as data, then executed.
 * This enables: replay, testing, debugging, time-travel.
 *
 * Architecture:
 *   Probe (I/O) → Event → Reduce (pure) → Effects → Execute (I/O)
 *                                                        ↓
 *                                              schedule_delayed
 *                                                        ↓
 *                                              Event → Reduce → Effects → ...
 *
 * Usage: pi -e extensions/supervisor.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { Text, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";

// ════════════════════════════════════════════════════════════════════
// TYPES (all serializable — no functions, no class instances)
// ════════════════════════════════════════════════════════════════════

// ── Pane Layout ─────────────────────────────────

interface PaneLayout {
	session: string;
	supervisorPaneId: string;
	orchestratorPaneId: string;
	workersPaneId: string;
	orchestratorDir: string;
	workerPanes: Array<{ name: string; paneId: string; directory: string }>;
}

// ── Config ──────────────────────────────────────

interface SupervisorConfig {
	orchestratorFlags: string;
	heartbeatIntervalMs: number;
	silenceThresholdMs: number;
	stallThresholdMs: number;
	maxNudgesBeforeRestart: number;
	workers: Record<string, { directory: string; flags?: string }>;
}

const DEFAULT_CONFIG: SupervisorConfig = {
	orchestratorFlags: "--dangerously-skip-permissions",
	heartbeatIntervalMs: 30_000,
	silenceThresholdMs: 120_000,
	stallThresholdMs: 600_000,
	maxNudgesBeforeRestart: 3,
	workers: {},
};

// ── State ───────────────────────────────────────

type Phase = "stopped" | "starting" | "running" | "silent" | "nudging" | "stalled" | "crashed";

interface SupervisorState {
	phase: Phase;
	startedAt: string | null;
	lastOutputHash: string;
	lastOutputAt: number;
	lastPhaseChangeAt: number;
	nudgeCount: number;
	restartCount: number;
	totalNudges: number;
	totalRestarts: number;
	lastCapturedOutput: string;
	orchestratorPhase: string;
	eventLog: Array<{ ts: number; type: string; detail: string }>;
}

const INITIAL_STATE: SupervisorState = {
	phase: "stopped",
	startedAt: null,
	lastOutputHash: "",
	lastOutputAt: 0,
	lastPhaseChangeAt: 0,
	nudgeCount: 0,
	restartCount: 0,
	totalNudges: 0,
	totalRestarts: 0,
	lastCapturedOutput: "",
	orchestratorPhase: "unknown",
	eventLog: [],
};

// ── Events (things that happened) ───────────────

type SupervisorEvent =
	| { type: "heartbeat"; paneAlive: boolean; claudeRunning: boolean; outputHash: string; output: string; now: number }
	| { type: "start"; directory: string; flags: string; helperScript: string; now: number }
	| { type: "stop"; kill: boolean; now: number }
	| { type: "manual_nudge"; message: string; now: number }
	| { type: "restart_settled"; now: number }
	| { type: "nudge_settled"; now: number }
	| { type: "worker_spawned"; name: string; paneId: string; directory: string; now: number }
	| { type: "worker_closed"; name: string; now: number };

// ── Effects (things to do) ──────────────────────

type SupervisorEffect =
	| { type: "send_keys"; paneId: string; text: string }
	| { type: "send_control"; paneId: string; keys: string[] }
	| { type: "set_pane_title"; paneId: string; title: string }
	| { type: "start_heartbeat" }
	| { type: "stop_heartbeat" }
	| { type: "persist_state" }
	| { type: "persist_layout" }
	| { type: "log_devlog"; entry: string }
	| { type: "notify"; message: string }
	| { type: "update_widget" }
	| { type: "schedule"; delayMs: number; event: SupervisorEvent };

// ════════════════════════════════════════════════════════════════════
// REDUCER (pure function — no I/O, fully testable)
// ════════════════════════════════════════════════════════════════════

function reduce(
	state: SupervisorState,
	event: SupervisorEvent,
	config: SupervisorConfig,
	layout: PaneLayout,
): [SupervisorState, SupervisorEffect[]] {
	const s = { ...state };
	const fx: SupervisorEffect[] = [];

	function log(detail: string) {
		s.eventLog = [...s.eventLog.slice(-49), { ts: event.type === "heartbeat" ? (event as any).now : Date.now(), type: event.type, detail }];
	}

	function transition(newPhase: Phase, reason: string) {
		if (s.phase === newPhase) return;
		const old = s.phase;
		s.phase = newPhase;
		s.lastPhaseChangeAt = "now" in event ? (event as any).now : Date.now();
		log(`${old} -> ${newPhase}: ${reason}`);
		fx.push({ type: "notify", message: `${old} -> ${newPhase} (${reason})` });
		fx.push({ type: "persist_state" });
		fx.push({ type: "update_widget" });
	}

	switch (event.type) {
		// ── HEARTBEAT (the core deterministic logic) ──────────

		case "heartbeat": {
			const { paneAlive, claudeRunning, outputHash, output, now } = event;

			// 1. Pane gone?
			if (!paneAlive) {
				if (s.phase !== "stopped" && s.phase !== "crashed") {
					transition("crashed", "orchestrator pane disappeared");
					fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] CRASH DETECTED\n- Pane gone — layout destroyed` });
				}
				break;
			}

			// 2. Claude dead?
			if (!claudeRunning) {
				if (s.phase === "running" || s.phase === "silent") {
					transition("crashed", "claude process died");
					fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] CLAUDE DIED — restarting` });
					fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: `export ORCHY_SESSION_NAME=orchestrator && unset CLAUDECODE && claude ${config.orchestratorFlags}` });
					s.restartCount++;
					s.totalRestarts++;
					fx.push({ type: "schedule", delayMs: 15000, event: { type: "restart_settled", now: now + 15000 } });
				}
				break;
			}

			// 3. New output?
			if (outputHash !== s.lastOutputHash) {
				s.lastOutputHash = outputHash;
				s.lastOutputAt = now;
				s.lastCapturedOutput = output;
				s.nudgeCount = 0;

				if (s.phase === "silent" || s.phase === "nudging" || s.phase === "stalled") {
					transition("running", "output detected after silence");
				} else if (s.phase === "starting") {
					transition("running", "first output detected");
				}

				// Detect orchestrator phase from output
				const m = output.match(/phase[=:]\s*["']?(\w+)/i);
				if (m) s.orchestratorPhase = m[1];

				fx.push({ type: "persist_state" });
				fx.push({ type: "update_widget" });
				break;
			}

			// 4. Silence
			const silence = now - s.lastOutputAt;

			if (s.phase === "running" && silence > config.silenceThresholdMs) {
				transition("silent", `no output for ${Math.round(silence / 1000)}s`);
			}

			if (s.phase === "silent" && s.nudgeCount < config.maxNudgesBeforeRestart) {
				s.nudgeCount++;
				s.totalNudges++;
				transition("nudging", `auto-nudge #${s.nudgeCount}`);

				const nudgeMsg = s.nudgeCount === 1
					? "continue"
					: s.nudgeCount === 2
					? "You appear to be stalled. Check your current phase and continue with the next step."
					: "SUPERVISOR: You have been silent for an extended period. Resume the orchestrator loop immediately. If stuck, skip the current task and continue.";

				fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: nudgeMsg });
				fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] NUDGE #${s.nudgeCount}\n- Silence: ${Math.round(silence / 1000)}s\n- Message: ${nudgeMsg.slice(0, 80)}` });
				fx.push({ type: "schedule", delayMs: 5000, event: { type: "nudge_settled", now: now + 5000 } });
				fx.push({ type: "persist_state" });
				break;
			}

			if (s.phase === "silent" && s.nudgeCount >= config.maxNudgesBeforeRestart) {
				transition("stalled", `${s.nudgeCount} nudges, no response`);
				fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] STALL — restarting orchestrator` });
				fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["Escape", "C-c", "C-c", "C-c"] });
				s.nudgeCount = 0;
				s.restartCount++;
				s.totalRestarts++;
				fx.push({ type: "schedule", delayMs: 3000, event: { type: "restart_settled", now: now + 3000 } });
			}

			fx.push({ type: "persist_state" });
			fx.push({ type: "update_widget" });
			break;
		}

		// ── START ────────────────────────────────────────

		case "start": {
			s.startedAt = new Date(event.now).toISOString();
			s.lastOutputAt = event.now;
			s.nudgeCount = 0;
			transition("starting", "orchestrator spawned");
			fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: `cd "${event.directory}" && export ORCHY_SESSION_NAME=orchestrator && export PANE_HELPERS="${event.helperScript}" && unset CLAUDECODE && claude ${event.flags}` });
			fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (running)" });
			fx.push({ type: "start_heartbeat" });
			fx.push({ type: "log_devlog", entry: `### [${new Date(event.now).toISOString()}] ORCHESTRATOR STARTED\n- Dir: ${event.directory}\n- Flags: ${event.flags}` });
			break;
		}

		// ── STOP ────────────────────────────────────────

		case "stop": {
			transition("stopped", event.kill ? "killed by supervisor" : "monitoring stopped");
			fx.push({ type: "stop_heartbeat" });
			if (event.kill) {
				fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["Escape", "C-c", "C-c", "C-c"] });
				fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (stopped)" });
			}
			fx.push({ type: "persist_state" });
			break;
		}

		// ── MANUAL NUDGE ────────────────────────────────

		case "manual_nudge": {
			s.totalNudges++;
			log(`manual nudge: ${event.message.slice(0, 60)}`);
			fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: event.message });
			fx.push({ type: "log_devlog", entry: `### [${new Date(event.now).toISOString()}] MANUAL NUDGE\n- ${event.message.slice(0, 200)}` });
			fx.push({ type: "persist_state" });
			break;
		}

		// ── DELAYED SETTLEMENTS ─────────────────────────

		case "restart_settled": {
			if (s.phase === "crashed" || s.phase === "stalled") {
				fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: `export ORCHY_SESSION_NAME=orchestrator && unset CLAUDECODE && claude ${config.orchestratorFlags}` });
				transition("starting", "auto-restarted");
			}
			break;
		}

		case "nudge_settled": {
			if (s.phase === "nudging") {
				transition("silent", "nudge sent, awaiting response");
			}
			break;
		}

		// ── WORKER EVENTS ───────────────────────────────

		case "worker_spawned": {
			log(`worker ${event.name} spawned in ${event.paneId}`);
			fx.push({ type: "persist_state" });
			fx.push({ type: "persist_layout" });
			fx.push({ type: "update_widget" });
			break;
		}

		case "worker_closed": {
			log(`worker ${event.name} closed`);
			fx.push({ type: "persist_state" });
			fx.push({ type: "persist_layout" });
			fx.push({ type: "update_widget" });
			break;
		}
	}

	return [s, fx];
}

// ════════════════════════════════════════════════════════════════════
// TMUX I/O (impure helpers — only called by the effect executor)
// ════════════════════════════════════════════════════════════════════

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

function paneCapture(paneId: string, lines = 30): string {
	return exec(`tmux capture-pane -t "${paneId}" -p -S -${lines}`, 5000);
}

function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return hash.toString(36);
}

// ════════════════════════════════════════════════════════════════════
// EXTENSION (impure — I/O, Pi hooks, tools, effect execution)
// ════════════════════════════════════════════════════════════════════

export default function (pi: ExtensionAPI) {
	let config: SupervisorConfig = { ...DEFAULT_CONFIG };
	let state: SupervisorState = { ...INITIAL_STATE };
	let layout: PaneLayout = { session: "lthread", supervisorPaneId: "", orchestratorPaneId: "", workersPaneId: "", orchestratorDir: "", workerPanes: [] };
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	let widgetCtx: any = null;
	let cwd = "";

	// ── Dispatch: Event → Reduce → Execute ──────────

	function dispatch(event: SupervisorEvent): void {
		const prevPhase = state.phase;
		const [newState, effects] = reduce(state, event, config, layout);
		state = newState;

		// Telemetry: log every event + effects through the global bus
		const tlog = (globalThis as any).__telemetry_log;
		if (tlog) {
			tlog("reducer", event.type, {
				prevPhase,
				newPhase: state.phase,
				effectCount: effects.length,
				effects: effects.map(e => e.type),
				...(event.type === "heartbeat" ? { silence: state.lastOutputAt ? Date.now() - state.lastOutputAt : -1 } : {}),
			});
		}

		executeEffects(effects);
	}

	function executeEffects(effects: SupervisorEffect[]): void {
		for (const fx of effects) {
			switch (fx.type) {
				case "send_keys": {
					const escaped = fx.text.replace(/'/g, "'\\''");
					exec(`tmux send-keys -t "${fx.paneId}" '${escaped}' Enter`, 5000);
					break;
				}
				case "send_control":
					for (const key of fx.keys) exec(`tmux send-keys -t "${fx.paneId}" ${key}`, 5000);
					break;
				case "set_pane_title":
					exec(`tmux select-pane -t "${fx.paneId}" -T "${fx.title}"`);
					break;
				case "start_heartbeat":
					if (heartbeatTimer) clearInterval(heartbeatTimer);
					heartbeatTimer = setInterval(() => heartbeatProbe(), config.heartbeatIntervalMs);
					break;
				case "stop_heartbeat":
					if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
					break;
				case "persist_state":
					persistState();
					break;
				case "persist_layout":
					persistLayout();
					break;
				case "log_devlog":
					writeDevlog(fx.entry);
					break;
				case "notify":
					widgetCtx?.ui.notify(`Supervisor: ${fx.message}`, "info");
					break;
				case "update_widget":
					updateWidget();
					break;
				case "schedule":
					setTimeout(() => dispatch(fx.event), fx.delayMs);
					break;
			}
		}
	}

	// ── Heartbeat Probe (I/O → Event) ───────────────

	function heartbeatProbe(): void {
		const orchPane = layout.orchestratorPaneId;
		const alive = paneExists(orchPane);
		const running = alive ? paneClaudeRunning(orchPane) : false;
		const output = alive ? paneCapture(orchPane, 20) : "";

		dispatch({
			type: "heartbeat",
			paneAlive: alive,
			claudeRunning: running,
			outputHash: simpleHash(output),
			output,
			now: Date.now(),
		});
	}

	// ── Persistence (I/O) ───────────────────────────

	function persistState(): void {
		const p = join(cwd, "_bmad", "supervisor-state.json");
		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		writeFileSync(p, JSON.stringify(state, null, 2));
		pi.appendEntry("supervisor-state", state);
	}

	function loadState(): void {
		const p = join(cwd, "_bmad", "supervisor-state.json");
		if (existsSync(p)) {
			try { state = { ...INITIAL_STATE, ...JSON.parse(readFileSync(p, "utf-8")) }; } catch {}
		}
	}

	function persistLayout(): void {
		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		writeFileSync(join(cwd, "_bmad", "pane-layout.json"), JSON.stringify(layout, null, 2));
	}

	function loadLayout(): void {
		const p = join(cwd, "_bmad", "pane-layout.json");
		if (existsSync(p)) {
			try { layout = JSON.parse(readFileSync(p, "utf-8")); } catch {}
		}
	}

	function loadConfig(): void {
		const p = join(cwd, "_bmad", "supervisor-config.json");
		if (existsSync(p)) {
			try { config = { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(p, "utf-8")) }; } catch {}
		}
	}

	function writeDevlog(entry: string): void {
		const p = join(cwd, ".bmad", "devlog.md");
		mkdirSync(join(cwd, ".bmad"), { recursive: true });
		if (!existsSync(p)) writeFileSync(p, "# Supervisor Devlog\n\n");
		appendFileSync(p, `\n${entry}\n`);
	}

	// ── Worker Pane Spawning (I/O) ──────────────────

	function spawnWorkerPane(name: string, directory: string, flags: string): string | null {
		if (layout.workerPanes.length === 0) {
			const paneId = layout.workersPaneId;
			if (!paneExists(paneId)) return null;
			const escaped = `cd "${directory}" && export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
			exec(`tmux send-keys -t "${paneId}" '${escaped.replace(/'/g, "'\\''")}' Enter`, 5000);
			exec(`tmux select-pane -t "${paneId}" -T "${name}"`);
			layout.workerPanes.push({ name, paneId, directory });
			return paneId;
		}

		const topPaneId = layout.workerPanes[layout.workerPanes.length - 1].paneId;
		const splitPct = Math.floor(100 / (layout.workerPanes.length + 1));
		const newPaneId = exec(`tmux split-window -v -b -t "${topPaneId}" -c "${directory}" -l ${splitPct}% -P -F '#{pane_id}'`);
		if (!newPaneId) return null;

		exec(`tmux send-keys -t "${newPaneId}" 'export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}' Enter`, 5000);
		exec(`tmux select-pane -t "${newPaneId}" -T "${name}"`);
		layout.workerPanes.push({ name, paneId: newPaneId, directory });
		return newPaneId;
	}

	// ── Widget ──────────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;
		widgetCtx.ui.setWidget("supervisor", (_tui: any, theme: any) => ({
			render(_width: number): string[] {
				const icons: Record<Phase, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH" };
				const colors: Record<Phase, string> = { stopped: "dim", starting: "accent", running: "success", silent: "warning", nudging: "accent", stalled: "error", crashed: "error" };
				const silence = state.lastOutputAt ? `${Math.round((Date.now() - state.lastOutputAt) / 1000)}s ago` : "never";
				const workers = layout.workerPanes.map(w => w.name).join(", ") || "none";
				const lines = [
					theme.fg("accent", theme.bold(" Supervisor")),
					` [${theme.fg(colors[state.phase], icons[state.phase])}] Last output: ${theme.fg("dim", silence)}`,
					` N:${state.nudgeCount}/${config.maxNudgesBeforeRestart} R:${state.restartCount} | Orchy: ${theme.fg("accent", state.orchestratorPhase)} | W: ${theme.fg("dim", workers)}`,
				];
				const last = state.eventLog[state.eventLog.length - 1];
				if (last) lines.push(` ${theme.fg("dim", `${new Date(last.ts).toISOString().slice(11, 19)} ${last.type}: ${last.detail.slice(0, 50)}`)}`);
				return lines;
			},
			invalidate() {},
		}));
	}

	// ════════════════════════════════════════════════════════════════
	// TOOLS (create events, dispatch through reducer)
	// ════════════════════════════════════════════════════════════════

	pi.registerTool({
		name: "supervisor_start",
		label: "Start Orchestrator",
		description: "Start Claude Code in the orchestrator pane and begin heartbeat monitoring.",
		parameters: Type.Object({
			directory: Type.Optional(Type.String({ description: "Working directory override" })),
			initial_prompt: Type.Optional(Type.String({ description: "First prompt after Claude starts" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { directory, initial_prompt } = params as any;
			const dir = directory || layout.orchestratorDir || ctx.cwd;
			layout.orchestratorDir = dir;

			dispatch({
				type: "start",
				directory: dir,
				flags: config.orchestratorFlags,
				helperScript: join(ctx.cwd, "_bmad", "scripts", "pane-workers.sh"),
				now: Date.now(),
			});

			if (initial_prompt) {
				setTimeout(() => {
					const escaped = initial_prompt.replace(/'/g, "'\\''");
					exec(`tmux send-keys -t "${layout.orchestratorPaneId}" '${escaped}' Enter`, 5000);
				}, 15000);
			}

			return {
				content: [{ type: "text", text: `Orchestrator started in ${layout.orchestratorPaneId}. Heartbeat: ${config.heartbeatIntervalMs / 1000}s.${initial_prompt ? ` Initial prompt in 15s.` : ""}` }],
				details: { paneId: layout.orchestratorPaneId, directory: dir },
			};
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_start ")) + theme.fg("accent", (args as any).directory || "default"), 0, 0);
		},
	});

	pi.registerTool({
		name: "supervisor_stop",
		label: "Stop Orchestrator",
		description: "Stop heartbeat. Optionally kill Claude in orchestrator pane.",
		parameters: Type.Object({
			kill: Type.Optional(Type.Boolean({ description: "Kill Claude too (default: false)" })),
		}),
		async execute(_id, params) {
			const { kill } = params as { kill?: boolean };
			dispatch({ type: "stop", kill: !!kill, now: Date.now() });
			return {
				content: [{ type: "text", text: `Stopped. ${kill ? "Claude killed." : "Still running (unmonitored)."}` }],
				details: { killed: !!kill },
			};
		},
	});

	pi.registerTool({
		name: "supervisor_nudge",
		label: "Nudge Orchestrator",
		description: "Send a custom message to the orchestrator. Use for intelligent, context-aware nudging.",
		parameters: Type.Object({
			message: Type.String({ description: "Message to send" }),
		}),
		async execute(_id, params) {
			const { message } = params as { message: string };
			dispatch({ type: "manual_nudge", message, now: Date.now() });
			return {
				content: [{ type: "text", text: `Nudge sent: ${message.slice(0, 100)}` }],
				details: { message },
			};
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("nudge ")) + theme.fg("muted", ((args as any).message || "").slice(0, 50)), 0, 0);
		},
	});

	pi.registerTool({
		name: "supervisor_observe",
		label: "Observe",
		description: "Capture output from orchestrator or a worker pane.",
		parameters: Type.Object({
			lines: Type.Optional(Type.Number({ description: "Lines to capture (default: 50)" })),
			target: Type.Optional(Type.String({ description: "'orchestrator' (default) or worker name" })),
		}),
		async execute(_id, params) {
			const { lines, target } = params as { lines?: number; target?: string };
			let paneId = layout.orchestratorPaneId;
			let name = "orchestrator";

			if (target && target !== "orchestrator") {
				const w = layout.workerPanes.find(wp => wp.name === target);
				if (!w) return { content: [{ type: "text", text: `"${target}" not found. Available: ${layout.workerPanes.map(wp => wp.name).join(", ") || "none"}` }], details: {} };
				paneId = w.paneId;
				name = w.name;
			}

			const output = paneCapture(paneId, lines || 50);
			state.lastCapturedOutput = output;
			return { content: [{ type: "text", text: output || `(no output from ${name})` }], details: { target: name } };
		},
	});

	pi.registerTool({
		name: "supervisor_status",
		label: "Status",
		description: "Full supervisor status with pane layout and event log.",
		parameters: Type.Object({}),
		async execute() {
			const orchAlive = paneExists(layout.orchestratorPaneId);
			const claudeRunning = orchAlive ? paneClaudeRunning(layout.orchestratorPaneId) : false;
			const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : -1;
			const workers = layout.workerPanes.map(w => {
				const alive = paneExists(w.paneId);
				return `  ${w.name}: ${alive ? (paneClaudeRunning(w.paneId) ? "running" : "idle") : "DEAD"} (${w.paneId})`;
			});

			const report = [
				`Phase: ${state.phase}`,
				`Orchestrator: ${layout.orchestratorPaneId} (${orchAlive ? "alive" : "DEAD"}) | Claude: ${claudeRunning ? "running" : "NOT running"}`,
				`Silence: ${silenceSec >= 0 ? `${silenceSec}s` : "never"} | Nudges: ${state.nudgeCount}/${config.maxNudgesBeforeRestart} (total: ${state.totalNudges}) | Restarts: ${state.restartCount}`,
				`Orchestrator phase: ${state.orchestratorPhase} | Started: ${state.startedAt || "never"}`,
				``,
				`Workers (${layout.workerPanes.length}):`,
				...(workers.length > 0 ? workers : ["  none"]),
				``,
				`Last 10 events:`,
				...state.eventLog.slice(-10).map(e => `  ${new Date(e.ts).toISOString().slice(11, 19)} [${e.type}] ${e.detail.slice(0, 60)}`),
			].join("\n");

			return { content: [{ type: "text", text: report }], details: { phase: state.phase, orchAlive, claudeRunning } };
		},
	});

	pi.registerTool({
		name: "supervisor_config",
		label: "Configure",
		description: "Update heartbeat/silence/nudge thresholds.",
		parameters: Type.Object({
			heartbeat_interval_sec: Type.Optional(Type.Number()),
			silence_threshold_sec: Type.Optional(Type.Number()),
			stall_threshold_sec: Type.Optional(Type.Number()),
			max_nudges: Type.Optional(Type.Number()),
			orchestrator_flags: Type.Optional(Type.String()),
		}),
		async execute(_id, params) {
			const p = params as any;
			if (p.heartbeat_interval_sec) config.heartbeatIntervalMs = p.heartbeat_interval_sec * 1000;
			if (p.silence_threshold_sec) config.silenceThresholdMs = p.silence_threshold_sec * 1000;
			if (p.stall_threshold_sec) config.stallThresholdMs = p.stall_threshold_sec * 1000;
			if (p.max_nudges) config.maxNudgesBeforeRestart = p.max_nudges;
			if (p.orchestrator_flags) config.orchestratorFlags = p.orchestrator_flags;

			mkdirSync(join(cwd, "_bmad"), { recursive: true });
			writeFileSync(join(cwd, "_bmad", "supervisor-config.json"), JSON.stringify(config, null, 2));
			if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = setInterval(() => heartbeatProbe(), config.heartbeatIntervalMs); }

			return { content: [{ type: "text", text: `HB: ${config.heartbeatIntervalMs / 1000}s, Silence: ${config.silenceThresholdMs / 1000}s, MaxNudge: ${config.maxNudgesBeforeRestart}` }], details: config };
		},
	});

	pi.registerTool({
		name: "supervisor_spawn_worker",
		label: "Spawn Worker",
		description: "Spawn a worker pane on the right side. First fills right, subsequent stack above.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker name" }),
			directory: Type.String({ description: "Working directory" }),
			flags: Type.Optional(Type.String()),
		}),
		async execute(_id, params) {
			const { name, directory, flags } = params as { name: string; directory: string; flags?: string };
			const f = flags || "--dangerously-skip-permissions";

			if (layout.workerPanes.find(w => w.name === name)) {
				return { content: [{ type: "text", text: `"${name}" already exists.` }], details: { exists: true } };
			}

			const paneId = spawnWorkerPane(name, directory, f);
			if (!paneId) return { content: [{ type: "text", text: `Failed to spawn "${name}".` }], details: { error: true } };

			config.workers[name] = { directory, flags: f };
			mkdirSync(join(cwd, "_bmad"), { recursive: true });
			writeFileSync(join(cwd, "_bmad", "supervisor-config.json"), JSON.stringify(config, null, 2));

			dispatch({ type: "worker_spawned", name, paneId, directory, now: Date.now() });

			return { content: [{ type: "text", text: `Worker "${name}" in ${paneId}. Total: ${layout.workerPanes.length}` }], details: { name, paneId } };
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("spawn ")) + theme.fg("accent", (args as any).name || "?"), 0, 0);
		},
	});

	pi.registerTool({
		name: "supervisor_close_worker",
		label: "Close Worker",
		description: "Kill a worker pane and remove from layout.",
		parameters: Type.Object({ name: Type.String() }),
		async execute(_id, params) {
			const { name } = params as { name: string };
			const idx = layout.workerPanes.findIndex(w => w.name === name);
			if (idx === -1) return { content: [{ type: "text", text: `"${name}" not found.` }], details: { error: true } };

			const w = layout.workerPanes[idx];
			if (paneExists(w.paneId)) {
				for (const key of ["Escape", "C-c", "C-c", "C-c"]) exec(`tmux send-keys -t "${w.paneId}" ${key}`, 5000);
				setTimeout(() => exec(`tmux kill-pane -t "${w.paneId}" 2>/dev/null`), 2000);
			}

			layout.workerPanes.splice(idx, 1);
			delete config.workers[name];
			dispatch({ type: "worker_closed", name, now: Date.now() });

			return { content: [{ type: "text", text: `"${name}" closed. Remaining: ${layout.workerPanes.length}` }], details: { remaining: layout.workerPanes.length } };
		},
	});

	// ════════════════════════════════════════════════════════════════
	// SESSION LIFECYCLE
	// ════════════════════════════════════════════════════════════════

	pi.on("session_start", async (_event, ctx) => {
		widgetCtx = ctx;
		cwd = ctx.cwd;
		loadLayout();
		loadConfig();
		loadState();

		const orchAlive = paneExists(layout.orchestratorPaneId);
		if (state.phase !== "stopped" && orchAlive) {
			heartbeatTimer = setInterval(() => heartbeatProbe(), config.heartbeatIntervalMs);
			state.eventLog.push({ ts: Date.now(), type: "resumed", detail: "Pi restarted, heartbeat resumed" });
		}

		updateWidget();
		ctx.ui.notify(`Supervisor | Orch: ${orchAlive ? "alive" : "not started"} | Phase: ${state.phase}`, "info");
	});

	pi.on("session_before_compact" as any, async () => {
		persistState();
		persistLayout();
	});

	// ── System Prompt ───────────────────────────────

	pi.on("before_agent_start", async () => {
		const workerList = layout.workerPanes.map(w => `  - ${w.name} (${w.paneId}) in ${w.directory}`).join("\n") || "  none";
		return {
			systemPrompt: `You are the L-Thread SUPERVISOR — a meta-orchestrator monitoring Claude Opus.

## ROLE
NOT the orchestrator. You OBSERVE, DECIDE, NUDGE, REPORT, SPAWN.

## PANE LAYOUT
Session: ${layout.session}
- Top-left (you): ${layout.supervisorPaneId}
- Bottom-left (orchestrator): ${layout.orchestratorPaneId}
- Right (workers):
${workerList}

## DETERMINISTIC (TypeScript heartbeat handles automatically)
- Silence detection -> auto-nudge ("continue")
- Crash detection -> auto-restart
- Stall detection -> escalation (3 nudges then restart)

## YOUR INTELLIGENCE (what the LLM is for)
- Understanding WHAT the orchestrator is stuck on
- Composing the RIGHT nudge (context-specific)
- Deciding restart vs nudge vs skip
- Answering user questions

## TOOLS
supervisor_start, supervisor_stop, supervisor_nudge, supervisor_observe, supervisor_status, supervisor_config, supervisor_spawn_worker, supervisor_close_worker`,
		};
	});

	// ── Footer ──────────────────────────────────────

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.setFooter((_tui, theme, _footerData) => ({
			dispose: () => {},
			invalidate() {},
			render(width: number): string[] {
				const model = ctx.model?.id || "?";
				const pct = ctx.getContextUsage()?.percent ?? 0;
				const bar = "#".repeat(Math.round(pct / 10)) + "-".repeat(10 - Math.round(pct / 10));
				const icons: Record<string, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH" };
				const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : 0;
				const left = theme.fg("dim", ` ${model}`) + theme.fg("muted", " | ") + `[${icons[state.phase] || "?"}]` + theme.fg("muted", " | ") + theme.fg("dim", `${silenceSec}s N:${state.nudgeCount} R:${state.restartCount} W:${layout.workerPanes.length}`);
				const right = theme.fg("dim", `[${bar}] ${Math.round(pct)}% `);
				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));
				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});
}
