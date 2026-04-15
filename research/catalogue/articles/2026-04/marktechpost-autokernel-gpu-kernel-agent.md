# RightNow AI Releases AutoKernel: An Open-Source Framework that Applies an Autonomous Agent Loop to GPU Kernel Optimization for Arbitrary PyTorch Models

> **Asif Razzaq -- MarkTechPost, 2026-04-06**

| Field | Value |
|-------|-------|
| Source | https://www.marktechpost.com/2026/04/06/rightnow-ai-releases-autokernel-an-open-source-framework-that-applies-an-autonomous-agent-loop-to-gpu-kernel-optimization-for-arbitrary-pytorch-models/ |
| Author | Asif Razzaq (Editor, MarkTechPost) |
| Publication | MarkTechPost |
| Date | 2026-04-06 |
| Topics | gpu-kernels, triton, cuda, autonomous-agents, karpathy-autoresearch, ralph-loop, kernel-optimization, pytorch, amdahl's-law, back-pressure, correctness-gates |
| Read Time | 9 min |

---

## Burak's Notes

> *Agents eating systems engineering. This is the clearest case yet that the Ralph Wiggum "edit-benchmark-keep/revert" loop generalizes beyond application code into hardcore systems optimization where human expertise is measured in years. The five-stage correctness harness is the real lesson -- it's the same pattern as our E2E gate, just applied to GPU kernels. Every "keep" is a git commit, every "revert" is `git reset`. 300-400 experiments overnight on one GPU. Same loop we run on one tmux session. Also note: Karpathy's autoresearch project is the direct parent -- worth ingesting separately.*

---

## Key Takeaways

1. **The expert workflow is just a loop, and it mechanizes cleanly** -- AutoKernel encodes what a senior GPU engineer already does: write candidate, benchmark, keep if faster, revert if worse, repeat. An LLM agent edits a single `kernel.py` file, a benchmark harness verifies correctness and measures throughput, and `git commit`/`git reset` become the atomic state transitions. This is the Ralph Wiggum pattern transplanted from app code to CUDA/Triton.

2. **Correctness harness is non-negotiable and runs BEFORE any speedup is recorded** -- Every candidate passes 5 validation stages: smoke test (sub-second compile check), shape sweep across 8-10 configs and 3 dtypes (FP16/BF16/FP32), adversarial numerical stability, determinism via 3x bitwise-identical runs, and non-power-of-two edge cases (1023, 4097, 1537). In the paper's H100 eval, all 34 configurations passed zero failures. This is how you prevent an agent from "optimizing" to wrong outputs -- the same principle as our E2E gate.

3. **Amdahl's law drives target selection, not kernel benchmarks in isolation** -- Unlike prior work (e.g. KernelBench) that grades kernels individually, AutoKernel uses `torch.profiler` to capture per-kernel GPU time across a whole PyTorch model, then ranks targets by their share of total runtime. A 1.5x speedup on a 60% kernel = 1.25x end-to-end; the same speedup on a 5% kernel = 1.03x. Effort allocation follows the math, not vibes.

4. **Real benchmark results beat torch.compile on 12/16 configs on H100** -- RMSNorm hits 5.29x over eager and 2.83x over torch.compile (2,788 GB/s = 83% of H100's 3,352 GB/s peak). Softmax: 2.82x / 3.44x, 2,800 GB/s. Cross-entropy: 2.21x / 2.94x. A community user reported a single 3-minute AutoKernel run produced a Triton FP4 matmul kernel beating hand-optimized CUTLASS by 1.63-2.15x on H100. Matmul vs cuBLAS is still the hard case (278 TFLOPS starter).

5. **Directly inherits from Karpathy's autoresearch** -- AutoKernel is explicitly positioned as a transplant of Andrej Karpathy's autoresearch loop (which discovered 20 LLM training optimizations across 700 experiments in 2 days on 1 GPU). Same keep/revert mechanic, different search space, different evaluation function (correctness-gated benchmark instead of validation loss).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Three direct mappings to our orchestrator: (1) Ralph Loop at the systems-engineering layer validates our entire thesis that the loop mindset generalizes; (2) the 5-stage correctness harness is a concrete template for our E2E gate -- we should steal the staged validation pattern (smoke -> shape sweep -> adversarial -> determinism -> edge cases); (3) git-as-state-machine (commit=keep, reset=revert) is the exact pattern we use in worktrees. Agents are now penetrating domains where expertise was previously uncopyable. Also: this is the first concrete win over torch.compile/cuBLAS by a generic agent loop. |
| **Actionable** | 8/10 | Steal: (a) 5-stage correctness harness as a template for any agent optimization loop -- adapt to our UI/E2E gate; (b) Amdahl's-law target ranking as a pattern for prioritizing orchestrator work (profile first, optimize by impact share); (c) orchestrator transition conditions (5 reverts / 90% of peak / 2hr budget / 2x achieved) as a template for when to move a worker off a task; (d) 909-line `program.md` as an example of how to pack expert knowledge into one instruction doc so an agent can run 10+ hours without getting stuck. |

---

## Summary

RightNow AI has released AutoKernel, an open-source framework that drops an autonomous LLM agent into the kernel-optimization loop for arbitrary PyTorch models. The value proposition is blunt: hand it any model before bed, wake up to faster Triton kernels, no GPU expertise required. It targets a domain -- GPU kernel writing -- where human expertise takes years to develop and where even frontier LLMs fail at one-shot generation (KernelBench shows <20% match vs PyTorch baseline).

The core mechanism is a deliberate imitation of how expert kernel engineers actually work: write candidate, benchmark, keep improvements, discard regressions, repeat. AutoKernel mechanizes this as a single-file edit loop on `kernel.py`, gated by a fixed benchmark harness, with every experiment mapped to a git commit. Kept experiments advance the branch; reverted ones erase cleanly with `git reset`. Results log to a dependency-free `results.tsv`. Each iteration takes ~90 seconds (30s correctness check, 30s benchmark via Triton's `do_bench`, 30s agent reasoning), yielding 40 experiments/hour and 300-400 experiments in an overnight 10-hour run. The agent reads a 909-line `program.md` encoding a six-tier optimization playbook (block sizes -> memory access -> compute ops -> advanced techniques -> architecture-specific -> kernel-specific algorithms) so it can run for hours without getting stuck.

The framework is unusually rigorous on correctness. Every candidate passes a five-stage harness before any speedup counts: (1) smoke test on small inputs, (2) shape sweep across 8-10 configs and three dtypes (FP16/BF16/FP32), (3) adversarial numerical stability (large identical softmax rows, extreme matmul dynamic range, near-zero normalization variance), (4) determinism via three bitwise-identical runs (catches race conditions in reductions), and (5) non-power-of-two edge cases (1023, 4097, 1537 to expose masking and tile-remainder bugs). Dtype-specific tolerances: FP16 atol=10^-2, BF16=2*10^-2, FP32=10^-4. In the paper's full evaluation, 34 of 34 H100 configurations passed with zero failures.

Target selection is driven by Amdahl's law rather than per-kernel benchmarks in isolation. AutoKernel profiles a complete PyTorch model with `torch.profiler` (shape recording) and ranks optimization targets by runtime share. The orchestrator (`orchestrate.py`) transitions between kernels when any of four conditions hit: 5 consecutive reverts, 90% of GPU peak utilization reached, a 2-hour elapsed time budget, or a 2x speedup already achieved. The profiler recognizes both NVIDIA (H100, A100, L40S, L4, A10, RTX 4090/4080/3090/3080) and AMD (MI300X/325X/350X/355X) accelerators, and estimates peak FP16 throughput from SM count, clock rate, and compute capability for unknown GPUs.

Dual backend support covers nine kernel types (matmul, flash_attention, fused_mlp, softmax, layernorm, rmsnorm, cross_entropy, rotary_embedding, reduce). Triton is the primary backend (JIT compiles in 1-5s, reaches 80-95% of cuBLAS matmul throughput, ideal for rapid agent iteration). CUDA C++ is available for cases needing direct warp-level primitives, WMMA tensor cores, float4/half2 vectorized loads, bank-conflict-free shared memory, and double buffering. Both backends expose the same `kernel_fn()` interface. Benchmark results on an NVIDIA H100 80GB HBM3 are significant for memory-bound kernels: RMSNorm 5.29x over eager / 2.83x over torch.compile (2,788 GB/s), Softmax 2.82x / 3.44x, Cross-entropy 2.21x / 2.94x. AutoKernel beats torch.compile's max-autotune on 12 of 16 configurations. Matmul vs cuBLAS is still the hardest target (278 TFLOPS Triton starter well below cuBLAS), but AutoKernel still beats torch.compile on 2048^3 matmul by 1.55x. Notable community deployment: a single 3-minute AutoKernel interaction produced a Triton FP4 matmul that outperforms hand-tuned CUTLASS C++ by 1.63-2.15x across shapes on H100, and an AutoKernel-optimized kernel took first place on the vectorsum_v2 B200 leaderboard at 44.086µs.

---

## Notable Quotes

> "Give it any model before you go to bed, and wake up to faster Triton kernels -- no GPU expertise required."

> "AutoKernel's core insight is that an expert kernel engineer's workflow is itself a simple loop: write a candidate, benchmark it, keep improvements, discard regressions, repeat."

> "Performance without correctness is useless, and AutoKernel is particularly thorough on this front. Every candidate kernel passes through five validation stages before any speedup is recorded."

> "Rather than optimizing kernels in isolation, AutoKernel profiles the entire PyTorch model and allocates effort proportionally to each kernel's share of total GPU runtime -- ensuring that improvements compound at the model level, not just the kernel level."

> "This design draws directly from Andrej Karpathy's autoresearch project, which demonstrated that an AI agent running a keep/revert loop on LLM training code could discover 20 optimizations across 700 experiments in two days on a single GPU."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://arxiv.org/pdf/2603.21331 | The AutoKernel paper itself — likely contains full 34-config H100 benchmark table, the 909-line `program.md` playbook, ablations, and the orchestrator state machine. Highly relevant for our harness design patterns. | `/ingest-paper` |
| Karpathy autoresearch project (referenced but not URL'd in article) | Direct intellectual parent of AutoKernel; same keep/revert loop applied to LLM training code optimization. Would close the loop on Karpathy's broader "agent as researcher" body of work alongside his LLM Wiki and AgentHub posts already in our catalogue. | `/ingest-repo` or `/ingest-article` |
| KernelBench (benchmark referenced for <20% one-shot frontier LLM match rate) | The baseline AutoKernel was designed to beat. Useful as a reference point for agent capability on systems-engineering tasks. | `/ingest-paper` |
| RightNow AI main site / IDE | RightNow AI has a commercial IDE product; AutoKernel appears to be their research release. Worth a tool-catalogue pass to understand the commercial angle. | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| AutoKernel | The framework itself — autonomous agent loop on GPU kernel optimization | No — consider `/tool-catalogue` |
| RightNow AI | Research team releasing AutoKernel; has a commercial IDE product | No — consider `/tool-catalogue` |
| Triton (OpenAI) | Primary backend; Python-like DSL, JIT compiles in 1-5s; agent modifies block sizes, warp counts, pipeline stages, accumulator precision | No |
| CUDA C++ | Secondary backend for warp-level primitives, WMMA tensor cores, vectorized loads | No |
| PyTorch / `torch.profiler` / `torch.compile` | Target framework; profiler provides Amdahl's-law input; torch.compile max-autotune is the baseline AutoKernel beats on 12/16 configs | No |
| cuBLAS | NVIDIA's hand-tuned linear algebra library; primary matmul baseline (the hardest target) | No |
| CUTLASS | NVIDIA's hand-optimized C++ template library for tensor cores; beaten 1.63-2.15x by AutoKernel's Triton FP4 matmul in community deployment | No |
| TorchInductor | PyTorch's compiler backend; runs its own Triton autotuning; generic fusion doesn't always find specialized strategies | No |
| KernelBench | 250-problem GPU kernel benchmark; shows frontier LLMs match PyTorch baseline in <20% of cases one-shot | No |
| Karpathy autoresearch | Direct intellectual parent; keep/revert loop on LLM training code; 20 optimizations, 700 experiments, 2 days, 1 GPU | Partially — Karpathy's LLM Wiki and AgentHub are catalogued; autoresearch is not |
| Triton `do_bench` | Benchmark utility used for 30s performance measurement per iteration | No |
| git (commit / reset) | State machine backbone: kept experiments = commits, reverts = `git reset`; standard git tools browse history | N/A (tool) |
| `results.tsv` | Plain tab-separated file for experiment logging — dependency-free, human-readable, agent-parseable | N/A (pattern) |

---

## Action Items

- [ ] Pull the AutoKernel arxiv paper (2603.21331) and extract the 909-line `program.md` structure as a reference for how to encode multi-tier expert knowledge into one instruction doc.
- [ ] Adapt the 5-stage correctness harness pattern (smoke -> shape sweep -> adversarial -> determinism -> edge cases) into our E2E gate checklist for UI work. Currently we have Chrome DevTools MCP as a single gate -- this article shows a better staged pattern.
- [ ] Steal the orchestrator transition conditions (5 consecutive reverts / 90% of peak / 2hr budget / 2x achieved) as a template for when our orchestrator should move a worker off a task. We currently use fixed retry counts; Amdahl's-law-style runtime-share targeting is more principled.
- [ ] Add AutoKernel to ADOPTABLE-PATTERNS.md under a new "Agents in Systems Engineering" section alongside the Ralph Loop entries.
- [ ] Consider whether this pattern (agent-driven optimization loop with git-as-state-machine + correctness gates) applies to our OmniPort-HH Next.js bundle-size/perf optimization.
- [ ] Ingest the Karpathy autoresearch project as a separate catalogue entry (Deep Dive Candidate) -- closing the loop on the autoresearch lineage.
