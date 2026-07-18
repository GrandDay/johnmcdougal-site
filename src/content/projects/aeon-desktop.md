---
title: "Aeon Desktop and the Immutable Workstation"
description: "Daily-use Linux workstation practice around Aeon Desktop, Distrobox, Podman, dotfiles, and repeatable tooling across mixed Linux and Windows contexts."
pubDate: 2026-04-15
updatedDate: 2026-07-16
status: active
tags: ["linux", "aeon", "distrobox", "immutable", "dotfiles", "homelab", "workstation", "docker"]
---

## What this is

Aeon Desktop is my distro of choice on a workstation laptop. It is a Linux
desktop operating-system project built around an immutable system design: the
base operating system stays clean, updates are transactional, and the tools I
add live in containers or explicit layers on top of it.

Aeon Desktop is built on openSUSE MicroOS technology, but the useful public
point here is simpler: it gives me a stable daily workstation where I can learn
modern Linux desktop, container, and user-environment practices without turning
the laptop into a fragile science project.

## Why it exists

I fell for the immutable vision. The idea that the base system stays clean,
stable, and reproducible -- and that all the messy, experimental, personal
stuff happens in isolated containers that you can throw away -- was exactly
the mental model I had been looking for without knowing it.

Distrobox opened that door further. Suddenly I had a reason to experiment
with different shell configurations, terminal tooling, and workflows inside
throwaway containers until they were good enough to become daily drivers.
That process became my dotfiles.

## Current state

Aeon Desktop runs on my laptop as a lightly customized daily-use workstation.
The practical work is shell setup, terminal tooling, dotfiles, Distrobox
environments, Podman demonstrations, and file-level work that moves cleanly
between the laptop and the rest of my environment.

The workstation has also been a useful proving ground for tool placement.
Distrobox lets me try shell configurations and development tools inside
disposable Linux userspaces before promoting the useful parts into my normal
environment. MakeMKV runs there for Blu-ray backups, which opened the door to
the automatic media-ripper idea. Podman gives me a native way to demonstrate
and learn container workflows on Aeon Desktop, while Docker remains in use
across my other current stacks.

The other primary computing contexts are Ubuntu Server-based work VMs and a
Windows/WSL desktop workstation. Aeon Desktop is the laptop operating system;
the VMs and Windows/WSL workstation are where other build, lab, and development
work still belongs.

The update and rollback model matters because I want a workstation that can
absorb system updates through a transactional base, keep daily tools in
replaceable layers, and make recovery less dramatic when an experiment is
wrong.

## Validation

I validate Aeon Desktop by using it as the laptop I actually reach for:
updates, interactive login, shell startup, terminal tools, Distrobox
containers, Podman demonstrations, and normal file-level work.

The strongest lesson so far is that immutable desktops shift workstation
administration into cleaner places: container boundaries, dotfiles, backup
discipline, and the source-of-truth choices I track in
[Userspace](/projects/userspace/).

## What I am figuring out

- Full workstation conversion: the laptop is the test bed; the desktop remains
  a separate decision.
- Longer-term Podman adoption: Podman is useful on Aeon Desktop now for
  learning and demonstrations; replacing Docker in additional stacks is planned
  future direction.
- The automatic media-ripper path that grew out of MakeMKV still needs a
  clearer implementation boundary.
- Current focus is lighter Aeon Desktop use while CySA+, Net+, and MS Learn work run in
  parallel.

## Related projects

- [Userspace](/projects/userspace/) is the source, prompt, and human-workflow layer that runs across Aeon Desktop, Windows/WSL, VMs, and repository work.
