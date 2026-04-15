#!/usr/bin/env node
/**
 * L-Thread Terminal Dashboard — Live cmux surface viewer with smart copy
 *
 * MUST RUN INSIDE A CMUX TERMINAL (needs socket access).
 * Polls all surfaces every 2s and serves a live dashboard at http://localhost:3456
 *
 * Features:
 *   - Live terminal content from all cmux surfaces
 *   - Smart copy: tracks last-copied checkpoint per surface, copies only new lines
 *   - "Copy All New" button: grabs deltas from all surfaces in one click
 *   - Event log: server-side diff tracking, only new content since last copy
 *   - Phase/status/wave indicators from supervisor state files
 *
 * Usage: node dashboard.mjs
 */

import { execSync } from "child_process";
import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.DASH_PORT || "3456");

// Server-side checkpoint tracking: last-copied content hash per surface
const checkpoints = new Map(); // ref -> { content: string, ts: number }

function exec(cmd, timeout = 5000) {
	try {
		return execSync(cmd, { encoding: "utf-8", timeout, stdio: ["pipe", "pipe", "pipe"] }).trim();
	} catch {
		return "";
	}
}

function getSurfaces() {
	const tree = exec("cmux tree --all 2>/dev/null");
	if (!tree) return { tree: "cmux not available", surfaces: [], layout: null, state: null };

	const surfaceRefs = [...tree.matchAll(/surface:(\d+)/g)].map(m => `surface:${m[1]}`);

	const surfaces = surfaceRefs.map(ref => {
		const screen = exec(`cmux read-screen --surface "${ref}" --lines 80 2>/dev/null`);
		const titleMatch = tree.match(new RegExp(`${ref.replace(":", "\\:")}.*?"([^"]+)"`));
		const title = titleMatch ? titleMatch[1] : ref;
		const isActive = tree.includes(`${ref} [terminal] "${title}" [selected] ◀ active`);
		const isHere = tree.includes(`${ref} [terminal] "${title}" [selected] ◀ here`);

		// Compute delta from last checkpoint
		const cp = checkpoints.get(ref);
		let newLines = 0;
		if (cp && screen) {
			const cpIdx = screen.indexOf(cp.content.slice(-200));
			if (cpIdx >= 0) {
				const delta = screen.slice(cpIdx + cp.content.slice(-200).length);
				newLines = delta.split("\n").filter(l => l.trim()).length;
			} else {
				newLines = screen.split("\n").filter(l => l.trim()).length;
			}
		} else if (screen) {
			newLines = screen.split("\n").filter(l => l.trim()).length;
		}

		return { ref, title, screen, isActive, isHere, newLines };
	});

	let layout = null, state = null, registry = null, wave = null;
	try { const p = join(__dirname, "_bmad", "pane-layout.json"); if (existsSync(p)) layout = JSON.parse(readFileSync(p, "utf-8")); } catch {}
	try { const p = join(__dirname, "_bmad", "supervisor-state.json"); if (existsSync(p)) state = JSON.parse(readFileSync(p, "utf-8")); } catch {}
	try { const p = join(__dirname, "_bmad", "session-registry.json"); if (existsSync(p)) registry = JSON.parse(readFileSync(p, "utf-8")); } catch {}
	try { const p = join(__dirname, "_bmad", "bmad-wave-state.json"); if (existsSync(p)) wave = JSON.parse(readFileSync(p, "utf-8")); } catch {}

	return { tree, surfaces, layout, state, registry, wave };
}

function markCheckpoint(ref, content) {
	checkpoints.set(ref, { content, ts: Date.now() });
}

function getDelta(ref, currentContent) {
	const cp = checkpoints.get(ref);
	if (!cp) return currentContent || "";
	if (!currentContent) return "";
	// Find where the checkpoint content ends in current content
	const tail = cp.content.slice(-300);
	const idx = currentContent.indexOf(tail);
	if (idx >= 0) {
		return currentContent.slice(idx + tail.length);
	}
	// Can't find checkpoint — return everything
	return currentContent;
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>L-Thread Dashboard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;
    padding: 12px; min-height: 100vh;
  }
  .header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 10px 16px;
    background: #161b22; border: 1px solid #30363d; border-radius: 8px; flex-wrap: wrap;
  }
  .header h1 { font-size: 18px; font-weight: 600; color: #f0f6fc; }
  .badge {
    display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .badge-run { background: #1a7f37; color: #fff; }
  .badge-pause { background: #9e6a03; color: #fff; }
  .badge-stop { background: #6e7681; color: #fff; }
  .badge-crash { background: #da3633; color: #fff; }
  .badge-wave { background: #1f6feb; color: #fff; }
  .badge-human { background: #bf8700; color: #fff; }
  .meta { font-size: 12px; color: #8b949e; }
  .meta b { color: #c9d1d9; }

  .copy-all-btn {
    margin-left: auto; padding: 6px 14px; border-radius: 6px; border: 1px solid #30363d;
    background: #21262d; color: #c9d1d9; font-size: 12px; font-weight: 500; cursor: pointer;
    transition: all 0.15s;
  }
  .copy-all-btn:hover { background: #30363d; border-color: #8b949e; }
  .copy-all-btn.copied { background: #1a7f37; border-color: #3fb950; color: #fff; }
  .new-badge {
    display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 10px;
    font-weight: 600; background: #da3633; color: #fff; margin-left: 4px; min-width: 18px; text-align: center;
  }
  .new-badge.zero { background: #30363d; color: #484f58; }

  .grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: 12px;
  }
  .terminal {
    background: #0d1117; border: 1px solid #30363d; border-radius: 8px; overflow: hidden;
    display: flex; flex-direction: column; max-height: 560px;
  }
  .terminal.supervisor { border-color: #1f6feb; }
  .terminal.orchestrator { border-color: #1a7f37; }
  .terminal.worker { border-color: #9e6a03; }
  .terminal.has-new { box-shadow: 0 0 0 1px rgba(218, 54, 51, 0.4); }
  .terminal-header {
    display: flex; align-items: center; gap: 8px; padding: 6px 12px;
    background: #161b22; border-bottom: 1px solid #30363d; font-size: 13px; font-weight: 600;
  }
  .terminal-header .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot-green { background: #3fb950; }
  .dot-blue { background: #58a6ff; }
  .dot-yellow { background: #d29922; }
  .dot-gray { background: #484f58; }
  .copy-btn {
    margin-left: auto; padding: 3px 10px; border-radius: 4px; border: 1px solid #30363d;
    background: #21262d; color: #8b949e; font-size: 11px; cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .copy-btn:hover { background: #30363d; color: #c9d1d9; }
  .copy-btn.copied { background: #1a7f37; border-color: #3fb950; color: #fff; }
  .terminal-body {
    padding: 8px 12px; font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 11.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-all;
    overflow-y: auto; flex: 1; color: #e6edf3;
  }
  .terminal-body .new-content { background: rgba(56, 139, 253, 0.08); border-left: 2px solid #58a6ff; padding-left: 6px; margin-left: -8px; }
  .status-bar {
    display: flex; gap: 16px; padding: 8px 16px; background: #161b22;
    border: 1px solid #30363d; border-radius: 8px; margin-bottom: 12px;
    font-size: 12px; flex-wrap: wrap; align-items: center;
  }
  .status-item { display: flex; align-items: center; gap: 4px; }
  .status-label { color: #8b949e; }
  .status-value { color: #f0f6fc; font-weight: 500; }
  .wave-bar { display: flex; gap: 4px; align-items: center; }
  .wave-block { width: 20px; height: 12px; border-radius: 2px; }
  .wave-done { background: #3fb950; }
  .wave-running { background: #58a6ff; animation: pulse 1.5s infinite; }
  .wave-pending { background: #30363d; }
  .wave-failed { background: #f85149; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #3fb950; animation: pulse 2s infinite; display: inline-block; margin-right: 6px; }
  .updated { font-size: 11px; color: #484f58; }
  .toast {
    position: fixed; bottom: 20px; right: 20px; padding: 10px 18px; border-radius: 8px;
    background: #1a7f37; color: #fff; font-size: 13px; font-weight: 500;
    opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 100;
  }
  .toast.show { opacity: 1; }
</style>
</head>
<body>
<div class="header">
  <h1>L-Thread Dashboard</h1>
  <span class="badge" id="phase-badge">...</span>
  <span class="meta" id="task-meta"></span>
  <span class="updated" id="updated"></span>
  <button class="copy-all-btn" id="copy-all" onclick="copyAllNew()">Copy All New</button>
</div>

<div class="status-bar" id="status-bar"></div>
<div class="grid" id="grid"></div>
<div class="toast" id="toast"></div>

<script>
const POLL_MS = 2000;
let lastData = null;

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function classify(title, layout) {
  if (!layout) return 'worker';
  if (title === 'Pi Supervisor' || title.includes('Supervisor')) return 'supervisor';
  if (title.includes('Orchestrator')) return 'orchestrator';
  return 'worker';
}
function dotColor(cls) {
  return cls === 'supervisor' ? 'dot-blue' : cls === 'orchestrator' ? 'dot-green' : 'dot-yellow';
}
function phaseBadge(phase) {
  const m = { stopped:'badge-stop', starting:'badge-run', running:'badge-run',
    silent:'badge-pause', nudging:'badge-pause', stalled:'badge-crash',
    crashed:'badge-crash', paused:'badge-pause',
    wave_running:'badge-wave', wave_merging:'badge-wave', awaiting_human:'badge-human' };
  return m[phase] || 'badge-stop';
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

async function copyNewForSurface(ref) {
  const res = await fetch('/api/copy-new?ref=' + encodeURIComponent(ref));
  const { delta, lines } = await res.json();
  if (delta.trim()) {
    await navigator.clipboard.writeText(delta);
    toast('Copied ' + lines + ' new lines from ' + ref);
    // Mark button
    const btn = document.querySelector('[data-copy-ref="' + ref + '"]');
    if (btn) { btn.classList.add('copied'); btn.textContent = 'Copied!'; setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy New'; }, 1500); }
    // Re-poll to update new-line counts
    setTimeout(poll, 300);
  } else {
    toast('No new content');
  }
}

async function copyAllNew() {
  const res = await fetch('/api/copy-all-new');
  const { text, totalLines, surfaceCount } = await res.json();
  if (text.trim()) {
    await navigator.clipboard.writeText(text);
    toast('Copied ' + totalLines + ' lines from ' + surfaceCount + ' surfaces');
    const btn = document.getElementById('copy-all');
    btn.classList.add('copied'); btn.textContent = 'Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copy All New'; }, 1500);
    setTimeout(poll, 300);
  } else {
    toast('No new content across any surface');
  }
}

async function copyFullSurface(ref) {
  if (!lastData) return;
  const s = lastData.surfaces.find(x => x.ref === ref);
  if (s?.screen) {
    await navigator.clipboard.writeText(s.screen);
    // Also checkpoint it
    await fetch('/api/checkpoint?ref=' + encodeURIComponent(ref), { method: 'POST' });
    toast('Copied full output + checkpointed');
    setTimeout(poll, 300);
  }
}

async function poll() {
  try {
    const res = await fetch('/api/surfaces');
    lastData = await res.json();
    render(lastData);
  } catch {}
}

function render(data) {
  const { surfaces, layout, state, registry, wave } = data;
  const phase = state?.phase || 'unknown';

  const pb = document.getElementById('phase-badge');
  pb.textContent = phase.replace('_', ' ');
  pb.className = 'badge ' + phaseBadge(phase);

  const tm = document.getElementById('task-meta');
  const task = state?.task || registry?.session?.task || '';
  tm.innerHTML = task ? '<b>Task:</b> ' + escapeHtml(task.slice(0, 80)) : '';

  document.getElementById('updated').textContent = new Date().toLocaleTimeString();

  // Status bar
  const sb = document.getElementById('status-bar');
  const silence = state?.lastOutputAt ? Math.round((Date.now() - state.lastOutputAt) / 1000) : '?';
  let sh = '';
  sh += '<div class="status-item"><span class="pulse-dot"></span><span class="status-label">Silence:</span><span class="status-value">' + silence + 's</span></div>';
  sh += '<div class="status-item"><span class="status-label">Nudges:</span><span class="status-value">' + (state?.nudgeCount||0) + '/' + (state?.totalNudges||0) + '</span></div>';
  sh += '<div class="status-item"><span class="status-label">Restarts:</span><span class="status-value">' + (state?.totalRestarts||0) + '</span></div>';
  sh += '<div class="status-item"><span class="status-label">Workers:</span><span class="status-value">' + (layout?.workerPanes?.length||0) + '</span></div>';
  sh += '<div class="status-item"><span class="status-label">Session:</span><span class="status-value">' + (registry?.session?.id||'?').slice(-8) + '</span></div>';
  if (wave?.wave) {
    const w = wave.wave;
    const done = w.stories.filter(s => s.status==='done').length;
    sh += '<div class="status-item"><span class="status-label">Wave:</span><span class="status-value">' + w.id + ' (' + done + '/' + w.stories.length + ')</span></div>';
    sh += '<div class="wave-bar">';
    w.stories.forEach(s => {
      const c = s.status==='done'?'wave-done':s.status==='running'?'wave-running':s.status==='failed'?'wave-failed':'wave-pending';
      sh += '<div class="wave-block '+c+'" title="'+escapeHtml(s.title||s.id)+'"></div>';
    });
    sh += '</div>';
  }
  sb.innerHTML = sh;

  // Terminal grid
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  surfaces.forEach(s => {
    const cls = classify(s.title, layout);
    const hasNew = s.newLines > 0;
    const div = document.createElement('div');
    div.className = 'terminal ' + cls + (hasNew ? ' has-new' : '');
    const newBadge = '<span class="new-badge ' + (hasNew ? '' : 'zero') + '">' + s.newLines + '</span>';
    const lines = s.screen ? escapeHtml(s.screen) : '<span style="color:#484f58">(empty)</span>';
    div.innerHTML =
      '<div class="terminal-header">' +
        '<div class="dot ' + dotColor(cls) + '"></div>' +
        escapeHtml(s.title) + ' <span style="color:#484f58;font-weight:400;font-size:11px">' + s.ref + '</span>' +
        newBadge +
        '<button class="copy-btn" data-copy-ref="' + s.ref + '" onclick="copyNewForSurface(\\''+s.ref+'\\')">Copy New</button>' +
        '<button class="copy-btn" style="margin-left:4px" onclick="copyFullSurface(\\''+s.ref+'\\')">Full</button>' +
      '</div>' +
      '<div class="terminal-body">' + lines + '</div>';
    grid.appendChild(div);
    // Auto-scroll to bottom
    const body = div.querySelector('.terminal-body');
    body.scrollTop = body.scrollHeight;
  });
}

setInterval(poll, POLL_MS);
poll();
</script>
</body>
</html>`;

const server = createServer((req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);

	if (url.pathname === "/api/surfaces") {
		res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
		res.end(JSON.stringify(getSurfaces()));

	} else if (url.pathname === "/api/copy-new") {
		const ref = url.searchParams.get("ref");
		const data = getSurfaces();
		const surface = data.surfaces.find(s => s.ref === ref);
		const delta = surface ? getDelta(ref, surface.screen) : "";
		const lines = delta.split("\n").filter(l => l.trim()).length;
		// Checkpoint after copy
		if (surface?.screen) markCheckpoint(ref, surface.screen);
		res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
		res.end(JSON.stringify({ delta, lines }));

	} else if (url.pathname === "/api/copy-all-new") {
		const data = getSurfaces();
		const parts = [];
		let totalLines = 0;
		let surfaceCount = 0;
		for (const s of data.surfaces) {
			const delta = getDelta(s.ref, s.screen);
			if (delta.trim()) {
				const lines = delta.split("\n").filter(l => l.trim()).length;
				parts.push(`=== ${s.title} (${s.ref}) === [${lines} new lines]\n${delta}`);
				totalLines += lines;
				surfaceCount++;
			}
			if (s.screen) markCheckpoint(s.ref, s.screen);
		}
		const text = parts.join("\n\n");
		res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
		res.end(JSON.stringify({ text, totalLines, surfaceCount }));

	} else if (url.pathname === "/api/checkpoint" && req.method === "POST") {
		const ref = url.searchParams.get("ref");
		const data = getSurfaces();
		const surface = data.surfaces.find(s => s.ref === ref);
		if (surface?.screen) markCheckpoint(ref, surface.screen);
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ ok: true }));

	} else {
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(HTML);
	}
});

server.listen(PORT, () => {
	console.log(`\n  L-Thread Dashboard: http://localhost:${PORT}\n`);
	console.log(`  Features:`);
	console.log(`    - Live terminal polling (2s)`);
	console.log(`    - "Copy New" per surface (only lines since last copy)`);
	console.log(`    - "Copy All New" (deltas from all surfaces)`);
	console.log(`    - "Full" button (full output + checkpoint)`);
	console.log(`    - Red badge = new lines since last copy\n`);
	console.log(`  Press Ctrl+C to stop\n`);
});
