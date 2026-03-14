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
	silenceThresholdMs: 300_000,
	stallThresholdMs: 600_000,
	maxNudgesBeforeRestart: 3,
	workers: {},
};

// ── State ───────────────────────────────────────

type Phase = "stopped" | "starting" | "running" | "silent" | "nudging" | "stalled" | "crashed" | "paused" | "wave_running" | "wave_merging" | "awaiting_human";

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

// ── BMAD Wave State ─────────────────────────────

interface BmadStory {
	id: string;
	title: string;
	workerName: string;
	status: "pending" | "running" | "done" | "failed";
	latchFile: string;
	prUrl: string | null;
	startedAt: string;
	completedAt: string | null;
}

interface BmadWaveState {
	epic: string | null;
	epicId: string | null;
	wave: {
		id: string;
		index: number;
		stories: BmadStory[];
		status: "spawning" | "running" | "complete" | "merging" | "merged";
		spawnedAt: string;
		completedAt: string | null;
	} | null;
	completedWaves: Array<{ id: string; storiesCompleted: number; completedAt: string }>;
	humanCheckpoints: Array<{ reason: string; ts: string; resolved: boolean }>;
}

const INITIAL_BMAD_STATE: BmadWaveState = { epic: null, epicId: null, wave: null, completedWaves: [], humanCheckpoints: [] };

// ── Events (things that happened) ───────────────

type SupervisorEvent =
	| { type: "heartbeat"; paneAlive: boolean; claudeRunning: boolean; outputHash: string; output: string; screen: ScreenState | null; now: number }
	| { type: "start"; directory: string; flags: string; helperScript: string; task: string | null; now: number }
	| { type: "stop"; kill: boolean; now: number }
	| { type: "pause"; now: number }
	| { type: "resume"; message?: string; now: number }
	| { type: "manual_nudge"; message: string; now: number }
	| { type: "restart_settled"; now: number }
	| { type: "nudge_settled"; now: number }
	| { type: "worker_spawned"; name: string; paneId: string; directory: string; now: number }
	| { type: "worker_closed"; name: string; now: number }
	| { type: "wave_started"; epic: string; epicId: string; waveId: string; stories: BmadStory[]; now: number }
	| { type: "wave_story_done"; workerName: string; prUrl: string | null; now: number }
	| { type: "wave_merging"; waveId: string; mergeWorkerName: string; now: number }
	| { type: "wave_merged"; waveId: string; mergeWorkerName: string; now: number }
	| { type: "human_checkpoint_requested"; reason: string; now: number }
	| { type: "latch_poll"; now: number };

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
	| { type: "schedule"; delayMs: number; event: SupervisorEvent }
	| { type: "persist_bmad_state" }
	| { type: "check_latches"; waveId: string };

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
			// Don't probe during human checkpoint — agents are intentionally paused
			if (s.phase === "awaiting_human") break;
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

			// 4. Silence & smart nudging (screen-state-aware)
			const silence = now - s.lastOutputAt;
			const activity = event.screen?.activity || "unknown";

			// Don't transition to silent if orchestrator is actively working
			if (s.phase === "running" && silence > config.silenceThresholdMs) {
				if (activity === "thinking" || activity === "tool_calling" || activity === "working") {
					// Active work detected — reset silence timer, don't nudge
					log(`silence ${Math.round(silence / 1000)}s but activity=${activity}, skipping`);
				} else {
					transition("silent", `no output for ${Math.round(silence / 1000)}s (activity=${activity})`);
				}
			}

			if (s.phase === "silent" && s.nudgeCount < config.maxNudgesBeforeRestart) {
				// Don't nudge if screen shows active work
				if (activity === "thinking" || activity === "tool_calling" || activity === "working") {
					transition("running", `screen shows activity=${activity}`);
					s.nudgeCount = 0;
					break;
				}

				// Don't nudge if no meaningful task
				const task = registry?.session?.task;
				if (!task || task.length < 10) {
					log(`silent but no real task (${task || "none"}), skipping nudge`);
					break;
				}

				s.nudgeCount++;
				s.totalNudges++;
				transition("nudging", `auto-nudge #${s.nudgeCount} (activity=${activity})`);

				// Context-aware nudge messages
				const errorCtx = event.screen?.errorDetected ? ` Error detected: ${event.screen.errorDetected.slice(0, 80)}` : "";
				const nudgeMsg = s.nudgeCount === 1
					? `Continue working on: ${task}.${errorCtx}`
					: s.nudgeCount === 2
					? `SUPERVISOR: You have been idle for ${Math.round(silence / 1000)}s. Resume working on: ${task}. If stuck, skip and move to the next step.${errorCtx}`
					: `SUPERVISOR FINAL WARNING: Resume immediately or you will be restarted. Task: ${task}${errorCtx}`;

				fx.push({ type: "send_keys", paneId: layout.orchestratorPaneId, text: nudgeMsg });
				fx.push({ type: "log_devlog", entry: `### [${new Date(now).toISOString()}] NUDGE #${s.nudgeCount}\n- Silence: ${Math.round(silence / 1000)}s\n- Activity: ${activity}\n- Message: ${nudgeMsg.slice(0, 100)}` });
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

		// ── BMAD WAVE EVENTS ────────────────────────────

		case "wave_started": {
			log(`wave ${event.waveId} started with ${event.stories.length} stories for ${event.epic}`);
			fx.push({ type: "log_activity", event: "wave_started", details: { epic: event.epic, waveId: event.waveId, stories: event.stories.length } });
			fx.push({ type: "persist_bmad_state" });
			fx.push({ type: "update_widget" });
			// Start latch polling every 15s
			fx.push({ type: "schedule", delayMs: 15000, event: { type: "latch_poll", now: event.now + 15000 } });
			break;
		}

		case "wave_story_done": {
			log(`story done: ${event.workerName} | PR: ${event.prUrl || "none"}`);
			fx.push({ type: "log_activity", event: "wave_story_done", details: { workerName: event.workerName, prUrl: event.prUrl } });
			fx.push({ type: "persist_bmad_state" });
			fx.push({ type: "update_widget" });
			fx.push({ type: "notify", message: `Story ${event.workerName} completed${event.prUrl ? ` — PR: ${event.prUrl}` : ""}` });
			break;
		}

		case "wave_merging": {
			log(`wave ${event.waveId} merging via ${event.mergeWorkerName}`);
			fx.push({ type: "log_activity", event: "wave_merging", details: { waveId: event.waveId, mergeWorkerName: event.mergeWorkerName } });
			fx.push({ type: "persist_bmad_state" });
			fx.push({ type: "update_widget" });
			break;
		}

		case "wave_merged": {
			log(`wave ${event.waveId} merged`);
			fx.push({ type: "log_activity", event: "wave_merged", details: { waveId: event.waveId } });
			fx.push({ type: "notify", message: `Wave ${event.waveId} fully merged!` });
			fx.push({ type: "persist_bmad_state" });
			fx.push({ type: "update_widget" });
			break;
		}

		case "human_checkpoint_requested": {
			if (s.phase !== "stopped" && s.phase !== "paused" && s.phase !== "awaiting_human") {
				transition("awaiting_human", event.reason);
				fx.push({ type: "stop_heartbeat" });
				fx.push({ type: "log_activity", event: "human_checkpoint", details: { reason: event.reason } });
				fx.push({ type: "persist_bmad_state" });
			}
			break;
		}

		case "latch_poll": {
			// The actual latch checking happens in the effect executor (I/O).
			// We just schedule the check and reschedule ourselves.
			fx.push({ type: "check_latches", waveId: "current" });
			fx.push({ type: "schedule", delayMs: 15000, event: { type: "latch_poll", now: event.now + 15000 } });
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


// ── Screen State (parsed from cmux read-screen) ─────

type OrchestratorActivity = "idle" | "working" | "thinking" | "tool_calling" | "error" | "waiting_input" | "completed" | "unknown";

interface ScreenState {
	activity: OrchestratorActivity;
	claudeRunning: boolean;
	promptVisible: boolean;
	errorDetected: string | null;
	milestone: string | null;      // "pr_created", "tests_passed", "branch_created", etc.
	lastToolCall: string | null;   // "Edit", "Write", "Bash", etc.
	tokenCount: number | null;
	rawLines: string;
}

function parseScreen(paneId: string): ScreenState {
	const raw = exec(`cmux read-screen --surface "${paneId}" --lines 20 2>/dev/null`, 5000);
	const result: ScreenState = {
		activity: "unknown",
		claudeRunning: false,
		promptVisible: false,
		errorDetected: null,
		milestone: null,
		lastToolCall: null,
		tokenCount: null,
		rawLines: raw,
	};

	if (!raw) return result;

	// Claude running detection (existing logic, expanded)
	result.claudeRunning = /[✓◆❯○]|claude>|╭─|│ >|Thinking|Tool |⏺|waiting for|permission|Working/i.test(raw);

	// Prompt visible = Claude idle, waiting for user input
	result.promptVisible = /^\s*[❯○]\s*$/m.test(raw) || /^\s*[❯○]\s*▊?\s*$/m.test(raw);

	// Token count from footer
	const tokenMatch = raw.match(/(\d[\d,]+)\s*tokens?/i);
	if (tokenMatch) result.tokenCount = parseInt(tokenMatch[1].replace(/,/g, ""), 10);

	// Activity detection (priority order — first match wins)
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
	let bmadState: BmadWaveState = { ...INITIAL_BMAD_STATE };

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
					exec(`cmux send-key --surface "${fx.paneId}" Enter 2>/dev/null`, 5000);
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
				case "persist_bmad_state":
					persistBmadState();
					break;
				case "check_latches": {
					if (!bmadState.wave || bmadState.wave.status !== "running") break;
					for (const story of bmadState.wave.stories) {
						if (story.status === "running" && existsSync(story.latchFile)) {
							const content = readFileSync(story.latchFile, "utf-8").trim();
							const prUrl = content.match(/https:\/\/github\.com\/[^\s]+/)?.[0] || null;
							story.status = "done";
							story.prUrl = prUrl;
							story.completedAt = new Date().toISOString();
							dispatch({ type: "wave_story_done", workerName: story.workerName, prUrl, now: Date.now() });
						}
					}
					// Check if all stories complete
					const allDone = bmadState.wave.stories.every(s => s.status === "done" || s.status === "failed");
					if (allDone) {
						bmadState.wave.status = "complete";
						bmadState.wave.completedAt = new Date().toISOString();
						bmadState.completedWaves.push({
							id: bmadState.wave.id,
							storiesCompleted: bmadState.wave.stories.filter(s => s.status === "done").length,
							completedAt: bmadState.wave.completedAt!,
						});
						persistBmadState();
						widgetCtx?.ui.notify(`Wave ${bmadState.wave.id} complete! All ${bmadState.wave.stories.length} stories done.`, "info");
						exec(`cmux notify --title "Wave Complete" --body "${bmadState.wave.id}: ${bmadState.wave.stories.length} stories done" 2>/dev/null`);
					}
					break;
				}
			}
		}
	}

	// ── Heartbeat Probe (I/O → Event) ───────────────

	function heartbeatProbe(): void {
		const orchPane = layout.orchestratorPaneId;
		const alive = paneExists(orchPane);
		const screen = alive ? parseScreen(orchPane) : null;
		const output = screen?.rawLines || "";

		dispatch({
			type: "heartbeat",
			paneAlive: alive,
			claudeRunning: screen?.claudeRunning || false,
			outputHash: simpleHash(output),
			output,
			screen,
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
			wave_running: "active", wave_merging: "active", awaiting_human: "paused",
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

	function persistBmadState(): void {
		const dir = join(cwd, "_bmad");
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "bmad-wave-state.json"), JSON.stringify(bmadState, null, 2));
	}

	function loadBmadState(): void {
		const p = join(cwd, "_bmad", "bmad-wave-state.json");
		if (existsSync(p)) {
			try { bmadState = { ...INITIAL_BMAD_STATE, ...JSON.parse(readFileSync(p, "utf-8")) }; } catch {}
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
			exec(`cmux send-key --surface "${paneId}" Enter 2>/dev/null`, 5000);
			exec(`cmux rename-tab --surface "${paneId}" "${name}" 2>/dev/null`);
			layout.workerPanes.push({ name, paneId, directory });
			return paneId;
		}

		// Split above the last worker (cmux new-split up)
		const topPaneId = layout.workerPanes[layout.workerPanes.length - 1].paneId;
		const newPaneRaw = exec(`cmux new-split up --surface "${topPaneId}" 2>/dev/null`);
		const newPaneId = newPaneRaw.match(/surface:\d+/)?.[0] || newPaneRaw;
		if (!newPaneId) return null;

		const cmd = `cd "${directory}" && export ORCHY_SESSION_NAME=${name} && unset CLAUDECODE && claude ${flags}`;
		const escaped = cmd.replace(/'/g, "'\\''");
		exec(`cmux send --surface "${newPaneId}" '${escaped}' 2>/dev/null`, 5000);
		exec(`cmux send-key --surface "${newPaneId}" Enter 2>/dev/null`, 5000);
		exec(`cmux rename-tab --surface "${newPaneId}" "${name}" 2>/dev/null`);
		layout.workerPanes.push({ name, paneId: newPaneId, directory });
		return newPaneId;
	}

	// ── Widget ──────────────────────────────────────

	function updateWidget(): void {
		if (!widgetCtx) return;
		widgetCtx.ui.setWidget("supervisor", (_tui: any, theme: any) => ({
			render(_width: number): string[] {
				const icons: Record<Phase, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH", paused: "PAUSE", wave_running: "WAVE", wave_merging: "MERGE", awaiting_human: "HUMAN" };
				const colors: Record<Phase, string> = { stopped: "dim", starting: "accent", running: "success", silent: "warning", nudging: "accent", stalled: "error", crashed: "error", paused: "warning", wave_running: "success", wave_merging: "accent", awaiting_human: "warning" };
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

				// ── BMAD Wave progress ────────────────────────────────────────
				// Gate: only render when a wave is active.
				if (bmadState.wave !== null) {
					const wave = bmadState.wave;
					const stories = wave.stories;
					const total = stories.length;
					const doneCount = stories.filter(s => s.status === "done").length;
					const failedCount = stories.filter(s => s.status === "failed").length;

					// ── Epic + wave header ───────────────────────────────────
					lines.push(
						` ${theme.fg("accent", theme.bold("BMAD"))} ${theme.fg("dim", "│")} ${theme.fg("warning", bmadState.epic ?? "?")} ${theme.fg("dim", wave.id)}`
					);

					// ── Progress bar: [█████░░░░░] 3/5 ─────────────────────
					const BAR_WIDTH = 10;
					const filled = Math.round((doneCount / Math.max(total, 1)) * BAR_WIDTH);
					const empty = BAR_WIDTH - filled;
					const bar =
						theme.fg("success", "█".repeat(filled)) +
						theme.fg("dim", "░".repeat(empty));
					const waveStatusColor =
						wave.status === "complete" || wave.status === "merged"
							? "success"
							: wave.status === "merging"
							? "warning"
							: failedCount > 0
							? "error"
							: "accent";
					lines.push(
						` [${bar}] ${theme.fg(waveStatusColor, `${doneCount}/${total}`)}${failedCount > 0 ? theme.fg("error", ` ✗${failedCount}`) : ""}`
					);

					// ── Per-story status icons: 1.1✓ 1.2⟳ 1.3· ────────────
					// Map each story to a compact coloured badge.
					const storyIcons = stories
						.map(s => {
							const icon =
								s.status === "done"    ? "✓" :
								s.status === "failed"  ? "✗" :
								s.status === "running" ? "⟳" :
								                        "·";
							const color =
								s.status === "done"    ? "success" :
								s.status === "failed"  ? "error"   :
								s.status === "running" ? "accent"  :
								                        "dim";
							return theme.fg(color, `${s.id}${icon}`);
						})
						.join(" ");
					lines.push(` ${storyIcons}`);

					// ── Human checkpoint banner ──────────────────────────────
					// Show the most-recent unresolved checkpoint reason.
					const pendingCheckpoint = [...bmadState.humanCheckpoints]
						.reverse()
						.find(c => !c.resolved);
					if (pendingCheckpoint) {
						lines.push(
							` ${theme.fg("error", theme.bold("⚠ HUMAN"))} ${theme.fg("dim", pendingCheckpoint.reason.slice(0, 55))}`
						);
					}
				}

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
					exec(`cmux send-key --surface "${layout.orchestratorPaneId}" Enter 2>/dev/null`, 5000);
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
	// BMAD WAVE TOOLS (5 tools for wave-based parallel execution)
	// ════════════════════════════════════════════════════════════════

	pi.registerTool({
		name: "bmad_start_wave",
		label: "BMAD Start Wave",
		description: "Spawn parallel worker agents for a BMAD wave. Each worker handles one story. Max 4 stories (DeepMind coordination limit). Guards against double-launch.",
		parameters: Type.Object({
			epic: Type.String({ description: "Epic title (e.g. 'Epic 1 — Anonymous Discovery')" }),
			epic_id: Type.String({ description: "Epic ID for file paths (e.g. 'epic-1')" }),
			wave_id: Type.String({ description: "Wave identifier (e.g. 'wave-0')" }),
			stories: Type.Array(
				Type.Object({
					id: Type.String({ description: "Story ID (e.g. 'story-1.1')" }),
					title: Type.String({ description: "Story title" }),
					directory: Type.String({ description: "Working directory for this story's worker" }),
					prompt: Type.String({ description: "Full prompt to send to the worker after startup" }),
				}),
				{ description: "Stories to parallelize (max 4)" },
			),
			flags: Type.Optional(Type.String({ description: "Claude flags (default: --dangerously-skip-permissions)" })),
		}),
		async execute(_id, params) {
			const { epic, epic_id, wave_id, stories, flags } = params as {
				epic: string;
				epic_id: string;
				wave_id: string;
				stories: Array<{ id: string; title: string; directory: string; prompt: string }>;
				flags?: string;
			};

			// ── Guard: story count ───────────────────────────────────────
			// DeepMind paper: coordination overhead exponent = 1.724.
			// 4 agents is universally sub-optimal beyond this threshold.
			if (stories.length === 0) {
				return { content: [{ type: "text", text: "No stories provided. Provide at least 1." }], details: { error: "no_stories" } };
			}
			if (stories.length > 4) {
				return {
					content: [{ type: "text", text: `Too many stories: ${stories.length}. Max is 4 (DeepMind coordination cost limit). Split into multiple waves.` }],
					details: { error: "too_many_stories", count: stories.length },
				};
			}

			// ── Guard: no active wave already running ────────────────────
			if (bmadState.wave && (bmadState.wave.status === "spawning" || bmadState.wave.status === "running")) {
				const active = bmadState.wave.stories.filter(s => s.status === "running").map(s => s.workerName).join(", ");
				return {
					content: [{ type: "text", text: `Wave "${bmadState.wave.id}" is already active (${bmadState.wave.status}). Active workers: ${active || "none"}. Use bmad_merge_wave or bmad_wave_status first.` }],
					details: { error: "wave_already_running", waveId: bmadState.wave.id },
				};
			}

			const workerFlags = flags || "--dangerously-skip-permissions";
			const now = new Date().toISOString();
			const spawnedStories: BmadStory[] = [];
			const spawnErrors: string[] = [];

			// ── Spawn one worker per story ───────────────────────────────
			for (const story of stories) {
				// Worker name: combine epic_id + story id (e.g. "epic-1-story-1.1")
				const workerName = `${epic_id}-${story.id}`.replace(/[^a-zA-Z0-9-]/g, "-");

				// Skip if a worker with this name already exists (safe restart guard)
				if (layout.workerPanes.find(w => w.name === workerName)) {
					spawnErrors.push(`${workerName}: already spawned, skipping`);
					continue;
				}

				const paneId = spawnWorkerPane(workerName, story.directory, workerFlags);
				if (!paneId) {
					spawnErrors.push(`${workerName}: failed to create pane`);
					logActivity("bmad_wave_spawn_failed", { workerName, storyId: story.id, directory: story.directory });
					continue;
				}

				// Latch file path — worker writes this when done (signals completion to polling)
				const latchFile = `/tmp/orchy-${workerName}.latch`;

				spawnedStories.push({
					id: story.id,
					title: story.title,
					workerName,
					status: "running",
					latchFile,
					prUrl: null,
					startedAt: now,
					completedAt: null,
				});

				// Emit worker_spawned through reducer so registry + devlog stay consistent
				dispatch({ type: "worker_spawned", name: workerName, paneId, directory: story.directory, now: Date.now() });
			}

			if (spawnedStories.length === 0) {
				return {
					content: [{ type: "text", text: `All story spawns failed:\n${spawnErrors.join("\n")}` }],
					details: { error: "all_spawns_failed", errors: spawnErrors },
				};
			}

			// ── Update bmadState ─────────────────────────────────────────
			bmadState.epic = epic;
			bmadState.epicId = epic_id;
			bmadState.wave = {
				id: wave_id,
				index: bmadState.completedWaves.length, // monotonic wave index
				stories: spawnedStories,
				status: "spawning",
				spawnedAt: now,
				completedAt: null,
			};
			persistBmadState();

			// ── Dispatch wave_started through reducer ────────────────────
			dispatch({
				type: "wave_started",
				epic,
				epicId: epic_id,
				waveId: wave_id,
				stories: spawnedStories,
				now: Date.now(),
			});

			// ── Send prompts after 15s startup delay ─────────────────────
			// Claude Code takes ~10-15s to load. We wait 15s then fire prompts
			// via `cmux send` so workers see them after the UI is ready.
			setTimeout(() => {
				for (const story of stories) {
					const workerName = `${epic_id}-${story.id}`.replace(/[^a-zA-Z0-9-]/g, "-");
					const w = layout.workerPanes.find(p => p.name === workerName);
					if (!w) continue; // spawn failed, nothing to send

					// Append latch instruction to prompt so worker signals completion
					const latchFile = `/tmp/orchy-${workerName}.latch`;
					const fullPrompt =
						story.prompt +
						`\n\n---\nWhen your work is fully complete and the PR is created, run:\n` +
						`echo '{"done":true,"pr":"<PR_URL>"}' > ${latchFile}\n` +
						`Replace <PR_URL> with the actual PR URL.`;

					const escaped = fullPrompt.replace(/'/g, "'\\''");
					exec(`cmux send --surface "${w.paneId}" '${escaped}' 2>/dev/null`, 5000);
					exec(`cmux send-key --surface "${w.paneId}" Enter 2>/dev/null`, 5000);
					logActivity("bmad_wave_prompt_sent", { workerName, storyId: story.id, latchFile });
				}

				// Move wave status from spawning → running after prompts fired
				if (bmadState.wave && bmadState.wave.status === "spawning") {
					bmadState.wave.status = "running";
					persistBmadState();
				}
			}, 15000);

			// ── Devlog entry ─────────────────────────────────────────────
			writeDevlog(
				`### [${now}] BMAD WAVE STARTED\n` +
				`- Epic: ${epic} (${epic_id})\n` +
				`- Wave: ${wave_id}\n` +
				`- Stories (${spawnedStories.length}): ${spawnedStories.map(s => s.id).join(", ")}\n` +
				(spawnErrors.length > 0 ? `- Spawn errors: ${spawnErrors.join("; ")}\n` : "") +
				`- Prompts fire in 15s`
			);

			const summary =
				`Wave "${wave_id}" launched for epic "${epic}"\n` +
				`Workers spawned (${spawnedStories.length}/${stories.length}):\n` +
				spawnedStories.map(s => `  • ${s.workerName} → ${s.id}: ${s.title}`).join("\n") +
				(spawnErrors.length > 0 ? `\nSpawn errors:\n${spawnErrors.map(e => `  ✗ ${e}`).join("\n")}` : "") +
				`\n\nPrompts will be sent in ~15s. Use bmad_wave_status to monitor.`;

			return {
				content: [{ type: "text", text: summary }],
				details: { waveId: wave_id, epic, epicId: epic_id, storiesSpawned: spawnedStories.length, spawnErrors },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			const count = Array.isArray(a.stories) ? a.stories.length : "?";
			return new Text(
				theme.fg("toolTitle", theme.bold("bmad_start_wave ")) +
				theme.fg("accent", a.wave_id || "?") +
				theme.fg("muted", ` (${count} stories)`),
				0, 0,
			);
		},
	});

	pi.registerTool({
		name: "bmad_wave_status",
		label: "BMAD Wave Status",
		description: "Check status of all workers in the active wave. Reads latch files for completion and captures recent screen output per worker.",
		parameters: Type.Object({
			capture_lines: Type.Optional(Type.Number({ description: "Screen lines to capture per worker (default: 20)" })),
		}),
		async execute(_id, params) {
			const { capture_lines } = params as { capture_lines?: number };
			const lines = capture_lines ?? 20;

			// ── Guard: no active wave ────────────────────────────────────
			if (!bmadState.wave) {
				return { content: [{ type: "text", text: "No active wave. Use bmad_start_wave first." }], details: { noWave: true } };
			}

			const wave = bmadState.wave;
			const reportLines: string[] = [
				`Wave: ${wave.id} | Epic: ${bmadState.epic || "?"} | Status: ${wave.status}`,
				`Spawned: ${wave.spawnedAt} | Stories: ${wave.stories.length}`,
				``,
			];

			let doneCount = 0;
			let failedCount = 0;

			// ── Per-story status check ───────────────────────────────────
			for (const story of wave.stories) {
				const w = layout.workerPanes.find(p => p.name === story.workerName);
				const surfaceAlive = w ? paneExists(w.paneId) : false;

				// Check latch file — written by worker when done
				let latchData: { done?: boolean; pr?: string } | null = null;
				if (existsSync(story.latchFile)) {
					try {
						latchData = JSON.parse(readFileSync(story.latchFile, "utf-8"));
					} catch {
						// Malformed latch — treat as done with unknown PR
						latchData = { done: true, pr: null as any };
					}
				}

				// Update story status from latch (mutates bmadState in-place)
				if (latchData?.done && story.status === "running") {
					story.status = "done";
					story.completedAt = new Date().toISOString();
					story.prUrl = latchData.pr || null;

					dispatch({
						type: "wave_story_done",
						workerName: story.workerName,
						prUrl: story.prUrl,
						now: Date.now(),
					});

					logActivity("bmad_story_completed", { storyId: story.id, workerName: story.workerName, prUrl: story.prUrl });
				}

				if (story.status === "done") doneCount++;
				if (story.status === "failed") failedCount++;

				// Status icon
				const icon = story.status === "done" ? "✓" : story.status === "failed" ? "✗" : surfaceAlive ? "⟳" : "?";

				reportLines.push(`── ${icon} ${story.id}: ${story.title}`);
				reportLines.push(`   Worker: ${story.workerName} | Surface: ${surfaceAlive ? "alive" : "DEAD"}`);
				reportLines.push(`   Status: ${story.status} | PR: ${story.prUrl || "not yet"}`);
				if (story.completedAt) reportLines.push(`   Completed: ${story.completedAt}`);

				// Capture screen if worker is alive and still running
				if (surfaceAlive && story.status === "running" && w) {
					const screen = paneCapture(w.paneId, lines);
					if (screen) {
						reportLines.push(`   --- last ${lines} lines ---`);
						screen.split("\n").slice(-lines).forEach(l => reportLines.push(`   ${l}`));
					}
				}

				reportLines.push(``);
			}

			// ── Update wave-level status if all stories resolved ─────────
			const allResolved = wave.stories.every(s => s.status === "done" || s.status === "failed");
			if (allResolved && wave.status === "running") {
				wave.status = "complete";
				wave.completedAt = new Date().toISOString();
				persistBmadState();
			} else {
				// Persist story-level status updates (done/pr url)
				persistBmadState();
			}

			reportLines.push(`Summary: ${doneCount} done, ${failedCount} failed, ${wave.stories.length - doneCount - failedCount} running`);
			if (allResolved) {
				reportLines.push(`All stories resolved. Ready to bmad_merge_wave.`);
			}

			return {
				content: [{ type: "text", text: reportLines.join("\n") }],
				details: {
					waveId: wave.id,
					waveStatus: wave.status,
					storiesTotal: wave.stories.length,
					done: doneCount,
					failed: failedCount,
					allResolved,
				},
			};
		},
		renderCall(_args, theme) {
			return new Text(theme.fg("toolTitle", theme.bold("bmad_wave_status")), 0, 0);
		},
	});

	pi.registerTool({
		name: "bmad_merge_wave",
		label: "BMAD Merge Wave",
		description: "Spawn a merge agent after all wave stories are done. Optionally auto-closes workers after merge is confirmed.",
		parameters: Type.Object({
			merge_prompt: Type.Optional(Type.String({ description: "Custom merge instructions. Default builds from PR list." })),
			close_workers_after: Type.Optional(Type.Boolean({ description: "Auto-close story workers after merge latch fires (default: true)" })),
		}),
		async execute(_id, params) {
			const { merge_prompt, close_workers_after } = params as {
				merge_prompt?: string;
				close_workers_after?: boolean;
			};
			const doClose = close_workers_after !== false; // default true

			// ── Guard: wave must exist ───────────────────────────────────
			if (!bmadState.wave) {
				return { content: [{ type: "text", text: "No active wave. Use bmad_start_wave first." }], details: { error: "no_wave" } };
			}

			const wave = bmadState.wave;

			// ── Guard: all stories must be done or failed ────────────────
			const pending = wave.stories.filter(s => s.status === "running" || s.status === "pending");
			if (pending.length > 0) {
				return {
					content: [{
						type: "text",
						text: `Cannot merge yet — ${pending.length} stories still running:\n${pending.map(s => `  • ${s.id}: ${s.title} [${s.status}]`).join("\n")}\n\nUse bmad_wave_status to check progress.`,
					}],
					details: { error: "stories_still_running", pending: pending.map(s => s.id) },
				};
			}

			// ── Build default merge prompt from PR URLs ──────────────────
			const doneStories = wave.stories.filter(s => s.status === "done");
			const failedStories = wave.stories.filter(s => s.status === "failed");
			const prList = doneStories
				.map(s => `  • ${s.id} (${s.title}): ${s.prUrl || "no PR URL"}`)
				.join("\n");

			const mergeWorkerName = `merge-${wave.id}`;
			const mergeLatchFile = `/tmp/orchy-${mergeWorkerName}.latch`;
			const mergeDirectory = layout.orchestratorDir || cwd;

			const defaultMergePrompt =
				`You are a merge agent for BMAD wave "${wave.id}" in epic "${bmadState.epic}".\n\n` +
				`The following PRs are ready to merge:\n${prList}\n\n` +
				(failedStories.length > 0
					? `Note: ${failedStories.length} stories failed and have no PR:\n${failedStories.map(s => `  • ${s.id}: ${s.title}`).join("\n")}\n\n`
					: "") +
				`Your job:\n` +
				`1. Review each PR for conflicts and code quality\n` +
				`2. Merge in dependency order (resolve conflicts if any)\n` +
				`3. Run the test suite after each merge\n` +
				`4. If a merge conflicts, resolve manually then continue\n` +
				`5. When all merges are complete, write the latch:\n` +
				`   echo '{"done":true,"merged":${doneStories.length}}' > ${mergeLatchFile}\n\n` +
				`Start by reviewing the PRs in order.`;

			const effectivePrompt = merge_prompt || defaultMergePrompt;

			// ── Spawn the merge worker pane ──────────────────────────────
			const mergeFlags = "--dangerously-skip-permissions";
			const paneId = spawnWorkerPane(mergeWorkerName, mergeDirectory, mergeFlags);
			if (!paneId) {
				return {
					content: [{ type: "text", text: `Failed to spawn merge worker "${mergeWorkerName}". Check pane layout.` }],
					details: { error: "spawn_failed", mergeWorkerName },
				};
			}

			// Register merge worker in layout via event
			dispatch({ type: "worker_spawned", name: mergeWorkerName, paneId, directory: mergeDirectory, now: Date.now() });

			// ── Update bmadState to merging ──────────────────────────────
			wave.status = "merging";
			persistBmadState();

			// ── Dispatch wave_merging through reducer ────────────────────
			dispatch({ type: "wave_merging", waveId: wave.id, mergeWorkerName, now: Date.now() });

			// ── Send merge prompt after 15s startup ──────────────────────
			setTimeout(() => {
				const escaped = effectivePrompt.replace(/'/g, "'\\''");
				exec(`cmux send --surface "${paneId}" '${escaped}' 2>/dev/null`, 5000);
				exec(`cmux send-key --surface "${paneId}" Enter 2>/dev/null`, 5000);
				logActivity("bmad_merge_prompt_sent", { mergeWorkerName, waveId: wave.id, paneId });
			}, 15000);

			// ── Poll for merge latch and optionally close workers ─────────
			// Poll every 60s, max 2 hours (120 polls)
			if (doClose) {
				let pollCount = 0;
				const maxPolls = 120;
				const pollInterval = setInterval(() => {
					pollCount++;

					if (existsSync(mergeLatchFile)) {
						clearInterval(pollInterval);

						// Mark wave as merged
						wave.status = "merged";
						wave.completedAt = new Date().toISOString();

						// Archive to completedWaves
						bmadState.completedWaves.push({
							id: wave.id,
							storiesCompleted: doneStories.length,
							completedAt: wave.completedAt,
						});
						bmadState.wave = null;
						persistBmadState();

						// Dispatch wave_merged event
						dispatch({ type: "wave_merged", waveId: wave.id, mergeWorkerName, now: Date.now() });

						// Close all story workers (not the merge worker — let human verify)
						for (const story of wave.stories) {
							const w = layout.workerPanes.find(p => p.name === story.workerName);
							if (w && paneExists(w.paneId)) {
								exec(`cmux send-key --surface "${w.paneId}" "ctrl+c" 2>/dev/null`, 5000);
								setTimeout(() => exec(`cmux close-surface --surface "${w.paneId}" 2>/dev/null`), 2000);
							}
							const idx = layout.workerPanes.findIndex(p => p.name === story.workerName);
							if (idx !== -1) layout.workerPanes.splice(idx, 1);
							dispatch({ type: "worker_closed", name: story.workerName, now: Date.now() });
						}

						logActivity("bmad_wave_merged", { waveId: wave.id, storiesMerged: doneStories.length });
						writeDevlog(
							`### [${new Date().toISOString()}] BMAD WAVE MERGED\n` +
							`- Wave: ${wave.id}\n` +
							`- Stories merged: ${doneStories.length}\n` +
							`- Story workers closed: ${doClose}`
						);
					} else if (pollCount >= maxPolls) {
						// Timeout after 2 hours — stop polling, log warning
						clearInterval(pollInterval);
						logActivity("bmad_merge_timeout", { mergeWorkerName, waveId: wave.id, pollCount });
						writeDevlog(`### [${new Date().toISOString()}] BMAD MERGE TIMEOUT\n- Wave: ${wave.id}\n- No latch after ${maxPolls} polls (${maxPolls} min). Check merge worker.`);
					}
				}, 60_000);
			}

			// ── Devlog entry ─────────────────────────────────────────────
			writeDevlog(
				`### [${new Date().toISOString()}] BMAD MERGE STARTED\n` +
				`- Wave: ${wave.id}\n` +
				`- Merge worker: ${mergeWorkerName} (${paneId})\n` +
				`- PRs to merge: ${doneStories.length}\n` +
				`- Failed stories skipped: ${failedStories.length}\n` +
				`- Auto-close workers: ${doClose}\n` +
				`- Prompt fires in 15s`
			);

			const summary =
				`Merge agent "${mergeWorkerName}" spawned in ${paneId}\n` +
				`PRs to merge (${doneStories.length}): ${doneStories.map(s => s.id).join(", ")}\n` +
				(failedStories.length > 0 ? `Failed stories skipped: ${failedStories.map(s => s.id).join(", ")}\n` : "") +
				`Auto-close workers after merge: ${doClose}\n` +
				`Merge prompt fires in ~15s. Poll latch: ${mergeLatchFile}`;

			return {
				content: [{ type: "text", text: summary }],
				details: { mergeWorkerName, paneId, waveId: wave.id, prCount: doneStories.length, mergeLatchFile, autoClose: doClose },
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("bmad_merge_wave")) +
				theme.fg("muted", a.close_workers_after === false ? " (keep workers)" : " (auto-close)"),
				0, 0,
			);
		},
	});

	pi.registerTool({
		name: "bmad_generate_report",
		label: "BMAD Generate Report",
		description: "Generate a markdown report for a completed wave or full epic. Writes to _bmad-output/reports/.",
		parameters: Type.Object({
			scope: Type.Union([Type.Literal("wave"), Type.Literal("epic")], { description: "Report scope: 'wave' for current wave, 'epic' for all completed waves" }),
			include_pr_diffs: Type.Optional(Type.Boolean({ description: "Include PR diff summaries via gh pr diff (default: false, slow)" })),
		}),
		async execute(_id, params) {
			const { scope, include_pr_diffs } = params as { scope: "wave" | "epic"; include_pr_diffs?: boolean };

			// ── Ensure output directory exists ───────────────────────────
			const reportDir = join(cwd, "_bmad-output", "reports");
			mkdirSync(reportDir, { recursive: true });

			const ts = new Date().toISOString();
			const datestamp = ts.slice(0, 10); // YYYY-MM-DD

			// ─────────────────────────────────────────────────────────────
			// WAVE SCOPE: report on the current (or last completed) wave
			// ─────────────────────────────────────────────────────────────
			if (scope === "wave") {
				// Use active wave first, then last completed
				const wave = bmadState.wave ||
					(bmadState.completedWaves.length > 0
						? { id: bmadState.completedWaves[bmadState.completedWaves.length - 1].id, stories: [] as BmadStory[], status: "merged" as const, spawnedAt: "", completedAt: bmadState.completedWaves[bmadState.completedWaves.length - 1].completedAt, index: bmadState.completedWaves.length - 1 }
						: null);

				if (!wave) {
					return { content: [{ type: "text", text: "No wave data available. Run a wave first." }], details: { error: "no_wave" } };
				}

				const reportLines: string[] = [
					`# BMAD Wave Report`,
					``,
					`**Wave:** ${wave.id}`,
					`**Epic:** ${bmadState.epic || "?"}`,
					`**Epic ID:** ${bmadState.epicId || "?"}`,
					`**Status:** ${wave.status}`,
					`**Generated:** ${ts}`,
					`**Spawned:** ${wave.spawnedAt || "?"}`,
					`**Completed:** ${wave.completedAt || "in progress"}`,
					``,
					`## Stories`,
					``,
				];

				// Only full wave objects (from bmadState.wave) have story detail
				const stories = (bmadState.wave?.id === wave.id && bmadState.wave?.stories) ? bmadState.wave.stories : [];

				if (stories.length === 0) {
					reportLines.push(`_(story details not available for archived waves)_`);
				} else {
					for (const story of stories) {
						// Duration calculation
						let duration = "?";
						if (story.startedAt && story.completedAt) {
							const ms = new Date(story.completedAt).getTime() - new Date(story.startedAt).getTime();
							const mins = Math.round(ms / 60_000);
							duration = `${mins} min`;
						}

						reportLines.push(`### ${story.id}: ${story.title}`);
						reportLines.push(`- **Worker:** \`${story.workerName}\``);
						reportLines.push(`- **Status:** ${story.status}`);
						reportLines.push(`- **Duration:** ${duration}`);
						reportLines.push(`- **PR:** ${story.prUrl ? `[${story.prUrl}](${story.prUrl})` : "none"}`);
						reportLines.push(`- **Latch:** \`${story.latchFile}\``);

						// Optionally pull PR diff summary
						if (include_pr_diffs && story.prUrl) {
							// Extract PR number from URL pattern: .../pull/NNN
							const prMatch = story.prUrl.match(/\/pull\/(\d+)/);
							if (prMatch) {
								const diff = exec(`gh pr diff ${prMatch[1]} --patch 2>/dev/null | head -200`);
								if (diff) {
									reportLines.push(`<details><summary>PR diff (first 200 lines)</summary>\n\n\`\`\`diff\n${diff}\n\`\`\`\n</details>`);
								}
							}
						}

						reportLines.push(``);
					}
				}

				// Wave-level summary stats
				const doneCount = stories.filter(s => s.status === "done").length;
				const failedCount = stories.filter(s => s.status === "failed").length;
				reportLines.push(`## Summary`);
				reportLines.push(``);
				reportLines.push(`| Metric | Value |`);
				reportLines.push(`| --- | --- |`);
				reportLines.push(`| Total stories | ${stories.length} |`);
				reportLines.push(`| Done | ${doneCount} |`);
				reportLines.push(`| Failed | ${failedCount} |`);
				reportLines.push(`| Success rate | ${stories.length > 0 ? Math.round((doneCount / stories.length) * 100) : 0}% |`);
				reportLines.push(``);

				const fileName = `wave-${wave.id}-${datestamp}.md`;
				const filePath = join(reportDir, fileName);
				writeFileSync(filePath, reportLines.join("\n"));

				logActivity("bmad_report_generated", { scope: "wave", waveId: wave.id, filePath });

				return {
					content: [{ type: "text", text: `Wave report written to:\n${filePath}\n\nStories: ${stories.length} total, ${doneCount} done, ${failedCount} failed.` }],
					details: { filePath, waveId: wave.id, storiesTotal: stories.length, done: doneCount, failed: failedCount },
				};
			}

			// ─────────────────────────────────────────────────────────────
			// EPIC SCOPE: summarize all completed waves for the active epic
			// ─────────────────────────────────────────────────────────────
			if (scope === "epic") {
				if (!bmadState.epic) {
					return { content: [{ type: "text", text: "No epic data found in bmadState. Start a wave first." }], details: { error: "no_epic" } };
				}

				const reportLines: string[] = [
					`# BMAD Epic Report`,
					``,
					`**Epic:** ${bmadState.epic}`,
					`**Epic ID:** ${bmadState.epicId || "?"}`,
					`**Generated:** ${ts}`,
					`**Completed Waves:** ${bmadState.completedWaves.length}`,
					`**Current Wave:** ${bmadState.wave ? `${bmadState.wave.id} (${bmadState.wave.status})` : "none"}`,
					``,
					`## Completed Waves`,
					``,
				];

				if (bmadState.completedWaves.length === 0) {
					reportLines.push(`_No waves completed yet._`);
				} else {
					let totalStoriesCompleted = 0;
					for (const cw of bmadState.completedWaves) {
						totalStoriesCompleted += cw.storiesCompleted;
						reportLines.push(`### ${cw.id}`);
						reportLines.push(`- **Stories completed:** ${cw.storiesCompleted}`);
						reportLines.push(`- **Completed at:** ${cw.completedAt}`);
						reportLines.push(``);
					}
					reportLines.push(`## Epic Totals`);
					reportLines.push(``);
					reportLines.push(`| Metric | Value |`);
					reportLines.push(`| --- | --- |`);
					reportLines.push(`| Waves completed | ${bmadState.completedWaves.length} |`);
					reportLines.push(`| Total stories delivered | ${totalStoriesCompleted} |`);
					reportLines.push(``);
				}

				// Include active wave info if any
				if (bmadState.wave) {
					const w = bmadState.wave;
					const doneInWave = w.stories.filter(s => s.status === "done").length;
					reportLines.push(`## Active Wave: ${w.id}`);
					reportLines.push(`- **Status:** ${w.status}`);
					reportLines.push(`- **Stories:** ${w.stories.length} total, ${doneInWave} done`);
					reportLines.push(``);
				}

				const fileName = `epic-${bmadState.epicId || "unknown"}-${datestamp}.md`;
				const filePath = join(reportDir, fileName);
				writeFileSync(filePath, reportLines.join("\n"));

				logActivity("bmad_report_generated", { scope: "epic", epicId: bmadState.epicId, filePath });

				return {
					content: [{ type: "text", text: `Epic report written to:\n${filePath}\n\nEpic: ${bmadState.epic}\nCompleted waves: ${bmadState.completedWaves.length}` }],
					details: { filePath, epic: bmadState.epic, epicId: bmadState.epicId, completedWaves: bmadState.completedWaves.length },
				};
			}

			// Should never reach here (union type exhaustive), but safe fallback
			return { content: [{ type: "text", text: `Unknown scope: ${scope}` }], details: { error: "unknown_scope" } };
		},
		renderCall(args, theme) {
			const a = args as any;
			return new Text(
				theme.fg("toolTitle", theme.bold("bmad_generate_report ")) +
				theme.fg("accent", a.scope || "?"),
				0, 0,
			);
		},
	});

	pi.registerTool({
		name: "bmad_notify_human",
		label: "BMAD Notify Human",
		description: "Pause all agents and send a desktop notification requesting human review. Use for blockers, ambiguous requirements, or security decisions. Call supervisor_resume to continue.",
		parameters: Type.Object({
			reason: Type.String({ description: "Why human review is needed (shown in notification body)" }),
			context: Type.Optional(Type.String({ description: "Additional context for the human (logged but not in notification)" })),
			severity: Type.Optional(
				Type.Union(
					[Type.Literal("info"), Type.Literal("warning"), Type.Literal("error")],
					{ description: "Notification severity level (default: warning)" }
				)
			),
		}),
		async execute(_id, params) {
			const { reason, context, severity } = params as {
				reason: string;
				context?: string;
				severity?: "info" | "warning" | "error";
			};
			const sev = severity || "warning";
			const ts = new Date().toISOString();

			// ── 1. Pause all agents via reducer ─────────────────────────
			// Only pause if actually running — avoids double-pause warning
			if (state.phase !== "paused" && state.phase !== "stopped") {
				dispatch({ type: "pause", now: Date.now() });
			}

			// ── 2. Dispatch human_checkpoint_requested through reducer ────
			dispatch({ type: "human_checkpoint_requested", reason, now: Date.now() });

			// ── 3. Record in bmadState.humanCheckpoints ──────────────────
			bmadState.humanCheckpoints.push({ reason, ts, resolved: false });
			persistBmadState();

			// ── 4. Send cmux desktop notification ────────────────────────
			// cmux notify supports --title and --body; severity maps to urgency level
			const urgencyFlag = sev === "error" ? "--urgency critical" : sev === "warning" ? "--urgency normal" : "--urgency low";
			const notifTitle = `BMAD Checkpoint [${sev.toUpperCase()}]`;
			const notifBody = reason.replace(/'/g, "'\\''").slice(0, 256); // cmux notify body limit
			exec(`cmux notify --title '${notifTitle}' --body '${notifBody}' ${urgencyFlag} 2>/dev/null`, 5000);

			// ── 5. Log to devlog ─────────────────────────────────────────
			writeDevlog(
				`### [${ts}] HUMAN CHECKPOINT [${sev.toUpperCase()}]\n` +
				`- Reason: ${reason}\n` +
				(context ? `- Context: ${context}\n` : "") +
				`- Phase at pause: ${state.phase}\n` +
				`- Workers paused: ${layout.workerPanes.length}\n` +
				`- Notification sent via cmux`
			);

			// ── 6. Log to activity JSONL ─────────────────────────────────
			logActivity("bmad_human_checkpoint", {
				reason,
				context: context || null,
				severity: sev,
				workersPaused: layout.workerPanes.length,
				waveId: bmadState.wave?.id || null,
				checkpointIndex: bmadState.humanCheckpoints.length - 1,
			});

			// ── Build human-facing instructions ─────────────────────────
			const instructions = [
				`BMAD Human Checkpoint — ${sev.toUpperCase()}`,
				``,
				`Reason: ${reason}`,
				context ? `Context: ${context}` : null,
				``,
				`All agents are now PAUSED.`,
				``,
				`To continue:`,
				`  1. Review the situation above`,
				`  2. Make any necessary decisions / changes`,
				`  3. Call supervisor_resume (with an optional message)`,
				``,
				`Checkpoint recorded at: ${ts}`,
				`Checkpoint index: ${bmadState.humanCheckpoints.length - 1}`,
				`Active wave: ${bmadState.wave?.id || "none"}`,
			].filter(Boolean).join("\n");

			return {
				content: [{ type: "text", text: instructions }],
				details: {
					severity: sev,
					reason,
					context: context || null,
					checkpointIndex: bmadState.humanCheckpoints.length - 1,
					agentsPaused: 1 + layout.workerPanes.length,
					waveId: bmadState.wave?.id || null,
				},
			};
		},
		renderCall(args, theme) {
			const a = args as any;
			const sevColor = a.severity === "error" ? "error" : a.severity === "info" ? "success" : "warning";
			return new Text(
				theme.fg("toolTitle", theme.bold("bmad_notify_human ")) +
				theme.fg(sevColor, `[${(a.severity || "warning").toUpperCase()}] `) +
				theme.fg("muted", (a.reason || "").slice(0, 60)),
				0, 0,
			);
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
		loadBmadState();

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
		persistBmadState();
	});

	// ── System Prompt ───────────────────────────────

	pi.on("before_agent_start", async () => {
		const workerList = layout.workerPanes.map(w => `  - ${w.name} (${w.paneId}) in ${w.directory}`).join("\n") || "  none";
		const regInfo = registry.session
			? `Session: ${registry.session.id} | Status: ${registry.session.status} | Task: ${registry.session.task || "none"}`
			: "No active session";

		const bmadBlock: string = (() => {
			if (bmadState.wave === null) {
				return `## BMAD: No active wave. Use bmad_start_wave to begin.`;
			}

			const wave = bmadState.wave;
			const storyLines = wave.stories
				.map(s => {
					const arrow = s.workerName ? `→ ${s.workerName}` : "";
					return `  ${s.id} [${s.status.toUpperCase()}] ${arrow}${s.prUrl ? ` PR:${s.prUrl}` : ""}`;
				})
				.join("\n");

			const pendingHuman = bmadState.humanCheckpoints.filter(c => !c.resolved).length;

			return [
				`## CURRENT BMAD WAVE`,
				`Epic: ${bmadState.epic ?? "?"} | Wave: ${wave.id} | Status: ${wave.status.toUpperCase()}`,
				`Stories:`,
				storyLines,
				`Completed waves: ${bmadState.completedWaves.length}`,
				`Human checkpoints pending: ${pendingHuman}`,
				``,
				`## BMAD TOOLS`,
				`bmad_start_wave     — spawn parallel workers for a wave`,
				`bmad_wave_status    — check all workers in current wave`,
				`bmad_merge_wave     — spawn merge agent after wave completion`,
				`bmad_generate_report — generate wave/epic report`,
				`bmad_notify_human   — pause + notify human for checkpoint`,
			].join("\n");
		})();

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
supervisor_start, supervisor_stop, supervisor_pause, supervisor_resume, supervisor_nudge, supervisor_observe, supervisor_status, supervisor_config, supervisor_spawn_worker, supervisor_close_worker

${bmadBlock}`,
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
				const icons: Record<string, string> = { stopped: "STOP", starting: "INIT", running: "RUN", silent: "QUIET", nudging: "NUDGE", stalled: "STALL", crashed: "CRASH", paused: "PAUSE", wave_running: "WAVE", wave_merging: "MERGE", awaiting_human: "HUMAN" };
				const silenceSec = state.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : 0;

				// Compact task display
				const taskStr = state.task ? ` | ${state.task.slice(0, 30)}` : "";

				// Compact BMAD wave indicator appended after the task string.
				// Shows nothing when no wave is active.
				let bmadIndicator = "";
				if (bmadState.wave !== null) {
					const wave = bmadState.wave;
					const total = wave.stories.length;
					const done = wave.stories.filter(s => s.status === "done").length;
					const failed = wave.stories.filter(s => s.status === "failed").length;
					const waveColor =
						wave.status === "complete" || wave.status === "merged" ? "success" :
						wave.status === "merging"                              ? "warning" :
						failed > 0                                             ? "error"   :
						                                                         "accent";
					bmadIndicator =
						theme.fg("muted", " | ") +
						theme.fg(waveColor, `W:${wave.id} ${done}/${total}`);
				}

				const left = theme.fg("dim", ` ${model}`) + theme.fg("muted", " | ") + `[${icons[state.phase] || "?"}]` + theme.fg("muted", " | ") + theme.fg("dim", `${silenceSec}s N:${state.nudgeCount} R:${state.restartCount} W:${layout.workerPanes.length}`) + theme.fg("accent", taskStr) + bmadIndicator;
				const right = theme.fg("dim", `[${bar}] ${Math.round(pct)}% `);
				const pad = " ".repeat(Math.max(1, width - visibleWidth(left) - visibleWidth(right)));
				return [truncateToWidth(left + pad + right, width)];
			},
		}));
	});
}
