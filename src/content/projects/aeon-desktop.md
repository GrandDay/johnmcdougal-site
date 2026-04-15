---
title: "Aeon and the Immutable Desktop"
description: "An openSUSE MicroOS rabbit hole. Immutable Linux, Distrobox, and a new way of thinking about what a workstation can be."
pubDate: 2026-04-15
status: active
tags: ["linux", "aeon", "distrobox", "immutable", "dotfiles", "homelab", "workstation", "docker"]
---

## What this is

Aeon Desktop is an openSUSE MicroOS-based Linux distribution built around
an immutable system design -- the core OS is read-only, and everything you
add lives in containers or transactional layers on top of it.

It led me to Distrobox, which led to containerized development environments,
which led to a completely different way of thinking about what a workstation
can and should be.

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

- Aeon running on my laptop, lightly customized and in daily use
- PBS integration via a Proxmox Backup Client running inside a Distrobox --
  the laptop backs up into the same PBS infrastructure as the rest of the lab
- Terminal tooling and dotfiles were born out of Distrobox experiments:
  try it in a container, keep what works, discard what does not
- MakeMKV running for Blu-ray backups, which opened the door to the
  automatic media ripper project
- Moving more workloads into Docker as the setup matures
- Current focus is lighter use on Aeon while CySA+, Net+, and
  MS Learn projects run in parallel

## What I am figuring out

- Full workstation conversion: the laptop is the test bed, the desktop
  is still the question
- The userspace project runs alongside Aeon and is platform agnostic --
  Linux and Windows. It is the human-centric side of the stack: the data
  and tooling layer built to be simple, flexible, and purpose-driven,
  the same philosophy as layering service and application VMs cleanly
  under a Proxmox cluster. If CUE-Verse is the tech side of the
  tech-human relationship, the userspace project is the human side.
- The automatic media ripper project growing out of MakeMKV
- Where Docker workloads live long term: on Aeon itself, or handed off
  to the cluster