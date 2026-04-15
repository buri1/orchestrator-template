# Venture Spine Monthly Self-Assessment

> **Month**: _____ (e.g., "April 2026")
> **Review Date**: _____
> **Reviewer**: Burak
> **Time Budget**: 60 minutes maximum

---

## Part 1: Auto-Populated Metrics Dashboard

*Run `./collect-monthly.sh` to fill this section. Copy-paste the output below.*

### North Star Metrics (Tier 1)

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Trend | Status |
|--------|--------|--------|--------|--------|-------|--------|
| M1: Deep-Work Hours/Day | ___ h | ___ h | ___ h | ___ h | _____ | :---: |
| M2: Context Switches/Day | ___ | ___ | ___ | ___ | _____ | :---: |
| M3: Time-to-First-Commit (median min) | ___ | ___ | ___ | ___ | _____ | :---: |

**One-Number Summary**: Venture Spine Score = ___/100

### Operational Metrics (Tier 2)

| Metric | This Month | Last Month | Delta | Status |
|--------|-----------|------------|-------|--------|
| M4: PR Merge Rate | ___% | ___% | ___% | :---: |
| M4: PR Cycle Time (avg hours) | ___ | ___ | ___ | :---: |
| M5: Agent Stuck Events (>30min) | ___ | ___ | ___ | :---: |
| M5: Max Stuck Duration (min) | ___ | ___ | ___ | :---: |
| M6: Cost per Merged PR ($) | ___ | ___ | ___ | :---: |
| M7: DNA Staleness (any RED?) | ___ | ___ | --- | :---: |

### Strategic Metrics (Tier 3)

| Metric | This Month | Last Month | Delta | Status |
|--------|-----------|------------|-------|--------|
| M8: Portfolio Green % | ___% | ___% | ___% | :---: |
| M9: Total Token Spend (API-equiv $) | ___ | ___ | ___ | :---: |
| M9: Highest-spend project | ___ | ___ | --- | :---: |
| M10: Total Revenue (all projects) | $___ | $___ | $___ | :---: |
| M10: Revenue/Token-Cost Ratio | ___x | ___x | ___ | :---: |

### Per-Project Snapshot

| Project | Tier | Health | Commits | PRs Merged | Token Cost | Revenue | DNA Age |
|---------|------|--------|---------|------------|------------|---------|---------|
| _______ | ___ | :---: | ___ | ___ | $___ | $___ | ___ d |
| _______ | ___ | :---: | ___ | ___ | $___ | $___ | ___ d |
| _______ | ___ | :---: | ___ | ___ | $___ | $___ | ___ d |
| _______ | ___ | :---: | ___ | ___ | $___ | $___ | ___ d |
| _______ | ___ | :---: | ___ | ___ | $___ | $___ | ___ d |

---

## Part 2: Collection Script

Run this to auto-populate Part 1:

```bash
#!/bin/bash
# collect-monthly.sh
# Generates the auto-populated metrics for the monthly review.
# Usage: ./collect-monthly.sh [YYYY-MM]

MONTH="${1:-$(date +%Y-%m)}"
VENTURE_SPINE="$(cd "$(dirname "$0")" && pwd)"
PROJECTS_JSON="$VENTURE_SPINE/projects.json"
METRICS_DIR="$VENTURE_SPINE/.metrics"

echo "=== Venture Spine Monthly Review: $MONTH ==="
echo ""

# --- M1: Deep Work Hours (weekly averages) ---
echo "### M1: Deep Work Hours/Day (weekly averages)"
for week in 1 2 3 4; do
  week_start=$(date -j -v1d -v+"$MONTH"m -v+"$((week-1))"w +%Y-%m-%d 2>/dev/null || echo "N/A")
  files=$(ls "$METRICS_DIR"/${MONTH}-*.jsonl 2>/dev/null)
  if [ -n "$files" ]; then
    avg=$(cat $files | grep M1_deep_work | jq -s "map(.value) | add / length" 2>/dev/null || echo "N/A")
    echo "  Week $week: $avg hours"
  else
    echo "  Week $week: No data"
  fi
done
echo ""

# --- M2: Context Switches (weekly averages) ---
echo "### M2: Context Switches/Day (weekly averages)"
cat "$METRICS_DIR"/${MONTH}-*.jsonl 2>/dev/null | grep M2_context | jq -s 'map(.value) | {avg: (add/length), min: min, max: max}' 2>/dev/null || echo "  No data"
echo ""

# --- M4: PR Metrics ---
echo "### M4: PR Merge Rate & Cycle Time"
since="${MONTH}-01"
jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.repo)"' "$PROJECTS_JSON" 2>/dev/null | \
while read -r name repo; do
  [ -z "$repo" ] || [ "$repo" = "null" ] && continue
  total=$(gh pr list --repo "$repo" --state all --search "created:>=${since}" --json number --jq 'length' 2>/dev/null || echo 0)
  merged=$(gh pr list --repo "$repo" --state merged --search "created:>=${since}" --json number --jq 'length' 2>/dev/null || echo 0)
  echo "  $name: $merged/$total merged"
done
echo ""

# --- M5: Agent Stuck Summary ---
echo "### M5: Agent Stuck Events"
cat "$VENTURE_SPINE/.stuck-log.jsonl" 2>/dev/null | grep "$MONTH" | jq -s '{
  total_events: length,
  max_stuck_min: ([.[].stuck_minutes] | max // 0),
  avg_stuck_min: ([.[].stuck_minutes] | add / length // 0)
}' 2>/dev/null || echo "  No stuck events recorded"
echo ""

# --- M6: Tokens per PR ---
echo "### M6: Token Cost Summary"
since_num=$(echo "$MONTH" | tr -d '-')01
until_num=$(date -j -v1d -v+"${MONTH}-01"d -v+1m -v-1d +%Y%m%d 2>/dev/null || echo "99999999")
npx ccusage@latest daily --since "$since_num" --until "$until_num" --json 2>/dev/null | \
  jq '{total_cost: .totals.totalCost, total_tokens: .totals.totalTokens}' || echo "  ccusage data unavailable"
echo ""

# --- M7: DNA Staleness ---
echo "### M7: Project DNA Freshness"
NOW=$(date +%s)
jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir) \(.value.tier)"' "$PROJECTS_JSON" 2>/dev/null | \
while read -r name dir tier; do
  dna="$dir/_bmad/project-dna.yaml"
  if [ -f "$dna" ]; then
    mod=$(stat -f %m "$dna" 2>/dev/null || stat -c %Y "$dna" 2>/dev/null)
    days=$(( (NOW - mod) / 86400 ))
    echo "  $name (Tier $tier): ${days}d old"
  else
    echo "  $name (Tier $tier): MISSING"
  fi
done
echo ""

# --- M8: Portfolio Health ---
echo "### M8: Portfolio Health"
jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir) \(.value.tier)"' "$PROJECTS_JSON" 2>/dev/null | \
while read -r name dir tier; do
  last_commit=$(git -C "$dir" log -1 --format="%ar" 2>/dev/null || echo "unknown")
  echo "  $name (Tier $tier): last commit $last_commit"
done
echo ""

# --- M9: Token Budget ---
echo "### M9: Token Budget by Session"
npx ccusage@latest session --since "$since_num" --until "$until_num" --json 2>/dev/null | \
  jq '.sessions | sort_by(-.totalCost) | .[:10] | .[] | {session: .sessionId, cost: .totalCost, tokens: .totalTokens}' || echo "  Session data unavailable"
echo ""

# --- Venture Spine Score ---
echo "### VENTURE SPINE SCORE"
if [ -d "$METRICS_DIR" ]; then
  avg_deep_work=$(cat "$METRICS_DIR"/${MONTH}-*.jsonl 2>/dev/null | grep M1_deep_work | jq -s 'map(.value) | add / length // 0' 2>/dev/null || echo 0)
  score=$(echo "scale=0; $avg_deep_work / 4 * 100" | bc 2>/dev/null || echo "N/A")
  echo "  Score: $score / 100 (based on $avg_deep_work avg deep-work hours)"
else
  echo "  No metrics data available yet. Run collect-daily.sh for at least 7 days first."
fi
```

---

## Part 3: Five Strategic Questions

Answer each question in 2-3 sentences. These force strategic thinking beyond the numbers.

### Q1: What was the single highest-leverage action I took this month?

> _____

*Criteria: Which one decision or action created the most downstream value? Was it a Venture Spine feature, a product decision, a project kill, or a client conversation?*

### Q2: Which project should I STOP working on?

> _____

*Criteria: Apply the 5/25 rule. Look at the Per-Project Snapshot. Any project with Tier 2+ health that is RED, zero revenue, and no strategic reason to continue should be killed or hibernated. The cost of a zombie project is not its token spend -- it is the context-switch tax it imposes on every other project.*

### Q3: Am I spending my deep-work hours on the right project?

> _____

*Criteria: Compare M1 (where did deep-work hours go) with M10 (which projects generate revenue) and your strategic priorities. If most deep work went to a Tier 2 project while a Tier 1 project stalled, the Venture Spine's priority routing is broken -- or you are overriding it.*

### Q4: What did agents fail at this month that they should not have?

> _____

*Criteria: Review M5 (stuck agents), M4 (abandoned PRs), and any devlog entries about agent failures. Pattern-match: are agents failing at the same thing repeatedly? If so, the fix is a CLAUDE.md update or a new Project DNA entry, not more agent retries.*

### Q5: Is the Venture Spine itself still worth maintaining?

> _____

*Criteria: Check the Kill Criteria from metrics.md:*
- *Did M1 improve from week 1 to week 4?*
- *Did you read the morning triage output on most days?*
- *Did the metrics scripts require < 30 min/week of maintenance?*
- *If any kill criterion is triggered: simplify or shut down the meta-layer. It is not sacred.*

---

## Part 4: Decisions & Actions

Based on the metrics and questions above, record concrete decisions.

### Tier Changes

| Project | Current Tier | New Tier | Reason |
|---------|-------------|----------|--------|
| _______ | ___ | ___ | _____ |

### Shape Up Bets for Next Cycle

*Which 2 projects get a full 6-week bet?*

| Bet | Project | Outcome Definition | Budget Share |
|-----|---------|-------------------|-------------|
| Bet 1 | _______ | _____ | ___% |
| Bet 2 | _______ | _____ | ___% |

### Kill / Hibernate Decisions

| Project | Decision | Effective Date | Reason |
|---------|----------|---------------|--------|
| _______ | Kill / Hibernate / Continue | _____ | _____ |

### Meta-Layer Changes

*What should change about the Venture Spine itself?*

| Change | Reason | Effort |
|--------|--------|--------|
| _______ | _____ | _____ |

### Learnings to Promote

*Patterns from this month that should be added to portfolio-state.yaml learnings.*

| Learning | Confidence | Source Project | Applies To |
|----------|-----------|----------------|-----------|
| _______ | ___% | _____ | _____ |

---

## Part 5: Review Checklist

Complete these before closing the review:

- [ ] All metrics in Part 1 are populated (ran collect-monthly.sh)
- [ ] All five strategic questions answered
- [ ] Tier changes recorded in projects.json
- [ ] Shape Up bets decided for next cycle
- [ ] Kill/hibernate decisions made and executed (archive repos, update projects.json)
- [ ] New learnings added to portfolio-state.yaml
- [ ] portfolio-state.yaml `last_updated` timestamp refreshed
- [ ] This review file saved to `venture-spine/reviews/YYYY-MM-review.md`
- [ ] Calendar reminder set for next monthly review

---

## Meta: Review the Review

After completing 3 monthly reviews, answer:

- Which parts of this template did I skip every time? (Remove them.)
- Which questions led to actual decisions? (Keep and sharpen them.)
- What am I always wishing the template asked? (Add it.)

The template should converge toward what you actually use, not what sounds comprehensive.
