#!/usr/bin/env python3
import os
import subprocess
import datetime
from pathlib import Path

directories = [
    "agent-economy", "agent-harnesses", "agent-memory", "agent-protocols",
    "articles", "code-intelligence", "developer-gui", "infrastructure",
    "observability", "orchestration-platforms", "posts", "practitioners",
    "reference", "talks"
]

category_labels = {
    "agent-economy": "�� Agent Economy",
    "agent-harnesses": "⚙️ Agent Harnesses",
    "agent-memory": "🧠 Agent Memory",
    "agent-protocols": "🔗 Agent Protocols",
    "articles": "📝 Articles",
    "code-intelligence": "🧬 Code Intel",
    "developer-gui": "🖥️ Dev GUI",
    "infrastructure": "🏗️ Infrastructure",
    "observability": "🔍 Observability",
    "orchestration-platforms": "🎛️ Orchestration",
    "posts": "🐦 Posts",
    "practitioners": "👤 Practitioners",
    "reference": "📚 Reference",
    "talks": "🎤 Talks",
}

def get_git_added_date(filepath):
    try:
        res = subprocess.run(["git", "log", "--diff-filter=A", "--format=%aI", "-1", "--", filepath], capture_output=True, text=True)
        if res.stdout.strip():
            return res.stdout.strip()
    except Exception:
        pass
    
    try:
        res = subprocess.run(["git", "log", "--format=%aI", "-1", "--", filepath], capture_output=True, text=True)
        if res.stdout.strip():
            return res.stdout.strip()
    except Exception:
        pass
        
    return datetime.datetime.now().isoformat()

base_dir = Path(__file__).parent
entries = []

for d in directories:
    dir_path = base_dir / d
    if not dir_path.exists():
        continue
    for md_file in dir_path.rglob("*.md"):
        if "_TEMPLATE" in md_file.name:
            continue
        rel_path = md_file.relative_to(base_dir)
        
        # Must run git inside the base_dir
        os.chdir(base_dir)
        git_date = get_git_added_date(str(rel_path))
        
        title = md_file.name
        try:
            with open(md_file, "r") as f:
                first_line = f.readline().strip()
                if first_line.startswith("# "):
                    title = first_line[2:].strip()
        except:
            pass
            
        date_only = git_date.split("T")[0] if "T" in git_date else git_date.split(" ")[0]
        
        entries.append({
            "date": git_date,
            "date_display": date_only,
            "category": category_labels.get(d, d),
            "title": title,
            "path": str(rel_path)
        })

entries.sort(key=lambda x: x["date"], reverse=True)

with open(base_dir / "TIMELINE.md", "w") as f:
    f.write("# Chronological Timeline of Catalogue Entries\n\n")
    f.write("> Automatically generated overview of what was consumed when, sorted newest to oldest.\n\n")
    f.write(f"**Last updated:** {datetime.datetime.now().strftime('%Y-%m-%d')}\n")
    f.write(f"**Total entries:** {len(entries)}\n\n")
    f.write("---\n\n")
    f.write("| Added Date | Category | Title |\n")
    f.write("|------------|----------|-------|\n")
    for e in entries:
        f.write(f"| {e['date_display']} | {e['category']} | [{e['title']}](./{e['path']}) |\n")

print(f"Generated TIMELINE.md with {len(entries)} entries.")
