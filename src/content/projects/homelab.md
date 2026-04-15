---
title: "The Homelab"
description: "Playground, arena, forge, and base of operations -- all in one. A Proxmox cluster, four NAS devices, and a constantly evolving stack built for learning, self-hosting, and proof of concept."
pubDate: 2026-04-15
status: active
tags: ["homelab", "proxmox", "self-hosted", "infrastructure", "zfs", "backup"]
---

## What this is

A homelab is any infrastructure you manage yourself, and mine is all of it at once:
playground, arena, forge, base of operations, and a rock. A place to explore,
create, experiment, learn, change, and provide.

Currently: a Proxmox cluster, four NAS devices (one recently converted to a
Proxmox node running Proxmox Backup Server), and more to come.

## Why it exists

As a kid it was game servers and Plex. As an adult it became personal services,
agency, and learning. As a professional it is proof of concept, dev workflow
testing, and something to point at when words are not enough.

The hardware changes constantly -- Theseus's ship, one component at a time -- but
the purpose stays the same: build it yourself, for yourself, and learn something
every time it breaks.

## Current state

- Proxmox cluster running virtualized guests, with SDN mapping VLANs to VxLANs
  for guest networking
- Four NAS devices; one repurposed as a Proxmox node running PBS
- Internal backups via Proxmox Backup Server; experimenting with PBS client on
  all non-cluster hosts
- Physical network segmentation and firewall currently handled by Unifi

## What I am figuring out

- Offsite backup: cloud-connected PBS, or a remote PBS instance over VPN?
  Either way, the hot/warm/cold site question is now open.
- Building an internal walled garden within the cluster: virtual gateway devices
  at the border, isolated internal networks with high bandwidth, designed to
  scale cleanly across current and future physical and virtual infrastructure
- Hardware consolidation: upgrading Phred (local AI server) and rethinking
  placement as the stack matures
- Shifting firewall, routing, and logging responsibility into the virtualized
  layer over time
