/**
 * Orchestrator Discipline — Enforces "DU BIST KEIN ENTWICKLER"
 *
 * Blocks Edit/Write on code files. The orchestrator can only write to
 * state files (_bmad/*.json, .bmad/devlog.md) and read everything else.
 *
 * This is the Pi extension equivalent of the Conduit orchestrator's Rule 1.
 * Unlike a prompt-based rule, this is a PHYSICAL BLOCK that cannot be
 * bypassed by context length, compaction, or prompt injection.
 *
 * Usage: pi -e extensions/orchestrator-discipline.ts
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";
import * as path from "path";

const CODE_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
	".py", ".go", ".rs", ".java", ".rb", ".php",
	".vue", ".svelte", ".astro",
	".css", ".scss", ".less", ".sass",
	".html", ".htm",
	".sql",
	".sh", ".bash", ".zsh",
	".c", ".cpp", ".h", ".hpp",
]);

// Files the orchestrator IS allowed to write
const ALLOWED_WRITE_PATTERNS = [
	"_bmad/",
	".bmad/",
	"orchestrator-state",
	"devlog.md",
	"orchestrator-tmux-state",
];

function isCodeFile(filePath: string): boolean {
	const ext = path.extname(filePath).toLowerCase();
	return CODE_EXTENSIONS.has(ext);
}

function isAllowedWrite(filePath: string, cwd: string): boolean {
	const relative = path.relative(cwd, filePath);
	return ALLOWED_WRITE_PATTERNS.some(pattern => relative.includes(pattern));
}

export default function (pi: ExtensionAPI) {
	let blockedCount = 0;

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify(
			"🛡️ Discipline: DU BIST KEIN ENTWICKLER — code writes blocked",
			"info",
		);
		ctx.ui.setStatus("discipline", "🛡️ Discipline Active");
	});

	pi.on("tool_call", async (event, ctx) => {
		// Block write/edit on code files
		if (isToolCallEventType("write", event) || isToolCallEventType("edit", event)) {
			const filePath = event.input.path;
			const resolved = path.resolve(ctx.cwd, filePath);

			if (isAllowedWrite(resolved, ctx.cwd)) {
				return { block: false };
			}

			if (isCodeFile(resolved)) {
				blockedCount++;
				pi.appendEntry("discipline-log", {
					tool: event.toolName,
					path: filePath,
					action: "blocked_code_write",
					timestamp: new Date().toISOString(),
				});

				ctx.ui.notify(
					`🛑 BLOCKED: ${event.toolName} on ${path.basename(filePath)} — DU BIST KEIN ENTWICKLER`,
					"error",
				);
				ctx.ui.setStatus("discipline", `🛡️ Discipline: ${blockedCount} blocked`);

				ctx.abort();
				return {
					block: true,
					reason: `🛑 BLOCKED: DU BIST KEIN ENTWICKLER!\n\nYou attempted to ${event.toolName} a code file: ${filePath}\n\nAs the orchestrator, you NEVER write code. You MUST:\n1. Use tmux_dispatch to send this work to a dev agent\n2. Wait for the agent to complete via tmux_wait\n3. Review the result\n\nDO NOT retry this action. Spawn a dev agent instead.`,
				};
			}
		}

		// Block bash commands that write code
		if (isToolCallEventType("bash", event)) {
			const cmd = event.input.command;

			// Block sed/awk/tee/cat-heredoc that modify code files
			const codeWritePatterns = [
				/\bsed\s+-i/,
				/\bawk\s+.*-i\s+inplace/,
				/>\s*\S+\.(ts|tsx|js|jsx|py|go|rs|css|html|sql)\b/,
				/\btee\s+\S+\.(ts|tsx|js|jsx|py|go|rs|css|html|sql)\b/,
			];

			for (const pattern of codeWritePatterns) {
				if (pattern.test(cmd)) {
					blockedCount++;
					pi.appendEntry("discipline-log", {
						tool: "bash",
						command: cmd,
						action: "blocked_bash_code_write",
						timestamp: new Date().toISOString(),
					});

					ctx.ui.notify(`🛑 BLOCKED: bash code write — ${cmd.slice(0, 60)}`, "error");
					ctx.abort();
					return {
						block: true,
						reason: `🛑 BLOCKED: Bash command appears to write code files.\n\nCommand: ${cmd}\n\nUse tmux_dispatch to delegate this work to a dev agent.`,
					};
				}
			}
		}

		return { block: false };
	});
}
