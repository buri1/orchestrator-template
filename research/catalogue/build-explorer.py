#!/usr/bin/env python3
import os
import json
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
    "agent-economy": "💰 Agent Economy",
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

base_dir = Path("/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue")

# Get git dates
file_dates = {}
try:
    res = subprocess.run(["git", "log", "--diff-filter=A", "--name-status", "--format=COMMIT_DATE:%aI"], cwd=base_dir, capture_output=True, text=True)
    current_date = None
    for line in res.stdout.splitlines():
        if line.startswith("COMMIT_DATE:"):
            current_date = line.split(":", 1)[1].strip()
        elif line.startswith("A\t"):
            filepath = line.split("\t", 1)[1].strip()
            if filepath.endswith(".md") and filepath not in file_dates:
                file_dates[filepath] = current_date
except Exception:
    pass

entries = []
seen_titles = set()

for d in directories:
    dir_path = base_dir / d
    if not dir_path.exists():
        continue
    for file_path in dir_path.rglob("*"):
        if file_path.name.startswith("_TEMPLATE"):
            continue
        if file_path.suffix not in [".md", ".json"]:
            continue
            
        rel_path = str(file_path.relative_to(base_dir))
        
        # Determine git date
        git_date = file_dates.get(rel_path)
        if not git_date:
            git_date = datetime.datetime.now().isoformat()
            
        if "T" in git_date:
            date_display = git_date[:16].replace("T", " ")
        else:
            date_display = git_date[:16]
            
        # Parse JSON X Activity
        if file_path.suffix == ".json":
            if file_path.name == "_SCHEMA.json":
                continue
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    shard = json.load(f)
                    handle = shard.get("handle", "unknown")
                    posts = shard.get("posts", [])
                    for post in posts:
                        post_id = post.get("id")
                        title = post.get("text", "")[:80] + ("..." if len(post.get("text", "")) > 80 else "")
                        
                        # Deduplicate by ID instead of title for X posts
                        if post_id in seen_titles:
                            continue
                        seen_titles.add(post_id)
                        
                        entries.append({
                            "date": post.get("date", git_date),
                            "date_display": post.get("date", date_display),
                            "category": "🐦 X Activity",
                            "category_id": "x-activity",
                            "title": title,
                            "path": rel_path,
                            "relevance": post.get("relevance", ""),
                            "rating": post.get("relevance", None),
                            "source": post.get("url", ""),
                            "author": f"@{handle}",
                            "metrics": post.get("metrics", {}),
                            "signal_tier": post.get("signal_tier", "NOISE"),
                            "topics": post.get("topics", []),
                            "content": post.get("text", ""),
                            "is_x_post": True,
                            "raw_post": post # Store full post for modal
                        })
            except Exception as e:
                print(f"Error reading JSON {file_path}: {e}")
            continue
            
        # Parse Markdown
        md_file = file_path
        git_date = file_dates.get(rel_path)
        if not git_date:
            try:
                res = subprocess.run(["git", "log", "--diff-filter=A", "--format=%aI", "-1", "--", rel_path], cwd=base_dir, capture_output=True, text=True)
                if res.stdout.strip():
                    git_date = res.stdout.strip()
            except:
                pass
        if not git_date:
            git_date = datetime.datetime.now().isoformat()
            
        if "T" in git_date:
            date_display = git_date[:16].replace("T", " ")
        else:
            date_display = git_date[:16]
        
        title = md_file.name
        content = ""
        relevance = ""
        source = ""
        stars = ""
        author = ""
        maturity = ""
        license_str = ""
        tech_stack = []
        topics = []
        rating_num = None
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
                lines = content.splitlines()
                if lines and lines[0].startswith("# "):
                    title = lines[0][2:].strip()
                
                # Try to extract relevance and source
                for line in lines:
                    if "| Relevance |" in line or "| **Relevance** |" in line or "| Relevance to our vision |" in line or "| **Relevance to our vision** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            relevance = parts[2].strip()
                            # Try extract pure number like "9" from "9/10"
                            import re
                            m = re.search(r'(\d+)\s*/\s*10', relevance)
                            if m:
                                rating_num = int(m.group(1))
                    if "| GitHub Stars |" in line or "| **GitHub Stars** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            stars = parts[2].strip()
                    if "| Publisher |" in line or "| **Publisher** |" in line or "| Author |" in line or "| **Author** |" in line or "| Speaker |" in line or "| **Speaker** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            author = parts[2].strip()
                    if "| Maturity |" in line or "| **Maturity** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            maturity = parts[2].strip()
                    if "| License |" in line or "| **License** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            license_str = parts[2].strip()
                    if "| Tech Stack |" in line or "| **Tech Stack** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            ts = parts[2].strip()
                            tech_stack = [t.strip() for t in ts.split(",") if t.strip()]
                    if "| Topics |" in line or "| **Topics** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            tps = parts[2].strip()
                            topics = [t.strip() for t in tps.split(",") if t.strip()]
                    if "| Source |" in line or "| **Source** |" in line or "| Repository |" in line or "| **Repository** |" in line:
                        parts = line.split("|")
                        if len(parts) > 2:
                            # Try to extract markdown link if present [label](url)
                            raw_src = parts[2].strip()
                            import re
                            urls = re.findall(r'\(?(https?://[^\s)\]]+)', raw_src)
                            if urls:
                                source = urls[0]
                            else:
                                source = raw_src
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
            pass
            
        lower_title = title.lower().strip()
        if lower_title in seen_titles:
            continue
        seen_titles.add(lower_title)
            
        entries.append({
            "date": git_date,
            "date_display": date_display,
            "category": category_labels.get(d, d),
            "category_id": d,
            "title": title,
            "path": rel_path,
            "relevance": relevance,
            "rating": rating_num,
            "source": source,
            "stars": stars,
            "author": author,
            "maturity": maturity,
            "license": license_str,
            "tech_stack": tech_stack,
            "topics": topics,
            "content": content
        })

entries.sort(key=lambda x: x["date"], reverse=True)

html_template = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Orchestrator Catalogue Explorer</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-hover: #334155;
    --border: #334155;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #3b82f6;
    --accent: #8b5cf6;
    --danger: #ef4444;
    --success: #10b981;
  }
  * { box-sizing: border-box; }
  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    margin: 0;
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  aside {
    width: 280px;
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(16px);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 10;
  }
  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-header h1 {
    font-size: 20px;
    margin: 0 0 4px 0;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .sidebar-header p { margin: 0; font-size: 13px; color: var(--text-muted); }
  .categories-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cat-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    padding: 10px 16px;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cat-btn:hover {
    background: rgba(255,255,255,0.05);
    color: var(--text);
  }
  .cat-btn.active {
    background: rgba(59, 130, 246, 0.15);
    color: var(--primary);
    border-color: rgba(59, 130, 246, 0.3);
    font-weight: 500;
  }
  .cat-count {
    background: rgba(0,0,0,0.3);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
  
  .filters-sidebar {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(0,0,0,0.1);
  }
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .filter-group label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    font-weight: 600;
  }
  .filter-select {
    background: rgba(15, 23, 42, 0.6);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat, repeat;
    background-position: right .7em top 50%, 0 0;
    background-size: .65em auto, 100%;
  }
  .filter-select:focus {
    border-color: var(--primary);
  }
    background: var(--surface);
    color: var(--primary);
    border-color: var(--border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .cat-count {
    font-size: 12px;
    background: rgba(0,0,0,0.3);
    padding: 2px 8px;
    border-radius: 12px;
  }
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 40%),
                radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.05), transparent 40%);
  }
  .topbar {
    padding: 24px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .title-area h2 { margin: 0; font-size: 24px; font-weight: 600; }
  .title-area p { margin: 4px 0 0 0; color: var(--text-muted); font-size: 14px; }
  .search-box {
    position: relative;
  }
  .search-box input {
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 12px 20px 12px 40px;
    border-radius: 24px;
    width: 320px;
    font-size: 14px;
    transition: all 0.2s;
  }
  .search-box input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    background: rgba(0,0,0,0.4);
  }
  .search-box svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    fill: var(--text-muted);
  }
  .cards-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px 40px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    align-content: start;
  }
  .card {
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    overflow: hidden;
    min-width: 0;
    height: 200px; /* Fixed height adjusted for author metadata */
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    opacity: 0;
    transition: opacity 0.3s;
  }
  .card:hover {
    transform: translateY(-4px) scale(1.02);
    background: var(--surface);
    border-color: var(--surface-hover);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  }
  .card:hover::before { opacity: 1; }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .card-cat {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--primary);
    background: rgba(59, 130, 246, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
  }
  .card-date {
    font-size: 12px;
    color: var(--text-muted);
  }
  .card-title {
    font-size: 18px;
    font-weight: 600;
    margin: 4px 0 0 0;
    line-height: 1.4;
    word-break: break-word;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-author {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-footer {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap; /* Enforce single line */
    margin-top: auto; /* Pushes footer to bottom */
    overflow: hidden;
  }
  .card-relevance {
    font-size: 13px;
    color: var(--text-muted);
    background: rgba(0,0,0,0.2);
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-block;
    border: 1px solid rgba(255,255,255,0.05);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1; /* Allow it to shrink and truncate if container is too small */
    min-width: 0;   /* Necessary for flex item to truncate */
  }
  .card-source {
    font-size: 13px;
    color: var(--primary);
    background: rgba(59, 130, 246, 0.1);
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-block;
    border: 1px solid rgba(59, 130, 246, 0.2);
    text-decoration: none;
    transition: all 0.2s;
    flex-shrink: 0; /* Never shrink the source link */
  }
  .card-source:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #fff;
  }
  
  /* X Activity specific styles */
  .card.x-post {
    border-color: rgba(29, 155, 240, 0.3);
  }
  .card.x-post::before {
    background: linear-gradient(90deg, #1d9bf0, #8b5cf6);
  }
  .x-metrics {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .x-metric-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .signal-badge {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
  }
  .signal-HIGH { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
  .signal-MEDIUM { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
  .signal-LOW { background: rgba(148, 163, 184, 0.15); color: var(--text-muted); border: 1px solid rgba(148, 163, 184, 0.3); }
  .signal-NOISE { background: rgba(239, 68, 68, 0.15); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.3); }
  
  .btn-toggle {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 10px 16px;
    border-radius: 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  .btn-toggle:hover { background: rgba(255,255,255,0.1); }
  
  .active-filters {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
  .filter-badge {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: var(--primary);
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .filter-badge button {
    background: transparent;
    border: none;
    color: var(--primary);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    font-size: 16px;
    line-height: 1;
    opacity: 0.7;
  }
  .filter-badge button:hover {
    opacity: 1;
  }
  
  .timeline-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px 40px;
    display: none;
    flex-direction: column;
    gap: 0;
  }
  .timeline-row {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border);
    gap: 16px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .timeline-row:hover {
    background: rgba(255,255,255,0.02);
  }
  .timeline-date {
    width: 140px;
    font-size: 13px;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .timeline-cat {
    width: 140px;
    flex-shrink: 0;
  }
  .timeline-title {
    flex-grow: 1;
    font-size: 15px;
    font-weight: 500;
  }
  .timeline-meta {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    align-items: center;
  }
  .timeline-header-row {
    display: flex;
    align-items: center;
    padding: 0 16px 16px 16px;
    border-bottom: 2px solid var(--border);
    gap: 16px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 100;
  }
  .modal-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
  .modal {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 24px;
    width: 900px;
    max-width: 95vw;
    height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .modal-overlay.active .modal {
    transform: translateY(0) scale(1);
  }
  .modal-header {
    padding: 24px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 24px 24px 0 0;
  }
  .modal-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
  .modal-actions { display: flex; gap: 16px; align-items: center; }
  .btn-open {
    color: var(--primary);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    transition: background 0.2s;
  }
  .btn-open:hover { background: rgba(59, 130, 246, 0.2); }
  .btn-close {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s, color 0.2s;
  }
  .btn-close:hover { background: rgba(255,255,255,0.1); color: var(--text); }
  
  .modal-body {
    padding: 32px;
    overflow-y: auto;
    flex: 1;
    line-height: 1.7;
    font-size: 15px;
    background: var(--bg);
    border-radius: 0 0 24px 24px;
  }
  
  /* Markdown Styles inside modal */
  .modal-body h1, .modal-body h2, .modal-body h3 { 
    color: var(--text); 
    margin-top: 1.5em;
    padding-bottom: 0.3em;
  }
  .modal-body h2 { border-bottom: 1px solid var(--border); }
  .modal-body a { color: var(--primary); text-decoration: none; }
  .modal-body a:hover { text-decoration: underline; }
  .modal-body pre {
    background: #000;
    padding: 16px;
    border-radius: 12px;
    overflow-x: auto;
    border: 1px solid var(--border);
  }
  .modal-body code {
    background: rgba(255,255,255,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .modal-body pre code { background: transparent; padding: 0; }
  .modal-body blockquote {
    margin: 1.5em 0;
    padding: 16px 20px;
    border-left: 4px solid var(--primary);
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0 12px 12px 0;
    color: var(--text-muted);
  }
  .modal-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
  }
  .modal-body th, .modal-body td {
    border: 1px solid var(--border);
    padding: 12px 16px;
    text-align: left;
  }
  .modal-body th {
    background: rgba(255,255,255,0.05);
    font-weight: 600;
  }
  .modal-body tr:nth-child(even) { background: rgba(255,255,255,0.02); }
</style>
</head>
<body>

<aside>
  <div class="sidebar-header">
    <h1>Explorer</h1>
    <p>Knowledge Catalogue</p>
  </div>
  <div class="categories-list" id="cat-list">
    <!-- Categories injected here -->
  </div>
  <div class="filters-sidebar" id="filters-container">
    <!-- Dropdowns injected here -->
  </div>
</aside>

<main>
  <div class="topbar">
    <div class="title-area">
      <h2 id="view-title">All Entries</h2>
      <p id="view-stats">Loading...</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center; justify-content: flex-end; flex: 1; padding-left: 20px;">
      <div id="active-filters" class="active-filters" style="margin-right: auto;"></div>
      <button id="view-toggle" class="btn-toggle">🗒️ Timeline View</button>
      <div class="search-box">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="text" id="search-input" placeholder="Search insights, tools, notes...">
      </div>
    </div>
  </div>
  <div class="cards-container" id="cards-grid">
    <!-- Cards injected here -->
  </div>
  <div class="timeline-container" id="timeline-grid" style="display: none;">
    <!-- Timeline injected here -->
  </div>
</main>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-header">
      <h2 id="modal-title">Entry Details</h2>
      <div class="modal-actions">
        <a href="#" id="modal-open" class="btn-open" target="_blank" title="Opens the physical file directly if your browser allows it">Open Local File</a>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
    </div>
    <div class="modal-body" id="modal-content">
      <!-- Content injected here -->
    </div>
  </div>
</div>

<script>
  const data = <<JSON_DATA>>;
  
  // Setup
  const catList = document.getElementById('cat-list');
  const cardsGrid = document.getElementById('cards-grid');
  const timelineGrid = document.getElementById('timeline-grid');
  const viewToggleBtn = document.getElementById('view-toggle');
  const viewTitle = document.getElementById('view-title');
  const viewStats = document.getElementById('view-stats');
  const searchInput = document.getElementById('search-input');
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const modalOpen = document.getElementById('modal-open');
  const modalClose = document.getElementById('modal-close');
  
  let currentCategory = 'all';
  let searchQuery = '';
  let currentViewMode = 'grid'; // grid | timeline
  
  // Advanced Filters State
  let currentRating = 'all';
  let currentMaturity = 'all';
  let currentLicense = 'all';
  let currentTech = 'all';
  let currentSignal = 'all';
  let currentPractitioner = 'all';
  let currentTopic = 'all';
  
  // Toggle view mode
  viewToggleBtn.addEventListener('click', () => {
    currentViewMode = currentViewMode === 'grid' ? 'timeline' : 'grid';
    viewToggleBtn.innerHTML = currentViewMode === 'grid' ? '🗒️ Timeline View' : '🗂️ Grid View';
    renderGrid();
  });
  
  // Calculate category counts
  const catCounts = { 'all': data.length };
  data.forEach(item => {
    catCounts[item.category_id] = (catCounts[item.category_id] || 0) + 1;
  });
  
  // Unique categories for sidebar
  const categories = [{id: 'all', label: 'All Entries', icon: '🌍'}];
  
    const categoryLabels = {
    "agent-economy": "💰 Agent Economy",
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
    "x-activity": "🐦 X Activity"
  };
  
  Object.keys(categoryLabels).forEach(key => {
    if (catCounts[key]) {
      categories.push({id: key, label: categoryLabels[key], icon: ''});
    }
  });
  
  // Render sidebar
  function renderSidebar() {
    catList.innerHTML = categories.map(c => `
      <button class="cat-btn ${currentCategory === c.id ? 'active' : ''}" data-id="${c.id}">
        <span>${c.label}</span>
        <span class="cat-count">${catCounts[c.id]}</span>
      </button>
    `).join('');
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.id;
        renderSidebar();
        renderGrid();
      });
    });
    
    // Render advanced filters
    const uniqueRatings = [...new Set(data.filter(d => d.rating).map(d => d.rating))].sort((a,b) => b - a);
    const uniqueMaturities = [...new Set(data.filter(d => d.maturity).map(d => d.maturity))].sort();
    const uniqueLicenses = [...new Set(data.filter(d => d.license).map(d => d.license))].sort();
    
    let allTechs = [];
    let allTopics = [];
    let allPractitioners = [];
    
    data.forEach(d => { 
      if(d.tech_stack) allTechs.push(...d.tech_stack);
      if(d.topics) allTopics.push(...d.topics);
      if(d.is_x_post && d.author) allPractitioners.push(d.author);
    });
    
    const uniqueTechs = [...new Set(allTechs)].sort();
    const uniqueTopics = [...new Set(allTopics)].sort();
    const uniquePractitioners = [...new Set(allPractitioners)].sort();
    
    document.getElementById('filters-container').innerHTML = `
      <div class="filter-group">
        <label>Minimum Rating</label>
        <select class="filter-select" id="sel-rating">
          <option value="all">Any Rating</option>
          ${uniqueRatings.map(r => `<option value="${r}" ${currentRating == r ? 'selected' : ''}>${r}/10 & Above</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Topic</label>
        <select class="filter-select" id="sel-topic">
          <option value="all">Any Topic</option>
          ${uniqueTopics.map(t => `<option value="${t}" ${currentTopic === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group" ${uniquePractitioners.length === 0 ? 'style="display:none"' : ''}>
        <label>Practitioner (X)</label>
        <select class="filter-select" id="sel-practitioner">
          <option value="all">Any Practitioner</option>
          ${uniquePractitioners.map(p => `<option value="${p}" ${currentPractitioner === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Signal Tier</label>
        <select class="filter-select" id="sel-signal">
          <option value="all">Any Signal</option>
          <option value="HIGH" ${currentSignal === 'HIGH' ? 'selected' : ''}>HIGH</option>
          <option value="MEDIUM" ${currentSignal === 'MEDIUM' ? 'selected' : ''}>MEDIUM</option>
          <option value="LOW" ${currentSignal === 'LOW' ? 'selected' : ''}>LOW</option>
          <option value="NOISE" ${currentSignal === 'NOISE' ? 'selected' : ''}>NOISE</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Maturity</label>
        <select class="filter-select" id="sel-maturity">
          <option value="all">Any Maturity</option>
          ${uniqueMaturities.map(m => `<option value="${m}" ${currentMaturity === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>License</label>
        <select class="filter-select" id="sel-license">
          <option value="all">Any License</option>
          ${uniqueLicenses.map(l => `<option value="${l}" ${currentLicense === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Tech Stack</label>
        <select class="filter-select" id="sel-tech">
          <option value="all">Any Tech Stack</option>
          ${uniqueTechs.map(t => `<option value="${t}" ${currentTech === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
    `;
    
    document.getElementById('sel-rating').addEventListener('change', (e) => { currentRating = e.target.value; renderGrid(); });
    document.getElementById('sel-topic').addEventListener('change', (e) => { currentTopic = e.target.value; renderGrid(); });
    document.getElementById('sel-practitioner')?.addEventListener('change', (e) => { currentPractitioner = e.target.value; renderGrid(); });
    document.getElementById('sel-signal').addEventListener('change', (e) => { currentSignal = e.target.value; renderGrid(); });
    document.getElementById('sel-maturity').addEventListener('change', (e) => { currentMaturity = e.target.value; renderGrid(); });
    document.getElementById('sel-license').addEventListener('change', (e) => { currentLicense = e.target.value; renderGrid(); });
    document.getElementById('sel-tech').addEventListener('change', (e) => { currentTech = e.target.value; renderGrid(); });
  }
  
  // Render grid
  function renderGrid() {
    let filtered = data;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(d => d.category_id === currentCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.content.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.source && d.source.toLowerCase().includes(q)) ||
        (d.author && d.author.toLowerCase().includes(q))
      );
    }
    if (currentRating !== 'all') {
      const minRating = parseInt(currentRating, 10);
      filtered = filtered.filter(d => d.rating && d.rating >= minRating);
    }
    if (currentMaturity !== 'all') {
      filtered = filtered.filter(d => d.maturity === currentMaturity);
    }
    if (currentLicense !== 'all') {
      filtered = filtered.filter(d => d.license === currentLicense);
    }
    if (currentTech !== 'all') {
      filtered = filtered.filter(d => d.tech_stack && d.tech_stack.includes(currentTech));
    }
    
    viewTitle.textContent = currentCategory === 'all' ? 'All Entries' : categoryLabels[currentCategory];
    viewStats.textContent = `Showing ${filtered.length} entries`;
    
    // Update active filters UI
    let filterHtml = '';
    if (currentCategory !== 'all') {
      filterHtml += `<div class="filter-badge">
        <span>Cat: ${categoryLabels[currentCategory]}</span>
        <button onclick="clearCategory()">&times;</button>
      </div>`;
    }
    if (searchQuery) {
      filterHtml += `<div class="filter-badge">
        <span>Search: &quot;${searchQuery}&quot;</span>
        <button onclick="clearSearch()">&times;</button>
      </div>`;
    }
    if (currentRating !== 'all') {
      filterHtml += `<div class="filter-badge">
        <span>Rating: &ge; ${currentRating}</span>
        <button onclick="clearFilter('rating')">&times;</button>
      </div>`;
    }
    if (currentMaturity !== 'all') {
      filterHtml += `<div class="filter-badge">
        <span>Maturity: ${currentMaturity}</span>
        <button onclick="clearFilter('maturity')">&times;</button>
      </div>`;
    }
    if (currentLicense !== 'all') {
      filterHtml += `<div class="filter-badge">
        <span>License: ${currentLicense}</span>
        <button onclick="clearFilter('license')">&times;</button>
      </div>`;
    }
    if (currentTech !== 'all') {
      filterHtml += `<div class="filter-badge">
        <span>Tech: ${currentTech}</span>
        <button onclick="clearFilter('tech')">&times;</button>
      </div>`;
    }
    document.getElementById('active-filters').innerHTML = filterHtml;
    
    if (filtered.length === 0) {
      const emptyHtml = '<div style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">No entries found.</div>';
      cardsGrid.innerHTML = emptyHtml;
      timelineGrid.innerHTML = emptyHtml;
      return;
    }
    
    if (currentViewMode === 'grid') {
      cardsGrid.style.display = 'grid';
      timelineGrid.style.display = 'none';
      cardsGrid.innerHTML = filtered.map((item, idx) => {
        if (item.is_x_post) {
          const m = item.metrics || {};
          return `
            <div class="card x-post" data-idx="${data.indexOf(item)}">
              <div class="card-header">
                <span class="card-cat">${item.category}</span>
                <span class="card-date">${item.date_display}</span>
              </div>
              <h3 class="card-title" style="-webkit-line-clamp: 3;">${item.title}</h3>
              <div class="card-author">👤 ${item.author}</div>
              <div class="x-metrics">
                ${m.likes ? `<span class="x-metric-item">❤️ ${m.likes}</span>` : ''}
                ${m.retweets ? `<span class="x-metric-item">🔄 ${m.retweets}</span>` : ''}
                ${m.views ? `<span class="x-metric-item">👁️ ${m.views}</span>` : ''}
              </div>
              <div class="card-footer" style="margin-top: auto; padding-top: 12px;">
                <span class="signal-badge signal-${item.signal_tier}">${item.signal_tier}</span>
                ${item.source ? `<a href="${item.source}" class="card-source" target="_blank" onclick="event.stopPropagation()">🔗 URL</a>` : ''}
              </div>
            </div>
          `;
        }
        return `
          <div class="card" data-idx="${data.indexOf(item)}">
            <div class="card-header">
              <span class="card-cat">${item.category}</span>
              <span class="card-date">${item.date_display}</span>
            </div>
            <h3 class="card-title">${item.title}</h3>
            ${item.author ? `<div class="card-author">👤 ${item.author}</div>` : ''}
            <div class="card-footer">
              ${item.stars ? `<span class="card-relevance" title="GitHub Stars">⭐ ${item.stars}</span>` : ''}
              ${item.relevance ? `<span class="card-relevance" title="Relevance Score">★ ${item.relevance}</span>` : ''}
              ${item.source ? `<a href="${item.source}" class="card-source" target="_blank" onclick="event.stopPropagation()">🔗 Source</a>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => openModal(data[card.dataset.idx]));
      });
    } else {
      cardsGrid.style.display = 'none';
      timelineGrid.style.display = 'flex';
      
      let timelineHtml = `
        <div class="timeline-header-row">
          <div class="timeline-date">Ingested</div>
          <div class="timeline-cat">Category</div>
          <div class="timeline-title">Title</div>
          <div class="timeline-meta" style="width: 250px">Metadata</div>
        </div>
      `;
      timelineHtml += filtered.map((item, idx) => {
        if (item.is_x_post) {
           const m = item.metrics || {};
           return `
            <div class="timeline-row" data-idx="${data.indexOf(item)}" style="border-left: 3px solid rgba(29, 155, 240, 0.5);">
              <div class="timeline-date">${item.date_display}</div>
              <div class="timeline-cat"><span class="card-cat">${item.category}</span></div>
              <div class="timeline-title">
                ${item.title}
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;display:flex;gap:12px;align-items:center;">
                  <span>👤 ${item.author}</span>
                  ${m.likes ? `<span>❤️ ${m.likes}</span>` : ''}
                  ${m.views ? `<span>👁️ ${m.views}</span>` : ''}
                </div>
              </div>
              <div class="timeline-meta" style="width: 250px">
                <span class="signal-badge signal-${item.signal_tier}">${item.signal_tier}</span>
                ${item.source ? `<a href="${item.source}" class="card-source" target="_blank" onclick="event.stopPropagation()">🔗 URL</a>` : ''}
              </div>
            </div>
          `;
        }
        return `
          <div class="timeline-row" data-idx="${data.indexOf(item)}">
            <div class="timeline-date">${item.date_display}</div>
            <div class="timeline-cat"><span class="card-cat">${item.category}</span></div>
            <div class="timeline-title">
              ${item.title}
              ${item.author ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">👤 ${item.author}</div>` : ''}
            </div>
            <div class="timeline-meta" style="width: 250px">
              ${item.stars ? `<span class="card-relevance" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="GitHub Stars: ${item.stars}">⭐ ${item.stars}</span>` : ''}
              ${item.relevance ? `<span class="card-relevance" title="Relevance Score">★ ${item.relevance}</span>` : ''}
              ${item.source ? `<a href="${item.source}" class="card-source" target="_blank" onclick="event.stopPropagation()">🔗 Source</a>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      timelineGrid.innerHTML = timelineHtml;
      document.querySelectorAll('.timeline-row').forEach(row => {
        row.addEventListener('click', () => openModal(data[row.dataset.idx]));
      });
    }
  }
  
  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGrid();
  });
  
  // Setup global functions for badges
  window.clearCategory = () => {
    currentCategory = 'all';
    renderSidebar();
    renderGrid();
  };
  window.clearSearch = () => {
    searchQuery = '';
    searchInput.value = '';
    renderGrid();
  };
  window.clearFilter = (type) => {
    if (type === 'rating') { currentRating = 'all'; document.getElementById('sel-rating').value = 'all'; }
    if (type === 'maturity') { currentMaturity = 'all'; document.getElementById('sel-maturity').value = 'all'; }
    if (type === 'license') { currentLicense = 'all'; document.getElementById('sel-license').value = 'all'; }
    if (type === 'tech') { currentTech = 'all'; document.getElementById('sel-tech').value = 'all'; }
    if (type === 'topic') { currentTopic = 'all'; document.getElementById('sel-topic').value = 'all'; }
    if (type === 'practitioner') { currentPractitioner = 'all'; if(document.getElementById('sel-practitioner')) document.getElementById('sel-practitioner').value = 'all'; }
    if (type === 'signal') { currentSignal = 'all'; document.getElementById('sel-signal').value = 'all'; }
    renderGrid();
  };
  
  // Modal
  function openModal(item) {
    modalTitle.textContent = item.title;
    
    // Resolve full path (if opened locally in chrome, window.location.pathname will be the path to catalogue-explorer.html)
    let basePath = window.location.pathname.replace('catalogue-explorer.html', '');
    let fileUrl = window.location.protocol + '//' + basePath + item.path;
    modalOpen.href = fileUrl;
    
    if (item.is_x_post) {
      modalOpen.href = item.source || '#';
      modalOpen.textContent = "Open in X/Twitter";
      
      const p = item.raw_post || {};
      const m = p.metrics || {};
      const tp = p.topics || [];
      
      modalContent.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 24px; color: var(--text); white-space: pre-wrap;">${item.content}</div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
          ${tp.map(t => `<span style="background: rgba(139, 92, 246, 0.2); color: #c4b5fd; padding: 4px 10px; border-radius: 12px; font-size: 12px;">#${t}</span>`).join('')}
        </div>
        
        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Likes</div><div style="font-size:18px;font-weight:600;">❤️ ${m.likes || 0}</div></div>
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Retweets</div><div style="font-size:18px;font-weight:600;">🔄 ${m.retweets || 0}</div></div>
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Views</div><div style="font-size:18px;font-weight:600;">👁️ ${m.views || 0}</div></div>
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Replies</div><div style="font-size:18px;font-weight:600;">💬 ${m.replies || 0}</div></div>
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Bookmarks</div><div style="font-size:18px;font-weight:600;">🔖 ${m.bookmarks || 0}</div></div>
          <div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;">Signal Tier</div><div style="margin-top:4px;"><span class="signal-badge signal-${item.signal_tier}">${item.signal_tier}</span></div></div>
        </div>
        
        ${(p.links && p.links.length > 0) ? `
        <div style="margin-top: 24px;">
          <h3 style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px; border:none;">Links from Post</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${p.links.map(l => `<a href="${l}" target="_blank" style="color: var(--primary); text-decoration: none; word-break: break-all; background: rgba(59, 130, 246, 0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(59,130,246,0.2);">${l}</a>`).join('')}
          </div>
        </div>
        ` : ''}
      `;
    } else {
      modalOpen.textContent = "Open Local File";
      if (window.marked) {
        // Basic rendering, using marked.js
        modalContent.innerHTML = marked.parse(item.content);
      } else {
        modalContent.innerHTML = '<pre>' + item.content + '</pre>';
      }
    }
    
    modal.classList.add('active');
  }
  
  modalClose.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
  
  // Init
  renderSidebar();
  renderGrid();
</script>
</body>
</html>"""

html_out = html_template.replace("<<JSON_DATA>>", json.dumps(entries))

with open(base_dir / "catalogue-explorer.html", "w", encoding="utf-8") as f:
    f.write(html_out)

print(f"Generated catalogue-explorer.html with {len(entries)} entries.")
