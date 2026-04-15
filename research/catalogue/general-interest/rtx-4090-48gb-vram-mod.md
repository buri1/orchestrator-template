# RTX 4090 VRAM Mod — Doubling to 48GB

> **Source**: https://www.youtube.com/watch?v=3YiJovZRUv0
> **Bookmarked**: 2026-04 (from Chrome LLM-INGEST)
> **Category**: hardware

## What Is This

A Russian-language YouTube video by VIK-on demonstrating how to physically modify an NVIDIA RTX 4090 to double its VRAM from 24GB to 48GB. The process involves desoldering the GPU and 12 GDDR6X memory chips from the stock PCB, placing them onto a custom clamshell PCB that accepts memory on both sides, flashing leaked NVIDIA firmware to support the larger memory configuration, and resoldering everything. Total cost was approximately $2,570 (219,000 rubles). Chinese modders have been performing similar mods at scale, renting out modified 48GB 4090D cards through cloud computing providers for AI workloads -- partly as a workaround for sanctions restricting access to high-end NVIDIA GPUs.

## Why It Was Skipped

Not directly related to AI agent orchestration research. Filed under general interest.

## Potential Connections

- 48GB VRAM enables running larger local LLMs (70B+ parameter models) that won't fit on stock 24GB 4090s, directly relevant to local AI inference for agent systems
- The mod effectively creates a consumer-priced alternative to the $10K+ RTX A6000/L40S for AI development
- Cloud rental of modded cards (as done in China) is an interesting infrastructure pattern for cost-efficient AI compute
