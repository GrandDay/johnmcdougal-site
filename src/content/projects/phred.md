---
title: "Phred — Self-Hosted AI Infrastructure"
description: "An active operational-lab project for reusable local model serving, GPU inference, and a managed rebuild from a manual proof of concept into reproducible infrastructure."
pubDate: 2026-07-15
status: active
tags: ["ai", "self-hosted", "infrastructure", "linux", "docker", "gpu", "llm"]
---

## Opening

Phred is my dedicated local AI infrastructure project: a purpose-built GPU inference system for reusable private model serving, long-context work, and infrastructure practice around accelerated workloads.

The first working version was a manually configured bare-metal Ubuntu Server environment. It proved the core idea before I started rebuilding it into a cleaner managed platform: keep the stable model runtime separate from the machines where I edit repositories, run tests, build containers, and operate tools.

That predecessor worked. It is not the permanent architecture. I am consolidating work that was previously spread across the original Phred proof of concept, a separate bare-metal runtime called Frosty, and Windows/WSL containerized runtimes into a converged Phred platform. The next implementation step is carrying the approved design into `homelab-iac`; the complete infrastructure-as-code-managed replacement is not deployed yet.

## Hardware

The public shape of the system is an AMD Threadripper 1950X CPU, 128 GB ECC RAM, 2 x NVIDIA RTX 3090 GPUs, and 1 x NVIDIA RTX 3060 Ti.

Storage is intentionally split by role. Phred uses local NVMe for active model weights, runtime caches, and benchmark data, while colder archival storage holds larger model, dataset, corpus, and retained-artifact collections outside the hot inference path. The useful design point is separation: fast local storage for active inference work, colder storage for material that does not need to sit directly under the runtime.

## What I proved

The original proof of concept ran CUDA-enabled `llama.cpp` and `llama-server` on bare-metal Ubuntu Server. It served a quantized Gemma-family model in roughly the 26B and 31B classes (expirementing between dense and MOE models) and exposed it through LiteLLM as an OpenAI-compatible access surface. Other machines and clients could use the model through that API layer instead of each client owning a separate model runtime.

That setup proved three things I cared about: local GPU inference worked, API access could be normalized, and multiple clients could share a stable backend. It also gave me a practical place to learn failure modes: driver behavior, CUDA visibility, service startup, model loading, client compatibility, and the operational notes needed to rebuild the stack later.

Frosty operated alongside the original Phred proof of concept as a separate bare-metal inference/runtime system. I used it as additional experimental capacity, not as part of an automated production pool. Workload placement was primarily manual and client-selected, with LiteLLM helping normalize access to configured backends rather than acting as a full scheduler.

## How I use it

The first use model is private, reusable local model serving. Phred gives applications and machines an OpenAI-compatible inference service without making each one manage its own model runtime. The runtime, gateway, and clients stay separable. That matters because the stable model host should not also be the repository host, frontend host, automation host, or arbitrary-tool execution environment.

The second use model is distributed agentic coding and long-context knowledge work. The distribution happens at the workflow level. I am not splitting one model's tensors or layers between Phred and a workstation over the LAN.

Phred supplies stable inference, planning, synthesis, review, critique, and long-context reasoning. The Windows/WSL workstation owns repositories, Git worktrees, shells, tests, builds, Docker stacks, local files, coding-agent execution, interactive development, and operator work. When tools need to run, they run on the workstation or in a controlled sandbox, not inside the inference VM. That boundary lets Phred stay boring and inference-focused while the workstation absorbs the churn of source trees, builds, tests, and interactive state.

## Workload placement

Current and historical placement is manual, client-selected, and partially normalized through LiteLLM. I choose where work runs based on model size and quality, context length, available GPU and system memory, whether the task needs repositories or tools, workstation availability, competing workstation GPU use, and whether I need stable backend behavior or fast experimental iteration.

The usual split is straightforward: sustained or stable inference belongs on Phred; implementation, tests, builds, Docker work, and local execution belong on Windows/WSL; burst or experimental inference can happen on the workstation; Frosty was historical extra bare-metal capacity. LiteLLM is useful because it separates clients from runtime-specific details, but I do not describe it as automatic cross-host scheduling, workload migration, high availability, or silent model substitution.

## What I am rebuilding

The target design moves Phred toward Proxmox GPU passthrough, explicit GPU ownership, and reproducible provisioning. The planned profiles assign the two RTX 3090 GPUs to the primary large-model profile and reserve the RTX 3060 Ti for a smaller, faster, multimodal, or experimental profile. The target also includes an off-Phred LiteLLM gateway, documented workload profiles, 30B/32B-class coding and general-purpose model candidates, long-context experiments, and a runtime bakeoff across vLLM, SGLang, and continued `llama.cpp`/GGUF or hybrid work.

The planned managed rebuild is designed to use the same infrastructure discipline as the rest of the lab: Packer for base-image construction, OpenTofu for VM and infrastructure provisioning, cloud-init for first boot, Ansible for driver/runtime/service configuration, Docker or Compose for repeatable service packaging, and Git-backed review around the operational artifacts. Project-scoped RAG, embeddings, reranking, controlled tool execution, and better runtime/GPU/latency/routing observability belong around the inference system, not as claims that everything already runs today.

## Next work and limits

Next work is to carry the approved specification into `homelab-iac`, provision the replacement, validate GPU passthrough and runtime profiles, document workload placement, and prove that the rebuilt platform can be recovered without depending on the original manual installation notes.

Phred is independent operational lab work, not employer or customer production infrastructure. It is not an HPC cluster, and I am not claiming scheduler administration, high-speed-interconnect administration, cluster-level GPU scheduling, automated workload migration, high availability, or a completed GitOps/IaC deployment. The value is narrower and more useful: I operated the manual predecessor, learned what had to be separated, and am rebuilding it as supportable infrastructure instead of a one-off host.

## Related projects

- [The Homelab](/projects/homelab/) is the broader independent infrastructure environment around Phred.
- [CUE-Verse](/projects/cue-verse/) is the documentation and context system that keeps infrastructure decisions connected.
