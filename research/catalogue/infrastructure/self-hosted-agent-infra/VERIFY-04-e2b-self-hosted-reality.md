# VERIFY-04: E2B Self-Hosted -- The Real 2026 Status

**Verified**: 2026-04-14 (deep re-verification, previous version 2026-04-13)
**Verdict**: Self-hosting is REAL and people ARE doing it -- but the gap between "technically possible" and "production-ready turnkey" remains wide. Real users are running 100-700 concurrent sandboxes on bare metal. The E2B Lite initiative (PR #1837) aims to close the single-node gap but is still a draft. AWS support is no longer beta. BYOC (enterprise, AWS/GCP) remains the practical path for teams without dedicated platform engineers.

---

## 1. GitHub Issues -- The Full Picture

### Issue #864 -- The Canonical Thread (closed 2026-03-17)
"Self-Hosting E2B on On-Premise / Amazon Web Services" -- 15+ comments over 8 months. Key timeline from E2B engineers:

- **2025-07-22** (`sitole`): "We are working on making E2B less dependent on Google Cloud... Currently, the main components (API, client proxy, template manager, and orchestrator) are all ready to be deployed on a general-purpose Linux machine without the use of any public cloud provider."
- **2025-07-23**: Minimum hardware for POC: "50 GB disk space, minimum of 8 GB RAM, 4 CPU cores" on AMD64 with virtualization enabled. Intel Skylake tested platform.
- **2025-08-11**: No official ETA for deployment tooling. "We are working to make the whole deployment easier."
- **2025-08-11** (`sitole`): ARM not supported. Template Builder v2 (closed-source SDK during beta) needed for non-GCR registries.
- **2025-10-31**: Orchestrator runs inside VMs with nested virtualization: "Now everything is run in VMs, even for AWS it acts like VM."
- **2026-03-17**: Issue closed -- "AWS is now a supported feature."

### Issue #2270 -- Bare Metal (OPEN, 2026-03-31)
"Self-host E2B on bare metal (local server) instead of AWS/GCP?" -- User `whz1106` asked the question. Community member `SentimentalK` offered to contribute a single-node/small-scale mode:
> "My interest is mainly from the perspective of an individual developer who wants to use E2B for safe, controllable AI-assisted development, but with a much smaller operational footprint than a full cloud/BYOC-style deployment."

No official E2B response to this issue as of verification date. Tracked internally as ENG-3720.

### Issue #2211 -- Single-Node Docs (closed 2026-04-02)
User `renezander030` asked for a minimal self-hosted deployment guide for single VPS (Debian, 8GB RAM). Key exchange:
- **`jakubno` (E2B co-founder)**: "Please check local dev guide, it's probably closest to what you want... We only support running it with Firecracker... It's meant for local dev only, it isn't considered production ready. Some features may be missing."
- User discovered E2B Lite (PR #1837) and closed the issue, considering it the solution.

### Issue #1421 -- Someone Actually Running It (closed 2025-11-09)
**CRITICAL FINDING**: User `uucloud` posted: "I've successfully got E2B self-hosted and running on a single machine, and it's working great!" They were asking about SCALING (Kubernetes, custom templates, resource cleanup) -- meaning the basic self-hosting worked. This is the earliest confirmed external success.

Follow-up revealed:
- Orchestrator restart kills all sandboxes (orphaned Firecracker VMs + leaked veth pairs)
- No garbage collector for crashed orchestrators at the time
- E2B's solution: "replace the whole VM" (drain, wait, destroy)

### Issue #2029 -- Production-Scale Self-Hosted (closed 2026-03-23)
**CRITICAL FINDING**: User `agiping` running self-hosted E2B at scale:
- **"Community release 2026.09" on bare-metal: 1 API node + 5 sandbox nodes**
- **100-700 concurrent sandboxes, continuous creation and destruction**
- Found orchestrator memory leak (monotonically growing memory)
- A second user `feifeigood` confirmed with their own self-hosted deployment (orchestrator uptime 111 days before OOM kill)

This proves self-hosted E2B at scale IS happening in production by real external users.

### Issue #2239 -- Another Self-Hosted Team (closed 2026-03-30)
User `whz1106` running "sandbox concurrency tests on a self-hosted E2B setup" with detailed questions about CPU overcommit ratios (R=4 default) and placement strategy. This is sophisticated operational knowledge -- they're clearly running it for real.

### Issue #1984 -- Template Build Failures (closed 2026-02-25)
User `baowj-678` deployed E2B on local server (API, orchestrator, client-proxy) but hit template build issues. Root cause: hugepages not configured. Shows the gap between "infra running" and "everything working."

### Issue #1568 -- Orphaned Firecracker (closed 2025-12-11)
User `JooKS-me` privately deployed E2B on own Linux server. Hit orphaned Firecracker processes after sandbox kill. Running CentOS 7 with kernel 4.18 -- E2B only tested on Ubuntu 22.04 with kernel 6.1+. Shows the narrow support matrix.

### Issue #2041 -- Orchestrator Restart = Data Loss (closed 2026-03-09)
Self-hosted user `chencjcj` found that "any restart of the orchestrator binary is not supported at the moment." All running sandboxes vanish after restart. E2B's `dobrac` confirmed: the only safe restart path is drain -> wait for zero sandboxes -> destroy node.

### Issue #1767 -- GCP Self-Host Bug (closed 2026-03-26)
User following `self-host.md` guide on GCP. Hit Terraform/Nomad provider errors with ClickHouse VM. E2B team asked about VM health, then closed without confirmed resolution. Pattern: the guide exists but edge cases break people.

### SDK Issue #1158 -- Self-Hosted SDK Bug (FIXED, 2026-03-06)
User `janus-reith` found SDK didn't pass `sandboxHeaders` to `EnvdApiClient` in self-hosted environments, breaking file uploads. **Fixed in SDK v2.14.1.** This confirms: (a) the SDK works with self-hosted backends, and (b) bugs specific to self-hosted are being found and fixed.

---

## 2. E2B Lite -- The Single-Node Dream (PR #1837)

**Status: OPEN DRAFT** (created 2026-02-03 by community contributor `doco11`)

A community-contributed single-command local installer. "Co-authored by Claude Opus 4.5."

### What It Promises
```bash
git clone https://github.com/doco11/e2b-infra.git infra
cd infra
./scripts/e2b-lite-setup.sh
./scripts/services/start-all.sh
pip install e2b
python scripts/test-e2b-lite.py
```

### Current State
- MVP targeting Ubuntu 22.04/24.04 with kernel 6.8+
- Reuses existing E2B infra repo code
- Setup script installs all dependencies, starts services
- Hardcoded test credentials from local-dev seed

### E2B Team Response
- `sitole` (2026-02-03): "Thank you for contributing! We will check it as soon as possible."
- `jakubno` (2026-02-03): Asked if existing `packages/local-dev` (DEV-LOCAL.md) was insufficient.
- `jakubno` (2026-02-06): "If you would be able to run just one command, would that work for you?"
- `jakubno` (2026-02-20): **Converted to draft.** "Making the process of running e2b locally as easy as possible is definitely on our road map, though we're still figuring out the best approach."

### Roadmap Items (from PR)
- Pre-built binaries (no compilation required)
- Common templates ready to use
- One-liner install (`curl -fsSL https://e2b.dev/install-lite | bash`)
- macOS support via Apple Hypervisor Framework
- Migration tool from local to cloud

### Honest Assessment
E2B Lite is the right idea but it's stalled. The E2B team acknowledged the need but didn't merge it and converted it to draft 2 months ago. No commits to the PR since. The "easy self-hosting" path does not exist yet in any official capacity.

---

## 3. Has E2B Released a Simple Self-Hosting Guide?

**NO. There is no simple guide. There are two paths, both complex.**

### Path 1: Cloud Self-Host (self-host.md)
The official `self-host.md` covers GCP and AWS. It requires:
1. Terraform v1.5.7, Packer, Go, Docker, NPM, Cloud CLI
2. Cloudflare account with managed domain
3. PostgreSQL (Supabase-only for now)
4. 10-11 sequential steps with race conditions requiring retries
5. Packer AMI/image building
6. Nomad + Consul cluster management

**This is NOT simple.** It's a full infrastructure deployment guide targeting platform engineers.

### Path 2: Local Dev (DEV-LOCAL.md)
The `DEV-LOCAL.md` is for development, not production. Requirements:
- Linux with KVM, 4+ CPU cores, 16 GB RAM (4 GB for hugepages)
- Go, Docker Engine 24+, Node.js, Google Cloud SDK
- Multiple services run in separate terminals
- Root privileges required for orchestrator

The docs explicitly state: **"This is a work in progress. Not everything will function as expected."**

### Path 3: E2B Lite (NOT MERGED)
Would be the simple path but it's a draft PR sitting in limbo since February 2026.

---

## 4. Pricing -- Self-Hosted vs Cloud

### Self-Hosted: Free Software, Expensive Infra
The E2B software is **Apache 2.0** -- completely free. You pay only for:
- Cloud infrastructure (AWS/GCP VMs, storage, networking)
- Engineering time to deploy and maintain
- Your own monitoring/observability stack

**Estimated AWS self-hosted costs** (minimum production):
| Component | Instance | Monthly Cost |
|-----------|----------|-------------|
| 3x Control Server | t3.medium | ~$90 |
| 1x API | t3.xlarge | ~$120 |
| 1x Client (Firecracker) | m8i.4xlarge | ~$670 |
| 1x Build | m8i.2xlarge | ~$335 |
| 1x ClickHouse | t3.xlarge | ~$120 |
| Storage (EBS, S3) | Various | ~$100-300 |
| **Total** | | **~$1,435-1,635/mo** |

Compare to E2B Cloud Pro at $150/mo + usage. Self-hosting only makes sense at high scale or for data sovereignty.

### BYOC: Enterprise-Only, Custom Pricing
BYOC deploys in your VPC (AWS primary, GCP supported, Azure in development). Not public pricing -- requires sales call. Includes managed E2B control plane, you provide compute.

### Cloud Pricing
| Tier | Base | Max Duration | Concurrency |
|------|------|-------------|-------------|
| Hobby | Free ($100 credit) | 1 hour | 20 |
| Pro | $150/mo | 24 hours | 100 (up to 1,100) |
| Enterprise | Custom | Custom | Custom |

Per-second usage: 1 vCPU = $0.000014/s (~$0.05/hour)

---

## 5. Does the SDK Work with Self-Hosted?

**YES, fully confirmed.** Three pieces of evidence:

### 1. SDK Configuration
The `ConnectionConfig` class supports:
```typescript
const sandbox = await Sandbox.create({
  domain: "your-custom-domain.com"  // self-hosted endpoint
});
```

Environment variables: `E2B_DOMAIN`, `E2B_API_URL`, `E2B_SANDBOX_URL`

Debug mode for local dev: `E2B_DEBUG=true` connects to `http://localhost:3000`

### 2. Bug Fix Confirms Usage
SDK v2.14.1 (March 2026) fixed a self-hosted-specific bug where `sandboxHeaders` weren't passed to `EnvdApiClient`. This means E2B actively fixes bugs reported by self-hosted users.

### 3. Multiple Users Confirmed
Issues #1421, #2029, #2239 all show users running E2B SDK against self-hosted backends. It works.

---

## 6. Latest Commits -- Active or Stale?

**Extremely active.** The repo is one of the most actively developed open-source infrastructure projects in the AI space.

### Repo Stats (2026-04-14)
- **Stars**: 1,019
- **Forks**: 277
- **Open issues**: 56
- **Contributors**: 41
- **License**: Apache 2.0
- **Language**: Go
- **Last push**: 2026-04-13

### Release Cadence
15 releases in 2026 (through April 13). Latest: `2026.15` on April 9. Regular weekly releases with real engineering content (goroutine leak fixes, performance optimizations, new features).

### Recent Commits (April 7-13, 2026)
| Date | Description |
|------|-------------|
| Apr 13 | Add spec/openapi-dashboard.yml to validate-openapi workflow |
| Apr 12 | Add top-level prep-cluster and seed-db make targets |
| Apr 12 | Add .envrc for mise tool activation via direnv |
| Apr 12 | Normalize whitespace in uffd_pagefault struct |
| Apr 12 | Simplify gcloud login to single command |
| Apr 11 | Cancel gRPC stream contexts to prevent goroutine leak |
| Apr 11 | Extend template cache TTL per team's max sandbox length |
| Apr 11 | **Simplify self-host docs for gcloud auth** |
| Apr 10 | Expose created_at in /teams response |
| Apr 10 | Supabase auth users sync background runner |
| Apr 10 | Switch nomad server update policy to OPPORTUNISTIC |
| Apr 10 | Race condition fix in acquire while snapshotting |
| Apr 10 | sync.Map -> atomic bitmap for cache dirty tracking (perf) |
| Apr 10 | Add rootfs usage rate limits and observability |

**Verdict**: Definitely not stale. Daily commits, real engineering work, self-hosting docs actively improved.

---

## 7. Real Users Running Self-Hosted E2B

**YES -- confirmed at least 3 distinct external deployments.**

### User 1: `agiping` (Issue #2029, March 2026)
- **Scale**: 1 API node + 5 sandbox nodes, bare metal
- **Load**: 100-700 concurrent sandboxes, continuous creation/destruction
- **E2B version**: Community release 2026.09
- **Problem found**: Orchestrator memory leak (mmap regions from destroyed sandboxes never unmapped)
- **Assessment**: Running in what appears to be a production environment

### User 2: `uucloud` (Issue #1421, October 2025)
- **Scale**: Single machine, successfully running
- **Phase**: Scaling up, asking about Kubernetes co-hosting
- **Problems found**: Orchestrator crash = orphaned Firecracker VMs + leaked veth pairs
- **Assessment**: First confirmed external self-hosting success (October 2025)

### User 3: `whz1106` + team (Issues #2239, #2261, #2270, March 2026)
- **Scale**: Conducting sandbox concurrency tests
- **Knowledge**: Deep understanding of placement strategy, CPU overcommit ratios
- **Target**: 500 concurrent sandboxes
- **Assessment**: Serious engineering team evaluating at scale

### User 4: `JooKS-me` (Issue #1568, December 2025)
- **Scale**: Private deployment on own Linux server
- **OS**: CentOS 7 (outside supported matrix)
- **Problem**: Orphaned Firecracker processes
- **Assessment**: Running but hitting edge cases from unsupported OS

### User 5: `MykolaMS9` (Issue #1582, December 2025)
- **Scale**: Following DEV-LOCAL.md on Ubuntu 24.04
- **Problem**: Template build failures (Step 12), PostgreSQL tables disappearing
- **Assessment**: Partially successful -- infra runs but template builds broken

### User 6: `baowj-678` (Issue #1984, February 2026)
- **Scale**: Local server with API, orchestrator, client-proxy deployed
- **Problem**: Template build failure (hugepages not configured)
- **Assessment**: Self-solved after identifying root cause

### Pattern
People ARE self-hosting E2B. The ones who succeed tend to be experienced infrastructure engineers who can debug Firecracker/KVM/Nomad issues independently. The ones who struggle are those expecting a turnkey experience. Nobody has published a "here's my complete self-hosting guide" blog post.

---

## 8. Known Operational Risks for Self-Hosted

1. **Orchestrator restart = all sandboxes lost** (Issue #2041). No graceful restart. Must drain first.
2. **Orphaned Firecracker processes** after crashes (Issue #1568). No automatic cleanup.
3. **Memory leaks** in orchestrator at scale (Issue #2029). Mmap cache grows unbounded until 90% disk.
4. **Narrow OS support**: Only Ubuntu 22.04/24.04 with kernel 6.1+ is tested. Other distros hit issues.
5. **Template builds are fragile**: hugepages config, Docker image compatibility, SDK version mismatches.
6. **No upgrade path documented**: You track main branch and re-apply Terraform. No migration guides between releases.
7. **AWS support still evolving**: Labeled production-ready since March 2026 but issues like ECR auth token expiry and S3 presigned URL chunked encoding (Issue #1243) surface.

---

## 9. Comparison: Self-Host Paths

| Dimension | E2B Cloud | E2B BYOC | E2B Self-Host | E2B Lite (draft) |
|-----------|-----------|----------|---------------|-------------------|
| **Effort** | Zero | Sales call + setup | Weeks of work | Would be hours |
| **Cost** | $150/mo + usage | Custom enterprise | ~$1,500/mo AWS | Your hardware |
| **Data Sovereignty** | No | Yes | Yes | Yes |
| **Support** | Docs + community | Enterprise SLA | GitHub issues | None |
| **Production-ready** | Yes | Yes | Mostly (caveats) | No |
| **Single-node** | N/A | No | No (officially) | Target goal |
| **Status** | GA | GA | Advanced beta | Draft PR |

---

## 10. Summary Verdict

### What Changed Since Last Verification

The previous report (2026-04-13) stated "NO public success reports exist outside E2B's own team." **This was wrong.** Deep issue analysis reveals at least 3-6 external teams running self-hosted E2B, including one at 100-700 concurrent sandboxes on bare metal. The evidence was buried in GitHub issue comments, not in blog posts or Reddit threads.

### What's Real
- Self-hosting WORKS for teams with infrastructure expertise
- Multiple external users confirmed running in production-like settings
- SDK fully supports self-hosted backends (bugs are found and fixed)
- Apache 2.0 license -- truly free software
- Active daily development with 15 releases in 2026
- AWS and GCP both supported with Terraform-based deployment

### What's Still Hard
- **No simple installer** -- E2B Lite (PR #1837) is a stalled draft
- **No bare metal guide** -- you need to reverse-engineer the cloud deployment for on-prem
- **Orchestrator fragility** -- restart kills sandboxes, memory leaks at scale, orphaned processes
- **Narrow OS matrix** -- Ubuntu 22.04+ with kernel 6.1+ only reliably tested
- **Full platform engineering required** -- Terraform, Nomad, Consul, Firecracker, KVM, Cloudflare
- **No documented upgrade path** between releases

### Recommendation

For the orchestrator project, the calculus depends on scale:

- **< 20 concurrent sandboxes**: Use E2B Cloud Hobby/Pro. Not worth self-hosting.
- **20-100 sandboxes**: E2B Cloud Pro ($150/mo + usage) is still cheaper than self-hosted infra.
- **100-500+ sandboxes**: Self-hosting starts to make financial sense IF you have the engineering talent.
- **Data sovereignty required**: Self-host or BYOC are the only options. Budget for a platform engineer.
- **Just want to experiment**: Wait for E2B Lite to mature, or use the DEV-LOCAL.md path on a Linux box.

The honest truth: E2B self-hosting in 2026 is where Kubernetes was in 2015 -- powerful, open-source, clearly the future, but you need to be an expert to run it yourself. The managed cloud product is the pragmatic choice for most teams.

---

## Sources

### Primary (GitHub Issues -- direct evidence)
- [Issue #864: Self-Hosting on On-Premise/AWS](https://github.com/e2b-dev/infra/issues/864) -- canonical thread, closed 2026-03-17
- [Issue #2270: Self-host on bare metal](https://github.com/e2b-dev/infra/issues/2270) -- open
- [Issue #2211: Single-node deployment docs](https://github.com/e2b-dev/infra/issues/2211) -- closed, pointed to E2B Lite
- [Issue #1421: Successful self-host + scaling questions](https://github.com/e2b-dev/infra/issues/1421) -- first external success
- [Issue #2029: Orchestrator memory leak at 100-700 sandboxes](https://github.com/e2b-dev/infra/issues/2029) -- production-scale self-host
- [Issue #2239: Placement strategy in self-hosted](https://github.com/e2b-dev/infra/issues/2239) -- concurrency testing
- [Issue #2041: Sandboxes vanish on orchestrator restart](https://github.com/e2b-dev/infra/issues/2041)
- [Issue #1568: Orphaned Firecracker processes](https://github.com/e2b-dev/infra/issues/1568)
- [Issue #1582: Template build + DB reset failures](https://github.com/e2b-dev/infra/issues/1582)
- [Issue #1984: Template build failure (hugepages)](https://github.com/e2b-dev/infra/issues/1984)
- [Issue #1767: GCP self-host Terraform errors](https://github.com/e2b-dev/infra/issues/1767)
- [Issue #1732: Local machine envd execution](https://github.com/e2b-dev/infra/issues/1732)
- [Issue #1335: ETA for generic Linux self-hosting](https://github.com/e2b-dev/infra/issues/1335)
- [SDK Issue #1158: sandboxHeaders fix for self-hosted](https://github.com/e2b-dev/E2B/issues/1158) -- fixed v2.14.1

### Primary (PRs and Code)
- [PR #1837: E2B Lite -- single-node installer](https://github.com/e2b-dev/infra/pull/1837) -- open draft
- [self-host.md](https://github.com/e2b-dev/infra/blob/main/self-host.md) -- official cloud self-hosting guide
- [DEV-LOCAL.md](https://github.com/e2b-dev/infra/blob/main/DEV-LOCAL.md) -- local development guide
- [E2B SDK connectionConfig.ts](https://github.com/e2b-dev/E2B/blob/main/packages/js-sdk/src/connectionConfig.ts) -- self-hosted config

### Secondary (Pricing and Docs)
- [E2B Pricing](https://e2b.dev/pricing)
- [E2B BYOC Documentation](https://e2b.dev/docs/byoc)
- [E2B Enterprise](https://e2b.dev/enterprise)

### Tertiary (Third-Party Analysis)
- [Self-hostable E2B alternatives -- Northflank](https://northflank.com/blog/self-hostable-alternatives-to-e2b-for-ai-agents)
- [Self-Hosting Guide -- DeepWiki](https://deepwiki.com/e2b-dev/infra/8-self-hosting-guide)
