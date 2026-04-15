#!/usr/bin/env bash
# detect-deps.sh — Auto-detect cross-project dependencies
# Part of Venture Spine (Wave 3, Task 1)
# Scans all projects registered in projects.json and outputs dependencies.yaml
#
# Usage: ./detect-deps.sh [--quiet]
# Requires: python3, git, grep
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECTS_JSON="$SCRIPT_DIR/projects.json"
OUTPUT="$SCRIPT_DIR/dependencies.yaml"
QUIET="${1:-}"

if [ ! -f "$PROJECTS_JSON" ]; then
  echo "ERROR: projects.json not found at $PROJECTS_JSON" >&2
  exit 1
fi

# The heavy lifting is in Python to avoid bash 3.x limitations on macOS
python3 << 'PYEOF'
import json, os, subprocess, re, sys
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = os.environ.get("SCRIPT_DIR", os.path.dirname(os.path.abspath(__file__)))
PROJECTS_JSON = os.path.join(SCRIPT_DIR, "projects.json")
OUTPUT = os.path.join(SCRIPT_DIR, "dependencies.yaml")
CODE2 = "/Users/buraksmac/Desktop/code2"
CLAUDE_PROJECTS = os.path.expanduser("~/.claude/projects")
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

with open(PROJECTS_JSON) as f:
    registry = json.load(f)

projects = registry["projects"]
keys = list(projects.keys())
edges = []  # each edge is a dict


# ── 1. Shared npm/pip dependencies ──────────────────────────────────────────

def collect_npm_deps(project_dir):
    """Collect all npm dependencies from a project, including monorepo sub-packages."""
    all_deps = set()
    locations = [project_dir]
    for subdir in ["apps", "packages"]:
        sub_path = os.path.join(project_dir, subdir)
        if os.path.isdir(sub_path):
            for name in os.listdir(sub_path):
                locations.append(os.path.join(sub_path, name))
    for loc in locations:
        pkg = os.path.join(loc, "package.json")
        if os.path.exists(pkg):
            try:
                data = json.load(open(pkg))
                all_deps |= set(data.get("dependencies", {}).keys())
                all_deps |= set(data.get("devDependencies", {}).keys())
            except Exception:
                pass
    # Filter workspace-internal packages (turborepo/pnpm workspace refs)
    all_deps = {d for d in all_deps if not d.startswith("@adwo/") and not d.startswith("@cityhub/")}
    return all_deps

npm_deps = {}
for key in keys:
    d = projects[key]["path"]
    if os.path.exists(os.path.join(d, "package.json")):
        npm_deps[key] = collect_npm_deps(d)

KEY_FRAMEWORKS = {"next", "react", "react-dom", "@supabase/supabase-js", "tailwindcss",
                  "express", "vite", "vue", "angular", "svelte", "fastify"}

for i, k1 in enumerate(keys):
    for k2 in keys[i+1:]:
        if k1 not in npm_deps or k2 not in npm_deps:
            continue
        shared = npm_deps[k1] & npm_deps[k2]
        key_shared = shared & KEY_FRAMEWORKS
        if len(shared) >= 5 and key_shared:
            edges.append({
                "section": "shared_stack",
                "from": k1, "to": k2,
                "type": "shared-stack",
                "count": len(shared),
                "key_packages": ", ".join(sorted(key_shared)),
            })


# ── 2. Shared infrastructure ────────────────────────────────────────────────

# 2a. Vercel org
vercel_orgs = {}
for key in keys:
    vj = os.path.join(projects[key]["path"], ".vercel", "project.json")
    if os.path.exists(vj):
        try:
            vercel_orgs[key] = json.load(open(vj)).get("orgId", "")
        except Exception:
            pass
# Group by org
org_groups = defaultdict(list)
for k, org in vercel_orgs.items():
    if org:
        org_groups[org].append(k)
for org, members in org_groups.items():
    if len(members) > 1:
        edges.append({
            "section": "shared_infra",
            "projects": members,
            "type": "shared-infra",
            "service": "vercel",
            "detail": "Same Vercel team org",
        })

# 2b. GitHub org
gh_orgs = {}
for key in keys:
    d = projects[key]["path"]
    if os.path.isdir(os.path.join(d, ".git")):
        try:
            url = subprocess.check_output(
                ["git", "-C", d, "remote", "get-url", "origin"],
                stderr=subprocess.DEVNULL, text=True
            ).strip()
            m = re.search(r"github\.com[:/]([^/]+)", url)
            if m:
                gh_orgs[key] = m.group(1)
        except Exception:
            pass
gh_org_groups = defaultdict(list)
for k, org in gh_orgs.items():
    gh_org_groups[org].append(k)
for org, members in gh_org_groups.items():
    if len(members) > 1:
        edges.append({
            "section": "shared_infra",
            "projects": members,
            "type": "shared-infra",
            "service": "github",
            "detail": f"Same GitHub org ({org})",
        })

# 2c. Supabase users
supabase_users = []
for key in keys:
    d = projects[key]["path"]
    uses_sb = False
    if os.path.isdir(os.path.join(d, "supabase")):
        uses_sb = True
    for envfile in [".env", ".env.local", ".env.example"]:
        ef = os.path.join(d, envfile)
        if os.path.exists(ef):
            try:
                content = open(ef).read()
                if "supabase" in content.lower():
                    uses_sb = True
            except Exception:
                pass
    pkg = os.path.join(d, "package.json")
    if os.path.exists(pkg):
        try:
            if "@supabase/supabase-js" in json.load(open(pkg)).get("dependencies", {}):
                uses_sb = True
        except Exception:
            pass
    if uses_sb:
        supabase_users.append(key)
if len(supabase_users) > 1:
    edges.append({
        "section": "shared_infra",
        "projects": supabase_users,
        "type": "shared-infra",
        "service": "supabase",
        "detail": "All use Supabase (separate instances)",
    })

# 2d. bmad orchestration pattern
bmad_users = []
for key in keys:
    d = projects[key]["path"]
    if os.path.isdir(os.path.join(d, "_bmad")) or os.path.isdir(os.path.join(d, ".bmad")):
        bmad_users.append(key)
if len(bmad_users) > 1:
    edges.append({
        "section": "shared_infra",
        "projects": bmad_users,
        "type": "shared-infra",
        "service": "bmad-orchestration",
        "detail": "Shared _bmad orchestration pattern from L-Thread",
    })

# 2e. Claude Code usage
claude_users = []
for key in keys:
    d = projects[key]["path"]
    if os.path.isdir(os.path.join(d, ".claude")):
        claude_users.append(key)
if len(claude_users) > 1:
    edges.append({
        "section": "shared_infra",
        "projects": claude_users,
        "type": "shared-infra",
        "service": "claude-code",
        "detail": "All use Claude Code (.claude/ directory present)",
    })


# ── 3. Knowledge dependencies ───────────────────────────────────────────────

# 3a. Orchestrator research catalogue referencing other projects
research_dir = os.path.join(CODE2, "orchestrator", "research")
if os.path.isdir(research_dir):
    for key in keys:
        if key == "orchestrator":
            continue
        search_terms = [key, key.replace("-", " "), key.replace("-", "")]
        count = 0
        for root, dirs, files in os.walk(research_dir):
            dirs[:] = [d for d in dirs if d != ".git"]
            for fname in files:
                if not fname.endswith(".md"):
                    continue
                try:
                    content = open(os.path.join(root, fname)).read().lower()
                    if any(term in content for term in search_terms):
                        count += 1
                except Exception:
                    pass
        if count > 0:
            edges.append({
                "section": "knowledge",
                "from": "orchestrator", "to": key,
                "type": "knowledge",
                "detail": f"{count} research files reference {key} patterns",
            })

# 3b. MEMORY.md cross-references
if os.path.isdir(CLAUDE_PROJECTS):
    for key in keys:
        dirname = os.path.basename(projects[key]["path"])
        # Find matching claude project dir
        for cpd in os.listdir(CLAUDE_PROJECTS):
            if dirname.lower().replace(" ", "-") in cpd.lower():
                mem_file = os.path.join(CLAUDE_PROJECTS, cpd, "memory", "MEMORY.md")
                if os.path.exists(mem_file):
                    try:
                        content = open(mem_file).read().lower()
                        for other in keys:
                            if other == key:
                                continue
                            if other in content or other.replace("-", " ") in content:
                                edges.append({
                                    "section": "knowledge",
                                    "from": key, "to": other,
                                    "type": "knowledge-memory",
                                    "detail": f"{key} MEMORY.md references {other}",
                                })
                    except Exception:
                        pass
                break


# ── 4. Git history cross-references ─────────────────────────────────────────

for key in keys:
    d = projects[key]["path"]
    if not os.path.isdir(os.path.join(d, ".git")):
        continue
    try:
        log = subprocess.check_output(
            ["git", "-C", d, "log", "--oneline", "-200"],
            stderr=subprocess.DEVNULL, text=True
        ).lower()
    except Exception:
        continue
    for other in keys:
        if other == key:
            continue
        terms = [other, other.replace("-", " ")]
        count = sum(1 for line in log.splitlines() if any(t in line for t in terms))
        if count > 0:
            edges.append({
                "section": "git_history",
                "from": key, "to": other,
                "type": "git-history",
                "mentions": count,
                "detail": f"{count} commits in {key} mention {other}",
            })


# ── 5. Business/sequence dependencies (from research synthesis) ─────────────

edges.append({
    "section": "business",
    "from": "contentos", "to": "omniport-hh",
    "type": "sequence",
    "detail": "ContentOS launches after OmniPort demo delivered",
})
edges.append({
    "section": "business",
    "from": "orchestrator", "to": "*",
    "type": "meta",
    "detail": "Orchestrator manages all other projects via Venture Spine",
})


# ── 6. Compute summary statistics ───────────────────────────────────────────

# Count connections per project
connections = defaultdict(int)
for e in edges:
    if "from" in e:
        connections[e["from"]] += 1
        if e.get("to") != "*":
            connections[e.get("to", "")] += 1
    if "projects" in e:
        for p in e["projects"]:
            connections[p] += 1

# Prefer orchestrator as hub when tied (it is the meta-project by definition)
max_count = max(connections.values()) if connections else 0
candidates = [k for k in keys if connections.get(k, 0) == max_count]
most_connected = "orchestrator" if "orchestrator" in candidates else candidates[0] if candidates else "unknown"
isolated = [k for k in keys if connections.get(k, 0) <= 2]


# ── 7. Emit YAML ────────────────────────────────────────────────────────────

def yaml_val(v):
    if isinstance(v, str):
        if any(c in v for c in ":{}[]#&*!|>',\"@"):
            return f'"{v}"'
        return f'"{v}"'
    if isinstance(v, int):
        return str(v)
    if isinstance(v, list):
        return "[" + ", ".join(yaml_val(i) for i in v) + "]"
    return str(v)

sections = ["shared_stack", "shared_infra", "knowledge", "git_history", "business"]
section_labels = {
    "shared_stack": "Shared technology stacks (projects using the same frameworks)",
    "shared_infra": "Shared infrastructure (same org, same services)",
    "knowledge": "Knowledge dependencies (research, patterns, MEMORY.md cross-refs)",
    "git_history": "Git history cross-references (commits mentioning other projects)",
    "business": "Business/sequence dependencies",
}

lines = []
lines.append(f"# dependencies.yaml -- Auto-generated cross-project dependency graph")
lines.append(f"# Generated: {NOW}")
lines.append(f"# Source: detect-deps.sh scanning {len(keys)} projects from projects.json")
lines.append(f'version: "1.0.0"')
lines.append(f'generated: "{NOW}"')
lines.append(f"project_count: {len(keys)}")
lines.append("")

for section in sections:
    lines.append(f"# {section_labels[section]}")
    lines.append(f"{section}:")
    section_edges = [e for e in edges if e["section"] == section]
    if not section_edges:
        lines.append("  []")
    for e in section_edges:
        fields = {k: v for k, v in e.items() if k != "section"}
        first = True
        for k, v in fields.items():
            if first:
                lines.append(f"  - {k}: {yaml_val(v)}")
                first = False
            else:
                lines.append(f"    {k}: {yaml_val(v)}")
    lines.append("")

lines.append("# Summary: dependency density")
lines.append("summary:")
lines.append(f"  total_edges: {len(edges)}")
lines.append(f"  most_connected: {yaml_val(most_connected)}")
lines.append(f"  most_connected_count: {connections.get(most_connected, 0)}")
lines.append(f"  hub_reason: \"Meta-project that manages all others; research catalogue references most projects\"")
lines.append(f"  isolated_projects: {yaml_val(isolated)}")
lines.append(f"  isolated_reason: \"Few code deps, few git cross-refs, or ideation/paused lifecycle\"")
lines.append("")
lines.append("# Per-project connection counts")
lines.append("connection_counts:")
for k in sorted(keys):
    lines.append(f"  {k}: {connections.get(k, 0)}")

with open(OUTPUT, "w") as f:
    f.write("\n".join(lines) + "\n")

print(f"Dependencies written to {OUTPUT}")
print(f"Total edges: {len(edges)}")
print(f"Most connected: {most_connected} ({connections.get(most_connected, 0)} edges)")
print(f"Isolated: {', '.join(isolated) if isolated else 'none'}")
PYEOF
