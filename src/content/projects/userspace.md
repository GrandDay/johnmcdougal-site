---
title: Userspace
description: "A repository-governed project and knowledge environment for portable workflows, explicit source-of-truth boundaries, controlled synchronization, and human-reviewed automation."
pubDate: 2026-04-15
tags: ["userspace", "pkm", "tools", "obsidian", "notion", "self-hosted", "linux", "windows", "dotfiles", "git", "forgejo", "workflow"]
status: wip
---

*The human side of the stack.*

## Opening

Userspace is my working environment for project knowledge and execution: notes, repositories, commands, prompts, decisions, runbooks, review packets, and the interfaces I use to move between them.

The goal is not to make one application rule everything. The goal is to know which system is authoritative for which kind of artifact, keep important work portable, and make automation pass through reviewable boundaries instead of becoming hidden glue.

## Durable authority

For accepted project artifacts, Git-backed repositories on self-hosted Forgejo are the durable source. That is where reviewed documentation, prompts, schemas, scripts, runbooks, infrastructure records, and closeout evidence can have history, diffs, review gates, and exact commit references.

`homelab-iac` is the strongest implemented source for that operating pattern. It already uses repository-local validation, Git hygiene, added-file checks, line-ending normalization, human-governed command packets, preview-before-mutation behavior, discovery and authority records, review and closeout gates, exact-commit evidence, Forgejo workflow helpers, and recovery/operator documentation. Userspace is where I extract the reusable parts of that discipline without copying the whole infrastructure repository into every project.

## Access planes

Obsidian and Notion serve different roles. I use Obsidian as a local-first Markdown and filesystem environment: fast capture, linked notes, project folders, working documentation, CLI/script integration, and offline access. It is useful because the files remain portable and the interface is replaceable.

I use Notion for structured databases, views, properties, planning and review packets, decisions, relational navigation, publication-oriented content, and bounded API context retrieval. It is strong where records need properties, status, relations, and review state.

Neither frontend is universally authoritative. Obsidian can be the best place to draft and connect local Markdown. Notion can be the best place to coordinate structured review. When material becomes accepted project work, the relevant Git-backed repository and reviewed history become authoritative where appropriate.

## Controlled movement

Synchronization has to be explicit, directional, and authority-aware. Selected Markdown, project documentation, prompts, schemas, runbooks, and accepted context can move into Git-backed repositories. Selected structured records, decisions, work queues, review states, and publication content can be retrieved through Notion helpers or APIs.

Raw capture, private local context, secrets, inventories, temporary AI context, caches, and unreviewed exports stay separate. A useful note does not automatically become project truth. A Notion view does not automatically become repository state. A repository file does not automatically become public copy. The boundary matters because it keeps automation explainable and keeps review tied to the system that owns the artifact.

## Project flywheel

The portable part of Userspace is the project flywheel I am extracting from `homelab-iac`: reusable validation, review, authority, handoff, and recovery patterns that can move into other repositories without dragging along infrastructure-specific assumptions.

The shape I want is a versioned reusable core, project-owned profiles and policy, optional adapters, thin scaffolding, and reviewed migration/update paths. `homelab-iac` is the extraction source, not a universal template to copy wholesale. It contains private identities, project-specific infrastructure vocabulary, and domain-specific validation that should stay with that project.

That distinction keeps the flywheel honest. The repository-centered pattern is real and tested. The neutral portable system is still being extracted, shaped, and bounded.

## Why it matters

Userspace matters because the hard part of technical work is often not a single command or tool. It is keeping context recoverable, decisions auditable, workflows repeatable, and frontends replaceable while still moving quickly.

I want a working environment where Git can hold durable project truth, Notion can coordinate structured review, Obsidian can stay fast and local, and bounded helpers can move context between systems without erasing authority. That gives me portability without pretending every system should mirror every other system, and automation without removing the human review that keeps the work supportable.

## Related projects

- [Aeon and the Immutable Desktop](/projects/aeon-desktop/) is the workstation side of this operating model.
- [CUE-Verse](/projects/cue-verse/) is the broader context and documentation system behind the source-of-truth work.
