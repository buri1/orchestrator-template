# German Companies Using AI in Software Development

**Research Date:** 2026-03-31
**Purpose:** Concrete, verifiable references for Stadt Hildesheim Smart City presentation

---

## TIER 1 — VERIFIED WITH SOURCE (German Companies, Hard Numbers)

### 1. SAP (Walldorf, Baden-Württemberg)

**What they do:** Joule for Developers — an AI copilot trained on millions of lines of SAP code, integrated into SAP Build Code. Supports code generation, unit test generation, code completion, refactoring, and code explanation across ABAP, Java, and JavaScript.

**Key facts:**
- 80% of developers report increased productivity with AI coding assistants, with an average **35% productivity gain** (IDC white paper cited by SAP)
- **30% cost reduction** for development with Joule
- 17,000+ customers using SAP Build solutions
- Purpose-built LLM trained on millions of lines of SAP code
- **MCP Server support (2026):** SAP Build now offers local MCP servers so developers using Cursor, Claude Code, Windsurf, and Cline can work directly with SAP frameworks
- ABAP MCP Server for AI-assisted ABAP code generation planned H1 2026
- Roadmap: transitioning from individual AI skills to full-scale **Agentic AI** for ABAP development

**Executive quote:** Michael Ameling (President, SAP BTP): *"Rather than spending countless hours on repetitive tasks like debugging errors and dealing with legacy codebases, developers can transform their ideas into code quickly."*

**Sources:**
- [SAP News: Joule for Developers](https://news.sap.com/2025/03/joule-for-developers-ai-powered-capabilities/)
- [SAP News: Joule + ABAP Transform Developer Experience](https://news.sap.com/2025/07/joule-abap-transform-developer-experience/)
- [SAP News: Agentic Capabilities on BTP](https://news.sap.com/2025/11/new-agentic-capabilities-sap-btp-supercharge-developers/)
- [SAP Joule Product Page](https://www.sap.com/products/artificial-intelligence/joule-for-developers.html)
- [SAP Community: 2026 Roadmap](https://community.sap.com/t5/technology-blog-posts-by-sap/our-2026-roadmap-for-joule-for-developers-abap-ai-capabilities/ba-p/14360358)

---

### 2. Zalando (Berlin)

**What they do:** Deployed AI coding tools to their entire technical workforce. One of the strongest verifiable German examples with specific numbers from an official investor report.

**Key facts:**
- Equipped **~3,000 tech specialists** with AI coding tools
- Measured **>20% more code changes** (official metric from 2025 annual report)
- This is in a "complex environment" — not a toy project
- Additionally: AI-generated product content scaled from near zero to **90%** in one year
- Campaign creation reduced from 6 weeks to days
- 70% boost in content output

**Note:** Specific tool names (GitHub Copilot, etc.) not disclosed in the annual report.

**Source:** [Zalando Full Year 2025 Results (Official Investor Report)](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results)

---

### 3. Delivery Hero (Berlin)

**What they do:** Won the **2025 Google DORA Award** for improving developer experience with Gemini Code Assist. One of the largest documented AI coding deployments in Germany.

**Key facts:**
- **4,000+ software engineers and data scientists** using Gemini Code Assist
- **15,000+ GitHub repositories** with the AI code review agent enabled globally
- Used for: code completion, code explanation, unit test generation, PR auto-summaries
- AI-generated PR summaries created a documentation culture where none existed before
- Errors flagged by the AI agent have **prevented potential tier-1 service outages** (cited in Weekly Operations Reviews)
- Available via IntelliJ, VS Code, and browser-based interface

**Source:** [Google Cloud Case Study: Delivery Hero](https://cloud.google.com/customers/delivery-hero-ai) | [Delivery Hero Blog: DORA Award Story](https://deliveryhero.jobs/blog/from-pilot-to-prize-our-2025-dora-award-story/)

---

### 4. Siemens (Munich) — Industrial Copilot

**What they do:** Siemens Industrial Copilot, developed with Microsoft, generates PLC code (Structured Control Language / SCL) for programmable logic controllers via the TIA Portal. This is AI writing industrial automation code, not just office software.

**Key facts:**
- AI generates SCL code from natural language descriptions for PLCs
- Integrates directly into TIA Portal (used by **120,000+ professionals** worldwide)
- **thyssenkrupp** (Essen) is rolling out the Copilot across all global locations from 2025
- thyssenkrupp used it first for battery quality inspection machines for EVs
- Also: **Questa One RTL Code Agent** — generates synthesizable RTL code from natural language, checks for coding violations
- Also: **Fuse EDA AI Agent** — automates RTL coding across full design lifecycle

**Executive quote:** Dr. Rolf-Gunther Nieberding (CEO, thyssenkrupp Automation Engineering): *"Rolling out the Siemens Industrial Copilot across our machines will help us — and therefore our customers — to implement demanding projects in a much shorter time."*

**Sources:**
- [Siemens Press: Industrial Copilot + thyssenkrupp](https://press.siemens.com/global/en/pressrelease/siemens-industrial-copilot-expanded-adopted-thyssenkrupp)
- [Siemens: Engineering Copilot TIA](https://www.siemens.com/en-us/products/tia-portal/engineering-copilot-tia-standard/)
- [Siemens: Questa One Agentic Toolkit](https://news.siemens.com/en-us/questa-one-agentic-ai-toolkit/)

---

### 5. BMW (Munich + Global IT Hubs)

**What they do:** Built **JoyCode**, a proprietary AI-assisted development platform with code generation, unit testing, error detection, and Jira integration. Developed by BMW LingYue (Nanjing subsidiary), but used across BMW Group globally.

**Key facts:**
- JoyCode available as extensions for VS Code, JetBrains IDEs, and Chrome
- Features: code generation, comments, explanations, error detection, optimization, unit tests
- AI Chat for natural language problem-solving
- Jira Assistant: auto-generates story descriptions, acceptance criteria, test cases
- CodeCraft platform: up to 75,000 virtual CPUs, 200,000 software builds/day
- Neue Klasse vehicles: ~40 GB software, 500 million lines of code
- 10,000 IT and software experts worldwide

**Sources:**
- [BMW Group IT and Software Hubs](https://www.bmwgroup.com/en/news/general/2025/it-and-software-hubs.html)
- [JoyCode VS Code Extension](https://marketplace.visualstudio.com/items?itemName=BMWLingYueCIH.JoyCode)

---

### 6. Volkswagen Group (Wolfsburg)

**What they do:** Deployed Microsoft Copilot integrated into PTC Codebeamer for requirement specification and test case generation across the Group.

**Key facts:**
- Copilot assists with creating requirement specifications and test cases using VW-specific data
- **20-40% time savings** for requirement management (Codebeamer metric)
- Deployed "throughout the entire Volkswagen Group"
- 1,500+ employees in RIVT Tech subsidiary for SDV architecture development

**Executive quote:** Robert Kattner (Head of VW Group IT Engineering): *"By having a copilot in the Codebeamer software, it can assist [with creating specifications and test cases] using their specific data and business context."*

**Source:** [Microsoft Customer Story: Volkswagen](https://www.microsoft.com/en/customers/story/24120-volkswagen-microsoft-copilot)

---

### 7. Deutsche Telekom (Bonn)

**What they do:** Rolling out ChatGPT Enterprise company-wide, plus internal "AskT" chatbot. AI Engineer role used for software development internally and in customer projects.

**Key facts:**
- ChatGPT Enterprise rollout across the entire company (2026)
- "AskT" internal chatbot based on ChatGPT technology (approved for internal-classified data)
- AI Engineer for software development — used both internally and in B2B projects
- Potential: ChatGPT-based coding tools for network provisioning, billing (OSS/BSS) systems
- **$1.2B AI Cloud** with NVIDIA (Munich data center, 10,000 Blackwell GPUs)
- OpenAI multi-year partnership for internal + customer-facing AI

**Sources:**
- [OpenAI: Deutsche Telekom Collaboration](https://openai.com/index/deutsche-telekom-collaboration/)
- [Deutsche Telekom: Business GPT](https://www.telekom.com/en/media/media-information/archive/business-gpt-trusted-partner-for-ai-1064318)
- [Deutsche Telekom: AI at DT](https://www.telekom.com/en/company/details/shape-take-make-ai-at-deutsche-telekom-1078506)

---

## TIER 2 — VERIFIED WITH SOURCE (Supporting Evidence)

### 8. Bosch (Stuttgart/Gerlingen)

**What they do:** Massive AI investment, Microsoft collaboration on agentic AI for manufacturing, extensive internal AI training.

**Key facts:**
- **$2.7+ billion AI investment** planned through 2027
- 65,000+ associates trained through Bosch AI Academy since 2019
- 1,500+ AI patent applications in 5 years
- Microsoft collaboration: "Manufacturing Co-Intelligence" with agentic AI (CES 2026)
- Target: 6 billion EUR in software and services revenue by early next decade

**Sources:**
- [Bosch AI Investment](https://www.digitalcommerce360.com/2026/01/06/bosch-2-billion-ai-investment/)
- [Bosch Tech Day 2025](https://us.bosch-press.com/pressportal/us/en/press-release-27776.html)

---

### 9. Allianz (Munich)

**What they do:** AllianzGPT — internal AI platform rolled out to entire workforce. Comprehensive AI training programs.

**Key facts:**
- AllianzGPT: **60,000+ active users**, goal is all 158,000 employees
- Runs on Azure (data stays in Allianz Azure Cloud)
- Offers GPT-4o + DeepSeek within ring-fenced environment
- Professional certification programs in Data Science, AI Engineering via DataCamp
- 9-month hybrid programs with Sorbonne University (Paris)

**Source:** [Allianz: AI at Allianz - Impact of AllianzGPT](https://www.allianz.com/en/mediacenter/news/articles/250218-ai-at-allianz-the-impact-of-allianzgpt.html)

---

### 10. Automotive Industry Consortium (Ludwigsburg MoU)

**What they do:** 11 OEMs and suppliers (Mercedes-Benz, BMW, VW, Bosch, Continental, etc.) signed MoU for pre-competitive open-source software collaboration.

**Key facts:**
- First public software modules: end of 2025
- Complete stack for series projects: 2026
- Focus: automated driving platform
- Signed at Automobil-Elektronik Kongress in Ludwigsburg

**Source:** [Automotive Industry Open-Source Collaboration](https://www.adt.media/software-defined-vehicles/automotive-industry-collaborates-more-closely-on-software-development/423968)

---

## TIER 3 — GERMAN PUBLIC SECTOR & REGULATORY

### 11. "OpenAI for Germany" (SAP + OpenAI + Microsoft)

**What it is:** Sovereign AI platform for German public sector, launching 2026. Enables millions of public sector employees to use AI safely.

**Key facts:**
- Runs on SAP subsidiary **Delos Cloud** (German data sovereignty)
- 4,000 GPUs for AI workloads in Germany
- Targets: governments, administrations, research institutions
- Use cases: records management, administrative data analysis, AI agents in workflows
- Supports federal government's High-Tech Agenda: 10% of GDP from AI by 2030

**Sources:**
- [SAP News: OpenAI for Germany](https://news.sap.com/2025/09/sap-openai-partner-launch-sovereign-openai-germany/)
- [OpenAI: OpenAI for Germany](https://openai.com/global-affairs/openai-for-germany/)

---

### 12. mgm technology partners / A12 Platform (Munich)

**What it is:** A12, a model-based development platform for public administration applications, going open source May 2026. Explicitly designed for agentic coding.

**Key facts:**
- Model-based development forms the foundation for **agentic coding** — AI systems can directly read, interpret, and use domain models for code generation
- Available to federal, state, and local government agencies
- Subject matter experts can design application logic **without programming knowledge**
- Member of Open Source Business Alliance (OSBA)
- Uses open language models, open development environments — no vendor lock-in

**Source:** [mgm: A12 Platform](https://insights.mgm-tp.com/en/category/a12-en/)

---

### 13. BSI + ANSSI Joint Publication on AI Coding Assistants

**What it is:** Official Franco-German cybersecurity guidance specifically about AI coding assistants in software development (published October 2024).

**Key recommendations:**
- AI coding assistants are **no substitute for experienced developers**
- Systematic risk analysis required before introducing AI tools
- Key risks: hallucinated packages (supply chain attacks), indirect prompt injections, cognitive bias (developers trust AI-generated code too much)
- Assessment of provider trustworthiness required
- GDPR and EU AI Act compliance mandatory

**Why this matters for the presentation:** Shows the German federal government is actively creating frameworks for responsible AI-assisted development — not banning it, but guiding it.

**Source:** [BSI: AI Coding Assistants (PDF)](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/KI/ANSSI_BSI_AI_Coding_Assistants.pdf?__blob=publicationFile&v=7)

---

### 14. URBAN.KI — Gelsenkirchen / Fraunhofer

**What it is:** Central AI competence center for municipalities, developing open-source AI solutions for Smart Cities.

**Key facts:**
- Developed by Westfälische Hochschule on behalf of Gelsenkirchen
- 130+ municipal project ideas, 9 currently implemented as open source
- 8% of German municipalities already deploying AI solutions
- ~2/3 of municipalities recognize AI potential and want to use it

**Source:** [Fraunhofer: URBAN.KI](https://www.fokus.fraunhofer.de/en/dps/projects/ki4kl.html)

---

## TIER 4 — GERMAN INDUSTRY DATA (Research Studies)

### 15. Empirical Study: GenAI in German Software Engineering (2026)

**What it is:** The first systematic study of AI coding tool adoption among German software engineers. Published January 2026 (arXiv).

**Key statistics:**
- **ChatGPT:** 90% adoption among German devs
- **GitHub Copilot:** 55% adoption
- **Google Gemini:** 37%
- **Claude:** 28%
- **Internal company tools:** 28%
- **Code completion/generation:** 70% use at least a few times per week
- **76% report individual workflow speed improvement**
- **73% report faster learning**
- Small enterprises: 93% weekly or more frequent AI use; large enterprises: only 31-50%
- **German vs. US gap:** 88% of US organizations support AI adoption vs. 59% in Germany

**Key barrier:** Limited awareness of project context is the #1 challenge. GDPR and EU AI Act create tensions with cloud-based AI services.

**Source:** [arXiv: Adoption of GenAI in German Software Engineering](https://arxiv.org/html/2601.16700v1)

---

### 16. KPMG Study: Generative AI in German Economy (2025)

**Key stats from 653 German decision-makers:**
- 69% have set up AI strategy
- 72% planning to increase AI investment
- 95% actively working on Trusted AI implementation
- Only 26% have company-wide AI strategy

**Source:** [KPMG: GenAI in German Economy 2025](https://kpmg.com/de/en/home/insights/2025/04/study-generative-ai-in-the-german-economy-in-2025.html)

---

### 17. Bundesbank Corporate Survey (2025)

**Key stat:** Share of German firms using or expecting to use GenAI: **26% (2024) -> 44% (2025) -> 56% (2026)**

**Source:** [CEPR: Generative AI in German Firms](https://cepr.org/voxeu/columns/generative-ai-german-firms-diffusion-costs-and-expected-economic-effects)

---

## BONUS — KEY REFERENCE QUOTE (Non-German, but critical)

### Jensen Huang, NVIDIA GTC 2026 (March 2026)

*"I'd be deeply alarmed if a $500K developer spent less than $250K on AI tokens."*

- Proposed giving engineers **token budgets worth 50% of their salary** on top of base pay
- NVIDIA trying to spend **~$2 billion/year on tokens** for their engineering team
- Compared not using AI to "using paper and pencil to design chips"
- Called AI tokens "one of the recruiting tools in Silicon Valley"

**Sources:**
- [Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/jensen-huang-says-nvidia-engineers-should-use-ai-tokens-worth-half-their-annual-salary-every-year-to-be-fully-productive-compares-not-using-ai-to-using-paper-and-pencil-for-designing-chips)
- [CNBC](https://www.cnbc.com/2026/03/20/nvidia-ai-agents-tokens-human-workers-engineer-jobs-unemployment-jensen-huang.html)
- [Fortune](https://fortune.com/2026/03/17/jensen-huang-ai-infrastructure-buildout-1-trillion-dollars/)

---

## QUICK REFERENCE TABLE FOR PRESENTATION

| Company | City | What | Key Number | Source Type |
|---------|------|------|------------|-------------|
| SAP | Walldorf | Joule for Developers, MCP Server | 35% avg productivity gain, 30% cost reduction | Official SAP |
| Zalando | Berlin | AI coding tools for all devs | >20% more code changes, 3,000 devs | Investor report |
| Delivery Hero | Berlin | Gemini Code Assist, DORA Award | 4,000 engineers, 15,000 repos | Google Cloud |
| Siemens | Munich | Industrial Copilot PLC code gen | 120,000+ TIA Portal users, thyssenkrupp rollout | Press release |
| BMW | Munich | JoyCode AI dev platform | 500M lines of code, 10,000 IT experts | Official BMW |
| VW Group | Wolfsburg | Codebeamer Copilot | 20-40% time savings | Microsoft |
| Deutsche Telekom | Bonn | ChatGPT Enterprise rollout | Company-wide 2026 | OpenAI |
| Bosch | Stuttgart | AI investment + training | $2.7B AI investment, 65,000 trained | Press release |
| Allianz | Munich | AllianzGPT platform | 60,000+ active users | Official Allianz |
| mgm / A12 | Munich | Agentic coding for public admin | Open source May 2026 | Company |
| BSI/ANSSI | Bonn | AI Coding Assistant guidance | Official government framework | BSI.bund.de |

---

## NARRATIVE SUGGESTION FOR PRESENTATION

**Opening framing (German):**
> "Die größten deutschen Unternehmen setzen KI bereits in der Softwareentwicklung ein — nicht als Experiment, sondern im Produktivbetrieb. SAP hat Joule mit MCP-Servern für Entwickler gebaut. Zalando misst über 20% mehr Code-Output bei 3.000 Entwicklern. Delivery Hero hat den Google DORA Award für KI-gestützte Entwicklung gewonnen. Siemens generiert PLC-Code per KI und rollt das bei thyssenkrupp weltweit aus."

**Public sector bridge:**
> "Das BSI hat zusammen mit der französischen ANSSI offizielle Richtlinien für KI-Coding-Assistenten veröffentlicht — nicht um sie zu verbieten, sondern um den verantwortungsvollen Einsatz zu steuern. Die A12-Plattform von mgm wird im Mai 2026 als Open Source für Verwaltungsanwendungen veröffentlicht — mit Unterstützung für Agentic Coding, also KI-gestützte Code-Generierung auf Basis von Fachmodellen."

**Jensen Huang anchor:**
> "Jensen Huang sagte auf der GTC im März 2026: Jeder Entwickler, der 500.000 Dollar im Jahr verdient und nicht mindestens 250.000 Dollar in KI-Tokens investiert, macht ihn 'zutiefst beunruhigt'. NVIDIA versucht, 2 Milliarden Dollar pro Jahr für KI-Tokens für ihr Engineering-Team auszugeben."
