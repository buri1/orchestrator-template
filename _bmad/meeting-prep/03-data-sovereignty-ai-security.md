# Data Sovereignty & Security: AI-Assisted Development

**Prepared**: 2026-03-30
**Purpose**: Meeting prep — addressing security-conscious stakeholders on AI tool usage in enterprise/government software development
**Key Message**: "We use AI tools for development speed, but ALL code is human-reviewed, tested, and the AI never sees production data or credentials."

---

## Table of Contents

1. [Does Code Sent to AI Models Contain Personal Data? (DSGVO Assessment)](#1-personal-data-in-source-code--dsgvo-assessment)
2. [Claude/Anthropic Data Handling Policy](#2-claudeanthropic-data-handling-policy)
3. [GitHub Copilot Business/Enterprise vs Claude Code](#3-github-copilot-businessenterprise-vs-claude-code)
4. [Air-Gapped / Local AI Coding Options](#4-air-gapped--local-ai-coding-options)
5. [AI-Generated Code & Security Vulnerabilities](#5-ai-generated-code--security-vulnerabilities)
6. [OWASP Guidelines for AI-Generated Code](#6-owasp-guidelines-for-ai-generated-code)
7. [Code Review Processes (Human-in-the-Loop)](#7-code-review-processes-human-in-the-loop)
8. [SOC 2, ISO 27001 Compliance of Providers](#8-soc-2-iso-27001-compliance-of-providers)
9. [German BSI Recommendations](#9-german-bsi-recommendations)
10. [How to Frame AI-Assisted Development to Stakeholders](#10-how-to-frame-ai-assisted-development-to-stakeholders)

---

## 1. Personal Data in Source Code — DSGVO Assessment

### What Constitutes Personal Data in Code?

Every code repository can contain personal data under DSGVO/GDPR definition:

- **Git metadata**: Developer names, email addresses in commits
- **Configuration files**: Internal usernames, email addresses
- **Test data**: Customer IDs, sample names, addresses
- **Comments/documentation**: Developer names, internal references
- **Environment variables**: While credentials should be excluded (`.gitignore`), references to system identifiers exist

### DSGVO Implications

- **Art. 4 DSGVO**: Personal data = any information relating to an identified or identifiable natural person. Developer names in code comments qualify.
- **Art. 28 DSGVO**: When an AI tool processes your codebase, the AI provider becomes a **data processor** (Auftragsverarbeiter). This requires a Data Processing Agreement (Auftragsverarbeitungsvertrag / AVV).
- **Art. 35 DSGVO**: Data Protection Impact Assessment (Datenschutz-Folgenabschaetzung / DSFA) is required for high-risk automated processing. Using AI tools on codebases containing personal data may trigger this requirement.
- **Art. 5 DSGVO (Data Minimization)**: You must assess whether sending repository contents to a model provider is necessary and proportionate.
- **EDPB Opinion (2024)**: The European Data Protection Board issued guidance on AI models and GDPR, requiring documentation of anonymization approaches, training data legitimacy, and automated decision impacts.

### Mitigation

- Use `.gitignore` and pre-commit hooks to exclude sensitive files
- Never include real customer data in test fixtures — use synthetic data
- Ensure AI tools only see source code, never production databases or credentials
- Document this in your DSFA

---

## 2. Claude/Anthropic Data Handling Policy

### Data Training Policy (as of 2026)

| Plan | Data Used for Training? | Retention | Opt-Out |
|------|------------------------|-----------|---------|
| **Free** | Yes (default on, opt-out available) | 5 years (if training on) / 30 days (if off) | Settings page |
| **Pro** | Yes (default on, opt-out available) | 5 years (if training on) / 30 days (if off) | Settings page |
| **Max** | Yes (default on, opt-out available) | 5 years (if training on) / 30 days (if off) | Settings page |
| **Team** | **No** (unless explicitly opted in) | 30 days | N/A |
| **Enterprise** | **No** (unless explicitly opted in) | 30 days (or Zero Data Retention) | N/A |
| **API** | **No** (7-day log retention, never trained on) | 7 days | N/A |

**Critical distinction**: Commercial plans (Team, Enterprise, API) explicitly guarantee that **Anthropic does not train generative models using code or prompts** sent under commercial terms.

### Claude Code Specific Data Flow

What Claude Code sends to Anthropic servers:

- **Required**: User prompts, file contents read during session, model outputs — all encrypted in transit (TLS)
- **Telemetry (Statsig)**: Operational metrics (latency, reliability, usage patterns) — **no code or file paths**. Opt out: `DISABLE_TELEMETRY=1`
- **Error logging (Sentry)**: Operational errors only. Opt out: `DISABLE_ERROR_REPORTING=1`
- **Feedback (`/feedback`)**: Full conversation including code — **only when user explicitly triggers it**. 5-year retention.
- **Session quality surveys**: Only numeric rating (1/2/3/dismiss), no conversation data

### Enterprise-Grade Controls

- **Zero Data Retention (ZDR)**: Available for Claude for Enterprise — ensures maximum data isolation
- **AWS Bedrock / Google Vertex**: When using Claude via these platforms, telemetry, error reporting, and feedback are **disabled by default**
- **Encryption**: TLS 1.2+ in transit, AES-256 at rest
- **BYOK (Bring Your Own Key)**: Coming H1 2026

### What This Means for Us

Using Claude Code on a **Max plan** (our current setup): data training is opt-out. We should:
1. **Disable training** in privacy settings at claude.ai/settings/data-privacy-controls
2. Set `DISABLE_TELEMETRY=1` and `DISABLE_ERROR_REPORTING=1` in environment
3. Never use `/feedback` with sensitive code
4. For government/enterprise client work: consider API plan or Bedrock/Vertex integration

---

## 3. GitHub Copilot Business/Enterprise vs Claude Code

### Data Handling Comparison

| Feature | GitHub Copilot Business/Enterprise | Claude Code (API/Enterprise) |
|---------|-----------------------------------|------------------------------|
| **Code used for training?** | **No** (Business & Enterprise exempt) | **No** (commercial terms) |
| **Free/Pro plan training** | Yes (default from April 24, 2026) | Yes (default from Sept 28, 2025) |
| **Data retention** | Not publicly specified | 30 days (API: 7 days) |
| **Zero retention option** | Not available | Yes (Enterprise) |
| **SOC 2 Type II** | Yes (via Microsoft) | Yes |
| **ISO 27001** | Yes (via Microsoft) | Yes |
| **Data shared with** | Microsoft affiliates only, no third parties | Anthropic only |
| **Air-gapped option** | No | Via Bedrock/Vertex (partial) |
| **EU data residency** | Via Azure regions | Not yet (BYOK coming H1 2026) |

### Key Risk: GitHub Copilot Policy Change (March 2026)

As of March 26, 2026, GitHub updated its Copilot data policy: **Free, Pro, and Pro+ users will have interaction data used for AI model training by default** starting April 24, 2026. This includes inputs, outputs, code snippets, cursor context, comments, file names, repository structure, and navigation patterns.

**Business and Enterprise customers remain exempt.**

### Recommendation

For client work with data sovereignty requirements: use either Copilot Business/Enterprise or Claude API/Enterprise plans. **Never use consumer-tier AI tools on client codebases.**

---

## 4. Air-Gapped / Local AI Coding Options

For maximum data sovereignty (e.g., German government, defense, critical infrastructure):

### Fully Self-Hosted Solutions

| Solution | Type | Air-Gap Support | Notes |
|----------|------|-----------------|-------|
| **Tabnine Enterprise** | Commercial ($39/user/mo) | Full air-gap, on-prem K8s, VPC | Zero telemetry in air-gapped mode |
| **Continue.dev + Ollama** | Open Source (free) | Full air-gap | VS Code/JetBrains, any local model |
| **TabbyML** | Open Source (free) | Full self-hosted | Fast, simple, good for daily coding |
| **CodeLlama / DeepSeek Coder** | Open Source models | Fully local via Ollama | Quality gap vs. cloud models |

### Hybrid Approaches

- **AWS Bedrock (Claude)**: Data stays within your AWS VPC, EU regions available (Frankfurt). Anthropic does not receive telemetry.
- **Google Vertex AI (Claude)**: Data stays within GCP, EU regions available. Default: no telemetry to Anthropic.
- **Azure OpenAI (GPT-4)**: Data stays within Azure tenant, EU regions available.

### Trade-offs

- **Local models**: Maximum sovereignty, but significantly lower code quality (as of 2026, ~60-70% capability of cloud frontier models)
- **Cloud with VPC**: Near-cloud quality with data residency guarantees
- **Full cloud**: Best quality, relies on vendor contractual guarantees

### Market Context

Enterprise adoption of AI coding assistants reached 91% in 2025. The sovereign AI market is projected at $600B by 2030. There is strong and growing demand for solutions that balance capability with data sovereignty.

---

## 5. AI-Generated Code & Security Vulnerabilities

### Known Risks

1. **Insecure patterns**: AI models frequently choose insecure coding patterns or flawed libraries, resulting in higher rates of vulnerable code vs. experienced human developers
2. **Hallucinated packages**: Models sometimes invent nonexistent library names that attackers can register as malicious packages (dependency confusion)
3. **MCP data exfiltration**: Model Context Protocol introduces channels where agents can share source code, secrets, and files with external tools
4. **Outdated patterns**: Models trained on older code may suggest deprecated or vulnerable APIs
5. **Missing security context**: AI does not reason about threat models, organizational security posture, or which workflows are sensitive

### Research Findings

- Including a security prompt reminder improved secure code generation from 56% to 66% (Claude Opus 4.5 Thinking benchmark)
- Over 92% of organizations using AI coding assistants, but AI-generated code is the #1 blindspot for application security teams
- AI predicts **plausible** code, not **safe** code — this is a fundamental limitation

### Mitigation Strategy

1. **SAST/DAST scanning** on all AI-generated code (SonarQube, Snyk, Semgrep)
2. **Dependency scanning** to catch hallucinated or vulnerable packages
3. **Security-focused prompts** in system instructions (e.g., "prioritize security, validate all inputs, use parameterized queries")
4. **Never give AI tools access to production credentials or data**
5. **Pre-commit hooks** that block secrets and run linting

---

## 6. OWASP Guidelines for AI-Generated Code

### Relevant OWASP Frameworks (2025-2026)

1. **OWASP Top 10 for LLM Applications (2025)**: Covers prompt injection, insecure output handling, training data poisoning, model denial of service, supply chain vulnerabilities
2. **OWASP Top 10 for Agentic Applications (2026)**: New framework developed with 100+ experts specifically addressing autonomous AI agents. Key risks:
   - Excessive agency / over-permissioned agents
   - Insecure tool integration
   - Data exfiltration through tool channels
   - Hallucinated actions
3. **OWASP GenAI Data Security Risks and Mitigations (2026)**: Forward-looking analysis of data security challenges from AI adoption
4. **OWASP AI Testing Guide (2026)**: First comprehensive testing framework for AI systems — "Security is not sufficient; AI Trustworthiness is the real objective"
5. **OWASP AI Exchange (owaspai.org)**: Living reference for AI security considerations

### Key Takeaway for Stakeholders

OWASP explicitly recognizes that AI-generated code introduces new attack surfaces. Their recommendation: **treat AI as a junior developer whose output requires senior review** — not as a trusted authority on security.

---

## 7. Code Review Processes (Human-in-the-Loop)

### Industry Best Practices (2026 State of the Art)

1. **AI assists, humans decide**: AI automates repetitive checks (style, simple bugs, test coverage), but **humans own all architectural decisions, domain logic, and security trade-offs**
2. **Clear ownership**: Every piece of AI-generated code has a human owner who can explain what it does, why it exists, and how to fix it
3. **Layered review**:
   - Layer 1: AI generates code
   - Layer 2: Automated scanning (SAST, linting, type checking, dependency audit)
   - Layer 3: Human code review (PR-based, peer review)
   - Layer 4: E2E testing and integration testing
   - Layer 5: Security review for sensitive components
4. **No blind merges**: AI-generated PRs never auto-merge without human approval
5. **Accountability**: No matter how much AI contributed, a **human must take responsibility** and be able to defend every line in an audit

### Our Workflow

```
AI generates code (in isolated tmux agent)
    --> Git commit + PR created
    --> Automated CI/CD (lint, type-check, tests)
    --> Human code review (PR approval required)
    --> E2E testing (mandatory, Chrome DevTools verification)
    --> Merge only after all gates pass
```

This workflow ensures:
- AI never has direct access to production
- Every change is traceable in git history
- Human approval is a hard gate, not optional
- E2E tests verify behavior, not just code correctness

---

## 8. SOC 2, ISO 27001 Compliance of Providers

### Anthropic (Claude)

| Certification | Status |
|--------------|--------|
| **SOC 2 Type I & Type II** | Certified (report available under NDA via trust.anthropic.com) |
| **ISO 27001:2022** | Certified (Information Security Management) |
| **ISO/IEC 42001:2023** | Certified (AI Management Systems — first major AI company) |
| **HIPAA** | Ready (BAA available) |
| **Encryption** | TLS 1.2+ in transit, AES-256 at rest |
| **Penetration testing** | Regular third-party testing |
| **Trust Portal** | https://trust.anthropic.com |

### GitHub / Microsoft (Copilot)

| Certification | Status |
|--------------|--------|
| **SOC 2 Type II** | Certified (via Microsoft) |
| **ISO 27001** | Certified (via Microsoft) |
| **PCI-DSS v4.0** | Certified |
| **FedRAMP Tailored** | Authorized (enables US government use) |
| **GDPR** | DPA available |

### What Auditors Need

Your SOC 2 auditor does not care about vendor certifications alone — they need evidence of **your controls** around AI tool usage:

1. **Access control documentation**: Who can use AI tools, what data they access
2. **Data flow diagrams**: What goes to the AI provider, what comes back
3. **Risk assessment**: Documented evaluation of AI tool risks
4. **Monitoring**: Audit trails of AI tool usage (OpenTelemetry, git logs)
5. **Incident response**: What happens if an AI tool leak is detected
6. **Training**: Staff awareness of AI security risks

---

## 9. German BSI Recommendations

### Directly Relevant BSI Publications

1. **"German-French Recommendations for the Use of AI Programming Assistants"** (BSI + ANSSI joint publication)
   - Opportunities and risks of coding assistants with specific mitigation measures
   - **This is the single most relevant document for our use case**

2. **"Criteria Catalog for Integration of Externally Provided Generative AI Models"**
   - Minimum security requirements for federal administration integrating external generative AI
   - Directly applicable to government software projects

3. **"AI Cloud Service Compliance Criteria Catalogue (AIC4)"**
   - Framework for assessing security of cloud-based AI services
   - Useful for evaluating Claude API / Copilot Enterprise

4. **"Evasion Attacks on LLMs — A Checklist for LLM System Hardening"**
   - Practical checklist for prompt injection and jailbreak defense
   - Relevant for any system using LLM-generated outputs

5. **"Generative AI Models: Opportunities and Risks for Industry and Authorities"**
   - General guidance for organizations considering generative AI adoption

### BSI Key Principles

- AI tools must be evaluated as part of the organization's **IT-Grundschutz** (baseline security)
- **Supply chain security** is critical — BSI supports the G7 SBOM framework for AI
- The BSI calls 2026 the "Year of Attack Surface Management" — AI tools expand the attack surface and must be monitored
- NIS2 directive (transposed into German law via BSI-Gesetz) makes cybersecurity a **board-level issue** — AI tool decisions must be documented at leadership level

### Recommendation

Reference the BSI/ANSSI joint document on AI programming assistants in any proposal to government clients. It provides the legitimacy of an official federal security authority endorsing AI coding assistants **with appropriate safeguards**.

---

## 10. How to Frame AI-Assisted Development to Stakeholders

### The Core Narrative

> "We use AI as a **development accelerator** — like an advanced autocomplete and research assistant. Every line of code is **human-reviewed**, passes **automated security scanning**, and goes through **end-to-end testing** before deployment. The AI never sees production data, customer information, or credentials."

### Key Talking Points

**For IT Security / CISO:**
- "AI tools are configured with commercial/enterprise plans — no data is used for training"
- "We use SOC 2 Type II and ISO 27001 certified providers"
- "All code passes SAST scanning, dependency auditing, and peer review before merge"
- "We can provide audit trails of every AI-assisted change via git history"
- "Telemetry is disabled; the AI tool only sees source code, never production data"

**For Data Protection Officer (DSB):**
- "We have assessed DSGVO implications — AI tools are data processors under Art. 28"
- "No personal data from end users is processed by AI tools"
- "Data retention is 30 days (API) or zero (Enterprise ZDR)"
- "The BSI/ANSSI joint guidelines for AI programming assistants are our baseline"

**For Management / Procurement:**
- "AI-assisted development delivers 2-5x productivity improvement"
- "Risk is managed through our existing code review and testing processes"
- "The BSI explicitly addresses AI coding assistants — we follow their recommendations"
- "Competitors are already using these tools — the question is not if, but how securely"

**For Government Clients (Kommunen, Laender):**
- "The BSI has published specific criteria for integrating external generative AI models into federal systems"
- "We use enterprise-grade tools with contractual guarantees against data training"
- "All development follows IT-Grundschutz principles"
- "We can provide a Datenschutz-Folgenabschaetzung (DSFA) covering our AI tool usage"
- "If maximum data sovereignty is required, we can operate with self-hosted models (Ollama/Tabnine) or cloud-VPC solutions (AWS Bedrock EU/Frankfurt)"

### What NOT to Say

- Do not say "AI writes our code" — say "AI assists our developers"
- Do not say "It's completely safe" — say "Risks are identified and mitigated"
- Do not minimize the data processing aspect — acknowledge it and show controls
- Do not compare to consumer tools — always reference enterprise/commercial tiers

### Supporting Evidence to Have Ready

1. Anthropic Trust Portal access (SOC 2 report, ISO certs)
2. Screenshot of disabled training setting in Claude privacy controls
3. Environment variables showing disabled telemetry
4. Git log showing human-authored commits with review history
5. CI/CD pipeline configuration showing automated security checks
6. DSFA document covering AI tool usage
7. Reference to BSI/ANSSI AI programming assistant guidelines

---

## Quick Reference: Our Security Posture

```
+------------------------------------------------------------------+
|                    AI-ASSISTED DEVELOPMENT                        |
|                    Security Architecture                          |
+------------------------------------------------------------------+
|                                                                   |
|  [Developer Workstation]                                          |
|    |                                                              |
|    |--> Claude Code (Max plan, training DISABLED)                 |
|    |      - DISABLE_TELEMETRY=1                                   |
|    |      - DISABLE_ERROR_REPORTING=1                             |
|    |      - Only sees source code in working directory            |
|    |      - NO access to production data/credentials              |
|    |      - NO access to customer databases                       |
|    |                                                              |
|    |--> Git commit (all changes tracked)                          |
|    |                                                              |
|    |--> GitHub PR (human review required)                         |
|    |      - Automated: lint, type-check, tests                   |
|    |      - Manual: peer code review                              |
|    |      - Security: SAST scanning                               |
|    |                                                              |
|    |--> E2E Testing (mandatory before merge)                      |
|    |                                                              |
|    |--> Production deploy (only after all gates pass)             |
|                                                                   |
+------------------------------------------------------------------+
|  AI NEVER touches: production DBs, customer PII, credentials,    |
|  API keys, deployment infrastructure, or server access            |
+------------------------------------------------------------------+
```

---

## Sources

### Anthropic / Claude Official
- [Claude Code Data Usage Documentation](https://code.claude.com/docs/en/data-usage)
- [Claude Code Security Documentation](https://code.claude.com/docs/en/security)
- [Anthropic Privacy Center — Data Retention](https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data)
- [Anthropic Privacy Center — Training Data](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- [Anthropic Privacy Center — Certifications](https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained)
- [Anthropic Trust Center](https://trust.anthropic.com/)
- [Anthropic Consumer Terms Update (Aug 2025)](https://www.anthropic.com/news/updates-to-our-consumer-terms)

### GitHub / Copilot
- [GitHub Copilot Data Usage Policy Update (March 2026)](https://github.blog/news-insights/company-news/updates-to-github-copilot-interaction-data-usage-policy/)
- [GitHub Community — Copilot Privacy & Security Discussion](https://github.com/orgs/community/discussions/183412)
- [Microsoft — Demystifying Copilot Security Controls](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/demystifying-github-copilot-security-controls-easing-concerns-for-organizational/4468193)

### GDPR / DSGVO
- [EDPB Opinion on AI Models and GDPR (2024)](https://www.edpb.europa.eu/news/news/2024/edpb-opinion-ai-models-gdpr-principles-support-responsible-ai_en)
- [GDPR-Compliant AI Coding Tools Enterprise Comparison](https://www.augmentcode.com/tools/gdpr-compliant-ai-coding-tools-enterprise-comparison)
- [Encore Blog — Keeping Secrets from AI (GDPR + Backend Dev)](https://encore.dev/blog/keeping-secrets-from-ai)
- [CNIL — AI System Development GDPR Recommendations](https://www.cnil.fr/en/ai-system-development-cnils-recommendations-to-comply-gdpr)

### OWASP
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [OWASP AI Exchange](https://owaspai.org/docs/ai_security_overview/)
- [OWASP AI Testing Guide](https://owasp.org/www-project-ai-testing-guide/)
- [Legit Security — OWASP Agentic AI Risks for Coding Agents](https://www.legitsecurity.com/blog/from-chatbot-to-code-threat-owasps-agentic-ai-top-10-and-the-specialized-risks-of-coding-agents)

### BSI (German Federal Office for Information Security)
- [BSI — Artificial Intelligence Overview](https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Kuenstliche-Intelligenz/kuenstliche-intelligenz_node.html)
- [BSI — Evasion Attacks on LLMs Guidance](https://securityaffairs.com/184606/security/germanys-bsi-issues-guidelines-to-counter-evasion-attacks-targeting-llms.html)
- [BSI C5 Cloud Security Standard](https://www.kiteworks.com/regulatory-compliance/bsi-c5-germanys-cloud-security-framework-requirements/)

### Compliance & Enterprise
- [Claude Code SOC 2 Compliance Auditor Guide](https://amitkoth.com/claude-code-soc2-compliance-auditor-guide/)
- [SOC 2-Ready AI Coding Tools for Enterprise](https://www.augmentcode.com/guides/7-soc-2-ready-ai-coding-tools-for-enterprise-security)
- [AI Compliance Checklist 2026](https://vloex.com/blog/ai-compliance-checklist-2026/)

### Air-Gapped / Local AI
- [Enterprise AI Code Assistants for Air-Gapped Environments](https://intuitionlabs.ai/articles/enterprise-ai-code-assistants-air-gapped-environments)
- [Tabnine — Air-Gapped Architecture](https://www.tabnine.com/blog/what-it-really-takes-to-be-air-gapped/)
- [Self-Hosted AI Coding: Continue.dev vs TabbyML](https://www.houseoffoss.com/post/self-hosted-ai-coding-assistants-in-2026-continue-dev-vs-tabbyml)

### Code Review
- [Best Practices for Reviewing AI-Generated Code](https://brightsec.com/blog/5-best-practices-for-reviewing-and-approving-ai-generated-code/)
- [Addy Osmani — Code Review in the Age of AI](https://addyo.substack.com/p/code-review-in-the-age-of-ai)
- [Dark Reading — AI Agents Security Pitfalls 2026](https://www.darkreading.com/application-security/coders-adopt-ai-agents-security-pitfalls-lurk-2026)
