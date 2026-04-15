# VERIFY-01: Daytona Self-Hosted -- Paywall & Feature-Gate Audit

**Date**: 2026-04-04
**Verdict**: MIXED -- Genuinely open-source core, but with significant gotchas
**License**: AGPL-3.0 (NOT Apache 2.0)
**Risk Level**: MEDIUM-HIGH for commercial use without commercial license

---

## Executive Summary

Daytona markets itself as open-source infrastructure for AI sandboxes. The core sandbox engine IS open-source and self-hostable via Docker Compose. However, there are multiple layers of friction, feature gates, and architectural decisions that push users toward the paid cloud offering. This is a classic open-core play with AGPL copyleft enforcement as the commercial funnel.

**Bottom line**: You CAN self-host Daytona for free. You CANNOT get production-grade deployment, resource isolation, RBAC, GPU support, or SSO without either paying for Enterprise or doing significant engineering work yourself.

---

## 1. Pricing Page Analysis

Source: https://www.daytona.io/pricing

**Cloud offering (pay-as-you-go)**:
- $200 free credits at signup, no credit card required
- vCPU: $0.0504/h
- Memory: $0.0162/GiB/h
- Storage: $0.000108/GiB/h (first 5 GiB free)
- Startup program: up to $50,000 in free credits

**Self-hosted**: Not mentioned on the pricing page at all. The pricing page only covers Daytona Cloud. Self-hosted is treated as a separate track requiring "contact sales" for Enterprise.

**Verdict**: The pricing page is cloud-only. Self-hosted users are invisible here.

---

## 2. License: AGPL-3.0 (Major Red Flag for Commercial Use)

Source: GitHub LICENSE file, confirmed via `gh api`

The license is **GNU Affero General Public License v3.0** -- NOT Apache 2.0.

**What this means in practice**:
- If you modify Daytona and make it available over a network (which you will, since it's a server), you MUST release your complete source code
- This is specifically designed to prevent companies from using it in proprietary SaaS without sharing modifications
- This creates a deliberate commercial funnel: either comply with AGPL source disclosure or buy a commercial license from Daytona

**Comparison**: E2B uses Apache 2.0 (permissive). microsandbox uses Apache 2.0. Daytona's AGPL is the most restrictive license among major sandbox providers.

**Verdict**: AGPL is a non-starter for many commercial use cases without purchasing a separate commercial license.

---

## 3. Self-Hosted OSS Deployment: Explicitly "Not Production-Safe"

Source: `/docker/README.md` in the monorepo

The Docker Compose setup README states verbatim:

> "This setup is still in development and is **not safe to use in production**"
> "A separate deployment guide will be provided for production scenarios"

**Critical limitations of the Docker Compose self-hosted setup**:

1. **RESOURCE_LIMITS_DISABLED=true** -- Sandbox CPU/memory/disk limits are disabled because cgroups cannot be partitioned in Docker-in-Docker. Any sandbox can consume unlimited host resources.

2. **No production deployment guide exists** -- The README promises one will be provided but it does not exist as of April 2026.

3. **Hardcoded insecure defaults** -- `ENCRYPTION_KEY=supersecretkey`, `ENCRYPTION_SALT=supersecretsalt`, default passwords everywhere. Requires manual security hardening.

4. **DNS setup required** -- Need dnsmasq for `*.proxy.localhost` resolution. Not trivial for production.

**Verdict**: The self-hosted path is a development/testing environment. Production self-hosting is not officially supported.

---

## 4. PostHog Telemetry: Hardcoded, Phones Home

Source: `docker/docker-compose.yaml`, `apps/api/src/common/providers/openfeature-posthog.provider.ts`

The Docker Compose file includes hardcoded PostHog telemetry:

```
POSTHOG_API_KEY=phc_bYtEsdMDrNLydXPD4tufkBrHKgfO2zbycM30LOowYNv
POSTHOG_HOST=https://d18ag4dobbta3l.cloudfront.net
```

**Worse**: PostHog is not just used for analytics. It powers **OpenFeature feature flags**. The source code reveals an `OpenFeaturePostHogProvider` that evaluates feature flags via PostHog's server-side SDK. This means:

- Self-hosted instances phone home to Daytona's PostHog via CloudFront
- Feature flags are evaluated remotely, giving Daytona a server-side kill switch
- The feature-flags file (`apps/api/src/common/constants/feature-flags.ts`) reveals two gated features:
  - `ORGANIZATION_INFRASTRUCTURE` -- controls org-level infra features
  - `SANDBOX_RESIZE` -- controls sandbox resizing capability

**Can you disable it?** The PostHog API key is optional (code falls back to defaults when unconfigured), but there is no documented way to opt out. You would need to remove the env vars manually and accept that feature-flag-gated functionality may break.

**Verdict**: Phones home by default. Feature flags give Daytona remote control over self-hosted functionality.

---

## 5. Feature Gates: Enterprise-Only Capabilities

Sources: Enterprise page, comparison articles, search results

**Enterprise-only features (NOT in OSS)**:
- RBAC (Role-Based Access Control)
- SSO via SAML
- SCIM user provisioning
- GPU support
- Audit logging for SIEM integration
- Workspace isolation
- Data sovereignty controls
- Prometheus metrics
- High availability
- Multi-cloud support
- Secure VPN connections
- Workspace size limits enforcement

**Cloud-only features**:
- Custom Regions (invite-only, experimental, contact support@daytona.io)
- Dedicated Regions (contact sales@daytona.io)
- Managed runners with auto-scaling

**Verdict**: Core sandbox creation works in OSS. Everything needed for production governance is Enterprise-only.

---

## 6. SDK and MCP Server

**SDK**: Originally a separate repo (`daytonaio/sdk`), archived May 2025 and moved into the Daytona monorepo. Licensed Apache 2.0 (the SDK specifically, not the server). Available for Python and TypeScript/JavaScript.

**MCP Server**: Built into the CLI (`apps/cli/mcp/`), part of the AGPL-licensed monorepo. The documented setup requires `daytona login` which authenticates against the cloud service. No documentation exists for using MCP with self-hosted instances.

**Can MCP work with self-hosted?** Theoretically yes (you can point the CLI at your own API endpoint), but the documented path assumes cloud authentication. You are on your own for self-hosted MCP configuration.

**Verdict**: SDK is usable. MCP is technically open-source but documented only for cloud use.

---

## 7. Sandbox Duration and Lifecycle

**Auto-stop**: Default 15 minutes of inactivity. Configurable, can be set to 0 for indefinite.
**Auto-archive**: Default 7 days after stopping. Max 30 days.
**Auto-delete**: Disabled by default, configurable.
**24/7 sandboxes**: Yes, possible in self-hosted by setting auto-stop to 0.

**Org-level runtime caps**: Not implemented yet (Issue #4158 is an open feature request with 0 comments from maintainers).

**Verdict**: No artificial duration limits for self-hosted. This is genuinely flexible.

---

## 8. API Access

The REST API runs on port 3000 in the Docker Compose setup. Full CRUD for sandboxes, snapshots, volumes, and resource management. NestJS-based.

**In self-hosted mode**: Full API access. No documented rate limits for self-hosted (rate limits in the docs are for cloud tiers only).

**Verdict**: API is fully available in self-hosted. No paywall here.

---

## 9. Resource Isolation per Sandbox

**Cloud**: Tiered limits (1-4 vCPU, 1-8 GB RAM, 1-10 GB disk per sandbox, depending on org tier).

**Self-hosted Docker Compose**: `RESOURCE_LIMITS_DISABLED=true`. Cgroups cannot be partitioned in DinD. No per-sandbox isolation.

**Self-hosted Kubernetes (Helm)**: Requires 4+ vCPUs, 16GB RAM, 200GB disk minimum. Resource limits may work with proper cgroup setup, but no production deployment guide exists.

**Verdict**: Resource isolation is broken in the official self-hosted setup. You would need to engineer your own Kubernetes deployment.

---

## 10. Infrastructure Requirements for Self-Hosted

The Docker Compose runs 12+ services:
- API server, Proxy, Runner, SSH Gateway
- PostgreSQL, Redis, Dex (OIDC), Docker Registry
- MinIO (S3), MailDev, Jaeger, PgAdmin

Minimum resources for Kubernetes deployment: 4 vCPUs, 16GB RAM, 200GB disk (per comparison articles). This is heavy infrastructure compared to alternatives like microsandbox (single binary, no Kubernetes).

---

## Comparison Table: Daytona vs Alternatives

| Feature | Daytona OSS | Daytona Cloud | E2B | microsandbox |
|---------|-------------|---------------|-----|--------------|
| License | AGPL-3.0 | Proprietary | Apache-2.0 | Apache-2.0 |
| Self-hosted | Dev only | N/A | Limited | Full |
| Production-ready self-host | No | N/A | No | Yes |
| Resource isolation | Disabled | Yes | Yes | Yes |
| RBAC | No | Enterprise | No | N/A |
| GPU | No | Enterprise | No | No |
| Infra requirements | 4 vCPU/16GB | Managed | Managed | Single binary |
| Telemetry | PostHog (hardcoded) | PostHog | Unknown | None |
| Feature flags (remote) | Yes (PostHog) | Yes | Unknown | No |
| Sandbox startup | <90ms | <90ms | ~150ms | ~1ms (claim) |
| Free credits | N/A | $200 | $100 | N/A |

---

## Final Verdict

### What IS genuinely free in self-hosted mode:
- Core sandbox creation and management
- REST API (full CRUD, no rate limits)
- SDK (Python, TypeScript)
- File system, process execution, Git operations in sandboxes
- Configurable auto-stop/archive/delete policies
- No artificial sandbox duration limits

### What is NOT free / NOT working in self-hosted:
- Production deployment (officially unsupported, no guide)
- Resource isolation per sandbox (disabled in Docker Compose)
- RBAC, SSO/SAML, SCIM (Enterprise-only)
- GPU support (Enterprise-only)
- Audit logging (Enterprise-only)
- Custom Regions (invite-only)
- High availability (Enterprise-only)
- Removing PostHog telemetry (undocumented)
- MCP server with self-hosted (undocumented)

### Recommendation for the Orchestrator Project:

**Do NOT adopt Daytona self-hosted for production use.** The AGPL license is a legal minefield for commercial projects, the self-hosted path is explicitly not production-ready, resource isolation is broken, and PostHog feature flags give Daytona remote control over functionality.

**Better alternatives for self-hosted agent sandboxes**:
- **microsandbox** (Apache-2.0, single binary, microVM isolation, no telemetry)
- **Firecracker** directly (Apache-2.0, AWS-backed, production-proven)
- **gVisor + Docker** (Apache-2.0, Google-backed, used in production at scale)
- **Daytona Cloud** with free credits if self-hosting is not required ($200 free)

---

*Audit conducted 2026-04-04. Sources: GitHub monorepo, official docs, pricing page, Docker Compose config, source code analysis, third-party comparisons.*
