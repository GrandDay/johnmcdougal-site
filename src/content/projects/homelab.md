---
title: "The Homelab"
description: "An operational lab for virtualization, storage, networking, backups, self-hosting, and local AI infrastructure, with private homelab-iac workflows for repeatable change, validation, and recovery."
pubDate: 2026-04-15
status: active
tags: ["homelab", "proxmox", "self-hosted", "infrastructure", "zfs", "backup", "automation", "ai"]
---

## What this is

The Homelab is my operational infrastructure lab: the place where I run and
rebuild virtualization, storage, networking, backup, self-hosted service, and
local AI infrastructure work. It is the environment I operate, break, recover,
document, and use to test infrastructure decisions before they become public
claims.

The current lab includes Proxmox VE virtualization, Linux VMs and containers,
TrueNAS-backed storage, dedicated Docker hosts, segmented networking at an
abstract level, Proxmox Backup Server, and service operation across a mix of
stable systems and active rebuild work.

## Why it exists

As a kid it was game servers and Plex. As an adult it became personal services,
agency, and learning. As a professional it is proof of concept, dev workflow
testing, and something to point at when words need evidence.

The hardware changes constantly -- Theseus's ship, one component at a time --
but the purpose stays the same: build it yourself, for yourself, and learn
something every time it breaks.

## Implementation layer

`homelab-iac` serves as the private implementation and recovery layer inside
the Homelab. I use it to turn specifications and operational decisions into
reviewed infrastructure artifacts while keeping the private repository,
inventories, access methods, and topology out of the public site.

The useful public story is the workflow rather than the inventory. The repository
holds OpenTofu declarations and virtualization modules, Ansible roles and
playbooks, a Packer image/template lane, sanitized service reconstruction
bundles, validators and tests, ADRs, runbooks, status records, command-packet
workflows, and closeout evidence. Those artifacts support repeatable change,
but live infrastructure mutation remains human-governed.

## Current evidence

The lab currently supports operating, troubleshooting, documenting, and
iterating on self-hosted infrastructure. The verified evidence I can summarize
publicly includes source-control recovery, protected Git behavior, application
restore work, mirror validation, and reviewed VM retirement through OpenTofu.

I treat tracked declarations as source evidence first, then validate and
promote the parts that are ready for live change. The durable pattern is moving
from specification to reviewed source, then from reviewed source to validation,
recovery notes, and human-approved infrastructure changes.

## Boundaries

I keep the topology abstract on purpose. Hostnames, addresses, VLAN identifiers,
ports, storage exports, backup identifiers, device maps, private repository
remotes, command text, and live-state details stay private.

The lab includes validated experiments and rebuild work alongside currently
operated services. Remote state, unattended deployment, complete CI/CD, active
proposal automation, self-healing reconciliation, expanded offsite recovery,
and broader automation maturity remain incomplete or planned unless I describe
them separately as validated.

## Next work

The next layer is tightening the rebuild path: carrying approved specifications
into `homelab-iac`, validating recovery and service reconstruction flows,
improving backup and restore discipline, and continuing to separate live
authority from proposal and validation workflows.

Phred remains independently evidenced AI infrastructure work. The Homelab is
the broader operating environment around it, and future Phred rebuild work will
need its own validation before I present it as managed infrastructure.

## Related projects

- [CUE-Verse](/projects/cue-verse/) is the documentation and source-of-truth framework that helps keep lab decisions connected.
- [Phred](/projects/phred/) is the dedicated local AI infrastructure project that runs alongside the broader lab.
