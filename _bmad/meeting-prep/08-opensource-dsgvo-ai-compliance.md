# Open Source, DSGVO & AI Compliance -- Smart City / Public Sector

**Prepared**: 2026-03-30
**Context**: OmniPort-HH (Hildesheim Smart City portal), KfW Modellprojekte Smart Cities
**Purpose**: Legal and compliance analysis for AI-assisted development in German public sector projects

---

## Table of Contents

1. [EU AI Act -- Does It Apply to AI-Generated Code?](#1-eu-ai-act)
2. [German "Einer fuer Alle" (EfA) Principle](#2-efa-principle)
3. [opencode.de Platform Requirements](#3-opencodede)
4. [OSI-Compliant Licensing for AI-Generated Code](#4-licensing)
5. [Can AI-Generated Code Be Open-Sourced? Copyright/IP](#5-copyright)
6. [DSGVO: What Data Leaves the Local Machine?](#6-dsgvo-data-flow)
7. [Anthropic Data Usage Policy -- Training?](#7-anthropic-policy)
8. [Documenting AI Usage for Public Procurement](#8-procurement-docs)
9. [German Court Decisions on AI-Generated Code](#9-court-decisions)
10. [How Other Smart City Projects Handle AI Tools](#10-other-projects)
11. [KfW Funding Requirements for Open Source](#11-kfw-requirements)
12. [Can the Leistungsbeschreibung Restrict AI Tools?](#12-leistungsbeschreibung)
13. [How to Frame AI Usage in Vergabeverfahren](#13-framing)
14. [Recommended Actions for OmniPort-HH](#14-recommendations)

---

## 1. EU AI Act -- Does It Apply to AI-Generated Code? {#1-eu-ai-act}

### Classification: Minimal Risk

AI coding assistants (Claude Code, GitHub Copilot, Cursor) used internally for drafting, summarizing, and code generation fall into the **minimal risk** category under the EU AI Act. This means:

- **No mandatory obligations** under the AI Act for using these tools
- No registration, conformity assessment, or risk management system required
- No transparency labeling required for internally-used code generation

### Key Timeline

| Date | Milestone |
|------|-----------|
| Feb 2025 | Prohibited AI practices ban took effect |
| Aug 2025 | General-purpose AI model rules applied |
| **Aug 2, 2026** | **High-risk AI system obligations apply** |
| Aug 2030 | Retroactive conformity for pre-2026 high-risk systems |

### What Applies to OmniPort-HH

The AI Act's high-risk provisions target AI **systems deployed in critical infrastructure, education, employment, law enforcement, etc.** -- not the tools used to write the software. Using Claude Code to develop a municipal portal is not a high-risk AI deployment.

However: If the portal itself uses AI features (e.g., KI-Moderation, auto-classification of user content), those AI features could face limited-risk or high-risk classification depending on their function.

### Extraterritorial Reach

Like GDPR, the AI Act applies if the AI system's output is "used in the Union," regardless of server location. This matters for Anthropic's US-based infrastructure.

**Sources:**
- [EU AI Act Summary (Jan 2026)](https://www.softwareimprovementgroup.com/blog/eu-ai-act-summary/)
- [EU AI Act Hits Aug 2026 -- Developer Guide](https://dev.to/michael_onyekwere/the-eu-ai-act-hits-in-august-2026-heres-what-developers-actually-need-to-do-345a)
- [Linux Foundation: What Open Source Devs Need to Know](https://linuxfoundation.eu/newsroom/ai-act-explainer)

---

## 2. German "Einer fuer Alle" (EfA) Principle {#2-efa-principle}

### Core Concept

Under the EfA principle (part of the Online Access Act / OZG):
- A digital service is developed centrally by one state or authority
- It can then be reused by other administrations nationwide via standardized interfaces
- Avoids duplication, pools resources, provides uniform solutions

### Open Source Connection

The German government (CDU/CSU/SPD coalition, 2025) committed to:
- **"Public Money, Public Code"** -- software developed with public funds should be open source
- Development contracts to be commissioned as open source by default
- "Open interfaces and open standards across all levels"

### Implementation Reality (as of Aug 2025)

After 100 days in office, the coalition's concrete open-source commitments remained vague. The Federal Cabinet's procurement acceleration law (Aug 2025) failed to prioritize Free Software procurement. The principle is politically agreed but operationally incomplete.

### Relevance for OmniPort-HH

OmniPort-HH, built with KfW Smart City funding, must align with EfA. The portal should be:
- Built on open standards and interfaces
- Reusable by other municipalities
- Published on opencode.de (see Section 3)

**Sources:**
- [EfA-Prinzip erklaert (locaboo.com)](https://www.locaboo.com/govtech-lexikon/efa-prinzip)
- [Open Source in German Public Procurement (EU Portal)](https://interoperable-europe.ec.europa.eu/collection/open-source-observatory-osor/news/open-source-be-norm-german-public-procurement)
- [FSFE: 100 Days Assessment](https://fsfe.org/news/2025/news-20250814-01.en.html)

---

## 3. opencode.de Platform Requirements {#3-opencodede}

### Mandatory Publication

Software co-financed with federal KfW Smart Cities funds **must be published on opencode.de**. This is not optional.

### Approved License Categories

opencode.de maintains a curated list of approved licenses:

| Category | Examples | Key Property |
|----------|----------|-------------|
| **Permissive** | MIT, Apache 2.0, BSD, ISC | Allows proprietary derivatives |
| **Weak Copyleft** | LGPL, MPL 2.0, EPL 2.0 | Libraries can link proprietary code |
| **Strong Copyleft** | GPL 3.0, AGPL 3.0 | All derivatives must be open source |
| **EU-Specific** | EUPL 1.2, D-FSL 1.0 | EU law compatible |
| **German Municipal** | OSC License 1.1 (Solingen) | German liability law compliant |

### Recommended Licenses for Public Administration

opencode.de highlights:
- **MIT**: Simple, high compatibility, uncomplicated reuse
- **Apache 2.0**: Better for patent-sensitive ecosystems
- **GPL 3.0**: Strong copyleft, ensures improvements stay open
- **EUPL 1.2**: EU-native, multi-language, compatible with GPL/LGPL/MPL
- **OSC License 1.1**: Created by Solingen specifically for German municipalities -- addresses the problem that MIT's liability limitation is unenforceable under German law

### Documentation Requirements

1. Use SPDX license identifiers (ISO 5962)
2. Apply the REUSE specification for own content
3. Provide standardized SBOM (Software Bill of Materials) in SPDX format
4. Validate licensing via CodeScan tools (FOSSology, OSS-Review-Toolkit)

**Sources:**
- [opencode.de Standardized Licenses](https://opencode.de/en/knowledge/general-conditions/standardised-open-source-licenses)
- [KfW Smart City Open Source Regelungen](https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities)

---

## 4. OSI-Compliant Licensing for AI-Generated Code {#4-licensing}

### The Core Problem

AI-generated code creates a unique licensing challenge:

1. **No copyright holder**: Purely AI-generated code has no human author and thus no copyright protection under German law (see Section 5). Without copyright, there is technically no rights holder to grant a license.

2. **Hidden license contamination**: AI models trained on GPL/LGPL/AGPL code may reproduce snippets that carry copyleft obligations. This is the "Copyleft Surprise" -- GPL-licensed code appears to emerge from the AI as neutral output, potentially forcing the entire project to be open-sourced under GPL.

3. **OSI approval does not address AI provenance**: OSI licenses assume a human copyright holder. The legal validity of applying an open-source license to code with unclear copyright status is untested in German courts.

### Practical Risk Mitigation

- Treat AI-generated code as third-party code: require license review, provenance tracking, security audit
- Use license scanning tools (Black Duck, FOSSA, Snyk) in CI/CD pipelines
- Activate content filters in AI tools that detect public-source-matching suggestions
- Document which code was AI-generated vs. human-written (see Section 8)
- Prefer permissive licenses (MIT, Apache 2.0) for the project to minimize copyleft cascade risk

### The OSC License 1.1 (Solingen) Option

For German municipalities, the OSC License 1.1 is worth considering:
- Created specifically for municipal open-source projects
- Addresses German liability law requirements (limitation of liability clauses)
- OSI-approved since 2025
- Ensures legal certainty for public-law entities

**Sources:**
- [AI Code Tools and Open Source License Risks (ITMediaLaw)](https://itmedialaw.com/en/ai-code-tools-and-open-source-licenses-risks-for-developers/)
- [Red Hat: AI-Assisted Development and Open Source](https://www.redhat.com/en/blog/ai-assisted-development-and-open-source-navigating-legal-issues)
- [OSC License 1.0 (OSI)](https://opensource.org/license/osc-license-1-0)

---

## 5. Can AI-Generated Code Be Open-Sourced? Copyright/IP {#5-copyright}

### German Copyright Law (UrhG) Position

Under German copyright law, protection requires a **"persoenliche geistige Schoepfung"** (personal intellectual creation) by a human author:

| Scenario | Copyright Status | Can Be Licensed? |
|----------|-----------------|-----------------|
| Purely AI-generated code (simple prompt, no editing) | **No copyright** -- gemeinfrei (public domain equivalent) | Technically no rights holder to license, but no one can claim rights against you either |
| AI-generated with extensive human editing/curation | **Possible copyright** for the human contribution if it reaches Schoepfungshoehe | Yes, human author can license |
| Human-written code with minor AI suggestions | **Normal copyright** for the human author | Yes, standard licensing applies |

### Key Legal Principle

> "Rein maschinell erzeugter Code ist nach geltendem deutschem Recht nicht urheberrechtlich geschuetzt. Das Urheberrecht setzt eine eigene geistige Schoepfung eines Menschen voraus."

Translation: Purely machine-generated code is not protected by copyright under current German law. Copyright requires a personal intellectual creation by a human being.

### Implications for Open Source

1. **Paradox**: You cannot truly "license" what you do not own the copyright to. However, you CAN publish it under an open-source license as a declaration of intent -- no one can sue you for releasing it because no one holds copyright.

2. **Mixed works**: When AI-generated code is integrated into a larger human-authored codebase (like OmniPort-HH), the overall work can still be copyrighted and licensed by the human authors, provided their creative contribution is sufficient.

3. **Documentation is crucial**: To prove Schoepfungshoehe in a dispute, you need meticulous records of: prompts used, human modifications made, creative decisions documented.

### Burden of Proof

In a due diligence or legal challenge, the burden falls on the party claiming copyright. Complex prompts and extensive post-processing strengthen the case for human authorship. Simple "generate a login page" prompts do not.

**Sources:**
- [Urheberrecht fuer KI-generierten Code: Beweislast (Kanzlei Kramarz)](https://kanzlei-kramarz.de/urheberrecht-fuer-ki-generierten-code-eine-frage-der-beweislast/)
- [KI-generierter Code und Lizenzrisiken (MARAIT)](https://www.marait.de/ki-generierter-code-und-lizenzrisiken/)
- [KI & Urheberrecht 2025 (SRD Rechtsanwaelte)](https://www.srd-rechtsanwaelte.de/blog/ki-urheberrecht-2025-was-jetzt-rechtlich-wichtig-ist)

---

## 6. DSGVO: What Data Leaves the Local Machine? {#6-dsgvo-data-flow}

### Claude Code Data Flow

When using Claude Code locally:

| Data Type | Leaves Machine? | Destination | Encrypted? |
|-----------|----------------|-------------|-----------|
| User prompts | Yes | Anthropic API (US) | TLS in transit |
| Model responses | Yes (received) | Anthropic API (US) | TLS in transit |
| Files Claude reads | Yes (content sent) | Anthropic API (US) | TLS in transit |
| Files Claude does NOT read | **No** | Stays local | N/A |
| Code execution | **No** | Runs locally | N/A |
| Telemetry (Statsig) | Yes (opt-out available) | Statsig servers | TLS + AES-256 |
| Error logs (Sentry) | Yes (opt-out available) | Sentry servers | TLS + AES-256 |
| `/feedback` transcripts | Yes (user-initiated) | Anthropic | TLS |

### Key Points for DSGVO Compliance

1. **Data Processing Location**: By default, Anthropic processes requests using servers in the **United States**. EU data hosting requires special arrangement with Anthropic.

2. **Auftragsverarbeitungsvertrag (AVV/DPA)**: Anthropic provides a DPA with Standard Contractual Clauses (SCCs) for EU, UK, and Swiss data transfers. It is automatically incorporated into Anthropic's Commercial Terms of Service.

3. **No personal data in code?**: If the codebase contains no personal data (names, emails, addresses, etc.), the DSGVO exposure is limited. However, session metadata (IP addresses, usage patterns) may constitute personal data.

4. **Max Plan Risk**: Claude Max ($200/mo) falls under **consumer terms**, not commercial terms. This means:
   - Training opt-out must be manually set (see Section 7)
   - No enterprise DPA unless you switch to API/Team/Enterprise
   - 30-day retention if training is off, 5-year if training is on

### Opt-Out Environment Variables

```bash
# Disable training data contribution
# Must be set in claude.ai/settings/data-privacy-controls

# Disable telemetry
export DISABLE_TELEMETRY=1

# Disable error reporting
export DISABLE_ERROR_REPORTING=1

# Disable feedback command
export DISABLE_FEEDBACK_COMMAND=1

# Nuclear option: disable ALL non-essential traffic
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

**Sources:**
- [Claude Code Data Usage Docs](https://code.claude.com/docs/en/data-usage)
- [Claude Code Security Docs](https://code.claude.com/docs/en/security)
- [Anthropic Privacy Center](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)

---

## 7. Anthropic Data Usage Policy -- Training? {#7-anthropic-policy}

### Consumer Plans (Free, Pro, Max)

| Setting | Training | Retention | Default |
|---------|----------|-----------|---------|
| Training ON | Yes -- data used for model improvement | 5 years | **Default since Sep 28, 2025** |
| Training OFF | No | 30 days | Must opt out manually |

**Critical**: Claude Max ($200/mo) is a consumer plan. By default, since September 28, 2025, all code sent through Claude Code on Max plan IS used for training unless you opt out.

### Commercial Plans (Team, Enterprise, API)

- **No training** on customer data by default
- 30-day retention standard
- Zero Data Retention (ZDR) available for Enterprise
- Full DPA with SCCs included in commercial terms

### How to Opt Out (Max Plan)

1. Go to [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls)
2. Toggle off "Improve Claude with your conversations"
3. This applies retroactively -- previous data will not be used for future training

### For Public Sector Work: Recommended Setup

For DSGVO-compliant public sector work, the safest options are:

| Option | Training Risk | DPA? | Cost |
|--------|--------------|------|------|
| **API (pay-per-token)** | None by default | Yes, full DPA | Variable |
| **Claude for Work (Team)** | None by default | Yes, full DPA | $30/user/mo |
| **Claude Max (opt-out)** | None if opted out | No formal DPA | $200/mo |
| **Claude Max (default)** | **YES -- data trained** | No formal DPA | $200/mo |

**Sources:**
- [Anthropic Consumer Terms Update (Sep 2025)](https://www.anthropic.com/news/updates-to-our-consumer-terms)
- [Anthropic Privacy Center: Training](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- [Anthropic DPA](https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa)

---

## 8. Documenting AI Usage for Public Procurement {#8-procurement-docs}

### Why Documentation Matters

In German public procurement (Vergaberecht), transparency and accountability are foundational. Using AI in development without disclosure creates:
- **IP ownership ambiguity** (see Section 5)
- **License contamination risk** (see Section 4)
- **Procurement law compliance questions** (see Section 12)

### Recommended Documentation Framework

#### 1. AI Usage Declaration (Erklaerung zum KI-Einsatz)

Include in project documentation:
```
Dieses Projekt verwendet KI-gestuetzte Entwicklungswerkzeuge (Claude Code / Anthropic)
als Assistenzsysteme bei der Softwareentwicklung.

Der KI-Einsatz erfolgt als unterstuetzendes Werkzeug. Alle generierten Codeteile
werden von menschlichen Entwicklern geprueft, modifiziert und freigegeben.
Die kreative Steuerung und architekturelle Entscheidungsfindung liegt
ausschliesslich bei den menschlichen Entwicklern.
```

#### 2. Code Provenance Log

Maintain a record per feature/module:
- Which parts were AI-assisted vs. purely human-written
- What prompts/instructions were given to the AI
- What human modifications were made to AI output
- License scan results for AI-generated sections

#### 3. SBOM with AI Annotations

Extend the standard Software Bill of Materials (SPDX format) to flag:
- Components with AI-generated code
- License scan status
- Human review attestation

#### 4. Data Protection Impact Assessment (DSFA)

If using AI tools that process project data:
- Document what data is sent to AI services
- Note data processing locations (US for Anthropic)
- Record opt-out settings and DPA status
- Assess residual risk

### Vergaberecht Best Practices

- Proactively disclose AI tool usage in bids and project reports
- Frame AI as a productivity tool (like an IDE or linter), not a replacement for human developers
- Demonstrate human oversight and quality assurance processes
- Maintain audit trails of AI-assisted work

**Sources:**
- [Vergaberecht 2026 Changes (auftrag.ai)](https://auftrag.ai/blog/oeffentliche-ausschreibungen-2026-was-sich-aendert)
- [OECD: AI in Public Procurement](https://www.oecd.org/en/publications/2025/06/governing-with-artificial-intelligence_398fa287/full-report/ai-in-public-procurement_2e095543.html)
- [WEF: AI Government Procurement Guidelines](https://www3.weforum.org/docs/WEF_AI_Procurement_in_a_Box_AI_Government_Procurement_Guidelines_2020.pdf)

---

## 9. German Court Decisions on AI-Generated Code {#9-court-decisions}

### GEMA v. OpenAI (LG Muenchen I, Nov 11, 2025)

**Case No.**: 42 O 14139/24
**Significance**: First German court ruling on AI and copyright

**Key holdings:**
1. **Memorization = Reproduction**: Encoding copyrighted content in model weights constitutes copyright reproduction under Sections 15, 16, 19a UrhG
2. **Output reproduction is infringement**: AI output that substantially reproduces training data is an infringing act of reproduction and public communication
3. **Text and Data Mining exception does NOT cover AI training**: Section 44b UrhG (the TDM exception) was held not to apply to AI model training
4. **No personality rights claim**: The secondary claim for personality-right violations was dismissed

### Implications for AI-Assisted Development

- If Claude Code generates code that closely matches copyrighted training data, using that code could constitute copyright infringement
- The developer (and their client) bear the risk, not Anthropic
- License scanning tools become essential to detect copyrighted code fragments
- This ruling is first-instance only (LG) -- appeal is expected and could change the landscape

### No Direct Ruling on AI-Generated Code Ownership

As of March 2026, no German court has directly ruled on:
- Whether AI-generated code can be copyrighted
- Who owns AI-assisted code
- Whether AI-generated code can validly be placed under an open-source license

The legal consensus among German legal scholars remains:
> Purely AI-generated code is not copyrightable. Code with sufficient human creative input is copyrightable by the human.

**Sources:**
- [Norton Rose: Landmark Copyright Ruling Against OpenAI](https://www.insidetechlaw.com/blog/2025/11/germany-delivers-landmark-copyright-ruling-against-openai-what-it-means-for-ai-and-ip)
- [Bird & Bird: GEMA v OpenAI Analysis](https://www.twobirds.com/en/insights/2025/landmark-ruling-of-the-munich-regional-court-(gema-v-openai)-on-copyright-and-ai-training)
- [Gruenecker: AI and Copyright Law](https://grunecker.de/en/insights/ai-and-copyright-law-munich-regional-court-rules-against-openai/)

---

## 10. How Other Smart City Projects Handle AI Tools {#10-other-projects}

### The Landscape

Germany has **73 federally funded Smart City model projects** with EUR 820M total funding. The open-source mandate applies to all of them.

### Common Approaches

1. **Berlin Smart City**: Explicitly promotes open-source development, publishes components on opencode.de, uses FIWARE-based data platforms

2. **Hamburg Smart City Lab**: Uses FIWARE open-source platform components, publishes on GitHub/opencode.de

3. **Solingen**: Created the OSC License 1.1 specifically for municipal open-source projects, addressing German liability law concerns

4. **Hildesheim**: KfW-funded Smart City Modellprojekt with EUR 15.75M funding (part of EUR 17.5M total). Building digital platforms for crisis resilience and urban data management. Subject to all opencode.de publication requirements.

### AI Tool Usage: Current State

No German Smart City project has publicly documented or formally addressed the use of AI coding assistants. This is an area where OmniPort-HH could be a pioneer by:
- Establishing transparent AI usage documentation
- Creating a replicable framework for AI-assisted municipal development
- Demonstrating that AI tools enhance quality while maintaining open-source compliance

### Fraunhofer IESE Guidance

Fraunhofer IESE published a study on establishing open-source software in municipalities, emphasizing:
- Digital sovereignty through open source
- Interoperability via open standards
- Vendor independence
- Collaborative development across municipalities

**Sources:**
- [Smart City Dialog: Model Projects](https://www.smart-city-dialog.de/en/about-us/model-projects-smart-cities)
- [Smart City Berlin: Open Source](https://smart-city-berlin.de/en/knowledge/open-source)
- [Fraunhofer IESE: Open Source in Municipalities](https://www.iese.fraunhofer.de/en/media/press/pm-2024-01-24-open-source-software.html)
- [Hildesheim Smart City Modellprojekt](https://www.smart-city-dialog.de/modellprojekte/smart-city-modellprojekt-hildesheim)

---

## 11. KfW Funding Requirements for Open Source {#11-kfw-requirements}

### Mandatory Requirements (since Oct 1, 2022)

All KfW Modellprojekte Smart Cities (program 436) must:

1. **Publish source code on opencode.de** -- all applications developed with federal co-funding
2. **Use approved licenses** -- only licenses listed and reviewed by opencode.de
3. **Prefer strong copyleft** -- strict copyleft licenses (GPL, EUPL) are explicitly preferred
4. **Comprehensive documentation** -- understandable, enabling reuse by other municipalities
5. **Pass requirements to contractors** -- the open-source obligation applies to all partners, subcontractors, and commissioned developers

### Timeline Rules

| Procurement Type | Open Source Requirement Applies From |
|-----------------|--------------------------------------|
| Non-published procurements | When tender requests issue (after Oct 1, 2022) |
| Published procurements | At public announcement (after Oct 1, 2022) |
| Negotiation procedures | Upon completion of qualification review (after Oct 1, 2022) |
| Pre-Oct 2022 contracts | **Exempt** (but voluntary transition encouraged) |

### KfW Merkblatt 436 Key Points

- Funded municipalities must actively participate in experience exchange
- Software solutions must be provided as open source with documentation
- These obligations must be contractually passed to all implementation partners
- Applies to all three funding waves (Staffeln)

### Practical Implications for OmniPort-HH

- The Next.js/Supabase/TypeScript codebase must be published on opencode.de
- A compliant license must be chosen (recommendation: EUPL 1.2 or OSC 1.1)
- Documentation must be sufficient for another municipality to deploy the portal
- All contractor agreements must include the open-source pass-through clause

**Sources:**
- [Smart City Dialog: Open Source Regelungen](https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities)
- [KfW Merkblatt 436](https://www.kfw.de/PDF/Download-Center/F%C3%B6rderprogramme-(Inlandsf%C3%B6rderung)/PDF-Dokumente/6000004472_M_436_Smart_Cities.pdf)

---

## 12. Can the Leistungsbeschreibung Restrict AI Tool Usage? {#12-leistungsbeschreibung}

### Short Answer: Yes

Public procurement law allows the Leistungsbeschreibung to regulate AI tool usage. German legal experts recommend:

> "Bereits auf der Ebene der Leistungsbeschreibung sollte geregelt werden, dass der KI-Einsatz zur Erbringung der vertraglich geschuldeten Leistungen bzw. fuer die Softwareentwicklung nur bei vorheriger, ausdruecklicher und schriftlicher Zustimmung des oeffentlichen Auftraggebers erlaubt ist."

Translation: The Leistungsbeschreibung should specify that AI usage for contracted services/software development requires prior, explicit, written consent from the public client.

### Why Restrictions Exist

1. **IP/Copyright risk**: AI can suggest copyrighted third-party code (see GEMA ruling)
2. **License contamination**: Hidden copyleft obligations through AI-suggested code
3. **Quality assurance**: Public clients want to ensure human expertise, not AI hallucinations
4. **Data protection**: Code sent to US-based AI services without adequate safeguards
5. **Liability**: Unclear liability chain when AI produces defective code

### Current OmniPort-HH Situation

Check the specific Leistungsbeschreibung for:
- Any explicit prohibition or restriction on AI tool usage
- Requirements for disclosure of development methods
- IP/copyright ownership clauses
- Data protection requirements for development tools

If the Leistungsbeschreibung is silent on AI tools, this is a **grey area**. Proactive transparency is recommended.

**Sources:**
- [Schoenherr: KI & Softwarebeschaffung](https://www.schoenherr.eu/content/kunstliche-intelligenz-softwarebeschaffung-was-mussen-offentliche-auftraggeber-isd-bvergg-2018-beachten-und-welche-ki-klauseln-sind-sinnvoll)
- [Vergabeblog: KI-Beschaffung](https://vergabeblog.de/2025-11-24/beschaffung-kuenstlicher-intelligenz-ki-was-rechtlich-zu-beachten-ist-und-auftraggebern-sorgen-bereiten-koennte/)
- [Landgraf Datenschutz: Rechtliche Aspekte KI in Softwareentwicklung](https://landgraf-datenschutz.de/rechtliche-aspekte-beim-einsatz-von-ki-fuer-softwareentwicklung/)

---

## 13. How to Frame AI Usage in Vergabeverfahren {#13-framing}

### Recommended Narrative

Frame AI-assisted development as:

1. **A productivity tool, not a replacement**
   - "KI-Assistenzsysteme werden als Entwicklungswerkzeuge eingesetzt, vergleichbar mit IDEs, Linters oder Code-Formatierern."
   - The AI generates suggestions; humans make all architectural decisions, review, modify, and approve all code.

2. **Quality enhancer**
   - AI assists with boilerplate, testing, accessibility checks
   - Frees human developers for creative and security-critical work
   - All AI output undergoes human code review

3. **Transparent and documented**
   - Full disclosure of which AI tools are used
   - Documentation of AI-assisted vs. human-written components
   - License scanning as part of CI/CD pipeline
   - DSGVO-compliant configuration (training opt-out, minimal data exposure)

### Template: AI Usage Disclosure for Public Tender

```
Erklaerung zum Einsatz von KI-Assistenzsystemen

Im Rahmen der Softwareentwicklung setzen wir KI-gestuetzte
Entwicklungswerkzeuge als Produktivitaetshilfe ein. Diese Werkzeuge
unterstuetzen bei:
- Generierung von Standardcode (Boilerplate)
- Code-Review und Qualitaetssicherung
- Barrierefreiheits- und Sicherheitspruefungen

Dabei gelten folgende Grundsaetze:
1. Alle architekturellen Entscheidungen treffen menschliche Entwickler
2. Jeder KI-generierte Code wird menschlich geprueft und angepasst
3. Lizenz-Scanning Tools pruefen alle Codebestandteile auf Lizenzkonflikte
4. Die KI-Trainingseinstellung ist deaktiviert (kein Projektcode fuer
   KI-Training)
5. Vollstaendige Dokumentation des KI-Einsatzes ist verfuegbar
```

### What NOT to Do

- Do NOT hide AI usage -- this creates trust problems if discovered later
- Do NOT claim all code is "human-written" if AI was involved
- Do NOT use AI tools that train on your input without opt-out for public sector work
- Do NOT send personal data (Buerger-Daten, employee records) through AI tools

**Sources:**
- [DTVP: KI-Tools verantwortungsvoll einfuehren](https://dtvp.de/info-center/aktuelles/wie-vergabestellen-ki-tools-verantwortungsvoll-einfuehren/)
- [EIPA: AI Procurement with Model Clauses and GDPR](https://www.eipa.eu/blog/beyond-the-buzzwords-a-practical-guide-to-ai-procurement-with-model-clauses-and-gdpr/)

---

## 14. Recommended Actions for OmniPort-HH {#14-recommendations}

### Immediate (Before Next Meeting)

- [ ] **Check Leistungsbeschreibung** for any AI tool restrictions or disclosure requirements
- [ ] **Opt out of Anthropic training** at [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls)
- [ ] **Set environment variables** to minimize data exposure:
  ```bash
  export DISABLE_TELEMETRY=1
  export DISABLE_ERROR_REPORTING=1
  export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
  ```
- [ ] **Verify no personal data** (Buerger names, emails, etc.) exists in the codebase that Claude reads

### Short-Term (Project Setup)

- [ ] **Choose license**: EUPL 1.2 (recommended for EU public sector) or OSC 1.1 (German municipal focus)
- [ ] **Set up opencode.de repository** for OmniPort-HH
- [ ] **Integrate license scanning** (FOSSology or FOSSA) into CI/CD pipeline
- [ ] **Create AI Usage Documentation** template (see Section 8)
- [ ] **Add REUSE specification** and SPDX identifiers to the codebase
- [ ] **Generate initial SBOM** in SPDX format

### Medium-Term (Compliance)

- [ ] **Consider switching to API or Team plan** for DSGVO-compliant DPA coverage
- [ ] **Prepare DSFA** (Datenschutz-Folgenabschaetzung) for AI tool usage
- [ ] **Draft "Erklaerung zum KI-Einsatz"** for project documentation
- [ ] **Establish code provenance log** per feature/module

### For Client Communication

Key talking points:
1. AI tools are used as **productivity assistants** -- all code is human-reviewed
2. **No personal data** is processed through AI tools
3. Training opt-out is **active** -- no project code is used for AI training
4. Full **open-source compliance** with opencode.de and KfW requirements
5. **License scanning** prevents copyleft contamination
6. OmniPort-HH is built for **reusability** by other municipalities (EfA principle)
7. We are **pioneers** in transparently documenting AI-assisted municipal development

---

## Summary Table: Risk Assessment

| Risk Area | Severity | Mitigation | Status |
|-----------|----------|-----------|--------|
| EU AI Act compliance | Low | Coding assistants = minimal risk | OK |
| DSGVO / data transfer to US | Medium | Opt-out training, consider API plan | Action needed |
| Copyright contamination from AI | Medium | License scanning, code review | Action needed |
| KfW open-source requirements | High | opencode.de publication required | Action needed |
| Leistungsbeschreibung AI restrictions | Unknown | Review document | Action needed |
| Vergaberecht transparency | Medium | Proactive disclosure, documentation | Action needed |
| German copyright for AI code | Low-Medium | Document human creative input | Ongoing |

---

*Research compiled 2026-03-30. Legal landscape is rapidly evolving -- review quarterly.*
