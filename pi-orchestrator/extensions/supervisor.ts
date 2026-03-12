/**
 * Supervisor — Deterministic Harness for L-Thread Orchestrator
 *
 * Pi's LLM is NOT the orchestrator. It's the SUPERVISOR of the orchestrator.
 * The orchestrator is Claude Opus running in a tmux session.
 *
 * This extension provides:
 *   1. Deterministic state machine (TypeScript, not LLM decisions)
 *   2. Heartbeat monitoring (detects stalls, auto-nudges)
 *   3. Health checks (session alive, claude running, latch state)
 *   4. Auto-restart on crash/stall
 *   5. Configurable nudge model (swap between Opus/Codex/Haiku at runtime)
 *
 * Architecture:
 *   Pi (Haiku/Sonnet — cheap) ──deterministic TypeScript──> Claude Opus Orchestrator (tmux)
 *                                                                └──> Claude Code Workers (tmux)
 *
 * The Pi LLM's role is ONLY:
 *   - Interpreting captured output to decide IF a nudge is needed
 *   - Composing intelligent nudge messages
 *   - Answering the user's questions about orchestrator state
 *
 * Everything else (monitoring, timing, state transitions, restarts) is
 * deterministic TypeScript running in extension hooks.
 *
 * Usage: pi -e extensions/supervisor.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { Text } from "@mariozechner/pi-tui";
import { execSync, spawn as cpSpawn } from "child_process";
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";

// ════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════

interface SupervisorConfig {
	// Orchestrator session
	orchestratorSession: string;
	orchestratorDir: string;
	orchestratorFlags: string;

	// Heartbeat
	heartbeatIntervalMs: number;    // How often to check (default: 30s)
	silenceThresholdMs: number;     // Max silence before nudge (default: 120s)
	stallThresholdMs: number;       // Max time on same phase before escalation (default: 600s)
	maxNudgesBeforeRestart: number; // Auto-restart after N nudges (default: 3)

	// Worker sessions (pre-configured)
	workers: Record<string, { directory: string; flags?: string }>;
}

const DEFAULT_CONFIG: SupervisorConfig = {
	orchestratorSession: "orchy",
	orchestratorDir: "",  // Set from cwd
	orchestratorFlags: "--dangerously-skip-permissions",

	heartbeatIntervalMs: 30_000,
	silenceThresholdMs: 120_000,
	stallThresholdMs: 600_000,
	maxNudgesBeforeRestart: 3,

	workers: {},
};

// ════════════════════════════════════════════════════════════════════
// STATE MACHINE (100% deterministic — no LLM involved)
// ════════════════════════════════════════════════════════════════════

type SupervisorPhase =
	| "stopped"           // Not running
	| "starting"          // Spawning orchestrator session
	| "running"           // Orchestrator is active and responsive
	| "silent"            // No output for > silenceThreshold
	| "nudging"           // Sending a nudge to the orchestrator
	| "stalled"           // Nudges haven't helped, escalating
	| "restarting"        // Killing and restarting orchestrator
	| "crashed";          // Session died unexpectedly

interface SupervisorState {
	phase: SupervisorPhase;
	startedAt: string | null;
	lastOutputHash: string;
	lastOutputAt: number;       // epoch ms
	lastPhaseChangeAt: number;
	nudgeCount: number;
	restartCount: number;
	totalNudges: number;
	totalRestarts: number;
	lastCapturedOutput: string;
	orchestratorPhase: string;  // What the orchestrator reports as its phase
	events: Array<{ ts: string; event: string; detail: string }>;
}

const INITIAL_STATE: SupervisorState = {
	phase: "stopped",
	startedAt: null,
	lastOutputHash: "",
	lastOutputAt: 0,
	lastPhaseChangeAt: Date.now(),
	nudgeCount: 0,
	restartCount: 0,
	totalNudges: 0,
	totalRestarts: 0,
	lastCapturedOutput: "",
	orchestratorPhase: "unknown",
	events: [],
};

// ════════════════════════════════════════════════════════════════════
// HELPERS (pure functions, no side effects)
// ════════════════════════════════════════════════════════════════════

function exec(cmd: string, timeout = 10000): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout, stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return "";
	}
}

function tmuxExists(session: string): boolean {
	return exec(`tmux has-session -t "${session}" 2>/dev/null && echo yes`) === "yes";
}

function tmuxClaudeRunning(session: string): boolean {
	const cmd = exec(`tmux list-panes -t "${session}" -F '#{pane_current_command}' 2>/dev/null`);
	return cmd.includes("claude") || cmd.includes("node");
}

function tmuxCapture(session: string, lines = 30): string {
	return exec(`tmux capture-pane -t "${session}" -p -S -${lines}`, 5000);
}

function tmuxSendKeys(session: string, text: string): void {
	const escaped = text.replace(/'/g, "'\\''");
	exec(`tmux send-keys -t "${session}" '${escaped}' Enter`, 5000);
}

function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return hash.toString(36);
}

function latchPath(session: string): string {
	return `/tmp/orchy-${session}.latch`;
}

// ════════════════════════════════════════════════════════════════════
// EXTENSION
// ════════════════════════════════════════════════════════════════════

export default function (pi: ExtensionAPI) {
	let config: SupervisorConfig = { ...DEFAULT_CONFIG };
	let state: SupervisorState = { ...INITIAL_STATE };
	let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
	let widgetCtx: any = null;

	// ── State Persistence ────────────────────────

	function persistState(cwd: string): void {
		const statePath = join(cwd, "_bmad", "supervisor-state.json");
		mkdirSync(join(cwd, "_bmad"), { recursive: true });
		// Keep only last 50 events to prevent unbounded growth
		const trimmed = { ...state, events: state.events.slice(-50) };
		writeFileSync(statePath, JSON.stringify(trimmed, null, 2));
		pi.appendEntry("supervisor-state", trimmed);
	}

	function loadState(cwd: string): void {
		const statePath = join(cwd, "_bmad", "supervisor-state.json");
		if (existsSync(statePath)) {
			try {
				const loaded = JSON.parse(readFileSync(statePath, "utf-8"));
				state = { ...INITIAL_STATE, ...loaded };
			} catch {}
		}
	}

	function loadConfig(cwd: string): void {
		const configPath = join(cwd, "_bmad", "supervisor-config.json");
		if (existsSync(configPath)) {
			try {
				const loaded = JSON.parse(readFileSync(configPath, "utf-8"));
				config = { ...DEFAULT_CONFIG, ...loaded };
			} catch {}
		}
		if (!config.orchestratorDir) {
			config.orchestratorDir = cwd;
		}
	}

	function logEvent(event: string, detail: string): void {
		state.events.push({ ts: new Date().toISOString(), event, detail });
	}

	function logDevlog(cwd: string, entry: string): void {
		const devlogPath = join(cwd, ".bmad", "devlog.md");
		mkdirSync(join(cwd, ".bmad"), { recursive: true });
		if (!existsSync(devlogPath)) {
			writeFileSync(devlogPath, "# Supervisor Devlog\n\n");
		}
		appendFileSync(devlogPath, `\n${entry}\n`);
	}

	// ── Phase Transitions (deterministic) ────────

	function transition(newPhase: SupervisorPhase, reason: string, cwd: string): void {
		const oldPhase = state.phase;
		if (oldPhase === newPhase) return;

		state.phase = newPhase;
		state.lastPhaseChangeAt = Date.now();
		logEvent("phase_change", `${oldPhase} -> ${newPhase}: ${reason}`);
		persistState(cwd);
		updateWidget();

		if (widgetCtx) {
			widgetCtx.ui.notify(`Supervisor: ${oldPhase} -> ${newPhase} (${reason})`, "info");
		}
	}

	// ── Heartbeat (the deterministic core) ───────

	function startHeartbeat(cwd: string): void {
		if (heartbeatTimer) clearInterval(heartbeatTimer);

		heartbeatTimer = setInterval(() => {
			heartbeatTick(cwd);
		}, config.heartbeatIntervalMs);
	}

	function stopHeartbeat(): void {
		if (heartbeatTimer) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
	}

	function heartbeatTick(cwd: string): void {
		const session = config.orchestratorSession;

		// 1. Session alive?
		if (!tmuxExists(session)) {
			if (state.phase !== "stopped" && state.phase !== "crashed") {
				transition("crashed", "tmux session disappeared", cwd);
				logDevlog(cwd, `### [${new Date().toISOString()}] CRASH DETECTED\n- Session: ${session}\n- Previous phase: ${state.phase}\n- Will auto-restart`);
				state.restartCount++;
				state.totalRestarts++;
				// Auto-restart
				spawnOrchestrator(cwd);
			}
			return;
		}

		// 2. Claude running?
		if (!tmuxClaudeRunning(session)) {
			if (state.phase === "running" || state.phase === "silent") {
				transition("crashed", "claude process not found in session", cwd);
				logDevlog(cwd, `### [${new Date().toISOString()}] CLAUDE DIED\n- Session: ${session}\n- Restarting claude...`);
				// Restart Claude in existing session
				exec(`tmux send-keys -t "${session}" "export ORCHY_SESSION_NAME=${session} && unset CLAUDECODE && claude ${config.orchestratorFlags}" Enter`);
				state.restartCount++;
				state.totalRestarts++;
				setTimeout(() => {
					if (state.phase === "crashed") {
						transition("running", "claude restarted", cwd);
						state.nudgeCount = 0;
					}
				}, 15000);
			}
			return;
		}

		// 3. Check for new output
		const output = tmuxCapture(session, 20);
		const hash = simpleHash(output);

		if (hash !== state.lastOutputHash) {
			// New output detected
			state.lastOutputHash = hash;
			state.lastOutputAt = Date.now();
			state.lastCapturedOutput = output;
			state.nudgeCount = 0;  // Reset nudge counter on activity

			if (state.phase === "silent" || state.phase === "nudging" || state.phase === "stalled") {
				transition("running", "output detected after silence", cwd);
			} else if (state.phase === "starting") {
				transition("running", "first output detected", cwd);
			}

			// Try to detect orchestrator's phase from output
			const phaseMatch = output.match(/phase[=:]\s*["']?(\w+)/i);
			if (phaseMatch) {
				state.orchestratorPhase = phaseMatch[1];
			}

			persistState(cwd);
			updateWidget();
			return;
		}

		// 4. No new output — check silence duration
		const silenceDuration = Date.now() - state.lastOutputAt;

		if (state.phase === "running" && silenceDuration > config.silenceThresholdMs) {
			transition("silent", `no output for ${Math.round(silenceDuration / 1000)}s`, cwd);
		}

		if (state.phase === "silent" && state.nudgeCount < config.maxNudgesBeforeRestart) {
			// NUDGE — this is where the Pi LLM can be involved
			transition("nudging", `auto-nudge #${state.nudgeCount + 1}`, cwd);
			state.nudgeCount++;
			state.totalNudges++;

			// Deterministic nudge message (no LLM needed for this)
			const nudgeMsg = state.nudgeCount === 1
				? "continue"
				: state.nudgeCount === 2
				? "You appear to be stalled. Check your current phase and continue with the next step."
				: "SUPERVISOR: You have been silent for an extended period. Resume the orchestrator loop immediately. If stuck, skip the current task and continue.";

			tmuxSendKeys(session, nudgeMsg);
			logEvent("nudge_sent", `#${state.nudgeCount}: ${nudgeMsg.slice(0, 60)}`);
			logDevlog(cwd, `### [${new Date().toISOString()}] NUDGE #${state.nudgeCount}\n- Silence: ${Math.round(silenceDuration / 1000)}s\n- Message: ${nudgeMsg.slice(0, 80)}`);

			// Return to silent after sending nudge (will transition to running if output appears)
			setTimeout(() => {
				if (state.phase === "nudging") {
					transition("silent", "nudge sent, waiting for response", cwd);
				}
			}, 5000);

			persistState(cwd);
			return;
		}

		if (state.phase === "silent" && state.nudgeCount >= config.maxNudgesBeforeRestart) {
			// STALLED — escalate
			transition("stalled", `${state.nudgeCount} nudges sent, no response`, cwd);
			logDevlog(cwd, `### [${new Date().toISOString()}] STALL DETECTED\n- Nudges sent: ${state.nudgeCount}\n- Restarting orchestrator...`);

			// Kill and restart
			exec(`tmux send-keys -t "${session}" Escape`);
			exec(`tmux send-keys -t "${session}" C-c C-c C-c`);
			setTimeout(() => {
				exec(`tmux send-keys -t "${session}" "export ORCHY_SESSION_NAME=${session} && unset CLAUDECODE && claude ${config.orchestratorFlags}" Enter`);
				state.nudgeCount = 0;
				state.restartCount++;
				state.totalRestarts++;
				transition("starting", "auto-restarted after stall", cwd);
				persistState(cwd);
			}, 3000);
		}

		persistState(cwd);
		updateWidget();
	}

	// ── Orchestrator Lifecycle ───────────────────

	function spawnOrchestrator(cwd: string): void {
		const session = config.orchestratorSession;

		if (!tmuxExists(session)) {
			exec(`tmux new-session -d -s "${session}" -c "${config.orchestratorDir}"`);
		}

		exec(`tmux send-keys -t "${session}" "export ORCHY_SESSION_NAME=${session} && unset CLAUDECODE && claude ${config.orchestratorFlags}" Enter`);

		state.startedAt = new Date().toISOString();
		state.lastOutputAt = Date.now();
		state.nudgeCount = 0;
		transition("starting", "orchestrator spawned", cwd);
		startHeartbeat(cwd);

		logDevlog(cwd, `### [${new Date().toISOString()}] ORCHESTRATOR STARTED\n- Session: ${session}\n- Dir: ${config.orchestratorDir}\n- Flags: ${config.orchestratorFlags}`);
	}

	// ── Widget ───────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;

		widgetCtx.ui.setWidget("supervisor", (_tui: any, theme: any) => ({
			render(_width: number): string[] {
				const phaseIcon: Record<SupervisorPhase, string> = {
					stopped: "⏹",
					starting: "⏳",
					running: "▶",
					silent: "🔇",
					nudging: "👉",
					stalled: "⚠",
					restarting: "🔄",
					crashed: "💥",
				};
				const phaseColor: Record<SupervisorPhase, string> = {
					stopped: "dim",
					starting: "accent",
					running: "success",
					silent: "warning",
					nudging: "accent",
					stalled: "error",
					restarting: "warning",
					crashed: "error",
				};

				const icon = phaseIcon[state.phase] || "?";
				const color = phaseColor[state.phase] || "dim";
				const silence = state.lastOutputAt
					? `${Math.round((Date.now() - state.lastOutputAt) / 1000)}s ago`
					: "never";

				const lines = [
					theme.fg("accent", theme.bold(" Supervisor")),
					` ${icon} ${theme.fg(color, state.phase)} | Last output: ${theme.fg("dim", silence)}`,
					` Nudges: ${theme.fg("dim", `${state.nudgeCount}/${config.maxNudgesBeforeRestart}`)} | Restarts: ${theme.fg("dim", String(state.restartCount))} | Orchy phase: ${theme.fg("accent", state.orchestratorPhase)}`,
				];

				// Show last event
				const lastEvent = state.events[state.events.length - 1];
				if (lastEvent) {
					lines.push(` ${theme.fg("dim", `${lastEvent.ts.slice(11, 19)} ${lastEvent.event}: ${lastEvent.detail.slice(0, 50)}`)}`);
				}

				return lines;
			},
			invalidate() {},
		}));
	}

	// ════════════════════════════════════════════════════════════════
	// TOOLS (for the Pi LLM — supervisor commands)
	// ════════════════════════════════════════════════════════════════

	// START: Launch the orchestrator
	pi.registerTool({
		name: "supervisor_start",
		label: "Start Orchestrator",
		description: "Spawn the Claude Code orchestrator in a tmux session and begin monitoring. The orchestrator runs Claude Opus and manages dev workers.",
		parameters: Type.Object({
			directory: Type.Optional(Type.String({ description: "Working directory for orchestrator (default: cwd)" })),
			session: Type.Optional(Type.String({ description: "tmux session name (default: 'orchy')" })),
			initial_prompt: Type.Optional(Type.String({ description: "First prompt to send after Claude starts (e.g., '/orchestrator')" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { directory, session, initial_prompt } = params as any;
			if (directory) config.orchestratorDir = directory;
			if (session) config.orchestratorSession = session;
			if (!config.orchestratorDir) config.orchestratorDir = ctx.cwd;

			spawnOrchestrator(ctx.cwd);

			// Send initial prompt after Claude boots
			if (initial_prompt) {
				setTimeout(() => {
					tmuxSendKeys(config.orchestratorSession, initial_prompt);
					logEvent("initial_prompt", initial_prompt.slice(0, 60));
				}, 15000); // Wait for Claude to init
			}

			return {
				content: [{ type: "text", text: `Orchestrator started in session "${config.orchestratorSession}". Heartbeat active every ${config.heartbeatIntervalMs / 1000}s.${initial_prompt ? ` Will send "${initial_prompt}" after 15s.` : ""}` }],
				details: { session: config.orchestratorSession, directory: config.orchestratorDir },
			};
		},
		renderCall(args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_start ")) + theme.fg("accent", (args as any).session || "orchy"), 0, 0);
		},
	});

	// STOP: Stop monitoring and optionally kill orchestrator
	pi.registerTool({
		name: "supervisor_stop",
		label: "Stop Orchestrator",
		description: "Stop the heartbeat monitor. Optionally kill the orchestrator tmux session.",
		parameters: Type.Object({
			kill: Type.Optional(Type.Boolean({ description: "Also kill the tmux session (default: false — just stop monitoring)" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { kill } = params as { kill?: boolean };
			stopHeartbeat();
			transition("stopped", kill ? "killed by supervisor" : "monitoring stopped", ctx.cwd);

			if (kill && tmuxExists(config.orchestratorSession)) {
				exec(`tmux send-keys -t "${config.orchestratorSession}" Escape`);
				exec(`tmux send-keys -t "${config.orchestratorSession}" C-c C-c C-c`);
				setTimeout(() => exec(`tmux kill-session -t "${config.orchestratorSession}" 2>/dev/null`), 3000);
			}

			persistState(ctx.cwd);
			return {
				content: [{ type: "text", text: `Supervisor stopped. ${kill ? "Orchestrator session killed." : "Session still running (just unmonitored)."}` }],
				details: { killed: !!kill },
			};
		},
	});

	// NUDGE: Manually send a message to the orchestrator
	pi.registerTool({
		name: "supervisor_nudge",
		label: "Nudge Orchestrator",
		description: "Send a custom message to the orchestrator session. Use this for intelligent nudging when the deterministic auto-nudge isn't enough. This is where YOUR intelligence as the supervisor LLM matters — compose the right nudge based on what you see in the captured output.",
		parameters: Type.Object({
			message: Type.String({ description: "Message to send to the orchestrator" }),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { message } = params as { message: string };
			tmuxSendKeys(config.orchestratorSession, message);
			state.totalNudges++;
			logEvent("manual_nudge", message.slice(0, 80));
			logDevlog(ctx.cwd, `### [${new Date().toISOString()}] MANUAL NUDGE\n- Message: ${message.slice(0, 200)}`);
			persistState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Nudge sent to "${config.orchestratorSession}": ${message.slice(0, 100)}` }],
				details: { message },
			};
		},
		renderCall(args, theme) {
			const preview = ((args as any).message || "").slice(0, 50);
			return new Text(theme.fg("toolTitle", theme.bold("supervisor_nudge ")) + theme.fg("muted", preview), 0, 0);
		},
	});

	// OBSERVE: Capture and return current orchestrator output
	pi.registerTool({
		name: "supervisor_observe",
		label: "Observe Orchestrator",
		description: "Capture the current output of the orchestrator session. Use this to understand what the orchestrator is doing before deciding whether to nudge.",
		parameters: Type.Object({
			lines: Type.Optional(Type.Number({ description: "Lines to capture (default: 50)" })),
		}),
		async execute(_id, params) {
			const { lines } = params as { lines?: number };
			const output = tmuxCapture(config.orchestratorSession, lines || 50);
			state.lastCapturedOutput = output;

			return {
				content: [{ type: "text", text: output || "(no output — session may not exist)" }],
				details: { session: config.orchestratorSession, lines: lines || 50 },
			};
		},
	});

	// STATUS: Full supervisor status
	pi.registerTool({
		name: "supervisor_status",
		label: "Supervisor Status",
		description: "Get full supervisor status: phase, heartbeat, nudge count, restart count, last events.",
		parameters: Type.Object({}),
		async execute(_id, _params, _signal, _onUpdate, ctx) {
			const sessionAlive = tmuxExists(config.orchestratorSession);
			const claudeRunning = sessionAlive ? tmuxClaudeRunning(config.orchestratorSession) : false;
			const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : -1;

			const report = [
				`Phase: ${state.phase}`,
				`Session: ${config.orchestratorSession} (${sessionAlive ? "alive" : "DEAD"})`,
				`Claude: ${claudeRunning ? "running" : "NOT running"}`,
				`Silence: ${silenceSec >= 0 ? `${silenceSec}s` : "never started"}`,
				`Nudges: ${state.nudgeCount}/${config.maxNudgesBeforeRestart} (total: ${state.totalNudges})`,
				`Restarts: ${state.restartCount} (total: ${state.totalRestarts})`,
				`Orchestrator phase: ${state.orchestratorPhase}`,
				`Started: ${state.startedAt || "never"}`,
				``,
				`Last 5 events:`,
				...state.events.slice(-5).map(e => `  ${e.ts.slice(11, 19)} ${e.event}: ${e.detail.slice(0, 60)}`),
			].join("\n");

			return {
				content: [{ type: "text", text: report }],
				details: { ...state, sessionAlive, claudeRunning },
			};
		},
	});

	// CONFIG: Update supervisor configuration
	pi.registerTool({
		name: "supervisor_config",
		label: "Configure Supervisor",
		description: "Update supervisor configuration (heartbeat interval, silence threshold, max nudges, worker definitions). Changes are persisted.",
		parameters: Type.Object({
			heartbeat_interval_sec: Type.Optional(Type.Number({ description: "Heartbeat check interval in seconds" })),
			silence_threshold_sec: Type.Optional(Type.Number({ description: "Silence duration before first nudge" })),
			stall_threshold_sec: Type.Optional(Type.Number({ description: "Max time on same phase before escalation" })),
			max_nudges: Type.Optional(Type.Number({ description: "Max nudges before auto-restart" })),
			orchestrator_flags: Type.Optional(Type.String({ description: "Claude Code flags for orchestrator" })),
			workers: Type.Optional(Type.Any({ description: "Worker session definitions: { name: { directory, flags? } }" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const p = params as any;
			if (p.heartbeat_interval_sec) config.heartbeatIntervalMs = p.heartbeat_interval_sec * 1000;
			if (p.silence_threshold_sec) config.silenceThresholdMs = p.silence_threshold_sec * 1000;
			if (p.stall_threshold_sec) config.stallThresholdMs = p.stall_threshold_sec * 1000;
			if (p.max_nudges) config.maxNudgesBeforeRestart = p.max_nudges;
			if (p.orchestrator_flags) config.orchestratorFlags = p.orchestrator_flags;
			if (p.workers) config.workers = p.workers;

			// Persist config
			const configPath = join(ctx.cwd, "_bmad", "supervisor-config.json");
			mkdirSync(join(ctx.cwd, "_bmad"), { recursive: true });
			writeFileSync(configPath, JSON.stringify(config, null, 2));

			// Restart heartbeat with new interval
			if (heartbeatTimer) {
				startHeartbeat(ctx.cwd);
			}

			return {
				content: [{ type: "text", text: `Config updated. Heartbeat: ${config.heartbeatIntervalMs / 1000}s, Silence: ${config.silenceThresholdMs / 1000}s, Max nudges: ${config.maxNudgesBeforeRestart}` }],
				details: config,
			};
		},
	});

	// SPAWN_WORKER: Spawn a pre-configured worker
	pi.registerTool({
		name: "supervisor_spawn_worker",
		label: "Spawn Worker",
		description: "Spawn a worker tmux session for the orchestrator to use. Workers are Claude Code sessions that the orchestrator dispatches dev work to.",
		parameters: Type.Object({
			name: Type.String({ description: "Worker session name" }),
			directory: Type.String({ description: "Working directory" }),
			flags: Type.Optional(Type.String({ description: "Claude Code flags" })),
		}),
		async execute(_id, params, _signal, _onUpdate, ctx) {
			const { name, directory, flags } = params as { name: string; directory: string; flags?: string };
			const claudeFlags = flags || "--dangerously-skip-permissions";

			if (tmuxExists(name)) {
				const running = tmuxClaudeRunning(name);
				return {
					content: [{ type: "text", text: `Worker "${name}" already exists (claude ${running ? "running" : "not running"}).` }],
					details: { name, exists: true, claudeRunning: running },
				};
			}

			exec(`tmux new-session -d -s "${name}" -c "${directory}"`);
			exec(`tmux send-keys -t "${name}" "export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${claudeFlags}" Enter`);

			// Register in config
			config.workers[name] = { directory, flags: claudeFlags };
			const configPath = join(ctx.cwd, "_bmad", "supervisor-config.json");
			mkdirSync(join(ctx.cwd, "_bmad"), { recursive: true });
			writeFileSync(configPath, JSON.stringify(config, null, 2));

			logEvent("worker_spawned", `${name} in ${directory}`);
			persistState(ctx.cwd);

			return {
				content: [{ type: "text", text: `Worker "${name}" spawned in ${directory}. Claude Code starting.` }],
				details: { name, directory, flags: claudeFlags },
			};
		},
	});

	// ════════════════════════════════════════════════════════════════
	// SESSION LIFECYCLE
	// ════════════════════════════════════════════════════════════════

	pi.on("session_start", async (_event, ctx) => {
		widgetCtx = ctx;
		loadConfig(ctx.cwd);
		loadState(ctx.cwd);

		// If we were running before, resume heartbeat
		if (state.phase !== "stopped" && tmuxExists(config.orchestratorSession)) {
			startHeartbeat(ctx.cwd);
			logEvent("supervisor_resumed", "Pi session restarted, resuming monitoring");
		}

		updateWidget();

		const sessionAlive = tmuxExists(config.orchestratorSession);
		ctx.ui.notify(
			`Supervisor loaded | Orchestrator: ${sessionAlive ? "alive" : "not running"} | Phase: ${state.phase}`,
			"info",
		);
	});

	pi.on("session_before_compact" as any, async (_event: any, ctx: any) => {
		persistState(ctx.cwd);
	});

	// ── System Prompt ────────────────────────────

	pi.on("before_agent_start", async () => {
		return {
			systemPrompt: `You are the L-Thread SUPERVISOR — a meta-orchestrator that monitors and nudges the real orchestrator.

## YOUR ROLE
You are NOT the orchestrator. The orchestrator is Claude Opus running in a tmux session ("${config.orchestratorSession}").
Your job is to:
1. OBSERVE — use supervisor_observe to see what the orchestrator is doing
2. DECIDE — analyze the output and decide if intervention is needed
3. NUDGE — use supervisor_nudge to send intelligent messages when the orchestrator is stuck
4. REPORT — answer the user's questions about orchestrator status

## AVAILABLE TOOLS
- supervisor_start — launch the orchestrator
- supervisor_stop — stop monitoring (optionally kill session)
- supervisor_nudge — send a message to the orchestrator
- supervisor_observe — capture orchestrator output
- supervisor_status — full status report
- supervisor_config — change monitoring parameters
- supervisor_spawn_worker — create worker sessions

## DETERMINISTIC vs INTELLIGENT
The heartbeat system handles routine monitoring deterministically (TypeScript):
- Silence detection → auto-nudge ("continue")
- Crash detection → auto-restart
- Stall detection → escalation

YOUR intelligence is needed for:
- Understanding WHAT the orchestrator is stuck on (from captured output)
- Composing the RIGHT nudge (not just "continue" but specific instructions)
- Deciding whether to restart vs nudge vs skip
- Answering user questions about progress

## AUTO-NUDGE ESCALATION (deterministic)
1. First nudge: "continue"
2. Second nudge: "Check your current phase and continue with the next step."
3. Third nudge: "SUPERVISOR: Resume immediately. If stuck, skip and continue."
4. After max nudges: auto-restart orchestrator

You can override this with supervisor_nudge at any time with a smarter message.`,
		};
	});

	// ── Footer ───────────────────────────────────

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.setFooter((_tui, theme, _footerData) => ({
			dispose: () => {},
			invalidate() {},
			render(width: number): string[] {
				const { truncateToWidth, visibleWidth } = require("@mariozechner/pi-tui");
				const model = ctx.model?.id || "no-model";
				const usage = ctx.getContextUsage();
				const pct = usage ? (usage.percent ?? 0) : 0;
				const filled = Math.round(pct / 10);
				const bar = "#".repeat(filled) + "-".repeat(10 - filled);

				const phaseIcon: Record<string, string> = {
					stopped: "⏹", starting: "⏳", running: "▶", silent: "🔇",
					nudging: "👉", stalled: "⚠", restarting: "🔄", crashed: "💥",
				};

				const icon = phaseIcon[state.phase] || "?";
				const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : 0;

				const left = theme.fg("dim", ` ${model}`) +
					theme.fg("muted", " | ") +
					`${icon} ${state.phase}` +
					theme.fg("muted", " | ") +
					theme.fg("dim", `${silenceSec}s`) +
					theme.fg("muted", " | ") +
					theme.fg("dim", `N:${state.nudgeCount} R:${state.restartCount}`);

				const right = theme.fg("dim", `[${bar}] ${Math.round(pct)}% `);
				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));

				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});
}
