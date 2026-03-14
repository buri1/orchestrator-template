/**
 * cmux-client.ts — CLI wrapper for the cmux terminal multiplexer
 *
 * Provides typed TypeScript functions wrapping the cmux CLI.
 * All functions use execSync to call the `cmux` binary — the CLI communicates
 * with the cmux app via its Unix socket internally.
 *
 * IMPORTANT: This module can ONLY be used from inside a cmux terminal.
 * The cmux CLI requires the CMUX_SOCKET_PATH env var (auto-injected by cmux).
 * From outside cmux, socket access is denied (process-origin auth).
 *
 * ─── TMUX → CMUX COMMAND MAPPING ──────────────────────────────────
 *
 *  tmux command                                  cmux CLI equivalent
 *  ──────────────────────────────────────────    ────────────────────────────────
 *  tmux has-session -t <name>                    cmux list-workspaces (check title)
 *  tmux new-session -d -s <name> -c <dir>        cmux new-workspace --cwd <dir>
 *  tmux display-message -t <pane> -p '#{pane_id}'  cmux identify --surface <id>
 *  tmux capture-pane -t <pane> -p -S -N          cmux read-screen --surface <id> --lines N
 *  tmux send-keys -t <pane> '<text>' Enter       cmux send --surface <id> '<text>'
 *  tmux send-keys -t <pane> <key>                cmux send-key --surface <id> <key>
 *  tmux split-window -v -b -t <pane>             cmux new-split up --surface <id>
 *  tmux kill-pane -t <pane>                      cmux close-surface --surface <id>
 *  tmux select-pane -t <pane> -T <title>         cmux rename-tab --surface <id> <title>
 *  tmux kill-session -t <name>                   cmux close-workspace --workspace <id>
 *
 * ─── ENVIRONMENT VARIABLES (auto-injected by cmux) ─────────────────
 *
 *  CMUX_SOCKET_PATH    Unix socket path (default: /tmp/cmux.sock)
 *  CMUX_WORKSPACE_ID   Current workspace ref (e.g. "workspace:0")
 *  CMUX_SURFACE_ID     Current surface ref (e.g. "surface:3")
 *  CMUX_TAB_ID         Current tab/panel ID (UUID)
 *  CMUX_PANEL_ID       Current panel ID (UUID)
 *
 * ─── HANDLE FORMAT ─────────────────────────────────────────────────
 *
 *  Short refs: surface:N, pane:N, workspace:N, window:N
 *  UUIDs: also accepted (use --id-format uuids for UUID output)
 *  Short refs are stable within a cmux session but may renumber on topology change.
 *
 * ─── KEY DIFFERENCES FROM TMUX ─────────────────────────────────────
 *
 *  1. No copy/scroll mode — INC-005 defensive 'q' send is unnecessary
 *  2. No shell escaping needed — cmux send takes raw text
 *  3. Clean text output — cmux read-screen has no ANSI sequences
 *  4. Surface UUIDs never reuse (unlike tmux pane IDs which can recycle)
 *  5. No session persistence (live process restore) — supervisor handles restart
 *  6. No pipe-pane yet — use polling-based readScreen (same as tmux approach)
 *  7. No wait-for yet — use poll-based completion detection
 *
 * ─── KNOWN GAPS (cmux v0.62, 2026-03) ─────────────────────────────
 *
 *  - Per-surface PID: not exposed by CLI/socket. Use pgrep with ORCHY_SESSION_NAME
 *  - Per-surface current_command: not exposed. Use screen heuristic
 *  - pipe-pane: not implemented. Use readScreen polling
 *  - wait-for: not implemented. Use poll-based latch files
 *  - Session persistence: cmux doesn't restore live processes on restart
 */

import { execSync } from "child_process";

// ════════════════════════════════════════════════════════════════════
// LOW-LEVEL EXEC
// ════════════════════════════════════════════════════════════════════

function exec(cmd: string, timeout = 10000): string {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout, stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return "";
	}
}

// ════════════════════════════════════════════════════════════════════
// WORKSPACE OPERATIONS
// ════════════════════════════════════════════════════════════════════

/** Check if a workspace exists by title */
export function workspaceExists(title: string): boolean {
	const output = exec("cmux list-workspaces 2>/dev/null");
	return output.includes(title);
}

/** Create a new workspace, returns workspace ref (e.g. "workspace:1") */
export function createWorkspace(cwd?: string, command?: string): string {
	let cmd = "cmux new-workspace";
	if (cwd) cmd += ` --cwd "${cwd}"`;
	if (command) cmd += ` --command "${command}"`;
	return exec(`${cmd} 2>/dev/null`);
}

/** Close a workspace by ref */
export function closeWorkspace(workspaceId: string): boolean {
	return exec(`cmux close-workspace --workspace "${workspaceId}" 2>/dev/null`) !== "";
}

/** Rename a workspace */
export function renameWorkspace(title: string, workspaceId?: string): boolean {
	let cmd = `cmux rename-workspace "${title}"`;
	if (workspaceId) cmd += ` --workspace "${workspaceId}"`;
	return exec(`${cmd} 2>/dev/null`) !== "";
}

// ════════════════════════════════════════════════════════════════════
// SURFACE OPERATIONS
// ════════════════════════════════════════════════════════════════════

/** Check if a surface exists by trying to identify it */
export function surfaceExists(surfaceId: string): boolean {
	if (!surfaceId) return false;
	return exec(`cmux identify --surface "${surfaceId}" 2>/dev/null`) !== "";
}

/** Read terminal screen content */
export function readScreen(surfaceId: string, lines = 30, scrollback = false): string {
	let cmd = `cmux read-screen --surface "${surfaceId}" --lines ${lines}`;
	if (scrollback) cmd += " --scrollback";
	return exec(`${cmd} 2>/dev/null`, 5000);
}

/** Send text to a surface (equivalent to typing + Enter) */
export function sendText(surfaceId: string, text: string): boolean {
	const escaped = text.replace(/'/g, "'\\''");
	return exec(`cmux send --surface "${surfaceId}" '${escaped}' 2>/dev/null`, 5000) !== "" || true;
}

/** Send a key to a surface (e.g. "escape", "ctrl+c", "enter") */
export function sendKey(surfaceId: string, key: string): boolean {
	return exec(`cmux send-key --surface "${surfaceId}" "${key}" 2>/dev/null`, 5000) !== "" || true;
}

/** Split a surface, returns the new surface ref */
export function splitSurface(
	surfaceId: string,
	direction: "up" | "down" | "left" | "right" = "down",
): string {
	return exec(`cmux new-split ${direction} --surface "${surfaceId}" 2>/dev/null`);
}

/** Close a surface */
export function closeSurface(surfaceId: string): boolean {
	exec(`cmux close-surface --surface "${surfaceId}" 2>/dev/null`);
	return true;
}

/** Rename a surface's tab */
export function renameSurface(surfaceId: string, title: string): boolean {
	exec(`cmux rename-tab --surface "${surfaceId}" "${title}" 2>/dev/null`);
	return true;
}

// ════════════════════════════════════════════════════════════════════
// NOTIFICATIONS & SIDEBAR
// ════════════════════════════════════════════════════════════════════

/** Send a desktop notification */
export function notify(title: string, body?: string, subtitle?: string): boolean {
	let cmd = `cmux notify --title "${title}"`;
	if (body) cmd += ` --body "${body}"`;
	if (subtitle) cmd += ` --subtitle "${subtitle}"`;
	exec(`${cmd} 2>/dev/null`);
	return true;
}

/** Set a sidebar status entry */
export function setStatus(key: string, value: string, icon?: string, color?: string): boolean {
	let cmd = `cmux set-status "${key}" "${value}"`;
	if (icon) cmd += ` --icon "${icon}"`;
	if (color) cmd += ` --color "${color}"`;
	exec(`${cmd} 2>/dev/null`);
	return true;
}

/** Set sidebar progress bar (0.0-1.0) */
export function setProgress(value: number, label?: string): boolean {
	let cmd = `cmux set-progress ${value}`;
	if (label) cmd += ` --label "${label}"`;
	exec(`${cmd} 2>/dev/null`);
	return true;
}

/** Log a message to the sidebar log */
export function log(message: string, level?: string, source?: string): boolean {
	let cmd = `cmux log -- "${message}"`;
	if (level) cmd += ` --level "${level}"`;
	if (source) cmd += ` --source "${source}"`;
	exec(`${cmd} 2>/dev/null`);
	return true;
}

/** Read sidebar state (JSON output) */
export function sidebarState(workspaceId?: string): string {
	let cmd = "cmux sidebar-state";
	if (workspaceId) cmd += ` --workspace "${workspaceId}"`;
	return exec(`${cmd} 2>/dev/null`);
}

// ════════════════════════════════════════════════════════════════════
// BROWSER OPERATIONS (for E2E gate)
// ════════════════════════════════════════════════════════════════════

/** Take an accessibility snapshot of the embedded browser */
export function browserSnapshot(interactive = true): string {
	const flag = interactive ? " --interactive" : "";
	return exec(`cmux browser snapshot${flag} 2>/dev/null`, 10000);
}

/** Navigate embedded browser to URL */
export function browserNavigate(url: string, snapshotAfter = false): string {
	const flag = snapshotAfter ? " --snapshot-after" : "";
	return exec(`cmux browser goto "${url}"${flag} 2>/dev/null`, 15000);
}

/** Click an element in the embedded browser by ref */
export function browserClick(ref: string, snapshotAfter = false): string {
	const flag = snapshotAfter ? " --snapshot-after" : "";
	return exec(`cmux browser click "${ref}"${flag} 2>/dev/null`, 10000);
}

/** Fill an input in the embedded browser */
export function browserFill(ref: string, value: string, snapshotAfter = false): string {
	const flag = snapshotAfter ? " --snapshot-after" : "";
	return exec(`cmux browser fill "${ref}" "${value}"${flag} 2>/dev/null`, 10000);
}

// ════════════════════════════════════════════════════════════════════
// RUNTIME DETECTION
// ════════════════════════════════════════════════════════════════════

/** Detect whether we're running inside cmux or tmux */
export function detectRuntime(): "cmux" | "tmux" | "none" {
	if (process.env.CMUX_SOCKET_PATH || process.env.CMUX_SURFACE_ID) {
		// Verify cmux is responsive
		const result = exec("cmux ping 2>/dev/null");
		if (result) return "cmux";
	}

	try {
		execSync("tmux list-sessions 2>/dev/null", { timeout: 2000 });
		return "tmux";
	} catch {
		return "none";
	}
}

/** Check if cmux is available and responsive */
export function ping(): boolean {
	const result = exec("cmux ping 2>/dev/null");
	return result !== "";
}

/** Get hierarchy tree */
export function tree(all = false, workspaceId?: string): string {
	let cmd = "cmux tree";
	if (all) cmd += " --all";
	if (workspaceId) cmd += ` --workspace "${workspaceId}"`;
	return exec(`${cmd} 2>/dev/null`);
}
