---
title: "CUE-Verse"
description: "A framework for giving your homelab depth and linked memory. Because a lab without context is just a pile of running VMs."
pubDate: 2026-04-15
status: wip
tags: ["knowledge-management", "notion", "obsidian", "homelab", "self-hosted", "storage", "dokploy"]
---

## What this is

CUE-Verse is the context layer of the homelab. It is the framework that
gives the lab depth and linked memory -- the difference between a pile of
running VMs and a system that means something.

The name comes from "cue" as in something that serves a comparable purpose,
and "verse" as in the whole interconnected stack of modern IT: projects,
services, layers, and the knowledge that holds them together.

## Why it exists

I was trying to build the mental palace -- the greek philosophy version,
placing terms, concepts, and layers and networking them effectively. It was
not working. The moment that broke it open was accidentally trying to chase
too many new idea directions at once while also running lab projects and
grinding through the Security+ exam. Head full, threads everywhere, no
connective tissue.

CUE-Verse is the vehicle I built toward that end. Something to put the
learned things into, to bounce ideas across, to hold the seams between
self-taught instinct and the formal knowledge I am actively backfilling
through college.

## Current state

CUE-Verse spans several layers, which is part of why it is hard to describe:

**Knowledge layer**
- Notion and Obsidian: both in active use, responsibilities between
  them currently being redefined as the system matures

**Storage layer**
- Synology NAS: NFS and SMB to lab and workstation hosts, cache config
- TrueNAS Scale NAS: flash storage via WebDAV, NFS, SMB, and iSCSI
  for lab and workstation workflows

**Compute and deployment layer**
- Dokploy on a Proxmox VM, a TrueNAS Scale VM, and a physical Ubuntu host
- Synology Active Backup for home user backups, low friction by design
- PBS handling lab and CUE-Verse backup needs

**Userspace project**
- The tools, stacks, and operating environments across hosts
- Self-hosted storage access and ZTNA integration
- The layer where daily work actually happens

## What I am figuring out

- How to accurately describe a system this broad without losing
  the thread for someone reading it for the first time
- How the userspace project integrates cleanly across CUE-Verse layers
  as both grow
- Building the Notion workflows out properly (certs on the list)
- How knowledge captured in Notion and Obsidian feeds back into the
  lab and the userspace, and vice versa -- closing the loop
