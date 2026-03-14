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
 * Features:
 *   - Session registry (file-based tracking of all sessions/agents)
 *   - Pause/Resume (interrupt all agents without killing)
 *   - Hard kill on stop (guaranteed process termination)
 *   - Agent activity log (deterministic JSONL audit trail)
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

type Phase = "stopped" | "starting" | "running" | "silent" | "nudging" | "stalled" | "crashed" | "paused";

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
	task: string | null;
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
	task: null,
	eventLog: [],
};

// ── Session Registry ────────────────────────────

interface SessionRegistry {
	version: number;
	session: {
		id: string;
		terminal_session: string;
		launched_at: string;
		status: "active" | "paused" | "stopped";
		task: string | null;
		panes: Record<string, { pane_id: string; pid: number | null }>;
		agents: Array<{
			role: string;
			pane_id: string;
			model: string;
			started_at: string;
			stopped_at: string | null;
			status: "running" | "paused" | "stopped" | "crashed";
		}>;
	} | null;
	history: Array<{
		id: string;
		started_at: string;
		stopped_at: string;
		task: string | null;
		agents_spawned: number;
	}>;
}

const INITIAL_REGISTRY: SessionRegistry = { version: 1, session: null, history: [] };

// ── Events (things that happened) ───────────────

type SupervisorEvent =
	| { type: "heartbeat"; paneAlive: boolean; claudeRunning: boolean; outputHash: string; output: string; now: number }
	| { type: "start"; directory: string; flags: string; helperScript: string; task: string | null; now: number }
	| { type: "stop"; kill: boolean; now: number }
	| { type: "pause"; now: number }
	| { type: "resume"; message?: string; now: number }
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
	| { type: "persist_registry" }
	| { type: "log_devlog"; entry: string }
	| { type: "log_activity"; event: string; details: any }
	| { type: "notify"; message: string }
	| { type: "update_widget" }
	| { type: "hard_kill"; paneId: string; delayMs: number }
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
				if (s.phase !== "stopped" && s.phase !== "crashed" && s.phase !== "paused") {
					transition("crashed", "orchestrator pane disappeared");
					fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] CRASH DETECTED\n- Pane gone — layout destroyed` });
					fx.push({ type: "log_activity", event: "orchestrator_crashed", details: { reason: "pane_disappeared" } });
					fx.push({ type: "persist_registry" });
				}
				break;
			}

			// 2. Claude dead?
			if (!claudeRunning) {
				if (s.phase === "running" || s.phase === "silent") {
					transition("crashed", "claude process died");
					fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] CLAUDE DIED — restarting` });
					fx.push({ type: "log_activity", event: "orchestrator_crashed", details: { reason: "process_died" } });
					fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: `export ORCHY_SESSION_NAME=orchestrator && unset CLAUDECODE && claude ${config.orchestratorFlags}` });
					s.restartCount++;
					s.totalRestarts++;
					fx.push({ type: "persist_registry" });
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
			s.task = event.task;
			transition("starting", "orchestrator spawned");
			fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: `cd "${event.directory}" && export ORCHY_SESSION_NAME=orchestrator && export PANE_HELPERS="${event.helperScript}" && unset CLAUDECODE && claude ${event.flags}` });
			fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (running)" });
			fx.push({ type: "start_heartbeat" });
			fx.push({ type: "log_devlog", entry: `### [${new Date(event.now).toISOString()}] ORCHESTRATOR STARTED\n- Dir: ${event.directory}\n- Flags: ${event.flags}\n- Task: ${(event.task || "none").slice(0, 100)}` });
			fx.push({ type: "log_activity", event: "orchestrator_started", details: { directory: event.directory, task: event.task } });
			fx.push({ type: "persist_registry" });
			break;
		}

		// ── STOP ────────────────────────────────────────

		case "stop": {
			transition("stopped", event.kill ? "killed by supervisor" : "monitoring stopped");
			fx.push({ type: "stop_heartbeat" });
			if (event.kill) {
				// Polite interrupt first
				fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["Escape", "C-c", "C-c", "C-c"] });
				// Hard kill after 3s if still alive (INC-007 fix)
				fx.push({ type: "hard_kill", paneId: layout.orchestratorPaneId, delayMs: 3000 });
				fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (stopped)" });
				// Also kill all workers
				for (const w of layout.workerPanes) {
					fx.push({ type: "send_control", paneId: w.paneId, keys: ["Escape", "C-c", "C-c", "C-c"] });
					fx.push({ type: "hard_kill", paneId: w.paneId, delayMs: 3000 });
				}
			}
			fx.push({ type: "log_activity", event: "stopped", details: { kill: event.kill, task: s.task } });
			fx.push({ type: "persist_registry" });
			fx.push({ type: "persist_state" });
			break;
		}

		// ── PAUSE ───────────────────────────────────────

		case "pause": {
			if (s.phase === "running" || s.phase === "silent" || s.phase === "nudging" || s.phase === "starting") {
				const prevPhase = s.phase;
				transition("paused", "user paused all agents");
				fx.push({ type: "stop_heartbeat" });
				// Interrupt orchestrator (Escape interrupts Claude Code without killing)
				fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["Escape"] });
				fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (paused)" });
				// Interrupt all workers
				for (const w of layout.workerPanes) {
					fx.push({ type: "send_control", paneId: w.paneId, keys: ["Escape"] });
					fx.push({ type: "set_pane_title", paneId: w.paneId, title: `${w.name} (paused)` });
				}
				fx.push({ type: "log_activity", event: "paused", details: { phase_before: prevPhase, workers_paused: layout.workerPanes.length } });
				fx.push({ type: "persist_registry" });
			}
			break;
		}

		// ── RESUME ──────────────────────────────────────

		case "resume": {
			if (s.phase === "paused") {
				transition("running", "user resumed");
				s.lastOutputAt = event.now; // Reset silence timer so it doesn't immediately nudge
				s.nudgeCount = 0;
				fx.push({ type: "start_heartbeat" });
				// Send continue to orchestrator
				fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: event.message || "continue" });
				fx.push({ type: "set_pane_title", paneId: layout.orchestratorPaneId, title: "Orchestrator (running)" });
				// Resume all workers
				for (const w of layout.workerPanes) {
					fx.push({ type: "send_keys", paneId: w.paneId, text: "continue" });
					fx.push({ type: "set_pane_title", paneId: w.paneId, title: w.name });
				}
				fx.push({ type: "log_activity", event: "resumed", details: { workers_resumed: layout.workerPanes.length } });
				fx.push({ type: "persist_registry" });
			}
			break;
		}

		// ── MANUAL NUDGE ────────────────────────────────

		case "manual_nudge": {
			s.totalNudges++;
			log(`manual nudge: ${event.message.slice(0, 60)}`);
			// Defensive: exit copy mode before sending (INC-005 fix)
			fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["q"] });
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
				fx.push({ type: "log_activity", event: "orchestrator_restarted", details: { restartCount: s.restartCount } });
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
			fx.push({ type: "log_activity", event: "worker_spawned", details: { name: event.name, paneId: event.paneId, directory: event.directory } });
			fx.push({ type: "persist_state" });
			fx.push({ type: "persist_layout" });
			fx.push({ type: "persist_registry" });
			fx.push({ type: "update_widget" });
			break;
		}

		case "worker_closed": {
			log(`worker ${event.name} closed`);
			fx.push({ type: "log_activity", event: "worker_closed", details: { name: event.name } });
			fx.push({ type: "persist_state" });
			fx.push({ type: "persist_layout" });
			fx.push({ type: "persist_registry" });
			fx.push({ type: "update_widget" });
			break;
		}
	}

	return [s, fx];
}

// ════════════════════════════════════════════════════════════════════
// CMUX I/O (impure helpers — only called by the effect executor)
// ════════════════════════════════════════════════════════════════════
// Migrated from tmux to cmux CLI (manaflow-ai/cmux).
// cmux CLI is auto-available inside cmux terminals via PATH injection.
// All commands auto-detect workspace/surface from CMUX_* env vars.
// Surface IDs use short refs (surface:N) — stable within a cmux session.

function exec(cmd: string, timeout = 10000): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout, stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return "";
	}
}

function paneExists(paneId: string): boolean {
	if (!paneId) return false;
	// cmux identify exits non-zero if surface doesn't exist
	const result = exec(`cmux identify --surface "${paneId}" 2>/dev/null`);
	return result !== "";
}

function paneClaudeRunning(paneId: string): boolean {
	// cmux doesn't expose #{pane_current_command} directly.
	// Screen-scrape last lines for Claude Code UI indicators.
	const output = exec(`cmux read-screen --surface "${paneId}" --lines 8 2>/dev/null`, 5000);
	if (!output) return false;
	return /[✓◆❯]|claude>|╭─|│ >|Thinking|Tool |⏺|waiting for|permission/i.test(output);
}

function paneCapture(paneId: string, lines = 30): string {
	// cmux read-screen returns clean text (no ANSI stripping needed)
	return exec(`cmux read-screen --surface "${paneId}" --lines ${lines} 2>/dev/null`, 5000);
}

function panePid(paneId: string): number | null {
	// cmux doesn't directly expose shell PIDs per surface.
	// Return null — hard_kill uses findClaudePid() instead.
	return null;
}

/** Find PID of a running claude/node process for a given session name */
function findClaudePid(sessionName: string): number | null {
	const pids = exec(`pgrep -f "ORCHY_SESSION_NAME=${sessionName}" 2>/dev/null`);
	if (!pids) return null;
	for (const pid of pids.split("\n").filter(Boolean)) {
		const children = exec(`pgrep -P ${pid} 2>/dev/null`);
		if (children) {
			for (const cpid of children.split("\n").filter(Boolean)) {
				const cmd = exec(`ps -p ${cpid} -o comm= 2>/dev/null`);
				if (cmd.includes("claude") || cmd.includes("node")) return parseInt(cpid, 10);
			}
		}
	}
	return null;
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
	let registry: SessionRegistry = { ...INITIAL_REGISTRY };
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
					// cmux send takes raw text — no shell escaping needed
					// No INC-005 copy-mode workaround — cmux has no scroll/copy mode
					const escaped = fx.text.replace(/'/g, "'\\''");
					exec(`cmux send --surface "${fx.paneId}" '${escaped}' 2>/dev/null`, 5000);
					break;
				}
				case "send_control":
					for (const key of fx.keys) {
						// Skip "q" — was tmux copy-mode exit (INC-005), meaningless in cmux
						if (key === "q") continue;
						// Map tmux key names to cmux: C-c → ctrl+c, Escape → escape
						const cmuxKey = key === "C-c" ? "ctrl+c" : key.toLowerCase();
						exec(`cmux send-key --surface "${fx.paneId}" "${cmuxKey}" 2>/dev/null`, 5000);
					}
					break;
				case "set_pane_title":
					exec(`cmux rename-tab --surface "${fx.paneId}" "${fx.title}" 2>/dev/null`);
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
				case "persist_registry":
					persistRegistry();
					break;
				case "log_devlog":
					writeDevlog(fx.entry);
					break;
				case "log_activity":
					logActivity(fx.event, fx.details);
					break;
				case "notify":
					widgetCtx?.ui.notify(`Supervisor: ${fx.message}`, "info");
					break;
				case "update_widget":
					updateWidget();
					break;
				case "hard_kill": {
					const targetPane = fx.paneId;
					const delay = fx.delayMs;
					setTimeout(() => {
						// Find claude/node process by session name marker
						// cmux doesn't expose per-surface PIDs, so we use ORCHY_SESSION_NAME
						const workerEntry = layout.workerPanes.find(w => w.paneId === targetPane);
						const sessionName = targetPane === layout.orchestratorPaneId ? "orchestrator" : workerEntry?.name || "";
						if (sessionName) {
							const claudePid = findClaudePid(sessionName);
							if (claudePid) {
								exec(`kill -9 ${claudePid} 2>/dev/null`);
								logActivity("hard_kill_applied", { paneId: targetPane, pid: claudePid, sessionName });
							}
						}
						// Also close the cmux surface if still alive
						exec(`cmux close-surface --surface "${targetPane}" 2>/dev/null`);
					}, delay);
					break;
				}
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

	// ── Session Registry Persistence ────────────────

	function persistRegistry(): void {
		const dir = join(cwd, "_bmad");
		mkdirSync(dir, { recursive: true });

		// Build fresh pane PID snapshot
		const panes: Record<string, { pane_id: string; pid: number | null }> = {};
		if (layout.supervisorPaneId) panes.supervisor = { pane_id: layout.supervisorPaneId, pid: panePid(layout.supervisorPaneId) };
		if (layout.orchestratorPaneId) panes.orchestrator = { pane_id: layout.orchestratorPaneId, pid: panePid(layout.orchestratorPaneId) };
		if (layout.workersPaneId) panes.workers_base = { pane_id: layout.workersPaneId, pid: panePid(layout.workersPaneId) };
		for (const w of layout.workerPanes) {
			panes[`worker_${w.name}`] = { pane_id: w.paneId, pid: panePid(w.paneId) };
		}

		// Build agents list
		const agents: Array<{ role: string; pane_id: string; model: string; started_at: string; stopped_at: string | null; status: string }> = [];
		// Supervisor agent (Pi itself)
		agents.push({
			role: "supervisor",
			pane_id: layout.supervisorPaneId,
			model: widgetCtx?.model?.id || "unknown",
			started_at: state.startedAt || new Date().toISOString(),
			stopped_at: state.phase === "stopped" ? new Date().toISOString() : null,
			status: state.phase === "stopped" ? "stopped" : state.phase === "paused" ? "paused" : state.phase === "crashed" ? "crashed" : "running",
		});
		// Orchestrator agent (Claude Code)
		if (state.phase !== "stopped" || state.startedAt) {
			agents.push({
				role: "orchestrator",
				pane_id: layout.orchestratorPaneId,
				model: "claude-opus-4-6",
				started_at: state.startedAt || new Date().toISOString(),
				stopped_at: state.phase === "stopped" ? new Date().toISOString() : null,
				status: state.phase === "stopped" ? "stopped" : state.phase === "paused" ? "paused" : state.phase === "crashed" ? "crashed" : "running",
			});
		}
		// Worker agents
		for (const w of layout.workerPanes) {
			agents.push({
				role: `worker:${w.name}`,
				pane_id: w.paneId,
				model: "claude-opus-4-6",
				started_at: new Date().toISOString(),
				stopped_at: null,
				status: state.phase === "paused" ? "paused" : "running",
			});
		}

		// Map supervisor phase to registry status
		const statusMap: Record<Phase, "active" | "paused" | "stopped"> = {
			stopped: "stopped", starting: "active", running: "active",
			silent: "active", nudging: "active", stalled: "active",
			crashed: "stopped", paused: "paused",
		};

		// If session existed before, preserve id and launched_at
		const prevSession = registry.session;
		registry.session = {
			id: prevSession?.id || `${layout.session}-${Date.now().toString(36)}`,
			terminal_session: layout.session,
			launched_at: prevSession?.launched_at || new Date().toISOString(),
			status: statusMap[state.phase],
			task: state.task,
			panes,
			agents,
		};

		writeFileSync(join(dir, "session-registry.json"), JSON.stringify(registry, null, 2));
	}

	function loadRegistry(): void {
		const p = join(cwd, "_bmad", "session-registry.json");
		if (existsSync(p)) {
			try { registry = { ...INITIAL_REGISTRY, ...JSON.parse(readFileSync(p, "utf-8")) }; } catch {}
		}
	}

	// ── Agent Activity Log (deterministic JSONL) ────

	function logActivity(event: string, details: any): void {
		const entry = {
			ts: new Date().toISOString(),
			epoch: Date.now(),
			session: layout.session,
			session_id: registry.session?.id || "unknown",
			event,
			phase: state.phase,
			task: state.task,
			...details,
		};

		const dir = join(cwd, "_bmad");
		mkdirSync(dir, { recursive: true });
		appendFileSync(join(dir, "agent-activity.jsonl"), JSON.stringify(entry) + "\n");

		// Also log through telemetry if available
		const tlog = (globalThis as any).__telemetry_log;
		if (tlog) tlog("activity", event, details);
	}

	// ── Worker Pane Spawning (I/O) ──────────────────

	function spawnWorkerPane(name: string, directory: string, flags: string): string | null {
		if (layout.workerPanes.length === 0) {
			const paneId = layout.workersPaneId;
			if (!paneExists(paneId)) return null;
			const cmd = `cd "${directory}" && export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
			const escaped = cmd.replace(/'/g, "'\\''");
			exec(`cmux send --surface "${paneId}" '${escaped}' 2>/dev/null`, 5000);
			exec(`cmux rename-tab --surface "${paneId}" "${name}" 2>/dev/null`);
			layout.workerPanes.push({ name, paneId, directory });
			return paneId;
		}

		// Split above the last worker (cmux new-split up)
		const topPaneId = layout.workerPanes[layout.workerPanes.length - 1].paneId;
		const newPaneId = exec(`cmux new-split up --surface "${topPaneId}" 2>/dev/null`);
		if (!newPaneId) return null;

		const cmd = `cd "${directory}" && export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
		const escaped = cmd.replace(/'/g, "'\\''");
		exec(`cmux send --surface "${newPaneId}" '${escaped}' 2>/dev/null`, 5000);
		exec(`cmux rename-tab --surface "${newPaneId}" "${name}" 2>/dev/null`);
		layout.workerPanes.push({ name, paneId: newPaneId, directory });
		return newPaneId;
	}

	// ── Widget ──────────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;
		widgetCtx.ui.setWidget("supervisor", (_tui: any, theme: any) => ({
			render(_width: number): string[] {
				const icons: Record<Phase, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH", paused: "PAUSE" };
				const colors: Record<Phase, string> = { stopped: "dim", starting: "accent", running: "success", silent: "warning", nudging: "accent", stalled: "error", crashed: "error", paused: "warning" };
				const silence = state.lastOutputAt ? `${Math.round((Date.now() - state.lastOutputAt) / 1000)}s ago` : "never";
				const workers = layout.workerPanes.map(w => w.name).join(", ") || "none";
				const lines = [
					theme.fg("accent", theme.bold(" Supervisor")),
					` [${theme.fg(colors[state.phase], icons[state.phase])}] Last output: ${theme.fg("dim", silence)}`,
					` N:${state.nudgeCount}/${config.maxNudgesBeforeRestart} R:${state.restartCount} | Orchy: ${theme.fg("accent", state.orchestratorPhase)} | W: ${theme.fg("dim", workers)}`,
				];

				// Show task from registry
				if (state.task) {
					lines.push(` Task: ${theme.fg("accent", state.task.slice(0, 60))}`);
				}

				// Show session ID from registry
				if (registry.session) {
					lines.push(` Session: ${theme.fg("dim", registry.session.id)} | ${theme.fg(
						registry.session.status === "active" ? "success" : registry.session.status === "paused" ? "warning" : "dim",
						registry.session.status.toUpperCase()
					)}`);
				}

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
			task: Type.Optional(Type.String({ description: "Task description (shown in TUI)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { directory, initial_prompt, task } = params as any;
			const dir = directory || layout.orchestratorDir || ctx.cwd;
			layout.orchestratorDir = dir;

			// Extract task from initial_prompt if not explicitly provided
			const taskDesc = task || (initial_prompt ? initial_prompt.slice(0, 120) : null);

			dispatch({
				type: "start",
				directory: dir,
				flags: config.orchestratorFlags,
				helperScript: join(ctx.cwd, "_bmad", "scripts", "pane-workers.sh"),
				task: taskDesc,
				now: Date.now(),
			});

			if (initial_prompt) {
				setTimeout(() => {
					const escaped = initial_prompt.replace(/'/g, "'\\''");
					exec(`cmux send --surface "${layout.orchestratorPaneId}" '${escaped}' 2>/dev/null`, 5000);
				}, 15000);
			}

			return {
				content: [{ type: "text", text: `Orchestrator started in ${layout.orchestratorPaneId}. Heartbeat: ${config.heartbeatIntervalMs / 1000}s.${initial_prompt ? ` Initial prompt in 15s.` : ""}\nTask: ${taskDesc || "none"}` }],
				details: { paneId: layout.orchestratorPaneId, directory: dir, task: taskDesc },
			};
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_start ")) + theme.fg("accent", (args as any).directory || "default"), 0, 0);
		},
	});

	pi.registerTool({
		name: "supervisor_stop",
		label: "Stop Orchestrator",
		description: "Stop heartbeat and kill Claude in orchestrator pane + all workers. Hard-kills after 3s if polite interrupt fails.",
		parameters: Type.Object({
			kill: Type.Optional(Type.Boolean({ description: "Kill Claude too (default: true)" })),
		}),
		async execute(_id, params) {
			const { kill } = params as { kill?: boolean };
			const doKill = kill !== false; // Default to true (changed from false)
			dispatch({ type: "stop", kill: doKill, now: Date.now() });
			return {
				content: [{ type: "text", text: `Stopped. ${doKill ? "Claude killed (hard-kill in 3s if needed)." : "Still running (unmonitored)."}` }],
				details: { killed: doKill },
			};
		},
	});

	pi.registerTool({
		name: "supervisor_pause",
		label: "Pause All",
		description: "Pause all agents (orchestrator + workers). Sends Escape to interrupt without killing. Resume with supervisor_resume.",
		parameters: Type.Object({}),
		async execute() {
			if (state.phase === "paused") {
				return { content: [{ type: "text", text: "Already paused." }], details: { already: true } };
			}
			if (state.phase === "stopped") {
				return { content: [{ type: "text", text: "Nothing running to pause." }], details: { nothing: true } };
			}

			dispatch({ type: "pause", now: Date.now() });

			const paused = 1 + layout.workerPanes.length; // orchestrator + workers
			return {
				content: [{ type: "text", text: `Paused ${paused} agent(s). Heartbeat stopped. Use supervisor_resume to continue.` }],
				details: { agentsPaused: paused },
			};
		},
		renderCall(_args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_pause")), 0, 0);
		},
	});

	pi.registerTool({
		name: "supervisor_resume",
		label: "Resume All",
		description: "Resume all paused agents. Sends 'continue' to orchestrator and all workers. Restarts heartbeat.",
		parameters: Type.Object({
			message: Type.Optional(Type.String({ description: "Custom resume message (default: 'continue')" })),
		}),
		async execute(_id, params) {
			const { message } = params as { message?: string };
			if (state.phase !== "paused") {
				return { content: [{ type: "text", text: `Not paused (phase: ${state.phase}). Nothing to resume.` }], details: { notPaused: true } };
			}

			dispatch({ type: "resume", message, now: Date.now() });

			const resumed = 1 + layout.workerPanes.length;
			return {
				content: [{ type: "text", text: `Resumed ${resumed} agent(s). Heartbeat restarted. Message: "${message || "continue"}"` }],
				details: { agentsResumed: resumed },
			};
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_resume ")) + theme.fg("muted", (args as any).message || "continue"), 0, 0);
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
		description: "Full supervisor status with pane layout, registry, and event log.",
		parameters: Type.Object({}),
		async execute() {
			const orchAlive = paneExists(layout.orchestratorPaneId);
			const claudeRunning = orchAlive ? paneClaudeRunning(layout.orchestratorPaneId) : false;
			const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : -1;
			const workers = layout.workerPanes.map(w => {
				const alive = paneExists(w.paneId);
				return `  ${w.name}: ${alive ? (paneClaudeRunning(w.paneId) ? "running" : "idle") : "DEAD"} (${w.paneId})`;
			});

			// Registry info
			const reg = registry.session;
			const regInfo = reg ? [
				`Session: ${reg.id} | Status: ${reg.status}`,
				`Task: ${reg.task || "none"}`,
				`Agents: ${reg.agents.map(a => `${a.role}[${a.status}]`).join(", ")}`,
			] : ["Session: none"];

			const report = [
				`Phase: ${state.phase}`,
				`Orchestrator: ${layout.orchestratorPaneId} (${orchAlive ? "alive" : "DEAD"}) | Claude: ${claudeRunning ? "running" : "NOT running"}`,
				`Silence: ${silenceSec >= 0 ? `${silenceSec}s` : "never"} | Nudges: ${state.nudgeCount}/${config.maxNudgesBeforeRestart} (total: ${state.totalNudges}) | Restarts: ${state.restartCount}`,
				`Orchestrator phase: ${state.orchestratorPhase} | Started: ${state.startedAt || "never"}`,
				``,
				`Registry:`,
				...regInfo.map(l => `  ${l}`),
				``,
				`Workers (${layout.workerPanes.length}):`,
				...(workers.length > 0 ? workers : ["  none"]),
				``,
				`Last 10 events:`,
				...state.eventLog.slice(-10).map(e => `  ${new Date(e.ts).toISOString().slice(11, 19)} [${e.type}] ${e.detail.slice(0, 60)}`),
			].join("\n");

			return { content: [{ type: "text", text: report }], details: { phase: state.phase, orchAlive, claudeRunning, registry: reg } };
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
				for (const key of ["escape", "ctrl+c", "ctrl+c", "ctrl+c"]) exec(`cmux send-key --surface "${w.paneId}" "${key}" 2>/dev/null`, 5000);
				setTimeout(() => exec(`cmux close-surface --surface "${w.paneId}" 2>/dev/null`), 2000);
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
		loadRegistry();

		const orchAlive = paneExists(layout.orchestratorPaneId);
		if (state.phase !== "stopped" && orchAlive) {
			heartbeatTimer = setInterval(() => heartbeatProbe(), config.heartbeatIntervalMs);
			state.eventLog.push({ ts: Date.now(), type: "resumed", detail: "Pi restarted, heartbeat resumed" });
		}

		// Log session start to activity log
		logActivity("supervisor_session_start", {
			model: ctx.model?.id,
			orchestratorAlive: orchAlive,
			phase: state.phase,
			registrySession: registry.session?.id || null,
		});

		// Persist registry on startup
		persistRegistry();

		updateWidget();
		ctx.ui.notify(`Supervisor | Orch: ${orchAlive ? "alive" : "not started"} | Phase: ${state.phase}`, "info");
	});

	pi.on("session_before_compact" as any, async () => {
		persistState();
		persistLayout();
		persistRegistry();
	});

	// ── System Prompt ───────────────────────────────

	pi.on("before_agent_start", async () => {
		const workerList = layout.workerPanes.map(w => `  - ${w.name} (${w.paneId}) in ${w.directory}`).join("\n") || "  none";
		const regInfo = registry.session
			? `Session: ${registry.session.id} | Status: ${registry.session.status} | Task: ${registry.session.task || "none"}`
			: "No active session";

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

## SESSION REGISTRY
${regInfo}

## DETERMINISTIC (TypeScript heartbeat handles automatically)
- Silence detection -> auto-nudge ("continue")
- Crash detection -> auto-restart
- Stall detection -> escalation (3 nudges then restart)
- cmux has no copy/scroll mode — INC-005 workaround removed
- Hard kill on stop -> polite C-c then kill -9 after 3s (INC-007)

## PAUSE/RESUME
- supervisor_pause: Interrupts ALL agents (Escape), stops heartbeat. Safe pause.
- supervisor_resume: Sends "continue" to ALL agents, restarts heartbeat.

## YOUR INTELLIGENCE (what the LLM is for)
- Understanding WHAT the orchestrator is stuck on
- Composing the RIGHT nudge (context-specific)
- Deciding restart vs nudge vs skip
- Answering user questions

## CRITICAL: FIRST ACTION
When you receive a task, call supervisor_start IMMEDIATELY with the task as initial_prompt.
Do NOT analyze docs first. The orchestrator will read its own docs.

## TOOLS
supervisor_start, supervisor_stop, supervisor_pause, supervisor_resume, supervisor_nudge, supervisor_observe, supervisor_status, supervisor_config, supervisor_spawn_worker, supervisor_close_worker`,
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
				const icons: Record<string, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH", paused: "PAUSE" };
				const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : 0;

				// Compact task display
				const taskStr = state.task ? ` | ${state.task.slice(0, 30)}` : "";

				const left = theme.fg("dim", ` ${model}`) + theme.fg("muted", " | ") + `[${icons[state.phase] || "?"}]` + theme.fg("muted", " | ") + theme.fg("dim", `${silenceSec}s N:${state.nudgeCount} R:${state.restartCount} W:${layout.workerPanes.length}`) + theme.fg("accent", taskStr);
				const right = theme.fg("dim", `[${bar}] ${Math.round(pct)}% `);
				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));
				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});
}
