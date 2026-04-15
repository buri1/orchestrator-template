# opencode.de & German Municipal Open-Source Ecosystem

**Research Date**: 2026-03-31 | **Purpose**: Meeting 2 presentation backup — Hildesheim Smart City / OmniPort-HH

---

## TOP 5 TALKING POINTS FOR THE SLIDE

1. **Pflicht, nicht Kuer**: Software developed with KfW Smart City funding MUST be published on opencode.de (mandatory since October 2022). OmniPort is already architected for this — modular, open-source, EUPL-compatible.

2. **8.000+ Nutzer, 3.000+ Projekte, 200 neue/Monat**: opencode.de is not a ghost platform — it is the fastest-growing public-sector code repository in Europe. Publishing OmniPort there gives Hildesheim national visibility.

3. **BSI-Sicherheitspartnerschaft 2026**: BSI and ZenDiS are launching automated vulnerability detection, dependency transparency, and provenance verification on opencode.de THIS YEAR. OmniPort gets enterprise-grade security scanning for free.

4. **EfA-Prinzip = Nachnutzung durch 11.000 Kommunen**: "Einer fuer Alle" means one municipality builds, all others reuse. OmniPort's modular portal architecture (Shared Components, plug-in/plug-out portals) is the textbook EfA implementation.

5. **Connected Urban Twins als Vorbild**: Hamburg, Leipzig, Muenchen — 32.4 Mio EUR, all code on opencode.de. Hildesheim joins an elite group of German Smart City pioneers publishing on the same platform.

---

## 1. opencode.de — The Platform

### What It Is

opencode.de is Germany's official open-source platform for public administration. It consists of:

- **GitLab instance**: `gitlab.opencode.de` — self-hosted, sovereign code repository
- **Software catalogue**: searchable directory with automated quality badges
- **Discussion forum**: `discourse.opencode.de` — community exchange
- **Services portal**: `services.opencode.de` — build services, security scanning

It launched in April 2022 as a joint initiative of the Federal Ministry of the Interior (BMI), Baden-Wuerttemberg, and North Rhine-Westphalia.

### Who Runs It

**ZenDiS** (Zentrum fuer Digitale Souveraenitaet der Oeffentlichen Verwaltung) — the Centre for Digital Sovereignty in Public Administration — has managed opencode.de since January 2024.

- Founded: December 2022 by the BMI
- CEO: Jutta Horstmann (longtime open-source expert)
- Previous CEO: Andreas Reckert-Lodde (presented at UN in July 2024)
- Germany's CIO Markus Richter publicly endorses the initiative
- ZenDiS organized a dedicated devroom at FOSDEM 2025

### Platform Statistics (as of early 2025)

| Metric | Value |
|--------|-------|
| Registered users | 8,000+ |
| Projects | 3,000+ |
| Monthly growth | ~200 new projects/month |
| Growth since 2023 | From 2,200 users / 700 projects to 8,000+ / 3,000+ |

### The Badge System (launched early 2025)

Automated quality evaluation for all projects in four categories:

| Badge | Criteria |
|-------|----------|
| **Open Source** | Valid OSI-approved license present |
| **Wartung (Maintenance)** | >= 5 commits in last 6 months, issue response time < 7 days |
| **Nutzung (Usage)** | At least 1 organization actively uses it (Gold: 10+ orgs) |
| **Sicherheit (Security)** | CVE-age check (CVSS >= 7.0 vulnerabilities), CI pipeline status |

### BSI Security Partnership (launching 2026)

BSI (Federal Office for Information Security) and ZenDiS are building:

- Automated vulnerability detection in software supply chains
- Dependency transparency (SBOM — Software Bill of Materials)
- Traceable proof of origin for critical software components
- Sovereign container registry with uniform standards
- Resilient distribution network

This responds to supply-chain attacks like SolarWinds (2020). Target launch: 2026.

**Source**: [BSI and ZenDiS: More security for digital infrastructures with openCode](https://www.heise.de/en/news/BSI-and-ZenDiS-More-security-for-digital-infrastructures-with-openCode-10351578.html)

---

## 2. Licenses on opencode.de

### Preferred: EUPL 1.2 (European Union Public Licence)

The EUPL is the only truly multilingual open-source license, available in all 23 official EU languages. Key properties:

- **Copyleft (share-alike)**: Derivative works must be shared under the same terms
- **Compatible**: With GPL-3.0, LGPL, AGPL — seamless integration
- **European law**: Drafted per Directive 2009/24/EG
- **Interface freedom**: APIs and data structures can be freely reused without restricting component licensing
- **OSI-certified** and recognized by the Free Software Foundation

### Allowed License Categories on opencode.de

| Category | Examples | Derivatives |
|----------|----------|-------------|
| **Strict Copyleft** | GPL, EUPL, EPL | Must remain open-source |
| **Weak Copyleft** | LGPL, MPL | Balanced restrictions |
| **Permissive** | MIT, Apache 2.0, BSD | Allows proprietary derivatives |

**Recommendation for OmniPort**: EUPL 1.2 is the strongest choice — it signals European sovereignty, is legally clear in German courts, and aligns with the platform's preferred license.

---

## 3. KfW Smart City Funding & Open-Source Requirements

### The Mandate

Software developed with KfW "Modellprojekte Smart Cities" (MPSC) funding **must** be published on opencode.de. This is **not optional**.

Key rules (clarified 14 September 2022, effective 1 October 2022):

1. **Publication obligation**: All software funded by federal money must be published on opencode.de
2. **License requirement**: Must use one of the licenses approved by opencode.de's compliance list
3. **Procurement language**: Tender documents must include: *"Loesung muss auf Basis von Open-Source-Komponenten umgesetzt werden"*
4. **Scalability mandate**: Solutions must be "skalierbar und replizierbar" (scalable and replicable) for the entire German municipal landscape
5. **Principle**: "Public Money — Public Code"

### Exceptions

- Proprietary interfaces to specialized GIS/CAD systems (if interfaces themselves are published as open-source)
- Device firmware (sensors, actuators) — only higher-level coordination software must be open
- Contracts predating 1 October 2022 are grandfathered

### Hildesheim's Funding

| Detail | Value |
|--------|-------|
| Program | Modellprojekte Smart Cities (KfW 436) |
| Total funding | 17.5 Mio EUR (15.75 Mio Bund + 1.75 Mio Eigenanteil) |
| Selection | 3. Staffel, July 2021 (28 of 94 applications, Top 10) |
| Project title | "HI 2030: Das resiliente Hildesheim der Zukunft" |
| End date | 31 December 2026 |
| Motto | "Ein analog-digitales Oekosystem fuer die resiliente Stadt" |

**Source**: [Smart City Dialog — Open Source Regelungen](https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities)

---

## 4. EfA-Prinzip (Einer fuer Alle)

### How It Works

The EfA principle is the foundation for reuse in German digital government:

- **One municipality** develops a digital service
- **All others** can reuse it without rebuilding from scratch
- Instead of 16 state-level implementations + 400 municipal implementations, ONE solution serves everyone
- Operating costs are shared among all reusing partners

### Why Open Source is Critical for EfA

Proprietary software has proven to be the main blocker for EfA adoption:

- License costs prevent smaller municipalities from reusing
- Vendor lock-in creates SaaS monopolies
- Closed ecosystems prevent interoperability
- Only open-source ensures true Nachnutzbarkeit (reusability)

### Legal Basis

EfA is anchored in the **Onlinezugangsgesetz (OZG)** — the Online Access Act that requires all German administrative services to be available digitally.

**Source**: [Digitale Verwaltung — EfA-Prinzip](https://www.digitale-verwaltung.de/Webs/DV/DE/onlinezugangsgesetz/efa/efa-node.html)

---

## 5. Notable Municipal Open-Source Projects on opencode.de

### Smart City Projects (tagged "SmartCity" on gitlab.opencode.de)

| City/Project | Description | Tech |
|-------------|-------------|------|
| **Smart City Muenster** | Dashboard (Backend + Frontend), Leezenflow bike mobility | Web-based |
| **Smart City Mannheim** | Digital + sustainable urban development platform | Various |
| **Smart City Menden** | Municipal data visualization dashboard | Web-based |
| **Buerger-Dashboard Muehlhausen** | Citizen-facing data dashboard | Web-based |
| **p2d2 (Cologne)** | Public-Public Data-DNA — geospatial data infrastructure | Modern web |
| **Energieautarkes Wohnquartier** | 3D energy visualization (React, Three.js) | React/Three.js |
| **LoRaWAN Besucherzaehlung** | IoT visitor counting with battery sensors | IoT/LoRaWAN |
| **Urban Data Plattform** | Architecture for municipal data platforms | Various |

### Connected Urban Twins (CUT) — The Flagship

The largest Smart City project on opencode.de:

- **Cities**: Hamburg, Leipzig, Muenchen
- **Funding**: 32.4 Mio EUR (MPSC program)
- **Duration**: 2021-2025
- **What**: Urban data platforms + digital twins for urban planning
- **Key component**: DIPAS (Digital Participation System) — citizen participation tool
- **All code**: Published on `gitlab.opencode.de/connected-urban-twins`
- **Principle**: Results available as "Model Toolkit" for other municipalities

**Source**: [Connected Urban Twins](https://www.connectedurbantwins.de/en/the-project/)

---

## 6. Sovereign Tech Fund

### Overview

The Sovereign Tech Fund (now Sovereign Tech Agency) is a German government initiative investing in critical open-source infrastructure:

| Year | Budget |
|------|--------|
| 2022 | 3.5 Mio EUR |
| 2025 | ~17 Mio EUR (projected) |
| Total invested | 24.9 Mio USD+ in 2 years |

### Relevance to OmniPort

- The Fund is exploring collaboration with ZenDiS specifically for public-sector open-source
- It positions public administration as **active stakeholder** in open-source ecosystems (not passive consumer)
- Cross-border knowledge exchange intensifying with EU's push to reduce non-European tech dependency
- **Indirect relevance**: The Fund strengthens the overall German open-source ecosystem that OmniPort operates within

**Source**: [Sovereign Tech Fund](https://www.sovereign.tech/)

---

## 7. How OmniPort Fits — Strategic Positioning

### Technical Alignment

| opencode.de Requirement | OmniPort Status |
|------------------------|-----------------|
| Open-source license | Ready (choose EUPL 1.2) |
| Published on opencode.de | Ready to publish |
| Scalable & replicable | Modular architecture (portals can be added/removed) |
| Modern tech stack | Next.js + Supabase + TypeScript (widely adoptable) |
| Shared Components | Cross-portal reuse built-in |
| No vendor lock-in | No proprietary dependencies |

### EfA Compliance

OmniPort is arguably the **strongest EfA implementation** among Smart City portals because:

1. **Modular portal architecture**: Any municipality can take 1 portal or all 6 — no all-or-nothing
2. **Shared Component library**: Header, navigation, theming, authentication — reusable across portals
3. **Standard tech stack**: Next.js + Supabase are widely known, low barrier to adoption
4. **No infrastructure lock-in**: Runs on Vercel, self-hosted, or any cloud
5. **Configuration-driven**: Municipal branding/colors/content via config, not code changes

### Competitive Position Among MPSC Projects

Most Smart City projects on opencode.de are:
- Single-purpose dashboards (Muenster, Menden, Muehlhausen)
- Data platforms without citizen-facing portals
- Sensor/IoT backends

OmniPort is **unique** as a full citizen-facing portal platform with multiple integrated sub-portals (Arbeit, Gruendung, Engagement, Erleben, Wissen). No comparable modular municipal portal exists on opencode.de.

### The Narrative for the Slide

> "OmniPort wird auf opencode.de veroeffentlicht — der zentralen Open-Source-Plattform der oeffentlichen Verwaltung mit ueber 8.000 Nutzern und 3.000 Projekten. Damit steht Hildesheims Loesung allen 11.000 deutschen Kommunen zur Nachnutzung bereit. Kein Vendor-Lock-in, keine Lizenzkosten, volle digitale Souveraenitaet."

Translation: "OmniPort will be published on opencode.de — the central open-source platform for public administration with over 8,000 users and 3,000 projects. This makes Hildesheim's solution available for reuse by all 11,000 German municipalities. No vendor lock-in, no license costs, full digital sovereignty."

---

## Sources

- [openCode.de — About](https://opencode.de/en/about-opencode)
- [ZenDiS — Official Website](https://www.zendis.de/en)
- [ZenDiS, openDesk, and openCode — All Things Open](https://allthingsopen.org/articles/zendis-opendesk-opencode-public-sector-open-source)
- [EUPL & openCode — L3montree](https://l3montree.com/blog/eckpfeiler-der-digitalen-souveraenitaet-open-source-loesungen-in-der-oeffentlichen-verwaltung-eupl-opencode)
- [Smart City Dialog — Open Source Regelungen](https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities)
- [Smart City Dialog — Open Source Informationen](https://www.smart-city-dialog.de/informieren/aktuelles/informationen-zu-open-source-fuer-modellprojekte)
- [BSI + ZenDiS Security Partnership — Heise](https://www.heise.de/en/news/BSI-and-ZenDiS-More-security-for-digital-infrastructures-with-openCode-10351578.html)
- [Hildesheim Smart City Announcement](https://www.hildesheim.de/rathaus/pressemeldungen/2021-07-18/hildesheim-wird-modellprojekt-smart-cities.html)
- [Hildesheim 15.75 Mio EUR Details](https://www.hildesheimer-allgemeine.de/meldung/smart-city-was-hildesheim-mit-den-1575-millionen-euro-anfangen-will.html)
- [Hi Zukunft — Official Portal](https://www.hi-zukunft.de/)
- [Connected Urban Twins](https://www.connectedurbantwins.de/en/the-project/)
- [Connected Urban Twins on opencode.de](https://gitlab.opencode.de/connected-urban-twins)
- [Smart City Projects on opencode.de](https://gitlab.opencode.de/explore/projects/topics/SmartCity)
- [EfA-Prinzip — Digitale Verwaltung](https://www.digitale-verwaltung.de/Webs/DV/DE/onlinezugangsgesetz/efa/efa-node.html)
- [Sovereign Tech Fund](https://www.sovereign.tech/)
- [openCode Badge System](https://opencode.de/de/wissen/softwareverzeichnis/badges)
- [KfW MPSC Program (436)](https://www.kfw.de/inlandsfoerderung/%C3%96ffentliche-Einrichtungen/Digitalisierung/F%C3%B6rderprodukte/Modellprojekte-Smart-Cities-%E2%80%93-Zuschuss-(436)/)
- [Fraunhofer IESE — Open Source for Municipalities](https://www.iese.fraunhofer.de/en/media/press/pm-2024-01-24-open-source-software.html)
