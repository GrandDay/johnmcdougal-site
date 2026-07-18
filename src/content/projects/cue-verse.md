---
title: "CUE-Verse"
description: "An evolving source-of-truth and documentation framework for keeping lab decisions, deployment notes, and operational context connected across infrastructure, tooling, and knowledge work."
pubDate: 2026-04-15
updatedDate: 2026-07-16
status: wip
tags: ["knowledge-management", "notion", "obsidian", "homelab", "self-hosted", "storage", "dokploy", "documentation"]
---

## What this is

CUE-Verse is the framework I use to keep infrastructure decisions,
documentation, validation notes, and working context connected across the lab.
It started with the way CUE-Lang made me think about schemas, validation, and
configuration, but the current project is broader than a CUE-language codebase.

The implemented work is documentation, source-of-truth design, Git-backed
review practice, repository planning, runbooks, validation checklists,
inventory discipline, diagrams, and repeatable operating notes around the
systems I actually run and rebuild.

## Why it exists

I was trying to build the mental palace -- the Greek philosophy version:
placing terms, concepts, and layers so they could connect instead of piling up.
That broke open while I was running lab projects, studying, and chasing too
many technical threads at once. I needed a way to keep the reasoning attached
to the infrastructure.

CUE-Verse is that connective layer. It gives me a place to record what a system
is supposed to do, what actually exists, what was validated, what remains a
plan, and which repository or workflow owns the next change.

## Current state

CUE-Verse is applied most concretely through [The Homelab](/projects/homelab/).
The lab provides the operational evidence; CUE-Verse provides the structure
that keeps documentation, validation, and change authority understandable.

The current practice includes Notion and Obsidian for different access planes,
Git-backed repositories for accepted artifacts, source-of-truth boundaries,
runbooks, command/review workflows, validation records, and documentation that
can survive beyond a single tool interface. I use Ansible, Bash, PowerShell,
Docker Compose, Git, and configuration-as-code patterns where they have been
implemented or validated.

## Evidence boundary

CUE-Verse currently combines operational documentation practice with design
work. I label target architecture as target architecture: self-healing
operation, multi-site patterns, universal automation, production-grade high
availability, and a complete CUE-to-infrastructure compiler pipeline remain
future architecture unless I publish implementation evidence for them.

The distinction matters because the project is partly operational practice and
partly design work. The public page should show the working framework and keep
draft architecture labeled as draft architecture.

## Next work

The next work is to keep extracting reusable patterns from the lab while
preserving clear project boundaries: clearer authority records,
better validation checklists, cleaner repository handoffs, and documentation
that can explain the difference between current systems, validated
experiments, rebuild work, and target architecture.

## Related projects

- [The Homelab](/projects/homelab/) is the operational environment where these documentation and validation practices are applied.
- [Phred](/projects/phred/) is a focused AI-infrastructure project that benefits from the same evidence and rebuild discipline.
- [Userspace](/projects/userspace/) is the working environment for notes, repositories, prompts, and review boundaries.
