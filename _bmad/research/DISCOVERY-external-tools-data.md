# External Tools & Data Discovery Report

**Date**: 2026-04-05  
**Author**: Claude Code Search Agent  
**Status**: Complete inventory of Notion, Airtable, CRM, and lead data across Burak's filesystem

---

## Executive Summary

Burak maintains a distributed portfolio management system using:
- **1 Notion Portfolio Database** (Venture Spine) for 8 active projects
- **2 Airtable bases** for CraftCode business data and MAYTT video generator
- **1 Airtable-backed N8N automation** (MAYTT TikTok video system) 
- **B2B Sales Pipeline** with 21 qualified companies (CraftCode Handwerk)
- **Lead Management** system with 6 early-stage leads
- **Multiple CSV/Excel exports** across Downloads folder

This document maps **where** each data exists, **what format** it's in, and **how to access** it via Notion MCP, Airtable API, or N8N webhooks.

---

## 1. NOTION PORTFOLIO DATABASE (Venture Spine)

### Location & Access
- **Notion URL**: `https://www.notion.so/8142fb34ee8b40b68dae77a4a1505e39`
- **Database ID**: `8142fb34ee8b40b68dae77a4a1505e39`
- **Data Source ID**: `6be88ce0-8de5-4519-8f56-883cf31e4bac`
- **Parent Workspace**: "Buraks Lab" (`2f174ccd7c6980198e7be0c2831e6b25`)
- **Schema File**: `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/notion-schema.md`
- **Sync Script**: `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/sync-to-notion.sh`

### Purpose
Master portfolio health dashboard for 8 active projects with:
- Tier classification (Revenue, Strategic, Growth, Hibernated)
- Lifecycle tracking (Ideation → Maintenance → Sunset)
- Health scoring (traffic light: Red/Yellow/Green)
- Real-time metrics (GitHub issues, PRs, token spend, budget allocation)
- Shape Up 6-week cycle assignments

### Projects Tracked (8 Total)
1. `omniport-hh` (Tier 1 - Revenue)
2. `orchestrator` (Tier 1 - Revenue)
3. `cityhub` (Tier 1 - Revenue)
4. `contentos` (Tier 2 - Strategic)
5. `finance-agent` (Tier 2 - Strategic)
6. `wifi-csi` (Tier 3 - Growth)
7. `craftcode-ai` (Tier 3 - Growth)
8. `evergabe` (Tier 3 - Growth)

### Database Schema (19 Properties)

| Property | Type | Source | Sync Direction |
|----------|------|--------|-----------------|
| Project | Title | `projects.json` key | One-way (file → Notion) |
| Tier | Select | `projects.json` → `tier` | One-way |
| Lifecycle | Select | `project-dna.yaml` → `phase` | One-way |
| Health | Select | `project-dna.yaml` → `health` | One-way (with Notion override) |
| Last Activity | Date | `git log -1` | One-way |
| Open Issues | Number | `gh issue list` | One-way |
| Open PRs | Number | `gh pr list` | One-way |
| Weekly Tokens | Number | `ccusage` (when available) | Manual |
| Budget Share | Number | `projects.json` → `budget_share * 100` | One-way |
| Day Theme | Select | Manual / `portfolio-state.yaml` | Bidirectional |
| Stack | Multi-Select | `projects.json` → `tech` | One-way |
| GitHub Repo | URL | `projects.json` → `repo` | One-way |
| Description | Rich Text | `project-dna.yaml` → `identity` | Manual |
| Next Action | Rich Text | `project-dna.yaml` → `current_focus` | One-way |
| Blockers | Rich Text | `project-dna.yaml` → `blocking_issues` | One-way |
| Type | Select | `projects.json` | One-way |
| Stale Days | Number | `project-dna.yaml` → `days_since_last_commit` | One-way |
| Active Workers | Number | `orchestrator-tmux-state.json` | One-way |
| Project ID | Unique ID | Auto-generated Notion | N/A |

### Views (6 Total)
- **All Projects** - Full portfolio table sorted by Tier
- **Lifecycle Kanban** - Board view grouped by Lifecycle stage
- **Revenue Projects** - Tier 1 only, sorted by staleness
- **Health Dashboard** - Board grouped by traffic light status
- **Day Themes** - Board grouped by Shape Up day assignment
- **Active Only** - Filtered to Lifecycle = "Active Dev", shows blockers

### Page IDs (For Direct Sync)
```json
{
  "database_id": "8142fb34ee8b40b68dae77a4a1505e39",
  "data_source_id": "6be88ce0-8de5-4519-8f56-883cf31e4bac",
  "pages": {
    "omniport-hh": "32e74ccd-7c69-816d-95ad-c9c07a761de1",
    "orchestrator": "32e74ccd-7c69-81de-a825-e2afa830be4f",
    "cityhub": "32e74ccd-7c69-8176-8afc-f7c7c661bfb5",
    "contentos": "32e74ccd-7c69-81d3-bf62-d6644a1053dc",
    "finance-agent": "32e74ccd-7c69-81cc-be47-c145549ae6a0",
    "wifi-csi": "32e74ccd-7c69-8101-ba60-c3580259d915",
    "craftcode-ai": "32e74ccd-7c69-81c0-8cd6-e66020ccefa5",
    "evergabe": "32e74ccd-7c69-815f-a2e4-fa2e6c4a2445"
  }
}
```

### How to Access via MCP
```bash
# Fetch schema
notion-fetch id="8142fb34ee8b40b68dae77a4a1505e39"

# Update a project's health status
notion-update-page page_id="<page_id>" command="update_properties" properties={"Health": "Red"}

# Search for a specific project
notion-search query="omniport-hh" 

# Create a new view
notion-create-view database_id="8142fb34ee8b40b68dae77a4a1505e39" data_source_id="6be88ce0-8de5-4519-8f56-883cf31e4bac" name="Custom View" type="table"
```

### Sync Architecture
**Pattern**: CQRS (Command Query Responsibility Segregation)
- **Write Source**: `projects.json` + `project-dna.yaml` files (version-controlled, single source of truth)
- **Sync Direction**: Files → Notion (one-way, except Notion health overrides)
- **Sync Trigger**: `sync-to-notion.sh` (manual or scheduled)
- **Notion Role**: Read-optimized projection for mobile review via Notion mobile app

---

## 2. AIRTABLE BASES

### Base 1: CraftCode AI + Business Data

**App ID**: `appi9eWFJmE9XS1zM`  
**Workspace**: "My First Workspace" (Free Plan)  
**Location**: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/`  
**Status**: Active CRM for B2B handwerk sales pipeline

#### Tables

| Table | Records | Purpose | Exported |
|-------|---------|---------|----------|
| **Companies-Stages** | 21 | B2B Sales Pipeline | ✅ Yes (`craftcode-companies.md`) |
| **Leads** | 6 | Inbound Leads | ✅ Yes (`craftcode-leads.md`) |
| **Nischen** | 14 | Target Industries | ✅ Yes (`craftcode-nischen.md`) |
| **Payments** | 22 | Invoice/Creditor Tracking | ✅ Yes (`craftcode-payments.md`) |
| **Competition** | 25 | Voice AI Competitors | ✅ Yes (`craftcode-competition.md`) |
| **Paid Resources** | 28 | Course Materials, Templates | ✅ Yes (`craftcode-paid-resources.md`) |
| **Todos** | ~23 | Project Kanban | ✅ Yes (`craftcode-todos.md`) |
| **Tools** | 197 | Resource Library | ⚠️ Partial (too many for full export) |
| **API Keys** | 50 | Credentials | ❌ Skipped (sensitive) |
| **Customers** | 3 | Customer Info | ❌ Skipped (sensitive) |

#### Companies Pipeline Summary (21 Total)
Sales funnel for CraftCode voice AI solution:
- **Contacted**: 4 companies (early discussions)
- **Qualified**: 5 companies (interested, but no-shows)
- **Termin Gebucht** (Appointment Booked): 4 companies (scheduled demos)
- **Proposal Sent**: 2 companies (awaiting decision)
- **Lost**: 1 company (disqualified)
- **Long-term Leads**: 6 companies (future potential, follow-up Q4/2026)

**Total Pipeline Value**: Unknown (not in exported data)

#### Key Accounts (Tier 1 - Most Qualified)

| Company | Contact | Phone | Status | Notes |
|---------|---------|-------|--------|-------|
| Turk GmbH | (Frau) | +49 7641 41157 | Contacted | Direct interest, discussing with husband |
| Rohrreinigung Bonn | Herr Saracivic | +49 228 9747808010 | Qualified | 4x no-show but interested |
| UMZUGS FICHTNER | Herr Doll | +49 6233 21301 | Qualified | Very interested, demo scheduled |
| Blitz Umzuge | Herr Cetin | +49 30 66763154 | Termin Booked | Also interested in email automation |
| ERB Sanitar | (unknown) | +49 6220 3279432 | Termin Booked | 1.5k-5k deal size estimated |
| Rohr König | Roger Schick / Joanna Schwarz | +49 179 5590040 | Proposal Sent | Proposal sent, decision pending |

#### Exported Markdown Files
All available in: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/`

1. **craftcode-companies.md** - 21-record full export with call notes, follow-up dates
2. **craftcode-leads.md** - 1 active lead (Burak Ertuerk @ KH Handwerks GmbH)
3. **craftcode-nischen.md** - 14 target industries (Schlüsseldienst, Rohrreinigung, Fahrschule, etc.)
4. **craftcode-payments.md** - Payment tracking for 22 creditors (coeco, riverty, gvh, ksp, etc.)
5. **craftcode-competition.md** - 25 Voice AI competitors + influencers
6. **craftcode-paid-resources.md** - 28 course materials and templates
7. **craftcode-todos.md** - Project management Kanban board

---

### Base 2: Social Media Calendar

**App ID**: `appVNY2WKsqPEo0c3`  
**Status**: Inactive template (no real data)  
**Content**: Demo entries only (Easy reporting, Drone security) from July 2022  
**Action**: Not imported to vault - contains no relevant business data

---

### Base 3: MAYTT - TikTok Video Generator

**App ID**: `appfov1BJeVyrojsi`  
**Table**: "Tiktok Shorts Video Ideas" (implied from N8N workflow)  
**Status**: Active automation base for video composition  
**Linked N8N Workflow**: "My workflow 2" (see N8N section)

#### Implied Tables (From N8N Workflow Analysis)

Based on `/Users/buraksmac/Downloads/My workflow 2 MAYTT N8n.json`:

| Table | Purpose | N8N Integration |
|-------|---------|-----------------|
| GENERATED_VIDEOS | Master video combinations | Read/Write (status updates, URL storage) |
| OVERLAY_COMPONENTS | Text overlays, WhatsApp bubbles | Write (Asset File, Is Active, Type, Position) |
| (INFLUENCER_VIDEOS) | Influencer video clips | Implied (linked records) |
| (PRODUCT_VIDEOS) | Product demo videos | Implied (linked records) |
| (PRODUCTS) | Product catalog | Implied (linked records) |

#### N8N Automation Details
See Section 4 below.

---

## 3. MAYTT WORKFLOW (N8N + AIRTABLE)

### File Location
`/Users/buraksmac/Downloads/My workflow 2 MAYTT N8n.json`

### Infrastructure
- **N8N Instance**: `n8n.craftcodeautomation.de`
- **Workflow ID**: `tuRhesvPDkhljxf5`
- **Status**: Active
- **Webhook Endpoint**: `https://n8n.craftcodeautomation.de/webhook/4be05239-84a6-4069-8d22-dd0163f4a70b`

### Workflow Architecture (3 Branches)

```
Webhook Trigger
    ↓
Switch Router (body.action)
    ├─ create_records → Airtable Create (GENERATED_VIDEOS)
    ├─ generate_png → Creatomate API → Poll Status → HTTP Download → Airtable Update (OVERLAY_COMPONENTS)
    └─ metrics → (Unused)
```

#### Branch 1: Create Records
**Purpose**: Generate video combination records  
**Trigger**: Webhook with `body.action = "create_records"`  
**Flow**:
1. Extract `body.combos` array
2. Map each combo to Airtable format:
   - `influencer_video` (foreign key)
   - `product_video` (foreign key)
   - `overlay_component` (foreign key)
   - `status: "To Render"`
3. Create row in GENERATED_VIDEOS table

#### Branch 2: Generate PNG
**Purpose**: Render overlay component via Creatomate  
**Trigger**: Webhook with `body.action = "generate_png"`  
**Flow**:
1. Prepare Creatomate template modifications:
   - Template ID: `835c895d...`
   - Input: `Text-RQ6.text` (from overlay)
   - Width: 650px
2. POST to `api.creatomate.com/v2/renders` (Bearer Auth)
3. Poll `api.creatomate.com/v2/renders/{id}` every 10 sec
4. Download rendered PNG via HTTP
5. Update OVERLAY_COMPONENTS row:
   - Asset File (PNG URL)
   - Asset URL
   - Is Active: true
   - Type: Text Overlay
   - Position: Top-Center
   - Animation: None

#### Branch 3: Metrics
**Status**: Connected in UI but no downstream nodes (unused)

### Data Flow
```
Webhook → Airtable (read combos) 
       → Creatomate (render)
       → Cloudinary (store)
       → Airtable (update status)
```

---

## 4. COLD OUTREACH & LEAD GENERATION RESEARCH

### Research Document
**File**: `/Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-06_research-lead-gen-swarm-design.md`

### Scope
Automated lead generation architecture for German B2B market (DACH region):
- Scrape local businesses without websites
- Auto-generate demo landing pages
- Personalized cold outreach
- Upsell strategy for CraftCode voice AI

### Data Sources for Targeting

#### Free/Cheap Sources
| Source | Coverage | API | Cost | Website Filter |
|--------|----------|-----|------|-----------------|
| Outscraper | Google Maps | ✅ | $1/1K (after 500 free) | ✅ Built-in |
| Google Places API | Global | ✅ | $2-30/1K (10K free/mo) | Manual (null check) |
| Apify Gelbe Seiten | Germany | ✅ Actors | $60/50K | ✅ |
| omkarcloud/scraper | DIY | ✅ Open Source | Self-hosted | Manual |

#### Detection Strategy
1. **Primary**: Scrape `website` field → null/empty = target
2. **Secondary**: DNS lookup + HTTP 200 check
3. **Tertiary**: Flag low-quality sites (Wix/Jimdo free, parked domains)

#### Germany-Specific Directories
- Gelbe Seiten (4M+ businesses)
- Google Maps DE
- Das Telefonbuch
- meinestadt.de
- Branchenbuch

### Target Niches (From CraftCode Airtable)
Handwerk industries currently in sales pipeline:
- Schlüsseldienst (Locksmith)
- Rohrreinigung (Pipe cleaning)
- Umzugsfirma (Moving company)
- Fahrschule (Driving school)
- Gastronomie (Catering)
- Sanitär/Heizung (Plumbing/HVAC)

---

## 5. SECONDARY DATA SOURCES

### CraftCode Obsidian Vault
**Location**: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/`

#### Imported Markdown Files
All Airtable tables exported as markdown for version control + reference:

```
├── airtable-overview.md (index)
├── craftcode-companies.md (21 sales records)
├── craftcode-leads.md (1 inbound lead)
├── craftcode-nischen.md (14 target industries)
├── craftcode-payments.md (22 creditors)
├── craftcode-competition.md (25 competitors)
├── craftcode-paid-resources.md (28 courses/templates)
├── craftcode-todos.md (~23 tasks)
└── craftcode-tools.md (197 resources - partial)
```

**Purpose**: Git-versioned snapshot of Airtable data for:
- Audit trail
- Offline reference
- Change tracking via git diff

### CSV/Excel Exports in Downloads

Multiple bulk exports found in `/Users/buraksmac/Downloads/`:
- `Find-Companies-Table-(3)-Default-view-export-...csv` (Airtable export)
- `Todos-CraftCode AI.csv` (Task export)
- `payments-Grid view.csv` (Payment tracking)
- `Nischen-Grid view.csv` (Industries/niches)
- `Kosmetikstudios.csv` (Beauty studios - unknown source)
- `inventar_export_2026-03-03.xlsx` (Inventory - MAYTT related)

**Status**: One-off exports, not in continuous sync

---

## 6. MISSING/UNAVAILABLE DATA

### Not Yet Discovered
- [ ] CRM Platform dedicated tool (Notion + Airtable used ad-hoc, not formal CRM)
- [ ] Formal call script templates (cold outreach) - only referenced in company notes
- [ ] Email templates for outreach campaigns
- [ ] Formal sales pipeline metrics (conversion rates, deal velocity)
- [ ] Finance Agent Notion database (exists but not inventoried in this scan)

### Intentionally Skipped (Sensitive)
- Airtable "API Keys" table (50 rows) - credentials not exported
- Airtable "Customers" table (3 rows) - customer info + API keys
- TikTok session cookies (mentioned in MAYTT PRD but not stored in accessible files)

### Data Gaps in Vault
- **Notion Finance Agent DB** - Mentioned in airtable-overview.md but not fetched
  - Referenced creditors: coeco, riverty, gvh, ksp, mcfit, kuzeng
- **Informal call notes** - Stored directly in Airtable company records, not fully extracted

---

## 7. ACCESS & AUTOMATION PATTERNS

### Notion MCP Tools
Use these to automate Venture Spine syncs:

```bash
# List all projects
notion-search query="Venture Spine Portfolio"

# Fetch database
notion-fetch id="8142fb34ee8b40b68dae77a4a1505e39"

# Update health status
notion-update-page page_id="<uuid>" \
  command="update_properties" \
  properties={"Health": "Red", "Blockers": "..."}

# Create new view
notion-create-view database_id="8142fb34ee8b40b68dae77a4a1505e39" \
  data_source_id="6be88ce0-8de5-4519-8f56-883cf31e4bac" \
  name="Q2 Goals" \
  type="board" \
  configure="GROUP BY \"Lifecycle\"; SORT BY \"Budget Share\" DESC"

# Create page
notion-create-pages parent={"data_source_id": "6be88ce0-8de5-4519-8f56-883cf31e4bac"} \
  pages=[{"properties": {"Project": "new-project", "Tier": "3 - Growth", ...}}]
```

### Airtable API Access
To access CraftCode base programmatically:
- **Base ID**: `appi9eWFJmE9XS1zM` (CraftCode AI)
- **Base ID**: `appfov1BJeVyrojsi` (MAYTT)
- **API Key**: Stored in `/Users/buraksmac/Desktop/code2/orchestrator/.env` (check for credentials)
- **Endpoints**: Standard Airtable REST API (https://api.airtable.com/v0/)

### N8N Webhook Invocation
To trigger MAYTT workflows:

```bash
curl -X POST https://n8n.craftcodeautomation.de/webhook/4be05239-84a6-4069-8d22-dd0163f4a70b \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_records",
    "combos": [
      {"influencer_video": "id1", "product_video": "id2", "overlay_component": "id3"}
    ]
  }'
```

---

## 8. ARCHITECTURE SUMMARY

### Data Layers
```
┌─────────────────────────────────────────────┐
│        Decision / Sync Point (Human)        │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ┌───▼──────┐    ┌──────▼───┐
    │ projects │    │ company  │
    │ .json    │    │ sales    │
    │          │    │          │
    │ (YAML)   │    │ (Airtable)
    │ +git     │    │ + Notion │
    └───┬──────┘    └──────┬───┘
        │                  │
    ┌───▼──────────────────▼──────┐
    │      Notion Portfolio DB    │
    │  (Read-optimized view)       │
    │  8 projects, 19 properties   │
    │  6 views (Kanban, Health)    │
    └─────────────────────────────┘
        
    ┌───────────────────────────────┐
    │   MAYTT Automation            │
    │   ├─ Airtable (5 tables)      │
    │   ├─ N8N Workflows            │
    │   ├─ Creatomate API           │
    │   └─ Cloudinary Storage       │
    └───────────────────────────────┘
        
    ┌───────────────────────────────┐
    │   CraftCode CRM               │
    │   ├─ Airtable (10 tables)     │
    │   ├─ 21 companies (pipeline)  │
    │   ├─ 6 inbound leads          │
    │   └─ Obsidian vault (backup)  │
    └───────────────────────────────┘
```

### Sync Patterns

#### Pattern 1: File → Notion (One-way CQRS)
**Files**: `projects.json`, `project-dna.yaml`, `portfolio-state.yaml`  
**Destination**: Notion Portfolio DB (8142fb34ee8b40b68dae77a4a1505e39)  
**Trigger**: `sync-to-notion.sh` (manual or scheduled)  
**Direction**: Unidirectional (files = source of truth)  
**Exception**: Notion health overrides on status changes

#### Pattern 2: Airtable → Obsidian Vault (Periodic Export)
**Source**: CraftCode Airtable (appi9eWFJmE9XS1zM)  
**Destination**: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/*.md`  
**Trigger**: Manual export (last run: 2026-04-04)  
**Direction**: Unidirectional snapshot  
**Purpose**: Git-versioned audit trail

#### Pattern 3: Airtable ↔ N8N ↔ Creatomate (Real-time Automation)
**Source**: MAYTT Airtable (appfov1BJeVyrojsi)  
**Trigger**: Webhook (`body.action = create_records | generate_png`)  
**Flow**: Airtable → N8N → Creatomate → Cloudinary → Airtable  
**Direction**: Bidirectional (read combos, write status + URLs)

---

## 9. QUICK REFERENCE: HOW TO FIND DATA

### "I need to check project health"
→ Open Notion: https://www.notion.so/8142fb34ee8b40b68dae77a4a1505e39

### "I need to review the sales pipeline"
→ Open Airtable: https://airtable.com/appfov1BJeVyrojsi (MAYTT) or https://airtable.com/appi9eWFJmE9XS1zM (CraftCode)

### "I need to update a company's follow-up date"
→ Edit in Airtable > Companies table > Follow Up field  
→ Or run: `git log` on vault to see historical changes

### "I need to trigger video rendering"
→ Call N8N webhook with `"action": "generate_png"` payload

### "I need a list of target industries for cold outreach"
→ Read: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/craftcode-nischen.md`

### "I need all company contact info"
→ Read: `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/craftcode-companies.md`

### "I need to generate a new MAYTT video combination"
→ Call N8N webhook with `"action": "create_records"` + `combos` array

---

## 10. NEXT STEPS

### To Implement Continuous Sync
1. **Notion**: Setup scheduled `sync-to-notion.sh` (daily 06:00)
   - Reads: projects.json, project-dna.yaml, portfolio-state.yaml
   - Writes: Notion Portfolio DB via MCP tools
   
2. **Airtable → Vault**: Setup scheduled export (weekly)
   - Export all 10 tables to markdown
   - Commit to git for audit trail

3. **MAYTT**: N8N workflows already active
   - Monitor webhook logs for failures
   - Setup Discord notifications for render completion

### To Enhance Data Governance
- [ ] Add data ownership labels to each table/DB
- [ ] Define update frequency SLAs (daily, weekly, manual)
- [ ] Setup change logs for pipeline movements
- [ ] Archive old leads monthly
- [ ] Implement deal value tracking in companies table

### To Expand CRM Capabilities
- [ ] Add forecast column to companies (pipeline value)
- [ ] Link TikTok metrics to MAYTT videos
- [ ] Create cold outreach campaign tracker (Airtable base 4)
- [ ] Add email open/click tracking (Zapier + Mailchimp)
- [ ] Build lead scoring model (qualification weights)

---

## Appendix A: File Manifest

### Notion Files
- `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/notion-schema.md` - Schema definition
- `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/sync-to-notion.sh` - Sync script
- `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/projects.json` - Project registry
- `/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/portfolio-state.yaml` - Portfolio metadata

### Airtable Exports
- `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/airtable-overview.md` - Index
- `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/craftcode-*.md` - 8 tables (9.2 KB total)

### N8N/Automation
- `/Users/buraksmac/Downloads/My workflow 2 MAYTT N8n.json` - MAYTT workflow definition
- `/Users/buraksmac/Desktop/MAYTT-N8N-Workflow-Analyse.md` - Analysis of workflow nodes
- `/Users/buraksmac/Downloads/MAYTT-PRD.md` - Product requirements for MAYTT system

### Research
- `/Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-06_research-lead-gen-swarm-design.md` - Lead gen strategy

### Misc Exports
- `/Users/buraksmac/Downloads/Find-Companies-Table-(3)-Default-view-export-*.csv` - CSV snapshot
- `/Users/buraksmac/Downloads/Todos-CraftCode AI.csv` - Tasks export
- `/Users/buraksmac/Downloads/inventar_export_2026-03-03.xlsx` - Inventory (MAYTT)

---

## Appendix B: API Credentials Status

⚠️ **NOTE**: Actual secrets not logged. Locations only:

| Service | Type | Location | Status |
|---------|------|----------|--------|
| Notion | API Key | Environment (check .env) | ✅ Active |
| Airtable | API Key | Environment (check .env) | ✅ Active |
| N8N | Webhook Token | Embedded in URL | ✅ Active |
| Creatomate | API Key | N8N workflow config | ⚠️ Check config |
| Cloudinary | API Key | N8N workflow config | ⚠️ Check config |
| TikTok | Session Cookie | N8N (MAYTT PRD) | ⚠️ Requires rotation |

---

**Report Generated**: 2026-04-05 12:30 UTC  
**Scan Scope**: Entire filesystem search across:
- /Users/buraksmac/Desktop/code2/orchestrator/
- /Users/buraksmac/Desktop/code2/vault/
- /Users/buraksmac/Desktop/code/
- /Users/buraksmac/Downloads/
